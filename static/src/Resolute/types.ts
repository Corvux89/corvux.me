export interface ResoluteGuild {
    id: bigint
    max_level: number
    handicap_cc: number
    max_characters: number
    weekly_announcement: string[]
    ping_announcement: boolean
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