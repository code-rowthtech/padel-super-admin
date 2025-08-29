import React, { useRef, useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  ListGroup,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BookingSuccessModal } from "./BookingModal";
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

const ManualBooking = () => {
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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUnavailable, setShowUnavailable] = useState(false);

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

  const removeSlot = (courtId, slotId) => {
    const courtSlots = selectedSlots[courtId] || [];
    const newCourtSlots = courtSlots.filter((t) => t._id !== slotId);

    let newSelectedSlots;
    if (newCourtSlots.length === 0) {
      const { [courtId]: _, ...rest } = selectedSlots;
      newSelectedSlots = rest;
    } else {
      newSelectedSlots = { ...selectedSlots, [courtId]: newCourtSlots };
    }

    setSelectedSlots(newSelectedSlots);
  };

  const clearSessionStorage = () => {
    const key = `manual-booking-slots-${selectedDate}`;
    sessionStorage.removeItem(key);
    setSelectedSlots({});
    setSelectedCourts([]);
  };

  const cleanOldSessionStorage = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith("manual-booking-slots-")) {
        const dateStr = key.split("manual-booking-slots-")[1];
        const itemDate = new Date(dateStr).setHours(0, 0, 0, 0);
        if (itemDate <= today) {
          sessionStorage.removeItem(key);
        }
      }
    }
  };

  useEffect(() => {
    cleanOldSessionStorage();
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
    const key = `manual-booking-slots-${selectedDate}`;
    const saved = sessionStorage.getItem(key);
    if (saved) {
      const parsedSlots = JSON.parse(saved);
      const totalSlots = Object.values(parsedSlots).flat().length;
      if (totalSlots <= 15) {
        setSelectedSlots(parsedSlots);
      } else {
        showInfo(
          "Loaded slots exceed maximum limit of 15. Truncating selection."
        );
        const truncatedSlots = {};
        let count = 0;
        for (const [courtId, slots] of Object.entries(parsedSlots)) {
          if (count >= 15) break;
          const slotsToAdd = slots.slice(0, 15 - count);
          if (slotsToAdd.length > 0) {
            truncatedSlots[courtId] = slotsToAdd;
            count += slotsToAdd.length;
          }
        }
        setSelectedSlots(truncatedSlots);
        sessionStorage.setItem(key, JSON.stringify(truncatedSlots));
      }
    } else {
      setSelectedSlots({});
    }
  }, [selectedDate]);

  useEffect(() => {
    const key = `manual-booking-slots-${selectedDate}`;
    sessionStorage.setItem(key, JSON.stringify(selectedSlots));
  }, [selectedSlots, selectedDate]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanOldSessionStorage();
      const key = `manual-booking-slots-${selectedDate}`;
      sessionStorage.removeItem(key);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selectedDate]);

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

  const handleConfirm = async () => {
    if (!name.trim()) {
      showInfo("Name cannot be empty or just spaces!");
      return;
    }
    if (!name || !phone) {
      showInfo("Please enter both name and phone number.");
      return;
    }

    const slotsPayload = [];
    Object.entries(selectedSlots).forEach(([courtId, times]) => {
      const court = courts.find((c) => c._id === courtId);
      const slotData = court?.slot?.[0];
      const formattedBusinessHours =
        slotData?.businessHours?.map((bh) => ({
          time: bh.time,
          day: bh.day,
        })) || [];

      times.forEach((timeSlot) => {
        slotsPayload.push({
          slotId: timeSlot?._id,
          businessHours: formattedBusinessHours,
          slotTimes: [
            {
              time: timeSlot?.time,
              amount: timeSlot?.amount || 0,
            },
          ],
          courtName: court?.courtName,
          courtId: court?._id,
          bookingDate: new Date(selectedDate).toISOString(),
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
        register_club_id: ownerClubData?.[0]?._id,
        phoneNumber: phone,
        name: name,
        ownerId: Owner?._id,
      };
      await dispatch(manualBookingByOwner(payload)).unwrap();
      setShowSuccess(true);
      setName("");
      setPhone("");
      setSelectedSlots({});
      setSelectedCourts([]);
      sessionStorage.removeItem(`manual-booking-slots-${selectedDate}`);
    } catch (error) {
      console.log("Booking failed:", error);
    }
  };

  return (
    <>
      {ownerClubLoading ? (
        <Loading />
      ) : (
        <Container className="p-0" fluid>
          <Row className="mb-3">
            <Col md={6}>
              <h5
                className="manual-heading"
                style={{
                  fontFamily: "Poppins",
                  fontWeight: "700",
                  color: "#374151",
                }}
              >
                Manual Booking
              </h5>
            </Col>
            <Col md={6} className="text-end">
              <Button
                className="bg-transparent border-0"
                onClick={() => {
                  clearSessionStorage();
                  navigate("/admin/booking");
                }}
                style={{
                  color: "#1F41BB",
                  fontSize: "18px",
                  fontWeight: "600",
                  fontFamily: "Poppins",
                }}
              >
                <FaArrowLeft className="me-2" /> Back
              </Button>
            </Col>
          </Row>
          <Row className="mx-auto bg-white shadow-sm rounded-3">
            <Col md={8} className="p-4">
              {/* Court Selector */}
              <div className="mb-4">
                <div
                  className="tabel-title mb-2"
                  style={{
                    fontFamily: "Poppins",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Select Court
                </div>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {courts?.map((court) => (
                    <button
                      key={court._id}
                      type="button"
                      onClick={() => handleCourtSelect(court._id)}
                      className="btn py-2 shadow-sm"
                      style={{
                        borderRadius: "12px",
                        minWidth: "110px",
                        transition: "all 0.2s ease-in-out",
                        backgroundColor: selectedCourts?.includes(court._id)
                          ? "#374151"
                          : "#F3F4F6",
                        color: selectedCourts?.includes(court._id)
                          ? "#FFFFFF"
                          : "#000000",
                        fontWeight: selectedCourts?.includes(court._id)
                          ? "600"
                          : "400",
                        border: selectedCourts?.includes(court._id)
                          ? "2px solid #374151"
                          : "1px solid #ccd2d9ff",
                        fontFamily: "Poppins",
                        fontSize: "14px",
                      }}
                    >
                      {court.courtName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selector */}
              <div className="calendar-strip">
                <div
                  className="tabel-title mb-3"
                  style={{
                    fontFamily: "Poppins",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Select Date
                  <div
                    className="position-relative d-inline-block"
                    ref={wrapperRef}
                  >
                    <span
                      className="rounded px-1 ms-2 shadow-sm"
                      style={{
                        cursor: "pointer",
                        width: "26px",
                        height: "26px",
                        backgroundColor: "rgb(229, 233, 236)",
                      }}
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <i
                        className="bi bi-calendar2-week"
                        style={{ width: "14px", height: "16px" }}
                      ></i>
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
                          dropdownMode="select"
                          calendarClassName="custom-calendar w-100 shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="d-flex align-items-center w-100 p-0 gap-2 mb-4">
                  <button
                    className="btn btn-light p-2 shadow-sm"
                    onClick={() => scroll("left")}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <div
                    ref={scrollRef}
                    className="d-flex gap-2"
                    style={{
                      scrollBehavior: "smooth",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      flex: 1,
                    }}
                  >
                    {dates?.map((d, i) => {
                      const isSelected = selectedDate === d.fullDate;
                      return (
                        <button
                          key={i}
                          ref={isSelected ? selectedButtonRef : null}
                          className={`calendar-day-btn border px-3 py-2 rounded shadow-sm ${
                            isSelected ? "text-white" : "bg-light text-dark"
                          }`}
                          style={{
                            backgroundColor: isSelected ? "#374151" : undefined,
                            border: "none",
                            minWidth: "85px",
                            transition: "all 0.2s ease",
                            fontFamily: "Poppins",
                          }}
                          onClick={() => {
                            setSelectedDate(d.fullDate);
                            setSelectedDay(dayFullNames[d.day]);
                          }}
                        >
                          <div className="text-center pb-2">
                            <div
                              style={{ fontSize: "14px", fontWeight: "400" }}
                            >
                              {d.day}
                            </div>
                            <div
                              style={{ fontSize: "24px", fontWeight: "600" }}
                            >
                              {d.date}
                            </div>
                            <div
                              style={{ fontSize: "14px", fontWeight: "400" }}
                            >
                              {d.month}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="btn btn-light p-2 shadow-sm"
                    onClick={() => scroll("right")}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>

              {/* Time Selector */}
              <div className="d-flex justify-content-between align-items-center py-2">
                <p
                  className="mb-3 tabel-title"
                  style={{
                    fontFamily: "Poppins",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Available Slots
                  <span className="fs-6 text-muted">(60m)</span>
                </p>
                <div className="form-switch d-flex align-items-center gap-2 p-0">
                  <input
                    className="form-check-input fs-5 mb-1"
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckDefault"
                    style={{ boxShadow: "none" }}
                    checked={showUnavailable}
                    onChange={(e) => setShowUnavailable(e.target.checked)}
                  />
                  <label
                    className="table-data text-dark mb-0"
                    htmlFor="flexSwitchCheckDefault"
                    style={{ whiteSpace: "nowrap", fontSize: "14px" }}
                  >
                    Show Unavailable Slots
                  </label>
                </div>
              </div>
              {activeCourtsLoading ? (
                <DataLoading height="10vh" />
              ) : (
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {slotTimes?.length === 0 ? (
                    <div
                      className="d-flex text-danger justify-content-center align-items-center w-100"
                      style={{ height: "10vh", fontFamily: "Poppins" }}
                    >
                      No slots available
                    </div>
                  ) : (
                    <>
                      {(() => {
                        const filteredSlots = slotTimes
                          ?.map((slot) => {
                            const slotDate = new Date(selectedDate);
                            const [hourString, period] = slot?.time
                              ?.toLowerCase()
                              ?.split(" ");
                            let hour = parseInt(hourString);
                            if (period === "pm" && hour !== 12) hour += 12;
                            if (period === "am" && hour === 12) hour = 0;
                            slotDate.setHours(hour, 0, 0, 0);

                            const now = new Date();
                            const isSameDay =
                              slotDate.toDateString() === now.toDateString();
                            const isPast =
                              isSameDay && slotDate.getTime() < now.getTime();
                            const courtSelectedSlots =
                              selectedSlots[selectedCourts[0]];
                            const isSelected = courtSelectedSlots?.some(
                              (t) => t._id === slot?._id
                            );
                            const isBooked = slot?.status === "booked";
                            const isAvailable =
                              slot?.availabilityStatus === "available";
                            const hasAmount =
                              slot?.amount && slot?.amount !== 0;

                            return {
                              slot,
                              isPast,
                              isSelected,
                              isBooked,
                              isAvailable,
                              hasAmount,
                            };
                          })
                          .filter(
                            ({ isPast, isBooked, isAvailable, hasAmount }) => {
                              return (
                                showUnavailable ||
                                (isAvailable &&
                                  hasAmount &&
                                  !isBooked &&
                                  !isPast)
                              );
                            }
                          );

                        if (filteredSlots?.length === 0) {
                          return (
                            <div
                              className="d-flex text-danger justify-content-center align-items-center w-100"
                              style={{ height: "10vh", fontFamily: "Poppins" }}
                            >
                              No slots available
                            </div>
                          );
                        }

                        return filteredSlots?.map(
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
                              tooltipText = "Cannot book slot in past hours";
                            else if (!isAvailable) tooltipText = "Unavailable";
                            else tooltipText = "Book Now";

                            const buttonEl = (
                              <span className="d-inline-block">
                                <button
                                  className={`btn border-0 rounded-pill table-data px-4 py-1 shadow-sm ${
                                    isBooked
                                      ? "bg-danger text-white"
                                      : isPast
                                      ? "bg-secondary-subtle"
                                      : !isAvailable || !hasAmount
                                      ? "bg-warning"
                                      : ""
                                  }`}
                                  onClick={() => toggleTime(slot)}
                                  disabled={
                                    isPast ||
                                    isBooked ||
                                    !hasAmount ||
                                    !isAvailable
                                  }
                                  style={{
                                    backgroundColor: isSelected
                                      ? "#374151"
                                      : "#FAFBFF",
                                    color: isSelected ? "white" : "#000000",
                                    cursor: !hasAmount
                                      ? "not-allowed"
                                      : "pointer",
                                    fontFamily: "Poppins",
                                    fontSize: "14px",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  {isBooked ? "Booked" : slot?.time}
                                </button>
                              </span>
                            );

                            if (isSelected || isBooked) {
                              return <div key={i}>{buttonEl}</div>;
                            }

                            return (
                              <OverlayTrigger
                                key={i}
                                placement="top"
                                overlay={<Tooltip>{tooltipText}</Tooltip>}
                              >
                                {buttonEl}
                              </OverlayTrigger>
                            );
                          }
                        );
                      })()}
                    </>
                  )}
                </div>
              )}
            </Col>
            <Col md={4} className="py-4 px-3">
              <div
                className="shadow rounded-3 p-3 bg-white"
                style={{ minHeight: "50vh" }}
              >
                <div
                  className="tabel-title d-flex justify-content-between align-items-center mb-3"
                  style={{
                    fontFamily: "Poppins",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Selected Bookings
                  {Object.entries(selectedSlots)?.length > 0 && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="rounded-pill"
                      onClick={clearSessionStorage}
                      style={{ fontSize: "12px", padding: "4px 10px" }}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <div
                  style={{
                    height: "26vh",
                    overflowY: "auto",
                    fontFamily: "Poppins",
                    fontSize: "14px",
                  }}
                >
                  {Object.entries(selectedSlots)?.length === 0 ? (
                    <div
                      className="d-flex text-muted justify-content-center align-items-center"
                      style={{ height: "26vh" }}
                    >
                      No selections yet
                    </div>
                  ) : (
                    <ListGroup variant="flush">
                      {Object.entries(selectedSlots).map(([courtId, slots]) => {
                        const court = courts.find((c) => c?._id === courtId);
                        return (
                          <React.Fragment key={courtId}>
                            <ListGroup.Item
                              variant="secondary"
                              className="fw-bold fs-6 py-1 bg-light rounded-top"
                              style={{ fontFamily: "Poppins" }}
                            >
                              <div className="d-flex justify-content-between">
                                <span>{court?.courtName}</span>
                                <span>
                                  {format(
                                    new Date(selectedDate),
                                    "EEE, dd/MM/yyyy"
                                  )}
                                </span>
                              </div>
                            </ListGroup.Item>
                            {slots?.map((slot) => (
                              <ListGroup.Item
                                key={slot?._id}
                                className="d-flex justify-content-between align-items-center py-1 px-2 fs-6"
                                style={{
                                  fontFamily: "Poppins",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <span style={{ fontSize: "14px" }}>
                                  {slot?.time}
                                </span>
                                <span
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                  }}
                                >
                                  ₹{slot?.amount}
                                </span>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="px-1 py-0 border-0"
                                  onClick={() => removeSlot(courtId, slot?._id)}
                                >
                                  <FaTrash size={12} />
                                </Button>
                              </ListGroup.Item>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </ListGroup>
                  )}
                </div>
                {Object.values(selectedSlots).flat().length > 0 && (
                  <div className="mt-2 p-2 rounded shadow-sm bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <span
                        style={{
                          fontWeight: "600",
                          fontFamily: "Poppins",
                          fontSize: "15px",
                        }}
                      >
                        Total Amount
                      </span>
                      <span
                        style={{
                          fontWeight: "700",
                          fontSize: "16px",
                          color: "#1F41BB",
                        }}
                      >
                        ₹
                        {Object.values(selectedSlots)
                          .flat()
                          .reduce((acc, s) => acc + (s.amount || 0), 0)}
                      </span>
                      <span style={{ fontSize: "14px", color: "#374151" }}>
                        {Object.values(selectedSlots).flat().length} Slots
                      </span>
                    </div>
                    <div className="mt-2">
                      <p
                        className="mb-2 tabel-title"
                        style={{
                          fontFamily: "Poppins",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        User Information
                      </p>
                      <div className="d-flex gap-3 mb-3">
                        <input
                          type="text"
                          className="form-control rounded-3 py-2 shadow-sm"
                          placeholder="Name"
                          style={{
                            backgroundColor: "#CBD6FF7A",
                            fontFamily: "Poppins",
                            fontSize: "14px",
                          }}
                          value={name}
                          onChange={(e) => {
                            let value = e.target.value;

                            // Remove anything that's not a-z or space
                            value = value.replace(/[^a-zA-Z\s]/g, "");

                            // Capitalize first letter
                            if (value.length > 0) {
                              value =
                                value.charAt(0).toUpperCase() + value.slice(1);
                            }

                            setName(value);
                          }}
                        />
                        <input
                          type="tel"
                          className="form-control rounded-3 py-2 shadow-sm"
                          style={{
                            backgroundColor: "#CBD6FF7A",
                            fontFamily: "Poppins",
                            fontSize: "14px",
                          }}
                          value={phone ? `+91 ${phone}` : ""}
                          placeholder="+91 Phone Number"
                          onChange={(e) => {
                            const value = e.target.value
                              .replace("+91", "")
                              .replace(/\s/g, "");
                            if (
                              value === "" ||
                              /^[6-9][0-9]{0,9}$/.test(value)
                            ) {
                              setPhone(value);
                            }
                          }}
                          maxLength={14}
                          onKeyDown={(e) => {
                            const allowedKeys = [
                              "Backspace",
                              "Tab",
                              "ArrowLeft",
                              "ArrowRight",
                              "Delete",
                            ];
                            if (
                              !allowedKeys.includes(e.key) &&
                              !/^\d$/.test(e.key)
                            ) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </div>
                      <div className="d-flex justify-content-end gap-3 align-items-end">
                        <button
                          className="btn btn-secondary rounded-pill p-2 shadow-sm"
                          style={{
                            minWidth: "120px",
                            fontWeight: "500",
                            fontFamily: "Poppins",
                            fontSize: "14px",
                          }}
                          onClick={() => {
                            setName("");
                            setPhone("");
                            setSelectedSlots({});
                            setSelectedCourts([]);
                            clearSessionStorage();
                            setShowSuccess(false);
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn text-white rounded-pill p-2 shadow-sm"
                          style={{
                            minWidth: "120px",
                            fontWeight: "500",
                            backgroundColor: "#22c55e",
                            fontFamily: "Poppins",
                            fontSize: "14px",
                          }}
                          onClick={handleConfirm}
                        >
                          {manualBookingLoading ? (
                            <ButtonLoading color="white" size={12} />
                          ) : (
                            "Confirm"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>
          <BookingSuccessModal
            show={showSuccess}
            handleClose={() => {
              setShowSuccess(false);
              clearSessionStorage();
            }}
            openDetails={() => {
              setShowSuccess(false);
              navigate("/admin/booking");
            }}
          />
        </Container>
      )}
    </>
  );
};

export default ManualBooking;
