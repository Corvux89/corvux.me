import { Overlay } from './Overlay.js'

const node = "battlemap"

export class BattleMap {

    constructor(
        public url: string = "",
        public size: string = "10x10",
        public csettings: string = "",
        public overlay: Overlay = new Overlay()
    ) { }

    save() {
        localStorage.setItem(node, JSON.stringify(this))
    }

}

export function loadBattleMap() {
    const battlemap: BattleMap = JSON.parse(localStorage.getItem(node)) || new BattleMap
    return battlemap
}

export function importBattleMap() {
    const urlParams = new URLSearchParams(window.location.search)
    const encodedData = urlParams.get('data')

    if (encodedData) {
        const data = decodeURIComponent(encodedData)

        try {
            const parsedData = JSON.parse(data)
            localStorage.setItem(node, JSON.stringify(parsedData.battlemap))
        } catch (error) {
            console.error("Error parsong battlemap data: ", error)
        }
    }
}

export function dumpBattleMap() {
    localStorage.removeItem(node)
}