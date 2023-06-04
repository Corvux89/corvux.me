from flask import Flask, render_template
from flask_bootstrap import Bootstrap
from flask_talisman import Talisman

from blueprints.atw import atw_blueprint
from constants import WEB_DEBUG, SECRET_KEY
from helpers import get_csp

app = Flask(__name__)

app.secret_key = SECRET_KEY

app.config.update(
    DEBUG=WEB_DEBUG
)

@app.route('/')
@app.route('/home')
def homepage():
    return render_template("main.html")



# @app.route('/Abeir-Toril_Walkabout/Era2')
# def atw_era_2():
#     characters = db.session.execute(
#         db.select(Character).filter_by(page=2).order_by(Character.order, Character.name)).scalars()
#
#     return render_template("character_list.html", characters=characters, header="Abeir-Toril Walkabout: Era 2",
#                            link='/Abeir-Toril_Walkabout/Era2/')
#
#
# @app.route('/Abeir-Toril_Walkabout/Era2/<character>')
# def atw_era_2_player(character):
#     character = db.session.query(Character).filter(and_(Character.key==character, Character.page == 2)).one()
#     return render_template("character_profile.html", character=character,
#                            button_caption="Back to Era 2", button_link="/Abeir-Toril_Walkabout/Era2",
#                            admin=current_user.is_authenticated)
#
#
# @app.route('/Abeir-Toril_Walkabout/Saga3')
# def atw_saga_3():
#     characters = db.session.execute(
#         db.select(Character).filter_by(page=3).order_by(Character.order, Character.name)).scalars()
#
#     return render_template("character_list.html", characters=characters, header="Abeir-Toril Walkabout: Saga 3",
#                            link='/Abeir-Toril_Walkabout/Saga3/')
#
#
# @app.route('/Abeir-Toril_Walkabout/Saga3/<character>')
# def atw_saga_3_player(character):
#     character = db.session.query(Character).filter(and_(Character.key==character, Character.page == 3)).one()
#     return render_template("character_profile.html", character=character,
#                            button_caption="Back to Saga 3", button_link="/Abeir-Toril_Walkabout/Saga3",
#                            admin=current_user.is_authenticated)


csp = get_csp()


Bootstrap(app)
talisman = Talisman(
    app,
    content_security_policy=csp,
    content_security_policy_nonce_in=['script-src', 'style-src']
)


app.register_blueprint(atw_blueprint, url_prefix="/Abeir-Toril_Walkabout")

if __name__ == "__main__":
    app.run()
