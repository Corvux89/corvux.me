import { GenericDict } from "../Resolute/types.js"
import { ToastError } from "./main.js"

export class UserSession{
    user_id: string
    guilds: GenericDict[]
    guild: GenericDict

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

    async build(): Promise<void>{
        const data = await this.fetch(`${window.location.origin}/auth/session`) as GenericDict

        this.user_id = data.user_id?.toString() || ''
        this.guilds = Array.isArray(data.guilds) ? data.guilds : []
        this.guild = data.guild as GenericDict || {}

        if (!this.guild && this.guilds.length > 0){
            this.guild = this.guilds[0]
        }
    } 
    
    async update(): Promise<void>{
        if (this.guild){
            this.fetch(`${window.location.origin}/auth/guilds/${this.guild.id}`)
        } 
    }
}