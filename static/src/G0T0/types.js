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
    async new_message(guild_id, message) {
        return this.sendData(`api/message/${guild_id}`, "POST", message);
    }
    async update_message(message) {
        return this.sendData(`api/message/${message.message_id}`, "PATCH", message);
    }
    async delete_message(message_id) {
        return this.sendData(`api/message/${message_id}`, "DELETE", { message_id });
    }
    async get_activities() {
        return this.fetch(`api/activities`);
    }
    async update_activities(activities) {
        return this.sendData(`api/activities`, "PATCH", activities);
    }
    async get_activity_points() {
        return this.fetch(`api/activity_points`);
    }
    async update_activity_points(activity_points) {
        return this.sendData(`api/activity_points`, "PATCH", activity_points);
    }
    async get_channels(guild_id) {
        return this.fetch(`api/channels/${guild_id}`);
    }
    async get_roles(guild_id) {
        return this.fetch(`api/roles/${guild_id}`);
    }
}
