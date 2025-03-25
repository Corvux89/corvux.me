import { ToastError, ToastSuccess } from "../General/main.js"
import { Activity, ActivityPoint, CodeConversion, DiscordChannel, DiscordEntitlement, DiscordRole as DiscordRole, Financial, LevelCost, Log, NewMessage, Player, RefMessage, ResoluteGuild, Store } from "./types.js"

// TODO: Deprecate this

export const apiUrls = {
    guild: "api/guild",
    message: "api/message",
    channnel: "api/channels",
    role: "api/roles",
    log: "api/logs",
    activity: "api/activities",
    activityPoint: "api/activity_points",
    player: "api/players",
    codeConversion: "api/code_conversion",
    levelCost: "api/level_costs",
    financial: "api/financial",
    store: "api/store",
    entitlement: "api/entitlement"
}

const channel_url = `api/channels`
const role_url = `api/roles`
const log_url = `api/logs`
const activity_url = `api/activities`
const activity_point_url = `api/activity_points`
const player_url = `api/players`
const code_conversion_url = `api/code_conversion`
const level_cost_url = `api/level_costs`
const financial_url = `api/financial`
const store_url = `api/store`
const enetitlement_url = `api/entitlements`

export async function fetchData<T>(url: string): Promise<T> {
    const session = document.cookie
    console.log(session)
    const res = await fetch(url)
    if (res.ok){
        return res.json()
    } else{
        const err = await res.json()
        ToastError(err.error)
        throw new Error(err.error)
    }
}

export async function sendData<T>(url: string, method: string, data: any): Promise<T> {
    const res = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        ToastSuccess("Successfully updated!");
        return res.json();
    } else {
        const err = await res.json();
        ToastError(err.error);
        throw new Error(err.error);
    }
}


export function getGuild(): Promise<ResoluteGuild>{
    return fetchData(apiUrls.guild)
}

export function updateGuild(guild: ResoluteGuild): Promise<ResoluteGuild>{
    return sendData(apiUrls.guild, 'PATCH', guild)
}

export function getMessages(guild_id?: string, message_id?: string): Promise<RefMessage[] | RefMessage> {
    let url = apiUrls.message

    if (guild_id && message_id){
        url = `${url}/${guild_id}/${message_id}`
    }
    
    return fetchData(url)
}

export function newMessage(message: NewMessage): Promise<RefMessage>{
    return sendData(apiUrls.message, "POST", message)
}

export function updateMessage(message: RefMessage): Promise<RefMessage>{
    return sendData(apiUrls.message, "PATCH", message)
}

export function deleteMessage(mesage_id: string): Promise<void>{
   return sendData(apiUrls.message, "DELETE", { mesage_id })
}

export function getChannels(): Promise<DiscordChannel[]>{
    return fetch(channel_url)
    .then(res => {
        if (res.ok){
            return res.json()
        } else{
            return res.json().then(err => ToastError(err.error))
        }
    })
    .then(res => {
        return res as DiscordChannel[]
    })
}

export function getRoles(): Promise<DiscordRole[]>{
    return fetch(role_url)
    .then(res => {
        if (res.ok){
            return res.json()
        } else{
            return res.json().then(err => ToastError(err.error))
        }
    })
    .then(res => {
        return res as DiscordRole[]
    })
}

export function getLogs(): Promise<Log[]>{
    return fetch(log_url)
    .then(res => {
        if (res.ok){
            return res.json()
        } else{
            return res.json().then(err => ToastError(err.error))
        }
    })
    .then(res => {
        res.forEach(log => {
            log.created_ts = new Date(log.created_ts).toLocaleString()
        })
        
        return res as Log[]
    })
    
}

export function getActivities(): Promise<Activity[]>{
    return fetch(activity_url)
    .then(res => {
        if (res.ok){
            return res.json()
        } else{
            return res.json().then(err => ToastError(err.error))
        }
    })
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

export function getPlayers(guild_id?: string, player_id?: string): Promise<Player[] | Player>{
    let url = player_url
    if (guild_id){
        url = `${url}/${guild_id}`

        if (player_id){
            url = `${url}/${player_id}`
        }
    }        

    return fetch(url)
    .then(res => {
        if (res.ok){
            return res.json()
        } else{
            return res.json().then(err => ToastError(err.error))
        }
    })
    .then(res => {
        if (guild_id || player_id){
            return res as Player
        }
        return res as Player[]
    })
}

export function getActivityPoints(): Promise<ActivityPoint[]>{
    return fetch(activity_point_url)
    .then(res => {
        if (res.ok){
            return res.json()
        } else{
            return res.json().then(err => ToastError(err.error))
        }
    })
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
    .then(res => {
        if (res.ok){
            return res.json()
        } else{
            return res.json().then(err => ToastError(err.error))
        }
    })
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
    .then(res => {
        if (res.ok){
            return res.json()
        } else{
            return res.json().then(err => ToastError(err.error))
        }
    })
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

export function getFinancial(): Promise<Financial>{
    return fetch(financial_url)
    .then(res => {
        if (res.ok){
            return res.json()
        } else{
            return res.json().then(err => ToastError(err.error))
        }
    })
    .then(res => {
        return res as Financial
    })
}

export function updateFinancial(fin: Financial): Promise<Financial>{
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()

        request.open('PATCH', financial_url, true)
        request.setRequestHeader('Content-Type', 'application/json')

        request.onload = function () {
            if (request.status == 200){
                ToastSuccess("Successfully updated!")
                resolve(this.response.responseText)
            } else {
                ToastError(this.response)
                resolve(null)
            }
        }

        request.onerror = function () {
            reject(new Error("Something went wrong"))
        }

        request.send(JSON.stringify(fin))
    })
}

export function getStores(): Promise<Store[]>{
    return fetch(store_url)
    .then(res => {
        if (res.ok){
            return res.json()
        } else{
            return res.json().then(err => ToastError(err.error))
        }
    })
    .then(res => {
        return res as Store[]
    })
}

export function updateStores(store: Store[]): Promise<Store[]>{
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()

        request.open('PATCH', store_url, true)
        request.setRequestHeader('Content-Type', 'application/json')

        request.onload = function () {
            if (request.status == 200){
                ToastSuccess("Successfully updated!")
                resolve(this.response.responseText)
            } else {
                ToastError(this.response)
                resolve(null)
            }
        }

        request.onerror = function () {
            reject(new Error("Something went wrong"))
        }

        request.send(JSON.stringify(store))
    })
}

export function getEntitlements(): Promise<DiscordEntitlement[]>{
    return fetch(enetitlement_url)
    .then(res => {
        if (res.ok){
            return res.json()
        } else{
            return res.json().then(err => ToastError(err.error))
        }
    })
    .then(res => {
        return res as DiscordEntitlement[]
    })
}
