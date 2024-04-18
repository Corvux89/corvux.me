import { Monster } from './models/Monster.js';
import { BattleMap } from './models/Battlemap.js';
import { buildInventoryContainer, buildMaddContainer, buildMaddHeader, buildMapSettingsheader, defaultMapSettings, buildMapPreview, defaultOverlaySettings, buildOverlayHeader, defaultSettings, buildOverlayContainer, validateSettings, buildSavedList } from './utils/helpers.js';
import { Settings } from './models/Settings.js';
import { getCommandString } from './utils/commands.js';
import { SavedBuild } from './models/Saves.js';
import { setupMonsterInventory } from './blocks/Monster Inventory.js';
import { setupMADDContainer } from './blocks/MADD Container.js';
import { setupBattlemap } from './blocks/Battlemap.js';
import { setupButtons } from './blocks/Buttons.js';
import { setupKeybinds } from './blocks/Keybinds.js';
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
// Monster Inventory Events
setupMonsterInventory();
// MADD Containter Events
setupMADDContainer();
// Map Stuff
setupBattlemap();
// Keybinds
setupKeybinds();
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
// Buttons
setupButtons();
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
