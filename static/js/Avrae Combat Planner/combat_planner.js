function onLoad(){
    var combat_plan = JSON.parse(localStorage.getItem("combat_plan") || "[]")

    // Setup the inventory page and the monster table from local storage
    combat_plan.forEach(function(monster, index){
        $('#monInventory').append(cloneRow(index))
        $('#mapPlanner').append(buildMaddTable(index+1, monster))
    })

    // Reset Monster Inventory Button
    document.getElementById("comReset").addEventListener('click', function(event){
        localStorage.removeItem("combat_plan")
        localStorage.removeItem("combat_map")
        location.reload()
    })

    // Reset Monsters Button
    document.getElementById("comMonReset").addEventListener('click', function(event){
        localStorage.removeItem("combat_plan")
        location.reload()
    })

    // Reset Map Button
    document.getElementById("comMapReset").addEventListener('click', function(event){
        localStorage.removeItem("combat_map")
        location.reload()
    })

    // Reset Overlay Button
    document.getElementById("overlay-clear-button").addEventListener('click', function(event){
        var form = document.getElementById("overlay-setup")
        input_event = new Event("input")
        change_event = new Event("change")

        form.querySelectorAll('input, select').forEach(input =>{
            input.value = ""
            input.dispatchEvent(input_event)
        })

        form.dispatchEvent(change_event)
    })

    document.getElementById("exportSettings").addEventListener('click', function(event){
        exportToURL()
    })

    // Monster Inventory
    document.getElementById("monInventory").addEventListener('change', function(event){
        buildCommandString()
        updateMaddTable()
    })

    // Monster position table
    document.getElementById("mapPlanner").addEventListener('change', function(event){
        buildCommandString()
        buildMapCommand()
        buildMapPreview()
    })

    // Map settings
    document.getElementById("map-setup").addEventListener('change', function(event){
        buildCommandString()
        buildMapPlannerCommand()
        buildMapPreview()
    })

    // Map Overlay
    document.getElementById("overlay-setup").addEventListener('change', function(event){
        buildCommandString()
        handleOverlay()
        buildMapPreview()
        buildOverlayCommand()
    })

    // Map overlay type
    document.getElementById("map-overlay-type").addEventListener('change', function(event){
        buildCommandString()
        handleOverlay()
    })

    // Settings
    document.getElementById("appSettings-setup").addEventListener('change', function(event){
        buildCommandString()
        buildMapCommand()
        buildOverlayCommand()
        buildMapPlannerCommand()
    })

    // Copy Buttons
    document.getElementById("maddCopy").addEventListener('click', function(event){
        var copyText = document.getElementById("madd").innerHTML
        copyText = copyText.replace(/<br>/g, '\n')

        if (copyText){
            navigator.clipboard.writeText(copyText)
        }
    })

    // Copy monster add command
    document.getElementById("mapCopy").addEventListener('click', function(event){
        var copyText = document.getElementById("mapCmd").innerHTML
        copyText = copyText.replace(/<br>/g, '\n')

        if (copyText){
            navigator.clipboard.writeText(copyText)
        }
    })

    // Copy map command
    document.getElementById("map-command-copy").addEventListener('click', function(event){
        var copyText = document.getElementById("map-command").innerHTML
        copyText = copyText.replace(/<br>/g, '\n')

        if (copyText){
            navigator.clipboard.writeText(copyText)
        }
    })

    // Copy overlay command
    document.getElementById("overlayCopy").addEventListener('click', function(event){
        var copyText = document.getElementById("overlay-command").innerHTML
        copyText = copyText.replace(/<br>/g, '\n')

        if (copyText){
            navigator.clipboard.writeText(copyText)
        }
    })

    // Setup input listener and load initial row
    var fields = document.querySelectorAll('input, select')
    fields.forEach(input => {
        input.addEventListener('input', saveToLocalStorage)

        if (input.name.includes("Name")){
            input.addEventListener('change', function(event){
                evaluateRow(event)
            })
        } else if (input.name.includes("Token")){
            input.addEventListener('change', function(event){
                validateToken(event)
            })
        }

        loadFromLocalStorage(input)
    })

    $("#monsterMapModal").draggable({
        handle: ".modal-header"
    })

    $("#mapOverlayModal").draggable({
        handle: ".modal-header"
    })

    $("#mapSettingsModal").draggable({
        handle: ".modal-header"
    })

    buildMapCommand()
    buildOverlayCommand()
    buildMapPlannerCommand()
    buildMapPreview()

    // Toggle Boxes
    document.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox){
        checkbox.addEventListener('input', function(event){
            buildCommandString()
        })
    })
}

