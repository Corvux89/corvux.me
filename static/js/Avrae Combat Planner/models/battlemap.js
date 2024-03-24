import {Overlay} from './overlay.js'

export class BattleMap{
    static node = "battlemap"
    constructor(url, size, csettings, overlay){
        this.url = url || ""
        this.size = size || "10x10"
        this.csettings = csettings || ""
        this.overlay = overlay || new Overlay()
    }

    static load(){
        var battlemap = JSON.parse(localStorage.getItem(BattleMap.node) || "{}")
        return new BattleMap(
            battlemap.url,
            battlemap.size,
            battlemap.csettings,
            battlemap.overlay = Overlay.load(battlemap.overlay || {})
        )
    }

    save(){
        localStorage.setItem(BattleMap.node, JSON.stringify(this))
    }
}