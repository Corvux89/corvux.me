import json
import datetime

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import String, DateTime
from sqlalchemy.ext.declarative import DeclarativeMeta


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
        self.id = 226741726943903754
        self.max_level = kwargs.get('max_level')
        self.weeks = kwargs.get('weeks')
        self.last_reset = datetime.datetime.fromisoformat(kwargs.get('last_reset'))
        self.max_characters = kwargs.get('max_characters')
        self.div_limit = kwargs.get('div_limit')
        self.weekly_announcement = kwargs.get('weekly_announcement')
        self.ping_announcement = kwargs.get('ping_announcement')

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