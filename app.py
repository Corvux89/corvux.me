import json

from flask import Flask, render_template
from flask_bootstrap import Bootstrap

from constants import WEB_DEBUG

app = Flask(__name__)

Bootstrap(app)

app.config.update(
    DEBUG=WEB_DEBUG,
)


def setup_cards(file: str, link: str) -> str:
    f = open(file, encoding="utf8")
    data = f.read()
    players = json.loads(data)

    # Get cards ready
    str = ""
    for p in players.keys():
        player = players[p]
        str += "<div class=\"card\">"
        str += "<img class=\"card-img-top\" src=\"/static/" + player['image'] + "\">"
        str += "<div class=\"card-body\">"
        str += "<h5 class=\"card-title\">" + player['name'] + "</h5>"
        str += "<a href=\"" + link + p + "\" class=\"stretched-link\"></a></div></div>"

    return str


@app.route('/')
@app.route('/home')
def homepage():
    return render_template("main.html")


@app.route('/Abeir-Toril_Walkabout/Era1')
def atw_era_1():
    players = setup_cards('data/era1players.json', '/Abeir-Toril_Walkabout/Era1/')

    return render_template("game_main.html", players=players, header="Abeir-Toril Walkabout: Era 1")


@app.route('/Abeir-Toril_Walkabout/Era1/<player>')
def atw_era_1_player(player):
    f = open('data/era1players.json', encoding="utf8")
    data = f.read()
    players = json.loads(data)
    p = players[player]
    return render_template("player.html", player=players[player],
                           button_caption="Back to Era 1", button_link="/Abeir-Toril_Walkabout/Era1")


@app.route('/Abeir-Toril_Walkabout/Era2')
def atw_era_2():
    players = setup_cards('data/era2players.json', '/Abeir-Toril_Walkabout/Era2/')

    return render_template("game_main.html", players=players, header="Abeir-Toril Walkabout: Era 2")

@app.route('/Abeir-Toril_Walkabout/Era2/<player>')
def atw_era_2_player(player):
    f = open('data/era2players.json', encoding="utf8")
    data = f.read()
    players = json.loads(data)
    p = players[player]
    return render_template("player.html", player=players[player],
                           button_caption="Back to Era 2", button_link="/Abeir-Toril_Walkabout/Era2")

@app.route('/Abeir-Toril_Walkabout/Saga3')
def atw_saga_3():
    players = setup_cards('data/saga3players.json', '/Abeir-Toril_Walkabout/Saga3/')

    return render_template("game_main.html", players=players, header="Abeir-Toril Walkabout: Saga 3")

@app.route('/Abeir-Toril_Walkabout/Saga3/<player>')
def atw_saga_3_player(player):
    f = open('data/saga3players.json', encoding="utf8")
    data = f.read()
    players = json.loads(data)
    p = players[player]
    return render_template("player.html", player=players[player],
                           button_caption="Back to Saga 3", button_link="/Abeir-Toril_Walkabout/Saga3")


if __name__ == "__main__":
    app.run()
