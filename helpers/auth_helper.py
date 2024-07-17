from functools import wraps
from flask import current_app, redirect, request, url_for
from flask_discord import DiscordOAuth2Session

from constants import DISCORD_ADMINS


def is_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')
        
        if not discord_session or not discord_session.authorized:
            return redirect(url_for('auth.login', next=request.endpoint))
        
        user = discord_session.fetch_user()

        if user.id not in DISCORD_ADMINS:
           return redirect(url_for('homepage')) 

        return f(*args, **kwargs)
    
    return decorated_function 