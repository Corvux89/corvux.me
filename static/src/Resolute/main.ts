import { ToastError } from '../General/main.js'
import { deleteMessage, getActivities, getActivityPoints, getChannels, getCodeconversions, getFinancial, getGuild, getLevelCosts, getMessages, getPlayers, getRoles, getStores, newMessage, udpateCodeConversion, updateActivities, updateActivityPoints, updateFinancial, updateGuild, updateLevelCosts, updateMessage, updateStores } from './api.js'
import { RefMessage, NewMessage, Log, Activity, Player, DataTableRequest, Character, ActivityPoint, playerName, classString } from './types.js'

$('body').addClass("busy")
buildAnnouncementTable()

$("#announcement-ping").on("change", function (){
    getGuild()
    .then(guild => {
        guild.ping_announcement = $(this).prop("checked")
        updateGuild(guild)
    })
})

$(document).on('click', '.announcement-delete', function(e){
    e.stopPropagation()
    getGuild()
    .then(guild => {
        guild.weekly_announcement.splice($(this).data('id'),1)

        updateGuild(guild)
        .then(function(){
            buildAnnouncementTable()
        })
    })
})

$(document).on('click', '.message-delete', function(e){
    e.stopPropagation()
    const message_id = $(this).data('id')
    $("#message-modal-delete-form").data('id', message_id)
    .modal("show")
})

