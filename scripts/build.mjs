import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

function normalizeImagePath(imagePath) {
  if (!imagePath) {
    return imagePath;
  }

  return imagePath.replace(/^\/+/, "");
}

async function renderToFile(outputPath, templateName, context) {
  const output = nunjucksEnv.render(templateName, context);
  await ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, output, "utf8");
}

async function buildSite() {
  await fs.rm(distDir, { recursive: true, force: true });
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

  await renderToFile(path.join(distDir, "404.html"), "404.html", {});
  await renderToFile(path.join(distDir, "error.html"), "error.html", {});

  const staticUrls = [
    { loc: `${siteUrl}/` },
    { loc: `${siteUrl}/Avrae_Combat_Planner/` },
  ];

  await renderToFile(path.join(distDir, "sitemap.xml"), "sitemap.xml", {
    static_urls: staticUrls,
    dynamic_urls: [],
  });

  await fs.cp(staticDir, path.join(distDir, "static"), {
    recursive: true,
  });
}

buildSite().catch((error) => {
  console.error(error);
  process.exit(1);
});
