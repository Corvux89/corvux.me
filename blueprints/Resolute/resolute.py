import os

from flask import Blueprint, Flask, Response, abort, current_app, render_template, request, jsonify
from flask_discord import DiscordOAuth2Session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_, desc, func, asc, or_
from constants import DISCORD_GUILD_ID
from helpers.auth_helper import is_admin
from helpers.general_helpers import get_channels_from_cache, get_members_from_cache
from helpers.resolute_helpers import log_search_filter, log_set_discord_attributes, trigger_compendium_reload
from models.resolute import Activity, ActivityPoints, BotMessage, Character, CodeConversion, Faction, LevelCost, Log, Player, RefMessage, ResoluteGuild
from sqlalchemy.orm import joinedload


resolute_blueprint = Blueprint('resolute', __name__)
app = Flask(__name__)

@resolute_blueprint.before_request
@is_admin
def before_request():
    pass

@resolute_blueprint.route('/')
def resolute_main():
    tab_folder = "templates/Resolute/tabs"

    tabs = [f"/Resolute/tabs/{file}" for file in os.listdir(tab_folder) if file.endswith(".html")]

    return render_template('Resolute/resolute_main.html', tabs=tabs)


@resolute_blueprint.route('/api/guild', methods=['GET', 'PATCH'])
def upsert_guild():
    db: SQLAlchemy = current_app.config.get('DB')
    guild: ResoluteGuild = db.get_or_404(ResoluteGuild, DISCORD_GUILD_ID)

    if request.method == 'GET':
        return jsonify(guild)

    elif request.method == 'PATCH':
        update_guild = ResoluteGuild(**request.get_json())

        # Validation        
        if db.session.query(Character).filter(and_(Character.guild_id == DISCORD_GUILD_ID,
                                                                              Character.active == True,
                                                                              Character.level > update_guild.max_level)).count() > 0:
            abort(Response(f"There are current characters with a level exceeding {update_guild.max_level}", 400))
        elif db.session.query(Character.player_id,
                              func.count(Character.player_id).label('count')).filter(and_(Character.guild_id == DISCORD_GUILD_ID, Character.active == True))\
                              .group_by(Character.player_id).having(func.count(Character.player_id)>update_guild.max_characters).count() > 0:
            abort(Response(f"There are currently players with more than {update_guild.max_characters} character(s).", 400))

        guild.weekly_announcement = update_guild.weekly_announcement
        guild.ping_announcement = update_guild.ping_announcement
        guild.max_level = update_guild.max_level
        guild.handicap_cc = update_guild.handicap_cc
        guild.max_characters = update_guild.max_characters
        guild.div_limit = update_guild.div_limit
        
        db.session.commit()
    
    return abort(404)

@resolute_blueprint.route('/api/message', methods=['GET', 'POST', 'PATCH', 'DELETE'])
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

        message.title = update_message['title']
        db.session.commit()

        return jsonify(200)

    elif request.method == "DELETE":
        payload = request.get_json()

        message: RefMessage = db.get_or_404(RefMessage, payload['message_id'])

        discord_session.bot_request(f'/channels/{message.channel_id}/messages/{message.message_id}', "DELETE")
        db.session.delete(message)
        db.session.commit()

        return jsonify(200)
    
    return abort(404)
    
    
@resolute_blueprint.route('/api/channels', methods=['GET'])
def get_channels():
    discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')
    channels = get_channels_from_cache()
    clean_out = []
    for c in channels:
        if 'parent_id' in c and c.get('parent_id') != "" and c.get('type',0) not in [4, 13, 15]:
            clean_out.append({"id": c.get('id'), "name": c.get('name')})

    return jsonify(clean_out)

@resolute_blueprint.route('/api/players', methods=["GET"])
def get_players():
    db: SQLAlchemy = current_app.config.get('DB')
    members = get_members_from_cache()

    players: list[Player] = (db.session.query(Player)
                             .filter(Player.guild_id == DISCORD_GUILD_ID)
                             .options(joinedload(Player.characters))
                             .all())
    
    for p in players:
        p.member = next((m for m in members if int(m["user"]["id"]) == p.id), None)


    return jsonify(players)

