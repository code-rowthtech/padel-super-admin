import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getOwnerFromSession } from "../../../../helpers/api/apiCore";
import { showError, showInfo } from "../../../../helpers/Toast";
import { getPriceForSlot, parseTimeToHalfHour, parseTimeToHour } from "../../../../utils/formatters";
import { adminCheckBooking, adminRemoveBookedBooking } from "../../../../redux/thunks";
import { dateOnlyToLocalDate, getInitialISTDate } from "../../../../utils/dateUtils";
import { createEnhancedToggleTime } from "./EnhancedToggleTime";

export const isPastTime = (timeStr, selectedDate) => {
  if (!timeStr) return false;
  const selectedDateObj = dateOnlyToLocalDate(selectedDate);
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
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return hours > 16 || (hours === 16 && minutes >= 15);
};

export const formatTimeForDisplay = (time) => {
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

export const groupConsecutiveSlots = (courtTimes, courtId, dateKey, halfSelectedSlots) => {
  if (!courtTimes || courtTimes?.length === 0) return [];

  const sortedSlots = [...courtTimes].sort((a, b) => {
    const hourA = parseTimeToHour(a.time);
    const hourB = parseTimeToHour(b.time);
    return hourA - hourB;
  });

  const groups = [];
  let currentGroup = [sortedSlots[0]];

  for (let i = 1; i < sortedSlots?.length; i++) {
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

export const formatTimeRange = (group, halfSelectedSlots, courtId, dateKey) => {
  if (group?.length === 1) {
    const slot = group[0];
    const leftKey = `${courtId}-${slot._id}-${dateKey}-left`;
    const rightKey = `${courtId}-${slot._id}-${dateKey}-right`;
    const hasLeft = halfSelectedSlots?.has(leftKey);
    const hasRight = halfSelectedSlots?.has(rightKey);

    const hour = parseTimeToHour(slot.time);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

    if (hasLeft && !hasRight) {
      return `${displayHour}:00 ${period} – ${displayHour}:30 ${period}`;
    } else if (!hasLeft && hasRight) {
      const nextHour = hour + 1;
      const nextPeriod = nextHour >= 12 ? 'PM' : 'AM';
      const displayNextHour = nextHour > 12 ? nextHour - 12 : nextHour === 0 ? 12 : nextHour;
      return `${displayHour}:30 ${period} – ${displayNextHour}:00 ${nextPeriod}`;
    } else {
      const nextHour = hour + 1;
      const nextPeriod = nextHour >= 12 ? 'PM' : 'AM';
      const displayNextHour = nextHour > 12 ? nextHour - 12 : nextHour === 0 ? 12 : nextHour;
      return `${displayHour}:00 ${period} – ${displayNextHour}:00 ${nextPeriod}`;
    }
  }

  const startSlot = group[0];
  const endSlot = group[group?.length - 1];
  const startHour = parseTimeToHour(startSlot.time);
  const endHour = parseTimeToHour(endSlot.time);

  const startPeriod = startHour >= 12 ? 'PM' : 'AM';
  const displayStartHour = startHour > 12 ? startHour - 12 : startHour === 0 ? 12 : startHour;

  const actualEndHour = endHour + 1;
  const endPeriod = actualEndHour >= 12 ? 'PM' : 'AM';
  const displayEndHour = actualEndHour > 12 ? actualEndHour - 12 : actualEndHour === 0 ? 12 : actualEndHour;

  return `${displayStartHour}:00 ${startPeriod} – ${displayEndHour}:00 ${endPeriod}`;
};

const MAX_SLOTS = 3;
const MAX_HALF_SLOTS = 6;

// ==================== HELPER FUNCTIONS FROM BOOKING.JS ====================
const timeToMinutes = (timeStr) => {
  if (!timeStr) return null;

  const cleaned = timeStr.toString().toLowerCase().trim();
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2] || "0", 10);
  const period = match[3];

  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  return hour * 60 + minute;
};

const cleanupIsolatedHalves = (times, halfSelectedSlots, courtId, dateKey) => {
  // Only remove truly isolated halves that have NO neighbors on either side
  const cleanedTimes = [...times];
  const blockSet = new Set();
  const blockMap = new Map();

  cleanedTimes.forEach(t => {
    const timeMin = timeToMinutes(t.time);
    if (timeMin !== null) {
      if (t.side === "both") {
        blockSet.add(timeMin);
        blockSet.add(timeMin + 30);
        blockMap.set(timeMin, t._id);
        blockMap.set(timeMin + 30, t._id);
      } else if (t.side === "left") {
        blockSet.add(timeMin);
        blockMap.set(timeMin, t._id);
      } else if (t.side === "right") {
        blockSet.add(timeMin + 30);
        blockMap.set(timeMin + 30, t._id);
      }
    }
  });

  const toRemove = [];
  cleanedTimes.forEach(t => {
    if (t.side === "left" || t.side === "right") {
      const timeMin = timeToMinutes(t.time);
      if (timeMin !== null) {
        const blockVal = t.side === "left" ? timeMin : timeMin + 30;
        const leftNeighbor = blockVal - 30;
        const rightNeighbor = blockVal + 30;

        // Check if this half has ANY neighbor (from same or different slot)
        const hasLeftNeighbor = blockSet.has(leftNeighbor);
        const hasRightNeighbor = blockSet.has(rightNeighbor);

        // Only remove if COMPLETELY isolated (no neighbors on either side)
        if (!hasLeftNeighbor && !hasRightNeighbor) {
          toRemove.push(t._id);
        }
      }
    }
  });

  return cleanedTimes.filter(t => !toRemove.includes(t._id));
};

export const useCreateMatchesLogic = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const store = useSelector((state) => state);
  const getToken = getOwnerFromSession();
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);
  const dateRefs = useRef({});
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [errorShow, setErrorShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState(location?.state?.paymentError || "");
  const [halfSelectedSlots, setHalfSelectedSlots] = useState(new Set());
  const [activeHalves, setActiveHalves] = useState(new Map());
  const [showHalfSlots, setShowHalfSlots] = useState(false);
  const slotPrice = useSelector((state) => state?.manualBooking?.slotPriceData?.data || []);
  const has30MinPrices = useSelector((state) => state?.manualBooking?.slotPriceData?.metadata?.has30MinPrices);
  const { slotData } = useSelector((state) => state?.manualBooking);
  const slotLoading = useSelector((state) => state?.manualBooking?.slotLoading);
  const questionList = useSelector((state) => state?.userNotificationData?.getQuestionData?.data) || [];
  const getPlayerLevels = useSelector((state) => state?.userNotificationData?.getPlayerLevel?.data) || [];
  const getPlayerLevelsLoading = useSelector((state) => state?.userNotificationData?.getPlayerLevelLoading) || [];
  const scrollRef = useRef(null);
  const selectedDuration = React.useMemo(() => {
    if (!has30MinPrices) {
      return 60;
    }

    if (halfSelectedSlots.size > 0) {
      const slotGroups = new Map();
      halfSelectedSlots.forEach(key => {
        const parts = key.split('-');
        const courtId = parts[0];
        const slotId = parts[1];
        const side = parts[parts.length - 1];
        const date = parts.slice(2, parts.length - 1).join('-');
        const groupKey = `${courtId}-${slotId}-${date}`;
        if (!slotGroups.has(groupKey)) {
          slotGroups.set(groupKey, { left: false, right: false });
        }
        const group = slotGroups.get(groupKey);
        if (side === 'left') group.left = true;
        if (side === 'right') group.right = true;
      });

      const allCompletePairs = Array.from(slotGroups.values()).every(group => group.left && group.right);

      return allCompletePairs ? 60 : 30;
    }

    if (selectedCourts?.length > 0) {
      const has90 = selectedCourts.some(court =>
        court.time?.some(t => t.duration === 90)
      );
      if (has90) return 90;
      return 60;
    }

    return 60;
  }, [halfSelectedSlots, selectedCourts, has30MinPrices]);
  const [isRestoredFromLocalStorage, setIsRestoredFromLocalStorage] = useState(false);
  const [showUnavailable, setShowUnavailable] = useState(true);
  const [currentCourtId, setCurrentCourtId] = useState(null);
  const [dynamicSteps, setDynamicSteps] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState(location?.state?.finalSkillDetails || {});
  const [slotError, setSlotError] = useState("");
  const [selectedBuisness, setSelectedBuisness] = useState([]);
  const [key, setKey] = useState("morning");
  const [matchPlayer, setMatchPlayer] = useState(false);
  const [isFinalLevelStepLoaded, setIsFinalLevelStepLoaded] = useState(false);
  const [finalLevelStep, setFinalLevelStep] = useState(null);
  const [addedPlayers, setAddedPlayers] = useState(() => {
    if (location?.state?.addedPlayers) {
      return location.state.addedPlayers;
    }
    const saved = localStorage.getItem("addedPlayers");
    return saved ? JSON.parse(saved) : {};
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [existsOpenMatchData, setExistsOpenMatchData] = useState(false);
  const [userGender, setUserGender] = useState(location?.state?.selectedGender || "");
  const [profileLoading, setProfileLoading] = useState(true);

  const getPriceForSlotWrapper = (slotTime, day = selectedDate?.day, isHalfSlot = false, courtId = null, duration = 60) => {
    const price = getPriceForSlot(slotTime, day, isHalfSlot, slotPrice, courtId, duration);
    return price;
  };

  useLayoutEffect(() => {
    const savedDate = localStorage.getItem('createMatches_selectedDate');
    const savedDay = localStorage.getItem('createMatches_selectedDay');

    if (savedDate && savedDay) {
      setSelectedDate({ fullDate: savedDate, day: savedDay });
      setStartDate(dateOnlyToLocalDate(savedDate));
    } else {
      const defaultDate = location?.state?.selectedDate || getInitialISTDate();
      setSelectedDate(defaultDate);
      setStartDate(location?.state?.selectedDate ? dateOnlyToLocalDate(location.state.selectedDate.fullDate) : dateOnlyToLocalDate(defaultDate.fullDate));
    }
  }, []);

  useLayoutEffect(() => {
    if (!slotData?.data || !selectedDate?.fullDate || isRestoredFromLocalStorage) return;

    const dateKey = selectedDate.fullDate;
    const savedSelectedTimes = localStorage.getItem(`createMatches_selectedTimes_${dateKey}`);
    const savedHalfSelectedSlots = localStorage.getItem(`createMatches_halfSelectedSlots_${dateKey}`);
    const savedSelectedCourts = localStorage.getItem(`createMatches_selectedCourts_${dateKey}`);
    const savedSelectedBusiness = localStorage.getItem(`createMatches_selectedBusiness_${dateKey}`);
    let parsedTimes = null;
    let parsedHalfSlots = null;
    let parsedCourts = null;
    let parsedBusiness = null;

    if (savedSelectedTimes) {
      try {
        parsedTimes = JSON.parse(savedSelectedTimes);
      } catch (e) {
        console.error('Failed to parse CreateMatches selectedTimes');
      }
    }

    if (savedHalfSelectedSlots) {
      try {
        parsedHalfSlots = new Set(JSON.parse(savedHalfSelectedSlots));
      } catch (e) {
        console.error('Failed to parse CreateMatches halfSelectedSlots');
      }
    }

    if (savedSelectedCourts) {
      try {
        parsedCourts = JSON.parse(savedSelectedCourts);
      } catch (e) {
        console.error('Failed to parse CreateMatches selectedCourts');
      }
    }

    if (savedSelectedBusiness) {
      try {
        parsedBusiness = JSON.parse(savedSelectedBusiness);
      } catch (e) {
        console.error('Failed to parse CreateMatches selectedBusiness');
      }
    }

    setHalfSelectedSlots(parsedHalfSlots || new Set());
    setSelectedTimes(parsedTimes || {});
    setSelectedCourts(parsedCourts || []);
    setSelectedBuisness(parsedBusiness || []);
    setIsRestoredFromLocalStorage(true);
  }, [slotData?.data, selectedDate?.fullDate]);

  const lockedSlotsRef = useRef(new Map());

  useEffect(() => {
    if (!halfSelectedSlots?.size || !slotData?.data) return;

    const dateKeyStr = selectedDate?.fullDate;

    const halfSlotsByHour = new Map();

    // सभी half slots को hour-wise group करो
    Array.from(halfSelectedSlots).forEach(key => {
      const parts = key.split('-');
      const side = parts.pop();
      const slotId = parts.pop();
      const courtId = parts.join('-');

      const court = slotData.data.find(c => c._id === courtId);
      const slot = court?.slots?.find(s => s._id === slotId);

      if (slot) {
        const hour = parseTimeToHour(slot.time);
        const key = `${courtId}-${hour}`;
        if (!halfSlotsByHour.has(key)) {
          halfSlotsByHour.set(key, { left: null, right: null, courtId, hour });
        }
        const data = halfSlotsByHour.get(key);
        if (side === 'left') data.left = { slot, slotId, courtId };
        if (side === 'right') data.right = { slot, slotId, courtId };
      }
    });

    // अब merge candidates ढूंढो
    const merges = [];
    for (const [_, data] of halfSlotsByHour) {
      if (data.left && !data.right) {
        const nextKey = `${data.courtId}-${data.hour + 1}`;
        const next = halfSlotsByHour.get(nextKey);
        if (next?.right && !next.left) {
          merges.push({ left: data.left, right: next.right });
        }
      }
    }

    if (merges.length === 0) return;

    setSelectedCourts(prevCourts => {
      const newCourts = JSON.parse(JSON.stringify(prevCourts)); // deep copy to avoid mutation

      merges.forEach(({ left, right }) => {
        const courtId = left.courtId;
        const currentSlot = left.slot;
        const adjacentSlot = right.slot;

        // सही amount कैलकुलेट
        const price1 = getPriceForSlotWrapper(currentSlot.time, selectedDate?.day, false, courtId, currentSlot.duration || 60) || 0;
        const price2 = getPriceForSlotWrapper(adjacentSlot.time, selectedDate?.day, false, courtId, adjacentSlot.duration || 60) || 0;
        const mergedAmount = price1 + price2;

        if (mergedAmount <= 0) {
          console.warn("Merged amount is 0 or null", { price1, price2 });
        }

        const currentFull = {
          _id: currentSlot._id,
          time: currentSlot.time,
          amount: mergedAmount,
          duration: (currentSlot.duration || 60) + (adjacentSlot.duration || 60),
          side: "both",
          isHalfSlot: false
        };

        const adjacentFull = {
          _id: adjacentSlot._id,
          time: adjacentSlot.time,
          amount: mergedAmount,
          duration: (currentSlot.duration || 60) + (adjacentSlot.duration || 60),
          side: "both",
          isHalfSlot: false
        };

        const courtIdx = newCourts.findIndex(c => c._id === courtId);
        if (courtIdx === -1) {
          const courtInfo = slotData.data.find(c => c._id === courtId);
          newCourts.push({
            _id: courtId,
            courtName: courtInfo?.courtName || "Unknown",
            type: courtInfo?.type,
            date: dateKeyStr,
            day: selectedDate?.day,
            time: [currentFull, adjacentFull]
          });
        } else {
          const court = newCourts[courtIdx];
          // पुरानी half entries हटाओ (exact match से)
          court.time = court.time.filter(t =>
            !(t._id === currentSlot._id) &&
            !(t._id === adjacentSlot._id)
          );
          court.time.push(currentFull);
          court.time.push(adjacentFull);
        }

      });

      return newCourts;
    });

    // half keys साफ करो
    setHalfSelectedSlots(prev => {
      const clean = new Set(prev);
      merges.forEach(m => {
        const cid = m.left.courtId;
        clean.delete(`${cid}-${m.left.slotId}-${dateKeyStr}-left`);
        clean.delete(`${cid}-${m.left.slotId}-${dateKeyStr}-right`);
        clean.delete(`${cid}-${m.right.slotId}-${dateKeyStr}-left`);
        clean.delete(`${cid}-${m.right.slotId}-${dateKeyStr}-right`);
      });
      return clean;
    });
  }, [halfSelectedSlots, slotData?.data, selectedDate?.fullDate, selectedDate?.day, getPriceForSlotWrapper]);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const slotsToUnlock = Array.from(lockedSlotsRef.current.values());
      slotsToUnlock.forEach(slot => {
        dispatch(adminRemoveBookedBooking(slot));
      });
      lockedSlotsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!halfSelectedSlots || halfSelectedSlots.size === 0) {
      setShowHalfSlots(false);
    }
  }, [halfSelectedSlots]);

  useEffect(() => {
    if (selectedDate?.fullDate) {
      localStorage.setItem('createMatches_selectedDate', selectedDate.fullDate);
      localStorage.setItem('createMatches_selectedDay', selectedDate.day);

      // Save current state to localStorage with data cleanup
      const dateKey = selectedDate.fullDate;
      localStorage.setItem(`createMatches_selectedTimes_${dateKey}`, JSON.stringify(selectedTimes));
      localStorage.setItem(`createMatches_halfSelectedSlots_${dateKey}`, JSON.stringify(Array.from(halfSelectedSlots)));
      localStorage.setItem(`createMatches_selectedCourts_${dateKey}`, JSON.stringify(selectedCourts));
      localStorage.setItem(`createMatches_selectedBusiness_${dateKey}`, JSON.stringify(selectedBuisness));
    }
  }, [selectedDate, selectedTimes, halfSelectedSlots, selectedCourts, selectedBuisness]);


  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };
  const updateSelectedBusinessAndCourts = (times, courtId, dateKey) => {
    let allTimes = [...times];

    const court = slotData?.data?.find(c => c?._id === courtId);

    if (court) {
      const sortedSlots = [...(court?.slots || [])].sort((a, b) => {
        const minutesA = timeToMinutes(a.time);
        const minutesB = timeToMinutes(b.time);
        return minutesA - minutesB;
      });

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

        const slotHour = parseTimeToHour(nextSlot.time);
        let period = "morning";
        if (slotHour >= 17) period = "evening";
        else if (slotHour >= 12) period = "afternoon";

        let apiPrice = slotPrice.find(
          p =>
            p.day === selectedDate?.day &&
            p.duration === 30 &&
            p.timePeriod === period
        )?.price;

        if (!apiPrice) {
          apiPrice = slotPrice.find(
            p =>
              p.day === selectedDate?.day &&
              p.duration === 60 &&
              p.timePeriod === period
          )?.price;
        }

        allTimes.push({
          ...nextSlot,
          _id: `${nextSlot._id}-${side}`,
          originalId: nextSlot._id,
          time: displayTime,
          side,
          amount: (apiPrice || 0) / 2
        });
      });
    }

    const normalizeAmount = (time, side, duration) => {
      const slotHour = parseTimeToHour(time);
      let period = "morning";
      if (slotHour >= 17) period = "evening";
      else if (slotHour >= 12) period = "afternoon";

      // For 90-min slots, look up 90-min price first
      if (duration === 90) {
        const ninetyPrice = slotPrice.find(
          p => p.day === selectedDate?.day && p.duration === 90 && p.timePeriod === period
        )?.price;
        if (ninetyPrice) return Number(ninetyPrice);
      }

      let apiPrice = slotPrice.find(
        p =>
          p.day === selectedDate?.day &&
          p.duration === 30 &&
          p.timePeriod === period
      )?.price;

      if (!apiPrice) {
        apiPrice = slotPrice.find(
          p =>
            p.day === selectedDate?.day &&
            p.duration === 60 &&
            p.timePeriod === period
        )?.price;
      }

      if (!apiPrice) {
        apiPrice = slotPrice.find(
          p =>
            p.day === selectedDate?.day &&
            p.timePeriod === period
        )?.price;
      }

      if (!apiPrice) {
        console.error('normalizeAmount: No price found for', { time, side, period, day: selectedDate?.day });
        return 0;
      }

      if (side === "left" || side === "right") {
        return Number(apiPrice) / 2;
      }

      return Number(apiPrice);
    };

    const finalTimes = allTimes.map(t => {
      let amount = t.amount;

      if (amount === null || amount === undefined || amount === 0) {
        amount = normalizeAmount(t.time, t.side, t.duration);
      }

      return {
        ...t,
        date: dateKey,
        amount: Number(amount)
      };
    });

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
        amount: Number(t.amount),
        duration: t.duration,
        selectedDuration: t.selectedDuration,
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
          type: currentCourt.type,
          date: dateKey,
          day: selectedDate?.day,
          slotDuration: currentCourt.slotDuration || 60,
          time: timeEntries
        }
      ];
    });
  };

  const getAllSelectedSlots = () => {
    const allSlots = [];

    Object.entries(selectedTimes).forEach(([cId, courtDates]) => {
      const allTimes = Array.isArray(courtDates)
        ? courtDates
        : Object.values(courtDates || {}).flat();
      allTimes.forEach(t => {
        const hour = parseTimeToHour(t.time);
        if (hour !== null) {
          allSlots.push({ hour, courtId: cId, slotId: t._id, time: t.time });
        }
      });
    });

    halfSelectedSlots.forEach(key => {
      const [cId, slotId] = key.split('-');
      const court = slotData?.data?.find(c => c._id === cId);
      const slot = court?.slots?.find(s => s._id === slotId);
      if (slot) {
        const hour = parseTimeToHour(slot.time);
        if (hour !== null && !allSlots.some(s => s.hour === hour)) {
          allSlots.push({ hour, courtId: cId, slotId: slot._id, time: slot.time });
        }
      }
    });

    return allSlots.sort((a, b) => a.hour - b.hour);
  };

  const isTimeSelectedInOtherCourt = (hour, excludedCourtId) => {
    return Object.entries(selectedTimes).some(([cId, times]) => {
      return times.some(t => parseTimeToHour(t.time) === hour);
    }) || Array.from(halfSelectedSlots).some(key => {
      const [cId] = key.split('-');
      const slotId = key.split('-')[1];
      const slot = slotData?.data
        ?.find(c => c._id === cId)
        ?.slots?.find(s => s._id === slotId);
      return slot && parseTimeToHour(slot.time) === hour;
    });
  };

  // Enhanced toggle time with sophisticated 30 & 60 min combined logic
  const enhancedToggleTime = React.useMemo(() => {
    return createEnhancedToggleTime(
      selectedTimes,
      halfSelectedSlots,
      slotData,
      selectedDate,
      setHalfSelectedSlots,
      setSelectedTimes,
      setSelectedBuisness,
      setSelectedCourts,
      getPriceForSlotWrapper,
      updateSelectedBusinessAndCourts,
      showError,
      setShowHalfSlots,
      has30MinPrices,
      parseTimeToHour,
      parseTimeToHalfHour
    );
  }, [selectedTimes, halfSelectedSlots, slotData, selectedDate, has30MinPrices]);

  const toggleTime = (time, courtId, dateKey, clickSide = null, otherSideBooked = false) => {
    // Use enhanced toggle time for all cases (matches Booking.js logic)
    return enhancedToggleTime(time, courtId, dateKey, clickSide, otherSideBooked);
  };
  const grandTotal = React.useMemo(() => {
    let total = 0;
    selectedCourts.forEach(court => {
      (court.time || []).forEach(slot => {
        total += slot.amount || 0;
      });
    });
    return total;
  }, [selectedCourts]);

  return {
    selectedDate,
    setSelectedDate,
    startDate,
    setStartDate,
    isOpen,
    setIsOpen,
    showDropdown,
    setShowDropdown,
    wrapperRef,
    dateRefs,
    currentStep,
    setCurrentStep,
    selectedCourts,
    setSelectedCourts,
    selectedTimes,
    setSelectedTimes,
    errorShow,
    setErrorShow,
    errorMessage,
    setErrorMessage,
    selectedDuration,
    halfSelectedSlots,
    setHalfSelectedSlots,
    activeHalves,
    setActiveHalves,
    showHalfSlots,
    setShowHalfSlots,
    isRestoredFromLocalStorage,
    setIsRestoredFromLocalStorage,
    showUnavailable,
    setShowUnavailable,
    currentCourtId,
    setCurrentCourtId,
    dynamicSteps,
    setDynamicSteps,
    selectedAnswers,
    setSelectedAnswers,
    slotError,
    setSlotError,
    selectedBuisness,
    setSelectedBuisness,
    key,
    setKey,
    matchPlayer,
    setMatchPlayer,
    isFinalLevelStepLoaded,
    setIsFinalLevelStepLoaded,
    finalLevelStep,
    setFinalLevelStep,
    addedPlayers,
    setAddedPlayers,
    isExpanded,
    setIsExpanded,
    showMobileModal,
    setShowMobileModal,
    existsOpenMatchData,
    setExistsOpenMatchData,
    userGender,
    setUserGender,
    profileLoading,
    setProfileLoading,
    scrollRef,
    slotPrice,
    slotData,
    slotLoading,
    questionList,
    getPlayerLevels,
    getPlayerLevelsLoading,
    getPriceForSlotWrapper,
    handleClickOutside,
    updateSelectedBusinessAndCourts,
    getAllSelectedSlots,
    toggleTime,
    grandTotal,
    MAX_SLOTS,
    MAX_HALF_SLOTS,
    has30MinPrices,
    dispatch,
    navigate,
    store,
    getToken,
    location,
  };
};
