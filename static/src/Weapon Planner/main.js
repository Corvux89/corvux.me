import { damage_types, stats } from './type.js';
let damage_type_options = document.getElementById("damage-type-options");
let to_hit_stat = document.getElementById("weapon-to-hit-stat");
let damage_stat = document.getElementById("weapon-damage-stat");
damage_types.forEach(type => {
    let option = document.createElement('option');
    option.value = type;
    damage_type_options.appendChild(option);
});
stats.forEach(type => {
    let option = document.createElement('option');
    option.value = type;
    option.innerHTML = type;
    if (stats.indexOf(type) == 0) {
        option.selected = true;
    }
    to_hit_stat.appendChild(option);
    damage_stat.appendChild(option.cloneNode(true));
});
