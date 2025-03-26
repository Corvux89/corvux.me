from flask import Blueprint, current_app, jsonify, redirect, request, session, url_for
from flask_discord import DiscordOAuth2Session
from flask_discord.models import Guild

from constants import DISCORD_ADMINS
from helpers.general_helpers import get_bot_guilds_from_cache
from helpers.auth_helper import login_required
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
        combined_guilds = [
            g
            for g in discord_session.fetch_guilds()
            if g.id in {g.id for g in bot_guilds}
        ]
        session["guilds"] = combined_guilds
        session["guild"] = combined_guilds[0]

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


@auth_blueprint.route("/session", methods=["GET"])
@login_required
def get_guild():
    discord_session: DiscordOAuth2Session = current_app.config.get("DISCORD_SESSION")
    bot_guilds = get_bot_guilds_from_cache()

    session["guilds"] = [
        g for g in discord_session.fetch_guilds() if g.id in {g.id for g in bot_guilds}
    ]

    data = {
        "guilds": session["guilds"],
        "guild": session["guild"],
        "user_id": str(discord_session.user_id),
    }
    return jsonify(data)


@auth_blueprint.route("/guilds/<guild_id>", methods=["PATCH"])
@login_required
def select_guild(guild_id: int):
    try:
        session["guild"] = next(
            (g for g in session["guilds"] if str(g["id"]) == guild_id), None
        )
    except:
        raise NotFound("Guild not found")
    return jsonify(200)
