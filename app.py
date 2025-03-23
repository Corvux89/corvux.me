import json
from flask_discord import DiscordOAuth2Session
from flask_sqlalchemy import SQLAlchemy
import markdown
from urllib.parse import urlparse

from flask import Flask, render_template, request, make_response
from flask_bootstrap import Bootstrap
from flask_talisman import Talisman

from blueprints.combat_planner import combat_planner_blueprint
from blueprints.auth import auth_blueprint
from blueprints.Resolute.resolute import resolute_blueprint
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
from models.resolute import CustomJSONProvider

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

app.config["DISCORD_SESSION"] = DiscordOAuth2Session(app)
app.config["DB"] = db = SQLAlchemy()
db.init_app(app)


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


csp = get_csp()

Bootstrap(app)
talisman = Talisman(
    app,
    content_security_policy=csp,
    content_security_policy_nonce_in=["script-src", "style-src"],
)

app.register_blueprint(combat_planner_blueprint, url_prefix="/Avrae_Combat_Planner")
app.register_blueprint(auth_blueprint, url_prefix="/auth")
app.register_blueprint(resolute_blueprint, url_prefix="/resolute")
register_handlers(app)

if __name__ == "__main__":
    app.run()
