import { ToastError } from '../General/main.js'
import { Activity, ActivityPoint, Character, G0T0Guild, Log, NewMessage, Player, playerName, RefMessage } from './types.js'
import { buildSaySummaryData, filterStats, initActivityPointsTable, initActivityTable, initAnnouncementTable, initCharacterTable, initConversionTable, initEntitlementTable, initGlobalNPCTable, initLevelCostTable, initLogTable, initMessageTable, initPlayerCharacterTable, initPlayerTable, initSaySummaryTable, initSayTable, initSKUTable, initStatsTable, populateSelectOption } from './utils.js'
$('body').addClass("busy")
const guild = await bot.get_guild(userSession.guild.id)
buildAnnouncementTable(guild)

// Announcements
$("#announcement-tab-button").on('click', async function() {
    $('body').addClass("busy")
    const guild = await bot.get_guild(userSession.guild.id)
    buildAnnouncementTable(guild)
})

async function buildAnnouncementTable(guild: G0T0Guild){
    $("body").removeClass("busy")
    $("#announcement-table-body").html('')
    $("#announcement-ping").prop("checked", guild.ping_announcement)

    initAnnouncementTable(guild.weekly_announcement)
}

$("#announcement-ping").on("change", async function (){
    await bot.get_guild(userSession.guild.id)
    .then(guild => {
        guild.ping_announcement = $(this).prop("checked")
        bot.update_guild(guild)
    })
})

$("#announcement-new-button").on('click', function(){
    $("#announcement-modal-edit-form").data('id', "new")
    $(".modal-body #announcement-title").val("")
    $(".modal-body #announcement-body").val("")
})

$(document).on('click', '#announcement-submit-button', function(){
    const title = $("#announcement-title").val()
    const body = $("#announcement-body").val() != undefined ? $("#announcement-body").val() : ""
    const index = $("#announcement-modal-edit-form").data("id") 
    const announcement = title != "" ? `${title}|${body}` : body

    if (announcement != ""){
        bot.get_guild(userSession.guild.id)
        .then(guild => {
            if (index == "new")
                guild.weekly_announcement.push(announcement.toString())
            else 
                guild.weekly_announcement[index] = announcement.toString()

            bot.update_guild(guild)
            .then(function() {
                buildAnnouncementTable(guild)
            })
        })
    }
})

$(document).on("click", "#announcement-table tbody tr", function(){
    const table = $("#announcement-table").DataTable() 
    const row = table.row(this);
    const modal = $("#announcement-modal-edit-form")
    const announcement = row.data()

    if (announcement == undefined){
        return
    }

    const parts = announcement.split("|")
    const title = parts.length > 1 ? parts[0] : ""
    const body = parts.length > 1 ? parts[1] : parts[0]

    $(".modal-body #announcement-title").val(title)
    $(".modal-body #announcement-body").val(body)

    modal.data("id", row.index())
    .modal("show")
})

$(document).on('click', '.announcement-delete', function(e){
    e.stopPropagation()
    bot.get_guild(userSession.guild.id)
    .then(guild => {
        guild.weekly_announcement.splice($(this).data('id'),1)

        bot.update_guild(guild)
        .then(function(){
            buildAnnouncementTable(guild)
        })
    })
})

// Messages/Posts
async function buildMessageTab(){
    const messages = await bot.get_messages(userSession.guild.id) as RefMessage[]
    $("body").removeClass("busy")

    initMessageTable(messages)
}

$("#bot-messages-button").on('click', function(){
    $('body').addClass("busy")
    buildMessageTab()
})

$("#message-new-button").on('click', async function(){
    $('body').addClass("busy")
    const channels = await bot.get_channels(userSession.guild.id)
    channels.sort((a, b) => a.name.localeCompare(b.name))
    $('body').removeClass("busy")
    $(".modal-body #message-title").val("")
    $(".modal-body #message-pin").prop('checked', false)
    $(".modal-body #message-body").val("")
    
    $(".modal-body #message-channel")
        .html('')
        .prop("disabled", false)

    channels.forEach(c => {
        $(".modal-body #message-channel").append(
            `<option value="${c.id}">${c.name}</option>`
        )
    })

    $("#message-modal-edit-form")
        .data('id', "new")
        .modal("show")
})

