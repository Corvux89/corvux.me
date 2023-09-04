from flask import Flask, render_template
from flask_bootstrap import Bootstrap
from flask_talisman import Talisman

from blueprints.atw import atw_blueprint
from blueprints.combat_planner.combat_planner import combat_planner_blueprint
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


csp = get_csp()

Bootstrap(app)
talisman = Talisman(
    app,
    content_security_policy=csp,
    content_security_policy_nonce_in=['script-src', 'style-src']
)


app.register_blueprint(atw_blueprint, url_prefix="/Abeir-Toril_Walkabout")
app.register_blueprint(combat_planner_blueprint, url_prefix="/Avrae_Combat_Planner")

if __name__ == "__main__":
    app.run()
