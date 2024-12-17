import json
import datetime

from flask_sqlalchemy import SQLAlchemy
from flask.json.provider import JSONProvider
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.ext.declarative import DeclarativeMeta
from sqlalchemy.ext.hybrid import hybrid_property

from constants import DISCORD_GUILD_ID
from helpers.general_helpers import get_members_from_cache

db = SQLAlchemy()

class DiscordUser:
    global_name: str = None
    _id: int = None
    username: str = None

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
                result[attr] = value
            except AttributeError:
                continue
        return result
    
    @property
    def id(self):
        return str(self._id)

    @id.setter
    def id(self, value):
        try:
            self._id = int(value)
        except:
            self._id = None

class DiscordMember:
    nick: str = None
    roles: [] = None
    user: DiscordUser = None
    bot: bool = None

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            if key in self.__annotations__:
                if key == 'user' and isinstance(value, dict):
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
    

class DiscordChannel:
    _id: int = None
    name: str = None
    _parent_id: int = None
    type: int = None

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
                result[attr] = value
            except AttributeError:
                continue
        return result
    
    @property
    def id(self):
        return str(self._id)

    @id.setter
    def id(self, value):
        try:
            self._id = int(value)
        except:
            self._id = None
    
    @property
    def parent_id(self):
        return str(self._parent_id)
    
    @parent_id.setter
    def parent_id(self, value):
        try:
            self._parent_id = int(value)
        except:
            self._parent_id = ""

class DiscordRole:
    _id: int = None
    name: str = None

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
                result[attr] = value
            except AttributeError:
                continue
        return result
    
    @property
    def id(self):
        return str(self._id)

    @id.setter
    def id(self, value):
        try:
            self._id = int(value)
        except:
            self._id = None

class Activity(db.Model):
    __tablename__ = "c_activity"
    id: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[str]
    cc: Mapped[int]
    diversion: Mapped[bool]
    points: Mapped[int]

    logs = relationship("Log", back_populates="_activity_record")

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

class CodeConversion(db.Model):
    __tablename__ = "c_code_conversion"
    id: Mapped[int] = mapped_column(primary_key=True)
    value: Mapped[int]

    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.value = kwargs.get('value', 0)

class LevelCost(db.Model):
    __tablename__ = "c_level_costs"
    id: Mapped[int] = mapped_column(primary_key=True)
    cc: Mapped[int]

    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.cc = kwargs.get('cc', 0)

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

class Store(db.Model):
    __tablename__ = "store"
    _sku: Mapped[int] = mapped_column("sku", primary_key=True)
    user_cost: Mapped[float]

    def __init__(self, **kwargs):
        self._sku = kwargs.get('sku')
        self.user_cost = kwargs.get('user_cost', 0)

    @property
    def sku(self):
        return str(self._sku)
    
    @sku.setter
    def sku(self, value):
        try:
            self.sku = int(value)
        except:
            self.sku = None

class Financial(db.Model):
    __tablename__ = "financial"
    monthly_goal: Mapped[float] = mapped_column(primary_key=True)
    monthly_total: Mapped[float] = mapped_column(primary_key=True)
    reserve: Mapped[float] = mapped_column(primary_key=True)
    month_count: Mapped[int] = mapped_column(primary_key=True)
    last_reset: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))

    def __init__(self, **kwargs):
        self.monthly_goal = kwargs.get('monthly_goal', 0)
        self.monthly_total = kwargs.get('monthly_total', 0)
        self.reserve = kwargs.get('reserve', 0)
        self.month_count = kwargs.get('month_count', 0)
        self.last_reset = kwargs.get('last_reset')


