import json

from flask import Blueprint, render_template

weapon_calc = Blueprint("weap_calc",__name__)

@weapon_calc.route('/')
def calc():
    f = open('static/json/sw5e_weapon_calculator.json', encoding="utf8")
    fields = json.load(f)
    return render_template('/SW5E_Weapon_Calculator/weapon_calculator.html', data=fields)
