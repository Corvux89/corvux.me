import { deleteMessage, getActivities, getChannels, getGuild, getLogs, getMessages, getPlayers, newMessage, updateActivities, updateGuild, updateMessage } from './api.js'
import { RefMessage, NewMessage, Log, Activity, Player, GenericDict, CharacterClass, DataTableRequest, Character } from './types.js'

$('body').addClass("busy")
buildAnnouncementTable()

$("#announcement-ping").on("change", function (){
    getGuild()
    .then(guild => {
        guild.ping_announcement = $(this).prop("checked")
        updateGuild(guild)
    })
})

$(document).on('click', '.open-edit', function(){
    getGuild()
    .then(guild => {
        var announcement = guild.weekly_announcement[$(this).data('id')]
        var parts = announcement.split("|")
        var title = parts.length > 1 ? parts[0] : ""
        var body = parts.length > 1 ? parts[1] : parts[0]

        $("#announcement-modal-edit-form").data("id", $(this).data('id'))
        $(".modal-body #announcement-title").val(title)
        $(".modal-body #announcement-body").val(body)
    })
})

$(document).on('click', '.announcement-delete', function(){
    getGuild()
    .then(guild => {
        guild.weekly_announcement.splice($(this).data('id'),1)

        updateGuild(guild)
        .then(function(){
            buildAnnouncementTable()
        })
    })
})