class ResoluteGuild(db.Model):
    __tablename__ = "guilds"
    _id: Mapped[int] = mapped_column("id", primary_key=True)
    max_level: Mapped[int]
    weeks: Mapped[int]
    last_reset: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    max_characters: Mapped[int]
    div_limit: Mapped[int] 
    ping_announcement: Mapped[bool]
    handicap_cc: Mapped[int]
    reward_threshold: Mapped[int]

    # User Roles
    _entry_role: Mapped[int] = mapped_column("entry_role")
    _member_role: Mapped[int] = mapped_column("member_role")
    _tier_2_role: Mapped[int] = mapped_column("tier_2_role")
    _tier_3_role: Mapped[int] = mapped_column("tier_3_role")
    _tier_4_role: Mapped[int] = mapped_column("tier_4_role")
    _tier_5_role: Mapped[int] = mapped_column("tier_5_role")
    _tier_6_role: Mapped[int] = mapped_column("tier_6_role")
    _admin_role: Mapped[int] = mapped_column("admin_role")
    _staff_role: Mapped[int] = mapped_column("staff_role")
    _bot_role: Mapped[int] = mapped_column("bot_role")
    _quest_role: Mapped[int] = mapped_column("quest_role")

    # Channels
    _application_channel: Mapped[int] = mapped_column("application_channel")
    _market_channel: Mapped[int] = mapped_column("market_channel")
    _announcement_channel: Mapped[int] = mapped_column("announcement_channel")
    _staff_channel: Mapped[int] = mapped_column("staff_channel")
    _help_channel: Mapped[int] = mapped_column("help_channel")
    _arena_board_channel: Mapped[int] = mapped_column("arena_board_channel")
    _exit_channel: Mapped[int] = mapped_column("exit_channel")
    _entrance_channel: Mapped[int] = mapped_column("entrance_channel")

    def __init__(self, **kwargs):
        self._id = DISCORD_GUILD_ID
        self.max_level = kwargs.get('max_level')
        self.weeks = kwargs.get('weeks')
        self.last_reset = datetime.datetime.fromisoformat(kwargs.get('last_reset'))
        self.max_characters = kwargs.get('max_characters')
        self.div_limit = kwargs.get('div_limit')
        self.weekly_announcement = kwargs.get('weekly_announcement')
        self.ping_announcement = kwargs.get('ping_announcement')
        self.handicap_cc = kwargs.get('handicap_cc')
        self.reward_threshold = kwargs.get('reward_threshold')

        self._entry_role = kwargs.get('entry_role')
        self._member_role = kwargs.get('member_role')
        self._tier_2_role = kwargs.get('tier_2_role')
        self._tier_3_role = kwargs.get('tier_3_role')
        self._tier_4_role = kwargs.get('tier_4_role')
        self._tier_5_role = kwargs.get('tier_5_role')
        self._tier_6_role = kwargs.get('tier_6_role')
        self._admin_role = kwargs.get('admin_role')
        self._staff_role = kwargs.get('staff_role')
        self._bot_role = kwargs.get('bot_role')
        self._quest_role = kwargs.get('quest_role')

        self._application_channel = kwargs.get('application_channel')
        self._market_channel = kwargs.get('market_channel')
        self._announcement_channel = kwargs.get('announcement_channel')
        self._staff_channel = kwargs.get('staff_channel')
        self._help_channel = kwargs.get('help_channel')
        self._arena_board_channel = kwargs.get('arena_board_channel')
        self._exit_channel = kwargs.get('exit_channel')
        self._entrance_channel = kwargs.get('entrance_channel')
    
    @property
    def id(self) -> str:
        return str(self._id)
    
    @property
    def entry_role(self) -> str:
        return str(self._entry_role)
    
    @entry_role.setter
    def entry_role(self, value):
        try:
            self._entry_role = int(value)
        except:
            self._entry_role = None

    @property
    def admin_role(self) -> str:
        return str(self._admin_role)
    
    @admin_role.setter
    def entry_role(self, value):
        try:
            self._admin_role = int(value)
        except:
            self._admin_role = None

    @property
    def staff_role(self) -> str:
        return str(self._staff_role)
    
    @staff_role.setter
    def staff_role(self, value):
        try:
            self._staff_role = int(value)
        except:
            self._staff_role = None

    @property
    def bot_role(self) -> str:
        return str(self._bot_role)
    
    @bot_role.setter
    def bot_role(self, value):
        try:
            self._bot_role = int(value)
        except:
            self._bot_role = None

    @property
    def quest_role(self) -> str:
        return str(self._quest_role)
    
    @quest_role.setter
    def quest_role(self, value):
        try:
            self._quest_role = int(value)
        except:
            self._quest_role = None
        
    @property
    def member_role(self) -> str:
        return str(self._member_role)
    
    @member_role.setter
    def member_role(self, value):
        try:
            self._member_role = int(value)
        except:
            self._member_role = None

    @property
    def tier_2_role(self) -> str:
        return str(self._tier_2_role)
    
    @tier_2_role.setter
    def tier_2_role(self, value):
        try:
            self._tier_2_role = int(value)
        except:
            self._tier_2_role = None

    @property
    def tier_3_role(self) -> str:
        return str(self._tier_3_role)
    
    @tier_3_role.setter
    def tier_3_role(self, value):
        try:
            self._tier_3_role = int(value)
        except:
            self._tier_3_role = None

    @property
    def tier_4_role(self) -> str:
        return str(self._tier_4_role)
    
    @tier_4_role.setter
    def tier_4_role(self, value):
        try:
            self._tier_4_role = int(value)
        except:
            self._tier_4_role = None

    @property
    def tier_5_role(self) -> str:
        return str(self._tier_5_role)
    
    @tier_5_role.setter
    def tier_5_role(self, value):
        try:
            self._tier_5_role = int(value)
        except:
            self._tier_5_role = None

    @property
    def tier_6_role(self) -> str:
        return str(self._tier_6_role)
    
    @tier_6_role.setter
    def tier_6_role(self, value):
        try:
            self._tier_6_role = int(value)
        except:
            self._tier_6_role = None

    @property
    def application_channel(self) -> str:
        return str(self._application_channel)
    
    @application_channel.setter
    def application_channel(self, value):
        try:
            self._application_channel = int(value)
        except:
            self._application_channel = None

    @property
    def market_channel(self) -> str:
        return str(self._market_channel)
    
    @market_channel.setter
    def market_channel(self, value):
        try:
            self._market_channel = int(value)
        except:
            self._market_channel = None

    @property
    def announcement_channel(self) -> str:
        return str(self._announcement_channel)
    
    @announcement_channel.setter
    def announcement_channel(self, value):
        try:
            self._announcement_channel = int(value)
        except:
            self._announcement_channel = None

    @property
    def staff_channel(self) -> str:
        return str(self._staff_channel)
    
    @staff_channel.setter
    def staff_channel(self, value):
        try:
            self._staff_channel = int(value)
        except:
            self._staff_channel = None

    @property
    def help_channel(self) -> str:
        return str(self._help_channel)
    
    @help_channel.setter
    def help_channel(self, value):
        try:
            self._help_channel = int(value)
        except:
            self._help_channel = None

    @property
    def arena_board_channel(self) -> str:
        return str(self._arena_board_channel)
    
    @arena_board_channel.setter
    def arena_board_channel(self, value):
        try:
            self._arena_board_channel = int(value)
        except:
            self._arena_board_channel = None

    @property
    def exit_channel(self) -> str:
        return str(self._exit_channel)
    
    @exit_channel.setter
    def exit_channel(self, value):
        try:
            self._exit_channel = int(value)
        except:
            self._exit_channel = None

    @property
    def entrance_channel(self) -> str:
        return str(self._entrance_channel)
    
    @entrance_channel.setter
    def entrance_channel(self, value):
        try:
            self._entrance_channel = int(value)
        except:
            self._entrance_channel = None

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
    _guild_id: Mapped[int] = mapped_column("guild_id", ForeignKey("players.guild_id"), nullable=False)
    _player_id: Mapped[int] = mapped_column("player_id", ForeignKey("players.id"), nullable=False)
    _species: Mapped[int] = mapped_column("species", ForeignKey("c_character_species.id"), nullable=False)
    credits: Mapped[int]
    _faction: Mapped[int] = mapped_column("faction", ForeignKey("c_factions.id"), nullable=True)
    name: Mapped[str]
    level: Mapped[int]
    active: Mapped[bool]

    player = relationship("Player", 
                          back_populates="characters",
                          foreign_keys=[_player_id])
    
    classes = relationship("CharacterClass",
                           back_populates="character",
                           lazy="select",
                           primaryjoin="and_(Character.id == CharacterClass.character_id, CharacterClass.active == True)")
    
    _species_record = relationship(
        "Species",
        backref="characters",
        foreign_keys=[_species],
        lazy="joined"
    )

    _faction_record = relationship("Faction")
    
    @property
    def faction(self):
        return self._faction_record

    @property
    def species(self):
        return self._species_record
    
    @property
    def player_id(self):
        return str(self._player_id)
    
    @property
    def guild_id(self):
        return str(self._guild_id)