$(document).on('click', '#message-table tbody tr', function(e){
    const table = $("#message-table").DataTable()
    const row = table.row(this)
    const modal = $("#message-modal-edit-form")
    const message: RefMessage = row.data()
    console.log(message)
    
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

$(document).on('click', '#player-table tbody tr', function(){
    const table = $("#player-table").DataTable()
    const data = table.row(this).data() as Player

    $("#member-id").val(data.id)
    $("#member-name").val(`${playerName(data.member)}`)

    $("#player-cc").val(data.cc)
    $("#player-div-cc").val(data.div_cc)
    $("#player-act-points").val(data.activity_points)

    if ($.fn.DataTable.isDataTable("#player-character-table")) {
        $("#player-character-table").DataTable().destroy();
    }

    $("#player-character-table").DataTable({
        orderCellsTop: true,
        info: false,
        paging: false,
        data: data.characters,
        columns: [
            {
                data: "name",
                title: "Name"
            },
            {
                data: "level",
                title: "Level"
            },
            {
                data: "species",
                title: "Species",
                render: function(data, type, row){
                    return `${data != null ? data.value : "Not found"}`
                }
            },
            {
                data: "classes",
                title: `Class`,
                width: "70%",
                render: function(data, type, row){
                    return classString(data)
                }
            }
        ],
        order: [[0, 'desc']],
        columnDefs: [
            {
                targets: [0, 3],
                createdCell: function(td, cellData, rowData, row, col){ 
                    $(td).css({
                        "white-space": "pre",
                        "word-wrap": "normal"
                    })
                }
            }
        ]
    })

    if ($.fn.DataTable.isDataTable("#stats-table")) {
        $("#stats-table").DataTable().destroy();
    }

    $("#stats-table").DataTable({
        orderCellsTop: true,
        pageLength: 50,
        info: false,
        paging: false,
        data: Object.entries(data.statistics.commands ?? {}).map(([key, value]) => ({
            command: key,
            value: value
        })),
        columns: [
            {
                data: "command",
                title: "Command"
            },
            {
                data: "value",
                title: "# Times Used"
            }
        ],
        order: [[0, 'desc']],
        columnDefs: [
            {
                targets: [0,1],
                createdCell: function(td, cellData, rowData, row, col){ 
                    $(td).css({
                        "white-space": "pre",
                        "word-wrap": "normal"
                    })
                }
            }
        ]
    })

    if ($.fn.DataTable.isDataTable("#global-npc-table")) {
        $("#global-npc-table").DataTable().destroy();
    }

    $("#global-npc-table").DataTable({
        orderCellsTop: true,
        pageLength: 50,
        info: false,
        paging: false,
        data: Object.entries(data.statistics.npc ?? {}).map(([key, value]) => ({
            command: key,
            count: value["count"] ?? 0,
            characters: value["num_characters"],
            lines: value["num_lines"],
            words: value["num_words"]
        })),
        columns: [
            {
                data: "command",
                title: "NPC Key"
            },
            {
                data: "count",
                title: "# Posts"
            },
            {
                title: "Characters",
                data: "characters"
            },
            {
                title: "Lines",
                data: "lines"
            },
            {
                title: "Words",
                data: "words"
            },
            {
                title: "Avg. Words / Post",
                data: "words",
                render: function(data, type, row){
                    return `${row.count == 0 ? 0 : data/row.count}`
                }
            }
        ],
        order: [[0, 'desc']],
        columnDefs: [
            {
                targets: [0,1],
                createdCell: function(td, cellData, rowData, row, col){ 
                    $(td).css({
                        "white-space": "pre",
                        "word-wrap": "normal"
                    })
                }
            }
        ]
    })

    $("#player-modal").modal("show")
    $("#member-overview-button").tab("show")
    $("#command-stats-button").tab("show")
})

$(document).on('click', '.message-delete', function(e) {
    e.stopPropagation()
    var message_id = $(this).data('id')
    $("#message-delete-button").data("id", message_id)
})

$("#announcement-tab-button").on('click', function() {
    $('body').addClass("busy")
    buildAnnouncementTable()
})

$("#price-settings-button").on('click', function(){
    $('body').addClass("busy")
    buildPricingTab()
})

$("#bot-messages-button").on('click', function(){
    $('body').addClass("busy")
    buildMessageTab()
})

$("#activity-settings-button").on('click', function(){
    $('body').addClass("busy")
    $("#activity-button").tab("show")
    buildActivityTable()
})

$("#census-button").on('click', function(){
    $('body').addClass("busy")
    $("#players-tab-button").tab("show")
    buildCensusTable()
})

$("#log-review-button").on('click', function(){
    $('body').addClass("busy")
    buildLogTable()
})

$("#message-delete-button").on('click', function(){
    var message_id = $(this).data('id')
    $('body').addClass("busy")
    deleteMessage(message_id)
    buildMessageTab()
})

$("#announcement-new-button").on('click', function(){
    $("#announcement-modal-edit-form").data('id', "new")
    $(".modal-body #announcement-title").val("")
    $(".modal-body #announcement-body").val("")
})

$("#message-new-button").on('click', async function(){
    $('body').addClass("busy")
    const channels = await getChannels()
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

$(document).on('click', '#announcement-submit-button', function(){
    var title = $("#announcement-title").val()
    var body = $("#announcement-body").val() != undefined ? $("#announcement-body").val() : ""
    var index = $("#announcement-modal-edit-form").data("id") 

    var announcement = title != "" ? `${title}|${body}` : body

    if (announcement != ""){
        getGuild()
        .then(guild => {
            index == "new" ? guild.weekly_announcement.push(announcement.toString()) : guild.weekly_announcement[index] = announcement.toString()

            updateGuild(guild)
            .then(function() {
                buildAnnouncementTable()
            })
        })
    }
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

$('#message-save-button').on('click', function(e){
    if ($('#message-title').val() == '' || $('#message-body').val() == ''){
        ToastError("Please fill out a title and a body")
        return
    }
    const modal = $("#message-modal-edit-form")
    const message_id = $(modal).data('id')

    if (message_id == 'new'){
        var NewMessage = {} as NewMessage

        NewMessage.channel_id = $('#message-channel').find(':selected').val().toString()
        NewMessage.channel_name = $('#message-channel').find(':selected').text()
        NewMessage.message = $("#message-body").val().toString()
        NewMessage.pin = $("#message-pin").prop('checked')
        NewMessage.title = $("#message-title").val().toString()
        
        $('body').addClass("busy")
        newMessage(NewMessage)
        .then(()=> buildMessageTab())
    } else {
        var UpdateMessage = {
            "message_id": message_id,
            "channel_id": $('#message-channel').find(':selected').val().toString(),
            "channel_name": $('#message-channel').find(':selected').text(),
            "content": $("#message-body").val().toString(),
            "pin": $("#message-pin").prop('checked'),
            "title": $("#message-title").val().toString() 
        } as RefMessage

        $('body').addClass("busy")
        updateMessage(UpdateMessage)
        .then(() => buildMessageTab())
    }

    modal.modal("hide")
})


$('#guild-settings-button').on('click', async function() {
    $('body').addClass("busy")
    const guild = await getGuild()
    const roles = await getRoles()
    const channels = await getChannels()
    roles.sort((a, b) => a.name.localeCompare(b.name))
    channels.sort((a, b) => a.name.localeCompare(b.name))
    $('body').removeClass("busy")

    console.log(guild.id)

    $('#guild-max-level').val(guild.max_level.toString()) 
    $('#guild-handicap-cc').val(guild.handicap_cc.toString())
    $('#guild-max-characters').val(guild.max_characters.toString())
    $('#guild-div-cc').val(guild.div_limit.toString())
    $('#guild-reward-threshold').val(guild.reward_threshold ? guild.reward_threshold.toString() : "")

    $('#guild-entry-role').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-member-role').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-admin-role').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-staff-role').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-bot-role').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-quest-role').html('')
        .append(`<option>Select a role</option>`)
    $('#tier-2-role').html('')
        .append(`<option>Select a role</option>`)
    $('#tier-3-role').html('')
        .append(`<option>Select a role</option>`)
    $('#tier-4-role').html('')
        .append(`<option>Select a role</option>`)
    $('#tier-5-role').html('')
        .append(`<option>Select a role</option>`)
    $('#tier-6-role').html('')
        .append(`<option>Select a role</option>`)

    roles.forEach(role => {
        $('#guild-entry-role').append(`
            <option value="${role.id}" ${guild.entry_role == role.id.toString() ? 'selected': ''}>${role.name}</option>
        `)

        $('#guild-member-role').append(`
            <option value="${role.id}" ${guild.member_role == role.id.toString() ? 'selected': ''}>${role.name}</option>
        `)

        $('#guild-admin-role').append(`
            <option value="${role.id}" ${guild.admin_role == role.id.toString() ? 'selected': ''}>${role.name}</option>
        `)

        $('#guild-staff-role').append(`
            <option value="${role.id}" ${guild.staff_role == role.id.toString() ? 'selected': ''}>${role.name}</option>
        `)

        $('#guild-bot-role').append(`
            <option value="${role.id}" ${guild.bot_role == role.id.toString() ? 'selected': ''}>${role.name}</option>
        `)

        $('#guild-quest-role').append(`
            <option value="${role.id}" ${guild.quest_role == role.id.toString() ? 'selected': ''}>${role.name}</option>
        `)

        $('#tier-2-role').append(`
            <option value="${role.id}" ${guild.tier_2_role == role.id.toString() ? 'selected': ''}>${role.name}</option>
        `)

        $('#tier-3-role').append(`
            <option value="${role.id}" ${guild.tier_3_role == role.id.toString() ? 'selected': ''}>${role.name}</option>
        `)

        $('#tier-4-role').append(`
            <option value="${role.id}" ${guild.tier_4_role == role.id.toString() ? 'selected': ''}>${role.name}</option>
        `)

        $('#tier-5-role').append(`
            <option value="${role.id}" ${guild.tier_5_role == role.id.toString() ? 'selected': ''}>${role.name}</option>
        `)

        $('#tier-6-role').append(`
            <option value="${role.id}" ${guild.tier_6_role == role.id.toString() ? 'selected': ''}>${role.name}</option>
        `)
    })

    $('#guild-application-channel').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-market-channel').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-announcement-channel').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-staff-channel').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-help-channel').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-arena-board-channel').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-exit-channel').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-exit-channel').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-entrance-channel').html('')
        .append(`<option>Select a role</option>`)
    $('#guild-activity-points-channel').html('')
        .append(`<option>Select a role</option>`)

    channels.forEach(channel => {
        $('#guild-application-channel').append(`
            <option value="${channel.id}" ${guild.application_channel == channel.id.toString() ? 'selected': ''}>${channel.name}</option>
        `)

        $('#guild-market-channel').append(`
            <option value="${channel.id}" ${guild.market_channel == channel.id.toString() ? 'selected': ''}>${channel.name}</option>
        `)

        $('#guild-announcement-channel').append(`
            <option value="${channel.id}" ${guild.announcement_channel == channel.id.toString() ? 'selected': ''}>${channel.name}</option>
        `)

        $('#guild-staff-channel').append(`
            <option value="${channel.id}" ${guild.staff_channel == channel.id.toString() ? 'selected': ''}>${channel.name}</option>
        `)

        $('#guild-help-channel').append(`
            <option value="${channel.id}" ${guild.help_channel == channel.id.toString() ? 'selected': ''}>${channel.name}</option>
        `)

        $('#guild-arena-board-channel').append(`
            <option value="${channel.id}" ${guild.arena_board_channel == channel.id.toString() ? 'selected': ''}>${channel.name}</option>
        `)

        $('#guild-exit-channel').append(`
            <option value="${channel.id}" ${guild.exit_channel == channel.id.toString() ? 'selected': ''}>${channel.name}</option>
        `)

        $('#guild-entrance-channel').append(`
            <option value="${channel.id}" ${guild.entrance_channel == channel.id.toString() ? 'selected': ''}>${channel.name}</option>
        `)

        $('#guild-activity-points-channel').append(`
            <option value="${channel.id}" ${guild.activity_points_channel == channel.id.toString() ? 'selected': ''}>${channel.name}</option>
        `)
    })
    
})

