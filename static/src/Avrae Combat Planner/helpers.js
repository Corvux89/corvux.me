import { loadAllMonsters } from './models/Monster.js';
const monsterInventory = document.getElementById("monster-inventory");
export function buildInventoryContainer() {
    const monsters = loadAllMonsters();
    monsterInventory.innerHTML = "";
    monsters.forEach(function (monster) {
        monsterInventory.appendChild(monster.appendInventoryRow());
    });
}
