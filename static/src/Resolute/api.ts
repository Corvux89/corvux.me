import { ToastError, ToastSuccess } from "./main.js"
import { Activity, DiscordChannel, Log, NewMessage, Player, RefMessage, ResoluteGuild } from "./types.js"

const guild_url = `${window.location.href}api/guild`
const message_url = `${window.location.href}api/message`
const channel_url = `${window.location.href}api/channels`
const log_url = `${window.location.href}api/logs`
const activity_url = `${window.location.href}api/activities`
const player_url = `${window.location.href}api/players`

export function getGuild(): Promise<ResoluteGuild>{
    return fetch(guild_url)
    .then(res => res.json())
    .then(res => {
        return res as ResoluteGuild
    })
}

export function updateGuild(guild: ResoluteGuild): Promise<ResoluteGuild>{
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()

        request.open('PATCH', guild_url, true)
        request.setRequestHeader('Content-Type', 'application/json')

        request.onload = function () {
            if (request.status == 200){
                ToastSuccess("Updated!")
                resolve(this.response.responseText)
            } else {
                ToastError(this.response)
                resolve(null)
            }
        }

        request.onerror = function () {
            reject(new Error("Something went wrong"))
        }

        request.send(JSON.stringify(guild))
    })
}

export function getMessages(): Promise<RefMessage[]>{
    return fetch(message_url)
    .then(res => res.json())
    .then(res => {
        return res as RefMessage[]
    })
}

export function newMessage(message: NewMessage): Promise<RefMessage>{
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()

        request.open('POST', message_url, true)
        request.setRequestHeader('Content-Type', 'application/json')

        request.onload = function () {
            if (request.status == 200){
                resolve(JSON.parse(this.responseText))
            } else {
                ToastError(this.response)
                resolve(null)
            }
        }

        request.onerror = function () {
            reject(new Error("Something went wrong"))
        }

        request.send(JSON.stringify(message))
    })
}

export function updateMessage(message: RefMessage): Promise<RefMessage>{
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()

        request.open('PATCH', message_url, true)
        request.setRequestHeader('Content-Type', 'application/json')

        request.onload = function () {
            if (request.status == 200){
                ToastSuccess("Message has been successfully updated!")
                resolve(this.response.responseText)
            } else {
                ToastError(this.response)
                resolve(null)
            }
        }

        request.onerror = function () {
            reject(new Error("Something went wrong"))
        }

        request.send(JSON.stringify(message))
    })
}

export function deleteMessage(mesage_id: string): void{
    new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()

        request.open('DELETE', message_url, true)
        request.setRequestHeader('Content-Type', 'application/json')

        request.onload = function () {
            if (request.status == 200){
                resolve(this.response.responseText)
            } else {
                ToastError(this.response)
                resolve(null)
            }
        }

        request.onerror = function () {
            reject(new Error("Something went wrong"))
        }

        request.send(JSON.stringify({"message_id": mesage_id}))
    })
}

export function getChannels(): Promise<DiscordChannel[]>{
    return fetch(channel_url)
    .then(res => res.json())
    .then(res => {
        return res as DiscordChannel[]
    })
}

export function getLogs(): Promise<Log[]>{
    return fetch(log_url)
    .then(res => res.json())
    .then(res => {
        res.forEach(log => {
            log.created_ts = new Date(log.created_ts).toLocaleString()
        })
        
        return res as Log[]
    })
    
}

export function getActivities(): Promise<Activity[]>{
    return fetch(activity_url)
    .then(res => res.json())
    .then(res => {
        return res as Activity[]
    })
}

export function updateActivities(activities: Activity[]): Promise<Activity[]>{
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()

        request.open('PATCH', activity_url, true)
        request.setRequestHeader('Content-Type', 'application/json')

        request.onload = function () {
            if (request.status == 200){
                ToastSuccess("Successfully updated!<br> Use <span class='fst-italic'>/admin reload compendium</span> to load changes into the bot")
                resolve(this.response.responseText)
            } else {
                ToastError(this.response)
                resolve(null)
            }
        }

        request.onerror = function () {
            reject(new Error("Something went wrong"))
        }

        request.send(JSON.stringify(activities))
    })
}

export function getPlayers(): Promise<Player[]>{
    return fetch(player_url)
    .then(res => res.json())
    .then(res => {
        return res as Player[]
    })
}