from flask import Flask, jsonify, render_template

from helpers.auth_helper import AdminAccessError

def not_found(e):
    return render_template("404.html")

def admin_error(error):
    return jsonify({"error": error.message}), 403

def type_error(error):
    return jsonify({"error": "Something went wrong. Probably a discord permission or something"}), 418

def register_handlers(app: Flask):
    app.register_error_handler(404, not_found)
    app.register_error_handler(AdminAccessError, admin_error)
    app.register_error_handler(TypeError, type_error)