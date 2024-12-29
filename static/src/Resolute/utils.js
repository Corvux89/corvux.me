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
