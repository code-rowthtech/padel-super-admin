import React, { useRef, useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
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
import "react-datepicker/dist/react-datepicker.css";
import { formatSlotTime } from "../../../../helpers/Formatting";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { searchUserByNumber } from "../../../../redux/admin/searchUserbynumber/thunk";
import { resetSearchData } from "../../../../redux/admin/searchUserbynumber/slice";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

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
  const searchUserData = useSelector(
    (state) => state.searchUserByNumber.getSearchData
  );
  const searchUserDataLoading = useSelector(
    (state) => state.searchUserByNumber.getSearchLoading
  );
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const dateRefs = useRef({});
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [userTypedName, setUserTypedName] = useState(false);

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
  const [allCourtsList, setAllCourtsList] = useState([]);
  const scrollRef = useRef(null);
  const selectedButtonRef = useRef(null);

  const slotTimes = activeCourtsData?.data?.[0]?.slot?.[0]?.slotTimes || [];

  const handleCourtSelect = (courtId) => {
    setSelectedCourts(courtId ? [courtId] : []);
  };

  const toggleTime = (slot) => {
    if (!selectedCourts[0]) {
      showInfo("Please select a court first.");
      return;
    }

    const courtId = selectedCourts[0];
    const dateSlots = selectedSlots[selectedDate] || {};
    const courtData = dateSlots[courtId] || { slots: [], businessHours: [] };
    const courtSlots = courtData.slots;
    const exists = courtSlots.some((t) => t._id === slot?._id);

    const totalSlots = Object.values(selectedSlots).reduce(
      (acc, ds) =>
        acc + Object.values(ds).reduce((acc2, cd) => acc2 + cd.slots.length, 0),
      0
    );

    if (!exists) {
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

    const selectedCourtData = activeCourtsData?.data?.find(
      (c) => c._id === courtId
    );
    const slotData = selectedCourtData?.slot?.[0];
    const formattedBusinessHours =
      slotData?.businessHours?.map((bh) => ({
        time: bh.time,
        day: bh.day,
      })) || [];

    const newCourtData = {
      slots: newCourtSlots,
      businessHours: formattedBusinessHours,
    };

    let newDateSlots;
    if (newCourtSlots.length === 0) {
      const { [courtId]: _, ...rest } = dateSlots;
      newDateSlots = rest;
    } else {
      newDateSlots = { ...dateSlots, [courtId]: newCourtData };
    }

    let newSelectedSlots;
    if (Object.keys(newDateSlots).length === 0) {
      const { [selectedDate]: _, ...rest } = selectedSlots;
      newSelectedSlots = rest;
    } else {
      newSelectedSlots = { ...selectedSlots, [selectedDate]: newDateSlots };
    }

    setSelectedSlots(newSelectedSlots);
  };

  const removeSlot = (date, courtId, slotId) => {
    const dateSlots = selectedSlots[date] || {};
    const courtData = dateSlots[courtId] || { slots: [] };
    const newCourtSlots = courtData.slots.filter((t) => t._id !== slotId);

    const newCourtData = { ...courtData, slots: newCourtSlots };

    let newDateSlots;
    if (newCourtSlots.length === 0) {
      const { [courtId]: _, ...rest } = dateSlots;
      newDateSlots = rest;
    } else {
      newDateSlots = { ...dateSlots, [courtId]: newCourtData };
    }

    let newSelectedSlots;
    if (Object.keys(newDateSlots).length === 0) {
      const { [date]: _, ...rest } = selectedSlots;
      newSelectedSlots = rest;
    } else {
      newSelectedSlots = { ...selectedSlots, [date]: newDateSlots };
    }

    setSelectedSlots(newSelectedSlots);
  };

  const clearSessionStorage = () => {
    setSelectedSlots({});
    setUserTypedName(false);
  };

  const KEY = "manual-booking-slots";

  useEffect(() => {
    const saved = sessionStorage.getItem(KEY);
    if (saved) {
      let parsed = JSON.parse(saved);
      const today = new Date().setHours(0, 0, 0, 0);
      parsed = Object.fromEntries(
        Object.entries(parsed).filter(
          ([date]) => new Date(date).setHours(0, 0, 0, 0) >= today
        )
      );
      setSelectedSlots(parsed);
    }
    dispatch(getOwnerRegisteredClub({ ownerId: ownerId })).unwrap();
  }, []);

  useEffect(() => {
    if (Object.keys(selectedSlots).length > 0) {
      sessionStorage.setItem(KEY, JSON.stringify(selectedSlots));
    } else {
      sessionStorage.removeItem(KEY);
    }
  }, [selectedSlots]);

  useEffect(() => {
    if (ownerClubData?.[0]?._id && !selectedCourts[0]) {
      dispatch(
        getActiveCourts({
          register_club_id: ownerClubData?.[0]?._id,
          day: selectedDay,
          date: selectedDate,
          courtId: "",
        })
      );
    }
  }, [ownerClubData?.[0]?._id, selectedDay, selectedDate]);

  useEffect(() => {
    if (ownerClubData?.[0]?._id && selectedCourts[0]) {
      dispatch(
        getActiveCourts({
          register_club_id: ownerClubData?.[0]?._id,
          day: selectedDay,
          date: selectedDate,
          courtId: selectedCourts[0],
        })
      );
    }
  }, [selectedCourts[0], selectedDay, selectedDate]);

  useEffect(() => {
    if (activeCourtsData?.allCourts?.[0]?.court) {
      setAllCourtsList(activeCourtsData.allCourts[0].court);
    } else if (activeCourtsData?.data && allCourtsList.length === 0) {
      setAllCourtsList(activeCourtsData.data);
    }
  }, [activeCourtsData]);

  useEffect(() => {
    if (allCourtsList?.length > 0 && selectedCourts.length === 0) {
      setSelectedCourts([allCourtsList[0]._id]);
    }
  }, [allCourtsList?.length]);

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
    Object.entries(selectedSlots).forEach(([date, dateSlots]) => {
      Object.entries(dateSlots).forEach(([courtId, courtData]) => {
        const { slots, businessHours } = courtData;
        const court = allCourtsList.find((c) => c._id === courtId) || {
          courtName: "Unknown",
        };

        slots.forEach((timeSlot) => {
          slotsPayload.push({
            slotId: timeSlot?._id,
            businessHours: businessHours,
            slotTimes: [
              {
                time: timeSlot?.time,
                amount: timeSlot?.amount || 0,
              },
            ],
            courtName: court?.courtName,
            courtId: court?._id,
            bookingDate: new Date(date).toISOString(),
          });
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
        bookingStatus: "upcoming",
        bookingType: "manual",
        phoneNumber: phone,
        name: name,
        ownerId: Owner?._id,
      };
      await dispatch(manualBookingByOwner(payload)).unwrap();
      setShowSuccess(true);
      setName("");
      setPhone("");
      setSelectedSlots({});
      sessionStorage.removeItem(KEY);
    } catch (error) {}
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const scrollLeft = scrollRef.current.scrollLeft;
        const containerWidth = scrollRef.current.clientWidth;
        const scrollWidth = scrollRef.current.scrollWidth;
        const scrollPercentage = scrollLeft / (scrollWidth - containerWidth);

        const visibleIndex = Math.floor(scrollPercentage * (dates.length - 1));
        const visibleDate = dates[visibleIndex]?.fullDate;

        if (visibleDate) {
          const month = new Date(visibleDate).toLocaleDateString("en-US", {
            month: "long",
          });
        }
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [dates]);

  const getCurrentMonth = (selectedDate) => {
    if (!selectedDate) return "Month";
    const dateObj = new Date(selectedDate);
    const month = dateObj
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    return month.split("").join("\n");
  };

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  useEffect(() => {
    if (phone.length === 10) {
      dispatch(searchUserByNumber({ phoneNumber: phone }));
    }
  }, [phone, dispatch]);

  useEffect(() => {
    if (searchUserData?.result?.name && phone.length === 10) {
      if (!name || name.trim() === "") {
        setName(searchUserData.result.name);
      }
    }
  }, [searchUserData, phone]);

  useEffect(() => {
    if (phone.length === 10 && searchUserData?.result?.name) {
      setName(searchUserData.result.name);
    } else if (phone.length === 9 || phone.length === 9 || phone.length === 0) {
      dispatch(resetSearchData());
    }
  }, [searchUserData, phone]);

  return (
    <>
      {ownerClubLoading ? (
        <Loading />
      ) : (
        <Container className="p-0" fluid>
          <div className="d-flex justify-content-between align-items-center mb-2">
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
          </div>
          <Row
            className="mx-auto  bg-white shadow-sm rounded-3"
            style={{ height: "83vh" }}
          >
            <Col xs={12} lg={8} className="p-2 p-md-4">
              <div className="mb-3 mb-md-4">
                <div
                  className="all-matches mb-2"
                  style={{
                    color: "#374151",
                  }}
                >
                  Select Court
                </div>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {allCourtsList?.map((court) => (
                    <button
                      key={court._id}
                      type="button"
                      onClick={() => handleCourtSelect(court._id)}
                      className="btn py-2 shadow-sm"
                      style={{
                        borderRadius: "12px",
                        minWidth: "90px",
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
                        fontSize: "12px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.border = "1px solid #3DBE64")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.border = "2px solid #4949491A")
                      }
                    >
                      {court.courtName}
                    </button>
                  ))}
                </div>
              </div>

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
                      className="rounded px-1 ms-2 "
                      style={{
                        cursor: "pointer",
                        width: "22px",
                        height: "22px",
                      }}
                      onClick={() => setIsOpen(!isOpen)}
                    >
                      <i
                        className="bi bi-calendar2-week"
                        style={{ width: "12px", height: "12px" }}
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
                            slotProps={{
                              actionBar: { actions: [] },
                            }}
                          />
                        </LocalizationProvider>
                      </div>
                    )}
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3 gap-2 ">
                  <div
                    className="d-flex justify-content-center p-0 mb-3 align-items-center rounded-pill"
                    style={{
                      backgroundColor: "#f3f3f5",
                      width: "30px",
                      height: "58px",
                    }}
                  >
                    <span
                      className="text-muted mb-0"
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        whiteSpace: "pre-line",
                        textAlign: "center",
                        lineHeight: "1",
                        letterSpacing: "0px",
                      }}
                    >
                      {getCurrentMonth(selectedDate)}
                    </span>
                  </div>
                  <div
                    className="d-flex gap-1"
                    style={{ position: "relative", maxWidth: "95%" }}
                  >
                    <button
                      className="btn p-2 border-0"
                      style={{
                        position: "absolute",
                        left: -65,
                        zIndex: 10,
                        boxShadow: "none",
                      }}
                      onClick={scrollLeft}
                    >
                      <IoIosArrowBack className="mt-2" size={20} />
                    </button>
                    <div
                      ref={scrollRef}
                      className="d-flex gap-1"
                      style={{
                        scrollBehavior: "smooth",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                        overflow: "hidden",
                      }}
                    >
                      {dates?.map((d, i) => {
                        const formatDate = (date) => {
                          return date.toISOString().split("T")[0];
                        };
                        const isSelected =
                          formatDate(new Date(selectedDate)) === d.fullDate;
                        const dateSlots = selectedSlots[d.fullDate] || {};
                        const slotCount = Object.values(dateSlots).reduce(
                          (acc, courtData) =>
                            acc + (courtData.slots?.length || 0),
                          0
                        );

                        return (
                          <button
                            key={i}
                            ref={(el) => (dateRefs.current[d.fullDate] = el)}
                            className={`calendar-day-btn mb-3 me-2 position-relative ${
                              isSelected ? "text-white" : "bg-white"
                            }`}
                            style={{
                              backgroundColor: isSelected
                                ? "#374151"
                                : "#FFFFFF",
                              boxShadow: isSelected
                                ? "0px 4px 4px 0px #00000040"
                                : "",
                              borderRadius: "12px",
                              color: isSelected ? "#FFFFFF" : "#374151",
                              border: "1px solid #4949491A",
                              width: "55px",
                              height: "75px",
                              position: "relative",
                            }}
                            onClick={() => {
                              setSelectedDate(d.fullDate);
                              setSelectedDay(dayFullNames[d.day]);
                            }}
                            onMouseEnter={(e) =>
                              !isSelected &&
                              (e.currentTarget.style.border =
                                "1px solid #3DBE64")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.border =
                                "1px solid #4949491A")
                            }
                          >
                            <div className="text-center">
                              <div className="date-center-date fw-semibold">
                                {d.date}
                              </div>
                              <div className="date-center-day small ">
                                {d.day}
                              </div>
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
                                  backgroundColor: "#22c55e",
                                }}
                              >
                                {slotCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      className="btn border-0 p-2"
                      style={{
                        position: "absolute",
                        right: -26,
                        zIndex: 10,
                        boxShadow: "none",
                      }}
                      onClick={scrollRight}
                    >
                      <IoIosArrowForward className="mt-2" size={20} />
                    </button>
                  </div>
                </div>
                <hr />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p
                    className="mb-0 all-matches"
                    style={{
                      color: "#374151",
                    }}
                  >
                    Available Slots
                    <span
                      className="text-muted ps-2"
                      style={{
                        fontSize: "12px",
                        fontFamily: "Poppins",
                        fontWeight: "500",
                      }}
                    >
                      (60m)
                    </span>
                  </p>
                  <div className="form-switch d-flex justify-content-lg-center align-items-center gap-2">
                    <label
                      className="form-check-label"
                      htmlFor="flexSwitchCheckDefault"
                      style={{
                        whiteSpace: "nowrap",
                        fontFamily: "Poppins",
                        color: "#626262",
                      }}
                    >
                      Show Unavailable Slots
                    </label>
                    <input
                      className="form-check-input fs-5 ms-1 mb-2"
                      type="checkbox"
                      role="switch"
                      id="flexSwitchCheckDefault"
                      checked={showUnavailable}
                      onChange={(e) => setShowUnavailable(e.target.checked)}
                      style={{ boxShadow: "none" }}
                    />
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
                          const dateSlots = selectedSlots[selectedDate] || {};
                          const courtId = selectedCourts[0];
                          const courtSlots = dateSlots[courtId]?.slots || [];

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
                              const isSelected = courtSlots?.some(
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
                              ({
                                isPast,
                                isBooked,
                                isAvailable,
                                hasAmount,
                              }) => {
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
                                style={{
                                  height: "10vh",
                                  fontFamily: "Poppins",
                                }}
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
                              else if (!isAvailable)
                                tooltipText = "Unavailable";
                              else tooltipText = "Book Now";

                              const buttonEl = (
                                <span className="d-inline-block">
                                  <button
                                    className={`border rounded-3 slot-time-btn text-nowrap py-1 ${
                                      isBooked ? "bg-danger text-white" : ""
                                    }`}
                                    onClick={() => toggleTime(slot)}
                                    disabled={
                                      isPast ||
                                      isBooked ||
                                      !hasAmount ||
                                      !isAvailable
                                    }
                                    style={{
                                      backgroundColor:
                                        slot.status === "booked" || isPast
                                          ? "#c9cfcfff"
                                          : isSelected
                                          ? "#374151"
                                          : slot.availabilityStatus !==
                                            "available"
                                          ? "#c9cfcfff"
                                          : "#FFFFFF",
                                      border: "2px solid #4949491A",
                                      cursor:
                                        !hasAmount ||
                                        !isAvailable ||
                                        isBooked ||
                                        isPast
                                          ? "not-allowed"
                                          : "pointer",
                                      fontFamily: "Poppins",
                                      fontSize: "14px",
                                      transition: "all 0.2s ease",
                                      color:
                                        slot.status === "booked" || isPast
                                          ? "#000000"
                                          : isSelected
                                          ? "white"
                                          : "#000000",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.border =
                                        "1px solid #3DBE64")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.border =
                                        "2px solid #4949491A")
                                    }
                                  >
                                    {isBooked
                                      ? "Booked"
                                      : formatSlotTime(slot?.time)}
                                  </button>
                                </span>
                              );

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
              </div>
            </Col>
            <Col xs={12} lg={4} className="py-2  py-md-4 px-2 mt-lg-4  px-md-3">
              <div
                className=" rounded-3 p-2 p-md-3  "
                style={{ minHeight: "40vh" }}
              >
                <div
                  className="all-matches d-flex justify-content-between align-items-center mb-3"
                  style={{ color: "#374151" }}
                >
                  Selected Bookings
                  {Object.values(selectedSlots).reduce(
                    (acc, dateSlots) =>
                      acc +
                      Object.values(dateSlots).reduce(
                        (acc2, { slots }) => acc2 + slots.length,
                        0
                      ),
                    0
                  ) >= 4 && (
                    <Button
                      size="sm"
                      className="rounded-pill border-0 text-primary bg-white"
                      onClick={clearSessionStorage}
                      style={{ fontSize: "12px", padding: "4px 10px" }}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <div
                  className={`${
                    Object.keys(selectedSlots)?.length === 0 ? "" : "bg-light"
                  }`}
                  style={{
                    height: "26vh",
                    overflowY: "auto",
                    overflowX: "hidden",
                    fontFamily: "Poppins",
                    fontSize: "14px",
                    paddingRight: "16px",
                    marginRight: "8px",
                  }}
                >
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      width: 8px;
                      border-radius: 3px;
                    }
                    div::-webkit-scrollbar-track {
                      background: #f5f5f5;
                      border-radius: 3px;
                    }
                    div::-webkit-scrollbar-thumb {
                      background: #626262;
                    }
                    div::-webkit-scrollbar-thumb:hover {
                      background: #626262;
                    }
                  `}</style>
                  {Object.keys(selectedSlots)?.length === 0 ? (
                    <div
                      className="d-flex text-danger justify-content-center align-items-center"
                      style={{ height: "26vh" }}
                    >
                      No selections yet
                    </div>
                  ) : (
                    <div>
                      {Object.entries(selectedSlots)
                        .sort(
                          ([dateA], [dateB]) =>
                            new Date(dateA) - new Date(dateB)
                        )
                        .map(([date, dateSlots]) =>
                          Object.entries(dateSlots).map(
                            ([courtId, courtData]) => {
                              const court = allCourtsList.find(
                                (c) => c?._id === courtId
                              ) || { courtName: "Unknown" };
                              const slots = courtData?.slots;
                              return (
                                <React.Fragment key={`${date}-${courtId}`}>
                                  {slots?.map((slot) => (
                                    <div
                                      key={slot?._id}
                                      className="row mb-2 pt-2 ps-2 "
                                    >
                                      <div className="col-12 d-flex gap-2 mb-0 m-0 align-items-center justify-content-between">
                                        <div
                                          className="d-flex"
                                          style={{ color: "#000000" }}
                                        >
                                          <span
                                            style={{
                                              fontWeight: "600",
                                              fontFamily: "Poppins",
                                              fontSize: "14px",
                                            }}
                                          >
                                            {new Date(date).toLocaleString(
                                              "en-US",
                                              { day: "2-digit" }
                                            )}
                                            ,{" "}
                                            {new Date(date).toLocaleString(
                                              "en-US",
                                              { month: "short" }
                                            )}
                                          </span>
                                          <span
                                            className="ps-2"
                                            style={{
                                              fontWeight: "600",
                                              fontFamily: "Poppins",
                                              fontSize: "14px",
                                            }}
                                          >
                                            {slot?.time
                                              ?.replace(" am", ":00 am")
                                              .replace(" pm", ":00 pm")}
                                          </span>
                                          <span
                                            className="ps-2"
                                            style={{
                                              fontWeight: "500",
                                              fontFamily: "Poppins",
                                              fontSize: "13px",
                                            }}
                                          >
                                            {court.courtName}
                                          </span>
                                        </div>
                                        <div>
                                          ₹
                                          <span
                                            className="ps-1"
                                            style={{
                                              fontWeight: "600",
                                              fontFamily: "Poppins",
                                            }}
                                          >
                                            {slot?.amount || "N/A"}
                                          </span>
                                          <FaTrash
                                            className="ms-2 mb-1 text-danger"
                                            style={{
                                              cursor: "pointer",
                                              fontSize: "12px",
                                            }}
                                            onClick={() =>
                                              removeSlot(
                                                date,
                                                courtId,
                                                slot?._id
                                              )
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </React.Fragment>
                              );
                            }
                          )
                        )}
                    </div>
                  )}
                </div>
                {Object.values(selectedSlots).some((ds) =>
                  Object.values(ds).some(({ slots }) => slots.length > 0)
                ) && (
                  <div className="mt-2 p-2 rounded ">
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
                        {Object.values(selectedSlots).reduce(
                          (acc, dateSlots) =>
                            acc +
                            Object.values(dateSlots).reduce(
                              (acc2, { slots }) =>
                                acc2 +
                                slots.reduce(
                                  (acc3, s) => acc3 + (s.amount || 0),
                                  0
                                ),
                              0
                            ),
                          0
                        )}
                      </span>
                      <span style={{ fontSize: "14px", color: "#374151" }}>
                        {Object.values(selectedSlots).reduce(
                          (acc, dateSlots) =>
                            acc +
                            Object.values(dateSlots).reduce(
                              (acc2, { slots }) => acc2 + slots.length,
                              0
                            ),
                          0
                        )}{" "}
                        Slots
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
                          value={searchUserDataLoading ? "Loading...." : name}
                          onChange={(e) => {
                            let value = e.target.value;
                            value = value.replace(/[^a-zA-Z\s]/g, "");
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
                          disabled={manualBookingLoading}
                          onClick={() => {
                            setName("");
                            setPhone("");
                            setSelectedSlots({});
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
                          disabled={!name || !phone || manualBookingLoading}
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
              dispatch(
                getActiveCourts({
                  register_club_id: ownerClubData?.[0]?._id,
                  day: selectedDay,
                  date: selectedDate,
                  courtId: selectedCourts[0],
                })
              );
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
