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
import { getUserSlotBooking } from "../../../redux/user/slot/thunk";
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

/* ──────────────────────── Helper Functions ──────────────────────── */
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

/* ──────────────────────── Main Component ──────────────────────── */
const CreateMatches = () => {
  const location = useLocation();

  // If navigated from Openmatches, `location.state.selectedDate` may be provided
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
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [errorShow, setErrorShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedBuisness, setSelectedBuisness] = useState([]);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [skillDetails, setSkillDetails] = useState([]); // [step0, step1, ..., step5]
  const [currentCourtId, setCurrentCourtId] = useState(null);
  const { slotData } = useSelector((state) => state?.userSlot);
  const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
  const questionList = useSelector((state) => state?.userNotificationData?.getQuestionData?.data) || [];
  const getPlayerLevels = useSelector((state) => state?.userNotificationData?.getPlayerLevel?.data) || [];
  const getPlayerLevelsLoading = useSelector((state) => state?.userNotificationData?.getPlayerLevelLoading) || [];
  const [dynamicSteps, setDynamicSteps] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const getQuestionLoading = useSelector((state) => state?.userNotificationData?.getQuestionLoading);
  const [slotError, setSlotError] = useState("");
  const [key, setKey] = useState("morning");
  const [matchPlayer, setMatchPlayer] = useState(false);
  const [isFinalLevelStepLoaded, setIsFinalLevelStepLoaded] = useState(false);
  const [finalLevelStep, setFinalLevelStep] = useState(null); // new dynamic last step
  // Track added players
  const [addedPlayers, setAddedPlayers] = useState(() => {
    const saved = localStorage.getItem("addedPlayers");
    return saved ? JSON.parse(saved) : {};
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [existsOpenMatchData, setExistsOpenMatchData] = useState(false);
  const [userGender, setUserGender] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem("addedPlayers", JSON.stringify(addedPlayers));
  }, [addedPlayers]);

  const tabData = [
    { Icon: PiSunHorizonFill, label: "Morning", key: "morning" },
    { Icon: BsSunFill, label: "Noon", key: "noon" },
    { Icon: HiMoon, label: "Evening", key: "night" },
  ];

  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (questionList && questionList.length > 0) {
      // make a shallow copy before sorting to avoid mutating read-only Redux state
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

  const toggleTime = (time, courtId) => {
    // Prevent selecting slots from different dates
    if (
      selectedCourts.length > 0 &&
      selectedCourts[0].date !== selectedDate.fullDate
    ) {
      setSlotError(
        "You have already selected slots for another date. Clear them to select new ones."
      );
      return;
    }

    const currentSelectedTimes = selectedTimes[courtId] || [];
    const allSelectedTimes = Object.values(selectedTimes).flat();
    const isAlreadySelected = currentSelectedTimes.some((t) => t._id === time._id);

    // Helper: Convert time string to minutes
    const timeToMinutes = (timeStr) => {
      const slotHour = parseTimeToHour(timeStr);
      return slotHour * 60;
    };

    // If deselecting a slot
    if (isAlreadySelected) {
      const filtered = currentSelectedTimes.filter((t) => t._id !== time._id);

      // Update selected times for this court
      setSelectedTimes((prev) => {
        const updated = { ...prev };
        if (filtered.length === 0) {
          delete updated[courtId];
        } else {
          updated[courtId] = filtered;
        }
        return updated;
      });

      // Update selected business
      setSelectedBuisness((prev) => prev.filter((t) => t._id !== time._id));

      // Update selected courts
      setSelectedCourts((prev) =>
        prev
          .map((c) =>
            c._id === courtId
              ? {
                ...c,
                time: c.time.filter((t) => t._id !== time._id),
              }
              : c
          )
          .filter((c) => c.time.length > 0)
      );

      setSlotError("");
      return;
    }

    // If no slots selected yet, allow any slot
    if (allSelectedTimes.length === 0) {
      const newTimeEntry = {
        _id: time._id,
        time: time.time,
        amount: time.amount || 1000,
      };

      setSelectedTimes((prev) => ({
        ...prev,
        [courtId]: [time],
      }));
      setSelectedBuisness((prev) => [...prev, time]);

      const currentCourt = slotData?.data?.find((c) => c._id === courtId);
      setSelectedCourts([
        {
          _id: currentCourt._id,
          courtName: currentCourt.courtName,
          type: currentCourt.type,
          date: selectedDate.fullDate,
          day: selectedDate.day,
          time: [newTimeEntry],
        },
      ]);
      return;
    }

    // If this court has no slots, check if time matches existing selections
    if (currentSelectedTimes.length === 0) {
      const timeMatches = allSelectedTimes.some(selectedTime => selectedTime.time === time.time);
      
      if (!timeMatches) {
        setSlotError("You can only select the same time slots across different courts.");
        return;
      }

      // Add slot to this court
      const newTimeEntry = {
        _id: time._id,
        time: time.time,
        amount: time.amount || 1000,
      };

      setSelectedTimes((prev) => ({
        ...prev,
        [courtId]: [time],
      }));
      setSelectedBuisness((prev) => [...prev, time]);

      const currentCourt = slotData?.data?.find((c) => c._id === courtId);
      setSelectedCourts((prev) => [
        ...prev,
        {
          _id: currentCourt._id,
          courtName: currentCourt.courtName,
          type: currentCourt.type,
          date: selectedDate.fullDate,
          day: selectedDate.day,
          time: [newTimeEntry],
        },
      ]);
      return;
    }

    // If this court has 1 slot, allow consecutive slot
    if (currentSelectedTimes.length === 1) {
      const firstSlot = currentSelectedTimes[0];
      const firstMinutes = timeToMinutes(firstSlot.time);
      const newMinutes = timeToMinutes(time.time);
      const diff = Math.abs(firstMinutes - newMinutes);

      if (diff !== 60) {
        setSlotError("You can only select consecutive hourly slots.");
        return;
      }

      // Add consecutive slot
      const newTimeEntry = {
        _id: time._id,
        time: time.time,
        amount: time.amount || 1000,
      };

      setSelectedTimes((prev) => ({
        ...prev,
        [courtId]: [...prev[courtId], time],
      }));
      setSelectedBuisness((prev) => [...prev, time]);

      setSelectedCourts((prev) =>
        prev.map((c) =>
          c._id === courtId
            ? { ...c, time: [...c.time, newTimeEntry] }
            : c
        )
      );
      return;
    }

    // If court already has 2 slots, don't allow more
    if (currentSelectedTimes.length >= 2) {
      setSlotError("Maximum 2 slots per court allowed.");
      return;
    }

    setSlotError("");
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

  const savedClubId = localStorage.getItem("register_club_id");

  useEffect(() => {
    if (savedClubId && selectedDate.day) {
      dispatch(
        getUserSlotBooking({
          register_club_id: savedClubId,
          day: selectedDate.day,
          date: selectedDate.fullDate,
          courtId: currentCourtId || "",
        })
      );
    }
  }, [
    selectedDate.day,
    currentCourtId,
    savedClubId,
    dispatch,
  ]);

  useEffect(() => {
    if (
      slotData?.data?.length > 0 &&
      slotData.data[0]?.courts?.length > 0 &&
      selectedCourts.length === 0
    ) {
      const firstCourt = slotData.data[0].courts[0];
      setCurrentCourtId(firstCourt._id);
    }
  }, [slotData, selectedDate?.fullDate]);

  useEffect(() => {
    const counts = [0, 0, 0];
    slotData?.data?.forEach((court) => {
      court?.slots?.forEach((slot) => {
        if (
          showUnavailable ||
          (slot.availabilityStatus === "available" &&
            slot.status !== "booked" &&
            !isPastTime(slot.time))
        ) {
          const slotHour = parseTimeToHour(slot.time);
          if (slotHour !== null) {
            if (slotHour >= 0 && slotHour < 12) counts[0]++;
            else if (slotHour >= 12 && slotHour < 17) counts[1]++;
            else if (slotHour >= 17 && slotHour <= 23) counts[2]++;
          }
        }
      });
    });

    let defaultTab = "morning";
    if (counts[0] === 0) {
      const firstAvailableIndex = counts.findIndex((c) => c > 0);
      if (firstAvailableIndex !== -1)
        defaultTab = tabData[firstAvailableIndex].key;
    }
    setKey(defaultTab);
  }, [slotData, showUnavailable]);

  const getFilteredLastStepOptions = () => {
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
      val: opt && (opt.value ?? opt.code ?? opt.title ?? opt) // handle object or string
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

  const steps = [
    {
      question:
        "On the following scale, where would you place yourself?",
      options: ["Beginner", "Intermediate", "Advanced", "Professional"],
    },
    {
      question: "Select the racket sport you have played before?",
      options: ["Tennis", "Badminton", "Squash", "Others"],
    },
    {
      question:
        "Have you received or are you receiving training in padel?",
      options: ["No", "Yes, in the past", "Yes, currently"],
    },
    {
      question: "How old are you?",
      options: [
        "Between 18 and 30 years",
        "Between 31 and 40 years",
        "Between 41 and 50 years",
        "Over 50",
      ],
    },
    {
      question: "On the volley?",
      options: [
        "I hardly get to the net",
        "I don't feel safe at the net, I make too many mistakes",
        "I can volley forehand and backhand with some difficulties",
        "I have good positioning at the net and I volley confidently",
        "I don't know",
      ],
    },
    {
      question: "Which Padel Player Are You?",
      options: [
        { code: "A", title: "Top Player" },
        { code: "B1", title: "Experienced Player" },
        { code: "B2", title: "Advanced Player" },
        { code: "C1", title: "Confident Player" },
        { code: "C2", title: "Intermediate Player" },
        { code: "D1", title: "Amateur Player" },
        { code: "D2", title: "Novice Player" },
        { code: "E", title: "Entry Level" },
      ],
    },
  ];

  const handleAnswerSelect = (stepIndex, value) => {
    const step = dynamicSteps[stepIndex];
    if (!step) return;

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
  
  const userShare = Math.round(grandTotal / 4); // Individual player share

  const handleNext = async () => {
    if (selectedCourts.length === 0) {
      setSlotError("Select a slot to enable booking");
      return;
    }

    if (!isCurrentStepValid()) {
      setSlotError("Please select an option");
      return;
    }

    // Case 1: Dynamic last step load karna hai (second-last step se last step)
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
        // Modal abhi band nahi karna — user ko final level choose karna hai
        return;

      } catch (err) {
        console.error(err);
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
      // If going back from the final dynamic step, reset the loaded state
      if (currentStep === dynamicSteps.length - 1 && isFinalLevelStepLoaded) {
        setIsFinalLevelStepLoaded(false);
        setDynamicSteps(prev => prev.slice(0, -1)); // Remove the last dynamic step
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

  // Show tooltip for 2 slot limit in CreateMatches only when limit is reached
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
    const isSelected = selectedTimes[courtId]?.some((s) => s._id === slot._id) || false;
    const allSelectedTimes = Object.values(selectedTimes).flat();
    const currentCourtTimes = selectedTimes[courtId] || [];

    let isDisabled = slot.status === "booked" || slot.availabilityStatus !== "available" || isPastTime(slot.time) || slot.amount <= 0;

    // If slots are already selected globally
    if (allSelectedTimes.length > 0 && !isSelected) {
      const timeMatches = allSelectedTimes.some(selectedTime => selectedTime.time === slot.time);
      
      // If this court has no slots, only allow matching times
      if (currentCourtTimes.length === 0) {
        isDisabled = isDisabled || !timeMatches;
      }
      // If this court has 1 slot, allow consecutive slots
      else if (currentCourtTimes.length === 1) {
        const firstSlot = currentCourtTimes[0];
        const firstMinutes = timeToMinutes(firstSlot.time);
        const newMinutes = timeToMinutes(slot.time);
        const diff = Math.abs(firstMinutes - newMinutes);
        isDisabled = isDisabled || diff !== 60;
      }
      // If this court has 2 slots, disable all others
      else if (currentCourtTimes.length >= 2) {
        isDisabled = true;
      }
    }

    return (
      <div key={index} className="col-3 col-sm-3 col-md-3 col-lg-2 mb-1 mt-1">
        <button
          className={`btn rounded-1 w-100 ${isSelected ? "border-0" : ""} slot-time-btn`}
          onClick={() => toggleTime(slot, courtId)}
          disabled={isDisabled}
          title={(() => {
            if (isDisabled && !isSelected) {
              if (currentCourtTimes.length >= 2) return 'Maximum 2 slots per court';
              if (allSelectedTimes.length > 0 && !allSelectedTimes.some(s => s.time === slot.time)) {
                return currentCourtTimes.length === 0 ? 'Only same time slots allowed across courts' : 'Only consecutive slots allowed';
              }
            }
            return '';
          })()}
          style={{
            background: isDisabled ? "#c9cfcfff" : isSelected ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)" : "#FFFFFF",
            color: isDisabled ? "#000000" : isSelected ? "white" : "#000000",
            cursor: isDisabled ? "not-allowed" : "pointer",
            opacity: isDisabled ? 0.6 : 1,
            border: isSelected ? "none" : "1px solid #4949491A",
            fontSize: "11px",
            padding: "4px 2px",
            height: "32px",
                                                        borderLeft:"2px solid #001b76",

          }}
          onMouseEnter={(e) => !isDisabled && slot.availabilityStatus === "available" && (e.currentTarget.style.border = "1px solid #3DBE64")}
          onMouseLeave={(e) => !isDisabled && slot.availabilityStatus === "available" && (e.currentTarget.style.border = "1px solid #4949491A")}
        >
          {formatTimeForDisplay(slot.time)}
        </button>
      </div>
    );
  };

  const renderCurrentQuestion = () => {
    if (dynamicSteps.length === 0) {
      return <div>Loading questions...</div>;
    }

    const step = dynamicSteps[currentStep];
    const isLastStep = currentStep === dynamicSteps.length - 1;
    const currentAnswer = selectedAnswers[currentStep] || (step.isMultiSelect ? [] : "");
    const optionsToShow = isLastStep ? getFilteredLastStepOptions() : step.options;

    return (
      <Form>
        {optionsToShow.map((opt, i) => {
          const isSelected = step.isMultiSelect
            ? currentAnswer.includes(opt.value)
            : currentAnswer === opt.value;

          return (
            <div
              key={opt._id}
              onClick={() => handleAnswerSelect(currentStep, opt.value)}
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
                type={step.isMultiSelect ? "checkbox" : "radio"}
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
                {opt.value}
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

  /* ──────────────────────── JSX ──────────────────────── */
  return (
    <Container className="py-md-4 px-md-0 py-0 px-2 mb-md-5 mb-0">
      <Row className="g-3">
        {/* ────── LEFT PANEL ────── */}
        <Col md={7} className={`p-md-3 px-3 pt-3 pb-0 mobile-create-matches-content mt-0 ${matchPlayer ? 'd-none d-lg-block' : ''}`} style={{ paddingBottom: selectedCourts.length > 0 ? "120px" : "20px" }}>
          {/* Date Selector */}
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

            {/* Date Strip */}
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
                    const isSelected = formatDate(new Date(selectedDate?.fullDate)) === d.fullDate;

                    // Calculate slot count for this specific date
                    const slotCount = selectedCourts
                      .filter(court => court.date === d.fullDate)
                      .reduce((acc, court) => acc + court.time.length, 0);

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
                          setSelectedDate({ fullDate: d.fullDate, day: d.day });
                          const [year, month, dayNum] = d.fullDate.split('-').map(Number);
                          setStartDate(new Date(year, month - 1, dayNum));
                          dispatch(getUserSlotBooking({ day: d.day, date: d.fullDate, register_club_id: localStorage.getItem("register_club_id") || "" }));
                        }}
                        onMouseEnter={(e) => !isSelected && (e.currentTarget.style.border = "1px solid #3DBE64")}
                        onMouseLeave={(e) => (e.currentTarget.style.border = "1px solid #4949491A")}
                      >
                        <div className="text-center">
                          <div className="date-center-date">{d.date}</div>
                          <div className="date-center-day">{dayShortMap[d.day]}</div>
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

            {/* ────── SLOTS ────── */}
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
                          (slot.availabilityStatus === "available" &&
                            slot.status !== "booked" &&
                            !isPastTime(slot.time) &&
                            slot.amount > 0)
                        )
                      ) && (
                          <div className="row mb-md-2 mb-0">
                            <div className="col-3 d-md-block d-none">
                              <h6 className="all-matches text-start">Courts</h6>
                            </div>
                            <div className="col-md-9 col-12 ">
                              <h6 className="all-matches text-center mb-0 me-2 me-md-0">
                                Available Slots
                              </h6>
                            </div>
                          </div>
                        )}
                      <div
                        style={{
                          maxHeight: "60vh",
                          overflowY: "auto",
                          overflowX: "hidden",
                          paddingRight: "8px",
                          msOverflowStyle: "none",
                          scrollbarWidth: "none",
                        }}
                        className="hide-scrollbar"
                      >
                        <style jsx={true}>{`
                          .hide-scrollbar::-webkit-scrollbar {
                            display: none;
                          }
                          .hide-scrollbar {
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                          }
                        `}</style>
                        {slotData?.data.map((court, courtIndex) => {
                          const filteredSlots = court?.slots?.filter((slot) =>
                            showUnavailable
                              ? true
                              : slot.availabilityStatus === "available" &&
                              slot.status !== "booked" &&
                              !isPastTime(slot.time) &&
                              slot.amount > 0
                          );

                          if (filteredSlots?.length === 0) return null;

                          return (
                            <div key={court._id} className="row mb-md-3 mb-0 align-items-start pb-3 pb-md-0 border_bottom_line mt-2 mt-md-0">
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
                                  {filteredSlots.map((slot, i) => renderSlotButton(slot, i, court._id))}
                                </div>
                              </div>
                            </div>

                          );
                        })}
                      </div>
                      {slotData?.data?.some((court) =>
                        court?.slots?.some((slot) =>
                          showUnavailable ||
                          (slot.availabilityStatus === "available" &&
                            slot.status !== "booked" &&
                            !isPastTime(slot.time))
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
                              disabled={(() => {
                                const totalSlots = selectedCourts.reduce((sum, court) => sum + court.time.length, 0);
                                const hasValidSelection = selectedCourts.every(court => court.time.length === 2 || court.time.length === 0);
                                return !(totalSlots >= 2 && totalSlots % 2 === 0 && hasValidSelection);
                              })()}
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
                            (slot.availabilityStatus === "available" &&
                              slot.status !== "booked" &&
                              !isPastTime(slot.time))
                        )
                    ) && (
                        <div
                          className="text-center py-4 text-danger d-flex justify-content-center align-items-center "
                          style={{ fontFamily: "Poppins", fontWeight: 500 }}
                        >
                          <p> No {showUnavailable ? "unavailable" : "available"} slots</p>
                        </div>
                      )}
                  </>
                )
              ) : (
                <div className="text-center py-4 d-flex justify-content-center align-items-center text-muted">
                  No courts available
                </div>
              )}
            </div>
          </div>
        </Col>

        {/* ────── RIGHT PANEL ────── */}
        <Col md={5} className={`ps-2 ${matchPlayer ? 'col-12' : ''}`}>
          {/* ────── MOBILE SUMMARY (fixed bottom) ────── */}
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
            {selectedCourts.length > 0 && (
              <>
                {/* Expandable slots list */}
                <div
                  className="mobile-expanded-slots"
                  style={{
                    maxHeight: isExpanded
                      ? selectedCourts.reduce((s, c) => s + c.time.length, 0) > 2
                        ? "120px"
                        : "auto"
                      : "0px",
                    overflowY:
                      selectedCourts.reduce((s, c) => s + c.time.length, 0) > 2 && isExpanded
                        ? "auto"
                        : "hidden",
                    overflowX: "hidden",
                    paddingRight: "8px",
                    transition: "max-height 0.3s ease",
                    marginBottom: isExpanded ? "10px" : "0",
                  }}
                >
                  {/* SAME SCROLLBAR STYLE AS DESKTOP */}
                  <style jsx={true}>{`
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

                  {selectedCourts.map((court, idx) =>
                    court.time.map((timeSlot, tIdx) => (
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
                              {court.date
                                ? `${new Date(court.date).toLocaleString("en-US", {
                                  day: "2-digit",
                                })}, ${new Date(court.date).toLocaleString("en-US", {
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
                              {formatTimeForDisplay(timeSlot.time)}
                            </span>
                            <span
                              className="ps-1"
                              style={{
                                fontWeight: "500",
                                fontFamily: "Poppins",
                                fontSize: "10px",
                              }}
                            >
                              {court.courtName}
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
                              ₹ {timeSlot.amount || "N/A"}
                            </span>
                            <MdOutlineDeleteOutline
                              className="ms-1 text-white"
                              style={{ cursor: "pointer", fontSize: "14px" }}
                              onClick={() => {
                                const updatedCourts = selectedCourts
                                  .map((c) =>
                                    c._id === court._id
                                      ? {
                                        ...c,
                                        time: c.time.filter((t) => t._id !== timeSlot._id),
                                      }
                                      : c
                                  )
                                  .filter((c) => c.time.length > 0);
                                setSelectedCourts(updatedCourts);

                                const updatedTimes = { ...selectedTimes };
                                if (updatedTimes[court._id]) {
                                  updatedTimes[court._id] = updatedTimes[court._id].filter(
                                    (t) => t._id !== timeSlot._id
                                  );
                                  if (updatedTimes[court._id].length === 0)
                                    delete updatedTimes[court._id];
                                }
                                setSelectedTimes(updatedTimes);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Mobile Next Button */}

              </>
            )}
          </div>

          {/* Mobile Modal for Steps */}
          <Modal
            show={showMobileModal}
            onHide={() => setShowMobileModal(false)}
            size="lg"
            centered
            className="d-lg-none"
          >
            <Modal.Body className="p-0" style={{ position: "relative" }}>
              {/* Close Button */}
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
                  // boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
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
                  padding: "35px 10px",
                }}
              >
                {/* Step Indicator */}
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

                {/* Dynamic Question */}
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
                        const step = dynamicSteps[currentStep];
                        const currentAnswer = selectedAnswers[currentStep] || (step.isMultiSelect ? [] : "");
                        const isLastStep = currentStep === dynamicSteps.length - 1;
                        const optionsToShow = isLastStep ? getFilteredLastStepOptions() : step.options;

                        return optionsToShow.map((opt, i) => {
                          const optValue = opt.value || opt.code || opt;
                          const isSelected = step.isMultiSelect
                            ? Array.isArray(currentAnswer) && currentAnswer.includes(optValue)
                            : currentAnswer === optValue;

                          return (
                            <div
                              key={opt._id || i}
                              onClick={() => handleAnswerSelect(currentStep, optValue)}
                              className="d-flex align-items-center mb-3 p-3 rounded shadow-sm border step-option"
                              style={{
                                backgroundColor: isSelected ? "#eef2ff" : "#fff",
                                borderColor: isSelected ? "#4f46e5" : "#e5e7eb",
                                cursor: selectedCourts.length === 0 ? "not-allowed" : "pointer",
                                gap: "12px",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Form.Check
                                type={step.isMultiSelect ? "checkbox" : "radio"}
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
                                {opt.value || `${opt.code} - ${opt.title || opt.question}`}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </Form>
                  </>
                )}

                {/* Error Message */}
                {slotError && (
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
                    {slotError}
                  </div>
                )}

                {/* Buttons */}
                <div className="d-flex justify-content-between align-items-center mt-4">
                  {currentStep > 0 && (
                    <Button
                      variant="secondary"
                      className="rounded-pill px-4 py-2"
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
                    className="rounded-pill px-4 py-2 ms-auto"
                    disabled={selectedCourts.length === 0 || !isCurrentStepValid()}
                    onClick={handleNext}
                  >
                    {getPlayerLevelsLoading === true ? (
                      <span className="d-flex align-items-center gap-1">
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        Loading...
                      </span>
                    ) : currentStep === dynamicSteps.length - 1 && isFinalLevelStepLoaded ? (
                      "Submit"
                    ) : (
                      "Next"
                    )}
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          {/* ────── QUESTIONNAIRE / MATCH PLAYER (Desktop Only) ────── */}
          {profileLoading ? (
            <></>
          ) : !matchPlayer && !existsOpenMatchData && dynamicSteps.length > 0 && (
            <div className="d-none d-lg-block">
              <div style={{ backgroundColor: "#F1F4FF", borderRadius: "12px" }}>
                <div className="d-flex pt-4 align-items-center" style={{ position: "relative" }}>

                  {/* LEFT: Back Button */}
                  <div style={{ position: "absolute", left: 0 }}>
                    <button
                      className="btn btn-light rounded-circle ms-2 p-2 d-flex align-items-center justify-content-center"
                      style={{ width: 36, height: 36 }}
                      onClick={onBack}
                    >
                      <i className="bi bi-arrow-left" />
                    </button>
                  </div>

                  {/* CENTER: Step Circles */}
                  <div className="d-flex justify-content-center w-100 gap-2">
                    {dynamicSteps.map((_, i) => (
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
                      opacity: selectedCourts.length === 0 ? 0.5 : 1,
                      pointerEvents: selectedCourts.length === 0 ? "none" : "auto",
                    }}
                  >
                    {renderCurrentQuestion()}
                  </div>
                </div>

                {slotError && (
                  <div className="text-center p-3">
                    <div style={{ backgroundColor: "#ffebee", color: "#c62828", padding: "10px", borderRadius: "8px" }}>
                      {slotError}
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
                    disabled={selectedCourts.length === 0 || !isCurrentStepValid()}
                    onClick={handleNext}
                  >
                    {getPlayerLevelsLoading === true ? (
                      <span className="d-flex align-items-center gap-1">
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        Loading...
                      </span>
                    ) : currentStep === dynamicSteps.length - 1 && isFinalLevelStepLoaded ? (
                      "Submit"
                    ) : (
                      "Next"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Show MatchPlayer when matchPlayer is true */}
          {!profileLoading && matchPlayer && (
            <MatchPlayer
              addedPlayers={addedPlayers}
              setAddedPlayers={setAddedPlayers}
              selectedCourts={selectedCourts}
              selectedDate={selectedDate}
              finalSkillDetails={existsOpenMatchData ? [] : skillDetails}
              totalAmount={userShare}
              existsOpenMatchData={existsOpenMatchData}
              slotError={slotError}
              userGender={userGender}

              // Yeh NAYA PROP ADD KARO
              selectedAnswers={selectedAnswers}           // ← Yeh bhejo
              dynamicSteps={dynamicSteps}                 // ← Yeh bhi bhejo (questions ke saath)
              finalLevelStep={finalLevelStep}             // ← Agar dynamic last step hai toh yeh bhi
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CreateMatches;
