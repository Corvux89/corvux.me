import { overlayRow } from "./avraeplanner.js"
import { BattleMap } from "./battlemap.js"

export class Overlay{
    constructor(type, target, radius, center, size, start, end, length, width, topleft, color){
        this.type = type || ""
        this.target = target || ""
        this.radius = radius || ""
        this.center = center || ""
        this.size = size || ""
        this.start = start || ""
        this.end = end || ""
        this.end = end || ""
        this.length = length || ""
        this.width = width || ""
        this.topleft = topleft || ""
        this.color = color || ""
    }

    static load(overlay){
        return new Overlay(
            overlay.type,
            overlay.target,
            overlay.radius,
            overlay.center,
            overlay.size,
            overlay.start,
            overlay.end,
            overlay.length,
            overlay.width,
            overlay.topleft,
            overlay.color
        )
    }

    setupTable(){
        var columns = []
        if (this.type == "circle"){
            columns.push(createInputElement("map-overlayRadius", "Radius",  this.radius, "number", 200))
            columns.push(createInputElement("map-overlayCenter", "Center", this.center, "text"))
        }

        if (this.type == "cone" || this.type == "square"){
            columns.push(createInputElement("map-overlaySize", "Size", this.size, "number", 200))
        }

        if (this.type == "cone" || this.type == "line"){
            columns.push(createInputElement("map-overlayStart", "Start", this.start, "text"))
            columns.push(createInputElement("map-overlayEnd", "End", this.end, "text"))
        }

        if (this.type == "line"){
            columns.push(createInputElement("map-overlayLength", "Length", this.length, "text"))
            columns.push(createInputElement("map-overlayWidth", "Width", this.width, "text"))
        }

        if (this.type == "square"){
            columns.push(createInputElement("map-overlayTopLeft", "Top left", this.topleft, "text"))
        }

        if (this.type != ""){
            columns.push(createInputElement("map-overlayColor", "Color", this.color, "text"))
        }

        overlayRow.innerHTML = ""
        columns.forEach(element => {
            overlayRow.appendChild(element)
        })
    }
}

function createInputElement(id, label, value, type, max){
    var inputField = document.createElement("input")
    inputField.type = type
    inputField.classList.add("form-control")
    inputField.id = id
    inputField.name = id
    inputField.placeholder = label
    inputField.value = value

    if (type == "number" && max){
        inputField.max = max
    }

    var inputLabel = document.createElement("label")
    inputLabel.setAttribute("for", id)
    inputLabel.innerHTML = label

    var formFloating = document.createElement("div")
    formFloating.classList.add("form-floating")
    formFloating.appendChild(inputField)
    formFloating.appendChild(inputLabel)

    var column = document.createElement("div")
    column.classList.add('col-sm-3', 'mb-3')
    column.appendChild(formFloating)

    return column
}