import { BattleMap } from './battlemap.js'
import { Monster } from './monster.js'
import { Overlay } from './overlay.js'
import { PlannerSettings } from './settings.js'

export const inventoryContainer = document.getElementById("monster-inventory"),
maddTable = document.getElementById("madd-table"),
overlayRow = document.getElementById("overlay-row"),
overlaySetup = document.getElementById("overlay-setup")

export class AvraePlanner{
    static node = "savedPlans"

    static start(){
        AvraePlanner.importPlanner()
        AvraePlanner.setupInventoryTable()
        AvraePlanner.setupMaddTable()
        AvraePlanner.buildMapPreview()
        AvraePlanner.setupMapSettingsTable()
        AvraePlanner.setupOverlayTable()
        AvraePlanner.setupSettingsTable()
        AvraePlanner.modalSetup()
        AvraePlanner.buttonSetup()
        AvraePlanner.buildCommandString()


        // Fields
        // - Overlay setup
        overlaySetup.addEventListener('change', function(event){
            AvraePlanner.setupOverlayTable()
        })

        document.getElementById('content').addEventListener("change", function (event) {
            AvraePlanner.buildCommandString()
        })
    }

    static setupInventoryTable(){
        var monsters = Monster.loadAll()

        monsters.forEach(function(monster){
            var maddRow = monster.addMaddRow()

            inventoryContainer.appendChild(monster.addInventoryRow())
            if (maddRow){
                maddTable.appendChild(maddRow)
            }
        })
    }

    static setupMaddTable(){
        var monsters = Monster.loadAll()
        setMaddHeader()

        inventoryContainer.addEventListener('change', function(event){
            var monsters = Monster.loadAll()
            maddTable.innerHTML = ''

            monsters.forEach(function(monster){
                var maddRow = monster.addMaddRow()
                if (maddRow){
                    maddTable.appendChild(maddRow)
                }
            })
        })

        maddTable.addEventListener('change', function(event){
            setMaddHeader()
            AvraePlanner.buildMapPreview()
        })
    }

    static setupMapSettingsTable(){
        var battlemap = BattleMap.load()
        var mapSetup = document.getElementById('map-setup')
        setMapSettingsHeader()

        // Defaulting
        mapSetup.querySelectorAll('input, select').forEach(input => {
            input.value = battlemap[`${input.id.replace('map-', '')}`]
        })

        // Event
        mapSetup.addEventListener('change', function(event){
            var battlemap = BattleMap.load()
            var elm = event.target
            var node = elm.id.replace(`map-`, '')
            battlemap[node] = elm.value
            battlemap.save()
            AvraePlanner.buildMapPreview()
            setMapSettingsHeader()
        })
    }

    static setupOverlayTable(){
        var battlemap = BattleMap.load()
        setOverlayHeader()

        // Defaulting
        overlaySetup.querySelectorAll('input, select').forEach(input => {
            input.value = battlemap.overlay[`${input.id.replace('map-overlay','').toLowerCase()}`]
        })

        // Event
        overlaySetup.addEventListener('change', function(event){
            var battlemap = BattleMap.load()
            var elm = event.target
            var node = elm.id.replace('map-overlay', '').toLowerCase()

            battlemap.overlay[node] = elm.value
            battlemap.save()
            AvraePlanner.buildMapPreview()
            battlemap.overlay.setupTable()
            setOverlayHeader()
        })

        battlemap.overlay.setupTable()
    }