function buildCommandString(){
    var combat_settings = JSON.parse(localStorage.getItem("combat_settings") || "{}")
    var combat_map = JSON.parse(localStorage.getItem("combat_map") || "{}")
    var avrae_prefix = (combat_settings["avrae-prefix"] ? combat_settings["avrae-prefix"]:"!")
    var attach_map = (combat_map["map-attach"] ? combat_map["map-attach"]:"DM")
    var inventory_header = document.getElementById('inventory-header')
    var commandStr = document.getElementById('commandStr')
    var multiColumn = document.getElementById("multiColumn")
    var errorButton = multiColumn.querySelector('.error-button')
    var includeNotes = (combat_settings["includeNotes"] ? true:false)
    var includeMulti = (combat_settings["includeMulti"] || document.getElementById("includeMulti").checked ? true:false)
    var includeMonsters = (combat_settings["monsters"] || document.getElementById("monsters").checked ? true:false)
    var commands = []
    var out = ""

    if (combat_settings["includeTarg"] == 'on'){
        commands.unshift(`${avrae_prefix}i add 20 ${attach_map} -p`)
    }

    if (includeMulti){
        commands.unshift(`${avrae_prefix}multiline`)
    }

    if (includeMonsters){
        commands = commands.concat(getMaddCommand(includeNotes))
    }

    if (combat_settings["battlemap"] == 'on'){
        commands = commands.concat(getMapCommand(includeNotes, (includeMonsters && !includeNotes ? true:false)))
    }

    if (combat_settings["overlay"] == 'on'){
        commands.push(getOverlayCommand(includeNotes))
    }

    out = commands.join("<br>")

    if (out.length > 1){
        commandStr.hidden = false
    } else {
        commandStr.hidden = true
    }

    document.getElementById('madd').innerHTML = out



    if (includeMulti && (!includeNotes && (combat_settings["battlemap"] == 'on' || combat_settings["overlay"] == 'on'))){
        if (!errorButton){
            errorButton = document.createElement('button')
            errorButton.setAttribute("type", "button");
            errorButton.classList.add("btn", "btn-link", "m-0", "p-0", "error-button");
            errorButton.setAttribute("data-toggle", "tooltip");
            errorButton.setAttribute("data-placement", "right");
            errorButton.setAttribute("title", "Multiline won't work with alias (ie. map) commands.\nInclude notes to use with multiline");

            var icon = document.createElement("i");
            icon.classList.add("fa-solid", "fa-triangle-exclamation");

            errorButton.appendChild(icon);

            multiColumn.appendChild(errorButton)
        }
    } else if (errorButton){
        multiColumn.removeChild(errorButton)
    }
}

