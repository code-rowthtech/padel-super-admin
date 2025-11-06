import React, { useState, useEffect } from "react";
import DirectionsIcon from "@mui/icons-material/Directions";
import { useLocation } from "react-router-dom";
import { padal, club, player } from "../../../assets/files";
import { useDispatch, useSelector } from "react-redux";
import { getMatchesView, removePlayers } from "../../../redux/user/matches/thunk";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { Avatar } from "@mui/material";
import { FaTrash } from "react-icons/fa";
import UpdatePlayers from "./UpdatePlayers";
import { Tooltip, TooltipProvider } from "react-tooltip";

const ViewMatch = ({ className = "" }) => {
    const dispatch = useDispatch();
    const { state } = useLocation();
    const matchesData = useSelector((state) => state.userMatches?.viewMatchesData);
    const userLoading = useSelector((state) => state.userMatches?.viewMatchesLoading);
    const logo = localStorage.getItem("logo") ? JSON.parse(localStorage.getItem("logo")) : null;
    const teamAData = matchesData?.data?.teamA || [];
    const teamBData = matchesData?.data?.teamB || [];
    const clubData = matchesData?.data?.clubId || {};
    const [showModal, setShowModal] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [showShareDropdown, setShowShareDropdown] = useState(false);

    useEffect(() => {
        if (state?.match?._id) {
            dispatch(getMatchesView(state?.match?._id));
        }
    }, [state?.match?._id, dispatch]);

    const skillLabels = ["A/B", "B/C", "C/D", "D/E"];

    const formatDate = (dateString) => {
        if (!dateString) {
            return { day: "Sun", formattedDate: "27Aug" };
        }
        const date = new Date(dateString);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });
        const formattedDate = `${date.toLocaleDateString("en-US", { day: "2-digit" })}, ${date
            .toLocaleDateString("en-US", { month: "short" })
            }`;
        return { day, formattedDate };
    };

    const calculateEndRegistrationTime = () => {
        if (!matchesData?.data?.slot || matchesData.data.slot.length === 0) {
            return "Today at 10:00 PM"; // Fallback if no slots are available
        }

        // Collect all slot times
        const allTimes = matchesData.data.slot.flatMap(court =>
            court.slotTimes.map(slot => slot.time)
        );

        // Parse times to find the latest one
        const latestTime = allTimes.reduce((latest, timeStr) => {
            const [hour, period] = timeStr.split(" ");
            let hourNum = parseInt(hour);
            if (period.toLowerCase() === "pm" && hourNum !== 12) hourNum += 12;
            if (period.toLowerCase() === "am" && hourNum === 12) hourNum = 0;
            return Math.max(latest, hourNum);
        }, 0);

        // If duration > 60 minutes for consecutive slots (e.g., 6 and 7 AM), add 1 hour to the latest time
        const slotCount = allTimes.length;
        let endHour = latestTime;
        if (slotCount > 1) {
            // Assume consecutive slots (e.g., 6 AM and 7 AM) mean duration > 60 minutes, so add 1 hour
            endHour += 1;
        } else {
            // Single slot, assume it ends at the next hour
            endHour += 1;
        }

        // Convert back to 12-hour format with AM/PM
        const period = endHour >= 12 ? "PM" : "AM";
        const displayHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;

        return `Today at ${displayHour}:00 ${period}`;
    };

    const matchDate = matchesData?.data?.matchDate
        ? formatDate(matchesData.data.matchDate)
        : { day: "Sun", formattedDate: "27Aug" };
    const matchTime = matchesData?.data?.matchTime || "5 am ,6 am";
    const matchId = state?.match?._id;

    const handleRemovePlayer = (playerId, team) => {
        const teamName = team === "A" ? "teamA" : "teamB";
        dispatch(removePlayers({ matchId: matchId, playerId: playerId, team: teamName })).then(() => {
            dispatch(getMatchesView(matchId));
        });
    };

    const formatTime = (timeStr) => {
        return timeStr.replace(" am", ":00 am").replace(" pm", ":00 pm");
    };

    const renderPlayerSlot = (player, index, isRemovable, team) => {
        if (player) {
            const user = player.userId || player;
            return (
                <div key={index} className="text-center d-flex justify-content-center align-items-center flex-column mx-auto mb-3 position-relative">
                    <div
                        className="rounded-circle border d-flex align-items-center justify-content-center"
                        style={{
                            width: 80,
                            height: 80,
                            backgroundColor: user.profilePic ? "transparent" : team === 'A' ? "#3DBE64" : "#1F41BB",
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
                            <span style={{ color: "white", fontWeight: "600", fontSize: "24px" }}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </span>
                        )}
                    </div>
                    <TooltipProvider>
                        <p
                            className="mb-0 mt-2 fw-semibold"
                            style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                            {user.name && user.name.length > 12 ? (
                                <>
                                    <span
                                        data-tooltip-content={user.name}
                                        data-tooltip-id={`tooltip-${user.name}`}
                                        style={{ cursor: 'pointer', display: 'inline-block' }} // Ensure inline-block for proper tooltip positioning
                                    >
                                        {user.name.substring(0, 12) + '...'}
                                    </span>
                                    <Tooltip
                                        id={`tooltip-${user.name}`}
                                        place="top"
                                        effect="solid"
                                        style={{ backgroundColor: '#333', color: '#fff', zIndex: 1000, padding: '5px', borderRadius: '4px' }}
                                    />
                                </>
                            ) : (
                                user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : "Unknown"
                            )}
                        </p>
                    </TooltipProvider>
                    <span className="badge text-white " style={{ backgroundColor: team === 'A' ? "#3DBE64" : '#1F41BB' }}>{user?.level || 'A|B'}</span>
                </div>
            );
        } else if (
            (team === "A" && teamAData.length === 1 && index === 1) ||
            (team === "B" && (teamBData.length === 0 || teamBData.length === 1) && [2, 3].includes(index))
        ) {
            const name = team === "A" ? "teamA" : "teamB";
            return (
                <div key={index} className="text-center d-flex align-items-center flex-column mx-auto mb-3">
                    <button
                        className=" bg-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 80, height: 80, border: team === 'A' ? '1px solid #3DBE64' : "1px solid #1F41BB" }}
                        onClick={() => { setShowModal(true); setTeamName(name); }}
                    >
                        <i className="bi bi-plus fs-1" style={{ color: team === 'A' ? "#3DBE64" : "#1F41BB" }}></i>
                    </button>
                    <p className="mb-0 mt-2 fw-semibold" style={{ color: team === 'A' ? "#3DBE64" : "#1F41BB" }}>Add Me</p>
                </div>
            );
        }
        return null;
    };
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
                                <i className="bi bi-share"></i>
                            </button>
                            <button
                                className="btn rounded-circle p-2 d-flex align-items-center justify-content-center text-white"
                                style={{ width: 36, height: 36, backgroundColor: "#1F41BB" }}
                            >
                                <i className="bi bi-chat-left-text"></i>
                            </button>
                            {showShareDropdown && (
                                <div className="position-absolute bg-white border rounded shadow-sm" style={{ top: '40px', right: '0', zIndex: 1000, minWidth: '120px' }}>
                                    <button
                                        className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0"
                                        onClick={() => {
                                            const url = window.location.href;
                                            const text = `Check out this Padel match on ${matchDate.day}, ${matchDate.formattedDate} at ${matchTime}`;
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
                                            setShowShareDropdown(false);
                                        }}
                                    >
                                        <i className="bi bi-facebook" style={{ color: '#1877F2' }}></i>
                                        Facebook
                                    </button>
                                    <button
                                        className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0"
                                        onClick={() => {
                                            const url = window.location.href;
                                            const text = `Check out this Padel match on ${matchDate.day}, ${matchDate.formattedDate} at ${matchTime}`;
                                            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                                            setShowShareDropdown(false);
                                        }}
                                    >
                                        <i className="bi bi-twitter" style={{ color: '#1DA1F2' }}></i>
                                        Twitter
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Game Info Row */}
                    <div className="rounded-4 border px-3 py-2 mb-2" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <div className="d-flex justify-content-between align-items-start py-2">
                            <div className="d-flex align-items-center justify-content-between gap-2">
                                <img src={padal} alt="padel" width={24} />
                                <span className="ms-2 all-matches" style={{ color: "#374151" }}>
                                    PADEL
                                </span>
                            </div>
                            <small className="text-muted d-none d-lg-block" style={{ fontWeight: "500" }}>
                                {matchDate.day}, {matchDate.formattedDate} | {matchTime}
                            </small>
                            <small className="text-muted d-lg-none" style={{ fontWeight: "500" }}>
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
                                <p className="mb-0 fw-semibold">₹ {matchesData?.data?.slot
                                    ?.reduce((total, court) => {
                                        return total + court.slotTimes.reduce((sum, slotTime) => sum + Number(slotTime.amount), 0);
                                    }, 0)
                                    .toFixed(0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Court Number */}
                    <div className="d-flex justify-content-between py-2 rounded-3 p-3 mb-2 border" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <p className="text-muted mb-0" style={{ fontSize: "15px", fontWeight: "500" }}>
                            {matchesData?.data?.matchStatus && "Open Match"}
                        </p>
                    </div>

                    {/* Players Section */}
                    <div className="p-3 rounded-3 mb-2 border" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <h6 className="mb-2 all-matches" style={{ color: "#374151" }}>
                            Players
                        </h6>

                        {userLoading ? <DataLoading /> : (
                            <div className="row mx-auto">
                                {/* Team A */}
                                <div className="col-6 d-md-flex gap-3 justify-content-center mt-3 mt-md-0 align-items-center">
                                    {renderPlayerSlot(teamAData[0], 0, false, "A")}
                                    {renderPlayerSlot(teamAData[1], 1, true, "A")}
                                </div>
                                {/* Team B */}
                                <div className="col-6 d-md-flex gap-3 justify-content-center align-items-center border-start border-0 border-lg-start">
                                    {renderPlayerSlot(teamBData[0], 2, true, "B")}
                                    {renderPlayerSlot(teamBData[1], 3, true, "B")}
                                </div>
                            </div>
                        )}

                        <div className="d-flex justify-content-between mt-2">
                            <p className=" mb-1" style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500", color: "blue" }}>
                                Team A
                            </p>
                            <p className="mb-0" style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500", color: "red" }}>
                                Team B
                            </p>
                        </div>
                    </div>

                    {/* Club Info */}
                    {/* <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <div className="d-md-flex gap-3 align-items-md-start text-center text-md-start">
                            <img src={clubData?.courtImage?.[0] || club} alt="court" className="rounded" width={150} />
                            <div className="flex-grow-1">
                                <h3 className="mb-0" style={{ fontSize: "18px", fontWeight: "600", fontFamily: "Poppins" }}>{clubData?.clubName}</h3>
                                <p className="small mb-0" style={{ fontSize: "15px", fontWeight: "400" }}>
                                    {clubData?.address || "Unknown Address"}
                                </p>
                                <div className="mb-3" style={{ color: "#3DBE64", fontSize: "12px" }}>
                                    Opened
                                </div>
                                <a href="#" style={{ color: "#1F41BB", fontSize: "15px", fontWeight: "500" }}>
                                    More Info
                                </a>
                            </div>
                            <div className="ms-auto">
                                <DirectionsIcon style={{ color: "#22C55E", fontSize: 36, cursor: "pointer" }} />
                            </div>
                        </div>
                    </div> */}

                    {/* Information */}
                    <div>
                        <h6 className="mb-3 mt-4 all-matches" style={{ color: "#374151" }}>
                            Information
                        </h6>
                    </div>
                    <div className="d-flex mb-4 align-items-center gap-3 px-2">
                        <i className="bi bi-layout-text-window-reverse fs-2 text-dark"></i>
                        <div>
                            <p className="mb-0" style={{ fontSize: "12px", fontWeight: "400", fontFamily: "Poppins" }}>
                                Type of Court
                            </p>
                            <p className="mb-0" style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500", color: "#374151" }}>
                                {matchesData?.data?.matchType.charAt(0).toUpperCase() + matchesData?.data?.matchType.slice(1)}
                            </p>
                        </div>
                    </div>

                    <div className="d-flex mb-4 align-items-center gap-3 px-2">
                        <i className="bi bi-calendar-check fs-2 text-dark"></i>
                        <div>
                            <p className="mb-0" style={{ fontSize: "12px", fontWeight: "400", fontFamily: "Poppins" }}>
                                End registration
                            </p>
                            <p className="mb-0" style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500", color: "#374151" }}>
                                {calculateEndRegistrationTime()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Booking Summary */}
                <div className="col-5  mb-5 ">
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
                                <h4 className="open-match-img-heading text-nowrap">Let the Battles <br /> Begin!</h4>
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
                        <div className="row  px-3  pt-3 border-0" style={{ borderRadius: "10px 30% 10px 10px", height: "50vh", background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)" }}>
                            <div className="text-center mb-3">
                                <div className="d-flex justify-content-center">
                                    {logo ? (
                                        <Avatar
                                            src={logo}
                                            alt="User Profile"
                                            style={{ height: "112px", width: "112px", boxShadow: '0px 4px 11.4px 0px #0000002E' }}
                                        />
                                    ) : (
                                        <Avatar
                                            style={{
                                                height: "112px",
                                                width: "112px",
                                                fontSize: "30px",
                                                boxShadow: '0px 4px 11.4px 0px #0000002E'
                                            }}
                                        >
                                            {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                                        </Avatar>
                                    )}
                                </div>
                                <p className="mt-2 mb-1 text-white" style={{ fontSize: "20px", fontWeight: "600", fontFamily: "Poppins" }}>{clubData?.clubName}</p>
                            </div>

                            <h6 className="border-top p-2 mb-1 ps-0 text-white custom-heading-use" >
                                Booking Summary
                            </h6>
                            <div style={{ maxHeight: "340px", overflowY: "auto" }}>
                                {matchesData?.data?.slot && matchesData?.data?.slot?.length > 0 ? (
                                    matchesData.data.slot.map((court, index) =>
                                        court.slotTimes.map((slotTime, slotIndex) => {
                                            const formatted = formatDate(matchesData?.data?.matchDate);
                                            return (
                                                <div
                                                    key={`${index}-${slotIndex}`}
                                                    className="court-row d-flex justify-content-between align-items-center mb-3 px-md-2"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <div className="text-white">
                                                        <span style={{ fontWeight: "600", fontFamily: 'Poppins', fontSize: "16px" }}>
                                                            {formatted.formattedDate.charAt(0).toUpperCase() + formatted.formattedDate.slice(1)} {formatTime(slotTime.time)} </span> <span style={{ fontWeight: "400", fontFamily: 'Poppins', fontSize: "16px" }}>{court.courtName}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex align-items-center text-white justify-content-center gap-2">
                                                        <span className="" style={{ fontWeight: "500", fontSize: "16px" }}>₹ <span className="" style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500" }}>{slotTime.amount}</span></span>
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

            {/* Add Player Modal */}
            <UpdatePlayers showModal={showModal} matchId={matchId} teamName={teamName} setShowModal={setShowModal} />
        </div>
    );
};

export default ViewMatch;