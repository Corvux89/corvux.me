const saveNode = "SW5E_Weapon_Planner";
export class Field {
    constructor(name, key, pointValue = "0", points, desc, cost, costs, weight, weights, rangeMod, reloadMod, defValue, overrideValue, costCalc, weightCalc) {
        this.name = name;
        this.key = key;
        this.pointValue = pointValue;
        this.points = points;
        this.desc = desc;
        this.cost = cost;
        this.costs = costs;
        this.weight = weight;
        this.weights = weights;
        this.rangeMod = rangeMod;
        this.reloadMod = reloadMod;
        this.defValue = defValue;
        this.overrideValue = overrideValue;
        this.costCalc = costCalc;
        this.weightCalc = weightCalc;
    }
}
export class Note {
    constructor(title, text) {
        this.title = title;
        this.text = text;
    }
}
export class Weight {
    constructor(points, die, cost, weight, range, short, long, reload) {
        this.points = points;
        this.die = die;
        this.cost = cost;
        this.weight = weight;
        this.range = range;
        this.short = short;
        this.long = long;
        this.reload = reload;
    }
}
export class Tab {
    constructor(title, key, weight_headers, weights, notes, fields) {
        this.title = title;
        this.key = key;
        this.weight_headers = weight_headers;
        this.weights = weights;
        this.notes = notes;
        this.fields = fields;
    }
    addTab() {
        var tabButton = jQuery("<button>")
            .addClass("nav-link sw5ecalc")
            .attr({
            "id": `${this.key}-tab`,
            "data-bs-toggle": "tab",
            "data-bs-target": `#${this.key}-calc`,
            "type": "button",
            "role": "tab",
            "aria-controls": `${this.key}-calc`
        })
            .html(this.title);
        $("#sw5e-calc-tabs").append(tabButton);
        var notesButton = jQuery("<button>")
            .addClass("btn btn-primary m-2")
            .attr({
            "href": `#${this.key}-note-collapse`,
            "role": "button",
            "data-bs-toggle": "collapse"
        })
            .html("Notes");
        var baseValuesButton = jQuery("<button>")
            .addClass("btn btn-primary m-2")
            .attr({
            "href": `#${this.key}-base-collapse`,
            "role": "button",
            "data-bs-toggle": "collapse"
        })
            .html("Base Values");
        var exportButton = jQuery("<button>")
            .addClass("btn btn-primary m-2 export-weapon")
            .attr({
            "id": `${this.key}-export`,
            "type": "button",
            "data-key": this.key
        })
            .html("Export");
        var saveButton = jQuery("<button>")
            .addClass("btn btn-primary m-2 save-weapon")
            .attr({
            "id": `${this.key}-save`,
            "type": "button",
            "data-key": this.key
        })
            .html("Save Build");
        var loadButton = jQuery("<button>")
            .addClass("btn btn-info m-2 dropdown-toggle")
            .attr({
            "type": "button",
            "data-bs-toggle": "dropdown",
            "aria-expanded": "false",
            "id": `${this.key}-load`,
            "data-key": this.key
        })
            .prop("hidden", true)
            .html("Load Build");
        var loadList = jQuery("<ul>")
            .addClass("dropdown-menu")
            .attr({
            "id": `${this.key}-load-list`,
            "arial-labelledby": `${this.key}-load`
        });
        var loadDropdown = jQuery("<div>")
            .addClass("dropdown d-inline")
            .append(loadButton, loadList);
        var deleteButton = jQuery("<button>")
            .addClass("btn btn-danger delete-weapon m-2")
            .attr({
            "type": "button",
            "id": `${this.key}-delete`,
            "data-key": this.key
        })
            .prop("hidden", true)
            .html("Delete Weapon");
        var resetButton = jQuery("<button>")
            .addClass("btn btn-danger reset-weapon m-2")
            .attr({
            "type": "button",
            "id": `${this.key}-reset`,
            "data-key": this.key
        })
            .html("Reset Weapon");
        var notesTable = jQuery("<table>")
            .addClass("table table-bordered text-white");
        var notesTableBody = jQuery("<tbody>");
        this.notes.forEach(note => {
            let noteRow = jQuery("<tr>")
                .html(`
                <td>${note.title}</td>
                <td>${note.text}</td>
                `);
            notesTableBody.append(noteRow);
        });
        notesTable.append(notesTableBody);
        // Collapse tables
        var notesCollapse = jQuery("<div>")
            .addClass("collapse")
            .attr("id", `${this.key}-note-collapse`)
            .append(notesTable);
        var baseTableRow = jQuery("<tr>");
        Object.keys(this.weight_headers).filter(header => this.weight_headers[header] != undefined).forEach(header => {
            let baseHeader = jQuery("<th>")
                .html(this.weight_headers[header]);
            baseTableRow.append(baseHeader);
        });
        var baseTableHeader = jQuery("<thead>")
            .append(baseTableRow);
        var baseTable = jQuery("<table>")
            .append(baseTableHeader)
            .addClass("table table-bordered text-white");
        var baseTableBody = jQuery("<tbody>");
        this.weights.forEach(weight => {
            let row = jQuery("<tr>");
            Object.keys(this.weight_headers).filter(header => this.weight_headers[header] != undefined).forEach(header => {
                let cell = jQuery("<td>")
                    .html(header.toLowerCase().includes('range') ? `${weight.short}/${weight.long}` : weight[header]);
                row.append(cell);
            });
            baseTableBody.append(row);
        });
        baseTable.append(baseTableBody);
        var baseTableResponsive = jQuery("<div>")
            .addClass("table-responsive")
            .append(baseTable);
        var baseCollapse = jQuery("<div>")
            .addClass("collapse")
            .attr("id", `${this.key}-base-collapse`)
            .append(baseTableResponsive);
        var row1 = jQuery("<div>")
            .addClass("row")
            .append(notesCollapse, baseCollapse);
        var container = jQuery("<div>")
            .addClass("container m-2")
            .append(notesButton, baseValuesButton, exportButton, saveButton, loadDropdown, deleteButton, resetButton, row1);
        var pane = jQuery("<div>")
            .addClass("tab-pane fade")
            .attr({
            "id": `${this.key}-calc`,
            "role": "tabpanel",
            "aria-labelledby": `${this.key}-tab`,
            "tabindex": "0"
        })
            .append(container);
        // Inputs and properties
        var weaponName = jQuery("<input>")
            .addClass("form-control")
            .attr({
            "type": "text",
            "id": `${this.key}-name`,
            "name": "name",
            "placeholder": "Weapon Name"
        });
        var weaponNameLabel = jQuery("<label>")
            .addClass("ms-2")
            .attr("for", `${this.key}-name`)
            .html("Weapon Name");
        var nameDiv = jQuery("<div>")
            .addClass("form-floating")
            .append(weaponName, weaponNameLabel);
        var nameRow = jQuery("<div>")
            .addClass("row m-2")
            .append(nameDiv);
        var form = jQuery("<div>")
            .attr({
            "id": `${this.key}-calc-form`,
            "data-key": this.key
        })
            .addClass("weapon-form")
            .append(nameRow);
        var mainTable = jQuery("<table>")
            .addClass("table table-bordered text-white text-nowrap")
            .html(`
            <thead>
                <tr>
                    <th class="align-text-top">
                        <h5>Property</h5>
                        <small class="form-text text-muted text-wrap">Click property names for more info</small><br>
                    </th>
                    <th class="align-text-top">
                        <h5>Selection</h5>
                    </th>
                </tr>
            </thead>
            `);
        var mainBody = jQuery("<tbody>");
        this.fields.forEach(field => {
            let cell1 = jQuery("<td>")
                .addClass(`align-text-top ${this.key}-${field.key}`);
            let name = jQuery("<h5>")
                .html(`
                ${field.desc
                ? `<a href="" class="popover-link text-white" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-content="${field.desc}" data-placement="right">${field.name}</a>`
                : field.name}
                `);
            cell1.append(name);
            if (field.pointValue) {
                let pointSmall = jQuery("<small>")
                    .addClass("form-text text-muted")
                    .html(`
                    <p class="m-0">
                        Point Value: ${field.pointValue}
                    </p>
                    `);
                cell1.append(pointSmall);
            }
            if (field.cost) {
                let costSmall = jQuery("<small>")
                    .addClass("form-text text-muted")
                    .html(`
                    <p class="m-0">
                        Cost Adjustment: ${field.cost}
                    </p>
                    `);
                cell1.append(costSmall);
            }
            if (field.weight) {
                let weightSmall = jQuery("<small>")
                    .addClass("form-text text-muted")
                    .html(`
                    <p class="m-0">
                        Weight Adjustment: ${field.weight}
                    </p>
                    `);
                cell1.append(weightSmall);
            }
            let select = jQuery("<select>")
                .addClass("form-select")
                .attr({
                "id": `${this.key}-${field.key}`,
                "name": `${field.key}`,
                "data-tab": this.key,
                "aria-label": `${this.key}-${field.key}`
            });
            field.points.forEach(point => {
                let option = jQuery("<option>")
                    .html(point)
                    .prop("selected", field.defValue == Number(point));
                select.append(option);
            });
            let cell2 = jQuery("<td>")
                .addClass(`${this.key}-${field.key}`)
                .append(select);
            let row = jQuery("<tr>")
                .append(cell1, cell2);
            mainBody.append(row);
        });
        mainTable.append(mainBody);
        var responsiveTable = jQuery("<div>")
            .addClass("table-responsive m-2")
            .append(mainTable);
        form.append(responsiveTable);
        var col1 = jQuery("<div>")
            .addClass("col")
            .append(form);
        const defaultWeight = this.weights.find(weight => weight.points = "default");
        var summaryRow = jQuery("<tr>")
            .attr("id", `${this.key}-summary-row`)
            .html(`
            <td>Total:</td>
            <td>
                <p id="${this.key}-point-total" class="d-inline">0</p>
            </td>
            `);
        var damageRow = jQuery("<tr>")
            .html(`
            <td>Damage Die:</td>
            <td>
                <p id="${this.key}-damage-die-final" class="d-inline">${defaultWeight.die}</p>
            </td>
            `);
        var costRow = jQuery("<tr>")
            .html(`
            <td>Cost:</td>
            <td>
                <p id="${this.key}-cost-total" class="d-inline">${defaultWeight.cost}</p>
            </td>
            `);
        var weightRow = jQuery("<tr>")
            .html(`
            <td>Weight:</td>
            <td>
                <p id="${this.key}-weight-total" class="d-inline">${defaultWeight.weight}</p> lbs
            </td>
            `);
        var totalTableBody = jQuery("<tbody>")
            .append(summaryRow, damageRow, costRow, weightRow);
        if (this.weight_headers.reload) {
            let reloadRow = jQuery("<tr>")
                .html(`
                <td>Reload:</td>
                <td>
                    <p id="${this.key}-reload-final" class="d-inline">${defaultWeight.reload}</p>
                </td>
                `);
            totalTableBody.append(reloadRow);
        }
        let rangeRow = jQuery("<tr>")
            .html(`
                <td>Min/Max ${this.weight_headers.range.toLowerCase().includes("thrown") ? 'Thrown ' : ''}Range</td>
                <td>
                    <p id="${this.key}-short-range-final" class="d-inline">${defaultWeight.short}</p> / <p id="${this.key}-long-range-final" class="d-inline m-0 p-0">${defaultWeight.long}</p> ft
                </td>
            `);
        totalTableBody.append(rangeRow);
        var totalTable = jQuery("<table>")
            .addClass("table table-sm table-borderless text-white w-50")
            .attr("align", "right")
            .append(totalTableBody);
        var totalCard = jQuery("<div>")
            .addClass("card bg-dark sticky-top border")
            .append(totalTable);
        var col2 = jQuery("<div>")
            .addClass("col text-nowrap mt-2")
            .append(totalCard);
        var row2 = jQuery("<row>")
            .addClass("row mt-2")
            .append(col1, col2);
        container.append(row2);
        pane.append(container);
        $("#sw5e-calc-content").append(pane);
    }
    resetTab() {
        $(`#${this.key}-name`).val("");
        this.fields.forEach(f => {
            let defaultValue = f.defValue != undefined ? f.defValue : f.points[0];
            $(`#${this.key}-${f.key} option`).each(function () {
                $(this).prop("selected", $(this).val() == defaultValue);
            });
        });
    }
}
export class Calculation {
    constructor(total = 0, cost = 0, weight = 0, die = "", short = "", long = "", reload = "", point_mod = 1, range_mod = 1, reload_mod = 0, costExpression = "", weightExpression = "") {
        this.total = total;
        this.cost = cost;
        this.weight = weight;
        this.die = die;
        this.short = short;
        this.long = long;
        this.reload = reload;
        this.point_mod = point_mod;
        this.range_mod = range_mod;
        this.reload_mod = reload_mod;
        this.costExpression = costExpression;
        this.weightExpression = weightExpression;
    }
    static update(form, tabs) {
        var calc = new Calculation();
        const tab = tabs.find((tab) => tab.key == form.data("key"));
        form.find("select").each(function () {
            let target = $(this);
            let field = tab.fields.find((field) => field.key == target.attr("name"));
            let selectedIndex = target.prop("selectedIndex");
            // Sums
            calc.total += field.overrideValue ? field.overrideValue[selectedIndex] * calc.point_mod || 0 : Number(field.points[selectedIndex]) * calc.point_mod || 0;
            calc.cost += field.costs ? field.costs[selectedIndex] || 0 : selectedIndex * field.cost || 0;
            calc.weight += field.weights ? Number(field.weights[selectedIndex]) || 0 : selectedIndex * Number(field.weight) || 0;
            calc.range_mod += field.rangeMod ? Number(field.rangeMod[selectedIndex]) || 0 : 0;
            calc.reload_mod += field.reloadMod ? Number(field.reloadMod[selectedIndex]) || 0 : 0;
            calc.costExpression = field.costCalc ? field.costCalc[selectedIndex] || "" : calc.costExpression;
            calc.weightExpression = field.weightCalc ? field.weightCalc[selectedIndex] || "" : calc.weightExpression;
            // Visual Indicator
            $(`.${tab.key}-${field.key}`).each(function () {
                let defaultValue = field.defValue != undefined ? field.defValue : Number(field.points[0]);
                defaultValue !== Number(target.find(":selected").val()) ? $(this).addClass("bg-secondary") : $(this).removeClass("bg-secondary");
            });
        });
        var adjustment = Math.ceil(calc.total);
        // Weight Checking
        tab.weights.some((weight, index) => {
            let points = Number(weight.points);
            if (!isNaN(points) && adjustment >= points && ((weight == tab.weights.at(-1)) || adjustment < Number(tab.weights[tab.weights.indexOf(weight) + 1].points))) {
                calc.cost += Number(weight.cost) || 0;
                calc.weight += Number(weight.weight) || 0;
                calc.short = String(Number(weight.short) * Number(calc.range_mod));
                calc.long = (String(Number(weight.long) * Number(calc.range_mod)));
                calc.reload = String(Number(weight.reload) + calc.reload_mod);
                calc.die = weight.die;
                return;
            }
        });
        // Expressions
        // @ts-ignore
        if (calc.costExpression)
            calc.cost = math.evaluate(calc.costExpression.replace("x", calc.cost.toString()));
        // @ts-ignore
        if (calc.weightExpression)
            calc.weight = math.evaluate(calc.weightExpression.replace("x", calc.weight.toString()));
        // Validation
        if (calc.total > Number(tab.weights.at(-1).points) || adjustment <= -1) {
            calc.die = "Invalid Weapon";
            $(`#${tab.key}-summary-row`).addClass("bg-danger");
        }
        else
            $(`#${tab.key}-summary-row`).removeClass("bg-danger");
        // Show it!
        $(`#${tab.key}-point-total`).html(calc.total.toString());
        $(`#${tab.key}-damage-die-final`).html(calc.die);
        $(`#${tab.key}-cost-total`).html(calc.cost.toString());
        $(`#${tab.key}-weight-total`).html(calc.weight.toString());
        $(`#${tab.key}-short-range-final`).html(calc.short);
        $(`#${tab.key}-long-range-final`).html(calc.long);
        $(`#${tab.key}-reload-final`).html(calc.reload);
        return calc;
    }
}
export class Weapon {
    constructor(key, name, fields = {}) {
        this.key = key;
        this.name = name;
        this.fields = fields;
    }
    static pull(form, tabs) {
        const tab = tabs.find((tab) => tab.key == form.data("key"));
        var fields = {};
        tab.fields.forEach(field => {
            fields[field.key] = $(`#${tab.key}-${field.key}`).find(":selected").val().toString();
        });
        return new Weapon(form.data("key"), $(`#${form.data("key")}-name`).val().toString(), fields);
    }
    push() {
        $(`#${this.key}-name`).val(this.name);
        for (let [key, value] of Object.entries(this.fields)) {
            $(`#${this.key}-${key} option`).each(function () {
                $(this).prop("selected", $(this).val() == value);
            });
        }
    }
    static load(key) {
        const data = JSON.parse(localStorage.getItem(saveNode) || "{}");
        const weapon = data[key];
        if (!weapon)
            return;
        return new Weapon(weapon.key, weapon.name, weapon.fields);
    }
    save() {
        var data = JSON.parse(localStorage.getItem(saveNode) || "{}");
        data[this.key] = this;
        localStorage.setItem(saveNode, JSON.stringify(data));
    }
}
export class SavedBuilds {
    constructor(key, weapons) {
        this.key = key;
        this.weapons = weapons;
    }
    static load(key) {
        const data = JSON.parse(localStorage.getItem(saveNode) || "{}");
        if ("saves" in data) {
            var saves = data["saves"].map(s => new SavedBuilds(s.key, s.weapons.map(w => new Weapon(w.key, w.name, w.fields))));
            var save = saves.find(s => s.key == key) || new SavedBuilds(key, []);
            return save;
        }
        return new SavedBuilds(key, []);
    }
    save() {
        const data = JSON.parse(localStorage.getItem(saveNode) || "{}");
        if (!("saves" in data)) {
            data["saves"] = [];
        }
        const index = data.saves.findIndex(s => s.key == this.key);
        if (index !== -1) {
            data.saves.splice(index, 1);
        }
        data.saves.push(this);
        localStorage.setItem(saveNode, JSON.stringify(data));
    }
}