function getMaddCommand(includeNotes = false){
    var combat_plan = JSON.parse(localStorage.getItem("combat_plan") || "[]")
    var combat_settings = JSON.parse(localStorage.getItem("combat_settings") || "{}")
    var commands = []
    var avrae_prefix = (combat_settings["avrae-prefix"] ? combat_settings["avrae-prefix"]:"!")

    combat_plan.forEach(monster => {
        var coords = []
        var qty = (monster.monQty ? monster.monQty:1)

        if (includeNotes == true){
            var note = ""

            if (monster.monCoord.filter(x => x != null && x != "").length > 0){
                var prefix = (monster.monLabel ? monster.monLabel : monster.monName.split(/\s/).reduce((response,word) => response+=word.slice(0,1),''))

                for (var i=0; i<qty; i++){
                    var monID = (prefix.includes("#") ? prefix.replace("#", `${i+1}`):`${prefix}${i+1}`)
                    note = (monster.monToken ? `Token: ${monster.monToken}`:'')
                    note += (monster.monCoord[i] && monster.monToken ? ` | `:'')
                    note += (monster.monCoord[i] ? `Location: ${monster.monCoord[i]}`:'')

                    var str = `${avrae_prefix}i madd "${monster.monName}"`
                    str += (monster.monLabel ? ` -name "${monID}"`:"")
                    str += (note ? ` -note "${note}"`:"")
                    str += (monster.monArgs ? ` ${monster.monArgs}`:'')

                    commands.push(str)
                }
            } else {
                note = (monster.monToken ? `Token: ${monster.monToken}`:'')

                var str = `${avrae_prefix}i madd "${monster.monName}"`
                str += (monster.monLabel ? ` -name "${monster.monName}"`:"")
                str += (note ? ` -note "${note}"`:"")
                str += (monster.monArgs ? ` ${monster.monArgs}`:'')

                commands.push(str)
            }
        } else {
            var str = `${avrae_prefix}i madd "${monster.monName}"`
            str += (monster.monQty ? ` -n ${monster.monQty}`:"")
            str += (monster.monLabel ? ` -name "${monster.monLabel}${(monster.monLabel.includes("#") ? "":"#")}"`:"")
            str += (monster.monArgs ? ` ${monster.monArgs}`:'')

            commands.push(str)
        }
    })

    return commands
}

function getMonsterMapCommand(){
    var combat_plan = JSON.parse(localStorage.getItem("combat_plan") || "[]")
    var combat_settings = JSON.parse(localStorage.getItem("combat_settings") || "{}")
    var coords = []
    var avrae_prefix = (combat_settings["avrae-prefix"] ? combat_settings["avrae-prefix"]:"!")

    combat_plan.forEach(monster => {
        var str = ""
        var qty = (monster.monQty ? monster.monQty:1)
        var prefix = (monster.monLabel ? monster.monLabel : monster.monName.split(/\s/).reduce((response,word) => response+=word.slice(0,1),''))

        for (var i=0; i<qty; i++){
            var monID = (prefix.includes("#") ? prefix.replace("#", `${i+1}`):`${prefix}${i+1}`)
            if (monster.monCoord[i] != null && monster.monCoord[i] != ""){
                str = `-t "${monID}|`
                str += monster.monCoord[i] + "|"
                str += (monster.monSize ? monster.monSize:"M") + "|"
                str += (monster.monColor ? monster.monColor:"r")
                str += (monster.monToken ? `|\$${monster.monToken}`:"") + `"`
                coords.push(str)
            }
        }
    })

    if (coords.length > 0){
        return `${avrae_prefix}map ${coords.join(" ")}`
    }
    return ""
}

function getMapCommand(includeNotes = false, includeMonsters = false){
    var combat_map = JSON.parse(localStorage.getItem("combat_map") || "{}")
    var combat_settings = JSON.parse(localStorage.getItem("combat_settings") || "{}")
    var str = ""
    var attach_map = (combat_map["map-attach"] ? combat_map["map-attach"]:"DM")
    var avrae_prefix = (combat_settings["avrae-prefix"] ? combat_settings["avrae-prefix"]:"!")
    commands = []

    if (Object.keys(combat_map).length > 0){
        var url = (combat_map["map-url"] ? combat_map["map-url"] : "")
        var size = (combat_map["map-size"] ? combat_map["map-size"] : "")
        var csettings = (combat_map["map-csettings"] ? combat_map["map-csettings"] : "")

        if (url || size){
            if (includeNotes==true){
                str = `${avrae_prefix}i effect ${attach_map} map -attack "||Size: `
                str += (size ? size:'10x10')
                str += (url ? ` ~ Background: ${url}`:'')
                str += (csettings ? ` ~ Options: c${csettings}`:"")
                str += `"`
            } else{
                str = `${avrae_prefix}map`
                str += (url ?` -bg "${url}"`:"")
                str += (size ? ` -mapsize ${size}`:"")
                str += (csettings ? ` -options c${csettings}`:"")
            }
        }
    }

    if (includeMonsters){
        commands.push(getMonsterMapCommand())
    }
    commands.push(str)

    return commands
}

