import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button, Card, Form, ProgressBar } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaShoppingCart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import { getUserSlot } from '../../../redux/user/slot/thunk';
import { createMatches } from '../../../redux/user/matches/thunk';
import { getUserFromSession } from '../../../helpers/api/apiCore';
import { ButtonLoading, DataLoading } from '../../../helpers/loading/Loaders';
import 'react-datepicker/dist/react-datepicker.css';

const CreateMatches = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const dateRefs = useRef({});
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const user = getUserFromSession();
  const store = useSelector((state) => state)
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    fullDate: new Date().toISOString().split("T")[0],
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
  });
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [skillDetails, setSkillDetails] = useState([]);
  const { slotData } = useSelector((state) => state?.userSlot);
  const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
  const userMatches = store?.userMatches
  console.log({ userMatches });
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
  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -120 : 120,
        behavior: "smooth",
      });
    }
  };

  const toggleTime = (time) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter((t) => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time]);
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
    if (savedClubId && selectedDate?.fullDate && selectedDate?.day) {
      dispatch(
        getUserSlot({
          register_club_id: savedClubId,
          day: selectedDate.day,
        })
      );
    }
  }, [savedClubId, selectedDate?.fullDate, selectedDate?.day, dispatch]);

  const handleCourtSelect = (court) => {
    const timeOnly = selectedTimes?.map(item => ({
      _id: item?._id,
      time: item?.time,
      amount: item?.amount || 100,
    }));

    const newCourt = {
      ...court,
      date: selectedDate?.fullDate,
      time: timeOnly,
    };

    setSelectedCourts(prev =>
      prev.some(c => c?._id === court?._id) ? [] : [newCourt]
    );
  };

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  };

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
      setSkillDetails(prev => {
        const newDetails = [...prev];
        newDetails[currentStep] = selectedLevel;
        return newDetails;
      });
      setCurrentStep(currentStep + 1);
      setSelectedLevel('');
    } else if (currentStep === steps.length - 1 && selectedLevel) {
      // Handle submit
      const finalSkillDetails = [...skillDetails];
      finalSkillDetails[currentStep] = selectedLevel;

      const formattedData = {
        slot: selectedCourts?.map(court => ({
          slotId: court?._id || "689d6e4938589ba8294ccebe",
          courtName: court?.courtName || "Court 1",
          bookingDate: new Date(selectedDate.fullDate).toISOString(),
          businessHours: [{
            time: "6:00 AM To 11:00 PM",
            day: selectedDate.day,
          }],
          slotTimes: selectedTimes.map(time => ({
            time: time.time,
            amount: time.amount || 100,
          })),
        })),
        clubId: savedClubId || "688ca6c8e8f0b4d358015af5",
        matchDate: new Date(selectedDate.fullDate).toISOString(),
        matchTime: selectedTimes.map(time => time.time).join(','),
        skillLevel: finalSkillDetails[0]?.toLowerCase() || "beginner",
        matchStatus: "open",
        players: user?._id ? [user?._id] : ["689aeef5f29d437107e24470"],
      };

      console.log(JSON.stringify(formattedData, null, 2));
      dispatch(createMatches(formattedData)).unwrap().then(() => {
        setSelectedCourts([]);
        setSelectedDate([]);
        setSelectedTimes([])
        setSelectedLevel([])
        navigate('/view-match')
        // dispatch(getReviewClub(clubData._id))

      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedLevel(skillDetails[currentStep - 1] || '');
    }
  };

  useEffect(() => {
    if (slotData?.data?.length > 0 && slotData.data[0]?.courts?.length > 0) {
      const firstCourt = slotData.data[0].courts[0];
      const timeOnly = selectedTimes?.map(item => ({
        _id: item?._id,
        time: item?.time,
        amount: item?.amount || 100,
      }));
      const newCourt = {
        ...firstCourt,
        date: selectedDate?.fullDate,
        time: timeOnly,
      };
      if (!selectedCourts.some(c => c._id === firstCourt._id)) {
        setSelectedCourts([newCourt]);
      }
    }
  }, [slotData, selectedDate?.fullDate, selectedTimes]);

  return (
    <Container className="p-4" style={{ minHeight: '100vh' }}>
      <Row>
        {/* LEFT PANEL */}
        <Col md={7} className="p-3" style={{ backgroundColor: "#F5F5F566" }}>
          {/* Date Selector */}
          <div className="calendar-strip">
            <div className="mb-3 ps-4" style={{ fontSize: "20px", fontWeight: "600" }}>
              Select Date
              <div className="position-relative d-inline-block" ref={wrapperRef}>
                <span
                  className="rounded-circle p-2 ms-2 shadow-sm bg-light"
                  style={{ cursor: "pointer" }}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <i className="bi bi-calendar2-week" style={{ fontSize: "18px" }}></i>
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
                        setSelectedDate({ fullDate: formattedDate, day });
                        setSelectedTimes([]);
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
                className="d-flex gap-2 w-100 overflow-auto no-scrollbar"
                style={{
                  scrollBehavior: "smooth",
                  whiteSpace: "nowrap",
                  maxWidth: "820px",
                }}
              >
                {dates?.map((d, i) => {
                  const isSelected = selectedDate?.fullDate ? formatDate(new Date(selectedDate.fullDate)) === d.fullDate : false;
                  return (
                    <button
                      ref={(el) => (dateRefs.current[d.fullDate] = el)}
                      key={i}
                      className={`calendar-day-btn px-3 py-2 rounded border ${isSelected ? "text-white" : "bg-light text-dark"}`}
                      style={{
                        backgroundColor: isSelected ? "#374151" : undefined,
                        border: "none",
                      }}
                      onClick={() => {
                        setSelectedDate({ fullDate: d.fullDate, day: d.day });
                        setStartDate(new Date(d.fullDate));
                        setSelectedTimes([]);
                      }}
                    >
                      <div className="text-center">
                        <div style={{ fontSize: "14px", fontWeight: "400" }}>{dayShortMap[d.day]}</div>
                        <div style={{ fontSize: "26px", fontWeight: "500" }}>{d.date}</div>
                        <div style={{ fontSize: "14px", fontWeight: "400" }}>{d.month}</div>
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
          {/* Time Selector */}
          <div className="d-flex justify-content-between align-items-center py-2">
            <p className="mb-0" style={{ fontSize: "20px", fontWeight: 600 }}>
              Available Slots
            </p>
          </div>
          {slotLoading ? (
            <DataLoading height={"30vh"} />
          ) : (
            <>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {slotData?.data?.length > 0 &&
                  slotData?.data?.[0]?.slot?.[0]?.slotTimes?.length > 0 ? (
                  slotData?.data?.[0]?.slot?.[0]?.slotTimes?.map((slot, i) => {
                    const selectedDateObj = new Date(selectedDate?.fullDate);
                    const slotDate = new Date(selectedDateObj);
                    const [hourString, period] = slot?.time?.toLowerCase().split(" ");
                    let hour = parseInt(hourString);
                    if (period === "pm" && hour !== 12) hour += 12;
                    if (period === "am" && hour === 12) hour = 0;
                    slotDate.setHours(hour, 0, 0, 0);
                    const now = new Date();
                    const isToday = selectedDateObj.toDateString() === now.toDateString();
                    const isPast = isToday && slotDate.getTime() < now.getTime();
                    const isSelected = selectedTimes.some(t => t._id === slot._id);
                    return (
                      <button
                        key={i}
                        className="btn border-0 rounded-pill px-4"
                        onClick={() => !isPast && toggleTime(slot)}
                        disabled={isPast}
                        style={{
                          backgroundColor: isSelected ? "#374151" : "#CBD6FF1A",
                          color: isSelected ? "white" : isPast ? "#888888" : "#000000",
                          cursor: isPast ? "not-allowed" : "pointer",
                          opacity: isPast ? 0.6 : 1,
                        }}
                      >
                        {slot?.time}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-end">
                    <p className="text-danger text-center fw-medium">No slots available for this date.</p>
                  </div>
                )}
              </div>
              <div>
                <div className="d-flex justify-content-between align-items-center py-2">
                  <p className="mb-0" style={{ fontSize: "20px", fontWeight: 600 }}>
                    Available Court
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
                                      className="border rounded-3 d-flex align-items-center justify-content-center"
                                      style={{ height: "80px" }}
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
                        className={`d-flex p-4 justify-content-between align-items-center border-bottom py-3 mb-1 px-2 ${selectedCourts.some(selCourt => selCourt._id === court._id)
                          ? "bg-success-subtle rounded"
                          : ""
                          }`}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <img src="https://picsum.photos/60" alt="court" className="rounded" />
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
          <ProgressBar
            now={(currentStep / (steps.length - 1)) * 100}
            className="mb-4"
            style={{ height: '6px', backgroundColor: '#e0e7ff', color: "#1F41BB" }}
            variant="info"
          />
          <Card className="p-4" style={{ backgroundColor: '#f9faff', border: 'none', borderRadius: '8px' }}>
            <h5 className="mb-4" style={{ color: '#4b5563' }}>
              {steps[currentStep].question}
            </h5>
            <Form>
              {steps[currentStep].options.map((option, i) => (
                <Form.Check
                  key={i}
                  type="radio"
                  label={option}
                  name="level"
                  id={`level-${currentStep}-${i}`}
                  value={option}
                  checked={selectedLevel === option}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="mb-3 ps-5 shadow-sm border rounded px-3 py-2"
                  style={{
                    backgroundColor: selectedLevel === option ? '#e0f2fe' : '#FFFFFF',
                    borderColor: '#d1d5db',
                    borderRadius: '4px',
                  }}
                />
              ))}
              <div className="d-flex justify-content-between align-items-center">
                {currentStep > 0 && (
                  <Button
                    className="mt-3 btn rounded-pill px-4"
                    style={{ backgroundColor: '#374151', border: 'none', borderRadius: '4px', color: '#ffffff' }}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                )}
                <Button
                  className="mt-3 btn rounded-pill px-4"
                  style={{
                    backgroundColor: currentStep === steps.length - 1 ? '#3DBE64' : '#10b981',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                  disabled={!selectedLevel || selectedTimes.length === 0 || selectedCourts.length === 0}
                  onClick={handleNext}
                >
                  {currentStep === steps.length - 1 ? userMatches?.matchesLoading ? <ButtonLoading /> : 'Submit' : 'Next'}
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateMatches;