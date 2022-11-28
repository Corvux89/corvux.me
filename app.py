import flask
import flask_login
from flask import Flask, render_template, redirect, url_for
from flask_bootstrap import Bootstrap
from flask_talisman import Talisman
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, current_user
from sqlalchemy import and_

from constants import WEB_DEBUG, DB_URI, SECRET_KEY, ADMIN_PASSWORD
from models import Character, User

app = Flask(__name__)

db = SQLAlchemy()
login_manager = LoginManager()

app.config["SQLALCHEMY_DATABASE_URI"] = DB_URI
app.config["SQLALCHEMY_TRACK_MODIFICATION"] = False
app.secret_key = SECRET_KEY
admin_user = {'admin': {'pw': ADMIN_PASSWORD}}

app.config.update(
    DEBUG=WEB_DEBUG
)


@login_manager.user_loader
def user_loader(username):
    if username not in admin_user:
        return

    user = User()
    user.id = username
    return user


@login_manager.request_loader
def request_loader(request):
    username = request.form.get('username')
    if username not in admin_user:
        return
    user = User()
    user.id = username
    return user


@app.route('/admin', methods=['GET', 'POST'])
def admin():
    if flask.request.method == 'POST':
        username = flask.request.form.get('username')
        if flask.request.form.get('pw') == admin_user[username]['pw']:
            user = User()
            user.id = username
            flask_login.login_user(user)
            return redirect(url_for('admin_menu'))
    elif current_user.is_authenticated:
        return redirect(url_for('admin_menu'))
    else:
        return render_template("login.html")

    return render_template('main.html')


@app.route('/admin/modify_characters')
@flask_login.login_required
def modify_characters():
    characters = db.session.execute(
        db.select(Character).order_by(Character.page, Character.order, Character.name)).scalars()
    return render_template('/admin/admin_character_list.html', characters=characters, link='/admin/modify_characters/')


@app.route('/admin/modify_characters/<page>/<character>', methods=['GET', 'POST'])
@flask_login.login_required
def edit_character(page, character):
    if flask.request.method == 'POST':
        new_char = db.get_or_404(Character, character)
        new_char.key = flask.request.form.get('key')
        new_char.page = flask.request.form.get('page')
        new_char.name = flask.request.form.get('name')
        new_char.subtitle = None if flask.request.form.get('subtitle') == "None" else flask.request.form.get('subtitle'),
        new_char.url = None if flask.request.form.get('url') == "None" or flask.request.form.get('url') == "" else flask.request.form.get('url')
        new_char.image = None if flask.request.form.get('image') == "None" else flask.request.form.get('image'),
        new_char.figcaption = None if flask.request.form.get('figcaption') == "None" else flask.request.form.get('figcaption'),
        new_char.order = None if flask.request.form.get('order') == "None" else flask.request.form.get('order')
        db.session.add(new_char)
        db.session.commit()
        return redirect(url_for('modify_characters'))

    new_char = db.session.query(Character).filter(and_(Character.key == character, Character.page == page)).one()
    new_char.subtitle = "" if new_char.subtitle is None else new_char.subtitle
    new_char.url = "" if new_char.url is None else new_char.url
    new_char.image = "" if new_char.image is None else new_char.image
    new_char.figcaption = "" if new_char.figcaption is None else new_char.figcaption
    print(new_char.name)
    return render_template('/admin/admin_character_edit.html', character=new_char)


@app.route('/admin/delete_character/<page>/<character>', methods=['POST'])
@flask_login.login_required
def delete_character(page, character):
    if flask.request.method == 'POST':
        new_char = db.session.query(Character).filter(and_(Character.key == character, Character.page == page)).one()
        db.session.delete(new_char)
        db.session.commit()

    return redirect(url_for('modify_characters'))

