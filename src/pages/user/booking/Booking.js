import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import { registerClubBG, twoball } from "../../../assets/files";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getUserSlot } from "../../../redux/user/slot/thunk";
import { useDispatch, useSelector } from "react-redux";
import { DataLoading } from '../../../helpers/loading/Loaders';
import { getUserClub } from "../../../redux/user/club/thunk";
import { Avatar } from "@mui/material";
import { Alert } from "react-bootstrap";
import { formatTime } from "../../../helpers/Formatting";
import { format } from "date-fns"; // Changed to format from date-fns (was formatDate, but it's format)
import TokenExpire from "../../../helpers/TokenExpire";

const Booking = ({ className = "" }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const [showUnavailable, setShowUnavailable] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const selectedButtonRef = useRef(null);
    const dateRefs = useRef({});
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const clubData = store?.userClub?.clubData?.data?.courts[0] || []
    const { slotData } = useSelector((state) => state?.userSlot);
    const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorShow, setErrorShow] = useState(false);
    const logo = JSON.parse(localStorage.getItem("logo"));
    const handleClickOutside = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    };
    const [expireModal, setExpireModal] = useState(false);
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [selectedBuisness, setSelectedBuisness] = useState([]);
    const [selectedCourts, setSelectedCourts] = useState([]);
    const [currentCourtId, setCurrentCourtId] = useState(null);
    const [selectedDate, setSelectedDate] = useState({
        fullDate: new Date().toISOString().split("T")[0],
        day: new Date().toLocaleDateString("en-US", { weekday: "long" })
    });
    const dayShortMap = {
        Monday: "Mon",
        Tuesday: "Tue",
        Wednesday: "Wed",
        Thursday: "Thu",
        Friday: "Fri",
        Saturday: "Sat",
        Sunday: "Sun"
    };
    const today = new Date();
    const dates = Array.from({ length: 40 }).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return {
            day: date.toLocaleDateString("en-US", { weekday: "long" }),
            date: date.getDate(),
            month: date.toLocaleDateString("en-US", { month: "short" }),
            fullDate: date.toISOString().split("T")[0],
        };
    });

    const scroll = (direction) => {
        if (scrollRef.current) {
            const buttonWidth = 90;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -buttonWidth : buttonWidth,
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        if (slotData?.message === "jwt token is expired") {
            setExpireModal(true);
        }
    }, [slotData?.message === "jwt token is expired"]);


    const toggleTime = (time) => {
        const totalSlots = selectedCourts.reduce((acc, c) => acc + c.time.length, 0);
        const currentCourt = selectedCourts.find(c => c._id === currentCourtId && c.date === selectedDate.fullDate);
        const currentSlots = currentCourt ? currentCourt.time.length : 0;
        const otherSlots = totalSlots - currentSlots;
        const isAlreadySelected = selectedTimes.some(t => t._id === time._id);

        if (isAlreadySelected) {
            setSelectedTimes(selectedTimes.filter(t => t._id !== time._id));
            setSelectedBuisness(selectedBuisness.filter(t => t._id !== time._id));
        } else {
            const newLength = selectedTimes.length + 1;
            if (otherSlots + newLength > 15) {
                setErrorMessage("Maximum 15 slots can be selected in total.");
                setErrorShow(true);
                return;
            }
            setSelectedTimes([...selectedTimes, time]);
            setSelectedBuisness([...selectedBuisness, time]);
        }
    };

    const handleCourtSelect = (court) => {
        setSelectedCourts(prev => {
            const isSelectedOnDate = prev.some(c => c._id === court._id && c.date === selectedDate.fullDate);
            let updatedCourts;
            if (!isSelectedOnDate) {
                const totalSlots = prev.reduce((acc, c) => acc + c.time.length, 0);
                if (totalSlots >= 15) {
                    setErrorMessage("Maximum 15 slots can be selected. Cannot add more courts.");
                    setErrorShow(true);
                    return prev;
                }
                if (prev.length >= 15) {
                    return prev; // Max 15 courts
                }
                const newCourt = {
                    ...court,
                    date: selectedDate?.fullDate,
                    day: selectedDate?.day,
                    time: [],
                };
                updatedCourts = [...prev, newCourt];
                setSelectedTimes([]);
            } else {
                updatedCourts = prev;
                const courtOnDate = prev.find(c => c._id === court._id && c.date === selectedDate.fullDate);
                const courtTimes = courtOnDate.time;
                setSelectedTimes(courtTimes.map(t => ({
                    _id: t._id,
                    time: t.time,
                    amount: t.amount
                })));
            }
            setCurrentCourtId(court._id);

            // Dispatch with only the clicked court's ID
            dispatch(
                getUserSlot({
                    day: selectedDate?.day,
                    date: selectedDate?.fullDate,
                    register_club_id: localStorage.getItem("register_club_id") || "",
                    courtId: court._id, // Only send the current/clicked court ID
                })
            );
            return updatedCourts;
        });
    };

    const handleDeleteSlot = (courtIndex, slotIndex) => {
        const removedSlotId = selectedCourts[courtIndex]?.time[slotIndex]?._id;
        if (!removedSlotId) {
            console.error("Removed slot ID is undefined");
            return;
        }

        setSelectedCourts(prev => {
            let updated = [...prev];
            if (updated[courtIndex]?.time) {
                updated[courtIndex].time = updated[courtIndex].time.filter((_, i) => i !== slotIndex);
            }
            return updated;
        });

        setSelectedBuisness(prev => prev.filter(t => t._id !== removedSlotId));
        const isCurrent = selectedCourts[courtIndex]._id === currentCourtId && selectedCourts[courtIndex].date === selectedDate.fullDate;
        if (isCurrent) {
            setSelectedTimes(prevTimes => prevTimes.filter((_, i) => i !== slotIndex));
        }
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
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: 0,
        overflow: 'visible',
    };

    const svgStyle = {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
    };

    const contentStyle = {
        position: 'relative',
        zIndex: 2,
        color: 'white',
        fontWeight: '600',
        fontSize: `16px`,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        paddingRight: `${circleRadius * 2}px`,
    };

    const maxSelectableDate = new Date();
    maxSelectableDate.setDate(maxSelectableDate.getDate() + 40);

    useEffect(() => {
        const clubId = localStorage.getItem("register_club_id");
        dispatch(getUserClub({ search: "" }))
        dispatch(
            getUserSlot({
                day: selectedDate.day,
                date: format(new Date(selectedDate.fullDate), "yyyy-MM-dd"),
                courtId: "",
                register_club_id: clubId || "",
            })
        );

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const clubId = localStorage.getItem("register_club_id");

        if (
            slotData?.data?.length > 0 &&
            slotData.data[0]?.courts?.length > 0 &&
            selectedCourts.length === 0
        ) {
            const courtIndex = 1;
            const firstCourt = slotData.data[0].courts[courtIndex - 1];

            if (!firstCourt?._id) {
                console.error("Court ID is missing in slotData.data[0].courts:", slotData.data[0].courts);
                setErrorMessage("Court ID not found. Please try again later.");
                setErrorShow(true);
                return;
            }

            const newCourt = {
                ...firstCourt,
                date: selectedDate?.fullDate,
                day: selectedDate?.day,
                time: [],
            };
            setSelectedCourts([newCourt]);
            setCurrentCourtId(firstCourt._id);

            // Dispatch with single court ID
            dispatch(
                getUserSlot({
                    day: selectedDate?.day,
                    date: format(new Date(selectedDate?.fullDate), "yyyy-MM-dd"),
                    courtId: firstCourt._id,
                    register_club_id: clubId || "",
                })
            );
        }
    }, [slotData, selectedDate, dispatch]);

    // New useEffect to auto-add court entry on date change if not present
    useEffect(() => {
        if (currentCourtId && slotData?.data?.length > 0 && slotData.data[0]?.courts?.length > 0) {
            const currentCourtOnDate = selectedCourts.find(c => c._id === currentCourtId && c.date === selectedDate.fullDate);
            if (!currentCourtOnDate) {
                const court = slotData.data[0].courts.find(c => c._id === currentCourtId);
                if (court) {
                    const newCourt = {
                        ...court,
                        date: selectedDate?.fullDate,
                        day: selectedDate?.day,
                        time: [],
                    };
                    setSelectedCourts(prev => [...prev, newCourt]);
                }
            }
        }
    }, [slotData, currentCourtId, selectedDate]);

    useEffect(() => {
        if (selectedDate?.fullDate && dateRefs.current[selectedDate?.fullDate]) {
            dateRefs.current[selectedDate?.fullDate].scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
            });
        }
    }, [selectedDate]);

    useEffect(() => {
        if (currentCourtId && selectedTimes?.length >= 0) {
            const timeOnly = selectedTimes?.map(item => ({
                _id: item?._id,
                time: item?.time,
                amount: item?.amount,
            }));
            setSelectedCourts(prev =>
                prev.map(court => {
                    if (court._id === currentCourtId && court.date === selectedDate.fullDate) {
                        return {
                            ...court,
                            time: timeOnly,
                        };
                    }
                    return court;
                })
            );
        }
    }, [selectedTimes, currentCourtId]);

    useEffect(() => {
        setSelectedTimes([]);
        if (selectedCourts?.length > 0) {

            // Dispatch with only current court ID if exists
            if (currentCourtId) {
                dispatch(
                    getUserSlot({
                        day: selectedDate?.day,
                        date: selectedDate?.fullDate,
                        courtId: currentCourtId,
                        register_club_id: localStorage.getItem("register_club_id") || "",
                    })
                );
            }

            const currentCourtOnDate = selectedCourts.find(c => c._id === currentCourtId && c.date === selectedDate.fullDate);
            if (currentCourtOnDate) {
                const currentTimes = currentCourtOnDate.time || [];
                setSelectedTimes(currentTimes.map(t => ({
                    _id: t._id,
                    time: t.time,
                    amount: t.amount
                })));
            }
        }
    }, [selectedDate]);

    const grandTotal = selectedCourts.reduce((sum, c) => sum + c.time.reduce((s, t) => s + Number(t.amount || 0), 0), 0);
    const totalSlots = selectedCourts.reduce((sum, c) => sum + c.time.length, 0);

    const handleBookNow = () => {
        const totalSlots = selectedCourts.reduce((acc, c) => acc + c.time.length, 0);
        if (totalSlots === 0) {
            setErrorMessage("Please select slot time");
            setErrorShow(true);
            return;
        }
        if (selectedCourts.length === 0) {
            setErrorMessage("Please select court");
            setErrorShow(true);
            return;
        }
        setErrorMessage("");

        // Get comma-separated court IDs
        const courtIds = selectedCourts.map(court => court._id).filter(id => id).join(',');

        navigate("/payment", {
            state: {
                courtData: {
                    day: selectedDate?.day,
                    date: selectedDate?.fullDate,
                    time: selectedBuisness,
                    courtId: courtIds,
                    court: selectedCourts.map((c) => ({
                        _id: c._id || c.id,
                        ...c,
                    })),
                    slot: slotData?.data?.[0]?.slot,
                },
                clubData: clubData,
                selectedCourts,
                selectedDate,
                grandTotal,
                totalSlots,
                currentCourtId,
            },
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setErrorShow(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [errorMessage, errorShow]);

    const handleSwitchChange = () => {
        setShowUnavailable(!showUnavailable);
    };

    return (
        <>
            <div className='container p-0 mb-5'>
                <div className="ps-0" style={{ height: "340px" }}>
                    <div className="image-zoom-container position-relative overflow-hidden rounded-3" style={{ height: '100%' }}>
                        <img src={twoball} alt="Paddle" className="img-fluid w-100 h-100 object-fit-cover rounded-3" />
                        <div
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center text-white p-5"
                            style={{
                                background: 'linear-gradient(to right, rgba(17, 20, 39, 1) 3%, rgba(255, 255, 255, 0) 100%)'
                            }}
                        >
                            <p className='mb-0' style={{ fontSize: "20px" }}>BOOK YOUR SLOT</p>
                            <h1 className="fw-bold display-5">{clubData?.clubName || "The Good Club"}</h1>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mt-4 d-flex mb-5 px-4">
                <div className="row">
                    <div className="col-7 py-5 rounded-3 px-4" style={{ backgroundColor: "#F5F5F566" }}>
                        <div className="calendar-strip">
                            <div className="mb-3" style={{ fontSize: "20px", fontWeight: "600", fontFamily: "Poppins" }}>
                                Select Date
                                <div className="position-relative d-inline-block" ref={wrapperRef}>
                                    <span
                                        className="rounded p-1 ms-2 shadow bg-white"
                                        style={{ cursor: "pointer", width: "26px", height: "26px" }}
                                        onClick={() => setIsOpen(!isOpen)}
                                    >
                                        <i className="bi bi-calendar2-week" style={{ width: "14px", height: "16px" }}></i>
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
                                                    setIsOpen(false);
                                                    const formattedDate = date.toISOString().split("T")[0];
                                                    const day = date.toLocaleDateString("en-US", { weekday: "long" });
                                                    setSelectedDate({ fullDate: formattedDate, day: day });
                                                    setSelectedTimes([]);
                                                }}
                                                inline
                                                maxDate={maxSelectableDate}
                                                minDate={new Date()}
                                                dropdownMode="select"
                                                calendarClassName="custom-calendar w-100 shadow-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <button className="btn btn-light p-0" onClick={() => scroll("left")}>
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                                <div
                                    ref={scrollRef}
                                    className="d-flex gap-2 overflow-auto no-scrollbar"
                                    style={{
                                        scrollBehavior: "smooth",
                                        whiteSpace: "nowrap",
                                        maxWidth: "650px",
                                    }}
                                >
                                    {dates?.map((d, i) => {
                                        const formatDate = (date) => {
                                            return date.toISOString().split("T")[0];
                                        };
                                        const isSelected = formatDate(new Date(selectedDate?.fullDate)) === d.fullDate;
                                        return (
                                            <button
                                                ref={(el) => (dateRefs.current[d.fullDate] = el)}
                                                key={i}
                                                className={`calendar-day-btn rounded  ${isSelected ? "text-white" : "bg-light text-dark"}`}
                                                style={{
                                                    backgroundColor: isSelected ? "#374151" : undefined,
                                                    boxShadow: isSelected ? '0px 4px 4px 0px #00000040' : '',
                                                    border: isSelected ? '' : '1px solid #4949491A',
                                                    minWidth: "85px",
                                                }}
                                                onClick={() => {
                                                    setSelectedDate({ fullDate: d?.fullDate, day: d?.day });
                                                    setStartDate(new Date(d.fullDate));
                                                    setSelectedTimes([]);
                                                }}
                                            >
                                                <div className="text-center">
                                                    <div style={{ fontSize: "14px", fontWeight: "400", fontFamily: "Poppins" }}>{dayShortMap[d.day]}</div>
                                                    <div style={{ fontSize: "26px", fontWeight: "500", fontFamily: "Poppins" }}>{d.date}</div>
                                                    <div style={{ fontSize: "14px", fontWeight: "400", fontFamily: "Poppins" }}>{d.month}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <button className="btn btn-light p-0" onClick={() => scroll("right")}>
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center py-2">
                            <p className="mb-0" style={{ fontSize: "20px", fontWeight: '600', fontFamily: "Poppins" }}>
                                Available Slots <span className="" style={{ fontWeight: "400", fontSize: "13px" }}>(60m)</span>
                            </p>
                            <div className="form-switch d-flex align-items-center gap-2 p-0">
                                <input
                                    className="form-check-input fs-5 mb-1"
                                    type="checkbox"
                                    role="switch"
                                    id="flexSwitchCheckDefault"
                                    checked={showUnavailable}
                                    onChange={handleSwitchChange}
                                    style={{ boxShadow: "none" }}
                                />
                                <label
                                    className="form-check-label mb-0"
                                    htmlFor="flexSwitchCheckDefault"
                                    style={{ whiteSpace: "nowrap", fontFamily: "Poppins" }}
                                >
                                    Show Unavailable Slots
                                </label>
                            </div>
                        </div>
                        {slotLoading ? (
                            <DataLoading height={"30vh"} />
                        ) : (
                            <>
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    {slotData?.data?.length > 0 && slotData?.data?.[0]?.slot?.[0]?.slotTimes?.length > 0 ? (
                                        (() => {
                                            const selectedDateObj = new Date(selectedDate?.fullDate);
                                            const now = new Date();
                                            const isToday = selectedDateObj.toDateString() === now.toDateString();

                                            const filteredSlots = slotData?.data?.[0]?.slot?.[0]?.slotTimes.filter(slot => {
                                                const [hourString, period] = slot?.time?.toLowerCase().split(" ");
                                                let hour = parseInt(hourString);
                                                if (period === "pm" && hour !== 12) hour += 12;
                                                if (period === "am" && hour === 12) hour = 0;
                                                const slotDate = new Date(selectedDateObj);
                                                slotDate.setHours(hour, 0, 0, 0);
                                                const isPast = isToday && slotDate.getTime() < now.getTime();
                                                const isBooked = slot?.status === "booked";
                                                return showUnavailable ? (isPast || isBooked) : true;
                                            });
                                            return filteredSlots.length > 0 ? (
                                                filteredSlots.map((slot, i) => {
                                                    const [hourString, period] = slot?.time?.toLowerCase().split(" ");
                                                    let hour = parseInt(hourString);
                                                    if (period === "pm" && hour !== 12) hour += 12;
                                                    if (period === "am" && hour === 12) hour = 0;
                                                    const slotDate = new Date(selectedDateObj);
                                                    slotDate.setHours(hour, 0, 0, 0);
                                                    const isPast = isToday && slotDate.getTime() < now.getTime();
                                                    const isBooked = slot?.status === "booked";
                                                    const isSelected = selectedTimes.some(t => t._id === slot._id);
                                                    const hasAmount = slot?.amount && !isNaN(Number(slot.amount)) && Number(slot.amount) > 0;
                                                    const currentCourt = selectedCourts.find(c => c._id === currentCourtId);
                                                    const currentSlots = currentCourt ? currentCourt.time.length : 0;
                                                    const isLimitReached = currentSlots === 15 && !isSelected;

                                                    return (
                                                        <button
                                                            key={i}
                                                            className={`btn border-0 rounded-pill px-4 ${isBooked ? " bg-secondary-subtle" : isPast ? "bg-secondary-subtle" : ""}`}
                                                            onClick={() => !isPast && !isBooked && hasAmount && !isLimitReached && toggleTime(slot)}
                                                            style={{
                                                                backgroundColor: isSelected
                                                                    ? "#374151"
                                                                    : isBooked
                                                                        ? "#888888"
                                                                        : isLimitReached
                                                                            ? "#fff7df"
                                                                            : !hasAmount
                                                                                ? "#fff7df"
                                                                                : isPast
                                                                                    ? "#CBD6FF1A"
                                                                                    : "#FAFBFF",
                                                                border: "1px solid #CBD6FF1A",
                                                                color: isSelected
                                                                    ? "white"
                                                                    : isPast || hasAmount || isBooked
                                                                        ? "#888888"
                                                                        : "#000000",
                                                                cursor: isPast || isBooked || !hasAmount || isLimitReached ? "not-allowed" : "pointer",
                                                                opacity: isPast || isBooked || !hasAmount || isLimitReached ? 0.6 : 1,
                                                                border: "1px solid #CBD6FF1A",
                                                            }}
                                                        >
                                                            {formatTime(slot?.time)}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center">
                                                    <p className="text-danger text-center fw-medium">No slots available for this date.</p>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-danger text-center fw-medium">No slots available for this date.</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="d-flex justify-content-between align-items-center py-2">
                                        <p className="mb-0" style={{ fontSize: "20px", fontWeight: '600', fontFamily: "Poppins" }}>
                                            Available Court
                                        </p>
                                        <div>
                                            <a
                                                href="#"
                                                className="text-decoration-none d-inline-flex align-items-center"
                                                style={{ color: "#1F41BB", fontFamily: "Poppins" }}
                                                data-bs-toggle="modal"
                                                data-bs-target="#courtLayoutModal"
                                            >
                                                View Court Layout <i className="bi bi-arrow-right fs-5 ms-2"></i>
                                            </a>
                                            <div
                                                className="modal fade"
                                                id="courtLayoutModal"
                                                tabIndex="-1"
                                                aria-labelledby="courtLayoutModalLabel"
                                                aria-hidden="true"
                                            >
                                                <div className="modal-dialog modal-dialog-centered">
                                                    <div className="modal-content rounded-4 p-3">
                                                        <div className="modal-header border-0 p-0">
                                                            <div className="w-100 d-flex align-items-center justify-content-center position-relative">
                                                                <h5 className="modal-title m-0" id="courtLayoutModalLabel">View Court Layout</h5>
                                                                <button
                                                                    type="button"
                                                                    className="btn-close position-absolute end-0 me-2"
                                                                    data-bs-dismiss="modal"
                                                                    aria-label="Close"
                                                                ></button>
                                                            </div>
                                                        </div>
                                                        <div className="modal-body p-0 mt-4">
                                                            {Array.isArray(slotData?.data[0]?.courts) &&
                                                                slotData?.data[0]?.courts?.length === 4 ? (
                                                                // Custom Layout for 4 courts
                                                                <div className="row g-2">
                                                                    <div className="col-3">
                                                                        <div className="border rounded-3 d-flex align-items-center justify-content-center" style={{ height: "160px" }}>
                                                                            {slotData?.data[0]?.courts[0]?.courtName}
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-6 d-flex flex-column gap-2">
                                                                        <div className="border rounded-3 d-flex align-items-center justify-content-center" style={{ height: "75px" }}>
                                                                            {slotData?.data[0]?.courts[1]?.courtName}
                                                                        </div>
                                                                        <div className="border rounded-3 d-flex align-items-center justify-content-center" style={{ height: "75px" }}>
                                                                            {slotData?.data[0]?.courts[2]?.courtName}
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-3">
                                                                        <div className="border rounded-3 d-flex align-items-center justify-content-center" style={{ height: "160px" }}>
                                                                            {slotData?.data[0]?.courts[3]?.courtName}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                // Fallback for other counts
                                                                <div className="row g-2">
                                                                    {slotData?.data[0]?.courts?.map((court, index) => (
                                                                        <div className="col-6" key={court._id || index}>
                                                                            <div
                                                                                className="border rounded-3 d-flex align-items-center justify-content-center"
                                                                                style={{ height: "80px" }}
                                                                            >
                                                                                {court?.courtName}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-3">
                                        {slotData?.data?.length > 0 &&
                                            slotData?.data?.[0]?.slot?.[0]?.slotTimes?.length > 0 ? (
                                            slotData.data[0]?.courts?.map((court) => (
                                                <div
                                                    key={court?._id}
                                                    onClick={() => handleCourtSelect(court)}
                                                    style={{ cursor: "pointer" }}
                                                    className={`d-flex ps-3 pe-3 justify-content-between align-items-center border-bottom py-3 mb-1 px-2 ${court._id === currentCourtId ? "bg-success-subtle rounded" : "bg-white"}`}
                                                >
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img
                                                            src='https://www.brookstreet.co.uk/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBMEZCVXc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--4accdb1f96a306357a7fdeec518b142d3d50f1f2/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2QzNKbGMybDZaVWtpRFRnd01IZzJOVEE4QmpzR1ZBPT0iLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--bcd925903d97179ca0141ad2735607ce8eed3d71/bs_court-ushers_800.jpg'
                                                            alt={court.name}
                                                            style={{
                                                                width: "45px",
                                                                height: "45px",
                                                                borderRadius: "50%",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                        <div>
                                                            <div className="fw-semibold">{court?.courtName}</div>
                                                            <small className="text-muted">{court.type}</small>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-center gap-3">
                                                        <p className="custom-title mb-0">₹ 1000</p>
                                                        <button
                                                            className="btn btn-dark rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                            style={{ width: "32px", height: "32px" }}
                                                        >
                                                            <FaShoppingCart size={14} color="white" />
                                                        </button>
                                                    </div>

                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-muted">No courts available</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="col-5 ps-4">
                        <div className="border w-100 rounded px-3 py-5 border-0" style={{ backgroundColor: "#CBD6FF1A" }}>
                            <div className="text-center mb-3">
                                <div className="d-flex justify-content-center" style={{ lineHeight: '90px' }}>
                                    {logo ? (
                                        <Avatar src={logo} alt="User Profile" />
                                    ) : (
                                        <Avatar>
                                            {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                                        </Avatar>
                                    )}
                                </div>
                                <p className="mt-2 mb-1" style={{ fontSize: "20px", fontWeight: "600", color: "#000000", fontFamily: "Poppins" }}>{clubData?.clubName}</p>
                                <p className=" mb-0" style={{ fontSize: "14px", fontWeight: "500", color: "#000000", fontFamily: "Poppins" }}>
                                    {clubData?.clubName}
                                    {clubData?.address || clubData?.city || clubData?.state || clubData?.zipCode ? ', ' : ''}
                                    {[clubData?.address, clubData?.city, clubData?.state, clubData?.zipCode]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                            </div>
                            <h6 className="border-top p-2 mb-1 ps-0" style={{ fontSize: "20px", fontWeight: "600" }}>Booking summary</h6>
                            <div style={{ maxHeight: "240px", overflowY: "auto", overflowX: "hidden" }}>
                                {selectedCourts?.length && selectedCourts.some(court => court?.time?.length > 0) ? (
                                    selectedCourts.map((court, index) => (
                                        <>
                                            {court?.time?.map((timeSlot, timeIndex) => (
                                                <div key={`${index}-${timeIndex}`} className="row mb-2">
                                                    <div className="col-12 d-flex gap-2 mb-0 m-0 align-items-center justify-content-between">
                                                        <div className="d-flex">
                                                            <span style={{ fontWeight: "600", fontFamily: 'Poppins', fontSize: "18px", color: "#374151" }}>
                                                                {court?.day ? dayShortMap[court.day.toLowerCase()] : ''}
                                                            </span>
                                                            <span className="ps-2" style={{ fontWeight: "600", fontFamily: 'Poppins', fontSize: "18px", color: "#374151" }}>
                                                                {(() => {
                                                                    if (!court?.date) return "";
                                                                    const date = new Date(court.date);
                                                                    const day = date.toLocaleString("en-US", { day: "2-digit" });
                                                                    const month = date.toLocaleString("en-US", { month: "short" });
                                                                    return `${day} ${month}`;
                                                                })()}
                                                            </span>
                                                            <span className="ps-2" style={{ fontWeight: "600", fontFamily: 'Poppins', fontSize: "18px", color: "#374151" }}>
                                                                {timeSlot?.time} (60m)
                                                            </span>
                                                            <span className="ps-2" style={{ fontWeight: "500", fontFamily: 'Poppins', fontSize: "16px", color: "#374151" }}>
                                                                {court?.courtName}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            <span className="ps-2" style={{ fontWeight: "600", color: "#1A237E" }}>
                                                                ₹{timeSlot?.amount || 2000}
                                                            </span>
                                                            <button
                                                                className="btn btn-sm  text-danger delete-btn "
                                                                onClick={() => handleDeleteSlot(index, timeIndex)}
                                                            >
                                                                <i className="bi bi-trash-fill mb-2 "></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ))
                                ) : (
                                    <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: "25vh" }}>
                                        <p className="text-danger" style={{ fontSize: "15px", fontFamily: "Poppins", fontWeight: '600' }}>
                                            No slot selected
                                        </p>
                                    </div>
                                )}

                            </div>
                            {totalSlots > 0 && (
                                <div className="border-top pt-2 mt-2 d-flex justify-content-between fw-bold" style={{ overflowX: "hidden" }}>
                                    <span style={{ fontSize: "16px", fontWeight: "600" }}>Total to Pay</span>
                                    <span style={{ fontSize: "16px", fontWeight: "600" }}>Slots {totalSlots}</span>
                                    <span style={{ fontSize: "22px", fontWeight: "600", color: "#1A237E" }}>
                                        ₹ {grandTotal}
                                    </span>
                                </div>
                            )}
                            {errorShow && <Alert variant="danger">{errorMessage}</Alert>}
                            <div className="d-flex justify-content-center mt-3">
                                <button
                                    style={{ ...buttonStyle }}
                                    className={className}
                                    onClick={() => handleBookNow()}
                                >
                                    <svg
                                        style={svgStyle}
                                        viewBox={`0 0 ${width} ${height}`}
                                        preserveAspectRatio="none"
                                    >
                                        <defs>
                                            <linearGradient id={`buttonGradient-${width}-${height}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#3DBE64" />
                                                <stop offset="50%" stopColor="#3DBE64" />
                                                <stop offset="100%" stopColor="#3DBE64" />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d={`M ${width * 0.76} ${height * 0.15} 
             C ${width * 0.79} ${height * 0.15} ${width * 0.81} ${height * 0.20} ${width * 0.83} ${height * 0.30} 
             C ${width * 0.83} ${height * 0.32} ${width * 0.84} ${height * 0.34} ${width * 0.84} ${height * 0.34} 
             C ${width * 0.85} ${height * 0.34} ${width * 0.86} ${height * 0.32} ${width * 0.86} ${height * 0.30} 
             C ${width * 0.88} ${height * 0.20} ${width * 0.90} ${height * 0.15} ${width * 0.92} ${height * 0.15} 
             C ${width * 0.97} ${height * 0.15} ${width * 0.996} ${height * 0.30} ${width * 0.996} ${height * 0.50} 
             C ${width * 0.996} ${height * 0.70} ${width * 0.97} ${height * 0.85} ${width * 0.92} ${height * 0.85} 
             C ${width * 0.90} ${height * 0.85} ${width * 0.88} ${height * 0.80} ${width * 0.86} ${height * 0.70} 
             C ${width * 0.86} ${height * 0.68} ${width * 0.85} ${height * 0.66} ${width * 0.84} ${height * 0.66} 
             C ${width * 0.84} ${height * 0.66} ${width * 0.83} ${height * 0.68} ${width * 0.83} ${height * 0.70} 
             C ${width * 0.81} ${height * 0.80} ${width * 0.79} ${height * 0.85} ${width * 0.76} ${height * 0.85} 
             L ${width * 0.08} ${height * 0.85} 
             C ${width * 0.04} ${height * 0.85} ${width * 0.004} ${height * 0.70} ${width * 0.004} ${height * 0.50} 
             C ${width * 0.004} ${height * 0.30} ${width * 0.04} ${height * 0.15} ${width * 0.08} ${height * 0.15} 
             L ${width * 0.76} ${height * 0.15} Z`}
                                            fill={`url(#buttonGradient-${width}-${height})`}
                                        />
                                        <circle
                                            cx={circleX}
                                            cy={circleY}
                                            r={circleRadius}
                                            fill="#3DBE64"
                                        />
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