// src/pages/user/VeiwMatch/ViewMatch.js
import React, { useState, useEffect, useCallback, memo } from "react";
import DirectionsIcon from "@mui/icons-material/Directions";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { padal, club, player } from "../../../assets/files";
import { useDispatch, useSelector } from "react-redux";
import { getMatchesView, removePlayers } from "../../../redux/user/matches/thunk";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { Avatar } from "@mui/material";
import { FaTrash } from "react-icons/fa";
import UpdatePlayers from "./UpdatePlayers";
import { Tooltip } from "react-tooltip"; // Only import Tooltip
import { getUserFromSession } from "../../../helpers/api/apiCore";

// Memoized Player Slot Component
const PlayerSlot = memo(function PlayerSlot({
    player,
    index,
    isRemovable,
    team,
    onRemove,
    onAdd, 
    openMatches,
    isFromBookingHistory = false
}) {
    const user = player?.userId || player;
    console.log({openMatches});
    const tooltipId = `player-${team}-${index}`;
    if (!player) {
        // Show "Add Me" only for specific empty slots and not from booking history
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
        // Return invisible placeholder to avoid NaN warning
        return <div style={{ width: 64, height: 64 }} />;
    }

    return (
        <div className="text-center d-flex justify-content-center align-items-center flex-column  mb-md-3 mb-0 position-relative col-6">
            {/* Avatar */}
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
                }}
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

            {/* Name with Tooltip */}
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

            {/* Level Badge */}
            <span
                className="badge text-white"
                style={{ backgroundColor: team === "A" ? "#3DBE64" : "#1F41BB" }}
            >
                {
                    openMatches?.skillDetails?.[openMatches.skillDetails.length - 1]
                        ?.split(" - ")[0] || user?.level   // extracts: A, B1, B2, C1 etc.
                }
            </span>



            {/* Remove Button */}
            {/* {isRemovable && (
                <button
                    className="position-absolute top-0 end-0 btn btn-sm btn-danger rounded-circle p-1"
                    style={{ transform: "translate(50%, -50%)" }}
                    onClick={() => onRemove(user._id, team)}
                >
                    <FaTrash />
                </button>
            )} */}
        </div>
    );
});

