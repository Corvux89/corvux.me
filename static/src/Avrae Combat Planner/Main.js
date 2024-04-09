import { Monster, loadAllMonsters, importMonsters } from './models/Monster.js';
import { buildInventoryContainer, monsterInventory, isValidHttpUrl, getTokenShortcode, buildMaddContainer, maddTable, buildMaddHeader } from './utils/helpers.js';
const extractIndex = (str) => { const match = str.match(/-(\d+)/); return match ? parseInt(match[1], 10) : null; };
// Initial Setup
importMonsters();
buildInventoryContainer();
buildMaddContainer();
buildMaddHeader();
window.history.replaceState({}, document.title, window.location.pathname);
// Monster Inventory Event Delegate
monsterInventory.addEventListener('change', function (event) {
    const target = event.target;
    const index = extractIndex(target.id);
    const node = target.id.replace(`-${index}`, "");
    const monsters = loadAllMonsters();
    const monster = monsters[index - 1];
    const madd_nodes = ["label", "quantity", "size", "color", "token", "name"];
    // Update Monster
    if (target instanceof HTMLInputElement) {
        monster[node] = target.value;
    }
    else if (target instanceof HTMLSelectElement) {
        monster[node] = target.options[target.selectedIndex].value;
    }
    else {
        return;
    }
    monster.save();
    // Manage Inventory Rows 
    if (node.includes("name")) {
        var next_monster = monsters[index];
        if (next_monster == undefined && monster.name != "") {
            next_monster = new Monster(index + 1);
            next_monster.save();
            buildInventoryContainer();
        }
        else if (monster.name == "" && (next_monster && next_monster.name == "") && monster._index < monsters.length) {
            monsters.reverse().forEach(function (m) {
                if (m.name == "" && m._index < monsters.length) {
                    m.remove();
                }
                buildInventoryContainer();
            });
        }
        const nameDom = document.getElementById(`name-${index}`);
        if (nameDom) {
            nameDom.focus();
        }
    }
    else if (node.includes("token")) {
        var helpDom = document.getElementById(`mTokenHelp${index}`);
        const tokenDom = target;
        if (isValidHttpUrl(monster.token)) {
            tokenDom.value = "loading...";
            getTokenShortcode(monster.token)
                .then((token) => {
                monster.token = "";
                if (token !== null) {
                    tokenDom.value = token;
                    monster.token = token;
                    if (helpDom) {
                        helpDom.remove();
                    }
                }
                else {
                    tokenDom.value = "";
                    const error = "Something went wrong with that image. Either OTFBM doesn't have access to the image, or it is malformed.<br>Try a different image URL please";
                    if (helpDom) {
                        helpDom.innerHTML = error;
                    }
                    else {
                        helpDom = document.createElement("small");
                        helpDom.id = `mTokenHelp${index}`;
                        helpDom.classList.add('form-text', 'text-white-50');
                        helpDom.innerHTML = error;
                        tokenDom.parentElement.append(helpDom);
                    }
                }
                monster.save();
            });
        }
        else {
            if (helpDom) {
                helpDom.remove();
            }
        }
    }
    else if (node.includes("quantity")) {
        monster.coords.length = monster.quantity;
        monster.save();
    }
    if (madd_nodes.indexOf(node)) {
        const change_event = new Event("change");
        buildMaddContainer();
        maddTable.dispatchEvent(change_event);
    }
});
monsterInventory.addEventListener('click', function (event) {
    const target = event.target;
    const index = extractIndex(target.id);
    const monsters = loadAllMonsters();
    const monster = monsters[index - 1];
    if (monster) {
        if (target.id.includes('remove')) {
            monster.remove();
            buildInventoryContainer();
            buildMaddContainer();
        }
    }
});
// MADD Container Event Delegate
maddTable.addEventListener("change", function (event) {
    const target = event.target;
    const numbers = target.id.match(/\d+/g);
    if (numbers) {
        const index = parseInt(numbers[0]);
        const coordIndex = parseInt(numbers[1]);
        const monsters = loadAllMonsters();
        const monster = monsters[index - 1];
        monster.coords[coordIndex - 1] = target.value;
        monster.save();
    }
    buildMaddHeader();
});
