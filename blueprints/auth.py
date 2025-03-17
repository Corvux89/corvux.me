from flask import Blueprint, current_app, redirect, request, session, url_for
from flask_discord import DiscordOAuth2Session

from constants import DISCORD_ADMINS
from helpers.general_helpers import get_bot_guilds_from_cache


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

        if user.id in DISCORD_ADMINS:
            session["resolute_admin"] = True
            session["resolute_member"] = True
        elif (
            (bot_guild := get_bot_guilds_from_cache())
            and (user_guilds := user.fetch_guilds())
            and bool(
                set([g["id"] for g in bot_guild])
                & set([str(g.id) for g in user_guilds])
            )
        ):
            session["resolute_member"] = True

    except Exception as e:
        print(f"Issue with callback: {e}")
        return redirect(url_for("homepage"))

    return redirect(url_for(redirect_to))


@auth_blueprint.route("/logout")
def logout():
    discord_session: DiscordOAuth2Session = current_app.config.get("DISCORD_SESSION")
    discord_session.revoke()
    if session.get("resolute_admin"):
        session.pop("resolute_admin")

    if session.get("resolute_member"):
        session.pop("resolute_member")

    return redirect(url_for("homepage"))
