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
import { MdOutlineArrowForwardIos, MdOutlineDeleteOutline } from "react-icons/md";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { MdOutlineDateRange } from "react-icons/md";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { frame, morningTab, nighttab, sun } from "../../../assets/files";
import { Avatar } from "@mui/material";
import { getUserClub } from "../../../redux/user/club/thunk";
import { IoArrowBackOutline, IoArrowForwardOutline } from "react-icons/io5";

// Parse time string to hour
const parseTimeToHour = (timeStr) => {
  if (!timeStr) return null;
  const [hourStr, period] = timeStr.toLowerCase().split(" ");
  let hour = parseInt(hourStr);
  if (isNaN(hour)) return null;
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  return hour;
};

// Filter slots by tab
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

const CreateMatches = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const dateRefs = useRef({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const store = useSelector((state) => state);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCourts, setSelectedCourts] = useState([]); // Only one date
  const [selectedTimes, setSelectedTimes] = useState({});   // courtId → [slots]
  const [selectedDate, setSelectedDate] = useState({
    fullDate: new Date().toISOString().split("T")[0],
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
  });

  const [errorShow, setErrorShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedBuisness, setSelectedBuisness] = useState([]);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [skillDetails, setSkillDetails] = useState([]);
  const [currentCourtId, setCurrentCourtId] = useState(null);
  const { slotData } = useSelector((state) => state?.userSlot);
  const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0] || {});
  const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
  const userMatches = store?.userMatches;
  const [slotError, setSlotError] = useState("");
  const [key, setKey] = useState("morning");
  const [showStepsModal, setShowStepsModal] = useState(false);
  const logo = JSON.parse(localStorage.getItem("logo") || "null");

  const tabData = [
    { img: morningTab, label: "Morning", key: "morning" },
    { img: sun, label: "Afternoon", key: "noon" },
    { img: nighttab, label: "Evening", key: "night" },
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
    Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
    Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
  };

  const scrollRef = useRef(null);

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  };

  const handleSwitchChange = () => {
    setShowUnavailable(!showUnavailable);
  };



  const toggleTime = (time, courtId) => {
    // If trying to select a slot from a different date
    if (selectedCourts.length > 0 && selectedCourts[0].date !== selectedDate.fullDate) {
      setSlotError("You have already selected slots for another date. Clear them to select new ones.");
      return;
    }

    const isAlreadySelected = selectedTimes[courtId]?.some(t => t._id === time._id);
    const totalSlots = Object.values(selectedTimes).flat().length;

    if (isAlreadySelected) {
      // Remove
      const filtered = selectedTimes[courtId].filter(t => t._id !== time._id);
      setSelectedTimes(prev => ({ ...prev, [courtId]: filtered }));
      setSelectedBuisness(prev => prev.filter(t => t._id !== time._id));

      setSelectedCourts(prev =>
        prev
          .map(c => c._id === courtId ? { ...c, time: c.time.filter(t => t._id !== time._id) } : c)
          .filter(c => c.time.length > 0)
      );
    } else {
      // Add
      if (totalSlots >= 15) {
        setErrorMessage("Maximum 15 slots can be selected.");
        setErrorShow(true);
        return;
      }

      const newTimeEntry = { _id: time._id, time: time.time, amount: time.amount || 1000 };

      setSelectedTimes(prev => ({
        ...prev,
        [courtId]: [...(prev[courtId] || []), time]
      }));
      setSelectedBuisness(prev => [...prev, time]);

      setSelectedCourts(prev => {
        const existingCourt = prev.find(c => c._id === courtId);
        if (existingCourt) {
          return prev.map(c =>
            c._id === courtId
              ? { ...c, time: [...c.time, newTimeEntry] }
              : c
          );
        } else {
          const currentCourt = slotData?.data?.find(c => c._id === courtId);
          return [...prev, {
            _id: currentCourt._id,
            courtName: currentCourt.courtName,
            type: currentCourt.type,
            date: selectedDate.fullDate,
            day: selectedDate.day,
            time: [newTimeEntry],
          }];
        }
      });
    }
  };

  const maxSelectableDate = new Date();
  maxSelectableDate.setDate(maxSelectableDate.getDate() + 15);

  useEffect(() => {
    if (selectedDate?.fullDate && dateRefs.current[selectedDate?.fullDate]) {
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
  }, [selectedDate.day, currentCourtId, savedClubId, dispatch]);

  // Set default court
  useEffect(() => {
    if (slotData?.data?.length > 0 && slotData.data[0]?.courts?.length > 0 && selectedCourts.length === 0) {
      const firstCourt = slotData.data[0].courts[0];
      setCurrentCourtId(firstCourt._id);
    }
  }, [slotData, selectedDate?.fullDate]);

  // Tab auto-select
  useEffect(() => {
    const counts = [0, 0, 0];
    slotData?.data?.forEach((court) => {
      court?.slots?.forEach((slot) => {
        if (showUnavailable || (slot.availabilityStatus === "available" && slot.status !== "booked" && !isPastTime(slot.time))) {
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
      const firstAvailableIndex = counts.findIndex((count) => count > 0);
      if (firstAvailableIndex !== -1) defaultTab = tabData[firstAvailableIndex].key;
    }
    setKey(defaultTab);
  }, [slotData, showUnavailable]);

  const steps = [
    { question: "On the following scale, where would you place yourself?", options: ["Beginner", "Intermediate", "Advanced", "Professional"] },
    { question: "Select the racket sport you have played before?", options: ["Tennis", "Badminton", "Squash", "Others"] },
    { question: "Have you received or are you receiving training in padel?", options: ["No", "Yes, in the past", "Yes, currently"] },
    { question: "How old are you?", options: ["Between 18 and 30 years", "Between 31 and 40 years", "Between 41 and 50 years", "Over 50"] },
    { question: "On the volley?", options: ["I hardly get to the net", "I don't feel safe at the net, I make too many mistakes", "I can volley forehand and backhand with some difficulties", "I have good positioning at the net and I volley confidently", "I don't know"] },
    {
      question: "Which Padel Player Are You?", options: [
        { code: "A", title: "Top Player" }, { code: "B1", title: "Experienced Player" }, { code: "B2", title: "Advanced Player" },
        { code: "C1", title: "Confident Player" }, { code: "C2", title: "Intermediate Player" }, { code: "D1", title: "Amateur Player" },
        { code: "D2", title: "Novice Player" }, { code: "E", title: "Entry Level" },
      ]
    },
  ];

  const grandTotal = selectedCourts.reduce((sum, c) => sum + c.time.reduce((s, t) => s + Number(t.amount || 0), 0), 0);
  const totalSlots = selectedCourts.reduce((sum, c) => sum + c.time.length, 0);


  const handleNext = () => {
    if (selectedCourts.length === 0 || selectedCourts.every(c => c.time.length === 0)) {
      setSlotError("Select a slot to enable booking");
      return;
    }
    if (currentStep === 1) {
      if (selectedLevel.length > 0) {
        setSkillDetails(prev => { const n = [...prev]; n[currentStep] = selectedLevel; return n; });
        setCurrentStep(currentStep + 1);
        setSelectedLevel([]);
        setSlotError("");
      }
    } else if (selectedLevel && currentStep < steps.length - 1) {
      setSkillDetails(prev => { const n = [...prev]; n[currentStep] = selectedLevel; return n; });
      setCurrentStep(currentStep + 1);
      setSelectedLevel("");
      setSlotError("");
    } else if (currentStep === steps.length - 1 && selectedLevel) {
      const finalSkillDetails = [...skillDetails];
      finalSkillDetails[currentStep] = selectedLevel;

      const courtIds = selectedCourts.map(c => c._id).join(",");

      navigate("/match-payment", {
        state: {
          courtData: {
            day: selectedDate.day,
            date: selectedDate.fullDate,
            time: selectedBuisness,
            courtId: courtIds,
            court: selectedCourts,
            slot: slotData?.data?.[0]?.slots,
          },
          clubData,
          selectedCourts,
          selectedDate,
          grandTotal,
          totalSlots,
          finalSkillDetails,
        },
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedLevel(skillDetails[currentStep - 1] || (currentStep === 1 ? [] : ""));
      setSlotError("");
    }
  };

  useEffect(() => {
    if (slotError) {
      const timer = setTimeout(() => setSlotError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [slotError]);

  const getCurrentMonth = (date) => {
    if (!date) return "Month";
    return new Date(date.fullDate).toLocaleDateString("en-US", { month: "short" }).toUpperCase();
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

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  const handleDeleteSlot = (courtId, timeId) => {
    setSelectedCourts(prev =>
      prev
        .map(c => c._id === courtId ? { ...c, time: c.time.filter(t => t._id !== timeId) } : c)
        .filter(c => c.time.length > 0)
    );
    setSelectedTimes(prev => ({
      ...prev,
      [courtId]: prev[courtId]?.filter(t => t._id !== timeId) || []
    }));
    setSelectedBuisness(prev => prev.filter(t => t._id !== timeId));
  };

  const handleClearAll = () => {
    setSelectedCourts([]);
    setSelectedTimes({});
    setSelectedBuisness([]);
  };

  const formatTime = (timeStr) => {
    return timeStr.replace(" am", ":00 am").replace(" pm", ":00 pm");
  };

  // Button SVG
  const width = 370, height = 75, circleRadius = height * 0.3;
  const curvedStart = width * 0.76, circleX = curvedStart + (width * 0.996 - curvedStart) * 0.68 + 1;
  const circleY = height * 0.5, arrowSize = circleRadius * 0.6;

  const buttonStyle = {
    position: "relative", width: `${width}px`, height: `${height}px`, border: "none",
    background: "transparent", cursor: "pointer", opacity: 1, pointerEvents: "auto"
  };
  const svgStyle = { width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 1 };
  const contentStyle = { position: "relative", zIndex: 2, color: "#001B76", fontWeight: 600, fontSize: "16px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", paddingRight: `${circleRadius * 2}px` };

  return (
    <Container className="p-4 mb-5">
      <Row className="g-3">
        {/* LEFT PANEL */}
        <Col md={7} className="p-3" style={{ backgroundColor: "#F5F5F566" }}>
          {/* Date Selector */}
          <div className="calendar-strip">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="custom-heading-use text-nowrap">
                Select Date
                <div className="position-relative d-inline-block" ref={wrapperRef}>
                  <span
                    className="rounded p-1 pt-0 ms-2 bg-white"
                    style={{ cursor: "pointer", width: "26px !important", height: "26px !important", boxShadow: "0px 4px 4px 0px #00000014" }}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <MdOutlineDateRange size={20} style={{ color: "#374151" }} />
                  </span>
                  {isOpen && (
                    <div className="position-absolute mt-2 z-3 bg-white border rounded shadow" style={{ top: "100%", left: "0", minWidth: "100%" }}>
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
                            dispatch(getUserSlotBooking({
                              day, date: formattedDate,
                              register_club_id: localStorage.getItem("register_club_id") || "",
                            }));
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
                <label className="form-check-label mb-0" htmlFor="flexSwitchCheckDefault" style={{ whiteSpace: "nowrap", fontFamily: "Poppins" }}>
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

            <div className="d-flex align-items-center gap-2 border-bottom mb-3">
              <div className="d-flex justify-content-center p-0 mb-3 align-items-center rounded-pill" style={{ backgroundColor: "#f3f3f5", width: "30px", height: "58px" }}>
                <span className="text-muted" style={{ transform: "rotate(270deg)", fontSize: "14px", fontWeight: "500" }}>{getCurrentMonth(selectedDate)}</span>
              </div>
              <div className="d-flex gap-1" style={{ position: "relative", maxWidth: "95%" }}>
                <button className="btn p-2 border-0" style={{ position: "absolute", left: -65, zIndex: 10 }} onClick={scrollLeft}>
                  <MdOutlineArrowBackIosNew className="mt-2" size={20} />
                </button>
                <div ref={scrollRef} className="d-flex gap-1" style={{ scrollBehavior: "smooth", whiteSpace: "nowrap", maxWidth: "100%", overflow: "hidden" }}>
                  {dates.map((d, i) => {
                    const isSelected = selectedDate.fullDate === d.fullDate;
                    return (
                      <button
                        key={i}
                        ref={(el) => (dateRefs.current[d.fullDate] = el)}
                        className={`calendar-day-btn mb-3 me-1 ${isSelected ? "text-white border-0" : "bg-white"}`}
                        style={{
                          background: isSelected ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)" : "#FFFFFF",
                          boxShadow: isSelected ? "0px 4px 4px 0px #00000040" : "",
                          borderRadius: "12px",
                          color: isSelected ? "#FFFFFF" : "#374151"
                        }}
                        onClick={() => {
                          setSelectedDate({ fullDate: d.fullDate, day: d.day });
                          setStartDate(new Date(d.fullDate));
                          // DO NOT CLEAR SLOTS HERE
                          dispatch(getUserSlotBooking({
                            day: d.day,
                            date: d.fullDate,
                            register_club_id: localStorage.getItem("register_club_id") || ""
                          }));
                        }}
                        onMouseEnter={(e) => !isSelected && (e.currentTarget.style.border = "1px solid #3DBE64")}
                        onMouseLeave={(e) => (e.currentTarget.style.border = "1px solid #4949491A")}
                      >
                        <div className="text-center">
                          <div className="date-center-date">{d.date}</div>
                          <div className="date-center-day">{dayShortMap[d.day]}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button className="btn border-0 p-2" style={{ position: "absolute", right: -26, zIndex: 10 }} onClick={scrollRight}>
                  <MdOutlineArrowForwardIos className="mt-2" size={20} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="row mb-2 mx-auto">
              <div className="col-12 d-flex justify-content-center align-items-center">
                <div className="weather-tabs-wrapper w-100">
                  <div className="weather-tabs rounded-3 d-flex justify-content-center align-items-center">
                    {tabData.map((tab, index) => (
                      <div key={index} className={`tab-item rounded-3 ${key === tab.key ? "active" : ""}`} onClick={() => setKey(tab.key)}>
                        <img className="tab-icon" src={tab.img} alt={tab.label} />
                      </div>
                    ))}
                  </div>
                  <div className="tab-labels d-flex justify-content-between">
                    {tabData.map((tab, index) => <p key={index} className="tab-label">{tab.label}</p>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Slots */}
            <div className="mb-3 overflow-slot border-0 rounded-3 " style={{ border: slotError ? "1px solid red" : "1px solid #c2babaff" }}>
              {slotData?.data?.length > 0 ? (
                slotLoading ? (
                  <DataLoading height={"50vh"} />
                ) : (
                  <>
                    <div className="row g-3">
                      <div
                        className={`d-flex ${slotData.data.length > 4 ? "flex-nowrap overflow-auto" : "flex-wrap"}`}
                        style={{
                          gap: "16px",
                          paddingBottom: "10px",
                          overflowX: slotData.data.length > 4 ? "auto" : "visible",
                          whiteSpace: slotData.data.length > 4 ? "nowrap" : "normal",
                        }}
                      >
                        {slotData?.data?.map((court, courtIndex) => {
                          const filteredSlots = court?.slots
                            ?.filter((slot) =>
                              showUnavailable
                                ? true
                                : slot.availabilityStatus === "available" &&
                                slot.status !== "booked" &&
                                !isPastTime(slot.time) &&
                                slot.amount > 0
                            )
                            .filter((slot) => filterSlotsByTab(slot, key));

                          if (filteredSlots?.length === 0) return null;

                          // find visible court index
                          const visibleCourtIndices = slotData.data
                            .map((c, i) => {
                              const slots = c.slots?.filter(
                                (s) =>
                                  (showUnavailable ||
                                    (s.availabilityStatus === "available" &&
                                      s.status !== "booked" &&
                                      !isPastTime(s.time) &&
                                      s.amount > 0)) &&
                                  filterSlotsByTab(s, key)
                              );
                              return slots?.length > 0 ? i : null;
                            })
                            .filter((i) => i !== null);

                          const isLast =
                            visibleCourtIndices[visibleCourtIndices.length - 1] === courtIndex;

                          return (
                            <div
                              key={court._id}
                              className="court-container p-3"
                              style={{
                                minWidth:
                                  slotData.data.length > 4
                                    ? "170px" // for scroll mode
                                    : "calc((100% - 48px) / 4)", // exactly 4 in a row, 16px gap * 3 = 48px
                                flex: slotData.data.length > 4 ? "0 0 auto" : "1 1 auto",
                                borderRight: !isLast
                                  ? "1px solid transparent"
                                  : "none",
                                borderImage: !isLast
                                  ? "linear-gradient(180deg, rgba(255,255,255,0) 0%, #837f7fff 46.63%, rgba(255,255,255,0) 94.23%) 1"
                                  : "none",
                                borderImageSlice: !isLast ? 1 : 0,
                              }}
                            >
                              <div className="mb-3 text-center">
                                <h5 className="all-matches mb-1">{court?.courtName}</h5>
                              </div>

                              <div className="slots-grid d-flex flex-column align-items-center">
                                {filteredSlots?.map((slot, i) => {
                                  const isSelected = selectedTimes[court._id]?.some(
                                    (t) => t._id === slot._id
                                  );
                                  const totalSlots = Object.values(selectedTimes).flat().length;
                                  const isLimitReached = totalSlots >= 15 && !isSelected;
                                  const isDisabled =
                                    isLimitReached ||
                                    slot.status === "booked" ||
                                    slot.availabilityStatus !== "available" ||
                                    isPastTime(slot.time) ||
                                    slot.amount <= 0;

                                  return (
                                    <button
                                      key={i}
                                      className={`btn rounded-3 ${isSelected ? "border-0" : ""
                                        } slot-time-btn text-center mb-2`}
                                      onClick={() => toggleTime(slot, court._id)}
                                      disabled={isDisabled}
                                      style={{
                                        background:
                                          slot.status === "booked" ||
                                            isPastTime(slot.time) ||
                                            slot.amount <= 0
                                            ? "#c9cfcfff"
                                            : isSelected
                                              ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"
                                              : slot.availabilityStatus !== "available"
                                                ? "#c9cfcfff"
                                                : "#FFFFFF",
                                        color: isDisabled
                                          ? "#000000"
                                          : isSelected
                                            ? "white"
                                            : "#000000",
                                        cursor: isDisabled ? "not-allowed" : "pointer",
                                        opacity: isDisabled ? 0.6 : 1,
                                        border: isSelected ? "" : "1px solid #4949491A",
                                        fontSize: "14px",
                                        padding: "8px 4px",
                                      }}
                                      onMouseEnter={(e) =>
                                        !isDisabled &&
                                        (e.currentTarget.style.border = "1px solid #3DBE64")
                                      }
                                      onMouseLeave={(e) =>
                                        (e.currentTarget.style.border = "1px solid #4949491A")
                                      }
                                    >
                                      {formatTimeForDisplay(slot?.time)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {slotData?.data?.every(court => !court?.slots?.some(slot => (showUnavailable || (slot.availabilityStatus === "available" && slot.status !== "booked" && !isPastTime(slot.time))) && filterSlotsByTab(slot, key))) && (
                      <div className="text-center py-4 text-danger" style={{ fontFamily: "Poppins", fontWeight: "500" }}>
                        No {showUnavailable ? "unavailable" : "available"} slots
                      </div>
                    )}
                  </>
                )
              ) : (
                <div className="text-center py-4 text-muted">No courts available</div>
              )}
            </div>
          </div>
        </Col>

        {/* RIGHT PANEL */}
        <Col md={5} className="ps-2" >
          <div className="div" style={{ backgroundColor: "#F1F4FF" }}>
            {/* Step Indicators */}
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
                >

                </div>
              ))}
            </div>

            {/* Form Content */}
            <div className="p-4">
              <h6 className="mb-4" style={{ fontSize: "20px", fontFamily: "Poppins", fontWeight: 600, color: "#1f2937" }}>
                {steps[currentStep].question}
              </h6>

              <Form style={{ height: "350px", overflowY: "auto" }}>
                {/* STEP 2: Multiple Select (Checkboxes) */}
                {currentStep === 1 ? (
                  steps[currentStep].options.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedLevel((prev) =>
                          prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
                        );
                      }}
                      className="d-flex align-items-center mb-3 p-3 rounded shadow-sm border step-option"
                      style={{
                        backgroundColor: selectedLevel.includes(opt) ? "#eef2ff" : "#fff",
                        borderColor: selectedLevel.includes(opt) ? "#4f46e5" : "#e5e7eb",
                        cursor: "pointer",
                        gap: "12px",
                        minHeight: "60px",
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
                          fontSize: "16px",
                          fontWeight: 500,
                          color: "#1f2937",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {opt}
                      </span>
                    </div>
                  ))
                ) : currentStep === steps.length - 1 ? (
                  /* LAST STEP: Skill Level (Radio + Code) */
                  steps[currentStep].options.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedLevel(opt.code)}
                      className="d-flex align-items-center mb-3 p-3 rounded shadow-sm border step-option"
                      style={{
                        backgroundColor: selectedLevel === opt.code ? "#eef2ff" : "#fff",
                        borderColor: selectedLevel === opt.code ? "#4f46e5" : "#e5e7eb",
                        cursor: "pointer",
                        gap: "12px",
                        minHeight: "60px",
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
                        <strong
                          style={{
                            fontSize: "16px",
                            color: "#1f2937",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={opt.title}
                        >
                          {opt.title}
                        </strong>
                      </div>
                    </div>
                  ))
                ) : (
                  /* OTHER STEPS: Single Radio */
                  steps[currentStep].options.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedLevel(opt)}
                      className="d-flex align-items-center mb-3 p-3 rounded shadow-sm border step-option"
                      style={{
                        backgroundColor: selectedLevel === opt ? "#eef2ff" : "#fff",
                        borderColor: selectedLevel === opt ? "#4f46e5" : "#e5e7eb",
                        cursor: "pointer",
                        gap: "12px",
                        minHeight: "60px",
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
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 500,
                          color: "#1f2937",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {opt}
                      </span>
                    </div>
                  ))
                )}
              </Form>
            </div>

            {/* Buttons */}
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
                    maxWidth: "370px"
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
                  !selectedLevel ||
                  (currentStep === 1 && selectedLevel.length === 0)
                }
                onClick={handleNext}
              >
                {userMatches?.matchesLoading ? (
                  <ButtonLoading />
                ) : currentStep === steps.length - 1 ? (
                  "Submit"
                ) : window.innerWidth < 768 ? (
                  ""
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </div>
        </Col>
      </Row>


    </Container >
  );
};

export default CreateMatches;