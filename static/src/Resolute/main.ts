import { deleteMessage, getChannels, getGuild, getMessages, newMessage, updateGuild, updateMessage } from './api.js'
import { RefMessage, NewMessage } from './types.js'

buildAnnouncementTable()
buildMessageTab()

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

$(document).on('click', '.message-edit', function(e){
    var message = {} as RefMessage
    message.message_id = $(this).data('id')
    message.channel_id = $(`#${message.message_id}-channel`).find(":selected").val().toString()
    message.channel_name = $(`#${message.message_id}-channel`).find(":selected").text()
    message.title = $(`#${message.message_id}-title`).val().toString()
    message.content = $(`#${message.message_id}-body`).val().toString()
    message.pin = $(`#${message.message_id}-pin`).prop("checked")

    updateMessage(message)
    .then(() => {
        //@ts-ignore
        let toastAlert = new bootstrap.Toast($("#confirm-toast"))
        toastAlert.show()
    })
})

$(document).on('click', '.message-delete', function() {
    var message_id = $(this).data('id')
    $("#message-delete-button").data("id", message_id)
})

$("#message-delete-button").on('click', function(){
    var message_id = $(this).data('id')
    deleteMessage(message_id)

    $(`#${message_id}-tab`).remove()
    $(`#edit-${message_id}`).remove()

    $("#new-message-tab").addClass("active")
    $("#new-message-tab").attr("aria-selected", "true")
    $("#new-message").addClass("show active")
    
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
        return alert("Please fill out a title and a body")
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
    })
})

function buildAnnouncementTable(){
    getGuild()
    .then(guild => {
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
    })
}

function buildMessageTab(){
    getMessages()
    .then(messages => {
        messages.forEach(message => {
            builTabContent(message)
        })
    })

    getChannels()
    .then(channels => {
        $("#message-channel").html('')
        channels.forEach(channel => {
            $("#message-channel").append(`
                <option value="${channel.id}">${channel.name}</option>
                `)
        })
    })
}

function builTabContent(message: RefMessage): void{
    let button = jQuery("<button>")
        .addClass("nav-link resolute")
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
        .addClass("tab-pane fade")
        .attr("id", `edit-${message.message_id}`)
        .attr("role", "tabpanel")
        .attr("aria-labelledby", `${message.message_id}-tab`)
        .attr("tabIndex", 0)
        .html(`
        <div class="container-fluid m-2">
            <div class="row mb-3">
                <div class="form-floating">
                    <input type="text" class="form-control" id="${message.message_id}-title" name="${message.message_id}-title" required value="${message.title}">
                    <label for="${message.message_id}-title">Post Title/Description</label>
                </div>
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
                <button type="button" id="${message.message_id}-edit-button" data-id="${message.message_id}" class="btn btn-primary float-end m-3 message-edit">Update</button>
            </div>
        </div>
    `)
   
    $("#messageContent").append(pane)
}



