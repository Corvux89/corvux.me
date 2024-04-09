import { loadAllMonsters } from '../models/Monster.js';
import { getMonsterMapCommand } from './commands.js';
export const monsterInventory = document.getElementById("monster-inventory");
export const maddTable = document.getElementById("madd-table");
export function buildInventoryContainer() {
    const monsters = loadAllMonsters();
    monsterInventory.innerHTML = "";
    monsters.forEach(function (monster) {
        monsterInventory.appendChild(monster.appendInventoryRow());
    });
}
export function buildMaddContainer() {
    const monsters = loadAllMonsters();
    maddTable.innerHTML = "";
    monsters.forEach(function (monster) {
        if (monster.name != "") {
            maddTable.appendChild(monster.appendMaddRow());
        }
    });
}
export function buildMaddHeader() {
    const madd_header = document.getElementById("madd-header");
    var out = getMonsterMapCommand();
    if (out) {
        madd_header.hidden = false;
    }
    else {
        madd_header.hidden = true;
    }
    document.getElementById("madd-command").innerHTML = out;
}
export function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    }
    catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}
export function getTokenShortcode(url) {
    return new Promise((resolve, reject) => {
        const base64 = btoa(url);
        const queryUrl = `https://token.otfbm.io/meta/${base64}`;
        const request = new XMLHttpRequest();
        request.open('POST', `${document.URL}shortcode`, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                const response = JSON.parse(request.responseText);
                const token = response.token;
                if (!token) {
                    resolve(null);
                }
                else {
                    resolve(token);
                }
            }
            else {
                resolve(null);
            }
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify({ "url": queryUrl }));
    });
}