# TODO: Fix the defaulting if value == "" set to None
@app.route('/admin/add_character', methods=['GET', 'POST'])
@flask_login.login_required
def add_character():
    if flask.request.method == 'POST':
        character = Character(key=flask.request.form.get('key'),
                              page=flask.request.form.get('page'),
                              name=flask.request.form.get('name'),
                              subtitle=None if flask.request.form.get('subtitle') == "" else flask.request.form.get('subtitle'),
                              url=None if flask.request.form.get('url') == "" else flask.request.form.get('url'),
                              image=None if flask.request.form.get('image') == "" else flask.request.form.get('image'),
                              figcaption=None if flask.request.form.get('figcaption') == "" else flask.request.form.get('figcaption'),
                              order=None if flask.request.form.get('order') == "" else flask.request.form.get('order'))
        db.session.add(character)
        db.session.commit()
        return redirect(f'/admin/modify_characters/{character.page}/{character.key}')

    return render_template('/admin/admin_character_add.html')


@app.route('/admin_menu')
@flask_login.login_required
def admin_menu():
    return render_template('/admin/admin.html')


@app.route('/admin/logout')
def logout():
    flask_login.logout_user()
    return redirect('/')


@app.route('/')
@app.route('/home')
def homepage():
    return render_template("main.html")


@app.route('/Abeir-Toril_Walkabout/Era1')
def atw_era_1():
    characters = db.session.execute(
        db.select(Character).filter_by(page=1).order_by(Character.order, Character.name)).scalars()

    return render_template("character_list.html", characters=characters, header="Abeir-Toril Walkabout: Era 1",
                           link='/Abeir-Toril_Walkabout/Era1/')


@app.route('/Abeir-Toril_Walkabout/Era1/<character>')
def atw_era_1_character(character):
    character = db.session.query(Character).filter(and_(Character.key==character, Character.page == 1)).one()
    return render_template("character_profile.html", character=character,
                           button_caption="Back to Era 1", button_link="/Abeir-Toril_Walkabout/Era1",
                           admin=current_user.is_authenticated)


@app.route('/Abeir-Toril_Walkabout/Era2')
def atw_era_2():
    characters = db.session.execute(
        db.select(Character).filter_by(page=2).order_by(Character.order, Character.name)).scalars()

    return render_template("character_list.html", characters=characters, header="Abeir-Toril Walkabout: Era 2",
                           link='/Abeir-Toril_Walkabout/Era2/')


@app.route('/Abeir-Toril_Walkabout/Era2/<character>')
def atw_era_2_player(character):
    character = db.session.query(Character).filter(and_(Character.key==character, Character.page == 2)).one()
    return render_template("character_profile.html", character=character,
                           button_caption="Back to Era 2", button_link="/Abeir-Toril_Walkabout/Era2",
                           admin=current_user.is_authenticated)


@app.route('/Abeir-Toril_Walkabout/Saga3')
def atw_saga_3():
    characters = db.session.execute(
        db.select(Character).filter_by(page=3).order_by(Character.order, Character.name)).scalars()

    return render_template("character_list.html", characters=characters, header="Abeir-Toril Walkabout: Saga 3",
                           link='/Abeir-Toril_Walkabout/Saga3/')


@app.route('/Abeir-Toril_Walkabout/Saga3/<character>')
def atw_saga_3_player(character):
    character = db.session.query(Character).filter(and_(Character.key==character, Character.page == 3)).one()
    return render_template("character_profile.html", character=character,
                           button_caption="Back to Saga 3", button_link="/Abeir-Toril_Walkabout/Saga3",
                           admin=current_user.is_authenticated)


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
        'https://cdn.jsdelivr.net/',
        'https://www.googletagmanager.com/',
        'https://ajax.googleapis.com'
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

db.init_app(app)
login_manager.init_app(app)

Bootstrap(app)
talisman = Talisman(
    app,
    content_security_policy=csp,
    content_security_policy_nonce_in=['script-src', 'style-src']
)

if __name__ == "__main__":
    app.run()
