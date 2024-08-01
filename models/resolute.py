import json
import datetime

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import String, DateTime
from sqlalchemy.ext.declarative import DeclarativeMeta

from constants import DISCORD_GUILD_ID


db = SQLAlchemy()

class ResoluteGuild(db.Model):
    __tablename__ = "guilds"
    id: Mapped[int] = mapped_column(primary_key=True)
    max_level: Mapped[int]
    weeks: Mapped[int]
    last_reset: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    max_characters: Mapped[int]
    div_limit: Mapped[int]
    weekly_announcement: Mapped[list[str]] = mapped_column(ARRAY(String))
    ping_announcement: Mapped[bool]

    def __init__(self, **kwargs):
        self.id = DISCORD_GUILD_ID
        self.max_level = kwargs.get('max_level')
        self.weeks = kwargs.get('weeks')
        self.last_reset = datetime.datetime.fromisoformat(kwargs.get('last_reset'))
        self.max_characters = kwargs.get('max_characters')
        self.div_limit = kwargs.get('div_limit')
        self.weekly_announcement = kwargs.get('weekly_announcement')
        self.ping_announcement = kwargs.get('ping_announcement')

class RefMessage(db.Model):
    __tablename__ = "ref_messages"
    guild_id: Mapped[int]
    message_id: Mapped[int] = mapped_column(primary_key=True)
    channel_id: Mapped[int]
    title: Mapped[str]

    def __init__(self, **kwargs):
        self.guild_id = kwargs.get("guild_id", DISCORD_GUILD_ID)
        self.message_id = kwargs.get('message_id')
        self.channel_id = kwargs.get('channel_id')
        self.title = kwargs.get('title')

class BotMessage():
    def __init__(self, message_id: str, channel_id: str, channel_name: str, title: str, content: str, **kwargs):
        self.message_id = message_id
        self.channel_id = channel_id
        self.channel_name = channel_name
        self.content = content
        self.title = title
        self.pin = kwargs.get('pin', False)
        self.error = kwargs.get("error", "")


class AlchemyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj.__class__, DeclarativeMeta):
            fields = {}
            for field in [x for x in dir(obj) if not x.startswith('_') and x != 'metadata']:
                data = obj.__getattribute__(field)
                if isinstance(data, datetime.datetime):
                    data = data.isoformat()
                try:
                    json.dumps(data)
                    fields[field] = data
                except TypeError:
                    fields[field] = None
            return fields
        return json.JSONEncoder.default(self, obj)