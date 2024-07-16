import { draggableElement } from "../utils/Interfaces.js";

export function setupModals(): void{
    const modalDict = {
        "monsterMapModal": document.getElementById("monster-position1-1"),
        "mapOverlayModal": document.getElementById("map-overlayType"),
        "mapSettingsModal": document.getElementById("map-url"),
        "appSettingsModal": document.getElementById("setting-prefix"),
        "saveModal": document.getElementById("plan-name")   
    }

    for (let key in modalDict){
        setupModal(key, modalDict[key])
    }
}

function setupModal(modalID: string, defaultElement: HTMLElement): void{
    const modal = $(`#${modalID}`) as draggableElement
    modal.draggable({handle: ".modal-header"})
    if (defaultElement){
        modal.on("shown.bs.modal", function(){
            defaultElement.focus()
        })
    }
}