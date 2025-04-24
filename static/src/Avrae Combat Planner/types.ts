import { inputSelect, inputText } from "./utils.js"

const monsterNode = "monsters" as const
const settingNode = "avraesettings" as const
const battlemapNode = "battlemap" as const
const saveNode = "savedplans" as const
export const planLimit = 10 as const

const MonsterSizes: {[key: string]: string} = {
    "T": "Tiny",
    "S": "Small",
    "M": "Medium",
    "L": "Large",
    "H": "Huge",
    "G": "Gargantuan"
}

const Colors: {[key: string]: string} = {
    "r": "Red",
    "w": "White",
    "gy": "Grey",
    "g": "Green",
    "y": "Yellow",
    "pk": "Pink",
    "bn": "Brown",
    "bk": "Black",
    "b": "Blue",
    "p": "Purble",
    "c": "Cyan",
    "o": "Orange"
}

export const OverlayMap: {[key: string]: string} = {"Circle": "c", "Cone": "t", "Line": "l", "Square": "s"}

export interface draggableElement extends JQuery {
    draggable({})
}

export class Monster{
    constructor(
        public index: number = 0,
        public name: string = "",
        public label: string = "",
        public quantity: number = 1,
        public size: string = "M",
        public color: string = "r",
        public token: string = "",
        public args: string = "",
        public coords: string[] = []
    ) {}

    prefix(): string{
        if (this.label){
            return this.label
        }

        var split = this.name.split(/\W+/)

        return split.length == 1 ? this.name.slice(0,2).toUpperCase() : split.filter(word => word).map(word => word[0]).join("").toUpperCase()
    }

    combatID(number): string{
        return this.prefix().includes("#") ? this.prefix().replace("#", `${number}`) : this.quantity > 1 ? `${this.prefix()}${number}` : this.prefix()
    }

    inventoryRow(): JQuery<HTMLElement>{
        var nameColumn = jQuery("<div>")
            .addClass("col-sm mb-3")
            .append(inputText(`name-${this.index}`, "name", "Name", this.name))

        var labelColumn = jQuery("<div>")
            .addClass("col-sm-2 mb-3")
            .append(inputText(`label-${this.index}`, "label", "Label", this.label))

        var quantityColumn = jQuery("<div>")
            .addClass("col-sm-2 mb-3")
            .append(inputText(`quantity-${this.index}`, "quantity", "Quantity", this.quantity, "number", 0, 20))

        var sizeColumn = jQuery("<div>")
            .addClass("col-sm-3 mb-3")
            .append(inputSelect(`size-${this.index}`, "size", "Size", this.size, MonsterSizes))

        var colorColumn = jQuery("<div>")
            .addClass("col-sm-2 mb-3")
            .append(inputSelect(`color-${this.index}`, "color", "Token Color", this.color, Colors))

        var tokenColumn = jQuery("<div>")
            .addClass("col-sm-4 mb-3")
            .append(inputText(`token-${this.index}`, "token", "Token Shorcode/URL", this.token))

        var argsColumn = jQuery("<div>")
            .addClass("col-sm mb-3")
            .append(inputText(`args-${this.index}`, "args", "Additional Arguments", this.args))  

        var headerRow = jQuery("<div>")
            .addClass("row mt-2")
            .html(`
                <div class="col-md-12 d-flex monster-header">
                    <h3>Monster ${this.index+1}</h3>
                    ${this.index == 0 ? "" : `<button type="button" class="btn btn-close ms-auto remove-monster" tabindex="-1"></button>`}
                </div>
                `)

        var row1 = jQuery("<div>")
            .addClass("row m-2")
            .append(nameColumn, labelColumn, quantityColumn, sizeColumn, colorColumn)

        var row2 = jQuery("<div>")
            .addClass("row m-2")
            .append(tokenColumn, argsColumn)

        var monsterRow = jQuery("<div>")
            .addClass("row monster border rounded bg-secondary m-2")
            .attr({
                "id": `monster-${this.index}`,
                "data-id": this.index
            })
            .append(headerRow, row1, row2)

        return monsterRow
    }

    maddRow(): JQuery<HTMLElement>{
        if (this.name == ""){
            return 
        }

        var headerRow = jQuery("<div>")
            .addClass("row m-2")
            .html(`
                <div class="col-md-12 d-flex monHeader">
                    <h3>${this.name}</h3>
                </div>
                `)

        var monsterRow = jQuery("<div>")
            .addClass("row m-2 border rounded monGroup bg-secondary")
            .attr({
                "id": `madd-${this.index}`,
                "data-id": this.index
            })
            .append(headerRow)

        for (let i=0; i < this.quantity; i++){
            let monsterColumn = jQuery("<div>")
            .addClass("col-sm-3 mb-3 monPos")
            .attr({
                "data-id": this.index,
                "data-mon": i
            })
            .append(inputText(`monster-position${this.index}-${i+1}`, "monster-position", this.combatID(i+1), this && this.coords && this.coords[i] ? this.coords[i] : ""))

            if (this.index == 0 && i == 0) monsterColumn.find("input[name='monster-position']").addClass("default-focus")
                
            monsterRow.append(monsterColumn)
        }

        var footerRow = jQuery("<div>")
            .addClass("row m-2")
            .html(`
                <div class="col mb-3">
                    <button type="button" class="btn btn-light float-end madd-clear" data-id="${this.index}">Clear</button>
                </div>
                `)

            monsterRow.append(footerRow)

        return monsterRow
    }