$('#message-save-button').on('click', function(){
    if ($('#message-title').val() == '' || $('#message-body').val() == ''){
        ToastError("Please fill out a title and a body")
        return
    }
    const modal = $("#message-modal-edit-form")
    const message_id = $(modal).data('id')

    if (message_id == 'new'){
        const NewMessage = {} as NewMessage

        NewMessage.channel_id = $('#message-channel').find(':selected').val().toString()
        NewMessage.channel_name = $('#message-channel').find(':selected').text()
        NewMessage.message = $("#message-body").val().toString()
        NewMessage.pin = $("#message-pin").prop('checked')
        NewMessage.title = $("#message-title").val().toString()
        
        $('body').addClass("busy")
        bot.new_message(userSession.guild.id, NewMessage)
        .then(function(){
            buildMessageTab()
        })
    } else {
        const UpdateMessage = {
            "message_id": message_id,
            "channel_id": $('#message-channel').find(':selected').val().toString(),
            "channel_name": $('#message-channel').find(':selected').text(),
            "content": $("#message-body").val().toString(),
            "pin": $("#message-pin").prop('checked'),
            "title": $("#message-title").val().toString() 
        } as RefMessage

        $('body').addClass("busy")
        bot.update_message(UpdateMessage)
        .then(function(){
            buildMessageTab()
        })
    }

    modal.modal("hide")
})

$(document).on('click', '#message-table tbody tr', async function(){
    const table = $("#message-table").DataTable()
    const row = table.row(this)
    const modal = $("#message-modal-edit-form")
    const msg: RefMessage = row.data()
    const message = await bot.get_messages(userSession.guild.id, msg.message_id) as RefMessage
    
    $("#message-title").val(message.title)
    $("#message-channel").html('')
        .prop("disabled", true)
        .append(`
            <option selected value="${message.channel_id}">${message.channel_name}</option>
            `)
    $("#message-pin").prop("checked", message.pin)
    $("#message-body").val(message.content)

    modal.data("id", message.message_id)
    .modal("show")
})

$(document).on('click', '.message-delete', function(e){
    e.stopPropagation()
    const message_id = $(this).data('id')
    $("#message-delete-button").data("id", message_id)
    $("#message-modal-delete-form").modal("show")
})

$("#message-delete-button").on('click', async function(){
    const message_id = $(this).data('id')
    $('body').addClass("busy")
    bot.delete_message(message_id)
    .then(function(){
        buildMessageTab()
    })
})

// Guild Settings
$('#guild-settings-button').on('click', async function() {
    $('body').addClass("busy")
    const guild = await bot.get_guild(userSession.guild.id)
    const roles = await bot.get_roles(userSession.guild.id)
    const channels = await bot.get_channels(userSession.guild.id)
    roles.sort((a, b) => a.name.localeCompare(b.name))
    channels.sort((a, b) => a.name.localeCompare(b.name))
    $('body').removeClass("busy")

    const roleSelectors = [
        {selector: '#guild-entry-role', value: [guild.entry_role]},
        {selector: '#guild-member-role', value: [guild.member_role]},
        {selector: '#guild-admin-role', value: [guild.admin_role]},
        {selector: '#guild-staff-role', value: [guild.staff_role]},
        {selector: '#guild-bot-role', value: [guild.bot_role]},
        {selector: '#guild-quest-role', value: [guild.quest_role]},
        {selector: '#tier-2-role', value: [guild.tier_2_role]},
        {selector: '#tier-3-role', value: [guild.tier_3_role]},
        {selector: '#tier-4-role', value: [guild.tier_4_role]},
        {selector: '#tier-5-role', value: [guild.tier_5_role]},
        {selector: '#tier-6-role', value: [guild.tier_6_role]}
    ]

    const channelSelectors = [
        {selector: '#guild-application-channel', value: [guild.application_channel]},
        {selector: '#guild-market-channel', value: [guild.market_channel]},
        {selector: '#guild-announcement-channel', value: [guild.announcement_channel]},
        {selector: '#guild-staff-channel', value: [guild.staff_channel]},
        {selector: '#guild-help-channel', value: [guild.help_channel]},
        {selector: '#guild-arena-board-channel', value: [guild.arena_board_channel]},
        {selector: '#guild-exit-channel', value: [guild.exit_channel]},
        {selector: '#guild-entrance-channel', value: [guild.entrance_channel]},
        {selector: '#guild-activity-points-channel', value: [guild.activity_points_channel]},
        {selector: '#guild-rp-post-channel', value: [guild.rp_post_channel]},
        {selector: '#guild-dev-channels', value: guild.dev_channels}
    ]

    $('#guild-max-level').val(guild.max_level.toString()) 
    $('#guild-handicap-cc').val(guild.handicap_cc.toString())
    $('#guild-max-characters').val(guild.max_characters.toString())
    $('#guild-div-cc').val(guild.div_limit.toString())
    $('#guild-reward-threshold').val(guild.reward_threshold ? guild.reward_threshold.toString() : "")

    roleSelectors.forEach(selector => {
        populateSelectOption(selector.selector, roles, selector.value, "Select a role")
    })

    channelSelectors.forEach(selector => {
        populateSelectOption(selector.selector, channels, selector.value, "Select a channel")
    })
    
})