    static setupSettingsTable() {
        var settings = PlannerSettings.load()

        document.querySelectorAll(".settings").forEach(elm => {
            // Defaulting
            elm.querySelectorAll('input').forEach(input => {
                var node = input.id.replace('setting-', '')
                if (input.type == "text") {
                    input.value = settings[node]
                } else {
                    input.checked = settings[node]
                }
            })

            // Event
            elm.addEventListener('change', function (event) {
                var settings = PlannerSettings.load()
                var elm = event.target
                var node = elm.id.replace('setting-', '')
                var multiColumn = document.getElementById("multiColumn")
                var errorButton = multiColumn.querySelector('.error-button')
                if (elm.type == "text") {
                    settings[node] = elm.value
                } else {
                    settings[node] = elm.checked
                }

                if (settings.multiline == true && (settings.notes == false && (settings.battlemap == true || settings.overlay == true))){
                    if (!errorButton){
                        errorButton = document.createElement('button')
                        errorButton.setAttribute("type", "button")
                        errorButton.classList.add("btn", "btn-light", "m-0", "p-0", "error-button")
                        errorButton.setAttribute("data-bs-toggle", "tooltip")
                        errorButton.setAttribute("data-bs-trigger", "hover")
                        errorButton.setAttribute("data-bs-placement", "right")
                        errorButton.setAttribute("title", "Multiline won't work with alias (ie. map) commands.\nInclude Notes to use with multiline")

                        var icon = document.createElement("i")
                        icon.classList.add("fa-solid", "fa-triangle-exclamation")

                        errorButton.appendChild(icon)

                        var tooltip = new bootstrap.Tooltip(errorButton)

                        multiColumn.appendChild(errorButton)
                    }
                } else if (errorButton){
                    multiColumn.removeChild(errorButton)
                }

                settings.save()
                setMaddHeader()
                setMapSettingsHeader()
                setOverlayHeader()
            })
        })
    }

    static modalSetup() {
        $("#monsterMapModal").draggable({
            handle: ".modal-header"
        })

        $("#mapOverlayModal").draggable({
            handle: ".modal-header"
        })

        $("#mapSettingsModal").draggable({
            handle: ".modal-header"
        })

        $("#appSettingsModal").draggable({
            handle: ".modal-header"
        })

        $('#confirmModal').on('show.bs.modal', function (event){
            var button = $(event.relatedTarget)
            var reset = button.data('reset')
            var resetButton = document.getElementById("confirm-reset")
            var modal = $(this)
            var str = ""

            switch(reset){
                case "monster":
                    str = "Are you sure you want to delete all monsters?"
                    break

                case "map":
                    str = "Are you sure you want to delete all map information?"
                    break

                case "all":
                    str = "Are you sure you want to clear the entire encounter?"
                    break
            }

            modal.find('p').text(str)
            resetButton.setAttribute("data-reset", reset)
        })
    }

    static buttonSetup() {
        // Export
        document.getElementById("export-planner").addEventListener('click', function(event) {
            AvraePlanner.exportPlanner()
        })

        // Modal Buttons
        // - Reset Overlay
        document.getElementById("reset-overlay").addEventListener('click', function (event) {
            var change_event = new Event("change")
            var battlemap = BattleMap.load()

            battlemap.overlay = new Overlay()
            battlemap.save()

            overlaySetup.querySelectorAll('input, select').forEach(input => {
                input.value = battlemap.overlay[`${input.id.replace('map-overlay', '').toLowerCase()}`]
            })

            overlaySetup.dispatchEvent(change_event)
        })
        // Copy Buttons
        // - Main command line
        document.getElementById("command-copy").addEventListener('click', function (event) {
            var copyText = document.getElementById("avrae-command").innerHTML
            copyText = copyText.replace(/<br>/g, '\n')

            if (copyText){
                navigator.clipboard.writeText(copyText)
                $('#command-copy').tooltip({title: "Command copied to clipboard!", delay: {show: 500, hide: 1500}})
                $('#command-copy').tooltip('show')
            }
        })
        // - Madd table
        document.getElementById("madd-copy").addEventListener('click', function(event){
            var copyText = document.getElementById("madd-command").innerHTML
            copyText = copyText.replace(/<br>/g, '\n')

            if (copyText){
                navigator.clipboard.writeText(copyText)
                $('#madd-copy').tooltip({title: "Command copied to clipboard!", delay: {show: 500, hide: 1500}})
                $('#madd-copy').tooltip('show')
            }
        })
        // - Map settings
        document.getElementById("map-command-copy").addEventListener('click', function(event){
            var copyText = document.getElementById("map-command").innerHTML
            copyText = copyText.replace(/<br>/g, '\n')

            if (copyText){
                navigator.clipboard.writeText(copyText)
                $('#map-command-copy').tooltip({title: "Command copied to clipboard!", delay: {show: 500, hide: 1500}})
                $('#map-command-copy').tooltip('show')
            }
        })
        // - Overlay
        document.getElementById("overlay-copy").addEventListener('click', function(event){
            var copyText = document.getElementById("overlay-command").innerHTML
            copyText = copyText.replace(/<br>/g, '\n')

            if (copyText){
                navigator.clipboard.writeText(copyText)
                $('#overlay-copy').tooltip({title: "Command copied to clipboard!", delay: {show: 500, hide: 1500}})
                $('#overlay-copy').tooltip('show')
            }
        })
        // - Confirm Reset Button
        document.getElementById("confirm-reset").addEventListener('click', function (event) {
            var button = $(event.target)
            var reset = button.data('reset')
            var change_event = new Event("change")

            switch(reset){
                case "monster":
                    localStorage.removeItem(Monster.node)
                    inventoryContainer.innerHTML = ''
                    AvraePlanner.setupInventoryTable()
                    AvraePlanner.buildCommandString()
                    inventoryContainer.dispatchEvent(change_event)
                    maddTable.dispatchEvent(change_event)
                    break

                case "map":
                    var mapSetup = document.getElementById('map-setup')
                    localStorage.removeItem(BattleMap.node)
                    var battlemap = BattleMap.load()
                    mapSetup.querySelectorAll('input, select').forEach(input => {
                        input.value = battlemap[`${input.id.replace('map-', '')}`]
                    })
                    overlaySetup.dispatchEvent(change_event)
                    mapSetup.dispatchEvent(change_event)
                    break

                case "all":
                    localStorage.removeItem(Monster.node)
                    localStorage.removeItem(BattleMap.node)
                    location.reload()
                    break
            }

        })
    }