$('#financial-settings-button').on('click', async function(){
    $('body').addClass("busy")
    const fin = await getFinancial()
    const store = await getStores()
    $("body").removeClass("busy")

    $('#monthly-goal').val(`${fin.monthly_goal.toFixed(2)}`)
    $('#monthly-total').val(`${fin.monthly_total.toFixed(2)}`)
    $('#reserve').val(`${fin.reserve.toFixed(2)}`)

    if ($.fn.DataTable.isDataTable("#sku-table")) {
        $("#sku-table").DataTable().destroy();
    }

    $("#sku-table").DataTable({
        orderCellsTop: true,
        // @ts-ignore
        responsive: true,
        pageLength: 25,
        lengthChange: false,
        info: false,
        paging: false,
        data: store,
        columns: [
            {
                title: "SKU",
                data: "sku",
                width: "5%"
            },
            {
                title: "Cost",
                data: "user_cost",
                render: function(data, type, row){
                    return `<input type="number" class="form-control sku-cost-input" step="0.01" data-id="${row.sku}" value="${data != null ? data : ''}"/>`
                }
            }
        ]
    })
})

$('#financial-submit-button').on('click', function(){
    getFinancial()
    .then(fin => {
        fin.monthly_goal = Number($('#monthly-goal').val()) ?? 0
        fin.monthly_total = Number($('#monthly-total').val()) ?? 0
        fin.reserve = Number($('#reserve').val()) ?? 0

        updateFinancial(fin)
    })
})

