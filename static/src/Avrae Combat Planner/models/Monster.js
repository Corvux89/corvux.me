const node = "monsters";
export class Monster {
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
            <div class="row m-2">
                        <div class="col-sm mb-3">
                            <div class="form-floating">
                                <input type="text" class="form-control" id="name-${this._index}" name="monsterName"
                                       placeholder="Monster Name" value="${this.name}">
                                <label for="name-${this._index}">Monster Name</label>
                            </div>
                        </div>
                        <div class="col-sm-2 mb-3">
                            <div class="form-floating">
                                <input type="text" class="form-control" id="label-${this._index}" name="monsterLabel"
                                       placeholder="Label" value="${this.label}">
                                <label for="label-${this._index}">Label</label>
                            </div>
                        </div>
                        <div class="col-sm-2 mb-3">
                            <div class="form-floating">
                                <input type="number" class="form-control" id="quantity-${this._index}" name="monsterQuantity" max="20"
                                       min="0" value="${this.quantity}">
                                <label for="quantity-${this._index}">Quantity</label>
                            </div>
                        </div>
                        <div class="col-sm-3 mb-3">
                            <div class="form-floating">
                                <select class="form-select" aria-label="Monster Size" id="size-${this._index}" name="monsterSize">
                                    <option value="T" ${this.size == "T" ? 'selected' : ""}>Tiny</option>
                                    <option value="S" ${this.size == "S" ? 'selected' : ""}>Small</option>
                                    <option value="M" ${this.size == "M" ? 'selected' : ""}>Medium</option>
                                    <option value="L" ${this.size == "L" ? 'selected' : ""}>Large</option>
                                    <option value="H" ${this.size == "H" ? 'selected' : ""}>Huge</option>
                                    <option value="G" ${this.size == "G" ? 'selected' : ""}>Gargantuan</option>
                                </select>
                                <label for="size-${this._index}">Size</label>
                            </div>
                        </div>
                        <div class="col-sm-2 mb-3">
                            <div class="form-floating">
                                <select class="form-select" aria-label="Token Color" id="color-${this._index}" name="monsterColor">
                                    <option value="r" ${this.color == "r" ? 'selected' : ""}>Red</option>
                                    <option value="w" ${this.color == "w" ? 'selected' : ""}>White</option>
                                    <option value="gy" ${this.color == "gy" ? 'selected' : ""}>Grey</option>
                                    <option value="g" ${this.color == "g" ? 'selected' : ""}>Green</option>
                                    <option value="y" ${this.color == "y" ? 'selected' : ""}>Yellow</option>
                                    <option value="pk" ${this.color == "pk" ? 'selected' : ""}>Pink</option>
                                    <option value="bn" ${this.color == "bn" ? 'selected' : ""}>Brown</option>
                                    <option value="bk" ${this.color == "bk" ? 'selected' : ""}>Black</option>
                                    <option value="b" ${this.color == "b" ? 'selected' : ""}>Blue</option>
                                    <option value="p" ${this.color == "p" ? 'selected' : ""}>Purple</option>
                                    <option value="c" ${this.color == "c" ? 'selected' : ""}>Cyan</option>
                                    <option value="o" ${this.color == "o" ? 'selected' : ""}>Orange</option>
                                </select>
                                <label for="color-${this._index}">Token Color</label>
                            </div>
                        </div>
                    </div>
                    <div class="row m-2">
                        <div class="col-sm-4 mb-3">
                            <div class="form-floating">
                                <input type="text" class="form-control" id="token-${this._index}" value="${this.token}" name="monsterToken" placeholder="Token Shortcode/URL">
                                <label for="token-${this._index}">Token Shortcode/URL</label>
                            </div>
                        </div>
                        <div class="col-sm mb-3">
                            <div class="form-floating">
                                <input type="text" class="form-control" id="args-${this._index}" name="monsterArgs"
                                       placeholder="Additional Arguments" value="${this.args.replace(/"/g, '&quot;')}">
                                <label for="args-${this._index}">Additional Arguments</label>
                            </div>
                        </div>
                    </div>
        `;
        return monsterRow;
    }
    getInventoryRow() {
        return document.getElementById(`monster-${this._index}`);
    }
    appendMaddRow() {
        if (this.name == "") {
            return;
        }
        const maddRow = document.createElement("div");
        maddRow.id = `madd-${this._index}`;
        maddRow.classList.add('row', 'm-2', 'border', 'rounded', 'monGroup', 'bg-secondary');
        // Header
        const h_row = document.createElement("div");
        h_row.classList.add('row', 'mt-2');
        const h_col = document.createElement("div");
        h_col.classList.add('col-md-12', 'd-flex', 'monHeader');
        const h3 = document.createElement("h3");
        h3.innerHTML = this.name;
        h_col.appendChild(h3);
        h_row.appendChild(h_col);
        maddRow.appendChild(h_row);
        // Monster Fields
        for (var i = 0; i < this.quantity; i++) {
            var cInput = document.createElement('input');
            cInput.type = "text";
            cInput.classList.add('form-control');
            cInput.id = `monster-postition${this._index}-${i + 1}`;
            cInput.name = `monster-position`;
            cInput.placeholder = this.getCombatID(i + 1);
            cInput.value = this && this.coords && this.coords[i] ? this.coords[i] : "";
            var cLabel = document.createElement("label");
            cLabel.setAttribute("for", cInput.id);
            cLabel.innerHTML = cInput.placeholder;
            var form = document.createElement("div");
            form.classList.add('form-floating');
            form.appendChild(cInput);
            form.appendChild(cLabel);
            var col = document.createElement("div");
            col.classList.add('col-sm-3', 'mb-3', 'monPos');
            col.appendChild(form);
            maddRow.appendChild(col);
        }
        // Footer Row
        const f_row = document.createElement("div");
        f_row.classList.add('row', 'mt-2');
        var f_col = document.createElement('div');
        f_col.classList.add('col', 'mb-3');
        // Button
        var button = document.createElement("button");
        button.type = "button";
        button.id = `madd-clear-${this._index}`;
        button.classList.add('btn', 'btn-light', 'float-end');
        button.innerHTML = "Clear";
        f_col.appendChild(button);
        f_row.appendChild(f_col);
        maddRow.appendChild(f_row);
        return maddRow;
    }
    save() {
        const monsters = loadAllMonsters();
        monsters[this._index - 1] = this;
        localStorage.setItem(node, JSON.stringify(monsters));
    }
    remove() {
        const monsters = loadAllMonsters();
        monsters.splice(this._index - 1, 1);
        localStorage.setItem(node, JSON.stringify(monsters));
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
export function importMonsters() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    if (encodedData) {
        const data = decodeURIComponent(encodedData);
        try {
            const parsedData = JSON.parse(data);
            localStorage.setItem(node, JSON.stringify(parsedData.monsters));
        }
        catch (error) {
            console.error("Error parsong monster data: ", error);
        }
    }
}
