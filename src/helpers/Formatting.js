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

  // Format time in 12-hour format with AM/PM
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12

  const formattedTime = `${hours}:${minutes
    .toString()
    .padStart(2, "0")}${ampm}`;

  return `${dayWithSuffix} ${monthName} ${formattedTime}`;
};