    save(): void {
        var monsters = Monster.load()

        this.name == "" ? monsters.splice(this.index, 1) : monsters[this.index] = this

        localStorage.setItem(monsterNode, JSON.stringify(monsters))
    }

    remove(): void {
        var monsters = Monster.load()
        monsters.splice(this.index, 1)
        localStorage.setItem(monsterNode, JSON.stringify(monsters))
    }

    static load(): Monster[] {
        var monsterData = JSON.parse(localStorage.getItem(monsterNode) || "[]")
        var monsters = monsterData.map((data, index) => new Monster(
            index,
            data.name,
            data.label,
            data.quantity,
            data.size,
            data.color,
            data.token,
            data.args,
            data.coords
        ))

        if (monsters.length == 0 || monsters[monsters.length-1].name != "") monsters.push(new Monster(monsters.length))

        return monsters
    }

    static dump(): void {
        localStorage.removeItem(monsterNode)
    }

    static import(): void{
        const data = new URLSearchParams(window.location.search).get('data')

        if (!data) return

        try{
            const parseData = JSON.parse(decodeURIComponent(data))
            localStorage.setItem(monsterNode, JSON.stringify(parseData.monsters))
        } catch (error){
            console.error("Error parsing Monster data: ", error)
        }
    }

    static mapCommand(settings: Settings): string {
        var monsters = Monster.load()
        var coords = []

        monsters.forEach(monster => {
            if (monster.name == "" || monster.quantity == 0){
                return
            }

            for (let i = 0; i < monster.quantity; i++){
                if (monster.coords[i] == null || monster.coords[i] == ""){
                    continue
                }
                let str = ` -t "${monster.combatID(i+1)}|${monster.coords[i]}|${monster.size}|${monster.color}|$${monster.token}"`

                coords.push(str)
            }
        })

        return coords.length > 0 ? `${settings.prefix}map${coords.join(" ")}`:""
    }

    static maddCommand(settings: Settings): string[] {
        var monsters = Monster.load()
        var commands: string[] = []

        monsters.forEach(monster => {
            if (monster.name == "" || monster.quantity == 0){
                return
            }

            let baseCommand = `${settings.prefix}i madd "${monster.name}"`
            let name = monster.label ? ` -name "${monster.label}"` : ""
            let args = monster.args ? ` ${monster.args}` : ""

            if (settings.notes){
                if (monster.coords.length === 0) {
                    let notes = [];
                    if (monster.size)
                        notes.push(`Size: ${monster.size} (${MonsterSizes[monster.size]})`);
                    if (monster.color)
                        notes.push(`Color: ${monster.color} (${Colors[monster.color].toLowerCase()})`);
                    if (monster.token)
                        notes.push(`Token: ${monster.token}`);
                    if (notes.length > 0)
                        commands.push(`${baseCommand}${name} -note "${notes.join(' | ')}"${args}`);
                } else {
                    monster.coords.forEach(coord => {
                        let notes = [];
                        if (coord)
                            notes.push(`Location: ${coord}`);
                        if (monster.size)
                            notes.push(`Size: ${monster.size} (${MonsterSizes[monster.size]})`);
                        if (monster.color)
                            notes.push(`Color: ${monster.color} (${Colors[monster.color].toLowerCase()})`);
                        if (monster.token)
                            notes.push(`Token: ${monster.token}`);
                        if (notes.length > 0)
                            commands.push(`${baseCommand}${name} -note "${notes.join(' | ')}"${args}`);
                    });
                }
            } else {
                let quantity = monster.quantity > 1 ? ` -n ${monster.quantity}` : ""
                commands.push(`${baseCommand}${quantity}${name}${args}`)
            }
        })

        return commands
    }
}

export class Settings {
    constructor(
        public multiline: boolean = true,
        public maptarget: boolean = true,
        public notes: boolean = true,
        public monsters: boolean = true,
        public battlemap: boolean = false,
        public overlay: boolean = false,
        public prefix: string = "!",
        public attach: string = "DM"
    ) {}

    get conflict(): boolean{
        return (this.multiline == true && (this.notes == false && (this.battlemap == true || this.overlay == true)))
    }

    save(): void {
        localStorage.setItem(settingNode, JSON.stringify(this))
    }

    static load(): Settings{
        var settings = JSON.parse(localStorage.getItem(settingNode) || "{}")
        return new Settings(
            settings.multiline,
            settings.maptarget,
            settings.notes,
            settings.monsters,
            settings.battlemap,
            settings.overlay,
            settings.prefix,
            settings.attach
        )
    }
}

