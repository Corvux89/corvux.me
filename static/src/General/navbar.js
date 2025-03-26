async function buildGuildDropdown() {
    let guild_list = $("#guild-list");
    guild_list.html('');
    userSession.guilds.forEach(g => {
        guild_list.append(`
            <li>
                <div class="dropdown-item d-flex align-items-center guild-id" data-id="${g.id}">
                    ${g.icon ? `<img src="https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png" class="rounded-circle me-2" width="20" height="20" alt="${g.name}">` : ''}
                    ${g.name}
                </div>
            </li
            `);
    });
    if (userSession.guild) {
        // This is messed up a little
        $("#guild-dropdown").html(`
            ${userSession.guild.icon ? `<img src="https://cdn.discordapp.com/icons/${userSession.guild.id}/${userSession.guild.icon}.png" class="rounded-circle me-2" width="20" height="20" alt="${userSession.guild.name}">` : ''}
            ${userSession.guild.name}
            `);
    }
}
$(document).on("userSessionReady", async function () {
    await buildGuildDropdown();
});
$(document).on("click", ".guild-id", async function () {
    const guild_id = $(this).data("id");
    await userSession.update(guild_id);
    await buildGuildDropdown();
});
export {};
