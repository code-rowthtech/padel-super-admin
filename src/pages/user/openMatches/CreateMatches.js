import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormCheck,
  Modal,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserSlotBooking, getUserSlotPrice } from "../../../redux/user/slot/thunk";
import { ButtonLoading, DataLoading, Loader } from "../../../helpers/loading/Loaders";
import "react-datepicker/dist/react-datepicker.css";
import {
  MdOutlineArrowForwardIos,
  MdOutlineDateRange,
} from "react-icons/md";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineDeleteOutline,
} from "react-icons/md";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { getUserClub } from "../../../redux/user/club/thunk";
import MatchPlayer from "./MatchPlayer";
import { HiMoon } from "react-icons/hi";
import { BsSunFill } from "react-icons/bs";
import { PiSunHorizonFill } from "react-icons/pi";
import {
  booking_dropdown_img2,
  booking_dropdown_img3,
  booking_dropdown_img4,
} from "../../../assets/files";
import { getUserProfile } from "../../../redux/user/auth/authThunk";
import { getPlayerLevel, getQuestionData } from "../../../redux/user/notifiction/thunk";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { MatchplayerShimmer } from "../../../helpers/loading/ShimmerLoading";

const parseTimeToHour = (timeStr) => {
  if (!timeStr) return null;
  const [hourStr, period] = timeStr.toLowerCase().split(" ");
  let hour = parseInt(hourStr);
  if (isNaN(hour)) return null;
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  return hour;
};

const timeToMinutes = (timeStr) => {
  const hour = parseTimeToHour(timeStr);
  return hour !== null ? hour * 60 : null;
};

