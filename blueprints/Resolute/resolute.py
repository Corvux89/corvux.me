import os

from flask import Blueprint, Flask, Response, abort, current_app, redirect, render_template, request, jsonify, url_for
from flask_discord import DiscordOAuth2Session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import and_, desc, func, asc, or_
from constants import DISCORD_GUILD_ID
from helpers.auth_helper import is_admin, login_requred
from helpers.general_helpers import bot_request_with_retry, get_channels_from_cache, get_entitlements_from_cache, get_roles_from_cache
from helpers.resolute_helpers import log_search_filter, trigger_compendium_reload, trigger_guild_reload
from models.resolute import Activity, ActivityPoints, BotMessage, Character, CodeConversion, DiscordChannel, DiscordEntitlement, DiscordMember, DiscordRole, Faction, Financial, LevelCost, Log, Player, RefMessage, ResoluteGuild, Store
from sqlalchemy.orm import joinedload


resolute_blueprint = Blueprint('resolute', __name__)
app = Flask(__name__)

@resolute_blueprint.route('/', methods=['GET'])
@login_requred
def resolute_main():
    if is_admin():
        tab_folder = "templates/Resolute/tabs"

        tabs = [f"/Resolute/tabs/{file}" for file in os.listdir(tab_folder) if file.endswith(".html")]

        return render_template('Resolute/resolute_main.html', tabs=tabs)
    
    return redirect(url_for('resolute.resolute_profile'))


@resolute_blueprint.route('/profile', methods=['GET'])
def resolute_profile():
    try:
        discord_session = current_app.config.get('DISCORD_SESSION')
        user = discord_session.fetch_user()
    except:
        return redirect(url_for('auth.login', next="resolute.resolute_profile"))    
    return render_template("Resolute/resolute_profile.html", user=user)

@resolute_blueprint.route('/terms')
def terms():
    return render_template('Resolute/terms.html')

@resolute_blueprint.route('/privacy')
def privacy():
    return render_template('Resolute/privacy.html')

@resolute_blueprint.route('/api/guild', methods=['GET'])
@resolute_blueprint.route('/api/guild/<guild_id>', methods=['GET'])
def get_guild(guild_id: int = DISCORD_GUILD_ID):
    db: SQLAlchemy = current_app.config.get('DB')
    guild: ResoluteGuild = db.get_or_404(ResoluteGuild, guild_id)
    return jsonify(guild)

@resolute_blueprint.route('/api/guild', methods=['PATCH'])
@resolute_blueprint.route('/api/guild/<guild_id>', methods=['PATCH'])
@is_admin
def update_guild(guild_id: int = DISCORD_GUILD_ID):
    db: SQLAlchemy = current_app.config.get('DB')
    guild: ResoluteGuild = db.get_or_404(ResoluteGuild, guild_id)
    update_guild = ResoluteGuild(**request.get_json())

    # Validation        
    if db.session.query(Character).filter(and_(Character._guild_id == guild_id,
                                                                            Character.active == True,
                                                                            Character.level > update_guild.max_level)).count() > 0:
        return abort(Response(f"There are current characters with a level exceeding {update_guild.max_level}", 400))
    elif db.session.query(Character._player_id,
                            func.count(Character._player_id).label('count')).filter(and_(Character._guild_id == guild_id, Character.active == True))\
                            .group_by(Character._player_id).having(func.count(Character._player_id)>update_guild.max_characters).count() > 0:
        return abort(Response(f"There are currently players with more than {update_guild.max_characters} character(s).", 400))

    guild.weekly_announcement = update_guild.weekly_announcement
    guild.ping_announcement = update_guild.ping_announcement
    guild.max_level = update_guild.max_level
    guild.handicap_cc = update_guild.handicap_cc
    guild.max_characters = update_guild.max_characters
    guild.div_limit = update_guild.div_limit
    guild.reward_threshold = update_guild.reward_threshold

    guild.entry_role = update_guild.entry_role
    guild.member_role = update_guild.member_role
    guild.admin_role = update_guild.admin_role
    guild.staff_role = update_guild.staff_role
    guild.bot_role = update_guild.bot_role
    guild.quest_role = update_guild.quest_role

    guild.tier_2_role = update_guild.tier_2_role
    guild.tier_3_role = update_guild.tier_3_role
    guild.tier_4_role = update_guild.tier_4_role
    guild.tier_5_role = update_guild.tier_5_role
    guild.tier_6_role = update_guild.tier_6_role

    guild.application_channel = update_guild.application_channel
    guild.market_channel = update_guild.market_channel
    guild.announcement_channel = update_guild.announcement_channel
    guild.staff_channel = update_guild.staff_channel
    guild.help_channel = update_guild.help_channel
    guild.arena_board_channel = update_guild.arena_board_channel
    guild.exit_channel = update_guild.exit_channel
    guild.entrance_channel = update_guild.entrance_channel
    guild.activity_points_channel = update_guild.activity_points_channel
    guild.rp_post_channel = update_guild.rp_post_channel
    guild.dev_channels = update_guild.dev_channels
    
    db.session.commit()
    trigger_guild_reload(guild.id)
    return jsonify(200)