const ViewMatch = ({ match, onBack, updateName, selectedDate, filteredMatches, isFromBookingHistory = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = getUserFromSession();
    const { id } = useParams(); // Get match ID from URL
    const { state } = useLocation();
    const matchesData = useSelector((state) => state.userMatches?.viewMatchesData);
    const userLoading = useSelector((state) => state.userMatches?.viewMatchesLoading);
    const logo = localStorage.getItem("logo") ? JSON.parse(localStorage.getItem("logo")) : null;
    const teamAData = matchesData?.data?.teamA || [];
    const teamBData = matchesData?.data?.teamB || [];
    const clubData = matchesData?.data?.clubId || {};
    const [showModal, setShowModal] = useState(false);
    const [teamName, setTeamName] = useState('teamA');
    const [showShareDropdown, setShowShareDropdown] = useState(false);

    const matchId = id || state?.match?._id || match?._id;

    useEffect(() => {
        if (matchId) {
            dispatch(getMatchesView(matchId));
        }
    }, [matchId, dispatch]);



    const formatDate = (dateString) => {
        if (!dateString) return { day: "Sun", formattedDate: "27 Aug" };
        const date = new Date(dateString);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });
        const formattedDate = `${date.toLocaleDateString("en-US", { day: "2-digit" })}, ${date.toLocaleDateString("en-US", { month: "short" })}`;
        return { day, formattedDate };
    };
    console.log(matchesData?.data, 'matchesData?.data');
    const calculateEndRegistrationTime = () => {
        const slots = matchesData?.data?.slot;
        if (!slots || slots.length === 0) return "Today at 10:00 PM";

        // Collect all slot times
        const allTimes = slots.flatMap((court) =>
            court.slotTimes.map((slot) => slot.time)
        );

        // Convert to absolute minutes
        const timesInMinutes = allTimes.map((t) => {
            const [timePart, period] = t.split(" ");
            const [hourStr, minuteStr = "0"] = timePart.split(":");

            let hour = parseInt(hourStr);
            let minute = parseInt(minuteStr);

            if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
            if (period.toLowerCase() === "am" && hour === 12) hour = 0;

            return hour * 60 + minute;
        });

        // Latest match start time
        const latestMinutes = Math.max(...timesInMinutes);

        // Subtract 10 minutes (change to 15 if needed)
        let endMinutes = latestMinutes - 10;
        if (endMinutes < 0) endMinutes += 24 * 60; // handle midnight wrap

        const endHour24 = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;

        const period = endHour24 >= 12 ? "PM" : "AM";
        const displayHour = endHour24 % 12 === 0 ? 12 : endHour24 % 12;
        const displayMinutes = String(endMin).padStart(2, "0");

        return `Today at ${displayHour}:${displayMinutes} ${period}`;
    };


    const matchDate = matchesData?.data?.matchDate
        ? formatDate(matchesData.data.matchDate)
        : { day: "Sun", formattedDate: "27 Aug" };
    const matchTime = matchesData?.data?.matchTime || "5 am, 6 am";

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
        setTeamName(team === "A" ? "teamA" : "teamB");
        setShowModal(true);
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



    return (
        <>
            {/* Left Section */}
            <div className=" rounded-3 px-md-3 px-0 py-2 h-100 bgchangemobile" style={{ backgroundColor: "#F5F5F566" }}>
                <div className="d-flex justify-content-between align-items-center mb-md-3 mb-2">
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
                    <div className="d-flex align-items-center gap-2 position-relative">
                        <button
                            className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border shadow-sm"
                            style={{ width: 36, height: 36 }}
                            onClick={() => setShowShareDropdown(!showShareDropdown)}
                        >
                            <i className="bi bi-share" />
                        </button>
                        <button
                            className="btn rounded-circle p-2 d-flex align-items-center justify-content-center text-white"
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
                <div className="rounded-4 border px-3 pt-2 pb-0 mb-2" style={{ backgroundColor: "#CBD6FF1A" }}>
                    <div className="d-md-flex d-block justify-content-between align-items-start py-2">
                        <div className="d-flex align-items-center justify-content-md-between justify-content-start gap-2">
                            <img src={padal} alt="padel" width={24} />
                            <span className="ms-2 all-matches" style={{ color: "#374151" }}>
                                PADEL
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
                            <p className="mb-md-1 mb-0 add_font_mobile " style={{ fontSize: "13px", fontWeight: '500', fontFamily: "Poppins", color: "#374151" }}>Gender</p>
                            <p className="mb-0 add_font_mobile_bottom" style={{ fontSize: "15px", fontWeight: '500', fontFamily: "Poppins", color: "#000000" }}>{matchesData?.data?.gender || "Any"}</p>
                        </div>
                        <div className="col border-start border-end py-2">
                            <p className="mb-1 add_font_mobile  " style={{ fontSize: "13px", fontWeight: '500', fontFamily: "Poppins", color: "#374151" }}>Level</p>
                            <p className="mb-0 add_font_mobile_bottom" style={{ fontSize: "15px", fontWeight: '500', fontFamily: "Poppins", color: "#000000" }}>{matchesData?.data?.skillLevel || "Intermediate"}</p>
                        </div>
                        <div className="col py-2">
                            <p className="mb-1 add_font_mobile  " style={{ fontSize: "13px", fontWeight: '500', fontFamily: "Poppins", color: "#374151" }}>Your Share</p>
                            <p className="mb-0 add_font_mobile_bottom" style={{ fontSize: '18px', fontWeight: "500", color: '#1F41BB' }}>
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

                {/* Court Number */}
                <div
                    className="d-flex justify-content-between py-2 rounded-3 p-3 mb-2 border"
                    style={{ backgroundColor: "#CBD6FF1A" }}
                >
                    <p className="text-muted mb-0 add_font_mobile_bottom" style={{ fontSize: "15px", fontWeight: 500 }}>
                        {matchesData?.data?.matchStatus && "Open Match"}
                    </p>
                </div>

                {/* Players Section */}
                <div className="p-md-3 px-3 pt-2 pb-1 rounded-3 mb-2 border" style={{ backgroundColor: "#CBD6FF1A" }}>
                    <h6 className="mb-3 all-matches" style={{ color: "#374151" }}>
                        Players
                    </h6>

                    {userLoading ? (
                        <DataLoading />
                    ) : (
                        <div className="row mx-auto">
                            {/* Team A */}
                            <div className="col-6 d-flex justify-content-between align-items-center flex-wrap px-0 ">
                                {slots.slice(0, 2).map((s) => (
                                    <PlayerSlot
                                        key={s.index}
                                        player={s.player}
                                        index={s.index}
                                        isRemovable={s.removable}
                                        team={s.team}
                                        onRemove={handleRemove}
                                        onAdd={()=>handleAdd(s.team)}
                                        openMatches={matchesData?.data}
                                        isFromBookingHistory={isFromBookingHistory}
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
                                        onAdd={()=>handleAdd(s.team)}
                                        isFromBookingHistory={isFromBookingHistory}
                                    />
                                ))}
                            </div>

                        </div>

                    )}

                    <div className="d-flex justify-content-between mt-2">
                        <p className="mb-1" style={{ fontSize: "11px", fontWeight: "500", fontFamily: "Poppins", color: "#3DBE64" }}>Team A</p>
                        <p className="mb-0" style={{ fontSize: "11px", fontWeight: "500", fontFamily: "Poppins", color: "#1F41BB" }}>Team B</p>
                    </div>
                </div>

                {/* Information */}
                <div>
                    <h6 className="mb-md-3 mb-2 mt-4 all-matches" style={{ color: "#374151" }}>
                        Information
                    </h6>

                </div>
                <div className="d-lg-flex gap-2">
                    <div className="d-flex mb-md-4 mb-2 align-items-center gap-3 px-2">
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

                    <div className="d-flex mb-md-4 mb-2  align-items-center gap-3 px-2">
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
                </div>


            </div>

            {/* Modal */}
            <UpdatePlayers
                showModal={showModal}
                matchId={matchesData?.data}
                teamName={teamName}
                setShowModal={setShowModal}
                matchData={matchesData?.data || match}
                skillLevel={matchesData?.data?.skillLevel}
                selectedDate={selectedDate}

            />


        </>
    );
};

export default ViewMatch;
