import { deleteMessage, getChannels, getGuild, getMessages, newMessage, updateGuild, updateMessage } from './api.js';
buildAnnouncementTable();
buildMessageTab();
document.getElementById("announcement-ping").addEventListener("change", function (event) {
    const target = event.target;
    getGuild()
        .then(guild => {
        guild.ping_announcement = target.checked;
        updateGuild(guild);
    });
});
$(document).on('click', '.open-edit', function (e) {
    const index = $(this).data('id');
    getGuild()
        .then(guild => {
        const announcement = guild.weekly_announcement[index];
        const parts = announcement.split("|");
        const title = parts.length > 1 ? parts[0] : "";
        const body = parts.length > 1 ? parts[1] : parts[0];
        let modal = document.getElementById("announcement-modal-edit-form");
        modal.setAttribute('data-id', `${index}`);
        $(".modal-body #announcement-title").val(title);
        $(".modal-body #announcement-body").val(body);
    });
});
$(document).on('click', '.announcement-delete', function (e) {
    const index = $(this).data('id');
    getGuild()
        .then(guild => {
        guild.weekly_announcement.splice(index, 1);
        updateGuild(guild)
            .then(guild => {
            buildAnnouncementTable();
        });
    });
});
$(document).on('click', '.message-edit', function (e) {
    const target = e.target;
    const message_id = target.id.replace("-edit-button", "");
    const channelDom = document.getElementById(`${message_id}-channel`);
    const titleDom = document.getElementById(`${message_id}-title`);
    const bodyDom = document.getElementById(`${message_id}-body`);
    const pinDom = document.getElementById(`${message_id}-pin`);
    let message = {};
    message.message_id = message_id;
    message.channel_id = channelDom.value;
    message.channel_name = channelDom.innerHTML;
    message.title = titleDom.value;
    message.content = bodyDom.value;
    message.pin = pinDom.checked;
    updateMessage(message)
        .then(() => {
        let toast = document.getElementById("confirm-toast");
        //@ts-ignore
        let toastAlert = new bootstrap.Toast(toast);
        toastAlert.show();
    });
});
$(document).on('click', '.message-delete', function (e) {
    const target = e.target;
    const message_id = target.id.replace("-delete-button", "");
    let button = document.getElementById("message-delete-button");
    button.setAttribute("data-id", message_id);
});
document.getElementById("message-delete-button").addEventListener('click', function (e) {
    const target = e.target;
    const message_id = target.getAttribute("data-id");
    deleteMessage(message_id);
    document.getElementById(`${message_id}-tab`).remove();
    document.getElementById(`edit-${message_id}`).remove();
    let defaultTab = document.getElementById("new-message-tab");
    let defaultPane = document.getElementById(defaultTab.getAttribute("aria-controls"));
    defaultTab.classList.add("active");
    defaultTab.setAttribute("aria-selected", "true");
    defaultPane.classList.add("show", "active");
});
document.getElementById("announcement-new-button").addEventListener('click', function (e) {
    let modal = document.getElementById("announcement-modal-edit-form");
    modal.setAttribute('data-id', "new");
    $(".modal-body #announcement-title").val("");
    $(".modal-body #announcement-body").val("");
});
document.getElementById("announcement-submit-button").addEventListener('click', function (event) {
    const titleDom = document.getElementById("announcement-title");
    const bodyDom = document.getElementById("announcement-body");
    const modal = document.getElementById("announcement-modal-edit-form");
    const index = modal.getAttribute("data-id");
    const title = titleDom.value;
    const body = bodyDom.value != undefined ? bodyDom.value : "";
    const announcement = title != "" ? `${title}|${body}` : body;
    getGuild()
        .then(guild => {
        if (index == "new") {
            guild.weekly_announcement.push(announcement);
        }
        else {
            guild.weekly_announcement[index] = announcement;
        }
        updateGuild(guild)
            .then(guild => {
            buildAnnouncementTable();
        });
    });
});
document.getElementById("new-message-submit-button").addEventListener('click', function (event) {
    const titleDom = document.getElementById("message-title");
    const channelDom = document.getElementById("message-channel");
    const bodyDom = document.getElementById("message-body");
    const pinDom = document.getElementById("message-pin");
    const NewMessage = {};
    if (titleDom.value == "" || bodyDom.value == "") {
        alert("Please fill out a title and body");
    }
    else {
        NewMessage.channel_id = channelDom.value;
        NewMessage.channel_name = channelDom.options[channelDom.selectedIndex].text;
        NewMessage.message = bodyDom.value;
        NewMessage.pin = pinDom.checked;
        NewMessage.title = titleDom.value;
        newMessage(NewMessage)
            .then(message => {
            titleDom.value = "";
            pinDom.checked = false;
            bodyDom.value = "";
            builTabContent(message);
        });
    }
});
function buildAnnouncementTable() {
    getGuild()
        .then(guild => {
        let table = document.getElementById('announcement-table-body');
        let ping = document.getElementById("announcement-ping");
        table.innerHTML = "";
        ping.checked = guild.ping_announcement;
        guild.weekly_announcement.forEach((announcement, index) => {
            let parts = announcement.split("|");
            let title = parts.length > 1 ? parts[0] : "None";
            let link = document.createElement("a");
            let col1 = document.createElement("td");
            link.href = "";
            link.classList.add("btn", "fa-solid", "fa-trash", "text-white", "announcement-delete");
            link.setAttribute("data-id", `${index}`);
            col1.appendChild(link);
            let col2 = document.createElement("td");
            col2.classList.add("open-edit");
            col2.setAttribute("data-bs-toggle", "modal");
            col2.setAttribute("data-bs-target", "#announcement-modal-edit-form");
            col2.setAttribute("data-id", `${index}`);
            col2.innerHTML = title;
            let row = document.createElement("tr");
            row.appendChild(col1);
            row.appendChild(col2);
            table.appendChild(row);
        });
    });
}
function buildMessageTab() {
    getMessages()
        .then(messages => {
        messages.forEach(message => {
            builTabContent(message);
        });
    });
    getChannels()
        .then(channels => {
        let select = document.getElementById("message-channel");
        select.innerHTML = "";
        channels.forEach(channel => {
            let option = document.createElement("option");
            option.value = `${channel.id}`;
            option.innerHTML = channel.name;
            select.appendChild(option);
        });
    });
}
function builTabContent(message) {
    let tabpanel = document.getElementById("messageTab");
    let messageContent = document.getElementById("messageContent");
    let button = document.createElement("button");
    button.classList.add("nav-link", "resolute");
    button.id = `${message.message_id}-tab`;
    button.setAttribute("data-bs-toggle", "tab");
    button.setAttribute("data-bs-target", `#edit-${message.message_id}`);
    button.type = "button";
    button.role = "tab";
    button.setAttribute("aria-controls", `edit-${message.message_id}`);
    button.setAttribute("aria-selected", "false");
    button.innerHTML = message.title;
    tabpanel.appendChild(button);
    let pane = document.createElement("div");
    pane.classList.add("tab-pane", "fade");
    pane.id = `edit-${message.message_id}`;
    pane.role = "tabpanel";
    pane.setAttribute("aria-labelledby", `${message.message_id}-tab`);
    pane.tabIndex = 0;
    pane.innerHTML = `
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
                        <label for="${message.message_id}">Channel</label>
                    </div>
                </div>

                <div class="col-sm">
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" id="${message.message_id}-pin" name="${message.message_id}-pin" ${message.pin == true ? 'checked' : ''}>
                        <label class="form-check-label text-white" for="${message.message_id}-pin">Pin Message?</label> 
                    </div>
                </div>
            </div>

            <div class="row mb-3">
                <div class="form-floating">
                    <textarea id="${message.message_id}-body" class="form-control big-edit-body" required>${message.content}</textarea>
                    <label for="${message.message_id}-body">Message</label>
                </div>
            </div>
            <div class="col-auto">
                <button type="button" id="${message.message_id}-delete-button" class="btn btn-danger float-end m-3 message-delete" data-bs-target="#message-modal-delete-form" data-bs-toggle="modal">Delete</button>
                <button type="button" id="${message.message_id}-edit-button" class="btn btn-primary float-end m-3 message-edit">Update</button>
            </div>
        </div>
    `;
    messageContent.appendChild(pane);
}
