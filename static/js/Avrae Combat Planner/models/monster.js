import {inventoryContainer, maddTable} from './avraeplanner.js'

export class Monster{
    static node = "monsters"

    constructor(index, name, label, quantity, size, color, token, args, coords){
        this.name = name || ""
        this.label = label ||""
        this.quantity = quantity || 1
        this.size = size || "M"
        this.color = color || "r"
        this.token = token || ""
        this.args = args || ""
        this.coords = coords || []
        this.index = index || 1
    }

    static loadAll(){
        var monsterData = JSON.parse(localStorage.getItem(Monster.node) || "[]")

        var monsters = monsterData.map((data, index) => new Monster(
            index+1,
            data.name,
            data.label,
            data.quantity,
            data.size,
            data.color,
            data.token,
            data.args,
            data.coords
        ))

        if (monsters.length == 0){
            monsters.push(new Monster(1))
        }

        return monsters
    }

    getCombatID(number){
        return (this.getPrefix().includes('#') ? this.getPrefix().replace('#', `${number}`): `${this.getPrefix()}${number}`)
    }

    getInventoryRow(){
        return document.getElementById(`monster-${this.index}`)
    }

    getMaddRow(){
        return document.getElementById(`madd-${this.index}`)
    }

    getPrefix(){
        if (this.label){
            return this.label
        } else{
            var split = this.name.split(/\W+/)

            if (split.length == 1){
                return this.name.slice(0,2).toUpperCase()
            }
            return split.filter(word => word).map(word => word[0]).join('').toUpperCase()
        }
    }

    addInventoryRow(){
        var row = document.createElement('div')

        row.classList.add('row', 'monster', 'border', 'rounded', 'bg-secondary', 'm-2')
        row.id = `monster-${this.index}`
        row.innerHTML = `<div class="row mt-2">
                        <div class="col-md-12 d-flex monHeader">
                            <h3>Monster ${this.index}</h3>
                            ${(this.index ==1 ? "":`<button type="button" id="remove-${this.index}" class="btn-close ms-auto"></button>`)}
                        </div>
                    </div>
                    <div class="row m-2">
                        <div class="col-sm mb-3">
                            <div class="form-floating">
                                <input type="text" class="form-control" id="name-${this.index}" name="monsterName"
                                       placeholder="Monster Name" value=${this.name}>
                                <label for="name-${this.index}">Monster Name</label>
                            </div>
                        </div>
                        <div class="col-sm-2 mb-3">
                            <div class="form-floating">
                                <input type="text" class="form-control" id="label-${this.index}" name="monsterLabel"
                                       placeholder="Label" value=${this.label}>
                                <label for="label-${this.index}">Label</label>
                            </div>
                        </div>
                        <div class="col-sm-2 mb-3">
                            <div class="form-floating">
                                <input type="number" class="form-control" id="quantity-${this.index}" name="monsterQuantity" max="20"
                                       min="0" value="${this.quantity}">
                                <label for="quantity-${this.index}">Quantity</label>
                            </div>
                        </div>
                        <div class="col-sm-3 mb-3">
                            <div class="form-floating">
                                <select class="form-select" aria-label="Monster Size" id="size-${this.index}" name="monsterSize">
                                    <option value="T" ${this.size == "T" ? 'selected':""}>Tiny</option>
                                    <option value="S" ${this.size == "S" ? 'selected':""}>Small</option>
                                    <option value="M" ${this.size == "M" ? 'selected':""}>Medium</option>
                                    <option value="L" ${this.size == "L" ? 'selected':""}>Large</option>
                                    <option value="H" ${this.size == "H" ? 'selected':""}>Huge</option>
                                    <option value="G" ${this.size == "G" ? 'selected':""}>Gargantuan</option>
                                </select>
                                <label for="size-${this.index}">Size</label>
                            </div>
                        </div>
                        <div class="col-sm-2 mb-3">
                            <div class="form-floating">
                                <select class="form-select" aria-label="Token Color" id="color-${this.index}" name="monsterColor">
                                    <option value="r" ${this.color == "r" ? 'selected':""}>Red</option>
                                    <option value="w" ${this.color == "w" ? 'selected':""}>White</option>
                                    <option value="gy" ${this.color == "gy" ? 'selected':""}>Grey</option>
                                    <option value="g" ${this.color == "g" ? 'selected':""}>Green</option>
                                    <option value="y" ${this.color == "y" ? 'selected':""}>Yellow</option>
                                    <option value="pk" ${this.color == "pk" ? 'selected':""}>Pink</option>
                                    <option value="bn" ${this.color == "bn" ? 'selected':""}>Brown</option>
                                    <option value="bk" ${this.color == "bk" ? 'selected':""}>Black</option>
                                    <option value="b" ${this.color == "b" ? 'selected':""}>Blue</option>
                                    <option value="p" ${this.color == "p" ? 'selected':""}>Purple</option>
                                    <option value="c" ${this.color == "c" ? 'selected':""}>Cyan</option>
                                    <option value="o" ${this.color == "o" ? 'selected':""}>Orange</option>
                                </select>
                                <label for="color-${this.index}">Token Color</label>
                            </div>
                        </div>
                    </div>
                    <div class="row m-2">
                        <div class="col-sm-4 mb-3">
                            <div class="form-floating">
                                <input type="text" class="form-control" id="token-${this.index}" value="${this.token}" name="monsterToken" placeholder="Token Shortcode/URL">
                                <label for="token-${this.index}">Token Shortcode/URL</label>
                            </div>
                        </div>
                        <div class="col-sm mb-3">
                            <div class="form-floating">
                                <input type="text" class="form-control" id="args-${this.index}" name="monsterArgs"
                                       placeholder="Additional Arguments" value=${this.args}>
                                <label for="args-${this.index}">Additional Arguments</label>
                            </div>
                        </div>
                    </div>`

        const inputs = row.querySelectorAll('input, select')
        inputs.forEach(input => {
            input.addEventListener('change', event => {
                var elm = event.srcElement
                var node = elm.id.replace(`-${this.index}`, '')

                this[node] = elm.value

                if (node == 'quantity'){
                    this.coords.length = this.quantity
                }

                this.save()
            })

            if (input.id.includes('name')){
                input.addEventListener('change', event => {
                    var monsters = Monster.loadAll()
                    var next_monster = monsters[this.index] || undefined

                    if (this.index == monsters.length && this.name != ""){
                        var new_monster = new Monster(this.index+1)
                        new_monster.save()
                        inventoryContainer.appendChild(new_monster.addInventoryRow())
                    } else if (this.name == "" && this.index != monsters.length && (next_monster && next_monster.name == "")){
                        next_monster.getInventoryRow().remove()
                        next_monster.remove()
                    }
                })
            }

            if (input.id.includes('token')){
                input.addEventListener('change', event => {
                    validateToken(event)
                })
            }
        })

        var removeButton = row.querySelector(`#remove-${this.index}`)
        if (removeButton){
            removeButton.addEventListener('click', function(event){
                var monsters = Monster.loadAll()
                var index = event.srcElement.id.replace('remove-','')
                var monster = monsters[index-1]

                if (index == monsters.length){
                    alert("Can't remove the last row")
                } else {
                    monster.remove()
                    location.reloadAll()
                }
            })
        }

        return row
    }

