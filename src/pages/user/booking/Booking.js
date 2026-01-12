import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  booking_dropdown_img,
  booking_dropdown_img2,
  booking_dropdown_img3,
  booking_dropdown_img4,
  booking_logo_img,
  morningTab,
  nighttab,
  sun,
  tennis2,
  twoball,
  bannerimg,
} from "../../../assets/files";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { format } from "date-fns";
import TokenExpire from "../../../helpers/TokenExpire";
import {
  MdOutlineDateRange,
} from "react-icons/md";
import { getUserSlotBooking, getUserHalfSlotPrice } from "../../../redux/user/slot/thunk";
import { getUserClub } from "../../../redux/user/club/thunk";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { HiMoon } from "react-icons/hi";
import { BsSunFill } from "react-icons/bs";
import { PiSunHorizonFill } from "react-icons/pi";
import io from 'socket.io-client';
import config from '../../../config';
import BookingSummary from "./BookingSummary";
import { duration } from "@mui/material/styles";

const parseTimeToHour = (timeStr) => {
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

// Helper function to check if slot has bookingTime (already booked for 30 min)
const hasBookingTime = (slot) => {
  return slot?.bookingTime && slot?.bookingTime.trim() !== "";
};

// Helper function to check if slot is 7 PM
const is7PMSlot = (slot) => {
  const slotHour = parseTimeToHour(slot?.time);
  return slotHour === 19; // 7 PM = 19:00
};

// Helper function to check if slot is 9 PM
const is9PMSlot = (slot) => {
  const slotHour = parseTimeToHour(slot?.time);
  return slotHour === 21; // 9 PM = 21:00
};

// For 7 PM slot with bookingTime: Disable LEFT side, enable RIGHT side only
// For 9 PM slot with bookingTime: Disable RIGHT side, enable LEFT side only
const shouldDisableLeftSide = (slot) => {
  return hasBookingTime(slot) && is7PMSlot(slot);
};

const shouldDisableRightSide = (slot) => {
  return hasBookingTime(slot) && is9PMSlot(slot);
};

const filterSlotsByTab = (slot, eventKey) => {
  const slotHour = parseTimeToHour(slot?.time);
  if (slotHour === null) return false;
  switch (eventKey) {
    case "morning":
      return slotHour >= 0 && slotHour < 12;
    case "noon":
      return slotHour >= 12 && slotHour < 17;
    case "night":
      return slotHour >= 17 && slotHour <= 23;
    default:
      return true;
  }
};

const Booking = ({ className = "" }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const user = getUserFromSession();
  const [showUnavailable, setShowUnavailable] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0]) || [];
  const clubLoading = useSelector((state) => state?.userClub?.clubLoading);
  const { slotData } = useSelector((state) => state?.userSlot);
  const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
  const slotPriceLoading = useSelector((state) => state?.userSlot?.slotPriceLoading);
  const slotPrice = useSelector((state) => state?.userSlot?.slotPriceData?.data || []);
  console.log({ slotPrice });
  const [errorMessage, setErrorMessage] = useState("");
  const [errorShow, setErrorShow] = useState(false);
  const logo = clubData?.logo;
  const dateRefs = useRef({});
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [expireModal, setExpireModal] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [selectedBuisness, setSelectedBuisness] = useState([]);
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState({
    fullDate: new Date().toISOString().split("T")[0],
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
  });
  const [showBanner, setShowBanner] = useState(true);
  const [halfSelectedSlots, setHalfSelectedSlots] = useState(new Set());
  // Single source of truth for 30min half selections
  const [activeHalves, setActiveHalves] = useState(new Map()); // Map<slotKey, "left"|"right">
  const [isExpanded, setIsExpanded] = useState(false);
  console.log('Debug selectedCourts:', selectedCourts);
  console.log('Debug halfSelectedSlots:', halfSelectedSlots);
  console.log('Debug selectedTimes:', selectedTimes);
  const dayShortMap = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };
  const today = new Date();
  const dates = Array.from({ length: 40 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      fullDate: date.toISOString().split("T")[0],
    };
  });

  // Add this function inside Booking component
  const getPriceForSlot = useCallback((
    slotTime,
    day = selectedDate?.day,
    hasThirtyMinPrice = false  // true if this slot supports 30-min booking
  ) => {
    if (!slotPrice || !Array.isArray(slotPrice) || slotPrice.length === 0) {
      return null; // No price data → hide slot
    }

    const slotHour = parseTimeToHour(slotTime);
    if (slotHour === null) {
      return null;
    }

    let period = "morning";
    if (slotHour >= 17) period = "evening";
    else if (slotHour >= 12) period = "afternoon";

    // First: Try to find 30-minute price if half booking is allowed
    if (hasThirtyMinPrice) {
      const halfPriceEntry = slotPrice.find(
        p => p.day === day &&
          p.timePeriod === period &&
          p.duration === 30
      );
      if (halfPriceEntry) {
        return halfPriceEntry.price;
      }
    }

    // Fallback: Find full hour (60 min) price
    const fullPriceEntry = slotPrice.find(
      p => p.day === day &&
        p.timePeriod === period &&
        (p.duration === 60 || !p.duration) // some APIs might not send duration for default
    );

    if (fullPriceEntry) {
      return fullPriceEntry.price;
    }

    // No price found for this day + period
    return null;
  }, [slotPrice, selectedDate?.day]);

  const getSortedSlots = (court) => {
    return [...(court?.slots || [])].sort((a, b) => {
      const hourA = parseTimeToHour(a.time);
      const hourB = parseTimeToHour(b.time);
      return hourA - hourB;
    });
  };

  const findNextConsecutiveSlots = (sortedSlots, currentSlot, count) => {
    const currentIndex = sortedSlots.findIndex(s => s._id === currentSlot._id);
    if (currentIndex === -1) return [];

    const nextSlots = [];
    for (let i = 1; i <= count; i++) {
      const nextSlot = sortedSlots[currentIndex + i];
      if (nextSlot && parseTimeToHour(nextSlot.time) === parseTimeToHour(currentSlot.time) + i) {
        nextSlots.push(nextSlot);
      } else {
        break; // Not consecutive
      }
    }
    return nextSlots;
  };

  const getCurrentMonth = (selectedDate) => {
    if (!selectedDate || !selectedDate?.fullDate) return "MONTH";
    const dateObj = new Date(selectedDate?.fullDate);
    const month = dateObj
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    return month.split("").join("\n");
  };
  useEffect(() => {
    if (slotData?.message === "jwt token is expired") setExpireModal(true);
  }, [slotData?.message]);

  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target))
      setIsOpen(false);
  };

  const updateSelectedBusinessAndCourts = (times, courtId, dateKey) => {
    let allTimes = [...times];

    // 🔹 AUTO ADD HALF SLOT (only if hasThirtyMinPrice / halfSelectedSlots)
    const court = slotData?.data?.find(c => c?._id === courtId);

    if (court) {
      const sortedSlots = getSortedSlots(court);

      times.forEach(selectedTime => {
        const currentIndex = sortedSlots.findIndex(
          s => s._id === selectedTime._id
        );

        const nextSlot = sortedSlots[currentIndex + 1];
        if (!nextSlot) return;

        const leftKey = `${courtId}-${nextSlot._id}-${dateKey}-left`;
        const rightKey = `${courtId}-${nextSlot._id}-${dateKey}-right`;

        if (!halfSelectedSlots.has(leftKey) && !halfSelectedSlots.has(rightKey)) {
          return;
        }

        // prevent duplicate add
        if (
          allTimes.some(
            t => t._id === nextSlot._id || t.originalId === nextSlot._id
          )
        ) {
          return;
        }

        const side = halfSelectedSlots.has(leftKey) ? "left" : "right";
        let displayTime = nextSlot.time;

        if (side === "right") {
          if (displayTime.includes(":00")) {
            displayTime = displayTime.replace(":00", ":30");
          } else {
            const m = displayTime.match(/(\d+)\s*(am|pm)/i);
            if (m) displayTime = `${m[1]}:30 ${m[2]}`;
          }
        }

        // 🔹 STRICT 30 MIN PRICE
        const slotHour = parseTimeToHour(nextSlot.time);
        let period = "morning";
        if (slotHour >= 17) period = "evening";
        else if (slotHour >= 12) period = "afternoon";

        const price30 =
          slotPrice.find(
            p =>
              p.day === selectedDate?.day &&
              p.duration === 30 &&
              p.timePeriod === period
          )?.price ?? 0;

        allTimes.push({
          ...nextSlot,
          _id: `${nextSlot._id}-${side}`,
          originalId: nextSlot._id,
          time: displayTime,
          side,
          amount: price30
        });
      });
    }

    // 🔹 NORMALIZE PRICE (NO NULL / NO 0 BUG)
    const normalizeAmount = time => {
      const slotHour = parseTimeToHour(time);
      let period = "morning";
      if (slotHour >= 17) period = "evening";
      else if (slotHour >= 12) period = "afternoon";

      return (
        slotPrice.find(
          p =>
            p.day === selectedDate?.day &&
            p.duration === 60 &&
            p.timePeriod === period
        )?.price ?? 0
      );
    };

    const finalTimes = allTimes.map(t => ({
      ...t,
      date: dateKey,
      amount:
        t.amount !== null && t.amount !== undefined
          ? Number(t.amount)
          : Number(normalizeAmount(t.time))
    }));

    // 🔹 SELECTED BUSINESS
    setSelectedBuisness(prev => {
      const filtered = prev.filter(
        p =>
          !(
            p.date === dateKey &&
            finalTimes.some(
              t =>
                t._id === p._id ||
                t.originalId === p.originalId ||
                p._id === t.originalId
            )
          )
      );
      return [...filtered, ...finalTimes];
    });

    // 🔹 SELECTED COURTS (THIS WAS MAIN BUG)
    const currentCourt = slotData?.data?.find(c => c?._id === courtId);

    if (!currentCourt) return;

    setSelectedCourts(prev => {
      const existing = prev.find(
        c => c._id === courtId && c.date === dateKey
      );

      const timeEntries = finalTimes.map(t => ({
        _id: t._id,
        originalId: t.originalId || t._id,
        time: t.time,
        side: t.side,
        amount: Number(t.amount) // ✅ NEVER NULL / NEVER 0 BY MISTAKE
      }));

      if (existing) {
        return prev.map(c =>
          c._id === courtId && c.date === dateKey
            ? { ...c, time: timeEntries }
            : c
        );
      }

      return [
        ...prev,
        {
          _id: currentCourt._id,
          courtName: currentCourt.courtName,
          date: dateKey,
          day: selectedDate?.day,
          time: timeEntries
        }
      ];
    });
  };


  const MAX_SLOTS = 15;


  const toggleTime = (slot, courtId, dateKey, clickSide = null) => {
    const currentCourtTimes = selectedTimes[courtId]?.[dateKey] || [];
    const leftKey = `${courtId}-${slot._id}-${dateKey}-left`;
    const rightKey = `${courtId}-${slot._id}-${dateKey}-right`;

    // Check if we've reached the maximum slot limit
    const currentTotalSlots = Object.values(selectedTimes).reduce((total, courtDates) => {
      return total + Object.values(courtDates).reduce((dateTotal, timeSlots) => {
        return dateTotal + timeSlots?.length;
      }, 0);
    }, 0);

    // Full slot (no half support)
    if (!slot.has30MinPrice) {
      const isSelected = currentCourtTimes.some(t => t._id === slot._id);
      
      // If not selected and we're at max limit, prevent selection
      if (!isSelected && currentTotalSlots >= MAX_SLOTS) {
        return;
      }
      
      const price = getPriceForSlot(slot.time, selectedDate?.day, false) || 0;

      const newTimes = isSelected
        ? currentCourtTimes.filter(t => t._id !== slot._id)
        : [...currentCourtTimes, { ...slot, amount: price }];

      setHalfSelectedSlots(prev => {
        const s = new Set(prev);
        s.delete(leftKey);
        s.delete(rightKey);
        return s;
      });

      setSelectedTimes(prev => ({
        ...prev,
        [courtId]: {
          ...prev[courtId],
          [dateKey]: newTimes.length ? newTimes : undefined,
        },
      }));
      updateSelectedBusinessAndCourts(newTimes, courtId, dateKey);
      return;
    }

    // ====== HALF SLOT (has30MinPrice = true) ======
    if (!clickSide) return;

    const isLeft = clickSide === "left";
    const targetKey = isLeft ? leftKey : rightKey;
    const wasSelected = halfSelectedSlots.has(targetKey);

    // If not selected and we're at max limit, prevent selection
    if (!wasSelected && currentTotalSlots >= MAX_SLOTS) {
      return;
    }

    // Toggle the clicked half
    setHalfSelectedSlots(prev => {
      const s = new Set(prev);
      if (wasSelected) {
        s.delete(targetKey);
      } else {
        s.add(targetKey);
      }
      return s;
    });

    // Rebuild times for this slot
    const otherTimes = currentCourtTimes.filter(t => t._id !== slot._id);
    let newTimes = [...otherTimes];

    // Check if there are any remaining half selections after this toggle
    const willHaveLeft = wasSelected && isLeft ? false : halfSelectedSlots.has(leftKey) || (!wasSelected && isLeft);
    const willHaveRight = wasSelected && !isLeft ? false : halfSelectedSlots.has(rightKey) || (!wasSelected && !isLeft);

    if (willHaveLeft || willHaveRight) {
      const displayTime = willHaveRight && !willHaveLeft
        ? slot.time.replace(":00", ":30").replace(/\s*(am|pm)/i, ":30 $1")
        : slot.time;

      const halfPrice = getPriceForSlot(slot.time, selectedDate?.day, true) || 0;
      const totalPrice = willHaveLeft && willHaveRight ? halfPrice * 2 : halfPrice;

      newTimes.push({
        ...slot,
        time: displayTime,
        side: willHaveLeft && willHaveRight ? "both" : (willHaveLeft ? "left" : "right"),
        amount: totalPrice,
      });
    }

    setSelectedTimes(prev => ({
      ...prev,
      [courtId]: {
        ...prev[courtId],
        [dateKey]: newTimes.length ? newTimes : undefined,
      },
    }));

    updateSelectedBusinessAndCourts(newTimes, courtId, dateKey);
  };


  const handleDeleteSlot = (courtId, date, timeId) => {
    // Clear half selections for this specific slot
    const clearHalfSelections = (slotId) => {
      setHalfSelectedSlots(prev => {
        const newSet = new Set();
        prev.forEach(key => {
          // Keep keys that don't match this court, date, and slot
          if (!key.includes(`${courtId}-${slotId}-${date}-`)) {
            newSet.add(key);
          }
        });
        return newSet;
      });
    };

    // For 30min duration, handle activeHalves cleanup
    if (selectedDuration === 30) {
      // Find the slot key in activeHalves and remove it
      const slotKey = `${courtId}-${timeId}-${date}`;
      setActiveHalves(prev => {
        const newMap = new Map(prev);
        newMap.delete(slotKey);
        return newMap;
      });
      clearHalfSelections(timeId);
    }

    // For 90min duration, handle both first slot and auto-selected half slot removal
    if (selectedDuration === 90) {
      // Clear all half selections for this court and date
      setHalfSelectedSlots(prev => {
        const newSet = new Set();
        prev.forEach(key => {
          if (!key.includes(`${courtId}-`) || !key.includes(`-${date}-`)) {
            newSet.add(key);
          }
        });
        return newSet;
      });

      // Clear all selected times for this court and date
      setSelectedTimes((prev) => {
        if (!prev[courtId] || !prev[courtId][date]) return prev;

        const { [date]: _, ...restDates } = prev[courtId];
        const newCourt = Object.keys(restDates).length > 0 ? restDates : undefined;

        if (!newCourt) {
          const { [courtId]: __, ...restCourts } = prev;
          return restCourts;
        }

        return {
          ...prev,
          [courtId]: newCourt,
        };
      });

      // Clear all from selectedBusiness for this court and date
      setSelectedBuisness((prev) =>
        prev.filter((t) => !(t?.date === date && selectedCourts.some(c => c._id === courtId && c.date === date)))
      );

      // Clear all from selectedCourts for this court and date
      setSelectedCourts((prev) =>
        prev.filter((c) => !(c?._id === courtId && c?.date === date))
      );
      return;
    }

    // For 120min duration, handle both consecutive slots removal
    if (selectedDuration === 120) {
      const currentCourtTimes = selectedTimes[courtId]?.[date] || [];
      const slotsToRemove = new Set([timeId]);

      // Find all slots that are part of the same 120min booking
      currentCourtTimes.forEach(slot => {
        if (slot._id !== timeId) {
          slotsToRemove.add(slot._id);
          clearHalfSelections(slot._id);
        }
      });
      clearHalfSelections(timeId);

      // Remove all related slots from selectedTimes
      setSelectedTimes((prev) => {
        if (!prev[courtId] || !prev[courtId][date]) return prev;

        const courtTimes = prev[courtId][date];
        const filtered = courtTimes.filter((t) => !slotsToRemove.has(t._id));

        if (filtered.length === 0) {
          const { [date]: _, ...restDates } = prev[courtId];
          const newCourt = Object.keys(restDates).length > 0 ? restDates : undefined;

          if (!newCourt) {
            const { [courtId]: __, ...restCourts } = prev;
            return restCourts;
          }

          return {
            ...prev,
            [courtId]: newCourt,
          };
        }

        return {
          ...prev,
          [courtId]: {
            ...prev[courtId],
            [date]: filtered,
          },
        };
      });

      // Remove all related slots from selectedBusiness
      setSelectedBuisness((prev) =>
        prev.filter((t) => {
          if (t?.date !== date) return true;
          return !slotsToRemove.has(t._id);
        })
      );

      // Remove all related slots from selectedCourts
      setSelectedCourts((prev) =>
        prev
          ?.map((c) =>
            c?._id === courtId && c?.date === date
              ? {
                ...c,
                time: c?.time.filter((t) => !slotsToRemove.has(t._id))
              }
              : c
          )
          .filter((c) => c?.time?.length > 0)
      );
      return;
    }

    // Check if this is a half-selected slot (for other durations)
    const isHalfSlot = timeId.includes('-left') || timeId.includes('-right');

    if (isHalfSlot) {
      const parts = timeId.split('-');
      const originalId = parts[0];
      const side = parts[parts.length - 1];
      const key = `${courtId}-${originalId}-${date}-${side}`;

      // Remove from half-selected slots
      setHalfSelectedSlots(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });

      // Also remove the corresponding first slot if it exists
      setSelectedTimes((prev) => {
        if (!prev[courtId] || !prev[courtId][date]) return prev;

        const courtTimes = prev[courtId][date];
        const filtered = courtTimes.filter((t) => t?._id !== originalId);

        if (filtered.length === 0) {
          const { [date]: _, ...restDates } = prev[courtId];
          const newCourt = Object.keys(restDates).length > 0 ? restDates : undefined;

          if (!newCourt) {
            const { [courtId]: __, ...restCourts } = prev;
            return restCourts;
          }

          return {
            ...prev,
            [courtId]: newCourt,
          };
        }

        return {
          ...prev,
          [courtId]: {
            ...prev[courtId],
            [date]: filtered,
          },
        };
      });
    } else {
      // Regular slot deletion - clear half selections for this slot
      clearHalfSelections(timeId);

      setSelectedTimes((prev) => {
        if (!prev[courtId] || !prev[courtId][date]) return prev;

        const courtTimes = prev[courtId][date];
        const filtered = courtTimes.filter((t) => t?._id !== timeId);

        if (filtered.length === 0) {
          const { [date]: _, ...restDates } = prev[courtId];
          const newCourt =
            Object.keys(restDates).length > 0 ? restDates : undefined;

          if (!newCourt) {
            const { [courtId]: __, ...restCourts } = prev;
            return restCourts;
          }

          return {
            ...prev,
            [courtId]: newCourt,
          };
        }

        return {
          ...prev,
          [courtId]: {
            ...prev[courtId],
            [date]: filtered,
          },
        };
      });
    }

    setSelectedBuisness((prev) =>
      prev.filter((t) => !(t?._id === timeId && t?.date === date))
    );

    setSelectedCourts((prev) =>
      prev
        ?.map((c) =>
          c?._id === courtId && c?.date === date
            ? { ...c, time: c?.time.filter((t) => t?._id !== timeId) }
            : c
        )
        .filter((c) => c?.time?.length > 0)
    );
  };

  const handleClearAll = () => {
    setSelectedCourts([]);
    setSelectedTimes({});
    setSelectedBuisness([]);
    dispatch(
      getUserSlotBooking({
        day: selectedDate?.day,
        date: format(new Date(selectedDate?.fullDate), "yyyy-MM-dd"),
        register_club_id: localStorage.getItem("register_club_id") || "",
      })
    );
    dispatch(
      getUserHalfSlotPrice({
        day: selectedDate?.day,
        register_club_id: localStorage.getItem("register_club_id") || "",
      })
    );
  };

  const buttonConfig = useMemo(() => {
    const width = 370;
    const height = 75;
    const circleRadius = height * 0.3;

    const curvedSectionStart = width * 0.76;
    const curvedSectionEnd = width * 0.996;

    const circleX = curvedSectionStart + (curvedSectionEnd - curvedSectionStart) * 0.68 + 1;
    const circleY = height * 0.5;

    const arrowSize = circleRadius * 0.6;
    const arrowX = circleX;
    const arrowY = circleY;

    return {
      width,
      height,
      circleRadius,
      arrowX,
      arrowY,
      arrowSize,
      buttonStyle: {
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        overflow: "visible",
      },
      svgStyle: {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
      },
      contentStyle: {
        position: "relative",
        zIndex: 2,
        color: "#001B76",
        fontWeight: "600",
        fontSize: "16px",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        paddingRight: `${circleRadius * 2}px`,
        fontFamily: "Poppins",
      },
    };
  }, []);

  const maxSelectableDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date;
  }, []);

  const totalSlots = useMemo(() => {
    return Object.values(selectedTimes).reduce((total, courtDates) => {
      return total + Object.values(courtDates).reduce((dateTotal, timeSlots) => {
        return dateTotal + timeSlots?.length;
      }, 0);
    }, 0);
  }, [selectedTimes]);

  const displayedSlotCount = useMemo(() => {
    if (totalSlots === 0) return 0;

    // Count half-selected slots
    const halfSlotCount = halfSelectedSlots.size;
    
    // If we have half-selected slots, calculate based on them
    if (halfSlotCount > 0) {
      return Number((halfSlotCount * 0.5).toFixed(1));
    }

    // Otherwise use regular slot count based on duration
    switch (selectedDuration) {
      case 30:
        return Number((totalSlots * 0.5).toFixed(1));
      case 60:
        return totalSlots;
      case 90:
        return Number((totalSlots * 1.5).toFixed(1));
      case 120:
        return totalSlots;
      default:
        return totalSlots;
    }
  }, [totalSlots, selectedDuration, halfSelectedSlots]);

  const clubId = useMemo(() => localStorage.getItem("register_club_id"), []);

  const fetchSlots = useCallback((socket = null) => {
    if (!clubId) return;

    dispatch(
      getUserSlotBooking({
        day: selectedDate?.day,
        date: format(new Date(selectedDate?.fullDate), "yyyy-MM-dd"),
        register_club_id: clubId,
        socket: socket,
      })
    );
    dispatch(
      getUserHalfSlotPrice({
        day: selectedDate?.day,
        register_club_id: localStorage.getItem("register_club_id") || "",
      })
    );
  }, [dispatch, selectedDate?.day, selectedDate?.fullDate, clubId]);

  useEffect(() => {
    setSelectedTimes({});
    setSelectedBuisness([]);
    setSelectedCourts([]);
    setHalfSelectedSlots(new Set());
    setActiveHalves(new Map()); 
    setIsExpanded(false);
  }, [selectedDuration]);

  useEffect(() => {
    if (selectedDuration === 30 || selectedDuration === 90) {
      Object.keys(selectedTimes).forEach(courtId => {
        Object.keys(selectedTimes[courtId] || {}).forEach(dateKey => {
          const times = selectedTimes[courtId][dateKey] || [];
          if (times?.length > 0) {
            updateSelectedBusinessAndCourts(times, courtId, dateKey);
          }
        });
      });
    }
  }, [halfSelectedSlots]);

  useEffect(() => {
    dispatch(getUserClub({ search: "" }));
    fetchSlots();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedDate, fetchSlots]);

  useEffect(() => {
    if (!user?._id || !clubId) return;

    const bookingSocket = io(config.API_URL, {
      transports: ['websocket'],
      forceNew: true
    });

    const handleConnect = () => {
      bookingSocket.emit("joinRoom", { userId: user?._id, clubId });
    };

    const handleSlotUpdate = (data) => {
      const currentDate = format(new Date(selectedDate?.fullDate), "yyyy-MM-dd");
      if (data?.clubId === clubId && data?.date === currentDate) {
        fetchSlots(bookingSocket);
      }
    };

    bookingSocket.on("connect", handleConnect);
    bookingSocket.on('slotUpdated', handleSlotUpdate);

    return () => {
      bookingSocket.off("connect", handleConnect);
      bookingSocket.off('slotUpdated', handleSlotUpdate);
      bookingSocket.disconnect();
    };
  }, [clubId, selectedDate?.fullDate, user?._id, fetchSlots]);

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  // Memoize expensive calculations
  const grandTotal = useMemo(() => {
    return selectedCourts.reduce(
      (sum, c) => sum + c?.time.reduce((s, t) => s + Number(t?.amount || 0), 0),
      0
    );
  }, [selectedCourts]);



  useEffect(() => {
    if (totalSlots === 0) {
      setIsExpanded(false);
    }
  }, [totalSlots]);

  // Clean up selected slots only for current date when slots are no longer available
  useEffect(() => {
    if (slotData?.data && (Object.keys(selectedTimes)?.length > 0 || selectedCourts?.length > 0)) {
      const currentDate = selectedDate?.fullDate;
      const updatedSelectedTimes = { ...selectedTimes };
      const updatedSelectedCourts = [...selectedCourts];
      const updatedSelectedBusiness = [...selectedBuisness];
      let hasChanges = false;

      // Only validate slots for current date
      Object.keys(selectedTimes).forEach(courtId => {
        if (selectedTimes[courtId][currentDate]) {
          const court = slotData?.data.find(c => c?._id === courtId);
          if (court) {
            const validSlots = selectedTimes[courtId][currentDate].filter(selectedSlot => {
              return court.slots?.some(availableSlot =>
                availableSlot?._id === selectedSlot?._id &&
                availableSlot?.availabilityStatus === "available" &&
                availableSlot?.status !== "booked"
              );
            });

            if (validSlots?.length !== selectedTimes[courtId][currentDate]?.length) {
              hasChanges = true;
              if (validSlots?.length > 0) {
                updatedSelectedTimes[courtId][currentDate] = validSlots;
              } else {
                delete updatedSelectedTimes[courtId][currentDate];
                if (Object.keys(updatedSelectedTimes[courtId])?.length === 0) {
                  delete updatedSelectedTimes[courtId];
                }
              }
            }
          }
        }
      });

      // Update selectedCourts only for current date
      for (let i = updatedSelectedCourts?.length - 1; i >= 0; i--) {
        const court = updatedSelectedCourts[i];
        if (court?.date === currentDate) {
          const validTimeSlots = court?.time.filter(timeSlot => {
            const courtData = slotData?.data.find(c => c?._id === court?._id);
            return courtData?.slots?.some(availableSlot =>
              availableSlot?._id === timeSlot?._id &&
              availableSlot?.availabilityStatus === "available" &&
              availableSlot?.status !== "booked"
            );
          });

          if (validTimeSlots?.length !== court?.time?.length) {
            hasChanges = true;
            if (validTimeSlots?.length > 0) {
              updatedSelectedCourts[i] = { ...court, time: validTimeSlots };
            } else {
              updatedSelectedCourts.splice(i, 1);
            }
          }
        }
      }

      // Update selectedBusiness only for current date
      for (let i = updatedSelectedBusiness?.length - 1; i >= 0; i--) {
        const slot = updatedSelectedBusiness[i];
        if (slot?.date === currentDate) {
          const courtExists = slotData?.data.some(court =>
            court?.slots?.some(courtSlot =>
              courtSlot?._id === slot?._id &&
              courtSlot?.availabilityStatus === "available" &&
              courtSlot?.status !== "booked"
            )
          );
          if (!courtExists) {
            hasChanges = true;
            updatedSelectedBusiness?.splice(i, 1);
          }
        }
      }

      // Update state only if there are changes
      if (hasChanges) {
        setSelectedTimes(updatedSelectedTimes);
        setSelectedCourts(updatedSelectedCourts);
        setSelectedBuisness(updatedSelectedBusiness);
      }
    }
  }, [slotData?.data,]);

  const handleBookNow = async () => {
    if (totalSlots === 0) {
      setErrorMessage("Select a slot to enable booking");
      setErrorShow(true);
      return;
    }

    const courtIds = selectedCourts
      ?.map((court) => court?._id)
      .filter((id) => id)
      .join(",");

    // Use selectedCourts as is - it already contains all slots including auto-selected half slots
    const paymentStateData = {
      courtData: {
        day: selectedDate?.day,
        date: selectedDate?.fullDate,
        time: selectedBuisness,
        courtId: courtIds,
        court: selectedCourts?.map((c) => ({ _id: c?._id || c?.id, ...c })),
        slot: slotData?.data?.[0]?.slots,
      },
      clubData,
      selectedCourts: selectedCourts, // Use original selectedCourts which already has all slots
      selectedDate,
      grandTotal,
      totalSlots: displayedSlotCount,
      duration: selectedDuration,
      halfSelectedSlots: halfSelectedSlots,
      slotData
    };

    if (!user?.token) {
      navigate("/login", {
        state: {
          redirectTo: "/payment",
          paymentState: paymentStateData,
        },
      });
    } else {
      navigate("/payment", {
        state: paymentStateData,
      });
    }
  };
  const handleSwitchChange = () => setShowUnavailable(!showUnavailable);

  const formatTimeForDisplay = (time) => {
    if (!time) return "";
    const timeLower = time.toLowerCase();
    let hourPart = timeLower.replace(/(am|pm)/gi, "").trim();
    const periodMatch = timeLower.match(/(am|pm)/gi);
    const periodPart = periodMatch ? periodMatch[0] : "";
    if (!hourPart.includes(":")) {
      const hour = parseInt(hourPart);
      hourPart = `${hour.toString().padStart(2, "0")}:00`;
    } else {
      const [hour, minute] = hourPart.split(":");
      hourPart = `${parseInt(hour).toString().padStart(2, "0")}:${minute}`;
    }
    return `${hourPart} ${periodPart}`;
  };

  const isPastTime = (timeStr) => {
    const slotHour = parseTimeToHour(timeStr);
    if (slotHour === null) return false;
    const selectedDateObj = new Date(selectedDate?.fullDate);
    const now = new Date();
    const isToday = selectedDateObj.toDateString() === now.toDateString();
    if (isToday) {
      const slotDateTime = new Date(selectedDateObj);
      slotDateTime.setHours(slotHour, 0, 0, 0);
      return slotDateTime < now;
    }
    return false;
  };

  useEffect(() => {
    if (errorShow || errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
        setErrorShow(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorShow, errorMessage]);

  useEffect(() => {
    const tooltip = document.getElementById('slot-limit-tooltip') || (() => {
      const newTooltip = document.createElement('div');
      newTooltip.id = 'slot-limit-tooltip';
      newTooltip.style.cssText = `
          position: fixed;
          background: #333;
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 9999;
          pointer-events: none;
          white-space: nowrap;
          display: none;
          max-width: 90vw;
          word-wrap: break-word;
          text-align: center;
        `;
      document.body.appendChild(newTooltip);
      return newTooltip;
    })();

    const handleMouseEnter = (e) => {
      if (window.innerWidth <= 768) return;

      const currentTotalSlots = Object.values(selectedTimes).reduce((total, courtDates) => {
        return total + Object.values(courtDates).reduce((dateTotal, timeSlots) => {
          return dateTotal + timeSlots?.length;
        }, 0);
      }, 0);

      if (currentTotalSlots >= MAX_SLOTS) {
        const button = e.currentTarget;
        const isSelected = button.style.background.includes('linear-gradient');
        if (!isSelected) {
          tooltip.textContent = `You can select up to ${MAX_SLOTS} slots only`;
          tooltip.style.display = 'block';
          tooltip.style.left = e.clientX + 10 + 'px';
          tooltip.style.top = e.clientY - 30 + 'px';
        }
      }
    };

    const handleMouseMove = (e) => {
      if (window.innerWidth <= 768) return;

      const currentTotalSlots = Object.values(selectedTimes).reduce((total, courtDates) => {
        return total + Object.values(courtDates).reduce((dateTotal, timeSlots) => {
          return dateTotal + timeSlots?.length;
        }, 0);
      }, 0);

      if (currentTotalSlots >= MAX_SLOTS && tooltip.style.display === 'block') {
        tooltip.style.left = e.clientX + 10 + 'px';
        tooltip.style.top = e.clientY - 30 + 'px';
      }
    };

    const handleMouseLeave = () => {
      tooltip.style.display = 'none';
    };

    const buttons = document.querySelectorAll('.slot-time-btn');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mousemove', handleMouseMove);
      button.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mousemove', handleMouseMove);
        button.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [selectedTimes, slotData]);

  useEffect(() => {
    const counts = [0, 0, 0];
    slotData?.data?.forEach((court) => {
      court?.slots?.forEach((slot) => {
        if (
          showUnavailable ||
          (slot?.availabilityStatus === "available" &&
            slot?.status !== "booked" &&
            !isPastTime(slot?.time))
        ) {
          const slotHour = parseTimeToHour(slot?.time);
          if (slotHour !== null) {
            if (slotHour >= 0 && slotHour < 12) counts[0]++;
            else if (slotHour >= 12 && slotHour < 17) counts[1]++;
            else if (slotHour >= 17 && slotHour <= 23) counts[2]++;
          }
        }
      });
    });

    let defaultTabIndex = 0;
    if (counts[0] === 0) {
      const firstAvailableIndex = counts.findIndex((count) => count > 0);
      if (firstAvailableIndex !== -1) {
        defaultTabIndex = firstAvailableIndex;
      }
    }
    setActiveTab(defaultTabIndex);
  }, [slotData, showUnavailable]);



  return (
    <>
      <div className="container px-0 mb-lg-3 mb-0 mobile-banner-container mt-md-4 mt-0 pb-3">
        <div className="ps-0 d-none d-lg-block" style={{ height: "340px" }}>
          <div
            className="image-zoom-container position-relative overflow-hidden rounded-3"
            style={{
              height: "100%",
              background:
                "linear-gradient(269.34deg, rgba(80, 78, 78, 0.61) 0.57%, #111827 94.62%)",
              backgroundBlendMode: "multiply",
            }}
          >
            <img
              src={twoball}
              alt="Paddle"
              className="img-fluid w-100 h-100 object-fit-cover sharp-image"
              style={{
                borderRadius: "13px",
                imageRendering: "auto",
                imageRendering: "-webkit-optimize-contrast",
                filter: "none",
              }}
            />

            <div
              className="position-absolute top-0 start-0 w-100 h-100 pt-lg-5 d-flex flex-column justify-content-center text-white p-5"
              style={{
                background:
                  "linear-gradient(269.34deg, rgba(255, 255, 255, 0) 0.57%, #111827 94.62%)",
                backgroundBlendMode: "multiply",
              }}
            >
              <p
                className="mb-0 ps-md-4"
                style={{
                  fontSize: "20px",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                }}
              >
                BOOK YOUR SLOT AT
              </p>
              <h1 className="booking-img-heading ps-md-4">
                {clubData?.clubName || ""}
              </h1>
            </div>
          </div>
        </div>
        {showBanner && (
          <div className="px-3 d-lg-none mobile-banner">
            <div
              className="image-zoom-container position-relative overflow-hidden rounded-3"
              style={{
                height: "100%",
                background:
                  "linear-gradient(269.34deg, rgba(80, 78, 78, 0.61) 0.57%, #111827 94.62%)",
                backgroundBlendMode: "multiply",
              }}
            >
              <img
                src={bannerimg}
                alt="Paddle"
                className="img-fluid w-100 object-fit-cover rounded-3 d-block d-md-none"
              />

              <div
                className="position-absolute top-0 start-0 w-100 h-100 pt-lg-0 d-flex flex-column justify-content-center text-white p-5"
                style={{
                  background:
                    "linear-gradient(269.34deg, rgba(255, 255, 255, 0) 0.57%, #111827 94.62%)",
                  backgroundBlendMode: "multiply",
                }}
              >
                <p
                  className="mb-0 ps-md-4"
                  style={{
                    fontSize: "12px",
                    fontFamily: "Poppins",
                    fontWeight: "500",
                  }}
                >
                  BOOK YOUR SLOT AT
                </p>
                <h1 className="booking-img-heading ps-md-4">
                  {clubData?.clubName || ""}
                </h1>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="container mb-md-0 mb-0 pt-1 pt-lg-0 px-lg-4">
        <div className="row g-4">
          <div className="col-lg-7 col-12 py-md-4 pt-0 pb-0 rounded-3 px-lg-4 mobile-booking-content px-3 mt-0">
            <div className="d-flex justify-content-between align-items-center mb-md-2 mb-0">
              <div className="custom-heading-use text-nowrap">
                Select Date
                <div
                  className="position-relative d-inline-block"
                  ref={wrapperRef}
                >
                  <span
                    className="rounded p-1 pt-0 ms-1 "
                    style={{
                      cursor: "pointer",
                      width: "26px !important",
                      height: "26px !important",
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <MdOutlineDateRange
                      size={17}
                      style={{ color: "#374151" }}
                    />
                  </span>
                  {isOpen && (
                    <div
                      className="position-absolute mt-2 z-3 bg-white border rounded shadow"
                      style={{ top: "100%", left: "0", minWidth: "100%" }}
                    >
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <StaticDatePicker
                          displayStaticWrapperAs="desktop"
                          value={startDate}
                          onChange={(date) => {
                            setStartDate(date);
                            setIsOpen(false);
                            const formattedDate = date
                              .toISOString()
                              .split("T")[0];
                            const day = date.toLocaleDateString("en-US", {
                              weekday: "long",
                            });
                            setSelectedDate({ fullDate: formattedDate, day });
                            setShowBanner(false);
                            dispatch(
                              getUserSlotBooking({
                                day,
                                date: formattedDate,
                                register_club_id: localStorage.getItem("register_club_id") || "",
                              })
                            );
                            dispatch(
                              getUserHalfSlotPrice({
                                day: day,
                                register_club_id: localStorage.getItem("register_club_id") || "",
                              })
                            );
                          }}
                          minDate={new Date()}
                          maxDate={maxSelectableDate}
                          slotProps={{
                            actionBar: { actions: [] },
                          }}
                        />
                      </LocalizationProvider>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-switch d-flex justify-content-center align-items-center gap-2">
                <label
                  className="form-check-label mb-0"
                  htmlFor="flexSwitchCheckDefault"
                  style={{ whiteSpace: "nowrap", fontFamily: "Poppins" }}
                >
                  Show Unavailable Slots
                </label>
                <input
                  className="form-check-input fs-5 ms-md-1 ms-0 mb-1"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchCheckDefault"
                  checked={showUnavailable}
                  onChange={handleSwitchChange}
                  style={{ boxShadow: "none" }}
                />
              </div>
            </div>
            <div className="d-flex align-items-center mb-md-3 mb-2 gap-2 border-bottom">
              <div
                className="d-flex calendar-day-btn-mobile justify-content-center align-items-center rounded-1  mb-md-3 mb-2 mt-2 mt-md-2"
                style={{
                  backgroundColor: "#f3f3f5",
                  height: "58px",
                  padding: "2px 10px!important",
                  width: "20px"
                }}
              >
                <span
                  className="add_font_small_span "
                  style={{
                    fontSize: window.innerWidth <= 768 ? "12px" : "12px",
                    fontWeight: "500",
                    whiteSpace: "pre-line",
                    textAlign: "center",
                    lineHeight: "1",
                    letterSpacing: "0px",
                    margin: 0,
                    padding: 0,
                    display: "block",
                  }}
                >
                  {getCurrentMonth(selectedDate)}
                </span>
              </div>
              <div
                className="d-flex gap-1 "
                style={{ position: "relative" }}
              >
                <button
                  className="btn p-2 border-0 d-none d-md-block"
                  style={{
                    position: "absolute",
                    left: "-9%",
                    zIndex: 10,
                    boxShadow: "none",
                  }}
                  onClick={scrollLeft}
                >
                  <MdOutlineArrowBackIosNew className="mt-3" size={20} />
                </button>
                <div
                  ref={scrollRef}
                  className="d-flex gap-1 date-scroll-container pt-md-2 pt-2"
                  style={{
                    scrollBehavior: "smooth",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                  }}
                >
                  {dates?.map((d, i) => {
                    const formatDate = (date) =>
                      date.toISOString().split("T")[0];
                    const isSelected =
                      formatDate(new Date(selectedDate?.fullDate)) ===
                      d?.fullDate;

                    // Calculate slot count for this specific date with half-slot consideration
                    const slotCount = Object.values(selectedTimes).reduce(
                      (acc, courtDates) => {
                        const dateSlots = courtDates[d?.fullDate] || [];
                        return acc + dateSlots?.length;
                      },
                      0
                    );

                    // Calculate half-slot count for this date
                    const halfSlotCount = Array.from(halfSelectedSlots).filter(key => 
                      key.includes(`-${d?.fullDate}-`)
                    ).length;

                    // Calculate effective slot count (0.5 for each half-slot)
                    const effectiveSlotCount = halfSlotCount > 0 ? halfSlotCount * 0.5 : slotCount;
                    const displayCount = effectiveSlotCount % 1 === 0 ? effectiveSlotCount : effectiveSlotCount.toFixed(1);

                    return (
                      <button
                        key={i}
                        ref={(el) => (dateRefs.current[d?.fullDate] = el)}
                        className={`calendar-day-btn mb-md-3 mb-2 me-1 position-relative ${isSelected ? "text-white border-0" : "bg-white"
                          }`}
                        style={{
                          background: isSelected
                            ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"
                            : "#FFFFFF",
                          boxShadow: isSelected
                            ? "0px 4px 4px 0px #00000040"
                            : "",
                          borderRadius: "5px",
                          color: isSelected ? "#FFFFFF" : "#374151",
                        }}
                        onClick={() => {
                          setSelectedDate({ fullDate: d?.fullDate, day: d?.day });
                          setStartDate(new Date(d?.fullDate));
                          setShowBanner(false);
                          dispatch(
                            getUserSlotBooking({
                              day: d?.day,
                              date: d?.fullDate,
                              register_club_id: localStorage.getItem("register_club_id") || "",
                            })
                          );
                          dispatch(
                            getUserHalfSlotPrice({
                              day: d?.day,
                              register_club_id: localStorage.getItem("register_club_id") || "",
                            })
                          );
                        }}
                        onMouseEnter={(e) =>
                          !isSelected &&
                          (e.currentTarget.style.border = "1px solid #3DBE64")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.border = "1px solid #4949491A")
                        }
                      >
                        <div className="text-center">
                          <div className="date-center-date">{d?.date}</div>
                          <div className="date-center-day">
                            {dayShortMap[d?.day]}
                          </div>
                        </div>
                        {effectiveSlotCount > 0 && (
                          <span
                            className="position-absolute badge rounded-pill"
                            style={{
                              fontSize: "10px",
                              width: "18px",
                              height: "18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              top: "-8px",
                              right: "-4px",
                              zIndex: 22,
                              backgroundColor: "#22c55e",
                            }}
                          >
                            {displayCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="btn border-0 p-2 d-none d-md-block"
                  style={{
                    position: "absolute",
                    right: -26,
                    zIndex: 10,
                    boxShadow: "none",
                  }}
                  onClick={scrollRight}
                >
                  <MdOutlineArrowForwardIos className="mt-3" size={20} />
                </button>
              </div>
            </div>


            <div
              className={`mb-md-0 mb-3 overflow-slot border-0 rounded-3 ${slotData?.data?.some((court) => {
                const filteredSlots = court?.slots?.filter((slot) => {
                  const isBookedFor30Min = slot?.status === "booked" && slot?.duration === 30 && slot?.bookingTime;
                  const isBookedFor60Min = slot?.status === "booked" && slot?.duration === 60;

                  const basicFilter =
                    showUnavailable ||
                    (slot?.availabilityStatus === "available" &&
                      !isBookedFor60Min &&
                      !isPastTime(slot?.time)) || isBookedFor30Min;

                  // Filter by selected duration and check if price exists
                  const hasPrice = getPriceForSlot(slot.time, selectedDate?.day, true) !== null;

                  return basicFilter && hasPrice;
                });
                return filteredSlots?.length > 0;
              })
                ? "border"
                : "border-0"
                }`}
            >
              {(slotLoading || clubLoading || slotPriceLoading) && !slotData?.data?.length ? (
                <DataLoading height={"36vh"} />
              ) : slotData?.data?.length > 0 ? (
                (slotLoading || clubLoading || slotPriceLoading) ? (
                  <DataLoading height={"36vh"} />
                ) : (
                  <>
                    <div className=" p-0   ">
                      {slotData?.data?.length > 0 &&
                        slotData?.data?.some(
                          (court) => court?.slots?.some((slot) => {
                            const isBookedFor30Min = slot?.status === "booked" && slot?.duration === 30 && slot?.bookingTime;
                            const isBookedFor60Min = slot?.status === "booked" && slot?.duration === 60;

                            const basicFilter = showUnavailable
                              ? true
                              : (slot?.availabilityStatus === "available" &&
                                !isBookedFor60Min &&
                                !isPastTime(slot?.time)) || isBookedFor30Min;
                            const hasPrice = getPriceForSlot(slot.time, selectedDate?.day, true) !== null;
                            return basicFilter && hasPrice;
                          })
                        ) && (
                          <div className="row mb-md-2 mb-0">
                            <div className="col-3 d-md-block d-none">
                              <h6 className="all-matches text-start">Courts</h6>
                            </div>
                            <div className="col-md-9 col-12">
                              <h6 className="all-matches text-center mb-0 me-2 me-md-0">
                                Available Slots
                              </h6>
                            </div>
                          </div>
                        )}

                      <div
                        style={{
                          overflowY: "auto",
                          overflowX: "hidden",
                          paddingRight: "8px",
                          msOverflowStyle: "none",
                          scrollbarWidth: "none",
                        }}
                        className="hide-scrollbar mention_height_court"
                      >
                        <style>{`
                            .hide-scrollbar::-webkit-scrollbar {
                              display: none; /* Safari and Chrome */
                            }
                            .hide-scrollbar {
                              -ms-overflow-style: none; /* IE and Edge */
                              scrollbar-width: none; /* Firefox */
                            }
                          `}</style>
                        {console.log(slotData, 'slotData')}
                        {slotData?.data?.map((court, courtIndex) => {
                          const filteredSlots = court?.slots?.filter((slot) => {
                            // Check if slot is booked for 30 minutes - these should still show
                            const isBookedFor30Min = slot?.status === "booked" && slot?.duration === 30 && slot?.bookingTime;
                            // Check if slot is booked for 60 minutes - these should NOT show in available
                            const isBookedFor60Min = slot?.status === "booked" && slot?.duration === 60;

                            const basicFilter = showUnavailable
                              ? true
                              : (slot?.availabilityStatus === "available" &&
                                !isBookedFor60Min &&
                                !isPastTime(slot?.time)) || isBookedFor30Min; // Include 30min booked slots, exclude 60min booked slots

                            const hasPrice = getPriceForSlot(slot.time, selectedDate?.day, true) !== null;

                            return basicFilter && hasPrice;
                          });
                          console.log({ filteredSlots });

                          if (filteredSlots?.length === 0) return null;

                          return (
                            <div
                              key={court?._id}
                              className="row mb-md-3 mb-0 align-items-start pb-3 pb-md-0 border_bottom_line mt-2 mt-md-0"
                            >
                              <div className="col-md-3 col-12 border-end mb-0 mb-md-0 d-flex d-md-block align-items-center justify-content-start ">
                                <div
                                  className="court-item p-1 ps-0 ps-md-1 text-center text-lg-start h-100 d-flex d-md-block align-items-center justify-content-center"
                                  style={{ minHeight: "50px" }}
                                >
                                  <div
                                    className="mb-md-1 mb-0"
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "500",
                                      fontFamily: "Poppins",
                                    }}
                                  >
                                    {court?.courtName}
                                  </div>
                                  <p
                                    className="text-muted mb-0 ms-1 ms-md-0"
                                    style={{
                                      fontFamily: "Poppins",
                                      fontWeight: "400",
                                      fontSize: "10px",
                                    }}
                                  >
                                    ({court?.register_club_id?.courtType})
                                  </p>
                                </div>
                              </div>
                              <div className="col-md-9 col-12">
                                <div className="row g-1">
                                  {filteredSlots?.map((slot) => {
                                    const dateKey = selectedDate?.fullDate;
                                    const courtId = court?._id;
                                    const leftKey = `${courtId}-${slot?._id}-${dateKey}-left`;
                                    const rightKey = `${courtId}-${slot?._id}-${dateKey}-right`;
                                    const leftHalf = halfSelectedSlots.has(leftKey);
                                    const rightHalf = halfSelectedSlots.has(rightKey);
                                    const hasThirtyMinPrice = slot?.has30MinPrice === true;
                                    
                                    // ✅ PEHLE declare karo, phir use karo
                                    const currentCourtTimes = selectedTimes[courtId]?.[dateKey] || [];
                                    const isSlotSelected = currentCourtTimes.some(t => t._id === slot._id);
                                    
                                    const currentTotalSlots = Object.values(selectedTimes).reduce((total, courtDates) => {
                                      return total + Object.values(courtDates).reduce((dateTotal, timeSlots) => {
                                        return dateTotal + timeSlots?.length;
                                      }, 0);
                                    }, 0);
                                    
                                    const isSlotDisabled =
                                      (slot?.status === "booked" && slot?.duration === 60) ||
                                      slot?.availabilityStatus !== "available" ||
                                      isPastTime(slot?.time) ||
                                      (currentTotalSlots >= MAX_SLOTS && !isSlotSelected && !leftHalf && !rightHalf);

                                    // Hide only if slot is naturally unavailable and showUnavailable is off
                                    // Don't hide slots that are disabled due to 15-slot limit
                                    const shouldHideSlot = !showUnavailable && (
                                      (slot?.status === "booked" && slot?.duration === 60) ||
                                      slot?.availabilityStatus !== "available" ||
                                      isPastTime(slot?.time)
                                    );
                                    
                                    if (shouldHideSlot) {
                                      return null;
                                    }

                                    const bookingTime = slot?.bookingTime?.trim();
                                    const isLeftBooked = bookingTime && (/:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime));
                                    const isRightBooked = bookingTime && /:30\s*(AM|PM)?$/i.test(bookingTime);

                                    // Check if slot is already booked for 30 minutes
                                    const isSlotBookedFor30Min = slot?.duration === 30 && bookingTime;
                                    const shouldDisableLeftClick = isSlotBookedFor30Min && isLeftBooked; // 8:00 booked, disable left
                                    const shouldDisableRightClick = isSlotBookedFor30Min && isRightBooked; // 8:30 booked, disable right

                                    const price = getPriceForSlot(slot.time, selectedDate?.day, hasThirtyMinPrice);
                                    if (price === null) {
                                      return null;
                                    };

                                    // Background: selected if full selected OR any half selected
                                    const getBackground = () => {
                                      if (!hasThirtyMinPrice) {
                                        return isSlotSelected
                                          ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"
                                          : "#FFFFFF";
                                      }

                                      // hasThirtyMinPrice = true
                                      if (leftHalf && rightHalf) {
                                        return "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"; // Full blue when both selected
                                      }

                                      // Handle booked slots with grey background for disabled side
                                      if (isSlotBookedFor30Min) {
                                        if (shouldDisableLeftClick) {
                                          // Left side is booked (8:00), show grey on left, blue/white on right based on selection
                                          return rightHalf ? "linear-gradient(to right, #9ca3af 50%, #0034E4 50%)" : "linear-gradient(to right, #9ca3af 50%, #FFFFFF 50%)";
                                        }
                                        if (shouldDisableRightClick) {
                                          // Right side is booked (8:30), show blue/white on left based on selection, grey on right
                                          return leftHalf ? "linear-gradient(to right, #0034E4 50%, #9ca3af 50%)" : "linear-gradient(to right, #FFFFFF 50%, #9ca3af 50%)";
                                        }
                                      }

                                      if (leftHalf) {
                                        return "linear-gradient(to right, #0034E4 50%, #FFFFFF 50%)"; // Left blue, right white
                                      }
                                      if (rightHalf) {
                                        return "linear-gradient(to right, #FFFFFF 50%, #0034E4 50%)"; // Left white, right blue
                                      }
                                      return "#FFFFFF"; // No selection
                                    };

                                    const isAnyHalfSelected = leftHalf || rightHalf;
                                    const isFullySelected = !hasThirtyMinPrice ? isSlotSelected : (leftHalf && rightHalf);
                                    const textColor = isFullySelected || (hasThirtyMinPrice && isAnyHalfSelected) ? "white" : "#000000";
                                    const priceColor = isFullySelected || (hasThirtyMinPrice && isAnyHalfSelected) ? "white" : "#6b7280";

                                    // CLICK HANDLER - MAIN LOGIC CHANGE
                                    const handleClick = (e) => {
                                      if (isSlotDisabled) return;

                                      if (slot?.has30MinPrice) {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const clickSide = (e.clientX - rect.left) < rect.width / 2 ? "left" : "right";

                                        // Check if this side is disabled due to existing booking
                                        if ((clickSide === "left" && shouldDisableLeftClick) ||
                                          (clickSide === "right" && shouldDisableRightClick)) {
                                          return; // Don't allow click on disabled side
                                        }

                                        toggleTime(slot, courtId, dateKey, clickSide);
                                      } else {
                                        toggleTime(slot, courtId, dateKey);
                                      }
                                    };

                                    return (
                                      <div key={slot?._id} className="col-3 col-sm-3 col-md-3 col-lg-2 mb-2">
                                        <button
                                          className="btn rounded-2 w-100 text-nowrap slot-time-btn position-relative overflow-hidden"
                                          disabled={isSlotDisabled}
                                          onClick={handleClick}
                                          style={{
                                            background: getBackground(),
                                            cursor: isSlotDisabled ? "not-allowed" : "pointer",
                                            opacity: isSlotDisabled ? 0.6 : 1,
                                            border: "1px solid #dee2e6",
                                            borderRadius: "12px",
                                            height: "68px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            position: "relative"
                                          }}
                                        >
                                          {/* Text display logic */}
                                          {hasThirtyMinPrice && (leftHalf || rightHalf) ? (
                                            leftHalf && rightHalf ? (
                                              /* Both halves selected - show normal white text */
                                              <>
                                                <span style={{ fontWeight: 600, fontSize: "14px", color: "white" }}>
                                                  {formatTimeForDisplay(slot?.time)}
                                                </span>
                                                <span style={{ fontSize: "12px", color: "white" }}>
                                                  ₹{price}
                                                </span>
                                              </>
                                            ) : (
                                              /* Only one half selected - show gradient text */
                                              <>
                                                <span
                                                  style={{
                                                    fontWeight: 600,
                                                    fontSize: "14px",
                                                    background: leftHalf
                                                      ? "linear-gradient(to right, white 50%, #111827 50%)"
                                                      : "linear-gradient(to right, #111827 50%, white 50%)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                    backgroundClip: "text"
                                                  }}
                                                >
                                                  {formatTimeForDisplay(slot?.time)}
                                                </span>
                                                <span
                                                  style={{
                                                    fontSize: "12px",
                                                    background: leftHalf
                                                      ? "linear-gradient(to right, white 50%, #6b7280 50%)"
                                                      : "linear-gradient(to right, #6b7280 50%, white 50%)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                    backgroundClip: "text"
                                                  }}
                                                >
                                                  ₹{price}
                                                </span>
                                              </>
                                            )
                                          ) : (
                                            /* Normal full slot display */
                                            <>
                                              <span style={{ fontWeight: 600, fontSize: "14px", color: textColor }}>
                                                {formatTimeForDisplay(slot?.time)}
                                              </span>
                                              <span style={{ fontSize: "12px", color: priceColor }}>
                                                ₹{price}
                                              </span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {slotData?.data.every((court) => {
                      const hasAvailableSlotsWithPrice = court?.slots?.some((slot) => {
                        const basicFilter =
                          showUnavailable ||
                          (slot?.availabilityStatus === "available" &&
                            slot?.status !== "booked" &&
                            !isPastTime(slot?.time));

                        const hasPrice = getPriceForSlot(slot.time, selectedDate?.day, true) !== null;
                        const tabKey = duration[activeTab]?.key;
                        return basicFilter && filterSlotsByTab(slot, tabKey) && hasPrice;
                      });
                      return !hasAvailableSlotsWithPrice;
                    }) && (
                        <div
                          className="text-center py-4"
                          style={{ fontFamily: "Poppins", fontWeight: "500" }}
                        >
                          {selectedDate?.fullDate === new Date().toISOString().split("T")[0] ? (
                            <div className="text-danger">
                              No slots available for this date. Please select another date
                            </div>
                          ) : (
                            <div className="text-muted">
                              No available slots for this date
                            </div>
                          )}
                        </div>
                      )}
                  </>
                )
              ) : (
                !slotLoading && !clubLoading && !slotPriceLoading && (
                  <div
                    className="text-center py-4 text-danger"
                    style={{ fontFamily: "Poppins", fontWeight: "500" }}
                  >
                    No courts available
                  </div>
                )
              )}
            </div>

          </div>
          <BookingSummary
            totalSlots={displayedSlotCount}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            clubData={clubData}
            logo={logo}
            selectedCourts={selectedCourts}
            handleDeleteSlot={handleDeleteSlot}
            handleClearAll={handleClearAll}
            grandTotal={grandTotal}
            errorShow={errorShow}
            errorMessage={errorMessage}
            buttonConfig={buttonConfig}
            className={className}
            handleBookNow={handleBookNow}
            displayedSlotCount={displayedSlotCount}
            duration={selectedDuration}
            halfSelectedSlots={halfSelectedSlots}
          />

        </div>
      </div>
      <TokenExpire isTokenExpired={expireModal} />
    </>
  );
};

export default Booking;


