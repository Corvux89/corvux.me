import { ToastError } from "./main.js"
import { DiscordChannel, NewMessage, RefMessage, ResoluteGuild } from "./types.js"

const guild_url = `${window.location.href}api/guild`
const message_url = `${window.location.href}api/message`
const channel_url = `${window.location.href}api/channels`

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