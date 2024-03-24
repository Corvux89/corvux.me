export class PlannerSettings {
    static node = "AvraeSettings"
    constructor(multiline, maptarget, notes, monsters, battlemap, overlay, prefix, attach) {
        this.multiline = multiline != false
        this.maptarget = maptarget || false
        this.notes = notes || false
        this.monsters = monsters != false
        this.battlemap = battlemap || false
        this.overlay = overlay || false
        this.prefix = prefix || "!"
        this.attach = attach || "DM"
    }

    static load() {
        var settings = JSON.parse(localStorage.getItem(PlannerSettings.node) || "{}")
        return new PlannerSettings(
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

    save() {
        localStorage.setItem(PlannerSettings.node, JSON.stringify(this))
    }
}