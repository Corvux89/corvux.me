from functools import wraps
from flask import current_app, jsonify, redirect, request, session, url_for
from flask_discord import DiscordOAuth2Session
from flask_discord.models import User

from constants import DISCORD_ADMINS
from helpers.general_helpers import get_bot_guilds_from_cache
from models.exceptions import AdminAccessError, LoginError


def is_admin(f=None):
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            discord_session = current_app.config.get("DISCORD_SESSION")
            if discord_session and not discord_session.authorized:
                return redirect(url_for("auth.login", next=request.endpoint))
            elif not _is_user_admin():
                raise AdminAccessError("Admin access is required")
            return func(*args, **kwargs)

        return decorated_function

    def _is_user_admin():
        discord_session: DiscordOAuth2Session = current_app.config.get(
            "DISCORD_SESSION"
        )
        user = None

        # Handle when we have an OAuth Token in the header
        if request and (token := request.headers.get("Authorization")):
            header = {"Authorization": token}
            try:
                payload = discord_session.request(
                    "/users/@me", "GET", oauth=False, headers=header
                )
                user = User(payload=payload)
            except:
                return False

        elif not discord_session or not discord_session.authorized:
            return False

        user = discord_session.fetch_user() if not user else user
        return user.id in DISCORD_ADMINS

    # Callable functionality
    if f is None:
        return _is_user_admin()

    # Decorator functionality
    return decorator(f)


def is_api_admin(f=None):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_admin():
            raise AdminAccessError("Admin access is required")
        return f(*args, **kwargs)

    return decorated_function


def login_required(f=None):
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            discord_session = current_app.config.get("DISCORD_SESSION")
            if discord_session and not discord_session.authorized:
                return redirect(url_for("auth.login", next=request.endpoint))
            elif not _is_logged_in():
                raise LoginError()
            return func(*args, **kwargs)

        return decorated_function

    def _is_logged_in():
        discord_session: DiscordOAuth2Session = current_app.config.get(
            "DISCORD_SESSION"
        )
        if not discord_session or not discord_session.authorized:
            return False
        return True

    # Callable functionality
    if f is None:
        return _is_logged_in()

    # Decorator functionality
    return decorator(f)
