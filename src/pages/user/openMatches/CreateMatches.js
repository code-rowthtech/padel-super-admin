import React, { useEffect, useRef, useState } from "react";
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
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import "react-datepicker/dist/react-datepicker.css";
import {
  MdKeyboardArrowDown,
  MdOutlineArrowForwardIos,
  MdOutlineDateRange,
} from "react-icons/md";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineDeleteOutline,
} from "react-icons/md";
import {
  MdKeyboardDoubleArrowUp,
  MdKeyboardDoubleArrowDown,
} from "react-icons/md";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { getUserClub } from "../../../redux/user/club/thunk";
import MatchPlayer from "./MatchPlayer";
import { HiMoon } from "react-icons/hi";
import { BsSunFill } from "react-icons/bs";
import { PiSunHorizonFill } from "react-icons/pi";
import {
  booking_dropdown_img,
  booking_dropdown_img2,
  booking_dropdown_img3,
  booking_dropdown_img4,
} from "../../../assets/files";

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
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);
  const dateRefs = useRef({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const store = useSelector((state) => state);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [selectedDate, setSelectedDate] = useState({
    fullDate: new Date().toISOString().split("T")[0],
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
  });

  const [errorShow, setErrorShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedBuisness, setSelectedBuisness] = useState([]);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [skillDetails, setSkillDetails] = useState([]); // [step0, step1, ..., step5]
  const [currentCourtId, setCurrentCourtId] = useState(null);
  const { slotData } = useSelector((state) => state?.userSlot);
  const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
  const [slotError, setSlotError] = useState("");
  const [key, setKey] = useState("morning");
  const [matchPlayer, setMatchPlayer] = useState(false);

  // Track added players
  const [addedPlayers, setAddedPlayers] = useState(() => {
    const saved = localStorage.getItem("addedPlayers");
    return saved ? JSON.parse(saved) : {};
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);

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
    dispatch(getUserClub({ search: "" }));
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

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
    if (
      selectedCourts.length > 0 &&
      selectedCourts[0].date !== selectedDate.fullDate
    ) {
      setSlotError(
        "You have already selected slots for another date. Clear them to select new ones."
      );
      return;
    }

    const isAlreadySelected = selectedTimes[courtId]?.some(
      (t) => t._id === time._id
    );
    const totalSlots = Object.values(selectedTimes).flat().length;

    if (isAlreadySelected) {
      const filtered = selectedTimes[courtId].filter(
        (t) => t._id !== time._id
      );
      setSelectedTimes((prev) => ({ ...prev, [courtId]: filtered }));
      setSelectedBuisness((prev) =>
        prev.filter((t) => t._id !== time._id)
      );
      setSelectedCourts((prev) =>
        prev
          .map((c) =>
            c._id === courtId
              ? { ...c, time: c.time.filter((t) => t._id !== time._id) }
              : c
          )
          .filter((c) => c.time.length > 0)
      );
    } else {
      if (totalSlots >= 15) {
        setErrorMessage("Maximum 15 slots can be selected.");
        setErrorShow(true);
        return;
      }

      const newTimeEntry = {
        _id: time._id,
        time: time.time,
        amount: time.amount || 1000,
      };

      setSelectedTimes((prev) => ({
        ...prev,
        [courtId]: [...(prev[courtId] || []), time],
      }));
      setSelectedBuisness((prev) => [...prev, time]);

      setSelectedCourts((prev) => {
        const existingCourt = prev.find((c) => c._id === courtId);
        if (existingCourt) {
          return prev.map((c) =>
            c._id === courtId
              ? { ...c, time: [...c.time, newTimeEntry] }
              : c
          );
        } else {
          const currentCourt = slotData?.data?.find((c) => c._id === courtId);
          return [
            ...prev,
            {
              _id: currentCourt._id,
              courtName: currentCourt.courtName,
              type: currentCourt.type,
              date: selectedDate.fullDate,
              day: selectedDate.day,
              time: [newTimeEntry],
            },
          ];
        }
      });
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

  const grandTotal = selectedCourts.reduce(
    (sum, c) =>
      sum +
      c.time.reduce((s, t) => s + Number(t.amount || 0), 0),
    0
  );

  const handleNext = () => {
    if (selectedCourts.length === 0 || selectedCourts.every((c) => c.time.length === 0)) {
      setSlotError("Select a slot to enable booking");
      return;
    }

    if (currentStep === 1) {
      if (selectedLevel.length === 0) {
        setSlotError("Please select at least one option");
        return;
      }
      setSkillDetails((prev) => {
        const n = [...prev];
        n[currentStep] = selectedLevel;
        return n;
      });
      setCurrentStep(currentStep + 1);
      setSelectedLevel([]);
      setSlotError("");
      return;
    }

    if (currentStep < steps.length - 1) {
      if (!selectedLevel || (Array.isArray(selectedLevel) && selectedLevel.length === 0)) {
        setSlotError("Please select an option");
        return;
      }
      setSkillDetails((prev) => {
        const n = [...prev];
        n[currentStep] = selectedLevel;
        return n;
      });
      setCurrentStep(currentStep + 1);
      setSelectedLevel("");
      setSlotError("");
      return;
    }

    if (currentStep === steps.length - 1) {
      if (!selectedLevel) {
        setSlotError("Please select an option");
        return;
      }
      const finalSkillDetails = [...skillDetails];
      finalSkillDetails[currentStep] = selectedLevel;
      setSkillDetails(finalSkillDetails);
      setMatchPlayer(true);
      return;
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedLevel(
        skillDetails[currentStep - 1] ||
        (currentStep === 1 ? [] : "")
      );
      setSlotError("");
    }
  };

  useEffect(() => {
    if (slotError) {
      const timer = setTimeout(() => setSlotError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [slotError]);

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

  /* ──────────────────────── JSX ──────────────────────── */
  return (
    <Container className="p-md-4 py-0 px-2 mb-md-5 mb-0">
      <Row className="g-3">
        {/* ────── LEFT PANEL ────── */}
        <Col md={7} className={`p-3 mobile-create-matches-content mt-0 ${matchPlayer ? 'd-none d-lg-block' : ''}`} style={{ paddingBottom: selectedCourts.length > 0 ? "120px" : "20px" }}>
          {/* Date Selector */}
          <div className="calendar-strip">
            <div className="d-flex justify-content-between align-items-center mb-md-4 mb-2">
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
            <div className="d-flex align-items-center gap-2 border-bottom mb-md-3 mb-2">
              <div className="position-relative">
                <div
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
                    <img src={booking_dropdown_img} style={{ width: "34px", height: "34px" }} alt="" />
                    <MdKeyboardArrowDown
                      size={16}
                      style={{
                        transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                      className="d-md-block d-none"
                    />
                  </div>
                </div>
                {showDropdown && (
                  <div
                    className="position-absolute bg-white rounded shadow"
                    style={{
                      top: "100%",
                      left: "-10px",
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
                className="d-flex calendar-day-btn-mobile   justify-content-center align-items-center rounded-1  mb-md-3 mb-2 mt-0 mt-md-0"
                style={{
                  backgroundColor: "#f3f3f5",
                  height: "58px",
                  padding: "2px 10px",
                }}
              >
                <span
                  className="add_font_small_span"

                  style={{
                    fontSize: window.innerWidth <= 768 ? "12px" : "14px",
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
              <div className="d-flex gap-1 " style={{ position: "relative", maxWidth: "85%" }}>
                <button className="btn p-2 border-0 d-none d-md-block" style={{ position: "absolute", left: '-23%', zIndex: 10, boxShadow: "none" }} onClick={scrollLeft}><MdOutlineArrowBackIosNew className="mt-2" size={20} /></button>
                <div ref={scrollRef} className="d-flex gap-1 date-scroll-container" style={{ scrollBehavior: "smooth", whiteSpace: "nowrap", maxWidth: "100%", overflow: "hidden" }}>
                  {dates.map((d, i) => {
                    const formatDate = (date) => date.toISOString().split("T")[0];
                    const isSelected = formatDate(new Date(selectedDate?.fullDate)) === d.fullDate;

                    // Calculate slot count for this specific date
                    const slotCount = Object.values(selectedTimes).reduce((acc, courtDates) => {
                      const dateSlots = courtDates[d.fullDate] || [];
                      return acc + dateSlots.length;
                    }, 0);

                    return (
                      <button
                        key={i}
                        ref={(el) => (dateRefs.current[d.fullDate] = el)}
                        className={`calendar-day-btn mb-md-3 mb-2 me-1 position-relative ${isSelected ? "text-white border-0" : "bg-white"}`}
                        style={{
                          background: isSelected
                            ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"
                            : "#FFFFFF", boxShadow: isSelected ? "0px 4px 4px 0px #00000040" : "", borderRadius: "12px", color: isSelected ? "#FFFFFF" : "#374151"
                        }}
                        onClick={() => {
                          setSelectedDate({ fullDate: d.fullDate, day: d.day });
                          setStartDate(new Date(d.fullDate));
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
                              top: "-0px",
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
                <button className="btn border-0 p-2 d-none d-md-block" style={{ position: "absolute", right: -26, zIndex: 10, boxShadow: "none" }} onClick={scrollRight}><MdOutlineArrowForwardIos className="mt-2" size={20} /></button>
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
                        <style jsx>{`
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
                                  className="court-item p-1 ps-0 ps-md-1 text-center text-md-center h-100 d-flex d-md-block align-items-center justify-content-center"
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
                                  {filteredSlots.map((slot, i) => {
                                    const isSelected = selectedTimes[court._id]?.some(
                                      (t) => t._id === slot._id
                                    );

                                    const isDisabled =
                                      slot.status === "booked" ||
                                      slot.availabilityStatus !== "available" ||
                                      isPastTime(slot.time) ||
                                      slot.amount <= 0;

                                    return (
                                      <div
                                        key={i}
                                        className="col-3 col-sm-3 col-md-3 col-lg-2 mb-md-1 mb-0 mt-md-0 mt-1"
                                      >
                                        <button
                                          className={`btn rounded-1 w-100 ${isSelected ? "border-0" : ""} slot-time-btn`}
                                          onClick={() => toggleTime(slot, court._id)}
                                          disabled={isDisabled}
                                          style={{
                                            background:
                                              isDisabled
                                                ? "#c9cfcfff"
                                                : isSelected
                                                  ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"
                                                  : "#FFFFFF",
                                            color:
                                              isDisabled
                                                ? "#000000"
                                                : isSelected
                                                  ? "white"
                                                  : "#000000",
                                            cursor: isDisabled ? "not-allowed" : "pointer",
                                            opacity: isDisabled ? 0.6 : 1,
                                            border: isSelected ? "" : "1px solid #4949491A",
                                            fontSize: "11px",
                                            padding: "4px 2px",
                                            height: "32px",
                                          }}
                                          onMouseEnter={(e) =>
                                            !isDisabled &&
                                            slot.availabilityStatus === "available" &&
                                            (e.currentTarget.style.border = "1px solid #3DBE64")
                                          }
                                          onMouseLeave={(e) =>
                                            !isDisabled &&
                                            slot.availabilityStatus === "available" &&
                                            (e.currentTarget.style.border = "1px solid #4949491A")
                                          }
                                        >
                                          {formatTimeForDisplay(slot?.time)}
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
                      <div className="d-flex d-md-none justify-content-end pt-2 pb-2">
                        <Button
                          className="rounded-pill px-4 py-1"
                          style={{
                            background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                            border: "none",
                            fontWeight: "600",
                            fontSize: "13px",
                          }}
                          disabled={selectedCourts.length === 0}
                          onClick={() => setShowMobileModal(true)}
                        >
                          Next
                        </Button>
                      </div>
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
                          className="text-center py-4 text-danger"
                          style={{ fontFamily: "Poppins", fontWeight: 500 }}
                        >
                          No {showUnavailable ? "unavailable" : "available"} slots
                        </div>
                      )}
                  </>
                )
              ) : (
                <div className="text-center py-4 text-muted">
                  No courts available
                </div>
              )}
            </div>
          </div>
        </Col>

        {/* ────── RIGHT PANEL ────── */}
        <Col md={5} className={`ps-2 d-md-block d-none ${matchPlayer ? 'col-12' : ''}`}>
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
                  <style jsx>{`
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

              {/* ❌ Close Button inside Modal Body */}
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
                  {steps.map((_, i) => (
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

                {/* Question */}
                <h6
                  className="mb-3 text-start"
                  style={{
                    fontSize: "18px",
                    fontFamily: "Poppins",
                    fontWeight: 600,
                    color: "#1f2937",
                  }}
                >
                  {steps[currentStep].question}
                </h6>

                {/* OPTIONS LIST */}
                <Form
                // style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  {currentStep === 1
                    ? steps[currentStep].options.map((opt, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedLevel((prev) =>
                            prev.includes(opt)
                              ? prev.filter((x) => x !== opt)
                              : [...prev, opt]
                          );
                        }}
                        className="d-flex align-items-center mb-2 p-2 rounded shadow-sm border step-option"
                        style={{
                          backgroundColor: selectedLevel.includes(opt)
                            ? "#eef2ff"
                            : "#fff",
                          borderColor: selectedLevel.includes(opt)
                            ? "#4f46e5"
                            : "#e5e7eb",
                          cursor: "pointer",
                          gap: "8px",
                          // height: "40px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Form.Check
                          type="checkbox"
                          checked={selectedLevel.includes(opt)}
                          onChange={() => { }}
                          style={{ flexShrink: 0, marginTop: 0 }}
                        />
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#1f2937",
                          }}
                        >
                          {opt}
                        </span>
                      </div>
                    ))
                    : currentStep === steps.length - 1
                      ? steps[currentStep].options.map((opt, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedLevel(opt.code)}
                          className="d-flex align-items-center mb-2 p-2 rounded shadow-sm border step-option"
                          style={{
                            backgroundColor:
                              selectedLevel === opt.code ? "#eef2ff" : "#fff",
                            borderColor:
                              selectedLevel === opt.code ? "#4f46e5" : "#e5e7eb",
                            cursor: "pointer",
                            gap: "8px",
                            // height: "40px",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Form.Check
                            type="radio"
                            name="modalLast"
                            checked={selectedLevel === opt.code}
                            onChange={() => { }}
                            style={{ flexShrink: 0, marginTop: 0 }}
                          />
                          <div
                            className="d-flex align-items-center flex-grow-1"
                            style={{ gap: "6px" }}
                          >
                            <span
                              style={{
                                fontSize: "18px",
                                fontWeight: 700,
                                color: "#1d4ed8",
                                minWidth: "28px",
                                textAlign: "center",
                              }}
                            >
                              {opt.code}
                            </span>
                            <strong
                              style={{
                                fontSize: "14px",
                                color: "#1f2937",
                              }}
                            >
                              {opt.title}
                            </strong>
                          </div>
                        </div>
                      ))
                      : steps[currentStep].options.map((opt, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedLevel(opt)}
                          className="d-flex align-items-center mb-2 p-2 rounded shadow-sm border step-option"
                          style={{
                            backgroundColor: selectedLevel === opt ? "#eef2ff" : "#fff",
                            borderColor: selectedLevel === opt ? "#4f46e5" : "#e5e7eb",
                            cursor: "pointer",
                            gap: "8px",
                            // height: "40px",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Form.Check
                            type="radio"
                            name={`modalStep${currentStep}`}
                            checked={selectedLevel === opt}
                            onChange={() => { }}
                            style={{ flexShrink: 0, marginTop: 0 }}
                          />
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#1f2937",
                            }}
                          >
                            {opt}
                          </span>
                        </div>
                      ))}
                </Form>

                {/* ERROR BOX */}
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

                {/* BUTTONS */}
                <div className="d-flex justify-content-between align-items-center mt-5">
                  {currentStep > 0 && (
                    <Button
                      className="rounded-pill px-3 py-1"
                      style={{
                        backgroundColor: "#6c757d",
                        border: "none",
                        color: "#fff",
                        fontSize: "13px",
                      }}
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  )}

                  <Button
                    className="rounded-pill px-3 ms-auto py-1"
                    style={{
                      background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                      border: "none",
                      color: "#fff",
                      fontSize: "13px",

                    }}
                    disabled={
                      !selectedLevel ||
                      (currentStep === 1 && selectedLevel.length === 0) ||
                      (Array.isArray(selectedLevel) && selectedLevel.length === 0)
                    }
                    onClick={() => {
                      if (currentStep === steps.length - 1) {
                        const finalSkillDetails = [...skillDetails];
                        finalSkillDetails[currentStep] = selectedLevel;
                        setSkillDetails(finalSkillDetails);
                        setShowMobileModal(false);
                        setMatchPlayer(true);
                      } else {
                        handleNext();
                      }
                    }}
                  >
                    {currentStep === steps.length - 1 ? "Submit" : "Next"}
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>


          {/* ────── QUESTIONNAIRE / MATCH PLAYER (Desktop Only) ────── */}
          {!matchPlayer ? (
            <div className="d-none d-lg-block">
              <div style={{ backgroundColor: "#F1F4FF" }}>
                <div className="d-flex gap-2 ps-4 pt-4">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: i <= currentStep ? "#3DBE64" : "#D9D9D9",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    ></div>
                  ))}
                </div>

                <div className="p-4 mt-3">
                  <h6
                    className="mb-4"
                    style={{
                      fontSize: "20px",
                      fontFamily: "Poppins",
                      fontWeight: 600,
                      color: "#1f2937",
                    }}
                  >
                    {steps[currentStep].question}
                  </h6>

                  <div
                    style={{
                      opacity: selectedCourts.length === 0 ? 0.5 : 1,
                      pointerEvents: selectedCourts.length === 0 ? "none" : "auto",
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <Form style={{ height: "350px", overflowY: "auto" }}>
                      {currentStep === 1
                        ? steps[currentStep].options.map((opt, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setSelectedLevel((prev) =>
                                prev.includes(opt)
                                  ? prev.filter((x) => x !== opt)
                                  : [...prev, opt]
                              );
                            }}
                            className="d-flex align-items-center mb-3 p-3 rounded shadow-sm border step-option"
                            style={{
                              backgroundColor: selectedLevel.includes(opt) ? "#eef2ff" : "#fff",
                              borderColor: selectedLevel.includes(opt) ? "#4f46e5" : "#e5e7eb",
                              cursor: selectedCourts.length === 0 ? "not-allowed" : "pointer",
                              gap: "12px",
                              height: "50px",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Form.Check
                              type="checkbox"
                              checked={selectedLevel.includes(opt)}
                              onChange={() => { }}
                              style={{ flexShrink: 0, marginTop: 0 }}
                            />
                            <span style={{ fontSize: "16px", fontWeight: 500, color: "#1f2937" }}>
                              {opt}
                            </span>
                          </div>
                        ))
                        : currentStep === steps.length - 1
                          ? steps[currentStep].options.map((opt, i) => (
                            <div
                              key={i}
                              onClick={() => setSelectedLevel(opt.code)}
                              className="d-flex align-items-center mb-3 p-3 rounded shadow-sm border step-option"
                              style={{
                                backgroundColor: selectedLevel === opt.code ? "#eef2ff" : "#fff",
                                borderColor: selectedLevel === opt.code ? "#4f46e5" : "#e5e7eb",
                                cursor: selectedCourts.length === 0 ? "not-allowed" : "pointer",
                                gap: "12px",
                                height: "50px",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Form.Check
                                type="radio"
                                name="last"
                                checked={selectedLevel === opt.code}
                                onChange={() => { }}
                                style={{ flexShrink: 0, marginTop: 0 }}
                              />
                              <div className="d-flex align-items-center flex-grow-1" style={{ gap: "8px" }}>
                                <span
                                  style={{
                                    fontSize: "24px",
                                    fontWeight: 700,
                                    color: "#1d4ed8",
                                    minWidth: "38px",
                                    textAlign: "center",
                                  }}
                                >
                                  {opt.code}
                                </span>
                                <strong style={{ fontSize: "16px", color: "#1f2937" }}>{opt.title}</strong>
                              </div>
                            </div>
                          ))
                          : steps[currentStep].options.map((opt, i) => (
                            <div
                              key={i}
                              onClick={() => setSelectedLevel(opt)}
                              className="d-flex align-items-center mb-3 p-3 rounded shadow-sm border step-option"
                              style={{
                                backgroundColor: selectedLevel === opt ? "#eef2ff" : "#fff",
                                borderColor: selectedLevel === opt ? "#4f46e5" : "#e5e7eb",
                                cursor: selectedCourts.length === 0 ? "not-allowed" : "pointer",
                                gap: "12px",
                                height: "50px",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Form.Check
                                type="radio"
                                name={`step${currentStep}`}
                                checked={selectedLevel === opt}
                                onChange={() => { }}
                                style={{ flexShrink: 0, marginTop: 0 }}
                              />
                              <span style={{ fontSize: "16px", fontWeight: 500, color: "#1f2937" }}>
                                {opt}
                              </span>
                            </div>
                          ))}
                    </Form>
                  </div>
                </div>

                <div className="d-flex justify-content-center">
                  {slotError && (
                    <div
                      className="text-center mb-3 p-2 rounded"
                      style={{
                        backgroundColor: "#ffebee",
                        color: "#c62828",
                        border: "1px solid #ffcdd2",
                        fontWeight: 500,
                        fontSize: "15px",
                        width: "100%",
                        maxWidth: "370px",
                      }}
                    >
                      {slotError}
                    </div>
                  )}
                </div>

                <div
                  className={`d-flex ${window.innerWidth < 768 ? "justify-content-between" : "justify-content-end"
                    } align-items-center p-3`}
                >
                  {currentStep > 0 && (
                    <Button
                      className="rounded-pill px-4 me-2"
                      style={{
                        backgroundColor: window.innerWidth < 768 ? "transparent" : "#374151",
                        border: "none",
                        color: window.innerWidth < 768 ? "#001B76" : "#fff",
                      }}
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    className={`px-4 ${window.innerWidth < 768 && currentStep !== steps.length - 1
                      ? "p-3 rounded-circle d-flex align-items-center justify-content-center"
                      : "rounded-pill"
                      }`}
                    style={{
                      background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                      border: "none",
                      color: "#fff",
                    }}
                    disabled={
                      selectedCourts.length === 0 ||
                      !selectedLevel ||
                      (currentStep === 1 && selectedLevel.length === 0) ||
                      (Array.isArray(selectedLevel) && selectedLevel.length === 0)
                    }
                    onClick={handleNext}
                  >
                    {currentStep === steps.length - 1
                      ? "Submit"
                      : window.innerWidth < 768
                        ? ""
                        : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <MatchPlayer
              addedPlayers={addedPlayers}
              setAddedPlayers={setAddedPlayers}
              selectedCourts={selectedCourts}
              selectedDate={selectedDate}
              finalSkillDetails={skillDetails}
              totalAmount={grandTotal}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CreateMatches;