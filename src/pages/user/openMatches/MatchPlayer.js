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
    totalAmount,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const User = getUserFromSession();

    // ── LIVE STATE: Sync with parent + localStorage ─────────────────────
    const [localPlayers, setLocalPlayers] = useState(parentAddedPlayers || {});

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
        const d = new Date(dateString);
        const day = dayShortMap[d.toLocaleDateString("en-US", { weekday: "long" })] || "Sun";
        const formattedDate = `${d.toLocaleDateString("en-US", { day: "2-digit" })}, ${d.toLocaleDateString("en-US", { month: "short" })}`;
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
        const displayHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
        return `Today at ${displayHour}:00 ${period}`;
    };

    const matchDate = selectedDate?.fullDate ? formatDate(selectedDate.fullDate) : { day: "Fri", formattedDate: "29 Aug" };
    const matchTime = selectedCourts.length
        ? selectedCourts.flatMap((c) => c.time.map((t) => t.time)).join(", ")
        : "";

    const playerCount = 1 + Object.keys(localPlayers).length; // User + added players
    const canBook = playerCount >= 2 && matchTime.length > 0;

    const userSkillLevel = finalSkillDetails.length > 0 ? finalSkillDetails[finalSkillDetails.length - 1] : "A";

    const handleBookNow = () => {
        const courtIds = selectedCourts.map((c) => c._id).join(",");

        const latestPlayers = JSON.parse(localStorage.getItem("addedPlayers") || "{}");

        console.log('Players being passed to payment:', latestPlayers);

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
            <div className="py-3 rounded-3 px-4" style={{ backgroundColor: "#F5F5F566" }}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0" style={{ fontSize: "20px", fontWeight: 600 }}>Details</h5>
                    <div className="d-flex align-items-center gap-2 position-relative">
                        <button
                            className="btn btn-light rounded-circle p-2 border shadow-sm"
                            style={{ width: 36, height: 36 }}
                            onClick={() => setShowShareDropdown((p) => !p)}
                        >
                            <i className="bi bi-share"></i>
                        </button>
                        <button
                            className="btn rounded-circle p-2 text-white"
                            style={{ width: 36, height: 36, backgroundColor: "#1F41BB" }}
                        >
                            <i className="bi bi-chat-left-text"></i>
                        </button>

                        {showShareDropdown && (
                            <div
                                className="position-absolute top-100 end-0 mt-1 bg-white border rounded shadow-sm"
                                style={{ zIndex: 1000, minWidth: "120px" }}
                            >
                                <button
                                    className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0"
                                    onClick={() => {
                                        window.open(
                                            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                                            "_blank"
                                        );
                                        setShowShareDropdown(false);
                                    }}
                                >
                                    <i className="bi bi-facebook" style={{ color: "#1877F2" }}></i> Facebook
                                </button>
                                <button
                                    className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0"
                                    onClick={() => {
                                        window.open(
                                            `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
                                            "_blank"
                                        );
                                        setShowShareDropdown(false);
                                    }}
                                >
                                    <i className="bi bi-twitter" style={{ color: "#1DA1F2" }}></i> Twitter
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Game Info */}
                <div className="rounded-4 border px-3 py-2 mb-2" style={{ backgroundColor: "#CBD6FF1A" }}>
                    <div className="d-flex justify-content-between align-items-start py-2">
                        <div className="d-flex align-items-center gap-2">
                            <img src={padal} alt="padel" width={24} />
                            <span className="ms-2" style={{ fontSize: "18px", fontWeight: 600 }}>PADEL</span>
                        </div>
                        <small className="text-muted d-none d-lg-block" style={{ fontWeight: 500 }}>
                            {matchDate.day}, {matchDate.formattedDate} | {matchTime.slice(0, 20)}{matchTime.length > 20 ? "..." : ""} (60m)
                        </small>
                        <small className="text-muted d-lg-none" style={{ fontWeight: 500 }}>
                            {matchDate.day}, {matchDate.formattedDate} <br /> {matchTime.slice(0, 20)}{matchTime.length > 20 ? "..." : ""} (60m)
                        </small>
                    </div>

                    <div className="row text-center border-top">
                        <div className="col py-2">
                            <p className="mb-1" style={{fontSize:"13px",fontWeight:'500', fontFamily:"Poppins",color:"#374151"}}>Gender</p>
                            <p className="mb-0 " style={{fontSize:"15px",fontWeight:'500', fontFamily:"Poppins",color:"#000000"}}>Mixed</p>
                        </div>
                        <div className="col border-start border-end py-2">
                            <p className="mb-1 " style={{fontSize:"13px",fontWeight:'500', fontFamily:"Poppins",color:"#374151"}}>Level</p>
                            <p className="mb-0"style={{fontSize:"15px",fontWeight:'500', fontFamily:"Poppins",color:"#000000"}} >{finalSkillDetails[0] || "Open Match"}</p>
                        </div>
                        <div className="col py-2">
                            <p className="mb-1" style={{fontSize:"13px",fontWeight:'500', fontFamily:"Poppins",color:"#374151"}}>Price</p>
                            <p className="mb-0 " style={{fontSize:'18px',fontWeight:"500",color:'#1F41BB'}}>₹ {totalAmount}</p>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-between rounded-3 p-3 mb-2 py-2 border" style={{ backgroundColor: "#CBD6FF1A" }}>
                    <p className="text-muted mb-1" style={{ fontSize: "15px", fontWeight: 500 }}>Open Match</p>
                </div>

                {/* Players Section */}
                <div className="p-3 rounded-3 mb-2" style={{ backgroundColor: "#CBD6FF1A", border: "1px solid #ddd6d6ff" }}>
                    <h6 className="mb-3" style={{ fontSize: "18px", fontWeight: 600 }}>Players</h6>

                    <div className="row mx-auto">
                        {/* TEAM A: User (fixed) + 1 added */}
                        <div className="col-6 d-flex flex-column flex-lg-row ps-0">
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
                                        {User.profilePic ? (
                                            <img src={User.profilePic} alt="you" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <span style={{ color: "white", fontWeight: 600, fontSize: "24px" }}>
                                                {User.name?.[0]?.toUpperCase() || "U"}
                                            </span>
                                        )}
                                    </div>
                                    <p
                                        className="mb-0 mt-2 fw-semibold text-center"
                                        style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",fontSize:"10px",fontWeight:"500",fontFamily:"Poppins" }}
                                        data-tooltip-id="you"
                                        data-tooltip-content={User.name}
                                    >
                                        {User.name?.length > 12 ? `${User.name.substring(0, 12)}...` : User.name}
                                    </p>
                                    <Tooltip id="you" />
                                    <span className="badge text-white" style={{ backgroundColor: "#3DBE64" }}>
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
                                            width: 68,
                                            height: 68,
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
                                        className="mb-0 mt-2 text-center"
                                        style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" ,fontSize:"10px",fontWeight:"500",fontFamily:"Poppins"}}
                                        data-tooltip-id="you"
                                        data-tooltip-content={localPlayers.slot2.name}
                                    >
                                        {localPlayers.slot2.name?.length > 12 ? `${localPlayers.slot2.name.substring(0, 12)}...` : localPlayers.slot2.name}
                                    </p>
                                    <Tooltip id="you" />
                                    <span className="badge text-white" style={{ backgroundColor: "#3DBE64" }}>
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
                                    <p className="mb-0 mt-2 " style={{ color: "#3DBE64",fontSize:"10px",fontWeight:"500",fontFamily:"Poppins" }}>Add Me</p>
                                </div>
                            )}
                        </div>

                        {/* TEAM B: 2 Players */}
                        <div className="col-6 d-flex flex-column flex-lg-row pe-0 border-start">
                            {/* SLOT 3 */}
                            {localPlayers.slot3 ? (
                                <div className="d-flex flex-column align-items-center ms-auto mb-3">
                                    <div
                                        className="rounded-circle border d-flex justify-content-center align-items-center"
                                        style={{
                                            width: 68,
                                            height: 68,
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
                                        className="mb-0 mt-2  text-center"
                                        style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",fontSize:"10px",fontWeight:"500",fontFamily:"Poppins" }}
                                        data-tooltip-id="you"
                                        data-tooltip-content={localPlayers.slot3.name}
                                    >
                                        {localPlayers.slot3.name?.length > 12 ? `${localPlayers.slot3.name.substring(0, 12)}...` : localPlayers.slot3.name}
                                    </p>
                                    <Tooltip id="you" />
                                    <span className="badge text-white" style={{ backgroundColor: "#1F41BB" }}>
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
                                    <p className="mb-0 mt-2 " style={{ color: "#1F41BB",fontSize:"10px",fontWeight:"500",fontFamily:"Poppins" }}>Add Me</p>
                                </div>
                            )}

                            {/* SLOT 4 */}
                            {localPlayers.slot4 ? (
                                <div className="d-flex flex-column align-items-center ms-auto mb-3">
                                    <div
                                        className="rounded-circle border d-flex justify-content-center align-items-center"
                                        style={{
                                            width: 68,
                                            height: 68,
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
                                        className="mb-0 mt-2  text-center"
                                        style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" ,fontSize:"10px",fontWeight:"500",fontFamily:"Poppins"}}
                                        data-tooltip-id="you"
                                        data-tooltip-content={localPlayers.slot4.name}
                                    >
                                        {localPlayers.slot4.name?.length > 12 ? `${localPlayers.slot4.name.substring(0, 12)}...` : localPlayers.slot4.name}
                                    </p>
                                    <Tooltip id="you" />
                                    <span className="badge text-white" style={{ backgroundColor: "#1F41BB" }}>
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
                                    <p className="mb-0 mt-2 " style={{ color: "#1F41BB" ,fontSize:"10px",fontWeight:"500",fontFamily:"Poppins"}}>Add Me</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="d-flex justify-content-between mt-2">
                        <p className="mb-1" style={{ fontSize:"11px",fontWeight:"500",fontFamily:"Poppins", color: "#3DBE64" }}>Team A</p>
                        <p className="mb-0" style={{ fontSize:"11px",fontWeight:"500",fontFamily:"Poppins", color: "#1F41BB" }}>Team B</p>
                    </div>
                </div>

                {/* Information */}
                <h6 className="mb-3 mt-4" style={{ fontSize: "18px", fontWeight: 600 }}>Information</h6>
                <div className="d-lg-flex justify-content-evenly">
                    <div className="d-flex mb-4 align-items-center gap-3 px-2">
                        <i className="bi bi-layout-text-window-reverse fs-2 text-dark"></i>
                        <div>
                            <p className="mb-0" style={{ fontSize: "10px" }}>Type of Court</p>
                            <p className="mb-0" style={{ fontSize: "13px", color: "#374151" }}>Doubles, Outdoor, Crystal</p>
                        </div>
                    </div>

                    <div className="d-flex mb-4 align-items-center gap-3 px-2">
                        <i className="bi bi-calendar-check fs-2 text-dark"></i>
                        <div>
                            <p className="mb-0" style={{ fontSize: "10px" }}>End registration</p>
                            <p className="mb-0" style={{ fontSize: "13px", color: "#374151" }}>{calculateEndRegistrationTime()}</p>
                        </div>
                    </div>

                    {/* BOOK NOW */}
                    <button
                        className="btn text-nowrap mt-lg-1 align-items-center rounded-pill py-0 text-white"
                        style={{
                            background: canBook ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)" : "#ccc",
                            border: "none",
                            cursor: canBook ? "pointer" : "not-allowed",
                            opacity: canBook ? 1 : 0.6,
                            height: "31px",
                        }}
                        onClick={handleBookNow}
                        disabled={!canBook || totalAmount === 0}
                    >
                        Book Now <FaArrowRight />
                    </button>
                </div>
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