function getOverlayCommand(includeNotes = false){
    var combat_map = JSON.parse(localStorage.getItem("combat_map") || "{}")
    var combat_settings = JSON.parse(localStorage.getItem("combat_settings") || "{}")
    var attach_map = (combat_map["map-attach"] ? combat_map["map-attach"]:"DM")
    var avrae_prefix = (combat_settings["avrae-prefix"] ? combat_settings["avrae-prefix"]:"!")
    var str = ""

    if (combat_map["map-overlay-type"] && combat_map["map-overlay-type"] != null && combat_map["map-overlay-color"]){
        if (includeNotes == true){
            str = `Overlay: c`
            str += combat_map["map-overlay-radius"]
            str += combat_map["map-overlay-color"]
            str += combat_map["map-overlay-center"]
        } else {
            str = `${avrae_prefix}map -over circle,`
            str += combat_map["map-overlay-radius"]
            str += ","
            str += combat_map["map-overlay-color"]
            str += ","
            str += combat_map["map-overlay-center"]
        }
    } else if (combat_map["map-overlay-type"] == "cone" && combat_map["map-overlay-size"] && combat_map["map-overlay-start"] && combat_map["map-overlay-end"]){
        if (includeNotes == true){
            str = `Overlay: t`
            str += combat_map["map-overlay-size"]
            str += combat_map["map-overlay-color"]
            str += combat_map["map-overlay-start"]
            str += combat_map["map-overlay-end"]
        } else {
            str = `${avrae_prefix}map -over cone,`
            str += combat_map["map-overlay-size"]
            str += ","
            str += combat_map["map-overlay-color"]
            str += ","
            str += combat_map["map-overlay-start"]
            str += ","
            str += combat_map["map-overlay-end"]
        }
    } else if (combat_map["map-overlay-type"] == "line" && combat_map["map-overlay-start"] && combat_map["map-overlay-end"] && combat_map["map-overlay-len"] && combat_map["map-overlay-width"]){
        if (includeNotes == true){
            str = `Overlay: l`
            str += combat_map["map-overlay-len"]
            str += ","
            str += combat_map["map-overlay-width"]
            str += combat_map["map-overlay-color"]
            str += combat_map["map-overlay-start"]
            str += combat_map["map-overlay-end"]
        } else {
            str = `${avrae_prefix}map -over line,`
            str += combat_map["map-overlay-len"]
            str += ","
            str += combat_map["map-overlay-width"]
            str += ","
            str += combat_map["map-overlay-color"]
            str += ","
            str += combat_map["map-overlay-start"]
            str += ","
            str += combat_map["map-overlay-end"]
        }
    } else if (combat_map["map-overlay-type"] == "square" && combat_map["map-overlay-size"] && combat_map["map-overlay-top-left"]){
        if (includeNotes == true){
            str = `Overlay: s`
            str += combat_map["map-overlay-size"]
            str += combat_map["map-overlay-color"]
            str += combat_map["map-overlay-top-left"]
        } else {
            str = `${avrae_prefix}map -over square,`
            str += combat_map["map-overlay-size"]
            str += ","
            str += combat_map["map-overlay-color"]
            str += ","
            str += combat_map["map-overlay-top-left"]
        }
    }

    if (str.length > 0){
        if (includeNotes == true){
            str = `${avrae_prefix}i note ${(combat_map["map-overlay-target"] ? combat_map["map-overlay-target"] : `${attach_map}`)} ${str}`
        } else{
            str += (combat_map["map-overlay-target"] && combat_map["map-overlay-target"] != null ? ` -t ${combat_map["map-overlay-target"]}`:"")
        }
    }

    return str
}