@resolute_blueprint.route('/api/logs', methods=["GET", "POST"])
def get_logs():
    db: SQLAlchemy = current_app.config.get('DB')
    members = get_members_from_cache()
    query = (db.session.query(Log)
             .filter(Log.guild_id == DISCORD_GUILD_ID)
             .join(Activity)
             .outerjoin(Faction)
             .outerjoin(Character)
             .options(
                 joinedload(Log.activity_record),
                 joinedload(Log.faction_record),
                 joinedload(Log.character_record)
             ))

    if request.method == "POST":
        draw = int(request.json.get('draw', 1))
        start = int(request.json.get('start', 0))
        length = int(request.json.get('length', 10))
        order = request.json.get('order', [])
        search_value = request.json.get('search', {}).get('value', '')
        column_index = int(order[0].get('column', 0))
        column_dir = order[0].get('dir', 'asc')
        
        recordsTotal = query.count()

        if search_value:
            query = query.filter(or_(*log_search_filter(search_value)))

        # Query Sorting
        columns = [Log.id, Log.created_ts, None, None, Character.name, Activity.value, Log.notes, Log.invalid]
        column = columns[column_index]
        if column:
            query = query.order_by(desc(column)) if column_dir == 'desc' else query.order_by(asc(column))

        # Finish out the query
        filtered_records = query.count()
        logs = query.all()

        # Add in discord stuff
        log_set_discord_attributes(logs)

        # Post query sorting because they're discord attributes
        if column_index == 2: #Author
            logs = sorted(logs,
                          key=lambda log: (log.author_record.get("nick") or log.author_record.get('user', {}).get("global_name") or log.author_record.get('user', {}).get("username") if log.author_record else "zzz"),
                          reverse=(column_dir == "desc"))
            
        elif column_index == 3: # Player
            logs = sorted(logs,
                          key=lambda log: (log.member.get("nick") or log.member.get('user', {}).get("global_name") or log.member.get('user', {}).get("username") if log.member else "zzz"),
                          reverse=(column_dir == "desc"))
        


        # Limit
        logs = logs[start:start+length]

        response = {
            'draw': draw,
            'recordsTotal': recordsTotal,
            'recordsFiltered': filtered_records,
            'data': logs
        }

        return jsonify(response)
        


    logs: list[Log] = query.all()
    
    log_set_discord_attributes(logs)
    

    return jsonify(logs)

@resolute_blueprint.route('/api/activities', methods=['GET', 'PATCH'])
def get_activites():
    db: SQLAlchemy = current_app.config.get('DB')
    activities: list[Activity] = (db.session.query(Activity)
                                    .order_by(asc(Activity.id))
                                    .all()
                                    )

    if request.method == "GET":
        return jsonify(activities)   
    
    elif request.method == "PATCH":
        update_data = request.get_json()

        for act in update_data:
            activity = next((a for a in activities if a.id == act["id"]), None)        
            activity.cc = act["cc"]
            activity.diversion = act["diversion"]
            activity.points = act["points"]

        db.session.commit()
        trigger_compendium_reload()

        return jsonify(200)
    
@resolute_blueprint.route('/api/activity_points', methods=['GET', 'PATCH'])
def get_activity_points():
    db: SQLAlchemy = current_app.config.get('DB')
    points: list[ActivityPoints] = (db.session.query(ActivityPoints)
                                    .order_by(asc(ActivityPoints.id))
                                    .all()
                                    )

    if request.method == "GET":
        return jsonify(points)   
    
    elif request.method == "PATCH":
        update_data = request.get_json()

        for act in update_data:
            activity = next((a for a in points if a.id == act["id"]), None)        
            activity.points = act["points"]

        db.session.commit()
        trigger_compendium_reload()

        return jsonify(200)

@resolute_blueprint.route('/api/code_conversion', methods=['GET', 'PATCH'])
def get_code_conversion():
    db: SQLAlchemy = current_app.config.get('DB')
    points: list[CodeConversion] = (db.session.query(CodeConversion)
                                    .order_by(asc(CodeConversion.id))
                                    .all()
                                    )

    if request.method == "GET":
        return jsonify(points)   
    
    elif request.method == "PATCH":
        update_data = request.get_json()

        for d in update_data:
            conversion = next((c for c in points if c.id == d["id"]), None)
            conversion.value = d["value"]

        db.session.commit()
        trigger_compendium_reload()

        return jsonify(200)

@resolute_blueprint.route('/api/level_costs', methods=['GET', 'PATCH'])
def get_level_costs():
    db: SQLAlchemy = current_app.config.get('DB')
    costs: list[LevelCost] = (db.session.query(LevelCost)
                                    .order_by(asc(LevelCost.id))
                                    .all()
                                    )

    if request.method == "GET":
        return jsonify(costs)   
    
    elif request.method == "PATCH":
        update_data = request.get_json()

        for d in update_data:
            cost = next((c for c in costs if c.id == d["id"]), None)
            cost.cc = d["cc"]

        db.session.commit()
        trigger_compendium_reload()

        return jsonify(200)