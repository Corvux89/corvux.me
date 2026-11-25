declare global {
    interface JQuery<TElement = HTMLElement> {
        draggable(optionsOrAction?: string | Record<string, unknown>): JQuery<TElement>
    }
}

import { BattleMap, Monster, Overlay, SavedPlan, Settings } from "./types.js";
import { buildMaddTable, buildMapPreview, buildMonsterInventory, buildOverlayModal, buildMainCommandHeader, getTokenShortcode, isValidHttpURL, buildMaddHeader, buildMapHeader, buildOverlayHeader, copyString, exportBuild, savePlan, buildSavedPlanList, updateProperty, getInputValue } from "./utils.js";

$("#monster-inventory").on("change", function(e){
    const target = $(e.target)
    const nameAttr = target.attr("name")
    const monsters = Monster.load()
    const index = target.parents(".monster").data("id")
    let monster = monsters[index]

    if (nameAttr !== undefined){
        const value = getInputValue(target)
        if (value !== undefined){
            monster = updateProperty(monster, nameAttr as keyof Monster, value)
            monster.save()
        }
    }

    buildMaddTable()
    buildMaddHeader()
    buildMapPreview()
})

$(document).on("change", "input[name='name']", function() {
    const monsters = Monster.load()

    if (monsters.length > $("#monster-inventory").children(".monster").length){
        $("#monster-inventory").append(monsters[monsters.length-1].inventoryRow())
    } else if ($("#monster-inventory").children(".monster").length > monsters.length){
        monsters.forEach(monster => {
                if (monster.name == "" && monster.index < monsters.length - 1) {
                    monster.remove();
            }
        })

        buildMonsterInventory()
    }
})

$(document).on("change", "[name='quantity']", function() {
    const target = $(this)
    const index = target.parents(".monster").data("id")
    const monsters = Monster.load()
    const monster = monsters[index]

    monster.coords.length = monster.quantity
    monster.save()
})

$(document).on("change", "[name='token']", function(){
    const target = $(this)
    const index = target.parents(".monster").data("id")
    const monsters = Monster.load()
    const monster = monsters[index]
    let helpText = $(`#mini-token-help-${index}`)


    if (isValidHttpURL(monster.token)){
        target.val("loading...")

        getTokenShortcode(monster.token)
        .then(token => {
            monster.token = ""
            if (token != null){
                target.val(token)
                monster.token = token

                if (helpText.length > 0)
                    helpText.remove()

            } else {
                target.empty()
                const error = "Seomthing went wrong with that image. Either OTFBM doesn't have access to the image, or it is malformed.<br>Try a different URL."

                if (helpText.length > 0){
                    helpText.val(error)
                } else {
                    helpText = jQuery("<small>")
                        .addClass("form-text text-white-50")
                        .attr("id", `mini-token-help-${index}`)
                        .val(error)
                    target.append(helpText)
                }
            }

            monster.save()
        })
    } else {
        if (helpText.length > 0)
            helpText.remove()
    }
})

$(document).on("click", ".remove-monster", function(e) {
    const target = $(e.target)
    const index = target.parents(".monster").data("id")
    const monsters = Monster.load()


    if (index == monsters.length-1){
        target.tooltip({
            title: "Cannot remove the last row.",
            delay: {show: 500, hide: 1500}
        })
        target.tooltip("show")
        return
    }
    
    monsters[index].remove()

    buildMonsterInventory()
    buildMaddHeader()
    buildMaddHeader()
    buildMapPreview()
    buildMainCommandHeader()    
})

$("#madd-table").on("change", function(e){
    const target = $(e.target)
    const monsters = Monster.load()
    const index = target.parents(".monPos").data("id")
    const monster = monsters[index]
    const mon = target.parents(".monPos").data("mon")

    if (target !== undefined && target.val() !== undefined){
        const value = target.val()
        if (value !== undefined){
            monster.coords[mon] = value.toString()
            monster.save()
        }
    }

    buildMaddHeader()
    buildMapPreview()
})