function buildMaddTable(num, monster){
    if (!monster || !monster.monName && (!monster.monQty || monster.monQty < 1)){
        return
    }

    var monster_row = document.createElement("div")
    var prefix = (monster.monLabel ? monster.monLabel : monster.monName.split(/\s/).reduce((response,word) => response+=word.slice(0,1),''))
    var quantity = monster.monQty ? parseInt(monster.monQty): 1
    monster_row.id=`map${num}`
    monster_row.className = "row m-2 border rounded monGroup bg-secondary"

    // Header
    header_row = document.createElement("div")
    header_row.className = "row mt-2"

    header_col = document.createElement("div")
    header_col.className = "col-md-12 d-flex monHeader"

    header = document.createElement("h3")
    header.innerHTML = `${monster.monName}`
    header_col.appendChild(header)

    header_row.appendChild(header_col)
    monster_row.appendChild(header_row)

    // Add fields per monster
    for (var i=0; i < quantity; i++){
        coord = document.createElement("input")
        coord.type="text"
        coord.className = "form-control"
        coord.id = `mapMon${num}-${i+1}`
        coord.name = "monCoord"
        if (quantity>1 || (monster.monLabel && monster.monLabel.includes("#"))){
            coord.placeholder = (prefix.includes("#") ? prefix.replace("#", `${i+1}`):`${prefix}${i+1}`)
        } else {
            coord.placeholder = `${prefix}`
        }

        coord.value = monster && monster.monCoord && monster.monCoord[i] ? monster.monCoord[i]:""

        label = document.createElement("label")
        label.setAttribute("for", coord.id)
        label.innerHTML = coord.placeholder

        form = document.createElement("div")
        form.className = "form-floating"
        form.appendChild(coord)
        form.appendChild(label)

        col = document.createElement("div")
        col.className = "col-sm-3 mb-3 monPos"
        col.appendChild(form)

        monster_row.appendChild(col)
    }

    // Footer Row
    footer_row = document.createElement("div")
    footer_row.className = "row mt-2"

    footer_col = document.createElement("div")
    footer_col.className = "col mb-3"

    button = document.createElement("button")
    button.type = "button"
    button.id =`${prefix}${num}-remove`
    button.className = "btn btn-light float-end"
    button.innerHTML = "Clear"
    footer_col.appendChild(button)
    footer_row.appendChild(footer_col)
    monster_row.appendChild(footer_row)

    var fields = monster_row.querySelectorAll('input, select')
    fields.forEach(input => {
        input.addEventListener('input', saveToLocalStorage)
    })

    var buttons = monster_row.querySelectorAll('button')[0].addEventListener('click', function(event){
        var row = parseInt(event.srcElement.id.match(/\d+/)[0])
        var row = document.getElementById(`map${row}`)
        input_event = new Event("input")
        change_event = new Event("change")


        row.querySelectorAll('input').forEach(input => {
            input.value = ""
            input.dispatchEvent(input_event)
        })

        document.getElementById('mapPlanner').dispatchEvent(change_event)
    })

    return monster_row
}

function updateMaddTable(){
    var mapPlanner = document.getElementById("mapPlanner")
    var combat_plan = JSON.parse(localStorage.getItem("combat_plan") || "[]")
    var monsters = JSON.parse(localStorage.getItem("monsters") || "[]")
    var event = new Event('change')

    mapPlanner.innerHTML = ''

    combat_plan.forEach(function(monster, index){
        $('#mapPlanner').append(buildMaddTable(index+1, monster))
        document.getElementById('mapPlanner').dispatchEvent(event)
    })
}

function buildMapPlannerCommand(){
    var maps_header = document.getElementById('maps-header')
    var out = getMapCommand()

    if (out){
        maps_header.hidden=false
    } else{
        maps_header.hidden=true
    }

    document.getElementById("map-command").innerHTML =out.join("")
}

function buildMapCommand(){
    var map_header = document.getElementById('map-header')

    var out = getMonsterMapCommand()

    if (out){
        map_header.hidden=false
    } else {
        map_header.hidden=true
    }

    document.getElementById("mapCmd").innerHTML = out
}

