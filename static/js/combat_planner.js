function onLoad(){
    var combat_plan = JSON.parse(localStorage.getItem("combat_plan") || "[]")

    combat_plan.forEach(function(monster, index){
        $('#monInventory').append(cloneRow(index))
        $('#mapPlanner').append(buildMapTab(index+1, monster))
    })

    // Reset Button
    document.getElementById("comReset").addEventListener('click', function(event){
        localStorage.removeItem("combat_plan")
        location.reload()
    })

    // Form
    document.getElementById("monInventory").addEventListener('change', function(event){
        buildMaddCommand()
        updateMapTab()
    })

    document.getElementById("mapPlanner").addEventListener('change', function(event){
        buildMapCommand()
    })

    document.getElementById("map-setup").addEventListener('change', function(event){
        buildMapPlannerCommand()
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

    buildMaddCommand()
    buildMapCommand()
    buildMapPlannerCommand()
}

function saveToLocalStorage(){
    var combat_plan = JSON.parse(localStorage.getItem("combat_plan") || "[]")
    var combat_plan_map = JSON.parse(localStorage.getItem("combat_map") || "{}")
    var inputName = this.name
    var inputValue = this.value

    if (inputName == "monCoord"){
        var node = parseInt(this.id.split("-")[0].match(/\d+/)[0])-1
        var monster = combat_plan[node] || {}

        monster[inputName] = monster[inputName] ? monster[inputName] : []
        monster[inputName][parseInt(this.id.split("-")[1])-1] = inputValue
    } else if (inputName.split('-')[0] == "map"){
        combat_plan_map[inputName] = inputValue

    } else {
        var node =parseInt(this.id.match(/\d+/)[0])-1
        var monster = combat_plan[node] || {}

        if (this.type == 'checkbox' && this.checked == false){
            delete monster[inputName]
        } else {
            monster[inputName] = inputValue

            if (inputName == "monQty"){
                monster["monCoord"] = monster["monCoord"] || []
                monster["monCoord"].length = inputValue
            }
        }
    }
    combat_plan[node] = monster
    localStorage.setItem("combat_plan", JSON.stringify(combat_plan))
    localStorage.setItem("combat_map", JSON.stringify(combat_plan_map))
}

function loadFromLocalStorage(input){
    var combat_plan = JSON.parse(localStorage.getItem("combat_plan") || "[]")
    var combat_plan_map = JSON.parse(localStorage.getItem("combat_map") || "{}")
    var inputName = input.name
    var change_event = new Event("change")

    if (inputName == "monCoord"){
        var node = parseInt(input.id.split("-")[0].match(/\d+/)[0]-1)
        var monster = combat_plan[node]
        var value = monster[inputName] || []
        subNode = parseInt(input.id.split("-")[1])-1
        input.value = (value.length > 0 ? value[subNode]:"")
        input.value = (value[parseInt(input.id.split("-")[1])-1] ? value[parseInt(input.id.split("-")[1])-1]:"")

    } else if (inputName.split("-")[0] == "map"){
        var value = combat_plan_map[inputName]
        if (value !== null && value){
            input.value = value
        }
    } else{
        var node =parseInt(input.id.match(/\d+/)[0])-1
        var monster = combat_plan[node] || {}
        var value = monster[inputName]

        if (value !== null && value){
            if (input.type === 'radio' || input.type == 'checkbox'){
                if (input.value == value){
                    input.checked = true
                }
            } else{
                input.value = value
            }
        }
    }

    input.dispatchEvent(change_event)
}

function cloneRow(num){
    var base = document.getElementById("monster1")
    var row = base.cloneNode(true)
    var fields = row.querySelectorAll('input, label, select')
    var header = row.querySelectorAll('h3')
    row.id = `monster${num+1}`
    if (row.id == base.id){
        return
    }

    fields.forEach(input => {
        var val = input.id || input.getAttribute("for")
        var oldNum = val.match(/\d+/)[0]
        var newID = val.replace(oldNum, num+1)

        if (input.id){
            input.id = newID
            if (input.type == "number"){
                input.value = 1
            } else if (input.tagName == "SELECT"){
                return
            } else {
                input.value = ""
            }
        }

//        if (input.name){input.name = newID}

        if (input.getAttribute("for")){input.setAttribute("for", newID)}

    })

    header.forEach(element => {
        element.innerHTML = `Monster ${num+1}`
    })

    removeButton = document.createElement("button")
    removeButton.type="button"
    removeButton.id=`monRemove${num+1}`
    removeButton.className = "btn-close ms-auto removeMon"


    row.querySelector('div.monHeader').appendChild(removeButton)

    // Add Events

    removeButton.addEventListener('click', function(event){
        var e = event.srcElement
        var row = $('#monInventory div.monster').length
        var current_row = parseInt(e.id.match(/\d+/)[0])
        if (row == current_row){
            alert("Can't remove the last row")
        } else{
            var monster = document.getElementById(`monster${current_row}`)
            var combat_plan = JSON.parse(localStorage.getItem("combat_plan") || "[]")
            combat_plan.splice(current_row-1, 1)
            localStorage.setItem("combat_plan", JSON.stringify(combat_plan))
            monster.remove()
            location.reload()
        }
    })

    var fields = row.querySelectorAll('input, select')
    fields.forEach(input => {
        input.addEventListener('input', saveToLocalStorage)
    })

    return row
}

function evaluateRow(e){
    var row = $('#monInventory div.monster').length
    var name = e.srcElement
    var current_row = parseInt(name.id.match(/\d+/)[0])
    var previous_name = document.getElementById(`monName${current_row-1}`)
    var next_name = document.getElementById(`monName${current_row+1}`)

    if (name.value != "" && current_row == row){
        var newRow = cloneRow(row)
        $('#monInventory').append(newRow)

        document.getElementById(`monName${row+1}`).addEventListener('change', function(event){
            evaluateRow(event)
        })

        document.getElementById(`monToken${row+1}`).addEventListener('change', function(event){
            validateToken(event)
        })

    } else if (name.value == "" && ((previous_name && previous_name.value == "") || (next_name && next_name.value == ""))){
        var last_row = document.getElementById(`monster${row}`)
        last_row.remove()
    }
}

function validateToken(e){
    var val = document.getElementById(e.srcElement.id).value
    var row = $('#monInventory div.monster').length
    var parent = e.srcElement.parentElement
    helpDom = document.getElementById(`mTokenHelp${row}`)

    if (isValidHttpUrl(val)){
        var base64 = btoa(val)
        var queryUrl = `https://token.otfbm.io/meta/${base64}`
        document.getElementById(e.srcElement.id).value = ""

        if (helpDom){
            helpDom.innerHTML = "We cannot process URL's at this time."
            helpDom.innerHTML += `<br><a href="${queryUrl}" target="_blank" rel="noopener noreferrer">Click here</a> to get the shortcode and replace your URL`
        } else {
            helpDom = document.createElement("small")
            helpDom.id = `mTokenHelp${row}`
            helpDom.className = "form-text text-white-50"
            helpDom.innerHTML = "We cannot process URL's at this time."
            helpDom.innerHTML += `<br><a href="${queryUrl}" target="_blank" rel="noopener noreferrer">Click here</a> to get the shortcode and replace your URL`
            parent.appendChild(helpDom)
        }
    } else {
        if (helpDom){
            helpDom.remove()
        }
    }
}

function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

function buildMaddCommand(){
    var rows = $('#monInventory div.monster').length
    var inventory_header = document.getElementById('inventory-header')
    var madd = []
    var out = ""

    // Build the MADD String
    for (i = 1; i < rows; i++){
        var str = ""
        var name = document.getElementById(`monName${i}`).value
        var label = document.getElementById(`monLabel${i}`).value
        var qt = document.getElementById(`monQty${i}`).value
        var args = document.getElementById(`monArgs${i}`).value
        var size = document.getElementById(`monSize${i}`).value
        var token = document.getElementById(`monToken${i}`).value

        if (name){
           str = `!madd "${name}"` + (qt ? ` -n ${qt}`: '') + (label ? ` -name "${label}"`:'') + (args ? ` ${args}`:'')
        }
        madd.push(str)
    }

    if (madd.length > 1){
        out += "!multiline<br>"
    }
    out += madd.join("<br>")
    if (out.length > 1){
        inventory_header.hidden = false
        document.getElementById("maddCopy").addEventListener('click', function(event){
            var copyText = document.getElementById("madd").innerHTML
            copyText = copyText.replace(/<br>/g, '\n')

            if (copyText){
                navigator.clipboard.writeText(copyText)
            }
        })
    } else {
        inventory_header.hidden = true
    }

    document.getElementById('madd').innerHTML = out
}

function buildMapTab(num, monster){
    if (!monster || !monster.monName && (!monster.monQty || monster.monQty < 1)){
        return
    }

    var monster_row = document.createElement("div")
    var prefix = (monster.monLabel ? monster.monLabel.replace("#","") : monster.monName.split(/\s/).reduce((response,word) => response+=word.slice(0,1),''))
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

    button = document.createElement("button")
    button.type = "button"
    button.id =`${prefix}${num}-remove`
    button.className = "btn-close ms-auto"
    header_col.appendChild(button)

    header_row.appendChild(header_col)
    monster_row.appendChild(header_row)

    for (var i=0; i < quantity; i++){
        coord = document.createElement("input")
        coord.type="text"
        coord.className = "form-control"
        coord.id = `mapMon${num}-${i+1}`
        coord.name = "monCoord"
        coord.placeholder = `${prefix}${i+1}`
        coord.value = monster && monster.monCoord && monster.monCoord[i] ? monster.monCoord[i]:""

        label = document.createElement("label")
        label.setAttribute("for", coord.id)
        label.innerHTML = coord.placeholder

        form = document.createElement("div")
        form.className = "form-floating"
        form.appendChild(coord)
        form.appendChild(label)

        col = document.createElement("div")
        col.className = "col-sm-2 mb-3 monPos"
        col.appendChild(form)

        monster_row.appendChild(col)
    }

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

function updateMapTab(){
    var mapPlanner = document.getElementById("mapPlanner")
    var combat_plan = JSON.parse(localStorage.getItem("combat_plan") || "[]")
    var monsters = JSON.parse(localStorage.getItem("monsters") || "[]")
    var event = new Event('change')

    mapPlanner.innerHTML = ''

    combat_plan.forEach(function(monster, index){
        $('#mapPlanner').append(buildMapTab(index+1, monster))
        document.getElementById('mapPlanner').dispatchEvent(event)
    })
}

function buildMapCommand(){
    var rows = $('#mapPlanner div.monGroup').length
    var map_header = document.getElementById('map-header')
    var coords = []
    var out = ""

    for (var i = 0; i < rows; i++){
        var positions = $(`#map${i+1} div.monPos`).length
        var size = document.getElementById(`monSize${i+1}`).value
        var token = document.getElementById(`monToken${i+1}`).value

        for (var j = 0; j < positions; j++){
            var str = ""
            var monElement = document.getElementById(`mapMon${i+1}-${j+1}`)
            var monName = monElement.placeholder
            var monCoord = monElement.value

            if (monCoord){
                str = `-t "${monName}"|${monCoord}|${size}|r` + (token ? `|\$${token}`:"")
                coords.push(str)
            }
        }
    }

    if (coords.length > 0){
        out = "!map " + coords.join(" ")
        map_header.hidden=false
        document.getElementById("mapCopy").addEventListener('click', function(event){

            var copyText = document.getElementById("mapCmd").innerHTML
            copyText = copyText.replace(/<br>/g, '\n')

            if (copyText){
                navigator.clipboard.writeText(copyText)
            }
        })
    } else{
        map_header.hidden=true
    }

    document.getElementById("mapCmd").innerHTML = out
}

function buildMapPlannerCommand(){
    var maps_header = document.getElementById('maps-header')
    var url = document.getElementById("map-url").value
    var out = ""

    if (url){
        var size = document.getElementById('map-size').value
        var csettings = document.getElementById('map-csettings').value

        out = `!map -bg "${url}"` + (size ? `-mapsize ${size}`:"") + (csettings ? `-options c${csettings}`:"")

        maps_header.hidden=false
        document.getElementById("map-command-copy").addEventListener('click', function(event){
            var copyText = document.getElementById("map-command").innerHTML
            copyText = copyText.replace(/<br>/g, '\n')

            if (copyText){
                navigator.clipboard.writeText(copyText)
            }
        })
    } else{
        maps_header.hidden=true
    }

    document.getElementById("map-command").innerHTML = out
}

onLoad()