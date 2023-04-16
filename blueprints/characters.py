import flask
import flask_login
from flask import Blueprint, current_app, render_template, redirect, url_for
from sqlalchemy import and_

from models import Character

char_blueprint = Blueprint("char", __name__)

@char_blueprint.route('/')
@char_blueprint.route('/modify_characters')
@char_blueprint.route('/modify_characers/<page>/<key>')
@flask_login.login_required
def modify_characters(page=None, key=None):
    if key:
        return redirect(f'{url_for("char.modify_characters")}/{page}/{key}')
    else:
        characters = current_app.db.session.execute(
            current_app.db.select(Character).order_by(Character.page, Character.order, Character.name)).scalars()
        return render_template('/admin/admin_character_list.html', characters=characters, link=url_for('char.modify_characters'))


@char_blueprint.route('/add_character', methods=['GET', 'POST'])
@flask_login.login_required
def add_character():
    if flask.request.method == 'POST':
        character = Character(key=flask.request.form.get('key'),
                              page=flask.request.form.get('page'),
                              name=flask.request.form.get('name'),
                              subtitle=None if flask.request.form.get('subtitle') == "" else flask.request.form.get(
                                  'subtitle'),
                              url=None if flask.request.form.get('url') == "" else flask.request.form.get('url'),
                              image=None if flask.request.form.get('image') == "" else flask.request.form.get('image'),
                              figcaption=None if flask.request.form.get('figcaption') == "" else flask.request.form.get(
                                  'figcaption'),
                              order=None if flask.request.form.get('order') == "" else flask.request.form.get('order'))
        current_app.db.session.add(character)
        current_app.db.session.commit()

        return

    return render_template('/admin/admin_character_add.html')


@char_blueprint.route('/modify_characters/<page>/<character>', methods=['GET', 'POST'])
@flask_login.login_required
def edit_character(page, character):
    if flask.request.method == 'POST':
        new_char = current_app.db.get_or_404(Character, character)
        new_char.key = flask.request.form.get('key')
        new_char.page = flask.request.form.get('page')
        new_char.name = flask.request.form.get('name')
        new_char.subtitle = None if flask.request.form.get('subtitle') == "None" else flask.request.form.get('subtitle'),
        new_char.url = None if flask.request.form.get('url') == "None" or flask.request.form.get('url') == "" else flask.request.form.get('url')
        new_char.image = None if flask.request.form.get('image') == "None" else flask.request.form.get('image'),
        new_char.figcaption = None if flask.request.form.get('figcaption') == "None" else flask.request.form.get('figcaption'),
        new_char.order = None if flask.request.form.get('order') == "None" else flask.request.form.get('order')
        current_app.db.session.add(new_char)
        current_app.db.session.commit()
        return redirect(url_for('char.modify_characters'))

    new_char = current_app.db.session.query(Character).filter(and_(Character.key == character, Character.page == page)).one()
    new_char.subtitle = "" if new_char.subtitle is None else new_char.subtitle
    new_char.url = "" if new_char.url is None else new_char.url
    new_char.image = "" if new_char.image is None else new_char.image
    new_char.figcaption = "" if new_char.figcaption is None else new_char.figcaption
    print(new_char.name)
    return render_template('/admin/admin_character_edit.html', character=new_char)