$('#sku-submit-button').on('click', function(){
    getStores()
    .then(stores => {
        stores.forEach(sku => {
            sku.user_cost = parseFloat($(`.sku-cost-input[data-id="${sku.sku}"]`).val().toString())
        })

        updateStores(stores)
    })
})

$('#guild-settings-save-button').on('click', function(){
    getGuild()
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
        updateGuild(guild)
    })
})

$('#activity-submit-button').on('click', function(){
    getActivities()
    .then(activities => {
        activities.forEach(activity => {
            activity.cc = parseInt($(`.cc-input[data-id="${activity.id}"]`).val().toString())
            activity.diversion = $(`.diversion-input[data-id="${activity.id}"]`).is(':checked')
            activity.points = parseInt($(`.points-input[data-id="${activity.id}"]`).val().toString())
        })

        updateActivities(activities)

    })
})

$("#conversion-submit-button").on('click', function(){
    getCodeconversions()
    .then(conversions => {
        conversions.forEach(conversion => {
            conversion.value = parseInt($(`.credit-input[data-id="${conversion.id}"]`).val().toString())
        })

        udpateCodeConversion(conversions)
    })
})

$("#level-cost-submit-button").on('click', function(){
    getLevelCosts()
    .then(costs => {
        costs.forEach(cost => {
            cost.cc = parseInt($(`.level-cost-input[data-id="${cost.id}"]`).val().toString())
        })

        updateLevelCosts(costs)
    })
})

$("#activity-points-submit-button").on('click', function(){
    if ($(".point-input.is-invalid").length > 0){
        return ToastError("Please resolve erorrs before submitting")
    }

    getActivityPoints()
    .then(activities => {
        activities.forEach(activity => {
            activity.points = parseInt($(`.point-input[data-id="${activity.id}"`).val().toString())
        })

        updateActivityPoints(activities)
    })
})

