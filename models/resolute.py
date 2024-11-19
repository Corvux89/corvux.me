from enum import Enum
import json
import datetime

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import Date, ForeignKey, String, DateTime
from sqlalchemy.ext.declarative import DeclarativeMeta
from sqlalchemy.ext.hybrid import hybrid_property

from constants import DISCORD_GUILD_ID


db = SQLAlchemy()

class Activity(db.Model):
    __tablename__ = "c_activity"
    id: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[str]
    cc: Mapped[int]
    diversion: Mapped[bool]
    points: Mapped[int]

    logs = relationship("Log", back_populates="activity_record")

    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.value = kwargs.get('value')
        self.cc = kwargs.get('cc', 0)
        self.diversion = kwargs.get('diversion', False)
        self.points = kwargs.get('points', 0)

class ActivityPoints(db.Model):
    __tablename__ = "c_activity_points"
    id: Mapped[int] = mapped_column(primary_key=True)
    points: Mapped[int]

    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.points = kwargs.get('points', 0)

class Faction(db.Model):
    __tablename__ = "c_factions"
    id: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[str]

    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.value = kwargs.get('value')

class PrimaryClass(db.Model):
    __tablename__ = "c_character_class"
    id: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[str]

    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.value = kwargs.get('value')

class Archetype(db.Model):
    __tablename__ = "c_character_archetype"
    id: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[str]
    parent: Mapped[int]
    
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.value = kwargs.get('value')
        self.parent = kwargs.get('parent')

class Species(db.Model):
    __tablename__ = "c_character_species"
    id: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[str]

    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.value = kwargs.get('value')

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
    handicap_cc: Mapped[int]

    def __init__(self, **kwargs):
        self.id = DISCORD_GUILD_ID
        self.max_level = kwargs.get('max_level')
        self.weeks = kwargs.get('weeks')
        self.last_reset = datetime.datetime.fromisoformat(kwargs.get('last_reset'))
        self.max_characters = kwargs.get('max_characters')
        self.div_limit = kwargs.get('div_limit')
        self.weekly_announcement = kwargs.get('weekly_announcement')
        self.ping_announcement = kwargs.get('ping_announcement')
        self.handicap_cc = kwargs.get('handicap_cc')

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

class Character(db.Model):
    __tablename__ = "characters"
    id: Mapped[int] = mapped_column(primary_key=True)
    guild_id: Mapped[int] = mapped_column(ForeignKey("players.guild_id"), nullable=False)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)
    species: Mapped[int] = mapped_column(ForeignKey("c_character_species.id"), nullable=False)
    credits: Mapped[int]
    faction: Mapped[int] = mapped_column(ForeignKey("c_factions.id"), nullable=True)
    name: Mapped[str]
    level: Mapped[int]
    active: Mapped[bool]

    player = relationship("Player", 
                          back_populates="characters",
                          foreign_keys=[player_id])
    
    classes = relationship("CharacterClass",
                           back_populates="character",
                           lazy="select",
                           primaryjoin="and_(Character.id == CharacterClass.character_id, CharacterClass.active == True)")
    
    species_record = relationship(
        "Species",
        backref="characters",
        foreign_keys=[species],
        lazy="joined"
    )

    faction_record = relationship("Faction")

    
    
class CharacterClass(db.Model):
    __tablename__ = "character_class"
    id: Mapped[int] = mapped_column(primary_key=True)
    character_id: Mapped[int] = mapped_column(ForeignKey("characters.id"), nullable=False)
    primary_class: Mapped[int] = mapped_column(ForeignKey("c_character_class.id"), nullable=False)
    archetype: Mapped[int] = mapped_column(ForeignKey("c_character_archetype.id"), nullable=True)
    active: Mapped[bool]

    character = relationship("Character",
                             back_populates="classes",
                             foreign_keys=[character_id])
    
    primary_class_record = relationship(
        "PrimaryClass",
        backref="character_class",
        foreign_keys=[primary_class],
        lazy="joined"
    )

    archetype_record = relationship(
        "Archetype",
        backref="character_class",
        foreign_keys=[archetype],
        lazy="joined"
    )


