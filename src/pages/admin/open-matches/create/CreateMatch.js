import React, { useRef, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getOwnerRegisteredClub,
  getActiveCourts,
  manualBookingByOwner,
} from "../../../../redux/thunks";
import { Usersignup } from "../../../../redux/user/auth/authThunk";
import { useDispatch, useSelector } from "react-redux";
import {
  ButtonLoading,
  DataLoading,
  Loading,
} from "../../../../helpers/loading/Loaders";
import { showInfo } from "../../../../helpers/Toast";
import { getOwnerFromSession } from "../../../../helpers/api/apiCore";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { formatSlotTime } from "../../../../helpers/Formatting";

const CreateMatch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const Owner = getOwnerFromSession();
  const ownerId = Owner?.generatedBy ? Owner?.generatedBy : Owner?._id;
  const {
    manualBookingLoading,
    ownerClubLoading,
    ownerClubData,
    activeCourtsLoading,
    activeCourtsData,
  } = useSelector((state) => state.manualBooking);
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [matchDetails, setMatchDetails] = useState({
    skillLevel: "",
    racketSport: "",
    padelTraining: "",
    ageGroup: "",
    volleySkill: "",
    reboundSkill: "",
    players: [],
  });
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedDay, setSelectedDay] = useState("");
  const scrollRef = useRef(null);
  const selectedButtonRef = useRef(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "" });
  const [addingPosition, setAddingPosition] = useState(null);
  const [view, setView] = useState("selection");

  const steps = [
    {
      question: "On the following scale, where would you place yourself?",
      options: ["Beginner", "Intermediate", "Advanced", "Professional"],
      key: "skillLevel",
    },
    {
      question: "Select the racket sport you have played before?",
      options: ["Tennis", "Badminton", "Squash", "Others"],
      key: "racketSport",
    },
    {
      question: "Received or Receiving Padel Training?",
      options: ["No", "InPast", "Currently"],
      key: "padelTraining",
    },
    {
      question: "How old are you?",
      options: [
        "Between 18 and 30 years",
        "Between 31 and 40 years",
        "Between 41 and 50 years",
        "Over 50",
      ],
      key: "ageGroup",
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
      key: "volleySkill",
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
      key: "reboundSkill",
    },
  ];

  // Close datepicker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate dates for selection
  const today = new Date();
  const dates = Array.from({ length: 41 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      fullDate: date.toISOString().split("T")[0],
    };
  });

  const dayFullNames = {
    Sun: "Sunday",
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
  };

  useEffect(() => {
    setSelectedDay(dayFullNames[dates[0]?.day]);
  }, []);

  // Scroll handler for date selection
  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -120 : 120,
        behavior: "smooth",
      });
    }
  };

  // Fetch owner registered club
  useEffect(() => {
    dispatch(getOwnerRegisteredClub({ ownerId })).unwrap();
  }, [dispatch, ownerId]);

  // Fetch active courts
  useEffect(() => {
    if (ownerClubData?.[0]?._id) {
      dispatch(
        getActiveCourts({
          register_club_id: ownerClubData?.[0]?._id,
          day: selectedDay,
          date: selectedDate,
        })
      );
    }
  }, [dispatch, ownerClubData, selectedDay, selectedDate]);

  // Auto-select first court
  useEffect(() => {
    const courts = activeCourtsData?.[0]?.courts;
    if (courts?.length > 0 && selectedCourts.length === 0) {
      setSelectedCourts([courts[0]._id]);
    }
  }, [activeCourtsData, selectedCourts]);

  // Scroll to selected date
  useEffect(() => {
    if (selectedButtonRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const selected = selectedButtonRef.current;
      const offsetLeft = selected.offsetLeft;
      const scrollWidth = container.clientWidth;

      container.scrollTo({
        left: offsetLeft - scrollWidth / 1 + selected.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [selectedDate]);

  const maxSelectableDate = new Date();
  maxSelectableDate.setDate(maxSelectableDate.getDate() + 40);

  const handleCourtSelect = (courtId) => {
    setSelectedCourts(courtId ? [courtId] : []);
  };

  const toggleTime = (slot) => {
    if (!selectedCourts[0]) {
      showInfo("Please select a court first.");
      return;
    }

    const courtId = selectedCourts[0];
    const courtSlots = selectedSlots[courtId] || [];
    const exists = courtSlots.some((t) => t._id === slot?._id);

    if (!exists) {
      const totalSlots = Object.values(selectedSlots).flat().length;
      if (totalSlots >= 15) {
        showInfo("Maximum 15 slots can be selected at a time.");
        return;
      }
    }

    let newCourtSlots;
    if (exists) {
      newCourtSlots = courtSlots.filter((t) => t._id !== slot?._id);
    } else {
      newCourtSlots = [...courtSlots, slot];
    }

    let newSelectedSlots;
    if (newCourtSlots.length === 0) {
      const { [courtId]: _, ...rest } = selectedSlots;
      newSelectedSlots = rest;
    } else {
      newSelectedSlots = { ...selectedSlots, [courtId]: newCourtSlots };
    }

    setSelectedSlots(newSelectedSlots);
  };

  const handleNext = () => {
    if (!selectedLevel) {
      showInfo("Please select an option.");
      return;
    }

    setMatchDetails((prev) => ({
      ...prev,
      [steps[currentStep].key]: selectedLevel,
    }));

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedLevel("");
    } else {
      setView("summary");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedLevel(matchDetails[steps[currentStep - 1].key] || "");
    }
  };

  const handleShowModal = (position) => {
    setAddingPosition(position);
    setShowUserModal(true);
  };

  const handleAddUser = async () => {
    const currentPlayersCount = matchDetails.players.filter((p) => p).length;
    if (currentPlayersCount >= 4) {
      showInfo("Maximum 4 players can be added.");
      return;
    }
    if (!newUser.name || !newUser.email || !newUser.phone) {
      showInfo("Please enter name, email, and phone number.");
      return;
    }

    try {
      const response = await dispatch(
        Usersignup({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
        })
      ).unwrap();
      const newPlayer = { userId: { ...newUser, _id: response._id } };
      const updatedPlayers = [...matchDetails.players];
      updatedPlayers[addingPosition] = newPlayer;
      setMatchDetails((prev) => ({ ...prev, players: updatedPlayers }));

      // Store in session storage
      sessionStorage.setItem(
        "matchPlayers",
        JSON.stringify(updatedPlayers.filter((p) => p))
      );

      setNewUser({ name: "", email: "", phone: "" });
      setShowUserModal(false);
      setAddingPosition(null);
    } catch (error) {
      showInfo("Failed to create user.");
    }
  };

  const renderPlayer = (player, index) => {
    if (!player) {
      return (
        <div className="text-center" key={index}>
          <button
            className="btn btn-outline-primary rounded-circle"
            style={{
              width: "100px",
              height: "100px",
              fontSize: "24px",
              borderColor: "#0D6EFD",
            }}
            onClick={() => handleShowModal(index)}
          >
            +
          </button>
          <div className="fw-semibold small mt-2 text-primary">Add Player</div>
        </div>
      );
    }

    const { userId } = player;
    const initial = userId.name.charAt(0).toUpperCase();

    return (
      <div className="text-center" key={index}>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "100px",
            height: "100px",
            backgroundColor: "#374151",
            color: "white",
            fontWeight: 600,
            fontSize: "20px",
          }}
        >
          {initial}
        </div>
        <div className="fw-semibold small mt-2">{userId.name}</div>
        <span
          className="badge rounded-pill"
          style={{ backgroundColor: "#D1FAE5", color: "#059669" }}
        >
          {matchDetails.skillLevel.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  const validateForm = () => {
    const requiredFields = [
      "skillLevel",
      "racketSport",
      "padelTraining",
      "ageGroup",
      "volleySkill",
      "reboundSkill",
    ];
    for (const field of requiredFields) {
      if (!matchDetails[field]) {
        showInfo(
          `Please select ${field.replace(/([A-Z])/g, " $1").toLowerCase()}.`
        );
        return false;
      }
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!validateForm()) return;

    const slotsPayload = [];
    let totalAmount = 0;
    const courts = activeCourtsData?.[0]?.courts || [];

    Object.entries(selectedSlots).forEach(([courtId, times]) => {
      const court = courts.find((c) => c._id === courtId);
      const slotData = court?.slot?.[0];
      const formattedBusinessHours =
        slotData?.businessHours?.map((bh) => ({
          time: bh.time,
          day: bh.day,
        })) || [];

      times.forEach((timeSlot) => {
        const slotAmount = timeSlot?.amount || 0;
        totalAmount += slotAmount;
        slotsPayload.push({
          slotId: timeSlot?._id,
          businessHours: formattedBusinessHours,
          slotTimes: [
            {
              time: timeSlot?.time,
              amount: slotAmount,
            },
          ],
          courtName: court?.courtName,
          courtId: court?._id,
          matchDate: new Date(selectedDate).toISOString(),
        });
      });
    });

    if (slotsPayload.length === 0) {
      showInfo("Please select at least one time slot for a court.");
      return;
    }

    try {
      const payload = {
        slot: slotsPayload,
        clubId: ownerClubData?.[0]?._id,
        ownerId: Owner?._id,
        skillLevel: matchDetails.skillLevel,
        playerDetails: [
          matchDetails.racketSport,
          matchDetails.padelTraining,
          matchDetails.ageGroup,
          matchDetails.volleySkill,
          matchDetails.reboundSkill,
        ],
        users: matchDetails.players.filter((p) => p).map((p) => p.userId),
      };
      await dispatch(manualBookingByOwner(payload)).unwrap();
      setSelectedSlots({});
      setSelectedCourts([]);
      setMatchDetails({
        skillLevel: "",
        racketSport: "",
        padelTraining: "",
        ageGroup: "",
        volleySkill: "",
        reboundSkill: "",
        players: [],
      });
      setCurrentStep(0);
      setSelectedLevel("");
      sessionStorage.removeItem("matchPlayers");
    } catch (error) {
      console.log("Booking failed:", error);
    }
  };

  const getSelectedCourtName = (courtId) => {
    const court = activeCourtsData?.[0]?.courts?.find((c) => c._id === courtId);
    return court?.courtName || "";
  };

  const calculateTotal = () => {
    let total = 0;
    Object.values(selectedSlots)
      .flat()
      .forEach((slot) => {
        total += slot?.amount || 0;
      });
    return total;
  };

  const handleRemoveSlot = (courtId, slotId) => {
    setSelectedSlots((prev) => {
      const courtSlots = prev[courtId] || [];
      const newCourtSlots = courtSlots.filter((s) => s._id !== slotId);
      if (newCourtSlots.length === 0) {
        const { [courtId]: _, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [courtId]: newCourtSlots };
      }
    });
  };

  const renderBookingSummary = (withDelete = false) => (
    <Card className="shadow-sm">
      <Card.Body>
        <h5 className="mb-3 text-dark">Booking Summary</h5>
        {Object.keys(selectedSlots).length === 0 ? (
          <p className="text-muted">No slots selected.</p>
        ) : (
          <>
            {Object.entries(selectedSlots).map(([courtId, slots]) => (
              <div key={courtId} className="mb-3">
                <p>
                  <strong>Court:</strong> {getSelectedCourtName(courtId)}{" "}
                  <span className="text-muted small">
                    | {format(new Date(selectedDate), "EEE, dd/MM/yyyy")}
                  </span>
                </p>
                <p>
                  <strong>Selected Slots:</strong>
                </p>
                <ListGroup className="mb-3">
                  {slots.map((slot, index) => (
                    <ListGroup.Item
                      key={index}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <span>
                        {slot.time} - Amount: ${slot.amount || 0}
                        {slot.status === "booked" && (
                          <span className="ms-2 text-danger">(Booked)</span>
                        )}
                      </span>
                      {withDelete && (
                        <FaTrash
                          className="text-danger cursor-pointer"
                          onClick={() => handleRemoveSlot(courtId, slot._id)}
                        />
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            ))}
            <p>
              <strong>Total Amount:</strong> ${calculateTotal()}
            </p>
          </>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <>
      {ownerClubLoading ? (
        <Loading />
      ) : (
        <Container fluid className="p-4 bg-light min-vh-100">
          <Row className="mb-4 align-items-center">
            <Col>
              <h4 className="font-weight-bold text-dark">Create Match</h4>
            </Col>
            <Col className="text-end">
              <Button
                variant="link"
                onClick={() => navigate("/admin/open-matches")}
                className="text-primary font-weight-bold"
              >
                <FaArrowLeft className="me-2" /> Back
              </Button>
            </Col>
          </Row>
          {view === "selection" ? (
            <Row>
              <Col md={7}>
                <Card className="shadow-sm mb-4">
                  <Card.Body>
                    <h5 className="mb-3 text-dark">Select Court</h5>
                    <div className="d-flex flex-wrap gap-2">
                      {activeCourtsData?.[0]?.courts?.map((court) => (
                        <Button
                          key={court._id}
                          variant={
                            selectedCourts.includes(court._id)
                              ? "dark"
                              : "light"
                          }
                          className="rounded-pill px-4 py-2"
                          onClick={() => handleCourtSelect(court._id)}
                        >
                          {court.courtName}
                        </Button>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
                <Card className="shadow-sm mb-4">
                  <Card.Body>
                    <h5 className="mb-3 text-dark">Select Date</h5>
                    <div className="position-relative d-inline-block me-2">
                      <Button
                        variant="light"
                        className="rounded-circle p-2"
                        onClick={() => setIsOpen(!isOpen)}
                      >
                        <i className="bi bi-calendar-week"></i>
                      </Button>
                      {isOpen && (
                        <div
                          className="position-absolute bg-white border rounded shadow p-2"
                          ref={wrapperRef}
                        >
                          <DatePicker
                            selected={startDate}
                            onChange={(date) => {
                              setStartDate(date);
                              const iso = date.toISOString().split("T")[0];
                              setSelectedDate(iso);
                              const dayName = date.toLocaleDateString("en-US", {
                                weekday: "short",
                              });
                              setSelectedDay(dayFullNames[dayName]);
                              setIsOpen(false);
                            }}
                            minDate={new Date()}
                            maxDate={maxSelectableDate}
                            inline
                          />
                        </div>
                      )}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Button variant="light" onClick={() => scroll("left")}>
                        <i className="bi bi-chevron-left"></i>
                      </Button>
                      <div
                        ref={scrollRef}
                        className="d-flex gap-2 overflow-auto flex-grow-1"
                        style={{ scrollbarWidth: "none" }}
                      >
                        {dates?.map((d, i) => (
                          <Button
                            key={i}
                            ref={
                              selectedDate === d.fullDate
                                ? selectedButtonRef
                                : null
                            }
                            variant={
                              selectedDate === d.fullDate ? "dark" : "light"
                            }
                            className="text-center px-3 py-2 rounded"
                            onClick={() => {
                              setSelectedDate(d.fullDate);
                              setSelectedDay(dayFullNames[d.day]);
                            }}
                          >
                            <div className="small">{d.day}</div>
                            <div className="h5 mb-0">{d.date}</div>
                            <div className="small">{d.month}</div>
                          </Button>
                        ))}
                      </div>
                      <Button variant="light" onClick={() => scroll("right")}>
                        <i className="bi bi-chevron-right"></i>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="text-dark">Available Slots (60m)</h5>
                      <Form.Check
                        type="switch"
                        label="Show Unavailable"
                        checked={showUnavailable}
                        onChange={(e) => setShowUnavailable(e.target.checked)}
                      />
                    </div>
                    {activeCourtsLoading ? (
                      <DataLoading height="10vh" />
                    ) : activeCourtsData?.[0]?.slot?.[0]?.slotTimes?.length ===
                      0 ? (
                      <div className="text-center text-danger">
                        No slots available
                      </div>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {activeCourtsData?.[0]?.slot?.[0]?.slotTimes
                          ?.map((slot) => {
                            const slotDate = new Date(selectedDate);
                            const [hourString, period] = slot.time
                              .toLowerCase()
                              .split(" ");
                            let hour = parseInt(hourString);
                            if (period === "pm" && hour !== 12) hour += 12;
                            if (period === "am" && hour === 12) hour = 0;
                            slotDate.setHours(hour, 0, 0, 0);

                            const now = new Date();
                            const isSameDay =
                              slotDate.toDateString() === now.toDateString();
                            const isPast =
                              isSameDay && slotDate.getTime() < now.getTime();
                            const isSelected = (
                              selectedSlots[selectedCourts[0]] || []
                            ).some((t) => t._id === slot._id);
                            const isBooked = slot.status === "booked";
                            const isAvailable =
                              slot.availabilityStatus === "available";
                            const hasAmount = slot.amount && slot.amount !== 0;

                            return {
                              slot,
                              isPast,
                              isSelected,
                              isBooked,
                              isAvailable,
                              hasAmount,
                            };
                          })
                          ?.filter(
                            ({ isPast, isBooked, isAvailable, hasAmount }) =>
                              showUnavailable ||
                              (isAvailable && hasAmount && !isBooked && !isPast)
                          )
                          ?.map(
                            (
                              {
                                slot,
                                isPast,
                                isSelected,
                                isBooked,
                                isAvailable,
                                hasAmount,
                              },
                              i
                            ) => {
                              let tooltipText = "";
                              if (!hasAmount)
                                tooltipText = "Amount not available";
                              else if (isBooked) tooltipText = "Booked";
                              else if (isPast)
                                tooltipText = "Cannot book past hours";
                              else if (!isAvailable)
                                tooltipText = "Unavailable";
                              else tooltipText = "Book Now";

                              const button = (
                                <Button
                                  variant={
                                    isSelected
                                      ? "dark"
                                      : isBooked
                                      ? "danger"
                                      : isPast
                                      ? "secondary"
                                      : !isAvailable || !hasAmount
                                      ? "warning"
                                      : "light"
                                  }
                                  className="rounded-pill px-3 py-1"
                                  onClick={() => toggleTime(slot)}
                                  disabled={
                                    isPast ||
                                    isBooked ||
                                    !hasAmount ||
                                    !isAvailable
                                  }
                                >
                                  {isBooked
                                    ? "Booked"
                                    : formatSlotTime(slot.time)}
                                </Button>
                              );

                              return isSelected || isBooked ? (
                                <div key={i}>{button}</div>
                              ) : (
                                <OverlayTrigger
                                  key={i}
                                  placement="top"
                                  overlay={<Tooltip>{tooltipText}</Tooltip>}
                                >
                                  {button}
                                </OverlayTrigger>
                              );
                            }
                          )}
                      </div>
                    )}
                  </Card.Body>
                </Card>
                <Row className="my-4">{renderBookingSummary()}</Row>
                <Button
                  variant="success"
                  size="lg"
                  className="w-100"
                  onClick={handleConfirm}
                  disabled={manualBookingLoading}
                >
                  {manualBookingLoading ? <ButtonLoading /> : "Confirm Booking"}
                </Button>
              </Col>
              <Col md={5}>
                <div
                  style={{
                    backgroundColor: "#f5f7ff",
                    border: "none",
                    borderRadius: "12px",
                    maxWidth: "100%",
                    height: "600px",
                  }}
                >
                  <Card
                    style={{
                      backgroundColor: "#f5f7ff",
                      border: "none",
                      borderRadius: "12px",
                      maxWidth: "100%",
                      height: "600px",
                    }}
                  >
                    <div className="d-flex gap-2 mb-4 pt-4">
                      {steps.map((_, index) => (
                        <div
                          key={index}
                          className="step-bar"
                          style={{
                            flex: 1,
                            height: "8px",
                            borderRadius: "0px",
                            backgroundColor:
                              index <= currentStep ? "#1d4ed8" : "#c7d2fe",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div className="p-4">
                      <h6
                        className="mb-4 fw-semibold"
                        style={{ color: "#374151", fontSize: "24px" }}
                      >
                        {steps[currentStep].question}
                      </h6>
                      <Form style={{ height: "450px" }}>
                        {steps[currentStep].options?.map((option, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedLevel(option)}
                            className="d-flex align-items-center justify-content-between mb-3 px-3 py-2 rounded shadow-sm border transition-all"
                            style={{
                              backgroundColor:
                                selectedLevel === option ? "#eef2ff" : "#fff",
                              borderColor:
                                selectedLevel === option
                                  ? "#4f46e5"
                                  : "#e5e7eb",
                              cursor: "pointer",
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
                          backgroundColor:
                            currentStep === steps.length - 1
                              ? "#3DBE64"
                              : "#10b981",
                          border: "none",
                          color: "#fff",
                        }}
                        disabled={!selectedLevel}
                        onClick={handleNext}
                      >
                        {manualBookingLoading ? (
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
                {currentStep === steps.length - 1 && view === "selection" && (
                  <div className="mt-4">
                    <h6 className="fw-bold mb-3">Players</h6>
                    <div className="row align-items-center justify-content-between border rounded-4 p-4">
                      <div className="col-6 d-flex justify-content-evenly">
                        {renderPlayer(matchDetails.players[0], 0)}
                        {renderPlayer(matchDetails.players[1], 1)}
                      </div>
                      <div className="col-6 d-flex justify-content-evenly border-start">
                        {renderPlayer(matchDetails.players[2], 2)}
                        {renderPlayer(matchDetails.players[3], 3)}
                      </div>
                      <div className="d-flex justify-content-between">
                        <div className="fw-semibold small mt-2 text-muted">
                          Team A
                        </div>
                        <div className="fw-semibold small mt-2 text-muted">
                          Team B
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          ) : (
            <Row>
              <Col md={6}>
                <div className="mt-4">
                  <h6 className="fw-bold mb-3">Players</h6>
                  <div className="row align-items-center justify-content-between border rounded-4 p-4">
                    <div className="col-6 d-flex justify-content-evenly">
                      {renderPlayer(matchDetails.players[0], 0)}
                      {renderPlayer(matchDetails.players[1], 1)}
                    </div>
                    <div className="col-6 d-flex justify-content-evenly border-start">
                      {renderPlayer(matchDetails.players[2], 2)}
                      {renderPlayer(matchDetails.players[3], 3)}
                    </div>
                    <div className="d-flex justify-content-between">
                      <div className="fw-semibold small mt-2 text-muted">
                        Team A
                      </div>
                      <div className="fw-semibold small mt-2 text-muted">
                        Team B
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                {renderBookingSummary(true)}
                <Button
                  variant="success"
                  size="lg"
                  className="w-100 mt-4"
                  onClick={handleConfirm}
                  disabled={manualBookingLoading}
                >
                  {manualBookingLoading ? <ButtonLoading /> : "Confirm Booking"}
                </Button>
              </Col>
            </Row>
          )}
        </Container>
      )}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Player</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={newUser.name}
              onChange={(e) =>
                setNewUser((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              value={newUser.phone}
              onChange={(e) =>
                setNewUser((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddUser}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CreateMatch;
