// src/utils/matchTime.js
/**
 * Returns a display string for a match's time.
 * For 30‑minute slots it returns the start time (e.g., "3 pm").
 * For 90‑minute slots it returns the start time and calculated end time
 * (e.g., "3 pm – 4:30 pm").
 */
export const getMatchTimeMap = (match) => {
  if (!match?.slot?.length) return "N/A";

  // Helper to parse a time string like "3 pm" or "3:00 pm"
  const parseTime = (timeStr) => {
    const [timePart, period] = timeStr.trim().split(/\s+/);
    const [hourStr, minuteStr = "0"] = timePart.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (period?.toLowerCase() === "pm" && hour !== 12) hour += 12;
    if (period?.toLowerCase() === "am" && hour === 12) hour = 0;
    return { hour24: hour, minute };
  };

  const format12Hour = (hour24, minute) => {
    const period = hour24 >= 12 ? "pm" : "am";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    if (minute === 0) return `${hour12} ${period}`;
    const minuteStr = minute.toString().padStart(2, "0");
    return `${hour12}:${minuteStr} ${period}`;
  };

  // Determine overall earliest start and latest end across all slots
  let earliest = null;
  let latest = { hour24: 0, minute: 0 };

  match.slot.forEach((slot) => {
    const startStr = slot.bookingTime || slot.slotTimes?.[0]?.time;
    const duration = slot.totalTime ?? slot.duration ?? 30;
    const { hour24: startHour24, minute: startMinute } = parseTime(startStr);
    const endTotalMinutes = startHour24 * 60 + startMinute + duration;
    const endHour24 = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;

    const startTotal = startHour24 * 60 + startMinute;
    if (earliest === null || startTotal < earliest.total) {
      earliest = { hour24: startHour24, minute: startMinute, total: startTotal };
    }

    const latestTotal = endHour24 * 60 + endMinute;
    if (latestTotal > (latest.hour24 * 60 + latest.minute)) {
      latest = { hour24: endHour24, minute: endMinute };
    }
  });

  const startFormatted = format12Hour(earliest.hour24, earliest.minute);
  const endFormatted = format12Hour(latest.hour24, latest.minute);
  return `${startFormatted} - ${endFormatted}`;
};
