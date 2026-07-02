export const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;

export const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

export const formatTime = (time) => new Date(`1970-01-01T${time}`).toLocaleTimeString('en-IN', {
  hour: '2-digit',
  minute: '2-digit'
});

export const truncateText = (text, maxLength = 100) =>
  text?.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

export const capitalizeFirst = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

export const formatPhoneNumber = (phone) =>
  phone?.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

export const parseTimeToHour = (timeStr) => {
  if (!timeStr) return null;
  let hour;
  let period = "am";

  if (typeof timeStr === "string") {
    const timeStrLower = timeStr.toLowerCase();
    if (timeStrLower.endsWith("am") || timeStrLower.endsWith("pm")) {
      period = timeStrLower.slice(-2);
      hour = timeStrLower.slice(0, -2).trim();
    } else {
      const timeParts = timeStrLower.split(" ");
      if (timeParts?.length > 1) {
        hour = timeParts[0];
        period = timeParts[1];
      } else {
        hour = timeStrLower;
      }
    }
    hour = parseInt(hour.split(":")[0]);
    if (isNaN(hour)) return null;

    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
  }
  return hour;
};


export const getPriceForSlot = (slotTime, day, isHalfSlot = false, slotPrice = [], courtId = null, duration = 60) => {

  if (!slotPrice || !Array.isArray(slotPrice) || slotPrice.length === 0) return null;

  const slotHour = parseTimeToHour(slotTime);
  if (slotHour === null) return null;

  let period = "morning";
  if (slotHour >= 17) period = "evening";
  else if (slotHour >= 12) period = "afternoon";

  // Try exact match: courtId + day + timePeriod + actual duration
  if (courtId) {
    const exactMatch = slotPrice.find(p =>
      p.day === day &&
      p.timePeriod === period &&
      p.courtId === courtId &&
      p.duration === duration
    );
    if (exactMatch) return isHalfSlot ? exactMatch.price / 2 : exactMatch.price;

    // Try courtId + day + timePeriod with duration 60 fallback
    const courtFallback = slotPrice.find(p =>
      p.day === day &&
      p.timePeriod === period &&
      p.courtId === courtId
    );
    if (courtFallback) return isHalfSlot ? courtFallback.price / 2 : courtFallback.price;
  }

  // Fallback: day + timePeriod + actual duration (no courtId filter)
  const durationMatch = slotPrice.find(p =>
    p.day === day &&
    p.timePeriod === period &&
    p.duration === duration
  );
  if (durationMatch) return isHalfSlot ? durationMatch.price / 2 : durationMatch.price;

  // Last resort: day + timePeriod only
  const fallback = slotPrice.find(p =>
    p.day === day &&
    p.timePeriod === period
  );
  if (fallback) return isHalfSlot ? fallback.price / 2 : fallback.price;

  return null;
};

export const isPastTime = (timeStr, selectedDate) => {
  if (!timeStr) return false;
  const selectedDateObj = new Date(selectedDate);
  const now = new Date();
  const isToday = selectedDateObj.toDateString() === now.toDateString();
  if (!isToday) return false;

  const timeStrLower = timeStr.toString().toLowerCase().trim();
  let period = "am", timePart = timeStrLower;
  if (timeStrLower.endsWith("am") || timeStrLower.endsWith("pm")) {
    period = timeStrLower.slice(-2);
    timePart = timeStrLower.slice(0, -2).trim();
  } else {
    const parts = timeStrLower.split(" ");
    if (parts.length > 1) { timePart = parts[0]; period = parts[1]; }
  }
  const [hStr, mStr = "0"] = timePart.split(":");
  let hour = parseInt(hStr);
  const minute = parseInt(mStr) || 0;
  if (isNaN(hour)) return false;
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  const slotDateTime = new Date(selectedDateObj);
  slotDateTime.setHours(hour, minute + 15, 0, 0);
  return now >= slotDateTime;
};

export const isAfterClosingTime = () => {
  const now = new Date();
  const CLOSING_TIME_HOUR = 22;
  const CLOSING_TIME_MINUTE = 15;
  return now.getHours() > CLOSING_TIME_HOUR || (now.getHours() === CLOSING_TIME_HOUR && now.getMinutes() >= CLOSING_TIME_MINUTE);
};

export const formatTimeForDisplay = (time) => {
  if (!time) return "";
  const timeLower = time.toLowerCase();
  let hourPart = timeLower.replace(/(am|pm)/gi, "").trim();
  const periodMatch = timeLower.match(/(am|pm)/gi);
  const periodPart = periodMatch ? periodMatch[0] : "";
  if (!hourPart.includes(":")) {
    const hour = parseInt(hourPart);
    hourPart = `${hour}:00`;
  } else {
    const [hour, minute] = hourPart.split(":");
    hourPart = `${parseInt(hour)}:${minute}`;
  }
  return `${hourPart} ${periodPart}`;
};

