import { Monster } from './models/Monster.js';
import { BattleMap } from './models/Battlemap.js';
import { buildInventoryContainer, monsterInventory, isValidHttpUrl, getTokenShortcode, buildMaddContainer, maddTable, buildMaddHeader, buildMapSettingsheader, defaultMapSettings, buildMapPreview, defaultOverlaySettings, buildOverlayHeader, defaultSettings, buildOverlayContainer, validateSettings, copyString, encodeBuild, buildSavedList } from './utils/helpers.js';
import { Overlay } from './models/Overlay.js';
import { Settings } from './models/Settings.js';
import { getCommandString } from './utils/commands.js';
import { SavedBuild } from './models/Saves.js';
const extractIndex = (str) => { const match = str.match(/-(\d+)/); return match ? parseInt(match[1], 10) : null; };
// Initial Setup
Monster.import();
BattleMap.import();
SavedBuild.import();
window.history.replaceState({}, document.title, window.location.pathname);
buildInventoryContainer();
buildMaddContainer();
buildOverlayContainer();
defaultMapSettings();
defaultOverlaySettings();
defaultSettings();
buildMaddHeader();
buildMapSettingsheader();
buildOverlayHeader();
buildMapPreview();
buildSavedList();
getCommandString();
// Monster Inventory Event Delegate
monsterInventory.addEventListener('change', function (event) {
    const target = event.target;
    const index = extractIndex(target.id);
    const node = target.id.replace(`-${index}`, "");
    const monsters = Monster.load();
    const monster = monsters[index - 1];
    const madd_nodes = ["label", "quantity", "size", "color", "token", "name"];
    // Update Monster
    if (target instanceof HTMLInputElement) {
        monster[node] = target.value;
    }
    else if (target instanceof HTMLSelectElement) {
        monster[node] = target.options[target.selectedIndex].value;
    }
    else {
        return;
    }
    monster.save();
    // Manage Inventory Rows 
    if (node.includes("name")) {
        var next_monster = monsters[index];
        if (next_monster == undefined && monster.name != "") {
            next_monster = new Monster(index + 1);
            next_monster.save();
            buildInventoryContainer();
        }
        else if (monster.name == "" && (next_monster && next_monster.name == "") && monster._index < monsters.length) {
            monsters.reverse().forEach(function (m) {
                if (m.name == "" && m._index < monsters.length) {
                    m.remove();
                }
                buildInventoryContainer();
            });
        }
        const focusDom = document.getElementById(`label-${index}`);
        if (focusDom) {
            focusDom.focus();
        }
    }
    else if (node.includes("token")) {
        var helpDom = document.getElementById(`mTokenHelp${index}`);
        const tokenDom = target;
        if (isValidHttpUrl(monster.token)) {
            tokenDom.value = "loading...";
            getTokenShortcode(monster.token)
                .then((token) => {
                monster.token = "";
                if (token !== null) {
                    tokenDom.value = token;
                    monster.token = token;
                    if (helpDom) {
                        helpDom.remove();
                    }
                }
                else {
                    tokenDom.value = "";
                    const error = "Something went wrong with that image. Either OTFBM doesn't have access to the image, or it is malformed.<br>Try a different image URL please";
                    if (helpDom) {
                        helpDom.innerHTML = error;
                    }
                    else {
                        helpDom = document.createElement("small");
                        helpDom.id = `mTokenHelp${index}`;
                        helpDom.classList.add('form-text', 'text-white-50');
                        helpDom.innerHTML = error;
                        tokenDom.parentElement.append(helpDom);
                    }
                }
                monster.save();
            });
        }
        else {
            if (helpDom) {
                helpDom.remove();
            }
        }
    }
    else if (node.includes("quantity")) {
        monster.coords.length = monster.quantity;
        monster.save();
    }
    if (madd_nodes.indexOf(node)) {
        const change_event = new Event("change");
        buildMaddContainer();
        maddTable.dispatchEvent(change_event);
    }
});
monsterInventory.addEventListener('click', function (event) {
    const target = event.target;
    const index = extractIndex(target.id);
    const monsters = Monster.load();
    const monster = monsters[index - 1];
    if (monster) {
        if (target.id.includes('remove')) {
            if (index == monsters.length) {
                $(`#remove-${index}`).tooltip({ title: "Cannot remove the last row.", delay: { show: 500, hide: 1500 } });
                $(`#remove-${index}`).tooltip('show');
            }
            else {
                monster.remove();
                buildInventoryContainer();
                buildMaddContainer();
                buildMaddHeader();
                buildMapPreview();
                getCommandString();
            }
        }
    }
});
// MADD Container Event Delegate
maddTable.addEventListener("change", function (event) {
    const target = event.target;
    const numbers = target.id.match(/\d+/g);
    if (numbers) {
        const index = parseInt(numbers[0]);
        const coordIndex = parseInt(numbers[1]);
        const monsters = Monster.load();
        const monster = monsters[index - 1];
        monster.coords[coordIndex - 1] = target.value;
        monster.save();
    }
    buildMaddHeader();
    buildMapPreview();
});
maddTable.addEventListener("click", function (event) {
    const target = event.target;
    const index = extractIndex(target.id);
    const monsters = Monster.load();
    const monster = monsters[index - 1];
    if (target.id.split('-').indexOf("clear") != -1) {
        monster.getMaddRow().querySelectorAll("input").forEach(input => {
            input.value = "";
        });
        monster.coords = [];
        monster.coords.length = monster.quantity;
        monster.save();
        buildMaddHeader();
        buildMapPreview();
    }
});
// Map Settings Table
document.getElementById('map-setup').addEventListener("change", function (event) {
    const battlemap = BattleMap.load();
    const target = event.target;
    const node = target.id.replace('map-', '');
    battlemap[node] = target.value;
    battlemap.save();
    buildMapSettingsheader();
    buildMapPreview();
});
// Overlay Settings Table
document.getElementById("overlay-setup").addEventListener("change", function (event) {
    const battlemap = BattleMap.load();
    const target = event.target;
    const node = target.id.replace("map-overlay", "").toLowerCase();
    if (target instanceof HTMLInputElement) {
        battlemap.overlay[node] = target.value;
    }
    else if (target instanceof HTMLSelectElement) {
        battlemap.overlay[node] = target.options[target.selectedIndex].value;
    }
    battlemap.save();
    buildOverlayContainer();
    buildMapPreview();
    buildOverlayHeader();
});
document.getElementById("overlay-setup").addEventListener("click", function (event) {
    const battlemap = BattleMap.load();
    const target = event.target;
    const change_event = new Event("change");
    if (target.id.split('-').indexOf("reset") != -1) {
        battlemap.overlay = new Overlay();
        battlemap.save();
        document.getElementById("overlay-setup").dispatchEvent(change_event);
    }
});
// General Settings
document.getElementById("appSettings-setup").addEventListener("change", function (event) {
    const settings = Settings.load();
    const target = event.target;
    const node = target.id.replace("setting-", "");
    settings[node] = target.value;
    settings.save();
    buildMapSettingsheader();
    buildMaddHeader();
    buildOverlayHeader();
});
// Inventory Header
document.getElementById("inventory-header").addEventListener("change", function (event) {
    const settings = Settings.load();
    const target = event.target;
    const node = target.id.replace("setting-", "");
    settings[node] = target.checked;
    settings.save();
    validateSettings();
});
// Copy Buttons
document.querySelectorAll('.copy-button').forEach(function (element) {
    switch (element.id) {
        case "export-planner":
            element.addEventListener("click", function (event) {
                const encodedData = encodeBuild();
                const url = `?data=${encodedData}`;
                copyString(`${window.location.href}${url}`, "Build copied to clipboard!", element.id);
            });
            break;
        case "command-copy":
            element.addEventListener("click", function (e) {
                const rawText = document.getElementById("avrae-command").innerHTML;
                const copyText = rawText.replace(/<br>/g, '\n');
                copyString(copyText, "Build copied to clipboard!", element.id);
            });
            break;
        case "madd-copy":
            element.addEventListener("click", function (e) {
                const rawText = document.getElementById("madd-command").innerHTML;
                const copyText = rawText.replace(/<br>/g, '\n');
                copyString(copyText, "Build copied to clipboard!", element.id);
            });
            break;
        case "map-command-copy":
            element.addEventListener("click", function (e) {
                const rawText = document.getElementById("map-command").innerHTML;
                const copyText = rawText.replace(/<br>/g, '\n');
                copyString(copyText, "Build copied to clipboard!", element.id);
            });
            break;
        case "overlay-copy":
            element.addEventListener("click", function (e) {
                const rawText = document.getElementById("overlay-command").innerHTML;
                const copyText = rawText.replace(/<br>/g, '\n');
                copyString(copyText, "Build copied to clipboard!", element.id);
            });
            break;
        case "save-plan":
            element.addEventListener("click", function (e) {
                const planName = document.getElementById("plan-name");
                const plans = SavedBuild.load();
                const limit = 10;
                if (Object.keys(plans).length >= limit) {
                    $(`#save-plan`).tooltip({ title: `Can only save ${limit} builds at this time.`, delay: { show: 500, hide: 1500 } });
                    $(`#save-plan`).tooltip('show');
                    return;
                }
                if (planName.value != "") {
                    const plan = new SavedBuild(planName.value, encodeBuild(planName.value));
                    plan.save();
                    buildSavedList();
                    $('#saveModal').modal('hide');
                }
            });
            break;
    }
});
// Reset Button
document.querySelectorAll(".reset-button").forEach(function (element) {
    switch (element.id.replace("reset-", "")) {
        case "monsters":
            element.addEventListener("click", function (e) {
                Monster.dump();
                buildInventoryContainer();
                buildMaddContainer();
                buildMaddHeader();
                buildMapPreview();
                getCommandString();
            });
            break;
        case "battlemap":
            element.addEventListener("click", function (e) {
                BattleMap.dump();
                buildOverlayContainer();
                defaultMapSettings();
                buildMapSettingsheader();
                getCommandString();
                buildMapPreview();
            });
            break;
        case "all":
            element.addEventListener('click', function (e) {
                Monster.dump();
                BattleMap.dump();
                location.reload();
            });
            break;
        case "plan":
            element.addEventListener('click', function (e) {
                const planName = document.getElementById('plan-name');
                const name = planName.value;
                if (name != "") {
                    console.log(name);
                    Monster.dump();
                    BattleMap.dump();
                    SavedBuild.dump(name);
                    location.reload();
                }
            });
            break;
    }
});
// Content listener
document.getElementById('content').addEventListener('change', function (event) {
    getCommandString();
});
// After everything loaded
document.addEventListener("DOMContentLoaded", function () {
    validateSettings();
    const modals = [
        $("#monsterMapModal"),
        $("#mapOverlayModal"),
        $("#mapSettingsModal"),
        $("#appSettingsModal")
    ];
    modals.forEach(function (modal) {
        modal.draggable({
            handle: ".modal-header"
        });
    });
});
