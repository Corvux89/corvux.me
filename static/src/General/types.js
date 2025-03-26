import { ToastError, ToastSuccess } from "./main.js";
export class WebClass {
    async fetch(url) {
        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        }
        else {
            const err = await res.json();
            ToastError(err.error);
            throw new Error(err.error);
        }
    }
    async sendData(url, method, data, silent = false) {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            if (!silent) {
                ToastSuccess("Successfully updated!");
            }
            return res.json();
        }
        else {
            const err = await res.json();
            if (!silent) {
                ToastError(err.error);
            }
            throw new Error(err.error);
        }
    }
}
export class UserSession extends WebClass {
    constructor() {
        super(...arguments);
        this.guilds = [];
        this.guild = {};
        this.initialised = false;
    }
    async build(force = false) {
        if (!this.initialised || force) {
            const data = await this.fetch(`${window.location.origin}/auth/session`);
            this.user_id = data.user_id?.toString() || '';
            this.guilds = Array.isArray(data.guilds) ? data.guilds : [];
            this.guild = data.guild && typeof data.guild == 'object' ? data.guild : (this.guilds[0]) || {};
            this.initialised = true;
            const event = new CustomEvent("userSessionReady");
            document.dispatchEvent(event);
            console.log("dispatched");
        }
    }
    async update(guild_id) {
        const res = await this.sendData(`${window.location.origin}/auth/guilds/${guild_id}`, "PATCH", {}, true);
        if (res == 200) {
            await this.build(true);
            const event = new CustomEvent("guildUpdated");
            document.dispatchEvent(event);
        }
    }
}
