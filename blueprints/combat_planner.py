import urllib.request

import flask
from flask import Blueprint, render_template, request, jsonify, abort

combat_planner_blueprint = Blueprint("complanner", __name__)

@combat_planner_blueprint.route('/')
def planner():
    return render_template('/combat_planner/combat_planner.html')

@combat_planner_blueprint.route('/shortcode', methods=['POST'])
def get_shortcode():
    queryUrl = request.get_json().get('url')

    try:
        url = urllib.request.urlopen(queryUrl)
    except:
        return jsonify({"token": ""})

    html = url.read().decode()

    start = html.find('<body>')
    end = html.find('</body>')
    token = ""

    if start != -1 and end != -1:
        token = html[start+6:end]

    return jsonify({"token": token})
