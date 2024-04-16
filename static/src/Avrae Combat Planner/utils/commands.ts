import { Monster } from '../models/Monster.js'
import { Settings } from '../models/Settings.js'
import { BattleMap } from '../models/Battlemap.js'

export function getMonsterMapCommand() {
    const monsters = Monster.load()
    var settings = Settings.load()
    const coords = []

    monsters.forEach(monster => {
        if (monster.name != "" && monster.quantity > 0) {
            for (var i = 0; i < monster.quantity; i++) {
                if (monster.coords[i] != null && monster.coords[i] != "") {
                    var str = ` -t "${monster.getCombatID(i + 1)}|`
                    str += monster.coords[i] + "|"
                    str += monster.size + "|"
                    str += monster.color
                    str += monster.token ? `|\$${monster.token}` : ""
                    str += `"`
                    coords.push(str)
                } 
            }
        }
    })

    if (coords.length > 0) {
        return `${settings.prefix}map ${coords.join(" ")}`
    }
    return ""
}

export function getMonsterMaddCommand() {
    const monsters = Monster.load()
    const settings = Settings.load()
    const commands: string[] = []

    monsters.forEach(monster => {
        var coords: string[] = []
        if (monster.name != "" && monster.quantity > 0) {
            if (settings.notes == true) {
                var note = ""

                if (monster.coords.filter(x => x != null && x != "").length > 0) {
                    for (var i = 0; i < monster.quantity; i++) {
                        var note_str = []
                        if (monster.token) { note_str.push(`Token: ${monster.token}`) }
                        if (monster.coords[i]) { note_str.push(`Location: ${monster.coords[i]}`) }
                        if (monster.size) { note_str.push(`Size: ${monster.size}`) }
                        if (monster.color) { note_str.push(`Color: ${monster.color}`) }
                        note = note_str.join(" | ")

                        var str = `${settings.prefix}i madd "${monster.name}"`
                        str += monster.label ? ` -name "${monster.label}"` : ""
                        str += note ? ` -note "${note}"` : ""
                        str += monster.args ? ` ${monster.args}` : ""
                        commands.push(str)
                    }
                } else {
                    var note_str = []
                    if (monster.token) { note_str.push(`Token: ${monster.token}`) }
                    if (monster.size) { note_str.push(`Size: ${monster.size}`) }
                    if (monster.color) { note_str.push(`Color: ${monster.color}`) }
                    note = note_str.join(" | ")
                    var str = `${settings.prefix}i madd "${monster.name}"`
                    str += monster.label ? ` -name "${monster.label}"` : ""
                    str += note ? ` -note "${note}"` : ""
                    str += monster.args ? ` ${monster.args}` : ""
                    commands.push(str)
                }
            } else {
                var str = `${settings.prefix}i madd "${monster.name}"`
                str += monster.quantity > 1 ? ` -n ${monster.quantity}` : ""
                str += monster.label ? ` -name "${monster.label}"` : ""
                str += monster.args ? ` ${monster.args}` : ""
                commands.push(str)
            }
        }
    })

    return commands
}

export function getMapCommand(mapOnly: boolean = false) {
    const settings = Settings.load()
    const battlemap = BattleMap.load()
    var str: string = ""
    var commands: string[] = []

    if (battlemap.url || battlemap.size) {
        if (settings.notes == true && mapOnly == false) {
            str = `${settings.prefix}i effect ${settings.attach} map -attack "||Size: `
            str += battlemap.size ? battlemap.size : "10x10"
            str += battlemap.url ? ` ~ Background: ${battlemap.url}` : ''
            str += battlemap.csettings ? ` ~ Options: c${battlemap.csettings}` : ""
            str += `"`
        } else {
            var settingStr = battlemap.csettings ? `c${battlemap.csettings}` : ""

            str = `${settings.prefix}map`
            str += battlemap.url ? ` -bg "${battlemap.url}"` : ""
            str += battlemap.size ? ` -mapsize ${battlemap.size}` : ""
            str += settingStr != "" ? ` -options ${settingStr}` : ""
            str += settings.attach ? ` -t ${settings.attach}` : ""
            if (settings.monsters == true && mapOnly == false) {
                var monStr = getMonsterMapCommand()
                if (monStr) { commands.push(monStr) }
            }
        }
    }
    commands.push(str)
    return commands
}

export function getOverlayCommand(mapOnly = false) {
    const settings = Settings.load()
    const battlemap = BattleMap.load()
    const overlay = battlemap.overlay
    var str = ""

    switch (overlay.type) {
        case "circle":
            if (overlay.radius && overlay.color && overlay.center) {
                var nodes = [overlay.radius, overlay.color, overlay.center]
                if (settings.notes == true && mapOnly == false) {
                    str = "Overlay: c"
                    str += nodes.join("")
                } else {
                    str = `${settings.prefix}map -over circle,`
                    str += nodes.join(",")
                }
            }
            break

        case "cone":
            if (overlay.size && overlay.start && overlay.end && overlay.color) {
                var nodes = [overlay.size, overlay.color, overlay.start, overlay.end]
                if (settings.notes == true && mapOnly == false) {
                    str = "Overlay: t"
                    str += nodes.join("")
                } else {
                    str = `${settings.prefix}map -over cone,`
                    str += nodes.join(",")
                }
            }
            break

        case "line":
            if (overlay.start && overlay.end && overlay.length && overlay.width && overlay.color) {
                var nodes = [overlay.length, overlay.width, overlay.color, overlay.start, overlay.end]
                if (settings.notes == true && mapOnly == false) {
                    str = "Overlay: l"
                    str += nodes.join("")
                } else {
                    str = `${settings.prefix}map -over line,`
                    str += nodes.join(",")
                }
            }
            break

        case "square":
            if (overlay.size && overlay.color && overlay.topleft) {
                var nodes = [overlay.size, overlay.color, overlay.topleft]
                if (settings.notes == true && mapOnly == false) {
                    str = "Overlay: s"
                    str += nodes.join("")
                } else {
                    str = `${settings.prefix}map -over square,`
                    str += nodes.join(",")
                }
            }
            break
    }

    if (str.length > 0) {
        if (settings.notes == true && mapOnly == false) {
            str = `${settings.prefix}i note ${overlay.target ? overlay.target : settings.attach} ${str}`
        } else {
            str += overlay.target ? ` -t ${overlay.target}` : ""
        }
    }

    return str
}

export function getCommandString() {
    const settings = Settings.load()
    const commandStr = document.getElementById("commandStr")
    const avraeCommand = document.getElementById("avrae-command")
    var commands = []

    if (settings.maptarget == true) {
        commands.unshift(`${settings.prefix}i add 20 ${settings.attach} -p`)
    }

    if (settings.multiline == true) {
        commands.unshift(`${settings.prefix}multiline`)
    }

    if (settings.monsters == true) {
        commands = commands.concat(getMonsterMaddCommand())
    }

    if (settings.battlemap == true) {
        commands  = commands.concat(getMapCommand())
    }

    if (settings.overlay == true) {
        commands.push(getOverlayCommand())
    }

    const out = commands.join("<br>")

    commandStr.hidden = out.length > 0 ? false : true

    avraeCommand.innerHTML = out
}
