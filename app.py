import json

from flask import Flask, render_template
from flask_bootstrap import Bootstrap
from flask_talisman import Talisman
from flask_sqlalchemy import SQLAlchemy

from constants import WEB_DEBUG, DB_URI
from models import Character

app = Flask(__name__)

Bootstrap(app)

db = SQLAlchemy()

app.config["SQLALCHEMY_DATABASE_URI"] = DB_URI

db.init_app(app)

app.config.update(
    DEBUG=WEB_DEBUG
)

@app.route('/')
@app.route('/home')
def homepage():
    return render_template("main.html")


@app.route('/Abeir-Toril_Walkabout/Era1')
def atw_era_1():
    characters = db.session.execute(db.select(Character).filter_by(page=1).order_by(Character.order, Character.name)).scalars()

    return render_template("character_list.html", characters=characters, header="Abeir-Toril Walkabout: Era 1",
                           link='/Abeir-Toril_Walkabout/Era1/')


@app.route('/Abeir-Toril_Walkabout/Era1/<character>')
def atw_era_1_character(character):
    character = db.get_or_404(Character, character)
    return render_template("character_profile.html", character=character,
                           button_caption="Back to Era 1", button_link="/Abeir-Toril_Walkabout/Era1")


@app.route('/Abeir-Toril_Walkabout/Era2')
def atw_era_2():
    characters = db.session.execute(db.select(Character).filter_by(page=2).order_by(Character.order, Character.name)).scalars()

    return render_template("character_list.html", characters=characters, header="Abeir-Toril Walkabout: Era 2",
                           link='/Abeir-Toril_Walkabout/Era2/')


@app.route('/Abeir-Toril_Walkabout/Era2/<character>')
def atw_era_2_player(character):
    character = db.get_or_404(Character, character)
    return render_template("character_profile.html", character=character,
                           button_caption="Back to Era 2", button_link="/Abeir-Toril_Walkabout/Era2")


@app.route('/Abeir-Toril_Walkabout/Saga3')
def atw_saga_3():
    characters = db.session.execute(db.select(Character).filter_by(page=3).order_by(Character.order, Character.name)).scalars()

    return render_template("character_list.html", characters=characters, header="Abeir-Toril Walkabout: Saga 3",
                           link='/Abeir-Toril_Walkabout/Saga3/')


@app.route('/Abeir-Toril_Walkabout/Saga3/<character>')
def atw_saga_3_player(character):
    character = db.get_or_404(Character, character)
    return render_template("character_profile.html", character=character,
                           button_caption="Back to Saga 3", button_link="/Abeir-Toril_Walkabout/Saga3")

csp = {
    'default-src': [
        '\'self\'',
        'https://docs.google.com',
        'https://code.jquery.com/'
        'https://cdn.jsdelivr.net/npm/',
        'https://www.googletagmanager.com/',
        'https://analytics.google.com/',
        'https://www.google-analytics.com/'
    ],
    'script-src': [
        '\'self\'',
        'https://code.jquery.com/',
        'https://cdn.jsdelivr.net/',
        'https://www.googletagmanager.com/'
        ],
    'img-src': [
        '*',
        'data:'
    ],

    'style-src': [
        '\'self\'',
        'https://cdn.jsdelivr.net/',
    ]
}

talisman = Talisman(
    app,
    content_security_policy=csp,
    content_security_policy_nonce_in=['script-src', 'style-src']
)

if __name__ == "__main__":
    app.run()
