function convertTo24Hour(timeStr) {
    // Use regex to extract hours and period (AM/PM)
    const match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
    
    if (!match) {
        throw new Error("Invalid time format");
    }

    let [_, hour, minutes, period] = match;
    hour = parseInt(hour, 10);
    minutes = minutes ? minutes : "00"; // Default to "00" if minutes are not provided
    period = period.toLowerCase();

    // Convert to 24-hour format
    if (period === "pm" && hour !== 12) {
        hour += 12;
    } else if (period === "am" && hour === 12) {
        hour = 0;
    }

    // Format the time as HH:mm
    return `${String(hour).padStart(2, '0')}:${minutes}`;
}

module.exports = convertTo24Hour