async function buildAnnouncementTable(){
    const guild = await getGuild()
    $("body").removeClass("busy")
    $("#announcement-table-body").html('')
    $("#announcement-ping").prop("checked", guild.ping_announcement)

    if ($.fn.DataTable.isDataTable("#announcement-table")) {
        $("#announcement-table").DataTable().destroy();
    }

    $("#announcement-table").DataTable({
        orderCellsTop: true,
        //@ts-ignore
        responsive: true,
        searching: false,
        info: false,
        paging: false,
        ordering: false,
        pageLength: 10,
        language: {
            emptyTable: "No announcements this week!"
        },
        data: guild.weekly_announcement,
        columns: [
            {
                width: "5%",
                render: function(data, type, row){
                    return `
                    <button class="btn fa-solid fa-trash text-white announcement-delete" data-id=${row.id}></button>
                    `
                }
            },
            {
                title: "Title",
                render: function(data, type, row){
                    const parts = row.split("|")
                    const title = parts.length > 1 ? parts[0] : "None"
                    return title
                }
            }
        ]
    })
}

async function buildActivityTable(){
    const activities: Activity[] = await getActivities()
    const activity_points: ActivityPoint[] = await getActivityPoints()
    $("body").removeClass("busy")

    if ($.fn.DataTable.isDataTable("#activity-table")) {
        $("#activity-table").DataTable().destroy();
    }

    $("#activity-table").DataTable({
        orderCellsTop: true,
        pageLength: 50,
        lengthChange: false,
        //@ts-ignore
        responsive: true,
        info: false,
        paging: false,
        data: activities,
        columns: [
            {
                data: "value",
                title: "Name"
            },
            {
                data: "cc",
                title: "CC",
                orderable: false,
                searchable: false,
                width: "20%",
                render: function(data, type, row){
                    return `<input type="number" class="form-control cc-input" data-id="${row.id}" value="${data != null ? data : ''}"/>`
                }
            },
            {
                data: "diversion",
                title: "Diversion",
                orderable: false,
                searchable: false,
                render: function(data, type, row){
                    return `<div class="form-check"><input type="checkbox" class="form-check-input diversion-input" data-id="${row.id}" ${data ? 'checked': ''}/></div>`
                }
            },
            {
                data: "points",
                title: "Points",
                orderable: false,
                searchable: false,
                render: function(data, type, row){
                    return `<input type="number" class="form-control points-input" data-id="${row.id}" value="${data}"/>`
                }
            }
        ]
    })

    if ($.fn.DataTable.isDataTable("#activity-points-table")) {
        $("#activity-points-table").DataTable().destroy();
    }

    $("#activity-points-table").DataTable({
        orderCellsTop: true,
        // @ts-ignore
        responsive: true,
        pageLength: 10,
        lengthChange: false,
        searching: false,
        info: false,
        paging: false,
        data: activity_points,
        columns: [
            {
                data: "id",
                searchable: false,
                title: "Activity Level"
            },
            {
                data: "points",
                title: "Points",
                orderable: false,
                searchable: false,
                render: function(data, type, row){
                    return `<input type="number" class="form-control point-input" data-id="${row.id}" value="${data != null ? data : ''}"/>`
                }
            }
        ]
    })
}

async function buildCensusTable(){
    const players: Player[] = await getPlayers()
    const characters: Character[] = players.flatMap(player => player.characters.map(character => ({
        ...character,
        player_name: playerName(player.member)
    })))

    $("body").removeClass("busy")

    if ($.fn.DataTable.isDataTable("#player-table")) {
        $("#player-table").DataTable().destroy();
    }

    $("#player-table").DataTable({
        orderCellsTop: true,
        pageLength: 50,
        lengthChange: false,
        data: players,
        columns: [
            {
                data: "id",
                title: "ID",
                width: "5%"
            },
            {
                data: "member",
                title: "Name",
                render: function(data, type, row){
                    return `${playerName(data)}`
                }
            },
            {
                data: "characters",
                searchable: false,
                title: "# Characters",
                render: function(data, type, row){
                    return data.length
                }
            }
        ]
    })

    if ($.fn.DataTable.isDataTable("#characters-table")) {
        $("#characters-table").DataTable().destroy();
    }

    $("#characters-table").DataTable({
        orderCellsTop: true,
        pageLength: 50,
        lengthChange: false,
        data: characters,
        columns: [
            {
                title: "Name",
                data: "name"
            },
            {
                title: "Level",
                data: "level"
            },
            {
                title: "Player",
                data: "player_name"
            },
            {
                title: "Species",
                data: "species",
                render: function(data, type, row){
                    return `${data != null ? data.value : "Not found"}`
                }
            },
            {
                data: "classes",
                title: `Class`,
                width: "70%",
                render: function(data, type, row){
                    return classString(data)
                }
            },
            {
                title: "Faction",
                data: "faction",
                render: function(data, type, row){
                    return `${data != null ? data.value : ""}`
                }
            }
        ],
        order: [[0, 'desc']],
        columnDefs: [
            {
                targets: [0, 3],
                createdCell: function(td, cellData, rowData, row, col){ 
                    $(td).css({
                        "white-space": "pre",
                        "word-wrap": "normal"
                    })
                }
            }
        ]
    })
}