    static buildMapPreview(){
        var monsters = Monster.loadAll()
        var battlemap = BattleMap.load()
        var overlay = battlemap.overlay
        var monsterOnMap = false
        var mapPreview = document.getElementById("mapPreview")

        monsters.forEach(function(monster){
            if (monster.coords.length > 0 && monster.coords.some(coord => coord != null)){
                monsterOnMap = true
            }
        })

        if (battlemap.url != "" || battlemap.size != "" || mon_placed){
            var imgUrl = 'https://otfbm.io/'
            imgUrl += battlemap.size ? battlemap.size:"10x10"
            imgUrl += battlemap.csettings ? `/@c${battlemap.csettings}`:""

            // Monster placement
            monsters.forEach(function (monster) {
                for (var i=0; i < monster.quantity; i++){
                    if (monster.coords[i] != null){
                        var monStr = "/" + monster.coords[i]
                        monStr += monster.size ? monster.size:"M"
                        monStr += monster.color ? monster.color:"r"
                        monStr += "-"
                        monStr += monster.getCombatID(i+1)
                        monStr += monster.token ? `~${monster.token}`:""
                        imgUrl += monStr
                    }
                }
            })

            // Overlay
            switch(overlay.type) {
                case "circle":
                    if (overlay.radius && overlay.color && overlay.center) {
                        imgUrl += "/*c"
                        imgUrl += overlay.radius + overlay.color + overlay.center
                    }
                    break

                case "cone":
                    if (overlay.size && overlay.start && overlay.end && overlay.color) {
                        imgUrl += "/*t"
                        imgUrl += overlay.size + overlay.color + overlay.start + overlay.end
                    }
                    break

                case "line":
                    if (overlay.start && overlay.end && overlay.length && overlay.width && overlay.color) {
                        imgUrl += "/*l"
                        imgUrl += overlay.length + overlay.width + overlay.color + overlay.start + overlay.end
                    }
                    break

                case "square":
                    if (overlay.size && overlay.color && overlay.topleft) {
                        imgUrl += "/*s"
                        imgUrl += overlay.size + overlay.color + overlay.topleft
                    }
                    break
            }

            imgUrl += "/"
            imgUrl += battlemap.url ? `/?a=2&bg=${battlemap.url}`:""

            var imgDom = document.createElement("img")
            imgDom.classList.add('img-fluid')
            imgDom.src = imgUrl

            if (imgDom.outerHTML.localeCompare(mapPreview.innerHTML)!=0){
                mapPreview.innerHTML = ""
                mapPreview.hidden=false
                mapPreview.appendChild(imgDom)
            }
        } else{
            mapPreview.hidden = true
        }
    }

