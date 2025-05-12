from flask import Blueprint, current_app, jsonify, redirect, request, session, url_for
from flask_login import current_user, login_required, login_user, logout_user
from flask_sqlalchemy import SQLAlchemy
import jwt
import requests
from requests_oauthlib import OAuth2Session

from helpers.auth_helper import is_admin
from helpers.general_helpers import get_bot_guilds_from_cache
from models.discord import DiscordGuild
from models.exceptions import NotFound, UnauthorizedAccessError
from models.general import User

auth_blueprint = Blueprint("auth", __name__)


def redirect_dest(fallback):
    dest = request.args.get("next")
    return redirect(url_for(dest)) if dest else redirect(fallback)


@auth_blueprint.route("/login/<provider>")
def login(provider):
    provider_data = current_app.config["OAUTH2_PROVIDERS"].get(provider)

    if provider_data is None:
        raise NotFound

    data = {"redirect": request.args.get("next", "homepage")}

    oauth_session = OAuth2Session(
        client_id=provider_data["client_id"],
        state=jwt.encode(data, current_app.config["SECRET_KEY"], algorithm="HS256"),
        scope=provider_data["scopes"],
        redirect_uri=url_for("auth.callback", provider=provider, _external=True),
    )

    authorization_url, state = oauth_session.authorization_url(
        provider_data["authorize_url"]
    )
    session["OAUTH2_STATE"] = state

    return redirect(authorization_url)


@auth_blueprint.route("/callback/<provider>")
def callback(provider):
    provider_data = current_app.config["OAUTH2_PROVIDERS"].get(provider)

    if provider_data is None:
        raise NotFound

    try:
        if request.args["state"] != session.get("OAUTH2_STATE"):
            raise UnauthorizedAccessError()

        if "code" not in request.args:
            raise UnauthorizedAccessError()

        oauth_session = OAuth2Session(
            client_id=provider_data["client_id"],
            state=session.get("OAUTH2_STATE"),
            redirect_uri=url_for("auth.callback", provider=provider, _external=True),
        )

        token = oauth_session.fetch_token(
            provider_data["token_url"],
            client_secret=provider_data["client_secret"],
            authorization_response=request.url,
        )

        if not (access_token := token.get("access_token")):
            raise UnauthorizedAccessError()
        session["OAUTH2_TOKEN"] = access_token
        response = requests.get(
            provider_data["userinfo"]["url"],
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
        )

        if response.status_code != 200:
            raise UnauthorizedAccessError()

        user_data = response.json()
        db: SQLAlchemy = current_app.config.get("DB")

        email = provider_data["userinfo"]["email"](user_data)
        user = db.session.scalar(db.select(User).where(User.email == email))

        if user is None:
            user = User(
                id=provider_data["userinfo"]["id"](user_data),
                email=email,
                username=provider_data["userinfo"]["username"](user_data),
                global_name=provider_data["userinfo"]["global_name"](user_data),
            )

        user.avatar = provider_data["userinfo"]["avatar"](user_data)
        db.session.add(user)
        db.session.commit()

        login_user(user)
        session["admin"] = is_admin()
        data = jwt.decode(
            session.get("OAUTH2_STATE"),
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"],
        )

    except Exception as e:
        print(f"Issue with callback: {e}")
        return redirect(url_for("homepage"))

    return redirect(data.get("redirect", url_for("homepage")))


@auth_blueprint.route("/logout")
def logout():
    logout_user()
    session.pop("admin")
    return redirect(url_for("homepage"))


@auth_blueprint.route("/session", methods=["GET"])
@login_required
def get_guild():
    bot_guilds = get_bot_guilds_from_cache()
    user_guilds = current_app.discord.user_request(
        session["OAUTH2_TOKEN"], "/users/@me/guilds"
    )

    session["guilds"] = [
        DiscordGuild(**g)
        for g in user_guilds
        if g["id"] in {g["id"] for g in bot_guilds}
    ]

    data = {
        "guilds": session["guilds"],
        "guild": session["guild"] if "guild" in session else session["guilds"][0],
        "user_id": str(current_user.id),
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
