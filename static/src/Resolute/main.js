import { ToastError } from '../General/main.js';
import { deleteMessage, getActivities, getActivityPoints, getChannels, getCodeconversions, getFinancial, getGuild, getLevelCosts, getMessages, getPlayers, getRoles, getStores, newMessage, udpateCodeConversion, updateActivities, updateActivityPoints, updateFinancial, updateGuild, updateLevelCosts, updateMessage, updateStores } from './api.js';
import { playerName } from './types.js';
import { filterStats, initActivityPointsTable, initActivityTable, initAnnouncementTable, initCharacterTable, initConversionTable, initGlobalNPCTable, initLevelCostTable, initLogTable, initMessageTable, initPlayerCharacterTable, initPlayerTable, initSayTable, initSKUTable, initStatsTable, populateSelectOption } from './utils.js';
$('body').addClass("busy");
buildAnnouncementTable();
$("#announcement-ping").on("change", function () {
    getGuild()
        .then(guild => {
        guild.ping_announcement = $(this).prop("checked");
        updateGuild(guild);
    });
});
$(document).on('click', '.announcement-delete', function (e) {
    e.stopPropagation();
    getGuild()
        .then(guild => {
        guild.weekly_announcement.splice($(this).data('id'), 1);
        updateGuild(guild)
            .then(function () {
            buildAnnouncementTable();
        });
    });
});
$(document).on('click', '.message-delete', function (e) {
    e.stopPropagation();
    const message_id = $(this).data('id');
    $("#message-modal-delete-form").data('id', message_id)
        .modal("show");
});
$(document).on('click', '#message-table tbody tr', function (e) {
    const table = $("#message-table").DataTable();
    const row = table.row(this);
    const modal = $("#message-modal-edit-form");
    const message = row.data();
    $("#message-title").val(message.title);
    $("#message-channel").html('')
        .prop("disabled", true)
        .append(`
            <option selected value="${message.channel_id}">${message.channel_name}</option>
            `);
    $("#message-pin").prop("checked", message.pin);
    $("#message-body").val(message.content);
    modal.data("id", message.message_id)
        .modal("show");
});
$(document).on("click", "#announcement-table tbody tr", function () {
    const table = $("#announcement-table").DataTable();
    const row = table.row(this);
    const modal = $("#announcement-modal-edit-form");
    const announcement = row.data();
    if (announcement == undefined) {
        return;
    }
    const parts = announcement.split("|");
    const title = parts.length > 1 ? parts[0] : "";
    const body = parts.length > 1 ? parts[1] : parts[0];
    $(".modal-body #announcement-title").val(title);
    $(".modal-body #announcement-body").val(body);
    modal.data("id", row.index())
        .modal("show");
});
$(document).on("click", "#log-table tbody tr", function () {
    const table = $("#log-table").DataTable();
    const row = table.row(this);
    const rowData = row.data();
    // Check if a dropdown row already exists and remove it
    if ($(this).next().hasClass('dropdown-row')) {
        $(this).next().remove();
        return;
    }
    // Remove any existing dropdown rows
    $('.dropdown-row').remove();
    // Create a new dropdown row
    const additionalInfo = `
        <tr class="dropdown-row">
            <td colspan="${table.columns().count()}">
                <div class="p-3">
                    <strong>Chain Codes:</strong> ${rowData.cc ?? '0'}<br>
                    <strong>Credits:</strong> ${rowData.credits ?? '0'}<br>
                    <strong>Faction:</strong> ${rowData.faction?.value ?? ''}<br>
                    <strong>Renown:</strong> ${rowData.renown ?? '0'}
                </div>
            </td>
        </tr>
    `;
    // Insert the dropdown row after the clicked row
    $(this).after(additionalInfo);
});
$(document).on("click", "#player-character-table tbody tr", function () {
    const table = $("#player-character-table").DataTable();
    const row = table.row(this);
    const rowData = row.data();
    const credits = new Intl.NumberFormat().format(rowData.credits ?? 0);
    if ($(this).next().hasClass('dropdown-row')) {
        $(this).next().remove();
        return;
    }
    $('.dropdown-row').remove();
    const additionalInfo = `
        <tr class="dropdown-row">
            <td colspan="${table.columns().count()}">
                <div class="p-3">
                    <strong>Primary Faction:</strong> ${rowData.faction?.value ?? ''}<br>
                    <strong>Credits:</strong> ${credits}<br>
                </div>
            </td>
        </tr>
    `;
    $(this).after(additionalInfo);
});
$(document).on('click', '#player-table tbody tr', function () {
    const table = $("#player-table").DataTable();
    const playerData = table.row(this).data();
    $("#member-id").val(playerData.id);
    $("#member-name").val(`${playerName(playerData.member)}`);
    $("#player-cc").val(playerData.cc);
    $("#player-div-cc").val(playerData.div_cc);
    $("#player-act-points").val(playerData.activity_points);
    initPlayerCharacterTable(playerData.characters);
    initStatsTable(Object.entries(playerData.statistics.commands ?? {}).map(([key, value]) => ({
        command: key,
        value: value
    })));
    initSayTable(playerData);
    initGlobalNPCTable(playerData);
    $("#player-modal").modal("show");
    $("#member-overview-button").tab("show");
    $("#command-stats-button").tab("show");
});
$(document).on('click', '.message-delete', function (e) {
    e.stopPropagation();
    var message_id = $(this).data('id');
    $("#message-delete-button").data("id", message_id);
});
$("#announcement-tab-button").on('click', function () {
    $('body').addClass("busy");
    buildAnnouncementTable();
});
$("#price-settings-button").on('click', function () {
    $('body').addClass("busy");
    buildPricingTab();
});
$("#bot-messages-button").on('click', function () {
    $('body').addClass("busy");
    buildMessageTab();
});
$("#activity-settings-button").on('click', function () {
    $('body').addClass("busy");
    $("#activity-button").tab("show");
    buildActivityTable();
});
$("#census-button").on('click', function () {
    $('body').addClass("busy");
    $("#players-tab-button").tab("show");
    buildCensusTable();
});
$("#log-review-button").on('click', function () {
    $('body').addClass("busy");
    buildLogTable();
});
$("#message-delete-button").on('click', function () {
    var message_id = $(this).data('id');
    $('body').addClass("busy");
    deleteMessage(message_id);
    buildMessageTab();
});
$("#announcement-new-button").on('click', function () {
    $("#announcement-modal-edit-form").data('id', "new");
    $(".modal-body #announcement-title").val("");
    $(".modal-body #announcement-body").val("");
});
$("#message-new-button").on('click', async function () {
    $('body').addClass("busy");
    const channels = await getChannels();
    channels.sort((a, b) => a.name.localeCompare(b.name));
    $('body').removeClass("busy");
    $(".modal-body #message-title").val("");
    $(".modal-body #message-pin").prop('checked', false);
    $(".modal-body #message-body").val("");
    $(".modal-body #message-channel")
        .html('')
        .prop("disabled", false);
    channels.forEach(c => {
        $(".modal-body #message-channel").append(`<option value="${c.id}">${c.name}</option>`);
    });
    $("#message-modal-edit-form")
        .data('id', "new")
        .modal("show");
});
$(document).on('click', '#announcement-submit-button', function () {
    var title = $("#announcement-title").val();
    var body = $("#announcement-body").val() != undefined ? $("#announcement-body").val() : "";
    var index = $("#announcement-modal-edit-form").data("id");
    var announcement = title != "" ? `${title}|${body}` : body;
    if (announcement != "") {
        getGuild()
            .then(guild => {
            index == "new" ? guild.weekly_announcement.push(announcement.toString()) : guild.weekly_announcement[index] = announcement.toString();
            updateGuild(guild)
                .then(function () {
                buildAnnouncementTable();
            });
        });
    }
});
$(document).on('input', '.point-input', function () {
    const currentInput = $(this);
    const currentValue = parseFloat(currentInput.val());
    const currentRow = currentInput.closest("tr");
    const nextRow = currentRow.next();
    const nextInput = nextRow.find(".point-input");
    if (nextInput.length > 0) {
        const nextValue = parseFloat(nextInput.val().toString());
        if (!isNaN(nextValue) && currentValue >= nextValue) {
            currentInput.addClass('is-invalid');
            ToastError("Points must be less than the next value");
        }
        else {
            currentInput.removeClass("is-invalid");
        }
    }
});
$('#message-save-button').on('click', function (e) {
    if ($('#message-title').val() == '' || $('#message-body').val() == '') {
        ToastError("Please fill out a title and a body");
        return;
    }
    const modal = $("#message-modal-edit-form");
    const message_id = $(modal).data('id');
    if (message_id == 'new') {
        var NewMessage = {};
        NewMessage.channel_id = $('#message-channel').find(':selected').val().toString();
        NewMessage.channel_name = $('#message-channel').find(':selected').text();
        NewMessage.message = $("#message-body").val().toString();
        NewMessage.pin = $("#message-pin").prop('checked');
        NewMessage.title = $("#message-title").val().toString();
        $('body').addClass("busy");
        newMessage(NewMessage)
            .then(() => buildMessageTab());
    }
    else {
        var UpdateMessage = {
            "message_id": message_id,
            "channel_id": $('#message-channel').find(':selected').val().toString(),
            "channel_name": $('#message-channel').find(':selected').text(),
            "content": $("#message-body").val().toString(),
            "pin": $("#message-pin").prop('checked'),
            "title": $("#message-title").val().toString()
        };
        $('body').addClass("busy");
        updateMessage(UpdateMessage)
            .then(() => buildMessageTab());
    }
    modal.modal("hide");
});
$('#guild-settings-button').on('click', async function () {
    $('body').addClass("busy");
    const guild = await getGuild();
    const roles = await getRoles();
    const channels = await getChannels();
    roles.sort((a, b) => a.name.localeCompare(b.name));
    channels.sort((a, b) => a.name.localeCompare(b.name));
    $('body').removeClass("busy");
    const roleSelectors = [
        { selector: '#guild-entry-role', value: [guild.entry_role] },
        { selector: '#guild-member-role', value: [guild.member_role] },
        { selector: '#guild-admin-role', value: [guild.admin_role] },
        { selector: '#guild-staff-role', value: [guild.staff_role] },
        { selector: '#guild-bot-role', value: [guild.bot_role] },
        { selector: '#guild-quest-role', value: [guild.quest_role] },
        { selector: '#tier-2-role', value: [guild.tier_2_role] },
        { selector: '#tier-3-role', value: [guild.tier_3_role] },
        { selector: '#tier-4-role', value: [guild.tier_4_role] },
        { selector: '#tier-5-role', value: [guild.tier_5_role] },
        { selector: '#tier-6-role', value: [guild.tier_6_role] }
    ];
    const channelSelectors = [
        { selector: '#guild-application-channel', value: [guild.application_channel] },
        { selector: '#guild-market-channel', value: [guild.market_channel] },
        { selector: '#guild-announcement-channel', value: [guild.announcement_channel] },
        { selector: '#guild-staff-channel', value: [guild.staff_channel] },
        { selector: '#guild-help-channel', value: [guild.help_channel] },
        { selector: '#guild-arena-board-channel', value: [guild.arena_board_channel] },
        { selector: '#guild-exit-channel', value: [guild.exit_channel] },
        { selector: '#guild-entrance-channel', value: [guild.entrance_channel] },
        { selector: '#guild-activity-points-channel', value: [guild.activity_points_channel] },
        { selector: '#guild-rp-post-channel', value: [guild.rp_post_channel] },
        { selector: '#guild-dev-channels', value: guild.dev_channels }
    ];
    $('#guild-max-level').val(guild.max_level.toString());
    $('#guild-handicap-cc').val(guild.handicap_cc.toString());
    $('#guild-max-characters').val(guild.max_characters.toString());
    $('#guild-div-cc').val(guild.div_limit.toString());
    $('#guild-reward-threshold').val(guild.reward_threshold ? guild.reward_threshold.toString() : "");
    roleSelectors.forEach(selector => {
        populateSelectOption(selector.selector, roles, selector.value, "Select a role");
    });
    channelSelectors.forEach(selector => {
        populateSelectOption(selector.selector, channels, selector.value, "Select a channel");
    });
});
$('#financial-settings-button').on('click', async function () {
    $('body').addClass("busy");
    const fin = await getFinancial();
    const store = await getStores();
    $("body").removeClass("busy");
    $('#monthly-goal').val(`${fin.monthly_goal.toFixed(2)}`);
    $('#monthly-total').val(`${fin.monthly_total.toFixed(2)}`);
    $('#reserve').val(`${fin.reserve.toFixed(2)}`);
    initSKUTable(store);
});
$('#financial-submit-button').on('click', function () {
    getFinancial()
        .then(fin => {
        fin.monthly_goal = Number($('#monthly-goal').val()) ?? 0;
        fin.monthly_total = Number($('#monthly-total').val()) ?? 0;
        fin.reserve = Number($('#reserve').val()) ?? 0;
        updateFinancial(fin);
    });
});
$('#sku-submit-button').on('click', function () {
    getStores()
        .then(stores => {
        stores.forEach(sku => {
            sku.user_cost = parseFloat($(`.sku-cost-input[data-id="${sku.sku}"]`).val().toString());
        });
        updateStores(stores);
    });
});
$('#guild-settings-save-button').on('click', function () {
    getGuild()
        .then(guild => {
        if (!$('#guild-max-level').val())
            ToastError("Please enter in a max level");
        guild.max_level = Number($('#guild-max-level').val());
        guild.max_characters = $("#guild-max-characters").val() ? Number($("#guild-max-characters").val()) : 1;
        guild.handicap_cc = $("#guild-handicap-cc").val() ? Number($("#guild-handicap-cc").val()) : 0;
        guild.div_limit = $("#guild-div-cc").val() ? Number($("#guild-div-cc").val()) : 0;
        guild.reward_threshold = $("#guild-reward-threshold").val() ? Number($("#guild-reward-threshold").val()) : 0;
        guild.entry_role = $('#guild-entry-role').find(':selected').val().toString();
        guild.member_role = $('#guild-member-role').find(':selected').val().toString();
        guild.admin_role = $('#guild-admin-role').find(':selected').val().toString();
        guild.staff_role = $('#guild-staff-role').find(':selected').val().toString();
        guild.bot_role = $('#guild-bot-role').find(':selected').val().toString();
        guild.quest_role = $('#guild-quest-role').find(':selected').val().toString();
        guild.tier_2_role = $('#tier-2-role').find(':selected').val().toString();
        guild.tier_3_role = $('#tier-3-role').find(':selected').val().toString();
        guild.tier_4_role = $('#tier-4-role').find(':selected').val().toString();
        guild.tier_5_role = $('#tier-5-role').find(':selected').val().toString();
        guild.tier_6_role = $('#tier-6-role').find(':selected').val().toString();
        guild.application_channel = $('#guild-application-channel').find(':selected').val().toString();
        guild.market_channel = $('#guild-market-channel').find(':selected').val().toString();
        guild.announcement_channel = $('#guild-announcement-channel').find(':selected').val().toString();
        guild.staff_channel = $('#guild-staff-channel').find(':selected').val().toString();
        guild.help_channel = $('#guild-help-channel').find(':selected').val().toString();
        guild.arena_board_channel = $('#guild-arena-board-channel').find(':selected').val().toString();
        guild.exit_channel = $('#guild-exit-channel').find(':selected').val().toString();
        guild.entrance_channel = $('#guild-entrance-channel').find(':selected').val().toString();
        guild.activity_points_channel = $('#guild-activity-points-channel').find(':selected').val().toString();
        guild.rp_post_channel = $('#guild-rp-post-channel').find(':selected').val().toString();
        guild.dev_channels = $('#guild-dev-channels').find(':selected').toArray().map(e => $(e).val().toString());
        updateGuild(guild);
    });
});
$('#activity-submit-button').on('click', function () {
    getActivities()
        .then(activities => {
        activities.forEach(activity => {
            activity.cc = parseInt($(`.cc-input[data-id="${activity.id}"]`).val().toString());
            activity.diversion = $(`.diversion-input[data-id="${activity.id}"]`).is(':checked');
            activity.points = parseInt($(`.points-input[data-id="${activity.id}"]`).val().toString());
        });
        updateActivities(activities);
    });
});
$("#conversion-submit-button").on('click', function () {
    getCodeconversions()
        .then(conversions => {
        conversions.forEach(conversion => {
            conversion.value = parseInt($(`.credit-input[data-id="${conversion.id}"]`).val().toString());
        });
        udpateCodeConversion(conversions);
    });
});
$("#level-cost-submit-button").on('click', function () {
    getLevelCosts()
        .then(costs => {
        costs.forEach(cost => {
            cost.cc = parseInt($(`.level-cost-input[data-id="${cost.id}"]`).val().toString());
        });
        console.log(costs);
        updateLevelCosts(costs);
    });
});
$("#activity-points-submit-button").on('click', function () {
    if ($(".point-input.is-invalid").length > 0) {
        return ToastError("Please resolve erorrs before submitting");
    }
    getActivityPoints()
        .then(activities => {
        activities.forEach(activity => {
            activity.points = parseInt($(`.point-input[data-id="${activity.id}"`).val().toString());
        });
        updateActivityPoints(activities);
    });
});
async function buildAnnouncementTable() {
    const guild = await getGuild();
    $("body").removeClass("busy");
    $("#announcement-table-body").html('');
    $("#announcement-ping").prop("checked", guild.ping_announcement);
    initAnnouncementTable(guild.weekly_announcement);
}
async function buildActivityTable() {
    const activities = await getActivities();
    const activityPoints = await getActivityPoints();
    $("body").removeClass("busy");
    initActivityTable(activities);
    initActivityPointsTable(activityPoints);
}
async function buildCensusTable() {
    const players = await getPlayers();
    const characters = players.flatMap(player => player.characters.map(character => ({
        ...character,
        player_name: playerName(player.member)
    })));
    $("body").removeClass("busy");
    initPlayerTable(players);
    initCharacterTable(characters);
}
async function buildLogTable() {
    initLogTable();
    $("body").removeClass("busy");
}
async function buildMessageTab() {
    const messages = await getMessages();
    $("body").removeClass("busy");
    initMessageTable(messages);
}
async function buildPricingTab() {
    const conversions = await getCodeconversions();
    const costs = await getLevelCosts();
    $("body").removeClass("busy");
    initConversionTable(conversions);
    initLevelCostTable(costs);
}
$("#npc-start-date, #npc-end-date").on("change", function () {
    $("#global-npc-table").DataTable().draw();
});
$("#say-start-date, #say-end-date").on("change", function () {
    $("#say-table").DataTable().draw();
});
// Filter Functions
$.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    if (settings.nTable.id == 'global-npc-table') {
        const playerData = $("#player-table").DataTable().row(0).data();
        const npcTable = $("#global-npc-table").DataTable();
        const startDate = $("#npc-start-date").val();
        const endDate = $("#npc-end-date").val();
        var rowData = npcTable.row(dataIndex).data();
        if (!rowData)
            return true;
        const key = rowData.command;
        const npcStats = playerData.statistics.npc[key];
        if (!npcStats)
            return true;
        rowData = filterStats(npcStats, rowData, startDate, endDate);
        npcTable.row(dataIndex).data(rowData);
        return rowData.count > 0;
    }
    else if (settings.nTable.id == 'say-table') {
        const playerData = $("#player-table").DataTable().row(0).data();
        const sayTable = $("#say-table").DataTable();
        const startDate = $("#say-start-date").val();
        const endDate = $("#say-end-date").val();
        var rowData = sayTable.row(dataIndex).data();
        if (!rowData)
            return true;
        const key = rowData.command;
        const npcStats = playerData.statistics.say[key];
        if (!npcStats)
            return true;
        rowData = filterStats(npcStats, rowData, startDate, endDate);
        sayTable.row(dataIndex).data(rowData);
        return rowData.count > 0;
    }
    return true;
});
