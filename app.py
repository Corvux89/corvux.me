from urllib.parse import urlparse

from flask import Flask, render_template, request, make_response
from flask_bootstrap import Bootstrap
from flask_talisman import Talisman

from blueprints.combat_planner import combat_planner_blueprint
from constants import WEB_DEBUG, SECRET_KEY
from helpers import get_csp

app = Flask(__name__)

app.secret_key = SECRET_KEY

app.config.update(
    DEBUG=WEB_DEBUG
)

@app.route('/')
@app.route('/home')
def homepage():
    return render_template("main.html")

@app.route('/sitemap.xml')
def site_map():
    host_components = urlparse(request.host_url)
    host_base = host_components.scheme + "://" + host_components.netloc
    static_urls = []

    for rule in app.url_map.iter_rules():
        if not str(rule).startswith("/admin") and not str(rule).startswith("/user"):
            if "GET" in rule.methods and len(rule.arguments) == 0:
                url = {"loc": f"{host_base}{str(rule)}"}
                static_urls.append(url)
    response = render_template('sitemap.xml', static_urls=static_urls, host_base=host_base)
    response = make_response(response)
    response.headers["Content-Type"] = "application/xml"
    return response


csp = get_csp()

Bootstrap(app)
talisman = Talisman(
    app,
    content_security_policy=csp,
    content_security_policy_nonce_in=['script-src', 'style-src']
)

app.register_blueprint(combat_planner_blueprint, url_prefix="/Avrae_Combat_Planner")

if __name__ == "__main__":
    app.run()