async function buildLogTable(){
    if ($.fn.DataTable.isDataTable("#log-table")) {
        $("#log-table").DataTable().destroy()
    }
    $("#log-table").DataTable({
        stateSave: true,
        processing: true,
        serverSide: true,
        language: {
            emptyTable: "No logs to display."
        },
        ajax: {
            url: 'api/logs',
            type: 'POST',
            contentType: 'application/json',
            data: (d: object) => {
                const requestData = d as DataTableRequest
                return JSON.stringify(requestData)
            }
        },
        columns: [
            { 
                title: "ID", 
                data: 'id' 
            },
            { 
                title: "Created", 
                data: 'created_ts',
                render: function(data, type, row){
                    let date = new Date(data)
                    return date.toLocaleString()
                } 
            },
            {
                title: "Author",
                data: "author",
                render: (data) => {
                    return `${playerName(data)}`
                }
            },
            {
                data: 'member',
                title: "Player",
                render: (data) => {
                    return `${playerName(data)}`
                }
            },
            {
                title: "Character",
                data: "character",
                render: (data) => `${data == null ? "" : data.name}`
            },
            { 
                title: "Activity", 
                data: 'activity.value' 
            },
            { 
                title: "Notes", 
                data: 'notes' },
            {
                title: "Valid?",
                data: 'invalid',
                render: (data) => {
                    return data
                        ? `<i class="fa-solid fa-x"></i>`
                        : `<i class="fa-solid fa-check"></i>`
                }
            }
        ],
        order: [[0, 'desc']],
        pageLength: 10
    });
    
    $("body").removeClass("busy")
}

async function buildMessageTab(){
    const messages = await getMessages()
    $("body").removeClass("busy")



    if ($.fn.DataTable.isDataTable("#message-table")) {
        $("#message-table").DataTable().destroy();
    }

    $("#message-table").DataTable({
        data: messages,
        pageLength: 50,
        columns: [
            {
                width: "5%",
                render: function(data, type, row){
                    return `
                    <button class="btn fa-solid fa-trash text-white message-delete" data-id=${row.message_id}></button>
                    `
                }
            },
            {
                title: "Title",
                data: "title"
            },
            {
                title: "Channel",
                data: "channel_name"
            },
            {
                title: "Pinned?",
                data: "pin",
                render: (data) => {
                    return data
                        ? `<i class="fa-solid fa-check"></i>`
                        : ``
                }
            }
        ]
    })
}

async function buildPricingTab(){
    const conversions = await getCodeconversions()
    const costs = await getLevelCosts()
    $("body").removeClass("busy")

    if ($.fn.DataTable.isDataTable("#conversion-table")) {
        $("#conversion-table").DataTable().destroy();
    }

    $("#conversion-table").DataTable({
        orderCellsTop: true,
        // @ts-ignore
        responsive: true,
        pageLength: 10,
        lengthChange: false,
        searching: false,
        info: false,
        paging: false,
        data: conversions,
        columns: [
            {
                data: "id",
                searchable: false,
                title: "Level"
            },
            {
                data: "value",
                title: "# Credits / Chain Code",
                orderable: false,
                searchable: false,
                render: function(data, type, row){
                    return `<input type="number" class="form-control credit-input" data-id="${row.id}" value="${data != null ? data : ''}"/>`
                }
            }
        ]
    }) 

    if ($.fn.DataTable.isDataTable("#level-cost-table")) {
        $("#level-cost-table").DataTable().destroy();
    }

    $("#level-cost-table").DataTable({
        orderCellsTop: true,
        // @ts-ignore
        responsive: true,
        pageLength: 10,
        lengthChange: false,
        searching: false,
        info: false,
        paging: false,
        data: costs,
        columns: [
            {
                data: "id",
                searchable: false,
                title: "Level"
            },
            {
                data: "cc",
                title: "Chain Codes",
                orderable: false,
                searchable: false,
                render: function(data, type, row){
                    return `<input type="number" class="form-control level-cost-input" data-id="${row.id}" value="${data != null ? data : ''}"/>`
                }
            }
        ]
    })
}