function buildOverlayCommand(){
    var overlay_header = document.getElementById('overlay-header')
    var out = getOverlayCommand(true)

    if (out.length > 0){
        overlay_header.hidden = false
    } else {
        overlay_header.hidden = true
    }

    document.getElementById('overlay-command').innerHTML = out
}

function handleOverlay(){
    var overlayType = document.getElementById("map-overlay-type")
    var combat_plan_map = JSON.parse(localStorage.getItem("combat_map") || "{}")
    var columns = []

    formFloating = document.createElement("div")
    formFloating.className = "form-floating"

    column = document.createElement("div")
    column.className = "col-sm-3 mb-3"

    // Radius
    if (overlayType.value == "circle"){

        radiusField = document.createElement("input")
        radiusField.type = "number"
        radiusField.className = "form-control"
        radiusField.id = "map-overlay-radius"
        radiusField.name = radiusField.id
        radiusField.max = "200"
        radiusField.value = combat_plan_map[radiusField.id] ? combat_plan_map[radiusField.id]:""

        radiusLabel = document.createElement("label")
        radiusLabel.setAttribute("for", radiusField.id)
        radiusLabel.innerHTML = "Radius"

        radiusForm = formFloating.cloneNode(true)
        radiusForm.appendChild(radiusField)
        radiusForm.appendChild(radiusLabel)

        radiusColumn = column.cloneNode(true)
        radiusColumn.appendChild(radiusForm)

        columns.push(radiusColumn)

        centerField = document.createElement("input")
        centerField.type = "text",
        centerField.className = "form-control"
        centerField.id = "map-overlay-center"
        centerField.name = centerField.id
        centerField.placeholder = "Center"
        centerField.value = combat_plan_map[centerField.id] ? combat_plan_map[centerField.id]:""

        centerLabel = document.createElement("label")
        centerLabel.setAttribute("for", centerField.id)
        centerLabel.innerHTML = "Center"

        centerForm = formFloating.cloneNode(true)
        centerForm.appendChild(centerField)
        centerForm.appendChild(centerLabel)

        centerColumn = column.cloneNode(true)
        centerColumn.appendChild(centerForm)

        columns.push(centerColumn)
    }

    // Size
    if (overlayType.value == "cone" || overlayType.value == "square"){
        sizeField = document.createElement("input")
        sizeField.type = "number"
        sizeField.className = "form-control"
        sizeField.id = "map-overlay-size"
        sizeField.name = sizeField.id
        sizeField.max = "200"
        sizeField.value = combat_plan_map[sizeField.id] ? combat_plan_map[sizeField.id]:""

        sizeLabel = document.createElement("label")
        sizeLabel.setAttribute("for", sizeField.id)
        sizeLabel.innerHTML = "Size"

        sizeForm = formFloating.cloneNode(true)
        sizeForm.appendChild(sizeField)
        sizeForm.appendChild(sizeLabel)

        sizeColumn = column.cloneNode(true)
        sizeColumn.appendChild(sizeForm)

        columns.push(sizeColumn)
    }

    // Start and End
    if (overlayType.value == "cone" || overlayType.value == "line"){
        startField = document.createElement("input")
        startField.type = "text",
        startField.className = "form-control"
        startField.id = "map-overlay-start"
        startField.name = startField.id
        startField.placeholder = "Start"
        startField.value = combat_plan_map[startField.id] ? combat_plan_map[startField.id]:""

        starLabel = document.createElement("label")
        starLabel.setAttribute("for", startField.id)
        starLabel.innerHTML = "Start"

        starForm = formFloating.cloneNode(true)
        starForm.appendChild(startField)
        starForm.appendChild(starLabel)

        startColumn = column.cloneNode(true)
        startColumn.appendChild(starForm)

        columns.push(startColumn)

        endField = document.createElement("input")
        endField.type = "text",
        endField.className = "form-control"
        endField.id = "map-overlay-end"
        endField.name = endField.id
        endField.placeholder = "End"
        endField.value = combat_plan_map[endField.id] ? combat_plan_map[endField.id]:""

        endLabel = document.createElement("label")
        endLabel.setAttribute("for", endField.id)
        endLabel.innerHTML = "End"

        endForm = formFloating.cloneNode(true)
        endForm.appendChild(endField)
        endForm.appendChild(endLabel)

        endColumn = column.cloneNode(true)
        endColumn.appendChild(endForm)

        columns.push(endColumn)
    }

    // Lengths and Width
    if (overlayType.value == "line"){
        lenField = document.createElement("input")
        lenField.type = "text",
        lenField.className = "form-control"
        lenField.id = "map-overlay-len"
        lenField.name = lenField.id
        lenField.placeholder = "Length"
        lenField.value = combat_plan_map[lenField.id] ? combat_plan_map[lenField.id]:""

        lenLabel = document.createElement("label")
        lenLabel.setAttribute("for", lenField.id)
        lenLabel.innerHTML = "Length"

        lenForm = formFloating.cloneNode(true)
        lenForm.appendChild(lenField)
        lenForm.appendChild(lenLabel)

        lenColumn = column.cloneNode(true)
        lenColumn.appendChild(lenForm)

        columns.push(lenColumn)

        widField = document.createElement("input")
        widField.type = "text",
        widField.className = "form-control"
        widField.id = "map-overlay-width"
        widField.name = widField.id
        widField.placeholder = "Width"
        widField.value = combat_plan_map[widField.id] ? combat_plan_map[widField.id]:""

        widLabel = document.createElement("label")
        widLabel.setAttribute("for", widField.id)
        widLabel.innerHTML = "Width"

        widForm = formFloating.cloneNode(true)
        widForm.appendChild(widField)
        widForm.appendChild(widLabel)

        widColumn = column.cloneNode(true)
        widColumn.appendChild(widForm)

        columns.push(widColumn)
    }

    // Top Left
    if (overlayType.value == "square"){
        topLeftField = document.createElement("input")
        topLeftField.type = "text",
        topLeftField.className = "form-control"
        topLeftField.id = "map-overlay-top-left"
        topLeftField.name = topLeftField.id
        topLeftField.placeholder = "Top left"
        topLeftField.value = combat_plan_map[topLeftField.id] ? combat_plan_map[topLeftField.id]:""

        topLeftLabel = document.createElement("label")
        topLeftLabel.setAttribute("for", topLeftField.id)
        topLeftLabel.innerHTML = "Top left"

        topLeftForm = formFloating.cloneNode(true)
        topLeftForm.appendChild(topLeftField)
        topLeftForm.appendChild(topLeftLabel)

        topLeftColumn = column.cloneNode(true)
        topLeftColumn.appendChild(topLeftForm)

        columns.push(topLeftColumn)
    }

    // Color
    if (overlayType.value != ""){
        colorField = document.createElement("input")
        colorField.type = "text",
        colorField.className = "form-control"
        colorField.id = "map-overlay-color"
        colorField.name = colorField.id
        colorField.placeholder = "Color"
        colorField.value = combat_plan_map[colorField.id] ? combat_plan_map[colorField.id]:""

        colorLabel = document.createElement("label")
        colorLabel.setAttribute("for", colorField.id)
        colorLabel.innerHTML = "Color"

        colorForm = formFloating.cloneNode(true)
        colorForm.appendChild(colorField)
        colorForm.appendChild(colorLabel)

        colorColumn = column.cloneNode(true)
        colorColumn.appendChild(colorForm)

        columns.push(colorColumn)
    }

    var overlayRow = document.getElementById("overlay-row")
    overlayRow.innerHTML = ""

    // Add Elements
    columns.forEach((element) => {
        overlayRow.appendChild(element)
        element.querySelectorAll('input, select').forEach(input =>{
            input.addEventListener('input', saveToLocalStorage)
        })
    })
}

