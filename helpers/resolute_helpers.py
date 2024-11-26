from sqlalchemy import Date, String, cast, func
from helpers.general_helpers import get_members_from_cache
from models.resolute import Activity, Character, Log


def log_search_filter(search_value: str) -> []:
    if not search_value:
        return []
    
    members = get_members_from_cache()
    member_filter = []
    search_filter = []
    for member in members:
        user = member.get('user', {})
        nick = member.get('nick', '') or ''
        global_name = user.get('global_name', '') or ''
        username = user.get('username', '') or ''
    
        if (search_value.lower() in nick.lower() or
            search_value.lower() in global_name.lower() or
            search_value.lower() in username.lower()):
            member_filter.append(int(user.get('id')))

    search_filter.append(cast(Log.id, String).like(f"%{search_value}%"))
    search_filter.append(Log.notes.ilike(f"%{search_value}%"))
    search_filter.append(func.to_char(Log.created_ts.cast(Date), "FMmm/FMdd/YYYY").like(f"%{search_value}%"))
    search_filter.append(Log.character_record.has(Character.name.ilike(f"%{search_value}%")))
    search_filter.append(Log.activity_record.has(Activity.value.ilike(f"%{search_value}%")))
    search_filter.append(Log.player_id.in_(member_filter))

    return search_filter

def log_set_discord_attributes(logs: list[Log]):
    members = get_members_from_cache()

    for log in logs:
        log.member = next((m for m in members if int(m["user"]["id"]) == log.player_id), None)
        log.author_record = next((m for m in members if int(m["user"]["id"]) == log.author), None)

    