import flask
import flask_login
from flask import Blueprint, redirect, url_for, render_template, current_app

from helpers.auth_helpers import is_admin
from models import Character

admin_blueprint = Blueprint("admin", __name__)

@admin_blueprint.before_request
@is_admin
def before_request():
    pass

@admin_blueprint.route('/')
@admin_blueprint.route('/<path>')
def admin(path=None):
    if path:
        return redirect(f'{url_for("admin.admin")}/{path}')
    else:
        return render_template('/admin/admin.html')