    static buildCommandString(){
        var settings = PlannerSettings.load()
        var commands = []
        var commandStr = document.getElementById('commandStr')
        var avraeCommand = document.getElementById('avrae-command')

        if (settings.maptarget == true){
            commands.unshift(`${settings.prefix}i add 20 ${settings.attach} -p`)
        }

        if (settings.multiline == true){
            commands.unshift(`${settings.prefix}multiline`)
        }

        if (settings.monsters == true){
            commands = commands.concat(getMaddCommand())
        }

        if (settings.battlemap == true){
            commands = commands.concat(getMapCommand())
        }

        if (settings.overlay == true){
            commands.push(getOverlayCommand())
        }

        var out = commands.join("<br>")

        if (out.length > 1){
            commandStr.hidden = false
        } else {
            commandStr.hidden = true
        }

        avraeCommand.innerHTML = out
    }

    static exportPlanner(){
        var monsters = Monster.loadAll()
        var battlemap = BattleMap.load()
        var raw_data = {"monsters": monsters, "battlemap": battlemap}
        var data = JSON.stringify(raw_data)
        var encodedData = encodeURIComponent(data)
        var url = `?data=${encodedData}`

        navigator.clipboard.writeText(`${window.location.href}${url}`)
        $('#export-planner').tooltip({title: "Build copied to clipboard!", delay: {show: 500, hide: 1500}})
        $('#export-planner').tooltip('show')
    }

    static importPlanner(){
        var urlParams = new URLSearchParams(window.location.search)
        var encodedData = urlParams.get('data')

        if (encodedData){
            var data = decodeURIComponent(encodedData)

            try {
                var parsedData = JSON.parse(data)
                localStorage.setItem(Monster.node, JSON.stringify(parsedData.monsters))
                localStorage.setItem(BattleMap.node, JSON.stringify(parsedData.battlemap))

                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error){
                console.error('Error parsing data: ', error)
            }
        }
    }
}

function getMaddCommand() {
    var monsters = Monster.loadAll()
    var settings = PlannerSettings.load()
    var commands = []

    monsters.forEach(monster => {
        var coords = []
        if (monster.name != "" && monster.quantity > 0){
            if (settings.notes == true) {
                var note = ""

                if (monster.coords.filter(x => x != null && x != "").length > 0){
                    for (var i = 0; i < monster.quantity; i++){
                        var note_str = []
                        if (monster.token){note_str.push(`Token: ${monster.token}`)}
                        if (monster.coords[i]){note_str.push(`Location: ${monster.coords[i]}`)}
                        if (monster.size){note_str.push(`Size: ${monster.size}`)}
                        if (monster.color){note_str.push(`Color: ${monster.color}`)}
                        note = note_str.join(" | ")

                        var str = `${settings.prefix}i madd "${monster.name}"`
                        str += monster.label ? ` -name "${monster.label}"`:""
                        str += note ? ` -note "${note}"`:""
                        str += monster.args ? ` ${monster.args}`:""
                        commands.push(str)
                    }
                } else {
                    var note_str = []
                    if (monster.token){note_str.push(`Token: ${monster.token}`)}
                    if (monster.size){note_str.push(`Size: ${monster.size}`)}
                    if (monster.color){note_str.push(`Color: ${monster.color}`)}
                    note = note_str.join(" | ")
                    var str = `${settings.prefix}i madd "${monster.name}"`
                    str += monster.label ? ` -name "${monster.label}"`:""
                    str += note ? ` -note "${note}"`:""
                    str += monster.args ? ` ${monster.args}`:""
                    commands.push(str)
                }
            } else {
                var str = `${settings.prefix}i madd "${monster.name}"`
                str += monster.quantity > 1 ? ` -n ${monster.quantity}`:""
                str += monster.label ? ` -name "${monster.label}"`:""
                str += monster.args ? ` ${monster.args}`:""
                commands.push(str)
            }
        }
    })

    return commands
}

