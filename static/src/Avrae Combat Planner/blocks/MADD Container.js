import { Monster } from "../models/Monster.js";
import { buildMaddHeader, buildMapPreview, extractIndex, maddTable } from "../utils/helpers.js";
export function setupMADDContainer() {
    change_event();
    click_event();
}
function change_event() {
    maddTable.addEventListener("change", function (event) {
        const target = event.target;
        const numbers = target.id.match(/\d+/g);
        if (numbers) {
            const index = parseInt(numbers[0]);
            const coordIndex = parseInt(numbers[1]);
            const monsters = Monster.load();
            const monster = monsters[index - 1];
            monster.coords[coordIndex - 1] = target.value;
            monster.save();
        }
        maddUpdateEvent();
    });
}
function click_event() {
    maddTable.addEventListener("click", function (event) {
        const target = event.target;
        const index = extractIndex(target.id);
        const monsters = Monster.load();
        const monster = monsters[index - 1];
        if (target.id.split('-').indexOf("clear") != -1) {
            monster.getMaddRow().querySelectorAll("input").forEach(input => {
                input.value = "";
            });
            monster.coords = [];
            monster.coords.length = monster.quantity;
            monster.save();
            buildMaddHeader();
            buildMapPreview();
        }
    });
}
export function maddUpdateEvent() {
    buildMaddHeader();
    buildMapPreview();
}
