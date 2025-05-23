import datetime
import json
from flask import current_app, session
from flask.json.provider import JSONProvider
from flask_login import UserMixin
import requests
from sqlalchemy import inspect
from sqlalchemy.orm.decl_api import registry

from constants import DISCORD_ADMINS
from models.exceptions import UnauthorizedAccessError


class User(UserMixin):
    id: str
    username: str
    global_name: str
    email: str
    avatar: str = None

    guilds = None

    def __init__(self, id, email, username, global_name, **kwargs):
        self.id = id
        self.email = email
        self.username = username
        self.global_name = global_name
        self.avatar = kwargs.get("avatar")

    @property
    def is_admin(self):
        return str(self.id) in set(str(admin) for admin in DISCORD_ADMINS)

    @property
    def avatar_url(self):
        return (
            f"https://cdn.discordapp.com/avatars/{self.id}/{self.avatar}.png"
            if self.avatar
            else None
        )

    @classmethod
    def fetch_user(cls, provider: str):
        provider_data = current_app.config["OAUTH2_PROVIDERS"].get(provider)

        response = requests.get(
            provider_data["userinfo"]["url"],
            headers={
                "Authorization": f"Bearer {session['OAUTH2_TOKEN']}",
                "Accept": "application/json",
            },
        )

        if response.status_code != 200:
            raise UnauthorizedAccessError()

        user_data = response.json()
        session["USER_ID"] = provider_data["userinfo"]["id"](user_data)

        user = cls(
            id=session["USER_ID"],
            email=provider_data["userinfo"]["email"](user_data),
            username=provider_data["userinfo"]["username"](user_data),
            global_name=provider_data["userinfo"]["global_name"](user_data),
            avatar=provider_data["userinfo"]["avatar"](user_data),
        )

        return user


class AlchemyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        elif hasattr(obj, "to_dict"):
            return obj.to_dict()
        elif hasattr(obj, "to_json"):
            return obj.to_json()
        return json.JSONEncoder.default(self, obj)


class CustomJSONProvider(JSONProvider):
    def dumps(self, obj, **kwargs):
        return json.dumps(obj, **kwargs, cls=AlchemyEncoder)

    def loads(self, s: str | bytes, **kwargs):
        return json.loads(s, **kwargs)


class BaseModel:
    def __init__(self, **kwargs):
        for key in kwargs:
            if hasattr(self, key):
                setattr(self, key, kwargs[key])

    def to_dict(self):
        result = {}
        for attr in dir(self):
            if attr.startswith("_") or callable(getattr(self, attr)):
                continue
            try:
                value = getattr(self, attr)

                if hasattr(value, "to_dict"):
                    result[attr] = value.to_dict()

                elif inspect(value, raiseerr=False) is not None or isinstance(
                    value, registry
                ):
                    continue

                elif isinstance(value, datetime.datetime):
                    result[attr] = value.isoformat()

                elif value == "None":
                    result[attr] = ""
                else:
                    result[attr] = value
            except AttributeError:
                continue
        return result


class IntAttributeMixin:
    def set_int_attribute(self, attr_name, value):
        try:
            setattr(self, attr_name, value)
        except (ValueError, TypeError):
            setattr(self, attr_name, None)
