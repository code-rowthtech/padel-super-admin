import { useRef, useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  OverlayTrigger,
  Row,
  Tooltip,
  Form,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getOwnerRegisteredClub,
  getActiveCourts,
  updateCourt,
} from "../../../redux/thunks";
import { useDispatch, useSelector } from "react-redux";
import {
  ButtonLoading,
  DataLoading,
  Loading,
} from "../../../helpers/loading/Loaders";
import { showError, showInfo } from "../../../helpers/Toast";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { resetOwnerClub } from "../../../redux/admin/manualBooking/slice";
import { formatSlotTime } from "../../../helpers/Formatting";
const CourtAvailability = () => {
  const dispatch = useDispatch();
  const Owner = getOwnerFromSession();
  const ownerId = Owner?.generatedBy ? Owner?.generatedBy : Owner?._id;
  const {
    ownerClubLoading,
    ownerClubData,
    activeCourtsLoading,
    activeCourtsData,
  } = useSelector((state) => state.manualBooking);
  const { updateClubLoading } = useSelector((state) => state.club);
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const scrollRef = useRef(null);
  const selectedButtonRef = useRef(null);
  const navigate = useNavigate();
  const [showUnavailable, setShowUnavailable] = useState(false);

  // State to track selected slots with their status
  const [selectedSlots, setSelectedSlots] = useState({}); // { courtId: [{ slot, status }] }
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const dayFullNames = {
    Sun: "Sunday",
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
  };
  const [selectedDay, setSelectedDay] = useState(
    dayFullNames[new Date().toLocaleDateString("en-US", { weekday: "short" })]
  );

  // Available status options
  const statusOptions = [
    "available",
    "maintenance",
    "weather conditions",
    "staff unavailability",
  ];

  // State for common status apply
  const [commonStatus, setCommonStatus] = useState("");

  // Status to background color mapping
  const statusColorMap = {
    available: "#FAFBFF",
    booked: "bg-danger text-white",
    maintenance: "bg-warning text-white",
    "weather conditions": "bg-info text-white",
    "staff unavailability": "bg-secondary text-white",
  };

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

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -120 : 120,
        behavior: "smooth",
      });
    }
  };

  const courts = activeCourtsData?.[0]?.courts || [];
  const slotTimes = activeCourtsData?.[0]?.slot?.[0]?.slotTimes || [];
  const businessHours = activeCourtsData?.[0]?.slot?.[0]?.businessHours || [];

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
    const exists = courtSlots.some((t) => t.slot?._id === slot?._id);

    if (!exists) {
      const totalSlots = Object.values(selectedSlots).flat().length;
      if (totalSlots >= 15) {
        showInfo("Maximum 15 slots can be selected at a time.");
        return;
      }
    }

    let newCourtSlots;
    if (exists) {
      newCourtSlots = courtSlots.filter((t) => t.slot?._id !== slot?._id);
    } else {
      newCourtSlots = [
        ...courtSlots,
        { slot, status: slot?.availabilityStatus || "available" },
      ]; // Use availabilityStatus
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

  // Handle status change for a specific slot
  const handleStatusChange = (courtId, slotId, newStatus) => {
    setSelectedSlots((prev) => {
      const courtSlots = prev[courtId] || [];
      const updatedCourtSlots = courtSlots.map((item) =>
        item.slot?._id === slotId ? { ...item, status: newStatus } : item
      );
      return { ...prev, [courtId]: updatedCourtSlots };
    });
  };

  // Handle remove slot
  const handleRemoveSlot = (courtId, slotId) => {
    setSelectedSlots((prev) => {
      const courtSlots = prev[courtId] || [];
      const updatedCourtSlots = courtSlots.filter(
        (item) => item.slot?._id !== slotId
      );
      if (updatedCourtSlots.length === 0) {
        const { [courtId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [courtId]: updatedCourtSlots };
    });
  };

  // Handle apply common status to all selected slots
  const handleApplyToAll = () => {
    if (!commonStatus) {
      showInfo("Please select a status to apply.");
      return;
    }
    setSelectedSlots((prev) => {
      const newSelectedSlots = {};
      Object.entries(prev).forEach(([courtId, courtSlots]) => {
        newSelectedSlots[courtId] = courtSlots.map((item) => ({
          ...item,
          status: commonStatus,
        }));
      });
      return newSelectedSlots;
    });
    // setCommonStatus(""); // Reset after apply
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
  }, [courts]);

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
    const slotsPayload = [];
    Object.entries(selectedSlots).forEach(([courtId, slotArray]) => {
      const court = courts.find((c) => c._id === courtId);
      slotArray.forEach(({ slot, status }) => {
        slotsPayload.push({
          slotId: slot?._id,
          businessHours: {
            time: businessHours?.[0]?.time,
            _id: businessHours?.[0]?._id,
          },
          slotTimes: [
            {
              _id: slot?._id,
              time: slot?.time,
              amount: slot?.amount || 0,
              status: status,
            },
          ],
          courtName: court?.courtName,
          courtId: court?._id,
        });
      });
    });

    if (slotsPayload.length === 0) {
      showInfo("Please select at least one time slot for a court.");
      return;
    }

    try {
      const payload = {
        _id: activeCourtsData?.[0]?._id,
        businessHoursUpdates: slotsPayload[0]?.businessHours || [],
        slotTimesUpdates: slotsPayload.flatMap((slot) =>
          slot?.slotTimes.map((st) => ({
            _id: st._id,
            availabilityStatus: st.status,
            courtId: slot?.courtId,
          }))
        ),
        ownerId: Owner?._id,
      };

      await dispatch(updateCourt(payload)).unwrap();
      setSelectedSlots({});
      setSelectedCourts([]);
      setCommonStatus("");
    } catch (error) {
      showError("Failed to update slot status.");
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
                Court Availability
              </h5>
            </Col>
            <Col md={6} className="text-end">
              <Button
                className="bg-transparent border-0"
                onClick={() => {
                  navigate(-1);
                  dispatch(resetOwnerClub());
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
                            setSelectedSlots({}); // Clear selected slots on date change
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
                    className="d-flex gap-2 overflow-auto flex-grow-1"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {dates?.map((d, i) => {
                      const isSelected = selectedDate === d?.fullDate;
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
                            setSelectedDate(d?.fullDate);
                            setSelectedDay(dayFullNames[d?.day]);
                            setSelectedSlots({}); // Clear selected slots on date change
                          }}
                        >
                          <div className="text-center pb-2">
                            <div
                              style={{ fontSize: "14px", fontWeight: "400" }}
                            >
                              {d?.day}
                            </div>
                            <div
                              style={{ fontSize: "24px", fontWeight: "600" }}
                            >
                              {d?.date}
                            </div>
                            <div
                              style={{ fontSize: "14px", fontWeight: "400" }}
                            >
                              {d?.month}
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
                  {(() => {
                    const filteredSlotTimes = slotTimes?.filter((slot) => {
                      const slotDate = new Date(selectedDate);
                      const [hourString, period] = slot?.time
                        ?.toLowerCase()
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
                      const isAvailable =
                        slot?.availabilityStatus === "available" &&
                        slot?.status !== "booked";

                      return showUnavailable || (isAvailable && !isPast);
                    });

                    return filteredSlotTimes?.length === 0 ? (
                      <div
                        className="d-flex text-danger justify-content-center align-items-center w-100"
                        style={{ height: "10vh", fontFamily: "Poppins" }}
                      >
                        No slots available
                      </div>
                    ) : (
                      filteredSlotTimes?.map((slot, i) => {
                        const slotDate = new Date(selectedDate);
                        const [hourString, period] = slot?.time
                          ?.toLowerCase()
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
                        const courtSelectedSlots =
                          selectedSlots[selectedCourts[0]] || [];
                        const isSelected = courtSelectedSlots.some(
                          (t) => t?.slot?._id === slot?._id
                        );
                        const status = slot?.availabilityStatus || "available";
                        const isBooked = slot?.status === "booked";
                        const isDisabled = isPast || isBooked;

                        const tooltipText =
                          status.charAt(0).toUpperCase() + status.slice(1);

                        const buttonEl = (
                          <span className="d-inline-block">
                            <button
                              className={`btn border-0 rounded-pill table-data px-4 py-1 shadow-sm ${
                                isSelected
                                  ? "bg-dark text-white"
                                  : isPast
                                  ? "bg-secondary-subtle"
                                  : isBooked
                                  ? "bg-danger text-white"
                                  : statusColorMap[status] || "bg-light"
                              }`}
                              onClick={() => toggleTime(slot)}
                              disabled={isDisabled}
                              style={{
                                backgroundColor: isSelected
                                  ? "#374151"
                                  : isPast || isBooked
                                  ? undefined
                                  : statusColorMap[status],
                                color: isSelected
                                  ? "white"
                                  : isPast ||
                                    status === "available" ||
                                    status === "maintenance" ||
                                    status === "weather conditions"
                                  ? "black"
                                  : undefined,
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                fontFamily: "Poppins",
                                fontSize: "14px",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {isBooked ? "Booked" : formatSlotTime(slot?.time)}
                            </button>
                          </span>
                        );

                        return isDisabled ? (
                          buttonEl
                        ) : (
                          <OverlayTrigger
                            key={i}
                            placement="top"
                            overlay={<Tooltip>{tooltipText}</Tooltip>}
                          >
                            {buttonEl}
                          </OverlayTrigger>
                        );
                      })
                    );
                  })()}
                </div>
              )}
            </Col>
            <Col md={4} className="py-4 px-3">
              <div
                className="shadow rounded-3 p-3 bg-white"
                style={{ minHeight: "50vh" }}
              >
                <div className="mt-2">
                  <h6
                    style={{
                      fontFamily: "Poppins",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Selected Slots
                  </h6>
                  {/* Apply to All Section */}
                  {Object.values(selectedSlots)?.flat()?.length > 2 && (
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Form.Select
                        value={commonStatus}
                        onChange={(e) => setCommonStatus(e.target.value)}
                        style={{
                          fontFamily: "Poppins",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select Status</option>
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </Form.Select>
                      <Button
                        variant="outline-primary"
                        className="rounded px-3 py-1 text-nowrap"
                        onClick={handleApplyToAll}
                        style={{
                          fontFamily: "Poppins",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        Apply to All
                      </Button>
                    </div>
                  )}

                  {/* Selected Slots List */}
                  <div
                    style={{
                      height: "33vh",
                      overflowY: "auto",
                      paddingRight: "10px",
                    }}
                  >
                    {Object.entries(selectedSlots)?.length === 0 ? (
                      <div
                        className="text-muted d-flex align-items-center justify-content-center py-3"
                        style={{
                          fontFamily: "Poppins",
                          fontSize: "14px",
                          height: "33vh",
                        }}
                      >
                        No slots selected
                      </div>
                    ) : (
                      Object.entries(selectedSlots).map(
                        ([courtId, slotArray]) => {
                          const court = courts.find((c) => c?._id === courtId);
                          return (
                            <div
                              key={courtId}
                              className="mb-3 border-bottom pb-2"
                            >
                              <div className="d-flex justify-content-between">
                                <div
                                  className="mb-2"
                                  style={{
                                    fontFamily: "Poppins",
                                    fontWeight: "500",
                                    color: "#374151",
                                    fontSize: "14px",
                                  }}
                                >
                                  {court?.courtName}
                                </div>
                                <span>
                                  {format(
                                    new Date(selectedDate),
                                    "EEE, dd/MM/yyyy"
                                  )}
                                </span>
                              </div>
                              {slotArray.map(({ slot, status }) => (
                                <div
                                  key={slot?._id}
                                  className="d-flex align-items-center justify-content-between mb-2 bg-light p-2 rounded"
                                  style={{ border: "1px solid #e9ecef" }}
                                >
                                  <span
                                    style={{
                                      fontFamily: "Poppins",
                                      fontSize: "14px",
                                      flex: "1",
                                    }}
                                  >
                                    {slot?.time}
                                  </span>
                                  <Form.Select
                                    value={status}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        courtId,
                                        slot?._id,
                                        e.target.value
                                      )
                                    }
                                    style={{
                                      width: "190px",
                                      fontFamily: "Poppins",
                                      fontSize: "14px",
                                      marginRight: "10px",
                                    }}
                                  >
                                    {statusOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option.charAt(0).toUpperCase() +
                                          option.slice(1)}
                                      </option>
                                    ))}
                                  </Form.Select>
                                  <Button
                                    variant="outline-danger"
                                    className="p-1"
                                    onClick={() =>
                                      handleRemoveSlot(courtId, slot?._id)
                                    }
                                    style={{
                                      fontSize: "12px",
                                    }}
                                  >
                                    <FaTrash />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          );
                        }
                      )
                    )}
                  </div>
                  {Object.entries(selectedSlots)?.length > 0 && (
                    <div className="d-flex justify-content-end gap-3 align-items-end mt-2">
                      <button
                        className="btn btn-secondary rounded-pill px-4 py-2 shadow-sm"
                        style={{
                          minWidth: "120px",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                          fontSize: "14px",
                        }}
                        onClick={() => {
                          setSelectedSlots({});
                          setSelectedCourts([]);
                          setCommonStatus("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn text-white rounded-pill px-4 py-2 shadow-sm"
                        style={{
                          minWidth: "120px",
                          fontWeight: "500",
                          backgroundColor: "#22c55e",
                          fontFamily: "Poppins",
                          fontSize: "14px",
                        }}
                        onClick={handleConfirm}
                      >
                        {updateClubLoading ? (
                          <ButtonLoading color="white" size={12} />
                        ) : (
                          "Confirm"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
};

export default CourtAvailability;
