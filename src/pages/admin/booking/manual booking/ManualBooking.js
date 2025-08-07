import React, { useRef, useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BookingDetailsModal, BookingSuccessModal } from "./BookingModal";
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
import { showError, showInfo } from "../../../../helpers/Toast";
const ManualBooking = () => {
  const dispatch = useDispatch();
  const {
    manualBookingLoading,
    ownerClubLoading,
    ownerClubData,
    activeCourtsLoading,
    activeCourtsData,
  } = useSelector((state) => state.manualBooking);
  const slotTimes = activeCourtsData?.[0]?.slot?.[0]?.slotTimes || [];
  const courts = activeCourtsData?.[0]?.courts || [];
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
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
  const [selectedTimes, setSelectedTimes] = useState([]);

  const [selectedCourts, setSelectedCourts] = useState([]);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedDay, setSelectedDay] = useState("");

  const today = new Date();

  const dates = Array.from({ length: 41 }).map((_, i) => {
    const date = new Date(today); // 🧠 create a fresh copy of today's date
    date.setDate(date.getDate() + i); // ✅ safely add days

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      fullDate: date.toISOString().split("T")[0], // e.g., 2025-08-05
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
  const toggleTime = (slot) => {
    const exists = selectedTimes.some((t) => t._id === slot._id);

    if (exists) {
      // Remove
      setSelectedTimes(selectedTimes.filter((t) => t._id !== slot._id));
    } else {
      // Add
      setSelectedTimes([...selectedTimes, slot]);
    }
  };

  // const courts = [
  //     {
  //         id: 1,
  //         name: "Court 1",
  //         type: "Outdoor | wall | Double",
  //         price: 1000,
  //         image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=100&q=80", // Badminton
  //     },
  //     {
  //         id: 2,
  //         name: "Court 2",
  //         type: "Outdoor | wall | Double",
  //         price: 1000,
  //         image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80", // Tennis
  //     },
  //     {
  //         id: 3,
  //         name: "Court 3",
  //         type: "Outdoor | wall | Double",
  //         price: 1000,
  //         image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=100&q=80", // Basketball
  //     },
  //     {
  //         id: 4,
  //         name: "Court 4",
  //         type: "Outdoor | wall | Double",
  //         price: 1000,
  //         image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80", // Volleyball
  //     },
  // ];

  useEffect(() => {
    dispatch(getOwnerRegisteredClub()).unwrap();
  }, []);

  useEffect(() => {
    if (ownerClubData?.[0]?._id) {
      dispatch(
        getActiveCourts({
          register_club_id: ownerClubData?.[0]?._id,
          day: selectedDay,
        })
      );
    }
  }, [selectedDay, ownerClubData?.[0]?._id]);

  useEffect(() => {
    if (selectedButtonRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const selected = selectedButtonRef.current;
      const offsetLeft = selected.offsetLeft;
      const scrollWidth = container.clientWidth;

      // Scroll so selected button is centered
      container.scrollTo({
        left: offsetLeft - scrollWidth / 1 + selected.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [selectedDate]); // 👈 when selectedDate changes (calendar or click)

  // Allow only 40 days ahead from today
  const maxSelectableDate = new Date();
  maxSelectableDate.setDate(maxSelectableDate.getDate() + 40);

  //   const handleCourtSelect = (courtId) => {
  //     setSelectedCourts((prev) =>
  //       prev.includes(courtId)
  //         ? prev.filter((id) => id !== courtId)
  //         : [...prev, courtId]
  //     );
  //   };
  const handleCourtSelect = (courtId) => {
    setSelectedCourts((prev) => (prev.includes(courtId) ? [] : [courtId]));
  };

  const handleConfirm = async () => {
    if (!name || !phone) {
      showInfo("Please enter both name and phone number.");
      return;
    }

    if (selectedCourts.length === 0) {
      showInfo("Please select at least one court.");
      return;
    }

    if (selectedTimes.length === 0) {
      showInfo("Please select at least one time slot.");
      return;
    }

    try {
      // Construct the slot array for the payload
      const slotsPayload = selectedCourts?.map((courtId) => {
        // Find the court data
        const court = courts?.find((c) => c._id === courtId);

        // Find the slot data for this court
        const slotData = activeCourtsData?.[0]?.slot?.[0];

        // Format businessHours without _id fields
        const formattedBusinessHours =
          slotData?.businessHours?.map((bh) => ({
            time: bh.time,
            day: bh.day,
          })) || [];

        return {
          slotId: slotData?._id,
          businessHours: formattedBusinessHours, // Use formatted businessHours without _id
          slotTimes: selectedTimes.map((time) => ({
            time: time.time,
            amount: time.amount || 0,
          })),
          courtName: court?.courtName,
          bookingDate: new Date(selectedDate).toISOString(),
        };
      });

      const payload = {
        slot: slotsPayload,
        register_club_id: ownerClubData?.[0]?._id,
        phoneNumber: phone,
        name: name,
        ownerId: ownerClubData?.[0]?.ownerId,
      };

      // Dispatch the API call
      await dispatch(manualBookingByOwner(payload)).unwrap();

      // On success
      setShowSuccess(true);
      setName("");
      setPhone("");
      setSelectedCourts([]);
      setSelectedTimes([]);
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
          <Row>
            <Col md={6}>
              <h5
                className="manual-heading"
                style={{ fontFamily: "Poppins", fontWeight: "600" }}
              >
                Manual Booking
              </h5>
            </Col>
            <Col md={6} className="text-end">
              <Button
                className="bg-transparent border-0"
                onClick={() => navigate("/admin/booking")}
                style={{
                  color: "#1F41BB",
                  fontSize: "20px",
                  fontWeight: "600",
                  fontFamily: "Poppins",
                }}
              >
                {" "}
                <FaArrowLeft /> Back
              </Button>
            </Col>
          </Row>
          <Row className="mx-auto bg-white">
            <Col md={8} className="pt-3 rounded-3 px-4">
              {/* Date Selector */}
              <div className="calendar-strip ">
                <div
                  className="tabel-title mb-3"
                  style={{
                    fontFamily: "Poppins",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Select Date{" "}
                  <div
                    className="position-relative d-inline-block"
                    ref={wrapperRef}
                  >
                    <span
                      className="rounded-circle p-2 ms-2 shadow-sm bg-light"
                      style={{ cursor: "pointer" }}
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <i
                        className="bi bi-calendar2-week"
                        style={{ fontSize: "18px" }}
                      ></i>
                    </span>

                    {/* Calendar */}
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
                            setSelectedTimes([]); // clear selected slots
                          }}
                          minDate={new Date()}
                          maxDate={maxSelectableDate}
                          inline
                          // showMonthDropdown
                          // showYearDropdown
                          dropdownMode="select"
                          calendarClassName="custom-calendar w-100 shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
                {/* DATE HORIZONTAL SCROLLER */}
                <div className="d-flex align-items-center w-100 p-0 gap-2 mb-3">
                  <button
                    className="btn btn-light p-0"
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
                          className={`calendar-day-btn border px-3 py-2 rounded ${
                            isSelected ? "text-white" : "bg-light text-dark"
                          }`}
                          style={{
                            backgroundColor: isSelected ? "#374151" : undefined,
                            border: "none",
                            minWidth: "85px",
                          }}
                          onClick={() => {
                            setSelectedDate(d.fullDate);
                            setSelectedDay(dayFullNames[d.day]);
                            setSelectedTimes([]);
                          }}
                        >
                          <div className="text-center pb-3">
                            <div
                              style={{ fontSize: "14px", fontWeight: "400" }}
                            >
                              {d.day}
                            </div>
                            <div
                              style={{ fontSize: "26px", fontWeight: "500" }}
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
                    className="btn btn-light p-0"
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
                  Available Slots <span className="fs-6">(60m)</span>
                </p>
                <div className="form-switch d-flex align-items-center gap-2 p-0">
                  <input
                    className="form-check-input fs-5 mb-1"
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckDefault"
                    style={{ boxShadow: "none" }}
                  />
                  <label
                    className="table-data text-dark mb-0"
                    htmlFor="flexSwitchCheckDefault"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Show Unavailable Slots
                  </label>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 mb-4">
                {activeCourtsLoading ? (
                  <DataLoading height="20vh" />
                ) : (
                  <>
                    {slotTimes?.map((slot, i) => {
                      // Parse slot time into a Date object for today
                      const slotDate = new Date();
                      const [hourString, period] = slot?.time
                        ?.toLowerCase()
                        .split(" ");
                      let hour = parseInt(hourString);

                      if (period === "pm" && hour !== 12) hour += 12;
                      if (period === "am" && hour === 12) hour = 0;
                      slotDate.setHours(hour, 0, 0, 0);

                      const now = new Date();
                      const isPast = slotDate.getTime() < now.getTime();

                      const isSelected = selectedTimes.some(
                        (t) => t._id === slot._id
                      );
                      const isBooked = slot?.status === "booked";

                      return (
                        <button
                          key={i}
                          className={`btn border-0 rounded-pill table-data px-4 ${
                            isBooked
                              ? "bg-danger-subtle"
                              : isPast
                              ? "bg-warning-subtle"
                              : ""
                          }`}
                          onClick={() => toggleTime(slot)}
                          title={`${
                            isBooked
                              ? "Booked"
                              : isPast
                              ? "Cannot book slot in past hours"
                              : "Book Now"
                          }`}
                          disabled={isPast || isBooked}
                          style={{
                            backgroundColor: isSelected
                              ? "#374151"
                              : "#CBD6FF1A",
                            color: isSelected ? "white" : "#000000",
                          }}
                        >
                          {slot?.time}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </Col>
            <Col md={4}>
              <div>
                <div className="d-flex justify-content-between align-items-center pt-3">
                  <p
                    className="mb-0 tabel-title"
                    style={{
                      fontFamily: "Poppins",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Available Court
                  </p>
                </div>
                <div className="bg-white px-3">
                  {activeCourtsLoading ? (
                    <DataLoading height="20vh" />
                  ) : (
                    <>
                      {courts?.map((court) => (
                        <div
                          key={court._id}
                          className={`d-flex justify-content-between align-items-center border-bottom py-3 mb-1 px-2 ${
                            selectedCourts?.includes(court?._id)
                              ? "bg-success-subtle rounded-pill"
                              : ""
                          }`}
                        >
                          {/* Left Image & Text */}
                          <div className="d-flex align-items-center gap-3">
                            {/* <img
                                                src={court.image}
                                                alt={court.courtName}
                                                style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover" }}
                                            /> */}
                            <div>
                              <div className="fw-semibold">
                                {court.courtName}
                              </div>
                              {/* <small className="text-muted">{court.type}</small> */}
                            </div>
                          </div>

                          {/* Price and Cart Icon */}
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="fw-semibold"
                              style={{ fontSize: "20px", fontWeight: "500" }}
                            >
                              ₹{court.price}
                            </div>
                            <button
                              className="btn btn-dark rounded-circle p-2 d-flex align-items-center justify-content-center"
                              style={{ width: "32px", height: "32px" }}
                              onClick={() => handleCourtSelect(court?._id)}
                            >
                              <FaShoppingCart size={14} color="white" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 px-3">
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
                    className="form-control rounded-3 py-2"
                    placeholder="Name"
                    style={{ backgroundColor: "#CBD6FF7A" }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    type="tel"
                    className="form-control rounded-3 py-2"
                    placeholder="Phone Number"
                    style={{ backgroundColor: "#CBD6FF7A" }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                  />
                </div>

                <div className="d-flex justify-content-end gap-4 align-items-end">
                  <button
                    className="btn btn-secondary rounded-pill px-4 py-2"
                    style={{ minWidth: "120px", fontWeight: "500" }}
                    onClick={() => {
                      setName("");
                      setPhone("");
                      setShowSuccess(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success rounded-pill px-4 py-2"
                    style={{ minWidth: "120px", fontWeight: "500" }}
                    onClick={handleConfirm}
                  >
                    {manualBookingLoading ? <ButtonLoading /> : "Confirm"}
                  </button>

                  <BookingSuccessModal
                    show={showSuccess}
                    handleClose={() => setShowSuccess(false)}
                    openDetails={() => {
                      setShowSuccess(false);
                      setShowDetails(true);
                    }}
                  />

                  <BookingDetailsModal
                    show={showDetails}
                    handleClose={() => setShowDetails(false)}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
};

export default ManualBooking;
