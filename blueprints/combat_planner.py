import flask
from flask import Blueprint, render_template

combat_planner_blueprint = Blueprint("complanner", __name__)

@combat_planner_blueprint.route('/')
def planner():
    return render_template('/combat_planner/combat_planner.html')