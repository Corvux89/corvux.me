import datetime
import time
from flask import Blueprint, Flask, Response, abort, current_app, render_template, request, jsonify
from flask_discord import DiscordOAuth2Session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Date, String, and_, case, cast, desc, func, asc, nulls_last, or_
from constants import CACHE_TIMEOUT, DISCORD_GUILD_ID, LIMIT
from helpers.auth_helper import is_admin
from models.resolute import Activity, BotMessage, Character, Log, Player, RefMessage, ResoluteGuild
from sqlalchemy.orm import joinedload
from sqlalchemy.dialects import postgresql


resolute_blueprint = Blueprint('resolute', __name__)
app = Flask(__name__)
MEMBER_CACHE = {
    "members": None,
    "timestamp": 0
}

def get_members_from_cache():
    current_time = time.time()

    if MEMBER_CACHE["members"] is None or (current_time - MEMBER_CACHE['timestamp'] > CACHE_TIMEOUT):
        discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')
        members = discord_session.bot_request(f"/guilds/{DISCORD_GUILD_ID}/members?limit={LIMIT}")
        MEMBER_CACHE['members'] = members
        MEMBER_CACHE['timestamp'] = current_time
    return MEMBER_CACHE['members']


@resolute_blueprint.before_request
@is_admin
def before_request():
    pass

@resolute_blueprint.route('/')
def resolute_main():
    return render_template('Resolute/resolute_main.html')


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
    channels = discord_session.bot_request(f"/guilds/{DISCORD_GUILD_ID}/channels")
    clean_out = []
    for c in channels:
        if 'parent_id' in c and c.get('parent_id') != "" and c.get('type',0) not in [4, 13, 15]:
            clean_out.append({"id": c.get('id'), "name": c.get('name')})

    return jsonify(clean_out)

@resolute_blueprint.route('/api/players', methods=["GET"])
def get_players():
    db: SQLAlchemy = current_app.config.get('DB')
    discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')
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

    if request.method == "POST":
        draw = int(request.json.get('draw', 1))
        start = int(request.json.get('start', 0))
        length = int(request.json.get('length', 10))
        order = request.json.get('order', [])
        search_value = request.json.get('search', {}).get('value', '')
        column_index = int(order[0].get('column', 0))
        column_dir = order[0].get('dir', 'asc')

        member_filter = []
        if search_value:
            for member in members:
                user = member.get('user', {})
                nick = member.get('nick', '') or ''
                global_name = user.get('global_name', '') or ''
                username = user.get('username', '') or ''
            
                if (search_value.lower() in nick.lower() or
                    search_value.lower() in global_name.lower() or
                    search_value.lower() in username.lower()):
                    member_filter.append(int(user.get('id')))

        query = (db.session.query(Log)
             .filter(Log.guild_id == DISCORD_GUILD_ID)
             .options(
                 joinedload(Log.activity_record), 
                 joinedload(Log.faction_record),
                 joinedload(Log.character_record)))
        
        recordsTotal = query.count()

        # Apply search filter
        search_filter = []
        if search_value:
            search_filter.append(cast(Log.id, String).like(f"%{search_value}%"))
            search_filter.append(Log.notes.ilike(f"%{search_value}%"))
            search_filter.append(func.to_char(Log.created_ts.cast(Date), "FMmm/FMdd/YYYY").like(f"%{search_value}%"))
            search_filter.append(Log.character_record.has(Character.name.ilike(f"%{search_value}%")))
            search_filter.append(Log.activity_record.has(Activity.value.ilike(f"%{search_value}%")))

            # Filter by member IDs if any matched
            if member_filter:
                search_filter.append(Log.player_id.in_(member_filter))

            query = query.filter(or_(*search_filter))

        # Query Sorting
        columns = [Log.id, Log.created_ts, None, None, None, None, Log.notes, Log.invalid]
        column = columns[column_index]
        if column:
            query = query.order_by(desc(column)) if column_dir == 'desc' else query.order_by(asc(column))

        # Finish out the query
        filtered_records = query.count()
        logs = query.all()

        # Add in discord stuff
        for log in logs:
            log.member = next((m for m in members if int(m["user"]["id"]) == log.player_id), None)
            log.author_record = next((m for m in members if int(m["user"]["id"]) == log.author), None)

        # Post query sorting
        if column_index == 2: #Author
            logs = sorted(logs,
                          key=lambda log: (log.author_record.get("nick") or log.author_record.get('user', {}).get("global_name") or log.author_record.get('user', {}).get("username") if log.author_record else "zzz"),
                          reverse=(column_dir == "desc"))
            
        elif column_index == 3: # Player
            logs = sorted(logs,
                          key=lambda log: (log.member.get("nick") or log.member.get('user', {}).get("global_name") or log.member.get('user', {}).get("username") if log.member else "zzz"),
                          reverse=(column_dir == "desc"))
        
        elif column_index == 4: # Character
            logs = sorted(logs,
                          key=lambda log: (log.character_record.name if log.character_record else 'zzz'),
                          reverse=(column_dir == "desc"))
            
        elif column_index == 5: # Activity
            logs = sorted(logs,
                          key=lambda log: log.activity_record.value,
                          reverse=(column_dir == "desc"))


        # Limit
        logs = logs[start:start+length]

        response = {
            'draw': draw,
            'recordsTotal': recordsTotal,
            'recordsFiltered': filtered_records,
            'data': logs
        }

        # Serialize using json.dumps with your custom encoder
        return jsonify(response)
        


    logs: list[Log] = (db.session.query(Log)
                    .filter(Log.guild_id == DISCORD_GUILD_ID)
                    .options(
                        joinedload(Log.activity_record),
                        joinedload(Log.faction_record)
                        )
                        .order_by(desc(Log.id))
                    .all()
                    )
    
    for log in logs:
        log.member = next((m for m in members if int(m["user"]["id"]) == log.player_id), None)
        log.author_record = next((m for m in members if int(m["user"]["id"]) == log.author), None)
    

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

        return jsonify(200)
        


