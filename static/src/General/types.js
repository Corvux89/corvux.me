import { ToastError } from "./main.js";
export class UserSession {
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
    async build() {
        const data = await this.fetch(`${window.location.origin}/auth/session`);
        this.user_id = data.user_id?.toString() || '';
        this.guilds = Array.isArray(data.guilds) ? data.guilds : [];
        this.guild = data.guild || {};
        if (!this.guild && this.guilds.length > 0) {
            this.guild = this.guilds[0];
        }
    }
    async update() {
        if (this.guild) {
            this.fetch(`${window.location.origin}/auth/guilds/${this.guild.id}`);
        }
    }
}