$(document).on('click', '.message-edit-button', function(e){
    var message = {} as RefMessage
    message.message_id = $(this).data('id')
    message.channel_id = $(`#${message.message_id}-channel`).find(":selected").val().toString()
    message.channel_name = $(`#${message.message_id}-channel`).find(":selected").text()
    message.title = $(`#${message.message_id}-title`).val().toString()
    message.content = $(`#${message.message_id}-body`).val().toString()
    message.pin = $(`#${message.message_id}-pin`).prop("checked")

    console.log(message)

    updateMessage(message)
    .then(() => {
        $(`#${message.message_id}-tab`).html(message.title)
        ToastSuccess("Message has been successfully updated!")
    })
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

$(document).on("click", "#character-table tbody tr", function(){
    const table = $("#character-table").DataTable() 
    const row = table.row(this);
    const rowData: Character = row.data();

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
                    <strong>Primary Faction:</strong> ${rowData.faction?.value ?? ''}<br>
                    <strong>Credits:</strong> ${rowData.credits ?? '0'}<br>
                </div>
            </td>
        </tr>
    `;

    // Insert the dropdown row after the clicked row
    $(this).after(additionalInfo);
});

$(document).on('click', '#player-table tbody tr', function(){
    const table = $("#player-table").DataTable()
    const data = table.row(this).data() as Player

    var user: GenericDict = data.member ? data.member.user as GenericDict : undefined

    var name = data.member != null ? data.member.nick != null ? data.member.nick : user && user.global_name != null ? user.global_name : user.username : "Player not found"

    $("#member-id").val(data.id)
    $("#member-name").val(`${name}`)

    $("#player-cc").val(data.cc)
    $("#player-div-cc").val(data.div_cc)
    $("#player-act-points").val(data.activity_points)

    if ($.fn.DataTable.isDataTable("#character-table")) {
        $("#character-table").DataTable().destroy();
    }

    $("#character-table").DataTable({
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
                    return data.map(obj => `${obj.archetype?.value ? `${obj.archetype.value} ` : ''}${obj.primary_class.value}`).join('\n')
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
})

$(document).on('click', '.message-delete', function() {
    var message_id = $(this).data('id')
    $("#message-delete-button").data("id", message_id)
})

$("#announcement-tab-button").on('click', function() {
    $('body').addClass("busy")
    buildAnnouncementTable()
})

$("#bot-messages-button").on('click', function(){
    $('body').addClass("busy")
    buildMessageTab()
})

$("#activity-settings-button").on('click', function(){
    $('body').addClass("busy")
    buildActivityTable()
})

$("#players-button").on('click', function(){
    $('body').addClass("busy")
    buildPlayerTable()
})

$("#log-review-button").on('click', function(){
    $('body').addClass("busy")
    buildLogTable()
})

$("#message-delete-button").on('click', function(){
    var message_id = $(this).data('id')
    deleteMessage(message_id)

    $(`#${message_id}-tab`).remove()
    $(`#edit-${message_id}`).remove()

    $("#new-message-tab").tab("show")
    
})

$("#announcement-new-button").on('click', function(){
    $("#announcement-modal-edit-form").data('id', "new")
    $(".modal-body #announcement-title").val("")
    $(".modal-body #announcement-body").val("")

})

$("#announcement-submit-button").on('click', function() {
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

$('#new-message-submit-button').on('click', function(e){
    if ($('#message-title').val() == '' || $('#message-body').val() == ''){
        ToastError("Please fill out a title and a body")
        return
    }

    var NewMessage = {} as NewMessage

    NewMessage.channel_id = $('#message-channel').find(':selected').val().toString()
    NewMessage.channel_name = $('#message-channel').find(':selected').text()
    NewMessage.message = $("#message-body").val().toString()
    NewMessage.pin = $("#message-pin").prop('checked')
    NewMessage.title = $("#message-title").val().toString()

    newMessage(NewMessage)
    .then(message => {
        $("#message-title").val("")
        $("#message-pin").prop('checked', false)
        $("#message-body").val("")
        builTabContent(message)
    })
})


$('#guild-settings-button').on('click', function() {
    getGuild()
    .then(guild =>{
        $('#guild-max-level').val(`${guild.max_level}`)
        $('#guild-handicap-cc').val(`${guild.handicap_cc}`)
        $('#guild-max-characters').val(`${guild.max_characters}`)
        $('#guild-div-cc').val(`${guild.div_limit}`)
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
        console.log(guild)
        updateGuild(guild).then(()=> {
            ToastSuccess("Updated!")
        })
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

        updateActivities(activities).then(() => 
            ToastSuccess("Successfully updated!<br> Use <span class='fst-italic'>/admin reload compendium</span> to load changes into the bot")
        )

    })
})

async function buildAnnouncementTable(){
    const guild = await getGuild()
    $("body").removeClass("busy")
    $("#announcement-table-body").html('')
    $("#announcement-ping").prop("checked", guild.ping_announcement)

    guild.weekly_announcement.forEach((announcement, index) => {
        let parts = announcement.split("|")
        let title = parts.length > 1 ? parts[0] : "None"

        let button = jQuery("<button>")
            .addClass("btn fa-solid fa-trash text-white announcement-delete")
            .data("id", `${index}`)

        let col1 = jQuery("<td>")
            .append(button)


        let col2 = jQuery("<td>")
            .addClass("open-edit")
            .attr("data-bs-toggle", "modal")
            .attr("data-bs-target", "#announcement-modal-edit-form")
            .data("id", `${index}`)
            .html(title)

        let row = jQuery("<tr>")
            .append(col1)
            .append(col2)
        $("#announcement-table-body").append(row)
    })
}

async function buildActivityTable(){
    const activities: Activity[] = await getActivities()
    $("body").removeClass("busy")

    if ($.fn.DataTable.isDataTable("#activity-table")) {
        $("#activity-table").DataTable().destroy();
    }

    $("#activity-table").DataTable({
        orderCellsTop: true,
        pageLength: 50,
        lengthChange: false,
        info: false,
        paging: false,
        data: activities,
        columns: [
            {
                data: "id",
                searchable: false,
                title: "ID"
            },
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
}

async function buildPlayerTable(){
    const players: Player[] = await getPlayers()

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
                title: "ID"
            },
            {
                data: "member",
                title: "Name",
                render: function(data, type, row){
                    return `${data != null 
                        ? data.nick != null 
                            ? data.nick 
                            : data.user.global_name != null 
                                ? data.user.global_name 
                                : data.user.username 
                        : "Player not found"}`
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
}

async function buildLogTable(){
    if ($.fn.DataTable.isDataTable("#log-table")) {
        $("#log-table").DataTable().destroy();
    }
    $("#log-table").DataTable({
        stateSave: true,
        processing: true,
        serverSide: true,
        ajax: {
            url: 'api/logs',
            type: 'POST',
            contentType: 'application/json',
            data: (d: object) => {
                const requestData = d as DataTableRequest;
                return JSON.stringify(requestData);
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
                data: "author_record",
                render: (data) => {
                    return `${data != null
                        ? data.nick ?? data.user.global_name ?? data.user.username
                        : "Player not found"}`;
                }
            },
            {
                data: 'member',
                title: "Player",
                render: (data) => {
                    return `${data != null
                        ? data.nick ?? data.user.global_name ?? data.user.username
                        : "Player not found"}`;
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
                        : `<i class="fa-solid fa-check"></i>`;
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
    const channels = await getChannels()
    $("body").removeClass("busy")
    $("#message-channel").html('')
    $(".message-edit").remove()


    messages.forEach(message => 
        builTabContent(message)
    )

    channels.forEach(channel => {
        $("#message-channel").append(
            `<option value="${channel.id}">${channel.name}</option>`
        )
    });

    $("#new-message-tab").trigger('click')
}

function builTabContent(message: RefMessage): void{
    let button = jQuery("<button>")
        .addClass("nav-link resolute message-edit")
        .attr("id", `${message.message_id}-tab`)
        .attr("type", "button")
        .attr("role", "tab")
        .attr("aria-controls", `edit-${message.message_id}`)
        .attr("aria-selected", "false")
        .attr("data-bs-toggle", "tab")
        .attr("data-bs-target", `#edit-${message.message_id}`)
        .html(message.title)
    
    $("#messageTab").append(button)

    let pane = jQuery("<div>")
        .addClass("tab-pane fade message-edit")
        .attr("id", `edit-${message.message_id}`)
        .attr("role", "tabpanel")
        .attr("aria-labelledby", `${message.message_id}-tab`)
        .attr("tabIndex", 0)
        .html(`
        <div class="container-fluid m-2">
            <div class="row mb-3">
                <text-input label-text="Post Title/Description" custom-id="${message.message_id}-title" value="${message.title}"></text-input>
            </div>
            <div class="row mb-3">
                <div class="col-sm">
                    <div class="form-floating">
                        <select class="form-select" arial-label="Channel Select" id="${message.message_id}-channel" name="${message.message_id}-channel" disabled>
                            <option value="${message.channel_id}" selected>${message.channel_name}</option>
                        </select>
                        <label for="${message.message_id}-channel">Channel</label>
                    </div>
                </div>

                <div class="col-sm">
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="${message.message_id}-pin" name="${message.message_id}-pin" ${message.pin == true ? 'checked':''}>
                        <label class="form-check-label text-white" for="${message.message_id}-pin">Pin Message?</label> 
                    </div>
                </div>
            </div>

            <div class="row mb-3">
                <div class="form-floating">
                    <textarea id="${message.message_id}-body" class="form-control big-edit-body" required maxlength="2000">${message.content}</textarea>
                    <label for="${message.message_id}-body">Message</label>
                </div>
            </div>
            <div class="col-auto">
                <button type="button" id="${message.message_id}-delete-button" data-id="${message.message_id}" class="btn btn-danger float-end m-3 message-delete" data-bs-target="#message-modal-delete-form" data-bs-toggle="modal">Delete</button>
                <button type="button" id="${message.message_id}-edit-button" data-id="${message.message_id}" class="btn btn-primary float-end m-3 message-edit-button">Update</button>
            </div>
        </div>
    `)
   
    $("#messageContent").append(pane)
}

export function ToastError(message: string): void{
    $("#error-toast .toast-body").html(message)
    $("#error-toast").toast("show")
}

export function ToastSuccess(message: string): void{
    $("#confirm-toast .toast-body").html(message)
    $("#confirm-toast").toast("show")
}
