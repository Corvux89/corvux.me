
import { G0T0Bot } from "../G0T0/types.js"
import { UserSession } from "./types.js"

export function ToastError(message: string): void{
    $("#error-toast .toast-body").html(message)
    $("#error-toast").toast("show")
}

export function ToastSuccess(message: string): void{
    $("#confirm-toast .toast-body").html(message)
    $("#confirm-toast").toast("show")
}

declare global{
    var userSession: UserSession
    var bot: G0T0Bot
}



globalThis.userSession = new UserSession()
globalThis.bot = new G0T0Bot()
await globalThis.userSession.build()