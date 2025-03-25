import { ToastError } from "../General/main.js";
export function classString(obj) {
    return obj.map(c => `${c.archetype?.value ? `${c.archetype.value} ` : ''}${c.primary_class.value}`).join('\n');
}
export function playerName(obj) {
    const user = obj?.user ?? undefined;
    return obj?.nick?.toString() ?? user ? user?.global_name?.toString() ?? user?.username?.toString() : "Player not found";
}
// TODO: Finish flushing this out
export class G0T0Bot {
    async fetch(url) {
        const session = document.cookie;
        console.log(session);
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
    async get_guild(guild_id) {
        let url = 'api/guild';
        if (guild_id) {
            url = `${url}/${guild_id}`;
        }
        const guild = await this.fetch(url);
        return guild;
    }
    async get_player(guild_id, player_id) {
        const player = await this.fetch(`api/players/${guild_id}/${player_id}`);
        return player;
    }
}
