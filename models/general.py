import datetime
import json
from flask.json.provider import JSONProvider
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.orm.decl_api import registry


db = SQLAlchemy()


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(primary_key=True)
    username: Mapped[str]
    global_name: Mapped[str]
    email: Mapped[str]

    avatar: Mapped[str] = None

    def __init__(self, id, email, username, global_name):
        self.id = id
        self.email = email
        self.username = username
        self.global_name = global_name

    @property
    def avatar_url(self):
        return (
            f"https://cdn.discordapp.com/avatars/{self.id}/{self.avatar}.png"
            if self.avatar
            else None
        )


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
