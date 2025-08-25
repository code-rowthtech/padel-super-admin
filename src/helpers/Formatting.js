export const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.warn("Invalid date:", dateString);
        return "Invalid date";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
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
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase();
};

