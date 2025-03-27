import { DiscordChannel, DiscordEntitlement, DiscordRole, GenericDict, WebClass } from "../General/types.js"

export interface G0T0Guild {
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

export interface Activity{
    id: number,
    value: string,
    cc: number,
    diversion: boolean,
    points: number,
    credit_ratio: number
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
    member_display_name: string,
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

// TODO: Finish flushing this out
export class G0T0Bot extends WebClass{
    async get_guild(guild_id: string): Promise<G0T0Guild>{
        const guild = await this.fetch(`api/guild/${guild_id}`) as G0T0Guild

        return guild
    }

    async update_guild(guild: G0T0Guild){
        return this.sendData(`api/guild/${guild.id}`, "PATCH", guild)
    }

    async get_player(guild_id: string, player_id?: string): Promise<Player | Player[]>{
        let url = `api/players/${guild_id}${player_id ? `/${player_id}` : ''}`
        return this.fetch(url)
    }

    async get_messages(guild_id: string, message_id?: string): Promise<RefMessage[] | RefMessage>{
        let url = `api/message/${guild_id}${message_id ? `/${message_id}` : ''}`
        return this.fetch(url) 
    } 

    async new_message(guild_id: string, message: NewMessage): Promise<RefMessage>{
        return this.sendData(`api/message/${guild_id}`, "POST", message)
    }

    async update_message(message: RefMessage): Promise<void>{
        return this.sendData(`api/message/${message.message_id}`, "PATCH", message)
    }
    
    async delete_message(message_id: number): Promise<void>{
        return this.sendData(`api/message/${message_id}`, "DELETE", {message_id})
    }

    async get_activities(): Promise<Activity[]>{
        return this.fetch(`api/activities`)
    }

    async update_activities(activities: Activity[]): Promise<void>{
        return this.sendData(`api/activities`, "PATCH", activities)
    }

    async get_activity_points(): Promise<ActivityPoint[]>{
        return this.fetch(`api/activity_points`)
    }

    async update_activity_points(activity_points: ActivityPoint[]): Promise<void>{
        return this.sendData(`api/activity_points`, "PATCH", activity_points)
    }
    
    async get_code_conversions(): Promise<CodeConversion[]>{
        return this.fetch(`api/code_conversion`)
    }

    async update_code_conversions(converions: CodeConversion[]): Promise<void>{
        return this.sendData(`api/code_conversion`, "PATCH", converions)
    }

    async get_level_costs(): Promise<LevelCost[]>{
        return this.fetch(`api/level_costs`)
    }

    async update_level_costs(level_costs: LevelCost[]): Promise<void>{
        return this.sendData('api/level_costs', "PATCH", level_costs)
    }

    async get_financials(): Promise<Financial>{
        return this.fetch(`api/financial`)
    }

    async update_financials(financial: Financial): Promise<void>{
        return this.sendData(`api/financial`, "PATCH", financial)
    }

    async get_store_items(): Promise<Store[]>{
        return this.fetch(`api/store`)
    }

    async update_store_items(store_items: Store[]): Promise<void>{
        return this.sendData(`api/store`, "PATCH", store_items)
    }

    async get_entitlements(): Promise<DiscordEntitlement[]>{
        return this.fetch(`api/entitlements`)
    }

    async get_channels(guild_id: string): Promise<DiscordChannel[]>{
        return this.fetch(`api/channels/${guild_id}`)
    }

    async get_roles(guild_id: string): Promise<DiscordRole[]>{
        return this.fetch(`api/roles/${guild_id}`)
    }
}