import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Button, Card, Form, FormCheck, Tabs, Tab, Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { getUserSlotBooking } from "../../../redux/user/slot/thunk";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import "react-datepicker/dist/react-datepicker.css";
import { MdOutlineArrowForwardIos, MdOutlineDeleteOutline } from "react-icons/md";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { MdOutlineDateRange } from "react-icons/md";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { frame, morningTab, nighttab, sun, twoball } from "../../../assets/files";
import { Avatar } from "@mui/material";
import { getUserClub } from "../../../redux/user/club/thunk";

// Function to parse time string to hour for tab categorization
const parseTimeToHour = (timeStr) => {
  if (!timeStr) return null;
  const [hourStr, period] = timeStr.toLowerCase().split(" ");
  let hour = parseInt(hourStr);
  if (isNaN(hour)) return null;
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  return hour;
};

// Function to filter slots by tab (Morning, Noon, Night)
const filterSlotsByTab = (slot, eventKey) => {
  const slotHour = parseTimeToHour(slot?.time);
  if (slotHour === null) return false;
  switch (eventKey) {
    case 'morning': return slotHour >= 0 && slotHour < 12;
    case 'noon': return slotHour >= 12 && slotHour < 17;
    case 'night': return slotHour >= 17 && slotHour <= 23;
    default: return true;
  }
};