$('#guild-settings-save-button').on('click', function(){
    bot.get_guild(userSession.guild.id)
    .then(guild => {
        if (!$('#guild-max-level').val()) ToastError("Please enter in a max level")
        
        guild.max_level = Number($('#guild-max-level').val())
        guild.max_characters = $("#guild-max-characters").val() ? Number($("#guild-max-characters").val()) : 1
        guild.handicap_cc = $("#guild-handicap-cc").val() ? Number($("#guild-handicap-cc").val()) : 0
        guild.div_limit = $("#guild-div-cc").val() ? Number($("#guild-div-cc").val()) : 0
        guild.reward_threshold = $("#guild-reward-threshold").val() ? Number($("#guild-reward-threshold").val()) : 0
        guild.entry_role = $('#guild-entry-role').find(':selected').val().toString()
        guild.member_role = $('#guild-member-role').find(':selected').val().toString()
        guild.admin_role = $('#guild-admin-role').find(':selected').val().toString()
        guild.staff_role = $('#guild-staff-role').find(':selected').val().toString()
        guild.bot_role = $('#guild-bot-role').find(':selected').val().toString()
        guild.quest_role = $('#guild-quest-role').find(':selected').val().toString()
        guild.tier_2_role = $('#tier-2-role').find(':selected').val().toString()
        guild.tier_3_role = $('#tier-3-role').find(':selected').val().toString()
        guild.tier_4_role = $('#tier-4-role').find(':selected').val().toString()
        guild.tier_5_role = $('#tier-5-role').find(':selected').val().toString()
        guild.tier_6_role = $('#tier-6-role').find(':selected').val().toString()
        guild.application_channel = $('#guild-application-channel').find(':selected').val().toString()
        guild.market_channel = $('#guild-market-channel').find(':selected').val().toString()
        guild.announcement_channel = $('#guild-announcement-channel').find(':selected').val().toString()
        guild.staff_channel = $('#guild-staff-channel').find(':selected').val().toString()
        guild.help_channel = $('#guild-help-channel').find(':selected').val().toString()
        guild.arena_board_channel = $('#guild-arena-board-channel').find(':selected').val().toString()
        guild.exit_channel = $('#guild-exit-channel').find(':selected').val().toString()
        guild.entrance_channel = $('#guild-entrance-channel').find(':selected').val().toString()
        guild.activity_points_channel = $('#guild-activity-points-channel').find(':selected').val().toString()
        guild.rp_post_channel = $('#guild-rp-post-channel').find(':selected').val().toString()
        guild.dev_channels = $('#guild-dev-channels').find(':selected').toArray().map(e => $(e).val().toString())
        bot.update_guild(guild)
    })
})

// Activities Tab
$("#activity-settings-button").on('click', function(){
    $('body').addClass("busy")
    $("#activity-button").tab("show")
    buildActivityTable()
})

async function buildActivityTable(){
    const activities: Activity[] = await bot.get_activities() as Activity[]
    const activityPoints: ActivityPoint[] = await bot.get_activity_points() as ActivityPoint[]
    $("body").removeClass("busy")

    initActivityTable(activities)
    initActivityPointsTable(activityPoints)
}

