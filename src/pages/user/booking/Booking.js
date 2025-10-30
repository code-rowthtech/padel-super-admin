import React, { useState, useRef, useEffect } from "react";
import { morningTab, nighttab, sun, tennis2, twoball } from "../../../assets/files";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { DataLoading } from '../../../helpers/loading/Loaders';
import { format } from "date-fns";
import TokenExpire from "../../../helpers/TokenExpire";
import { MdOutlineDateRange, MdOutlineDeleteOutline } from "react-icons/md";
import { getUserSlotBooking } from "../../../redux/user/slot/thunk";
import { getUserClub } from "../../../redux/user/club/thunk";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { FaArrowRight } from "react-icons/fa";
import { Avatar } from "@mui/material";
import { Button } from "react-bootstrap";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md";


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
        case 'morning': return slotHour >= 0 && slotHour < 12;
        case 'noon': return slotHour >= 12 && slotHour < 17;
        case 'night': return slotHour >= 17 && slotHour <= 23;
        default: return true;
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
    const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0]) || [];
    const { slotData } = useSelector((state) => state?.userSlot);
    const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorShow, setErrorShow] = useState(false);
    const logo = JSON.parse(localStorage.getItem("logo"));

    const dateRefs = useRef({});
    const [key, setKey] = useState('morning');
    const [key2, setKey2] = useState('padel');
    const [expireModal, setExpireModal] = useState(false);
    const [selectedTimes, setSelectedTimes] = useState({});
    const [selectedBuisness, setSelectedBuisness] = useState([]);
    const [selectedCourts, setSelectedCourts] = useState([]);
    const [selectedDate, setSelectedDate] = useState({
        fullDate: new Date().toISOString().split("T")[0],
        day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    });

    const dayShortMap = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };
    const today = new Date();
    const dates = Array.from({ length: 15 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return {
            day: date.toLocaleDateString("en-US", { weekday: "long" }),
            date: date.getDate(),
            month: date.toLocaleDateString("en-US", { month: "short" }),
            fullDate: date.toISOString().split("T")[0],
        };
    });

    const getCurrentMonth = (selectedDate) => (!selectedDate ? "Month" : new Date(selectedDate.fullDate).toLocaleDateString("en-US", { month: "short" }).toUpperCase());

    useEffect(() => {
        if (slotData?.message === "jwt token is expired") setExpireModal(true);
    }, [slotData?.message]);

    const handleClickOutside = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };

    const MAX_SLOTS = 15;

    const toggleTime = (time, courtId) => {
        const totalSlots = selectedCourts.reduce((acc, c) => acc + (c.time?.length || 0), 0);
        const currentCourtTimes = selectedTimes[courtId] || [];
        const isAlreadySelected = currentCourtTimes.some((t) => t._id === time._id);

        if (isAlreadySelected) {
            // Deselect logic (same as before)
            const filteredTimes = currentCourtTimes.filter((t) => t._id !== time._id);
            setSelectedTimes({ ...selectedTimes, [courtId]: filteredTimes });
            setSelectedBuisness((prev) => prev.filter((t) => t._id !== time._id));
            setSelectedCourts((prev) =>
                prev
                    .map((court) => (court._id === courtId && court.date === selectedDate.fullDate ? { ...court, time: court.time.filter((t) => t._id !== time._id) } : court))
                    .filter((court) => court.time.length > 0)
            );
        } else {
            // Trying to select a new slot
            if (totalSlots >= MAX_SLOTS) {
                setErrorMessage(`Slot Limit Reached\nYou can select up to ${MAX_SLOTS} slots only.`);
                setErrorShow(true);
                return;
            }

            const newTimes = [...currentCourtTimes, time];
            setSelectedTimes({ ...selectedTimes, [courtId]: newTimes });
            setSelectedBuisness((prev) => [...prev, time]);

            const currentCourt = slotData?.data?.find((court) => court._id === courtId);
            if (currentCourt) {
                setSelectedCourts((prev) => {
                    const existingCourt = prev.find((c) => c._id === courtId && c.date === selectedDate.fullDate);
                    const newTimeEntry = { _id: time._id, time: time.time, amount: time.amount };
                    return existingCourt
                        ? prev.map((court) =>
                            court._id === courtId && court.date === selectedDate.fullDate
                                ? { ...court, time: [...court.time, newTimeEntry] }
                                : court
                        )
                        : [...prev, { _id: currentCourt._id, courtName: currentCourt.courtName, date: selectedDate.fullDate, day: selectedDate.day, time: [newTimeEntry] }];
                });
            }
        }
    };

    const handleDeleteSlot = (courtId, date, timeId) => {
        setSelectedCourts((prev) =>
            prev
                .map((c) => (c._id === courtId && c.date === date ? { ...c, time: c.time.filter((t) => t._id !== timeId) } : c))
                .filter((c) => c.time.length > 0)
        );
        if (date === selectedDate.fullDate) {
            setSelectedTimes((prev) => ({
                ...prev,
                [courtId]: prev[courtId]?.filter((t) => t._id !== timeId) || [],
            }));
            setSelectedBuisness((prev) => prev.filter((t) => t._id !== timeId));
        }
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
    const circleX = curvedSectionStart + (curvedSectionEnd - curvedSectionStart) * 0.68 + 1;
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

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });

    const grandTotal = selectedCourts.reduce((sum, c) => sum + c.time.reduce((s, t) => s + Number(t.amount || 0), 0), 0);
    const totalSlots = selectedCourts.reduce((sum, c) => sum + c.time.length, 0);

    const handleBookNow = () => {
        if (totalSlots === 0) {
            setErrorMessage("Select a slot to enable booking");
            setErrorShow(true);
            return;
        }
        if (!user?.token) {
            const courtIds = selectedCourts.map((court) => court._id).filter((id) => id).join(",");
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
                        selectedCourts, // Data only, no setter
                        selectedDate,
                        grandTotal,
                        totalSlots,
                    },
                },
            });
        } else {
            const courtIds = selectedCourts.map((court) => court._id).filter((id) => id).join(",");
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
                    selectedCourts, // Data only, no setter
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
            hourPart = `${hour.toString().padStart(2, '0')}:00`;
        } else {
            const [hour, minute] = hourPart.split(':');
            hourPart = `${parseInt(hour).toString().padStart(2, '0')}:${minute}`;
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
        { img: morningTab, label: 'Morning', key: 'morning' },
        { img: sun, label: 'Afternoon', key: 'noon' },
        { img: nighttab, label: 'Evening', key: 'night' },
    ];
    const padelOption = [
        { img: tennis2, label: 'Padel', key: 'padel' },
        { img: tennis2, label: 'Tannis', key: 'tannis' },
        { img: tennis2, label: 'Pickleball', key: 'pickleball' },
    ]

    useEffect(() => {
        const counts = [0, 0, 0];
        slotData?.data?.forEach((court) => {
            court?.slots?.forEach((slot) => {
                if (showUnavailable || (slot.availabilityStatus === "available" && slot.status !== "booked" && !isPastTime(slot.time))) {
                    const slotHour = parseTimeToHour(slot.time);
                    if (slotHour !== null) {
                        if (slotHour >= 0 && slotHour < 12) counts[0]++;
                        else if (slotHour >= 12 && slotHour < 17) counts[1]++;
                        else if (slotHour >= 17 && slotHour <= 23) counts[2]++;
                    }
                }
            });
        });

        let defaultTab = 'morning';
        if (counts[0] === 0) {
            const firstAvailableIndex = counts.findIndex(count => count > 0);
            if (firstAvailableIndex !== -1) {
                defaultTab = tabData[firstAvailableIndex].key; // eventKey की जगह key
            }
        }
        setKey(defaultTab);
    }, [slotData, showUnavailable]);

    const formatTime = (timeStr) => {
        return timeStr.replace(" am", ":00 am").replace(" pm", ":00 pm");
    };

    return (
        <>
            <div className="container p-md-3 mb-lg-3">
                <div className="ps-0" style={{ height: "340px" }}>
                    <div className="image-zoom-container position-relative overflow-hidden rounded-3" style={{
                        height: "100%",
                        background: 'linear-gradient(269.34deg, rgba(80, 78, 78, 0.61) 0.57%, #111827 94.62%)',
                        backgroundBlendMode: 'multiply'
                    }}>
                        <img
                            src={twoball}
                            alt="Paddle"
                            className="img-fluid w-100 h-100 object-fit-cover sharp-image"
                            style={{
                                borderRadius: "13px",
                                imageRendering: "auto",
                                imageRendering: "-webkit-optimize-contrast",
                                filter: "none"
                            }}
                        />
                        <div className="position-absolute top-0 start-0 w-100 h-100 pt-lg-0 d-flex flex-column justify-content-center text-white p-5"
                            style={{
                                background: "linear-gradient(269.34deg, rgba(255, 255, 255, 0) 0.57%, #111827 94.62%)",
                                backgroundBlendMode: "multiply"
                            }}>
                            <p className="mb-0 ps-md-4" style={{ fontSize: "20px", fontFamily: "Poppins", fontWeight: "500" }}>
                                BOOK YOUR SLOT
                            </p>
                            <h1 className="booking-img-heading ps-md-4">
                                {clubData?.clubName || ""}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mb-5 px-4">
                <div className="row g-4">
                    <div className="col-lg-7 col-12 py-4 rounded-3 px-4" style={{ backgroundColor: "#F5F5F566", border: errorMessage && errorShow ? "1px solid red" : "" }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="custom-heading-use text-nowrap">
                                Select Date
                                <div className="position-relative d-inline-block" ref={wrapperRef}>
                                    <span className="rounded p-1 pt-0 ms-2 " style={{ cursor: "pointer", width: "26px !important", height: "26px !important", }} onClick={() => setIsOpen(!isOpen)}>
                                        <MdOutlineDateRange size={20} style={{ color: "#374151" }} />
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
                                                        const formattedDate = date.toISOString().split("T")[0];
                                                        const day = date.toLocaleDateString("en-US", { weekday: "long" });
                                                        setSelectedDate({ fullDate: formattedDate, day });
                                                        setSelectedTimes({});
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
                                <label className="form-check-label mb-0" htmlFor="flexSwitchCheckDefault" style={{ whiteSpace: "nowrap", fontFamily: "Poppins" }}>Show Unavailable Slots</label>
                                <input className="form-check-input fs-5 ms-1 mb-1" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked={showUnavailable} onChange={handleSwitchChange} style={{ boxShadow: "none" }} />
                            </div>
                        </div>
                        <div className="d-flex align-items-center mb-3 gap-2 border-bottom">
                            <div className="d-flex justify-content-center p-0 mb-3 align-items-center rounded-pill" style={{ backgroundColor: "#f3f3f5", width: "30px", height: "58px" }}>
                                <span className="text-muted" style={{ transform: "rotate(270deg)", fontSize: "14px", fontWeight: "500" }}>{getCurrentMonth(selectedDate)}</span>
                            </div>
                            <div className="d-flex gap-1" style={{ position: "relative", maxWidth: "95%" }}>
                                <button className="btn p-2 border-0" style={{ position: "absolute", left: -65, zIndex: 10, boxShadow: "none" }} onClick={scrollLeft}><MdOutlineArrowBackIosNew className="mt-2" size={20} /></button>
                                <div ref={scrollRef} className="d-flex gap-1" style={{ scrollBehavior: "smooth", whiteSpace: "nowrap", maxWidth: "100%", overflow: "hidden" }}>
                                    {dates.map((d, i) => {
                                        const formatDate = (date) => date.toISOString().split("T")[0];
                                        const isSelected = formatDate(new Date(selectedDate?.fullDate)) === d.fullDate;
                                        return (
                                            <button
                                                key={i}
                                                ref={(el) => (dateRefs.current[d.fullDate] = el)}
                                                className={`calendar-day-btn mb-3  me-1 ${isSelected ? "text-white border-0" : "bg-white"}`}
                                                style={{
                                                    background: isSelected
                                                        ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"
                                                        : "#FFFFFF", boxShadow: isSelected ? "0px 4px 4px 0px #00000040" : "", borderRadius: "12px", color: isSelected ? "#FFFFFF" : "#374151"
                                                }}
                                                onClick={() => {
                                                    setSelectedDate({ fullDate: d.fullDate, day: d.day });
                                                    setStartDate(new Date(d.fullDate));
                                                    dispatch(getUserSlotBooking({ day: d.day, date: d.fullDate, register_club_id: localStorage.getItem("register_club_id") || "" }));
                                                }}
                                                onMouseEnter={(e) => !isSelected && (e.currentTarget.style.border = "1px solid #3DBE64")}
                                                onMouseLeave={(e) => (e.currentTarget.style.border = "1px solid #4949491A")}
                                            >
                                                <div className="text-center">
                                                    <div className="date-center-date">{d.date}</div>
                                                    <div className="date-center-day">{dayShortMap[d.day]}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <button className="btn border-0 p-2" style={{ position: "absolute", right: -26, zIndex: 10, boxShadow: "none" }} onClick={scrollRight}><MdOutlineArrowForwardIos className="mt-2" size={20} /></button>
                            </div>
                        </div>

                        {/* Global Tabs above courts */}
                        <div className="row mb-2 mx-xs-auto">
                            <div className="col-12 d-flex p-0 justify-content-center align-items-center">
                                <div className="weather-tabs-wrapper w-100">
                                    <div className="weather-tabs rounded-3 d-flex justify-content-center align-items-center">
                                        {tabData.map((tab, index) => (
                                            <div
                                                key={index}
                                                className={`tab-item rounded-3 ${key === tab.key ? 'active' : ''}`}
                                                onClick={() => setKey(tab.key)}
                                            >
                                                <img className="tab-icon" src={tab.img} alt={tab.label} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Labels below tabs */}
                                    <div className="tab-labels d-flex justify-content-between">
                                        {tabData.map((tab, index) => (
                                            <p key={index} className="tab-label text-muted">
                                                {tab.label}
                                            </p>
                                        ))}
                                    </div>
                                </div>


                            </div>

                        </div>
                        <div className={`mb-3 overflow-slot border-0 rounded-3 ${slotData?.data?.some(court => court?.slots?.filter(slot => showUnavailable ? true : slot.availabilityStatus === "available" && slot.status !== "booked" && !isPastTime(slot.time) && slot.amount > 0).filter(slot => filterSlotsByTab(slot, key)).length > 0) ? 'border' : 'border-0'}`}>
                            {slotData?.data?.length > 0 ? (
                                slotLoading ? (
                                    <DataLoading height={"50vh"} />
                                ) : (
                                    <>
                                        <div className="row g-3 p-0">
                                            <div
                                                className={`d-flex ${slotData.data.length > 4 ? "flex-nowrap overflow-auto" : "flex-wrap"}`}
                                                style={{
                                                    gap: "16px",
                                                    paddingBottom: "10px",
                                                    overflowX: slotData.data.length > 4 ? "auto" : "visible",
                                                    whiteSpace: slotData.data.length > 4 ? "nowrap" : "normal",
                                                }}
                                            >
                                                {slotData?.data.map((court, courtIndex) => {
                                                    const baseFilteredSlots = court?.slots?.filter((slot) =>
                                                        showUnavailable
                                                            ? true
                                                            : slot.availabilityStatus === "available" &&
                                                            slot.status !== "booked" &&
                                                            !isPastTime(slot.time) &&
                                                            slot.amount > 0
                                                    );
                                                    const filteredSlots = baseFilteredSlots.filter((slot) =>
                                                        filterSlotsByTab(slot, key)
                                                    );

                                                    if (filteredSlots?.length === 0) return null;

                                                    // Count visible courts
                                                    const visibleCourtIndices = slotData.data
                                                        .map((c, i) => {
                                                            const slots = c.slots?.filter(
                                                                (s) =>
                                                                    (showUnavailable ||
                                                                        (s.availabilityStatus === "available" &&
                                                                            s.status !== "booked" &&
                                                                            !isPastTime(s.time) &&
                                                                            s.amount > 0)) &&
                                                                    filterSlotsByTab(s, key)
                                                            );
                                                            return slots.length > 0 ? i : null;
                                                        })
                                                        .filter(Boolean);

                                                    const isLast =
                                                        visibleCourtIndices[visibleCourtIndices.length - 1] === courtIndex;

                                                    return (
                                                        <div
                                                            key={court._id}
                                                            className="court-container p-3"
                                                            style={{
                                                                minWidth: slotData.data.length > 4 ? "170px" : "calc(25% - 16px)",
                                                                flex: slotData.data.length > 4 ? "0 0 auto" : "1 1 calc(25% - 16px)",
                                                                borderRight: !isLast
                                                                    ? "1px solid transparent"
                                                                    : "none",
                                                                borderImage: !isLast
                                                                    ? "linear-gradient(180deg, rgba(255,255,255,0) 0%, #837f7fff 46.63%, rgba(255,255,255,0) 94.23%) 1"
                                                                    : "none",
                                                                borderImageSlice: !isLast ? 1 : 0,
                                                            }}
                                                        >
                                                            <div className="mb-3 text-center">
                                                                <h5 className="all-matches mb-1">{court?.courtName}</h5>
                                                                <p
                                                                    className="text-muted"
                                                                    style={{
                                                                        fontFamily: "Poppins",
                                                                        fontWeight: "400",
                                                                        fontSize: "12px",
                                                                    }}
                                                                >
                                                                    ({court?.register_club_id?.courtType})
                                                                </p>
                                                            </div>

                                                            <div className="slots-grid d-flex flex-column align-items-center">
                                                                {filteredSlots.map((slot, i) => {
                                                                    const isSelected = selectedTimes[court._id]?.some(
                                                                        (t) => t._id === slot._id
                                                                    );
                                                                    const isDisabled =

                                                                        slot.status === "booked" ||
                                                                        slot.availabilityStatus !== "available" ||
                                                                        isPastTime(slot.time) ||
                                                                        slot.amount <= 0;

                                                                    return (
                                                                        <button
                                                                            key={i}
                                                                            className={`btn rounded-3 ${isSelected ? "border-0" : ""
                                                                                } slot-time-btn text-center mb-2`}
                                                                            onClick={() => toggleTime(slot, court._id)}
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
                                                                                    isDisabled || slot.status === "booked" || isPastTime(slot.time)
                                                                                        ? "#000000"
                                                                                        : isSelected
                                                                                            ? "white"
                                                                                            : "#000000",
                                                                                cursor: isDisabled ? "not-allowed" : "pointer",
                                                                                opacity: isDisabled ? 0.6 : 1,
                                                                                border: isSelected ? "" : "1px solid #4949491A",
                                                                                fontSize: "14px",
                                                                                padding: "8px 4px",
                                                                            }}
                                                                            onMouseEnter={(e) =>
                                                                                !isDisabled &&
                                                                                slot.availabilityStatus === "available" &&
                                                                                (e.currentTarget.style.border = "1px solid #3DBE64")
                                                                            }
                                                                            onMouseLeave={(e) =>
                                                                                !isDisabled &&
                                                                                slot.availabilityStatus === "available" &&
                                                                                (e.currentTarget.style.border = "1px solid #4949491A")
                                                                            }
                                                                        >
                                                                            {formatTimeForDisplay(slot?.time)}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                        </div>

                                        {slotData?.data.every((court) =>
                                            !court?.slots?.some((slot) =>
                                                (showUnavailable || (slot.availabilityStatus === "available" && slot.status !== "booked" && !isPastTime(slot.time))) &&
                                                filterSlotsByTab(slot, key)
                                            )
                                        ) && (
                                                <div className="d-flex justify-content-center align-items-center h-100 py-5 mt-5 text-danger" style={{ fontFamily: "Poppins", fontWeight: "500" }}>
                                                    No Available Slot
                                                </div>
                                            )}
                                    </>
                                )
                            ) : (
                                <div className="text-center py-4 text-danger" style={{ fontFamily: "Poppins", fontWeight: "500" }}>No courts available</div>
                            )}
                        </div>
                    </div>
                    <div className="col-lg-5 col-12 ps-lg-4 ps-0 py-lg-4 mt-lg-0">
                        <div className="border w-100  px-3 py-5 border-0" style={{ borderRadius: '10px 30% 10px 10px', background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)" }}>
                            <div className="text-center mb-3">
                                <div className="d-flex justify-content-center">
                                    {logo ? <Avatar src={logo} alt="User Profile" style={{ height: "112px", width: "112px", boxShadow: "0px 4px 11.4px 0px #0000002E" }} /> : <Avatar alt={clubData?.clubName?.charAt(0).toUpperCase() + clubData?.clubName?.slice(1)} style={{ height: "112px", width: "112px", fontSize: "30px", boxShadow: "0px 4px 11.4px 0px #0000002E" }}>{clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}</Avatar>}
                                </div>
                                <p className="mt-2 mb-1 text-white" style={{ fontSize: "20px", fontWeight: "600", fontFamily: "Poppins" }}>{clubData?.clubName}</p>
                            </div>
                            <div className="d-flex border-top pt-2 justify-content-between align-items-center">
                                <h6 className="p-2 mb-1 ps-0 text-white custom-heading-use">Booking Summary</h6>
                                {totalSlots >= 10 && <Button className="float-end me-3 btn border-0 shadow rounded-pill" style={{ cursor: "pointer", background: "#111827", fontSize: "10px", fontWeight: "600", fontFamily: "Poppins" }} onClick={handleClearAll}>Clear All</Button>}
                            </div>
                            <div
                                style={{
                                    maxHeight: selectedCourts?.length > 0 ? "auto" : "240px",
                                    overflowY: selectedCourts?.length === 0 ? "hidden" : "auto",
                                    overflowX: "hidden",
                                }}
                            >
                                {selectedCourts.length > 0 ? (
                                    selectedCourts.map((court, index) =>
                                        court.time.map((timeSlot, timeIndex) => (
                                            <div key={`${index}-${timeIndex}`} className="row mb-2">
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
                            {totalSlots > 0 && (
                                <div className="border-top pt-3 mt-2 text-white d-flex justify-content-between align-items-center fw-bold" style={{ overflowX: "hidden" }}>
                                    <p className="d-flex flex-column" style={{ fontSize: "16px", fontWeight: "600" }}>
                                        Total to Pay <span style={{ fontSize: "13px", fontWeight: "500" }}>Total slots {totalSlots}</span>
                                    </p>
                                    <p style={{ fontSize: "25px", fontWeight: "600" }}>₹ {grandTotal}</p>
                                </div>
                            )}
                            {errorShow && errorMessage && (
                                <div
                                    className="alert alert-danger text-center "
                                    role="alert"
                                    style={{
                                        whiteSpace: 'pre-line',
                                        fontFamily: 'Poppins',
                                        fontSize: '14px',
                                        padding: '10px',
                                        borderRadius: '8px',
                                    }}
                                >
                                    {errorMessage}
                                </div>
                            )}
                            <div className="d-flex justify-content-center mt-3">
                                <button style={{ ...buttonStyle }} className={className} onClick={handleBookNow}>
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
                                    <div style={contentStyle}>Book Now</div>
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