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
    static load() {
        const mapData = JSON.parse(localStorage.getItem(node));
        const battlemap = new BattleMap();
        if (mapData) {
            battlemap.url = mapData.url !== undefined ? mapData.url : this.prototype.url;
            battlemap.size = mapData.size !== undefined ? mapData.size : this.prototype.size;
            battlemap.csettings = mapData.csettings !== undefined ? mapData.csettings : this.prototype.csettings;
            battlemap.overlay = mapData.overlay !== undefined ? Overlay.load(mapData.overlay) : this.prototype.overlay;
        }
        return battlemap;
    }
    static import() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');
        if (encodedData) {
            const data = decodeURIComponent(encodedData);
            try {
                const parsedData = JSON.parse(data);
                localStorage.setItem(node, JSON.stringify(parsedData.battlemap));
            }
            catch (error) {
                console.error("Error parsing battlemap data: ", error);
            }
        }
    }
    static dump() {
        localStorage.removeItem(node);
    }
}
