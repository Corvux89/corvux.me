from flask import Blueprint, current_app, jsonify, redirect, request, session, url_for
from flask_discord import DiscordOAuth2Session

from constants import DISCORD_ADMINS
from helpers.general_helpers import get_bot_guilds_from_cache
from models.exceptions import NotFound


auth_blueprint = Blueprint("auth", __name__)


def redirect_dest(fallback):
    dest = request.args.get("next")
    return redirect(url_for(dest)) if dest else redirect(fallback)


@auth_blueprint.route("/login")
def login():
    discord_session: DiscordOAuth2Session = current_app.config.get("DISCORD_SESSION")

    if discord_session:
        return discord_session.create_session(
            data={"redirect": request.args.get("next", "homepage")}
        )

    return redirect(url_for("homepage"))


@auth_blueprint.route("/callback")
def callback():
    discord_session: DiscordOAuth2Session = current_app.config.get("DISCORD_SESSION")

    try:
        data = discord_session.callback()
        redirect_to = data.get("redirect", "homepage")

        user = discord_session.fetch_user()
        bot_guilds = get_bot_guilds_from_cache()
        session["guilds"] = [
            g
            for g in discord_session.fetch_guilds()
            if g.id in {g.id for g in bot_guilds}
        ]
        session["guild"] = session["guilds"][0]

        if user.id in DISCORD_ADMINS:
            session["admin"] = True

    except Exception as e:
        print(f"Issue with callback: {e}")
        return redirect(url_for("homepage"))

    return redirect(url_for(redirect_to))


@auth_blueprint.route("/logout")
def logout():
    discord_session: DiscordOAuth2Session = current_app.config.get("DISCORD_SESSION")
    discord_session.revoke()
    if session.get("guilds"):
        session.pop("guilds")
    if session.get("guild"):
        session.pop("guild")
    if session.get("admin"):
        session.pop("admin")

    return redirect(url_for("homepage"))


@auth_blueprint.route("/select_guild", methods=["GET"])
def get_guild():
    guild = next(
        (g for g in get_bot_guilds_from_cache() if session["guild"] == g["id"]), None
    )
    return jsonify(guild)


@auth_blueprint.route("/select_guild/<guild_id>", methods=["POST"])
def select_guild(guild_id: int):
    session["guild"] = next((g for g in session["guilds"] if g.id == guild_id), None)
    return jsonify(200)
