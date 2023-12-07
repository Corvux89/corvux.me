function reset_form(key){
    var form = document.getElementById(`${key}CalcForm`)
    var weapons = JSON.parse(localStorage.getItem("SW5E_Weapons") || "{}")
    input_event = new Event("input")
    document.getElementById(`${key}-name`).value = null

    form.querySelectorAll('select').forEach(function(input, idx, ary){
        var property = reference[key].fields.filter(obj => {return obj.name == input.id.replace(`${key}-`,'')})[0]
        input.selectedIndex = "defValue" in property ? property.points.indexOf(property.defValue) : 0

        if (idx === ary.length - 1){
            input.dispatchEvent(input_event)
        }
    })
    weapons[key] = {}
    localStorage.setItem("SW5E_Weapons", JSON.stringify(weapons))
}

function calc_total(key){
    var form = document.getElementById(`${key}CalcForm`)
    var def_weight = reference[key].weights.filter(obj => {return obj.points == 'default'}) || weights.filter(obj => {return obj.points == '0'})

    var total = 0
    var cost = 0
    var weight = 0
    var die = def_weight.die || ""
    var short = def_weight.short || ""
    var long = def_weight.long || ""
    var reload = def_weight.reload || ""
    var point_mod = 1
    var range_mod = 1
    var reload_mod = 0

    // Sum everything up
    form.querySelectorAll('select').forEach(input =>{
        var selection = input.options[input.selectedIndex]
        var property = reference[key].fields.filter(obj => {return obj.name == input.id.replace(`${key}-`,'')})[0]

        if (selection.getAttribute("point-mod")){
            point_mod = parseFloat(selection.getAttribute("point-mod"))
        }

        total += (parseFloat(input.value) * point_mod) || 0

        // Cost
        if (selection.getAttribute("cost-override")){
            cost += parseFloat(selection.getAttribute("cost-override")) || 0
        } else {
            cost += parseFloat(input.selectedIndex) * parseFloat(property.cost) || 0
        }

        // Weight
        if (selection.getAttribute("weight-override")){
            weight += parseFloat(selection.getAttribute("weight-override")) || 0
        } else {
            weight += parseFloat(input.selectedIndex) * parseFloat(property.weight) || 0
        }

        // Range
        if (selection.getAttribute("range-mod")){
            range_mod = parseFloat(selection.getAttribute("range-mod"))
        }

        // Reload
        if (selection.getAttribute("reload-mod")){
            reload_mod = parseFloat(selection.getAttribute("reload-mod"))
        }

    })

    // Adjust total
    var adj_total = Math.ceil(total)

    // Adjust based on points
    for (var i = 0; i < reference[key].weights.length; i++){
        var w = reference[key].weights[i]
        var points = parseInt(w.points)

        // Check if we are on the correct weight
        if (!isNaN(points) && adj_total >= points && (i === (reference[key].weights.length-1) || adj_total < parseFloat(reference[key].weights[i+1].points))){
            cost += parseFloat(w.cost) || 0
            weight += parseFloat(w.weight) || 0
            short = parseFloat(w.short) * range_mod
            long = parseFloat(w.long) * range_mod
            reload = parseFloat(w.reload) + reload_mod
            die = w.die
            break;
        }
    }


    // Some error validation
    if (total > parseFloat(reference[key].weights[reference[key].weights.length-1].points) || adj_total <= -1){
        die = "Invalid weapon"
        document.getElementById(`${key}-summary-row`).classList.add("bg-danger")
    } else if (document.getElementById(`${key}-summary-row`).classList.contains("bg-danger")) {
        document.getElementById(`${key}-summary-row`).classList.remove("bg-danger")
    }

    if (document.getElementById(`${key}-point-total`) !== null){
        document.getElementById(`${key}-point-total`).innerHTML = total
    }

    if (document.getElementById(`${key}-damage-die`) !== null){
        document.getElementById(`${key}-damage-die`).innerHTML = die || document.getElementById(`${key}-damage-die`).innerHTML
    }

    if (document.getElementById(`${key}-cost-total`) !== null){
        document.getElementById(`${key}-cost-total`).innerHTML = cost || document.getElementById(`${key}-cost-total`).innerHTML
    }

    if (document.getElementById(`${key}-weight-total`) !== null){
        document.getElementById(`${key}-weight-total`).innerHTML = weight || document.getElementById(`${key}-weight-total`).innerHTML
    }

    if (document.getElementById(`${key}-short-range`) !== null){
        document.getElementById(`${key}-short-range`).innerHTML = short || document.getElementById(`${key}-short-range`).innerHTML
    }

    if (document.getElementById(`${key}-long-range`) !== null){
        document.getElementById(`${key}-long-range`).innerHTML = long || document.getElementById(`${key}-long-range`).innerHTML
    }

    if (document.getElementById(`${key}-reload`) !== null){
        document.getElementById(`${key}-reload`).innerHTML = reload || document.getElementById(`${key}-reload`).innerHTML
    }
}

