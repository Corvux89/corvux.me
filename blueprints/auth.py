

from flask import Blueprint, current_app, redirect, request, url_for
from flask_discord import DiscordOAuth2Session


auth_blueprint = Blueprint("auth", __name__)

def redirect_dest(fallback):
    dest = request.args.get('next')
    return redirect(url_for(dest)) if dest else redirect(fallback)

@auth_blueprint.route('/login')
def login():
    discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')

    if discord_session:
        return discord_session.create_session(data={'redirect': request.args.get('next', 'homepage')})
    
    return redirect(url_for('homepage'))

@auth_blueprint.route('/callback')
def callback():
    discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')

    try:
        data = discord_session.callback()
        redirect_to = data.get('redirect', 'homepage')
    except Exception as e:
        print(f"Issue with callback: {e}")
        return redirect(url_for('homepage'))

    return redirect(url_for(redirect_to))

@auth_blueprint.route('/logout')
def logout():
    discord_session: DiscordOAuth2Session = current_app.config.get('DISCORD_SESSION')
    discord_session.revoke()
    return redirect(url_for('homepage'))
