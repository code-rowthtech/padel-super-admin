// slotBookingUtils.js
export const getSlotBookingState = (slot) => {
  const isBooked = slot?.status === "booked";

  if (!isBooked) {
    return {
      isHalfBooked: false,
      isFullBooked: false,
    };
  }

  // 🔹 30 min slot
  if (slot?.duration === 30) {
    return {
      isHalfBooked: slot?.bookingCount === 1,
      isFullBooked: slot?.bookingCount === 2,
    };
  }

  // 🔹 60 min slot (always full if booked)
  if (slot?.duration === 60) {
    return {
      isHalfBooked: false,
      isFullBooked: slot?.bookingCount === 1,
    };
  }

  return {
    isHalfBooked: false,
    isFullBooked: false,
  };
};
