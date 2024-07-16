import { BattleMap } from "../models/Battlemap.js"
import { Overlay } from "../models/Overlay.js"
import { buildMapPreview, buildMapSettingsheader, buildOverlayContainer, buildOverlayHeader } from "../utils/helpers.js"


export function setupBattlemap(): void{
    mapSettingsTable()
    overlayTable()
}

function mapSettingsTable(): void{
    document.getElementById('map-setup').addEventListener("change", function (event) {
        const battlemap = BattleMap.load()
        const target = event.target as HTMLInputElement
        const node = target.id.replace('map-', '')
        battlemap[node] = target.value
        battlemap.save()
        buildMapSettingsheader()
        buildMapPreview()
    })
}

function overlayTable(): void{
  overlay_change()
  overlay_click()
}

function overlay_change(): void{
    document.getElementById("overlay-setup").addEventListener("change", function (event) {
        const battlemap = BattleMap.load()
        const target = event.target
        const node = (target as Element).id.replace("map-overlay", "").toLowerCase()
    
        if (target instanceof HTMLInputElement) {
            battlemap.overlay[node] = target.value
        } else if (target instanceof HTMLSelectElement) {
            battlemap.overlay[node] = target.options[target.selectedIndex].value
        }
    
        battlemap.save()
        buildOverlayContainer()
        buildMapPreview()
        buildOverlayHeader()
    })
}

function overlay_click(): void{
    document.getElementById("overlay-setup").addEventListener("click", function (event) {
        const battlemap = BattleMap.load()
        const target = event.target as Element
        const change_event = new Event("change")
    
        if (target.id.split('-').indexOf("reset") != -1) {
            battlemap.overlay = new Overlay()
            battlemap.save()
            document.getElementById("overlay-setup").dispatchEvent(change_event)
        }
    })
}