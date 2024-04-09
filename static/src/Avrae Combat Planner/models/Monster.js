const monsterInventory = document.getElementById("monster-inventory");
const node = "monsters";
class Monster {
    constructor(_index = 1, name = "", label = "", quantity = 1, size = "M", color = "r", token = "", args = "", coords = []) {
        this._index = _index;
        this.name = name;
        this.label = label;
        this.quantity = quantity;
        this.size = size;
        this.color = color;
        this.token = token;
        this.args = args;
        this.coords = coords;
    }
    getPrefix() {
        if (this.label) {
            return this.label;
        }
        else {
            const split = this.name.split(/\W+/);
            if (split.length == 1) {
                return this.name.slice(0, 2).toUpperCase();
            }
            return split.filter(word => word).map(word => word[0]).join('').toUpperCase();
        }
    }
    getCombatID(number) {
        return (this.getPrefix().includes("#") ? this.getPrefix().replace("#", `${number}`) : this.quantity > 1 ? `${this.getPrefix()}${number}` : this.getPrefix());
    }
    appendInventoryRow() {
        const monsterRow = document.createElement('div');
        monsterRow.classList.add('row', 'monster', 'border', 'rounded', 'bg-secondary', 'm-2');
        monsterRow.id = `monster-${this._index}`;
        monsterRow.innerHTML = `
            <div class="row mt-2">
                <div class="col-md-12 d-flex monHeader">
                    <h3>Monster ${this._index}</h3>
                    ${this._index == 1 ? "" : `<button type="button" id="remove-${this._index}" class="btn btn-close ms-auto"></button>`}
                </div>
            </div>
        `;
        return monsterRow;
    }
}
export function loadAllMonsters() {
    const monsterData = JSON.parse(localStorage.getItem(node) || "[]");
    const monsters = monsterData.map((data, index) => new Monster(index + 1, data.name, data.label, data.quantity, data.size, data.color, data.token, data.args, data.coords));
    if (monsters.length == 0 || monsters[monsters.length - 1].name != "") {
        monsters.push(new Monster(monsters.length + 1));
    }
    return monsters;
}
let monsters = loadAllMonsters();
let monster1 = monsters[0];
console.log(monsters);
monsters.forEach(function (monster) {
    monsterInventory.appendChild(monster.appendInventoryRow());
});
