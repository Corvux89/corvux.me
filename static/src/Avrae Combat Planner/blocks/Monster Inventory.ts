import { Monster } from "../models/Monster.js";
import { getCommandString } from "../utils/commands.js";
import { buildInventoryContainer, buildMaddContainer, buildMaddHeader, buildMapPreview, extractIndex, getTokenShortcode, isValidHttpUrl, maddTable, monsterInventory } from "../utils/helpers.js";

export function setupMonsterInventory(): void{
    change_event()
    click_event()
}

function change_event(): void{
     monsterInventory.addEventListener("change", function(e){
        const target = event.target
        const index = extractIndex((target as Element).id)
        const node = (target as Element).id.replace(`-${index}`,"")
        const monsters = Monster.load()
        const monster = monsters[index - 1]
        const madd_nodes = ["label", "quantity", "size" , "color", "token", "name"]
    
        // Update Monster
        if (target instanceof HTMLInputElement){
            monster[node] = target.value
        } else if (target instanceof HTMLSelectElement){
            monster[node] = target.options[target.selectedIndex].value
        } else{
            return
        }
    
        monster.save()
    
        // Manage Inventory Rows 
        if (node.includes("name")) {
            let next_monster = monsters[index]
            
    
            if (next_monster == undefined && monster.name != "") {
                next_monster = new Monster(index + 1)
                next_monster.save()
                buildInventoryContainer()
            } else if (monster.name == "" && (next_monster && next_monster.name == "") && monster._index < monsters.length) {
                monsters.reverse().forEach(function (m) {
                    if (m.name == "" && m._index < monsters.length) {
                        m.remove()
                    }
                    buildInventoryContainer()
                })
            }
            const focusDom = document.getElementById(`label-${index}`)
            if (focusDom) { focusDom.focus() }
    
        } else if (node.includes("token")) {
            let helpDom = document.getElementById(`mTokenHelp${index}`)
            const tokenDom = target as HTMLInputElement
            if (isValidHttpUrl(monster.token)) {
                tokenDom.value = "loading..."
    
                getTokenShortcode(monster.token)
                    .then((token) => {
                        monster.token = ""
                        if (token !== null) {
                            tokenDom.value = token
                            monster.token = token
    
                            if (helpDom) {
                                helpDom.remove()
                            }
                        } else {
                            tokenDom.value = ""
                            const error = "Something went wrong with that image. Either OTFBM doesn't have access to the image, or it is malformed.<br>Try a different image URL please"
    
                            if (helpDom) {
                                helpDom.innerHTML = error
                            } else {
                                helpDom = document.createElement("small")
                                helpDom.id = `mTokenHelp${index}`
                                helpDom.classList.add('form-text', 'text-white-50')
                                helpDom.innerHTML = error
                                tokenDom.parentElement.append(helpDom)
                            }
                        }
                        monster.save()
                    })
            } else {
                if (helpDom) {
                    helpDom.remove()
                }
            }
        } else if (node.includes("quantity")) {
            monster.coords.length = monster.quantity
            monster.save()
        }
    
        if (madd_nodes.indexOf(node)) {
            const change_event = new Event("change")
            buildMaddContainer()
            maddTable.dispatchEvent(change_event)
        }
    })
}

function click_event(): void{
    monsterInventory.addEventListener('click', function (event) {
        const target = event.target as Element
        const index = extractIndex(target.id)
        const monsters = Monster.load()
        const monster = monsters[index - 1]
    
        if (monster) {
            if (target.id.includes('remove')) {
                if (index == monsters.length) {
                    $(`#remove-${index}`).tooltip({ title: "Cannot remove the last row.", delay: { show: 500, hide: 1500 } })
                    $(`#remove-${index}`).tooltip('show')
                } else {
                    monster.remove()
                    monsterInventoryRemoveEvent()
                }
            }
        }
    })
}

export function monsterInventoryRemoveEvent(): void{
    buildInventoryContainer()
    buildMaddContainer()
    buildMaddHeader()
    buildMapPreview()
    getCommandString()
}