import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import DirectionsIcon from "@mui/icons-material/Directions";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { padal, club, player } from "../../../assets/files";
import { useDispatch, useSelector } from "react-redux";
import { getMatchesView, removePlayers } from "../../../redux/user/matches/thunk";
import { DataLoading, ButtonLoading } from "../../../helpers/loading/Loaders";
import { Avatar, Tooltip, Modal, Box, Button } from "@mui/material";
import { Offcanvas } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import UpdatePlayers from "./UpdatePlayers";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { getPlayerLevelBySkillLevel } from "../../../redux/user/notifiction/thunk";
import { getRequest, updateRequest } from "../../../redux/user/playerrequest/thunk";
import { copyMatchCardWithScreenshot } from "../../../utils/matchCopy";
import { showSuccess, showError } from "../../../helpers/Toast";

const PlayerSlot = memo(function PlayerSlot({
    player,
    index,
    isRemovable,
    team,
    onRemove,
    onAdd,
    openMatches,
    isFromBookingHistory = false,
    onPlayerClick
}) {
    const store = useSelector((state) => state);

    const user = player?.userId || player;
    const tooltipId = `player-${team}-${index}`;
    if (!player) {
        if (
            !isFromBookingHistory &&
            ((team === "A" && index === 1) ||
                (team === "B" && [2, 3].includes(index)))
        ) {
            return (
                <div className="text-center d-flex align-items-center justify-content-center   flex-column  mb-md-4 mb-3 pb-2 col-6">
                    <button
                        className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                            width: 62,
                            height: 62,
                            border: team === "A" ? "1px solid #3DBE64" : "1px solid #1F41BB",
                        }}
                        onClick={() => onAdd(team)}
                    >
                        <i
                            className="bi bi-plus fs-1"
                            style={{ color: team === "A" ? "#3DBE64" : "#1F41BB" }}
                        />
                    </button>
                    <p
                        className="mb-0 mt-2"
                        style={{
                            color: team === "A" ? "#3DBE64" : "#1F41BB",
                            fontSize: "10px",
                            fontWeight: "500",
                            fontFamily: "Poppins"
                        }}
                    >
                        Add Me
                    </p>
                </div>
            );
        }
        return <div style={{ width: 64, height: 64 }} />;
    }

    return (
        <div className="text-center d-flex justify-content-center align-items-center flex-column  mb-md-3 mb-0 position-relative col-6">
            <div
                className="rounded-circle border d-flex align-items-center justify-content-center"
                style={{
                    width: 64,
                    height: 64,
                    backgroundColor: user.profilePic
                        ? "transparent"
                        : team === "A"
                            ? "#3DBE64"
                            : "#1F41BB",
                    overflow: "hidden",
                    cursor: "pointer"
                }}
                onClick={() => onPlayerClick && onPlayerClick(user)}
            >
                {user.profilePic ? (
                    <img
                        src={user.profilePic}
                        alt="player"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <span style={{ color: "white", fontWeight: 600, fontSize: "24px" }}>
                        {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </span>
                )}
            </div>

            {user.name && user.name.length > 12 ? (
                <>
                    <span
                        data-tooltip-id={tooltipId}
                        data-tooltip-content={user.name}
                        className="mb-0 mt-2"
                        style={{
                            maxWidth: 150,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "inline-block",
                            cursor: "pointer", fontSize: "10px", fontWeight: "500", fontFamily: "Poppins"
                        }}
                    >
                        {user.name.slice(0, 12)}...
                    </span>
                    <Tooltip id={tooltipId} place="top" effect="solid" />
                </>
            ) : (
                <p className="mb-0 mt-2 fw-semibold text-center"
                    style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                    {user.name
                        ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
                        : "Unknown"}
                </p>
            )}
            <span
                className="badge text-white"
                style={{ backgroundColor: team === "A" ? "#3DBE64" : "#1F41BB" }}
            >
                {
                    user?.level?.split(' - ')[0] || user?.level || "A"
                }
            </span>




        </div>
    );
});

