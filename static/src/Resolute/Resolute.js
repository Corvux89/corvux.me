document.getElementById("announcement-ping").addEventListener("change", function (event) {
    const target = event.target;
    getGuild()
        .then(guild => {
        guild.ping_announcement = target.checked;
        upsertGuild(guild);
    });
});
$(document).on('click', '.open-edit', function (e) {
    const index = $(this).data('id') - 1;
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
    const index = $(this).data('id') - 1;
    getGuild()
        .then(guild => {
        guild.weekly_announcement.splice(index, 1);
        upsertGuild(guild)
            .then(guild => {
            window.location.reload();
        });
    });
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
    const body = bodyDom.value;
    const announcement = title != "" ? `${title}|${body}` : body;
    getGuild()
        .then(guild => {
        if (index == "new") {
            guild.weekly_announcement.push(announcement);
        }
        else {
            guild.weekly_announcement[index] = announcement;
        }
        upsertGuild(guild)
            .then(guild => {
            window.location.reload();
        });
    });
});
function getGuild() {
    const url = `${window.location.href}guild`;
    return fetch(url)
        .then(res => res.json())
        .then(res => {
        return res;
    });
}
function upsertGuild(guild) {
    return new Promise((resolve, reject) => {
        const url = `${window.location.href}guild`;
        const request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                resolve(this.response.responseText);
            }
            else {
                resolve(null);
            }
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify(guild));
    });
}
export {};
