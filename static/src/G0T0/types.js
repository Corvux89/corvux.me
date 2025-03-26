import { WebClass } from "../General/types.js";
export function classString(obj) {
    return obj.map(c => `${c.archetype?.value ? `${c.archetype.value} ` : ''}${c.primary_class.value}`).join('\n');
}
export function playerName(obj) {
    const user = obj?.user ?? undefined;
    return obj?.nick?.toString() ?? user ? user?.global_name?.toString() ?? user?.username?.toString() : "Player not found";
}
// TODO: Finish flushing this out
export class G0T0Bot extends WebClass {
    async get_guild(guild_id) {
        const guild = await this.fetch(`api/guild/${guild_id}`);
        return guild;
    }
    async update_guild(guild) {
        return this.sendData(`api/guild/${guild.id}`, "PATCH", guild);
    }
    async get_player(guild_id, player_id) {
        const player = await this.fetch(`api/players/${guild_id}/${player_id}`);
        return player;
    }
    async get_messages(guild_id, message_id) {
        let url = `api/message/${guild_id}${message_id ? `/${message_id}` : ''}`;
        if (message_id) {
            return await this.fetch(url);
        }
        return await this.fetch(url);
    }
    async delete_message(message_id) {
        console.log(`Here we are with ${message_id}`);
        this.sendData(`/api/message/${message_id}`, "DELETE", { message_id });
    }
}
