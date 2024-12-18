from flask import current_app
from flask_discord import DiscordOAuth2Session
import requests
from sqlalchemy import Date, String, cast, func
from constants import BOT_API_AUTH_TOKEN, BOT_API_URL
from helpers.general_helpers import get_members_from_cache
from models.resolute import Activity, Character, Log
import json


def log_search_filter(search_value: str, guild_id: int) -> []:
    if not search_value:
        return []
    
    members = get_members_from_cache(guild_id)
    member_filter = []
    search_filter = []
    for member in members:
        user = member.get('user', {})
        nick = member.get('nick', '') or ''
        global_name = user.get('global_name', '') or ''
        username = user.get('username', '') or ''
    
        if (search_value.lower() in nick.lower() or
            search_value.lower() in global_name.lower() or
            search_value.lower() in username.lower()):
            member_filter.append(int(user.get('id')))

    search_filter.append(cast(Log.id, String).like(f"%{search_value}%"))
    search_filter.append(Log.notes.ilike(f"%{search_value}%"))
    search_filter.append(func.to_char(Log.created_ts.cast(Date), "FMmm/FMdd/YYYY").like(f"%{search_value}%"))
    search_filter.append(Log._character_record.has(Character.name.ilike(f"%{search_value}%")))
    search_filter.append(Log._activity_record.has(Activity.value.ilike(f"%{search_value}%")))
    search_filter.append(Log._player_id.in_(member_filter))

    return search_filter


def trigger_compendium_reload():
    discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')
    current_user = discord_session.fetch_user()
    url = f"{BOT_API_URL}/reload"
    headers = {
        'auth-token': BOT_API_AUTH_TOKEN,
        'Content-Type': 'application/json'
    }
    payload = {
        'text': f'{current_user.name} [{current_user.id}] - Compendium reloaded from website'
    }
    try:
        requests.request("POST", url, headers=headers, data=json.dumps(payload))
    except:
        pass

def trigger_guild_reload(guild_id: int):
    discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')
    current_user = discord_session.fetch_user()
    url = f"{BOT_API_URL}/guild_update"
    headers = {
        'auth-token': BOT_API_AUTH_TOKEN,
        'Content-Type': 'application/json'
    }
    payload = {
        'text': f'{current_user.name} [{current_user.id}] - Guild Cache reloaded from website',
        'guild_id': guild_id
    }
    try:
        requests.request("POST", url, headers=headers, data=json.dumps(payload))
    except:
        pass

    