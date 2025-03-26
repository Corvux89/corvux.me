import traceback
from flask import Flask, jsonify, render_template, request

from helpers.auth_helper import AdminAccessError
from models.exceptions import BadRequest, LoginError, NotFound


def not_found(e):
    if "/api/" in request.path:
        return jsonify({"error": f"{getattr(e, 'message', 'URL not found')}"}), 404
    return render_template("404.html")


def exception_error(error):
    return jsonify({"error": error.message}), 403


def bad_request(error):
    return jsonify({"error": error.message}), 400


def general_error(error):
    return render_template("error.html", error=f"{error}")


def register_handlers(app: Flask):
    app.register_error_handler(404, not_found)
    app.register_error_handler(NotFound, not_found)
    app.register_error_handler(AdminAccessError, exception_error)
    app.register_error_handler(TypeError, general_error)
    app.register_error_handler(LoginError, exception_error)
    app.register_error_handler(BadRequest, bad_request)
