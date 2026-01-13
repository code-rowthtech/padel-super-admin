const getOrdinalSuffix = (day) => {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const day = date.getDate();
  const dayWithSuffix = day + getOrdinalSuffix(day);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[date.getMonth()];

  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${dayWithSuffix} ${monthName} ${year} `;
};

export const formatTime = (timeStr) => {
  if (!timeStr) return "";

  const [time, period] = timeStr.toLowerCase().split(" ");

  let [hour, minute] = time.split(":").map(Number);
  if (isNaN(minute)) minute = 0;

  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  const date = new Date(1970, 0, 1, hour, minute);

  return date
    .toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
};

export const formatSingleTime = (timeString) => {
  if (!timeString) return "";

  const timeParts = timeString.trim().split(" ");
  const hour = timeParts[0];
  const period = timeParts[1]?.toLowerCase() || "";

  return `${hour}:00 ${period}`;
};

export const formatSlotTime = (timeString) => {
  if (!timeString) return "";

  const times = timeString.split(",");
  return times.map((time) => formatSingleTime(time)).join(" - ");
};