$('#activity-submit-button').on('click', function(){
    bot.get_activities()
    .then(activities => {
        activities.forEach(activity => {
            const ccInputValue = $(`.cc-input[data-id="${activity.id}"]`).val()
            const pointInputValue = $(`.points-input[data-id="${activity.id}"]`).val();
            const crInputValue = $(`.cr-input[data-id="${activity.id}"]`).val()
            
            activity.cc = ccInputValue ? parseInt(ccInputValue.toString()) : null
            activity.diversion = $(`.diversion-input[data-id="${activity.id}"]`).is(':checked')
            activity.points = pointInputValue ? parseInt(pointInputValue.toString()) : 0
            activity.credit_ratio = crInputValue ? parseFloat(crInputValue.toString()) : null
        })

        bot.update_activities(activities)
    })
})

$("#activity-points-submit-button").on('click', function(){
    if ($(".point-input.is-invalid").length > 0){
        return ToastError("Please resolve erorrs before submitting")
    }

    bot.get_activity_points()
    .then(activities => {
        activities.forEach(activity => {
            activity.points = parseInt($(`.point-input[data-id="${activity.id}"`).val().toString())
        })

        bot.update_activity_points(activities)
    })
})

$(document).on('input', '.point-input', function(){
    const currentInput = $(this)
    const currentValue = parseFloat(currentInput.val())
    const currentRow = currentInput.closest("tr")
    const nextRow = currentRow.next()
    const nextInput = nextRow.find(".point-input")

    if (nextInput.length > 0){
        const nextValue = parseFloat(nextInput.val().toString())

        if (!isNaN(nextValue) && currentValue >= nextValue){
            currentInput.addClass('is-invalid')
            ToastError("Points must be less than the next value")
        } else{
            currentInput.removeClass("is-invalid")
        }
    }
})

// Pricing Tab
$("#price-settings-button").on('click', function(){
    $('body').addClass("busy")
    buildPricingTab()
})

async function buildPricingTab(){
    const conversions = await bot.get_code_conversions()
    const costs = await bot.get_level_costs()
    $("body").removeClass("busy")

    initConversionTable(conversions)

    initLevelCostTable(costs)
}

$("#npc-start-date, #npc-end-date").on("change", function(){
    $("#global-npc-table").DataTable().draw()
})

$("#say-start-date, #say-end-date").on("change", function(){
    $("#say-table").DataTable().draw()
})

$("#say-summary-start-date, #say-summary-end-date").on("change", function(){
    $("#say-summary-table").DataTable().draw()
})

// Filter Functions
$.fn.dataTable.ext.search.push(async function (settings, _, dataIndex){
    if (settings.nTable.id == 'global-npc-table') {
        const playerID = $("#member-id").val()
        const playerData = $("#player-table").DataTable().rows().data().toArray().find((player: Player) => player.id == playerID) as Player
        const npcTable = $("#global-npc-table").DataTable()
        const startDate = $("#npc-start-date").val() as string
        const endDate = $("#npc-end-date").val() as string
        let rowData = npcTable.row(dataIndex).data()
        if (!rowData) return true
        const key = rowData.command

        const npcStats = playerData.statistics.npc[key]

        if (!npcStats) return true

        rowData = filterStats(npcStats, rowData, startDate, endDate)

        npcTable.row(dataIndex).data(rowData)

        return rowData.count > 0

    } else if (settings.nTable.id == 'say-table'){
        const playerID = $("#member-id").val()
        const playerData = $("#player-table").DataTable().rows().data().toArray().find((player: Player) => player.id == playerID) as Player
        const sayTable = $("#say-table").DataTable()
        const startDate = $("#say-start-date").val() as string
        const endDate = $("#say-end-date").val() as string
        let rowData = sayTable.row(dataIndex).data()
        if (!rowData) return true
        const key = rowData.command

        const npcStats = playerData.statistics.say[key]

        if (!npcStats) return true

        rowData = filterStats(npcStats, rowData, startDate, endDate)

        sayTable.row(dataIndex).data(rowData)

        return rowData.count > 0

    } else if (settings.nTable.id == 'say-summary-table'){
        const playerData = $("#player-table").DataTable().rows().data().toArray() as Player[]
        const sayTable = $("#say-summary-table").DataTable()
        const stats = buildSaySummaryData(playerData)

        sayTable.row(0).data(stats)

        return stats.count > 0
    }

    return true
})

