import time
from flask_discord import DiscordOAuth2Session
from flask import current_app

from constants import CACHE_TIMEOUT, DISCORD_GUILD_ID, LIMIT


MEMBER_CACHE = {
    "members": None,
    "timestamp": 0
}

CHANNEL_CACHE = {
    "channels": None,
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

def get_channels_from_cache():
    current_time = time.time()

    if CHANNEL_CACHE['channels'] is None or (current_time - CHANNEL_CACHE['timestamp'] > CACHE_TIMEOUT):
        discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')
        channels = discord_session.bot_request(f"/guilds/{DISCORD_GUILD_ID}/channels")
        CHANNEL_CACHE['channels'] = channels
        CHANNEL_CACHE['timestamp'] = current_time
    return CHANNEL_CACHE['channels']