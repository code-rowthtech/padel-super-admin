/**
 * Date utility functions for IST timezone handling
 * Ensures consistent date handling across the application
 */

/**
 * Format a Date as local YYYY-MM-DD without converting to UTC.
 * @param {Date} date - Date to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const toLocalDateString = (date = new Date()) => {
  const safeDate = date instanceof Date ? date : new Date(date);
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, "0");
  const day = String(safeDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Build a local Date object from a YYYY-MM-DD date-only string.
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date}
 */
export const dateOnlyToLocalDate = (dateString) => {
  if (!dateString) return new Date();
  const [year, month, day] = String(dateString).split("-").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Get current date in IST timezone as YYYY-MM-DD string
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getCurrentISTDate = () => {
  return toLocalDateString(new Date());
};

/**
 * Get current date and time in IST timezone
 * @returns {Date} Date object adjusted to IST
 */
export const getCurrentISTDateTime = () => {
  return new Date();
};

/**
 * Convert a date to IST date string
 * @param {Date} date - Date to convert
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const toISTDateString = (date) => {
  return toLocalDateString(date);
};

/**
 * Generate an array of dates starting from today in IST
 * @param {number} count - Number of dates to generate
 * @returns {Array} Array of date objects with day, date, month, fullDate
 */
export const generateISTDates = (count = 40) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isAfter10_15PM = currentHour > 22 || (currentHour === 22 && currentMinute >= 15);

  const startIndex = isAfter10_15PM ? 1 : 0;

  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setDate(now.getDate() + startIndex + i);
    const fullDate = toLocalDateString(date);

    return {
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      fullDate: fullDate,
    };
  });
};



/**
 * Get initial selected date state for IST timezone
 * @returns {Object} Object with fullDate and day properties
 */
export const getInitialISTDate = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isAfter10_15PM = currentHour > 22 || (currentHour === 22 && currentMinute >= 15);

  let selectedDate = new Date();
  if (isAfter10_15PM) {
    selectedDate.setDate(selectedDate.getDate() + 1);
  }

  const istDateString = toISTDateString(selectedDate);
  return {
    fullDate: istDateString,
    day: selectedDate.toLocaleDateString("en-US", { weekday: "long" }),
  };
};

/**
 * Check if a date string is today in IST timezone
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if the date is today in IST
 */
export const isToday = (dateString) => {
  return dateString === getCurrentISTDate();
};

