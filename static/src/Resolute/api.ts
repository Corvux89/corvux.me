import { ToastError, ToastSuccess } from "./main.js"
import { Activity, ActivityPoint, CodeConversion, DiscordChannel, LevelCost, Log, NewMessage, Player, RefMessage, ResoluteGuild } from "./types.js"

const guild_url = `${window.location.href}api/guild`
const message_url = `${window.location.href}api/message`
const channel_url = `${window.location.href}api/channels`
const log_url = `${window.location.href}api/logs`
const activity_url = `${window.location.href}api/activities`
const activity_point_url = `${window.location.href}api/activity_points`
const player_url = `${window.location.href}api/players`
const code_conversion_url = `${window.location.href}api/code_conversion`
const level_cost_url = `${window.location.href}api/level_costs`
const level_cap_url = `${window.location.href}api/level_caps`

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
                ToastSuccess("Successfully updated! Ensure the compendium has reloaded for the updates to take effect.")
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

export function getActivityPoints(): Promise<ActivityPoint[]>{
    return fetch(activity_point_url)
    .then(res => res.json())
    .then(res => {
        return res as ActivityPoint[]
    })
}

export function updateActivityPoints(activities: ActivityPoint[]): Promise<ActivityPoint[]>{
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()

        request.open('PATCH', activity_point_url, true)
        request.setRequestHeader('Content-Type', 'application/json')

        request.onload = function () {
            if (request.status == 200){
                ToastSuccess("Successfully updated! Ensure the compendium has reloaded for the updates to take effect.")
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

export function getCodeconversions(): Promise<CodeConversion[]>{
    return fetch(code_conversion_url)
    .then(res => res.json())
    .then(res => {
        return res as CodeConversion[]
    })
}

export function udpateCodeConversion(conversions: CodeConversion[]): Promise<CodeConversion[]>{
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()

        request.open('PATCH', code_conversion_url, true)
        request.setRequestHeader('Content-Type', 'application/json')

        request.onload = function () {
            if (request.status == 200){
                ToastSuccess("Successfully updated! Ensure the compendium has reloaded for the updates to take effect.")
                resolve(this.response.responseText)
            } else {
                ToastError(this.response)
                resolve(null)
            }
        }

        request.onerror = function () {
            reject(new Error("Something went wrong"))
        }

        request.send(JSON.stringify(conversions))
    })
}

export function getLevelCosts(): Promise<LevelCost[]>{
    return fetch(level_cost_url)
    .then(res => res.json())
    .then(res => {
        return res as LevelCost[]
    })
}

export function updateLevelCosts(costs: LevelCost[]): Promise<LevelCost[]>{
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()

        request.open('PATCH', level_cost_url, true)
        request.setRequestHeader('Content-Type', 'application/json')

        request.onload = function () {
            if (request.status == 200){
                ToastSuccess("Successfully updated! Ensure the compendium has reloaded for the updates to take effect.")
                resolve(this.response.responseText)
            } else {
                ToastError(this.response)
                resolve(null)
            }
        }

        request.onerror = function () {
            reject(new Error("Something went wrong"))
        }

        request.send(JSON.stringify(costs))
    })
}
