function addListeners(){
    document.getElementById("comReset").addEventListener('click', function(event){
        localStorage.removeItem("monsters")
        location.reload()
    })

    document.getElementById("maddCopy").addEventListener('click', function(event){
        var copyText = document.getElementById("madd").innerHTML
        copyText = copyText.replace(/<br>/g, '\n')

        if (copyText){
            navigator.clipboard.writeText(copyText)
        }
    })

    document.getElementById("mapCmdCopy").addEventListener('click', function(event){
        var copyText = document.getElementById("mapplanner").innerHTML

        copyText = copyText.replace(/<br>/g, '\n')

        if (copyText){
            navigator.clipboard.writeText(copyText)
        }
    })

    document.getElementById("monInventory").addEventListener('change', function(event){
        buildMaddCommand()
        updateMap()
    })

    document.getElementById("mapPlanner").addEventListener('change', function(event){
        buildMapCommand()
    })
}

function initialSetup(){
    var monsters = JSON.parse(localStorage.getItem("monsters") || "[]")

    if (monsters.length > 0){
        monsters.forEach(function(monster, index){
            $('#monInventory').append(buildRow(index+1, monster))
            $('#mapPlanner').append(buildMap(index+1, monster))

            document.getElementById(`mToken${index+1}`).addEventListener('change', function(event){
                validateToken(event)
            })

            document.getElementById(`mName${index+1}`).addEventListener('change', function(event){
                checkName(event)
            })
        })
    }

    var row = $('#monInventory div.monster').length
    $('#monInventory').append(buildRow(row+1))

    document.getElementById(`mToken${row+1}`).addEventListener('change', function(event){
        validateToken(event)
    })

    document.getElementById(`mName${row+1}`).addEventListener('change', function(event){
        checkName(event)
    })

    buildMaddCommand()
    buildMapCommand()
}

function updateMap(){
    var mapPlanner = document.getElementById("mapPlanner")
    var monsters = JSON.parse(localStorage.getItem("monsters") || "[]")
    mapPlanner.innerHTML = ''

    if (monsters.length > 0){
        monsters.forEach(function(monster, index){
            $('#mapPlanner').append(buildMap(index+1, monster))
            document.getElementById(`mName${index+1}`).addEventListener('change', function(event){
                checkName(event)
            })
        })
    }

//    buildMapCommand()
}

function buildMapCommand(){
    var types = $('#mapPlanner div.monGroup').length
    var monsters = JSON.parse(localStorage.getItem("monsters") || "[]")
    coords = []
    var map = []

    for (var i = 0; i < types; i++){
        var indviduals = $(`#map${i+1} div.monPos`).length
        var monster = monsters[i]
        monster.coord = []
        var size = monster.size
        var token = monster.token

        for (var j = 0; j < indviduals; j++){
            var str = ""
            var monField = document.getElementById(`mapMon${i+1}${j+1}`)
            var monName = monField.placeholder
            var monCoord = monField.value
            monster.coord[j] = monCoord

            if (monCoord){
                str = `-t "${monName}"|${monCoord}|${size}|r` + (token ? `|\$${token}`:"")
            }
            map.push(str)
        }
    }

    var out = "!map " + map.join(" ")
    document.getElementById("mapCmd").innerHTML = out
    localStorage.setItem("monsters", JSON.stringify(monsters))
}

function buildMaddCommand(){
    var rows = $('#monInventory div.monster').length
    var form = document.getElementById('monInventory')
    var monsters = JSON.parse(localStorage.getItem("monsters") || "[]")
    var madd = []
    var out = ""

    // Build the MADD String
    for (i = 1; i < rows; i++){
        var str = ""
        var name = document.getElementById(`mName${i}`).value
        var label = document.getElementById(`mLabel${i}`).value
        var qt = document.getElementById(`mQty${i}`).value
        var args = document.getElementById(`mArgs${i}`).value
        var size = document.getElementById(`mSize${i}`).value
        var token = document.getElementById(`mToken${i}`).value
        var monster = (monsters.length >= i ? monsters[i-1]:{})
        monster.name = name
        monster.label = label
        monster.size = size
        monster.qty = qt
        monster.args = args
        monster.token = token
        monster.coord = (monster.coord && monster.coord.length>0 ? monster.coord:[])
        if (monster.coord.length > parseInt(qt)){
            monster.coord.length = parseInt(qt)
        }
        if (monsters.length >= i-1){
            monsters[i-1] = monster
        } else {
            monsters.push(monster)
        }


        if (name){
           str = `!madd "${name}"` + (qt ? ` -n ${qt}`: '') + (label ? ` -name "${label}"`:'') + (args ? ` ${args}`:'')
        }
        madd.push(str)
    }

    if (madd.length > 1){
        out += "!multiline<br>"
    }
    out += madd.join("<br>")
    document.getElementById('madd').innerHTML = out
    localStorage.setItem("monsters", JSON.stringify(monsters))
}

