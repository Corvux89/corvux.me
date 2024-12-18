from functools import wraps
from flask import current_app, redirect, request, session, url_for
from flask_discord import DiscordOAuth2Session

from constants import DISCORD_ADMINS


def is_admin(f=None):
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            if not _is_user_admin():
                # return redirect(url_for('homepage'))
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

class AdminAccessError(Exception):
    def __init__(self, message="Access denied. Administrator access only."):
        self.message = message
        super().__init__(self.message)