const CreateMatches = () => {
  const location = useLocation();

  const initialSelectedDate =
    location?.state?.selectedDate ||
    ({ fullDate: new Date().toISOString().split("T")[0], day: new Date().toLocaleDateString("en-US", { weekday: "long" }) });

  const [startDate, setStartDate] = useState(() => {
    try {
      return location?.state?.selectedDate
        ? new Date(location.state.selectedDate.fullDate)
        : new Date();
    } catch (e) {
      return new Date();
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);
  const dateRefs = useRef({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const store = useSelector((state) => state);
  const getToken = getUserFromSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCourts, setSelectedCourts] = useState(location?.state?.selectedCourts || []);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [errorShow, setErrorShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState(location?.state?.paymentError || "");
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [halfSelectedSlots, setHalfSelectedSlots] = useState(new Set());
  const [activeHalves, setActiveHalves] = useState(new Map()); // Single source of truth for 30min
  const slotPrice = useSelector((state) => state?.userSlot?.slotPriceData?.data || []);
  console.log("slotPrice", slotPrice);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [currentCourtId, setCurrentCourtId] = useState(null);
  const { slotData } = useSelector((state) => state?.userSlot);
  console.log("slotData", slotData);
  const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
  const questionList = useSelector((state) => state?.userNotificationData?.getQuestionData?.data) || [];
  const getPlayerLevels = useSelector((state) => state?.userNotificationData?.getPlayerLevel?.data) || [];
  const getPlayerLevelsLoading = useSelector((state) => state?.userNotificationData?.getPlayerLevelLoading) || [];
  const [dynamicSteps, setDynamicSteps] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState(location?.state?.finalSkillDetails || {});
  const [slotError, setSlotError] = useState("");
  const [selectedBuisness, setSelectedBuisness] = useState([]);

  // Dynamic MAX_SLOTS based on duration
  const getMaxSlots = () => {
    switch (selectedDuration) {
      case 30: return 6;  // 6 half slots
      case 60: return 3;  // 3 full slots
      case 90: return 2;  // 2 slots (user selects 2, gets total 3 with auto-selection)
      case 120: return 1; // 1 slot (with auto consecutive selection)
      default: return 3;
    }
  };
  const MAX_SLOTS = getMaxSlots();

  // Add price calculation function
  const getPriceForSlot = (slotTime, day = selectedDate?.day, forDisplay = false) => {
    if (!slotPrice || !Array.isArray(slotPrice) || slotPrice.length === 0) return 2500;

    const slotHour = parseTimeToHour(slotTime);
    if (slotHour === null) return 2500;

    let period = "morning";
    if (slotHour >= 17) period = "evening";
    else if (slotHour >= 12) period = "afternoon";

    // For 90min: show 60min price in slots, but total (60+30) for booking
    if (selectedDuration === 90) {
      const price60 = slotPrice.find(p => p.day === day && p.duration === 60 && p.timePeriod === period)?.price || 2500;
      if (forDisplay) return price60; // Show only 60min price in slot buttons
      const price30 = slotPrice.find(p => p.day === day && p.duration === 30 && p.timePeriod === period)?.price || 2000;
      return price60 + price30; // Use total for booking amount
    }

    // For 120min: use 60min price
    if (selectedDuration === 120) {
      return slotPrice.find(p => p.day === day && p.duration === 60 && p.timePeriod === period)?.price || 2500;
    }

    const entry = slotPrice.find(p =>
      p.day === day &&
      p.duration === selectedDuration &&
      p.timePeriod === period
    );

    return entry?.price || (selectedDuration === 60 ? 2500 : 2000);
  };

  // Get 30min price note for 90min duration
  const get30MinPriceNote = (slotTime, day = selectedDate?.day) => {
    if (selectedDuration !== 90) return null;
    
    const slotHour = parseTimeToHour(slotTime);
    if (slotHour === null) return null;

    let period = "morning";
    if (slotHour >= 17) period = "evening";
    else if (slotHour >= 12) period = "afternoon";

    const price60 = slotPrice.find(p => p.day === day && p.duration === 60 && p.timePeriod === period)?.price || 2500;
    const price30 = slotPrice.find(p => p.day === day && p.duration === 30 && p.timePeriod === period)?.price || 2000;
    
    return `₹${price60} + ₹${price30}`;
  };

  const getSortedSlots = (court) => {
    return [...(court?.slots || [])].sort((a, b) => {
      const hourA = parseTimeToHour(a.time);
      const hourB = parseTimeToHour(b.time);
      return hourA - hourB;
    });
  };
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
  useEffect(() => {
    localStorage.setItem("addedPlayers", JSON.stringify(addedPlayers));
  }, [addedPlayers]);

  useEffect(() => {
    if (location?.state?.paymentError) {
      setErrorMessage(location.state.paymentError);
      setErrorShow(true);
      const timer = setTimeout(() => {
        setErrorShow(false);
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location?.state?.paymentError]);

  useEffect(() => {
    if (location?.state?.selectedCourts && location.state.selectedCourts.length > 0) {
      const restoredTimes = {};
      location.state.selectedCourts.forEach(court => {
        if (court.time && court.time.length > 0) {
          restoredTimes[court._id] = court.time;
        }
      });
      setSelectedTimes(restoredTimes);
      setSelectedBuisness(location.state.selectedCourts.flatMap(c => c.time));
    }
  }, [location?.state?.selectedCourts]);

  const durationOptions = [
    { label: "30min", value: 30 },
    { label: "60min", value: 60 },
    { label: "90min", value: 90 },
    { label: "120min", value: 120 },
  ];

  // Clear selections when duration changes
  useEffect(() => {
    setSelectedTimes({});
    setSelectedBuisness([]);
    setSelectedCourts([]);
    setHalfSelectedSlots(new Set());
    setActiveHalves(new Map()); // Clear activeHalves on duration change
  }, [selectedDuration]);

  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (questionList && questionList.length > 0) {
      const copy = Array.isArray(questionList || getPlayerLevels) ? [...questionList] : [];
      const transformed = copy
        .sort((a, b) => (a.step || 0) - (b.step || 0))
        .map((q) => ({
          _id: q._id,
          question: q.question,
          options: Array.isArray(q.options)
            ? q.options.map((opt) => ({
              value: opt.value,
              _id: opt._id,
            }))
            : [],
          isMultiSelect: q.step === 2,
        }));

      setDynamicSteps(transformed);
    } else {
      setDynamicSteps([]);
    }
  }, [questionList]);

  useEffect(() => {
    if (getToken?.token) {
      setProfileLoading(true);
      dispatch(getUserProfile()).then((result) => {
        setUserGender(result.payload?.response?.gender || "");
        if (result.payload?.existsOpenMatchData) {
          setExistsOpenMatchData(true);
          if (window.innerWidth > 768) {
            setMatchPlayer(true);
          }
        }
        setProfileLoading(false);
      }).catch(() => {
        setProfileLoading(false);
      });
    }

    dispatch(getUserClub({ search: "" }));
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch, getToken?.token]);

  const today = new Date();
  const dates = Array.from({ length: 41 }).map((_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      fullDate: date.toISOString().split("T")[0],
    };
  });

  const dayShortMap = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };

  const scrollRef = useRef(null);

  const handleSwitchChange = () => {
    setShowUnavailable(!showUnavailable);
  };



  const toggleTime = (time, courtId, date, clickSide = null) => {
    const dateKey = date || selectedDate?.fullDate;
    const sortedSlots = getSortedSlots(slotData?.data?.find(c => c?._id === courtId));
    const currentIndex = sortedSlots.findIndex(s => s._id === time._id);
    const nextSlot = sortedSlots[currentIndex + 1];
    const currentCourtTimes = selectedTimes[courtId] || [];
    const isAlreadySelected = currentCourtTimes.some((t) => t?._id === time?._id);

    // ========== 30MIN DURATION LOGIC ==========
    if (selectedDuration === 30) {
      if (!clickSide) return;

      const slotKey = `${courtId}-${time._id}-${dateKey}`;
      const currentActiveHalf = activeHalves.get(slotKey);

      // If clicking same side that's already active - unselect
      if (currentActiveHalf === clickSide) {
        setActiveHalves(prev => {
          const newMap = new Map(prev);
          newMap.delete(slotKey);
          return newMap;
        });

        // Remove from selected times
        const filteredTimes = currentCourtTimes.filter(t => t._id !== time._id);
        setSelectedTimes(prev => {
          const updated = { ...prev };
          if (filteredTimes.length > 0) {
            updated[courtId] = filteredTimes;
          } else {
            delete updated[courtId];
          }
          return updated;
        });

        setSelectedBuisness(prev => prev.filter(t => t._id !== time._id));

        setSelectedCourts(prev =>
          prev
            .map(c =>
              c._id === courtId
                ? { ...c, time: c.time.filter(t => t._id !== time._id) }
                : c
            )
            .filter(c => c.time.length > 0)
        );
        setSlotError("");
        return;
      }

      // Check slot limit for new selections
      if (!currentActiveHalf && activeHalves.size >= MAX_SLOTS) {
        setSlotError(`Maximum ${MAX_SLOTS} half slots allowed for 30min duration.`);
        return;
      }

      // Set new active half (this automatically handles switching)
      setActiveHalves(prev => {
        const newMap = new Map(prev);
        newMap.set(slotKey, clickSide);
        return newMap;
      });

      const newTimeEntry = {
        _id: time._id,
        time: time.time,
        amount: getPriceForSlot(time.time),
      };

      const newTimes = [...currentCourtTimes.filter(t => t._id !== time._id), newTimeEntry];
      setSelectedTimes(prev => ({ ...prev, [courtId]: newTimes }));
      setSelectedBuisness(prev => [...prev.filter(t => t._id !== time._id), newTimeEntry]);

      const currentCourt = slotData?.data?.find((c) => c._id === courtId);
      if (currentCourtTimes.length === 0) {
        setSelectedCourts(prev => [
          ...prev,
          {
            _id: currentCourt._id,
            courtName: currentCourt.courtName,
            type: currentCourt.type,
            date: dateKey,
            day: selectedDate?.day,
            time: [newTimeEntry],
          },
        ]);
      } else {
        setSelectedCourts(prev =>
          prev.map(c =>
            c._id === courtId
              ? { ...c, time: [...c.time.filter(t => t._id !== time._id), newTimeEntry] }
              : c
          )
        );
      }
      setSlotError("");
      return;
    }

    // ========== 60MIN DURATION LOGIC ==========
    if (selectedDuration === 60) {
      // If already selected, unselect
      if (isAlreadySelected) {
        const filteredTimes = currentCourtTimes.filter(t => t._id !== time._id);
        setSelectedTimes(prev => {
          const updated = { ...prev };
          if (filteredTimes.length > 0) {
            updated[courtId] = filteredTimes;
          } else {
            delete updated[courtId];
          }
          return updated;
        });

        setSelectedBuisness(prev => prev.filter(t => t._id !== time._id));

        setSelectedCourts(prev =>
          prev
            .map(c =>
              c._id === courtId
                ? { ...c, time: c.time.filter(t => t._id !== time._id) }
                : c
            )
            .filter(c => c.time.length > 0)
        );
        setSlotError("");
        return;
      }

      // Check slot limit
      const totalSlots = Object.values(selectedTimes).flat().length;
      if (totalSlots >= MAX_SLOTS) {
        setSlotError(`Maximum ${MAX_SLOTS} slots allowed in total.`);
        return;
      }

      // Select slot
      const newTimeEntry = {
        _id: time._id,
        time: time.time,
        amount: getPriceForSlot(time.time),
      };

      const newTimes = [...currentCourtTimes, newTimeEntry];
      setSelectedTimes(prev => ({ ...prev, [courtId]: newTimes }));
      setSelectedBuisness(prev => [...prev, newTimeEntry]);

      const currentCourt = slotData?.data?.find((c) => c._id === courtId);
      if (currentCourtTimes.length === 0) {
        setSelectedCourts(prev => [
          ...prev,
          {
            _id: currentCourt._id,
            courtName: currentCourt.courtName,
            type: currentCourt.type,
            date: dateKey,
            day: selectedDate?.day,
            time: [newTimeEntry],
          },
        ]);
      } else {
        setSelectedCourts(prev =>
          prev.map(c =>
            c._id === courtId
              ? { ...c, time: [...c.time, newTimeEntry] }
              : c
          )
        );
      }
      setSlotError("");
      return;
    }

    // ========== 90MIN DURATION LOGIC ==========
    if (selectedDuration === 90) {
      if (!clickSide) return;

      const slotKey = `${courtId}-${time._id}-${dateKey}`;
      const nextKey = `${courtId}-${nextSlot?._id}-${dateKey}`;
      const thirdSlot = sortedSlots[currentIndex + 2];
      const thirdKey = `${courtId}-${thirdSlot?._id}-${dateKey}`;
      
      const currentActiveHalf = activeHalves.get(slotKey);
      const nextActiveHalf = activeHalves.get(nextKey);

      // UNSELECT: Remove entire 90min or 120min booking
      if (currentActiveHalf || isAlreadySelected) {
        setActiveHalves(prev => {
          const newMap = new Map(prev);
          newMap.delete(slotKey);
          newMap.delete(nextKey);
          if (thirdSlot) newMap.delete(thirdKey);
          return newMap;
        });

        const idsToRemove = [time._id];
        if (nextSlot) idsToRemove.push(nextSlot._id);
        if (thirdSlot) idsToRemove.push(thirdSlot._id);

        const filteredTimes = currentCourtTimes.filter(t => !idsToRemove.includes(t._id));
        setSelectedTimes(prev => {
          const updated = { ...prev };
          if (filteredTimes.length > 0) updated[courtId] = filteredTimes;
          else delete updated[courtId];
          return updated;
        });
        setSelectedBuisness(prev => prev.filter(t => !idsToRemove.includes(t._id)));
        setSelectedCourts(prev => prev.map(c => c._id === courtId ? { ...c, time: c.time.filter(t => !idsToRemove.includes(t._id)) } : c).filter(c => c.time.length > 0));
        setSlotError("");
        return;
      }

      // Check if clicking on right side of auto-selected left half (second slot)
      if (nextActiveHalf === "left" && clickSide === "right" && 
          parseTimeToHour(time.time) === parseTimeToHour(nextSlot.time) - 1) {
        
        // Expand to 120min - need third consecutive slot
        if (!thirdSlot || parseTimeToHour(thirdSlot.time) !== parseTimeToHour(nextSlot.time) + 1 ||
            thirdSlot.status === "booked" || thirdSlot.availabilityStatus !== "available" ||
            isPastTime(thirdSlot.time)) {
          setSlotError("Cannot expand to 120min - third slot not available");
          return;
        }

        const totalSlots = Object.values(selectedTimes).flat().length;
        if (totalSlots >= MAX_SLOTS) {
          setSlotError(`Maximum ${MAX_SLOTS} slots allowed`);
          return;
        }

        // Clear half-selection state and add all three slots as full selections
        setActiveHalves(prev => {
          const newMap = new Map(prev);
          newMap.delete(slotKey);
          newMap.delete(nextKey);
          return newMap;
        });

        const timeEntry1 = { _id: time._id, time: time.time, amount: getPriceForSlot(time.time) };
        const timeEntry2 = { _id: nextSlot._id, time: nextSlot.time, amount: getPriceForSlot(nextSlot.time) };
        const timeEntry3 = { _id: thirdSlot._id, time: thirdSlot.time, amount: getPriceForSlot(thirdSlot.time) };

        const newTimes = [...currentCourtTimes.filter(t => ![time._id, nextSlot._id, thirdSlot._id].includes(t._id)), timeEntry1, timeEntry2, timeEntry3];
        setSelectedTimes(prev => ({ ...prev, [courtId]: newTimes }));
        setSelectedBuisness(prev => [...prev.filter(t => ![time._id, nextSlot._id, thirdSlot._id].includes(t._id)), timeEntry1, timeEntry2, timeEntry3]);

        const currentCourt = slotData?.data?.find(c => c._id === courtId);
        if (currentCourtTimes.length === 0) {
          setSelectedCourts(prev => [...prev, { _id: currentCourt._id, courtName: currentCourt.courtName, type: currentCourt.type, date: dateKey, day: selectedDate?.day, time: [timeEntry1, timeEntry2, timeEntry3] }]);
        } else {
          setSelectedCourts(prev => prev.map(c => c._id === courtId ? { ...c, time: [...c.time.filter(t => ![time._id, nextSlot._id, thirdSlot._id].includes(t._id)), timeEntry1, timeEntry2, timeEntry3] } : c));
        }
        setSlotError("");
        return;
      }

      // NEW SELECTION: Check consecutive
      if (!nextSlot || parseTimeToHour(nextSlot.time) !== parseTimeToHour(time.time) + 1) {
        setSlotError("Select consecutive slots for 90 minutes");
        return;
      }

      const nextHalf = activeHalves.get(nextKey);
      const totalSlots = Object.values(selectedTimes).flat().length;

      if (totalSlots >= MAX_SLOTS) {
        setSlotError(`Maximum ${MAX_SLOTS} slots allowed`);
        return;
      }

      if (clickSide === "right") {
        if (nextHalf) {
          setSlotError("Slot already occupied");
          return;
        }
        // For right click: first slot gets right half, second slot gets left half
        setActiveHalves(prev => {
          const newMap = new Map(prev);
          newMap.set(slotKey, "right");
          newMap.set(nextKey, "left");
          return newMap;
        });
      } else {
        if (nextHalf) {
          setSlotError("Slot already occupied");
          return;
        }
        // For left click: first slot gets full, second slot gets left half
        setActiveHalves(prev => {
          const newMap = new Map(prev);
          newMap.set(slotKey, "full");
          newMap.set(nextKey, "left");
          return newMap;
        });
      }

      const timeEntry = { _id: time._id, time: time.time, amount: getPriceForSlot(time.time) };
      const newTimes = [...currentCourtTimes.filter(t => t._id !== time._id), timeEntry];
      setSelectedTimes(prev => ({ ...prev, [courtId]: newTimes }));
      setSelectedBuisness(prev => [...prev.filter(t => t._id !== time._id), timeEntry]);

      const currentCourt = slotData?.data?.find(c => c._id === courtId);
      if (currentCourtTimes.length === 0) {
        setSelectedCourts(prev => [...prev, { _id: currentCourt._id, courtName: currentCourt.courtName, type: currentCourt.type, date: dateKey, day: selectedDate?.day, time: [timeEntry] }]);
      } else {
        setSelectedCourts(prev => prev.map(c => c._id === courtId ? { ...c, time: [...c.time.filter(t => t._id !== time._id), timeEntry] } : c));
      }
      setSlotError("");
      return;
    }

    // ========== 120MIN DURATION LOGIC ==========
    if (selectedDuration === 120) {
      if (!nextSlot || parseTimeToHour(nextSlot.time) !== parseTimeToHour(time.time) + 1) {
        setSlotError("Not enough consecutive slots for 120 minutes");
        return;
      }

      // Check if this specific pair is already selected
      const isPairSelected = currentCourtTimes.some(t => t._id === time._id) &&
        currentCourtTimes.some(t => t._id === nextSlot._id);

      // If this pair is selected, unselect both
      if (isPairSelected) {
        const filteredTimes = currentCourtTimes.filter(t =>
          t._id !== time._id && t._id !== nextSlot._id
        );
        setSelectedTimes(prev => {
          const updated = { ...prev };
          if (filteredTimes.length > 0) {
            updated[courtId] = filteredTimes;
          } else {
            delete updated[courtId];
          }
          return updated;
        });

        setSelectedBuisness(prev => prev.filter(t => t._id !== time._id && t._id !== nextSlot._id));

        setSelectedCourts(prev =>
          prev
            .map(c =>
              c._id === courtId
                ? { ...c, time: c.time.filter(t => t._id !== time._id && t._id !== nextSlot._id) }
                : c
            )
            .filter(c => c.time.length > 0)
        );
        setSlotError("");
        return;
      }

      // Check slot limit (need 2 slots)
      const totalSlots = Object.values(selectedTimes).flat().length;
      if (totalSlots >= MAX_SLOTS) {
        setSlotError(`Maximum ${MAX_SLOTS} slots allowed for 120min duration.`);
        return;
      }

      // Auto select both consecutive slots
      const timeEntry1 = {
        _id: time._id,
        time: time.time,
        amount: getPriceForSlot(time.time),
      };
      const timeEntry2 = {
        _id: nextSlot._id,
        time: nextSlot.time,
        amount: getPriceForSlot(nextSlot.time),
      };

      const newTimes = [...currentCourtTimes, timeEntry1, timeEntry2];
      setSelectedTimes(prev => ({ ...prev, [courtId]: newTimes }));
      setSelectedBuisness(prev => [...prev, timeEntry1, timeEntry2]);

      const currentCourt = slotData?.data?.find((c) => c._id === courtId);
      if (currentCourtTimes.length === 0) {
        setSelectedCourts(prev => [
          ...prev,
          {
            _id: currentCourt._id,
            courtName: currentCourt.courtName,
            type: currentCourt.type,
            date: dateKey,
            day: selectedDate?.day,
            time: [timeEntry1, timeEntry2],
          },
        ]);
      } else {
        setSelectedCourts(prev =>
          prev.map(c =>
            c._id === courtId
              ? { ...c, time: [...c.time, timeEntry1, timeEntry2] }
              : c
          )
        );
      }
      setSlotError("");
      return;
    }
  };

  const maxSelectableDate = new Date();
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

  // Clear slots when date changes
  useEffect(() => {
    if (selectedCourts.length > 0 && selectedCourts[0].date !== selectedDate.fullDate) {
      setSelectedCourts([]);
      setSelectedTimes({});
      setSelectedBuisness([]);
      setSlotError("");
    }
  }, [selectedDate.fullDate]);

  const savedClubId = localStorage.getItem("register_club_id");

  useEffect(() => {
    if (savedClubId && selectedDate.day) {
      dispatch(
        getUserSlotBooking({
          register_club_id: savedClubId,
          day: selectedDate.day,
          date: selectedDate.fullDate,
          duration: selectedDuration,
          courtId: currentCourtId || "",
        })
      );
      dispatch(
        getUserSlotPrice({
          day: selectedDate.day,
          register_club_id: savedClubId,
          duration: selectedDuration
        })
      );
    }
  }, [
    selectedDate.day,
    selectedDuration,
    currentCourtId,
    savedClubId,
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

  // Remove old tab counting logic since we're showing all slots now

  const getFilteredLastStepOptions = () => {
    if (!dynamicSteps || dynamicSteps.length === 0) return [];

    const firstAnswer = selectedAnswers[0];
    const lastStep = dynamicSteps[dynamicSteps.length - 1];
    if (!lastStep) return [];

    if (!firstAnswer) return lastStep.options || [];

    const levelMap = {
      Beginner: ["D1", "D2"],
      Intermediate: ["C1", "C2"],
      Advanced: ["B1", "B2"],
      Professional: ["A"],
    };

    const allowedCodes = levelMap[firstAnswer] || [];

    const normalizedOptions = (lastStep.options || []).map((opt) => ({
      raw: opt,
    }));

    const matched = normalizedOptions.filter(({ val }) =>
      allowedCodes.some((code) => String(val).startsWith(code))
    ).map(({ raw }) => raw);

    return matched.length > 0 ? matched : (lastStep.options || []);
  };

  useEffect(() => {
    if (!matchPlayer && !existsOpenMatchData) {
      dispatch(getQuestionData())
    }
  }, [dispatch, matchPlayer, existsOpenMatchData]);

  const handleAnswerSelect = (stepIndex, value) => {
    const step = dynamicSteps[stepIndex];
    if (!step) return;

    // If changing first step answer, reset final level step
    if (stepIndex === 0) {
      const currentFirstAnswer = selectedAnswers[0];
      if (currentFirstAnswer !== value) {
        setIsFinalLevelStepLoaded(false);
        setFinalLevelStep(null);
        if (isFinalLevelStepLoaded) {
          setDynamicSteps(prev => prev.slice(0, -1));
        }
      }
    }

    if (step.isMultiSelect) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [stepIndex]: prev[stepIndex]?.includes(value)
          ? prev[stepIndex].filter((v) => v !== value)
          : [...(prev[stepIndex] || []), value],
      }));
    } else {
      setSelectedAnswers((prev) => ({
        ...prev,
        [stepIndex]: value,
      }));
    }
  };

  const grandTotal = selectedCourts.reduce(
    (sum, c) =>
      sum +
      c.time.reduce((s, t) => s + Number(t.amount || 0), 0),
    0
  );


  const handleNext = async () => {
    if (selectedCourts.length === 0) {
      setSlotError("Select a slot to enable booking");
      return;
    }

    if (!isCurrentStepValid()) {
      setSlotError("Please select an option");
      return;
    }

    if (currentStep === dynamicSteps.length - 1 && !isFinalLevelStepLoaded) {
      const firstAnswer = selectedAnswers[0];

      try {
        const response = await dispatch(getPlayerLevel(firstAnswer)).unwrap();
        const apiData = response?.data || [];

        if (!Array.isArray(apiData) || apiData.length === 0) {
          throw new Error("Empty API response");
        }

        const newLastStep = {
          _id: apiData[0]._id || "dynamic-final-step",
          question: apiData[0]?.question || "Which Padel Player Are You?",
          options: apiData.map(opt => ({
            _id: opt.code,
            value: `${opt.code} - ${opt.question}`
          })),
          isMultiSelect: false
        };

        setFinalLevelStep(newLastStep);
        setDynamicSteps(prev => [...prev, newLastStep]);
        setIsFinalLevelStepLoaded(true);
        setCurrentStep(prev => prev + 1);
        setSlotError("");
        return;

      } catch (err) {
        setSlotError("Failed to load player levels. Please try again.");
        return;
      }
    }

    if (currentStep < dynamicSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSlotError("");
      return;
    }

    setMatchPlayer(true);
    setShowMobileModal(false);
    setSlotError("");
  };

  const handleBack = () => {
    if (currentStep > 0) {
      if (currentStep === dynamicSteps.length - 1 && isFinalLevelStepLoaded) {
        setIsFinalLevelStepLoaded(false);
        setFinalLevelStep(null);
        setDynamicSteps(prev => prev.slice(0, -1));
      }
      setCurrentStep(currentStep - 1);
      setSlotError("");
    }
  };

  const isCurrentStepValid = () => {
    const current = selectedAnswers[currentStep];
    if (!current) return false;
    if (Array.isArray(current)) return current.length > 0;
    return true;
  };

  useEffect(() => {
    if (slotError) {
      const timer = setTimeout(() => setSlotError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [slotError]);

  useEffect(() => {
    const totalSelected = Object.values(selectedTimes).flat().length;
    const buttons = document.querySelectorAll('.slot-time-btn');
    buttons.forEach(button => {
      if (button.title && button.title.includes('Maximum 2 consecutive') && totalSelected >= 2) {
        button.addEventListener('mouseenter', () => {
          let tooltip = document.getElementById('slot-limit-tooltip-create');
          if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'slot-limit-tooltip-create';
            tooltip.style.cssText = `
              position: fixed;
              background: #333;
              color: white;
              padding: 8px 12px;
              border-radius: 4px;
              font-size: 12px;
              z-index: 9999;
              pointer-events: none;
              white-space: nowrap;
            `;
            document.body.appendChild(tooltip);
          }
          tooltip.textContent = button.title;
          tooltip.style.display = 'block';
        });

        button.addEventListener('mousemove', (e) => {
          const tooltip = document.getElementById('slot-limit-tooltip-create');
          if (tooltip) {
            tooltip.style.left = e.clientX + 10 + 'px';
            tooltip.style.top = e.clientY - 30 + 'px';
          }
        });

        button.addEventListener('mouseleave', () => {
          const tooltip = document.getElementById('slot-limit-tooltip-create');
          if (tooltip) {
            tooltip.style.display = 'none';
          }
        });
      }
    });
  }, [selectedTimes]);

  const getCurrentMonth = (selectedDate) => {
    if (!selectedDate || !selectedDate.fullDate) return "MONTH";
    const dateObj = new Date(selectedDate.fullDate);
    const month = dateObj
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    return month.split("").join("\n");
  };

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

  // Helper function to format time - handles half-slot display for 30min duration
  const formatTimeDisplay = (timeStr, duration) => {
    if (!timeStr) return "";
    
    // For 30min duration, check if this is a half-slot time (contains :30)
    if (duration === 30 && timeStr.includes(':30')) {
      return formatTimeForDisplay(timeStr);
    }
    
    return formatTimeForDisplay(timeStr);
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

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  const renderSlotButton = (slot, index, courtId) => {
    const dateKey = selectedDate?.fullDate;
    const currentCourtTimes = selectedTimes[courtId] || [];
    const isSlotSelected = currentCourtTimes.some(t => t._id === slot._id);
    const totalSlots = Object.values(selectedTimes).flat().length;
    const price = getPriceForSlot(slot.time, selectedDate?.day, true);

    let isDisabled = slot?.status === "booked" || slot?.availabilityStatus !== "available" || isPastTime(slot?.time);

    const sortedSlots = getSortedSlots(slotData?.data?.find(c => c?._id === courtId));
    const currentIndex = sortedSlots.findIndex(s => s._id === slot._id);
    const nextSlotFor90 = sortedSlots[currentIndex + 1];
    const prevSlotFor90 = sortedSlots[currentIndex - 1];

    const bookingTime = slot?.bookingTime?.trim();
    const slotDuration = slot?.duration;
    // Check for :00 format (8:00 pm) or no colon format (8 pm) for left half
    const isLeftBooked = bookingTime && slotDuration === 30 && (/:(00|0)\s*(AM|PM)?$/i.test(bookingTime) || /^\d{1,2}\s*(am|pm)$/i.test(bookingTime));
    // Check for :30 format (8:30 pm) for right half
    const isRightBooked = bookingTime && slotDuration === 30 && /:30\s*(AM|PM)?$/i.test(bookingTime);
    const isHalfBooked = isLeftBooked || isRightBooked;

    // Hide half-booked slots for 60min, 90min, and 120min durations
    if ((selectedDuration === 60 || selectedDuration === 90 || selectedDuration === 120) && isHalfBooked) {
      return null;
    }

    // For 90min: Hide slot if next slot is not available
    if (selectedDuration === 90) {
      if (!nextSlotFor90 || 
          parseTimeToHour(nextSlotFor90.time) !== parseTimeToHour(slot.time) + 1 ||
          nextSlotFor90.status === "booked" ||
          nextSlotFor90.availabilityStatus !== "available" ||
          isPastTime(nextSlotFor90.time)) {
        return null;
      }
    }

    // Get activeHalf for display
    const slotKey = `${courtId}-${slot._id}-${dateKey}`;
    const activeHalf = activeHalves.get(slotKey);

    // Check slot limits and disable logic
    if (!isSlotSelected && !activeHalf) {
      if (selectedDuration === 30) {
        // For 30min: disable when 6 half slots are selected
        if (activeHalves.size >= MAX_SLOTS) {
          isDisabled = true;
        }
      } else if (selectedDuration === 60) {
        // For 60min: disable when 3 full slots are selected
        if (totalSlots >= MAX_SLOTS) {
          isDisabled = true;
        }
      } else if (selectedDuration === 90) {
        // For 90min: disable when 3 slots are selected (each creates auto-selection)
        if (totalSlots >= MAX_SLOTS) {
          isDisabled = true;
        }
      } else if (selectedDuration === 120) {
        // For 120min: disable when 1 slot is selected (creates auto consecutive pair)
        if (totalSlots >= MAX_SLOTS) {
          isDisabled = true;
        }
      }
    }

    // Background logic
    const getBackground = () => {
      // For 60min and 120min - full slot selection
      if (selectedDuration === 60 || selectedDuration === 120) {
        if (isSlotSelected) {
          return "linear-gradient(180deg, #0034E4 0%, #001B76 100%)";
        }
        return "#FFFFFF";
      }

      // For 30min - half slot selection
      if (selectedDuration === 30) {
        if (activeHalf === "full") {
          return "linear-gradient(180deg, #0034E4 0%, #001B76 100%)";
        }
        if (activeHalf === "left") {
          if (isRightBooked) {
            return "linear-gradient(to right, #0034E4 50%, #5a6883ff 50%)";
          }
          return "linear-gradient(to right, #0034E4 50%, #FFFFFF 50%)";
        }
        if (activeHalf === "right") {
          if (isLeftBooked) {
            return "linear-gradient(to right, #a1b1cfff 50%, #0034E4 50%)";
          }
          return "linear-gradient(to right, #FFFFFF 50%, #0034E4 50%)";
        }

        // If neither side is selected, show booking status
        if (isLeftBooked && !isRightBooked) {
          return "linear-gradient(to right, rgb(224, 224, 224) 50%, rgb(255, 255, 255) 50%)";
        }

        if (isRightBooked && !isLeftBooked) {
          return "linear-gradient(to right, rgb(255, 255, 255) 50%, rgb(224, 224, 224) 50%)";
        }

        return "#FFFFFF";
      }

      // For 90min - show full selection only for slots in selectedTimes
      if (selectedDuration === 90) {
        // Show visual for activeHalf states
        if (activeHalf === "full") {
          return "linear-gradient(180deg, #0034E4 0%, #001B76 100%)";
        }
        if (activeHalf === "left") {
          if (isRightBooked) {
            return "linear-gradient(to right, #0034E4 50%, #5a6883ff 50%)";
          }
          return "linear-gradient(to right, #0034E4 50%, #FFFFFF 50%)";
        }
        if (activeHalf === "right") {
          if (isLeftBooked) {
            return "linear-gradient(to right, #a1b1cfff 50%, #0034E4 50%)";
          }
          return "linear-gradient(to right, #FFFFFF 50%, #0034E4 50%)";
        }

        // Show booking status for non-selected slots
        if (isLeftBooked && !isRightBooked) {
          return "linear-gradient(to right, rgb(224, 224, 224) 50%, rgb(255, 255, 255) 50%)";
        }

        if (isRightBooked && !isLeftBooked) {
          return "linear-gradient(to right, rgb(255, 255, 255) 50%, rgb(224, 224, 224) 50%)";
        }

        return "#FFFFFF";
      }
      return "#FFFFFF";
    };

    // Click handler
    const handleClick = (e) => {

     
      if (isDisabled) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickSide = x < rect.width / 2 ? "left" : "right";
       console.log("clickSide:", clickSide);

      // Block clicks on booked halves
      if ((clickSide === "left" && isLeftBooked) || (clickSide === "right" && isRightBooked)) {
        return;
      }

      // Block clicks on unselected half when one half is already selected (30min only)
      if (selectedDuration === 30 && activeHalf && activeHalf !== clickSide) {
        return;
      }

      // For 90min, allow clicking on slots with activeHalf (for continuous bookings)
      if (selectedDuration === 90 && !isSlotSelected && !activeHalf && totalSlots >= MAX_SLOTS) {
        return;
      }

      // For 90min, allow clicking to unselect or select
      if (selectedDuration === 90) {
        toggleTime(slot, courtId, dateKey, clickSide);
        return;
      }

      // For 30min and 90min, pass clickSide
      if (selectedDuration === 30 || selectedDuration === 90) {
        toggleTime(slot, courtId, dateKey, clickSide);
        return;
      }

      // For 60min and 120min, no clickSide needed
      toggleTime(slot, courtId, dateKey);
    };

    return (
      <div key={index} className="col-3 col-sm-3 col-md-3 col-lg-2 mb-2">
        <button
          className="btn rounded-2 w-100 text-nowrap slot-time-btn position-relative overflow-hidden"
          disabled={isDisabled}
          onClick={handleClick}
          style={{
            background: getBackground(),
            cursor: isDisabled ? "not-allowed" : "pointer",
            opacity: isDisabled ? 0.6 : 1,
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
          {/* Text rendering logic */}
          {(() => {
            // For 30min with activeHalf - show gradient text
            if (selectedDuration === 30 && activeHalf) {
              return (
                <>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      background: activeHalf === "left"
                        ? "linear-gradient(to right, white 50%, #111827 50%)"
                        : "linear-gradient(to right, #111827 50%, white 50%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    {formatTimeForDisplay(slot.time)}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      background: activeHalf === "left"
                        ? "linear-gradient(to right, white 50%, #b6b8bbff 50%)"
                        : "linear-gradient(to right, #b6b8bbff 50%, white 50%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    ₹{price}
                  </span>
                </>
              );
            }

            // For 90min with activeHalf full - show white text
            if (selectedDuration === 90 && activeHalf === "full") {
              return (
                <>
                  <span style={{ fontWeight: 600, fontSize: "14px", color: "white" }}>
                    {formatTimeForDisplay(slot.time)}
                  </span>
                  <span style={{ fontSize: "12px", color: "white" }}>
                    ₹{price}
                  </span>
                </>
              );
            }

            // For 90min with activeHalf left or right - show gradient text
            if (selectedDuration === 90 && (activeHalf === "left" || activeHalf === "right")) {
              return (
                <>
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      background: activeHalf === "left"
                        ? "linear-gradient(to right, white 50%, #111827 50%)"
                        : "linear-gradient(to right, #111827 50%, white 50%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    {formatTimeForDisplay(slot.time)}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      background: activeHalf === "left"
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
              );
            }

            // For 60min or 120min selected slots - show white text
            if ((selectedDuration === 60 || selectedDuration === 120) && isSlotSelected) {
              return (
                <>
                  <span style={{ fontWeight: 600, fontSize: "14px", color: "white" }}>
                    {formatTimeForDisplay(slot.time)}
                  </span>
                  <span style={{ fontSize: "12px", color: "white" }}>
                    ₹{price}
                  </span>
                </>
              );
            }

            // Default: BLACK text for all other cases (including booked halves)
            return (
              <>
                <span style={{ fontWeight: 600, fontSize: "14px", color: "#000000" }}>
                  {formatTimeForDisplay(slot.time)}
                </span>
                <span style={{ fontSize: "12px", color: "#000000" }}>
                  ₹{price}
                </span>
              </>
            );
          })()}
        </button>
      </div>
    );
  };

  const renderCurrentQuestion = () => {
    if (!dynamicSteps || dynamicSteps?.length === 0) {
      return <div>Loading questions...</div>;
    }

    const step = dynamicSteps[currentStep];
    if (!step) {
      return <div>Loading questions...</div>;
    }

    const isLastStep = currentStep === dynamicSteps?.length - 1;
    const currentAnswer = selectedAnswers[currentStep] || (step?.isMultiSelect ? [] : "");
    const optionsToShow = isLastStep ? getFilteredLastStepOptions() : (step?.options || []);

    return (
      <Form>
        {optionsToShow.map((opt, i) => {
          const isSelected = step?.isMultiSelect
            ? currentAnswer.includes(opt?.value)
            : currentAnswer === opt?.value;

          return (
            <div
              key={opt?._id}
              onClick={() => handleAnswerSelect(currentStep, opt?.value)}
              className="d-flex align-items-center mb-3 p-3 rounded shadow-sm border step-option"
              style={{
                backgroundColor: isSelected ? "#eef2ff" : "#fff",
                borderColor: isSelected ? "#4f46e5" : "#e5e7eb",
                cursor: selectedCourts.length === 0 ? "not-allowed" : "pointer",
                gap: "12px",
                height: "50px",
                transition: "all 0.2s ease",
              }}
            >
              <Form.Check
                type={step?.isMultiSelect ? "checkbox" : "radio"}
                checked={isSelected}
                onChange={() => { }}
                style={{ flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: "Poppins",
                  color: "#1f2937",
                }}
              >
                {opt?.value}
              </span>
            </div>
          );
        })}
      </Form>
    );
  };

  const onBack = () => {
    navigate('/open-matches')
  }

  return (
    <Container className="py-md-4 px-md-0 py-0 px-2 mb-md-5 mb-0">
      <Row className="g-3">
        <Col md={7} className={`p-md-3 px-3 pt-3 pb-0 mobile-create-matches-content mt-0 ${matchPlayer ? 'd-none d-lg-block' : ''}`} style={{ paddingBottom: selectedCourts.length > 0 ? "120px" : "20px" }}>
          <div className="calendar-strip">
            <div className="d-flex justify-content-between align-items-center mb-md-2 mb-1">
              <div className="custom-heading-use text-nowrap">
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
                            const formattedDate = date.toISOString().split("T")[0];
                            const day = date.toLocaleDateString("en-US", { weekday: "long" });
                            setSelectedDate({ fullDate: formattedDate, day });
                            setSelectedCourts([]);
                            setSelectedTimes({});
                            setSelectedBuisness([]);
                            dispatch(
                              getUserSlotBooking({
                                day,
                                date: formattedDate,
                                duration: selectedDuration,
                                register_club_id: localStorage.getItem("register_club_id") || "",
                              })
                            );
                            dispatch(
                              getUserSlotPrice({
                                day: day,
                                duration: selectedDuration,
                                register_club_id: localStorage.getItem("register_club_id") || "",
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
                  Show Unavailable Slots
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

            <div className="d-flex align-items-center mb-md-3 mb-2 gap-2 border-bottom">
              <div className="position-relative mt-md-0 mt-2">
                {/* <div
                  className="d-flex justify-content-start border align-items-center gap-0 rounded p-2 pe-3 ps-0 mb-md-3 mb-2"
                  style={{
                    backgroundColor: "transparent",
                    width: "52px",
                    height: "58px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="d-flex align-items-center gap-0 p-0">
                    <img
                      src={booking_dropdown_img}
                      style={{ width: "34px", height: "34px" }}
                      alt=""
                    />
                    <MdKeyboardArrowDown
                      size={16}
                      style={{
                        transform: showDropdown
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                      className="d-md-flex d-none"
                    />
                  </div>
                </div> */}
                {showDropdown && (
                  <div
                    className="position-absolute bg-white rounded shadow"
                    style={{
                      top: "100%",
                      left: "-9px",
                      width: "105px",
                      zIndex: 1000,
                      marginTop: "-15px",
                    }}
                  >
                    <div className="d-flex align-items-center p-2 border-bottom" style={{ cursor: "pointer" }}>
                      <div className="flex-grow-1">
                        <div style={{ fontSize: "11px", fontWeight: "400", fontFamily: "Poppins" }}>Paddle</div>
                      </div>
                      <img src={booking_dropdown_img2} style={{ width: "23px", height: "23px" }} alt="" />
                    </div>
                    <div className="d-flex align-items-center p-2 border-bottom" style={{ cursor: "pointer" }}>
                      <div className="flex-grow-1">
                        <div style={{ fontSize: "11px", fontWeight: "400", fontFamily: "Poppins" }}>Tennis</div>
                      </div>
                      <img src={booking_dropdown_img3} style={{ width: "23px", height: "23px" }} alt="" />
                    </div>
                    <div className="d-flex align-items-center p-2" style={{ cursor: "pointer" }}>
                      <div className="flex-grow-1">
                        <div style={{ fontSize: "11px", fontWeight: "400", fontFamily: "Poppins" }}>Pickle Ball</div>
                      </div>
                      <img src={booking_dropdown_img4} style={{ width: "23px", height: "23px" }} alt="" />
                    </div>
                  </div>
                )}
              </div>

              <div
                className="d-flex calendar-day-btn-mobile   justify-content-center align-items-center rounded-1  mb-md-3 mb-0 mt-0 mt-md-2"
                style={{
                  backgroundColor: "#f3f3f5",
                  height: "58px",
                  padding: "2px 10px",
                  width: "20px",
                }}
              >
                <span
                  className="add_font_small_span"

                  style={{
                    fontSize: window.innerWidth <= 768 ? "12px" : "12px",
                    fontWeight: "500",
                    whiteSpace: "pre-line",
                    textAlign: "center",
                    lineHeight: "1",
                    letterSpacing: "0px",
                    margin: 0,
                    padding: 0,
                    display: "block"
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
                    maxWidth: "98%",
                  }}
                >
                  {dates.map((d, i) => {
                    const formatDate = (date) => date.toISOString().split("T")[0];
                    const isSelected = formatDate(new Date(selectedDate?.fullDate)) === d?.fullDate;
                    const slotCount = selectedCourts
                      .filter(court => court?.date === d?.fullDate)
                      .reduce((acc, court) => acc + court?.time?.length, 0);
                    return (
                      <button
                        key={i}
                        ref={(el) => (dateRefs.current[d.fullDate] = el)}
                        className={`calendar-day-btn mb-md-3 mb-2 me-1 position-relative ${isSelected ? "text-white border-0" : "bg-white"
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
                          dispatch(getUserSlotBooking({ day: d?.day, date: d?.fullDate, duration: selectedDuration, register_club_id: localStorage.getItem("register_club_id") || "" }));
                          dispatch(getUserSlotPrice({ day: d?.day, duration: selectedDuration, register_club_id: localStorage.getItem("register_club_id") || "" }));
                        }}
                        onMouseEnter={(e) => !isSelected && (e.currentTarget.style.border = "1px solid #3DBE64")}
                        onMouseLeave={(e) => (e.currentTarget.style.border = "1px solid #4949491A")}
                      >
                        <div className="text-center">
                          <div className="date-center-date">{d?.date}</div>
                          <div className="date-center-day">{dayShortMap[d?.day]}</div>
                        </div>
                        {slotCount > 0 && (
                          <span
                            className="position-absolute badge rounded-pill"
                            style={{
                              fontSize: "10px",
                              width: "18px",
                              height: "18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              top: "-7px",
                              right: "-4px",
                              zIndex: 2,
                              backgroundColor: "#22c55e"
                            }}
                          >
                            {slotCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button className="btn border-0 p-2 d-none d-md-block" style={{ position: "absolute", right: -18, zIndex: 10, boxShadow: "none" }} onClick={scrollRight}><MdOutlineArrowForwardIos className="mt-3" size={20} /></button>
              </div>
            </div>

            {/* Duration Filter Buttons */}
            <div className="row mb-3 mx-auto">
              <div className="col-12 d-flex justify-content-center align-items-center px-0">
                <div className="duration-tabs-wrapper w-100">
                  <div className="duration-tabs rounded-3 d-flex justify-content-center align-items-center">
                    {durationOptions.map((option) => (
                      <button
                        key={option.value}
                        className="btn rounded-3 flex-fill mx-1"
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          minWidth: "80px",
                          transition: "all 0.2s",
                          color: selectedDuration === option.value ? "white" : "black",
                          border: selectedDuration === option.value ? "0px solid white" : "1px solid #928f8fff",
                          background: selectedDuration === option.value ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)" : "#FFFFFF",
                        }}
                        onClick={() => setSelectedDuration(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mb-3 overflow-slot border-0 rounded-3"
              style={{
                border: slotError ? "1px solid red" : "1px solid #c2babaff",
              }}
            >
              {slotData?.data?.length > 0 ? (
                slotLoading ? (
                  <DataLoading height="50vh" />
                ) : (
                  <>
                    <div className="p-0">
                      {slotData?.data?.some((court) =>
                        court?.slots?.some((slot) =>
                          showUnavailable ||
                          (slot?.availabilityStatus === "available" &&
                            slot?.status !== "booked" &&
                            !isPastTime(slot?.time))
                        )
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
                                  {selectedDuration === 90 && slotPrice.length > 0 && (
                                    <span style={{ fontSize: "10px", color: "#6b7280", marginLeft: "8px", fontWeight: "400" }}>
                                      {(() => {
                                        const firstSlot = slotData?.data?.[0]?.slots?.[0];
                                        if (firstSlot) {
                                          return get30MinPriceNote(firstSlot.time);
                                        }
                                        return null;
                                      })()}
                                    </span>
                                  )}
                                </h6>
                              </div>
                            </div>
                          </>
                        )}
                      <div
                        style={{
                          // maxHeight: "60vh",
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
                            content: 'Game levels are self-assessed at the moment. AI assessment will start from Jan 2026.';
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
                          const filteredSlots = court?.slots?.filter((slot) =>
                            showUnavailable
                              ? true
                              : slot?.availabilityStatus === "available" &&
                              slot?.status !== "booked" &&
                              !isPastTime(slot?.time)
                          );
                          if (filteredSlots?.length === 0) return null;
                          return (
                            <div key={court?._id} className="row mb-md-3 mb-0 align-items-start pb-3 pb-md-0 border_bottom_line mt-2 mt-md-0">
                              <div className="col-md-3 col-12 border-end mb-0 d-flex d-md-block align-items-center justify-content-start">
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
                                  {filteredSlots?.map((slot, i) => renderSlotButton(slot, i, court?._id))}
                                </div>
                              </div>
                            </div>

                          );
                        })}
                      </div>
                      {slotData?.data?.some((court) =>
                        court?.slots?.some((slot) =>
                          showUnavailable ||
                          (slot?.availabilityStatus === "available" &&
                            slot?.status !== "booked" &&
                            !isPastTime(slot?.time))
                        )
                      ) && (
                          <div className="d-flex justify-content-end pt-2 pb-2 d-lg-none">
                            <Button
                              className="rounded-pill px-4 py-1"
                              style={{
                                background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                                border: "none",
                                fontWeight: "600",
                                fontSize: "13px",
                              }}
                              disabled={selectedCourts?.length === 0}
                              onClick={() => {
                                if (existsOpenMatchData) {
                                  setMatchPlayer(true);
                                } else {
                                  setShowMobileModal(true);
                                }
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
                          (slot) =>
                            showUnavailable ||
                            (slot?.availabilityStatus === "available" &&
                              slot?.status !== "booked" &&
                              !isPastTime(slot?.time))
                        )
                    ) && (
                        <div
                          className="text-center py-4 d-flex flex-column justify-content-center align-items-center mt-5"
                          style={{ fontFamily: "Poppins", fontWeight: 500, color: "#6B7280", }}
                        >
                          <p className="mb-1 label_font text-danger">No slots are available for this date.</p>
                          <p className="mb-0 label_font text-danger">Please choose another date</p>
                        </div>
                      )}
                  </>
                )
              ) : (
                <div className="text-center py-4 d-flex flex-column justify-content-center align-items-center mt-5" style={{ fontFamily: "Poppins", fontWeight: 500, color: "#6B7280" }}>
                  <p className="mb-1 label_font text-danger">No slots are available for this date.</p>
                  <p className="mb-0 label_font text-danger">Please choose another date</p>
                </div>
              )}
            </div>
          </div>
        </Col>

        <Col md={5} className={`ps-2 ${matchPlayer ? 'col-12' : ''}`}>
          <div
            className="d-lg-none mobile-create-matches-summary"
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
              borderRadius: "10px 10px 0 0",
              padding: "0px 15px",
            }}
          >
            {selectedCourts?.length > 0 && (
              <>
                <div
                  className="mobile-expanded-slots"
                  style={{
                    maxHeight: isExpanded
                      ? selectedCourts.reduce((s, c) => s + c?.time?.length, 0) > 2
                        ? "120px"
                        : "auto"
                      : "0px",
                    overflowY:
                      selectedCourts.reduce((s, c) => s + c?.time?.length, 0) > 2 && isExpanded
                        ? "auto"
                        : "hidden",
                    overflowX: "hidden",
                    paddingRight: "8px",
                    transition: "max-height 0.3s ease",
                    marginBottom: isExpanded ? "10px" : "0",
                  }}
                >
                  <style>{`
                    .mobile-expanded-slots::-webkit-scrollbar {
                      width: 8px;
                      border-radius: 3px;
                    }
                    .mobile-expanded-slots::-webkit-scrollbar-track {
                      background: #f5f5f5;
                      border-radius: 3px;
                    }
                    .mobile-expanded-slots::-webkit-scrollbar-thumb {
                      background: #626262;
                      border-radius: 3px;
                    }
                    .mobile-expanded-slots::-webkit-scrollbar-thumb:hover {
                      background: #626262;
                    }
                    .mobile-expanded-slots {
                      scrollbar-width: thin;
                      scrollbar-color: #626262 #f5f5f5;
                    }
                  `}</style>

                  {selectedCourts?.map((court, idx) => {
                    const courtTimes = [...court?.time];

                    // Add half-selected slots for 30min and 90min durations
                    if (selectedDuration === 30 || selectedDuration === 90) {
                      Array.from(activeHalves.entries()).forEach(([key, side]) => {
                        if (key.startsWith(`${court._id}-`) && key.includes(`-${court.date}-`)) {
                          const parts = key.split('-');
                          const slotId = parts[1];
                          
                          // For 90min, find the auto-selected second slot
                          if (selectedDuration === 90) {
                            const slotDataCourt = slotData?.data?.find(c => c?._id === court._id);
                            const sortedSlots = getSortedSlots(slotDataCourt);
                            const slotInfo = court.time.find(t => t._id === slotId);
                            if (slotInfo && sortedSlots) {
                              const currentIndex = sortedSlots.findIndex(s => s._id === slotId);
                              const nextSlot = sortedSlots[currentIndex + 1];
                              
                              if (nextSlot && (side === 'full' || side === 'right') && !courtTimes.some(t => t._id === nextSlot._id)) {
                                // Add the auto-selected second slot
                                courtTimes.push({
                                  ...nextSlot,
                                  time: nextSlot.time,
                                  _id: nextSlot._id,
                                  amount: nextSlot.amount || 1500
                                });
                              }
                            }
                          }
                          
                          // For 30min, add half-selected slots
                          if (selectedDuration === 30) {
                            const originalSlot = court.time.find(t => t._id === slotId);
                            if (originalSlot && !courtTimes.some(t => t._id === `${slotId}-${side}`)) {
                              let displayTime = originalSlot.time;
                              if (side === 'right') {
                                // Convert 6:00 PM to 6:30 PM for right half
                                displayTime = originalSlot.time.replace(/:(00|0)(\s*[ap]m)/i, ':30$2');
                              }
                              
                              courtTimes.push({
                                ...originalSlot,
                                time: displayTime,
                                _id: `${slotId}-${side}`,
                                originalId: slotId,
                                side: side
                              });
                            }
                          }
                        }
                      });
                    }

                    return courtTimes.map((timeSlot, tIdx) => (
                      <div key={`${idx}-${tIdx}`} className="row mb-1">
                        <div className="col-12 d-flex gap-1 mb-0 m-0 align-items-center justify-content-between">
                          <div className="d-flex text-white">
                            <span
                              style={{
                                fontWeight: "600",
                                fontFamily: "Poppins",
                                fontSize: "11px",
                              }}
                            >
                              {court?.date
                                ? `${new Date(court?.date).toLocaleString("en-US", {
                                  day: "2-digit",
                                })}, ${new Date(court?.date).toLocaleString("en-US", {
                                  month: "short",
                                })}`
                                : ""}
                            </span>
                            <span
                              className="ps-1"
                              style={{
                                fontWeight: "600",
                                fontFamily: "Poppins",
                                fontSize: "11px",
                              }}
                            >
                              {formatTimeDisplay(timeSlot?.time, selectedDuration)}
                            </span>
                            <span
                              className="ps-1"
                              style={{
                                fontWeight: "500",
                                fontFamily: "Poppins",
                                fontSize: "10px",
                              }}
                            >
                              {court?.courtName}
                            </span>
                          </div>

                          <div className="text-white">
                            <span
                              className="ps-1"
                              style={{
                                fontWeight: "600",
                                fontFamily: "Poppins",
                                fontSize: "11px",
                              }}
                            >
                              ₹ {timeSlot?.amount || "N/A"}
                            </span>
                            <MdOutlineDeleteOutline
                              className="ms-1 text-white"
                              style={{ cursor: "pointer", fontSize: "14px" }}
                              onClick={() => {
                                const targetId = timeSlot.originalId || timeSlot._id;
                                
                                // Handle activeHalves cleanup for all durations
                                if (selectedDuration === 30) {
                                  // For 30min duration - remove from activeHalves using original slot ID
                                  if (timeSlot.originalId) {
                                    const key = `${court._id}-${timeSlot.originalId}-${court.date}`;
                                    setActiveHalves(prev => {
                                      const newMap = new Map(prev);
                                      newMap.delete(key);
                                      return newMap;
                                    });
                                    // Use original ID for removing from other states too
                                    const actualTargetId = timeSlot.originalId;
                                    
                                    const updatedCourts = selectedCourts
                                      ?.map((c) =>
                                        c._id === court._id
                                          ? {
                                            ...c,
                                            time: c?.time.filter((t) => t?._id !== actualTargetId),
                                          }
                                          : c
                                      )
                                      .filter((c) => c?.time?.length > 0);
                                    setSelectedCourts(updatedCourts);

                                    const updatedTimes = { ...selectedTimes };
                                    if (updatedTimes[court?._id]) {
                                      updatedTimes[court?._id] = updatedTimes[court?._id].filter(
                                        (t) => t?._id !== actualTargetId
                                      );
                                      if (updatedTimes[court?._id]?.length === 0)
                                        delete updatedTimes[court?._id];
                                    }
                                    setSelectedTimes(updatedTimes);

                                    setSelectedBuisness(prev => prev.filter(t => t._id !== actualTargetId));
                                    return;
                                  }
                                } else if (selectedDuration === 90) {
                                  // For 90min duration - clear activeHalves for both current and next slot
                                  const slotDataCourt = slotData?.data?.find(c => c?._id === court._id);
                                  const sortedSlots = getSortedSlots(slotDataCourt);
                                  const currentIndex = sortedSlots.findIndex(s => s._id === targetId);
                                  const nextSlot = sortedSlots[currentIndex + 1];
                                  
                                  setActiveHalves(prev => {
                                    const newMap = new Map(prev);
                                    const slotKey = `${court._id}-${targetId}-${court.date}`;
                                    const nextKey = nextSlot ? `${court._id}-${nextSlot._id}-${court.date}` : null;
                                    
                                    newMap.delete(slotKey);
                                    if (nextKey) newMap.delete(nextKey);
                                    
                                    return newMap;
                                  });
                                }
                                
                                const updatedCourts = selectedCourts
                                  ?.map((c) =>
                                    c._id === court._id
                                      ? {
                                        ...c,
                                        time: c?.time.filter((t) => t?._id !== targetId),
                                      }
                                      : c
                                  )
                                  .filter((c) => c?.time?.length > 0);
                                setSelectedCourts(updatedCourts);

                                const updatedTimes = { ...selectedTimes };
                                if (updatedTimes[court?._id]) {
                                  updatedTimes[court?._id] = updatedTimes[court?._id].filter(
                                    (t) => t?._id !== targetId
                                  );
                                  if (updatedTimes[court?._id]?.length === 0)
                                    delete updatedTimes[court?._id];
                                }
                                setSelectedTimes(updatedTimes);

                                setSelectedBuisness(prev => prev.filter(t => t._id !== targetId));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ));
                  })}
                </div>
              </>
            )}
          </div>

          <Modal
            show={showMobileModal}
            onHide={() => setShowMobileModal(false)}
            size="lg"
            centered
            className="d-lg-none"
          >
            <Modal.Body className="p-0" style={{ position: "relative" }}>
              <button
                onClick={() => setShowMobileModal(false)}
                style={{
                  position: "absolute",
                  top: "3px",
                  right: "0px",
                  background: "transparent",
                  border: "none",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: "600",
                  cursor: "pointer",
                  zIndex: 999,
                }}
              >
                ✕
              </button>

              <div
                style={{
                  backgroundColor: "#F1F4FF",
                  borderRadius: "8px",
                  padding: "20px 10px",
                }}
              >
                <div className="d-flex gap-2 mb-4 justify-content-start align-items-center">
                  {dynamicSteps?.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: i <= currentStep ? "#3DBE64" : "#D9D9D9",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    ></div>
                  ))}
                </div>

                {dynamicSteps?.length > 0 && (
                  <>
                    <h6
                      className="mb-4 text-start"
                      style={{
                        fontSize: "18px",
                        fontFamily: "Poppins",
                        fontWeight: 600,
                        color: "#1f2937",
                      }}
                    >
                      {dynamicSteps[currentStep]?.question}
                    </h6>

                    <Form>
                      {(() => {
                        if (!dynamicSteps || dynamicSteps?.length === 0 || !dynamicSteps[currentStep]) {
                          return <div>Loading options...</div>;
                        }

                        const step = dynamicSteps[currentStep];
                        if (!step || !step?.options) {
                          return <div>Loading options...</div>;
                        }

                        const currentAnswer = selectedAnswers[currentStep] || (step?.isMultiSelect ? [] : "");
                        const isLastStep = currentStep === dynamicSteps?.length - 1;
                        const optionsToShow = isLastStep ? getFilteredLastStepOptions() : (step?.options || []);

                        return optionsToShow?.map((opt, i) => {
                          const optValue = opt?.value || opt?.code || opt;
                          const isSelected = step?.isMultiSelect
                            ? Array.isArray(currentAnswer) && currentAnswer.includes(optValue)
                            : currentAnswer === optValue;

                          return (
                            <div
                              key={opt?._id || i}
                              onClick={() => handleAnswerSelect(currentStep, optValue)}
                              className="d-flex align-items-center mb-0 border-0 px-3 py-2  shadow-sm  step-option"
                              style={{
                                backgroundColor: isSelected ? "#eef2ff" : "#fff",
                                borderColor: isSelected ? "#4f46e5" : "#e5e7eb",
                                cursor: selectedCourts?.length === 0 ? "not-allowed" : "pointer",
                                gap: "12px",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Form.Check
                                type={step?.isMultiSelect ? "checkbox" : "radio"}
                                checked={isSelected}
                                onChange={() => { }}
                                style={{ flexShrink: 0 }}
                              />
                              <span
                                style={{
                                  fontSize: "15px",
                                  fontWeight: 600,
                                  fontFamily: "Poppins",
                                  color: "#1f2937",
                                }}
                              >
                                {opt?.value || `${opt?.code} - ${opt?.title || opt?.question}`}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </Form>
                  </>
                )}

                {(slotError || errorMessage) && (
                  <div
                    className="text-center mb-3 p-2 rounded"
                    style={{
                      backgroundColor: "#ffebee",
                      color: "#c62828",
                      border: "1px solid #ffcdd2",
                      fontWeight: 500,
                      fontSize: "14px",
                    }}
                  >
                    {slotError || errorMessage}
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mt-4">
                  {currentStep > 0 && (
                    <Button
                      variant="secondary"
                      className="rounded-pill px-4 py-1"
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  )}

                  <Button
                    style={{
                      background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                      border: "none",
                    }}
                    className="rounded-pill px-4 mb-0 py-1 ms-auto"
                    disabled={selectedCourts?.length === 0 || !isCurrentStepValid()}
                    onClick={handleNext}
                  >
                    {getPlayerLevelsLoading === true ? (
                      <ButtonLoading color="#fff" />
                    ) : currentStep === dynamicSteps?.length - 1 && isFinalLevelStepLoaded ? (
                      "Submit"
                    ) : (
                      "Next"
                    )}
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          {profileLoading ? (
            <></>
          ) : !matchPlayer && !existsOpenMatchData && dynamicSteps?.length > 0 && (
            <div className="d-none d-lg-block">
              <div style={{ backgroundColor: "#F1F4FF", borderRadius: "12px" }}>
                <div className="d-flex pt-4 align-items-center" style={{ position: "relative" }}>

                  <div style={{ position: "absolute", left: 0 }}>
                    <button
                      className="btn btn-light rounded-circle ms-2 p-2 d-flex align-items-center justify-content-center"
                      style={{ width: 36, height: 36 }}
                      onClick={onBack}
                    >
                      <i className="bi bi-arrow-left" />
                    </button>
                  </div>

                  <div className="d-flex justify-content-center w-100 gap-2">
                    {dynamicSteps?.map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          backgroundColor: i <= currentStep ? "#3DBE64" : "#D9D9D9",
                          color: i <= currentStep ? "#3DBE64" : "#D9D9D9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>

                </div>

                <div className="p-4 mt-3">
                  <h6 className="mb-4" style={{ fontSize: "20px", fontWeight: 600 }}>
                    {dynamicSteps[currentStep]?.question}
                  </h6>

                  <div
                    style={{
                      opacity: selectedCourts?.length === 0 ? 0.5 : 1,
                      pointerEvents: selectedCourts?.length === 0 ? "none" : "auto",
                    }}
                  >
                    {renderCurrentQuestion()}
                  </div>
                </div>

                {(slotError || errorMessage) && (
                  <div className="text-center p-3">
                    <div style={{ backgroundColor: "#ffebee", color: "#c62828", padding: "10px", borderRadius: "8px" }}>
                      {slotError || errorMessage}
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-end align-items-center p-3">
                  {currentStep > 0 && (
                    <Button variant="secondary" className="me-3 pt-1 rounded-pill" onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  <Button
                    style={{
                      background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                      border: "none",
                    }}
                    className="rounded-pill px-4 py-2 pt-1 d-flex align-items-center justify-content-center"
                    disabled={selectedCourts?.length === 0 || !isCurrentStepValid()}
                    onClick={handleNext}
                  >
                    {getPlayerLevelsLoading === true ? (
                      <ButtonLoading color={'white'} />
                    ) : currentStep === dynamicSteps?.length - 1 && isFinalLevelStepLoaded ? (
                      "Submit"
                    ) : (
                      "Next"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {profileLoading ? (<>
            <MatchplayerShimmer />
          </>) : matchPlayer && (
            <MatchPlayer
              addedPlayers={addedPlayers}
              setAddedPlayers={setAddedPlayers}
              selectedCourts={selectedCourts}
              selectedDate={selectedDate}
              finalSkillDetails={existsOpenMatchData ? [] : (selectedAnswers && Object.keys(selectedAnswers)?.length > 0 ? selectedAnswers : {})}
              totalAmount={selectedCourts.reduce((sum, c) => sum + c?.time.reduce((s, t) => s + Number(t?.amount || 0), 0), 0)}
              existsOpenMatchData={existsOpenMatchData}
              slotError={slotError}
              userGender={userGender}
              selectedDuration={selectedDuration}
              slotData={slotData}
              onBackToSlots={() => {
                setMatchPlayer(false);
                setCurrentStep(0);
                setSlotError("");
              }}
              matchPlayer={matchPlayer}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CreateMatches;
