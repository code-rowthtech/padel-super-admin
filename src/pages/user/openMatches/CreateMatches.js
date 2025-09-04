import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button, Card, Form, ProgressBar, FormCheck } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaShoppingCart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import { getUserSlot } from '../../../redux/user/slot/thunk';
import { ButtonLoading, DataLoading } from '../../../helpers/loading/Loaders';
import 'react-datepicker/dist/react-datepicker.css';
import { formatTime } from '../../../helpers/Formatting';
import Avatar from '@mui/material/Avatar';

const CreateMatches = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const dateRefs = useRef({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const store = useSelector((state) => state);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCourts, setSelectedCourts] = useState([]); // मल्टीपल कोर्ट्स के लिए
  const [selectedDate, setSelectedDate] = useState({
    fullDate: new Date().toISOString().split("T")[0],
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
  });
  const [selectedLevel, setSelectedLevel] = useState("");
  const [skillDetails, setSkillDetails] = useState([]);
  const [currentCourtId, setCurrentCourtId] = useState(null); // वर्तमान में सेलेक्टेड कोर्ट
  const { slotData } = useSelector((state) => state?.userSlot);
  const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
  const userMatches = store?.userMatches;
  const [showUnavailableOnly, setShowUnavailableOnly] = useState(false);

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

  const toggleTime = (slot) => {
    setSelectedCourts((prev) => {
      const updatedCourts = prev.map((court) => {
        if (court._id === currentCourtId) {
          const isSelected = court.times.some((t) => t._id === slot._id);
          const newTimes = isSelected
            ? court.times.filter((t) => t._id !== slot._id)
            : [
              ...court.times,
              { _id: slot._id, time: slot.time, amount: slot.amount || 1000 },
            ];
          return { ...court, times: newTimes };
        }
        return court;
      });
      return updatedCourts;
    });
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
        getUserSlot({
          register_club_id: savedClubId,
          day: selectedDate.day,
          date: selectedDate.fullDate,
          courtId: currentCourtId || '',
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
      question: 'On the following scale, where would you place yourself?',
      options: ['Beginner', 'Intermediate', 'Advanced', 'Professional'],
    },
    {
      question: 'Select the racket sport you have played before?',
      options: ['Tennis', 'Badminton', 'Squash', 'Others'],
    },
    {
      question: 'How old are you?',
      options: ['Between 18 and 30 years', 'Between 31 and 40 years', 'Between 41 and 50 years', 'Over 50'],
    },
    {
      question: 'On the volley?',
      options: [
        'I hardly get to the net',
        "I don't feel safe at the net, I make too many mistakes",
        'I can volley forehand and backhand with some difficulties',
        'I have good positioning at the net and I volley confidently',
        'I don\'t know',
      ],
    },
    {
      question: 'On the rebounds...',
      options: [
        'I don\'t know how to read the rebounds, I hit before it rebounds',
        'I try, with difficulty, to hit the rebounds on the back wall',
        'I return rebounds on the back wall, it is difficult for me to return the double wall ones',
        'I return double-wall rebounds and reach for quick rebounds',
        'I perform powerful wall descent shots with forehand and backhand',
        'I don\'t know',
      ],
    },
  ];

  const handleNext = () => {
    if (selectedLevel && currentStep < steps.length - 1) {
      setSkillDetails((prev) => {
        const newDetails = [...prev];
        newDetails[currentStep] = selectedLevel;
        return newDetails;
      });
      setCurrentStep(currentStep + 1);
      setSelectedLevel('');
    } else if (currentStep === steps.length - 1 && selectedLevel) {
      const finalSkillDetails = [...skillDetails];
      finalSkillDetails[currentStep] = selectedLevel;

      navigate('/match-payment', {
        state: { slotData, finalSkillDetails, selectedDate, selectedCourts },
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedLevel(skillDetails[currentStep - 1] || '');
    }
  };

  return (
    <Container className="p-4 mb-5" style={{ minHeight: '100vh' }}>
      <Row>
        {/* LEFT PANEL */}
        <Col md={7} className="p-3" style={{ backgroundColor: "#F5F5F566" }}>
          {/* Date Selector */}
          <div className="calendar-strip">
            <div className="mb-3" style={{ fontSize: "20px", fontWeight: "600", fontFamily: "Poppins" }}>
              Select Date
              <div className="position-relative d-inline-block" ref={wrapperRef}>
                <span
                  className="rounded p-1 ms-2 shadow bg-white"
                  style={{ cursor: "pointer", width: "26px", height: "26px" }}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <i className="bi bi-calendar2-week" style={{ width: "14px", height: "16px" }}></i>
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
                        const day = date.toLocaleDateString("en-US", { weekday: "long" });
                        setSelectedDate({ fullDate: formattedDate, day: day });
                        setSelectedCourts((prev) =>
                          prev.map((court) => ({ ...court, times: [] }))
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
            <div className="d-flex align-items-center gap-2 mb-3">
              <button className="btn btn-light p-0" onClick={() => scroll("left")}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <div
                ref={scrollRef}
                className="d-flex gap-2 overflow-auto no-scrollbar"
                style={{
                  scrollBehavior: "smooth",
                  whiteSpace: "nowrap",
                  maxWidth: "650px",
                }}
              >
                {dates?.map((d, i) => {
                  const isSelected = formatDate(new Date(selectedDate?.fullDate)) === d.fullDate;
                  return (
                    <button
                      ref={(el) => (dateRefs.current[d.fullDate] = el)}
                      key={i}
                      className={`calendar-day-btn rounded border ${isSelected ? "text-white" : "bg-light text-dark"}`}
                      style={{
                        backgroundColor: isSelected ? "#374151" : undefined,
                        border: "none",
                        minWidth: "85px",
                      }}
                      onClick={() => {
                        setSelectedDate({ fullDate: d?.fullDate, day: d?.day });
                        setStartDate(new Date(d.fullDate));
                        setSelectedCourts((prev) =>
                          prev.map((court) => ({ ...court, times: [] }))
                        );
                      }}
                    >
                      <div className="text-center">
                        <div style={{ fontSize: "14px", fontWeight: "400", fontFamily: "Poppins" }}>{dayShortMap[d.day]}</div>
                        <div style={{ fontSize: "26px", fontWeight: "500", fontFamily: "Poppins" }}>{d.date}</div>
                        <div style={{ fontSize: "14px", fontWeight: "400", fontFamily: "Poppins" }}>{d.month}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button className="btn btn-light p-0" onClick={() => scroll("right")}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2">
            <p className="mb-0" style={{ fontSize: "20px", fontWeight: 600 }}>
              Available Slots for {selectedCourts.find((c) => c._id === currentCourtId)?.courtName || "Selected Court"}
            </p>
            <FormCheck
              type="switch"
              id="show-unavailable"
              label="Show Unavailable Only"
              checked={showUnavailableOnly}
              onChange={(e) => setShowUnavailableOnly(e.target.checked)}
              style={{ marginBottom: 0 }}
            />
          </div>
          {slotLoading ? (
            <DataLoading height={"30vh"} />
          ) : (
            <>
              <div className="d-flex flex-wrap gap-2 mb-4" key={currentCourtId}>
                {slotData?.data?.length > 0 && slotData?.data?.[0]?.slot?.[0]?.slotTimes?.length > 0 ? (
                  (() => {
                    const selectedDateObj = new Date(selectedDate?.fullDate);
                    const now = new Date();
                    const isToday = selectedDateObj.toDateString() === now.toDateString();

                    const filteredSlots = slotData?.data?.[0]?.slot?.[0]?.slotTimes.filter((slot) => {
                      const [hourString, period] = slot?.time?.toLowerCase().split(" ");
                      let hour = parseInt(hourString);
                      if (period === "pm" && hour !== 12) hour += 12;
                      if (period === "am" && hour === 12) hour = 0;
                      const slotDate = new Date(selectedDateObj);
                      slotDate.setHours(hour, 0, 0, 0);
                      const isPast = isToday && slotDate.getTime() < now.getTime();
                      const isBooked = slot?.status === "booked";
                      return showUnavailableOnly ? (isPast || isBooked) : true;
                    });

                    return filteredSlots.length > 0 ? (
                      filteredSlots.map((slot, i) => {
                        const [hourString, period] = slot?.time?.toLowerCase().split(" ");
                        let hour = parseInt(hourString);
                        if (period === "pm" && hour !== 12) hour += 12;
                        if (period === "am" && hour === 12) hour = 0;
                        const slotDate = new Date(selectedDateObj);
                        slotDate.setHours(hour, 0, 0, 0);
                        const isPast = isToday && slotDate.getTime() < now.getTime();
                        const isBooked = slot?.status === "booked";
                        const currentCourt = selectedCourts.find((c) => c._id === currentCourtId);
                        const isSelected = currentCourt?.times.some((t) => t._id === slot._id);
                        const hasAmount = slot?.amount && !isNaN(Number(slot.amount)) && Number(slot.amount) > 0;
                        const currentSlots = currentCourt ? currentCourt.times.length : 0;
                        const isLimitReached = currentSlots >= 15 && !isSelected;

                        return (
                          <button
                            key={i}
                            className={`btn border-0 rounded-pill px-4 ${isBooked ? " bg-secondary-subtle" : isPast ? "bg-secondary-subtle" : ""}`}
                            onClick={() => !isPast && !isBooked && hasAmount && !isLimitReached && toggleTime(slot)}
                            style={{
                              backgroundColor: isSelected
                                ? "#374151"
                                : isBooked
                                  ? "#888888"
                                  : isLimitReached
                                    ? "#fff7df"
                                    : !hasAmount
                                      ? "#fff7df"
                                      : isPast
                                        ? "#CBD6FF1A"
                                        : "#FAFBFF",
                              border: "1px solid #CBD6FF1A",
                              color: isSelected
                                ? "white"
                                : isPast || hasAmount || isBooked
                                  ? "#888888"
                                  : "#000000",
                              cursor: isPast || isBooked || !hasAmount || isLimitReached ? "not-allowed" : "pointer",
                              opacity: isPast || isBooked || !hasAmount || isLimitReached ? 0.6 : 1,
                            }}
                          >
                            {formatTime(slot?.time)}
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-center">
                        <p className="text-danger text-center fw-medium">No slots available for this date.</p>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center">
                    <p className="text-danger text-center fw-medium">No slots available for this date.</p>
                  </div>
                )}
              </div>
              <div>
                <div className="d-flex justify-content-between align-items-center py-2">
                  <p className="mb-0" style={{ fontSize: "20px", fontWeight: 600 }}>
                    Available Courts
                  </p>
                  <div>
                    <a
                      href="#"
                      className="text-decoration-none d-inline-flex align-items-center"
                      style={{ color: "#1F41BB" }}
                      data-bs-toggle="modal"
                      data-bs-target="#courtLayoutModal"
                    >
                      View Court Layout <i className="bi bi-arrow-right fs-5 ms-2"></i>
                    </a>
                    <div
                      className="modal fade"
                      id="courtLayoutModal"
                      tabIndex="-1"
                      aria-labelledby="courtLayoutModalLabel"
                      aria-hidden="true"
                    >
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 p-3">
                          <div className="modal-header border-0 p-0">
                            <div className="w-100 d-flex align-items-center justify-content-center position-relative">
                              <h5 className="modal-title m-0" id="courtLayoutModalLabel">View Court Layout</h5>
                              <button
                                type="button"
                                className="btn-close position-absolute end-0 me-2"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              ></button>
                            </div>
                          </div>
                          <div className="modal-body p-0 mt-4">
                            <div className="row g-2">
                              {Array.isArray(slotData?.data[0]?.courts) &&
                                slotData?.data[0]?.courts?.map((court, index) => (
                                  <div className="col-6" key={court._id || index}>
                                    <div
                                      className="border d-flex align-items-center justify-content-center"
                                      style={{ height: "80px", borderWidth: "2px" }}
                                    >
                                      {court?.courtName}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-3">
                  {slotData?.data?.length > 0 &&
                    slotData?.data[0]?.slot?.[0]?.slotTimes?.length > 0 ? (
                    slotData.data[0]?.courts?.map((court) => (
                      <div
                        key={court?._id}
                        onClick={() => handleCourtSelect(court)}
                        style={{ cursor: "pointer" }}
                        className={`d-flex p-4 justify-content-between align-items-center border-bottom py-2 mb-1 px-2 ${court._id === currentCourtId ? "bg-success-subtle rounded" : ""
                          }`}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <Avatar src='https://media.istockphoto.com/id/1473484607/photo/young-people-playing-padel-tennis.jpg?s=612x612&w=0&k=20&c=UBIT0LfJ0WDuYlOTwhH8LWVBMPo2qFAA9w8msCia0G0=' />
                          <div>
                            <p className="mb-1 fw-semibold">{court?.courtName}</p>
                            <small className="text-muted">{court?.type}</small>
                          </div>
                        </div>
                        <p className="mb-0 fw-semibold">₹ 1000</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted">No courts available</div>
                  )}
                </div>
              </div>
            </>
          )}
        </Col>
        {/* RIGHT PANEL */}
        <Col md={5}>
          <div
            style={{
              backgroundColor: "#f5f7ff",
              border: "none",
              borderRadius: "12px",
              maxWidth: "100%",
              height: "820px",
            }}
          >
            <Card
              style={{
                backgroundColor: "#f5f7ff",
                border: "none",
                borderRadius: "12px",
                maxWidth: "100%",
                height: "820px",
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
                <h6 className="mb-4 fw-semibold" style={{ color: "#374151", fontSize: "24px" }}>
                  {steps[currentStep].question}
                </h6>

                {/* Options */}
                <Form style={{ height: "450px" }}>
                  {steps[currentStep].options?.map((option, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedLevel(option)}
                      className={`d-flex align-items-center justify-content-between mb-3 px-3 py-2 rounded shadow-sm border transition-all`}
                      style={{
                        backgroundColor: selectedLevel === option ? "#eef2ff" : "#fff",
                        borderColor: selectedLevel === option ? "#4f46e5" : "#e5e7eb",
                        cursor: "pointer",
                        boxShadow:"none"
                      }}
                    >
                      <Form.Check
                        type="radio"
                        label={option}
                        name={`step-${currentStep}`}
                        id={`option-${currentStep}-${i}`}
                        value={option}
                        checked={selectedLevel === option}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="fw-semibold"
                        style={{boxShadow:"none"}}
                      />
                    </div>
                  ))}
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