function saveToLocalStorage(key, input){
    var weapons = JSON.parse(localStorage.getItem("SW5E_Weapons") || "{}")
    var inputName = input.name.replace(`${key}-`,"").replace(" ", "")
    var inputValue = input.value

    if (!weapons.hasOwnProperty(key)){
        weapons[key] = {}
    }


    weapons[key][inputName] = inputValue

    localStorage.setItem("SW5E_Weapons", JSON.stringify(weapons))
}

function loadFromLocalStorage(key, input){
    var weapons = JSON.parse(localStorage.getItem("SW5E_Weapons") || "{}")
    var data = weapons[key] || {}
    var property = reference[key].fields.filter(obj => {return obj.name == input.id.replace(`${key}-`,'')})[0]
    var inputName = input.name.replace(`${key}-`,"").replace(" ", "")
    input_event = new Event("input")

    if (data.hasOwnProperty(inputName)){
        var value = weapons[key][inputName]
    }


    if (value){
        input.value = value
        input.dispatchEvent(input_event)
    }
}

function encodeBuild(build){
    return btoa(encodeURIComponent(JSON.stringify(build)))
}

function decodeBuild(build){
    return decodeURIComponent(atob(build))
}

function exportToURL(key){
    var weapons = JSON.parse(localStorage.getItem("SW5E_Weapons") || "{}")
    var weapon = {}
    weapon[key]=weapons[key]
    var url = `?data=${encodeBuild(weapon)}`

    //window.history.replaceState({}, document.title, url)
    navigator.clipboard.writeText(`${window.location.href.replace("#/","")}${url}`)
    $(`#${key}-export`).tooltip({title: "Build copied to clipboard!", delay: {show: 500, hide: 1500}})
    $(`#${key}-export`).tooltip('show')
}

function importFromURL(){
    var urlParams = new URLSearchParams(window.location.search)
    var encodedData = urlParams.get('data')
    var weapons = JSON.parse(localStorage.getItem("SW5E_Weapons") || "{}")

    if (encodedData){
        var data = decodeBuild(encodedData)
        try {
           var parsedData = JSON.parse(data)

           for (var key in parsedData){
            weapons[key] = parsedData[key]
           }
           localStorage.setItem("SW5E_Weapons", JSON.stringify(weapons))
           window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error){
            console.error('Error parsing data: ', error)
        }
    }
}

