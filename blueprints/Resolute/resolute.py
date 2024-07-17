import json
from flask import Blueprint, Flask, current_app, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from helpers.auth_helper import is_admin
from models.resolute import AlchemyEncoder, ResoluteGuild


resolute_blueprint = Blueprint('resolute', __name__)
app = Flask(__name__)

@resolute_blueprint.before_request
@is_admin
def before_request():
    pass

@resolute_blueprint.route('/')
def resolute_main():
    db: SQLAlchemy = current_app.config.get('DB')

    guild = db.get_or_404(ResoluteGuild, 226741726943903754)
    return render_template('Resolute/resolute_main.html', guild=guild)


@resolute_blueprint.route('/guild', methods=['GET', 'POST'])
def upsert_guild():
    db: SQLAlchemy = current_app.config.get('DB')
    guild: ResoluteGuild = db.get_or_404(ResoluteGuild, 226741726943903754)

    if request.method == 'GET':
        return json.dumps(guild, cls=AlchemyEncoder) 

    elif request.method == 'POST':
        update_guild = ResoluteGuild(**request.get_json())

        guild.weekly_announcement = update_guild.weekly_announcement
        guild.ping_announcement = update_guild.ping_announcement
        
        db.session.commit()
        data = json.dumps(guild, cls=AlchemyEncoder)
        return data
    
    return "Unsure"
    
