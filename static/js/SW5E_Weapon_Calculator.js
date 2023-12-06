var weap_cal = JSON.parse(localStorage.getItem("SW5E_Weapons") || "{}")

document.getElementById("blastersCalcForm").querySelectorAll('input, select').forEach(input =>{
    input.addEventListener('input', function(){
        calc_total('blasters')
    })
})

document.getElementById("lightweaponsCalcForm").querySelectorAll('input, select').forEach(input =>{
    input.addEventListener('input', function(){
        calc_total('lightweapons')
    })
})

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
        document.getElementById('summary-row').classList.add("bg-danger")
    } else if (document.getElementById('summary-row').classList.contains("bg-danger")) {
        document.getElementById('summary-row').classList.remove("bg-danger")
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

calc_total("blasters")
calc_total("lightweapons")