class CharacterClass(db.Model):
    __tablename__ = "character_class"
    id: Mapped[int] = mapped_column(primary_key=True)
    character_id: Mapped[int] = mapped_column(ForeignKey("characters.id"), nullable=False)
    _primary_class: Mapped[int] = mapped_column("primary_class", ForeignKey("c_character_class.id"), nullable=False)
    _archetype: Mapped[int] = mapped_column("archetype", ForeignKey("c_character_archetype.id"), nullable=True)
    active: Mapped[bool]

    character = relationship("Character",
                             back_populates="classes",
                             foreign_keys=[character_id])
    
    _primary_class_record = relationship(
        "PrimaryClass",
        backref="character_class",
        foreign_keys=[_primary_class],
        lazy="joined"
    )

    _archetype_record = relationship(
        "Archetype",
        backref="character_class",
        foreign_keys=[_archetype],
        lazy="joined"
    )

    @property
    def primary_class(self):
        return self._primary_class_record
    
    @property
    def archetype(self):
        return self._archetype_record


class Player(db.Model):
    __tablename__ = "players"
    _id: Mapped[int] = mapped_column("id", primary_key=True)
    cc: Mapped[int]
    div_cc: Mapped[int]
    _guild_id: Mapped[int] = mapped_column("guild_id", primary_key=True)
    points: Mapped[int]
    activity_points: Mapped[int]
    handicap_amount: Mapped[int]
    _statistics: Mapped[str] = mapped_column("statistics")

    characters = relationship("Character", 
                              back_populates="player",
                              lazy="select",
                              primaryjoin="and_(Player._id == Character._player_id, Player._guild_id == Character._guild_id, Character.active == True)")

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

    @property
    def id(self):
        return str(self._id)
    
    @property
    def guild_id(self):
        return str(self._guild_id)
    
    @property
    def member(self):
        members = [DiscordMember(**m) for m in get_members_from_cache()]
        try:
            if (m := next((m for m in members if m.user and m.user._id == self._id), None)):
                return m.__dict__
            return None
        except:
            return None

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
    _activity: Mapped[int] = mapped_column("activity", ForeignKey("c_activity.id"), nullable=False)
    notes: Mapped[str]
    character_id: Mapped[int] = mapped_column(ForeignKey("characters.id"), nullable=True)
    _player_id: Mapped[int] = mapped_column("player_id")
    _author: Mapped[int] = mapped_column("author")
    guild_id: Mapped[int]
    cc: Mapped[int]
    credits: Mapped[int]
    renown: Mapped[int]
    _faction: Mapped[int] = mapped_column("faction", ForeignKey("c_factions.id"), nullable=True)
    invalid: Mapped[bool]
    created_ts: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))

    _activity_record = relationship(Activity, back_populates="logs")
    _faction_record = relationship("Faction")
    _character_record = relationship("Character")

    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self._activity = kwargs.get('activity')
        self.notes = kwargs.get('notes')
        self.character_id = kwargs.get('character_id')
        self._player_id = kwargs.get('character_id')
        self._author = kwargs.get('author')
        self.guild_id = kwargs.get('guild_id')
        self.cc = kwargs.get('cc')
        self.credits = kwargs.get('credits')
        self.renown = kwargs.get('renown')
        self._faction = kwargs.get('faction')
        self.invalid = kwargs.get('invalid')
        self.created_ts = kwargs.get('created_ts')

    @property
    def activity(self):
        return self._activity_record
    
    @activity.setter
    def activity(self, value):
        try:
            self._activity = int(value)
        except:
            self._activity = ""

    @property
    def faction(self):
        return self._faction_record
    
    @faction.setter
    def faction(self, value):
        try:
            self._faction = int(value)
        except:
            self._faction = ""

    @property
    def member(self):
        members = [DiscordMember(**m) for m in get_members_from_cache()]
        try:
            if (m := next((m for m in members if m.user and m.user._id == self._player_id), None)):
                return m.__dict__
            return None
        except:
            return None
        
    @property
    def author(self):
        members = [DiscordMember(**m) for m in get_members_from_cache()]
        try:
            if (m := next((m for m in members if m.user and m.user._id == self._author), None)):
                return m.__dict__
            return ""
        except:
            return ""
        
    @property   
    def character(self):
        return self._character_record
    
    @property
    def player_id(self):
        return str(self._player_id)
    
    @player_id.setter
    def player_id(self, value):
        try:
            self._player_id = int(value)
        except:
            self._player_id = None


class BotMessage():
    def __init__(self, message_id: str, channel_id: str, channel_name: str, title: str, content: str, **kwargs):
        self.message_id = message_id
        self.channel_id = channel_id
        self.channel_name = channel_name
        self.content = content
        self.title = title
        self.pin = kwargs.get('pin', False)
        self.error = kwargs.get("error", "")


class CustomJSONProvider(JSONProvider):
    def dumps(self, obj, **kwargs):
        return json.dumps(obj, **kwargs, cls=AlchemyEncoder)

    def loads(self, s: str | bytes, **kwargs):
        return json.loads(s, **kwargs)
      

class AlchemyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        elif isinstance(obj, (DiscordMember, DiscordUser, DiscordChannel, DiscordRole)):
            return obj.to_dict()
                    
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
                fields["member"] = obj.member
                fields["character"] = obj.character
                fields["author"] = obj.author

            elif isinstance(obj, Player):
                fields["characters"] = obj.characters
                fields["member"] = obj.member

            elif isinstance(obj, Character):
                fields["classes"] = obj.classes

            return fields
        return json.JSONEncoder.default(self, obj)
