import React, { useState, useRef, useEffect } from "react";
import {
  booking_dropdown_img,
  booking_dropdown_img2,
  booking_dropdown_img3,
  booking_dropdown_img4,
  booking_logo_img,
  morningTab,
  nighttab,
  sun,
  tennis2,
  twoball,
  bannerimg,
} from "../../../assets/files";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { format } from "date-fns";
import TokenExpire from "../../../helpers/TokenExpire";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowDown,
  MdKeyboardDoubleArrowUp,
  MdOutlineDateRange,
  MdOutlineDeleteOutline,
} from "react-icons/md";
import { getUserSlotBooking } from "../../../redux/user/slot/thunk";
import { getUserClub } from "../../../redux/user/club/thunk";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { FaArrowRight, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Avatar } from "@mui/material";
import { Button, Dropdown } from "react-bootstrap";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { HiMoon } from "react-icons/hi";
import { BsSunFill } from "react-icons/bs";
import { PiSunHorizonFill } from "react-icons/pi";

const parseTimeToHour = (timeStr) => {
  if (!timeStr) return null;
  let hour;
  let period = "am";

  if (typeof timeStr === "string") {
    const timeStrLower = timeStr.toLowerCase();
    if (timeStrLower.endsWith("am") || timeStrLower.endsWith("pm")) {
      period = timeStrLower.slice(-2);
      hour = timeStrLower.slice(0, -2).trim();
    } else {
      const timeParts = timeStrLower.split(" ");
      if (timeParts.length > 1) {
        hour = timeParts[0];
        period = timeParts[1];
      } else {
        hour = timeStrLower;
      }
    }
    hour = parseInt(hour.split(":")[0]);
    if (isNaN(hour)) return null;

    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
  }
  return hour;
};

const filterSlotsByTab = (slot, eventKey) => {
  const slotHour = parseTimeToHour(slot?.time);
  if (slotHour === null) return false;
  switch (eventKey) {
    case "morning":
      return slotHour >= 0 && slotHour < 12;
    case "noon":
      return slotHour >= 12 && slotHour < 17;
    case "night":
      return slotHour >= 17 && slotHour <= 23;
    default:
      return true;
  }
};

