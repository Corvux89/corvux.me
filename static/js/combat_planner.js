function addRow(){
    $('#monInventory').append(buildRow(1))
    const mInv = document.getElementById("monInventory")
    mInv.addEventListener('change', function(event){
        var row = $('#monInventory div.monster').length
        console.log(row)
        var monInventory = document.forms.monInventory
        var data = new FormData(monInventory)
        var lastNameID = `mName${row}`
        var lNameElement = document.getElementById(lastNameID)
        var rElement = document.getElementById(`mName${row-1}`)


        // Add a new row if the last one is filled out
        if (lNameElement.value != ""){
            $("#monInventory").append(buildRow(row+1))
        } else if (rElement.value == ""){
            lRow = document.getElementById(`monster${row}`)
            lRow.remove()
        }

        // Madd String

    });
}

function buildRow(num){
    var row = document.createElement("div")
    row.id = `monster${num}`
    row.className = "row m-2 border border-rounded monster"

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

    mNameLabel = document.createElement("label")
    mNameLabel.setAttribute("for",mName.id)
    mNameLabel.innerHTML = `Monster Name`

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
    mLabel.placeholder = "Monster Label"

    mLabelLabel = document.createElement("label")
    mLabelLabel.setAttribute("for", mLabel.id)
    mLabelLabel.innerHTML = "Label"

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
    mQty.value = "1"

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
    ss = document.createElement("option")
    ss.value = "S"
    ss.innerHTML = "Small"
    sm = document.createElement("option")
    sm.value = "M"
    sm.innerHTML = "Medium"
    sm.setAttribute("selected", true);
    sl = document.createElement("option")
    sl.value = "L"
    sl.innerHTML = "Large"
    sg = document.createElement("option")
    sg.value = "G"
    sg.innerHTML = "Gargantuan"

    mSize = document.createElement("select")
    mSize.className = "form-select"
    mSize.setAttribute("aria-label","Monster Size")
    mSize.id = `mSize${row}`
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
    mToken.id = `mToken${row}`
    mToken.name = mToken.id

    mTokenLabel = document.createElement("")



    row1 = document.createElement("div")
    row1.className = "row m-2"
    row1.appendChild(mNameCol)
    row1.appendChild(mLabelCol)
    row1.appendChild(mQtyCol)
    row1.appendChild(mSizeCol)



    row
        .appendChild(row1)
    return row
}

addRow()