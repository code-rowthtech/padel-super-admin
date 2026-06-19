import React, { useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import {
  MdOutlineArrowForwardIos,
  MdOutlineDateRange,
  MdOutlineArrowBackIosNew,
} from "react-icons/md";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import MatchPlayer from "./MatchPlayer";
import {
  isPastTime,
  formatTimeForDisplay,
  useCreateMatchesLogic,
  isAfterClosingTime
} from "./CreateMatchesLogic";
import { getOwnerRegisteredClub, getAdminHalfSlotPrice, getAdminSlotBooking } from "../../../../redux/thunks";
import { DataLoading } from "../../../../helpers/loading/Loaders";
import { FaArrowLeftLong } from "react-icons/fa6";
import { getOwnerFromSession } from "../../../../helpers/api/apiCore";
import { useSelector } from "react-redux";
import { parseTimeToHour, parseTimeToHalfHour, shouldDisableSlotByDuration, isSlotDurationDisabled, isSlotDurationDisabledMultiple } from "../../../../utils/formatters";
import { buildSlotWiseQueryKey, createSlotWiseSocket } from "../../../../utils/slotWiseSocket";
import { setSlotWiseDataFromSocket } from "../../../../redux/admin/manualBooking/slice";
import { getCurrentISTDate, toLocalDateString, dateOnlyToLocalDate } from "../../../../utils/dateUtils";
import { ownerApi } from "../../../../helpers/api/apiCore";
import { GET_CATEGORY_LIST, SUPER_ADMIN_GET_ALL_CLUBS } from "../../../../helpers/api/apiEndpoint";


const getMinDateForBooking = () => {
  const now = new Date();
  const CLOSING_TIME_HOUR = 22;
  const CLOSING_TIME_MINUTE = 15;

  const isAfterClosingTime =
    now.getHours() > CLOSING_TIME_HOUR ||
    (now.getHours() === CLOSING_TIME_HOUR &&
      now.getMinutes() >= CLOSING_TIME_MINUTE);

  if (isAfterClosingTime) {
    const nextDay = new Date(now);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  }

  return now;
};

const getEntityId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const CreateMatches = ({ isModal = false, onClose = null, initialClubId = null, onAddPlayerToggle = null }) => {
  const selectedCourtsRef = React.useRef([]);
  const selectedTimesRef = React.useRef({});
  const halfSelectedSlotsRef = React.useRef(new Set());

  const {
    selectedDate,
    setSelectedDate,
    startDate,
    setStartDate,
    isOpen,
    setIsOpen,
    wrapperRef,
    dateRefs,
    selectedCourts,
    setSelectedCourts,
    selectedTimes,
    setSelectedTimes,
    halfSelectedSlots,
    setHalfSelectedSlots,
    showUnavailable,
    setShowUnavailable,
    currentCourtId,
    setCurrentCourtId,
    slotError,
    setSlotError,
    setSelectedBuisness,
    matchPlayer,
    setMatchPlayer,
    addedPlayers,
    setAddedPlayers,
    showHalfSlots,
    scrollRef,
    slotPrice,
    slotData,
    slotLoading,
    getPriceForSlotWrapper,
    updateSelectedBusinessAndCourts,
    getAllSelectedSlots,
    toggleTime,
    grandTotal,
    has30MinPrices,
    dispatch,
    navigate,
    location,
  } = useCreateMatchesLogic();
  React.useEffect(() => { selectedCourtsRef.current = selectedCourts; }, [selectedCourts]);
  React.useEffect(() => { selectedTimesRef.current = selectedTimes; }, [selectedTimes]);
  React.useEffect(() => { halfSelectedSlotsRef.current = halfSelectedSlots; }, [halfSelectedSlots]);

  const { ownerClubData } = useSelector((s) => s.manualBooking);
  const [superAdminClubs, setSuperAdminClubs] = React.useState([]);
  const [allCategories, setAllCategories] = React.useState([]);
  const [clubsLoading, setClubsLoading] = React.useState(false);
  const [selectedClubId, setSelectedClubId] = React.useState(initialClubId || location?.state?.clubId || "");
  const [selectedLocationId, setSelectedLocationId] = React.useState("");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState("");
  const selectedClub = useMemo(
    () => superAdminClubs.find((club) => String(club?._id) === String(selectedClubId)),
    [superAdminClubs, selectedClubId],
  );
  const locationOptions = selectedClub?.locations || [];
  const selectedLocation = useMemo(
    () => locationOptions.find((item) => String(getEntityId(item)) === String(selectedLocationId)),
    [locationOptions, selectedLocationId],
  );
  const categoryOptions = selectedLocation?.categories || selectedClub?.categories || [];
  const activeLocationId = selectedLocationId;
  const activeCategoryId = selectedCategoryId;
  const owner = getOwnerFromSession();
  const ownerId = owner?.generatedBy || owner?._id;
  const savedClubId = selectedClubId || ownerClubData?.[0]?._id;
  const categoryNameById = useMemo(
    () => allCategories.reduce((acc, category) => {
      acc[String(category._id)] = category.name;
      return acc;
    }, {}),
    [allCategories],
  );
  const getCategoryLabel = (item, index) => {
    const id = getEntityId(item);
    return item?.name ||
      item?.categoryName ||
      item?.title ||
      item?.type ||
      categoryNameById[String(id)] ||
      `Category ${index + 1}`;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchSuperAdminData = async () => {
      setClubsLoading(true);
      try {
        const [clubsRes, categoriesRes] = await Promise.all([
          ownerApi.get(SUPER_ADMIN_GET_ALL_CLUBS),
          ownerApi.get(`${GET_CATEGORY_LIST}?limit=100`),
        ]);
        const res = clubsRes;
        const list = res.data?.data || [];
        if (!isMounted) return;
        setSuperAdminClubs(list);
        setAllCategories(categoriesRes.data?.data || []);
        if (!selectedClubId && list.length > 0) {
          setSelectedClubId(list[0]._id);
        }
      } catch (error) {
        console.error("Failed to load clubs for open match creation", error);
      } finally {
        if (isMounted) setClubsLoading(false);
      }
    };

    fetchSuperAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedClubId) {
      setSelectedLocationId("");
      setSelectedCategoryId("");
      return;
    }

    const firstLocationId = getEntityId(locationOptions[0]);
    const selectedLocationStillExists = locationOptions.some(
      (item) => String(getEntityId(item)) === String(selectedLocationId),
    );

    if (!selectedLocationStillExists) {
      setSelectedLocationId(firstLocationId || "");
    }
  }, [selectedClubId, locationOptions, selectedLocationId]);

  useEffect(() => {
    const firstCategoryId = getEntityId(categoryOptions[0]);
    const selectedCategoryStillExists = categoryOptions.some(
      (item) => String(getEntityId(item)) === String(selectedCategoryId),
    );

    if (!selectedCategoryStillExists) {
      setSelectedCategoryId(firstCategoryId || "");
    }
  }, [categoryOptions, selectedCategoryId]);

  useEffect(() => {
    if (selectedClubId) {
      dispatch(getOwnerRegisteredClub({ register_club_id: selectedClubId }));
    } else {
      dispatch(getOwnerRegisteredClub({ ownerId }));
    }

    const clearCreateMatchesData = () => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('createMatches_')) {
          localStorage.removeItem(key);
        }
      });
    };

    return () => {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/create-matches')) {
        clearCreateMatchesData();
      }
    };
  }, [location.pathname]);

  const today = getMinDateForBooking();
  const dates = Array.from({ length: 41 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      fullDate: toLocalDateString(date),
    };
  });

  const hasAvailableSlots = slotData?.data?.some((court) =>
    court?.slots?.some((slot) => {
      const isHalfBooked = false;

      const isFullBooked = slot?.status === "booked";

      const basicFilter = showUnavailable
        ? true
        : (
          slot?.availabilityStatus === "available" &&
          !isFullBooked &&
          !isPastTime(slot?.time, selectedDate?.fullDate)
        ) || isHalfBooked;

      return basicFilter;
    })
  );

  const dayShortMap = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };

  const maxSelectableDate = new Date(today);
  maxSelectableDate.setDate(maxSelectableDate.getDate() + 15);

  useEffect(() => {
    if (
      selectedDate?.fullDate &&
      dateRefs.current[selectedDate?.fullDate]
    ) {
      dateRefs.current[selectedDate?.fullDate].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedDate]);

  useEffect(() => {
    const clubId = ownerClubData?.[0]?._id;
    if (!clubId) return;
    if (!activeLocationId) return;
    if (!selectedCategoryId) return;
    if (!selectedDate) return;

    const bookingSocket = createSlotWiseSocket();

    const slotWiseQuery = {
      register_club_id: clubId,
      day: selectedDate?.day,
      date: selectedDate?.fullDate,
      locations: activeLocationId,
      categoryId: activeCategoryId,
    };
    const queryKey = buildSlotWiseQueryKey(slotWiseQuery);

    const handleConnect = () => {
      bookingSocket.emit(
        "slotWise:subscribe",
        { query: slotWiseQuery, queryKey },
        (ack) => {
          if (ack?.success && Array.isArray(ack?.data)) {
            dispatch(setSlotWiseDataFromSocket({ data: ack.data }));
          }
        }
      );
    };

    const handleSlotWiseData = (payload) => {
      if (!payload) return;
      if (String(payload?.date) !== String(selectedDate?.fullDate)) return;

      const payloadClubId = String(payload?.clubId || "");
      if (payloadClubId) {
        const parts = payloadClubId.split(",").map((s) => s.trim()).filter(Boolean);
        if (parts.length > 0 && !parts.includes(String(clubId))) return;
      }

      if (payload?.queryKey && String(payload.queryKey) !== String(queryKey)) return;
      if (Array.isArray(payload?.data)) {
        const lockedSlots = payload.data.flatMap(court =>
          court.slots.filter(slot => slot.status === "lock").map(slot => ({ ...slot, courtId: court._id }))
        );
        if (lockedSlots.length > 0) {
          const dateKey = selectedDate?.fullDate;
          const keysToRemove = [];

          const updatedCourts = selectedCourtsRef.current
            .map(court => ({
              ...court,
              time: court.time.filter(selectedSlot => {
                const isLocked = lockedSlots.some(locked =>
                  String(locked._id) === String(selectedSlot._id)
                );
                if (isLocked) {
                  keysToRemove.push(`${court._id}-${selectedSlot._id}-${dateKey}-left`);
                  keysToRemove.push(`${court._id}-${selectedSlot._id}-${dateKey}-right`);
                }
                return !isLocked;
              })
            }))
            .filter(court => court.time.length > 0);

          const updatedTimes = { ...selectedTimesRef.current };
          for (const courtId in updatedTimes) {
            updatedTimes[courtId] = updatedTimes[courtId].filter(selectedSlot => {
              const isLocked = lockedSlots.some(locked =>
                String(locked._id) === String(selectedSlot._id)
              );
              if (isLocked) {
                keysToRemove.push(`${courtId}-${selectedSlot._id}-${dateKey}-left`);
                keysToRemove.push(`${courtId}-${selectedSlot._id}-${dateKey}-right`);
              }
              return !isLocked;
            });
            if (updatedTimes[courtId].length === 0) delete updatedTimes[courtId];
          }

          localStorage.setItem(`createMatches_selectedCourts_${dateKey}`, JSON.stringify(updatedCourts));
          localStorage.setItem(`createMatches_selectedTimes_${dateKey}`, JSON.stringify(updatedTimes));

          setSelectedCourts(updatedCourts);
          setSelectedTimes(updatedTimes);

          if (keysToRemove.length > 0) {
            setHalfSelectedSlots(prev => {
              const newSet = new Set(prev);
              keysToRemove.forEach(key => newSet.delete(key));
              // Sync updated halfSelectedSlots to localStorage too
              const updatedHalfArr = Array.from(newSet);
              localStorage.setItem(`createMatches_halfSelectedSlots_${dateKey}`, JSON.stringify(updatedHalfArr));
              return newSet;
            });
          }
        }

        // Dispatch AFTER updating localStorage so the useLayoutEffect
        // restoration triggered by slotData change reads the correct data.
        dispatch(setSlotWiseDataFromSocket(payload));
      }
    };

    bookingSocket.on("connect", handleConnect);
    bookingSocket.on("slotWise:data", handleSlotWiseData);

    if (bookingSocket.connected) {
      handleConnect();
    }

    return () => {
      bookingSocket.off("connect", handleConnect);
      bookingSocket.off("slotWise:data", handleSlotWiseData);
      bookingSocket.disconnect();
    };
  }, [dispatch, ownerClubData?.[0]?._id, selectedDate?.fullDate, selectedDate?.day, activeLocationId, activeCategoryId]);



  useEffect(() => {
  }, [slotData]);

  useEffect(() => {
    if (!selectedDate?.fullDate) return;
    setSelectedCourts([]);
    setSelectedTimes({});
    setSelectedBuisness([]);
    setHalfSelectedSlots(new Set());
    setSlotError("");
    window.isFirstSlotAfterDateChange = true;
  }, [selectedDate?.fullDate, activeLocationId, activeCategoryId]);

  useEffect(() => {
    if (savedClubId && selectedDate?.day && selectedDate?.fullDate) {
      dispatch(
        getAdminSlotBooking({
          register_club_id: savedClubId,
          day: selectedDate.day,
          date: selectedDate.fullDate,
          courtId: currentCourtId || "",
          categoryId: selectedCategoryId,
          location: activeLocationId
        })
      );
      dispatch(
        getAdminHalfSlotPrice({
          day: selectedDate.day,
          register_club_id: savedClubId,
          categoryId: selectedCategoryId,
          location: activeLocationId
        })
      );
    }
  }, [
    selectedDate?.day,
    selectedDate?.fullDate,
    currentCourtId,
    savedClubId,
    selectedCategoryId,
    activeLocationId,
    dispatch,
  ]);

  useEffect(() => {
    if (
      slotData?.data?.length > 0 &&
      slotData.data[0]?.courts?.length > 0 &&
      selectedCourts?.length === 0
    ) {
      const firstCourt = slotData?.data[0]?.courts[0];
      setCurrentCourtId(firstCourt._id);
    }
  }, [slotData, selectedDate?.fullDate]);


  useEffect(() => {
    if (slotError) {
      const timer = setTimeout(() => setSlotError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [slotError]);

  useEffect(() => {
    const totalSelected = Object.values(selectedTimes).flat().length;
    const totalHalfSelected = halfSelectedSlots.size;
    const effectiveSlotCount = totalHalfSelected > 0
      ? totalHalfSelected * 0.5
      : totalSelected;
    const tooltip = document.getElementById('slot-limit-tooltip-create') || (() => {
      const newTooltip = document.createElement('div');
      newTooltip.id = 'slot-limit-tooltip-create';
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
      `;
      document.body.appendChild(newTooltip);
      return newTooltip;
    })();

    const handleMouseEnter = (e,) => {


      if (window.innerWidth <= 768) return;

      const button = e.currentTarget;
      const isSelected = button.style.background.includes('linear-gradient');

      if (!isSelected) {
        if (effectiveSlotCount >= 3.0) {
          tooltip.textContent = `Maximum 3.0 slots limit reached`;
          tooltip.style.display = 'block';
          tooltip.style.left = e.clientX + 10 + 'px';
          tooltip.style.top = e.clientY - 30 + 'px';
        }
      }
    };


    const handleMouseMove = (e) => {
      if (window.innerWidth <= 768) return;

      if (effectiveSlotCount >= 3.0 && tooltip.style.display === 'block') {
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
  }, [selectedTimes, halfSelectedSlots]);

  const getCurrentMonth = (selectedDate) => {
    if (!selectedDate || !selectedDate.fullDate) return "MONTH";
    const dateObj = new Date(selectedDate.fullDate);
    const month = dateObj
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    return month.split("").join("\n");
  };

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  const scrollToSelectedDate = (dateKey) => {
    const dateElement = dateRefs.current[dateKey];
    if (dateElement && scrollRef.current) {
      const container = scrollRef.current;
      const elementLeft = dateElement.offsetLeft;
      const elementWidth = dateElement.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = elementLeft - (containerWidth / 2) + (elementWidth / 2);

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });
    }
  };

  const selectedSlotDuration = useMemo(() => {
    const selectedDurations = new Set();

    // Get durations from selectedCourts (like user booking page)
    selectedCourts.forEach(court => {
      if (court.time && court.time.length > 0) {
        court.time.forEach(slot => {
          // Get the actual slot duration from slotData
          const courtData = slotData?.data?.find(c => c._id === court._id);
          const slotObj = courtData?.slots?.find(s => s._id === slot._id || s._id === slot.originalId);
          if (slotObj?.duration) {
            selectedDurations.add(slotObj.duration);
          }
        });
      }
    });

    return selectedDurations;
  }, [selectedCourts, slotData]);

  const renderSlotButton = (slot, index, courtId) => {
    const dateKey = selectedDate?.fullDate;
    const currentCourtTimes = selectedTimes[courtId] || [];
    const isSlotSelected = currentCourtTimes.some(t => t?._id === slot?._id);
    const leftKey = `${courtId}-${slot._id}-${dateKey}-left`;
    const rightKey = `${courtId}-${slot._id}-${dateKey}-right`;
    const leftHalf = halfSelectedSlots.has(leftKey);
    const rightHalf = halfSelectedSlots.has(rightKey);
    const hasThirtyMinPrice = slot?.has30MinPrice === true;
    const price = getPriceForSlotWrapper(slot?.time, selectedDate?.day, false, courtId, slot?.duration || 60);

    const isTimeSelectedInOtherCourt = Object.entries(selectedTimes).some(([otherCourtId, times]) => {
      if (otherCourtId === courtId) return false;
      return times.some(time => time?.time === slot?.time);
    }) || Array.from(halfSelectedSlots).some(key => {
      const [cId, slotId] = key.split('-');
      if (cId === courtId) return false;

      const slotFromKey = slotData?.data?.find(court =>
        court._id === cId || court.courts?.some(c => c._id === cId)
      )?.courts?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId) ||
        slotData?.data?.find(court => court._id === cId)?.slots?.find(s => s._id === slotId);

      return slotFromKey && parseTimeToHour(slotFromKey.time) === parseTimeToHour(slot?.time);
    });

    const getAllSelectedTimes = () => {
      const allTimes = [];

      Object.entries(selectedTimes).forEach(([cId, times]) => {
        times.forEach(t => {
          const hour = parseTimeToHour(t.time);
          if (hour !== null) allTimes.push(hour);
        });
      });

      halfSelectedSlots.forEach(key => {
        const [cId, slotId] = key.split('-');
        const slot = slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);
        if (slot) {
          const hour = parseTimeToHour(slot.time);
          if (hour !== null && !allTimes.includes(hour)) {
            allTimes.push(hour);
          }
        }
      });

      return allTimes.sort((a, b) => a - b);
    };

    const getAllSelectedHalfHours = () => {
      const halfHours = new Set();

      // Full / 60-min slots
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
            halfHours.add(hour * 2);       // e.g. 7:00 → 14
            halfHours.add(hour * 2 + 1);   //       → 15
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
        const slot = slotData?.data
          ?.find(c => c._id === cId || c.courts?.some(cc => cc._id === cId))
          ?.courts?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId)
          || slotData?.data?.find(c => c._id === cId)?.slots?.find(s => s._id === slotId);

        if (!slot) return;
        const hour = parseTimeToHour(slot.time);
        if (hour === null) return;

        const isLeft = key.endsWith('-left');
        const base = hour * 2;
        if (isLeft) {
          halfHours.add(base);     // :00 – :30
        } else {
          halfHours.add(base + 1); // :30 – :00
        }
      });

      return Array.from(halfHours).sort((a, b) => a - b);
    };

    const isSlotGloballyAllowed = () => {
      const selectedHalfHours = getAllSelectedHalfHours();

      if (selectedHalfHours.length === 0) return true;

      const slotHalfHours = [];
      if (slot?.duration === 90) {
        const halfHour = parseTimeToHalfHour(slot?.time);
        if (halfHour === null) return false;
        slotHalfHours.push(halfHour, halfHour + 1, halfHour + 2);
      } else if (slot?.duration === 30 || hasThirtyMinPrice) {
        const slotHour = parseTimeToHour(slot?.time);
        if (slotHour === null) return false;
        const base = slotHour * 2;
        slotHalfHours.push(base, base + 1);
      } else {
        // 60 min
        const slotHour = parseTimeToHour(slot?.time);
        if (slotHour === null) return false;
        const base = slotHour * 2;
        slotHalfHours.push(base, base + 1);
      }

      const minHalf = Math.min(...selectedHalfHours);
      const maxHalf = Math.max(...selectedHalfHours);

      // Already touching the existing block?
      const touchesExisting = slotHalfHours.some(h => selectedHalfHours.includes(h));

      // Or exactly next to the block (forward OR backward)?
      const startsRightAfter = slotHalfHours[0] === maxHalf + 1;
      const endsRightBefore = slotHalfHours[slotHalfHours.length - 1] === minHalf - 1;

      return touchesExisting || startsRightAfter || endsRightBefore;
    };

    const isSequentiallyDisabled = !isSlotGloballyAllowed();
    const isFullyBooked = slot?.status === "booked" || slot?.status === "lock";
    const isStatusBooked = slot?.status === "booked" || slot?.status === "lock";

    const displayedSlotCount = (() => {
      let totalSlots = 0;
      const dateKey = selectedDate?.fullDate;

      const halfSlotsByTime = new Map();
      halfSelectedSlots.forEach(key => {
        if (!key.includes(dateKey)) return;

        const [courtId, slotId, , side] = key.split('-');
        const courtData = slotData?.data?.find(c => c._id === courtId);
        const slotFromKey = courtData?.slots?.find(s => s._id === slotId);

        if (slotFromKey && (side === 'left' || side === 'right')) {
          const slotTime = parseTimeToHour(slotFromKey.time);
          if (slotTime !== null) {
            if (!halfSlotsByTime.has(slotTime)) {
              halfSlotsByTime.set(slotTime, { left: [], right: [] });
            }
            const timeGroup = halfSlotsByTime.get(slotTime);
            if (timeGroup && timeGroup[side]) {
              timeGroup[side].push({ courtId, slotId, key });
            }
          }
        }
      });

      Object.entries(selectedTimes).forEach(([courtId, times]) => {
        times.forEach(time => {
          const leftKey = `${courtId}-${time._id}-${dateKey}-left`;
          const rightKey = `${courtId}-${time._id}-${dateKey}-right`;
          const leftHalf = halfSelectedSlots.has(leftKey);
          const rightHalf = halfSelectedSlots.has(rightKey);
          const slotTime = parseTimeToHour(time.time);
          const timeGroup = halfSlotsByTime.get(slotTime);
          const hasLeftAcrossCourts = timeGroup?.left?.length > 0;
          const hasRightAcrossCourts = timeGroup?.right?.length > 0;

          if (hasLeftAcrossCourts && hasRightAcrossCourts) {
            totalSlots += 1;
          } else if ((leftHalf && rightHalf) || (!leftHalf && !rightHalf)) {
            totalSlots += 1;
          } else {
            totalSlots += 0.5;
          }
        });
      });

      halfSelectedSlots.forEach(key => {
        if (!key.includes(dateKey)) return;

        const [courtId, slotId, , side] = key.split('-');
        const otherSide = side === 'left' ? 'right' : 'left';
        const otherKey = `${courtId}-${slotId}-${dateKey}-${otherSide}`;

        if (!halfSelectedSlots.has(otherKey)) {
          const isInSelectedTimes = Object.entries(selectedTimes).some(([cId, times]) =>
            cId === courtId && times.some(time => time._id === slotId)
          );

          if (!isInSelectedTimes) {
            const courtData = slotData?.data?.find(c => c._id === courtId);
            const slotFromKey = courtData?.slots?.find(s => s._id === slotId);

            if (slotFromKey) {
              const slotTime = parseTimeToHour(slotFromKey.time);
              const timeGroup = halfSlotsByTime.get(slotTime);
              const hasLeftAcrossCourts = timeGroup?.left?.length > 0;
              const hasRightAcrossCourts = timeGroup?.right?.length > 0;

              if (!(hasLeftAcrossCourts && hasRightAcrossCourts)) {
                totalSlots += 0.5;
              }
            }
          }
        }
      });

      return totalSlots;
    })();

    const getMaxSlotsForDuration = (slotTime, day = selectedDate?.day) => {
      if (!slotPrice || !Array.isArray(slotPrice) || slotPrice.length === 0) return { maxSlots: 3, isDuration30: false };

      const slotHour = parseTimeToHour(slotTime);
      if (slotHour === null) return { maxSlots: 3, isDuration30: false };

      let period = "morning";
      if (slotHour >= 17) period = "evening";
      else if (slotHour >= 12) period = "afternoon";

      const priceEntry = slotPrice.find(
        p => p.day === day && p.timePeriod === period && p.duration === 30
      );

      if (priceEntry) {
        return { maxSlots: 6, isDuration30: true };
      }

      return { maxSlots: 3, isDuration30: false };
    };

    const has90MinSlotSelected = selectedCourts.some(c => c.time.some(t => t.duration === 90 || t.originalDuration === 90));
    const is90MinSlot = slot?.duration === 90;
    const { maxSlots } = getMaxSlotsForDuration(slot?.time, selectedDate?.day);
    const isLimitReachedForNewSlots = (() => {
      if (isSlotSelected || leftHalf || rightHalf) {
        return false;
      }

      // Check 90-minute slot limit (max 2)
      if (is90MinSlot && has90MinSlotSelected) {
        const count90MinSlots = selectedCourts.reduce((count, court) => {
          return count + court.time.filter(t => t.duration === 90 || t.originalDuration === 90).length;
        }, 0);
        if (count90MinSlots >= 2) {
          return true;
        }
      }

      if (maxSlots === 6) {
        const totalHalfSlots = halfSelectedSlots.size;
        if (totalHalfSlots >= 6) {
          return true;
        }
        if (hasThirtyMinPrice) {
          return displayedSlotCount + 0.5 > 3.0;
        } else {
          return displayedSlotCount + 1.0 > 3.0;
        }
      } else {
        if (displayedSlotCount >= 3.0) {
          return true;
        }
        if (hasThirtyMinPrice) {
          return displayedSlotCount + 0.5 > 3.0;
        } else {
          return displayedSlotCount + 1.0 > 3.0;
        }
      }
    })();
    const has60Or30MinSelected = selectedCourts.some(c => c.time.some(t => t.duration === 60 || t.duration === 30 || !t.duration));
    const is90MinSelected = selectedCourts.some(c => c._id === courtId && c.time.some(t => t._id === slot._id && t.duration === 90));
    const isSlotSelectedOrFull = isSlotSelected || is90MinSelected;

    // Block slots based on 90-min logic
    let isDisabledDueTo90Min = false;
    if (has90MinSlotSelected && is90MinSlot && !is90MinSelected) {
      // 90-min slot selected: only disable if we already have 2
      const count90MinSlots = selectedCourts.reduce((count, court) => {
        return count + court.time.filter(t => t.duration === 90 || t.originalDuration === 90).length;
      }, 0);
      if (count90MinSlots >= 2) {
        isDisabledDueTo90Min = true;
      }
    } else if (has60Or30MinSelected && is90MinSlot && !is90MinSelected) {
      // 60/30-min slot selected: disable 90-min slots
      isDisabledDueTo90Min = true;
    }

    let isDisabled = (slot?.availabilityStatus !== "available" || isPastTime(slot?.time, selectedDate?.fullDate) || isTimeSelectedInOtherCourt || isSequentiallyDisabled || isFullyBooked || isLimitReachedForNewSlots || isStatusBooked || isDisabledDueTo90Min || isSlotDurationDisabledMultiple(slot?.duration, selectedSlotDuration)) && !isSlotSelectedOrFull;

    if (!isSlotSelected && isPastTime(slot?.time, selectedDate?.fullDate)) {
      return null;
    }

    const isBookedFor60Min = slot?.status === "booked" || slot?.status === "lock" || slot?.status === "tournament" && slot?.duration === 60;
    const bookingTime = slot?.bookingTime?.trim();

    let shouldDisableLeftClick = false;
    let shouldDisableRightClick = false;

    if (isBookedFor60Min && bookingTime) {
      const isRightBooked = /:30\s*(AM|PM)?$/i.test(bookingTime);
      const isLeftBooked = (/:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime));

      if (isRightBooked) {
        shouldDisableRightClick = true;
      } else if (isLeftBooked) {
        shouldDisableLeftClick = true;
      }
    }

    const isSlotBookedFor30Min = slot?.duration === 30 && (bookingTime);
    if (isSlotBookedFor30Min) {
      const isLeftBooked = (bookingTime && (/:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime)));
      const isRightBooked = (bookingTime && /:30\s*(AM|PM)?$/i.test(bookingTime));
      shouldDisableLeftClick = isLeftBooked;
      shouldDisableRightClick = isRightBooked;
    }

    const getBackground = () => {
      if (!hasThirtyMinPrice) {
        return isSlotSelectedOrFull
          ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"
          : "#FFFFFF";
      }

      // Check if this is a full slot (both halves selected)
      const isFullSlot = isSlotSelectedOrFull && currentCourtTimes.find(t => t._id === slot._id)?.side === "both";
      if (isFullSlot || (leftHalf && rightHalf)) {
        return "linear-gradient(180deg, #0034E4 0%, #001B76 100%)";
      }

      if (isSlotBookedFor30Min || isBookedFor60Min) {
        // Both sides booked - full grey
        if (shouldDisableLeftClick && shouldDisableRightClick) {
          return "#F6E7E7";
        }
        if (shouldDisableLeftClick) {
          return rightHalf ? "linear-gradient(to right, #F6E7E7 50%, #0034E4 50%)" : "linear-gradient(to right, #F6E7E7 50%, #FFFFFF 50%)";
        }
        if (shouldDisableRightClick) {
          return leftHalf ? "linear-gradient(to right, #0034E4 50%, #F6E7E7 50%)" : "linear-gradient(to right, #FFFFFF 50%, #F6E7E7 50%)";
        }
      }

      // Single half selections
      if (leftHalf && !rightHalf) {
        return "linear-gradient(to right, #0034E4 50%, #FFFFFF 50%)";
      }
      if (rightHalf && !leftHalf) {
        return "linear-gradient(to right, #FFFFFF 50%, #0034E4 50%)";
      }

      return "#FFFFFF";
    };

    const handleClick = (e) => {
      if (isDisabled) return;

      const isDeselecting = isSlotSelected || leftHalf || rightHalf;

      if (!isDeselecting) {
        const { maxSlots } = getMaxSlotsForDuration(slot?.time, selectedDate?.day);

        if (maxSlots === 6) {
          const totalHalfSlots = halfSelectedSlots.size;
          if (totalHalfSlots >= 6) {
            setSlotError("Maximum 6 half slots (3.0 slots) allowed.");
            return;
          }
          if (hasThirtyMinPrice) {
            if (displayedSlotCount + 0.5 > 3.0) {
              setSlotError("Maximum 3.0 slots allowed.");
              return;
            }
          } else {
            if (displayedSlotCount + 1.0 > 3.0) {
              setSlotError("Maximum 3.0 slots allowed.");
              return;
            }
          }
        } else {
          if (displayedSlotCount >= 3.0) {
            setSlotError("Maximum 3.0 slots allowed.");
            return;
          }
          if (hasThirtyMinPrice) {
            if (displayedSlotCount + 0.5 > 3.0) {
              setSlotError("Maximum 3.0 slots allowed.");
              return;
            }
          } else {
            if (displayedSlotCount + 1.0 > 3.0) {
              setSlotError("Maximum 3.0 slots allowed.");
              return;
            }
          }
        }
      }

      if (hasThirtyMinPrice) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickSide = (e.clientX - rect.left) < rect.width / 2 ? "left" : "right";

        if ((clickSide === "left" && shouldDisableLeftClick) ||
          (clickSide === "right" && shouldDisableRightClick)) {
          return;
        }

        toggleTime(slot, courtId, dateKey, clickSide);
      } else {
        toggleTime(slot, courtId, dateKey, null);
      }
    };
    return (
      <div key={index} className="col-3 col-sm-3 col-md-3 col-lg-2 mb-2">
        <button
          className="btn rounded-2 w-100 text-nowrap slot-time-btn position-relative overflow-hidden"
          disabled={isDisabled}
          title={isLimitReachedForNewSlots ? "Maximum 3.0 slots limit reached" : ""}
          onClick={handleClick}
          style={{
            background: isDisabled ? "#F6E7E7" : getBackground(),
            cursor: isDisabled ? "not-allowed" : "pointer",
            opacity: isDisabled ? 0.6 : 1,
            border: "1px solid #dee2e6",
            borderLeft: isDisabled || (shouldDisableLeftClick && shouldDisableRightClick) ? "3px solid #E25449" : "3px solid #0034E4",
            borderRadius: "12px",
            height: "68px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative"
          }}
        >
          {has30MinPrices && hasThirtyMinPrice && showHalfSlots && !(leftHalf && rightHalf) && !(isSlotSelected && currentCourtTimes.find(t => t._id === slot._id)?.side === "both") && (
            <div
              className="half-slot-divider"
              style={{
                position: "absolute",
                left: "50%",
                top: "0px",
                height: "52px",
                width: "0.5px",
                backgroundColor: "#ccd1e2ff",
                transform: "translateX(-50%)",
                zIndex: 1
              }}
            />
          )}
          {hasThirtyMinPrice && shouldDisableLeftClick && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "50%",
                height: "100%",
                backgroundColor: "#F6E7E7",
                zIndex: 2,
                pointerEvents: "none"
              }}
            />
          )}
          {hasThirtyMinPrice && shouldDisableRightClick && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "50%",
                height: "100%",
                backgroundColor: "#F6E7E7",
                zIndex: 2,
                pointerEvents: "none"
              }}
            />
          )}
          {hasThirtyMinPrice ? (
            (leftHalf || rightHalf || isSlotSelected) ? (
              (leftHalf && rightHalf) || (isSlotSelected && currentCourtTimes.find(t => t._id === slot._id)?.side === "both") ? (
                <>
                  <span style={{ fontWeight: 600, fontSize: "14px", color: "white" }}>
                    {formatTimeForDisplay(slot.time)}
                  </span>
                  <span style={{ fontWeight: 400, fontSize: "11px", color: "white" }}>
                    ₹{getPriceForSlotWrapper(slot.time, selectedDate?.day, false, courtId, slot?.duration || 60)}
                  </span>
                </>
              ) : (
                <>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      color: (shouldDisableLeftClick && leftHalf) || (shouldDisableRightClick && rightHalf) ? "rgba(156, 163, 175, 0.5)" : "inherit",
                      background: (shouldDisableLeftClick && leftHalf) || (shouldDisableRightClick && rightHalf)
                        ? "transparent"
                        : leftHalf
                          ? "linear-gradient(to right, white 50%, #111827 50%)"
                          : "linear-gradient(to right, #111827 50%, white 50%)",
                      WebkitBackgroundClip: (shouldDisableLeftClick && leftHalf) || (shouldDisableRightClick && rightHalf) ? "unset" : "text",
                      WebkitTextFillColor: (shouldDisableLeftClick && leftHalf) || (shouldDisableRightClick && rightHalf) ? "rgba(156, 163, 175, 0.5)" : "transparent",
                      backgroundClip: (shouldDisableLeftClick && leftHalf) || (shouldDisableRightClick && rightHalf) ? "unset" : "text",
                      zIndex: 3,
                      position: "relative"
                    }}
                  >
                    {formatTimeForDisplay(slot.time)}
                  </span>
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: "11px",
                      color: (shouldDisableLeftClick && leftHalf) || (shouldDisableRightClick && rightHalf) ? "rgba(156, 163, 175, 0.5)" : "inherit",
                      background: (shouldDisableLeftClick && leftHalf) || (shouldDisableRightClick && rightHalf)
                        ? "transparent"
                        : leftHalf
                          ? "linear-gradient(to right, white 50%, #111827 50%)"
                          : "linear-gradient(to right, #111827 50%, white 50%)",
                      WebkitBackgroundClip: (shouldDisableLeftClick && leftHalf) || (shouldDisableRightClick && rightHalf) ? "unset" : "text",
                      WebkitTextFillColor: (shouldDisableLeftClick && leftHalf) || (shouldDisableRightClick && rightHalf) ? "rgba(156, 163, 175, 0.5)" : "transparent",
                      backgroundClip: (shouldDisableLeftClick && leftHalf) || (shouldDisableRightClick && rightHalf) ? "unset" : "text",
                      zIndex: 3,
                      position: "relative"
                    }}
                  >
                    ₹{getPriceForSlotWrapper(slot.time, selectedDate?.day, false, courtId, slot?.duration || 60)}
                  </span>
                </>
              )
            ) : (
              <>
                <span style={{ fontWeight: 600, fontSize: "14px", color: (shouldDisableLeftClick && shouldDisableRightClick) ? "rgba(156, 163, 175, 0.5)" : "#000000", zIndex: 3, position: "relative" }}>
                  {formatTimeForDisplay(slot.time)}
                </span>
                <span style={{ fontWeight: 400, fontSize: "11px", color: (shouldDisableLeftClick && shouldDisableRightClick) ? "rgba(156, 163, 175, 0.5)" : "#6b7280", zIndex: 3, position: "relative" }}>
                  ₹{getPriceForSlotWrapper(slot.time, selectedDate?.day, false, courtId, slot?.duration || 60)}
                </span>
              </>
            )
          ) : (
            <>
              <span style={{ fontWeight: 600, fontSize: "14px", color: isSlotSelectedOrFull ? "white" : "#000000" }}>
                {formatTimeForDisplay(slot.time)}
              </span>
              <span style={{ fontWeight: 400, fontSize: "11px", color: isSlotSelectedOrFull ? "white" : "#6b7280" }}>
                ₹{getPriceForSlotWrapper(slot.time, selectedDate?.day, false, courtId, slot?.duration || 60)}
              </span>
            </>
          )}
        </button>
      </div>
    );
  };

  const handleSwitchChange = () => setShowUnavailable(!showUnavailable);

  const displayedSlotCount = (() => {
    let totalSlots = 0;
    const dateKey = selectedDate?.fullDate;

    selectedCourts.forEach(court => {
      court.time.forEach(slot => {
        if (slot.side === "both" || slot.duration === 60) {
          totalSlots += 1;
        } else {
          totalSlots += 0.5;
        }
      });
    });

    const individualHalfKeys = Array.from(halfSelectedSlots).filter(key =>
      key.includes(dateKey) && (key.endsWith('-left') || key.endsWith('-right'))
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
        totalSlots += 1;
      } else {
        totalSlots += 0.5;
      }
    });

    return totalSlots;
  })();

  if (!selectedDate) {
    return <DataLoading height="100vh" />;
  }

  return (
    <Container className="py-md-2 px-md-0 py-0 px-2 mb-md-5 mb-0">
      <div className="bg-white rounded shadow-sm p-3 mb-3">
        <Row className="g-2 align-items-end">
          <Col md={4}>
            <Form.Label className="small mb-1">Club</Form.Label>
            <Form.Select
              size="sm"
              value={selectedClubId}
              disabled={clubsLoading}
              onChange={(event) => {
                setSelectedClubId(event.target.value);
                setSelectedLocationId("");
                setSelectedCategoryId("");
                setSelectedCourts([]);
                setSelectedTimes({});
                setSelectedBuisness([]);
                setHalfSelectedSlots(new Set());
                setSlotError("");
              }}
            >
              <option value="">{clubsLoading ? "Loading clubs..." : "Select club"}</option>
              {superAdminClubs.map((club) => (
                <option key={club._id} value={club._id}>
                  {club.clubName || club.name || "Unnamed Club"}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label className="small mb-1">Location</Form.Label>
            <Form.Select
              size="sm"
              value={selectedLocationId}
              disabled={!selectedClubId || locationOptions.length === 0}
              onChange={(event) => {
                setSelectedLocationId(event.target.value);
                setSelectedCategoryId("");
                setSelectedCourts([]);
                setSelectedTimes({});
                setSelectedBuisness([]);
                setHalfSelectedSlots(new Set());
                setSlotError("");
              }}
            >
              <option value="">Select location</option>
              {locationOptions.map((item, index) => {
                const id = getEntityId(item);
                return (
                  <option key={id || index} value={id}>
                    {item?.name || item?.locationName || item?.address || `Location ${index + 1}`}
                  </option>
                );
              })}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label className="small mb-1">Category</Form.Label>
            <Form.Select
              size="sm"
              value={selectedCategoryId}
              disabled={!selectedLocationId || categoryOptions.length === 0}
              onChange={(event) => {
                setSelectedCategoryId(event.target.value);
                setSelectedCourts([]);
                setSelectedTimes({});
                setSelectedBuisness([]);
                setHalfSelectedSlots(new Set());
                setSlotError("");
              }}
            >
              <option value="">Select category</option>
              {categoryOptions.map((item, index) => {
                const id = getEntityId(item);
                return (
                  <option key={id || index} value={id}>
                    {getCategoryLabel(item, index)}
                  </option>
                );
              })}
            </Form.Select>
          </Col>
        </Row>
      </div>
      {!selectedClubId || !selectedLocationId || !selectedCategoryId ? (
        <div className="bg-white rounded shadow-sm p-4 text-center text-muted">
          Select club, location, and category to load courts and create an open match.
        </div>
      ) : null}
      <Row className="g-2">
        <Col md={7} className="p-md-3 px-3 pt-3 pb-0 mobile-create-matches-content mt-0">
          <div className="calendar-strip" style={{ position: "relative", zIndex: 2 }}>
            <div className="d-flex justify-content-between align-items-center mb-md-2 mb-1">
              <div className="custom-heading-use d-flex align-items-center text-nowrap">
                {!isModal && (
                  <button
                    className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center "
                    style={{ width: 40, height: 40 }}
                    onClick={() => navigate('/admin/open-matches')}
                  >
                    <FaArrowLeftLong size={18} />
                  </button>
                )}
                Select Date
                <div className="position-relative d-inline-block" ref={wrapperRef}>
                  <span
                    className="rounded p-1 pt-0 ms-1"
                    style={{ cursor: "pointer", width: "26px !important", height: "26px !important" }}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <MdOutlineDateRange size={17} style={{ color: "#374151" }} />
                  </span>
                  {isOpen && (
                    <div
                      className="position-absolute mt-2 bg-white border rounded shadow"
                      style={{ top: "100%", left: "0", minWidth: "100%", zIndex: 9999 }}
                    >
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <StaticDatePicker
                          displayStaticWrapperAs="desktop"
                          value={startDate}
                          onChange={(date) => {
                            setStartDate(date);
                            setIsOpen(false);
                            const formattedDate = toLocalDateString(date);
                            const day = date.toLocaleDateString("en-US", { weekday: "long" });
                            setSelectedDate({ fullDate: formattedDate, day });
                            setTimeout(() => scrollToSelectedDate(formattedDate), 100);
                            setSelectedCourts([]);
                            setSelectedTimes({});
                            setSelectedBuisness([]);
                            setHalfSelectedSlots(new Set());
                            setSlotError("");
                            dispatch(
                              getAdminSlotBooking({
                                day,
                                date: formattedDate,
                                register_club_id: savedClubId || "",
                                categoryId: selectedCategoryId,
                                location: activeLocationId
                              })
                            );
                            dispatch(
                              getAdminHalfSlotPrice({
                                day: day,
                                register_club_id: savedClubId || "",
                                categoryId: selectedCategoryId,
                                location: activeLocationId
                              })
                            );
                          }}
                          minDate={new Date()}
                          maxDate={maxSelectableDate}
                          slotProps={{ actionBar: { actions: [] } }}
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
                  {showUnavailable ? `Hide ` : `Show `} Unavailable Slots
                </label>
                <input
                  className="form-check-input fs-5 ms-1 mb-1"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchCheckDefault"
                  checked={showUnavailable}
                  onChange={handleSwitchChange}
                  style={{ boxShadow: "none" }}
                />
              </div>
            </div>

            <div className="d-flex align-items-center mb-lg-3 gap-2 ">
              <div
                className="d-flex mt-2 justify-content-center p-0 mb-3 align-items-center rounded-pill"
                style={{
                  backgroundColor: "#f3f3f5",
                  width: "20px",
                  height: "58px",
                }}
              >
                <span
                  className="text-muted mb-0"
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    whiteSpace: "pre-line",
                    textAlign: "center",
                    lineHeight: "1",
                    letterSpacing: "0px",
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
                    overflowX: "auto",
                  }}
                >
                  {dates?.map((d, i) => {
                    const formatDate = (date) => {
                      try {
                        return date ? toLocalDateString(date) : null;
                      } catch (error) {
                        return null;
                      }
                    };
                    const selectedDateObj = selectedDate?.fullDate ? dateOnlyToLocalDate(selectedDate.fullDate) : null;
                    const isSelected = selectedDateObj && !isNaN(selectedDateObj.getTime()) ? formatDate(selectedDateObj) === d?.fullDate : false;
                    const dateSlotCount = Object.values(selectedTimes).reduce(
                      (acc, courtDates) => {
                        const dateSlots = courtDates[d?.fullDate] || [];
                        return acc + dateSlots?.length;
                      },
                      0
                    );

                    const dateHalfSlotCount = Array.from(halfSelectedSlots).filter(key =>
                      key.includes(`-${d?.fullDate}-`)
                    ).length;

                    let dateDisplayCount;
                    if (dateHalfSlotCount > 0) {
                      dateDisplayCount = dateHalfSlotCount * 0.5;
                    } else {
                      dateDisplayCount = dateSlotCount;
                    }
                    return (
                      <button
                        key={i}
                        ref={(el) => (dateRefs.current[d.fullDate] = el)}
                        className={` mb-3 me-1 position-relative add_width_low ${isSelected ? "text-white border-0" : "bg-white"
                          }`}
                        style={{
                          background: isSelected
                            ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"
                            : "#FFFFFF", boxShadow: isSelected ? "0px 4px 4px 0px #00000040" : "", borderRadius: "12px", color: isSelected ? "#FFFFFF" : "#374151"
                        }}
                        onClick={() => {
                          setSelectedDate({ fullDate: d?.fullDate, day: d?.day });
                          const [year, month, dayNum] = d?.fullDate?.split('-').map(Number);
                          setStartDate(new Date(year, month - 1, dayNum));
                          setTimeout(() => scrollToSelectedDate(d?.fullDate), 100);
                          setSelectedCourts([]);
                          setSelectedTimes({});
                          setSelectedBuisness([]);
                          setHalfSelectedSlots(new Set());
                          setSlotError("");

                          dispatch(getAdminSlotBooking({
                            day: d?.day, date: d?.fullDate, register_club_id: ownerClubData?.[0]?._id || savedClubId || "", categoryId: selectedCategoryId,
                            location: activeLocationId
                          }));
                          dispatch(getAdminHalfSlotPrice({
                            day: d?.day, register_club_id: ownerClubData?.[0]?._id || savedClubId || "", categoryId: selectedCategoryId,
                            location: activeLocationId
                          }));
                        }}
                        onMouseEnter={(e) => !isSelected && (e.currentTarget.style.border = "1px solid #3DBE64")}
                        onMouseLeave={(e) => (e.currentTarget.style.border = "1px solid #4949491A")}
                      >
                        <div className="text-center">
                          <div className="date-center-date">{d?.date}</div>
                          <div className="date-center-day">{dayShortMap[d?.day]}</div>
                        </div>
                        {dateDisplayCount > 0 && (
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
                            {dateDisplayCount % 1 === 0 ? dateDisplayCount : dateDisplayCount.toFixed(1)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button className="btn border-0 p-2 d-none d-md-block" style={{ position: "absolute", right: -18, zIndex: 10, boxShadow: "none" }} onClick={scrollRight}><MdOutlineArrowForwardIos className="mt-3" size={20} /></button>
              </div>
            </div>
            <div
              className="mb-3 overflow-slot border-0 rounded-3"
              style={{
                border: slotError ? "1px solid red" : "1px solid #c2babaff",
              }}
            >
              {slotLoading ? (
                <DataLoading height="50vh" />
              ) : slotData?.data?.length > 0 ? (
                <>
                  <div className="p-0">
                    {slotData?.data?.some((court) =>
                      court?.slots?.some((slot) => {
                        if (isPastTime(slot?.time, selectedDate?.fullDate)) return false;

                        const isHalfBooked =
                          slot?.status === "lock" ||
                          (
                            slot?.status === "booked" &&
                            (
                              slot?.duration === 30
                            )
                          );

                        const isFullBooked =
                          slot?.status === "lock" ||
                          (
                            slot?.status === "booked" &&
                            (
                              true
                            )
                          );
                        const basicFilter = showUnavailable
                          ? true
                          : (slot?.availabilityStatus === "available" && !isFullBooked) || isHalfBooked;

                        return basicFilter;
                      })
                    ) && (
                        <>
                          <div className="row mb-md-2 mb-0">
                            <div className="col-12 mb-2">
                              <div className="div p-3 animation-slider">
                              </div>
                            </div>
                            <div className="col-3 d-md-block d-none">
                              <h6 className="all-matches text-start">Courts</h6>
                            </div>
                            <div className="col-md-9 col-12 ">
                              <h6 className="all-matches text-center mb-0 me-2 me-md-0">
                                Available Slots
                              </h6>
                            </div>
                          </div>
                        </>
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
                            display: none;
                          }
                          .hide-scrollbar {
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                          }
                          .animation-slider {
                            background: #f8f9fa;
                            border-radius: 8px;
                            position: relative;
                            overflow: hidden;
                            white-space: nowrap;
                            font-size: 14px;
                            font-weight: 500;
                            color: #0034E4;
                          }
                          .animation-slider::before {
                            content: 'Game levels are self-assessed at the moment. AI assessment will start from March 2026.';
                            position: absolute;
                            top: 50%;
                            right: 0;
                            transform: translateY(-50%);
                            animation: slideTextLeftToRight 16s infinite linear;
                            white-space: nowrap;
                          }
                          @keyframes slideTextLeftToRight {
                            0% {
                              transform: translateY(-50%) translateX(calc(100% + 50px));
                            }
                            100% {
                              transform: translateY(-50%) translateX(-100%);
                            }
                          }
                        `}</style>
                      {slotData?.data?.map((court, courtIndex) => {
                        const filteredSlots = court?.slots?.filter((slot) => {
                          if (isPastTime(slot?.time, selectedDate?.fullDate)) return false;

                          const isHalfBooked =
                            slot?.status === "lock" ||
                            (
                              slot?.status === "booked" &&
                              (
                                slot?.duration === 30
                              )
                            );

                          const isFullBooked =
                            slot?.status === "lock" ||
                            (
                              slot?.status === "booked" &&
                              (
                                true
                              )
                            );

                          const basicFilter = showUnavailable
                            ? true
                            : (slot?.availabilityStatus === "available" && !isFullBooked) || isHalfBooked;

                          const is90MinSlot = slot?.duration === 90;

                          return basicFilter || is90MinSlot;
                        });
                        if (filteredSlots?.length === 0) return null;
                        return (
                          <div key={court?._id} className="row mb-md-3 mb-0 align-items-start pb-3 pb-md-0 border_bottom_line mt-2 mt-md-0">
                            <div className="col-md-2 col-12 mb-0 d-flex d-md-block align-items-center justify-content-start">
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
                                  {court?.courtName?.replace(/(padel|pickle\s*ball)\s*/gi, "")}
                                </div>

                                {court?.slotDuration && <p
                                  className="text-muted  mb-0 ms-1"
                                  style={{
                                    fontFamily: "Poppins",
                                    fontWeight: "400",
                                    fontSize: "10px",
                                  }}
                                >
                                  ({Array.isArray(court?.slotDuration)
                                    ? `${court.slotDuration.join('&')} min`
                                    : `${court?.slotDuration} min`
                                  })
                                </p>
                                }
                              </div>
                            </div>

                            <div className="col-md-9 col-12">
                              <div className="row g-1">
                                {filteredSlots.map((slot, i) =>
                                  renderSlotButton(slot, i, court?._id)
                                )}
                                {!hasAvailableSlots && (
                                  <div
                                    className="text-center py-4 d-flex flex-column justify-content-center align-items-center mt-5"
                                    style={{ fontFamily: "Poppins", fontWeight: 500 }}
                                  >
                                    <p className="mb-1 label_font text-danger">
                                      No slots are available for this date.
                                    </p>
                                    <p className="mb-0 label_font text-danger">
                                      Please select a different date.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                        );
                      })}
                    </div>
                    {slotData?.data?.some((court) =>
                      court?.slots?.some((slot) => {
                        const isHalfBooked =
                          slot?.status === "lock" ||
                          (
                            slot?.status === "booked" &&
                            (
                              slot?.duration === 30
                            )
                          );

                        const isFullBooked =
                          slot?.status === "lock" ||
                          (
                            slot?.status === "booked" &&
                            (
                              true
                            )
                          );

                        const basicFilter = showUnavailable
                          ? true
                          : (
                            slot?.availabilityStatus === "available" &&
                            !isFullBooked &&
                            !isPastTime(slot?.time, selectedDate?.fullDate)
                          ) || isHalfBooked;

                        return basicFilter;
                      })
                    ) && (
                        <div className="d-flex justify-content-end pt-2 pb-2 d-lg-none">
                          <Button
                            className="rounded-pill bg-white px-4 py-1"
                            style={{
                              border: "none",
                              fontWeight: "600",
                              fontSize: "13px",
                            }}
                            disabled={(selectedCourts?.length === 0 && halfSelectedSlots?.size === 0)}
                            onClick={() => {
                              setMatchPlayer(true);
                            }}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                  </div>

                  {slotData?.data?.every(
                    (court) =>
                      !court?.slots?.some(
                        (slot) => {
                          const isHalfBooked =
                            slot?.status === "lock" ||
                            (
                              slot?.status === "booked" &&
                              (
                                slot?.duration === 30
                              )
                            );

                          const isFullBooked =
                            slot?.status === "lock" ||
                            (
                              slot?.status === "booked" &&
                              (
                                true
                              )
                            );

                          const basicFilter = showUnavailable
                            ? true
                            : (
                              slot?.availabilityStatus === "available" &&
                              !isFullBooked &&
                              !isPastTime(slot?.time, selectedDate?.fullDate)
                            ) || isHalfBooked;

                          return basicFilter;
                        }
                      )
                  ) && (
                      <div
                        className="text-center py-4 d-flex flex-column justify-content-center align-items-center mt-5"
                        style={{ fontFamily: "Poppins", fontWeight: 500, color: "#6B7280", }}
                      >
                        <p className="mb-1 label_font text-danger">No slots are available for this date.</p>
                        <p className="mb-0 label_font text-danger">Please select a different date</p>
                      </div>
                    )}
                  {isAfterClosingTime() && selectedDate?.fullDate === getCurrentISTDate() && slotData?.data?.every((court) => !court?.slots?.some((slot) => { const isHalfBooked = false; const isFullBooked = slot?.status === "booked"; return slot?.availabilityStatus === "available" && !isFullBooked && !isPastTime(slot?.time, selectedDate?.fullDate); })) && (
                    <div className="text-center py-4 d-flex flex-column justify-content-center align-items-center mt-5" style={{ fontFamily: "Poppins", fontWeight: 500, color: "#6B7280" }}>
                      <p className="mb-3 label_font text-danger">Booking closed for today. Please select tomorrow or next date.</p>
                      <Button className="rounded-pill px-4 py-2" style={{ background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)", border: "none", fontWeight: "600", fontSize: "13px" }} onClick={() => { const nextDate = dateOnlyToLocalDate(selectedDate.fullDate); nextDate.setDate(nextDate.getDate() + 1); const formattedDate = toLocalDateString(nextDate); const day = nextDate.toLocaleDateString("en-US", { weekday: "long" }); setSelectedDate({ fullDate: formattedDate, day }); setStartDate(nextDate); setTimeout(() => scrollToSelectedDate(formattedDate), 100); setSelectedCourts([]); setSelectedTimes({}); setSelectedBuisness([]); setHalfSelectedSlots(new Set()); setSlotError(""); dispatch(getAdminSlotBooking({ day, date: formattedDate, register_club_id: savedClubId || "", categoryId: selectedCategoryId, location: activeLocationId })); dispatch(getAdminHalfSlotPrice({ day, register_club_id: savedClubId || "", categoryId: selectedCategoryId, location: activeLocationId })); }}>Select Next Date</Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 d-flex flex-column justify-content-center align-items-center mt-5" style={{ fontFamily: "Poppins", fontWeight: 500, color: "#6B7280" }}>
                  <p className="mb-1 label_font text-danger">No slots are available for this date.</p>
                  <p className="mb-0 label_font text-danger">Please choose another date</p>
                </div>
              )}

            </div>
          </div>
        </Col>

        <Col md={5} className="ps-2 pt-5 d-none d-lg-block">
          {!matchPlayer ?
            <div
              className="border w-100 px-0 py-4 mt-1 border-0"
              style={{
                height: "62vh",
                borderRadius: "10px 30% 10px 10px",
                background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="d-flex  px-3 pt-2 justify-content-between align-items-center">
                <h6 className="p-2 mb-1 ps-0 text-white custom-heading-use">
                  Booking Summary {displayedSlotCount > 0 ? ` (${displayedSlotCount} Slot${displayedSlotCount !== 1 ? 's' : ''})` : ''}
                </h6>

              </div>

              <div className="px-3 flex-grow-1 d-flex flex-column">

                <div
                  className="slots-container flex-grow-1"
                  style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    overflowX: "hidden",
                    paddingRight: "8px",
                  }}
                >
                  {selectedCourts?.length > 0 || halfSelectedSlots.size > 0 ? (
                    <>
                      {/* Display all slots from selectedCourts - grouped by consecutive times */}
                      {selectedCourts?.map((court, courtIndex) => {
                        // Group consecutive slots for the same court
                        const sortedSlots = [...court.time].sort((a, b) => parseTimeToHour(a.time) - parseTimeToHour(b.time));
                        const groupedSlots = [];
                        let currentGroup = [];

                        sortedSlots.forEach((slot, idx) => {
                          if (currentGroup.length === 0) {
                            currentGroup.push(slot);
                          } else {
                            const lastSlot = currentGroup[currentGroup.length - 1];
                            const lastHour = parseTimeToHour(lastSlot.time);
                            const currentHour = parseTimeToHour(slot.time);

                            // Check if consecutive
                            if (currentHour === lastHour + 1) {
                              currentGroup.push(slot);
                            } else {
                              groupedSlots.push([...currentGroup]);
                              currentGroup = [slot];
                            }
                          }
                        });

                        if (currentGroup.length > 0) {
                          groupedSlots.push(currentGroup);
                        }

                        return groupedSlots.map((group, groupIndex) => {
                          const firstSlot = group[0];
                          const lastSlot = group[group.length - 1];
                          const dateKey = selectedDate?.fullDate;

                          // Calculate total amount for the group
                          let totalAmount = 0;

                          group.forEach(slot => {
                            if (slot.amount !== undefined && slot.amount !== null) {
                              totalAmount += Number(slot.amount);
                            } else {
                              const price = getPriceForSlotWrapper(slot.time, selectedDate?.day, slot.duration === 30 || slot.side === 'left' || slot.side === 'right', court._id, slot?.duration || 60);
                              totalAmount += Number(price || 0);
                            }
                          });

                          // Format time range
                          let displayTime;
                          if (group.length === 1) {
                            const slot = group[0];
                            const leftKey = `${court._id}-${slot._id}-${dateKey}-left`;
                            const rightKey = `${court._id}-${slot._id}-${dateKey}-right`;
                            const leftHalf = halfSelectedSlots.has(leftKey);
                            const rightHalf = halfSelectedSlots.has(rightKey);

                            const hour = parseTimeToHour(slot.time);
                            const period = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

                            if (leftHalf && !rightHalf) {
                              // Left half only: 4:00 PM - 4:30 PM
                              displayTime = `${displayHour}:00 ${period} - ${displayHour}:30 ${period}`;
                            } else if (!leftHalf && rightHalf) {
                              // Right half only: 4:30 PM - 5:00 PM
                              const nextHour = hour + 1;
                              const nextPeriod = nextHour >= 12 ? 'PM' : 'AM';
                              const displayNextHour = nextHour > 12 ? nextHour - 12 : nextHour === 0 ? 12 : nextHour;
                              displayTime = `${displayHour}:30 ${period} - ${displayNextHour}:00 ${nextPeriod}`;
                            } else {
                              // Full slot: handle both 60-min and 90-min slots
                              let nextHour = hour + 1;
                              let nextMinute = 0;
                              if (slot.duration === 90) {
                                nextHour = hour + 1;
                                nextMinute = 30;
                              }
                              const nextPeriod = nextHour >= 12 ? 'PM' : 'AM';
                              const displayNextHour = nextHour > 12 ? nextHour - 12 : nextHour === 0 ? 12 : nextHour;
                              const timeStr = nextMinute === 30 ? `${displayNextHour}:30 ${nextPeriod}` : `${displayNextHour}:00 ${nextPeriod}`;
                              displayTime = `${displayHour}:00 ${period} - ${timeStr}`;
                            }
                          } else {
                            // Multiple consecutive slots - show range
                            const firstSlot = group[0];
                            const lastSlot = group[group.length - 1];

                            // Collect all half slot states for the group
                            const slotStates = group.map(slot => {
                              const leftKey = `${court._id}-${slot._id}-${dateKey}-left`;
                              const rightKey = `${court._id}-${slot._id}-${dateKey}-right`;
                              return {
                                slot,
                                hour: parseTimeToHour(slot.time),
                                hasLeft: halfSelectedSlots.has(leftKey),
                                hasRight: halfSelectedSlots.has(rightKey)
                              };
                            });

                            // Calculate start time from first slot
                            const firstState = slotStates[0];
                            let startHour = firstState.hour;
                            let startMinute = 0;
                            if (!firstState.hasLeft && firstState.hasRight) {
                              // Starts from right half only (e.g., 12:30)
                              startMinute = 30;
                            }

                            // Calculate end time from last slot
                            const lastState = slotStates[slotStates.length - 1];
                            let endHour = lastState.hour;
                            let endMinute = 0;

                            if (lastState.hasLeft && lastState.hasRight) {
                              // Both halves = full slot, end at next hour
                              endHour = endHour + 1;
                            } else if (!lastState.hasLeft && lastState.hasRight) {
                              // Only right half, end at next hour (e.g., 2pm right = 3:00pm)
                              endHour = endHour + 1;
                            } else if (lastState.hasLeft && !lastState.hasRight) {
                              // Only left half, end at :30 (e.g., 2pm left = 2:30pm)
                              endMinute = 30;
                            } else {
                              // No half info (full slot), end at next hour
                              endHour = endHour + 1;
                            }

                            const startPeriod = startHour >= 12 ? 'PM' : 'AM';
                            const endPeriod = endHour >= 12 ? 'PM' : 'AM';
                            const displayStartHour = startHour > 12 ? startHour - 12 : startHour === 0 ? 12 : startHour;
                            const displayEndHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;

                            const startTimeStr = startMinute === 30 ? `${displayStartHour}:30 ${startPeriod}` : `${displayStartHour}:00 ${startPeriod}`;
                            const endTimeStr = endMinute === 30 ? `${displayEndHour}:30 ${endPeriod}` : `${displayEndHour}:00 ${endPeriod}`;
                            displayTime = `${startTimeStr} - ${endTimeStr}`;
                          }

                          return (
                            <div key={`${courtIndex}-${groupIndex}`} className="row mb-2">
                              <div className="col-12 d-flex gap-2 mb-0 m-0 align-items-center justify-content-between">
                                <div className="d-flex text-white">
                                  <span style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "15px" }}>
                                    {selectedDate?.fullDate ? `${new Date(selectedDate.fullDate).toLocaleString("en-US", { day: "2-digit" })}, ${new Date(selectedDate.fullDate).toLocaleString("en-US", { month: "short" })}` : ""}
                                  </span>
                                  <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "15px" }}>
                                    {displayTime}
                                  </span>
                                  <span className="ps-2" style={{ fontWeight: "500", fontFamily: "Poppins", fontSize: "15px" }}>
                                    {court.courtName}
                                  </span>
                                </div>
                                <div className="text-white pe-2 d-flex justify-content-center align-items-center gap-2">
                                  <span style={{ fontWeight: 600, fontSize: "15px" }}>₹</span>
                                  <span style={{ fontWeight: 600, fontFamily: "Poppins", fontSize: "14px" }} className='mt-1 mb-1'>
                                    {Number(totalAmount || 0).toLocaleString("en-IN")}
                                  </span>
                                  <i className="bi bi-trash3 ps-1 text-white" style={{ fontSize: "14px", cursor: "pointer" }}
                                    onClick={() => {
                                      const dateKey = selectedDate?.fullDate;

                                      // Remove all slots in the group
                                      group.forEach(slot => {
                                        const leftKey = `${court._id}-${slot._id}-${dateKey}-left`;
                                        const rightKey = `${court._id}-${slot._id}-${dateKey}-right`;

                                        setHalfSelectedSlots(prev => {
                                          const newSet = new Set(prev);
                                          newSet.delete(leftKey);
                                          newSet.delete(rightKey);
                                          return newSet;
                                        });
                                      });

                                      // Remove from selectedCourts
                                      setSelectedCourts(prev =>
                                        prev.map(c =>
                                          c._id === court._id
                                            ? { ...c, time: c.time.filter(t => !group.some(gs => gs._id === t._id)) }
                                            : c
                                        ).filter(c => c.time.length > 0)
                                      );

                                      // Remove from selectedTimes
                                      setSelectedTimes(prev => {
                                        const updated = { ...prev };
                                        if (updated[court._id]) {
                                          updated[court._id] = updated[court._id].filter(t => !group.some(gs => gs._id === t._id));
                                          if (updated[court._id].length === 0) {
                                            delete updated[court._id];
                                          }
                                        }
                                        return updated;
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })}

                      {/* Display individual half slots not in selectedCourts */}
                      {(() => {

                        const dateKey = selectedDate?.fullDate;
                        const individualHalves = [];

                        halfSelectedSlots.forEach(key => {
                          if (!key.includes(dateKey)) return;

                          const [courtId, slotId, , side] = key.split('-');
                          const otherSide = side === 'left' ? 'right' : 'left';
                          const otherKey = `${courtId}-${slotId}-${dateKey}-${otherSide}`;

                          if (!halfSelectedSlots.has(otherKey)) {
                            const isInSelectedCourts = selectedCourts.some(court =>
                              court._id === courtId && court.time.some(slot => slot._id === slotId)
                            );

                            if (!isInSelectedCourts) {
                              const courtData = slotData?.data?.find(c => c._id === courtId);
                              const slotData_slot = courtData?.slots?.find(s => s._id === slotId);

                              if (slotData_slot) {
                                individualHalves.push({
                                  courtId,
                                  slotId,
                                  side,
                                  courtName: courtData.courtName,
                                  slotTime: slotData_slot.time,
                                  key
                                });
                              }
                            }
                          }
                        });

                        return individualHalves.map((halfSlot, index) => {
                          let displayTime;
                          const fullPrice = getPriceForSlotWrapper(halfSlot.slotTime, selectedDate?.day, false, halfSlot.courtId);
                          let correctAmount = fullPrice / 2;

                          if (halfSlot.side === 'left') {
                            displayTime = formatTimeForDisplay(halfSlot.slotTime);
                          } else {
                            const hour = parseTimeToHour(halfSlot.slotTime);
                            const minutes = (hour * 60) + 30;
                            const newHour = Math.floor(minutes / 60);
                            const period = newHour >= 12 ? 'PM' : 'AM';
                            const displayHour = newHour > 12 ? newHour - 12 : newHour === 0 ? 12 : newHour;
                            displayTime = `${displayHour.toString().padStart(2, '0')}:30 ${period}`;
                          }

                          return (
                            <div key={`individual-${index}`} className="row mb-2">
                              <div className="col-12 d-flex gap-2 mb-0 m-0 align-items-center justify-content-between">
                                <div className="d-flex text-white">
                                  <span style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "15px" }}>
                                    {selectedDate?.fullDate ? `${new Date(selectedDate.fullDate).toLocaleString("en-US", { day: "2-digit" })}, ${new Date(selectedDate.fullDate).toLocaleString("en-US", { month: "short" })}` : ""}
                                  </span>
                                  <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "15px" }}>
                                    {displayTime}
                                  </span>
                                  <span className="ps-2" style={{ fontWeight: "500", fontFamily: "Poppins", fontSize: "15px" }}>
                                    {halfSlot.courtName}
                                  </span>
                                </div>
                                <div className="text-white pe-2 d-flex justify-content-center align-items-center gap-2">
                                  <span style={{ fontWeight: 600, fontSize: "15px" }}>₹</span>
                                  <span style={{ fontWeight: 600, fontFamily: "Poppins", fontSize: "14px" }} className='mt-1 mb-1'>
                                    {Number(correctAmount || 0).toLocaleString("en-IN")}
                                  </span>
                                  <i className="bi bi-trash3 ps-1 text-white" style={{ fontSize: "14px", cursor: "pointer" }}
                                    onClick={() => {
                                      setHalfSelectedSlots(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(halfSlot.key);
                                        return newSet;
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}

                    </>
                  ) : (
                    <div className="d-flex flex-column justify-content-center align-items-center text-white" style={{ height: "22vh" }}>
                      <p style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500" }}>No slot selected</p>
                    </div>
                  )}
                </div>

                <div className="border-top pt-2 mt-3 text-white d-flex justify-content-between align-items-center fw-bold">
                  <p
                    className="d-flex flex-column mb-0"
                    style={{ fontSize: "16px", fontWeight: "600" }}
                  >
                    Total Amount
                  </p>
                  <p
                    className="mb-0"
                    style={{ fontSize: "25px", fontWeight: "600" }}
                  >
                    ₹{Number(grandTotal || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="px-3 pb-2 mt-auto">
                <div className="d-flex justify-content-center align-items-center">
                  <button
                    className="w-100 py-2"
                    style={{
                      background: "#fff",
                      border: "none",
                      color: "#001B76",
                      fontWeight: "600",
                      fontSize: "16px",
                      borderRadius: "25px",
                      // opacity: (selectedCourts.length === 0 && halfSelectedSlots.size === 0) ? 0.5 : 1,
                      cursor: (selectedCourts.length === 0 && halfSelectedSlots.size === 0) ? "not-allowed" : "pointer",
                    }}
                    disabled={selectedCourts.length === 0 && halfSelectedSlots.size === 0 || slotPrice?.length === 0 || slotPrice === undefined || !slotPrice}
                    onClick={() => setMatchPlayer(true)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
            :
            <MatchPlayer
              addedPlayers={addedPlayers}
              setAddedPlayers={setAddedPlayers}
              selectedCourts={selectedCourts}
              selectedDate={selectedDate}
              finalSkillDetails={{}}
              totalAmount={grandTotal}
              existsOpenMatchData={false}
              slotError={slotError}
              userGender="Mixed Double"
              slotData={slotData}
              halfSelectedSlots={halfSelectedSlots}
              activeHalves={{}}
              selectedDuration={60}
              onBackToSlots={() => setMatchPlayer(false)}
              matchPlayer={matchPlayer}
              isAdminMode={true}
              ownerClubData={ownerClubData}
              selectedClubId={savedClubId}
              activeLocationId={activeLocationId}
              activeCategoryId={activeCategoryId}
              onAddPlayerToggle={onAddPlayerToggle}
            />
          }
        </Col>
      </Row>
    </Container>
  );
};

export default CreateMatches;
