import { Field, Note, SavedBuilds, Tab, Weapon, Weight } from "./types.js"

export function getTabs(): Promise<Tab[]>{
    return fetch(`${window.location.href.replace("#/","")}api/fields`)
    .then(res => res.json())
    .then(res => {
        return res.map(item => new Tab(
            item.title,
            item.key,
            new Weight(
                item.weight_headers.points,
                item.weight_headers.die,
                item.weight_headers.cost,
                item.weight_headers.weight,
                item.weight_headers.range,
                item.weight_headers.short,
                item.weight_headers.long,
                item.weight_headers.reload
            ),
            item.weights.map((w: any) => new Weight(
                w.points,
                w.die,
                w.cost,
                w.weight,
                w.range,
                w.short,
                w.long,
                w.reload
            )),
            item.notes.map((n: any) => new Note(
                n.title,
                n.text
            )),
            item.fields.map((f: any) => new Field(
                f.name,
                f.key,
                f.pointValue,
                f.points,
                f.desc,
                f.cost,
                f.costs,
                f.weight,
                f.weights,
                f.rangeMod,
                f.reloadMod,
                f.defValue,
                f.overrideValue,
                f.costCalc,
                f.weightCalc
            ))
        ))
    })
}

export function buildSaveList(key: string): void{
    const saves = SavedBuilds.load(key)
    $(`#${key}-load-list`).empty()
    $(`#${key}-load`).prop("hidden", saves.weapons.length == 0)
    $(`#${key}-delete`).prop("hidden", saves.weapons.length == 0)

    saves.weapons.forEach(weapon => {
        var link = jQuery("<a>")
        .addClass("dropdown-item load-weapon")
        .attr({
            "data-key": key
        })
        .html(weapon.name)

        var listItem = jQuery("<li>")
        .append(link)

        $(`#${key}-load-list`).append(listItem)
    })
}