const ViewMatch = ({ match, onBack, updateName, selectedDate, filteredMatches, isFromBookingHistory = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = getUserFromSession();
    const { state } = useLocation();
    const matchesData = useSelector((state) => state.userMatches?.viewMatchesData);
    const userLoading = useSelector((state) => state.userMatches?.viewMatchesLoading);
    const RequestData = useSelector((state) => state.requestData?.requestData?.requests);
    const getPlayerLevelsData = useSelector(
        (state) => state?.userNotificationData?.getPlayerLevel?.data[0]?.levelIds || []
    );
    const logo = localStorage.getItem("logo") ? JSON.parse(localStorage.getItem("logo")) : null;
    const teamAData = matchesData?.data?.teamA || [];
    const teamBData = matchesData?.data?.teamB || [];
    const clubData = matchesData?.data?.clubId || {};
    const [showModal, setShowModal] = useState(false);
    const [teamName, setTeamName] = useState('teamA');
    const [showShareDropdown, setShowShareDropdown] = useState(false);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [playerLevels, setPlayerLevels] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedPlayerForAction, setSelectedPlayerForAction] = useState(null);
    const [fullScreenLoading, setFullScreenLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const { id } = useParams();
    const matchId = id || state?.match?._id || match?._id;
    const shareDropdownRef = useRef(null);
    const matchDetailsRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target)) {
                setShowShareDropdown(false);
            }
        };

        if (showShareDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showShareDropdown]);

    useEffect(() => {
        if (matchId) {
            dispatch(getMatchesView(matchId));
            dispatch(getRequest(matchId));
        }
    }, [matchId, dispatch]);



    const formatDate = (dateString) => {
        if (!dateString) return { day: "Sun", formattedDate: "27 Aug" };
        const date = new Date(dateString);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });
        const formattedDate = `${date.toLocaleDateString("en-US", { day: "2-digit" })}, ${date.toLocaleDateString("en-US", { month: "short" })}`;
        return { day, formattedDate };
    };
    const calculateEndRegistrationTime = () => {
        const slots = matchesData?.data?.slot;
        if (!slots || slots.length === 0) return "Today at 10:00 PM";

        const allTimes = slots.flatMap((court) =>
            court.slotTimes.map((slot) => slot.time)
        );

        const timesInMinutes = allTimes.map((t) => {
            const [timePart, period] = t.split(" ");
            const [hourStr, minuteStr = "0"] = timePart.split(":");

            let hour = parseInt(hourStr);
            let minute = parseInt(minuteStr);

            if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
            if (period.toLowerCase() === "am" && hour === 12) hour = 0;

            return hour * 60 + minute;
        });

        const latestMinutes = Math.max(...timesInMinutes);

        let endMinutes = latestMinutes - 10;

        const endHour24 = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;

        const period = endHour24 >= 12 ? "PM" : "AM";
        const displayHour = endHour24 % 12 === 0 ? 12 : endHour24 % 12;
        const displayMinutes = String(endMin).padStart(2, "0");

        return `Today at ${displayHour}:${displayMinutes} ${period}`;
    };


    const formatMatchTimes = (slots) => {
        if (!slots || slots.length === 0) return "";
        const times = slots.flatMap((slot) => slot.slotTimes.map((slotTime) => slotTime.time));

        const formattedTimes = times.map(time => {
            let hour, period;
            if (/am|pm/i.test(time)) {
                const match = time.match(/(\d+)\s*(am|pm)/i);
                if (match) {
                    hour = parseInt(match[1], 10);
                    period = match[2].toUpperCase();
                } else {
                    return time;
                }
            } else {
                const [hours, minutes] = time.split(":");
                const hourNum = parseInt(hours, 10);
                period = hourNum >= 12 ? "PM" : "AM";
                hour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
            }
            return { hour, period };
        });

        if (formattedTimes.length === 0) return "";
        if (formattedTimes.length === 1) return `${formattedTimes[0].hour}${formattedTimes[0].period}`;

        return `${formattedTimes[0].hour}-${formattedTimes[formattedTimes.length - 1].hour}${formattedTimes[formattedTimes.length - 1].period}`;
    };

    const matchDate = matchesData?.data?.matchDate
        ? formatDate(matchesData.data.matchDate)
        : { day: "Sun", formattedDate: "27 Aug" };
    const matchTime = matchesData?.data?.slot ? formatMatchTimes(matchesData.data.slot) : "5-6AM";

    const handleRemove = useCallback(
        (playerId, team) => {
            const teamKey = team === "A" ? "teamA" : "teamB";
            dispatch(removePlayers({ matchId, playerId, team: teamKey })).then(() => {
                dispatch(getMatchesView(matchId));
            });
        },
        [dispatch, matchId]
    );

    const handleAdd = useCallback((team) => {
        if (!user?.token) navigate('/login');
        setTeamName(team === "A" ? "teamA" : "teamB");
        setShowModal(true);
    }, []);

    const handlePlayerClick = useCallback((player) => {
        setSelectedPlayer(player);
        setShowPlayerModal(true);
    }, []);


    const formatTime = (timeStr) => {
        return timeStr.replace(" am", ":00 am").replace(" pm", ":00 pm");
    };

    const slots = [
        { player: teamAData[0], index: 0, removable: false, team: "A" },
        { player: teamAData[1], index: 1, removable: true, team: "A" },
        { player: teamBData[0], index: 2, removable: true, team: "B" },
        { player: teamBData[1], index: 3, removable: true, team: "B" },
    ];

    useEffect(() => {
        if (!matchesData?.data?.skillLevel) return;

        dispatch(getPlayerLevelBySkillLevel(matchesData?.data?.skillLevel))
            .unwrap()
            .then((res) => {
                const levels = (res?.data[0]?.levelIds || []).map((l) => ({
                    code: l.code,
                    title: l.question,
                }));

                setPlayerLevels(levels);
            })
            .catch(() => setPlayerLevels([]));
    }, [matchesData?.data?.skillLevel]);

    useEffect(() => {
        if (Array.isArray(getPlayerLevelsData) && getPlayerLevelsData?.length > 0) {
            setPlayerLevels(
                getPlayerLevelsData?.map((l) => ({
                    code: l?.code,
                    title: l?.question,
                }))
            );
        }
    }, [getPlayerLevelsData]);

    useEffect(() => {
        let startY = 0;

        const handleTouchStart = (e) => {
            startY = e.touches[0].clientY;
        };

        const handleTouchMove = (e) => {
            const endY = e.touches[0].clientY;
            const diff = endY - startY;

            // If user drags down more than 80px → close
            if (diff > 80) {
                setShowRequestModal(false);
            }
        };

        if (showRequestModal && windowWidth < 992) {
            document.addEventListener("touchstart", handleTouchStart);
            document.addEventListener("touchmove", handleTouchMove);
        }

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
        };
    }, [showRequestModal, windowWidth]);



    return (
        <>
            <div ref={matchDetailsRef} className=" rounded-3 px-md-3 px-0 py-md-2 pt-0 pb-2 h-100 bgchangemobile" style={{ backgroundColor: "#F5F5F566" }}>
                <div className="d-flex justify-content-between align-items-center mb-md-3 mb-2 mt-1">
                    <div className="d-flex align-items-center gap-2">
                        {onBack && (
                            <button
                                className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                                style={{ width: 36, height: 36 }}
                                onClick={onBack}
                            >
                                <i className="bi bi-arrow-left" />
                            </button>
                        )}
                        <h5 className="mb-0 all-matches" style={{ color: "#374151" }}>
                            Details
                        </h5>

                    </div>
                    <div className="d-flex align-items-center gap-2 position-relative" ref={shareDropdownRef}>
                        <button
                            className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border shadow-sm"
                            style={{ width: 36, height: 36 }}
                            onClick={async () => {
                                if (matchDetailsRef.current && matchesData?.data) {
                                    await copyMatchCardWithScreenshot(matchDetailsRef.current, matchesData.data);
                                } else {
                                    const matchData = `Match Details:\nDate: ${matchDate.day}, ${matchDate.formattedDate}\nTime: ${matchTime}\nClub: ${clubData?.clubName || 'Unknown Club'}\nLevel: ${matchesData?.data?.skillLevel || 'N/A'}\nLink: ${window.location.href}`;
                                    try {
                                        await navigator.clipboard.writeText(matchData);
                                        showSuccess('Match details copied to clipboard!');
                                    } catch (error) {
                                        showError('Could not copy to clipboard');
                                    }
                                }
                            }}
                        >
                            <i className="bi bi-copy" />
                        </button>
                        <button
                            className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border shadow-sm"
                            style={{ width: 36, height: 36 }}
                            onClick={() => setShowShareDropdown(!showShareDropdown)}
                        >
                            <i className="bi bi-share" />
                        </button>
                        <button
                            className="btn rounded-circle p-2 align-items-center justify-content-center text-white d-none d-md-flex"
                            style={{ width: 36, height: 36, backgroundColor: "#1F41BB" }}
                        >
                            <i className="bi bi-chat-left-text" />
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
                                            `https://twitter.com/intent/tweet?url=${encodeURIComponent(
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

                <div className="rounded-4 border px-3 pt-2 pb-0 mb-2" style={{ backgroundColor: "#CBD6FF1A" }}>
                    <div className="d-flex  justify-content-between align-items-start py-2">
                        <div className="d-flex align-items-center justify-content-md-between justify-content-start gap-2">
                            <img src={padal} alt="padel" width={24} />
                            <span className="ms-2 all-matches" style={{ color: "#374151" }}>
                                Open Match
                            </span>
                        </div>
                        <small className="text-muted d-none d-lg-block" style={{ fontWeight: 500 }}>
                            {matchDate.day}, {matchDate.formattedDate} | {matchTime}
                        </small>
                        <small className="text-muted d-lg-none add_font_mobile" style={{ fontWeight: 500 }}>
                            {matchDate.day}, {matchDate.formattedDate} {matchTime}
                        </small>
                    </div>
                    <div className="row text-center border-top">
                        <div className="col py-2">
                            <p className="mb-md-1 mb-0 add_font_mobile " style={{ fontSize: "13px", fontWeight: '500', fontFamily: "Poppins", color: "#374151" }}>Game Type</p>
                            <p className="mb-0 add_font_mobile_bottom" style={{ fontSize: "15px", fontWeight: '500', fontFamily: "Poppins", color: "#000000" }}>{matchesData?.data?.gender || "Any"}</p>
                        </div>
                        <div className="col border-start border-end py-2">
                            <p className="mb-1 add_font_mobile  " style={{ fontSize: "13px", fontWeight: '500', fontFamily: "Poppins", color: "#374151" }}>Level</p>
                            <p className="mb-0 add_font_mobile_bottom" style={{ fontSize: "15px", fontWeight: '500', fontFamily: "Poppins", color: "#000000" }}>{matchesData?.data?.skillLevel || "Intermediate"}</p>
                        </div>
                        <div className="col py-2">
                            <p className="mb-1 add_font_mobile  " style={{ fontSize: "13px", fontWeight: '500', fontFamily: "Poppins", color: "#374151" }}>Your Share</p>
                            <p className="mb-0 add_font_mobile_bottom_extra fw-bold" style={{ fontSize: '20px', color: '#1F41BB' }}>
                                ₹{" "}
                                {Math.round(
                                    (matchesData?.data?.slot?.reduce((total, court) => {
                                        return total + court.slotTimes.reduce((sum, slotTime) => sum + Number(slotTime.amount), 0);
                                    }, 0) || 0) / 4
                                ).toLocaleString("en-IN")}
                            </p>
                        </div>
                    </div>
                </div>
                {user?._id === matchesData?.data?.createdBy && (<div
                    className="d-flex justify-content-between py-2 rounded-3 p-3 mb-2 border"
                    style={{ backgroundColor: "#CBD6FF1A", cursor: "pointer" }}
                    onClick={() => setShowRequestModal(true)}
                >
                    <div className="d-flex align-items-center gap-3">
                        <i className="bi bi-people fs-4" style={{ color: "#1F41BB" }} />
                        <div>
                            <h6 className="mb-0" style={{ fontSize: "14px", fontWeight: 600, fontFamily: "Poppins", color: "#374151" }}>
                                Player's Requests
                            </h6>
                            <p className="mb-0" style={{ fontSize: "12px", color: "#6B7280", fontFamily: "Poppins" }}>
                                View the status of player's requests <br /> to join.
                            </p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <span className="badge bg-primary rounded-pill d-flex align-items-center justify-content-center" style={{ fontSize: "10px", width: "20px", height: "20px", }}>{RequestData?.length}</span>
                        <i className="bi bi-chevron-right ms-2" style={{ color: "#6B7280" }} />
                    </div>
                </div>)}




                <div className="p-md-3 px-3 pt-2 pb-1 rounded-3 mb-2 border" style={{ backgroundColor: "#CBD6FF1A" }}>
                    <h6 className="mb-3 all-matches" style={{ color: "#374151" }}>
                        Players
                    </h6>

                    <div className="row mx-auto">
                        <div className="col-6 d-flex justify-content-between align-items-center flex-wrap px-0 ">
                            {slots.slice(0, 2).map((s) => (
                                <PlayerSlot
                                    key={s.index}
                                    player={s.player}
                                    index={s.index}
                                    isRemovable={s.removable}
                                    team={s.team}
                                    onRemove={handleRemove}
                                    onAdd={() => handleAdd(s.team)}
                                    openMatches={matchesData?.data}
                                    isFromBookingHistory={isFromBookingHistory}
                                    onPlayerClick={handlePlayerClick}
                                />
                            ))}
                        </div>

                        <div className="col-6 d-flex justify-content-between align-items-center flex-wrap px-0 border-start border-0 border-lg-start">
                            {slots.slice(2, 4).map((s) => (
                                <PlayerSlot
                                    key={s.index}
                                    player={s.player}
                                    index={s.index}
                                    isRemovable={s.removable}
                                    team={s.team}
                                    onRemove={handleRemove}
                                    onAdd={() => handleAdd(s.team)}
                                    openMatches={matchesData?.data}
                                    isFromBookingHistory={isFromBookingHistory}
                                    onPlayerClick={handlePlayerClick}
                                />
                            ))}
                        </div>

                    </div>

                    <div className="d-flex justify-content-between mt-2">
                        <p className="mb-1" style={{ fontSize: "11px", fontWeight: "500", fontFamily: "Poppins", color: "#3DBE64" }}>Team A</p>
                        <p className="mb-0" style={{ fontSize: "11px", fontWeight: "500", fontFamily: "Poppins", color: "#1F41BB" }}>Team B</p>
                    </div>
                </div>
                <div className="col-md-9 mx-auto col-12">
 <div className="d-flex justify-content-between align-items-center mt-4">
                    <h6 className="mb-2 all-matches" style={{ color: "#374151" }}>
                        Information
                    </h6>
                </div>

                <div className="d-lg-flex justify-content-lg-between gap-2 position-relative">
                    <div className="d-flex mb-md-4 mb-2 align-items-center gap-3 px-2 px-md-0">
                        <i className="bi bi-layout-text-window-reverse fs-2 text-dark" />
                        <div>
                            <p className="mb-0" style={{ fontSize: "12px", fontWeight: 400 }}>
                                Type of Court
                            </p>
                            <p className="mb-0" style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                                {matchesData?.data?.courtType
                                    ? matchesData.data.courtType.charAt(0).toUpperCase() +
                                    matchesData.data.courtType.slice(1)
                                    : "Unknown"}
                            </p>
                        </div>
                    </div>

                    <div className="d-flex mb-md-4 mb-2  align-items-center gap-3 px-2 px-md-0">
                        <i className="bi bi-calendar-check fs-2 text-dark" />
                        <div>
                            <p className="mb-0" style={{ fontSize: "12px", fontWeight: 400 }}>
                                End registration
                            </p>
                            <p className="mb-0" style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                                {calculateEndRegistrationTime()}
                            </p>
                        </div>
                    </div>
                    <div className="col-12 d-flex justify-content-end align-item-center d-md-none view_match_data">
                        <button
                            className="d-flex align-items-center gap-2 border-0 py-1"
                            style={{
                                background: "linear-gradient(rgb(0, 52, 228) 0%, rgb(0, 27, 118) 100%)",
                                borderRadius: "25px",
                                padding: "8px 16px",
                                color: "#fff",
                                fontWeight: 600,
                            }}
                        // onClick={() => setShowChat(true)}
                        >
                            <i className="bi bi-chat-left-text" style={{ fontSize: "18px" }}></i>
                            Chat
                        </button>

                    </div>
                </div>
                </div>
               


            </div>

            <UpdatePlayers
                showModal={showModal}
                matchId={matchesData?.data}
                teamName={teamName}
                setShowModal={setShowModal}
                matchData={matchesData?.data || match}
                skillLevel={matchesData?.data?.skillLevel}
                selectedDate={selectedDate}
                playerLevels={playerLevels}
                matchesData={matchesData}
            />

            <Modal open={showPlayerModal} onClose={() => setShowPlayerModal(false)}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: { xs: "90%", sm: "80%", md: 400 },
                    maxWidth: "400px",
                    bgcolor: "background.paper",
                    p: 3,
                    borderRadius: 2,
                    border: "none",
                    boxShadow: 24,
                }}>
                    <h6 className="text-center mb-3" style={{ fontSize: "18px", fontWeight: 600, fontFamily: "Poppins" }}>
                        Player Details
                    </h6>

                    {selectedPlayer && (
                        <div className="text-center">
                            <div className="mb-3">
                                <div
                                    className="rounded-circle border d-flex align-items-center justify-content-center mx-auto mb-2"
                                    style={{
                                        width: 80,
                                        height: 80,
                                        backgroundColor: selectedPlayer.profilePic ? "transparent" : "#1F41BB",
                                        overflow: "hidden",
                                    }}
                                >
                                    {selectedPlayer.profilePic ? (
                                        <img
                                            src={selectedPlayer.profilePic}
                                            alt="player"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <span style={{ color: "white", fontWeight: 600, fontSize: "32px" }}>
                                            {selectedPlayer?.name?.[0]?.toUpperCase() ?? "U"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="text-start">
                                <div className="mb-2 d-flex gap-2 align-items-center    ">
                                    <strong style={{ fontSize: "14px", color: "#374151", fontFamily: 'Poppins' }}>Name:</strong>
                                    <p className="mb-0" style={{ fontSize: "15px", fontWeight: 500, fontFamily: 'Poppins' }}>
                                        {selectedPlayer.name || "Unknown"}
                                    </p>
                                </div>

                                {selectedPlayer.email && (
                                    <div className="mb-2 d-flex gap-2 align-items-center    ">
                                        <strong style={{ fontSize: "14px", color: "#374151", fontFamily: 'Poppins' }}>Email:</strong>
                                        <p className="mb-0" style={{ fontSize: "15px", fontWeight: 500, fontFamily: 'Poppins' }}>
                                            {selectedPlayer.email}
                                        </p>
                                    </div>
                                )}

                                {selectedPlayer.phoneNumber && (
                                    <div className="mb-2 d-flex gap-2 align-items-center    ">
                                        <strong style={{ fontSize: "14px", color: "#374151", fontFamily: 'Poppins' }}>Phone:</strong>
                                        <p className="mb-0" style={{ fontSize: "15px", fontWeight: 500, fontFamily: 'Poppins' }}>
                                            +91 {selectedPlayer.phoneNumber}
                                        </p>
                                    </div>
                                )}

                                {selectedPlayer.level && (
                                    <div className="mb-2 d-flex gap-2 align-items-center    ">
                                        <strong style={{ fontSize: "14px", color: "#374151", fontFamily: 'Poppins' }}>Level:</strong>
                                        <p className="mb-0" style={{ fontSize: "15px", fontWeight: 500, fontFamily: 'Poppins' }}>
                                            {selectedPlayer.level}
                                        </p>
                                    </div>
                                )}

                                {selectedPlayer.skillLevel && (
                                    <div className="mb-2 d-flex gap-2 align-items-center    ">
                                        <strong style={{ fontSize: "14px", color: "#374151", fontFamily: 'Poppins' }}>Skill Level:</strong>
                                        <p className="mb-0" style={{ fontSize: "15px", fontWeight: 500, fontFamily: 'Poppins' }}>
                                            {matchesData?.data?.skillLevel || "Unknown"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                className="btn btn-primary mt-3"
                                onClick={() => setShowPlayerModal(false)}
                                style={{
                                    background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "8px 24px"
                                }}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </Box>
            </Modal>

            <Offcanvas
                show={showRequestModal}
                onHide={() => setShowRequestModal(false)}
                placement={windowWidth >= 992 ? "end" : "bottom"}
                backdrop={true}  // click outside close
                keyboard={true}
                enforceFocus={false}
                style={{
                    width: windowWidth >= 992 ? "400px" : "100%",
                    height: windowWidth < 992 ? "60vh" : "100%"
                }}
            >
                <Offcanvas.Header className="pb-1" closeButton={windowWidth >= 992}>
                    <div>
                        <Offcanvas.Title style={{ fontSize: "15px", fontWeight: 600, fontFamily: "Poppins" }}>
                            Player's Requests
                        </Offcanvas.Title>
                        <p className="mb-0 mt-1" style={{ fontSize: "12px", color: "#6B7280", fontFamily: "Poppins" }}>
                            In order for the player to join the match, all enrolled players must accept the player's request.
                        </p>
                    </div>
                </Offcanvas.Header>
                <Offcanvas.Body className="pt-0">
                    <div className="div p-0" style={{ border: "1px solid #55e77aff", borderRadius: "8px", }}>
                        <div className="d-flex align-items-center gap-3 rounded-top p-2 " style={{ backgroundColor: "#98daa0f1", }}>
                            <i className="bi bi-person-fill fs-4" style={{ color: "#6B7280" }} />
                            <p className="mb-0" style={{ fontSize: "15px", fontWeight: 500, fontFamily: "Poppins" }}>Players approved</p>
                        </div>
                        <div className="d-flex flex-column ">
                            {RequestData?.map((player, index) => (
                                <div key={index} className="d-flex align-items-center justify-content-between p-3 border-bottom rounded-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                width: 35,
                                                height: 35,
                                                backgroundColor: "#bb1f41ff",
                                                color: "white",
                                                fontWeight: 600,
                                                fontSize: "12px"
                                            }}
                                        >
                                            {player?.requesterId?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </div>
                                        <div>
                                            <h6 className="mb-0" style={{ fontSize: "14px", fontWeight: 600, fontFamily: "Poppins" }}>
                                                {player?.requesterId?.name}
                                            </h6>
                                            <p className="mb-0" style={{ fontSize: "14px", fontWeight: 500, fontFamily: "Poppins" }}>
                                                {player?.requesterId?.email}
                                            </p>
                                            <p className="mb-0 text-decoration-none" style={{ fontSize: "12px", color: "#007bff", fontFamily: "Poppins", cursor: "pointer", textDecoration: "underline" }}
                                                onClick={() => window.open(`tel:+91${player?.requesterId?.phoneNumber}`)}>
                                                +91 {player?.requesterId?.phoneNumber}
                                            </p>
                                            <p className="mb-0" style={{ fontSize: "12px", color: "#6B7280", fontFamily: "Poppins" }}>
                                                Level: {player?.level}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <i className="bi bi-check-circle-fill"
                                            style={{ color: "#28a745", fontSize: "20px", cursor: player?.status === 'pending' ? "pointer" : "not-allowed", opacity: player?.status === 'pending' ? 1 : 0.5 }}
                                            onClick={() => {
                                                if (player?.status === 'pending') {
                                                    setSelectedPlayerForAction(player);
                                                    setShowConfirmModal(true);
                                                }
                                            }}></i>
                                        <i className="bi bi-x-circle-fill"
                                            style={{ color: "#dc3545", fontSize: "20px", cursor: player?.status === 'pending' ? "pointer" : "not-allowed", opacity: player?.status === 'pending' ? 1 : 0.5 }}
                                            onClick={() => {
                                                if (player?.status === 'pending') {
                                                    setSelectedPlayerForAction(player);
                                                    setShowRejectModal(true);
                                                }
                                            }}></i>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>

            {fullScreenLoading && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999
                }}>
                    <DataLoading />
                </div>
            )}

            <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: { xs: "90%", sm: "80%", md: 400 },
                    bgcolor: "background.paper",
                    p: 3,
                    borderRadius: 2,
                    boxShadow: 24,
                }}>
                    <h6 className="text-center mb-3" style={{ fontSize: "18px", fontWeight: 600, fontFamily: "Poppins" }}>
                        Reject Request
                    </h6>
                    <p className="text-center mb-3" style={{ fontSize: "14px", color: "#6B7280" }}>
                        Please provide a reason for rejecting {selectedPlayerForAction?.requesterId?.name}'s request
                    </p>
                    <textarea
                        className="form-control mb-3"
                        rows="3"
                        placeholder="Enter reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        style={{ resize: "none" }}
                    />
                    <div className="d-flex gap-3 justify-content-center">
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setShowRejectModal(false);
                                setRejectReason("");
                            }}
                            sx={{ borderColor: "#001B76", color: "#001B76" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setShowRejectModal(false);
                                setShowRequestModal(false);
                                setFullScreenLoading(true);
                                dispatch(updateRequest({
                                    requestId: selectedPlayerForAction?._id, action: 'reject', rejectedReason: rejectReason
                                }))
                                    .unwrap()
                                    .then(() => {
                                        return Promise.all([
                                            dispatch(getRequest()),
                                            dispatch(getMatchesView(matchId))
                                        ]);
                                    })
                                    .finally(() => {
                                        setFullScreenLoading(false);
                                        setSelectedPlayerForAction(null);
                                        setRejectReason("");
                                    });
                            }}
                            disabled={!rejectReason.trim()}
                            sx={{
                                background: "linear-gradient(180deg, #dc3545 0%, #a71d2a 100%)",
                                color: "white",
                                "&:hover": { background: "#a71d2a" },
                            }}
                        >
                            Reject
                        </Button>
                    </div>
                </Box>
            </Modal>

            <Modal open={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: { xs: "90%", sm: "80%", md: 400 },
                    bgcolor: "background.paper",
                    p: 3,
                    borderRadius: 2,
                    boxShadow: 24,
                }}>
                    <h6 className="text-center mb-3" style={{ fontSize: "18px", fontWeight: 600, fontFamily: "Poppins" }}>
                        Confirm Approval
                    </h6>
                    <p className="text-center mb-4" style={{ fontSize: "14px", color: "#6B7280" }}>
                        Are you sure you want to approve {selectedPlayerForAction?.requesterId?.name}'s request to join the match?
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                        <Button
                            variant="outlined"
                            onClick={() => setShowConfirmModal(false)}
                            sx={{ borderColor: "#001B76", color: "#001B76" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setShowConfirmModal(false);
                                setShowRequestModal(false);
                                setFullScreenLoading(true);
                                dispatch(updateRequest({ requestId: selectedPlayerForAction?._id, action: 'accept' }))
                                    .unwrap()
                                    .then(() => {
                                        return Promise.all([
                                            dispatch(getRequest()),
                                            dispatch(getMatchesView(matchId))
                                        ]);
                                    })
                                    .finally(() => {
                                        setFullScreenLoading(false);
                                        setSelectedPlayerForAction(null);
                                    });
                            }}
                            sx={{
                                background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                                color: "white",
                                "&:hover": { background: "#001B76" },
                            }}
                        >
                            Confirm
                        </Button>
                    </div>
                </Box>
            </Modal>

        </>
    );
};

export default ViewMatch;
