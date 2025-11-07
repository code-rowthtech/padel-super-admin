// src/pages/user/VeiwMatch/ViewMatch.js
import React, { useState, useEffect, useCallback, memo } from "react";
import DirectionsIcon from "@mui/icons-material/Directions";
import { useLocation, useParams } from "react-router-dom";
import { padal, club, player } from "../../../assets/files";
import { useDispatch, useSelector } from "react-redux";
import { getMatchesView, removePlayers } from "../../../redux/user/matches/thunk";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { Avatar } from "@mui/material";
import { FaTrash } from "react-icons/fa";
import UpdatePlayers from "./UpdatePlayers";
import { Tooltip } from "react-tooltip"; // Only import Tooltip

// Memoized Player Slot Component
const PlayerSlot = memo(function PlayerSlot({
    player,
    index,
    isRemovable,
    team,
    onRemove,
    onAdd,
}) {
    const user = player?.userId || player;
    const tooltipId = `player-${team}-${index}`;

    if (!player) {
        // Show "Add Me" only for specific empty slots
        if (
            (team === "A" && index === 1) ||
            (team === "B" && [2, 3].includes(index))
        ) {
            return (
                <div className="text-center d-flex align-items-center flex-column mx-auto mb-3">
                    <button
                        className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                            width: 80,
                            height: 80,
                            border: team === "A" ? "1px solid #3DBE64" : "1px solid #1F41BB",
                        }}
                        onClick={onAdd}
                    >
                        <i
                            className="bi bi-plus fs-1"
                            style={{ color: team === "A" ? "#3DBE64" : "#1F41BB" }}
                        />
                    </button>
                    <p
                        className="mb-0 mt-2 fw-semibold"
                        style={{ color: team === "A" ? "#3DBE64" : "#1F41BB" }}
                    >
                        Add Me
                    </p>
                </div>
            );
        }
        // Return invisible placeholder to avoid NaN warning
        return <div style={{ width: 80, height: 80 }} />;
    }

    return (
        <div className="text-center d-flex justify-content-center align-items-center flex-column mx-auto mb-3 position-relative">
            {/* Avatar */}
            <div
                className="rounded-circle border d-flex align-items-center justify-content-center"
                style={{
                    width: 80,
                    height: 80,
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
                        className="mb-0 mt-2 fw-semibold"
                        style={{
                            maxWidth: 150,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "inline-block",
                            cursor: "pointer",
                        }}
                    >
                        {user.name.slice(0, 12)}...
                    </span>
                    <Tooltip id={tooltipId} place="top" effect="solid" />
                </>
            ) : (
                <p className="mb-0 mt-2 fw-semibold">
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
                {user?.level || "A|B"}
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

const ViewMatch = () => {
    const dispatch = useDispatch();
    const { id } = useParams(); // Get match ID from URL
    const { state } = useLocation();
    const matchesData = useSelector((state) => state.userMatches?.viewMatchesData);
    const userLoading = useSelector((state) => state.userMatches?.viewMatchesLoading);
    const logo = localStorage.getItem("logo") ? JSON.parse(localStorage.getItem("logo")) : null;

    const teamAData = matchesData?.data?.teamA || [];
    const teamBData = matchesData?.data?.teamB || [];
    const clubData = matchesData?.data?.clubId || {};

    const [showModal, setShowModal] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [showShareDropdown, setShowShareDropdown] = useState(false);

    const matchId = id || state?.match?._id;

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

    const calculateEndRegistrationTime = () => {
        if (!matchesData?.data?.slot || matchesData.data.slot.length === 0) {
            return "Today at 10:00 PM";
        }

        const allTimes = matchesData.data.slot.flatMap((court) =>
            court.slotTimes.map((slot) => slot.time)
        );

        const latestTime = allTimes.reduce((latest, timeStr) => {
            const [hour, period] = timeStr.split(" ");
            let hourNum = parseInt(hour);
            if (period.toLowerCase() === "pm" && hourNum !== 12) hourNum += 12;
            if (period.toLowerCase() === "am" && hourNum === 12) hourNum = 0;
            return Math.max(latest, hourNum);
        }, 0);

        let endHour = latestTime + (allTimes.length > 1 ? 1 : 1);
        const period = endHour >= 12 ? "PM" : "AM";
        const displayHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;

        return `Today at ${displayHour}:00 ${period}`;
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

    const handleAdd = useCallback(() => {
        setTeamName(teamAData.length < 2 ? "teamA" : "teamB");
        setShowModal(true);
    }, [teamAData.length]);

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
        <div className="container mt-4 mb-5 px-md-4 flex-wrap">
            <div className="row mx-auto">
                {/* Left Section */}
                <div className="col-7 py-3 rounded-3 px-4" style={{ backgroundColor: "#F5F5F566" }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 all-matches" style={{ color: "#374151" }}>
                            Details
                        </h5>
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
                                                `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                                                    url
                                                )}&text=${encodeURIComponent(text)}`,
                                                "_blank"
                                            );
                                            setShowShareDropdown(false);
                                        }}
                                    >
                                        <i className="bi bi-twitter" style={{ color: "#1DA1F2" }} />
                                        Twitter
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Game Info */}
                    <div className="rounded-4 border px-3 py-2 mb-2" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <div className="d-flex justify-content-between align-items-start py-2">
                            <div className="d-flex align-items-center justify-content-between gap-2">
                                <img src={padal} alt="padel" width={24} />
                                <span className="ms-2 all-matches" style={{ color: "#374151" }}>
                                    PADEL
                                </span>
                            </div>
                            <small className="text-muted d-none d-lg-block" style={{ fontWeight: 500 }}>
                                {matchDate.day}, {matchDate.formattedDate} | {matchTime}
                            </small>
                            <small className="text-muted d-lg-none" style={{ fontWeight: 500 }}>
                                {matchDate.day}, {matchDate.formattedDate} <br /> {matchTime}
                            </small>
                        </div>
                        <div className="row text-center border-top">
                            <div className="col py-2">
                                <p className="mb-1 text-muted small">Gender</p>
                                <p className="mb-0 fw-semibold">{matchesData?.data?.gender || "Any"}</p>
                            </div>
                            <div className="col border-start border-end py-2">
                                <p className="mb-1 text-muted small">Level</p>
                                <p className="mb-0 fw-semibold">{matchesData?.data?.skillLevel || "Intermediate"}</p>
                            </div>
                            <div className="col py-2">
                                <p className="mb-1 text-muted small">Price</p>
                                <p className="mb-0 fw-semibold">
                                    ₹{" "}
                                    {matchesData?.data?.slot
                                        ?.reduce((total, court) => {
                                            return (
                                                total +
                                                court.slotTimes.reduce((sum, slotTime) => sum + Number(slotTime.amount), 0)
                                            );
                                        }, 0)
                                        .toFixed(0) || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Court Number */}
                    <div
                        className="d-flex justify-content-between py-2 rounded-3 p-3 mb-2 border"
                        style={{ backgroundColor: "#CBD6FF1A" }}
                    >
                        <p className="text-muted mb-0" style={{ fontSize: "15px", fontWeight: 500 }}>
                            {matchesData?.data?.matchStatus && "Open Match"}
                        </p>
                    </div>

                    {/* Players Section */}
                    <div className="p-3 rounded-3 mb-2 border" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <h6 className="mb-2 all-matches" style={{ color: "#374151" }}>
                            Players
                        </h6>

                        {userLoading ? (
                            <DataLoading />
                        ) : (
                            <div className="row mx-auto">
                                {/* Team A */}
                                <div className="col-6 d-md-flex gap-3 justify-content-center mt-3 mt-md-0 align-items-center">
                                    {slots.slice(0, 2).map((s) => (
                                        <PlayerSlot
                                            key={s.index}
                                            player={s.player}
                                            index={s.index}
                                            isRemovable={s.removable}
                                            team={s.team}
                                            onRemove={handleRemove}
                                            onAdd={handleAdd}
                                        />
                                    ))}
                                </div>

                                {/* Team B */}
                                <div className="col-6 d-md-flex gap-3 justify-content-center align-items-center border-start border-0 border-lg-start">
                                    {slots.slice(2, 4).map((s) => (
                                        <PlayerSlot
                                            key={s.index}
                                            player={s.player}
                                            index={s.index}
                                            isRemovable={s.removable}
                                            team={s.team}
                                            onRemove={handleRemove}
                                            onAdd={handleAdd}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="d-flex justify-content-between mt-2">
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "blue" }}>Team A</p>
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "red" }}>Team B</p>
                        </div>
                    </div>

                    {/* Information */}
                    <div>
                        <h6 className="mb-3 mt-4 all-matches" style={{ color: "#374151" }}>
                            Information
                        </h6>
                    </div>
                    <div className="d-flex mb-4 align-items-center gap-3 px-2">
                        <i className="bi bi-layout-text-window-reverse fs-2 text-dark" />
                        <div>
                            <p className="mb-0" style={{ fontSize: "12px", fontWeight: 400 }}>
                                Type of Court
                            </p>
                            <p className="mb-0" style={{ fontSize: "16px", fontWeight: 500, color: "#374151" }}>
                                {matchesData?.data?.matchType
                                    ? matchesData.data.matchType.charAt(0).toUpperCase() +
                                    matchesData.data.matchType.slice(1)
                                    : "Unknown"}
                            </p>
                        </div>
                    </div>

                    <div className="d-flex mb-4 align-items-center gap-3 px-2">
                        <i className="bi bi-calendar-check fs-2 text-dark" />
                        <div>
                            <p className="mb-0" style={{ fontSize: "12px", fontWeight: 400 }}>
                                End registration
                            </p>
                            <p className="mb-0" style={{ fontSize: "16px", fontWeight: 500, color: "#374151" }}>
                                {calculateEndRegistrationTime()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Booking Summary */}
                <div className="col-5 mb-5">
                    <div className="container ms-0 ms-lg-2">
                        <div
                            className="row mb-3 align-items-center text-white rounded-4 py-0 pt-2 ps-4"
                            style={{
                                background: "linear-gradient(to right, #101826, #1e293b)",
                                overflow: "visible",
                                position: "relative",
                            }}
                        >
                            <div className="col-12 col-md-6 mb-4 text-lg-start text-center mb-md-0">
                                <h4 className="open-match-img-heading text-nowrap">
                                    Let the Battles <br /> Begin!
                                </h4>
                                <p className="text-light">Great for competitive vibes.</p>
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

                        <div
                            className="row px-3 pt-3 border-0"
                            style={{
                                borderRadius: "10px 30% 10px 10px",
                                height: "50vh",
                                background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                            }}
                        >
                            <div className="text-center mb-3">
                                <div className="d-flex justify-content-center">
                                    {logo ? (
                                        <Avatar
                                            src={logo}
                                            alt="Club Logo"
                                            style={{ height: 112, width: 112, boxShadow: "0px 4px 11.4px 0px #0000002E" }}
                                        />
                                    ) : (
                                        <Avatar
                                            style={{
                                                height: 112,
                                                width: 112,
                                                fontSize: "30px",
                                                boxShadow: "0px 4px 11.4px 0px #0000002E",
                                            }}
                                        >
                                            {clubData?.clubName?.[0]?.toUpperCase() || "C"}
                                        </Avatar>
                                    )}
                                </div>
                                <p className="mt-2 mb-1 text-white" style={{ fontSize: "20px", fontWeight: 600 }}>
                                    {clubData?.clubName || "Unknown Club"}
                                </p>
                            </div>

                            <h6 className="border-top p-2 mb-1 ps-0 text-white custom-heading-use">
                                Booking Summary
                            </h6>
                            <div style={{ maxHeight: "340px", overflowY: "auto" }}>
                                {matchesData?.data?.slot && matchesData.data.slot.length > 0 ? (
                                    matchesData.data.slot.map((court, index) =>
                                        court.slotTimes.map((slotTime, slotIndex) => {
                                            const formatted = formatDate(matchesData?.data?.matchDate);
                                            return (
                                                <div
                                                    key={`${index}-${slotIndex}`}
                                                    className="court-row d-flex justify-content-between align-items-center mb-3 px-md-2"
                                                >
                                                    <div className="text-white">
                                                        <span style={{ fontWeight: 600, fontSize: "16px" }}>
                                                            {formatted.formattedDate} {formatTime(slotTime.time)}{" "}
                                                        </span>
                                                        <span style={{ fontWeight: 400, fontSize: "16px" }}>
                                                            {court.courtName}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex align-items-center text-white justify-content-center gap-2">
                                                        <span style={{ fontWeight: 500, fontSize: "16px" }}>
                                                            ₹ <span style={{ fontSize: "16px", fontWeight: 500 }}>{slotTime.amount}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )
                                ) : (
                                    <div className="text-white">No slots available</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <UpdatePlayers
                showModal={showModal}
                matchId={matchId}
                teamName={teamName}
                setShowModal={setShowModal}
            />
        </div>
    );
};

export default ViewMatch;