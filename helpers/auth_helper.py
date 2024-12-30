from functools import wraps
from flask import current_app, redirect, request, url_for

from constants import DISCORD_ADMINS
from helpers.general_helpers import get_bot_guilds_from_cache
from models.exceptions import AdminAccessError, LoginError


def is_admin(f=None):
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            discord_session = current_app.config.get('DISCORD_SESSION')
            if discord_session and not discord_session.authorized:
                return redirect(url_for("auth.login"))
            elif not _is_user_admin():
                raise AdminAccessError()
            return func(*args, **kwargs)
        return decorated_function

    def _is_user_admin():
        discord_session = current_app.config.get('DISCORD_SESSION')
        if not discord_session or not discord_session.authorized:
            return False

        user = discord_session.fetch_user()
        return user.id in DISCORD_ADMINS

    # Callable functionality
    if f is None:
        return _is_user_admin()

    # Decorator functionality
    return decorator(f)

def login_requred(f=None):
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            discord_session = current_app.config.get('DISCORD_SESSION')
            if discord_session and not discord_session.authorized:
                return redirect(url_for("auth.login"))
            elif not _is_logged_in():
                raise LoginError()
            return func(*args, **kwargs)
        return decorated_function

    def _is_logged_in():
        discord_session = current_app.config.get('DISCORD_SESSION') 
        if not discord_session or not discord_session.authorized:
            return False
        
        try:
            user = discord_session.fetch_user()
            guilds = user.fetch_guilds()
            bot_guilds = get_bot_guilds_from_cache()
            return bool(set([g["id"] for g in bot_guilds]) & set([str(g.id) for g in guilds]))
        except:
            return False

    # Callable functionality
    if f is None:
        return _is_logged_in()

    # Decorator functionality
    return decorator(f)
