// src/pages/user/CreateMatches/MatchPlayer.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { getUserClub } from "../../../redux/user/club/thunk";
import { padal } from "../../../assets/files";
import { Tooltip } from "react-tooltip";
import NewPlayers from "../VeiwMatch/NewPlayers";
import { FaArrowRight } from "react-icons/fa";

// Button styling variables
const width = 400;
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
    color: "white",
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

const dayShortMap = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
};

const MatchPlayer = ({
    addedPlayers: parentAddedPlayers,
    setAddedPlayers: setParentAddedPlayers,
    selectedCourts,
    selectedDate,
    finalSkillDetails,
    totalAmount, slotError,
    userGender
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const User = getUserFromSession();

    // ── LIVE STATE: Sync with parent + localStorage ─────────────────────
    const [localPlayers, setLocalPlayers] = useState(parentAddedPlayers || {});
    const updateName = JSON.parse(localStorage.getItem("updateprofile"));

    // Sync parent changes
    useEffect(() => {
        setLocalPlayers(parentAddedPlayers || {});
    }, [parentAddedPlayers]);

    // Sync with localStorage (refresh-safe)
    useEffect(() => {
        const syncFromStorage = () => {
            const saved = localStorage.getItem("addedPlayers");
            const parsed = saved ? JSON.parse(saved) : {};
            setLocalPlayers(parsed);
            setParentAddedPlayers(parsed);
        };

        syncFromStorage();
        window.addEventListener("storage", syncFromStorage);

        // Custom event for same-tab updates
        const handleCustomUpdate = () => syncFromStorage();
        window.addEventListener("playersUpdated", handleCustomUpdate);

        return () => {
            window.removeEventListener("storage", syncFromStorage);
            window.removeEventListener("playersUpdated", handleCustomUpdate);
        };
    }, [setParentAddedPlayers]);

    // Force refresh every 500ms to catch localStorage changes
    useEffect(() => {
        const interval = setInterval(() => {
            const saved = localStorage.getItem("addedPlayers");
            const parsed = saved ? JSON.parse(saved) : {};
            if (JSON.stringify(parsed) !== JSON.stringify(localPlayers)) {
                setLocalPlayers(parsed);
                setParentAddedPlayers(parsed);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [localPlayers, setParentAddedPlayers]);

    // ── Modal Controls ─────────────────────────────────────────────────
    const [showAddMeForm, setShowAddMeForm] = useState(false);
    const [activeSlot, setActiveSlot] = useState(null);
    const [showShareDropdown, setShowShareDropdown] = useState(false);

    useEffect(() => {
        dispatch(getUserClub({ search: "" }));
    }, [dispatch]);

    const handleAddMeClick = (slot) => {
        setShowAddMeForm((prev) => (prev && activeSlot === slot ? false : true));
        setActiveSlot((prev) => (prev === slot ? null : slot));
    };

    // ── Helpers ───────────────────────────────────────────────────────
    const formatDate = (dateString) => {
        if (!dateString) return { day: "Sun", formattedDate: "27 Aug" };

        // Parse date string as local date to avoid timezone issues
        const [year, month, dayNum] = dateString.split('-').map(Number);
        const d = new Date(year, month - 1, dayNum);

        const day = dayShortMap[d.toLocaleDateString("en-US", { weekday: "long" })] || "Sun";
        const formattedDate = `${dayNum.toString().padStart(2, '0')}, ${d.toLocaleDateString("en-US", { month: "short" })}`;

        return { day, formattedDate };
    };

    const calculateEndRegistrationTime = () => {
        if (!selectedCourts?.length) return "Today at 10:00 PM";
        const allTimes = selectedCourts.flatMap((c) => c.time.map((s) => s.time));
        const latestHour = allTimes.reduce((max, t) => {
            const [h, p] = t.split(" ");
            let hour = parseInt(h);
            if (p.toLowerCase() === "pm" && hour !== 12) hour += 12;
            if (p.toLowerCase() === "am" && hour === 12) hour = 0;
            return Math.max(max, hour);
        }, 0);
        const endHour = latestHour + 1;
        const period = endHour >= 12 ? "PM" : "AM";
        const displayHour =
            endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
        return `Today at ${displayHour}:00 ${period}`;
    };

    const matchDate = selectedDate?.fullDate
        ? formatDate(selectedDate.fullDate)
        : { day: "Fri", formattedDate: "29 Aug" };
    const matchTime = selectedCourts.length
        ? selectedCourts.flatMap((c) => c.time.map((t) => t.time)).join(", ")
        : "";

    const playerCount = 1 + Object.keys(localPlayers).length; // User + added players
    const canBook = playerCount >= 2 && matchTime.length > 0;

    const userSkillLevel =
        finalSkillDetails.length > 0
            ? finalSkillDetails[finalSkillDetails.length - 1]
            : "A";

    const handleBookNow = () => {
        const courtIds = selectedCourts.map((c) => c._id).join(",");

        const latestPlayers = JSON.parse(
            localStorage.getItem("addedPlayers") || "{}"
        );


        navigate("/match-payment", {
            state: {
                courtData: {
                    day: selectedDate.day,
                    date: selectedDate.fullDate,
                    time: selectedCourts.flatMap((c) => c.time),
                    courtId: courtIds,
                    court: selectedCourts,
                },
                selectedCourts,
                selectedDate,
                grandTotal: totalAmount,
                totalSlots: selectedCourts.reduce((s, c) => s + c.time.length, 0),
                finalSkillDetails,
                addedPlayers: latestPlayers, // Use latest from localStorage
            },
        });
    };

    return (
        <>
            <div className="py-md-3 pt-0 pb-3 rounded-3 px-md-4 px-2 bgchangemobile" style={{ backgroundColor: "#F5F5F566" }}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-md-3 mb-2">
                    {/* <h5 className="mb-0" style={{ fontSize: "20px", fontWeight: 600 }}>Details</h5> */}
                    <h5 className="mb-0 all-matches" style={{ color: "#374151" }}>
                        Details
                    </h5>
                    <div className="d-flex align-items-center gap-2 position-relative">
                        <button
                            className="btn btn-light rounded-circle p-2 border shadow-sm"
                            style={{ width: 36, height: 36 }}
                            onClick={() => setShowShareDropdown((p) => !p)}
                        >
                            <i className="bi bi-share d-flex justify-content-center align-items-center"></i>
                        </button>
                        <button
                            className="btn rounded-circle p-2 text-white"
                            style={{ width: 36, height: 36, backgroundColor: "#1F41BB" }}
                        >
                            <i className="bi bi-chat-left-text d-flex justify-content-center align-items-center"></i>
                        </button>

                        {showShareDropdown && (
                            <div
                                className="position-absolute bg-white border rounded shadow-sm"
                                style={{ top: "40px", right: 0, zIndex: 1000, minWidth: "120px" }}
                            >
                                <button
                                    className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0"
                                    onClick={() => {
                                        const url = window.location.href;
                                        const text = `Check out this Padel match on ${matchDate.day}, ${matchDate.formattedDate} at ${matchTime}`;
                                        window.open(
                                            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                                url
                                            )}&quote=${encodeURIComponent(text)}`,
                                            "_blank"
                                        );
                                        setShowShareDropdown(false);
                                    }}
                                >
                                    <i className="bi bi-facebook" style={{ color: "#1877F2" }} />
                                    Facebook
                                </button>
                                <button
                                    className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0"
                                    onClick={() => {
                                        const url = window.location.href;
                                        const text = `Check out this Padel match on ${matchDate.day}, ${matchDate.formattedDate} at ${matchTime}`;
                                        window.open(
                                            `https://x.com/intent/tweet?url=${encodeURIComponent(
                                                url
                                            )}&text=${encodeURIComponent(text)}`,
                                            "_blank"
                                        );
                                        setShowShareDropdown(false);
                                    }}
                                >
                                    <i className="bi bi-twitter-x" style={{ color: "#000000" }} />
                                    X
                                </button>
                                <button
                                    className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0"
                                    onClick={() => {
                                        const url = window.location.href;
                                        const text = `Check out this Padel match on ${matchDate.day}, ${matchDate.formattedDate} at ${matchTime}`;
                                        navigator.share ? navigator.share({ url, text }) : window.open(
                                            `https://www.instagram.com/`,
                                            "_blank"
                                        );
                                        setShowShareDropdown(false);
                                    }}
                                >
                                    <i className="bi bi-instagram" style={{ color: "#E4405F" }} />
                                    Instagram
                                </button>
                                <button
                                    className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0"
                                    onClick={() => {
                                        const url = window.location.href;
                                        const text = `Check out this Padel match on ${matchDate.day}, ${matchDate.formattedDate} at ${matchTime}`;
                                        window.open(
                                            `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
                                            "_blank"
                                        );
                                        setShowShareDropdown(false);
                                    }}
                                >
                                    <i className="bi bi-whatsapp" style={{ color: "#25D366" }} />
                                    WhatsApp
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Game Info */}
                <div
                    className="rounded-4 border px-3 pt-2 pb-0 mb-2"
                    style={{ backgroundColor: "#CBD6FF1A" }}
                >
                    <div className="d-md-flex d-block justify-content-between align-items-start py-2">
                        <div className="d-flex align-items-center justify-content-md-between justify-content-start gap-2">
                            <img src={padal} alt="padel" width={24} />
                            <span className="ms-2 all-matches" style={{ color: "#374151" }}>
                                PADEL
                            </span>
                        </div>
                        <small
                            className="text-muted d-none d-lg-block"
                            style={{ fontWeight: 500 }}
                        >
                            {matchDate.day}, {matchDate.formattedDate} |{" "}
                            {matchTime.slice(0, 20)}
                            {matchTime.length > 20 ? "..." : ""} (60m)
                        </small>
                        <small
                            className="text-muted d-lg-none add_font_mobile"
                            style={{ fontWeight: 500 }}
                        >
                            {matchDate.day}, {matchDate.formattedDate}{" "}
                            {matchTime.slice(0, 20)}
                            {matchTime.length > 20 ? "..." : ""} (60m)
                        </small>
                    </div>

                    <div className="row text-center border-top">
                        <div className="col py-2">
                            <p className="mb-md-1 mb-0 add_font_mobile " style={{ fontSize: "13px", fontWeight: '500', fontFamily: "Poppins", color: "#374151" }}>Gender</p>
                            <p className="mb-0 add_font_mobile_bottom" style={{ fontSize: "15px", fontWeight: '500', fontFamily: "Poppins", color: "#000000" }}>{userGender || updateName?.gender || "Mixed"}</p>
                        </div>
                        <div className="col border-start border-end py-2">
                            <p className="mb-1 add_font_mobile  " style={{ fontSize: "13px", fontWeight: '500', fontFamily: "Poppins", color: "#374151" }}>Level</p>
                            <p className="mb-0 add_font_mobile_bottom" style={{ fontSize: "15px", fontWeight: '500', fontFamily: "Poppins", color: "#000000" }}>{finalSkillDetails[0] || "Open Match"}</p>
                        </div>
                        <div className="col py-2">
                            <p className="mb-1 add_font_mobile  " style={{ fontSize: "13px", fontWeight: '500', fontFamily: "Poppins", color: "#374151" }}>Your share </p>
                            <p className="mb-0 add_font_mobile_bottom" style={{ fontSize: '18px', fontWeight: "500", color: '#1F41BB' }}>₹ {totalAmount}</p>
                        </div>
                    </div>
                </div>

                <div
                    className="d-flex justify-content-between rounded-3 p-3 mb-2 py-2 border"
                    style={{ backgroundColor: "#CBD6FF1A" }}
                >
                    <p
                        className="text-muted mb-0 add_font_mobile_bottom"
                        style={{ fontSize: "15px", fontWeight: 500 }}
                    >
                        Open Match
                    </p>
                </div>

                {/* Players Section */}
                <div className="p-md-3 p-2 rounded-3 mb-2" style={{ backgroundColor: "#CBD6FF1A", border: "1px solid #ddd6d6ff" }}>
                    <h6 className="mb-2" style={{ fontSize: "18px", fontWeight: 600 }}>Players</h6>

                    <div className="row mx-auto">
                        {/* TEAM A: User (fixed) + 1 added */}
                        <div className="col-6 d-flex flex-lg-row ps-0">
                            {/* USER - Always First */}
                            {User && (
                                <div className="d-flex flex-column align-items-center me-auto mb-3">
                                    <div
                                        className="rounded-circle border d-flex align-items-center justify-content-center"
                                        style={{
                                            width: 64,
                                            height: 64,
                                            backgroundColor: User.profilePic ? "transparent" : "#1F41BB",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {User.profilePic || updateName?.profile ? (
                                            <img src={User.profilePic || updateName?.profile} alt="you" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <span style={{ color: "white", fontWeight: 600, fontSize: "24px" }}>
                                                {updateName?.fullName ? updateName?.fullName?.[0]?.toUpperCase() : User.name?.[0]?.toUpperCase() || "U"}
                                            </span>
                                        )}
                                    </div>
                                    <p
                                        className="mb-0 mt-2 fw-semibold text-center"
                                        style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}
                                        data-tooltip-id="you"
                                        data-tooltip-content={User.name}
                                    >
                                        {updateName?.fullName ? updateName?.fullName?.length > 12 ? `${updateName?.fullName.substring(0, 12)}...` : updateName?.fullName : User.name?.length > 12 ? `${User.name.substring(0, 12)}...` : User.name}
                                    </p>
                                    <Tooltip id="you" />
                                    <span className="badge text-white" style={{ fontSize: "11px", backgroundColor: "#3DBE64" }}>
                                        {userSkillLevel}
                                    </span>
                                </div>
                            )}

                            {/* SLOT 2 - Team A Partner */}
                            {localPlayers.slot2 ? (
                                <div className="d-flex flex-column align-items-center me-auto mb-3">
                                    <div
                                        className="rounded-circle border d-flex justify-content-center align-items-center"
                                        style={{
                                            width: 64,
                                            height: 64,
                                            backgroundColor: localPlayers.slot2.profilePic ? "transparent" : "#3DBE64",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {localPlayers.slot2.profilePic ? (
                                            <img src={localPlayers.slot2.profilePic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <span style={{ color: "white", fontWeight: 600, fontSize: "24px" }}>
                                                {localPlayers.slot2.name[0].toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <p
                                        className="mb-0 mt-2 fw-semibold text-center"
                                        style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}
                                        data-tooltip-id="you"
                                        data-tooltip-content={localPlayers.slot2.name}
                                    >
                                        {localPlayers.slot2.name?.length > 12 ? `${localPlayers.slot2.name.substring(0, 12)}...` : localPlayers.slot2.name}
                                    </p>
                                    <Tooltip id="you" />
                                    <span className="badge text-white" style={{ fontSize: "11px", backgroundColor: "#3DBE64" }}>
                                        {localPlayers.slot2.level}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-center me-auto" onClick={() => handleAddMeClick("slot2")} style={{ cursor: "pointer" }}>
                                    <div
                                        className="rounded-circle d-flex bg-white align-items-center justify-content-center"
                                        style={{ width: 64, height: 64, border: "1px solid #3DBE64" }}
                                    >
                                        <span className="fs-3" style={{ color: "#3DBE64" }}>+</span>
                                    </div>
                                    <p className="mb-0 mt-2 " style={{ color: "#3DBE64", fontSize: "10px", fontWeight: "500", fontFamily: "Poppins" }}>Add Me</p>
                                </div>
                            )}
                        </div>

                        {/* TEAM B: 2 Players */}
                        <div className="col-6 d-flex flex-lg-row pe-0 border-start">
                            {/* SLOT 3 */}
                            {localPlayers.slot3 ? (
                                <div className="d-flex flex-column align-items-center ms-auto mb-3">
                                    <div
                                        className="rounded-circle border d-flex justify-content-center align-items-center"
                                        style={{
                                            width: 64,
                                            height: 64,
                                            backgroundColor: localPlayers.slot3.profilePic ? "transparent" : "#1F41BB",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {localPlayers.slot3.profilePic ? (
                                            <img src={localPlayers.slot3.profilePic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <span style={{ color: "white", fontWeight: 600, fontSize: "24px" }}>
                                                {localPlayers.slot3.name[0].toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <p
                                        className="mb-0 mt-2 fw-semibold text-center"
                                        style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}
                                        data-tooltip-id="you"
                                        data-tooltip-content={localPlayers.slot3.name}
                                    >
                                        {localPlayers.slot3.name?.length > 12 ? `${localPlayers.slot3.name.substring(0, 12)}...` : localPlayers.slot3.name}
                                    </p>
                                    <Tooltip id="you" />
                                    <span className="badge text-white" style={{ fontSize: "11px", backgroundColor: "#1F41BB" }}>
                                        {localPlayers.slot3.level}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-center ms-auto" onClick={() => handleAddMeClick("slot3")} style={{ cursor: "pointer" }}>
                                    <div
                                        className="rounded-circle d-flex bg-white align-items-center justify-content-center"
                                        style={{ width: 64, height: 64, border: "1px solid #1F41BB" }}
                                    >
                                        <span className="fs-3" style={{ color: "#1F41BB" }}>+</span>
                                    </div>
                                    <p className="mb-0 mt-2 " style={{ color: "#1F41BB", fontSize: "10px", fontWeight: "500", fontFamily: "Poppins" }}>Add Me</p>
                                </div>
                            )}

                            {/* SLOT 4 */}
                            {localPlayers.slot4 ? (
                                <div className="d-flex flex-column align-items-center ms-auto mb-3">
                                    <div
                                        className="rounded-circle border d-flex justify-content-center align-items-center"
                                        style={{
                                            width: 64,
                                            height: 64,
                                            backgroundColor: localPlayers.slot4.profilePic ? "transparent" : "#1F41BB",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {localPlayers.slot4.profilePic ? (
                                            <img src={localPlayers.slot4.profilePic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <span style={{ color: "white", fontWeight: 600, fontSize: "24px" }}>
                                                {localPlayers.slot4.name[0].toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <p
                                        className="mb-0 mt-2 fw-semibold text-center"
                                        style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}
                                        data-tooltip-id="you"
                                        data-tooltip-content={localPlayers.slot4.name}
                                    >
                                        {localPlayers.slot4.name?.length > 12 ? `${localPlayers.slot4.name.substring(0, 12)}...` : localPlayers.slot4.name}
                                    </p>
                                    <Tooltip id="you" />
                                    <span className="badge text-white" style={{ fontSize: "11px", backgroundColor: "#1F41BB" }}>
                                        {localPlayers.slot4.level}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-center ms-auto" onClick={() => handleAddMeClick("slot4")} style={{ cursor: "pointer" }}>
                                    <div
                                        className="rounded-circle d-flex bg-white align-items-center justify-content-center"
                                        style={{ width: 64, height: 64, border: "1px solid #1F41BB" }}
                                    >
                                        <span className="fs-3" style={{ color: "#1F41BB" }}>+</span>
                                    </div>
                                    <p className="mb-0 mt-2 " style={{ color: "#1F41BB", fontSize: "10px", fontWeight: "500", fontFamily: "Poppins" }}>Add Me</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="d-flex justify-content-between mt-md-1 mt-0">
                        <p className="mb-1" style={{ fontSize: "11px", fontWeight: "500", fontFamily: "Poppins", color: "#3DBE64" }}>Team A</p>
                        <p className="mb-0" style={{ fontSize: "11px", fontWeight: "500", fontFamily: "Poppins", color: "#1F41BB" }}>Team B</p>
                    </div>
                </div>

                <div className="d-flex justify-content-center align-items-center ">
                    <button
                        style={{
                            ...buttonStyle,
                            opacity: totalAmount === 0 ? 0.5 : 1,
                            cursor: totalAmount === 0 ? "not-allowed" : "pointer",
                            pointerEvents: totalAmount === 0 ? "none" : "auto",
                        }}
                        disabled={totalAmount === 0}
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
                                    <stop offset="0%" stopColor="#1F41BB" />
                                    <stop offset="50%" stopColor="#3B5BDB" />
                                    <stop offset="100%" stopColor="#4F46E5" />
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
                                fill="white"
                            />
                            <g
                                stroke="#1F41BB"
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

                {/* Information */}
                <h6
                    className="mb-md-3 mb-2 mt-4 all-matches"
                    style={{ fontSize: "18px", fontWeight: 600 }}
                >
                    Information
                </h6>
                <div className="d-lg-flex justify-content-evenly">
                    <div className="d-flex mb-md-4 mb-2 align-items-center gap-3 px-2">
                        <i className="bi bi-layout-text-window-reverse fs-2 text-dark"></i>
                        <div>
                            <p className="mb-0" style={{ fontSize: "10px" }}>
                                Type of Court
                            </p>
                            <p
                                className="mb-0"
                                style={{ fontSize: "13px", color: "#374151" }}
                            >
                                Doubles, Outdoor, Crystal
                            </p>
                        </div>
                    </div>

                    <div className="d-flex mb-md-4 mb-2 align-items-center gap-3 px-2">
                        <i className="bi bi-calendar-check fs-2 text-dark"></i>
                        <div>
                            <p className="mb-0" style={{ fontSize: "10px" }}>
                                End registration
                            </p>
                            <p
                                className="mb-0"
                                style={{ fontSize: "13px", color: "#374151" }}
                            >
                                {calculateEndRegistrationTime()}
                            </p>
                        </div>
                    </div>

                    {/* BOOK NOW */}

                </div>
                {slotError && (
                    <div
                        className="text-center mb-3 p-2 rounded"
                        style={{
                            backgroundColor: "#ffebee",
                            color: "#c62828",
                            border: "1px solid #ffcdd2",
                            fontWeight: 500,
                            fontSize: "14px",
                        }}
                    >
                        {slotError}
                    </div>
                )}
            </div>

            {/* Modal */}
            <NewPlayers
                showAddMeForm={showAddMeForm}
                activeSlot={activeSlot}
                setShowAddMeForm={setShowAddMeForm}
                setActiveSlot={setActiveSlot}
                setAddedPlayers={setParentAddedPlayers}
            />
        </>
    );
};

export default MatchPlayer;
