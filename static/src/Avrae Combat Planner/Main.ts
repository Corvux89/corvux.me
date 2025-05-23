import { BattleMap, draggableElement, Monster, Overlay, SavedPlan, Settings } from "./types.js";
import { buildMaddTable, buildMapPreview, buildMonsterInventory, buildOverlayModal, buildMainCommandHeader, getTokenShortcode, isValidHttpURL, buildMaddHeader, buildMapHeader, buildOverlayHeader, copyString, exportBuild, savePlan, buildSavedPlanList } from "./utils.js";

$("#monster-inventory").on("change", function(e){
    const target = $(e.target)
    const monsters = Monster.load()
    const index = target.parents(".monster").data("id")
    const monster = monsters[index]

    monster[target.attr("name")] = target.is("input") ? target.val() : target.find(":selected").val()

    monster.save()

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

    monster.coords[mon] = target.val().toString()
    monster.save()

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

    battlemap.overlay[target.attr('name')] = target.is("input") ? target.val() : target.find(":selected").val()
    battlemap.save()
    if (target.attr("name") == "type") buildOverlayModal()

    
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
    const settings = Settings.load()
    const target = $(e.target)
    let errorButton = $('.error-button')

    settings[target.attr("name")] = target.prop('type') == 'text' ? target.val() :target.prop("checked")
    settings.save()

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
    battlemap[target.attr("name")] = target.prop('type') == 'text'  || target.prop('type') == 'number' ? target.val() :target.prop("checked")
    battlemap.save()

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
        target.val(battlemap[target.attr("name")])
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
    const planName = $("#plan-name").val().toString()

    if (planName!= ""){
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
const battlemap = BattleMap.load()
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
    if (x.prop('type') == 'text')
            x.val(settings[x.attr("name")])
    else
        x.prop("checked", settings[x.attr("name")])
})

// Load Overlay
$("#overlay-setup [id^='map-overlay']").map(function(){
    const target = $(this)
    target.val(battlemap.overlay[target.attr("name")])
})

// Load Map
$("#map-setup :input").map(function() {
    const target = $(this)
    if (target.prop('type') == 'text' || target.prop('type') == 'number')
        target.val(battlemap[target.attr("name")])
    else
        target.prop('checked', battlemap[target.attr("name")])
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
        const target = $(this) as draggableElement
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