function validateToken(e){
    var val = document.getElementById(e.srcElement.id).value
    var row = $('#monInventory div.monster').length
    var parent = e.srcElement.parentElement
    helpDom = document.getElementById(`mTokenHelp${row}`)

    if (isValidHttpUrl(val)){
        if (helpDom){
            helpDom.innerHTML = "We cannot process URL's at this time."
        } else {
            helpDom = document.createElement("small")
            helpDom.id = `mTokenHelp${row}`
            helpDom.className = "form-text text-white-50"
            helpDom.innerHTML = "We cannot process URL's at this time."
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

function checkName(e){
    var row = $('#monInventory div.monster').length
    var monName = e.srcElement
    var curRow = monName.id.match(/\d+/)[0]
    var prevName = document.getElementById(`mName${row-1}`)
    console.log(curRow)

    if (monName.value != "" && curRow == row){
        $('#monInventory').append(buildRow(row+1))
        var newName = document.getElementById(`mName${row+1}`)
        newName.addEventListener('change', function(event){
            checkName(event)
        })
    } else if (monName.value == "" && prevName && prevName.value == ""){
        var lRow = document.getElementById(`monster${row}`)
        lRow.remove()
    }
}

function buildRow(num, monster){
    var row = document.createElement("div")
    row.id = `monster${num}`
    row.className = "row m-2 border rounded monster bg-secondary"

    // Header
    header = document.createElement("h3")
    header.innerHTML = `Monster ${num}`
    row.appendChild(header)

    // All Fields
    // Monster Name
    mName = document.createElement("input")
    mName.type = "text"
    mName.className = "form-control"
    mName.id= `mName${num}`
    mName.name = mName.id
    mName.placeholder = "Monster Name"
    mName.value = (monster && monster.name ? monster.name:"")

    mNameLabel = document.createElement("label")
    mNameLabel.setAttribute("for",mName.id)
    mNameLabel.innerHTML = mName.placeholder

    mNameForm = document.createElement("div")
    mNameForm.className="form-floating"
    mNameForm.appendChild(mName)
    mNameForm.appendChild(mNameLabel)

    mNameCol = document.createElement("div")
    mNameCol.className = "col-sm mb-3"
    mNameCol.appendChild(mNameForm)

    // Monster Label
    mLabel = document.createElement("input")
    mLabel.type = "text"
    mLabel.className = "form-control"
    mLabel.id = `mLabel${num}`
    mLabel.name = mLabel.id
    mLabel.placeholder = "Label"
    mLabel.value = (monster && monster.label ? monster.label:"")

    mLabelLabel = document.createElement("label")
    mLabelLabel.setAttribute("for", mLabel.id)
    mLabelLabel.innerHTML = mLabel.placeholder

    mLabelForm = document.createElement("div")
    mLabelForm.className="form-floating"
    mLabelForm.appendChild(mLabel)
    mLabelForm.appendChild(mLabelLabel)

    mLabelCol = document.createElement("div")
    mLabelCol.className = "col-sm mb-3"
    mLabelCol.appendChild(mLabelForm)

    // Monster Quantity
    mQty = document.createElement("input")
    mQty.type = "number"
    mQty.className = "form-control"
    mQty.id = `mQty${num}`
    mQty.name = mQty.id
    mQty.value = (monster && monster.qty ? monster.qty:"1")

    mQtyLabel = document.createElement("label")
    mQtyLabel.setAttribute("for", mQty.id)
    mQtyLabel.innerHTML = "Quantity"

    mQtyForm = document.createElement("div")
    mQtyForm.className = "form-floating"
    mQtyForm.appendChild(mQty)
    mQtyForm.appendChild(mQtyLabel)

    mQtyCol = document.createElement("div")
    mQtyCol.className = "col-sm-2"
    mQtyCol.appendChild(mQtyForm)

    // Monster Size
    st = document.createElement("option")
    st.value = "T"
    st.innerHTML = "Tiny"
    if (monster && monster.size == st.value){
        st.setAttribute("selected", true)
    }
    ss = document.createElement("option")
    ss.value = "S"
    ss.innerHTML = "Small"
    if (monster && monster.size == ss.value){
        ss.setAttribute("selected", true)
    }
    sm = document.createElement("option")
    sm.value = "M"
    sm.innerHTML = "Medium"
    if (monster && monster.size == sm.value || !monster){
        sm.setAttribute("selected", true)
    }
    sl = document.createElement("option")
    sl.value = "L"
    sl.innerHTML = "Large"
    if (monster && monster.size == sl.value){
        sl.setAttribute("selected", true)
    }
    sg = document.createElement("option")
    sg.value = "G"
    sg.innerHTML = "Gargantuan"
    if (monster && monster.size == sg.value){
        sg.setAttribute("selected", true)
    }


    mSize = document.createElement("select")
    mSize.className = "form-select"
    mSize.setAttribute("aria-label","Monster Size")
    mSize.id = `mSize${num}`
    mSize.name = mSize.id
    mSize.appendChild(st)
    mSize.appendChild(ss)
    mSize.appendChild(sm)
    mSize.appendChild(sl)
    mSize.appendChild(sg)

    mSizeLabel = document.createElement("label")
    mSizeLabel.setAttribute("for", mSize.id)
    mSizeLabel.innerHTML = "Size"

    mSizeForm = document.createElement("div")
    mSizeForm.className = "form-floating"
    mSizeForm.appendChild(mSize)
    mSizeForm.appendChild(mSizeLabel)

    mSizeCol = document.createElement("div")
    mSizeCol.className = "col-sm-2"
    mSizeCol.appendChild(mSizeForm)

    //Token Fields
    mToken = document.createElement("input")
    mToken.type = "text"
    mToken.className = "form-control"
    mToken.id = `mToken${num}`
    mToken.name = mToken.id
    mToken.placeholder = "Token Shortcode"
    mToken.value = (monster && monster.token ? monster.token:"")

    mTokenLabel = document.createElement("label")
    mTokenLabel.setAttribute("for", mToken.id)
    mTokenLabel.innerHTML = mToken.placeholder

    mTokenForm = document.createElement("div")
    mTokenForm.className = "form-floating"
    mTokenForm.appendChild(mToken)
    mTokenForm.appendChild(mTokenLabel)

    mtokenCol = document.createElement("div")
    mtokenCol.className = "col-sm-3"
    mtokenCol.appendChild(mTokenForm)

    // Additional Arguments
    mArgs = document.createElement("input")
    mArgs.type = "text"
    mArgs.className = "form-control"
    mArgs.id = `mArgs${num}`
    mArgs.name = mArgs.id
    mArgs.placeholder = "Additional Arguments"
    mArgs.value = (monster && monster.args ? monster.args:"")

    mArgsLabel = document.createElement("label")
    mArgsLabel.setAttribute("for", mArgs.id)
    mArgsLabel.innerHTML = mArgs.placeholder

    mArgsForm = document.createElement("div")
    mArgsForm.className = "form-floating"
    mArgsForm.appendChild(mArgs)
    mArgsForm.appendChild(mArgsLabel)

    mArgsCol = document.createElement("div")
    mArgsCol.className = "col-sm"
    mArgsCol.appendChild(mArgsForm)


    row1 = document.createElement("div")
    row1.className = "row m-2"
    row1.appendChild(mNameCol)
    row1.appendChild(mLabelCol)
    row1.appendChild(mQtyCol)
    row1.appendChild(mSizeCol)

    row2 = document.createElement("div")
    row2.className = "row m-2"
    row2.appendChild(mtokenCol)
    row2.appendChild(mArgsCol)



    row.appendChild(row1)
    row.appendChild(row2)

    return row
}

function buildMap(num, monster){
    if (!monster || !monster.name || !monster.label || !monster.qty || monster.qty < 1){
        return ""
    }

    var prow = document.createElement("div")
    var prefix = monster.label.replace("#", "")
    prow.id = `map${num}`
    prow.className = "row m-2 border rounded monGroup"

    // Header
    header = document.createElement("h3")
    header.innerHTML = `${monster.name}`
    prow.appendChild(header)

    for (var i = 0; i < parseInt(monster.qty); i++){
        coord = document.createElement("input")
        coord.type = "text"
        coord.className = "form-control"
        coord.id = `mapMon${num}${i+1}`
        coord.Name = coord.id
        coord.placeholder = `${prefix}${i+1}`
        coord.value = (monster.coord && monster.coord.length>=i && monster.coord[i] ? monster.coord[i]:"")

        coordLabel = document.createElement("label")
        coordLabel.setAttribute("for", coord.id)
        coordLabel.innerHTML = coord.placeholder

        coordForm = document.createElement("div")
        coordForm.className = "form-floating"
        coordForm.appendChild(coord)
        coordForm.appendChild(coordLabel)

        coordCol = document.createElement("div")
        coordCol.className = "col-sm-2 mb-3 monPos"
        coordCol.appendChild(coordForm)

        prow.appendChild(coordCol)
    }

    return prow
}

initialSetup()
addListeners()
