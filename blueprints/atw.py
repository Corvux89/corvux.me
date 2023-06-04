import flask
from flask import Blueprint, redirect, url_for, render_template

from helpers import get_all_characters, get_character

atw_blueprint = Blueprint("atw", __name__)

era1 = 'static/json/era1.json'
era2 = '/static/json/era2.json'

@atw_blueprint.route('/<era>')
def era_all(era):
    path = f'static/json/{era.lower()}.json'
    characters = get_all_characters(path)

    return render_template("atw/character_list.html", characters=characters, header="Abeir Toril Walkabout: Era 1",
                           link=f'{url_for("atw.era_all", era=era)}', admin=False)
@atw_blueprint.route('/<era>/<character>')
def era_character(era, character):
    path = f'static/json/{era.lower()}.json'
    character = get_character(path, character)

    return render_template("atw/character_profile.html", character=character, button_caption="Back to Era 1",
                           button_link=url_for("atw.era_all", era=era))
