import { BattleMap } from '../models/Battlemap.js';
import { Monster } from '../models/Monster.js';
import { Settings } from '../models/Settings.js';
import { SavedBuild } from '../models/Saves.js';
import { getMonsterMapCommand, getMapCommand, getOverlayCommand } from './commands.js';
export const monsterInventory = document.getElementById("monster-inventory");
export const maddTable = document.getElementById("madd-table");
export const extractIndex = (str) => { const match = str.match(/-(\d+)/); return match ? parseInt(match[1], 10) : null; };
export function buildInventoryContainer() {
    const monsters = Monster.load();
    monsterInventory.innerHTML = "";
    monsters.forEach(function (monster) {
        monsterInventory.appendChild(monster.appendInventoryRow());
    });
}
export function buildMaddContainer() {
    const monsters = Monster.load();
    maddTable.innerHTML = "";
    monsters.forEach(function (monster) {
        if (monster.name != "") {
            maddTable.appendChild(monster.appendMaddRow());
        }
    });
}
export function buildOverlayContainer() {
    const overlay = BattleMap.load().overlay;
    const overlayRow = document.getElementById("overlay-row");
    let columns = [];
    if (overlay.type == "circle") {
        columns.push(createInputElement("map-overlayRadius", "Radius", overlay.radius, "number", "200"));
        columns.push(createInputElement("map-overlayCenter", "Center", overlay.center, "text"));
    }
    if (overlay.type == "cone" || overlay.type == "square") {
        columns.push(createInputElement("map-overlaySize", "Size", overlay.size, "number", "200"));
    }
    if (overlay.type == "cone" || overlay.type == "line") {
        columns.push(createInputElement("map-overlayStart", "Start", overlay.start, "text"));
        columns.push(createInputElement("map-overlayEnd", "End", overlay.end, "text"));
    }
    if (overlay.type == "line") {
        columns.push(createInputElement("map-overlayLength", "Length", overlay.length, "text"));
        columns.push(createInputElement("map-overlayWidth", "Width", overlay.width, "text"));
    }
    if (overlay.type == "square") {
        columns.push(createInputElement("map-overlayTopLeft", "Top left", overlay.topleft, "text"));
    }
    if (overlay.type != "") {
        columns.push(createInputElement("map-overlayColor", "Color", overlay.color, "text"));
    }
    overlayRow.innerHTML = "";
    columns.forEach(element => {
        overlayRow.appendChild(element);
    });
}
export function buildMaddHeader() {
    const madd_header = document.getElementById("madd-header");
    var out = getMonsterMapCommand();
    if (out) {
        madd_header.hidden = false;
    }
    else {
        madd_header.hidden = true;
    }
    document.getElementById("madd-command").innerHTML = out;
}
export function buildMapSettingsheader() {
    const maps_header = document.getElementById("maps-header");
    var out = getMapCommand(true);
    if (out) {
        maps_header.hidden = false;
    }
    else {
        maps_header.hidden = true;
    }
    document.getElementById("map-command").innerHTML = out.join("");
}
export function buildOverlayHeader() {
    const overlay_header = document.getElementById("overlay-header");
    var out = getOverlayCommand(true);
    if (out.length > 0) {
        overlay_header.hidden = false;
    }
    else {
        overlay_header.hidden = true;
    }
    document.getElementById("overlay-command").innerHTML = out;
}
export function buildMapPreview() {
    const monsters = Monster.load();
    const battlemap = BattleMap.load();
    const overlay = battlemap.overlay;
    const mapPreview = document.getElementById('mapPreview');
    var monsterOnMap = false;
    monsters.forEach(function (monster) {
        if (monster.coords.length > 0 && monster.coords.some(coord => coord != null)) {
            monsterOnMap = true;
        }
    });
    if (battlemap.url != "" || battlemap.size != "" || monsterOnMap) {
        var imgUrl = 'https://otfbm.io/';
        var settingString = `/@`;
        settingString += battlemap.csettings ? `c${battlemap.csettings}` : "";
        imgUrl += battlemap.size ? battlemap.size : "10x10";
        imgUrl += settingString.length > 2 ? settingString : "";
        // Monster placement
        monsters.forEach(function (monster) {
            for (var i = 0; i < monster.quantity; i++) {
                if (monster.coords[i] != null) {
                    var monStr = "/" + monster.coords[i];
                    monStr += monster.size ? monster.size : "M";
                    monStr += monster.color ? monster.color : "r";
                    monStr += "-";
                    monStr += monster.getCombatID(i + 1);
                    monStr += monster.token ? `~${monster.token}` : "";
                    imgUrl += monStr;
                }
            }
        });
        // Overlay
        switch (overlay.type) {
            case "circle":
                if (overlay.radius && overlay.color && overlay.center) {
                    imgUrl += "/*c";
                    imgUrl += overlay.radius + overlay.color + overlay.center;
                }
                break;
            case "cone":
                if (overlay.size && overlay.start && overlay.end && overlay.color) {
                    imgUrl += "/*t";
                    imgUrl += overlay.size + overlay.color + overlay.start + overlay.end;
                }
                break;
            case "line":
                if (overlay.start && overlay.end && overlay.length && overlay.width && overlay.color) {
                    imgUrl += "/*l";
                    imgUrl += overlay.length + overlay.width + overlay.color + overlay.start + overlay.end;
                }
                break;
            case "square":
                if (overlay.size && overlay.color && overlay.topleft) {
                    imgUrl += "/*s";
                    imgUrl += overlay.size + overlay.color + overlay.topleft;
                }
                break;
        }
        imgUrl += "/";
        imgUrl += battlemap.url ? `/?a=2&bg=${battlemap.url}` : "";
        var imgDom = document.createElement("img");
        imgDom.classList.add('img-fluid');
        imgDom.src = imgUrl;
        if (imgDom.outerHTML.localeCompare(mapPreview.innerHTML) != 0) {
            mapPreview.innerHTML = "";
            mapPreview.hidden = false;
            mapPreview.appendChild(imgDom);
        }
    }
    else {
        mapPreview.hidden = true;
    }
}
export function buildSavedList() {
    const builds = SavedBuild.load();
    const loadButton = document.getElementById("load-plan");
    const deleteButton = document.getElementById("reset-plan");
    const loadList = document.getElementById("load-plan-list");
    loadList.innerHTML = "";
    for (const name in builds) {
        const build = builds[name];
        var buildURL = "";
        try {
            buildURL = `${window.location.href.replace("#/", "")}?data=${build.data}`;
        }
        catch (error) {
            console.error("Error parsing data: ", error);
        }
        const adom = document.createElement("a");
        adom.classList.add("dropdown-item");
        adom.href = buildURL;
        adom.innerHTML = `${name}`;
        const li = document.createElement("li");
        li.appendChild(adom);
        loadList.appendChild(li);
    }
    loadButton.hidden = loadList.hasChildNodes() ? false : true;
    deleteButton.hidden = loadList.hasChildNodes() ? false : true;
}
export function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    }
    catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}
