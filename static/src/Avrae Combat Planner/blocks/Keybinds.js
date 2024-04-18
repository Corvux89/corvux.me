import { savePlan } from "../models/Saves.js";
import { exportBuild } from "../utils/helpers.js";
export function setupKeybinds() {
    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.key === "s") {
            e.preventDefault();
            saveKeybind();
        }
        else if (e.ctrlKey && e.key === 'x') {
            e.preventDefault();
            exportBuildKeybind();
        }
        else if (e.altKey && e.key == '1') {
            e.preventDefault();
            const tabDom = document.querySelector('#inventory-tab');
            // @ts-ignore
            var tab = bootstrap.Tab.getInstance(tabDom) ? bootstrap.Tab.getInstance(tabDom) : new bootstrap.Tab(tabDom);
            tab.show();
        }
        else if (e.altKey && e.key == '2') {
            e.preventDefault;
            const tabDom = document.querySelector('#map-tab');
            // @ts-ignore
            var tab = bootstrap.Tab.getInstance(tabDom) ? bootstrap.Tab.getInstance(tabDom) : new bootstrap.Tab(tabDom);
            tab.show();
        }
        else if (e.altKey && e.key == 'h') {
            // @ts-ignore
            new bootstrap.Modal(document.getElementById("howtomodal")).show();
        }
        // Map Planner Keyboard Shortcuts
        if (document.getElementById("map-planner").classList.contains("active") && e.altKey) {
            switch (e.key) {
                case "m":
                    // @ts-ignore
                    new bootstrap.Modal(document.getElementById("monsterMapModal")).show();
                    break;
                case "s":
                    // @ts-ignore
                    new bootstrap.Modal(document.getElementById("mapSettingsModal")).show();
                    break;
                case "o":
                    // @ts-ignore
                    new bootstrap.Modal(document.getElementById("mapOverlayModal")).show();
                    break;
            }
        }
    });
}
function saveKeybind() {
    const planName = document.getElementById("plan-name");
    const saveModal = document.getElementById("saveModal");
    if (planName.value != "") {
        savePlan();
        $(`#savePlanButton`).tooltip({ title: `${planName.value} saved.`, delay: { show: 500, hide: 1500 } });
        $(`#savePlanButton`).tooltip('show');
    }
    else {
        // @ts-ignore
        new bootstrap.Modal(saveModal).show();
    }
}
function exportBuildKeybind() {
    const button = document.getElementById("export-planner");
    exportBuild(button);
}