function buildMapPreview(){
    var combat_plan = JSON.parse(localStorage.getItem("combat_plan") || "[]")
    var combat_plan_map = JSON.parse(localStorage.getItem("combat_map") || "{}")
    var mon_placed = false

    combat_plan.forEach(monster => {
        if (monster.monCoord){
            monster.monCoord.forEach(coord =>{
                if (coord != null){
                    mon_placed = true
                }
            })
        }
    })

    if (combat_plan_map["map-url"] || combat_plan_map["map-size"] || mon_placed){
        var imgUrl = 'https://otfbm.io/' + (combat_plan_map["map-size"] ? combat_plan_map["map-size"]:"10x10") + (combat_plan_map["map-csettings"] ? `/@c${combat_plan_map["map-csettings"]}`:"")

        // Overlay
        if (combat_plan_map["map-overlay-type"]){
            if (combat_plan_map["map-overlay-type"] == "circle" && combat_plan_map["map-overlay-radius"] && combat_plan_map["map-overlay-color"] && combat_plan_map["map-overlay-center"]){
                imgUrl += '/*c' + combat_plan_map["map-overlay-radius"] + combat_plan_map["map-overlay-color"] + combat_plan_map["map-overlay-center"]
            } else if (combat_plan_map["map-overlay-type"] == "cone" && combat_plan_map["map-overlay-size"] && combat_plan_map["map-overlay-start"] && combat_plan_map["map-overlay-end"] && combat_plan_map["map-overlay-color"]){
                imgUrl += '/*t' + combat_plan_map["map-overlay-size"] + combat_plan_map["map-overlay-color"] + combat_plan_map["map-overlay-start"] + combat_plan_map["map-overlay-end"]
            } else if (combat_plan_map["map-overlay-type"] == "line" && combat_plan_map["map-overlay-start"] && combat_plan_map["map-overlay-end"] && combat_plan_map["map-overlay-len"] && combat_plan_map["map-overlay-width"] && combat_plan_map["map-overlay-color"] ){
                imgUrl += '/*l' + combat_plan_map["map-overlay-len"] + ',' + combat_plan_map["map-overlay-width"] + combat_plan_map["map-overlay-color"] + combat_plan_map["map-overlay-start"] + combat_plan_map["map-overlay-end"]
            } else if (combat_plan_map["map-overlay-type"] == "square" && combat_plan_map["map-overlay-size"] && combat_plan_map["map-overlay-color"] && combat_plan_map["map-overlay-top-left"]){
                imgUrl+= '/*s' + combat_plan_map["map-overlay-size"] + combat_plan_map["map-overlay-color"] + combat_plan_map["map-overlay-top-left"]
            }
        }

        // Token Placement here
        combat_plan.forEach(monster => {
            var prefix = (monster.monLabel ? monster.monLabel : monster.monName.split(/\s/).reduce((response,word) => response+=word.slice(0,1),''))
            if (monster.monCoord){
                for (var i =0; i < monster.monCoord.length; i++){
                    if (monster.monCoord[i] != null){
                        var monStr = "/" + monster.monCoord[i] + (monster.monSize ? monster.monSize:"M") + (monster.monColor ? monster.monColor:"r") + "-"

                        if (monster.monCoord.length > 1 || (monster.monLabel && monster.monLabel.includes("#"))){
                            monStr += (prefix.includes("#") ? prefix.replace("#", `${i+1}`):`${prefix}${i+1}`)
                        } else {
                            monStr += prefix
                        }

                        if (monster.monToken){monStr += "~"+monster.monToken}

                        imgUrl += monStr
                    }
                }
            }
        })

        imgUrl+= '/'

        if (combat_plan_map["map-url"]){imgUrl +=  `/?a=2&bg=${combat_plan_map["map-url"]}`}

        imgDom = document.createElement("img")
        imgDom.className = "img-fluid"
        imgDom.src = imgUrl

        mapPreview = document.getElementById("mapPreview")
        if (imgDom.outerHTML.localeCompare(mapPreview.innerHTML)!=0){
            mapPreview.innerHTML = ""
            mapPreview.hidden=false
            mapPreview.appendChild(imgDom)
        }
    } else{
        document.getElementById("mapPreview").hidden=true
    }
}

importFromURL()
onLoad()