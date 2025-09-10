import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Button, Card, Form, FormCheck } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { FaArrowRight, FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { getUserSlotBooking } from "../../../redux/user/slot/thunk"; 
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import "react-datepicker/dist/react-datepicker.css";
import { formatTime } from "../../../helpers/Formatting";
import Avatar from "@mui/material/Avatar";
import { MdOutlineDateRange } from "react-icons/md";

const CreateMatches = () => {
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
  const [selectedLevel, setSelectedLevel] = useState("");
  const [skillDetails, setSkillDetails] = useState([]);
  const [currentCourtId, setCurrentCourtId] = useState(null);
  const { slotData } = useSelector((state) => state?.userSlot);
  const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0] || []); // clubData जोड़ा
  const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
  const userMatches = store?.userMatches;
  const [showUnavailableOnly, setShowUnavailableOnly] = useState(false);
  const [slotError, setSlotError] = useState("");

  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
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

  const handleCourtSelect = (court) => {
    setCurrentCourtId(court._id);
    setSelectedCourts((prev) => {
      if (!prev.some((c) => c._id === court._id)) {
        return [
          ...prev,
          {
            _id: court._id,
            courtName: court.courtName,
            type: court.type,
            date: selectedDate?.fullDate,
            times: [],
          },
        ];
      }
      return prev;
    });
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
  maxSelectableDate.setDate(maxSelectableDate.getDate() + 40);

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
      question: "How old are you?",
      options: ["Between 18 and 30 years", "Between 31 and 40 years", "Between 41 and 50 years", "Over 50"],
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
      question: "On the rebounds...",
      options: [
        "I don't know how to read the rebounds, I hit before it rebounds",
        "I try, with difficulty, to hit the rebounds on the back wall",
        "I return rebounds on the back wall, it is difficult for me to return the double wall ones",
        "I return double-wall rebounds and reach for quick rebounds",
        "I perform powerful wall descent shots with forehand and backhand",
        "I don't know",
      ],
    },
  ];

  const grandTotal = selectedCourts.reduce(
    (sum, c) => sum + c.time.reduce((s, t) => s + Number(t.amount || 0), 0),
    0
  ); // grandTotal जोड़ा
  const totalSlots = selectedCourts.reduce((sum, c) => sum + c.time.length, 0); // totalSlots जोड़ा

  const handleNext = () => {
    if (selectedCourts.length === 0 || selectedCourts.every((court) => court.time.length === 0)) {
      setSlotError("Please select at least one time slot for a court");
      return;
    }

    if (selectedLevel && currentStep < steps.length - 1) {
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
        .join(","); // courtIds जोड़ा

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
          finalSkillDetails, // CreateMatches के लिए अतिरिक्त डेटा
        },
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedLevel(skillDetails[currentStep - 1] || "");
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
    const [hourString, period] = time.toLowerCase().split(" ");
    return `${hourString}:00 ${period}`;
  };

  const parseTimeToHour = (timeStr) => {
    if (!timeStr) return null;
    const [hourStr, period] = timeStr.toLowerCase().split(" ");
    let hour = parseInt(hourStr);
    if (isNaN(hour)) return null;
    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
    return hour;
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

  return (
    <Container className="p-4 mb-5">
      <Row>
        {/* LEFT PANEL */}
        <Col md={7} className="p-3" style={{ backgroundColor: "#F5F5F566" }}>
          {/* Date Selector */}
          <div className="calendar-strip">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="custom-heading-use">
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
                      className="position-absolute mt-2 z-3 bg-white border rounded shadow h-100"
                      style={{ top: "100%", left: "0", minWidth: "100%" }}
                    >
                      <DatePicker
                        selected={startDate}
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
                        inline
                        maxDate={maxSelectableDate}
                        minDate={new Date()}
                        dropdownMode="select"
                        calendarClassName="custom-calendar w-100 shadow-sm"
                      />
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
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex justify-content-center p-0 mb-4 align-items-center rounded-pill"
                style={{ backgroundColor: "#f3f3f5", width: "30px", height: "58px" }}
              >
                <span
                  className="text-muted"
                  style={{ transform: "rotate(270deg)", fontSize: "14px", fontWeight: "500" }}
                >
                  {getCurrentMonth(selectedDate)}
                </span>
              </div>
              <div
                ref={scrollRef}
                className="d-flex gap-1 overflow-auto"
                style={{
                  scrollBehavior: "smooth",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                  overflowX: "scroll",
                }}
              >
                {dates?.map((d, i) => {
                  const formatDate = (date) => {
                    return date.toISOString().split("T")[0];
                  };
                  const isSelected =
                    formatDate(new Date(selectedDate?.fullDate)) === d.fullDate;
                  return (
                    <button
                      key={i}
                      ref={(el) => (dateRefs.current[d.fullDate] = el)}
                      className={`calendar-day-btn mb-3 me-1 ${isSelected ? "text-white" : "bg-white"}`}
                      style={{
                        backgroundColor: isSelected ? "#374151" : "#FFFFFF",
                        boxShadow: isSelected ? "0px 4px 4px 0px #00000040" : "",
                        borderRadius: "12px",
                        color: isSelected ? "#FFFFFF" : "#374151",
                      }}
                      onClick={() => {
                        setSelectedDate({ fullDate: d?.fullDate, day: d?.day });
                        setStartDate(new Date(d.fullDate));
                        dispatch(
                          getUserSlotBooking({
                            day: d?.day,
                            date: d?.fullDate,
                            register_club_id:
                              localStorage.getItem("register_club_id") || "",
                          })
                        );
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.border = "1px solid #3DBE64";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.border = "1px solid #4949491A";
                      }}
                    >
                      <div className="text-center">
                        <div className="date-center-date">{d.date}</div>
                        <div className="date-center-day">{dayShortMap[d.day]}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <hr />
            <div
              className="d-flex flex-column gap-3 overflow-slot mt-md-4"
              style={{
                height: "400px",
                overflowY: slotData?.data?.length > 3 ? "scroll" : "hidden",
                overflowX: "hidden",
              }}
            >
              {slotData?.data?.length > 0 ? (
                slotLoading ? (
                  <DataLoading height={"50vh"} />
                ) : (
                  <>
                    {slotData?.data?.map((court) => {
                      const filteredSlots = court?.slots?.filter((slot) =>
                        showUnavailable
                          ? slot.status === "booked" ||
                          slot.availabilityStatus !== "available" ||
                          isPastTime(slot.time)
                          : slot.availabilityStatus === "available" &&
                          slot.status !== "booked" &&
                          !isPastTime(slot.time)
                      );

                      return (
                        <div
                          className={`mb-3 row ps-2 pe-2 ${!court?.slots && !showUnavailable ? 'border-bottom' : ""} `}
                          key={court._id}
                        >
                          {filteredSlots?.length > 0 ? (
                            <>
                              <div className="p-2 rounded">
                                <div className="court-data d-flex gap-2">
                                  <h5 className="all-matches mb-0">
                                    {court?.courtName}
                                  </h5>
                                  <p className="court-para text-muted">
                                    {court?.register_club_id?.courtType}
                                  </p>
                                </div>
                              </div>

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
                                  isPastTime(slot.time);

                                return (
                                  <div className="col-md-2 col-3  p-lg-0 me-2 me-lg-0" key={i}>
                                    <button
                                      className="btn rounded-pill slot-time-btn text-center me-1 ms-1 mb-3"
                                      onClick={() => toggleTime(slot, court._id)}
                                      disabled={isDisabled}
                                      style={{
                                        backgroundColor:
                                          slot.status === "booked" ||
                                            isPastTime(slot.time)
                                            ? "#c9cfcfff"
                                            : isSelected
                                              ? "#374151"
                                              : slot.availabilityStatus !== "available"
                                                ? "#c9cfcfff"
                                                : "#FAFBFF",
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
                                        border: "2px solid #0f0f0f1a",
                                        transition: "border-color 0.2s ease",
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
                                            "2px solid #0f0f0f1a";
                                        }
                                      }}
                                    >
                                      {formatTimeForDisplay(slot?.time)}
                                    </button>
                                  </div>
                                );
                              })}
                            </>
                          ) : null}
                        </div>
                      );
                    })}

                    {slotData?.data?.every(
                      (court) =>
                        !court?.slots?.some((slot) =>
                          showUnavailable
                            ? slot.status === "booked" ||
                            slot.availabilityStatus !== "available" ||
                            isPastTime(slot.time)
                            : slot.availabilityStatus === "available" &&
                            slot.status !== "booked" &&
                            !isPastTime(slot.time)
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
        {/* RIGHT PANEL */}
        <Col md={5}>
          <div
            style={{
              backgroundColor: "#f5f7ff",
              border: "none",
              borderRadius: "12px",
              maxWidth: "100%",
            }}
          >
            <Card
              style={{
                backgroundColor: "#f5f7ff",
                border: "none",
                borderRadius: "12px",
                maxWidth: "100%",
                height: "620px",
              }}
            >
              {/* Progress Bar */}
              <div className="d-flex gap-2 mb-4 pt-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className="step-bar"
                    style={{
                      flex: 1,
                      height: "8px",
                      borderRadius: "0px",
                      backgroundColor: index <= currentStep ? "#1d4ed8" : "#c7d2fe",
                    }}
                  ></div>
                ))}
              </div>

              <div className="p-4">
                {/* Question */}
                <h6 className="mb-4 step-heading">{steps[currentStep].question}</h6>

                {/* Options */}
                <Form style={{ height: "350px", overflowY: "auto" }}>
                  {steps[currentStep].options?.map((option, i) => (
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
                  ))}
                  {slotError && (
                    <div
                      className="text-danger text-start w-100 position-absolute"
                      style={{
                        fontSize: "16px",
                        marginBottom: "10px",
                        fontFamily: "Poppins",
                        fontWeight: "600",
                      }}
                    >
                      <p>{slotError}</p>
                    </div>
                  )}
                </Form>
              </div>
              <div className="d-flex justify-content-end align-items-center p-3">
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
                  disabled={!selectedLevel}
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
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateMatches;