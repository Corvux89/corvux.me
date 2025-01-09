import { ToastError, ToastSuccess } from "../General/main.js";
const guild_url = `api/guild`;
const message_url = `api/message`;
const channel_url = `api/channels`;
const role_url = `api/roles`;
const log_url = `api/logs`;
const activity_url = `api/activities`;
const activity_point_url = `api/activity_points`;
const player_url = `api/players`;
const code_conversion_url = `api/code_conversion`;
const level_cost_url = `api/level_costs`;
const financial_url = `api/financial`;
const store_url = `api/store`;
const enetitlement_url = `api/entitlements`;
export function getGuild() {
    return fetch(guild_url)
        .then(res => {
        if (res.ok) {
            return res.json();
        }
        else {
            return res.json().then(err => ToastError(err.error));
        }
    })
        .then(res => {
        return res;
    });
}
export function updateGuild(guild) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('PATCH', guild_url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                ToastSuccess("Updated!");
                resolve(this.response.responseText);
            }
            else {
                ToastError(this.response);
                resolve(null);
            }
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify(guild));
    });
}
export function getMessages(guild_id, message_id) {
    if (message_id && guild_id) {
        return fetch(`${message_url}/${guild_id}/${message_id}`)
            .then(res => {
            if (res.ok) {
                return res.json();
            }
            else {
                return res.json().then(err => ToastError(err.error));
            }
        })
            .then(res => {
            return res;
        });
    }
    else {
        return fetch(message_url)
            .then(res => {
            if (res.ok) {
                return res.json();
            }
            else {
                return res.json().then(err => ToastError(err.error));
            }
        })
            .then(res => {
            return res;
        });
    }
}
export function newMessage(message) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('POST', message_url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                resolve(JSON.parse(this.responseText));
            }
            else {
                ToastError(this.response);
                resolve(null);
            }
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify(message));
    });
}
export function updateMessage(message) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('PATCH', message_url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                ToastSuccess("Message has been successfully updated!");
                resolve(this.response.responseText);
            }
            else {
                ToastError(this.response);
                resolve(null);
            }
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify(message));
    });
}
export function deleteMessage(mesage_id) {
    new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('DELETE', message_url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                ToastSuccess(`Message successfully deleted!`);
                resolve(this.response.responseText);
            }
            else {
                ToastError(this.response);
                resolve(null);
            }
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify({ "message_id": mesage_id }));
    });
}
export function getChannels() {
    return fetch(channel_url)
        .then(res => {
        if (res.ok) {
            return res.json();
        }
        else {
            return res.json().then(err => ToastError(err.error));
        }
    })
        .then(res => {
        return res;
    });
}
export function getRoles() {
    return fetch(role_url)
        .then(res => {
        if (res.ok) {
            return res.json();
        }
        else {
            return res.json().then(err => ToastError(err.error));
        }
    })
        .then(res => {
        return res;
    });
}
export function getLogs() {
    return fetch(log_url)
        .then(res => {
        if (res.ok) {
            return res.json();
        }
        else {
            return res.json().then(err => ToastError(err.error));
        }
    })
        .then(res => {
        res.forEach(log => {
            log.created_ts = new Date(log.created_ts).toLocaleString();
        });
        return res;
    });
}
export function getActivities() {
    return fetch(activity_url)
        .then(res => {
        if (res.ok) {
            return res.json();
        }
        else {
            return res.json().then(err => ToastError(err.error));
        }
    })
        .then(res => {
        return res;
    });
}
export function updateActivities(activities) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('PATCH', activity_url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                ToastSuccess("Successfully updated! Ensure the compendium has reloaded for the updates to take effect.");
                resolve(this.response.responseText);
            }
            else {
                ToastError(this.response);
                resolve(null);
            }
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify(activities));
    });
}
export function getPlayers() {
    return fetch(player_url)
        .then(res => {
        if (res.ok) {
            return res.json();
        }
        else {
            return res.json().then(err => ToastError(err.error));
        }
    })
        .then(res => {
        return res;
    });
}
export function getActivityPoints() {
    return fetch(activity_point_url)
        .then(res => {
        if (res.ok) {
            return res.json();
        }
        else {
            return res.json().then(err => ToastError(err.error));
        }
    })
        .then(res => {
        return res;
    });
}
export function updateActivityPoints(activities) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('PATCH', activity_point_url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                ToastSuccess("Successfully updated! Ensure the compendium has reloaded for the updates to take effect.");
                resolve(this.response.responseText);
            }
            else {
                ToastError(this.response);
                resolve(null);
            }
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify(activities));
    });
}
export function getCodeconversions() {
    return fetch(code_conversion_url)
        .then(res => {
        if (res.ok) {
            return res.json();
        }
        else {
            return res.json().then(err => ToastError(err.error));
        }
    })
        .then(res => {
        return res;
    });
}
export function udpateCodeConversion(conversions) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('PATCH', code_conversion_url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                ToastSuccess("Successfully updated! Ensure the compendium has reloaded for the updates to take effect.");
                resolve(this.response.responseText);
            }
            else {
                ToastError(this.response);
                resolve(null);
            }
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify(conversions));
    });
}
export function getLevelCosts() {
    return fetch(level_cost_url)
        .then(res => {
        if (res.ok) {
            return res.json();
        }
        else {
            return res.json().then(err => ToastError(err.error));
        }
    })
        .then(res => {
        return res;
    });
}
export function updateLevelCosts(costs) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('PATCH', level_cost_url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                ToastSuccess("Successfully updated! Ensure the compendium has reloaded for the updates to take effect.");
                resolve(this.response.responseText);
            }
            else {
                ToastError(this.response);
                resolve(null);
            }
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify(costs));
    });
}
export function getFinancial() {
    return fetch(financial_url)
        .then(res => {
        if (res.ok) {
            return res.json();
        }
        else {
            return res.json().then(err => ToastError(err.error));
        }
    })
        .then(res => {
        return res;
    });
}
export function updateFinancial(fin) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('PATCH', financial_url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                ToastSuccess("Successfully updated!");
                resolve(this.response.responseText);
            }
            else {
                ToastError(this.response);
                resolve(null);
            }
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify(fin));
    });
}
export function getStores() {
    return fetch(store_url)
        .then(res => {
        if (res.ok) {
            return res.json();
        }
        else {
            return res.json().then(err => ToastError(err.error));
        }
    })
        .then(res => {
        return res;
    });
}
export function updateStores(store) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('PATCH', store_url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status == 200) {
                ToastSuccess("Successfully updated!");
                resolve(this.response.responseText);
            }
            else {
                ToastError(this.response);
                resolve(null);
            }
        };
        request.onerror = function () {
            reject(new Error("Something went wrong"));
        };
        request.send(JSON.stringify(store));
    });
}
export function getEntitlements() {
    return fetch(enetitlement_url)
        .then(res => {
        if (res.ok) {
            return res.json();
        }
        else {
            return res.json().then(err => ToastError(err.error));
        }
    })
        .then(res => {
        return res;
    });
}
