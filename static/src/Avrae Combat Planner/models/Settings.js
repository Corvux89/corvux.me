const node = "avraesettings";
export class Settings {
    constructor(multiline = true, maptarget = false, notes = false, monsters = true, battlemap = false, overlay = false, prefix = "!", attach = "DM") {
        this.multiline = multiline;
        this.maptarget = maptarget;
        this.notes = notes;
        this.monsters = monsters;
        this.battlemap = battlemap;
        this.overlay = overlay;
        this.prefix = prefix;
        this.attach = attach;
    }
    save() {
        localStorage.setItem(node, JSON.stringify(this));
    }
    conflict() {
        return (this.multiline == true && (this.notes == false && (this.battlemap == true || this.overlay == true)));
    }
}
export function loadSettings() {
    const settings = JSON.parse(localStorage.getItem(node) || "{}");
    return new Settings(settings.multiline, settings.maptarget, settings.notes, settings.monsters, settings.battlemap, settings.overlay, settings.prefix, settings.attack);
}
