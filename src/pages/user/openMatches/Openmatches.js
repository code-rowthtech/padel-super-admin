import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaMapMarkerAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { useDispatch, useSelector } from "react-redux";
import { DataLoading } from "../../../helpers/loading/Loaders";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { player } from "../../../assets/files";
import { FormCheck } from "react-bootstrap";
import { getUserSlot } from "../../../redux/user/slot/thunk";
import { getMatchesUser } from "../../../redux/user/matches/thunk";
import { getReviewClub } from "../../../redux/user/club/thunk";
import StarHalfIcon from '@mui/icons-material/StarHalf';

const Openmatches = ({ width = 370, height = 70 }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const [showUnavailableOnly, setShowUnavailableOnly] = useState(false);
    const dateRefs = useRef({});
    const wrapperRef = useRef(null);
    const navigate = useNavigate();
    const user = getUserFromSession();
    const dispatch = useDispatch();
    const matchesData = useSelector((state) => state.userMatches?.usersData);
    const matchLoading = useSelector((state) => state.userMatches?.usersLoading);
    const { slotData } = useSelector((state) => state?.userSlot);
    const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
    const getReviewData = useSelector((store) => store?.userClub?.getReviewData?.data)


    console.log({ getReviewData });

    // Close on outside click
    const handleClickOutside = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    };

    React.useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [selectedTimes, setSelectedTimes] = useState([]);
    const [selectedDate, setSelectedDate] = useState({
        fullDate: new Date().toISOString().split("T")[0],
        day: new Date().toLocaleDateString("en-US", { weekday: "long" })
    });

    const today = new Date();
    const dates = Array.from({ length: 40 }).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return {
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            date: date.getDate(),
            month: date.toLocaleDateString("en-US", { month: "short" }),
            fullDate: date.toISOString().split("T")[0],
        };
    });

    console.log({ dates });

    const toggleTime = (time) => {
        if (selectedTimes.includes(time)) {
            setSelectedTimes(selectedTimes.filter((t) => t !== time));
        } else {
            setSelectedTimes([...selectedTimes, time]);
        }
    };

    const maxSelectableDate = new Date();
    maxSelectableDate.setDate(maxSelectableDate.getDate() + 40);

    const savedClubId = localStorage.getItem("register_club_id");

    // Fetch slots on page load and date change
    useEffect(() => {
        if (savedClubId && selectedDate?.day && selectedDate?.fullDate) {
            dispatch(
                getUserSlot({
                    register_club_id: savedClubId,
                    day: selectedDate.day,
                    date: selectedDate.fullDate,
                })
            );
        }
    }, [dispatch, savedClubId, selectedDate]);

    useEffect(() => {
        dispatch(getMatchesUser());
    }, [dispatch, selectedDate]);

    const dayShortMap = {
        Monday: "Mon",
        Tuesday: "Tue",
        Wednesday: "Wed",
        Thursday: "Thu",
        Friday: "Fri",
        Saturday: "Sat",
        Sunday: "Sun",
    };

    const [startIndex, setStartIndex] = useState(0);
    const visibleDays = 7;

    const scroll = (direction) => {
        if (direction === "left" && startIndex > 0) {
            setStartIndex(startIndex - 1);
        }
        if (direction === "right" && startIndex < dates.length - visibleDays) {
            setStartIndex(startIndex + 1);
        }
    };

    const [selectedLevel, setSelectedLevel] = useState("");

    const handleSelect = (level) => {
        setSelectedLevel(level);
    };

    // Filter matches based on selectedLevel and date
    const filteredMatches = selectedLevel
        ? matchesData?.data?.filter((match) =>
            match?.skillLevel === selectedLevel &&
            (!selectedDate || new Date(match.matchDate).toISOString().split("T")[0] === selectedDate.fullDate)
        ) || []
        : matchesData?.data?.filter((match) =>
            !selectedDate || new Date(match.matchDate).toISOString().split("T")[0] === selectedDate.fullDate
        ) || [];

    const createMatchesHandle = () => {
        if (user?.id || user?._id) {
            navigate('/create-matches');
        } else {
            navigate('/login');
        }
    };

    const formatMatchDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.toLocaleDateString("en-US", { day: "2-digit" });
        const month = date.toLocaleDateString("en-US", { month: "short" });
        return `${day} ${month}`;
    };

    const calculateMatchPrice = (slots) => {
        return slots?.reduce((total, court) => {
            return total + court.slotTimes.reduce((sum, slotTime) => sum + Number(slotTime.amount), 0);
        }, 0).toFixed(0);
    };

    const formatTimes = (slots) => {
        return slots
            .map((slot) => {
                const time = slot?.slotTimes?.[0]?.time.toUpperCase();
                if (!time) return null;
                const [hours, minutes] = time.split(":");
                const hour = parseInt(hours, 10);
                const period = hour >= 12 ? "PM" : "AM";
                const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                return `${formattedHour}${period}`;
            })
            .filter((time) => time !== null)
            .join(",");
    };

    useEffect(() => {
        if (savedClubId) {
            dispatch(getReviewClub(savedClubId));
        }
    }, [savedClubId]);

    return (
        <div className="container mt-4 d-flex gap-4 px-4 flex-wrap">
            <div className="row">
                {/* Left Section */}
                <div className="col-7 py-5 rounded-3 px-4" style={{ backgroundColor: "#F5F5F566" }}>
                    {/* Date Selector */}
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
                                className="d-flex gap-2 overflow-auto no-scrollbar"
                                style={{
                                    scrollBehavior: "smooth",
                                    whiteSpace: "nowrap",
                                    maxWidth: "650px",
                                }}
                            >
                                {dates?.map((d, i) => {
                                    const isSelected = selectedDate?.fullDate === d.fullDate;
                                    console.log(d, 'pakkkkk');
                                    return (
                                        <button
                                            ref={(el) => (dateRefs.current[d.fullDate] = el)}
                                            key={i}
                                            className={`calendar-day-btn rounded border ${isSelected ? "text-white" : "bg-light text-dark"}`}
                                            style={{
                                                backgroundColor: isSelected ? "#374151" : undefined,
                                                border: "none",
                                                minWidth: "85px",
                                            }}
                                            onClick={() => {
                                                setSelectedDate({ fullDate: d.fullDate, day: d.day });
                                                setStartDate(new Date(d.fullDate));
                                                setSelectedTimes([]);
                                            }}
                                        >
                                            <div className="text-center">
                                                <div style={{ fontSize: "14px", fontWeight: "400", fontFamily: "Poppins" }}>{d.day}</div>
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

                    {/* Time Selector with Toggle */}
                    <div className="d-flex justify-content-between align-items-center py-2">
                        <p className="mb-0" style={{ fontSize: "20px", fontWeight: 600 }}>
                            Available Slots
                        </p>
                        <FormCheck
                            type="switch"
                            id="show-unavailable"
                            label="Show Unavailable Only"
                            checked={showUnavailableOnly}
                            onChange={(e) => setShowUnavailableOnly(e.target.checked)}
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                    {slotLoading ? (
                        <DataLoading height={"30vh"} />
                    ) : (
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
                                        return showUnavailableOnly ? (isPast || isBooked) : true;
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

                                            return (
                                                <button
                                                    key={i}
                                                    className={`btn border-0 rounded-pill px-4 ${isBooked ? "bg-danger text-white" : isPast ? "bg-secondary-subtle" : ""}`}
                                                    onClick={() => !isPast && !isBooked && hasAmount && toggleTime(slot)}
                                                    style={{
                                                        backgroundColor: isSelected
                                                            ? "#374151"
                                                            : isBooked
                                                                ? "#b42424ff"
                                                                : !hasAmount
                                                                    ? "#fff7df"
                                                                    : isPast && !isBooked
                                                                        ? "#CBD6FF1A"
                                                                        : "#FAFBFF",
                                                        color: isSelected
                                                            ? "white"
                                                            : isPast && !isBooked
                                                                ? "#888888"
                                                                : isBooked
                                                                    ? "white"
                                                                    : "#000000",
                                                        cursor: isPast || isBooked || !hasAmount ? "not-allowed" : "pointer",
                                                        opacity: isPast || isBooked || !hasAmount ? 0.6 : 1,
                                                        border: "1px solid #CBD6FF1A",
                                                    }}
                                                >
                                                    {isBooked ? "Booked" : slot.time}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="d-flex justify-content-center align-items-center fw-medium" style={{ height: "150px", fontSize: "16px", fontFamily: "Poppins" }}>
                                            <p className="">No slots available for this date.</p>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="d-flex justify-content-center align-items-center text-danger fw-medium" style={{ height: "200px", fontSize: "16px", fontFamily: "Poppins" }}>
                                    <p className="text-center">No slots available for this date.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Court List */}
                    <div className="container pb-4">
                        <div className="d-flex justify-content-start align-items-center gap-3 mb-4">
                            <h5 className="mb-0" style={{ fontSize: "20px", fontWeight: "600" }}>All Matches</h5>
                            <div className="dropdown">
                                <button
                                    className="btn btn-light border py-1 px-3 d-flex align-items-center gap-2"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <span className="me-3">{selectedLevel || "Choose level"}</span>
                                    <FaChevronDown style={{ fontSize: "10px" }} />
                                </button>
                                <ul className="dropdown-menu shadow-sm">
                                    {['beginner', 'intermediate', 'advanced', 'professional'].map((level) => (
                                        <li key={level}>
                                            <button className="dropdown-item" onClick={() => handleSelect(level)}>
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Match Cards */}
                        {filteredMatches?.length && matchesData?.data?.length > 0 ? (
                            filteredMatches && matchesData?.data?.map((match, index) => (
                                <div key={index} className="card border-0 shadow-sm mb-3 rounded-2" style={{ backgroundColor: "#CBD6FF1A" }}>
                                    <div className="card-body px-4 py-3 d-flex justify-content-between flex-wrap">
                                        <div>
                                            {console.log(match, '0000000000000000000000')}
                                            <p className="mb-1" style={{ fontSize: "18px", fontWeight: "600" }}>
                                                {formatMatchDate(match.matchDate)} | {formatTimes(match.slot)}
                                                <span className="fw-normal text-muted ms-3">{match?.skillLevel.charAt(0).toUpperCase() + match?.skillLevel.slice(1)}</span>
                                            </p>
                                            <p className="mb-1" style={{ fontSize: "15px", fontWeight: "500" }}>{match?.clubId?.clubName}</p>
                                            <p className="mb-0 text-muted" style={{ fontSize: "12px", fontWeight: "400" }}>
                                                <FaMapMarkerAlt className="me-2" />
                                                {match?.clubId?.city} {match?.clubId?.zipCode}
                                            </p>
                                        </div>
                                        <div className="gap-4 d-flex flex-wrap justify-content-end mt-3 mt-md-0">
                                            <div className="text-end">
                                                <div className="d-flex align-items-center justify-content-end">
                                                    {match?.players?.length < 4 && (
                                                        <div className="text-end">
                                                            <div className="d-flex align-items-center rounded-pill pe-3" style={{
                                                                backgroundColor: "#fff",
                                                                borderRadius: "999px",
                                                                zIndex: 999
                                                            }}>
                                                                <div
                                                                    className="d-flex justify-content-center align-items-center rounded-circle"
                                                                    style={{
                                                                        width: "40px",
                                                                        height: "40px",
                                                                        border: "1px solid #1D4ED8",
                                                                        color: "#1D4ED8",
                                                                        fontSize: "24px",
                                                                        fontWeight: "400",
                                                                        marginRight: "10px",
                                                                    }}
                                                                >
                                                                    <span className="d-flex align-items-center mb-1">+</span>
                                                                </div>
                                                                <div className="d-flex flex-column align-items-center">
                                                                    <span style={{ fontWeight: 600, color: "#1D4ED8", fontSize: "10px" }}>
                                                                        Available
                                                                    </span>
                                                                    <small style={{ fontSize: "8px", color: "#6B7280" }}>
                                                                        Team {match?.players?.length < 2 ? "A" : "B"}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {match?.players?.map((player, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="rounded-circle border d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: "40px",
                                                                height: "40px",
                                                                marginLeft: idx !== 0 ? "-10px" : "0",
                                                                zIndex: match?.players?.length - idx,
                                                                backgroundColor: player?.profilePic ? "transparent" : "#1F41BB",
                                                                overflow: "hidden"
                                                            }}
                                                        >
                                                            {player?.profilePic ? (
                                                                <img
                                                                    src={player?.profilePic}
                                                                    alt={player?.userId?.name || "Player"}
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                />
                                                            ) : (
                                                                <span style={{ color: "white", fontWeight: "600", fontSize: "16px" }}>
                                                                    {player?.userId?.name ? player?.userId?.name.charAt(0).toUpperCase() : "P"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="text-primary text-end mb-3" style={{ fontSize: "20px", fontWeight: "500" }}>
                                                    ₹ {calculateMatchPrice(match?.slot)}
                                                </div>
                                                <button className="btn rounded-pill px-4 text-white py-0 px-1" onClick={() => navigate('/view-match', { state: { match } })} style={{ backgroundColor: "#3DBE64", fontSize: "12px", fontWeight: "500" }}>
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="d-flex justify-content-center align-items-center text-danger fw-medium" style={{ height: "250px", fontSize: "18px", fontFamily: "Poppins" }}><p>No matches available</p></div>
                        )}
                    </div>
                </div>

                {/* Right Section - Booking Summary */}
                <div className="col-5">
                    <div className="container ms-2">
                        <div
                            className="row align-items-center text-white rounded-4 py-0 pt-2 ps-4"
                            style={{
                                background: "linear-gradient(to right, #101826, #1e293b)",
                                overflow: "visible",
                                position: "relative",
                            }}
                        >
                            <div className="col-md-6 mb-4 mb-md-0">
                                <h4 className="fw-bold">Let the Battles Begin!</h4>
                                <p className="text-light">Great for competitive vibes.</p>
                                <button
                                    className="btn create-match-btn text-white rounded-pill mb-3 ps-3 pe-3"
                                    onClick={createMatchesHandle}
                                    style={{ backgroundColor: "#3DBE64", fontSize: "14px", fontWeight: "500" }}
                                >
                                    Create Open Matches
                                </button>
                            </div>
                            <div className="col-md-6 text-center" style={{ position: "relative" }}>
                                <img
                                    src={player}
                                    alt="Player"
                                    className="img-fluid"
                                    style={{
                                        maxHeight: "390px",
                                        marginTop: "-20px",
                                        zIndex: 999,
                                        position: "relative",
                                    }}
                                />
                            </div>
                        </div>
                        <div className="px-4 py-5 row rounded-4 mt-4 h-100" style={{ backgroundColor: "#F5F5F566" }}>
                            <div className="col-4 text-center d-flex align-items-center justify-content-center">
                                <div className="w-100">
                                    <h4 style={{ fontSize: "16px", fontWeight: "500" }}>Overall Rating</h4>
                                    <div className="display-5 fw-bold">{getReviewData?.averageRating || 0}</div>
                                    <div className="text-success">
                                        {[...Array(5)].map((_, i) => {
                                            const rating = getReviewData?.averageRating || 0;
                                            if (i < Math.floor(rating)) {
                                                return <StarIcon key={i} style={{ color: "#32B768" }} />;
                                            } else if (i < rating && rating % 1 >= 0.5) {
                                                return <StarHalfIcon key={i} style={{ color: "#32B768" }} />;
                                            } else {
                                                return <StarBorderIcon key={i} style={{ color: "#ccc" }} />;
                                            }
                                        })}
                                    </div>
                                    <div className="text-muted mt-2" style={{ fontSize: "12px", fontFamily: "Poppins" }}>
                                        based on {getReviewData?.totalReviews || 0} reviews
                                    </div>
                                </div>
                            </div>
                            <div className="col-8 border-start d-flex align-items-center">
                                <div className="w-100">
                                    {["Excellent", "Very Good", "Good", "Average", "Poor"].map((label, idx) => {
                                        let width = "0%";
                                        let percent = 0;

                                        // Distribute percentages based on averageRating and ratingCategory
                                        const rating = getReviewData?.averageRating || 0;
                                        if (label === getReviewData?.ratingCategory) {
                                            percent = Math.round(rating * 20); // e.g., 3.5 * 20 = 70% for "Good"
                                        } else {
                                            // Estimated distribution for other categories
                                            const basePercent = Math.round((5 - rating) * 20 / 4); // Spread remaining percentage
                                            percent = idx < ["Excellent", "Very Good", "Good"].indexOf(getReviewData?.ratingCategory)
                                                ? basePercent * (3 - idx)
                                                : idx > ["Excellent", "Very Good", "Good"].indexOf(getReviewData?.ratingCategory)
                                                    ? basePercent * (idx - 2)
                                                    : basePercent;
                                        }
                                        width = `${percent}%`;

                                        return (
                                            <div className="d-flex align-items-center justify-content-between mb-1 w-100" key={idx}>
                                                <div className="me-2 fw-medium" style={{ width: "100px", fontSize: "12px", fontFamily: "Poppins" }}>
                                                    {label}
                                                </div>
                                                <div className="progress me-3 w-100" style={{ height: "8px", position: "relative" }}>
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            width,
                                                            backgroundColor:
                                                                idx === 0 ? "#3DBE64" : // Excellent (Green)
                                                                    idx === 1 ? "#7CBA3D" : // Very Good (Dark Green)
                                                                        idx === 2 ? "#ECD844" : // Good (Dark Green)
                                                                            idx === 3 ? "#FC702B" : // Average (Yellow)
                                                                                "#E9341F", // Poor (Red)
                                                        }}
                                                    ></div>
                                                </div>
                                                <div
                                                    style={{
                                                        color: "#000",
                                                        fontSize: "12px",
                                                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                                                    }}
                                                >
                                                    {percent}%
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Openmatches;