export class Overlay {
    constructor(
        public type: string = "",
        public target: string = "",
        public radius: string = "",
        public center: string = "",
        public size: string = "",
        public start: string = "",
        public end: string = "",
        public length: string = "",
        public width: string = "",
        public topleft: string = "",
        public color: string = ""
    ) { }

    get requiredNodes(){
        return {
            "Circle": [this.radius, this.color, this.center],
            "Cone": [this.size, this.color, this.start, this.end],
            "Line": [this.length, this.width, this.color, this.start, this.end],
            "Square": [this.size, this.color, this.topleft]
        }
    }

    get validOverlay(): boolean{
       return this.type ? this.requiredNodes[this.type].every(v => v !== "") : false
    }

    static load(overlay): Overlay {
        return new Overlay(
            overlay.type,
            overlay.target,
            overlay.radius,
            overlay.center,
            overlay.size,
            overlay.start,
            overlay.end,
            overlay.length,
            overlay.width,
            overlay.topleft,
            overlay.color
        )
    }

    command(settings: Settings, mapOnly: boolean = false): string {
        if (!this.validOverlay) return ""

        if (settings.notes && !mapOnly){
            return `${settings.prefix}i notes ${this.target ? this.target : settings.attach} Overlay: ${OverlayMap[this.type]}${this.requiredNodes[this.type].join("")}`
        } else {
            return `${settings.prefix}map -over ${this.type.toLowerCase()},${this.requiredNodes[this.type].join(",")}${this.target ? ` -t ${this.target}` : ""}`
        }
    }
}

export class BattleMap {
    constructor(
        public url: string = "",
        public size: string = "10x10",
        public csettings: string = "",
        public overlay: Overlay = new Overlay()
    ) {}

    save(): void{
        localStorage.setItem(battlemapNode, JSON.stringify(this))
    }

    static load(): BattleMap{
        const mapData = JSON.parse(localStorage.getItem(battlemapNode))
        const battlemap = new BattleMap()
        if (mapData){
            battlemap.url = mapData.url !== undefined ? mapData.url : this.prototype.url
            battlemap.size = mapData.size !== undefined ? mapData.size :  this.prototype.size 
            battlemap.csettings = mapData.csettings !== undefined ?  mapData.csettings : this.prototype.csettings
            battlemap.overlay = mapData.overlay !== undefined ? Overlay.load(mapData.overlay) : this.prototype.overlay
        }
        return battlemap
    }

    static dump(): void{
        localStorage.removeItem(battlemapNode)
    }

    static import(): void{
        const data = new URLSearchParams(window.location.search).get('data')

        if (!data) return

        try{
            const parseData = JSON.parse(decodeURIComponent(data))
            localStorage.setItem(battlemapNode, JSON.stringify(parseData.battlemap))
        } catch (error){
            console.error("Error parsing Battlemap data: ", error)
        }
    }

    command(settings: Settings, mapOnly: boolean = false): string[]{
        var commands: string[] = []
        let str = ""

        if (!this.url && !this.size) return commands

        str = `${settings.prefix}`

        if (settings.notes && !mapOnly){
            str += `i effect ${settings.attach} map -attack "||Size: ${this.size || '10x10'}`
            if (this.url) str += ` ~ Background: ${this.url}`
            if (this.csettings) str += ` ~Options: c${this.csettings}`
            str += '"'
        } else {
            str += "map"
            if (this.url) str += ` -bg "${this.url}"`
            if (this.size) str += ` -mapsize ${this.size}`
            if (this.csettings) str += ` -options c${this.csettings}`
            if (settings.attach) str += ` -t ${settings.attach}`

            if (settings.monsters && !mapOnly){
                let monStr = Monster.mapCommand(settings)
                if (monStr) commands.push(monStr)
            }
        }

        commands.push(str)

        return commands
    }
}

export class SavedPlan {
    constructor(
        public name: string = "My Saved Build",
        public data: string = ""
    ) {}

    save() {
        var builds = SavedPlan.load()
        builds[this.name] = this
        localStorage.setItem(saveNode, JSON.stringify(builds))
    }

    static load(): {[key: string]: SavedPlan} {
        const data: { [name: string]: SavedPlan} = JSON.parse(localStorage.getItem(saveNode) || "{}")
        var builds = {}

        for (let name in data){
            let build = data[name]
            builds[name] = new SavedPlan(name, build.data)
        }

        return builds
    }

    static import() {
        const data = new URLSearchParams(window.location.search).get('data')

        if (!data) return

        try {
            const parseData = JSON.parse(decodeURIComponent(data))
            $("#plan-name").val(parseData.name || "")
        } catch (error) {
            console.error("Error parsing plan data: ", error)
        }
    }

    static dump(name: string) {
        var plans = SavedPlan.load()
        
        if (plans[name]){
            delete plans[name]
            localStorage.setItem(saveNode, JSON.stringify(plans))
        }
    }
}