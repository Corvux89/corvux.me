import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chokidar from "chokidar";
import nunjucks from "nunjucks";
import { marked } from "marked";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const templatesDir = path.join(projectRoot, "templates");
const staticDir = path.join(projectRoot, "static");
const distDir = path.join(projectRoot, "dist");

const siteUrl = (process.env.SITE_URL || "https://www.corvux.me").replace(/\/+$/, "");

const nunjucksEnv = nunjucks.configure(templatesDir, {
  autoescape: true,
});

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

const WRITE_RETRY_DELAY_MS = 120;
const WRITE_MAX_RETRIES = 5;

async function withRetry(operation, label) {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      const code = error?.code;
      const canRetry = code === "EPERM" || code === "EBUSY" || code === "EACCES";
      if (!canRetry || attempt >= WRITE_MAX_RETRIES) {
        throw error;
      }

      attempt += 1;
      console.warn(`[build] retrying ${label} after ${code}`);
      await new Promise((resolve) => setTimeout(resolve, WRITE_RETRY_DELAY_MS * attempt));
    }
  }
}

async function writeFileAtomic(filePath, contents) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, contents, "utf8");

  await withRetry(async () => {
    try {
      await fs.rename(tempPath, filePath);
    } catch (error) {
      const code = error?.code;
      if (code === "EXDEV" || code === "EPERM" || code === "EEXIST" || code === "EBUSY" || code === "EACCES") {
        await fs.copyFile(tempPath, filePath);
        await fs.rm(tempPath, { force: true });
        return;
      }
      throw error;
    }
  }, `write ${path.basename(filePath)}`);
}

function normalizeImagePath(imagePath) {
  if (!imagePath) {
    return imagePath;
  }

  return imagePath.replace(/^\/+/, "");
}

async function renderToFile(outputPath, templateName, context) {
  const output = nunjucksEnv.render(templateName, context);
  await ensureDir(path.dirname(outputPath));
  await writeFileAtomic(outputPath, output);
}

async function buildSite({ clean = true, copyStatic = true } = {}) {
  if (clean) {
    await fs.rm(distDir, { recursive: true, force: true });
  }
  await ensureDir(distDir);

  const aboutmePath = path.join(templatesDir, "aboutme.md");
  const aboutmeMarkdown = await fs.readFile(aboutmePath, "utf8");
  const aboutmeHtml = marked.parse(aboutmeMarkdown);

  const howtoPath = path.join(templatesDir, "combat_planner", "markdown", "howto.md");
  const howtoMarkdown = await fs.readFile(howtoPath, "utf8");
  const howtoHtml = marked.parse(howtoMarkdown);

  const projectsPath = path.join(staticDir, "json", "projects.json");
  const projectsRaw = JSON.parse(await fs.readFile(projectsPath, "utf8"));
  const projects = projectsRaw.map((project) => ({
    ...project,
    image: normalizeImagePath(project.image),
  }));

  await renderToFile(path.join(distDir, "index.html"), "main.html", {
    aboutme: aboutmeHtml,
    projects,
  });

  await renderToFile(
    path.join(distDir, "Avrae_Combat_Planner", "index.html"),
    "combat_planner/combat_planner.html",
    { howto: howtoHtml }
  );

  await renderToFile(
    path.join(distDir, "Solace", "old-world-map", "index.html"),
    "solace/old_world_map.html",
    {}
  );

  await renderToFile(path.join(distDir, "404.html"), "404.html", {});
  await renderToFile(path.join(distDir, "error.html"), "error.html", {});

  const staticUrls = [
    { loc: `${siteUrl}/` },
    { loc: `${siteUrl}/Avrae_Combat_Planner/` },
    { loc: `${siteUrl}/Solace/old-world-map/` },
  ];

  await renderToFile(path.join(distDir, "sitemap.xml"), "sitemap.xml", {
    static_urls: staticUrls,
    dynamic_urls: [],
  });

  if (copyStatic) {
    await fs.cp(staticDir, path.join(distDir, "static"), {
      recursive: true,
    });
  }
}

const distStaticDir = path.join(distDir, "static");

function isInsideDir(parentDir, targetPath) {
  if (!targetPath) {
    return false;
  }
  const rel = path.relative(parentDir, targetPath);
  return !!rel && !rel.startsWith("..") && !path.isAbsolute(rel);
}

async function copyStaticFile(sourcePath, relativePath) {
  const destination = path.join(distStaticDir, relativePath);
  await ensureDir(path.dirname(destination));
  await withRetry(() => fs.copyFile(sourcePath, destination), `copy ${relativePath}`);
}

async function removeStaticPath(relativePath) {
  const destination = path.join(distStaticDir, relativePath);
  await withRetry(() => fs.rm(destination, { recursive: true, force: true }), `remove ${relativePath}`);
}

async function handleStaticChange(eventType, filePath, relativePath) {
  if (!relativePath) {
    return;
  }

  if (eventType === "unlink" || eventType === "unlinkDir") {
    await removeStaticPath(relativePath);
    return;
  }

  if (eventType === "addDir") {
    await ensureDir(path.join(distStaticDir, relativePath));
    return;
  }

  if (eventType === "add" || eventType === "change") {
    await copyStaticFile(filePath, relativePath);
    return;
  }

  await copyStaticFile(filePath, relativePath);
}

function startBuildWatch() {
  const watchedDirs = [templatesDir, staticDir];

  let isBuilding = false;
  let pendingBuild = false;
  let debounceTimer;

  async function runBuild(change) {
    if (isBuilding) {
      pendingBuild = true;
      return;
    }

    isBuilding = true;
    try {
      const label = change?.label || "change detected";
      const filePath = change?.filePath || "";
      const eventType = change?.eventType || "";
      const isInitial = change?.initial === true;
      console.log(`[build] ${label}`);

      if (isInitial) {
        await buildSite({ clean: false, copyStatic: true });
        console.log("[build] complete");
        return;
      }

      const isStaticChange = isInsideDir(staticDir, filePath);
      const staticRelative = isStaticChange ? path.relative(staticDir, filePath) : "";
      const isProjectData = staticRelative === path.join("json", "projects.json");

      if (isStaticChange) {
        await handleStaticChange(eventType, filePath, staticRelative);
        if (!isProjectData) {
          console.log("[build] complete");
          return;
        }
      }

      await buildSite({ clean: false, copyStatic: false });
      console.log("[build] complete");
    } catch (error) {
      console.error("[build] failed", error);
    } finally {
      isBuilding = false;
      if (pendingBuild) {
        pendingBuild = false;
        await runBuild("queued changes");
      }
    }
  }

  function queueBuild(change) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      runBuild(change);
    }, 150);
  }

  const watcher = chokidar.watch(watchedDirs, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100,
    },
    ignorePermissionErrors: true,
  });

  watcher.on("all", (eventType, filePath) => {
    queueBuild({
      eventType,
      filePath,
      label: `change detected: ${filePath ? path.relative(projectRoot, filePath) : "unknown file"}`,
    });
  });

  process.on("SIGINT", () => {
    watcher.close();
    process.exit(0);
  });

  return runBuild({ label: "initial build", initial: true });
}

async function main() {
  const watchMode = process.argv.includes("--watch");

  if (watchMode) {
    await startBuildWatch();
    return;
  }

  await buildSite();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
