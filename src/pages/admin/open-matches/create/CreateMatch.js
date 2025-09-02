import React, { useRef, useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
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
import { useDispatch, useSelector } from "react-redux";
import {
  ButtonLoading,
  DataLoading,
  Loading,
} from "../../../../helpers/loading/Loaders";
import { showInfo } from "../../../../helpers/Toast";
import { getOwnerFromSession } from "../../../../helpers/api/apiCore";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

const CreateMatch = () => {
  const dispatch = useDispatch();
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
  const navigate = useNavigate();
  const [showUnavailable, setShowUnavailable] = useState(false);

  // State for form values
  const [skillLevel, setSkillLevel] = useState("");
  const [racketSport, setRacketSport] = useState("");
  const [padelTraining, setPadelTraining] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [volleySkill, setVolleySkill] = useState("");
  const [reboundSkill, setReboundSkill] = useState("");

  // State for users
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);

  // Close on outside click
  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date();
  const dates = Array.from({ length: 41 })?.map((_, i) => {
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

  const [selectedCourts, setSelectedCourts] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedDay, setSelectedDay] = useState(dayFullNames[dates[0]?.day]);
  const scrollRef = useRef(null);
  const selectedButtonRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -120 : 120,
        behavior: "smooth",
      });
    }
  };

  const courts = activeCourtsData?.[0]?.courts;
  const slotTimes = activeCourtsData?.[0]?.slot?.[0]?.slotTimes;

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

  useEffect(() => {
    dispatch(getOwnerRegisteredClub({ ownerId: ownerId })).unwrap();
  }, []);

  useEffect(() => {
    if (ownerClubData?.[0]?._id) {
      dispatch(
        getActiveCourts({
          register_club_id: ownerClubData?.[0]?._id,
          day: selectedDay,
          date: selectedDate,
          courtId: selectedCourts[0],
        })
      );
    }
  }, [selectedDay, selectedDate, ownerClubData?.[0]?._id, selectedCourts]);

  useEffect(() => {
    if (courts?.length > 0 && selectedCourts.length === 0) {
      setSelectedCourts([courts[0]._id]);
    }
  }, [courts?.length]);

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

  const validateForm = () => {
    if (!skillLevel) {
      showInfo("Please select skill level.");
      return false;
    }
    if (!racketSport) {
      showInfo("Please select racket sport.");
      return false;
    }
    if (!padelTraining) {
      showInfo("Please select padel training status.");
      return false;
    }
    if (!ageGroup) {
      showInfo("Please select age group.");
      return false;
    }
    if (!volleySkill) {
      showInfo("Please select volley skill.");
      return false;
    }
    if (!reboundSkill) {
      showInfo("Please select rebound skill.");
      return false;
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!validateForm()) return;

    const slotsPayload = [];
    let totalAmount = 0;
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
        skillLevel,
        playerDetails: [
          racketSport,
          padelTraining,
          ageGroup,
          volleySkill,
          reboundSkill,
        ],
        users,
      };
      await dispatch(manualBookingByOwner(payload)).unwrap();
      setSelectedSlots({});
      setSelectedCourts([]);
      setUsers([]);
      setSkillLevel("");
      setRacketSport("");
      setPadelTraining("");
      setAgeGroup("");
      setVolleySkill("");
      setReboundSkill("");
    } catch (error) {
      console.log("Booking failed:", error);
    }
  };

  const addUser = () => {
    if (users.length >= 4) {
      showInfo("Maximum 4 users can be added.");
      return;
    }
    if (!newUserName || !newUserPhone) {
      showInfo("Please enter name and phone number.");
      return;
    }
    setUsers([...users, { name: newUserName, phone: newUserPhone }]);
    setNewUserName("");
    setNewUserPhone("");
    setShowUserModal(false);
  };

  const removeUser = (index) => {
    const updatedUsers = users.filter((_, i) => i !== index);
    setUsers(updatedUsers);
  };

  const getSelectedCourtName = () => {
    if (!selectedCourts[0]) return "";
    const court = courts?.find((c) => c._id === selectedCourts[0]);
    return court?.courtName || "";
  };

  const getSelectedSlotsList = () => {
    if (!selectedCourts[0]) return [];
    return selectedSlots[selectedCourts[0]] || [];
  };

  const calculateTotal = () => {
    let total = 0;
    getSelectedSlotsList().forEach((slot) => {
      total += slot?.amount || 0;
    });
    return total;
  };

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
          <Row>
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <h5 className="mb-3 text-dark">Select Court</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {courts?.map((court) => (
                      <Button
                        key={court._id}
                        variant={
                          selectedCourts.includes(court._id) ? "dark" : "light"
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
                  ) : slotTimes?.length === 0 ? (
                    <div className="text-center text-danger">
                      No slots available
                    </div>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      {slotTimes
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
                          const isSelected = getSelectedSlotsList().some(
                            (t) => t._id === slot._id
                          );
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
                            else if (!isAvailable) tooltipText = "Unavailable";
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
                                {isBooked ? "Booked" : slot.time}
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
              <Row className="my-4">
                <Card className="shadow-sm">
                  <Card.Body>
                    <h5 className="mb-3 text-dark">Booking Summary</h5>
                    {selectedCourts.length === 0 ? (
                      <p className="text-muted">No court selected.</p>
                    ) : (
                      <>
                        <p>
                          <strong>Court:</strong> {getSelectedCourtName()}
                        </p>
                        <p>
                          <strong>Selected Slots:</strong>
                        </p>
                        <ListGroup className="mb-3">
                          {getSelectedSlotsList()?.map((slot, index) => (
                            <ListGroup.Item key={index}>
                              {slot.time} - Amount: ${slot.amount || 0}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                        <p>
                          <strong>Total Amount:</strong> ${calculateTotal()}
                        </p>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Row>

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
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <h5 className="mb-4 text-dark">Match Details</h5>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Skill Level</Form.Label>
                      <Form.Select
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Professional">Professional</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Racket Sport Played Before</Form.Label>
                      <Form.Select
                        value={racketSport}
                        onChange={(e) => setRacketSport(e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="Tennis">Tennis</option>
                        <option value="Badminton">Badminton</option>
                        <option value="Squash">Squash</option>
                        <option value="Others">Others</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Received or Receiving Padel Training?
                      </Form.Label>
                      <Form.Select
                        value={padelTraining}
                        onChange={(e) => setPadelTraining(e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="No">No</option>
                        <option value="InPast">Yes, In Past</option>
                        <option value="Currently">Yes, Currently</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Age Group</Form.Label>
                      <Form.Select
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="Between 18 and 30 years">
                          Between 18 and 30 years
                        </option>
                        <option value="31 to 40 years">31 to 40 years</option>
                        <option value="41 to 50 years">41 to 50 years</option>
                        <option value="Over 50">Over 50</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>On the Volley?</Form.Label>
                      <Form.Select
                        value={volleySkill}
                        onChange={(e) => setVolleySkill(e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="I hardly got to the net">
                          I hardly got to the net
                        </option>
                        <option value="I don’t feel safe at the net, I make too many mistake">
                          I don’t feel safe at the net, I make too many mistakes
                        </option>
                        <option value="I can volley forehand and backhand with some difficulties">
                          I can volley forehand and backhand with some
                          difficulties
                        </option>
                        <option value="I have good positioning at the net and I volley confidently">
                          I have good positioning at the net and I volley
                          confidently
                        </option>
                        <option value="I don’t know">I don’t know</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>On the Rebounds...</Form.Label>
                      <Form.Select
                        value={reboundSkill}
                        onChange={(e) => setReboundSkill(e.target.value)}
                      >
                        <option value="">Select...</option>
                        <option value="I don’t Know how to read the rebounds, I hit before it rebounds">
                          I don’t know how to read the rebounds, I hit before it
                          rebounds
                        </option>
                        <option value="I try, with difficulty, to hit the rebounds on the back wall">
                          I try, with difficulty, to hit the rebounds on the
                          back wall
                        </option>
                        <option value="I return rebounds on the back wall, it is difficulty for me to return the double wall ones">
                          I return rebounds on the back wall, it is difficult
                          for me to return the double wall ones
                        </option>
                        <option value="I return double- wall rebounds and reach for quick rebounds">
                          I return double-wall rebounds and reach for quick
                          rebounds
                        </option>
                        <option value="I perform powerful wall descent shots with forehand and backhand">
                          I perform powerful wall descent shots with forehand
                          and backhand
                        </option>
                        <option value="I don’t know">I don’t know</option>
                      </Form.Select>
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="mb-3 text-dark">Add Players (Max 4)</h5>
                  <Button
                    variant="primary"
                    className="mb-3"
                    onClick={() => setShowUserModal(true)}
                    disabled={users.length >= 4}
                  >
                    <FaPlus className="me-2" /> Add Player
                  </Button>
                  <ListGroup>
                    {users?.map((user, index) => (
                      <ListGroup.Item
                        key={index}
                        className="d-flex justify-content-between align-items-center"
                      >
                        {user.name} - {user.phone}
                        <Button
                          variant="link"
                          className="text-danger"
                          onClick={() => removeUser(index)}
                        >
                          <FaTrash />
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}

      {/* Modal for adding user */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Player</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              value={newUserPhone}
              onChange={(e) => setNewUserPhone(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={addUser}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CreateMatch;
