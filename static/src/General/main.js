import { G0T0Bot } from "../G0T0/types.js";
import { UserSession } from "./types.js";
export function ToastError(message) {
    $("#error-toast .toast-body").html(message);
    $("#error-toast").toast("show");
}
export function ToastSuccess(message) {
    $("#confirm-toast .toast-body").html(message);
    $("#confirm-toast").toast("show");
}
globalThis.bot = new G0T0Bot;
globalThis.userSession = new UserSession();
await globalThis.userSession.build();
