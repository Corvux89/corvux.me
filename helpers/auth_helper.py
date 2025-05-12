from functools import wraps
from flask import redirect, request, url_for
from flask_login import current_user

from constants import DISCORD_ADMINS
from models.exceptions import AdminAccessError


def is_admin(f=None):
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                return redirect(url_for("auth.login", next=request.endpoint))
            elif not _is_user_admin():
                raise AdminAccessError("Admin access is required")
            return func(*args, **kwargs)

        return decorated_function

    def _is_user_admin():
        return current_user.id in DISCORD_ADMINS

    # Callable functionality
    if f is None:
        return _is_user_admin()

    # Decorator functionality
    return decorator(f)