export const groupConsecutiveSlots = (courtTimes, courtId, dateKey, halfSelectedSlots) => {
  if (!courtTimes || courtTimes.length === 0) return [];

  const sortedSlots = [...courtTimes].sort((a, b) => {
    const hourA = parseTimeToHour(a.time);
    const hourB = parseTimeToHour(b.time);
    return hourA - hourB;
  });

  const groups = [];
  let currentGroup = [sortedSlots[0]];

  for (let i = 1; i < sortedSlots.length; i++) {
    const currentHour = parseTimeToHour(sortedSlots[i].time);
    const prevHour = parseTimeToHour(sortedSlots[i - 1].time);
    const isConsecutive = currentHour === prevHour + 1;

    const currentLeftKey = `${courtId}-${sortedSlots[i]._id}-${dateKey}-left`;
    const currentRightKey = `${courtId}-${sortedSlots[i]._id}-${dateKey}-right`;
    const prevLeftKey = `${courtId}-${sortedSlots[i - 1]._id}-${dateKey}-left`;
    const prevRightKey = `${courtId}-${sortedSlots[i - 1]._id}-${dateKey}-right`;

    const currentHasLeft = halfSelectedSlots.has(currentLeftKey);
    const currentHasRight = halfSelectedSlots.has(currentRightKey);
    const prevHasLeft = halfSelectedSlots.has(prevLeftKey);
    const prevHasRight = halfSelectedSlots.has(prevRightKey);

    const isHalfConsecutive = isConsecutive && (
      (prevHasRight && currentHasLeft) ||
      (prevHasLeft && prevHasRight && currentHasLeft) ||
      (!prevHasLeft && !prevHasRight && !currentHasLeft && !currentHasRight)
    );

    if (isConsecutive && (isHalfConsecutive || (!currentHasLeft && !currentHasRight && !prevHasLeft && !prevHasRight))) {
      currentGroup.push(sortedSlots[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [sortedSlots[i]];
    }
  }

  groups.push(currentGroup);
  return groups;
};

export const parseTimeToHalfHour = (timeStr) => {
  if (!timeStr) return null;

  // Handle formats like "6 am", "7:30 am", "10:30 PM", "12 pm"
  const cleaned = timeStr.toLowerCase().trim().replace(/\s+/g, ' ');
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);

  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3] ? match[3].toLowerCase() : null;

  // Convert to 24-hour
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  // Convert to number of 30-min blocks since midnight
  return hours * 2 + (minutes >= 30 ? 1 : 0);
};

export const formatTimeRange = (group) => {
  if (group.length === 1) {
    return formatTimeForDisplay(group[0].time);
  }

  const startTime = group[0].time;
  const endTime = group[group.length - 1].time;
  const endHour = parseTimeToHour(endTime) + 1;
  const endPeriod = endHour >= 12 ? 'pm' : 'am';
  const displayEndHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;

  return `${formatTimeForDisplay(startTime).replace(/:\d{2}/, '')} - ${displayEndHour}:00 ${endPeriod}`;
};

export const shouldDisableSlotByDuration = (selectedTimes, halfSelectedSlots, slotData) => {
  const hasAnySelection = Object.keys(selectedTimes).length > 0 || (halfSelectedSlots && halfSelectedSlots.size > 0);

  if (!hasAnySelection || !slotData?.data) return null;

  let selectedSlotDuration = null;

  for (const courtData of slotData.data) {
    const courtId = courtData._id;
    const courtTimes = selectedTimes[courtId];


    if (courtTimes && courtTimes.length > 0) {
      const slot = courtData.slots?.find(s => s._id === courtTimes[0]._id);
      if (slot) {
        selectedSlotDuration = slot.duration;
        break;
      }
    }
  }
  return selectedSlotDuration;
};

export const isSlotDurationDisabled = (currentSlotDuration, selectedSlotDuration) => {
  if (!selectedSlotDuration) return false;

  const selected = Array.isArray(selectedSlotDuration) ? selectedSlotDuration : [selectedSlotDuration];
  const current = Array.isArray(currentSlotDuration) ? currentSlotDuration : [currentSlotDuration];

  const has90 = selected.includes(90);
  const has60 = selected.includes(60);
  const has30 = selected.includes(30);

  if (has90) {
    return current.every(d => d === 60 || d === 30);
  }

  if (has60 || has30) {
    return current.every(d => d === 90);
  }

  return false;
};

export const isSlotDurationDisabledMultiple = (currentSlotDuration, selectedDurations) => {
  if (!selectedDurations || selectedDurations.size === 0) return false;

  const has90 = selectedDurations.has(90);
  const has60 = selectedDurations.has(60);
  const has30 = selectedDurations.has(30);

  if (has90) {
    return currentSlotDuration === 60 || currentSlotDuration === 30;
  }

  if ((has60 || has30) && currentSlotDuration === 90) {
    return true;
  }

  return false;
}