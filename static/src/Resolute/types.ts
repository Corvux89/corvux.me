export interface GenericDict {[key: string]: string | number | boolean | GenericDict}

export interface ResoluteGuild {
    id: bigint
    max_level: number
    handicap_cc: number
    max_characters: number
    weekly_announcement: string[]
    ping_announcement: boolean
    div_limit: number
}

export interface RefMessage {
    message_id: string, 
    channel_id: string,
    channel_name: string,
    title: string,
    error: string,
    content: string,
    pin: boolean
}

export interface NewMessage{
    channel_id: string,
    channel_name: string,
    message: string,
    title: string,
    pin: boolean
}

export interface DiscordChannel {
    id: bigint,
    name: string   
}

export interface Activity{
    id: number,
    value: string,
    cc: number,
    diversion: boolean,
    points: number
}

export interface ActivityPoint{
    id: number
    points: number
}

export interface CodeConversion{
    id: number
    value: number
}

export interface LevelCost{
    id: number
    cc: number
}

export interface Faction{
    id: number,
    value: string
}

export interface PrimaryClass{
    id: number,
    value: string
}

export interface Archetype{
    id: number,
    value: string,
    parent: number
}

export interface Species{
    id: number,
    value: string
}

export interface CharacterClass{
    id: number,
    character_id: number,
    primary_class: PrimaryClass,
    archetype: Archetype,
    active: boolean
}

export interface Character{
    id: number,
    guild_id: number,
    player_id: number,
    species: Species,
    credits: number,
    faction: Faction,
    name: string,
    level: number,
    active: boolean
    player_name?: string
}

export interface Player{
    id: number,
    cc: number,
    div_cc: number,
    guild_id: number,
    points: number,
    activity_points: number,
    handicap_amount: number,
    member: GenericDict,
    characters: Character[]
    statistics: GenericDict
}

export interface Log{
    id: string,
    activity: Activity,
    notes: string,
    character_id: string,
    player_id: string,
    guild_id: string,
    cc: number,
    credits: number,
    renown: number,
    faction: Faction,
    invalid: boolean,
    created_ts: Date
    character: Character
}

export interface DataTableRequest {
    draw: number;
    start: number;
    length: number;
    order: Array<{ column: number; dir: 'asc' | 'desc' }>;
    search: { value: string; regex: boolean };
    columns: Array<{ data: string; searchable: boolean; orderable: boolean }>;
    startDate: string
    endDate: string
}
