import { Calculation, SavedBuilds, Weapon } from "./types.js";
import { buildSaveList, getTabs } from "./utils.js";

const urlData = new URLSearchParams(window.location.search).get("data")
window.history.replaceState({}, document.title, window.location.pathname)

if (urlData){
    const weaponData = decodeURIComponent(urlData)
    try {
        var parsedData = JSON.parse(weaponData)
        new Weapon(parsedData.key, parsedData.name, parsedData.fields).save()
    } catch (error){
        console.error("Error parsing data: ", error)
    }

}


getTabs()
.then(tabs => {
    globalThis.tabs = tabs
    tabs.forEach(tab => {
        const weapon = Weapon.load(tab.key)

        tab.addTab()
        buildSaveList(tab.key)
        if (weapon) weapon.push()
        Calculation.update($(`#${tab.key}-calc-form`), tabs)
    })

    $('[data-bs-toggle="popover"]').each((_, trigger) => {
        // @ts-ignore
        new bootstrap.Popover(trigger)
    })

    $(".sw5ecalc:first").tab("show")

})

$(document).on("change", ".weapon-form", function() {
    const form = $(this)
    Calculation.update(form, globalThis.tabs)
    Weapon.pull(form, globalThis.tabs).save()
})

$(document).on("click", ".reset-weapon", function() {
    const key = $(this).data("key")
    const tab = globalThis.tabs.find(tab => tab.key == key)
    const form = $(`#${tab.key}-calc-form`)

    tab.resetTab()
    Weapon.pull(form, globalThis.tabs).save()
    Calculation.update(form, globalThis.tabs)
})

$(document).on("click", ".save-weapon", function() {
    const key = $(this).data("key")
    const form = $(`#${key}-calc-form`)
    var builds = SavedBuilds.load(key)
    const weapon = Weapon.pull(form, globalThis.tabs)

    // Convert these to toasts eventually
    if (!weapon.name){
        return alert("Must name the weapon first")
    } else if (builds.weapons.length >= 10){
        return alert("Only allowed 10 weapons of each type at this time")
    }

    const index = builds.weapons.findIndex(w => w.name == weapon.name)

    if (index !== -1){
        builds.weapons.splice(index, 1)
    }

    builds.weapons.push(weapon)
    builds.save()
    buildSaveList(key)
})

$(document).on("click", ".load-weapon", function(){
    const key = $(this).data("key")
    var builds = SavedBuilds.load(key)
    builds.weapons.find(w => w.name == $(this).html()).push()
    $(".weapon-form").trigger("change")
})

$(document).on("click", ".delete-weapon", function() {
    const key = $(this).data("key")
    const form = $(`#${key}-calc-form`)
    var builds = SavedBuilds.load(key)
    const weapon = Weapon.pull(form, globalThis.tabs)

    if (!weapon.name) return

    const index = builds.weapons.findIndex(w => w.name == weapon.name)

    if (index !== -1){
        builds.weapons.splice(index, 1)
        builds.save()
        buildSaveList(key)
    }
})

$(document).on("click", ".export-weapon", function() {
    const key = $(this).data("key")
    const form = $(`#${key}-calc-form`)
    const weapon = Weapon.pull(form, globalThis.tabs)
    const data = encodeURIComponent(JSON.stringify(weapon))

    navigator.clipboard.writeText(`${window.location.href}?data=${data}`)
    $(`#${key}-export`).tooltip({
        title: "Build copied to clipboard!", 
        delay: {show: 500, hide: 1500}})
    $(`#${key}-export`).tooltip('show')
})

$(document).on("click", ".popover-link", function(){
    return false
})