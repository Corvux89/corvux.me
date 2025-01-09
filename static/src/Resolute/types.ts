export interface GenericDict {[key: string]: string | number | boolean | GenericDict}

export interface ResoluteGuild {
    id: string
    max_level: number
    handicap_cc: number
    max_characters: number
    weekly_announcement: string[]
    ping_announcement: boolean
    div_limit: number
    reward_threshold: number
    entry_role: string
    member_role: string
    tier_2_role: string
    tier_3_role: string
    tier_4_role: string
    tier_5_role: string
    tier_6_role: string
    admin_role: string
    staff_role: string
    bot_role: string
    quest_role: string
    application_channel: string
    market_channel: string
    announcement_channel: string
    staff_channel: string
    help_channel: string
    arena_board_channel: string
    exit_channel: string
    entrance_channel: string
    activity_points_channel: string
    rp_post_channel: string
    dev_channels: string[]
}

export interface RefMessage {
    message_id: string, 
    channel_id: string,
    channel_name: string,
    title: string,
    error: string,
    content?: string,
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
    id: string,
    name: string   
}

export interface DiscordRole {
    id: string,
    name: string   
}

export interface DiscordEntitlement {
    id: string
    sku_id: string
    type: number
    deleted: boolean
    consumed: boolean
    user_id: string
    member: GenericDict
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
    character_id: string,
    primary_class: PrimaryClass,
    archetype: Archetype,
    active: boolean
}

export interface Character{
    id: number,
    guild_id: string,
    player_id: string,
    species: Species,
    credits: number,
    faction: Faction,
    name: string,
    level: number,
    active: boolean
    player_name?: string
    classes: CharacterClass[]
}

export function classString(obj: CharacterClass[]){
    return obj.map(c => `${c.archetype?.value ? `${c.archetype.value} ` : ''}${c.primary_class.value}`).join('\n')
}

export interface Player{
    id: string,
    cc: number,
    div_cc: number,
    guild_id: string,
    points: number,
    activity_points: number,
    handicap_amount: number,
    member: GenericDict,
    characters: Character[]
    statistics: GenericDict
}

export function playerName(obj: GenericDict): string {
    const user: GenericDict = obj?.user as GenericDict ?? undefined
    return obj?.nick?.toString() ?? user ? user?.global_name?.toString() ?? user?.username?.toString() : "Player not found"
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

export interface Financial{
    monthly_goal: number
    monthly_total: number
    reserve: number
    month_count: number
    last_reset?: Date
}

export interface Store{
    sku: string
    user_cost: number
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

export type  DailyStats = {
    count: number
    num_lines: number
    num_words: number
    num_characters: number
}

export type NPCStats = Record<string, DailyStats>

export type statistics = {
    npc: Record<string, NPCStats>
}