    addMaddRow(){
        if (this.name == ""){
            return
        }

        var event = new Event('change')

        var row = document.createElement("div")
        row.id = `madd-${this.index}`
        row.classList.add('row', 'm-2', 'border', 'rounded', 'monGroup', 'bg-secondary')

        // Header
        var h_row = document.createElement("div")
        h_row.classList.add('row', 'mt-2')

        var h_col = document.createElement("div")
        h_col.classList.add('col-md-12', 'd-flex', 'monHeader')

        var h3 = document.createElement('h3')
        h3.innerHTML = `${this.name}`
        h_col.appendChild(h3)
        h_row.appendChild(h_col)
        row.appendChild(h_row)

        // Monster Fields
        for (var i=0; i < this.quantity; i++){
            var cInput = document.createElement('input')
            cInput.type = "text"
            cInput.classList.add('form-control')
            cInput.id = `monster-postition${this.index}-${i+1}`
            cInput.name = `monster-position`
            cInput.placeholder = this.getCombatID(i+1)

            cInput.value = this && this.coords && this.coords[i] ? this.coords[i]:""

            var cLabel = document.createElement("label")
            cLabel.setAttribute("for", cInput.id)
            cLabel.innerHTML = cInput.placeholder

            var form = document.createElement("div")
            form.classList.add('form-floating')
            form.appendChild(cInput)
            form.appendChild(cLabel)

            var col = document.createElement("div")
            col.classList.add('col-sm-3', 'mb-3', 'monPos')
            col.appendChild(form)

            row.appendChild(col)
        }

        // Footer Row
        var f_row = document.createElement("div")
        f_row.classList.add('row', 'mt-2')

        var f_col = document.createElement('div')
        f_col.classList.add('col', 'mb-3')

        // Button
        var button = document.createElement("button")
        button.type = "button"
        button.id = `madd-clear-${this.index}`
        button.classList.add('btn', 'btn-light', 'float-end')
        button.innerHTML = "Clear"
        f_col.appendChild(button)
        f_row.appendChild(f_col)


        row.appendChild(f_row)

        var fields = row.querySelectorAll('input')
        fields.forEach(input => {
            input.addEventListener('change', function(){
                var numbers = this.id.match(/\d+/g)
                var index = parseInt(numbers[0])
                var coordIndex = parseInt(numbers[1])
                var monsters = Monster.loadAll()
                var monster = monsters[index-1]
                monster.coords[coordIndex-1] = this.value
                monster.save()
            })
        })

        var button = row.querySelector('button')
        button.addEventListener('click', function(event){
            var index = event.srcElement.id.replace('madd-clear-','')
            var monsters = Monster.loadAll()
            var monster = monsters[index-1]

            monster.getMaddRow().querySelectorAll('input').forEach(input =>{
                input.value = ""
            })

            monster.coords = []
            monster.coords.length = monster.quantity
            monster.save()
        })

        return row
    }

    save(){
        var monsters = Monster.loadAll()
        monsters[this.index -1] = this
        localStorage.setItem(Monster.node, JSON.stringify(monsters));
    }

    remove(){
        var monsters = Monster.loadAll()
        monsters.splice(this.index-1, 1)
        localStorage.setItem(Monster.node, JSON.stringify(monsters));
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
    var helpDom = document.getElementById(`mTokenHelp${row}`)

    if (isValidHttpUrl(val)){
        var base64 = btoa(val)
        var queryUrl = `https://token.otfbm.io/meta/${base64}`
        var tokenDom = document.getElementById(e.srcElement.id)
        var err_str = "Something went wrong with that image. Either OTFBM doesn't have access to the image, or it is malformed.<br>Try a different image URL please"

        tokenDom.value = "loading..."

        var request = new XMLHttpRequest();
        var url = `${document.URL}shortcode`
        request.open('POST', url, true)
        request.setRequestHeader('Content-Type', 'application/json')

        request.onreadystatechange = function(){
            if (request.readyState === 4 && request.status === 200){
                var response = JSON.parse(request.responseText)
                if (response.token != ""){
                    var change_event = new Event("change")
                    tokenDom.value = response.token
                    tokenDom.dispatchEvent(change_event)

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
