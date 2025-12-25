import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  MdOutlineDateRange,
} from "react-icons/md";
import { getUserSlotBooking } from "../../../redux/user/slot/thunk";
import { getUserClub } from "../../../redux/user/club/thunk";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { HiMoon } from "react-icons/hi";
import { BsSunFill } from "react-icons/bs";
import { PiSunHorizonFill } from "react-icons/pi";
import io from 'socket.io-client';
import config from '../../../config';
import BookingSummary from "./BookingSummary";

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
      if (timeParts?.length > 1) {
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
  const [showUnavailable, setShowUnavailable] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0]) || [];
  const { slotData } = useSelector((state) => state?.userSlot);
  const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorShow, setErrorShow] = useState(false);
  const logo = clubData?.logo;
  const dateRefs = useRef({});

  const [expireModal, setExpireModal] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState({});
  const [selectedBuisness, setSelectedBuisness] = useState([]);
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState({
    fullDate: new Date().toISOString().split("T")[0],
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
  });
  const [showBanner, setShowBanner] = useState(true);

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
    if (!selectedDate || !selectedDate?.fullDate) return "MONTH";
    const dateObj = new Date(selectedDate?.fullDate);
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
    // Calculate total slots across all dates and courts
    const currentTotalSlots = Object.values(selectedTimes).reduce((total, courtDates) => {
      return total + Object.values(courtDates).reduce((dateTotal, timeSlots) => {
        return dateTotal + timeSlots?.length;
      }, 0);
    }, 0);

    const dateKey = date || selectedDate?.fullDate;
    const uniqueKey = `${courtId}-${time?._id}-${dateKey}`;

    const currentCourtTimes = selectedTimes[courtId]?.[dateKey] || [];
    const isAlreadySelected = currentCourtTimes.some((t) => t?._id === time?._id);

    if (isAlreadySelected) {
      const filteredTimes = currentCourtTimes.filter((t) => t?._id !== time?._id);
      setSelectedTimes((prev) => ({
        ...prev,
        [courtId]: {
          ...prev[courtId],
          [dateKey]: filteredTimes,
        },
      }));
      setSelectedBuisness((prev) =>
        prev.filter((t) => t?._id !== time?._id || t?.date !== dateKey)
      );
      setSelectedCourts((prev) =>
        prev
          .map((court) =>
            court?._id === courtId && court?.date === dateKey
              ? { ...court, time: court?.time.filter((t) => t?._id !== time?._id) }
              : court
          )
          .filter((court) => court?.time?.length > 0)
      );
    } else {
      if (currentTotalSlots >= MAX_SLOTS) {
        setErrorMessage(`You can select up to ${MAX_SLOTS} slots only`);
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

      const currentCourt = slotData?.data?.find((c) => c?._id === courtId);
      if (currentCourt) {
        setSelectedCourts((prev) => {
          const existingCourt = prev.find(
            (c) => c?._id === courtId && c?.date === dateKey
          );
          const newTimeEntry = {
            _id: time?._id,
            time: time?.time,
            amount: time?.amount,
          };
          return existingCourt
            ? prev?.map((court) =>
              court?._id === courtId && court?.date === dateKey
                ? { ...court, time: [...court?.time, newTimeEntry] }
                : court
            )
            : [
              ...prev,
              {
                _id: currentCourt?._id,
                courtName: currentCourt?.courtName,
                date: dateKey,
                day: selectedDate?.day,
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
      const filtered = courtTimes.filter((t) => t?._id !== timeId);

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
      prev.filter((t) => !(t?._id === timeId && t?.date === date))
    );

    setSelectedCourts((prev) =>
      prev
        ?.map((c) =>
          c?._id === courtId && c?.date === date
            ? { ...c, time: c?.time.filter((t) => t?._id !== timeId) }
            : c
        )
        .filter((c) => c?.time?.length > 0)
    );
  };

  const handleClearAll = () => {
    setSelectedCourts([]);
    setSelectedTimes({});
    setSelectedBuisness([]);
    dispatch(
      getUserSlotBooking({
        day: selectedDate?.day,
        date: format(new Date(selectedDate?.fullDate), "yyyy-MM-dd"),
        register_club_id: localStorage.getItem("register_club_id") || "",
      })
    );
  };

  const buttonConfig = useMemo(() => {
    const width = 370;
    const height = 75;
    const circleRadius = height * 0.3;

    const curvedSectionStart = width * 0.76;
    const curvedSectionEnd = width * 0.996;

    const circleX = curvedSectionStart + (curvedSectionEnd - curvedSectionStart) * 0.68 + 1;
    const circleY = height * 0.5;

    const arrowSize = circleRadius * 0.6;
    const arrowX = circleX;
    const arrowY = circleY;

    return {
      width,
      height,
      circleRadius,
      arrowX,
      arrowY,
      arrowSize,
      buttonStyle: {
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        overflow: "visible",
      },
      svgStyle: {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
      },
      contentStyle: {
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
      },
    };
  }, []);

  const maxSelectableDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date;
  }, []);

  const clubId = useMemo(() => localStorage.getItem("register_club_id"), []);

  const fetchSlots = useCallback((socket = null) => {
    if (!clubId) return;

    dispatch(
      getUserSlotBooking({
        day: selectedDate?.day,
        date: format(new Date(selectedDate?.fullDate), "yyyy-MM-dd"),
        register_club_id: clubId,
        socket: socket,
      })
    );
  }, [dispatch, selectedDate?.day, selectedDate?.fullDate, clubId]);

  useEffect(() => {
    dispatch(getUserClub({ search: "" }));
    fetchSlots();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedDate, fetchSlots]);

  useEffect(() => {
    if (!user?._id || !clubId) return;

    const bookingSocket = io(config.API_URL, {
      transports: ['websocket'],
      forceNew: true
    });

    const handleConnect = () => {
      bookingSocket.emit("joinRoom", { userId: user?._id, clubId });
    };

    const handleSlotUpdate = (data) => {
      const currentDate = format(new Date(selectedDate?.fullDate), "yyyy-MM-dd");
      if (data?.clubId === clubId && data?.date === currentDate) {
        fetchSlots(bookingSocket);
      }
    };

    bookingSocket.on("connect", handleConnect);
    bookingSocket.on('slotUpdated', handleSlotUpdate);

    return () => {
      bookingSocket.off("connect", handleConnect);
      bookingSocket.off('slotUpdated', handleSlotUpdate);
      bookingSocket.disconnect();
    };
  }, [clubId, selectedDate?.fullDate, user?._id, fetchSlots]);

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  // Memoize expensive calculations
  const grandTotal = useMemo(() => {
    return selectedCourts.reduce(
      (sum, c) => sum + c?.time.reduce((s, t) => s + Number(t?.amount || 0), 0),
      0
    );
  }, [selectedCourts]);

  const totalSlots = useMemo(() => {
    return Object.values(selectedTimes).reduce((total, courtDates) => {
      return total + Object.values(courtDates).reduce((dateTotal, timeSlots) => {
        return dateTotal + timeSlots?.length;
      }, 0);
    }, 0);
  }, [selectedTimes]);

  useEffect(() => {
    if (totalSlots === 0) {
      setIsExpanded(false);
    }
  }, [totalSlots]);

  // Clean up selected slots only for current date when slots are no longer available
  useEffect(() => {
    if (slotData?.data && (Object.keys(selectedTimes)?.length > 0 || selectedCourts?.length > 0)) {
      const currentDate = selectedDate?.fullDate;
      const updatedSelectedTimes = { ...selectedTimes };
      const updatedSelectedCourts = [...selectedCourts];
      const updatedSelectedBusiness = [...selectedBuisness];
      let hasChanges = false;

      // Only validate slots for current date
      Object.keys(selectedTimes).forEach(courtId => {
        if (selectedTimes[courtId][currentDate]) {
          const court = slotData?.data.find(c => c?._id === courtId);
          if (court) {
            const validSlots = selectedTimes[courtId][currentDate].filter(selectedSlot => {
              return court.slots?.some(availableSlot =>
                availableSlot?._id === selectedSlot?._id &&
                availableSlot?.availabilityStatus === "available" &&
                availableSlot?.status !== "booked"
              );
            });

            if (validSlots?.length !== selectedTimes[courtId][currentDate]?.length) {
              hasChanges = true;
              if (validSlots?.length > 0) {
                updatedSelectedTimes[courtId][currentDate] = validSlots;
              } else {
                delete updatedSelectedTimes[courtId][currentDate];
                if (Object.keys(updatedSelectedTimes[courtId])?.length === 0) {
                  delete updatedSelectedTimes[courtId];
                }
              }
            }
          }
        }
      });

      // Update selectedCourts only for current date
      for (let i = updatedSelectedCourts?.length - 1; i >= 0; i--) {
        const court = updatedSelectedCourts[i];
        if (court?.date === currentDate) {
          const validTimeSlots = court?.time.filter(timeSlot => {
            const courtData = slotData?.data.find(c => c?._id === court?._id);
            return courtData?.slots?.some(availableSlot =>
              availableSlot?._id === timeSlot?._id &&
              availableSlot?.availabilityStatus === "available" &&
              availableSlot?.status !== "booked"
            );
          });

          if (validTimeSlots?.length !== court?.time?.length) {
            hasChanges = true;
            if (validTimeSlots?.length > 0) {
              updatedSelectedCourts[i] = { ...court, time: validTimeSlots };
            } else {
              updatedSelectedCourts.splice(i, 1);
            }
          }
        }
      }

      // Update selectedBusiness only for current date
      for (let i = updatedSelectedBusiness?.length - 1; i >= 0; i--) {
        const slot = updatedSelectedBusiness[i];
        if (slot?.date === currentDate) {
          const courtExists = slotData?.data.some(court =>
            court?.slots?.some(courtSlot =>
              courtSlot?._id === slot?._id &&
              courtSlot?.availabilityStatus === "available" &&
              courtSlot?.status !== "booked"
            )
          );
          if (!courtExists) {
            hasChanges = true;
            updatedSelectedBusiness?.splice(i, 1);
          }
        }
      }

      // Update state only if there are changes
      if (hasChanges) {
        setSelectedTimes(updatedSelectedTimes);
        setSelectedCourts(updatedSelectedCourts);
        setSelectedBuisness(updatedSelectedBusiness);
      }
    }
  }, [slotData?.data,]);

  const handleBookNow = async () => {
    if (totalSlots === 0) {
      setErrorMessage("Select a slot to enable booking");
      setErrorShow(true);
      return;
    }
    if (!user?.token) {
      const courtIds = selectedCourts
        ?.map((court) => court?._id)
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
              court: selectedCourts?.map((c) => ({ _id: c?._id || c?.id, ...c })),
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
        ?.map((court) => court?._id)
        .filter((id) => id)
        .join(",");
      navigate("/payment", {
        state: {
          courtData: {
            day: selectedDate?.day,
            date: selectedDate?.fullDate,
            time: selectedBuisness,
            courtId: courtIds,
            court: selectedCourts?.map((c) => ({ _id: c._id || c.id, ...c })),
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

  useEffect(() => {
    const tooltip = document.getElementById('slot-limit-tooltip') || (() => {
      const newTooltip = document.createElement('div');
      newTooltip.id = 'slot-limit-tooltip';
      newTooltip.style.cssText = `
          position: fixed;
          background: #333;
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 9999;
          pointer-events: none;
          white-space: nowrap;
          display: none;
          max-width: 90vw;
          word-wrap: break-word;
          text-align: center;
        `;
      document.body.appendChild(newTooltip);
      return newTooltip;
    })();

    const handleMouseEnter = (e) => {
      if (window.innerWidth <= 768) return;

      const currentTotalSlots = Object.values(selectedTimes).reduce((total, courtDates) => {
        return total + Object.values(courtDates).reduce((dateTotal, timeSlots) => {
          return dateTotal + timeSlots?.length;
        }, 0);
      }, 0);

      if (currentTotalSlots >= MAX_SLOTS) {
        const button = e.currentTarget;
        const isSelected = button.style.background.includes('linear-gradient');
        if (!isSelected) {
          tooltip.textContent = `You can select up to ${MAX_SLOTS} slots only`;
          tooltip.style.display = 'block';
          tooltip.style.left = e.clientX + 10 + 'px';
          tooltip.style.top = e.clientY - 30 + 'px';
        }
      }
    };

    const handleMouseMove = (e) => {
      if (window.innerWidth <= 768) return;

      const currentTotalSlots = Object.values(selectedTimes).reduce((total, courtDates) => {
        return total + Object.values(courtDates).reduce((dateTotal, timeSlots) => {
          return dateTotal + timeSlots?.length;
        }, 0);
      }, 0);

      if (currentTotalSlots >= MAX_SLOTS && tooltip.style.display === 'block') {
        tooltip.style.left = e.clientX + 10 + 'px';
        tooltip.style.top = e.clientY - 30 + 'px';
      }
    };

    const handleMouseLeave = () => {
      tooltip.style.display = 'none';
    };

    const buttons = document.querySelectorAll('.slot-time-btn');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mousemove', handleMouseMove);
      button.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mousemove', handleMouseMove);
        button.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [selectedTimes, slotData]);

  useEffect(() => {
    const counts = [0, 0, 0];
    slotData?.data?.forEach((court) => {
      court?.slots?.forEach((slot) => {
        if (
          showUnavailable ||
          (slot?.availabilityStatus === "available" &&
            slot?.status !== "booked" &&
            !isPastTime(slot?.time))
        ) {
          const slotHour = parseTimeToHour(slot?.time);
          if (slotHour !== null) {
            if (slotHour >= 0 && slotHour < 12) counts[0]++;
            else if (slotHour >= 12 && slotHour < 17) counts[1]++;
            else if (slotHour >= 17 && slotHour <= 23) counts[2]++;
          }
        }
      });
    });

    let defaultTabIndex = 0;
    if (counts[0] === 0) {
      const firstAvailableIndex = counts.findIndex((count) => count > 0);
      if (firstAvailableIndex !== -1) {
        defaultTabIndex = firstAvailableIndex;
      }
    }
    setActiveTab(defaultTabIndex);
  }, [slotData, showUnavailable]);

  const formatTime = (timeStr) => {
    return timeStr.replace(" am", ":00 am").replace(" pm", ":00 pm");
  };

  return (
    <>
      <div className="container px-0 mb-lg-3 mb-0 mobile-banner-container mt-md-4 mt-0 pb-3">
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
              className="position-absolute top-0 start-0 w-100 h-100 pt-lg-5 d-flex flex-column justify-content-center text-white p-5"
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
        {showBanner && (
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
              <img
                src={bannerimg}
                alt="Paddle"
                className="img-fluid w-100 object-fit-cover rounded-3 d-block d-md-none"
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
        )}
      </div>
      <div className="container mb-md-0 mb-0 pt-1 pt-lg-0 px-lg-4">
        <div className="row g-4">
          <div className="col-lg-7 col-12 py-md-4 pt-0 pb-0 rounded-3 px-lg-4 mobile-booking-content px-3 mt-0">
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
                            setShowBanner(false);
                            dispatch(
                              getUserSlotBooking({
                                day,
                                date: formattedDate,
                                register_club_id: localStorage.getItem("register_club_id") || "",
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
                  {dates?.map((d, i) => {
                    const formatDate = (date) =>
                      date.toISOString().split("T")[0];
                    const isSelected =
                      formatDate(new Date(selectedDate?.fullDate)) ===
                      d?.fullDate;

                    // Calculate slot count for this specific date
                    const slotCount = Object.values(selectedTimes).reduce(
                      (acc, courtDates) => {
                        const dateSlots = courtDates[d?.fullDate] || [];
                        return acc + dateSlots?.length;
                      },
                      0
                    );

                    return (
                      <button
                        key={i}
                        ref={(el) => (dateRefs.current[d?.fullDate] = el)}
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
                          setSelectedDate({ fullDate: d?.fullDate, day: d?.day });
                          setStartDate(new Date(d?.fullDate));
                          setShowBanner(false);
                          dispatch(
                            getUserSlotBooking({
                              day: d?.day,
                              date: d?.fullDate,
                              register_club_id: localStorage.getItem("register_club_id") || "",
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
                          <div className="date-center-date">{d?.date}</div>
                          <div className="date-center-day">
                            {dayShortMap[d?.day]}
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

            {/* Unified Tabs for both mobile and desktop */}
            <div className="row mb-2 mx-xs-auto d-none d-md-block">
              <div className="col-12 d-flex p-0 justify-content-center align-items-center">
                <div className="weather-tabs-wrapper w-100">
                  <div className="weather-tabs-wrapper w-100">
                    <div className="weather-tabs rounded-3 d-flex justify-content-center align-items-center">
                      {tabs?.map((tab, index) => {
                        const Icon = tab.Icon;
                        return (
                          <div
                            key={index}
                            className={`tab-item rounded-3 ${activeTab === index ? 'active' : ''}`}
                            onClick={() => setActiveTab(index)}
                          >
                            <Icon
                              size={24}
                              className={activeTab === index ? 'text-primary' : 'text-dark'}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="tab-labels d-flex justify-content-between">
                      {tabs?.map((tab, index) => (
                        <p key={index} className={`tab-label ${activeTab === index ? 'active text-primary' : 'text-muted'}`}>
                          {tab?.label}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`mb-md-0 mb-3 overflow-slot border-0 rounded-3 ${slotData?.data?.some((court) => {
                const filteredSlots = court?.slots?.filter((slot) => {
                  const basicFilter = showUnavailable
                    ? true
                    : slot?.availabilityStatus === "available" &&
                    slot?.status !== "booked" &&
                    !isPastTime(slot?.time) &&
                    slot?.amount > 0;

                  // Apply tab filter for both mobile and desktop
                  const tabKey = tabs[activeTab]?.key;
                  return basicFilter && filterSlotsByTab(slot, tabKey);
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
                              {tabs?.map((tab, index) => (
                                <p
                                  key={index}
                                  className={`tab-label ${activeTab === index
                                    ? "active text-primary mb-0"
                                    : "text-muted mb-0"
                                    }`}
                                >
                                  {tab?.label}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          overflowY: "auto",
                          overflowX: "hidden",
                          paddingRight: "8px",
                          msOverflowStyle: "none",
                          scrollbarWidth: "none",
                        }}
                        className="hide-scrollbar mention_height_court"
                      >
                        <style>{`
                            .hide-scrollbar::-webkit-scrollbar {
                              display: none; /* Safari and Chrome */
                            }
                            .hide-scrollbar {
                              -ms-overflow-style: none; /* IE and Edge */
                              scrollbar-width: none; /* Firefox */
                            }
                          `}</style>
                        {slotData?.data?.map((court, courtIndex) => {
                          const filteredSlots = court?.slots?.filter((slot) => {
                            const basicFilter = showUnavailable
                              ? true
                              : slot?.availabilityStatus === "available" &&
                              slot?.status !== "booked" &&
                              !isPastTime(slot?.time) &&
                              slot?.amount > 0;

                            const tabKey = tabs[activeTab]?.key;
                            return basicFilter && filterSlotsByTab(slot, tabKey);
                          });

                          if (filteredSlots?.length === 0) return null;

                          return (
                            <div
                              key={court?._id}
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
                                  {filteredSlots?.map((slot, i) => {
                                    const isSelected = selectedTimes[
                                      court?._id
                                    ]?.[selectedDate?.fullDate]?.some(
                                      (t) => t?._id === slot?._id
                                    );
                                    const isDisabled =
                                      slot?.status === "booked" ||
                                      slot?.availabilityStatus !== "available" ||
                                      isPastTime(slot?.time) ||
                                      slot?.amount <= 0;

                                    return (
                                      <div
                                        key={i}
                                        className="col-3 col-sm-3 col-md-3 col-lg-2 mb-md-1 mb-0 mt-md-0 mt-1"
                                      >
                                        <button
                                          className={`btn rounded-1 w-100 ${isSelected ? "border-0" : ""
                                            } slot-time-btn`}
                                          onClick={() =>
                                            toggleTime(slot, court?._id, selectedDate?.fullDate)
                                          }
                                          disabled={isDisabled}
                                          style={{
                                            background:
                                              isDisabled ||
                                                slot?.status === "booked" ||
                                                isPastTime(slot?.time) ||
                                                slot?.amount <= 0
                                                ? "#c9cfcfff"
                                                : isSelected
                                                  ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"
                                                  : "#FFFFFF",
                                            color:
                                              isDisabled ||
                                                slot?.status === "booked" ||
                                                isPastTime(slot?.time)
                                                ? "#000000"
                                                : isSelected
                                                  ? "white"
                                                  : "#000000",
                                            cursor: isDisabled
                                              ? "not-allowed"
                                              : "pointer",
                                            opacity: isDisabled ? 0.6 : 1,
                                            borderTop: isSelected
                                              ? "1px solid transparent"
                                              : "1px solid #4949491A",
                                            borderRight: isSelected
                                              ? "1px solid transparent"
                                              : "1px solid #4949491A",
                                            borderBottom: isSelected
                                              ? "1px solid transparent"
                                              : "1px solid #4949491A",
                                            borderLeft: "3px solid #0034E4",
                                            fontSize: "11px",
                                            padding: "4px 2px",
                                            height: "32px",

                                          }}
                                          onMouseEnter={(e) => {
                                            if (!isDisabled && slot?.availabilityStatus === "available" && !isSelected) {
                                              e.currentTarget.style.borderTop = "1px solid #0034E4";
                                              e.currentTarget.style.borderRight = "1px solid #0034E4";
                                              e.currentTarget.style.borderBottom = "1px solid #0034E4";
                                              e.currentTarget.style.borderLeft = "3px solid #0034E4";
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (!isDisabled && slot?.availabilityStatus === "available") {
                                              e.currentTarget.style.borderTop = isSelected ? "1px solid transparent" : "1px solid #4949491A";
                                              e.currentTarget.style.borderRight = isSelected ? "1px solid transparent" : "1px solid #4949491A";
                                              e.currentTarget.style.borderBottom = isSelected ? "1px solid transparent" : "1px solid #4949491A";
                                              e.currentTarget.style.borderLeft = "3px solid #0034E4";
                                            }
                                          }}
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
                          (slot?.availabilityStatus === "available" &&
                            slot?.status !== "booked" &&
                            !isPastTime(slot?.time));

                        const tabKey = tabs[activeTab]?.key;
                        return basicFilter && filterSlotsByTab(slot, tabKey);
                      });
                      return !hasAvailableSlots;
                    }) && (
                        <div
                          className="d-flex justify-content-center align-items-center text-center h-100 py-5 mt-5 text-danger label_font"
                          style={{ fontFamily: "Poppins", fontWeight: "500" }}
                        >
                          No slots are available for this date and time.
                          Please choose another date
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
          <BookingSummary
            totalSlots={totalSlots}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            clubData={clubData}
            logo={logo}
            selectedCourts={selectedCourts}
            formatTime={formatTime}
            handleDeleteSlot={handleDeleteSlot}
            handleClearAll={handleClearAll}
            grandTotal={grandTotal}
            errorShow={errorShow}
            errorMessage={errorMessage}
            buttonConfig={buttonConfig}
            className={className}
            handleBookNow={handleBookNow}
          />

        </div>
      </div>
      <TokenExpire isTokenExpired={expireModal} />
    </>
  );
};

export default Booking;