const Booking = ({ className = "" }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const user = getUserFromSession();
  console.log({ user });
  const [showUnavailable, setShowUnavailable] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const clubData =
    useSelector((state) => state?.userClub?.clubData?.data?.courts[0]) || [];
  const { slotData } = useSelector((state) => state?.userSlot);
  const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorShow, setErrorShow] = useState(false);
  const logo =
    JSON.parse(localStorage.getItem("logo")) ||
    clubData?.register_club_id?.logo?.[0];
  const [showDropdown, setShowDropdown] = useState(false);
  const dateRefs = useRef({});
  const [key, setKey] = useState("morning");
  const [key2, setKey2] = useState("padel");
  const [expireModal, setExpireModal] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [selectedBuisness, setSelectedBuisness] = useState([]);
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    fullDate: new Date().toISOString().split("T")[0],
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
  });
  const [activeTab, setActiveTab] = useState(0); // Default to morning tab

  const [isExpanded, setIsExpanded] = useState(false);

  const dayShortMap = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };
  const today = new Date();
  const dates = Array.from({ length: 40 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      fullDate: date.toISOString().split("T")[0],
    };
  });

  const getCurrentMonth = (selectedDate) => {
    if (!selectedDate || !selectedDate.fullDate) return "MONTH";
    const dateObj = new Date(selectedDate.fullDate);
    const month = dateObj
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    return month.split("").join("\n");
  };
  useEffect(() => {
    if (slotData?.message === "jwt token is expired") setExpireModal(true);
  }, [slotData?.message]);

  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target))
      setIsOpen(false);
  };

  const MAX_SLOTS = 15;

  const toggleTime = (time, courtId, date) => {
    const totalSlots = selectedCourts.reduce(
      (acc, c) => acc + (c.time?.length || 0),
      0
    );
    const dateKey = date || selectedDate.fullDate;
    const uniqueKey = `${courtId}-${time._id}-${dateKey}`;

    const currentCourtTimes = selectedTimes[courtId]?.[dateKey] || [];
    const isAlreadySelected = currentCourtTimes.some((t) => t._id === time._id);

    if (isAlreadySelected) {
      // Deselect
      const filteredTimes = currentCourtTimes.filter((t) => t._id !== time._id);
      setSelectedTimes((prev) => ({
        ...prev,
        [courtId]: {
          ...prev[courtId],
          [dateKey]: filteredTimes,
        },
      }));
      setSelectedBuisness((prev) =>
        prev.filter((t) => t._id !== time._id || t.date !== dateKey)
      );
      setSelectedCourts((prev) =>
        prev
          .map((court) =>
            court._id === courtId && court.date === dateKey
              ? { ...court, time: court.time.filter((t) => t._id !== time._id) }
              : court
          )
          .filter((court) => court.time.length > 0)
      );
    } else {
      if (totalSlots >= MAX_SLOTS) {
        setErrorMessage(
          `Slot Limit Reached\nYou can select up to ${MAX_SLOTS} slots only.`
        );
        setErrorShow(true);
        return;
      }

      const newTimes = [...currentCourtTimes, { ...time, date: dateKey }];
      setSelectedTimes((prev) => ({
        ...prev,
        [courtId]: {
          ...prev[courtId],
          [dateKey]: newTimes,
        },
      }));
      setSelectedBuisness((prev) => [...prev, { ...time, date: dateKey }]);

      const currentCourt = slotData?.data?.find((c) => c._id === courtId);
      if (currentCourt) {
        setSelectedCourts((prev) => {
          const existingCourt = prev.find(
            (c) => c._id === courtId && c.date === dateKey
          );
          const newTimeEntry = {
            _id: time._id,
            time: time.time,
            amount: time.amount,
          };
          return existingCourt
            ? prev.map((court) =>
              court._id === courtId && court.date === dateKey
                ? { ...court, time: [...court.time, newTimeEntry] }
                : court
            )
            : [
              ...prev,
              {
                _id: currentCourt._id,
                courtName: currentCourt.courtName,
                date: dateKey,
                day: selectedDate.day,
                time: [newTimeEntry],
              },
            ];
        });
      }
    }
  };
  const tabs = [
    { Icon: PiSunHorizonFill, label: "Morning", key: "morning" },
    { Icon: BsSunFill, label: "Noon", key: "noon" },
    { Icon: HiMoon, label: "Evening", key: "night" },
  ];

  const handleDeleteSlot = (courtId, date, timeId) => {
    setSelectedTimes((prev) => {
      if (!prev[courtId] || !prev[courtId][date]) return prev;

      const courtTimes = prev[courtId][date];
      const filtered = courtTimes.filter((t) => t._id !== timeId);

      if (filtered.length === 0) {
        const { [date]: _, ...restDates } = prev[courtId];
        const newCourt =
          Object.keys(restDates).length > 0 ? restDates : undefined;

        if (!newCourt) {
          const { [courtId]: __, ...restCourts } = prev;
          return restCourts;
        }

        return {
          ...prev,
          [courtId]: newCourt,
        };
      }

      return {
        ...prev,
        [courtId]: {
          ...prev[courtId],
          [date]: filtered,
        },
      };
    });

    setSelectedBuisness((prev) =>
      prev.filter((t) => !(t._id === timeId && t.date === date))
    );

    setSelectedCourts((prev) =>
      prev
        .map((c) =>
          c._id === courtId && c.date === date
            ? { ...c, time: c.time.filter((t) => t._id !== timeId) }
            : c
        )
        .filter((c) => c.time.length > 0)
    );
  };

  const handleClearAll = () => {
    setSelectedCourts([]);
    setSelectedTimes({});
    setSelectedBuisness([]);
    dispatch(
      getUserSlotBooking({
        day: selectedDate.day,
        date: format(new Date(selectedDate.fullDate), "yyyy-MM-dd"),
        register_club_id: localStorage.getItem("register_club_id") || "",
      })
    );
  };

  const width = 370;
  const height = 75;
  const circleRadius = height * 0.3;
  const curvedSectionStart = width * 0.76;
  const curvedSectionEnd = width * 0.996;
  const circleX =
    curvedSectionStart + (curvedSectionEnd - curvedSectionStart) * 0.68 + 1;
  const circleY = height * 0.5;
  const arrowSize = circleRadius * 0.6;
  const arrowX = circleX;
  const arrowY = circleY;

  const buttonStyle = {
    position: "relative",
    width: `${width}px`,
    height: `${height}px`,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    overflow: "visible",
  };

  const svgStyle = {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  };

  const contentStyle = {
    position: "relative",
    zIndex: 2,
    color: "#001B76",
    fontWeight: "600",
    fontSize: "16px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingRight: `${circleRadius * 2}px`,
    fontFamily: "Poppins",
  };

  const maxSelectableDate = new Date();
  maxSelectableDate.setDate(maxSelectableDate.getDate() + 15);
  const clubId = localStorage.getItem("register_club_id");

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(getUserClub({ search: "" }));
    dispatch(
      getUserSlotBooking({
        day: selectedDate.day,
        date: format(new Date(selectedDate.fullDate), "yyyy-MM-dd"),
        register_club_id: clubId || "",
      })
    );
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedDate]);

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  const grandTotal = selectedCourts.reduce(
    (sum, c) => sum + c.time.reduce((s, t) => s + Number(t.amount || 0), 0),
    0
  );
  const totalSlots = selectedCourts.reduce((sum, c) => sum + c.time.length, 0);

  // Close Order Summary when all slots are removed
  useEffect(() => {
    if (totalSlots === 0) {
      setIsExpanded(false);
    }
  }, [totalSlots]);

  const handleBookNow = () => {
    if (totalSlots === 0) {
      setErrorMessage("Select a slot to enable booking");
      setErrorShow(true);
      return;
    }
    if (!user?.token) {
      const courtIds = selectedCourts
        .map((court) => court._id)
        .filter((id) => id)
        .join(",");
      navigate("/login", {
        state: {
          redirectTo: "/payment",
          paymentState: {
            courtData: {
              day: selectedDate?.day,
              date: selectedDate?.fullDate,
              time: selectedBuisness,
              courtId: courtIds,
              court: selectedCourts.map((c) => ({ _id: c._id || c.id, ...c })),
              slot: slotData?.data?.[0]?.slots,
            },
            clubData,
            selectedCourts,
            selectedDate,
            grandTotal,
            totalSlots,
          },
        },
      });
    } else {
      const courtIds = selectedCourts
        .map((court) => court._id)
        .filter((id) => id)
        .join(",");
      navigate("/payment", {
        state: {
          courtData: {
            day: selectedDate?.day,
            date: selectedDate?.fullDate,
            time: selectedBuisness,
            courtId: courtIds,
            court: selectedCourts.map((c) => ({ _id: c._id || c.id, ...c })),
            slot: slotData?.data?.[0]?.slots,
          },
          clubData,
          selectedCourts,
          selectedDate,
          grandTotal,
          totalSlots,
        },
      });
    }
  };

  const handleSwitchChange = () => setShowUnavailable(!showUnavailable);

  const formatTimeForDisplay = (time) => {
    if (!time) return "";
    const timeLower = time.toLowerCase();
    let hourPart = timeLower.replace(/(am|pm)/gi, "").trim();
    const periodMatch = timeLower.match(/(am|pm)/gi);
    const periodPart = periodMatch ? periodMatch[0] : "";
    if (!hourPart.includes(":")) {
      const hour = parseInt(hourPart);
      hourPart = `${hour.toString().padStart(2, "0")}:00`;
    } else {
      const [hour, minute] = hourPart.split(":");
      hourPart = `${parseInt(hour).toString().padStart(2, "0")}:${minute}`;
    }
    return `${hourPart} ${periodPart}`;
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

  useEffect(() => {
    if (errorShow || errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
        setErrorShow(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorShow, errorMessage]);

  const tabData = [
    { Icon: PiSunHorizonFill, label: "Morning", key: "morning" },
    { Icon: BsSunFill, label: "Noon", key: "noon" },
    { Icon: HiMoon, label: "Evening", key: "night" },
  ];

  useEffect(() => {
    const counts = [0, 0, 0];
    slotData?.data?.forEach((court) => {
      court?.slots?.forEach((slot) => {
        if (
          showUnavailable ||
          (slot.availabilityStatus === "available" &&
            slot.status !== "booked" &&
            !isPastTime(slot.time))
        ) {
          const slotHour = parseTimeToHour(slot.time);
          if (slotHour !== null) {
            if (slotHour >= 0 && slotHour < 12) counts[0]++;
            else if (slotHour >= 12 && slotHour < 17) counts[1]++;
            else if (slotHour >= 17 && slotHour <= 23) counts[2]++;
          }
        }
      });
    });

    let defaultTab = "morning";
    if (counts[0] === 0) {
      const firstAvailableIndex = counts.findIndex((count) => count > 0);
      if (firstAvailableIndex !== -1) {
        defaultTab = tabData[firstAvailableIndex].key;
      }
    }
    setKey(defaultTab);
  }, [slotData, showUnavailable]);

  const formatTime = (timeStr) => {
    return timeStr.replace(" am", ":00 am").replace(" pm", ":00 pm");
  };

  return (
    <>
      <div className="container px-0 mb-lg-3 mb-0 mobile-banner-container">
        <div className="ps-0 d-none d-lg-block" style={{ height: "340px" }}>
          <div
            className="image-zoom-container position-relative overflow-hidden rounded-3"
            style={{
              height: "100%",
              background:
                "linear-gradient(269.34deg, rgba(80, 78, 78, 0.61) 0.57%, #111827 94.62%)",
              backgroundBlendMode: "multiply",
            }}
          >
            <img
              src={twoball}
              alt="Paddle"
              className="img-fluid w-100 h-100 object-fit-cover sharp-image"
              style={{
                borderRadius: "13px",
                imageRendering: "auto",
                imageRendering: "-webkit-optimize-contrast",
                filter: "none",
              }}
            />

            <div
              className="position-absolute top-0 start-0 w-100 h-100 pt-lg-0 d-flex flex-column justify-content-center text-white p-5"
              style={{
                background:
                  "linear-gradient(269.34deg, rgba(255, 255, 255, 0) 0.57%, #111827 94.62%)",
                backgroundBlendMode: "multiply",
              }}
            >
              <p
                className="mb-0 ps-md-4"
                style={{
                  fontSize: "20px",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                }}
              >
                BOOK YOUR SLOT AT
              </p>
              <h1 className="booking-img-heading ps-md-4">
                {clubData?.clubName || ""}
              </h1>
            </div>
          </div>
        </div>
        <div className="px-3 d-lg-none mobile-banner">
          <div
            className="image-zoom-container position-relative overflow-hidden rounded-3"
            style={{
              height: "100%",
              background:
                "linear-gradient(269.34deg, rgba(80, 78, 78, 0.61) 0.57%, #111827 94.62%)",
              backgroundBlendMode: "multiply",
            }}
          >
            {/* <img
                            src={twoball}
                            alt="Paddle"
                            className="img-fluid w-100 h-100 object-fit-cover sharp-image"
                            style={{
                                borderRadius: "13px",
                                imageRendering: "auto",
                                imageRendering: "-webkit-optimize-contrast",
                                filter: "none"
                            }}
                        /> */}
            <img
              src={bannerimg}
              alt="Paddle"
              className="img-fluid w-100 object-fit-cover rounded-3 d-block d-md-none"
              style={{ height: "173px" }}
            />

            <div
              className="position-absolute top-0 start-0 w-100 h-100 pt-lg-0 d-flex flex-column justify-content-center text-white p-5"
              style={{
                background:
                  "linear-gradient(269.34deg, rgba(255, 255, 255, 0) 0.57%, #111827 94.62%)",
                backgroundBlendMode: "multiply",
              }}
            >
              <p
                className="mb-0 ps-md-4"
                style={{
                  fontSize: "12px",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                }}
              >
                BOOK YOUR SLOT AT
              </p>
              <h1 className="booking-img-heading ps-md-4">
                {clubData?.clubName || ""}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="container mb-md-0 mb-0 pt-1 pt-lg-0 px-lg-4">
        <div className="row g-4">
          <div className="col-lg-7 col-12 py-md-4 pt-0 pb-0 rounded-3 px-lg-4 mobile-booking-content px-3">
            <div className="d-flex justify-content-between align-items-center mb-md-2 mb-0">
              <div className="custom-heading-use text-nowrap">
                Select Date
                <div
                  className="position-relative d-inline-block"
                  ref={wrapperRef}
                >
                  <span
                    className="rounded p-1 pt-0 ms-1 "
                    style={{
                      cursor: "pointer",
                      width: "26px !important",
                      height: "26px !important",
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <MdOutlineDateRange
                      size={17}
                      style={{ color: "#374151" }}
                    />
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
                          onChange={(date) => {
                            setStartDate(date);
                            setIsOpen(false);
                            const formattedDate = date
                              .toISOString()
                              .split("T")[0];
                            const day = date.toLocaleDateString("en-US", {
                              weekday: "long",
                            });
                            setSelectedDate({ fullDate: formattedDate, day });
                            setSelectedTimes({});
                            dispatch(
                              getUserSlotBooking({
                                day,
                                date: formattedDate,
                                register_club_id:
                                  localStorage.getItem("register_club_id") ||
                                  "",
                              })
                            );
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
              <div className="form-switch d-flex justify-content-center align-items-center gap-2">
                <label
                  className="form-check-label mb-0"
                  htmlFor="flexSwitchCheckDefault"
                  style={{ whiteSpace: "nowrap", fontFamily: "Poppins" }}
                >
                  Show Unavailable Slots
                </label>
                <input
                  className="form-check-input fs-5 ms-md-1 ms-0 mb-1"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchCheckDefault"
                  checked={showUnavailable}
                  onChange={handleSwitchChange}
                  style={{ boxShadow: "none" }}
                />
              </div>
            </div>
            <div className="d-flex align-items-center mb-md-3 mb-2 gap-2 border-bottom">
              {/* <div className="position-relative mt-md-0 mt-2">
                <div
                  className="d-flex justify-content-start border align-items-center gap-0 rounded p-2 pe-3 ps-0 mb-md-3 mb-2"
                  style={{
                    backgroundColor: "transparent",
                    width: "52px",
                    height: "58px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="d-flex align-items-center gap-0 p-0">
                    <img
                      src={booking_dropdown_img}
                      style={{ width: "34px", height: "34px" }}
                      alt=""
                    />
                    <MdKeyboardArrowDown
                      size={16}
                      style={{
                        transform: showDropdown
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                      className="d-md-flex d-none"
                    />
                  </div>
                </div>
                {showDropdown && (
                  <div
                    className="position-absolute bg-white  rounded shadow"
                    style={{
                      top: "100%",
                      left: "-10px",
                      width: "105px",
                      zIndex: 1000,
                      marginTop: "-15px",
                    }}
                  >
                    <div
                      className="d-flex align-items-center p-2 border-bottom"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="flex-grow-1">
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "400",
                            fontFamily: "Poppins",
                          }}
                        >
                          Paddle
                        </div>
                      </div>
                      <img
                        src={booking_dropdown_img2}
                        style={{ width: "23px", height: "23px" }}
                        alt=""
                      />
                    </div>
                    <div
                      className="d-flex align-items-center p-2 border-bottom"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="flex-grow-1">
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "400",
                            fontFamily: "Poppins",
                          }}
                        >
                          Tennis
                        </div>
                      </div>
                      <img
                        src={booking_dropdown_img3}
                        style={{ width: "23px", height: "23px" }}
                        alt=""
                      />
                    </div>
                    <div
                      className="d-flex align-items-center p-2"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="flex-grow-1">
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "400",
                            fontFamily: "Poppins",
                          }}
                        >
                          Pickle Ball
                        </div>
                      </div>
                      <img
                        src={booking_dropdown_img4}
                        style={{ width: "23px", height: "23px" }}
                        alt=""
                      />
                    </div>
                  </div>
                )}
              </div> */}
              <div
                className="d-flex calendar-day-btn-mobile justify-content-center align-items-center rounded-1  mb-md-3 mb-2 mt-2 mt-md-2"
                style={{
                  backgroundColor: "#f3f3f5",
                  height: "58px",
                  padding: "2px 10px!important",
                  width: "20px"
                }}
              >
                <span
                  className="add_font_small_span "
                  style={{
                    fontSize: window.innerWidth <= 768 ? "12px" : "12px",
                    fontWeight: "500",
                    whiteSpace: "pre-line",
                    textAlign: "center",
                    lineHeight: "1",
                    letterSpacing: "0px",
                    margin: 0,
                    padding: 0,
                    display: "block",
                  }}
                >
                  {getCurrentMonth(selectedDate)}
                </span>
              </div>
              <div
                className="d-flex gap-1 "
                style={{ position: "relative" }}
              >
                <button
                  className="btn p-2 border-0 d-none d-md-block"
                  style={{
                    position: "absolute",
                    left: "-9%",
                    zIndex: 10,
                    boxShadow: "none",
                  }}
                  onClick={scrollLeft}
                >
                  <MdOutlineArrowBackIosNew className="mt-3" size={20} />
                </button>
                <div
                  ref={scrollRef}
                  className="d-flex gap-1 date-scroll-container pt-md-2 pt-2"
                  style={{
                    scrollBehavior: "smooth",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                  }}
                >
                  {dates.map((d, i) => {
                    const formatDate = (date) =>
                      date.toISOString().split("T")[0];
                    const isSelected =
                      formatDate(new Date(selectedDate?.fullDate)) ===
                      d.fullDate;

                    // Calculate slot count for this specific date
                    const slotCount = Object.values(selectedTimes).reduce(
                      (acc, courtDates) => {
                        const dateSlots = courtDates[d.fullDate] || [];
                        return acc + dateSlots.length;
                      },
                      0
                    );

                    return (
                      <button
                        key={i}
                        ref={(el) => (dateRefs.current[d.fullDate] = el)}
                        className={`calendar-day-btn mb-md-3 mb-2 me-1 position-relative ${isSelected ? "text-white border-0" : "bg-white"
                          }`}
                        style={{
                          background: isSelected
                            ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"
                            : "#FFFFFF",
                          boxShadow: isSelected
                            ? "0px 4px 4px 0px #00000040"
                            : "",
                          borderRadius: "5px",
                          color: isSelected ? "#FFFFFF" : "#374151",
                        }}
                        onClick={() => {
                          setSelectedDate({ fullDate: d.fullDate, day: d.day });
                          setStartDate(new Date(d.fullDate));
                          dispatch(
                            getUserSlotBooking({
                              day: d.day,
                              date: d.fullDate,
                              register_club_id:
                                localStorage.getItem("register_club_id") || "",
                            })
                          );
                        }}
                        onMouseEnter={(e) =>
                          !isSelected &&
                          (e.currentTarget.style.border = "1px solid #3DBE64")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.border = "1px solid #4949491A")
                        }
                      >
                        <div className="text-center">
                          <div className="date-center-date">{d.date}</div>
                          <div className="date-center-day">
                            {dayShortMap[d.day]}
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
                              top: "-8px",
                              right: "-4px",
                              zIndex: 22,
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
                  className="btn border-0 p-2 d-none d-md-block"
                  style={{
                    position: "absolute",
                    right: -26,
                    zIndex: 10,
                    boxShadow: "none",
                  }}
                  onClick={scrollRight}
                >
                  <MdOutlineArrowForwardIos className="mt-3" size={20} />
                </button>
              </div>
            </div>

            {/* Global Tabs above courts - COMMENTED OUT */}
            {/* <div className="row mb-2 mx-xs-auto">
                            <div className="col-12 d-flex p-0 justify-content-center align-items-center">
                                <div className="weather-tabs-wrapper w-100">
                                    <div className="weather-tabs-wrapper w-100">
                                        <div className="weather-tabs rounded-3 d-flex justify-content-center align-items-center">
                                            {tabData.map((tab, index) => {
                                                const Icon = tab.Icon;
                                                const active = key === tab.key;
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`tab-item rounded-3 ${key === tab.key ? 'active' : ''}`}
                                                        onClick={() => setKey(tab.key)}
                                                    >
                                                        <Icon
                                                            size={24}
                                                            className={active ? 'text-primary' : 'text-dark'}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="tab-labels d-flex justify-content-between">
                                            {tabData.map((tab, index) => (
                                                <p key={index} className={`tab-label ${key === tab.key ? 'active text-primary' : 'text-muted'}`}>
                                                    {tab.label}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> */}
            <div
              className={`mb-md-0 mb-3 overflow-slot border-0 rounded-3 ${slotData?.data?.some((court) => {
                const filteredSlots = court?.slots?.filter((slot) => {
                  const basicFilter = showUnavailable
                    ? true
                    : slot.availabilityStatus === "available" &&
                    slot.status !== "booked" &&
                    !isPastTime(slot.time) &&
                    slot.amount > 0;

                  // Apply mobile tab filter only on mobile screens
                  if (window.innerWidth <= 768) {
                    const tabKey = tabs[activeTab]?.key;
                    return basicFilter && filterSlotsByTab(slot, tabKey);
                  }

                  return basicFilter;
                });
                return filteredSlots?.length > 0;
              })
                  ? "border"
                  : "border-0"
                }`}
            >
              {slotData?.data?.length > 0 ? (
                slotLoading ? (
                  <DataLoading height={"36vh"} />
                ) : (
                  <>
                    <div className=" p-0   ">
                      {slotData?.data?.length > 0 &&
                        slotData?.data?.some(
                          (court) => court?.slots?.length > 0
                        ) && (
                          <div className="row mb-md-2 mb-0">
                            <div className="col-3 d-md-block d-none">
                              <h6 className="all-matches text-start">Courts</h6>
                            </div>
                            <div className="col-md-9 col-12">
                              <h6 className="all-matches text-center mb-0 me-2 me-md-0">
                                Available Slots
                              </h6>
                            </div>
                          </div>
                        )}
                      <div className="row mt-2 mb-0 mx-auto d-block d-md-none">
                        <div className="col-12 d-flex justify-content-center align-items-center px-0">
                          <div className="weather-tabs-wrapper w-100">
                            <div className="weather-tabs rounded-3 d-flex justify-content-center align-items-center">
                              {tabs.map((tab, index) => {
                                const Icon = tab.Icon;
                                return (
                                  <div
                                    key={index}
                                    className={`tab-item rounded-3 ${activeTab === index ? "active" : ""
                                      }`}
                                    onClick={() => setActiveTab(index)}
                                  >
                                    <Icon
                                      size={20}
                                      className={
                                        activeTab === index
                                          ? "text-primary"
                                          : "text-dark"
                                      } // dark when inactive
                                    />
                                  </div>
                                );
                              })}
                            </div>
                            <div className="tab-labels d-flex justify-content-between">
                              {tabs.map((tab, index) => (
                                <p
                                  key={index}
                                  className={`tab-label ${activeTab === index
                                      ? "active text-primary mb-0"
                                      : "text-muted mb-0"
                                    }`}
                                >
                                  {tab.label}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          maxHeight: "39vh",
                          overflowY: "auto",
                          overflowX: "hidden",
                          paddingRight: "8px",
                          // WebKit: Hide scrollbar visually but keep functionality
                          msOverflowStyle: "none", // IE and Edge
                          scrollbarWidth: "none", // Firefox
                        }}
                        className="hide-scrollbar"
                      >
                        {/* Your content here */}

                        <style jsx>{`
                          .hide-scrollbar::-webkit-scrollbar {
                            display: none; /* Safari and Chrome */
                          }
                          .hide-scrollbar {
                            -ms-overflow-style: none; /* IE and Edge */
                            scrollbar-width: none; /* Firefox */
                          }
                        `}</style>
                        {slotData?.data.map((court, courtIndex) => {
                          const filteredSlots = court?.slots?.filter((slot) => {
                            const basicFilter = showUnavailable
                              ? true
                              : slot.availabilityStatus === "available" &&
                              slot.status !== "booked" &&
                              !isPastTime(slot.time) &&
                              slot.amount > 0;

                            // Apply mobile tab filter only on mobile screens
                            if (window.innerWidth <= 768) {
                              const tabKey = tabs[activeTab]?.key;
                              return (
                                basicFilter && filterSlotsByTab(slot, tabKey)
                              );
                            }

                            return basicFilter;
                          });

                          if (filteredSlots?.length === 0) return null;

                          return (
                            <div
                              key={court._id}
                              className="row mb-md-3 mb-0 align-items-start pb-3 pb-md-0 border_bottom_line mt-2 mt-md-0"
                            >
                              <div className="col-md-3 col-12 border-end mb-0 mb-md-0 d-flex d-md-block align-items-center justify-content-start ">
                                <div
                                  className="court-item p-1 ps-0 ps-md-1 text-center text-lg-start h-100 d-flex d-md-block align-items-center justify-content-center"
                                  style={{ minHeight: "50px" }}
                                >
                                  <div
                                    className="mb-md-1 mb-0"
                                    style={{
                                      fontSize: "14px",
                                      fontWeight: "500",
                                      fontFamily: "Poppins",
                                    }}
                                  >
                                    {court?.courtName}
                                  </div>
                                  <p
                                    className="text-muted mb-0 ms-1 ms-md-0"
                                    style={{
                                      fontFamily: "Poppins",
                                      fontWeight: "400",
                                      fontSize: "10px",
                                    }}
                                  >
                                    ({court?.register_club_id?.courtType})
                                  </p>
                                </div>
                              </div>
                              <div className="col-md-9 col-12">
                                <div className="row g-1">
                                  {filteredSlots.map((slot, i) => {
                                    const isSelected = selectedTimes[
                                      court._id
                                    ]?.[selectedDate.fullDate]?.some(
                                      (t) => t._id === slot._id
                                    );
                                    const isDisabled =
                                      slot.status === "booked" ||
                                      slot.availabilityStatus !== "available" ||
                                      isPastTime(slot.time) ||
                                      slot.amount <= 0;

                                    return (
                                      <div
                                        key={i}
                                        className="col-3 col-sm-3 col-md-3 col-lg-2 mb-md-1 mb-0 mt-md-0 mt-1"
                                      >
                                        <button
                                          className={`btn rounded-1 w-100 ${isSelected ? "border-0" : ""
                                            } slot-time-btn`}
                                          onClick={() =>
                                            toggleTime(slot, court._id)
                                          }
                                          disabled={isDisabled}
                                          style={{
                                            background:
                                              isDisabled ||
                                                slot.status === "booked" ||
                                                isPastTime(slot.time) ||
                                                slot.amount <= 0
                                                ? "#c9cfcfff"
                                                : isSelected
                                                  ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"
                                                  : "#FFFFFF",
                                            color:
                                              isDisabled ||
                                                slot.status === "booked" ||
                                                isPastTime(slot.time)
                                                ? "#000000"
                                                : isSelected
                                                  ? "white"
                                                  : "#000000",
                                            cursor: isDisabled
                                              ? "not-allowed"
                                              : "pointer",
                                            opacity: isDisabled ? 0.6 : 1,
                                            border: isSelected
                                              ? ""
                                              : "1px solid #4949491A",
                                            fontSize: "11px",
                                            padding: "4px 2px",
                                            height: "32px",
                                          }}
                                          onMouseEnter={(e) =>
                                            !isDisabled &&
                                            slot.availabilityStatus ===
                                            "available" &&
                                            (e.currentTarget.style.border =
                                              "1px solid #3DBE64")
                                          }
                                          onMouseLeave={(e) =>
                                            !isDisabled &&
                                            slot.availabilityStatus ===
                                            "available" &&
                                            (e.currentTarget.style.border =
                                              "1px solid #4949491A")
                                          }
                                        >
                                          {formatTimeForDisplay(slot?.time)}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {slotData?.data.every((court) => {
                      const hasAvailableSlots = court?.slots?.some((slot) => {
                        const basicFilter =
                          showUnavailable ||
                          (slot.availabilityStatus === "available" &&
                            slot.status !== "booked" &&
                            !isPastTime(slot.time));

                        // Apply mobile tab filter only on mobile screens
                        if (window.innerWidth <= 768) {
                          const tabKey = tabs[activeTab]?.key;
                          return basicFilter && filterSlotsByTab(slot, tabKey);
                        }

                        return basicFilter;
                      });
                      return !hasAvailableSlots;
                    }) && (
                        <div
                          className="d-flex justify-content-center align-items-center h-100 py-5 mt-5 text-danger"
                          style={{ fontFamily: "Poppins", fontWeight: "500" }}
                        >
                          No Available Slot
                        </div>
                      )}
                  </>
                )
              ) : (
                <div
                  className="text-center py-4 text-danger"
                  style={{ fontFamily: "Poppins", fontWeight: "500" }}
                >
                  No courts available
                </div>
              )}
            </div>
          </div>
          <div
            className={`col-lg-5 col-12 ps-lg-4 ps-0 py-lg-4 mt-lg-0 mobile-booking-summary ${totalSlots === 0 ? "d-lg-block d-none" : ""
              }`}
          >
            {/* <div className="border w-100 px-0 pt-3 pb-0 border-0 mobile-summary-container" style={{ height: "85vh", borderRadius: '10px 30% 10px 10px', background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)" }}>
                            <div className="d-flex mb-4 position-relative d-none d-lg-flex">
                                <img src={booking_logo_img} className="booking-logo-img" alt="" />

                                <div className="text-center ps-2 pe-1 mt-3" style={{ maxWidth: "200px" }}>
                                    <p className="mt-2 mb-1 text-white" style={{ fontSize: "20px", fontWeight: "600", fontFamily: "Poppins" }}>{clubData?.clubName}</p>
                                    <p className="mt-2 mb-1 text-white" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins", lineHeight: "1.3", wordWrap: "break-word" }}>{clubData?.address} <br /> {clubData?.zipCode}</p>
                                </div>
                                <div className="position-absolute" style={{ top: "11px", left: "17.5%" }}>
                                    {logo ? (

                                        <div
                                            style={{
                                                width: "120px",
                                                height: "120px",
                                                borderRadius: "50%",
                                                overflow: "hidden",
                                                boxShadow: "0px 4px 11.4px 0px #0000002E",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: "#f9f9f9",
                                            }}
                                        >
                                            <img
                                                src={logo}
                                                alt="Club logo"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    backgroundSize: "contain",
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                height: "60px",
                                                width: "60px",
                                                backgroundColor: "#374151",
                                                border: "2px solid white",
                                                boxShadow: "0px 4px 11.4px 0px #0000002E",
                                                fontSize: "24px",
                                                fontWeight: "600",
                                                color: "white"
                                            }}
                                        >
                                            {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="d-flex border-top px-3 pt-2 justify-content-between align-items-center d-none d-lg-flex">
                                <h6 className="p-2 mb-1 ps-0 text-white custom-heading-use">Booking Summary</h6>
                                {totalSlots >= 10 && <Button className="float-end me-3 btn border-0 shadow rounded-pill" style={{ cursor: "pointer", background: "#111827", fontSize: "10px", fontWeight: "600", fontFamily: "Poppins" }} onClick={handleClearAll}>Clear All</Button>}
                            </div>
                            <div
                                className="px-3"
                                style={{
                                    maxHeight: "250px",
                                    overflowY: "auto",
                                    overflowX: "hidden",
                                    paddingRight: "16px",         
                                    marginRight: "8px",            
                                }}
                            >
                                <style jsx>{`
                                     div::-webkit-scrollbar {
                                              width: 8px;
                                    border-radius : 3px;
                                                  }
                                                   div::-webkit-scrollbar-track {
                                                    background: #F5F5F5;
                                                  border-radius: 3px;
                                                    }
                                                       div::-webkit-scrollbar-thumb {
                                                        background:  #626262;
      
                                                 }
                                                  div::-webkit-scrollbar-thumb:hover {
                                                  background: #626262;
                                                   }
                                             `}</style>
                                <div className="div d-none d-lg-block" style={{ height: "25vh" }}>
                                    {selectedCourts.length > 0 ? (
                                        selectedCourts.map((court, index) =>
                                            court.time.map((timeSlot, timeIndex) => (
                                                <div key={`${index}-${timeIndex}`} className="row mb-2" >
                                                    <div className="col-12 d-flex gap-2 mb-0 m-0 align-items-center justify-content-between">
                                                        <div className="d-flex text-white">
                                                            <span style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "16px" }}>
                                                                {court.date ? `${new Date(court.date).toLocaleString("en-US", { day: "2-digit" })}, ${new Date(court.date).toLocaleString("en-US", { month: "short" })}` : ""}
                                                            </span>
                                                            <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "16px" }}>
                                                                {formatTime(timeSlot.time)}
                                                            </span>
                                                            <span className="ps-2" style={{ fontWeight: "500", fontFamily: "Poppins", fontSize: "15px" }}>{court.courtName}</span>
                                                        </div>
                                                        <div className="text-white">
                                                            ₹<span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins" }}>{timeSlot.amount || "N/A"}</span>
                                                            <MdOutlineDeleteOutline className="ms-2 mb-2 text-white" style={{ cursor: "pointer" }} onClick={() => handleDeleteSlot(court._id, court.date, timeSlot._id)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    ) : (
                                        <div className="d-flex flex-column justify-content-center align-items-center text-white" style={{ height: "25vh" }}>
                                            <p style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500" }}>No slot selected</p>
                                        </div>
                                    )}
                                </div>
                                <div className="div d-lg-none px-2 mobile-slots-container">
                                    <div className={`mobile-expanded-slots ${isExpanded ? 'expanded' : ''}`} style={{
                                        maxHeight: isExpanded ? (totalSlots > 2 ? "140px" : "auto") : "0",
                                        overflowY: totalSlots > 2 && isExpanded ? "auto" : "hidden",
                                        transition: "max-height 0.3s ease",
                                    }}>
                                        <style jsx>{`
                                            .mobile-expanded-slots.expanded::-webkit-scrollbar {
                                                width: 6px;
                                                border-radius: 3px;
                                            }
                                            .mobile-expanded-slots.expanded::-webkit-scrollbar-track {
                                                background: rgba(255, 255, 255, 0.2);
                                                border-radius: 3px;
                                                margin: 4px 0;
                                            }
                                            .mobile-expanded-slots.expanded::-webkit-scrollbar-thumb {
                                                background: #ffffff;
                                                border-radius: 3px;
                                                border: 1px solid #001B76;
                                            }
                                            .mobile-expanded-slots.expanded::-webkit-scrollbar-thumb:hover {
                                                background: #cccccc;
                                            }
                                        `}</style>
                                        <h6 className="mb-0 text-white fw-semibold">
                                            Order Summary :
                                        </h6>
                                        {selectedCourts.length > 0 && selectedCourts.map((court, index) =>
                                            court.time.map((timeSlot, timeIndex) => (
                                                <div key={`${index}-${timeIndex}`} className="row mb-1" >

                                                    <div className="col-12 d-flex gap-1 mb-0 m-0 align-items-center justify-content-between">

                                                        <div className="d-flex text-white">
                                                            <span style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "11px" }}>
                                                                {court.date ? `${new Date(court.date).toLocaleString("en-US", { day: "2-digit" })}, ${new Date(court.date).toLocaleString("en-US", { month: "short" })}` : ""}
                                                            </span>
                                                            <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "11px" }}>
                                                                {formatTime(timeSlot.time)}
                                                            </span>
                                                            <span className="ps-1" style={{ fontWeight: "500", fontFamily: "Poppins", fontSize: "10px" }}>{court.courtName}</span>
                                                        </div>
                                                        <div className="text-white">
                                                            <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "11px" }}>₹ {timeSlot.amount || "N/A"}</span>
                                                            <MdOutlineDeleteOutline className="ms-1 text-white" style={{ cursor: "pointer", fontSize: "14px" }} onClick={() => handleDeleteSlot(court._id, court.date, timeSlot._id)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                            {totalSlots > 0 && (
                                <>
                                    <div className="d-lg-none py-0">
                                        <div
                                            className={`d-flex justify-content-between ${isExpanded ? 'border-top' : ''}  align-items-center px-3`}
                                            onClick={() => setIsExpanded(!isExpanded)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="d-flex flex-column">
                                                <span className="text-white" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>Total to Pay</span>
                                                <span className="text-white" style={{ fontSize: "12px", color: "#e5e7eb", fontFamily: "Poppins" }}>Total Slot: {totalSlots}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-1">
                                                {!isExpanded ? (
                                                    <>
                                                        <MdKeyboardDoubleArrowUp
                                                            size={25}
                                                            style={{ color: "white" }}
                                                            className="arrow-shake-infinite"
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <MdKeyboardDoubleArrowDown
                                                            size={25}
                                                            style={{ color: "white" }}
                                                            className="arrow-shake-infinite"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-white" style={{ fontSize: "16px", fontWeight: "600", fontFamily: "Poppins" }}>₹{grandTotal}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-top pt-2 px-3 mt-2 text-white d-flex justify-content-between align-items-center fw-bold mobile-total-section d-none d-lg-flex">
                                        <p className="d-flex flex-column mb-0" style={{ fontSize: "16px", fontWeight: "600" }}>
                                            Total to Pay <span style={{ fontSize: "13px", fontWeight: "500" }}>Total slots {totalSlots}</span>
                                        </p>
                                        <p className="mb-0" style={{ fontSize: "25px", fontWeight: "600" }}>₹ {grandTotal}</p>
                                    </div>
                                </>
                            )}
                            <div className="d-flex justify-content-center align-items-center px-3">
                                <button style={{
                                    ...buttonStyle,
                                    opacity: totalSlots === 0 ? 0.5 : 1,
                                    cursor: totalSlots === 0 ? "not-allowed" : "pointer",
                                    pointerEvents: totalSlots === 0 ? "none" : "auto",
                                }} className={`${className} `} disabled={totalSlots === 0} onClick={handleBookNow}>
                                    <svg style={svgStyle} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id={`buttonGradient-${width}-${height}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#fff" />
                                                <stop offset="50%" stopColor="#fff" />
                                                <stop offset="100%" stopColor="#fff" />
                                            </linearGradient>
                                        </defs>
                                        <path d={`M ${width * 0.76} ${height * 0.15} C ${width * 0.79} ${height * 0.15} ${width * 0.81} ${height * 0.20} ${width * 0.83} ${height * 0.30} C ${width * 0.83} ${height * 0.32} ${width * 0.84} ${height * 0.34} ${width * 0.84} ${height * 0.34} C ${width * 0.85} ${height * 0.34} ${width * 0.86} ${height * 0.32} ${width * 0.86} ${height * 0.30} C ${width * 0.88} ${height * 0.20} ${width * 0.90} ${height * 0.15} ${width * 0.92} ${height * 0.15} C ${width * 0.97} ${height * 0.15} ${width * 0.996} ${height * 0.30} ${width * 0.996} ${height * 0.50} C ${width * 0.996} ${height * 0.70} ${width * 0.97} ${height * 0.85} ${width * 0.92} ${height * 0.85} C ${width * 0.90} ${height * 0.85} ${width * 0.88} ${height * 0.80} ${width * 0.86} ${height * 0.70} C ${width * 0.86} ${height * 0.68} ${width * 0.85} ${height * 0.66} ${width * 0.84} ${height * 0.66} C ${width * 0.84} ${height * 0.66} ${width * 0.83} ${height * 0.68} ${width * 0.83} ${height * 0.70} C ${width * 0.81} ${height * 0.80} ${width * 0.79} ${height * 0.85} ${width * 0.76} ${height * 0.85} L ${width * 0.08} ${height * 0.85} C ${width * 0.04} ${height * 0.85} ${width * 0.004} ${height * 0.70} ${width * 0.004} ${height * 0.50} C ${width * 0.004} ${height * 0.30} ${width * 0.04} ${height * 0.15} ${width * 0.08} ${height * 0.15} L ${width * 0.76} ${height * 0.15} Z`} fill={`url(#buttonGradient-${width}-${height})`} />
                                        <circle cx={circleX} cy={circleY} r={circleRadius} fill="#001B76" />
                                        <g stroke="white" strokeWidth={height * 0.03} fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4}`} />
                                            <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4}`} />
                                            <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1}`} />
                                        </g>
                                    </svg>
                                    <div style={contentStyle}> Book Now</div>
                                </button>
                            </div>
                            <div className="d-flex align-items-center w-100 ps-5 pe-5 justify-content-start" style={{ height: "30px" }}>
                                {errorShow && errorMessage && (
                                    <div
                                        className="text-center w-100  mb-3 p-2 rounded"
                                        style={{
                                            fontWeight: 500,
                                            backgroundColor: "#ffebee",
                                            color: "#c62828",
                                            border: "1px solid #ffcdd2",
                                            fontSize: "15px",
                                        }}
                                    >
                                        {errorMessage}
                                    </div>
                                )}
                            </div>
                        </div> */}

            <div
              className="border w-100 px-0 pt-1 pb-0 border-0 mobile-summary-container small-curve-wrapper"
              style={{
                height: "60vh",
                borderRadius: "10px 30% 10px 10px",
                background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                position: "relative",
              }}
            >
              {totalSlots > 0 && (
                <div
                  className="small-curve-arrow d-lg-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {!isExpanded ? (
                    <MdKeyboardArrowUp
                      size={25}
                      color="white"
                      className="arrow-shake-infinite"
                    />
                  ) : (
                    <MdKeyboardArrowDown
                      size={25}
                      color="white"
                      className="arrow-shake-infinite"
                    />
                  )}
                </div>
              )}

              <style jsx>{`
                .small-curve-arrow {
                  position: absolute;
                  top: -14px;
                  left: 50%;
                  transform: translateX(-50%);
                  z-index: 5;
                  background: #0b39d7;
                  width: 49px;
                  height: 27px;
                  border-radius: 20px 20px 0 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding-top: 2px;
                  cursor: pointer;
                }
              `}</style>

              <div className="d-flex mb-3 mt-2 position-relative d-none d-lg-flex">
                <img
                  src={booking_logo_img}
                  className="booking-logo-img"
                  alt=""
                />

                <div
                  className="text-center ps-2 pe-1 mt-3"
                  style={{ maxWidth: "200px" }}
                >
                  <p
                    className="mt-2 mb-1 text-white"
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      fontFamily: "Poppins",
                    }}
                  >
                    {clubData?.clubName}
                  </p>
                  <p
                    className="mt-2 mb-1 text-white"
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      fontFamily: "Poppins",
                      lineHeight: "1.3",
                      wordWrap: "break-word",
                    }}
                  >
                    {clubData?.address} <br /> {clubData?.zipCode}
                  </p>
                </div>
                <div
                  className="position-absolute"
                  style={{ top: "11px", left: "17.5%" }}
                >
                  {logo ? (
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        boxShadow: "0px 4px 11.4px 0px #0000002E",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <img
                        src={logo}
                        alt="Club logo"
                        style={{
                          width: "100%",
                          height: "auto",
                          backgroundSize: "contain",
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        height: "60px",
                        width: "60px",
                        backgroundColor: "#374151",
                        border: "2px solid white",
                        boxShadow: "0px 4px 11.4px 0px #0000002E",
                        fontSize: "24px",
                        fontWeight: "600",
                        color: "white",
                      }}
                    >
                      {clubData?.clubName
                        ? clubData.clubName.charAt(0).toUpperCase()
                        : "C"}
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex border-top px-3 pt-2 justify-content-between align-items-center d-none d-lg-flex">
                <h6 className="p-2 mb-1 ps-0 text-white custom-heading-use">
                  Booking Summary
                </h6>
                {totalSlots >= 10 && (
                  <Button
                    className="float-end me-3 btn border-0 shadow rounded-pill"
                    style={{
                      cursor: "pointer",
                      background: "#111827",
                      fontSize: "10px",
                      fontWeight: "600",
                      fontFamily: "Poppins",
                    }}
                    onClick={handleClearAll}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div
                className="px-3"
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: "16px",
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

                {/* Desktop Slots */}
                <div
                  className="div d-none d-lg-block"
                  style={{ height: "18vh" }}
                >
                  {selectedCourts.length > 0 ? (
                    selectedCourts.map((court, index) =>
                      court.time.map((timeSlot, timeIndex) => (
                        <div key={`${index}-${timeIndex}`} className="row mb-2">
                          <div className="col-12 d-flex gap-2 mb-0 m-0 align-items-center justify-content-between">
                            <div className="d-flex text-white">
                              <span
                                style={{
                                  fontWeight: "600",
                                  fontFamily: "Poppins",
                                  fontSize: "14px",
                                }}
                              >
                                {court.date
                                  ? `${new Date(court.date).toLocaleString(
                                    "en-US",
                                    {
                                      day: "2-digit",
                                    }
                                  )}, ${new Date(court.date).toLocaleString(
                                    "en-US",
                                    {
                                      month: "short",
                                    }
                                  )}`
                                  : ""}
                              </span>
                              <span
                                className="ps-1"
                                style={{
                                  fontWeight: "600",
                                  fontFamily: "Poppins",
                                  fontSize: "14px",
                                }}
                              >
                                {formatTime(timeSlot.time)}
                              </span>
                              <span
                                className="ps-2"
                                style={{
                                  fontWeight: "500",
                                  fontFamily: "Poppins",
                                  fontSize: "14px",
                                }}
                              >
                                {court.courtName}
                              </span>
                            </div>
                            <div className="text-white">
                              ₹
                              <span
                                className="ps-1"
                                style={{
                                  fontWeight: "600",
                                  fontFamily: "Poppins",
                                  fontSize: "14px",

                                }}
                              >
                                {timeSlot.amount || "N/A"}
                              </span>
                              <MdOutlineDeleteOutline
                                className="ms-2 mb-2 text-white"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handleDeleteSlot(
                                    court._id,
                                    court.date,
                                    timeSlot._id
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    <div
                      className="d-flex flex-column justify-content-center align-items-center text-white"
                      style={{ height: "25vh" }}
                    >
                      <p
                        style={{
                          fontSize: "14px",
                          fontFamily: "Poppins",
                          fontWeight: "500",
                        }}
                      >
                        No slot selected
                      </p>
                    </div>
                  )}
                </div>

                <div className="div d-lg-none px-0 mobile-slots-container">
                  <div
                    className={`mobile-expanded-slots ${isExpanded ? "expanded border-bottom" : " "
                      }`}
                    style={{
                      maxHeight: isExpanded
                        ? totalSlots > 2
                          ? "140px"
                          : "200px"
                        : "0",
                      overflowY:
                        isExpanded && totalSlots > 2 ? "auto" : "hidden",
                      transition: "max-height 0.3s ease",
                    }}
                  >
                    {isExpanded && (
                      <h6
                        className="mb-0 pb-1 text-white fw-semibold pt-2"
                        style={{ fontSize: "15px" }}
                      >
                        Order Summary :
                      </h6>
                    )}

                    <style jsx>{`
                      .mobile-expanded-slots.expanded::-webkit-scrollbar {
                        width: 6px;
                        border-radius: 3px;
                      }
                      .mobile-expanded-slots.expanded::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 3px;
                        margin: 4px 0;
                      }
                      .mobile-expanded-slots.expanded::-webkit-scrollbar-thumb {
                        background: #ffffff;
                        border-radius: 3px;
                        border: 1px solid #001b76;
                      }
                      .mobile-expanded-slots.expanded::-webkit-scrollbar-thumb:hover {
                        background: #cccccc;
                      }
                    `}</style>

                    {isExpanded &&
                      selectedCourts.length > 0 &&
                      selectedCourts.map((court, index) =>
                        court.time.map((timeSlot, timeIndex) => (
                          <div
                            key={`${index}-${timeIndex}`}
                            className="row mb-0"
                          >
                            <div className="col-12 d-flex gap-1 mb-0 m-0 align-items-center justify-content-between">
                              <div className="d-flex text-white">
                                <span
                                  style={{
                                    fontWeight: "600",
                                    fontFamily: "Poppins",
                                    fontSize: "11px",
                                  }}
                                >
                                  {court.date
                                    ? `${new Date(court.date).toLocaleString(
                                      "en-US",
                                      {
                                        day: "2-digit",
                                      }
                                    )}, ${new Date(court.date).toLocaleString(
                                      "en-US",
                                      {
                                        month: "short",
                                      }
                                    )}`
                                    : ""}
                                </span>
                                <span
                                  className="ps-1"
                                  style={{
                                    fontWeight: "600",
                                    fontFamily: "Poppins",
                                    fontSize: "11px",
                                  }}
                                >
                                  {formatTime(timeSlot.time)}
                                </span>
                                <span
                                  className="ps-1"
                                  style={{
                                    fontWeight: "500",
                                    fontFamily: "Poppins",
                                    fontSize: "10px",
                                  }}
                                >
                                  {court.courtName}
                                </span>
                              </div>
                              <div className="text-white">
                                <span
                                  className="ps-1"
                                  style={{
                                    fontWeight: "600",
                                    fontFamily: "Poppins",
                                    fontSize: "11px",
                                  }}
                                >
                                  ₹ {timeSlot.amount || "N/A"}
                                </span>
                                <MdOutlineDeleteOutline
                                  className="ms-1 text-white"
                                  style={{
                                    cursor: "pointer",
                                    fontSize: "14px",
                                  }}
                                  onClick={() =>
                                    handleDeleteSlot(
                                      court._id,
                                      court.date,
                                      timeSlot._id
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                  </div>
                </div>
              </div>

              {totalSlots > 0 && (
                <>
                  <div className="d-lg-none py-0 pt-1">
                    <div
                      className="d-flex justify-content-between align-items-center px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex flex-column">
                        <span
                          className="text-white"
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            fontFamily: "Poppins",
                          }}
                        >
                          Total to Pay
                        </span>
                        <span
                          className="text-white"
                          style={{
                            fontSize: "12px",
                            color: "#e5e7eb",
                            fontFamily: "Poppins",
                          }}
                        >
                          Total Slot: {totalSlots}
                        </span>
                      </div>

                      <div>
                        <span
                          className="text-white"
                          style={{
                            fontSize: "20px",
                            fontWeight: "600",
                            fontFamily: "Poppins",
                          }}
                        >
                          ₹{grandTotal}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-top pt-2 px-3 mt-2 text-white d-flex justify-content-between align-items-center fw-bold mobile-total-section d-none d-lg-flex">
                    <p
                      className="d-flex flex-column mb-0"
                      style={{ fontSize: "16px", fontWeight: "600" }}
                    >
                      Total to Pay{" "}
                      <span style={{ fontSize: "13px", fontWeight: "500" }}>
                        Total slots {totalSlots}
                      </span>
                    </p>
                    <p
                      className="mb-0"
                      style={{ fontSize: "25px", fontWeight: "600" }}
                    >
                      ₹ {grandTotal}
                    </p>
                  </div>
                </>
              )}

              <div className="d-flex justify-content-center align-items-center px-3">
                <button
                  style={{
                    ...buttonStyle,
                    opacity: totalSlots === 0 ? 0.5 : 1,
                    cursor: totalSlots === 0 ? "not-allowed" : "pointer",
                    pointerEvents: totalSlots === 0 ? "none" : "auto",
                  }}
                  className={`${className} `}
                  disabled={totalSlots === 0}
                  onClick={handleBookNow}
                >
                  <svg
                    style={svgStyle}
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id={`buttonGradient-${width}-${height}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#fff" />
                        <stop offset="50%" stopColor="#fff" />
                        <stop offset="100%" stopColor="#fff" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M ${width * 0.76} ${height * 0.15} C ${width * 0.79
                        } ${height * 0.15} ${width * 0.81} ${height * 0.2} ${width * 0.83
                        } ${height * 0.3} C ${width * 0.83} ${height * 0.32} ${width * 0.84
                        } ${height * 0.34} ${width * 0.84} ${height * 0.34} C ${width * 0.85
                        } ${height * 0.34} ${width * 0.86} ${height * 0.32} ${width * 0.86
                        } ${height * 0.3} C ${width * 0.88} ${height * 0.2} ${width * 0.9
                        } ${height * 0.15} ${width * 0.92} ${height * 0.15} C ${width * 0.97
                        } ${height * 0.15} ${width * 0.996} ${height * 0.3} ${width * 0.996
                        } ${height * 0.5} C ${width * 0.996} ${height * 0.7} ${width * 0.97
                        } ${height * 0.85} ${width * 0.92} ${height * 0.85} C ${width * 0.9
                        } ${height * 0.85} ${width * 0.88} ${height * 0.8} ${width * 0.86
                        } ${height * 0.7} C ${width * 0.86} ${height * 0.68} ${width * 0.85
                        } ${height * 0.66} ${width * 0.84} ${height * 0.66} C ${width * 0.84
                        } ${height * 0.66} ${width * 0.83} ${height * 0.68} ${width * 0.83
                        } ${height * 0.7} C ${width * 0.81} ${height * 0.8} ${width * 0.79
                        } ${height * 0.85} ${width * 0.76} ${height * 0.85} L ${width * 0.08
                        } ${height * 0.85} C ${width * 0.04} ${height * 0.85} ${width * 0.004
                        } ${height * 0.7} ${width * 0.004} ${height * 0.5} C ${width * 0.004
                        } ${height * 0.3} ${width * 0.04} ${height * 0.15} ${width * 0.08
                        } ${height * 0.15} L ${width * 0.76} ${height * 0.15} Z`}
                      fill={`url(#buttonGradient-${width}-${height})`}
                    />
                    <circle
                      cx={circleX}
                      cy={circleY}
                      r={circleRadius}
                      fill="#001B76"
                    />
                    <g
                      stroke="white"
                      strokeWidth={height * 0.03}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path
                        d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4
                          } L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                          }`}
                      />
                      <path
                        d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                          } L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4
                          }`}
                      />
                      <path
                        d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                          } L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1
                          }`}
                      />
                    </g>
                  </svg>
                  <div style={contentStyle}> Book Now</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TokenExpire isTokenExpired={expireModal} />
    </>
  );
};

export default Booking;
