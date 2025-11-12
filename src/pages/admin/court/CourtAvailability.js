import { useRef, useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Row,
  Form,
  OverlayTrigger,
  Tooltip,
  Badge,
} from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  getOwnerRegisteredClub,
  getActiveCourts,
  updateCourt,
} from "../../../redux/thunks";
import { useDispatch, useSelector } from "react-redux";
import { ButtonLoading, DataLoading, Loading } from "../../../helpers/loading/Loaders";
import { showError, showInfo, showSuccess } from "../../../helpers/Toast";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { formatSlotTime } from "../../../helpers/Formatting";
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md";

const CourtAvailability = () => {
  const dispatch = useDispatch();
  const dateRefs = useRef({});
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
  const [showUnavailable, setShowUnavailable] = useState(false);

  const [selectedSlots, setSelectedSlots] = useState({});
  const [selectedCourt, setSelectedCourt] = useState("");

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

  const [commonStatus, setCommonStatus] = useState("");

  const statusOptions = [
    "available",
    "maintenance",
    "weather conditions",
    "staff unavailability",
  ];

  const statusColorMap = {
    available: "#c7fdd4ff",
    maintenance: "#fceec0ff",
    "weather conditions": "#b4eef8ff",
    "staff unavailability": "#ffd1d5ff",
  };

  // बाहर क्लिक → डेट पिकर बंद
  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 41 दिनों की लिस्ट
  const today = new Date();
  const maxSelectableDate = new Date();
  maxSelectableDate.setDate(maxSelectableDate.getDate() + 15);

  const dates = Array.from({ length: 15 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: date.getDate(),
      fullDate: date.toISOString().split("T")[0],
    };
  });

  const courts = activeCourtsData?.[0]?.courts || [];
  const slotTimes = activeCourtsData?.[0]?.slot?.[0]?.slotTimes || [];
  const businessHours = activeCourtsData?.[0]?.slot?.[0]?.businessHours || [];


  // कोर्ट सिलेक्ट (सिर्फ एक)
  const handleCourtSelect = (courtId) => {
    setSelectedCourt(courtId);
  };

  // टाइम स्लॉट टॉगल
  const toggleTime = (slot) => {
    if (!selectedCourt) {
      showInfo("Please select a court first.");
      return;
    }

    const dateKey = selectedDate;
    const courtSlots = selectedSlots[dateKey]?.[selectedCourt] || [];
    const exists = courtSlots.some((s) => s.slot._id === slot._id);

    if (!exists) {
      const totalSelected = Object.values(selectedSlots).reduce(
        (acc, dateData) =>
          acc + Object.values(dateData).reduce((a, c) => a + c.length, 0),
        0
      );
      if (totalSelected >= 15) {
        showInfo("Maximum 15 slots can be selected at a time.");
        return;
      }
    }

    let newCourtSlots = exists
      ? courtSlots.filter((s) => s.slot._id !== slot._id)
      : [...courtSlots, { slot, status: slot?.availabilityStatus || "available" }];

    const newDateSlots = { ...selectedSlots[dateKey], [selectedCourt]: newCourtSlots };

    let newSelectedSlots;
    if (newCourtSlots.length === 0) {
      const { [selectedCourt]: _, ...restCourts } = newDateSlots;
      if (Object.keys(restCourts).length === 0) {
        const { [dateKey]: _, ...restDates } = selectedSlots;
        newSelectedSlots = restDates;
      } else {
        newSelectedSlots = { ...selectedSlots, [dateKey]: restCourts };
      }
    } else {
      newSelectedSlots = { ...selectedSlots, [dateKey]: newDateSlots };
    }

    setSelectedSlots(newSelectedSlots);
  };

  // स्लॉट डिलीट
  const handleRemoveSlot = (date, courtId, slotId) => {
    setSelectedSlots((prev) => {
      const newCourtSlots = prev[date][courtId].filter(
        (item) => item.slot._id !== slotId
      );
      if (newCourtSlots.length === 0) {
        const { [courtId]: _, ...restCourts } = prev[date];
        if (Object.keys(restCourts).length === 0) {
          const { [date]: _, ...restDates } = prev;
          return restDates;
        }
        return { ...prev, [date]: restCourts };
      }
      return {
        ...prev,
        [date]: { ...prev[date], [courtId]: newCourtSlots },
      };
    });
  };

  // कॉमन स्टेटस चेंज → सभी सिलेक्टेड स्लॉट्स पर लागू
  useEffect(() => {
    if (!commonStatus) return;

    setSelectedSlots((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((date) => {
        Object.keys(updated[date]).forEach((courtId) => {
          updated[date][courtId] = updated[date][courtId].map((item) => ({
            ...item,
            status: commonStatus,
          }));
        });
      });
      return updated;
    });
  }, [commonStatus]);

  // API कॉल्स
  useEffect(() => {
    dispatch(getOwnerRegisteredClub({ ownerId })).unwrap();
  }, []);

  useEffect(() => {
    if (ownerClubData?.[0]?._id) {
      dispatch(
        getActiveCourts({
          register_club_id: ownerClubData[0]._id,
          day: selectedDay,
          date: selectedDate,
          courtId: selectedCourt || "",
        })
      );
    }
  }, [selectedDay, selectedDate, ownerClubData?.[0]?._id, selectedCourt]);

  useEffect(() => {
    if (courts.length > 0 && !selectedCourt) {
      setSelectedCourt(courts[0]._id);
    }
  }, [courts.length, selectedCourt.length]);

  const handleConfirm = async () => {
    const slotsPayload = [];
    const dateSlots = selectedSlots[selectedDate] || {};
    Object.entries(dateSlots).forEach(([courtId, slotArray]) => {
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
      // Remove only the current date's slots after successful update
      setSelectedSlots(prev => {
        const { [selectedDate]: _, ...rest } = prev;
        return rest;
      });
      setSelectedCourt('');
      setCommonStatus("");
    } catch (error) {
      showError("Failed to update slot status.");
    }
  };

  // स्क्रॉल हैंडल
  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  // सभी सिलेक्टेड स्लॉट्स की लिस्ट (फ्लैट)
  const allSelectedSlots = Object.entries(selectedSlots).flatMap(
    ([date, dateData]) =>
      Object.entries(dateData).flatMap(([courtId, slots]) =>
        slots.map((item) => ({ ...item, date, courtId }))
      )
  );

  // मंथ डिस्प्ले
  const getCurrentMonth = (date) =>
    date
      ? new Date(date)
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase()
        .split("")
        .join("\n")
      : "MONTH";

  return (
    <>
      {ownerClubLoading ? (
        <Loading />
      ) : (
        <Container className="p-0" fluid>
          <Row className="mx-auto bg-white shadow-sm rounded-3" style={{ height: "88vh" }}>
            {/* Left Side */}
            <Col xs={12} lg={8} className="p-2 p-md-4">
              {/* Court Selector */}
              <div className="mb-3">
                <div className="all-matches mb-2" style={{ color: "#374151" }}>
                  Select Court
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {courts.map((court) => (
                    <button
                      key={court._id}
                      onClick={() => handleCourtSelect(court._id)}
                      className="btn py-2 shadow-sm"
                      style={{
                        borderRadius: "12px",
                        minWidth: "90px",
                        backgroundColor: selectedCourt === court._id ? "#374151" : "#F3F4F6",
                        color: selectedCourt === court._id ? "#FFF" : "#000",
                        fontWeight: selectedCourt === court._id ? "600" : "400",
                        border: selectedCourt === court._id ? "2px solid #374151" : "1px solid #ccd2d9",
                        fontSize: "12px",
                        fontFamily: "Poppins",
                      }}
                    >
                      {court.courtName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selector */}
              <div className="calendar-strip">
                <div className="calendar-strip">
                  <div
                    className="all-matches mb-3"
                    style={{
                      color: "#374151",
                    }}
                  >
                    Select Date
                    <div
                      className="position-relative d-inline-block"
                      ref={wrapperRef}
                    >
                      <span
                        className="rounded px-1 ms-2"
                        style={{
                          cursor: "pointer",
                          width: "26px",
                          height: "26px",
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
                          className="position-absolute mt-2 z-3 bg-white border rounded shadow"
                          style={{ top: "100%", left: "0", minWidth: "100%" }}
                        >
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <StaticDatePicker
                              displayStaticWrapperAs="desktop"
                              value={startDate}
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
                              slotProps={{
                                actionBar: { actions: [] },
                              }}
                            />
                          </LocalizationProvider>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Replace the date selector section with this code */}
                  <div className="d-flex align-items-center mb-3 gap-2 border-bottom">
                    <div className="d-flex justify-content-center p-0 mb-3 align-items-center rounded-pill" style={{ backgroundColor: "#f3f3f5", width: "30px", height: "58px" }}>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          whiteSpace: "pre-line",
                          textAlign: "center",
                          lineHeight: "1",
                          letterSpacing: "0px",
                          margin: 0,
                          padding: 0,
                          display: "block"
                        }}
                      >
                        {getCurrentMonth(selectedDate)}
                      </span>                    </div>
                    <div className="d-flex gap-1" style={{ position: "relative", maxWidth: "95%" }}>
                      <button className="btn p-2 border-0" style={{ position: "absolute", left: -65, zIndex: 10, boxShadow: "none" }} onClick={scrollLeft}><MdOutlineArrowBackIosNew className="mt-2" size={20} /></button>
                      <div ref={scrollRef} className="d-flex gap-1" style={{ scrollBehavior: "smooth", whiteSpace: "nowrap", maxWidth: "100%", overflow: "hidden" }}>
                        {dates.map((d, i) => {
                          const formatDate = (date) => date.toISOString().split("T")[0];
                          const isSelected = formatDate(new Date(selectedDate)) === d.fullDate;

                          // Calculate slot count for this specific date
                          const dateSlots = selectedSlots[d.fullDate] || {};
                          const slotCount = Object.values(dateSlots).reduce(
                            (acc, courtSlots) => acc + (courtSlots?.length || 0),
                            0
                          );

                          return (
                            <button
                              key={i}
                              ref={(el) => (dateRefs.current[d.fullDate] = el)}
                              className={`calendar-day-btn mb-3 me-1 position-relative ${isSelected ? "text-white border-0" : "bg-white"}`}
                              style={{
                                background: isSelected
                                  ? "#374151"
                                  : "#FFFFFF", boxShadow: isSelected ? "0px 4px 4px 0px #00000040" : "", borderRadius: "12px", color: isSelected ? "#FFFFFF" : "#374151"
                              }}
                              onClick={() => {
                                setSelectedDate(d.fullDate);
                                setSelectedDay(dayFullNames[d.day]);
                              }}
                              onMouseEnter={(e) => !isSelected && (e.currentTarget.style.border = "1px solid #3DBE64")}
                              onMouseLeave={(e) => (e.currentTarget.style.border = "1px solid #4949491A")}
                            >
                              <div className="text-center">
                                <div className="date-center-date">{d.date}</div>
                                <div className="date-center-day">{d.day}</div>
                              </div>
                              {slotCount > 0 && (
                                <span
                                  className="position-absolute badge rounded-pill"
                                  style={{
                                    fontSize: "10px",
                                    width: "18px",
                                    height: "18px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    top: "-1px",
                                    right: "-4px",
                                    zIndex: 2,
                                    backgroundColor: "#22c55e"
                                  }}
                                >
                                  {slotCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <button className="btn border-0 p-2" style={{ position: "absolute", right: -26, zIndex: 10, boxShadow: "none" }} onClick={scrollRight}><MdOutlineArrowForwardIos className="mt-2" size={20} /></button>
                    </div>
                  </div>
                  <style>
                    {`
                                   .custom-scrollbar::-webkit-scrollbar {
                                     height: 6px;
                                   }
                                   .custom-scrollbar::-webkit-scrollbar-track {
                                     background: #f1f5f9;
                                     border-radius: 3px;
                                   }
                                   .custom-scrollbar::-webkit-scrollbar-thumb {
                                     background: #cbd5e1;
                                     border-radius: 3px;
                                   }
                                   .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                     background: #94a3b8;
                                     cursor: pointer;
                                   }
                                 `}
                  </style>
                </div>
              </div>

              {/* Time Slots */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="mb-0 all-matches" style={{ color: "#374151" }}>
                  Available Slots <span className="fs-6 text-muted">(60m)</span>
                </p>
                <div className="form-switch d-flex align-items-center gap-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={showUnavailable}
                    onChange={(e) => setShowUnavailable(e.target.checked)}
                  />
                  <label className="table-data text-dark mb-0" style={{ fontSize: "13px", fontFamily: "Poppins" }}>
                    Show Unavailable Slots
                  </label>
                </div>
              </div>

              {activeCourtsLoading ? (
                <DataLoading height="15vh" />
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
                        const dateSlots = selectedSlots[selectedDate] || {};
                        const courtSelectedSlots = dateSlots[selectedCourt] || [];
                        const isSelected = courtSelectedSlots.some(
                          (t) => t?.slot?._id === slot?._id
                        );
                        const status = slot?.availabilityStatus || "available";
                        const isBooked = slot?.status === "booked";
                        const isDisabled = isPast || isBooked;

                        const tooltipText = isPast
                          ? "Past Time - Cannot Book"
                          : isBooked
                            ? "Booked"
                            : status.charAt(0).toUpperCase() + status.slice(1);

                        const buttonEl = (
                          <button
                            key={slot._id}
                            className="btn border rounded-2 px-4 py-2 shadow-sm"
                            onClick={() => toggleTime(slot)}
                            disabled={isDisabled}
                            style={{
                              backgroundColor: isSelected
                                ? "#374151"
                                : isBooked
                                  ? "#dc3545"
                                  : isPast
                                    ? "#c9cfcfff"
                                    : showUnavailable
                                      ? statusColorMap[status] || "#FFFFFF"
                                      : "#FFFFFF",
                              color: isSelected || isBooked ? "white" : "#000000",
                              fontSize: "12px",
                              fontFamily: "Poppins",
                            }}
                          >
                            {isBooked ? "Booked" : formatSlotTime(slot.time)}
                          </button>
                        );

                        return (
                          <OverlayTrigger
                            key={i}
                            placement="top"
                            overlay={<Tooltip>{tooltipText}</Tooltip>}
                          >
                            <span className="d-inline-block">{buttonEl}</span>
                          </OverlayTrigger>
                        );
                      })
                    );
                  })()}
                </div>
              )}
            </Col>

            {/* Right Side - Selected Slots */}
            <Col xs={12} lg={4} className="py-2 py-md-4 px-2 px-md-3">
              <div className="bg-white rounded-3 p-3" style={{ minHeight: "40vh" }}>
                <h6 className="all-matches" style={{ color: "#374151" }}>
                  Selected Slots
                </h6>

                {/* कॉमन स्टेटस ड्रॉपडाउन (ऊपर) */}
                {allSelectedSlots.length > 0 && (
                  <div className="mb-3">
                    <Form.Select
                      value={commonStatus}
                      onChange={(e) => setCommonStatus(e.target.value)}
                      style={{ fontSize: "12px", fontFamily: "Poppins", boxShadow: "none" }}
                    >
                      <option value="">Select Status</option>
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                )}

                {/* सिलेक्टेड स्लॉट्स लिस्ट */}
                <div className="custom-scrollbar" style={{ maxHeight: "35vh", overflowY: "auto", paddingRight: "8px" }}>
                  <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                      width: 8px;
                      border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: #F5F5F5;
                      border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: #626262;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: #626262;
                    }
                  `}</style>
                  {allSelectedSlots.length === 0 ? (
                    <div className="text-center text-danger py-5" style={{ fontSize: "12px", fontFamily: "Poppins" }}>
                      No slots selected
                    </div>
                  ) : (
                    allSelectedSlots.map(({ slot, status, date, courtId }, idx) => {
                      const court = courts.find((c) => c._id === courtId);
                      const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "short" });
                      const dateObj = new Date(date);
                      const day = dateObj.getDate();
                      const month = dateObj.toLocaleDateString("en-US", { month: "short" });

                      return (
                        <div
                          key={`${date}-${courtId}-${slot._id}`}
                          className="d-flex align-items-center justify-content-between p-2 "
                          style={{
                            backgroundColor: "#f8f9fa",
                            borderBottom: "1px solid #e9ecef",
                            fontFamily: "Poppins",
                          }}
                        >
                          <div className="d-flex flex-column flex-grow-1 me-2">
                            <p className="mb-0" style={{ fontSize: "13px", fontWeight: "500", fontFamily: "Poppins" }}>
                              {dayName} ,
                              {day} {month} ,
                              {slot.time?.toUpperCase()} ,
                              {court?.courtName}
                            </p>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="py-1 ps-2 pe-2 rounded-pill"
                              style={{
                                fontSize: "11px",
                                backgroundColor: statusColorMap[status] || "#6c757d",
                                textTransform: "capitalize"
                              }}
                            >
                              {status}
                            </span>
                            {/* <Badge
                              pill
                              className="border-0 text-white"
                              style={{
                                "--bs-badge-bg": statusColorMap[status] || "#6c757d",
                                fontSize: "11px",
                                textTransform: "capitalize",
                              }}
                            >
                              {status}
                            </Badge> */}

                            <Button
                              size="sm"
                              className="p-1 border-0 bg-transparent"
                              style={{ boxShadow: "none" }}
                              onClick={() => handleRemoveSlot(date, courtId, slot._id)}
                            >
                              <FaTrash className="text-danger" size={10} />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>


                {/* कन्फर्म / कैंसिल */}
                {allSelectedSlots.length > 0 && (
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button
                      className="btn btn-secondary border-0 rounded-pill px-4 py-2 shadow-sm"
                      style={{
                        minWidth: "100px",
                        fontWeight: "500",
                        fontFamily: "Poppins",
                        fontSize: "12px",
                      }}
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedSlots({});
                        setCommonStatus("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="btn text-white border-0 rounded-pill px-4 py-2 shadow-sm"
                      style={{
                        minWidth: "100px",
                        fontWeight: "500",
                        backgroundColor: "#22c55e",
                        fontFamily: "Poppins",
                        fontSize: "12px",
                      }}
                      size="sm"
                      onClick={handleConfirm}
                      disabled={updateClubLoading}
                    >
                      {updateClubLoading ? (
                        <ButtonLoading color="white" size={12} />
                      ) : (
                        "Confirm"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Container >
      )}
    </>
  );
};

export default CourtAvailability;