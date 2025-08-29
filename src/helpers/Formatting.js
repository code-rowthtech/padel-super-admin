// Helper function to get ordinal suffix (st, nd, rd, th)
const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return "th"; // 4th-20th
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
    console.warn("Invalid date:", dateString);
    return "Invalid date";
  }

  // Get day with ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
  const day = date.getDate();
  const dayWithSuffix = day + getOrdinalSuffix(day);

  // Get month name
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

  // Get year
  const year = date.getFullYear();

  // Format time in 12-hour format with AM/PM (if you want to keep it later)
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;

  const formattedTime = `${hours}:${minutes
    .toString()
    .padStart(2, "0")}${ampm}`;

  // Now include year
  return `${dayWithSuffix} ${monthName} ${year} `;
};

export const formatTime = (timeStr) => {
  if (!timeStr) return "";

  // "5 pm" -> ["5", "pm"]  OR  "5:30 pm" -> ["5:30", "pm"]
  const [time, period] = timeStr.toLowerCase().split(" ");

  let [hour, minute] = time.split(":").map(Number);
  if (isNaN(minute)) minute = 0;

  // Convert to 24h format for safety
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
