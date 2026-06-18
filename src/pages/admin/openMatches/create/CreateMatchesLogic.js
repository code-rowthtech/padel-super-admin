import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getOwnerFromSession } from "../../../../helpers/api/apiCore";
import { showError, showInfo } from "../../../../helpers/Toast";
import { getPriceForSlot, parseTimeToHalfHour, parseTimeToHour } from "../../../../utils/formatters";
import { adminCheckBooking, adminRemoveBookedBooking } from "../../../../redux/thunks";
import { dateOnlyToLocalDate, getInitialISTDate } from "../../../../utils/dateUtils";

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
        const [courtId, slotId, date, side] = key.split('-');
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
          duration: 90,
          side: "both",
          isHalfSlot: false
        };

        const adjacentFull = {
          _id: adjacentSlot._id,
          time: adjacentSlot.time,
          amount: mergedAmount,
          duration: 90,
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
  const updateSelectedBusinessAndCourts = (newTimes, courtId, timeEntries) => {
    const dateKey = selectedDate?.fullDate;
    const currentCourtTimes = selectedTimes[courtId] || [];

    setSelectedTimes(prev => ({ ...prev, [courtId]: newTimes }));
    setSelectedBuisness(prev => {
      const filtered = prev.filter(t => !timeEntries.some(entry => entry._id === t._id));
      return [...filtered, ...timeEntries];
    });

    const currentCourt = slotData?.data?.find((c) => c._id === courtId);
    const formattedTimeEntries = timeEntries.map(entry => {
      const leftKey = `${courtId}-${entry._id}-${dateKey}-left`;
      const rightKey = `${courtId}-${entry._id}-${dateKey}-right`;
      const hasLeft = halfSelectedSlots.has(leftKey);
      const hasRight = halfSelectedSlots.has(rightKey);

      if (hasLeft && hasRight) {
        return {
          ...entry,
          time: entry.time,
          duration: 60,
          side: "both",
          isHalfSlot: false
        };
      }

      if (hasLeft && !hasRight) {
        return {
          ...entry,
          time: entry.time,
          duration: 30,
          side: "left",
          isHalfSlot: true
        };
      }

      if (!hasLeft && hasRight) {
        const rightTime = entry.time.replace(/(\d+)(\s*)(am|pm)/i, (match, hour, space, period) => {
          return `${hour}:30${space}${period}`;
        });
        return {
          ...entry,
          time: rightTime,
          duration: 30,
          side: "right",
          isHalfSlot: true
        };
      }

      return {
        ...entry,
        time: entry.time,
        duration: 60,
        side: "both",
        isHalfSlot: false
      };
    });

    if (currentCourtTimes?.length === 0) {
      setSelectedCourts(prev => [
        ...prev,
        {
          _id: currentCourt._id,
          courtName: currentCourt.courtName,
          type: currentCourt.type,
          date: dateKey,
          day: selectedDate?.day,
          time: formattedTimeEntries,
        },
      ]);
    } else {
      setSelectedCourts(prev =>
        prev.map(c => {
          if (c._id === courtId) {
            const updatedTime = [...c.time.filter(t => !timeEntries.some(entry => entry._id === t._id)), ...formattedTimeEntries];
            const uniqueTime = [];
            const seenIds = new Set();
            updatedTime.forEach(slot => {
              if (!seenIds.has(slot._id)) {
                seenIds.add(slot._id);
                uniqueTime.push(slot);
              }
            });
            return { ...c, time: uniqueTime };
          }
          return c;
        })
      );
    }
  };

  const getAllSelectedSlots = () => {
    const allSlots = [];

    Object.entries(selectedTimes).forEach(([cId, times]) => {
      times.forEach(t => {
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

  const toggleTime = (time, courtId, dateKey, clickSide = null) => {
    const currentSlotHour = parseTimeToHour(time.time);
    const hasThirtyMinPrice = has30MinPrices && time?.has30MinPrice === true;
    const dateKeyStr = dateKey || selectedDate?.fullDate;

    const leftKey = `${courtId}-${time._id}-${dateKeyStr}-left`;
    const rightKey = `${courtId}-${time._id}-${dateKeyStr}-right`;
    const getAllSelectedHours = () => {
      const hours = new Set();

      Object.values(selectedTimes).forEach(times => {
        times.forEach(t => {
          const h = parseTimeToHour(t.time);
          if (h !== null) hours.add(h);
        });
      });

      halfSelectedSlots.forEach(key => {
        const [, slotId] = key.split('-');
        const slot = slotData?.data
          ?.find(c => c.slots?.some(s => s._id === slotId))
          ?.slots?.find(s => s._id === slotId);
        if (slot) hours.add(parseTimeToHour(slot.time));
      });

      return Array.from(hours).sort((a, b) => a - b);
    };

    const getAllSelectedHalfHours = () => {
      const halfHours = new Set();

      // Full / 60-min slots from selectedTimes
      Object.entries(selectedTimes).forEach(([courtId, times]) => {
        times.forEach(t => {
          const hour = parseTimeToHour(t.time);
          if (hour === null) return;

          // Check if it's a 90-min slot
          if (t.duration === 90 || t.originalDuration === 90) {
            const halfHour = parseTimeToHalfHour(t.time);
            if (halfHour !== null) {
              halfHours.add(halfHour);
              halfHours.add(halfHour + 1);
              halfHours.add(halfHour + 2);
            }
          } else {
            // 60-min slot
            halfHours.add(hour * 2);
            halfHours.add(hour * 2 + 1);
          }
        });
      });

      // 90-min slots from selectedCourts
      selectedCourts.forEach(court => {
        court.time.forEach(t => {
          if (t.duration === 90 || t.originalDuration === 90) {
            const halfHour = parseTimeToHalfHour(t.time);
            if (halfHour === null) return;
            halfHours.add(halfHour);
            halfHours.add(halfHour + 1);
            halfHours.add(halfHour + 2);
          }
        });
      });

      // Half-slots (30 min)
      halfSelectedSlots.forEach(key => {
        const [cId, slotId] = key.split('-');
        const slot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);

        if (!slot) return;
        const hour = parseTimeToHour(slot.time);
        if (hour === null) return;

        const isLeft = key.endsWith('-left');
        const base = hour * 2;
        if (isLeft) {
          halfHours.add(base);
        } else {
          halfHours.add(base + 1);
        }
      });

      return Array.from(halfHours).sort((a, b) => a - b);
    };
    // ==================== EARLY DESELECTION CHECK ====================
    if (hasThirtyMinPrice && clickSide) {
      const targetKey = clickSide === 'left' ? leftKey : rightKey;
      const isDeselecting = halfSelectedSlots.has(targetKey);

      if (isDeselecting) {
        const hour = currentSlotHour;
        const allSelectedHours = getAllSelectedHours();
        const isEarliest = allSelectedHours.length === 0 || hour === Math.min(...allSelectedHours);
        const hasBothSides = halfSelectedSlots.has(leftKey) && halfSelectedSlots.has(rightKey);

        if (isEarliest && hasBothSides) {
          setHalfSelectedSlots(new Set());
          setSelectedTimes({});
          setSelectedBuisness([]);
          setSelectedCourts([]);
          setShowHalfSlots(false);
          setSlotError("");
          return;
        }

        if (clickSide === 'left') {
          if (isEarliest) {
            setHalfSelectedSlots(new Set());
            setSelectedTimes({});
            setSelectedBuisness([]);
            setSelectedCourts([]);
            setShowHalfSlots(false);
          } else {
            setHalfSelectedSlots(prev => {
              const newSet = new Set();
              prev.forEach(key => {
                const [, slotId] = key.split('-');
                const slot = slotData?.data?.flatMap(c => c.slots || [])
                  .find(s => s._id === slotId);
                if (slot && parseTimeToHour(slot.time) < hour) {
                  newSet.add(key);
                }
              });
              return newSet;
            });
            setSelectedTimes(prev => {
              const newTimes = {};
              Object.entries(prev).forEach(([cid, times]) => {
                const filtered = times.filter(t => parseTimeToHour(t.time) < hour);
                if (filtered.length) newTimes[cid] = filtered;
              });
              return newTimes;
            });
            setSelectedBuisness(prev => prev.filter(t => parseTimeToHour(t.time) < hour));
            setSelectedCourts(prev => prev.map(c => ({
              ...c,
              time: c.time.filter(t => parseTimeToHour(t.time) < hour)
            })).filter(c => c.time.length > 0));
          }
        } else if (clickSide === 'right') {
          setHalfSelectedSlots(prev => {
            const newSet = new Set();
            prev.forEach(key => {
              const [, slotId] = key.split('-');
              const slot = slotData?.data?.flatMap(c => c.slots || [])
                .find(s => s._id === slotId);
              const slotHour = parseTimeToHour(slot?.time);

              if (slotHour < hour) {
                newSet.add(key);
              } else if (slotHour === hour && key.endsWith('-left')) {
                newSet.add(key);
              }
            });
            return newSet;
          });

          setSelectedTimes(prev => {
            const newTimes = {};
            Object.entries(prev).forEach(([cid, times]) => {
              const filtered = times.filter(t => parseTimeToHour(t.time) < hour);
              if (filtered.length) newTimes[cid] = filtered;
            });
            return newTimes;
          });

          setSelectedBuisness(prev => prev.filter(t => parseTimeToHour(t.time) < hour));
          setSelectedCourts(prev => prev.map(c => ({
            ...c,
            time: c.time.filter(t => parseTimeToHour(t.time) < hour)
          })).filter(c => c.time.length > 0));
        }

        setSlotError("");
        return;
      }
    }

    if (window.lastToggleCall && window.lastToggleKey === `${courtId}-${time._id}-${clickSide}` && Date.now() - window.lastToggleCall < 100) {
      return;
    }
    window.lastToggleCall = Date.now();
    window.lastToggleKey = `${courtId}-${time._id}-${clickSide}`;

    if (hasThirtyMinPrice && clickSide) {
      const hasLeft = halfSelectedSlots.has(leftKey);
      const hasRight = halfSelectedSlots.has(rightKey);
      const isSameSlotOppositeClick = (hasLeft && clickSide === 'right') || (hasRight && clickSide === 'left');

      if (isSameSlotOppositeClick) {
        let totalSlots = 0;
        selectedCourts.forEach(court => {
          court.time.forEach(slot => {
            totalSlots += slot.side === "both" || slot.duration === 60 ? 1 : 0.5;
          });
        });

        const halfSlotGroups = new Map();
        Array.from(halfSelectedSlots).forEach(key => {
          const [cId, sId] = key.split('-');
          const groupKey = `${cId}-${sId}`;
          const isInSelectedCourts = selectedCourts.some(court =>
            court._id === cId && court.time.some(slot => slot._id === sId)
          );

          if (!isInSelectedCourts) {
            if (!halfSlotGroups.has(groupKey)) {
              halfSlotGroups.set(groupKey, { left: false, right: false });
            }
            const group = halfSlotGroups.get(groupKey);
            if (key.endsWith('-left')) group.left = true;
            if (key.endsWith('-right')) group.right = true;
          }
        });

        halfSlotGroups.forEach(group => {
          totalSlots += group.left && group.right ? 1 : 0.5;
        });

        const allHours = [];
        Object.values(selectedTimes).forEach(times => {
          times.forEach(t => {
            const h = parseTimeToHour(t.time);
            if (h !== null) allHours.push(h);
          });
        });

        halfSelectedSlots.forEach(key => {
          const [, slotId] = key.split('-');
          const slot = slotData?.data
            ?.find(c => c.slots?.some(s => s._id === slotId))
            ?.slots?.find(s => s._id === slotId);
          if (slot) allHours.push(parseTimeToHour(slot.time));
        });

        const uniqueHours = [...new Set(allHours)];
        const maxSelectedHour = uniqueHours.length > 0 ? Math.max(...uniqueHours) : 0;
        const forwardSlotAlreadySelected = currentSlotHour < maxSelectedHour;
        const projectedTotal = totalSlots + 0.5;
        if (projectedTotal > 3 || forwardSlotAlreadySelected) {
          showError("Cannot complete this slot. Maximum limit or forward slots already selected.");
          return;
        }
      }
    }

    const isFirstSlot = (hour) => {
      const hours = getAllSelectedHours();
      return hours?.length === 0 || hour === Math.min(...hours);
    };

    // ==================== DESELECTION CHECK (UNIVERSAL) ====================
    const currentCourtTimes = selectedTimes[courtId] || [];
    const isSlotInSelectedTimes = currentCourtTimes.some(t => t?._id === time?._id);
    const isSlotInSelectedCourts = selectedCourts.some(court =>
      court?._id === courtId && court?.time.some(slot => slot?._id === time?._id)
    );
    const hasHalfSlots = halfSelectedSlots.has(leftKey) || halfSelectedSlots.has(rightKey);
    const otherSideKey = clickSide === 'left' ? rightKey : leftKey;
    const hasOtherSide = halfSelectedSlots.has(otherSideKey);
    const isCompletion = hasOtherSide && clickSide;

    if ((isSlotInSelectedTimes || isSlotInSelectedCourts || (hasHalfSlots && !clickSide)) && !isCompletion) {
      const hour = currentSlotHour;
      const allSelectedHours = getAllSelectedHours();
      const isEarliest = allSelectedHours.length === 0 || hour === Math.min(...allSelectedHours);

      if (clickSide === 'left' || !clickSide) {
        if (isEarliest) {
          setHalfSelectedSlots(new Set());
          setSelectedTimes({});
          setSelectedBuisness([]);
          setSelectedCourts([]);
          setShowHalfSlots(false);
        } else {
          setSelectedTimes(prev => {
            const newTimes = {};
            Object.entries(prev).forEach(([cid, times]) => {
              const filtered = times.filter(t => parseTimeToHour(t.time) < hour);
              if (filtered.length) newTimes[cid] = filtered;
            });
            return newTimes;
          });

          setSelectedCourts(prev =>
            prev.map(c => ({
              ...c,
              time: c.time.filter(t => parseTimeToHour(t.time) < hour)
            })).filter(c => c.time.length > 0)
          );

          setSelectedBuisness(prev => prev.filter(t => parseTimeToHour(t.time) < hour));
          setHalfSelectedSlots(prev => {
            const newSet = new Set();
            prev.forEach(key => {
              const [, slotId] = key.split('-');
              const slot = slotData?.data?.flatMap(c => c.slots || [])
                .find(s => s._id === slotId);
              if (slot && parseTimeToHour(slot.time) < hour) {
                newSet.add(key);
              }
            });
            return newSet;
          });
        }
      } else if (clickSide === 'right') {
        setHalfSelectedSlots(prev => {
          const newSet = new Set();
          prev.forEach(key => {
            const [, slotId] = key.split('-');
            const slot = slotData?.data?.flatMap(c => c.slots || [])
              .find(s => s._id === slotId);
            const slotHour = parseTimeToHour(slot?.time);

            if (slotHour < hour) {
              newSet.add(key);
            } else if (slotHour === hour && key.endsWith('-left')) {
              newSet.add(key);
            }
          });
          return newSet;
        });

        setSelectedTimes(prev => {
          const newTimes = {};
          Object.entries(prev).forEach(([cid, times]) => {
            const filtered = times.filter(t => parseTimeToHour(t.time) < hour);
            if (filtered.length) newTimes[cid] = filtered;
          });
          return newTimes;
        });

        setSelectedCourts(prev =>
          prev.map(c => ({
            ...c,
            time: c.time.filter(t => parseTimeToHour(t.time) < hour)
          })).filter(c => c.time.length > 0)
        );

        setSelectedBuisness(prev => prev.filter(t => parseTimeToHour(t.time) < hour));
      }

      setSlotError("");
      return;
    }
    const applyContinuityLogic = (newHour, newSide, targetCourtId) => {
      const dateKeyStr = selectedDate?.fullDate;
      const existingHalfSelections = [];

      halfSelectedSlots.forEach(key => {
        const parts = key.split('-');
        const side = parts[parts.length - 1];
        const cId = parts[0];
        const slotId = parts[1];
        const slot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);
        if (slot) {
          existingHalfSelections.push({ hour: parseTimeToHour(slot.time), side, courtId: cId, slotId });
        }
      });

      const sortedExistingHalfSelections = [...existingHalfSelections].sort((a, b) => a.hour - b.hour);
      const getDuration = () => {
        let duration = 0;
        selectedCourts.forEach(court => {
          court.time.forEach(slot => {
            duration += slot.side === "both" || slot.duration === 60 ? 1 : 0.5;
          });
        });

        const halfSlotGroups = new Map();
        Array.from(halfSelectedSlots).forEach(key => {
          const [courtId, slotId] = key.split('-');
          const groupKey = `${courtId}-${slotId}`;
          const isInSelectedCourts = selectedCourts.some(court =>
            court?._id === courtId && court.time.some(slot => slot?._id === slotId)
          );

          if (!isInSelectedCourts) {
            if (!halfSlotGroups.has(groupKey)) {
              halfSlotGroups.set(groupKey, { left: false, right: false });
            }
            const group = halfSlotGroups.get(groupKey);
            if (key.endsWith('-left')) group.left = true;
            if (key.endsWith('-right')) group.right = true;
          }
        });

        halfSlotGroups.forEach(group => {
          duration += group.left && group.right ? 1 : 0.5;
        });

        return duration;
      };

      const totalSlots = getDuration();

      if (totalSlots >= 3) {
        return false;
      }

      if (totalSlots === 2.5) {
        const allSelectedHours = [];
        selectedCourts.forEach(court => {
          court.time.forEach(slot => {
            const hour = parseTimeToHour(slot.time);
            if (hour !== null) allSelectedHours.push(hour);
          });
        });

        existingHalfSelections.forEach(s => {
          if (!allSelectedHours.includes(s.hour)) {
            allSelectedHours.push(s.hour);
          }
        });


        if (allSelectedHours.length >= 3) {
          const sortedHours = [...allSelectedHours].sort((a, b) => a - b);
          const firstSlotHour = sortedHours[0];
          const firstSlotKeys = existingHalfSelections.filter(s => s.hour === firstSlotHour);
          const isFirstSlotHalf = firstSlotKeys.length === 1;

          if (isFirstSlotHalf && newHour === sortedHours[2] + 1) {
            if (newSide === 'left') {
            } else {
              return false; // Block 4th slot RIGHT
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else if (totalSlots >= 2.5) {
        return false;
      }

      if (existingHalfSelections.length > 0) {
        for (let i = 0; i < existingHalfSelections.length; i++) {
          const currentSlot = existingHalfSelections[i];

          if (currentSlot.side === 'left' && newSide === 'left' && newHour === currentSlot.hour + 1 && currentSlot.courtId === targetCourtId) {
            const updatedSlots = new Set(halfSelectedSlots);
            const newSlot = slotData?.data?.find(c => c._id === targetCourtId)?.slots?.find(s => parseTimeToHour(s.time) === newHour);
            if (newSlot) {
              updatedSlots.add(`${targetCourtId}-${newSlot._id}-${dateKeyStr}-${newSide}`);
            }

            const currentSlotData = slotData?.data?.find(c => c._id === currentSlot.courtId)?.slots?.find(s => s._id === currentSlot.slotId);
            if (currentSlotData && currentSlotData.status !== 'booked' && !isPastTime(currentSlotData.time, selectedDate?.fullDate)) {
              const rightKey = `${currentSlot.courtId}-${currentSlot.slotId}-${dateKeyStr}-right`;
              const bookingTime = currentSlotData.bookingTime?.trim();
              const rightBooked = bookingTime && /:30\s*(AM|PM)?$/i.test(bookingTime);
              if (!rightBooked) {
                updatedSlots.add(rightKey);
                const fullEntry = {
                  _id: currentSlotData._id,
                  time: currentSlotData.time,
                  amount: getPriceForSlotWrapper(currentSlotData.time, selectedDate?.day, false, currentSlot.courtId),
                  duration: 60,
                  side: "both",
                  isHalfSlot: false
                };

                const currentCourt = slotData?.data?.find(c => c._id === currentSlot.courtId);
                setSelectedCourts(prev => {
                  const existingCourt = prev.find(c => c._id === currentSlot.courtId);
                  if (!existingCourt) {
                    return [...prev, {
                      _id: currentCourt._id,
                      courtName: currentCourt.courtName,
                      type: currentCourt.type,
                      date: dateKeyStr,
                      day: selectedDate?.day,
                      time: [fullEntry],
                    }];
                  } else {
                    return prev.map(c => {
                      if (c._id === currentSlot.courtId) {
                        const filteredTime = c.time.filter(t => t._id !== currentSlotData._id);
                        return { ...c, time: [...filteredTime, fullEntry] };
                      }
                      return c;
                    });
                  }
                });
              }
            }

            if (newSlot) {
              const newHalfEntry = {
                _id: newSlot._id,
                time: newSlot.time,
                amount: getPriceForSlotWrapper(newSlot.time, selectedDate?.day, false, targetCourtId) / 2,
                duration: 30,
                side: newSide,
                isHalfSlot: true
              };

              const newCourt = slotData?.data?.find(c => c._id === targetCourtId);
              setSelectedCourts(prev => {
                const existingCourt = prev.find(c => c._id === targetCourtId);
                if (!existingCourt) {
                  return [...prev, {
                    _id: newCourt._id,
                    courtName: newCourt.courtName,
                    type: newCourt.type,
                    date: dateKeyStr,
                    day: selectedDate?.day,
                    time: [newHalfEntry],
                  }];
                } else {
                  return prev.map(c => {
                    if (c._id === targetCourtId) {
                      const existingSlot = c.time.find(t => t._id === newHalfEntry._id && t.side === newSide);
                      if (existingSlot) return c;
                      return { ...c, time: [...c.time, newHalfEntry] };
                    }
                    return c;
                  });
                }
              });
            }

            setHalfSelectedSlots(updatedSlots);
            return true;
          }
          if (currentSlot.side === 'right' && newSide === 'right' && newHour === currentSlot.hour + 1 && currentSlot.courtId === targetCourtId) {
            const updatedSlots = new Set(halfSelectedSlots);
            const newSlot = slotData?.data?.find(c => c._id === targetCourtId)?.slots?.find(s => parseTimeToHour(s.time) === newHour);
            if (newSlot) {
              updatedSlots.add(`${targetCourtId}-${newSlot._id}-${dateKeyStr}-${newSide}`);
            }

            const currentDuration = getDuration();
            if (currentDuration < 2.5) {
              const newSlotData = slotData?.data?.find(c => c._id === targetCourtId)?.slots?.find(s => s._id === newSlot._id);
              if (newSlotData && newSlotData.status !== 'booked') {
                const newLeftKey = `${targetCourtId}-${newSlot._id}-${dateKeyStr}-left`;
                const newBookingTime = newSlotData.bookingTime?.trim();
                const newLeftBooked = newBookingTime && /:00\s*(AM|PM)?$/i.test(newBookingTime);
                if (!newLeftBooked) {
                  updatedSlots.add(newLeftKey);

                  const newFullEntry = {
                    _id: newSlotData._id,
                    time: newSlotData.time,
                    amount: getPriceForSlotWrapper(newSlotData.time, selectedDate?.day, false, targetCourtId),
                    duration: 60,
                    side: "both",
                    isHalfSlot: false
                  };

                  const newCourt = slotData?.data?.find(c => c._id === targetCourtId);
                  setSelectedCourts(prev => {
                    const existingCourt = prev.find(c => c._id === targetCourtId);
                    if (!existingCourt) {
                      return [...prev, {
                        _id: newCourt._id,
                        courtName: newCourt.courtName,
                        type: newCourt.type,
                        date: dateKeyStr,
                        day: selectedDate?.day,
                        time: [newFullEntry],
                      }];
                    } else {
                      return prev.map(c => {
                        if (c._id === targetCourtId) {
                          const filteredTime = c.time.filter(t => t._id !== newSlotData._id);
                          return { ...c, time: [...filteredTime, newFullEntry] };
                        }
                        return c;
                      });
                    }
                  });
                }
              }
            }

            setHalfSelectedSlots(updatedSlots);
            return true;
          }
        }
      }

      if (newSide === 'right') {
        const leftSelections = [];
        existingHalfSelections.forEach(s => {
          if (s.side === 'left') {
            leftSelections.push(s);
          }
        });

        if (leftSelections.length >= 2) {
          const sortedLeftSelections = [...leftSelections].sort((a, b) => a.hour - b.hour);

          for (let i = 0; i < leftSelections.length - 1; i++) {
            if (leftSelections[i + 1].hour === leftSelections[i].hour + 1) {
              const updatedSlots = new Set(halfSelectedSlots);

              const newSlot = slotData?.data?.find(c => c._id === targetCourtId)?.slots?.find(s => parseTimeToHour(s.time) === newHour);
              if (newSlot) {
                updatedSlots.add(`${targetCourtId}-${newSlot._id}-${dateKeyStr}-${newSide}`);
              }

              for (let j = i; j < i + 2; j++) {
                const leftSlot = leftSelections[j];
                const leftSlotData = slotData?.data?.find(c => c._id === leftSlot.courtId)?.slots?.find(s => s._id === leftSlot.slotId);
                if (leftSlotData?.status === 'booked') {
                  continue;
                }

                const bookingTime = leftSlotData?.bookingTime?.trim();
                const rightBooked = bookingTime && /:30\s*(AM|PM)?$/i.test(bookingTime);

                if (rightBooked) {
                  continue;
                }

                const rightKey = `${leftSlot.courtId}-${leftSlot.slotId}-${dateKeyStr}-right`;
                updatedSlots.add(rightKey);
              }

              const currentSlotData = slotData?.data?.find(c => c._id === targetCourtId)?.slots?.find(s => parseTimeToHour(s.time) === newHour);
              if (currentSlotData && currentSlotData.status !== 'booked') {
                const leftKey = `${targetCourtId}-${currentSlotData._id}-${dateKeyStr}-left`;
                const bookingTime = currentSlotData.bookingTime?.trim();
                const leftBooked = bookingTime && (/:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime));
                if (!leftBooked) {
                  updatedSlots.add(leftKey);
                } else {
                }
              }

              setHalfSelectedSlots(updatedSlots);
              return true;
            }
          }
        }
      }

      const prevHour = newHour - 1;
      const prevFullExists = selectedCourts.some(court =>
        court.time.some(slot => parseTimeToHour(slot.time) === prevHour && slot.side === "both")
      );

      if (prevFullExists && newSide === 'right') {
        const currentSlotData = slotData?.data?.find(c => c._id === targetCourtId)?.slots?.find(s => parseTimeToHour(s.time) === newHour);
        const bookingTime = currentSlotData?.bookingTime?.trim();
        const leftBooked = bookingTime && (/:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime));
        if (!leftBooked && currentSlotData?.status !== 'booked') {
          const updatedSlots = new Set(halfSelectedSlots);
          const newSlot = slotData?.data?.find(c => c._id === targetCourtId)?.slots?.find(s => parseTimeToHour(s.time) === newHour);
          if (newSlot) {
            updatedSlots.add(`${targetCourtId}-${newSlot._id}-${dateKeyStr}-${newSide}`);
            const leftKey = `${targetCourtId}-${newSlot._id}-${dateKeyStr}-left`;
            updatedSlots.add(leftKey);
          }

          setHalfSelectedSlots(updatedSlots);
          return true;
        } else {
        }
      }

      const hasLeftInHalfSlots = existingHalfSelections.some(s => s.side === 'left');
      const hasLeftInSelectedCourts = selectedCourts.some(court =>
        court.time.some(slot => slot.side === 'left')
      );
      const hasLeftRightPattern = (hasLeftInHalfSlots || hasLeftInSelectedCourts) && newSide === 'right';

      if (hasLeftRightPattern) {
        const updatedSlots = new Set(halfSelectedSlots);
        const newSlot = slotData?.data?.find(c => c?._id === targetCourtId)?.slots?.find(s => parseTimeToHour(s.time) === newHour);
        if (newSlot) {
          updatedSlots.add(`${targetCourtId}-${newSlot?._id}-${dateKeyStr}-${newSide}`);
        }

        const leftSelections = existingHalfSelections.filter(s => s.side === 'left');

        if (leftSelections?.length > 0) {
          const minLeftHour = Math.min(...leftSelections?.map(s => s.hour));

          for (let hour = minLeftHour; hour <= newHour; hour++) {
            const leftSelection = leftSelections.find(s => s.hour === hour);
            const slotCourtId = targetCourtId;
            const slot = slotData?.data?.find(c => c._id === slotCourtId)?.slots?.find(s => parseTimeToHour(s.time) === hour);

            if (slot && slot?.status !== 'booked' && slot.availabilityStatus === 'available' && !isPastTime(slot.time, selectedDate?.fullDate)) {
              const leftKey = `${slotCourtId}-${slot._id}-${dateKeyStr}-left`;
              const rightKey = `${slotCourtId}-${slot._id}-${dateKeyStr}-right`;

              const bookingTime = slot.bookingTime?.trim();
              const leftBooked = bookingTime && (/:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime));
              const rightBooked = bookingTime && /:30\s*(AM|PM)?$/i.test(bookingTime);

              if (!leftBooked && !rightBooked) {
                updatedSlots.add(leftKey);
                updatedSlots.add(rightKey);

                const fullEntry = {
                  _id: slot?._id,
                  time: slot.time,
                  amount: getPriceForSlotWrapper(slot?.time, selectedDate?.day, false, slotCourtId),
                  duration: 60,
                  side: "both",
                  isHalfSlot: false
                };

                const currentCourt = slotData?.data?.find(c => c._id === slotCourtId);
                setSelectedCourts(prev => {
                  const existingCourt = prev.find(c => c._id === slotCourtId);
                  if (!existingCourt) {
                    return [...prev, {
                      _id: currentCourt._id,
                      courtName: currentCourt.courtName,
                      type: currentCourt.type,
                      date: dateKeyStr,
                      day: selectedDate?.day,
                      time: [fullEntry],
                    }];
                  } else {
                    return prev.map(c => {
                      if (c._id === slotCourtId) {
                        const filteredTime = c.time.filter(t => t._id !== slot._id);
                        return { ...c, time: [...filteredTime, fullEntry] };
                      }
                      return c;
                    });
                  }
                });
              } else {
                if (!leftBooked && hour !== newHour) updatedSlots.add(leftKey);
                if (!rightBooked && hour === newHour) updatedSlots.add(rightKey);
              }
            }
          }
        }
        setHalfSelectedSlots(updatedSlots);
        return true;
      }
      return false;
    };

    const checkCrossSlotSelection = (newHour, newSide, targetCourtId) => {
      const getDuration = () => {
        let duration = 0;
        selectedCourts.forEach(court => {
          court.time.forEach(slot => {
            duration += slot.side === "both" || slot.duration === 60 ? 1 : 0.5;
          });
        });

        const halfSlotGroups = new Map();
        Array.from(halfSelectedSlots).forEach(key => {
          const [courtId, slotId] = key.split('-');
          const groupKey = `${courtId}-${slotId}`;
          const isInSelectedCourts = selectedCourts.some(court =>
            court._id === courtId && court.time.some(slot => slot._id === slotId)
          );

          if (!isInSelectedCourts) {
            if (!halfSlotGroups.has(groupKey)) {
              halfSlotGroups.set(groupKey, { left: false, right: false });
            }
            const group = halfSlotGroups.get(groupKey);
            if (key.endsWith('-left')) group.left = true;
            if (key.endsWith('-right')) group.right = true;
          }
        });

        halfSlotGroups.forEach(group => {
          duration += group.left && group.right ? 1 : 0.5;
        });

        return duration;
      };

      const existingHalfSelections = [];
      halfSelectedSlots.forEach(key => {
        const parts = key.split('-');
        const side = parts[parts.length - 1];
        const cId = parts[0];
        const slotId = parts[1];
        const slot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);
        if (slot) {
          existingHalfSelections.push({ hour: parseTimeToHour(slot.time), side, courtId: cId, slotId });
        }
      });

      const totalSlots = getDuration();

      // Block if already at 3 slots
      if (totalSlots >= 3) {
        return false;
      }

      if (totalSlots === 2.5) {
        const allSelectedHours = [];
        selectedCourts.forEach(court => {
          court.time.forEach(slot => {
            const hour = parseTimeToHour(slot.time);
            if (hour !== null) allSelectedHours.push(hour);
          });
        });

        existingHalfSelections.forEach(s => {
          if (!allSelectedHours.includes(s.hour)) {
            allSelectedHours.push(s.hour);
          }
        });

        if (allSelectedHours.length >= 3) {
          const sortedHours = [...allSelectedHours].sort((a, b) => a - b);
          const firstSlotHour = sortedHours[0];
          const firstSlotKeys = existingHalfSelections.filter(s => s.hour === firstSlotHour);
          const isFirstSlotHalf = firstSlotKeys.length === 1;

          if (isFirstSlotHalf && newHour === sortedHours[2] + 1) {
            if (newSide === 'left') {
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else if (totalSlots >= 2.5) {
        return false;
      }

      halfSelectedSlots.forEach(key => {
        const parts = key.split('-');
        const side = parts[parts.length - 1];
        const cId = parts[0];
        const slotId = parts[1];

        const slot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);
        if (slot) {
          existingHalfSelections.push({ hour: parseTimeToHour(slot.time), side, courtId: cId, slotId });
        }
      });

      for (const existing of existingHalfSelections) {
        const hourDiff = Math.abs(newHour - existing.hour);

        if (hourDiff > 0 && hourDiff <= 3) {
          const condition1 = existing.side === 'right' && newSide === 'left' && newHour === existing.hour;

          const condition2 = existing.side === 'left' && newSide === 'left' && newHour === existing.hour + 1;

          const condition3 = existing.side === 'left' && newSide === 'right' && newHour > existing.hour;

          if (condition1 || condition2 || condition3) {
            const targetSlotData = slotData?.data?.find(c => c._id === targetCourtId)?.slots?.find(s => parseTimeToHour(s.time) === newHour);
            const existingSlotData = slotData?.data?.find(c => c._id === existing.courtId)?.slots?.find(s => s._id === existing.slotId);

            let targetHasBookedContent = targetSlotData?.status === "booked";
            if (targetSlotData?.bookingTime?.trim()) {
              const bookingTime = targetSlotData.bookingTime.trim();
              const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
              const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);
              targetHasBookedContent = targetHasBookedContent || leftBooked || rightBooked;
            }

            let existingHasBookedContent = existingSlotData?.status === "booked";
            if (existingSlotData?.bookingTime?.trim()) {
              const bookingTime = existingSlotData.bookingTime.trim();
              const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
              const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);
              existingHasBookedContent = existingHasBookedContent || leftBooked || rightBooked;
            }

            if (targetHasBookedContent || existingHasBookedContent) {
              return false;
            }
            setHalfSelectedSlots(prev => {
              const newSet = new Set(prev);

              if (condition1) {
                const existingSlot = slotData?.data?.find(c => c._id === existing.courtId)?.slots?.find(s => s._id === existing.slotId);
                if (existingSlot) {
                  const leftKey = `${existing.courtId}-${existing.slotId}-${dateKeyStr}-left`;
                  const rightKey = `${existing.courtId}-${existing.slotId}-${dateKeyStr}-right`;
                  newSet.add(leftKey);
                  newSet.add(rightKey);
                }
              } else if (condition2) {
                const targetSlot = slotData?.data?.find(c => c._id === targetCourtId)?.slots?.find(s => parseTimeToHour(s.time) === newHour);
                if (targetSlot) {
                  const leftKey = `${targetCourtId}-${targetSlot._id}-${dateKeyStr}-left`;
                  newSet.add(leftKey);
                }
              } else if (condition3) {
                const leftSelections = [];

                halfSelectedSlots.forEach(key => {
                  const parts = key.split('-');
                  const side = parts[parts.length - 1];
                  const cId = parts[0];
                  const slotId = parts[1];

                  if (side === 'left') {
                    const slot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);
                    if (slot) {
                      leftSelections.push({ hour: parseTimeToHour(slot.time), courtId: cId, slotId });
                    }
                  }
                });

                const sortedLeftSelections = [...leftSelections].sort((a, b) => a.hour - b.hour);
                const lastLeftHour = Math.max(...leftSelections.map(s => s.hour));

                for (let hour = lastLeftHour; hour <= newHour; hour++) {
                  let selectedCourt = targetCourtId;
                  const existingLeft = leftSelections.find(s => s.hour === hour);
                  if (existingLeft) {
                    selectedCourt = existingLeft.courtId;
                  }

                  const slot = slotData?.data?.find(c => c._id === selectedCourt)?.slots?.find(s => parseTimeToHour(s.time) === hour);
                  if (slot && slot?.status !== "booked" && slot?.availabilityStatus === "available") {
                    const leftKey = `${selectedCourt}-${slot._id}-${dateKeyStr}-left`;
                    const rightKey = `${selectedCourt}-${slot._id}-${dateKeyStr}-right`;
                    newSet.add(leftKey);
                    newSet.add(rightKey);
                  }
                }
              }
              const minHour = Math.min(existing.hour, newHour);
              const maxHour = Math.max(existing.hour, newHour);
              for (let hour = minHour; hour <= maxHour; hour++) {
                if (hour === newHour) continue;

                let selectedCourt = null;
                for (const key of prev) {
                  const [cId, slotId] = key.split('-');
                  const slot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);
                  if (slot && parseTimeToHour(slot.time) === hour) {
                    selectedCourt = cId;
                    break;
                  }
                }

                if (!selectedCourt) {
                  for (const court of slotData?.data || []) {
                    const slot = court.slots?.find(s => parseTimeToHour(s.time) === hour);
                    if (slot) {
                      const isBooked = slot?.status === "booked";
                      const isDisabled = slot?.availabilityStatus !== "available";
                      const isUnavailable = isPastTime(slot.time, selectedDate?.fullDate);
                      const bookingTime = slot?.bookingTime?.trim();
                      let hasBookedContent = isBooked;

                      if (bookingTime) {
                        const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
                        const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);
                        hasBookedContent = hasBookedContent || leftBooked || rightBooked;
                      }

                      if (!hasBookedContent && !isDisabled && !isUnavailable) {
                        selectedCourt = court._id;
                        break;
                      }
                    }
                  }
                }

                if (selectedCourt) {
                  const slot = slotData?.data?.find(c => c._id === selectedCourt)?.slots?.find(s => parseTimeToHour(s.time) === hour);
                  if (slot) {
                    const isBooked = slot?.status === "booked";
                    const bookingTime = slot?.bookingTime?.trim();
                    let hasBookedContent = isBooked;

                    if (bookingTime) {
                      const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
                      const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);
                      hasBookedContent = hasBookedContent || leftBooked || rightBooked;
                    }

                    if (hasBookedContent) {
                      continue;
                    }

                    const leftKey = `${selectedCourt}-${slot._id}-${dateKeyStr}-left`;
                    const rightKey = `${selectedCourt}-${slot._id}-${dateKeyStr}-right`;

                    if (condition1 || condition3) {
                      if (!isBooked && slot?.availabilityStatus === "available" && !isPastTime(slot.time, selectedDate?.fullDate)) {
                        let leftBooked = false;
                        let rightBooked = false;

                        if (bookingTime) {
                          leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
                          rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);
                        }

                        if (!leftBooked) newSet.add(leftKey);
                        if (!rightBooked) newSet.add(rightKey);
                      }
                    } else if (condition2) {
                      if (hour === existing.hour + 1) {
                        if (!isBooked && slot?.availabilityStatus === "available" && !isPastTime(slot.time, selectedDate?.fullDate)) {
                          let leftBooked = false;
                          let rightBooked = false;

                          if (bookingTime) {
                            leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
                            rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);
                          }

                          if (!leftBooked) newSet.add(leftKey);
                          if (!rightBooked) newSet.add(rightKey);
                        }
                      }
                    }
                  }
                }
              }

              setTimeout(() => {
                const slotsToUpdate = [];
                newSet.forEach(key => {
                  const [cId, slotId] = key.split('-');
                  const slot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);
                  if (slot) {
                    const leftKey = `${cId}-${slotId}-${dateKeyStr}-left`;
                    const rightKey = `${cId}-${slotId}-${dateKeyStr}-right`;
                    const hasLeft = newSet.has(leftKey);
                    const hasRight = newSet.has(rightKey);
                    const isBooked = slot?.status === "booked";
                    const bookingTime = slot?.bookingTime?.trim();
                    let leftBooked = false;
                    let rightBooked = false;

                    if (isBooked && bookingTime) {
                      leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
                      rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);
                    }

                    if (hasLeft && hasRight && !leftBooked && !rightBooked) {
                      slotsToUpdate.push({
                        courtId: cId,
                        slot: {
                          ...slot,
                          duration: 60,
                          side: "both",
                          isHalfSlot: false,
                          amount: getPriceForSlotWrapper(slot.time, selectedDate?.day, false, cId)
                        }
                      });
                    } else if (hasLeft && !leftBooked) {
                      slotsToUpdate.push({
                        courtId: cId,
                        slot: {
                          ...slot,
                          duration: 30,
                          side: "left",
                          isHalfSlot: true,
                          amount: getPriceForSlotWrapper(slot.time, selectedDate?.day, false, cId) / 2
                        }
                      });
                    } else if (hasRight && !rightBooked) {
                      const rightTime = slot.time.replace(/(\d+)(\s*)(am|pm)/i, (match, hour, space, period) => {
                        return `${hour}:30${space}${period}`;
                      });
                      slotsToUpdate.push({
                        courtId: cId,
                        slot: {
                          ...slot,
                          time: rightTime,
                          duration: 30,
                          side: "right",
                          isHalfSlot: true,
                          amount: getPriceForSlotWrapper(slot.time, selectedDate?.day, false, cId) / 2
                        }
                      });
                    }
                  }
                });

                slotsToUpdate.forEach(({ courtId: cId, slot }) => {
                  const slotToCheck = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slot._id);
                  if (slotToCheck) {
                    const isBooked = slotToCheck?.status === "booked";
                    const bookingTime = slotToCheck?.bookingTime?.trim();
                    let hasBookedHalf = false;

                    if (isBooked && bookingTime) {
                      const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
                      const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);
                      hasBookedHalf = leftBooked || rightBooked;
                    }

                    if (hasBookedHalf) {
                      return;
                    }
                  }

                  const currentCourt = slotData?.data?.find(c => c._id === cId);
                  if (currentCourt) {
                    setSelectedCourts(prev => {
                      const existingCourt = prev.find(c => c._id === cId);

                      if (!existingCourt) {
                        return [
                          ...prev,
                          {
                            _id: currentCourt._id,
                            courtName: currentCourt.courtName,
                            type: currentCourt.type,
                            date: dateKeyStr,
                            day: selectedDate?.day,
                            time: [slot],
                          },
                        ];
                      } else {
                        return prev.map(c => {
                          if (c._id === cId) {
                            const updatedTime = [...c.time.filter(t => t._id !== slot._id), slot];
                            return { ...c, time: updatedTime };
                          }
                          return c;
                        });
                      }
                    });
                  }
                });
              }, 0);

              return newSet;
            });

            return true;
          }
        }
      }

      return false;
    };

    const autoFillGaps = (newHour, targetCourtId) => {
      const existingHours = getAllSelectedHours();
      if (existingHours.length === 0) return true;

      const allHours = [...existingHours, newHour].sort((a, b) => a - b);
      const minHour = Math.min(...allHours);
      const maxHour = Math.max(...allHours);

      // For 90-min slots, check using half-hours instead of full hours
      const selectedHalfHours = getAllSelectedHalfHours();
      const newSlotHalfHours = [];

      // Find the slot being clicked
      const clickedSlot = slotData?.data
        ?.find(c => c._id === targetCourtId)
        ?.slots?.find(s => parseTimeToHour(s.time) === newHour);

      if (clickedSlot?.duration === 90) {
        const halfHour = parseTimeToHalfHour(clickedSlot.time);
        if (halfHour !== null) {
          newSlotHalfHours.push(halfHour, halfHour + 1, halfHour + 2);
        }
      } else {
        newSlotHalfHours.push(newHour * 2, newHour * 2 + 1);
      }

      const allHalfHours = [...selectedHalfHours, ...newSlotHalfHours].sort((a, b) => a - b);
      const minHalf = Math.min(...allHalfHours);
      const maxHalf = Math.max(...allHalfHours);

      // Check if range exceeds 3 hours (6 half-hours)
      if (maxHalf - minHalf > 5) {
        showError("Slot selection range cannot exceed 3 hours.");
        return false;
      }

      // For open matches, we allow non-consecutive slots across different courts
      // Only check if the new slot is within the time range
      return true;
    };

    // ==================== FIRST CLICK AUTO-SELECT FULL SLOT ====================
    if (hasThirtyMinPrice && clickSide && !showHalfSlots) {
      const allSelectedHours = getAllSelectedHours();
      if (allSelectedHours.length > 0) {
        const sortedHours = [...allSelectedHours, currentSlotHour].sort((a, b) => a - b);
        const minHour = sortedHours[0];
        if (currentSlotHour > minHour) {
          for (let hour = minHour; hour < currentSlotHour; hour++) {
            const allCourts = slotData?.data || [];
            let hasFullBookingInSequence = false;
            let hasPartialBookingInSequence = false;

            for (const court of allCourts) {
              const slot = court.slots?.find(s => parseTimeToHour(s.time) === hour);

              if (slot && isPastTime(slot.time, selectedDate?.fullDate)) {
                continue;
              }

              const isUserSelected = Array.from(halfSelectedSlots).some(key => {
                const [cId, slotId] = key.split('-');
                const userSlot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);
                return userSlot && parseTimeToHour(userSlot.time) === hour;
              }) || selectedCourts.some(c => c.time.some(t => parseTimeToHour(t.time) === hour));

              if (isUserSelected) {
                continue;
              }

              if (slot?.bookingTime?.trim()) {
                const bookingTime = slot.bookingTime.trim();
                const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
                const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);

                if ((leftBooked && rightBooked) || slot.status === 'booked') {
                  hasFullBookingInSequence = true;
                  break;
                }

                if (leftBooked || rightBooked) {
                  hasPartialBookingInSequence = true;
                }
              }
            }

            if (hasFullBookingInSequence) {
              showError("Cannot select slot due to booking in sequence.");
              return;
            }

            if (hasPartialBookingInSequence) {
              showError("Cannot select slot due to half-booked slot in sequence.");
              return;
            }
          }
        }
      }

      const isSlotBooked = time?.status === "booked";
      const bookingTime = time?.bookingTime?.trim();
      let hasBookedContent = isSlotBooked;

      if (bookingTime) {
        const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
        const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);

        if (leftBooked && rightBooked) {
          hasBookedContent = true;
        } else if (leftBooked || rightBooked) {
          showError("This slot is half booked and cannot be selected.");
          return;
        }
      }

      if (hasBookedContent) {
        showError("This slot is already booked and cannot be selected.");
        return;
      }

      if (isTimeSelectedInOtherCourt(currentSlotHour, courtId)) {
        showError("This time slot is already selected.");
        return;
      }

      if (!autoFillGaps(currentSlotHour, courtId)) {
        return;
      }

      setHalfSelectedSlots(prev => {
        const newSet = new Set(prev);
        newSet.add(leftKey);
        newSet.add(rightKey);
        return newSet;
      });

      const fullEntry = {
        _id: time._id,
        time: time.time,
        amount: getPriceForSlotWrapper(time.time, selectedDate?.day, false, courtId, time?.duration || 60),
        duration: time?.duration || 60,
        side: "both",
        isHalfSlot: false
      };

      const currentCourt = slotData?.data?.find((c) => c._id === courtId);
      setSelectedCourts(prev => {
        const existingCourt = prev.find(c => c._id === courtId);
        if (!existingCourt) {
          return [
            ...prev,
            {
              _id: currentCourt._id,
              courtName: currentCourt.courtName,
              type: currentCourt.type,
              date: dateKeyStr,
              day: selectedDate?.day,
              time: [fullEntry],
            },
          ];
        } else {
          return prev.map(c => {
            if (c._id === courtId) {
              const filteredTime = c.time.filter(t => t._id !== time._id);
              return { ...c, time: [...filteredTime, fullEntry] };
            }
            return c;
          });
        }
      });

      setShowHalfSlots(true);
      setSlotError("");
      return;
    }

    // ==================== HALF SLOT LOGIC ====================
    if (hasThirtyMinPrice && clickSide) {
      const allSelectedHours = getAllSelectedHours();
      if (allSelectedHours.length > 0) {
        const sortedHours = [...allSelectedHours, currentSlotHour].sort((a, b) => a - b);
        const minHour = sortedHours[0];

        if (currentSlotHour > minHour) {
          for (let hour = minHour; hour < currentSlotHour; hour++) {
            const allCourts = slotData?.data || [];
            let hasFullBookingInSequence = false;
            let hasPartialBookingInSequence = false;

            for (const court of allCourts) {
              const slot = court.slots?.find(s => parseTimeToHour(s.time) === hour);

              if (slot && isPastTime(slot.time, selectedDate?.fullDate)) {
                continue;
              }

              const isUserSelected = Array.from(halfSelectedSlots).some(key => {
                const [cId, slotId] = key.split('-');
                const userSlot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);
                return userSlot && parseTimeToHour(userSlot.time) === hour;
              }) || selectedCourts.some(c => c.time.some(t => parseTimeToHour(t.time) === hour));

              if (isUserSelected) {
                continue;
              }

              if (slot?.bookingTime?.trim()) {
                const bookingTime = slot.bookingTime.trim();
                const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
                const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);

                if ((leftBooked && rightBooked) || slot.status === 'booked') {
                  hasFullBookingInSequence = true;
                  break;
                }

                if (leftBooked || rightBooked) {
                  hasPartialBookingInSequence = true;
                }
              }
            }

            if (hasFullBookingInSequence) {
              showError("Cannot select slot due to booking in sequence.");
              return;
            }

            if (hasPartialBookingInSequence) {
              showError("Cannot select slot due to half-booked slot in sequence.");
              return;
            }
          }
        }
      }

      const prevHour = currentSlotHour - 1;
      const prevSlotHasLeftSelected = Array.from(halfSelectedSlots).some(key => {
        const [cId, slotId] = key.split('-');
        const slot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);
        return slot && parseTimeToHour(slot.time) === prevHour && key.endsWith('-left');
      });

      if (prevSlotHasLeftSelected) {
        const allCourts = slotData?.data || [];
        for (const court of allCourts) {
          const prevSlot = court.slots?.find(s => parseTimeToHour(s.time) === prevHour);
          if (prevSlot?.bookingTime?.trim()) {
            const bookingTime = prevSlot.bookingTime.trim();
            const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);
            if (rightBooked) {
              showError("Cannot select next slot. Previous slot right side is already booked.");
              return;
            }
          }
        }
      }
      const leftKey = `${courtId}-${time._id}-${dateKeyStr}-left`;
      const rightKey = `${courtId}-${time._id}-${dateKeyStr}-right`;
      const isSelectingLeft = clickSide === "left";
      const targetKey = isSelectingLeft ? leftKey : rightKey;
      const otherSideKey = clickSide === 'left' ? rightKey : leftKey;
      const hasOtherSide = halfSelectedSlots.has(otherSideKey);
      const isDeselecting = halfSelectedSlots.has(targetKey);
      const isSlotBooked = time?.status === "booked";
      const bookingTime = time?.bookingTime?.trim();
      let hasBookedHalf = false;

      if (isSlotBooked && bookingTime) {
        const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
        const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);

        if ((clickSide === 'left' && leftBooked) || (clickSide === 'right' && rightBooked)) {
          showError("This slot half is already booked and cannot be selected.");
          return;
        }

        hasBookedHalf = leftBooked || rightBooked;
      }

      if (isSlotBooked && !hasBookedHalf) {
        showError("This slot is already booked and cannot be selected.");
        return;
      }

      const currentCourtSlot = slotData?.data?.find(c => c._id === courtId)?.slots?.find(s => s._id === time._id);
      if (currentCourtSlot?.bookingTime?.trim()) {
        const bookingTime = currentCourtSlot.bookingTime.trim();
        const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
        const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);

        if ((clickSide === 'left' && leftBooked) || (clickSide === 'right' && rightBooked)) {
          showError("This slot half is already booked in this court.");
          return;
        }

        if (clickSide === 'right' && leftBooked) {
          showError("Cannot select right side when left side is already booked.");
          return;
        }
      }

      if (hasOtherSide && !halfSelectedSlots.has(targetKey)) {
        const bookingTime = time?.bookingTime?.trim();
        let otherSideBooked = false;

        if (bookingTime) {
          const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
          const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);

          if (clickSide === 'right' && leftBooked) otherSideBooked = true;
          if (clickSide === 'left' && rightBooked) otherSideBooked = true;
        }

        if (otherSideBooked) {
          setHalfSelectedSlots(prev => {
            const newSet = new Set(prev);
            newSet.add(targetKey);
            return newSet;
          });

          const halfEntry = {
            _id: time._id,
            time: clickSide === 'right' ? time.time.replace(/(\d+)(\s*)(am|pm)/i, (match, hour, space, period) => `${hour}:30${space}${period}`) : time.time,
            amount: getPriceForSlotWrapper(time.time, selectedDate?.day, true, courtId),
            duration: 30,
            side: clickSide,
            isHalfSlot: true
          };

          const currentCourt = slotData?.data?.find((c) => c._id === courtId);
          setSelectedCourts(prev => {
            const existingCourt = prev.find(c => c._id === courtId);

            if (!existingCourt) {
              return [
                ...prev,
                {
                  _id: currentCourt._id,
                  courtName: currentCourt.courtName,
                  type: currentCourt.type,
                  date: dateKeyStr,
                  day: selectedDate?.day,
                  time: [halfEntry],
                },
              ];
            } else {
              return prev.map(c => {
                if (c._id === courtId) {
                  const filteredTime = c.time.filter(t => t._id !== halfEntry._id || t.side !== clickSide);
                  return { ...c, time: [...filteredTime, halfEntry] };
                }
                return c;
              });
            }
          });

          setSlotError("");
          return;
        }
        setHalfSelectedSlots(prev => {
          const newSet = new Set(prev);
          newSet.delete(leftKey);
          newSet.delete(rightKey);
          return newSet;
        });

        const fullEntry = {
          _id: time._id,
          time: time.time,
          amount: getPriceForSlotWrapper(time.time, selectedDate?.day, false, courtId),
          duration: 60,
          side: "both",
          isHalfSlot: false
        };

        setSelectedTimes(prevTimes => {
          const currentCourtTimes = prevTimes[courtId] || [];
          const filteredTimes = currentCourtTimes.filter(t => t._id !== time._id);
          return {
            ...prevTimes,
            [courtId]: [...filteredTimes, fullEntry]
          };
        });

        const currentCourt = slotData?.data?.find((c) => c._id === courtId);
        setSelectedCourts(prevCourts => {
          const existingCourt = prevCourts.find(c => c._id === courtId);

          if (!existingCourt) {
            return [
              ...prevCourts,
              {
                _id: currentCourt._id,
                courtName: currentCourt.courtName,
                type: currentCourt.type,
                date: dateKeyStr,
                day: selectedDate?.day,
                time: [fullEntry],
              },
            ];
          } else {
            return prevCourts.map(c => {
              if (c._id === courtId) {
                const filteredTime = c.time.filter(t => t._id !== time._id);
                return { ...c, time: [...filteredTime, fullEntry] };
              }
              return c;
            });
          }
        });

        setSlotError("");
        return;
      }
      if (hasOtherSide && !halfSelectedSlots.has(targetKey)) {
      } else if (isDeselecting) {
        const hour = currentSlotHour;
        const isEarliest = isFirstSlot(hour);

        if (clickSide === 'left') {
          if (isEarliest) {
            setHalfSelectedSlots(new Set());
            setSelectedTimes({});
            setSelectedBuisness([]);
            setSelectedCourts([]);
            setShowHalfSlots(false);
          } else {
            setHalfSelectedSlots(prev => {
              const newSet = new Set();
              prev.forEach(key => {
                const [, slotId] = key.split('-');
                const slot = slotData?.data?.flatMap(c => c.slots || [])
                  .find(s => s._id === slotId);
                if (slot && parseTimeToHour(slot.time) < hour) {
                  newSet.add(key);
                }
              });
              return newSet;
            });
            setSelectedTimes(prev => {
              const newTimes = {};
              Object.entries(prev).forEach(([cid, times]) => {
                const filtered = times.filter(t => parseTimeToHour(t.time) < hour);
                if (filtered.length) newTimes[cid] = filtered;
              });
              return newTimes;
            });
            setSelectedBuisness(prev => prev.filter(t => parseTimeToHour(t.time) < hour));
            setSelectedCourts(prev => prev.map(c => ({
              ...c,
              time: c.time.filter(t => parseTimeToHour(t.time) < hour)
            })).filter(c => c.time.length > 0));
          }
        } else if (clickSide === 'right') {
          setHalfSelectedSlots(prev => {
            const newSet = new Set();
            prev.forEach(key => {
              const [, slotId] = key.split('-');
              const slot = slotData?.data?.flatMap(c => c.slots || [])
                .find(s => s._id === slotId);
              const slotHour = parseTimeToHour(slot?.time);

              if (slotHour < hour) {
                newSet.add(key);
              } else if (slotHour === hour && key.endsWith('-left')) {
                newSet.add(key);
              }
            });
            return newSet;
          });

          setSelectedTimes(prev => {
            const newTimes = {};
            Object.entries(prev).forEach(([cid, times]) => {
              const filtered = times.filter(t => parseTimeToHour(t.time) < hour);
              if (filtered.length) newTimes[cid] = filtered;
            });
            return newTimes;
          });

          setSelectedBuisness(prev => prev.filter(t => parseTimeToHour(t.time) < hour));
          setSelectedCourts(prev => prev.map(c => ({
            ...c,
            time: c.time.filter(t => parseTimeToHour(t.time) < hour)
          })).filter(c => c.time.length > 0));
        }

        setSlotError("");
        return;
      }

      const getCurrentDuration = () => {
        let duration = 0;
        selectedCourts.forEach(court => {
          court.time.forEach(slot => {
            if (slot.side === "both" || slot?.duration === 60) {
              duration += 1; // Full slot
            } else {
              duration += 0.5; // Half slot
            }
          });
        });

        const individualHalfKeys = Array.from(halfSelectedSlots).filter(key =>
          key.includes(dateKeyStr) && (key.endsWith('-left') || key.endsWith('-right'))
        );
        const halfSlotGroups = new Map();
        individualHalfKeys.forEach(key => {
          const [courtId, slotId] = key.split('-');
          const groupKey = `${courtId}-${slotId}`;

          const isInSelectedCourts = selectedCourts.some(court =>
            court._id === courtId && court.time.some(slot => slot._id === slotId)
          );

          if (!isInSelectedCourts) {
            if (!halfSlotGroups.has(groupKey)) {
              halfSlotGroups.set(groupKey, { left: false, right: false });
            }
            const group = halfSlotGroups.get(groupKey);
            if (key.endsWith('-left')) group.left = true;
            if (key.endsWith('-right')) group.right = true;
          }
        });
        halfSlotGroups.forEach(group => {
          if (group.left && group.right) {
            duration += 1;
          } else {
            duration += 0.5;
          }
        });
        return duration;
      };

      const currentDuration = getCurrentDuration();
      let projectedDuration = currentDuration;
      if (clickSide === 'right') {
        const leftKey = `${courtId}-${time._id}-${dateKeyStr}-left`;
        const hasLeft = halfSelectedSlots.has(leftKey);
        if (hasLeft) {
          projectedDuration = currentDuration;
        } else {
          projectedDuration = currentDuration + 0.5;
        }
      } else {
        projectedDuration = currentDuration + 0.5;
      }

      if (projectedDuration > 3) {
        showError("Maximum 3 slots already selected.");
        return;
      }

      if (currentDuration >= 2.5 && clickSide === 'right') {
        showError("Maximum slot limit reached. Cannot select right side.");
        return;
      }

      if (clickSide === 'left') {
        const allSelectedHours = getAllSelectedHours();
        if (allSelectedHours.length > 0) {
          const maxSelectedHour = Math.max(...allSelectedHours);
          const minSelectedHour = Math.min(...allSelectedHours);

          if (currentSlotHour < maxSelectedHour) {
            const rightKey = `${courtId}-${time._id}-${dateKeyStr}-right`;
            const hasRight = halfSelectedSlots.has(rightKey);

            if (hasRight) {
              showError("Cannot complete backward slots when forward slots are selected.");
              return;
            }
          }

          if (currentSlotHour === minSelectedHour && allSelectedHours.length > 1) {
            const rightKey = `${courtId}-${time._id}-${dateKeyStr}-right`;
            const hasRight = halfSelectedSlots.has(rightKey);

            if (hasRight && currentDuration >= 1.5) {
              showError("Cannot complete first slot when forward slots are selected.");
              return;
            }
          }
        }
      }

      const isCompletingExistingSlot = halfSelectedSlots.has(otherSideKey);

      const check4thSlotPermission = () => {
        if (currentDuration === 2.5) {
          const allSelectedHours = getAllSelectedHours();
          if (allSelectedHours.length >= 3) {
            const sortedHours = [...allSelectedHours].sort((a, b) => a - b);
            const firstSlotHour = sortedHours[0];
            const firstSlotKeys = Array.from(halfSelectedSlots).filter(key => {
              const [cId, slotId] = key.split('-');
              const slot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);
              return slot && parseTimeToHour(slot.time) === firstSlotHour;
            });

            const isFirstSlotHalf = firstSlotKeys.length === 1;

            if (isFirstSlotHalf && currentSlotHour === sortedHours[2] + 1) {
              const slot4 = slotData?.data?.find(c => c._id === courtId)?.slots?.find(s => s._id === time._id);
              const bookingTime = slot4?.bookingTime?.trim();
              const leftBooked = bookingTime && (/:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime));
              if (clickSide === 'left') {
                const leftKey = `${courtId}-${time._id}-${dateKeyStr}-left`;
                return !halfSelectedSlots.has(leftKey);
              }
              return false;
            }
          }
        }
        return false;
      };

      const is4thSlotAllowed = check4thSlotPermission();

      if (currentDuration >= 3 && !is4thSlotAllowed) {
        showError("Maximum 3 slots already selected.");
        return;
      }

      if (currentDuration >= 2.5 && !isCompletingExistingSlot && !is4thSlotAllowed) {
        showError("Maximum slot duration reached");
        return;
      }

      const checkSequencePattern = () => {
        const allSelectedHours = getAllSelectedHours();

        if (allSelectedHours.length > 0) {
          const firstHour = Math.min(...allSelectedHours);
          const firstSlotKeys = Array.from(halfSelectedSlots).filter(key => {
            const [cId, slotId] = key.split('-');
            const slot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);
            return slot && parseTimeToHour(slot.time) === firstHour;
          });

          const isFirstSlotHalfRight = firstSlotKeys.length === 1 && firstSlotKeys[0].endsWith('-right');

          if (isFirstSlotHalfRight && clickSide === 'right') {
            if (currentDuration >= 2.5) {
              showError("When first slot is half-selected, 4th slot can only be selected from LEFT side.");
              return false;
            }
          }
        }

        return true;
      };

      if (!checkSequencePattern()) {
        return;
      }
      if (isTimeSelectedInOtherCourt(currentSlotHour, courtId)) {
        const hasLeftInSameCourt = halfSelectedSlots.has(leftKey);
        const hasRightInSameCourt = halfSelectedSlots.has(rightKey);

        const currentCourtSlot = slotData?.data?.find(c => c._id === courtId)?.slots?.find(s => parseTimeToHour(s.time) === currentSlotHour);
        if (currentCourtSlot?.bookingTime?.trim()) {
          const bookingTime = currentCourtSlot.bookingTime.trim();
          const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
          const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);

          if ((clickSide === 'left' && leftBooked) || (clickSide === 'right' && rightBooked)) {
            showError("This slot half is already booked in this court.");
            return;
          }
        }

        if (!((clickSide === 'left' && hasRightInSameCourt) || (clickSide === 'right' && hasLeftInSameCourt))) {
          const allCourts = slotData?.data || [];
          let canSelectInOtherCourt = false;

          for (const court of allCourts) {
            if (court._id === courtId) continue;
            const slot = court.slots?.find(s => parseTimeToHour(s.time) === currentSlotHour);
            if (slot && slot.status !== 'booked' && slot.availabilityStatus === 'available') {
              const slotBookingTime = slot.bookingTime?.trim();
              let isHalfBooked = false;

              if (slotBookingTime) {
                const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(slotBookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(slotBookingTime);
                const rightBooked = /:30\s*(AM|PM)?$/i.test(slotBookingTime);
                isHalfBooked = (clickSide === 'left' && leftBooked) || (clickSide === 'right' && rightBooked);
              }

              if (!isHalfBooked) {
                canSelectInOtherCourt = true;
                break;
              }
            }
          }

          if (!canSelectInOtherCourt) {
            showError("This time slot is already selected or blocked.");
            return;
          }
        }
      }

      if (clickSide === 'right') {
        const prevHour = currentSlotHour - 1;
        const prevFullExists = selectedCourts.some(court =>
          court.time.some(slot => parseTimeToHour(slot.time) === prevHour && slot.side === "both")
        );

        if (prevFullExists) {
          setHalfSelectedSlots(prev => {
            const newSet = new Set(prev);
            newSet.add(targetKey); // Add RIGHT
            newSet.add(leftKey);   // Add LEFT
            return newSet;
          });

          const fullEntry = {
            _id: time._id,
            time: time.time,
            amount: getPriceForSlotWrapper(time.time, selectedDate?.day, false, courtId),
            duration: 60,
            side: "both",
            isHalfSlot: false
          };

          const currentCourt = slotData?.data?.find((c) => c._id === courtId);
          setSelectedCourts(prev => {
            const existingCourt = prev.find(c => c._id === courtId);

            if (!existingCourt) {
              const newState = [
                ...prev,
                {
                  _id: currentCourt._id,
                  courtName: currentCourt.courtName,
                  type: currentCourt.type,
                  date: dateKeyStr,
                  day: selectedDate?.day,
                  time: [fullEntry],
                },
              ];
              return newState;
            } else {
              const newState = prev.map(c => {
                if (c._id === courtId) {
                  const filteredTime = c.time.filter(t => t._id !== time._id);
                  const updated = { ...c, time: [...filteredTime, fullEntry] };
                  return updated;
                }
                return c;
              });
              return newState;
            }
          });

          setSlotError("");
          return;
        }
      }
      if (applyContinuityLogic(currentSlotHour, clickSide, courtId)) {
        setSlotError("");
        return;
      }
      if (checkCrossSlotSelection(currentSlotHour, clickSide, courtId)) {
        setSlotError("");
        return;
      }
      if (!autoFillGaps(currentSlotHour, courtId)) {
        return;
      }
      if (halfSelectedSlots.size >= MAX_HALF_SLOTS) {
        showError("Maximum 6 half slots allowed.");
        return;
      }

      setHalfSelectedSlots(prev => {
        const newSet = new Set(prev);
        newSet.add(targetKey);

        // Check if this creates an adjacent LEFT+RIGHT pattern that should be merged
        const dateKeyStr = selectedDate?.fullDate;
        const slotHour = parseTimeToHour(time.time);

        // If clicking LEFT, check if next hour has RIGHT
        if (clickSide === 'left') {
          const nextHour = slotHour + 1;
          const nextSlot = slotData?.data?.find(c => c._id === courtId)?.slots?.find(s => parseTimeToHour(s.time) === nextHour);
          if (nextSlot) {
            const nextRightKey = `${courtId}-${nextSlot._id}-${dateKeyStr}-right`;
            if (newSet.has(nextRightKey)) {
              newSet.add(`${courtId}-${time._id}-${dateKeyStr}-right`);
              newSet.add(`${courtId}-${nextSlot._id}-${dateKeyStr}-left`);
            }
          }
        }

        // If clicking RIGHT, check if prev hour has LEFT
        if (clickSide === 'right') {
          const prevHour = slotHour - 1;
          const prevSlot = slotData?.data?.find(c => c._id === courtId)?.slots?.find(s => parseTimeToHour(s.time) === prevHour);
          if (prevSlot) {
            const prevLeftKey = `${courtId}-${prevSlot._id}-${dateKeyStr}-left`;
            if (newSet.has(prevLeftKey)) {
              newSet.add(`${courtId}-${prevSlot._id}-${dateKeyStr}-right`);
              newSet.add(`${courtId}-${time._id}-${dateKeyStr}-left`);
            }
          }
        }

        // Auto-select adjacent slot logic
        if (showHalfSlots) {
          // Calculate current duration before auto-select
          let currentDuration = 0;
          selectedCourts.forEach(court => {
            court.time.forEach(slot => {
              currentDuration += slot.side === "both" || slot.duration === 60 ? 1 : 0.5;
            });
          });

          const halfSlotGroups = new Map();
          Array.from(newSet).forEach(key => {
            const [cId, sId] = key.split('-');
            const groupKey = `${cId}-${sId}`;
            const isInSelectedCourts = selectedCourts.some(court =>
              court._id === cId && court.time.some(slot => slot._id === sId)
            );

            if (!isInSelectedCourts) {
              if (!halfSlotGroups.has(groupKey)) {
                halfSlotGroups.set(groupKey, { left: false, right: false });
              }
              const group = halfSlotGroups.get(groupKey);
              if (key.endsWith('-left')) group.left = true;
              if (key.endsWith('-right')) group.right = true;
            }
          });

          halfSlotGroups.forEach(group => {
            currentDuration += group.left && group.right ? 1 : 0.5;
          });

          // Only auto-select if it won't exceed 3 slots
          if (currentDuration < 3) {
            const sortedSlots = [...(slotData?.data?.find(c => c._id === courtId)?.slots || [])].sort((a, b) => {
              const hourA = parseTimeToHour(a.time);
              const hourB = parseTimeToHour(b.time);
              return hourA - hourB;
            }) || [];
            const currentIndex = sortedSlots.findIndex(s => s._id === time._id);

            if (clickSide === 'left') {
              // Left clicked - check previous slot and auto-select its right side
              const prevSlot = sortedSlots[currentIndex - 1];
              if (prevSlot && prevSlot.has30MinPrice) {
                const prevRightKey = `${courtId}-${prevSlot._id}-${dateKeyStr}-right`;
                const prevBookingTime = prevSlot.bookingTime?.trim();
                const prevRightBooked = prevBookingTime && /:30\s*(AM|PM)?$/i.test(prevBookingTime);
                if (!halfSelectedSlots.has(prevRightKey) && !prevRightBooked && prevSlot.status !== 'booked' && currentDuration + 0.5 <= 3) {
                  newSet.add(prevRightKey);
                }
              }
            } else {
              // Right clicked - check next slot and auto-select its left side
              const nextSlot = sortedSlots[currentIndex + 1];
              if (nextSlot && nextSlot.has30MinPrice) {
                const nextLeftKey = `${courtId}-${nextSlot._id}-${dateKeyStr}-left`;
                const nextBookingTime = nextSlot.bookingTime?.trim();
                const nextLeftBooked = nextBookingTime && (/:(00|0)\s*(AM|PM)?$/i.test(nextBookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(nextBookingTime));
                if (!halfSelectedSlots.has(nextLeftKey) && !nextLeftBooked && nextSlot.status !== 'booked' && currentDuration + 0.5 <= 3) {
                  newSet.add(nextLeftKey);
                }
              }
            }
          }
        }

        if (newSet.has(leftKey) && newSet.has(rightKey)) {
          const slotToCheck = slotData?.data?.find(c => c._id === courtId)?.slots?.find(s => s._id === time._id);

          if (slotToCheck) {
            const isBooked = slotToCheck?.status === "booked";
            const isDisabled = slotToCheck?.availabilityStatus !== "available";
            const bookingTime = slotToCheck?.bookingTime?.trim();

            let leftHalfBooked = false;
            let rightHalfBooked = false;

            if (bookingTime) {
              leftHalfBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
              rightHalfBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);
            }

            if (isBooked || isDisabled || leftHalfBooked || rightHalfBooked) {
              return newSet;
            }
          }

          newSet.delete(leftKey);
          newSet.delete(rightKey);
          const fullEntry = {
            _id: time._id,
            time: time.time,
            amount: getPriceForSlotWrapper(time.time, selectedDate?.day, false, courtId, time?.duration || 60),
            duration: time?.duration || 60,
            side: "both",
            isHalfSlot: false
          };

          setSelectedTimes(prevTimes => {
            const currentCourtTimes = prevTimes[courtId] || [];
            const filteredTimes = currentCourtTimes.filter(t => t._id !== time._id);
            return {
              ...prevTimes,
              [courtId]: [...filteredTimes, fullEntry]
            };
          });

          const currentCourt = slotData?.data?.find((c) => c._id === courtId);
          setSelectedCourts(prevCourts => {
            const existingCourt = prevCourts.find(c => c._id === courtId);

            if (!existingCourt) {
              return [
                ...prevCourts,
                {
                  _id: currentCourt._id,
                  courtName: currentCourt.courtName,
                  type: currentCourt.type,
                  date: dateKeyStr,
                  day: selectedDate?.day,
                  time: [fullEntry],
                },
              ];
            } else {
              return prevCourts.map(c => {
                if (c._id === courtId) {
                  const filteredTime = c.time.filter(t => t._id !== time._id);
                  return { ...c, time: [...filteredTime, fullEntry] };
                }
                return c;
              });
            }
          });

          return newSet;
        }

        const halfEntry = {
          _id: time._id,
          time: clickSide === 'right' ? time.time.replace(/(\d+)(\s*)(am|pm)/i, (match, hour, space, period) => `${hour}:30${space}${period}`) : time.time,
          amount: getPriceForSlotWrapper(time.time, selectedDate?.day, true, courtId, 30),
          duration: 30,
          side: clickSide,
          isHalfSlot: true
        };

        const currentCourt = slotData?.data?.find((c) => c._id === courtId);

        // Check if this creates adjacent LEFT+RIGHT pattern (reuse slotHour from above)
        let shouldMergeAsFullSlots = false;
        let adjacentSlot = null;

        if (clickSide === 'left') {
          const nextHour = slotHour + 1;
          const nextSlotData = slotData?.data?.find(c => c._id === courtId)?.slots?.find(s => parseTimeToHour(s.time) === nextHour);
          if (nextSlotData) {
            const nextRightKey = `${courtId}-${nextSlotData._id}-${dateKeyStr}-right`;
            if (newSet.has(nextRightKey)) {
              shouldMergeAsFullSlots = true;
              adjacentSlot = nextSlotData;
            }
          }
        } else if (clickSide === 'right') {
          const prevHour = slotHour - 1;
          const prevSlotData = slotData?.data?.find(c => c._id === courtId)?.slots?.find(s => parseTimeToHour(s.time) === prevHour);
          if (prevSlotData) {
            const prevLeftKey = `${courtId}-${prevSlotData._id}-${dateKeyStr}-left`;
            if (newSet.has(prevLeftKey)) {
              shouldMergeAsFullSlots = true;
              adjacentSlot = prevSlotData;
            }
          }
        }

        // CRITICAL: Update selectedCourts IMMEDIATELY when adjacent pattern detected
        setSelectedCourts(prev => {
          const existingCourt = prev.find(c => c._id === courtId);

          if (shouldMergeAsFullSlots && adjacentSlot) {
            // Merge both slots as FULL
            const currentFullEntry = {
              _id: time._id,
              time: time.time,
              amount: getPriceForSlotWrapper(time.time, selectedDate?.day, false, courtId, time?.duration || 60),
              duration: time?.duration || 60,
              side: "both",
              isHalfSlot: false
            };

            const adjacentFullEntry = {
              _id: adjacentSlot._id,
              time: adjacentSlot.time,
              amount: getPriceForSlotWrapper(adjacentSlot.time, selectedDate?.day, false, courtId, adjacentSlot?.duration || 60),
              duration: adjacentSlot?.duration || 60,
              side: "both",
              isHalfSlot: false
            };

            if (!existingCourt) {
              return [
                ...prev,
                {
                  _id: currentCourt._id,
                  courtName: currentCourt.courtName,
                  type: currentCourt.type,
                  date: dateKeyStr,
                  day: selectedDate?.day,
                  time: [currentFullEntry, adjacentFullEntry],
                },
              ];
            } else {
              return prev.map(c => {
                if (c._id === courtId) {
                  // Remove any existing half entries for these slots
                  const filteredTime = c.time.filter(t =>
                    !(t._id === time._id && (t.side === 'left' || t.side === 'right')) &&
                    !(t._id === adjacentSlot._id && (t.side === 'left' || t.side === 'right'))
                  );

                  // Add both as FULL if not already present
                  const hasCurrentFull = filteredTime.some(t => t._id === time._id && t.side === 'both');
                  const hasAdjacentFull = filteredTime.some(t => t._id === adjacentSlot._id && t.side === 'both');

                  const newTime = [...filteredTime];
                  if (!hasCurrentFull) newTime.push(currentFullEntry);
                  if (!hasAdjacentFull) newTime.push(adjacentFullEntry);

                  return { ...c, time: newTime };
                }
                return c;
              });
            }
          } else {
            // Add as half slot
            if (!existingCourt) {
              return [
                ...prev,
                {
                  _id: currentCourt._id,
                  courtName: currentCourt.courtName,
                  type: currentCourt.type,
                  date: dateKeyStr,
                  day: selectedDate?.day,
                  time: [halfEntry],
                },
              ];
            } else {
              return prev.map(c => {
                if (c._id === courtId) {
                  const existingSlot = c.time.find(t => t._id === halfEntry._id && t.side === clickSide);
                  if (existingSlot) {
                    return c;
                  }
                  const updated = { ...c, time: [...c.time, halfEntry] };
                  return updated;
                }
                return c;
              });
            }
          }
        });

        return newSet;
      });

      setSlotError("");
      return;
    }

    // ==================== FULL SLOT LOGIC (60 मिनट डायरेक्ट सलेक्ट) ====================
    const allSelectedHours = getAllSelectedHours();
    if (allSelectedHours?.length > 0) {
      const sortedHours = [...allSelectedHours, currentSlotHour].sort((a, b) => a - b);
      const minHour = sortedHours[0];
      if (currentSlotHour > minHour) {
        for (let hour = minHour; hour < currentSlotHour; hour++) {
          const allCourts = slotData?.data || [];
          let hasFullBookingInSequence = false;
          let hasPartialBookingInSequence = false;

          for (const court of allCourts) {
            const slot = court.slots?.find(s => parseTimeToHour(s.time) === hour);

            if (slot && isPastTime(slot.time, selectedDate?.fullDate)) {
              continue;
            }

            const isUserSelected = Array.from(halfSelectedSlots).some(key => {
              const [cId, slotId] = key.split('-');
              const userSlot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);
              return userSlot && parseTimeToHour(userSlot.time) === hour;
            }) || selectedCourts.some(c => c.time.some(t => parseTimeToHour(t.time) === hour));

            if (isUserSelected) {
              continue;
            }

            if (slot?.bookingTime?.trim()) {
              const bookingTime = slot.bookingTime.trim();
              const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
              const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);

              if ((leftBooked && rightBooked) || slot.status === 'booked') {
                hasFullBookingInSequence = true;
                break;
              }

              if (leftBooked || rightBooked) {
                hasPartialBookingInSequence = true;
              }
            }
          }

          if (hasFullBookingInSequence) {
            showError("Cannot select slot due to booking in sequence.");
            return;
          }

          if (hasPartialBookingInSequence) {
            showError("Cannot select slot due to half-booked slot in sequence.");
            return;
          }
        }
      }
    }
    const isSlotBooked = time?.status === "booked";
    const bookingTime = time?.bookingTime?.trim();
    let hasBookedContent = isSlotBooked;

    if (bookingTime) {
      const leftBooked = /:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime);
      const rightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);

      if (leftBooked && rightBooked) {
        hasBookedContent = true;
      } else if (leftBooked || rightBooked) {
        showError("This slot is half booked and cannot be selected.");
        return;
      }
    }

    if (hasBookedContent) {
      showError("This slot is already booked and cannot be selected.");
      return;
    }

    const isSlotSelected = currentCourtTimes.some(t => t._id === time._id);
    if (isSlotSelected) {
      const hour = currentSlotHour;
      const isEarliest = isFirstSlot(hour);

      if (isEarliest) {
        setHalfSelectedSlots(new Set());
        setSelectedTimes({});
        setSelectedBuisness([]);
        setSelectedCourts([]);
        setShowHalfSlots(false);
      } else {
        setSelectedTimes(prev => {
          const newTimes = {};
          Object.entries(prev).forEach(([cid, times]) => {
            const filtered = times.filter(t => parseTimeToHour(t.time) < hour);
            if (filtered.length) newTimes[cid] = filtered;
          });
          return newTimes;
        });

        setSelectedBuisness(prev => prev.filter(t => parseTimeToHour(t.time) < hour));
        setSelectedCourts(prev => prev.map(c => ({
          ...c,
          time: c.time.filter(t => parseTimeToHour(t.time) < hour)
        })).filter(c => c.time.length > 0));
      }
      setSlotError("");
      return;
    }

    if (isTimeSelectedInOtherCourt(currentSlotHour, courtId)) {
      showError("This time slot is already selected.");
      return;
    }

    if (!autoFillGaps(currentSlotHour, courtId)) {
      return;
    }

    const slotDuration = time?.duration || 60;

    const fullEntry = {
      _id: time?._id,
      time: time?.time,
      amount: getPriceForSlotWrapper(time?.time, selectedDate?.day, false, courtId, slotDuration),
      duration: slotDuration,
      side: "both",
      originalDuration: slotDuration
    };

    updateSelectedBusinessAndCourts([...currentCourtTimes, fullEntry], courtId, [fullEntry]);
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
