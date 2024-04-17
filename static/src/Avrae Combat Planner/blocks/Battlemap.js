import { BattleMap } from "../models/Battlemap.js";
import { Overlay } from "../models/Overlay.js";
import { buildMapPreview, buildMapSettingsheader, buildOverlayContainer, buildOverlayHeader } from "../utils/helpers.js";
export function setupBattlemap() {
    mapSettingsTable();
    overlayTable();
}
function mapSettingsTable() {
    document.getElementById('map-setup').addEventListener("change", function (event) {
        const battlemap = BattleMap.load();
        const target = event.target;
        const node = target.id.replace('map-', '');
        battlemap[node] = target.value;
        battlemap.save();
        buildMapSettingsheader();
        buildMapPreview();
    });
}
function overlayTable() {
    overlay_change();
    overlay_click();
}
function overlay_change() {
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
}
function overlay_click() {
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
}
