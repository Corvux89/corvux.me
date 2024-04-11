import { Overlay } from './Overlay.js';
const node = "battlemap";
export class BattleMap {
    constructor(url = "", size = "10x10", csettings = "", overlay = new Overlay()) {
        this.url = url;
        this.size = size;
        this.csettings = csettings;
        this.overlay = overlay;
    }
    save() {
        localStorage.setItem(node, JSON.stringify(this));
    }
}
export function loadBattleMap() {
    const battlemap = JSON.parse(localStorage.getItem(node)) || new BattleMap;
    return battlemap;
}
export function importBattleMap() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    if (encodedData) {
        const data = decodeURIComponent(encodedData);
        try {
            const parsedData = JSON.parse(data);
            localStorage.setItem(node, JSON.stringify(parsedData.battlemap));
        }
        catch (error) {
            console.error("Error parsong battlemap data: ", error);
        }
    }
}
export function dumpBattleMap() {
    localStorage.removeItem(node);
}
