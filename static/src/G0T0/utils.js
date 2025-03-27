import { classString, playerName } from "./types.js";
function destroyTable(table) {
    if ($.fn.DataTable.isDataTable(table)) {
        $(table).DataTable().destroy();
    }
}
export function populateSelectOption(selector, options, selectedValues, defaultOption) {
    const select = $(selector)
        .html("")
        .append(`<option value="">${defaultOption}</option>`);
    options.forEach(option => {
        select.append(`<option value="${option.id}" ${selectedValues.indexOf(option.id) > -1 ? 'selected' : ''}>${option.name}</option>`);
    });
}
export function filterStats(sourceData, rowData, startDate, endDate) {
    const rowDates = Object.keys(sourceData).map(dateStr => {
        return new Date(dateStr.replace('-', '/'));
    });
    const minDate = startDate ? new Date(startDate.replace('-', '/')) : new Date(Math.min(...rowDates.map(date => date.getTime())));
    const maxDate = endDate ? new Date(endDate.replace('-', '/')) : new Date(Math.max(...rowDates.map(date => date.getTime())));
    let newData = {};
    newData.count = 0;
    newData.num_characters = 0;
    newData.num_lines = 0;
    newData.num_words = 0;
    rowDates.forEach(date => {
        if (date >= minDate && date <= maxDate) {
            const dateStr = date.toISOString().split('T')[0];
            const stats = sourceData[dateStr];
            newData.count += stats.count;
            newData.num_characters += stats.num_characters;
            newData.num_lines += stats.num_lines;
            newData.num_words += stats.num_words;
        }
    });
    rowData.count = newData.count;
    rowData.characters = newData.num_characters;
    rowData.lines = newData.num_lines;
    rowData.words = newData.num_words;
    return rowData;
}
export function initPlayerTable(players) {
    const tableName = "#player-table";
    destroyTable(tableName);
    $(tableName).DataTable({
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
                render: function (data, type, row) {
                    return `${playerName(data)}`;
                }
            },
            {
                data: "characters",
                searchable: false,
                title: "# Characters",
                render: function (data, type, row) {
                    return data.length;
                }
            }
        ]
    });
}
export function initCharacterTable(characters) {
    const tableName = "#characters-table";
    destroyTable(tableName);
    $(tableName).DataTable({
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
                render: function (data, type, row) {
                    return `${data != null ? data.value : "Not found"}`;
                }
            },
            {
                data: "classes",
                title: `Class`,
                width: "70%",
                render: function (data, type, row) {
                    return classString(data);
                }
            },
            {
                title: "Faction",
                data: "faction",
                render: function (data, type, row) {
                    return `${data != null ? data.value : ""}`;
                }
            }
        ],
        order: [[0, 'desc']],
        columnDefs: [
            {
                targets: [0, 3],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css({
                        "white-space": "pre",
                        "word-wrap": "normal"
                    });
                }
            }
        ]
    });
}
export function initPlayerCharacterTable(characters) {
    const tableName = "#player-character-table";
    destroyTable(tableName);
    $(tableName).DataTable({
        orderCellsTop: true,
        info: false,
        paging: false,
        data: characters,
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
                render: function (data, type, row) {
                    return `${data != null ? data?.value : "Not found"}`;
                }
            },
            {
                data: "classes",
                title: `Class`,
                width: "70%",
                render: function (data, type, row) {
                    return classString(data);
                }
            }
        ],
        order: [[0, 'desc']],
        columnDefs: [
            {
                targets: [0, 3],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css({
                        "white-space": "pre",
                        "word-wrap": "normal"
                    });
                }
            }
        ]
    });
}
export function initStatsTable(commands) {
    const tableName = "#stats-table";
    destroyTable(tableName);
    $(tableName).DataTable({
        orderCellsTop: true,
        pageLength: 50,
        info: false,
        paging: false,
        data: commands,
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
                targets: [0, 1],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css({
                        "white-space": "pre",
                        "word-wrap": "normal"
                    });
                }
            }
        ]
    });
}
export function initSayTable(player) {
    const tableName = "#say-table";
    destroyTable(tableName);
    $("#say-start-date").val("");
    $("#say-end-date").val("");
    const stats = Object.entries(player.statistics.say ?? {}).map(([key, stats]) => {
        const summary = Object.values(stats).reduce((totals, dailyStats) => {
            totals.count += dailyStats.count ?? 0;
            totals.num_lines += dailyStats.num_lines ?? 0;
            totals.num_words += dailyStats.num_words ?? 0;
            totals.num_characters += dailyStats.num_characters ?? 0;
            return totals;
        }, { count: 0, num_lines: 0, num_words: 0, num_characters: 0 });
        return {
            command: key,
            count: summary.count,
            characters: summary.num_characters,
            lines: summary.num_lines,
            words: summary.num_words
        };
    })
        .filter(stat => player.characters.find(c => c.id == parseInt(stat.command))?.name);
    $("#say-table").DataTable({
        orderCellsTop: true,
        pageLength: 25,
        info: false,
        paging: false,
        data: stats,
        columns: [
            {
                title: "Character",
                data: "command",
                render: function (data, type, row) {
                    return player.characters.find(c => c.id == parseInt(data))?.name ?? "Character not found/Inactive Character";
                }
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
                render: function (data, type, row) {
                    return `${row.count == 0 ? 0 : (data / row.count).toFixed(2)}`;
                }
            }
        ],
        order: [[0, 'desc']],
        columnDefs: [
            {
                targets: [0, 1],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css({
                        "white-space": "pre",
                        "word-wrap": "normal"
                    });
                }
            }
        ]
    });
}
export function initGlobalNPCTable(player) {
    const tableName = "#global-npc-table";
    destroyTable(tableName);
    $("#global-npc-start-date").val("");
    $("#global-npc-end-date").val("");
    const stats = Object.entries(player.statistics.npc ?? {}).map(([key, stats]) => {
        const summary = Object.values(stats).reduce((totals, dailyStats) => {
            totals.count += dailyStats.count ?? 0;
            totals.num_lines += dailyStats.num_lines ?? 0;
            totals.num_words += dailyStats.num_words ?? 0;
            totals.num_characters += dailyStats.num_characters ?? 0;
            return totals;
        }, { count: 0, num_lines: 0, num_words: 0, num_characters: 0 });
        return {
            command: key,
            count: summary.count,
            characters: summary.num_characters,
            lines: summary.num_lines,
            words: summary.num_words
        };
    });
    $(tableName).DataTable({
        orderCellsTop: true,
        pageLength: 50,
        info: false,
        paging: false,
        data: stats,
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
                render: function (data, type, row) {
                    return `${row.count == 0 ? 0 : data / row.count}`;
                }
            }
        ],
        order: [[0, 'desc']],
        columnDefs: [
            {
                targets: [0, 1],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css({
                        "white-space": "pre",
                        "word-wrap": "normal"
                    });
                }
            }
        ]
    });
}
export function initSKUTable(store) {
    const tableName = "#sku-table";
    destroyTable(tableName);
    $(tableName).DataTable({
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
                render: function (data, type, row) {
                    return `<input type="number" class="form-control sku-cost-input" step="0.01" data-id="${row.sku}" value="${data != null ? data : ''}"/>`;
                }
            }
        ]
    });
}
export function initEntitlementTable(entitlements, store) {
    const tableName = "#entitlement-table";
    destroyTable(tableName);
    const storeMap = new Map(store.map((item) => [item.sku, item.user_cost]));
    const userEnetitlements = entitlements.reduce((acc, entitlement) => {
        const key = `${entitlement.user_id}-${entitlement.sku_id}`;
        if (!acc[key]) {
            acc[key] = { user_id: entitlement.user_id, sku_id: entitlement.sku_id, member: entitlement.member, count: 0 };
        }
        acc[key].count += 1;
        return acc;
    }, {});
    const summaryData = Object.values(userEnetitlements).map(ent => {
        const user_cost = storeMap.get(ent.sku_id) || 0;
        return {
            member_name: playerName(ent.member),
            sku: ent.sku_id,
            count: ent.count,
            unit_cost: user_cost.toFixed(2),
            total_cost: (ent.count * user_cost).toFixed(2)
        };
    });
    $(tableName).DataTable({
        orderCellsTop: true,
        // @ts-ignore
        responsive: true,
        pageLength: 25,
        lengthChange: false,
        info: false,
        paging: false,
        data: summaryData,
        columns: [
            {
                title: "Player",
                data: "member_name"
            },
            {
                title: "SKU",
                data: "sku"
            },
            {
                title: "Unit Cost",
                data: "unit_cost"
            },
            {
                title: "Total Cost",
                data: "total_cost"
            }
        ]
    });
}
export function initAnnouncementTable(announcements) {
    const tableName = "#announcement-table";
    destroyTable(tableName);
    $(tableName).DataTable({
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
        data: announcements,
        columns: [
            {
                width: "5%",
                render: function (data, type, row) {
                    return `
                    <button class="btn fa-solid fa-trash text-white announcement-delete" data-id=${row.id}></button>
                    `;
                }
            },
            {
                title: "Title",
                render: function (data, type, row) {
                    const parts = row.split("|");
                    const title = parts.length > 1 ? parts[0] : "None";
                    return title;
                }
            }
        ]
    });
}
export function initActivityTable(activities) {
    const tableName = "#activity-table";
    destroyTable(tableName);
    $(tableName).DataTable({
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
                render: function (data, type, row) {
                    return `<input type="number" class="form-control cc-input" data-id="${row.id}" value="${data != null ? data : ''}"/>`;
                }
            },
            {
                data: "credit_ratio",
                "title": "Credit Ratio",
                orderable: false,
                searchable: false,
                width: "20%",
                render: function (data, type, row) {
                    return `<input type="number" class="form-control cr-input" data-id="${row.id}" step="0.25" value="${data != null ? data : ''}"/>`;
                }
            },
            {
                data: "diversion",
                title: "Diversion",
                orderable: false,
                searchable: false,
                render: function (data, type, row) {
                    return `<div class="form-check"><input type="checkbox" class="form-check-input diversion-input" data-id="${row.id}" ${data ? 'checked' : ''}/></div>`;
                }
            },
            {
                data: "points",
                title: "Points",
                orderable: false,
                searchable: false,
                render: function (data, type, row) {
                    return `<input type="number" class="form-control points-input" data-id="${row.id}" value="${data}"/>`;
                }
            }
        ]
    });
}
export function initActivityPointsTable(activityPoints) {
    const tableName = "#activity-points-table";
    destroyTable(tableName);
    $(tableName).DataTable({
        orderCellsTop: true,
        // @ts-ignore
        responsive: true,
        pageLength: 10,
        lengthChange: false,
        searching: false,
        info: false,
        paging: false,
        data: activityPoints,
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
                render: function (data, type, row) {
                    return `<input type="number" class="form-control point-input" data-id="${row.id}" value="${data != null ? data : ''}"/>`;
                }
            }
        ]
    });
}
export function initLogTable(guild_id) {
    const tableName = "#log-table";
    destroyTable(tableName);
    $(tableName).DataTable({
        stateSave: true,
        processing: true,
        serverSide: true,
        language: {
            emptyTable: "No logs to display."
        },
        ajax: {
            url: `api/logs/${guild_id}`,
            type: 'POST',
            contentType: 'application/json',
            data: (d) => {
                const requestData = d;
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
                render: function (data, type, row) {
                    let date = new Date(data);
                    return date.toLocaleString();
                }
            },
            {
                title: "Author",
                data: "author",
                render: (data) => {
                    return `${playerName(data)}`;
                }
            },
            {
                data: 'member',
                title: "Player",
                render: (data) => {
                    return `${playerName(data)}`;
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
                data: 'notes'
            },
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
}
export function initMessageTable(messages) {
    const tableName = "#message-table";
    destroyTable(tableName);
    $(tableName).DataTable({
        data: messages,
        pageLength: 50,
        columns: [
            {
                width: "5%",
                render: function (data, type, row) {
                    return `
                    <button class="btn fa-solid fa-trash text-white message-delete" data-id=${row.message_id}></button>
                    `;
                }
            },
            {
                title: "Title",
                data: "title"
            },
            {
                title: "Channel",
                data: "channel_name"
            }
        ]
    });
}
export function initConversionTable(conversions) {
    const tableName = "#conversion-table";
    destroyTable(tableName);
    $(tableName).DataTable({
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
                render: function (data, type, row) {
                    return `<input type="number" class="form-control credit-input" data-id="${row.id}" value="${data != null ? data : ''}"/>`;
                }
            }
        ]
    });
}
export function initLevelCostTable(costs) {
    const tableName = "#level-cost-table";
    destroyTable(tableName);
    $(tableName).DataTable({
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
                render: function (data, type, row) {
                    return `<input type="number" class="form-control level-cost-input" data-id="${row.id}" value="${data != null ? data : ''}"/>`;
                }
            }
        ]
    });
}
export function buildSaySummaryData(playerData) {
    const startDate = $("#say-summary-start-date").val() ? new Date($("#say-summary-start-date").val().toString()) : 0;
    const endDate = $("#say-summary-end-date").val() ? new Date($("#say-summary-end-date").val().toString()) : new Date();
    let stats = { count: 0, num_lines: 0, num_words: 0, num_characters: 0 };
    playerData.forEach(player => {
        const characters = player.statistics?.say || {};
        for (const char in characters) {
            const dates = characters[char];
            for (const dateStr in dates) {
                const date = new Date(dateStr);
                if (date >= startDate && date <= endDate) {
                    const s = dates[dateStr];
                    stats.count += s.count || 0;
                    stats.num_lines += s.num_lines || 0;
                    stats.num_characters += s.num_characters || 0;
                    stats.num_words += s.num_words || 0;
                }
            }
        }
    });
    return stats;
}
export function initSaySummaryTable(players) {
    const tableName = "#say-summary-table";
    destroyTable(tableName);
    const stats = buildSaySummaryData(players);
    $(tableName).DataTable({
        orderCellsTop: true,
        pageLength: 25,
        info: false,
        paging: false,
        data: [stats],
        columns: [
            {
                data: "count",
                title: "# Posts",
                className: "text-end",
                render: function (data, type, row) {
                    return data.toLocaleString();
                }
            },
            {
                title: "Characters",
                data: "num_characters",
                className: "text-end",
                render: function (data, type, row) {
                    return data.toLocaleString();
                }
            },
            {
                title: "Lines",
                data: "num_lines",
                className: "text-end",
                render: function (data, type, row) {
                    return data.toLocaleString();
                }
            },
            {
                title: "Words",
                data: "num_words",
                className: "text-end",
                render: function (data, type, row) {
                    return data.toLocaleString();
                }
            },
            {
                title: "Avg. Words / Post",
                data: "num_words",
                className: "text-end",
                render: function (data, type, row) {
                    return `${row.count == 0 ? 0 : (data / row.count).toFixed(2)}`;
                }
            }
        ],
        order: [[0, 'desc']],
        columnDefs: [
            {
                targets: [0, 1],
                createdCell: function (td, cellData, rowData, row, col) {
                    $(td).css({
                        "white-space": "pre",
                        "word-wrap": "normal"
                    });
                }
            }
        ]
    });
}
