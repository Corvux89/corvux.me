import { ToastError } from "../General/main.js";
import { Character, Player, playerName } from "./types.js";
import { filterStats, initPlayerCharacterTable, initSayTable } from "./utils.js";

$('body').addClass("busy")
await setupProfile()

async function setupProfile(){
    const playerData = await bot.get_player(userSession.guild.id, userSession.user_id) as Player

    $('body').removeClass("busy")

    if (!playerData) {
        ToastError("Player not found")
    }

    $("#member-name").val(`${playerName(playerData.member)}`)
    $("#member-id").val(`${playerData.id}`)
    $("#player-cc").val(playerData.cc)
    $("#player-div-cc").val(playerData.div_cc)
    $("#player-act-points").val(playerData.activity_points)

    initPlayerCharacterTable(playerData.characters)
    initSayTable(playerData)
}

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

$("#say-start-date, #say-end-date").on("change", function(){
    $("#say-table").DataTable().draw()
})

$(document).on("guildUpdated", async function() {
    $('body').addClass("busy")
    await setupProfile()
})



// Filter Functions
$.fn.dataTable.ext.search.push(async function (settings, data, dataIndex){
    const playerData = await bot.get_player(userSession.guild.id.toString(), userSession.user_id) as Player

    if (settings.nTable.id == 'say-table'){
            const sayTable = $("#say-table").DataTable()
            const startDate = $("#say-start-date").val() as string
            const endDate = $("#say-end-date").val() as string
            var rowData = sayTable.row(dataIndex).data()
            if (!rowData) return true
            const key = rowData.command

            const npcStats = playerData.statistics.say[key]

            if (!npcStats) return true

            rowData = filterStats(npcStats, rowData, startDate, endDate)

            sayTable.row(dataIndex).data(rowData)

            return rowData.count > 0

        }

    return true
})
