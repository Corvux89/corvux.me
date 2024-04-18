export function setupModals() {
    const modalDict = {
        "monsterMapModal": document.getElementById("monster-position1-1"),
        "mapOverlayModal": document.getElementById("map-overlayType"),
        "mapSettingsModal": document.getElementById("map-url"),
        "appSettingsModal": document.getElementById("setting-prefix"),
        "saveModal": document.getElementById("plan-name")
    };
    for (let key in modalDict) {
        setupModal(key, modalDict[key]);
    }
}
function setupModal(modalID, defaultElement) {
    const modal = $(`#${modalID}`);
    modal.draggable({ handle: ".modal-header" });
    if (defaultElement) {
        modal.on("shown.bs.modal", function () {
            defaultElement.focus();
        });
    }
}
