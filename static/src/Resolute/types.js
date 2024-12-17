export function classString(obj) {
    return obj.map(c => `${c.archetype?.value ? `${c.archetype.value} ` : ''}${c.primary_class.value}`).join('\n');
}
export function playerName(obj) {
    const user = obj?.user ?? undefined;
    return obj?.nick?.toString() ?? user ? user?.global_name?.toString() ?? user?.username?.toString() : "Player not found";
}
