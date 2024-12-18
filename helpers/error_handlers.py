from flask import Flask, jsonify, render_template

from helpers.auth_helper import AdminAccessError
from models.exceptions import LoginError

def not_found(e):
    return render_template("404.html")

def exception_error(error):
    # return render_template("error.html", error=f"{error.message}")
    return jsonify({"error": error.message}), 403

def general_error(error):
    return render_template("error.html", error=f"{error}")

def register_handlers(app: Flask):
    app.register_error_handler(404, not_found)
    app.register_error_handler(AdminAccessError, exception_error)
    app.register_error_handler(TypeError, general_error)
    app.register_error_handler(LoginError, exception_error)