$(document).on("click", ".madd-clear", function(e){
    const target = $(e.target)
    const index = target.parents(".monGroup").data("id")
    const monsters = Monster.load()
    const monster = monsters[index]

    monster.coords = []
    monster.coords.length = monster.quantity
    monster.save()

    buildMaddTable()
    buildMaddHeader()
    buildMapPreview()
})

$("#overlay-setup").on("change", function(e){
    const battlemap = BattleMap.load()
    const target = $(e.target)
    const nameAttr = target.attr("name")

    if (nameAttr !== undefined) {
        const value = getInputValue(target)
        if (value !== undefined){
            battlemap.overlay = updateProperty(battlemap.overlay, nameAttr as keyof Overlay, value)
            battlemap.save()
        }

        if (nameAttr == "type") buildOverlayModal()
    }
    
    buildMapPreview()
    buildOverlayHeader()
})

$("#reset-overlay").on("click", function() {
    const battlemap = BattleMap.load()
    battlemap.overlay = new Overlay()
    battlemap.save()
    $("#map-overlay-type").find(":selected").prop("selected", false)
    $("#map-overlay-target").val()

    buildOverlayModal()
    buildOverlayHeader()
    buildMapPreview()
})

$(".settings").on("change", function(e){
    let settings = Settings.load()
    const target = $(e.target)
    const nameAttr = target.attr("name")
    let errorButton = $('.error-button')

    if (nameAttr !== undefined) {
        const value = getInputValue(target)
        settings = updateProperty(settings, nameAttr as keyof Settings, value)
        settings.save()
    }

    if (settings.conflict == true){
        if (errorButton.length > 0){
            return
        }
        errorButton = jQuery("<button>")
            .addClass("btn btn-light m-0 p-0 error-button")
            .attr({
                "type": "button",
                "data-bs-toggle": "tooltip",
                "data-bs-trigger": "hover",
                "data-bs-placement": "right",
                "title": "Multiline won't work with an alias (ie. map) commands.\nInclude Notes to use with multiline"
            })
            .html(`
                <i class="fa-solid fa-triangle-exclamation"></i>
                `)
            
        $("#multiColumn").append(errorButton)
        errorButton.tooltip("enable")
    } else if (errorButton.length > 0){
        errorButton.remove()
    }

    buildMainCommandHeader()
    buildMapHeader()
    buildMaddHeader()
    buildOverlayHeader()
})

$("#map-setup").on("change", function(e){
    const target = $(e.target) 
    const nameAttr = target.attr("name")
    const value = getInputValue(target)

    if (nameAttr !== undefined){
        battlemap = updateProperty(battlemap, nameAttr as keyof BattleMap, value)
        battlemap.save()
    }

    buildMapHeader()
    buildMapPreview()
})

$(".copy-button").on("click", function(){
    const content = $(this).parent().children(".command").html().replace(/<br>/g,'\n')
    copyString(content, "Command copied to clipboard", this.id)
})

$("#reset-monsters").on("click", function(){
    Monster.dump()

    buildMonsterInventory()
    buildMaddTable()
    buildMaddHeader()
    buildMapPreview()
    buildMainCommandHeader()
})

$("#reset-battlemap").on("click", function(){
    BattleMap.dump()
    const battlemap = BattleMap.load()

    buildOverlayModal()
    buildOverlayHeader()
    buildMapHeader()
    buildMainCommandHeader()
    buildMapPreview()

    $("#map-overlay-type").find(":selected").prop("selected", false)
    $("#map-setup :input").map(function() {
        const target = $(this)
        const nameAttr = target.attr("name")

        if (nameAttr !== undefined) {
            const value = battlemap[nameAttr as keyof BattleMap].toString()
            if (value !== undefined) {
                target.val(value)
            }
        }
    })    
})