@resolute_blueprint.route('/api/message', methods=['GET', 'POST', 'PATCH', 'DELETE'])
@resolute_blueprint.route('/api/message/<guild_id>', methods=['GET', 'POST', 'PATCH', 'DELETE'])
@resolute_blueprint.route('/api/message/<guild_id>/<message_id>', methods=['GET'])
@is_admin
def ref_messages(guild_id: int = DISCORD_GUILD_ID, message_id: int = None):
    db: SQLAlchemy = current_app.config.get('DB')
    discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')
    
    if request.method == "GET":
        if message_id:
            message: RefMessage = db.get_or_404(RefMessage, message_id)
            msg = bot_request_with_retry(f'/channels/{message.channel_id}/messages/{message.message_id}')

            if 'id' not in msg:
                db.session.delete(message)
                db.session.commit()
            else:
                channels = get_channels_from_cache(guild_id)
                channel = next((c for c in channels if c['id'] == message.channel_id), None)
                m = BotMessage(str(message.message_id), str(message.channel_id), channel['name'], message.title, msg['content'],
                               pin=msg['pinned'],
                               error=f"{msg['message']} - Need to ensure the bot has 'Read Message History' access to #{channel.name}" if 'message' in msg else '')

                return jsonify(m.__dict__)

        else:
            messages: list[RefMessage] = db.session.query(RefMessage).filter(RefMessage._guild_id==guild_id).all()
            return jsonify(messages)
    
    elif request.method == "POST":
        payload = request.get_json()

        msg = discord_session.bot_request(f"/channels/{payload['channel_id']}/messages", "POST", json={"content": payload['message']})

        if 'id' in msg:
            if payload['pin']:
                discord_session.bot_request(f"/channels/{payload['channel_id']}/pins/{msg['id']}", "PUT")

            message = RefMessage(guild_id=guild_id, 
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
@resolute_blueprint.route('/api/channels/<guild_id>', methods=['GET'])
def get_channels(guild_id: int = DISCORD_GUILD_ID):
    channels = get_channels_from_cache(guild_id)
    return jsonify([DiscordChannel(**c) for c in channels])

@resolute_blueprint.route('/api/roles', methods=['GET'])
@resolute_blueprint.route('/api/roles/<guild_id>', methods=['GET'])
def get_roles(guild_id: int = DISCORD_GUILD_ID):
    roles = get_roles_from_cache()
    return jsonify([DiscordRole(**r) for r in roles])

@resolute_blueprint.route('/api/players/', methods=["GET"])
@resolute_blueprint.route('/api/players/<guild_id>', methods=["GET"])
@resolute_blueprint.route('/api/players/<guild_id>/<player_id>', methods=["GET"])
def get_players(guild_id: int = DISCORD_GUILD_ID, player_id: int = None):
    db: SQLAlchemy = current_app.config.get('DB')
    if player_id:
        players: Player = (db.session.query(Player)
                        .filter(and_(Player._id == player_id, Player._guild_id == guild_id))
                        .options(joinedload(Player.characters))
                        .first())

    else:
        players: list[Player] = (db.session.query(Player)
                                .filter(Player._guild_id == guild_id)
                                .options(joinedload(Player.characters))
                                .all())
    return jsonify(players)

@resolute_blueprint.route('/api/logs', methods=["GET", "POST"])
@resolute_blueprint.route('/api/logs/<guild_id>', methods=["GET", "POST"])
@is_admin
def get_logs(guild_id: int = DISCORD_GUILD_ID):
    db: SQLAlchemy = current_app.config.get('DB')
    query = (db.session.query(Log)
             .filter(Log._guild_id == guild_id)
             .join(Activity)
             .outerjoin(Faction)
             .outerjoin(Character)
             .options(
                 joinedload(Log._activity_record),
                 joinedload(Log._faction_record),
                 joinedload(Log._character_record)
             ))

    if request.method == "POST":
        draw = int(request.json.get('draw', 1))
        start = int(request.json.get('start', 0))
        length = int(request.json.get('length', 10))
        order = request.json.get('order', [])
        search_value = request.json.get('search', {}).get('value', '')
        column_index = int(order[0].get('column', 0)) if len(order) > 0 else 0
        column_dir = order[0].get('dir', 'asc') if len(order) > 0 else "desc"
        
        recordsTotal = query.count()

        if search_value:
            query = query.filter(or_(*log_search_filter(search_value, guild_id)))

        # Query Sorting
        columns = [Log.id, Log.created_ts, None, None, Character.name, Activity.value, Log.notes, Log.invalid]
        column = columns[column_index]
        if column:
            query = query.order_by(desc(column)) if column_dir == 'desc' else query.order_by(asc(column))

        # Finish out the query
        filtered_records = query.count()
        logs = query.all()

        # Post query sorting because they're discord attributes
        if column_index == 2: #Author
            logs = sorted(logs,
                          key=lambda log: DiscordMember(**log.author).member_display_name if log.author else "zzz",
                          reverse=(column_dir == "desc"))
            
        elif column_index == 3: # Player
            logs = sorted(logs,
                          key=lambda log: DiscordMember(**log.member).member_display_name if log.member else "zzz",
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
    
    return jsonify(logs)

@resolute_blueprint.route('/api/activities', methods=['GET', 'PATCH'])
@is_admin
def get_activites():
    db: SQLAlchemy = current_app.config.get('DB')
    activities: list[Activity] = (db.session.query(Activity)
                                    .order_by(asc(Activity.id))
                                    .all()
                                    )

    if request.method == "GET":
        return jsonify(activities)   
    
    elif request.method == "PATCH":
        try:
            update_data = [Activity(**a) for a in request.get_json()]

            for act in update_data:
                activity = next((a for a in activities if a.id == act.id), None)        
                activity.cc = act.cc
                activity.diversion = act.diversion
                activity.points = act.points

            db.session.commit()
            trigger_compendium_reload()

            return jsonify(200)
        except Exception as e:  
            db.session.rollback()
            return jsonify({"error": "Failed to update activities"}), 500
    
@resolute_blueprint.route('/api/activity_points', methods=['GET', 'PATCH'])
@is_admin
def get_activity_points():
    db: SQLAlchemy = current_app.config.get('DB')
    points: list[ActivityPoints] = (db.session.query(ActivityPoints)
                                    .order_by(asc(ActivityPoints.id))
                                    .all()
                                    )

    if request.method == "GET":
        return jsonify(points)   
    
    elif request.method == "PATCH":
        try:
            update_data = [ActivityPoints(**a) for a in request.get_json()]

            for act in update_data:
                activity = next((a for a in points if a.id == act.id), None)        
                activity.points = act.points

            db.session.commit()
            trigger_compendium_reload()

            return jsonify(200)
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to update activity points"}), 500

@resolute_blueprint.route('/api/code_conversion', methods=['GET', 'PATCH'])
@is_admin
def get_code_conversion():
    db: SQLAlchemy = current_app.config.get('DB')
    points: list[CodeConversion] = (db.session.query(CodeConversion)
                                    .order_by(asc(CodeConversion.id))
                                    .all()
                                    )

    if request.method == "GET":
        return jsonify(points)   
    
    elif request.method == "PATCH":
        try:
            update_data = [CodeConversion(**c) for c in request.get_json()]

            for d in update_data:
                conversion = next((c for c in points if c.id == d.id), None)
                conversion.value = d.value

            db.session.commit()
            trigger_compendium_reload()

            return jsonify(200)
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to update code conversions"}), 500

@resolute_blueprint.route('/api/level_costs', methods=['GET', 'PATCH'])
@is_admin
def get_level_costs():
    db: SQLAlchemy = current_app.config.get('DB')
    costs: list[LevelCost] = (db.session.query(LevelCost)
                                    .order_by(asc(LevelCost.id))
                                    .all()
                                    )

    if request.method == "GET":
        return jsonify(costs)   
    
    elif request.method == "PATCH":
        try:
            update_data = [LevelCost(**c) for c in request.get_json()]

            for d in update_data:
                cost = next((c for c in costs if c.id == d.id), None)
                cost.cc = d.cc

            db.session.commit()
            trigger_compendium_reload()

            return jsonify(200)
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to update level costs"}), 500
    
@resolute_blueprint.route('/api/financial', methods=['GET', 'PATCH'])
@is_admin
def get_financial():
    db: SQLAlchemy = current_app.config.get('DB')
    fin: Financial = (db.session.query(Financial)
                      .first()
                                    )

    if request.method == "GET":
        return jsonify(fin)   
    
    elif request.method == "PATCH":
        try:
            update_data = Financial(**request.get_json())

            fin.monthly_goal = update_data.monthly_goal
            fin.monthly_total = update_data.monthly_total
            fin.reserve = update_data.reserve
            fin.month_count = update_data.month_count

            db.session.commit()

            return jsonify(200)
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to update financials"}), 500
    
@resolute_blueprint.route('/api/store', methods=['GET', 'PATCH'])
@is_admin
def get_store():
    db: SQLAlchemy = current_app.config.get('DB')
    store: list[Store] = (db.session.query(Store)
                          .order_by(asc(Store._sku))
                          .all())
    
    if request.method == "GET":
        return jsonify(store)
    elif request.method == "PATCH":
        try:
            update_data = [Store(**s) for s in request.get_json()]
            for s in update_data:
                if sku := next((x for x in store if x.sku == s.sku), None):
                    sku.user_cost = s.user_cost

            db.session.commit()
            return jsonify(200)
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to update store"}), 500

@resolute_blueprint.route('/api/entitlements', methods=['GET'])
@is_admin
def get_entitlements():
    entitlements = get_entitlements_from_cache()

    return jsonify([DiscordEntitlement(**e) for e in entitlements])