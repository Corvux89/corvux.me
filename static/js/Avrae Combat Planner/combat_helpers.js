function saveToLocalStorage(){
    var combat_plan = JSON.parse(localStorage.getItem("combat_plan") || "[]")
    var combat_plan_map = JSON.parse(localStorage.getItem("combat_map") || "{}")
    var inputName = this.name
    var inputValue = this.value

    // Put monster coordinates in an array
    if (inputName == "monCoord"){
        var node = parseInt(this.id.split("-")[0].match(/\d+/)[0])-1
        var monster = combat_plan[node] || {}

        monster[inputName] = monster[inputName] ? monster[inputName] : []
        monster[inputName][parseInt(this.id.split("-")[1])-1] = inputValue
    } else if (inputName.split('-')[0] == "map"){
        // Handle map plans
        combat_plan_map[inputName] = inputValue
    } else {
        // Monster storage
        try{
            var node =parseInt(this.id.match(/\d+/)[0])-1
        } catch(error){
        }
        var monster = combat_plan[node] || {}

        if (this.type == 'checkbox' && this.checked == false){
            delete monster[inputName]
        } else {
            monster[inputName] = inputValue

            if (inputName == "monQty"){
                // Setup the coordinate array to the same size as the number of monsters
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
        try{
            var node =parseInt(input.id.match(/\d+/)[0])-1
        } catch(error){
        }

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

function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

function getShortcode(queryUrl){
    var request = new XMLHttpRequest();
    var url = `${document.URL}shortcode`
    request.open('POST', url, true)
    request.setRequestHeader('Content-Type', 'application/json')

    request.onreadystatechange = function(){
        if (request.readyState === 4 && request.status === 200){
            var response = JSON.parse(request.responseText)
        }
    }

    request.send(JSON.stringify({"url": queryUrl}))
}

function validateToken(e){
    var val = document.getElementById(e.srcElement.id).value
    var row = $('#monInventory div.monster').length
    var parent = e.srcElement.parentElement
    helpDom = document.getElementById(`mTokenHelp${row}`)

    if (isValidHttpUrl(val)){
        var base64 = btoa(val)
        var queryUrl = `https://token.otfbm.io/meta/${base64}`
        var tokenDom = document.getElementById(e.srcElement.id)
        tokenDom.value = "Loading..."
        err_str = "Something went wrong with that image. Either OTFBM doesn't have access to the image, or it is malformed.<br>Try a different image URL please"

        var request = new XMLHttpRequest();
        var url = `${document.URL}shortcode`
        request.open('POST', url, true)
        request.setRequestHeader('Content-Type', 'application/json')

        request.onreadystatechange = function(){
            if (request.readyState === 4 && request.status === 200){
                var response = JSON.parse(request.responseText)
                if (response.token != ""){
                    input_event = new Event("input")
                    tokenDom.value = response.token
                    tokenDom.dispatchEvent(input_event)

                    if (helpDom){
                        helpDom.remove()
                    }
                } else {
                    tokenDom.value = ""
                    if (helpDom){
                        helpDom.innerHTML = err_str
                    } else {
                        helpDom = document.createElement("small")
                        helpDom.id = `mTokenHelp${row}`
                        helpDom.className = "form-text text-white-50"
                        helpDom.innerHTML = err_str
                        parent.appendChild(helpDom)
                    }
                }
            }
        }

        request.send(JSON.stringify({"url": queryUrl}))
    } else {
        if (helpDom){
            helpDom.remove()
        }
    }
}

function exportToURL(){
    var combat_plan = JSON.parse(localStorage.getItem("combat_plan") || "[]")
    var combat_plan_map = JSON.parse(localStorage.getItem("combat_map") || "{}")
    var raw_data = {"combat_plan": combat_plan, "combat_map": combat_plan_map}
    var data = JSON.stringify({"combat_plan": combat_plan, "combat_map": combat_plan_map})
    var encodedData = encodeURIComponent(data)
    var url = `?data=${encodedData}`

    //window.history.replaceState({}, document.title, url)
    navigator.clipboard.writeText(`${window.location.href}${url}`)
    $('#exportSettings').tooltip({title: "Build copied to clipboard!", delay: {show: 500, hide: 1500}})
    $('#exportSettings').tooltip('show')
}

function importFromURL(){
    var urlParams = new URLSearchParams(window.location.search)
    var encodedData = urlParams.get('data')

    if (encodedData){
        var data = decodeURIComponent(encodedData)

        try {
           var parsedData = JSON.parse(data)
           console.log(parsedData.combat_plan)

           localStorage.setItem("combat_plan", JSON.stringify(parsedData.combat_plan))
           localStorage.setItem("combat_map", JSON.stringify(parsedData.combat_map))


           window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error){
            console.error('Error parsing data: ', error)
        }
    }
}