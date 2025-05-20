import { inputSelect, inputText } from "./utils.js";
const monsterNode = "monsters";
const settingNode = "avraesettings";
const battlemapNode = "battlemap";
const saveNode = "savedplans";
export const planLimit = 10;
const MonsterSizes = {
    "T": "Tiny",
    "S": "Small",
    "M": "Medium",
    "L": "Large",
    "H": "Huge",
    "G": "Gargantuan"
};
const Colors = {
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
};
export const OverlayMap = { "Circle": "c", "Cone": "t", "Line": "l", "Square": "s" };
export class Monster {
    constructor(index = 0, name = "", label = "", quantity = 1, size = "M", color = "r", token = "", args = "", coords = []) {
        this.index = index;
        this.name = name;
        this.label = label;
        this.quantity = quantity;
        this.size = size;
        this.color = color;
        this.token = token;
        this.args = args;
        this.coords = coords;
    }
    prefix() {
        if (this.label) {
            return this.label;
        }
        const split = this.name.split(/\W+/);
        return split.length == 1 ? this.name.slice(0, 2).toUpperCase() : split.filter(word => word).map(word => word[0]).join("").toUpperCase();
    }
    combatID(number) {
        return this.prefix().includes("#") ? this.prefix().replace("#", `${number}`) : this.quantity > 1 ? `${this.prefix()}${number}` : this.prefix();
    }
    inventoryRow() {
        const nameColumn = jQuery("<div>")
            .addClass("col-sm mb-3")
            .append(inputText(`name-${this.index}`, "name", "Name", this.name));
        const labelColumn = jQuery("<div>")
            .addClass("col-sm-2 mb-3")
            .append(inputText(`label-${this.index}`, "label", "Label", this.label));
        const quantityColumn = jQuery("<div>")
            .addClass("col-sm-2 mb-3")
            .append(inputText(`quantity-${this.index}`, "quantity", "Quantity", this.quantity, "number", 0, 20));
        const sizeColumn = jQuery("<div>")
            .addClass("col-sm-3 mb-3")
            .append(inputSelect(`size-${this.index}`, "size", "Size", this.size, MonsterSizes));
        const colorColumn = jQuery("<div>")
            .addClass("col-sm-2 mb-3")
            .append(inputSelect(`color-${this.index}`, "color", "Token Color", this.color, Colors));
        const tokenColumn = jQuery("<div>")
            .addClass("col-sm-4 mb-3")
            .append(inputText(`token-${this.index}`, "token", "Token Shorcode/URL", this.token));
        const argsColumn = jQuery("<div>")
            .addClass("col-sm mb-3")
            .append(inputText(`args-${this.index}`, "args", "Additional Arguments", this.args));
        const headerRow = jQuery("<div>")
            .addClass("row mt-2")
            .html(`
                <div class="col-md-12 d-flex monster-header">
                    <h3>Monster ${this.index + 1}</h3>
                    ${this.index == 0 ? "" : `<button type="button" class="btn btn-close ms-auto remove-monster" tabindex="-1"></button>`}
                </div>
                `);
        const row1 = jQuery("<div>")
            .addClass("row m-2")
            .append(nameColumn, labelColumn, quantityColumn, sizeColumn, colorColumn);
        const row2 = jQuery("<div>")
            .addClass("row m-2")
            .append(tokenColumn, argsColumn);
        const monsterRow = jQuery("<div>")
            .addClass("row monster border rounded bg-secondary m-2")
            .attr({
            "id": `monster-${this.index}`,
            "data-id": this.index
        })
            .append(headerRow, row1, row2);
        return monsterRow;
    }
    maddRow() {
        if (this.name == "") {
            return;
        }
        const headerRow = jQuery("<div>")
            .addClass("row m-2")
            .html(`
                <div class="col-md-12 d-flex monHeader">
                    <h3>${this.name}</h3>
                </div>
                `);
        const monsterRow = jQuery("<div>")
            .addClass("row m-2 border rounded monGroup bg-secondary")
            .attr({
            "id": `madd-${this.index}`,
            "data-id": this.index
        })
            .append(headerRow);
        for (let i = 0; i < this.quantity; i++) {
            const monsterColumn = jQuery("<div>")
                .addClass("col-sm-3 mb-3 monPos")
                .attr({
                "data-id": this.index,
                "data-mon": i
            })
                .append(inputText(`monster-position${this.index}-${i + 1}`, "monster-position", this.combatID(i + 1), this && this.coords && this.coords[i] ? this.coords[i] : ""));
            if (this.index == 0 && i == 0)
                monsterColumn.find("input[name='monster-position']").addClass("default-focus");
            monsterRow.append(monsterColumn);
        }
        const footerRow = jQuery("<div>")
            .addClass("row m-2")
            .html(`
                <div class="col mb-3">
                    <button type="button" class="btn btn-light float-end madd-clear" data-id="${this.index}">Clear</button>
                </div>
                `);
        monsterRow.append(footerRow);
        return monsterRow;
    }
    save() {
        const monsters = Monster.load();
        if (this.name == "")
            monsters.splice(this.index, 1);
        else
            monsters[this.index] = this;
        localStorage.setItem(monsterNode, JSON.stringify(monsters));
    }
    remove() {
        const monsters = Monster.load();
        monsters.splice(this.index, 1);
        localStorage.setItem(monsterNode, JSON.stringify(monsters));
    }
    static load() {
        const monsterData = JSON.parse(localStorage.getItem(monsterNode) || "[]");
        const monsters = monsterData.map((data, index) => new Monster(index, data.name, data.label, data.quantity, data.size, data.color, data.token, data.args, data.coords));
        if (monsters.length == 0 || monsters[monsters.length - 1].name != "")
            monsters.push(new Monster(monsters.length));
        return monsters;
    }
    static dump() {
        localStorage.removeItem(monsterNode);
    }
    static import() {
        const data = new URLSearchParams(window.location.search).get('data');
        if (!data)
            return;
        try {
            const parseData = JSON.parse(decodeURIComponent(data));
            localStorage.setItem(monsterNode, JSON.stringify(parseData.monsters));
        }
        catch (error) {
            console.error("Error parsing Monster data: ", error);
        }
    }
    static mapCommand(settings) {
        const monsters = Monster.load();
        const coords = [];
        monsters.forEach(monster => {
            if (monster.name == "" || monster.quantity == 0) {
                return;
            }
            for (let i = 0; i < monster.quantity; i++) {
                if (monster.coords[i] == null || monster.coords[i] == "") {
                    continue;
                }
                const str = ` -t "${monster.combatID(i + 1)}|${monster.coords[i]}|${monster.size}|${monster.color}|$${monster.token}"`;
                coords.push(str);
            }
        });
        return coords.length > 0 ? `${settings.prefix}map${coords.join(" ")}` : "";
    }
    static maddCommand(settings) {
        const monsters = Monster.load();
        const commands = [];
        monsters.forEach(monster => {
            if (monster.name == "" || monster.quantity == 0) {
                return;
            }
            const baseCommand = `${settings.prefix}i madd "${monster.name}"`;
            const name = monster.label ? ` -name "${monster.label}"` : "";
            const args = monster.args ? ` ${monster.args}` : "";
            if (settings.notes) {
                if (monster.coords.length === 0) {
                    const notes = [];
                    if (monster.size)
                        notes.push(`Size: ${monster.size} (${MonsterSizes[monster.size]})`);
                    if (monster.color)
                        notes.push(`Color: ${monster.color} (${Colors[monster.color].toLowerCase()})`);
                    if (monster.token)
                        notes.push(`Token: ${monster.token}`);
                    if (notes.length > 0)
                        commands.push(`${baseCommand}${name} -note "${notes.join(' | ')}"${args}`);
                }
                else {
                    monster.coords.forEach(coord => {
                        const notes = [];
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
            }
            else {
                const quantity = monster.quantity > 1 ? ` -n ${monster.quantity}` : "";
                commands.push(`${baseCommand}${quantity}${name}${args}`);
            }
        });
        return commands;
    }
}
export class Settings {
    constructor(multiline = true, maptarget = true, notes = true, monsters = true, battlemap = false, overlay = false, prefix = "!", attach = "DM") {
        this.multiline = multiline;
        this.maptarget = maptarget;
        this.notes = notes;
        this.monsters = monsters;
        this.battlemap = battlemap;
        this.overlay = overlay;
        this.prefix = prefix;
        this.attach = attach;
    }
    get conflict() {
        return (this.multiline == true && (this.notes == false && (this.battlemap == true || this.overlay == true)));
    }
    save() {
        localStorage.setItem(settingNode, JSON.stringify(this));
    }
    static load() {
        const settings = JSON.parse(localStorage.getItem(settingNode) || "{}");
        return new Settings(settings.multiline, settings.maptarget, settings.notes, settings.monsters, settings.battlemap, settings.overlay, settings.prefix, settings.attach);
    }
}
export class Overlay {
    constructor(type = "", target = "", radius = "", center = "", size = "", start = "", end = "", length = "", width = "", topleft = "", color = "") {
        this.type = type;
        this.target = target;
        this.radius = radius;
        this.center = center;
        this.size = size;
        this.start = start;
        this.end = end;
        this.length = length;
        this.width = width;
        this.topleft = topleft;
        this.color = color;
    }
    get requiredNodes() {
        return {
            "Circle": [this.radius, this.color, this.center],
            "Cone": [this.size, this.color, this.start, this.end],
            "Line": [this.length, this.width, this.color, this.start, this.end],
            "Square": [this.size, this.color, this.topleft]
        };
    }
    get validOverlay() {
        return this.type ? this.requiredNodes[this.type].every(v => v !== "") : false;
    }
    static load(overlay) {
        return new Overlay(overlay.type, overlay.target, overlay.radius, overlay.center, overlay.size, overlay.start, overlay.end, overlay.length, overlay.width, overlay.topleft, overlay.color);
    }
    command(settings, mapOnly = false) {
        if (!this.validOverlay)
            return "";
        if (settings.notes && !mapOnly) {
            return `${settings.prefix}i note ${this.target ? this.target : settings.attach} Overlay: ${OverlayMap[this.type]}${this.requiredNodes[this.type].join("")}`;
        }
        else {
            return `${settings.prefix}map -over ${this.type.toLowerCase()},${this.requiredNodes[this.type].join(",")}${this.target ? ` -t ${this.target}` : ""}`;
        }
    }
}
export class BattleMap {
    constructor(url = "", size = "10x10", csettings = "", overlay = new Overlay(), darkMode = false) {
        this.url = url;
        this.size = size;
        this.csettings = csettings;
        this.overlay = overlay;
        this.darkMode = darkMode;
    }
    save() {
        console.log(this);
        localStorage.setItem(battlemapNode, JSON.stringify(this));
    }
    static load() {
        const mapData = JSON.parse(localStorage.getItem(battlemapNode));
        const battlemap = new BattleMap();
        if (mapData) {
            battlemap.url = mapData.url !== undefined ? mapData.url : this.prototype.url;
            battlemap.size = mapData.size !== undefined ? mapData.size : this.prototype.size;
            battlemap.csettings = mapData.csettings !== undefined ? mapData.csettings : this.prototype.csettings;
            battlemap.overlay = mapData.overlay !== undefined ? Overlay.load(mapData.overlay) : this.prototype.overlay;
            battlemap.darkMode = mapData.darkMode !== undefined ? mapData.darkMode : this.prototype.darkMode;
        }
        return battlemap;
    }
    static dump() {
        localStorage.removeItem(battlemapNode);
    }
    static import() {
        const data = new URLSearchParams(window.location.search).get('data');
        if (!data)
            return;
        try {
            const parseData = JSON.parse(decodeURIComponent(data));
            localStorage.setItem(battlemapNode, JSON.stringify(parseData.battlemap));
        }
        catch (error) {
            console.error("Error parsing Battlemap data: ", error);
        }
    }
    command(settings, mapOnly = false) {
        const commands = [];
        let str = "";
        if (!this.url && !this.size)
            return commands;
        str = `${settings.prefix}`;
        if (settings.notes && !mapOnly) {
            str += `i effect ${settings.attach} map -attack "||Size: ${this.size || '10x10'}`;
            if (this.url)
                str += ` ~ Background: ${this.url}`;
            if (this.csettings)
                str += ` ~ Options: ${this.darkMode ? 'd' : ''}c${this.csettings}`;
            str += '"';
        }
        else {
            str += "map";
            if (this.url)
                str += ` -bg "${this.url}"`;
            if (this.size)
                str += ` -mapsize ${this.size}`;
            if (this.csettings)
                str += ` -options ${this.darkMode ? 'd' : ''}c${this.csettings}`;
            if (settings.attach)
                str += ` -t ${settings.attach}`;
            if (settings.monsters && !mapOnly) {
                const monStr = Monster.mapCommand(settings);
                if (monStr)
                    commands.push(monStr);
            }
        }
        commands.push(str);
        return commands;
    }
}
export class SavedPlan {
    constructor(name = "My Saved Build", data = "") {
        this.name = name;
        this.data = data;
    }
    save() {
        const builds = SavedPlan.load();
        builds[this.name] = this;
        localStorage.setItem(saveNode, JSON.stringify(builds));
    }
    static load() {
        const data = JSON.parse(localStorage.getItem(saveNode) || "{}");
        const builds = {};
        for (const name in data) {
            const build = data[name];
            builds[name] = new SavedPlan(name, build.data);
        }
        return builds;
    }
    static import() {
        const data = new URLSearchParams(window.location.search).get('data');
        if (!data)
            return;
        try {
            const parseData = JSON.parse(decodeURIComponent(data));
            $("#plan-name").val(parseData.name || "");
        }
        catch (error) {
            console.error("Error parsing plan data: ", error);
        }
    }
    static dump(name) {
        const plans = SavedPlan.load();
        if (plans[name]) {
            delete plans[name];
            localStorage.setItem(saveNode, JSON.stringify(plans));
        }
    }
}