$("#reset-all").on("click", function(){
    $("#reset-monsters").trigger("click")
    $("#reset-battlemap").trigger("click")
})

$("#export-planner").on("click", function() {
    exportBuild()
})

$("#save-plan").on("click", function() {
    savePlan()
})

$("#delete-plan").on("click", function() {
    const planName = $("#plan-name")?.val()?.toString()

    if (planName!= "" && planName !== undefined){
        SavedPlan.dump(planName)
        $("#reset-monsters").trigger("click")
        $("#reset-battlemap").trigger("click")
        buildSavedPlanList()
    }
})

$(document).on("change", "#content", function() {
    buildMainCommandHeader()
})

// Initial Load
Monster.import()
BattleMap.import()
SavedPlan.import()
window.history.replaceState({}, document.title, window.location.pathname)
const settings = Settings.load()
let battlemap = BattleMap.load()
buildMonsterInventory()
buildMaddTable()
buildMaddHeader()
buildMapHeader()
buildOverlayModal()
buildOverlayHeader()
buildSavedPlanList()
buildMainCommandHeader()


// Load Settings
$(".settings :input").map(function() {
    const x = $(this)
    const nameAttr = x.attr("name")
    const value = settings[nameAttr as keyof Settings]
    if (x.prop('type') == 'text')
            x.val(value.toString())
    else
        x.prop("checked", value == true)
})

// Load Overlay
$("#overlay-setup [id^='map-overlay']").map(function(){
    const target = $(this)
    const nameAttr = target.attr("name")

    if (nameAttr !== undefined){
        const value = battlemap.overlay[nameAttr as keyof Overlay]
        target.val(value.toString())
    }
})

// Load Map
$("#map-setup :input").map(function() {
    const target = $(this)
    const nameAttr = target.attr("name")
    const value = battlemap[nameAttr as keyof BattleMap]
    if (target.prop('type') == 'text' || target.prop('type') == 'number')
        target.val(value.toString())
    else
        target.prop('checked', value == true)
})


$(document).on("DOMContentLoaded", function() {
    buildMapPreview()

    $(document).on("keydown", function(e) {
        if (e.ctrlKey){
            switch (e.key){
                case "s":
                    e.preventDefault()
                    if ($("#plan-name").val() != ""){
                        savePlan()
                        $("#save-plan-button").tooltip({
                            title: `${$("#plan-name").val()} saved.`,
                            delay: {
                                show: 500,
                                hide: 1500
                            }
                        })
                        .tooltip("show")
                    } else {
                        $("#saveModal").modal("show")
                    }
                    break
                case "x":
                    e.preventDefault()
                    exportBuild()
                    break
            }
        } else if (e.altKey){
            switch (e.key){
                case "1":
                    e.preventDefault()
                    $("#inventory-tab").tab("show")
                    break
                case "2":
                    e.preventDefault()
                    $("#map-tab").tab("show")
                    break
                case "h":
                    e.preventDefault()
                    $("#howtomodal").modal("show")
                    break
                case "m":
                    e.preventDefault()
                    if ($("#map-planner").hasClass("active")) $("#monsterMapModal").modal("show")
                    break
                case "s":
                    e.preventDefault()
                    if ($("#map-planner").hasClass("active")) $("#mapSettingsModal").modal("show")
                    break
                case "o":
                    e.preventDefault()
                    if ($("#map-planner").hasClass("active")) $("#mapOverlayModal").modal("show")
                    break
            }
        }
    })

    $(".modal").map(function() {
        const target = $(this)
        target.draggable({handle: ".modal-header"})

        if (target.find(".default-focus")){
            target.on("shown.bs.modal", function(){
                target.find(".default-focus").trigger("focus")
            })
        }
    })

    $(".monster").filter(function(){
        return $(this).data('id') == 0
    }).find("input[name='name']").trigger("focus")
})

