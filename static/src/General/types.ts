import { ToastError, ToastSuccess } from "./main.js"

export interface GenericDict {[key: string]: string | number | boolean | GenericDict}

export class WebClass{
    async fetch<T>(url: string): Promise<T>{               
        const res = await fetch(url)
        if (res.ok){
            return res.json()
        } else{
            const err = await res.json()
            ToastError(err.error)
            throw new Error(err.error)
        }
    }

    async sendData<T>(url: string, method: string, data: unknown, silent: boolean = false): Promise<T> {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    
        if (res.ok) {
            if (!silent){
                ToastSuccess("Successfully updated!");
            }
            return res.json();
        } else {
            const err = await res.json();
            if (!silent){
                ToastError(err.error);
            }
            throw new Error(err.error);
        }
    }
}

export class UserSession extends WebClass{
    user_id: string
    guilds: DiscordGuild[] = []
    guild: DiscordGuild = {}
    initialised: boolean = false

    async build(force: boolean = false): Promise<void>{
        if (!this.initialised || force){
            const data = await this.fetch(`/auth/session`) as UserSession
            this.user_id = data.user_id?.toString() || ''
            this.guilds = Array.isArray(data.guilds) ? data.guilds : []
            this.guild = data.guild && typeof data.guild == 'object' ? data.guild : (this.guilds[0]) || {}
            this.initialised=true
            const event = new CustomEvent("userSessionReady")
            document.dispatchEvent(event)
        }
    } 
    
    async update(guild_id: number): Promise<void>{
        const res = await this.sendData(`/auth/guilds/${guild_id}`, "PATCH", {}, true)
        if (res == 200){
            await this.build(true)
            const event = new CustomEvent("guildUpdated")
            document.dispatchEvent(event)        
        }
    }
}

export interface DiscordChannel {
    id: string
    name: string
}

export interface DiscordRole {
    id: string
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

export interface DiscordGuild {
    banner?: string
    id?: string
    features?: string[]
    icon?: string
    name?: string
    owner?: boolean
    permissions?: number
    permissions_new?: string
}