function saveBuild(key){
    var weapons = JSON.parse(localStorage.getItem("SW5E_Weapons") || "{}")
    var weap = {}
    Object.assign(weap, weapons[key])
    if (!weapons.hasOwnProperty("saved_weapons")){
        weapons["saved_weapons"] = {}
    }

    var saved_weapons = weapons["saved_weapons"]
    if (!saved_weapons.hasOwnProperty(key)){
        saved_weapons[key] = {}
    }

    saved_weapons[key]

    if (!weap.hasOwnProperty("name")){
        alert("Must name the weapon first")
    } else if (Object.keys(saved_weapons[key]).length >= 10) {
        alert("Only allowed 10 weapons of each type at this time")
    }else{
        var name = weap.name
        delete weap.name
        var encodedData = encodeBuild(weap)

        for (const [k, v] of Object.entries(saved_weapons[key])){

            if (v==encodedData){
                delete saved_weapons[key][k]
            }
        }

        saved_weapons[key][name]=encodedData
        weapons["saved_weapons"] = saved_weapons
        localStorage.setItem("SW5E_Weapons", JSON.stringify(weapons))
        setupSaveList(key)
    }
}

function deleteBuild(key){
    var weapons = JSON.parse(localStorage.getItem("SW5E_Weapons") || "{}")
    var weap = {}
    Object.assign(weap, weapons[key])
    if (!weapons.hasOwnProperty("saved_weapons")){
        weapons["saved_weapons"] = {}
    }

    var saved_weapons = weapons["saved_weapons"]
    if (!saved_weapons.hasOwnProperty(key)){
        saved_weapons[key] = {}
    }

    saved_weapons[key]

    if (!weap.hasOwnProperty("name")){
        name = ""
    } else {
        var name = weap.name
        delete weap.name
    }
    var encodedData = encodeBuild(weap)

    for (const [k, v] of Object.entries(saved_weapons[key])){
        if (v==encodedData){
            delete saved_weapons[key][k]
            break
        } else if (k == name){
            delete saved_weapons[key][k]
            break
        }
    }

    weapons["saved_weapons"] = saved_weapons
    localStorage.setItem("SW5E_Weapons", JSON.stringify(weapons))
    setupSaveList(key)
    reset_form(key)
}

function setupSaveList(key){
    var weapons = JSON.parse(localStorage.getItem("SW5E_Weapons") || "{}")
    if (weapons.hasOwnProperty("saved_weapons")){
        saved_weapons = weapons["saved_weapons"]
        if (saved_weapons.hasOwnProperty(key)){
            var loadBtn = document.getElementById(`${key}-load`)
            var delBtn = document.getElementById(`${key}-delete`)
            var listObj = document.getElementById(`${key}-load-list`)
            listObj.innerHTML = ""

            for (const [k, v] of Object.entries(saved_weapons[key])){
                data = decodeBuild(v)
                try{
                    var weap = JSON.parse(data)
                    var data = {}
                    weap.name = k
                    data[key] = weap


                    url = `${window.location.href.replace("#/","")}?data=${encodeBuild(data)}`
                } catch(error){
                    console.error('Error parsing data: ', error)
                    continue
                }
                var adom = document.createElement("a")
                adom.className = "dropdown-item"
                adom.href = url
                adom.innerHTML = k
                var li = document.createElement("li")
                li.appendChild(adom)
                listObj.appendChild(li)
            }

            if (listObj.hasChildNodes()){
                loadBtn.hidden=false
                delBtn.hidden=false
            } else{
                loadBtn.hidden=true
                delBtn.hidden=true
            }
        }
    }
}

importFromURL()

for (const [key, value] of Object.entries(reference)){
    calc_total(key)
    setupSaveList(key)

    document.getElementById(`${key}CalcForm`).querySelectorAll('input, select').forEach(input =>{
        input.addEventListener('input', function(){
            calc_total(key)
            saveToLocalStorage(key, input)
        })

        loadFromLocalStorage(key, input)
    })

    document.getElementById(`${key}-save`).addEventListener('click', function(){
        saveBuild(key)
    })
    document.getElementById(`${key}-delete`).addEventListener('click', function(){
        deleteBuild(key)
    })

    document.getElementById(`${key}-reset`).addEventListener('click', function(){
        reset_form(key)
    })

    document.getElementById(`${key}-export`).addEventListener('click', function(){
        exportToURL(key)
    })
}