$("#conversion-submit-button").on('click', function(){
    bot.get_code_conversions()
    .then(conversions => {
        conversions.forEach(conversion => {
            conversion.value = parseInt($(`.credit-input[data-id="${conversion.id}"]`).val().toString())
        })

        bot.update_code_conversions(conversions)
    })
})


$("#level-cost-submit-button").on('click', function(){
    bot.get_level_costs()
    .then(costs => {
        costs.forEach(cost => {
            cost.cc = parseInt($(`.level-cost-input[data-id="${cost.id}"]`).val().toString())
        })
        bot.update_level_costs(costs)
    })
})

// Census Tab
$("#census-button").on('click', function(){
    $('body').addClass("busy")
    $("#players-tab-button").tab("show")
    buildCensusTable()
})

async function buildCensusTable(){
    const players = await bot.get_player(userSession.guild.id) as Player[]
    const characters: Character[] = players.flatMap(player => player.characters.map(character => ({
        ...character,
        player_name: playerName(player.member)
    })))

    $("body").removeClass("busy")

    initPlayerTable(players)
    initCharacterTable(characters)
    initSaySummaryTable(players)
}

$(document).on('click', '#player-table tbody tr', function(){
    const table = $("#player-table").DataTable()
    const playerData = table.row(this).data() as Player
    console.log(playerData)

    $("#member-id").val(playerData.id)
    $("#member-name").val(`${playerName(playerData.member)}`)

    $("#player-cc").val(playerData.cc)
    $("#player-div-cc").val(playerData.div_cc)
    $("#player-act-points").val(playerData.activity_points)
    $("#player-staff-points").val(playerData.points)

    initPlayerCharacterTable(playerData.characters)

    initStatsTable(Object.entries(playerData.statistics.commands ?? {}).map(([key, value]) => ({
        command: key,
        value: value
    })))

    initSayTable(playerData)

    initGlobalNPCTable(playerData)

    $("#player-modal").modal("show")
    $("#member-overview-button").tab("show")
    $("#command-stats-button").tab("show")
})

$(document).on("click", "#player-character-table tbody tr", function(){
    const table = $("#player-character-table").DataTable() 
    const row = table.row(this);
    const rowData: Character = row.data();
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

// Logs
$("#log-review-button").on('click', function(){
    $('body').addClass("busy")
    buildLogTable()
})

async function buildLogTable(){
    initLogTable(userSession.guild.id)
    
    $("body").removeClass("busy")
}

$(document).on("click", "#log-table tbody tr", function(){
    const table = $("#log-table").DataTable() 
    const row = table.row(this);
    const rowData: Log = row.data();

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

// Financial Tab
$('#financial-settings-button').on('click', async function(){
    $('body').addClass("busy")
    const fin = await bot.get_financials()
    const store = await bot.get_store_items()
    const entitlements = await bot.get_entitlements()
    $("body").removeClass("busy")

    $('#monthly-goal').val(`${fin.monthly_goal.toFixed(2)}`)
    $('#monthly-total').val(`${fin.monthly_total.toFixed(2)}`)
    $('#reserve').val(`${fin.reserve.toFixed(2)}`)

    initSKUTable(store)
    initEntitlementTable(entitlements, store)
})

$('#financial-submit-button').on('click', function(){
    bot.get_financials()
    .then(fin => {
        fin.monthly_goal = Number($('#monthly-goal').val()) || 0
        fin.monthly_total = Number($('#monthly-total').val()) || 0
        fin.reserve = Number($('#reserve').val()) || 0

        bot.update_financials(fin)
    })
})

$('#sku-submit-button').on('click', function(){
    bot.get_store_items()
    .then(stores => {
        stores.forEach(sku => {
            sku.user_cost = parseFloat($(`.sku-cost-input[data-id="${sku.sku}"]`).val().toString())
        })

        bot.update_store_items(stores)
    })
})