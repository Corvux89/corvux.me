import { BattleMap, Monster, OverlayMap, planLimit, SavedPlan, Settings } from "./types.js";
export function inputText(id, name, label, value, type = "text", min = null, max = null) {
    var input = jQuery("<input>")
        .addClass("form-control")
        .attr({
        "type": type,
        "id": id,
        "name": name,
        "placeholder": label
    })
        .val(value);
    type == "number" && min ? input.attr("min", min) : "";
    type == "number" && max ? input.attr("max", max) : "";
    var inputLabel = jQuery("<label>")
        .attr("for", id)
        .text(label);
    var div = jQuery("<div>")
        .addClass("form-floating")
        .append(input, inputLabel);
    return div;
}
export function inputSelect(id, name, label, value, options) {
    var select = jQuery("<select>")
        .addClass("form-select")
        .attr({
        "aria-label": label,
        "id": id,
        "name": name
    });
    Object.entries(options).forEach(([key, text]) => {
        let option = jQuery("<option>")
            .val(key)
            .text(text)
            .prop('selected', value == key);
        select.append(option);
    });
    var selectLabel = jQuery("<label>")
        .attr("for", id)
        .text(label);
    var div = jQuery("<div>")
        .addClass("form-floating")
        .append(select, selectLabel);
    return div;
}
export function buildMonsterInventory() {
    var monsters = Monster.load();
    $("#monster-inventory").empty();
    monsters.forEach(monster => {
        $("#monster-inventory").append(monster.inventoryRow());
    });
}
export function buildMaddTable() {
    var monsters = Monster.load();
    $("#madd-table").empty();
    monsters.forEach(monster => {
        $("#madd-table").append(monster.maddRow());
    });
}
export function buildOverlayModal() {
    var overlay = BattleMap.load().overlay;
    var columns = [];
    if (overlay.type.toLowerCase() == "circle") {
        columns.push(inputText("map-overlay-radius", "radius", "Radius", overlay.radius, "number", 0, 200));
        columns.push(inputText("map-overlay-center", "center", "Center", overlay.center));
    }
    if (["cone", "square"].indexOf(overlay.type.toLowerCase()) >= 0) {
        columns.push(inputText("map-overlay-size", "size", "Size", overlay.size, "number", 0, 200));
    }
    if (["cone", "line"].indexOf(overlay.type.toLowerCase()) >= 0) {
        columns.push(inputText("map-overlay-start", "start", "Start", overlay.start));
        columns.push(inputText("map-overlay-end", "end", "End", overlay.end));
    }
    if (overlay.type.toLowerCase() == "line") {
        columns.push(inputText("map-overlay-length", "length", "Length", overlay.length));
        columns.push(inputText("map-overlay-width", "width", "Width", overlay.width));
    }
    if (overlay.type.toLowerCase() == "square") {
        columns.push(inputText("map-overlay-top-left", "topleft", "Top left", overlay.topleft));
    }
    if (columns.length > 1) {
        columns.push(inputText("map-overlay-color", "color", "Color", overlay.color));
    }
    $("#overlay-row").empty();
    columns.forEach(c => {
        let div = jQuery("<div>")
            .addClass("col-sm-3 mb-3")
            .append(c);
        $("#overlay-row").append(div);
    });
}
export function buildMapPreview() {
    var monsters = Monster.load();
    var battlemap = BattleMap.load();
    var monsterOnMap = false;
    monsters.forEach(monster => {
        if (monster.coords.length > 0 && monster.coords.some(coord => coord != null)) {
            monsterOnMap = true;
        }
    });
    if (battlemap.url != "" || battlemap.size != "" || monsterOnMap) {
        var imgURL = `https://otfbm.io/${battlemap.size || "10x10"}${battlemap.csettings ? `/@${battlemap.csettings}` : ""}`;
        // Monster Placement
        monsters.forEach(monster => {
            for (let i = 0; i < monster.quantity; i++) {
                if (monster.coords[i] == null) {
                    continue;
                }
                imgURL += `/${monster.coords[i]}${monster.size || "M"}${monster.color || "r"}-${monster.combatID(i + 1)}`;
                if (monster.token)
                    imgURL += `~${monster.token}`;
            }
        });
        // Overlay
        if (battlemap.overlay.type)
            imgURL += `/*${OverlayMap[battlemap.overlay.type]}${battlemap.overlay.requiredNodes[battlemap.overlay.type].join("")}`;
        imgURL += "/";
        if (battlemap.url)
            imgURL += `/?a=2&bg=${battlemap.url}`;
        var image = jQuery("<img>")
            .addClass("img-fluid")
            .attr({
            "src": imgURL
        });
        if ($("#map-preview").find("img").attr("src") != imgURL) {
            $("#map-preview").prop("hidden", false)
                .empty()
                .append(image);
        }
    }
    else {
        $("#map-preview").prop("hidden", true);
    }
}
export function buildSavedPlanList() {
    const builds = SavedPlan.load();
    $("#load-plan-list").empty();
    $.each(builds, (name, build) => {
        let url = "";
        try {
            url = `${window.location.href.replace("#/", "")}?data=${build.data}`;
        }
        catch (error) {
            console.error("Error parsing data: ", error);
        }
        let link = jQuery("<a>")
            .addClass("dropdown-item")
            .attr("href", url)
            .text(name);
        let item = jQuery("<li>")
            .append(link);
        $("#load-plan-list").append(item);
    });
    var hide = $("#load-plan-list").children().length == 0;
    $("#load-plan").prop("hidden", hide);
    $("#delete-plan").prop("hidden", hide);
}
export function isValidHttpURL(string) {
    try {
        var url = new URL(string);
    }
    catch {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}
export function getTokenShortcode(url) {
    return new Promise((resolve, reject) => {
        var base64 = btoa(url);
        var queryURL = `https://token.otfbm.io/meta/${base64}`;
        var request = new XMLHttpRequest();
        request.open('POST', `${document.URL}shortcode`, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                var response = JSON.parse(request.responseText);
                response.token ? resolve(response.token) : resolve(null);
            }
            resolve(null);
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify({ "url": queryURL }));
    });
}
export function buildMainCommandHeader() {
    const settings = Settings.load();
    var commands = [];
    if (settings.maptarget)
        commands.unshift(`${settings.prefix}i add 20 ${settings.attach} -p`);
    if (settings.multiline)
        commands.unshift(`${settings.prefix}multiline`);
    if (settings.monsters)
        commands = commands.concat(Monster.maddCommand(settings));
    if (settings.battlemap)
        commands = commands.concat(BattleMap.load().command(settings));
    if (settings.overlay)
        commands.push(BattleMap.load().overlay.command(settings));
    $("#command-string").prop("hidden", commands.length == 0);
    $("#avrae-command").html(commands.join("<br>"));
}
export function buildMaddHeader() {
    const settings = Settings.load();
    var str = Monster.mapCommand(settings);
    $("#madd-header").prop("hidden", !str);
    $("#madd-command").html(str);
}
export function buildMapHeader() {
    const settings = Settings.load();
    var str = BattleMap.load().command(settings, true);
    $("#maps-header").prop("hidden", !str);
    $("#map-command").html(str.join(""));
}
export function buildOverlayHeader() {
    const settings = Settings.load();
    var str = BattleMap.load().overlay.command(settings, true);
    $("#overlay-header").prop("hidden", !str);
    $("#overlay-command").html(str);
}
export function copyString(content, tooltipString, buttonID) {
    navigator.clipboard.writeText(content);
    $(`#${buttonID}`).tooltip({
        title: tooltipString,
        delay: {
            show: 500,
            hide: 1500
        }
    })
        .tooltip("show");
}
function encodeBuild(name = "") {
    const monsters = Monster.load();
    const battlemap = BattleMap.load();
    const data = {
        "monsters": monsters,
        "battlemap": battlemap
    };
    if (name)
        data["name"] = name;
    return encodeURIComponent(JSON.stringify(data));
}
export function exportBuild() {
    const data = encodeBuild();
    const url = `?data=${data}`;
    copyString(`${window.location.href}${url}`, "Build copied to clipboard", "export-planner");
}
export function savePlan() {
    var plans = SavedPlan.load();
    if (Object.keys(plans).length >= planLimit) {
        $("#save-plan").tooltip({
            title: `You can only save ${planLimit} builds at this time.`,
            delay: {
                show: 500,
                hide: 1500
            }
        })
            .tooltip("show");
        return;
    }
    if ($("#plan-name").val() != "") {
        var plan = new SavedPlan($("#plan-name").val().toString(), encodeBuild($("#plan-name").val().toString()));
        plan.save();
        buildSavedPlanList();
        $("#saveModal").modal("hide");
    }
}
