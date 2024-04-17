import { BattleMap } from "../models/Battlemap.js";
import { Monster } from "../models/Monster.js";
import { SavedBuild } from "../models/Saves.js";
import { getCommandString } from "../utils/commands.js";
import { buildMapPreview, buildMapSettingsheader, buildOverlayContainer, buildSavedList, copyString, defaultMapSettings, encodeBuild } from "../utils/helpers.js";
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
