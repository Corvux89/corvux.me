const node = "avraesettings"

export class Settings {
    constructor(
        public multiline: boolean = true,
        public maptarget: boolean = false,
        public notes: boolean = false,
        public monsters: boolean = true,
        public battlemap: boolean = false,
        public overlay: boolean = false,
        public prefix: string = "!",
        public attach: string = "DM"
    ) { }

    save() {
        localStorage.setItem(node, JSON.stringify(this))
    }

    conflict(): boolean {
        return (this.multiline == true && (this.notes == false && (this.battlemap == true || this.overlay == true)))
    }

    static load(){
        const settings = JSON.parse(localStorage.getItem(node) || "{}")
        return new Settings(
            settings.multiline,
            settings.maptarget,
            settings.notes,
            settings.monsters,
            settings.battlemap,
            settings.overlay,
            settings.prefix,
            settings.attack
        )
    }
}