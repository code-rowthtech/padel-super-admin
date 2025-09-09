import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { FaChevronDown, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { useDispatch, useSelector } from "react-redux";
import { DataLoading } from "../../../helpers/loading/Loaders";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import { FormCheck } from "react-bootstrap";
import { getMatchesUser } from "../../../redux/user/matches/thunk";
import { getReviewClub } from "../../../redux/user/club/thunk";
import "react-datepicker/dist/react-datepicker.css";
import { player } from "../../../assets/files";
import UpdatePlayers from "../VeiwMatch/UpdatePlayers";
import { formatDate, formatTime } from "../../../helpers/Formatting";
import { MdOutlineDateRange } from "react-icons/md";
import debounce from "lodash/debounce";

const slotTime = [
    '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
];

const normalizeTime = (time) => {
    if (!time) return null;
    const match = time.match(/^(\d{1,2}):00\s*(AM|PM)$/i);
    if (match) {
        return `${match[1]} ${match[2].toLowerCase()}`;
    }
    return time;
};

const Openmatches = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const [showUnavailableOnly, setShowUnavailableOnly] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedDate, setSelectedDate] = useState({
        fullDate: new Date().toISOString().split("T")[0],
        day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    });
    const dateRefs = useRef({});
    const wrapperRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = getUserFromSession();
    const matchesData = useSelector((state) => state.userMatches?.usersData);
    const matchLoading = useSelector((state) => state.userMatches?.usersLoading);
    const reviewData = useSelector((state) => state.userClub?.getReviewData?.data);
    const reviewLoading = useSelector((state) => state.userClub?.reviewLoading);
    const [showModal, setShowModal] = useState(false);
    const [matchId, setMatchId] = useState(null);
    const [teamName, setTeamName] = useState('');

    const debouncedFetchMatches = useCallback(
        debounce((payload) => {
            dispatch(getMatchesUser(payload));
        }, 300),
        [dispatch]
    );

    const handleClickOutside = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const savedClubId = localStorage.getItem("register_club_id");
        if (savedClubId) {
            dispatch(getReviewClub(savedClubId));
        }
    }, [dispatch]);

    useEffect(() => {
        if (selectedDate?.fullDate && dateRefs.current[selectedDate?.fullDate]) {
            const selectedIndex = dates.findIndex(d => d.fullDate === selectedDate.fullDate);
            if (selectedIndex !== -1) {
                const targetIndex = Math.max(0, Math.min(selectedIndex - Math.floor(visibleDays / 2), dates.length - visibleDays));
                setStartIndex(targetIndex);
                dateRefs.current[selectedDate?.fullDate].scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest",
                });
            }
        }
    }, [selectedDate?.fullDate]);

    useEffect(() => {
        const payload = {
            matchDate: selectedDate?.fullDate,
            ...(selectedTime && { matchTime: normalizeTime(selectedTime) }),
            ...(selectedLevel && { skillLevel: selectedLevel }),
        };
        debouncedFetchMatches(payload);
    }, [selectedDate, selectedTime, selectedLevel, debouncedFetchMatches]);

    const today = new Date();
    const dates = Array.from({ length: 41 }).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return {
            day: date.toLocaleDateString("en-US", { weekday: "long" }),
            date: date.getDate(),
            month: date.toLocaleDateString("en-US", { month: "short" }),
            fullDate: date.toISOString().split("T")[0],
        };
    });

    const filteredMatches = useMemo(() => {
        return showUnavailableOnly
            ? matchesData?.data?.filter(match => match?.players?.length >= 4) || []
            : matchesData?.data || [];
    }, [showUnavailableOnly, matchesData]);

    const toggleTime = (time) => {
        setSelectedTime(selectedTime === time ? null : time);
    };

    const maxSelectableDate = new Date();
    maxSelectableDate.setDate(maxSelectableDate.getDate() + 40);

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

    const handleSelect = (level) => {
        setSelectedLevel(level);
    };

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
            return total + court.slotTimes.reduce((sum, slotTime) => sum + Number(slotTime.amount || 0), 0);
        }, 0).toFixed(0);
    };

    const formatTimes = (slots) => {
        if (!slots || slots.length === 0) return "N/A";
        const formatted = slots
            .slice(0, 3)
            .map((slot) => {
                const time = slot?.slotTimes?.[0]?.time;
                if (!time) return null;
                if (/am|pm/i.test(time)) {
                    return time.replace(/\s+/g, "").toUpperCase();
                }
                const [hours, minutes] = time.split(":");
                const hour = parseInt(hours, 10);
                const period = hour >= 12 ? "PM" : "AM";
                const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                return `${formattedHour}${period}`;
            })
            .filter(Boolean);
        return formatted.join(",") + (slots.length > 3 ? "...." : "");
    };

    const TagWrapper = ({ children }) => (
        <div
            className="d-flex align-items-center rounded-pill pe-3 me-0"
            style={{
                backgroundColor: "#fff",
                borderRadius: "999px",
                zIndex: 999,
                position: "relative",
                top: "0px",
                left: "20px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
        >
            {children}
        </div>
    );

    const AvailableTag = ({ team, match, name }) => (
        <TagWrapper>
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
                    cursor: "pointer",
                }}
                onClick={() => {
                    setShowModal(true);
                    setMatchId(match?._id);
                    setTeamName(name);
                }}
            >
                <span>+</span>
            </div>
            <div className="d-flex flex-column align-items-start">
                <span style={{ fontWeight: 600, color: "#1D4ED8", fontSize: "12px" }}>
                    Available
                </span>
                <small style={{ fontSize: "10px", color: "#6B7280" }}>{team}</small>
            </div>
        </TagWrapper>
    );

    const FirstPlayerTag = ({ player }) => (
        <TagWrapper>
            <div
                className="d-flex justify-content-center align-items-center rounded-circle overflow-hidden"
                style={{
                    width: "40px",
                    height: "40px",
                    marginRight: "10px",
                }}
            >
                {player?.profilePic ? (
                    <img
                        src={player?.profilePic}
                        alt={player?.name || "Player"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <span style={{ color: "#1D4ED8", fontWeight: "600", fontSize: "16px" }}>
                        {player?.name ? player?.name.charAt(0).toUpperCase() : "P"}
                    </span>
                )}
            </div>
            <div className="ps-0 text-start">
                <p
                    className="m-0"
                    style={{ fontWeight: 600, color: "#111827", fontSize: "12px" }}
                >
                    {player?.name || "Player"}
                </p>
                <p
                    className="m-0 mb-1 d-flex justify-content-center align-items-center rounded"
                    style={{
                        fontSize: "10px",
                        color: "#6B7280",
                        fontWeight: "500",
                        width: "30px",
                        backgroundColor: "#BEEDCC",
                    }}
                >
                    A|B
                </p>
            </div>
        </TagWrapper>
    );

    const PlayerAvatar = ({ player, idx, total }) => (
        <div
            className="rounded-circle border d-flex align-items-center justify-content-center position-relative"
            style={{
                width: "40px",
                height: "40px",
                marginLeft: idx !== 0 ? "-15px" : "0",
                zIndex: total - idx,
                backgroundColor: player?.userId?.profilePic ? "transparent" : "#374151",
                overflow: "hidden",
                border: "1px solid #E5E7EB",
            }}
        >
            {player?.userId?.profilePic ? (
                <img
                    src={player?.userId?.profilePic}
                    alt={player?.userId?.name || "Player"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            ) : (
                <span
                    style={{
                        color: "white",
                        fontWeight: "600",
                        fontSize: "16px",
                    }}
                >
                    {player?.userId?.name
                        ? player?.userId?.name.charAt(0).toUpperCase()
                        : "P"}
                </span>
            )}
        </div>
    );

    const dayShortMap = {
        Monday: "Mon",
        Tuesday: "Tue",
        Wednesday: "Wed",
        Thursday: "Thu",
        Friday: "Fri",
        Saturday: "Sat",
        Sunday: "Sun",
    };

    return (
        <div className="container mt-lg-4 px-3 px-md-4">
            <div className="row g-4">
                {/* Left Section */}
                <div className="col-lg-7 col-12 py-4 rounded-3 px-4" style={{ backgroundColor: "#F5F5F566" }}>
                    <div className="calendar-strip">
                        <div className="mb-4 custom-heading-use">
                            Select Date
                            <div className="position-relative d-inline-block" ref={wrapperRef}>
                                <span
                                    className="rounded p-1 pt-0 ms-2 bg-white"
                                    style={{
                                        cursor: "pointer",
                                        width: "26px !important",
                                        height: "26px !important",
                                        boxShadow: "0px 4px 4px 0px #00000014",
                                    }}
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    <MdOutlineDateRange size={20} style={{ color: "#374151" }} />
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
                                                setSelectedDate({ fullDate: formattedDate, day });
                                                setSelectedTime(null);
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
                            <button
                                className="btn btn-light p-0"
                                onClick={() => scroll("left")}
                                aria-label="Scroll to previous dates"
                            >
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
                                    const formatDate = (date) => {
                                        return date.toISOString().split("T")[0];
                                    };
                                    const isSelected = formatDate(new Date(selectedDate?.fullDate)) === d.fullDate;
                                    return (
                                        <button
                                            ref={(el) => (dateRefs.current[d.fullDate] = el)}
                                            key={i}
                                            className={`calendar-day-btn me-1 ${isSelected ? "text-white" : "bg-light"}`}
                                            style={{
                                                backgroundColor: isSelected ? "#374151" : '#CBD6FF1A',
                                                boxShadow: isSelected ? '0px 4px 4px 0px #00000040' : '',
                                                border: isSelected ? '1px solid #4949491A' : '1px solid #4949491A',
                                                borderRadius: "8px",
                                                color: isSelected ? "#FFFFFF" : "#374151"
                                            }}
                                            onClick={() => {
                                                setSelectedDate({ fullDate: d?.fullDate, day: d?.day });
                                                setStartDate(new Date(d.fullDate));
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.border = "1px solid #3DBE64";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.border = "1px solid #4949491A";
                                                }
                                            }}
                                        >
                                            <div className="text-center">
                                                <div className="date-center-day">{dayShortMap[d.day]}</div>
                                                <div className="date-center-date">{d.date}</div>
                                                <div className="date-center-day">{d.month}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                className="btn btn-light p-0"
                                onClick={() => scroll("right")}
                                aria-label="Scroll to next dates"
                            >
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    <div className="row mb-4 mx-auto">
                        {slotTime?.map((time, idx) => (
                            <div className="col-4 col-md-2 d-flex justify-content-lg-center align-items-start mb-1" key={idx}>
                                <button
                                    className={` text-nowrap btn rounded-pill slot-time-btn text-center me-1 px-lg-4 ms-1 mb-2`}
                                    onClick={() => toggleTime(time)}
                                    style={{
                                        backgroundColor: selectedTime === time ? "#374151" : "#FAFBFF",
                                        color: selectedTime === time ? "white" : "#000000",
                                        border: "1px solid #CBD6FF1A",
                                        transition: "border-color 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedTime !== time) {
                                            e.currentTarget.style.border = "1px solid #3DBE64";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.border = "1px solid #CBD6FF1A";
                                    }}
                                >
                                    {formatTime(time)}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Match List */}
                    <div className="pb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-start align-items-start align-items-md-center gap-3 mb-4">
                            <h5 className="mb-0 custom-heading-use">All Matches</h5>
                            <div className="dropdown">
                                <button
                                    className="btn btn-light border py-1 px-3 d-flex align-items-center gap-2"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    aria-label="Select skill level"
                                    style={{ minWidth: "150px" }}
                                >
                                    <span className="me-3" style={{ fontSize: "10px", fontFamily: "Poppins", fontWeight: "500" }}>
                                        {selectedLevel?.charAt(0)?.toUpperCase() + selectedLevel?.slice(1) || "Choose level"}
                                    </span>
                                    <FaChevronDown style={{ fontSize: "10px" }} />
                                </button>
                                <ul className="dropdown-menu shadow-sm">
                                    {['beginner', 'intermediate', 'advanced', 'professional'].map((level) => (
                                        <li key={level}>
                                            <button
                                                className="dropdown-item mb-3"
                                                style={{ fontSize: "12px", fontWeight: "400", fontFamily: "Poppins" }}
                                                onClick={() => handleSelect(level)}
                                            >
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div
                            style={{
                                minHeight: "480px",
                                maxHeight: filteredMatches.length > 4 ? "480px" : "auto",
                                overflowY: filteredMatches.length > 4 ? "auto" : "visible",
                                scrollBehavior: "smooth",
                            }}
                            className="no-scrollbar"
                        >
                            {matchLoading ? (
                                <DataLoading height={480} />
                            ) : filteredMatches.length > 0 ? (
                                filteredMatches?.map((match, index) => (
                                    <div
                                        key={index}
                                        className="card border-0 mb-3 py-3 shadow-0 rounded-2"
                                        style={{ backgroundColor: "#CBD6FF1A", border: '0.5px solid #0000001A', boxShadow: "none" }}
                                    >
                                        <div className="row px-2 px-md-3 py-2 d-flex justify-content-between align-items-center flex-wrap">
                                            <div className="col-6">
                                                <p className="mb-3 all-match-time" style={{ fontWeight: "600" }}>
                                                    {formatMatchDate(match.matchDate)} | {formatTimes(match.slot)}
                                                    <span className="text-muted all-match-name-level ms-3 d-none d-md-inline">
                                                        {match?.skillLevel
                                                            ? match.skillLevel.charAt(0).toUpperCase() + match.skillLevel.slice(1)
                                                            : "N/A"}
                                                    </span>
                                                </p>
                                                <p className="all-match-time mb-0 d-md-none d-lg-none">
                                                    {match?.skillLevel
                                                        ? match.skillLevel.charAt(0).toUpperCase() + match.skillLevel.slice(1)
                                                        : "N/A"}
                                                </p>
                                                <p className="mb-1 all-match-name-level">
                                                    {match?.clubId?.clubName || "Unknown Club"}
                                                </p>
                                                <p
                                                    className="mb-0 text-muted all-match-name-level"
                                                    style={{ fontSize: "10px", fontWeight: "400" }}
                                                >
                                                    <FaMapMarkerAlt className="me-1" style={{ fontSize: "8px" }} />
                                                    {match?.clubId?.city.charAt(0)?.toUpperCase() + match?.clubId?.city.slice(1) || "N/A"} {match?.clubId?.zipCode || ""}
                                                </p>
                                            </div>

                                            <div className="col-6 d-flex justify-content-end align-items-center">
                                                <div className="d-flex flex-column align-items-end">
                                                    <div className="d-flex align-items-center mb-3">
                                                        {match?.teamA?.length === 1 || match?.teamA?.length === 0 ? (
                                                            <AvailableTag team="Team A" match={match} name="teamA" />
                                                        ) : match?.teamB?.length === 1 || match?.teamB?.length === 0 ? (
                                                            <AvailableTag team="Team B" match={match} name="teamB" />
                                                        ) : match?.teamA?.length === 2 && match?.teamB?.length === 2 ? (
                                                            <FirstPlayerTag player={match?.teamA[0]?.userId} />
                                                        ) : null}

                                                        <div className="d-flex align-items-center ms-2">
                                                            {[
                                                                ...(match?.teamA?.filter((_, idx) =>
                                                                    match?.teamA?.length === 2 && match?.teamB?.length === 2
                                                                        ? idx !== 0
                                                                        : true
                                                                ) || []),
                                                                ...(match?.teamB || []),
                                                            ].map((player, idx, arr) => (
                                                                <PlayerAvatar
                                                                    key={`player-${idx}`}
                                                                    player={player}
                                                                    idx={idx}
                                                                    total={arr.length}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="d-flex flex-column align-items-center gap-1">
                                                        <div
                                                            className="text-primary all-matches"
                                                            style={{ fontWeight: "600", fontFamily: "none" }}
                                                        >
                                                            ₹ <span className="all-matches" style={{ fontWeight: "500" }}>{calculateMatchPrice(match?.slot) || 0}</span>
                                                        </div>
                                                        <button
                                                            className="btn rounded-pill d-flex justify-content-center align-items-center text-center view-match-btn text-white"
                                                            onClick={() => navigate("/view-match", { state: { match } })}
                                                            aria-label={`View match on ${formatMatchDate(match.matchDate)}`}
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div
                                    className="d-flex flex-column justify-content-center align-items-center text-danger fw-medium"
                                    style={{
                                        minHeight: "250px",
                                        fontSize: "18px",
                                        fontFamily: "Poppins",
                                    }}
                                >
                                    <p>No matches available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Section - Booking Summary */}
                <div className="col-12 col-lg-5">
                    <div className="container ms-0 ms-lg-2">
                        <div
                            className="row align-items-center text-white rounded-4 py-0 pt-2 ps-4"
                            style={{
                                background: "linear-gradient(to right, #101826, #1e293b)",
                                overflow: "visible",
                                position: "relative",
                            }}
                        >
                            <div className="col-12 col-md-6 mb-4 text-lg-start text-center mb-md-0">
                                <h4 className="open-match-img-heading text-nowrap">Let the Battles <br /> Begin!</h4>
                                <p className="text-light">Great for competitive vibes.</p>
                                <button
                                    className="btn create-match-btn mt-lg-2 text-white rounded-pill mb-3 ps-3 pe-3"
                                    onClick={createMatchesHandle}
                                    style={{ backgroundColor: "#3DBE64", fontSize: "14px", fontFamily: "Poppins", fontWeight: "500" }}
                                    aria-label="Create open matches"
                                >
                                    Create Open Matches
                                </button>
                            </div>
                            <div className="col-12 col-md-6 text-center" style={{ position: "relative" }}>
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
                        <div className="px-4 py-5 row rounded-4 pt-4 mt-4 mb-5 h-100" style={{ backgroundColor: "#F5F5F566" }}>
                            {reviewLoading ? (
                                <DataLoading />
                            ) : (
                                <>
                                    <div className="col-12 col-md-4 text-center d-lg-flex align-items-center justify-content-center mb-lg-3 mb-5 mb-md-0">
                                        <div className="w-100">
                                            <p style={{ fontSize: "16px", fontWeight: "500", color: "#636364" }}>Overall Rating</p>
                                            <div className="display-5 fw-bold mb-3">{reviewData?.averageRating || 0}</div>
                                            <div className="text-success mb-3">
                                                {[...Array(5)].map((_, i) => {
                                                    const rating = reviewData?.averageRating || 0;
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
                                                based on {reviewData?.totalReviews || 0} reviews
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-8 border-lg-start d-flex align-items-center">
                                        <div className="w-100">
                                            {["Excellent", "Very Good", "Good", "Average", "Poor"].map((label, idx) => {
                                                let width = "0%";
                                                let percent = 0;
                                                const rating = reviewData?.averageRating || 0;
                                                if (label === reviewData?.ratingCategory) {
                                                    percent = Math.round(rating * 20);
                                                } else {
                                                    const basePercent = Math.round((5 - rating) * 20 / 4);
                                                    percent = idx < ["Excellent", "Very Good", "Good"].indexOf(reviewData?.ratingCategory)
                                                        ? basePercent * (3 - idx)
                                                        : idx > ["Excellent", "Very Good", "Good"].indexOf(reviewData?.ratingCategory)
                                                            ? basePercent * (idx - 2)
                                                            : basePercent;
                                                }
                                                width = `${percent}%`;

                                                return (
                                                    <div className="d-flex align-items-center mb-3 justify-content-between mb-1 w-100" key={idx}>
                                                        <div className="me-2 fw-medium" style={{ width: "120px", fontSize: "12px", fontFamily: "Poppins", color: "#636364" }}>
                                                            {label}
                                                        </div>
                                                        <div className="progress me-3 w-100" style={{ height: "8px", position: "relative" }}>
                                                            <div
                                                                className="progress-bar"
                                                                style={{
                                                                    width,
                                                                    backgroundColor:
                                                                        idx === 0 ? "#3DBE64" :
                                                                            idx === 1 ? "#7CBA3D" :
                                                                                idx === 2 ? "#ECD844" :
                                                                                    idx === 3 ? "#FC702B" :
                                                                                        "#E9341F",
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <UpdatePlayers
                showModal={showModal}
                teamName={teamName}
                matchId={matchId}
                setShowModal={setShowModal}
                selectedDate={selectedDate}
                selectedLevel={selectedLevel}
                selectedTime={selectedTime}
            />
        </div>
    );
};

export default Openmatches;