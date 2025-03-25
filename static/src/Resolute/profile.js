import { ToastError } from "../General/main.js";
import { G0T0Bot, playerName } from "./types.js";
import { filterStats, initPlayerCharacterTable, initSayTable } from "./utils.js";
// TODO: Cleanup 
$('body').addClass("busy");
const bot = new G0T0Bot();
const memberID = $("#member-id").val().toString();
const guild = await bot.get_guild();
const playerData = await bot.get_player(guild.id, memberID);
console.log(playerData);
$('body').removeClass("busy");
if (!playerData) {
    ToastError("Player not found");
}
$("#member-name").val(`${playerName(playerData.member)}`);
$("#player-cc").val(playerData.cc);
$("#player-div-cc").val(playerData.div_cc);
$("#player-act-points").val(playerData.activity_points);
initPlayerCharacterTable(playerData.characters);
initSayTable(playerData);
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
$("#say-start-date, #say-end-date").on("change", function () {
    $("#say-table").DataTable().draw();
});
// Filter Functions
$.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
    if (settings.nTable.id == 'say-table') {
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
