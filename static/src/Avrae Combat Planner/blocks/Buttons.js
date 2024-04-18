import { BattleMap } from "../models/Battlemap.js";
import { Monster } from "../models/Monster.js";
import { SavedBuild, savePlan } from "../models/Saves.js";
import { getCommandString } from "../utils/commands.js";
import { buildMapPreview, buildMapSettingsheader, buildOverlayContainer, copyString, defaultMapSettings, exportBuild } from "../utils/helpers.js";
import { monsterInventoryRemoveEvent } from "./Monster Inventory.js";
export function setupButtons() {
    copyButtons();
    resetButtons();
}
function copyButtons() {
    document.querySelectorAll('.copy-button').forEach(function (element) {
        switch (element.id) {
            case "export-planner":
                element.addEventListener("click", function (event) {
                    exportBuild(element);
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
                    savePlan();
                });
                break;
        }
    });
}
function resetButtons() {
    document.querySelectorAll(".reset-button").forEach(function (element) {
        switch (element.id.replace("reset-", "")) {
            case "monsters":
                element.addEventListener("click", function (e) {
                    Monster.dump();
                    monsterInventoryRemoveEvent();
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
                        Monster.dump();
                        BattleMap.dump();
                        SavedBuild.dump(name);
                        location.reload();
                    }
                });
                break;
        }
    });
}