class Player(db.Model):
    __tablename__ = "players"
    id: Mapped[int] = mapped_column(primary_key=True)
    cc: Mapped[int]
    div_cc: Mapped[int]
    guild_id: Mapped[int] = mapped_column(primary_key=True)
    points: Mapped[int]
    activity_points: Mapped[int]
    handicap_amount: Mapped[int]
    _statistics: Mapped[str] = mapped_column("statistics")
    member = None

    characters = relationship("Character", 
                              back_populates="player",
                              lazy="select",
                              primaryjoin="and_(Player.id == Character.player_id, Player.guild_id == Character.guild_id, Character.active == True)")

    __table_args__ = (
        db.PrimaryKeyConstraint("id", "guild_id"),
    )

    def __init__(self, **kwargs):
        self.id = kwargs.get("id")
        self.guild_id = kwargs.get("guild_id", DISCORD_GUILD_ID)
        self.cc = kwargs.get('cc')
        self.div_cc = kwargs.get('div_cc')
        self.points = kwargs.get('points')
        self.activity_points = kwargs.get('activity_points')
        self.handicap_amount = kwargs.get('handicap_amount')
        self.statistics = kwargs.get("statistics", {})
        self.member = kwargs.get('member')

    @hybrid_property
    def statistics(self):
        try:
            return json.loads(self._statistics)
        except:
            return {}
        
    @statistics.setter
    def stats(self, value):
        self.statistics = json.loads(value)

class Log(db.Model):
    __tablename__ = "log"
    id: Mapped[int] = mapped_column(primary_key=True)
    activity: Mapped[int] = mapped_column(ForeignKey("c_activity.id"), nullable=False)
    notes: Mapped[str]
    character_id: Mapped[int] = mapped_column(ForeignKey("characters.id"), nullable=True)
    player_id: Mapped[int]
    author: Mapped[int]
    guild_id: Mapped[int]
    cc: Mapped[int]
    credits: Mapped[int]
    renown: Mapped[int]
    faction: Mapped[int] = mapped_column(ForeignKey("c_factions.id"), nullable=True)
    invalid: Mapped[bool]
    created_ts: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))

    activity_record = relationship(Activity, back_populates="logs")
    faction_record = relationship("Faction")
    character_record = relationship("Character")

    member = None
    author_record = None

    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.activity = kwargs.get('activity')
        self.notes = kwargs.get('notes')
        self.character_id = kwargs.get('character_id')
        self.player_id = kwargs.get('character_id')
        self.author = kwargs.get('author')
        self.guild_id = kwargs.get('guild_id')
        self.cc = kwargs.get('cc')
        self.credits = kwargs.get('credits')
        self.renown = kwargs.get('renown')
        self.faction = kwargs.get('faction')
        self.invalid = kwargs.get('invalid')
        self.created_ts = kwargs.get('created_ts')
        self.member = kwargs.get('member')        


class BotMessage():
    def __init__(self, message_id: str, channel_id: str, channel_name: str, title: str, content: str, **kwargs):
        self.message_id = message_id
        self.channel_id = channel_id
        self.channel_name = channel_name
        self.content = content
        self.title = title
        self.pin = kwargs.get('pin', False)
        self.error = kwargs.get("error", "")

class DiscordUser:
    global_name: str = None
    id: int = None
    username: str = None

    def __init__(self, **kwargs):
        for key in kwargs:
            if hasattr(self, key):
                setattr(self, key, kwargs[key])


class DiscordMember:
    nick: str = None
    roles: [] = None
    user: DiscordUser = None
    bot: bool = None

    def __init__(self, **kwargs):
        for key in kwargs:
            if hasattr(self, key):
                if key == "user":
                    self.user = DiscordUser(**kwargs[key] or {}).__dict__
                else:
                    setattr(self, key, kwargs[key])

class DiscordChannel:
    id: int = None
    name: str = None
    parent_id: int = None
    type: int = None

    def __init__(self, **kwargs):
        for key in kwargs:
            if hasattr(self, key):
                setattr(self, key, kwargs[key])


class AlchemyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
                return obj.isoformat()

        elif isinstance(obj.__class__, DeclarativeMeta):
            fields = {}
            columns = obj.__table__.columns.keys()
            
            for field in columns:
                data = obj.__getattribute__(field)
                if isinstance(data, datetime.datetime):
                    data = data.isoformat()
                elif isinstance(data.__class__, DeclarativeMeta):
                    data = self.default(data)
                try:
                    json.dumps(data)
                    fields[field] = data
                except TypeError:
                    fields[field] = None

            if isinstance(obj, Log):
                fields["activity"] = obj.activity_record
                fields["faction"] = obj.faction_record
                fields["member"] = DiscordMember(**obj.member or {}).__dict__
                fields["character"] = obj.character_record
                fields["author_record"] = DiscordMember(**obj.author_record or {}).__dict__

            elif isinstance(obj, Player):
                fields["characters"] = obj.characters
                fields["member"] = DiscordMember(**obj.member or {}).__dict__

            elif isinstance(obj, Character):
                fields["classes"] = obj.classes
                fields["species"] = obj.species_record
                fields["faction"] = obj.faction_record

            elif isinstance(obj, CharacterClass):
                fields['primary_class'] = obj.primary_class_record
                fields["archetype"] = obj.archetype_record

            return fields
        return json.JSONEncoder.default(self, obj)
