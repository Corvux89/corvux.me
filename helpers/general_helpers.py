import time
from flask_discord import DiscordOAuth2Session
from flask import current_app

from constants import CACHE_TIMEOUT, DISCORD_GUILD_ID, LIMIT


MEMBER_CACHE = {}

CHANNEL_CACHE = {}

ROLE_CACHE = {}

def get_members_from_cache(guild_id: int = DISCORD_GUILD_ID):
    current_time = time.time()

    if guild_id not in MEMBER_CACHE:
        MEMBER_CACHE[guild_id] = {"members": None, "timestamp": 0}

    cache = MEMBER_CACHE[guild_id]

    if cache["members"] is None or (current_time - cache['timestamp'] > CACHE_TIMEOUT):
        discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')
        members = discord_session.bot_request(f"/guilds/{guild_id}/members?limit={LIMIT}")
        cache['members'] = members
        cache['timestamp'] = current_time
    return cache['members']

def get_channels_from_cache(guild_id: int = DISCORD_GUILD_ID):
    current_time = time.time()

    if guild_id not in CHANNEL_CACHE:
        CHANNEL_CACHE[guild_id] = {"channels": None, "timestamp": 0}

    cache = CHANNEL_CACHE[guild_id]

    if cache['channels'] is None or (current_time - cache['timestamp'] > CACHE_TIMEOUT):
        discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')
        channels = discord_session.bot_request(f"/guilds/{guild_id}/channels")
        cache['channels'] = channels
        cache['timestamp'] = current_time
    return cache['channels']

def get_roles_from_cache(guild_id: int = DISCORD_GUILD_ID):
    current_time = time.time()

    if guild_id not in ROLE_CACHE:
        ROLE_CACHE[guild_id] = {"roles": None, "timestamp": 0}

    cache = ROLE_CACHE[guild_id]

    if cache['roles'] is None or (current_time - cache['timestamp'] > CACHE_TIMEOUT):
        discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')
        roles = discord_session.bot_request(f"/guilds/{guild_id}/roles")
        cache['roles'] = roles
        cache['timestamp'] = current_time
    return cache['roles']