const CreateMatches = (props) => {
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
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
  const [skillDetails, setSkillDetails] = useState([]);
  const [currentCourtId, setCurrentCourtId] = useState(null);
  const { slotData } = useSelector((state) => state?.userSlot);
  const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0] || []);
  const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
  const userMatches = store?.userMatches;
  const [slotError, setSlotError] = useState("");
  const [key, setKey] = useState('morning');
  const [showStepsModal, setShowStepsModal] = useState(false);
  const logo = JSON.parse(localStorage.getItem("logo"));

  const tabData = [
    { img: morningTab, label: 'Day', key: 'morning' },
    { img: sun, label: 'Afternoon', key: 'noon' },
    { img: nighttab, label: 'Night', key: 'night' },
  ];

  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    dispatch(getUserClub({ search: "" }));
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  const [startIndex, setStartIndex] = useState(0);
  const visibleDays = 7;

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  };

  const scroll = (direction) => {
    if (direction === "left" && startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
    if (direction === "right" && startIndex < dates.length - visibleDays) {
      setStartIndex(startIndex + 1);
    }
  };

  const handleSwitchChange = () => {
    setShowUnavailable(!showUnavailable);
  };

  const toggleTime = (time, courtId) => {
    const totalSlots = selectedCourts.reduce((acc, c) => acc + (c.time?.length || 0), 0);
    const currentCourtTimes = selectedTimes[courtId] || [];
    const isAlreadySelected = currentCourtTimes.some((t) => t._id === time._id);

    if (isAlreadySelected) {
      const filteredTimes = currentCourtTimes.filter((t) => t._id !== time._id);
      setSelectedTimes({
        ...selectedTimes,
        [courtId]: filteredTimes,
      });
      setSelectedBuisness((prev) => prev.filter((t) => t._id !== time._id));
      setSelectedCourts((prev) =>
        prev
          .map((court) => {
            if (court._id === courtId && court.date === selectedDate.fullDate) {
              const newTime = court.time.filter((t) => t._id !== time._id);
              return { ...court, time: newTime };
            }
            return court;
          })
          .filter((court) => court.time.length > 0)
      );
    } else {
      const newLength = totalSlots + 1;
      if (newLength > 15) {
        setErrorMessage("Maximum 15 slots can be selected in total.");
        setErrorShow(true);
        return;
      }
      const newTimes = [...currentCourtTimes, time];
      setSelectedTimes({
        ...selectedTimes,
        [courtId]: newTimes,
      });
      setSelectedBuisness((prev) => [...prev, time]);

      const currentCourt = slotData?.data?.find((court) => court._id === courtId);
      if (currentCourt) {
        setSelectedCourts((prev) => {
          const existingCourt = prev.find(
            (c) => c._id === courtId && c.date === selectedDate.fullDate
          );
          const newTimeEntry = {
            _id: time._id,
            time: time.time,
            amount: time.amount,
          };
          if (existingCourt) {
            return prev.map((court) =>
              court._id === courtId && court.date === selectedDate.fullDate
                ? { ...court, time: [...court.time, newTimeEntry] }
                : court
            );
          } else {
            const newCourt = {
              _id: currentCourt._id,
              courtName: currentCourt.courtName,
              type: currentCourt.type,
              date: selectedDate.fullDate,
              day: selectedDate.day,
              time: [newTimeEntry],
            };
            return [...prev, newCourt];
          }
        });
      }
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

  useEffect(() => {
    if (
      slotData?.data?.length > 0 &&
      slotData.data[0]?.courts?.length > 0 &&
      selectedCourts.length === 0
    ) {
      const firstCourt = slotData.data[0].courts[0];
      setSelectedCourts([
        {
          _id: firstCourt._id,
          courtName: firstCourt.courtName,
          type: firstCourt.type,
          date: selectedDate?.fullDate,
          times: [],
        },
      ]);
      setCurrentCourtId(firstCourt._id);
    }
  }, [slotData, selectedDate?.fullDate]);

  // Calculate tab counts and set default tab
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

    let defaultTab = 'morning';
    if (counts[0] === 0) {
      const firstAvailableIndex = counts.findIndex(count => count > 0);
      if (firstAvailableIndex !== -1) {
        defaultTab = tabData[firstAvailableIndex].key;
      }
    }
    setKey(defaultTab);
  }, [slotData, showUnavailable]);

  const steps = [
    {
      question: "On the following scale, where would you place yourself?",
      options: ["Beginner", "Intermediate", "Advanced", "Professional"],
    },
    {
      question: "Select the racket sport you have played before?",
      options: ["Tennis", "Badminton", "Squash", "Others"],
    },
    {
      question: "Have you received or are you receiving training in padel?",
      options: [
        "No",
        "Yes, in the past",
        "Yes, currently",
      ],
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
  ];

  const grandTotal = selectedCourts.reduce(
    (sum, c) => sum + c.time.reduce((s, t) => s + Number(t.amount || 0), 0),
    0
  );
  const totalSlots = selectedCourts.reduce((sum, c) => sum + c.time.length, 0);

  const handleBookNow = () => {
    if (selectedCourts.length === 0 || selectedCourts.every((court) => court.time.length === 0)) {
      setSlotError("Please select a time slot to continue with your booking");
      return;
    }
    setShowStepsModal(true);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (selectedLevel.length > 0) {
        setSkillDetails((prev) => {
          const newDetails = [...prev];
          newDetails[currentStep] = selectedLevel;
          return newDetails;
        });
        setCurrentStep(currentStep + 1);
        setSelectedLevel([]);
        setSlotError("");
      }
    } else if (selectedLevel && currentStep < steps.length - 1) {
      setSkillDetails((prev) => {
        const newDetails = [...prev];
        newDetails[currentStep] = selectedLevel;
        return newDetails;
      });
      setCurrentStep(currentStep + 1);
      setSelectedLevel("");
      setSlotError("");
    } else if (currentStep === steps.length - 1 && selectedLevel) {
      const finalSkillDetails = [...skillDetails];
      finalSkillDetails[currentStep] = selectedLevel;

      const courtIds = selectedCourts
        .map((court) => court._id)
        .filter((id) => id)
        .join(",");

      navigate("/match-payment", {
        state: {
          courtData: {
            day: selectedDate?.day,
            date: selectedDate?.fullDate,
            time: selectedBuisness,
            courtId: courtIds,
            court: selectedCourts.map((c) => ({
              _id: c._id || c.id,
              ...c,
            })),
            slot: slotData?.data?.[0]?.slots,
          },
          clubData: clubData,
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
      const timer = setTimeout(() => {
        setSlotError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [slotError]);

  const getCurrentMonth = (selectedDate) => {
    if (!selectedDate) return "Month";
    const dateObj = new Date(selectedDate.fullDate);
    return dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  };

  const formatTimeForDisplay = (time) => {
    if (!time) return "";
    const timeLower = time.toLowerCase();
    let hourPart = timeLower.replace(/(am|pm)/gi, "").trim();
    const periodMatch = timeLower.match(/(am|pm)/gi);
    const periodPart = periodMatch ? periodMatch[0] : "";
    if (!hourPart.includes(":")) {
      const hour = parseInt(hourPart);
      hourPart = `${hour.toString().padStart(2, '0')}:00`;
    } else {
      const [hour, minute] = hourPart.split(':');
      hourPart = `${parseInt(hour).toString().padStart(2, '0')}:${minute}`;
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

  const handleDeleteSlot = (courtId, date, timeId) => {
    setSelectedCourts((prev) =>
      prev
        .map((c) => (c._id === courtId && c.date === date ? { ...c, time: c.time.filter((t) => t._id !== timeId) } : c))
        .filter((c) => c.time.length > 0)
    );
    if (date === selectedDate.fullDate) {
      setSelectedTimes((prev) => ({
        ...prev,
        [courtId]: prev[courtId]?.filter((t) => t._id !== timeId) || [],
      }));
      setSelectedBuisness((prev) => prev.filter((t) => t._id !== timeId));
    }
  };

  const handleClearAll = () => {
    setSelectedCourts([]);
    setSelectedTimes({});
    setSelectedBuisness([]);
  };

  const formatTime = (timeStr) => {
    return timeStr.replace(" am", ":00 am").replace(" pm", ":00 pm");
  };

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

  const buttonStyle = {
    position: "relative",
    width: `${width}px`,
    height: `${height}px`,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    opacity: 1,
    pointerEvents: "auto",
  };

  const svgStyle = {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  };

  const contentStyle = {
    position: "relative",
    zIndex: 2,
    color: " #001B76",
    fontWeight: "600",
    fontSize: `16px`,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingRight: `${circleRadius * 2}px`,
  };

  return (
    <Container className="p-4 mb-5">
      <Row>
        {/* LEFT PANEL */}
        <Col md={7} className="p-3" style={{ backgroundColor: "#F5F5F566", border: slotError ? "1px solid red" : "none" }}>
          {/* Date Selector */}
          <div className="calendar-strip">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="custom-heading-use text-nowrap">
                Select Date
                <div className="position-relative d-inline-block" ref={wrapperRef}>
                  <span
                    className="rounded p-1 pt-0 ms-2 bg-white"
                    style={{
                      cursor: "pointer",
                      width: "26px !important",
                      height: "26px !important",
                      boxShadow: "0px 4px 4px 0px #00000014",
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <MdOutlineDateRange size={20} style={{ color: "#374151" }} />
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
                            const day = date.toLocaleDateString("en-US", {
                              weekday: "long",
                            });
                            setSelectedDate({ fullDate: formattedDate, day: day });
                            setSelectedTimes({});
                            dispatch(
                              getUserSlotBooking({
                                day: day,
                                date: formattedDate,
                                register_club_id:
                                  localStorage.getItem("register_club_id") || "",
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
                <button className="btn p-2 border-0" style={{ position: "absolute", left: -65, zIndex: 10, boxShadow: "none" }} onClick={scrollLeft}><MdOutlineArrowBackIosNew className="mt-2" size={20} /></button>
                <div ref={scrollRef} className="d-flex gap-1" style={{ scrollBehavior: "smooth", whiteSpace: "nowrap", maxWidth: "100%", overflow: "hidden" }}>
                  {dates.map((d, i) => {
                    const isSelected = formatDate(new Date(selectedDate?.fullDate)) === d.fullDate;
                    return (
                      <button
                        key={i}
                        ref={(el) => (dateRefs.current[d.fullDate] = el)}
                        className={`calendar-day-btn mb-3 me-1 ${isSelected ? "text-white border-0" : "bg-white"}`}
                        style={{ background: isSelected ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)" : "#FFFFFF", boxShadow: isSelected ? "0px 4px 4px 0px #00000040" : "", borderRadius: "12px", color: isSelected ? "#FFFFFF" : "#374151" }}
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
                      </button>
                    );
                  })}
                </div>
                <button className="btn border-0 p-2" style={{ position: "absolute", right: -26, zIndex: 10, boxShadow: "none" }} onClick={scrollRight}><MdOutlineArrowForwardIos className="mt-2" size={20} /></button>
              </div>
            </div>
            {/* Tabs for Morning, Noon, Night */}
            <div className="row mb-2 mx-auto">
              <div className="col-12 d-flex justify-content-center align-items-center">
                <div className="weather-tabs-wrapper w-100">
                  <div className="weather-tabs rounded-pill d-flex justify-content-center align-items-center">
                    {tabData.map((tab, index) => (
                      <div
                        key={index}
                        className={`tab-item ${key === tab.key ? 'active' : ''}`}
                        onClick={() => setKey(tab.key)}
                      >
                        <img className="tab-icon" src={tab.img} alt={tab.label} />
                      </div>
                    ))}
                  </div>

                  {/* Labels below tabs */}
                  <div className="tab-labels d-flex justify-content-between">
                    {tabData.map((tab, index) => (
                      <p key={index} className="tab-label">
                        {tab.label}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-3 overflow-slot rounded-3 border">
              {slotData?.data?.length > 0 ? (
                slotLoading ? (
                  <DataLoading height={"50vh"} />
                ) : (
                  <>
                    <div className="row g-3">
                      {slotData?.data?.map((court) => {
                        const filteredSlots = court?.slots?.filter((slot) =>
                          showUnavailable
                            ? true
                            : slot.availabilityStatus === "available" &&
                            slot.status !== "booked" &&
                            !isPastTime(slot.time) &&
                            slot.amount > 0
                        ).filter((slot) => filterSlotsByTab(slot, key));

                        if (filteredSlots?.length === 0) return null;

                        return (
                          <div className="col-lg-3  col-6" key={court._id}>
                            <div className="court-container p-3">
                              <div className="mb-3 text-center">
                                <h5 className="all-matches mb-1">{court?.courtName}</h5>
                              </div>
                              <div className="slots-grid d-flex flex-column align-items-center">
                                {filteredSlots?.map((slot, i) => {
                                  const isSelected = selectedTimes[court._id]?.some(
                                    (t) => t._id === slot._id
                                  );
                                  const currentSlots = totalSlots;
                                  const isLimitReached = currentSlots >= 15 && !isSelected;
                                  const isDisabled =
                                    isLimitReached ||
                                    slot.status === "booked" ||
                                    slot.availabilityStatus !== "available" ||
                                    isPastTime(slot.time) ||
                                    slot.amount <= 0;

                                  return (
                                    <button
                                      key={i}
                                      className={`btn rounded-pill ${isSelected ? 'border-0' : ''} slot-time-btn text-center mb-2`}
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
                                        color:
                                          slot.status === "booked" ||
                                            isPastTime(slot.time) ||
                                            isDisabled
                                            ? "#000000"
                                            : isSelected
                                              ? "white"
                                              : "#000000",
                                        cursor: isDisabled ? "not-allowed" : "pointer",
                                        opacity: isDisabled ? 0.6 : 1,
                                        border: isSelected ? '' : "1px solid #4949491A",
                                        transition: "border-color 0.2s ease",
                                        fontSize: "14px",
                                        padding: "8px 4px"
                                      }}
                                      onMouseEnter={(e) => {
                                        if (
                                          !isDisabled &&
                                          !isPastTime(slot.time) &&
                                          slot.availabilityStatus === "available"
                                        ) {
                                          e.currentTarget.style.border =
                                            "1px solid #3DBE64";
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (
                                          !isDisabled &&
                                          !isPastTime(slot.time) &&
                                          slot.availabilityStatus === "available"
                                        ) {
                                          e.currentTarget.style.border =
                                            "1px solid #4949491A";
                                        }
                                      }}
                                    >
                                      {formatTimeForDisplay(slot?.time)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {slotData?.data?.every(
                      (court) =>
                        !court?.slots?.some((slot) =>
                          (showUnavailable ||
                            (slot.availabilityStatus === "available" &&
                              slot.status !== "booked" &&
                              !isPastTime(slot.time))) &&
                          filterSlotsByTab(slot, key)
                        )
                    ) && (
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

        {/* RIGHT PANEL - BOOKING SUMMARY (Always Visible) */}
        <Col md={5}>
          <div className="border w-100 px-3 py-5 border-0" style={{ borderRadius: '10px 30% 10px 10px', background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)" }}>
            <div className="text-center mb-3">
              <div className="d-flex justify-content-center">
                {logo ? <Avatar src={logo} alt="User Profile" style={{ height: "112px", width: "112px", boxShadow: "0px 4px 11.4px 0px #0000002E" }} /> : <Avatar alt={clubData?.clubName?.charAt(0).toUpperCase() + clubData?.clubName?.slice(1)} style={{ height: "112px", width: "112px", fontSize: "30px", boxShadow: "0px 4px 11.4px 0px #0000002E" }}>{clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}</Avatar>}
              </div>
              <p className="mt-2 mb-1 text-white" style={{ fontSize: "20px", fontWeight: "600", fontFamily: "Poppins" }}>{clubData?.clubName}</p>
            </div>
            <div className="d-flex border-top pt-2 justify-content-between align-items-center">
              <h6 className="p-2 mb-1 ps-0 text-white custom-heading-use">Booking Summary</h6>
              {totalSlots >= 10 && <Button className="float-end me-3 btn border-0 shadow rounded-pill" style={{ cursor: "pointer", background: "#111827", fontSize: "10px", fontWeight: "600", fontFamily: "Poppins" }} onClick={handleClearAll}>Clear All</Button>}
            </div>
            <div style={{ maxHeight: "240px", overflowY: "auto", overflowX: "hidden" }}>
              {selectedCourts.length > 0 ? (
                selectedCourts.map((court, index) =>
                  court.time.map((timeSlot, timeIndex) => (
                    <div key={`${index}-${timeIndex}`} className="row mb-2">
                      <div className="col-12 d-flex gap-2 mb-0 m-0 align-items-center justify-content-between">
                        <div className="d-flex text-white">
                          <span style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "16px" }}>
                            {court.date ? `${new Date(court.date).toLocaleString("en-US", { day: "2-digit" })}, ${new Date(court.date).toLocaleString("en-US", { month: "short" })}` : ""}
                          </span>
                          <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "16px" }}>
                            {formatTime(timeSlot.time)}
                          </span>
                          <span className="ps-2" style={{ fontWeight: "500", fontFamily: "Poppins", fontSize: "15px" }}>{court.courtName}</span>
                        </div>
                        <div className="text-white">
                          ₹<span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins" }}>{timeSlot.amount || "N/A"}</span>
                          <MdOutlineDeleteOutline className="ms-2 mb-2 text-white" style={{ cursor: "pointer" }} onClick={() => handleDeleteSlot(court._id, court.date, timeSlot._id)} />
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <div className="d-flex flex-column justify-content-center align-items-center text-white" style={{ height: "25vh" }}>
                  <p style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500" }}>No slot selected</p>
                </div>
              )}
            </div>
            {totalSlots > 0 && (
              <div className="border-top pt-3 mt-2 text-white d-flex justify-content-between align-items-center fw-bold" style={{ overflowX: "hidden" }}>
                <p className="d-flex flex-column" style={{ fontSize: "16px", fontWeight: "600" }}>
                  Total to Pay <span style={{ fontSize: "13px", fontWeight: "500" }}>Total slots {totalSlots}</span>
                </p>
                <p style={{ fontSize: "25px", fontWeight: "600" }}>₹ {grandTotal}</p>
              </div>
            )}
            {slotError && (
              <div className="text-center mt-2">
                <p className="text-warning mb-0" style={{ fontSize: "14px", fontFamily: "Poppins" }}>{slotError}</p>
              </div>
            )}
            <div className="d-flex justify-content-center mt-3">
              <button style={buttonStyle} onClick={handleBookNow} className={props.className}>
                <svg style={svgStyle} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={`buttonGradient-${width}-${height}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fff" />
                      <stop offset="50%" stopColor="#fff" />
                      <stop offset="100%" stopColor="#fff" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${width * 0.76} ${height * 0.15} 
                                  C ${width * 0.79} ${height * 0.15} ${width * 0.81} ${height * 0.20} ${width * 0.83} ${height * 0.30} 
                                  C ${width * 0.83} ${height * 0.32} ${width * 0.84} ${height * 0.34} ${width * 0.84} ${height * 0.34} 
                                  C ${width * 0.85} ${height * 0.34} ${width * 0.86} ${height * 0.32} ${width * 0.86} ${height * 0.30} 
                                  C ${width * 0.88} ${height * 0.20} ${width * 0.90} ${height * 0.15} ${width * 0.92} ${height * 0.15} 
                                  C ${width * 0.97} ${height * 0.15} ${width * 0.996} ${height * 0.30} ${width * 0.996} ${height * 0.50} 
                                  C ${width * 0.996} ${height * 0.70} ${width * 0.97} ${height * 0.85} ${width * 0.92} ${height * 0.85} 
                                  C ${width * 0.90} ${height * 0.85} ${width * 0.88} ${height * 0.80} ${width * 0.86} ${height * 0.70} 
                                  C ${width * 0.86} ${height * 0.68} ${width * 0.85} ${height * 0.66} ${width * 0.84} ${height * 0.66} 
                                  C ${width * 0.84} ${height * 0.66} ${width * 0.83} ${height * 0.68} ${width * 0.83} ${height * 0.70} 
                                  C ${width * 0.81} ${height * 0.80} ${width * 0.79} ${height * 0.85} ${width * 0.76} ${height * 0.85} 
                                  L ${width * 0.08} ${height * 0.85} 
                                  C ${width * 0.04} ${height * 0.85} ${width * 0.004} ${height * 0.70} ${width * 0.004} ${height * 0.50} 
                                  C ${width * 0.004} ${height * 0.30} ${width * 0.04} ${height * 0.15} ${width * 0.08} ${height * 0.15} 
                                  L ${width * 0.76} ${height * 0.15} Z`}
                    fill={`url(#buttonGradient-${width}-${height})`}
                  />
                  <circle cx={circleX} cy={circleY} r={circleRadius} fill="#001B76" />
                  <g stroke="white" strokeWidth={height * 0.03} fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4}`} />
                    <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4}`} />
                    <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1}`} />
                  </g>
                </svg>
                <div style={contentStyle}>Submit</div>
              </button>
            </div>
          </div>



        </Col>
      </Row>

      {/* Steps Popup Modal */}
      <Modal show={showStepsModal} onHide={() => setShowStepsModal(false)} className="border-0" size="xl" centered>
        <Modal.Body className="p-0 border rounded-3">
          <Row className="g-0">
            <Col md={6} className="d-flex align-items-center justify-content-center p-0">
              <img src={frame} alt="Padel" className="img-fluid w-100" style={{ objectFit: "cover" }} />
            </Col>
            <Col md={6} className="ps-3" style={{ backgroundColor: "#F1F4FF" }}>
              <div className="p-4">
                {/* Step Circles */}
                <div className="d-flex justify-content-start mb-4 mt-lg-4">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className="me-3"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: index <= currentStep ? "#3DBE64" : "#D9D9D9",
                        color: index <= currentStep ? "#3DBE64" : "#D9D9D9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "500",
                        fontFamily: "Poppins",
                      }}
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
                <h6 className="mb-4 step-heading" style={{ color: "#374151" }}>{steps[currentStep].question}</h6>
                <Form >
                  {currentStep === 1 ? (
                    steps[currentStep].options?.map((option, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedLevel((prev) =>
                            prev.includes(option)
                              ? prev.filter((item) => item !== option)
                              : [...prev, option]
                          );
                        }}
                        className={`d-flex align-items-center mb-3 px-3 py-2 rounded shadow-sm border transition-all`}
                        style={{
                          backgroundColor: selectedLevel.includes(option) ? "#eef2ff" : "#fff",
                          borderColor: selectedLevel.includes(option) ? "#4f46e5" : "#e5e7eb",
                          cursor: "pointer",
                        }}
                      >
                        <Form.Check
                          type="checkbox"
                          id={`option-${currentStep}-${i}`}
                          checked={selectedLevel.includes(option)}
                          onChange={(e) =>
                            setSelectedLevel((prev) =>
                              e.target.checked
                                ? [...prev, option]
                                : prev.filter((item) => item !== option)
                            )
                          }
                          className="d-flex align-items-center gap-3 custom-checkbox"
                          label={
                            <span
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                fontFamily: "Poppins",
                              }}
                            >
                              {option}
                            </span>
                          }
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    ))
                  ) : (
                    steps[currentStep].options?.map((option, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedLevel(option)}
                        className={`d-flex align-items-center mb-3 px-3 py-2 rounded shadow-sm border transition-all`}
                        style={{
                          backgroundColor: selectedLevel === option ? "#eef2ff" : "#fff",
                          borderColor: selectedLevel === option ? "#4f46e5" : "#e5e7eb",
                          cursor: "pointer",
                        }}
                      >
                        <Form.Check
                          type="radio"
                          name={`step-${currentStep}`}
                          id={`option-${currentStep}-${i}`}
                          value={option}
                          checked={selectedLevel === option}
                          onChange={(e) => setSelectedLevel(e.target.value)}
                          className="d-flex align-items-center gap-3 custom-radio border-primary"
                          label={
                            <span
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                fontFamily: "Poppins",
                              }}
                            >
                              {option}
                            </span>
                          }
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    ))
                  )}
                </Form>
                <div className="d-flex justify-content-end align-items-center mt-3 position-absolute bottom-0 end-0 me-4 mb-4">
                  {currentStep > 0 && (
                    <Button
                      className="rounded-pill px-4 me-2"
                      style={{
                        backgroundColor: "#374151",
                        border: "none",
                        color: "#fff",
                      }}
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    className="rounded-pill px-4"
                    style={{
                      backgroundColor: currentStep === steps.length - 1 ? "#3DBE64" : "#10b981",
                      border: "none",
                      color: "#fff",
                    }}
                    disabled={!selectedLevel || (currentStep === 1 && selectedLevel.length === 0)}
                    onClick={handleNext}
                  >
                    {userMatches?.matchesLoading ? (
                      <ButtonLoading />
                    ) : currentStep === steps.length - 1 ? (
                      "Submit"
                    ) : (
                      "Next"
                    )}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CreateMatches;