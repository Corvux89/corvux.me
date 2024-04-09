import { Monster, loadAllMonsters, importMonsters } from '../models/Monster.js'

export function getMonsterMapCommand() {
    const monsters = loadAllMonsters()
    //var settings = PlannerSettings.load()
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
        // return `${settings.prefix}map ${coords.join(" ")}`
        return `!map ${coords.join(" ")}`
    }
    return ""
}