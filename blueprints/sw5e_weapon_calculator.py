import json

from flask import Blueprint, render_template

weapon_calc = Blueprint("weap_calc",__name__)

@weapon_calc.route('/')
def calc():
    return render_template('/SW5E_Weapon_Calculator/main.html')

@weapon_calc.route('/Blasters')
def blasters():
    f = open('static/json/blasters.json', encoding="utf8")
    fields = json.load(f)
    return render_template('/SW5E_Weapon_Calculator/calculator.html', fields=fields, title="Blasters")
