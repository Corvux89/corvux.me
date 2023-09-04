function addRow(){
    $('#monInventory').append(buildRow(1))
    const mInv = document.getElementById("monInventory")
    mInv.addEventListener('change', function(event){
        var row = $('#monInventory div.monster').length;
        console.log(row)
        var monInventory = document.forms.monInventory;
        var data = new FormData(monInventory);
        var lastNameID = `mName${row}`;
        var lNameElement = document.getElementById(lastNameID)

        // Add a new row if the last one is filled out
        if (lNameElement.value != ""){
            $("#monInventory").append(buildRow(row+1))
        }

    });
}

function buildRow(num){
    var row = document.createElement("div");
    row.className = "row m-2 border border-rounded monster";

    // Header
    header = document.createElement("h3");
    header.innerHTML = `Monster ${num}`;
    row.appendChild(header);

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
    row.appendChild(mNameCol)

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
    row.appendChild(mLabelCol)

    // Monster Quantity
    mQty = document.CreateElement("input")
    mQty.type = "text"
    mQty.className = "form-control"
    mQty.id = `mQty${num}`
    mQty.name = mQty.id
    mQty.placeholder =


    return row
}

addRow()