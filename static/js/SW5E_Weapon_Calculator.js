var weap_cal = JSON.parse(localStorage.getItem("SW5E_Weapons") || "{}")

document.querySelectorAll('input, select').forEach(input =>{
    input.addEventListener('input', calc_total)
})

function calc_total(){
    var form = document.getElementById("calcForm")
    var def_weight = weights.filter(obj => {return obj.points == 'default'})

    var total = 0
    var cost = 0
    var weight = 0
    var die = def_weight.die || ""
    var short = def_weight.short || ""
    var long = def_weight.long || ""
    var reload = def_weight.reload || ""

    // Sum everything up
    form.querySelectorAll('select').forEach(input =>{
        var selection = input.options[input.selectedIndex]
        var property = properties.filter(obj => {return obj.name == input.id})[0]

        total += parseFloat(input.value) || 0
        cost += parseFloat(input.selectedIndex) * parseFloat(property.cost) || 0
        weight += parseFloat(input.selectedIndex) * parseFloat(property.weight) || 0
    })

    // Adjust total
    var adj_total = Math.ceil(total)

    console.log("Total: " + total + " Adjusted Total: " + adj_total)

    // Adjust based on points
    for (var i = 0; i < weights.length; i++){
        var w = weights[i]
        var points = parseInt(w.points)

        // Check if we are on the correct weight
        if (!isNaN(points) && adj_total >= points && (i === (weights.length-1) || adj_total < parseFloat(weights[i+1].points))){
            cost += parseFloat(w.cost) || 0
            weight += parseFloat(w.weight) || 0
            short = w.short
            long = w.long
            reload = w.reload
            die = w.die
            break;
        }
    }


    // Some error validation
    if (total > parseFloat(weights[weights.length-1].points) || adj_total <= -1){
        die = "Invalid weapon"
        document.getElementById('summary-row').classList.add("bg-danger")
    } else if (document.getElementById('summary-row').classList.contains("bg-danger")) {
        document.getElementById('summary-row').classList.remove("bg-danger")
    }

    document.getElementById('point-total').innerHTML = total
    document.getElementById('damage-die').innerHTML = die || document.getElementById('damage-die').innerHTML
    document.getElementById('cost-total').innerHTML = cost || document.getElementById('cost-total').innerHTML
    document.getElementById('weight-total').innerHTML = weight || document.getElementById('weight-total').innerHTML
    document.getElementById('short-range').innerHTML = short || document.getElementById('short-range').innerHTML
    document.getElementById('long-range').innerHTML = long || document.getElementById('long-range').innerHTML
    document.getElementById('reload').innerHTML = reload || document.getElementById('reload').innerHTML
}

calc_total()