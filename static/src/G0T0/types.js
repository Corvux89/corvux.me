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
        let url = `api/players/${guild_id}${player_id ? `/${player_id}` : ''}`;
        return this.fetch(url);
    }
    async get_messages(guild_id, message_id) {
        let url = `api/message/${guild_id}${message_id ? `/${message_id}` : ''}`;
        return this.fetch(url);
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
    async get_code_conversions() {
        return this.fetch(`api/code_conversion`);
    }
    async update_code_conversions(converions) {
        return this.sendData(`api/code_conversion`, "PATCH", converions);
    }
    async get_level_costs() {
        return this.fetch(`api/level_costs`);
    }
    async update_level_costs(level_costs) {
        return this.sendData('api/level_costs', "PATCH", level_costs);
    }
    async get_financials() {
        return this.fetch(`api/financial`);
    }
    async update_financials(financial) {
        return this.sendData(`api/financial`, "PATCH", financial);
    }
    async get_store_items() {
        return this.fetch(`api/store`);
    }
    async update_store_items(store_items) {
        return this.sendData(`api/store`, "PATCH", store_items);
    }
    async get_entitlements() {
        return this.fetch(`api/entitlements`);
    }
    async get_channels(guild_id) {
        return this.fetch(`api/channels/${guild_id}`);
    }
    async get_roles(guild_id) {
        return this.fetch(`api/roles/${guild_id}`);
    }
}
