import typing
import time
import json

from abc import ABC

from flask import Flask
from requests import request

from constants import DISCORD_GUILD_ID
from helpers.general_helpers import get_members_from_cache
from models.exceptions import UnauthorizedAccessError
from models.general import BaseModel, IntAttributeMixin


class MemberAttributeMixin:
    def get_member_attribute(self, member_id: str):
        members = [DiscordMember(**m) for m in get_members_from_cache(DISCORD_GUILD_ID)]

        try:
            if m := next(
                (m for m in members if m.user and m.user.id == member_id), None
            ):
                return m.__dict__
            return None
        except:
            return None


class DiscordBot(ABC):
    base_url = "https://discordapp.com/api"

    def __init__(self, app: Flask):
        self.client_id = app.config["DISCORD_CLIENT_ID"]
        self.bot_token = app.config["DISCORD_BOT_TOKEN"]

        self.retries = app.config.get("DISCORD_RETRIES", 5)

    def request(self, route: str, method="GET", **kwargs) -> typing.Union[dict, str]:
        headers = {"Authorization": f"Bot {self.bot_token}"}

        url = f"{self.base_url}{route}"

        for attempt in range(self.retries):
            response = request(method, url, headers=headers, **kwargs)

            if response.status_code == 401:
                raise UnauthorizedAccessError()
            elif response.status_code == 429:
                retry_after = response.headers.get("Retry-After", 2**attempt)
                time.sleep(float(retry_after))
            else:
                try:
                    return response.json()
                except json.JSONDecodeError:
                    return response.text()

        raise Exception("Max retries exceeded")

    def user_request(
        self, token, route, method="GET", **kwargs
    ) -> typing.Union[dict, str]:
        headers = {"Authorization": f"Bearer {token}"}

        url = f"{self.base_url}{route}"

        for attempt in range(self.retries):
            response = request(method, url, headers=headers, **kwargs)

            if response.status_code == 401:
                raise UnauthorizedAccessError()
            elif response.status_code == 429:
                retry_after = response.headers.get("Retry-After", 2**attempt)
                time.sleep(float(retry_after))
            else:
                try:
                    return response.json()
                except json.JSONDecodeError:
                    return response.text()

        raise Exception("Max retries exceeded")


class DiscordUser(BaseModel, IntAttributeMixin):
    global_name: str = None
    _id: int = None
    username: str = None
    avatar: str = None

    @property
    def id(self):
        return str(self._id)

    @id.setter
    def id(self, value):
        self.set_int_attribute("_id", value)


class DiscordMember:
    nick: str = None
    roles: [] = None
    user: DiscordUser = None
    bot: bool = None

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            if key in self.__annotations__:
                if key == "user" and isinstance(value, dict):
                    setattr(self, key, DiscordUser(**value))
                else:
                    setattr(self, key, value)

    def to_dict(self):
        result = {}
        for attr in dir(self):
            if attr.startswith("_") or callable(getattr(self, attr)):
                continue
            try:
                value = getattr(self, attr)
                if isinstance(value, DiscordUser):
                    result[attr] = value.to_dict()
                else:
                    result[attr] = value
            except AttributeError:
                continue
        return result

    @property
    def member_display_name(self):
        return (
            self.nick
            or self.user.global_name
            or self.user.username
            or "Player not found"
        )


class DiscordChannel(BaseModel, IntAttributeMixin):
    _id: int = None
    name: str = None
    _parent_id: int = None
    type: int = None

    @property
    def id(self):
        return str(self._id)

    @id.setter
    def id(self, value):
        self.set_int_attribute("_id", value)

    @property
    def parent_id(self):
        return str(self._parent_id)

    @parent_id.setter
    def parent_id(self, value):
        self.set_int_attribute("_parent_id", value)


class DiscordRole(BaseModel, IntAttributeMixin):
    _id: int = None
    name: str = None

    @property
    def id(self):
        return str(self._id)

    @id.setter
    def id(self, value):
        self.set_int_attribute("_id", value)


class DiscordEntitlement(BaseModel, MemberAttributeMixin):
    id: str = None
    sku_id: str = None
    type: int = None
    deleted: bool = False
    consumed: bool = False
    user_id: str = None

    @property
    def member(self):
        return self.get_member_attribute(self.user_id)


class DiscordGuild(BaseModel, IntAttributeMixin):
    _id: str = None
    name: str = None
    icon: str = None

    @property
    def id(self):
        return str(self._id)

    @id.setter
    def id(self, value):
        self.set_int_attribute("_id", value)