function getMapCommand(mapOnly = false){
    var settings = PlannerSettings.load()
    var battlemap = BattleMap.load()
    var str = ""
    var commands = []

    if (battlemap.url || battlemap.size){
        if (settings.notes == true && mapOnly == false){
            str = `${settings.prefix}i effect ${settings.attach} map -attack "||Size: `
            str += battlemap.size ? battlemap.size:"10x10"
            str += battlemap.url ? ` ~ Background: ${battlemap.url}`:''
            str += battlemap.csettings ? ` ~ Options: c${battlemap.csettings}`:""
            str += `"`
        } else {
            str = `${settings.prefix}map`
            str += battlemap.url ? ` -bg "${battlemap.url}"`:""
            str += battlemap.size ? ` -mapsize ${battlemap.size}`:""
            str += battlemap.csettings ? ` -options c${battlemap.csettings}`:""
            str += settings.attach ? ` -t ${settings.attach}`:""
            if (settings.monsters == true && mapOnly == false){
                var monStr = getMonsterMapCommand()
                if (monStr){commands.push(monStr)}
            }
        }
    }
    commands.push(str)
    return commands
}

function getMonsterMapCommand(){
    var monsters = Monster.loadAll()
    var settings = PlannerSettings.load()
    var coords = []

    monsters.forEach(monster => {
        if (monster.name != "" && monster.quantity > 0){
            for (var i=0; i < monster.quantity; i++){
                if (monster.coords[i] != null && monster.coords[i] != ""){
                    var str = ` -t "${monster.getCombatID(i+1)}|`
                    str += monster.coords[i] + "|"
                    str += monster.size + "|"
                    str += monster.color
                    str += monster.token ? `|\$${monster.token}`:""
                    str += `"`
                    coords.push(str)
                }
            }
        }
    })

    if (coords.length > 0){
        return `${settings.prefix}map ${coords.join(" ")}`
    }
    return ""
}

function getOverlayCommand(mapOnly = false){
    var settings = PlannerSettings.load()
    var battlemap = BattleMap.load()
    var overlay = battlemap.overlay
    var str = ""

    switch(overlay.type) {
        case "circle":
            if (overlay.radius && overlay.color && overlay.center) {
                var nodes = [overlay.radius, overlay.color, overlay.center]
                if (settings.notes == true && mapOnly == false){
                    str = "Overlay: c"
                    str += nodes.join("")
                } else {
                    str = `${settings.prefix}map -over circle,`
                    str += nodes.join(",")
                }
            }
            break

        case "cone":
            if (overlay.size && overlay.start && overlay.end && overlay.color) {
                var nodes = [overlay.size, overlay.color, overlay.start, overlay.end]
                if (settings.notes == true && mapOnly == false){
                    str = "Overlay: t"
                    str += nodes.join("")
                } else {
                    str = `${settings.prefix}map -over cone,`
                    str += nodes.join(",")
                }
            }
            break

        case "line":
            if (overlay.start && overlay.end && overlay.length && overlay.width && overlay.color) {
                var nodes = [overlay.length, overlay.width, overlay.color, overlay.start, overlay.end]
                if (settings.notes == true && mapOnly == false){
                    str = "Overlay: l"
                    str += nodes.join("")
                } else {
                    str = `${settings.prefix}map -over line,`
                    str += nodes.join(",")
                }
            }
            break

        case "square":
            if (overlay.size && overlay.color && overlay.topleft) {
                var nodes = [overlay.size, overlay.colord, overlay.topleft]
                if (settings.notes == true && mapOnly == false){
                    str = "Overlay: s"
                    str += nodes.join("")
                } else {
                    str = `${settings.prefix}map -over square,`
                    str += nodes.join(",")
                }
            }
            break
    }

    if (str.length > 0){
        if (settings.notes == true && mapOnly == false){
            str = `${settings.prefix}i note ${overlay.target ? overlay.target:settings.attach} ${str}`
        } else {
            str += overlay.target ? ` -t ${overlay.target}`:""
        }
    }

    return str
}

function setMaddHeader(){
    var map_header = document.getElementById("madd-header")
    var out = getMonsterMapCommand()

    if (out){map_header.hidden=false}else{map_header.hidden=true}

    document.getElementById("madd-command").innerHTML = out
}

function setMapSettingsHeader(){
    var maps_header = document.getElementById('maps-header')
    var out = getMapCommand(true)

    if (out){maps_header.hidden=false}else{maps_header.hidden=true}

    document.getElementById("map-command").innerHTML =out.join("")
}

function setOverlayHeader(){
    var overlay_header = document.getElementById("overlay-header")
    var out = getOverlayCommand(true)

    if (out.length >0){overlay_header.hidden=false} else {overlay_header.hidden=true}

    document.getElementById("overlay-command").innerHTML = out
}