export function getTokenShortcode(url) {
    return new Promise((resolve, reject) => {
        const base64 = btoa(url);
        const queryUrl = `https://token.otfbm.io/meta/${base64}`;
        const request = new XMLHttpRequest();
        request.open('POST', `${document.URL}shortcode`, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                const response = JSON.parse(request.responseText);
                const token = response.token;
                if (!token) {
                    resolve(null);
                }
                else {
                    resolve(token);
                }
            }
            else {
                resolve(null);
            }
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify({ "url": queryUrl }));
    });
}
export function defaultMapSettings() {
    const battlemap = BattleMap.load();
    document.getElementById("map-setup").querySelectorAll('input').forEach(input => {
        input.value = battlemap[`${input.id.replace('map-', '')}`];
    });
}
export function defaultOverlaySettings() {
    const battlemap = BattleMap.load();
    document.getElementById("overlay-setup").querySelectorAll('input, select').forEach(input => {
        if (input instanceof HTMLInputElement) {
            input.value = battlemap.overlay[`${input.id.replace('map-overlay', '').toLowerCase()}`];
        }
        else if (input instanceof HTMLSelectElement) {
            input.value = battlemap.overlay[`${input.id.replace('map-overlay', '').toLowerCase()}`];
        }
    });
}
export function defaultSettings() {
    const settings = Settings.load();
    document.querySelectorAll(".settings").forEach(elm => {
        elm.querySelectorAll("input").forEach(input => {
            var node = input.id.replace("setting-", "");
            if (input.type == "text") {
                input.value = settings[node];
            }
            else {
                input.checked = settings[node];
            }
        });
    });
}
export function validateSettings() {
    const settings = Settings.load();
    const multiColumn = document.getElementById("multiColumn");
    var errorButton = multiColumn.querySelector('.error-button');
    if (settings.conflict() == true) {
        if (!errorButton) {
            errorButton = document.createElement('button');
            errorButton.setAttribute("type", "button");
            errorButton.classList.add("btn", "btn-light", "m-0", "p-0", "error-button");
            errorButton.setAttribute("data-bs-toggle", "tooltip");
            errorButton.setAttribute("data-bs-trigger", "hover");
            errorButton.setAttribute("data-bs-placement", "right");
            errorButton.setAttribute("title", "Multiline won't work with alias (ie. map) commands.\nInclude Notes to use with multiline");
            var icon = document.createElement("i");
            icon.classList.add("fa-solid", "fa-triangle-exclamation");
            errorButton.appendChild(icon);
            multiColumn.appendChild(errorButton);
            $('[data-bs-toggle="tooltip"]').tooltip("enable");
        }
    }
    else if (errorButton) {
        multiColumn.removeChild(errorButton);
    }
}
export function copyString(content, tooltipString, elementID) {
    navigator.clipboard.writeText(content);
    $(`#${elementID}`).tooltip({ title: `${tooltipString}`, delay: { show: 500, hide: 1500 } });
    $(`#${elementID}`).tooltip('show');
}
export function encodeBuild(name = "") {
    const monsters = Monster.load();
    const battlemap = BattleMap.load();
    const raw_data = { "monsters": monsters, "battlemap": battlemap };
    if (name != "") {
        raw_data["name"] = name;
    }
    const data = JSON.stringify(raw_data);
    const encodedData = encodeURIComponent(data);
    return encodedData;
}
function createInputElement(id, label, value, type, max = null) {
    var inputField = document.createElement("input");
    inputField.type = type;
    inputField.classList.add("form-control");
    inputField.id = id;
    inputField.name = id;
    inputField.placeholder = label;
    inputField.value = value;
    if (type == "number" && max) {
        inputField.max = max;
    }
    var inputLabel = document.createElement("label");
    inputLabel.setAttribute("for", id);
    inputLabel.innerHTML = label;
    var formFloating = document.createElement("div");
    formFloating.classList.add("form-floating");
    formFloating.appendChild(inputField);
    formFloating.appendChild(inputLabel);
    var column = document.createElement("div");
    column.classList.add('col-sm-3', 'mb-3');
    column.appendChild(formFloating);
    return column;
}
export function exportBuild(element) {
    const encodedData = encodeBuild();
    const url = `?data=${encodedData}`;
    copyString(`${window.location.href}${url}`, "Build copied to clipboard!", element.id);
}
