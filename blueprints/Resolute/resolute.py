from flask import Blueprint, Flask, abort, current_app, render_template, request, jsonify
from flask_discord import DiscordOAuth2Session
from flask_sqlalchemy import SQLAlchemy
from constants import DISCORD_GUILD_ID
from helpers.auth_helper import is_admin
from models.resolute import BotMessage, RefMessage, ResoluteGuild


resolute_blueprint = Blueprint('resolute', __name__)
app = Flask(__name__)

@resolute_blueprint.before_request
@is_admin
def before_request():
    pass

@resolute_blueprint.route('/')
def resolute_main():
    db: SQLAlchemy = current_app.config.get('DB')

    guild = db.get_or_404(ResoluteGuild, DISCORD_GUILD_ID)
    return render_template('Resolute/resolute_main.html', guild=guild)


@resolute_blueprint.route('/guild', methods=['GET', 'PATCH'])
def upsert_guild():
    db: SQLAlchemy = current_app.config.get('DB')
    guild: ResoluteGuild = db.get_or_404(ResoluteGuild, DISCORD_GUILD_ID)

    if request.method == 'GET':
        return jsonify(guild)

    elif request.method == 'PATCH':
        update_guild = ResoluteGuild(**request.get_json())

        guild.weekly_announcement = update_guild.weekly_announcement
        guild.ping_announcement = update_guild.ping_announcement
        
        db.session.commit()
    
    return abort(404)

@resolute_blueprint.route('/message', methods=['GET', 'POST', 'PATCH', 'DELETE'])
def ref_messages():
    db: SQLAlchemy = current_app.config.get('DB')
    discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')

    if request.method == "GET":
        clean_out = []

        messages: list[RefMessage] = db.session.query(RefMessage).filter(RefMessage.guild_id==DISCORD_GUILD_ID)

        for message in messages:
            msg = discord_session.bot_request(f'/channels/{message.channel_id}/messages/{message.message_id}')

            if 'id' not in msg:
                db.session.delete(message)
            else:
                channel = discord_session.bot_request(f'/channels/{message.channel_id}')
                m = BotMessage(str(message.message_id), str(message.channel_id), channel['name'], message.title, msg['content'],
                               pin=msg['pinned'],
                               error=f"{msg['message']} - Need to ensure the bot has 'Read Message History' access to #{channel.name}" if 'message' in msg else '')

                clean_out.append(vars(m))

        db.session.commit()
        return jsonify(clean_out)
    
    elif request.method == "POST":
        payload = request.get_json()

        msg = discord_session.bot_request(f"/channels/{payload['channel_id']}/messages", "POST", json={"content": payload['message']})

        if 'id' in msg:
            if payload['pin']:
                discord_session.bot_request(f"/channels/{payload['channel_id']}/pins/{msg['id']}", "PUT")

            message = RefMessage(guild_id=DISCORD_GUILD_ID, 
                                 message_id=msg['id'],
                                 channel_id=payload['channel_id'],
                                 title=payload['title'])
            
            db.session.add(message)
            db.session.commit()

            data = BotMessage(str(message.message_id), str(message.channel_id), payload['channel_name'], message.title, payload['message'], pin=payload['pin'])

            return jsonify(vars(data))
        else:
            return abort(404)
        
    elif request.method == "PATCH":
        update_message = request.get_json()
        message: RefMessage = db.get_or_404(RefMessage, update_message['message_id'])

        msg = discord_session.bot_request(f"/channels/{message.channel_id}/messages/{message.message_id}", "PATCH",
                                          json={"content": update_message['content']})
        
        if update_message['pin'] != bool(msg.get('pinned', False)):
            action = 'PUT' if update_message['pin'] else 'DELETE'
            discord_session.bot_request(f"/channels/{update_message['channel_id']}/pins/{update_message['message_id']}", action)

        data = BotMessage(str(message.message_id), str(message.channel_id), "here", message.title, update_message['content'], pin=update_message['pin'])

        return jsonify(vars(data))

    elif request.method == "DELETE":
        payload = request.get_json()

        message: RefMessage = db.get_or_404(RefMessage, payload['message_id'])

        discord_session.bot_request(f'/channels/{message.channel_id}/messages/{message.message_id}', "DELETE")
        db.session.delete(message)
        db.session.commit()

        return jsonify(200)
    
    return abort(404)
    
    
@resolute_blueprint.route('/channels', methods=['GET'])
def get_channels():
    discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')
    channels = discord_session.bot_request(f"/guilds/{DISCORD_GUILD_ID}/channels")
    clean_out = []
    for c in channels:
        if 'parent_id' in c and c.get('parent_id') != "" and c.get('type',0) not in [4, 13, 15]:
            clean_out.append({"id": c.get('id'), "name": c.get('name')})

    return jsonify(clean_out)








    
