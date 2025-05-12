import json
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
import markdown
from urllib.parse import urlparse

from flask import Flask, redirect, render_template, request, make_response, url_for
from flask_bootstrap import Bootstrap
from flask_talisman import Talisman

from blueprints.G0T0.G0T0 import G0T0_blueprint
from blueprints.auth import auth_blueprint
from blueprints.combat_planner import combat_planner_blueprint

from constants import (
    DB_URI,
    DISCORD_BOT_TOKEN,
    DISCORD_CLIENT_ID,
    DISCORD_REDIRECT_URI,
    DISCORD_SECRET_KEY,
    WEB_DEBUG,
    SECRET_KEY,
)
from helpers import get_csp
from helpers.error_handlers import register_handlers
from models.discord import DiscordBot
from models.general import CustomJSONProvider, User

app = Flask(__name__)

app.secret_key = SECRET_KEY
app.json = CustomJSONProvider(app)

app.config.update(DEBUG=WEB_DEBUG)
app.config["SQLALCHEMY_DATABASE_URI"] = DB_URI
app.config["SQLALCHEMY_TRACK_MODIFICATION"] = False
app.config["DISCORD_CLIENT_ID"] = DISCORD_CLIENT_ID
app.config["DISCORD_REDIRECT_URI"] = DISCORD_REDIRECT_URI
app.config["DISCORD_CLIENT_SECRET"] = DISCORD_SECRET_KEY
app.config["DISCORD_BOT_TOKEN"] = DISCORD_BOT_TOKEN

# OAuth Providers
app.config["OAUTH2_PROVIDERS"] = {
    "discord": {
        "client_id": DISCORD_CLIENT_ID,
        "client_secret": DISCORD_SECRET_KEY,
        "authorize_url": "https://discord.com/oauth2/authorize",
        "token_url": "https://discord.com/api/oauth2/token",
        "scopes": ["identify", "email", "guilds", "guilds.join"],
        "userinfo": {
            "url": "https://discord.com/api/users/@me",
            "id": lambda json: json["id"],
            "email": lambda json: json["email"],
            "username": lambda json: json["username"],
            "global_name": lambda json: (
                json["global_name"] if json["global_name"] != "" else json["username"]
            ),
            "avatar": lambda json: json["avatar"] if json["avatar"] != "" else None,
        },
    }
}

app.config["DB"] = db = SQLAlchemy(app)
app.config["login"] = login = LoginManager(app)
app.discord = DiscordBot(app)


@app.route("/")
def homepage():
    with open("templates/aboutme.md", "r", encoding="utf-8") as file:
        aboutme = markdown.markdown(file.read())

    f = open("static/json/projects.json", encoding="utf8")
    projects = json.load(f)

    return render_template("main.html", projects=projects, aboutme=aboutme)


@app.route("/sitemap.xml")
def site_map():
    host_components = urlparse(request.host_url)
    host_base = host_components.scheme + "://" + host_components.netloc
    static_urls = []

    for rule in app.url_map.iter_rules():
        if not str(rule).startswith("/admin") and not str(rule).startswith("/user"):
            if "GET" in rule.methods and len(rule.arguments) == 0:
                url = {"loc": f"{host_base}{str(rule)}"}
                static_urls.append(url)
    response = render_template(
        "sitemap.xml", static_urls=static_urls, host_base=host_base
    )
    response = make_response(response)
    response.headers["Content-Type"] = "application/xml"
    return response


@login.user_loader
def load_user(id):
    return db.session.get(User, id)


@login.unauthorized_handler
def unauthorized():
    return redirect(url_for("auth.login", provider="discord", next=request.path))


csp = get_csp()

Bootstrap(app)
talisman = Talisman(
    app,
    content_security_policy=csp,
    content_security_policy_nonce_in=["script-src", "style-src"],
)

app.register_blueprint(combat_planner_blueprint, url_prefix="/Avrae_Combat_Planner")
app.register_blueprint(auth_blueprint, url_prefix="/auth")
app.register_blueprint(G0T0_blueprint, url_prefix="/g0t0")
register_handlers(app)

if __name__ == "__main__":
    app.run()
