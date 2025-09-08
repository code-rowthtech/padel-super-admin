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
        const day = date.toLocaleDateString("en-US", { weekday: "short" }); // e.g., Tue
        const formattedDate = `${date.toLocaleDateString("en-US", { day: "2-digit" })}${date
            .toLocaleDateString("en-US", { month: "short" })
            }`; //
        return { day, formattedDate };
    };

    const matchDate = matchesData?.data?.matchDate
        ? formatDate(matchesData.data.matchDate)
        : { day: "Sun", formattedDate: "27Aug" };
    const matchTime = matchesData?.data?.matchTime || "5 am,6 am";
    const matchId = state?.match?._id;

    const handleRemovePlayer = (playerId, team) => {
        const teamName = team === "A" ? "teamA" : "teamB";
        dispatch(removePlayers({ matchId: matchId, playerId: playerId, team: teamName })).then(() => {
            dispatch(getMatchesView(matchId));
        });
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
                            backgroundColor: user.profilePic ? "transparent" : "#1F41BB",
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
                    <p className="mb-0 mt-2" style={{ color: "#374151", fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                        {user?.name
                            ? user.name.length > 14
                                ? user.name.slice(0, 14) + "..."
                                : user.name
                            : "User"}
                    </p>
                    <span className="badge bg-success-subtle text-success">{user?.level || 'A|B'}</span>
                    {/* {isRemovable && (
                        <button
                            className="position-absolute top-0 end-0 btn btn-danger btn-sm rounded-circle"
                            onClick={() => handleRemovePlayer(user._id, team)}
                            style={{ width: 24, height: 24, padding: 0 }}
                        >
                            <FaTrash size={12} />
                        </button>
                    )} */}
                </div>
            );
        } else if (
            (team === "A" && teamAData.length === 1 && index === 1) ||
            (team === "B" && (teamBData.length === 0 || teamBData.length === 1) && [2, 3].includes(index))
        ) {
            const name = team === "A" ? "teamA" : "teamB";
            return (
                <div key={index} className="text-center mx-auto mb-3">
                    <button
                        className="btn bg-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 80, height: 80, border: "1px solid #1F41BB" }}
                        onClick={() => { setShowModal(true); setTeamName(name); }}
                    >
                        <i className="bi bi-plus fs-1" style={{ color: "#1F41BB" }}></i>
                    </button>
                    <p className="mb-0 mt-2 fw-semibold" style={{ color: "#1F41BB" }}>Add Me</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container mt-4 mb-5 d-flex gap-4 px-4 flex-wrap">
            <div className="row w-100">
                {/* Left Section */}
                <div className="col-7 py-3 rounded-3 px-4" style={{ backgroundColor: "#F5F5F566" }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 all-matches" style={{ color: "#374151", fontSize: "26px" }}>
                            Details
                        </h5>
                        <div className="d-flex align-items-center gap-2">
                            <button
                                className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border shadow-sm"
                                style={{ width: 36, height: 36 }}
                            >
                                <i className="bi bi-share"></i>
                            </button>
                            <button
                                className="btn rounded-circle p-2 d-flex align-items-center justify-content-center text-white"
                                style={{ width: 36, height: 36, backgroundColor: "#1F41BB" }}
                            >
                                <i className="bi bi-chat-left-text"></i>
                            </button>
                        </div>
                    </div>

                    {/* Game Info Row */}
                    <div className="rounded-4 border px-3 py-2 mb-3" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <div className="d-flex justify-content-between align-items-start py-3">
                            <div className="d-flex align-items-center gap-2">
                                <img src={padal} alt="padel" width={24} />
                                <span className="ms-2 all-matches" style={{ color: "#374151" }}>
                                    PADEL
                                </span>
                            </div>
                            <small className="text-muted" style={{ fontWeight: "500" }}>
                                {matchDate.day}, {matchDate.formattedDate} | {matchTime}
                            </small>
                        </div>
                        <div className="row text-center border-top">
                            <div className="col py-3">
                                <p className="mb-1 text-muted small">Gender</p>
                                <p className="mb-0 fw-semibold">{matchesData?.data?.gender || "Any"}</p>
                            </div>
                            <div className="col border-start border-end py-3">
                                <p className="mb-1 text-muted small">Level</p>
                                <p className="mb-0 fw-semibold">{matchesData?.data?.skillLevel || "Intermediate"}</p>
                            </div>
                            <div className="col py-3">
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
                    <div className="d-flex justify-content-between rounded-3 p-3 mb-3 border" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <p className="text-muted mb-1" style={{ fontSize: "15px", fontWeight: "500" }}>
                            {matchesData?.data?.matchStatus || "Open Match"}
                        </p>
                    </div>

                    {/* Players Section */}
                    <div className="p-3 rounded-3 mb-3 border" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <h6 className="mb-3 all-matches" style={{ color: "#374151" }}>
                            Players
                        </h6>

                        {userLoading ? <DataLoading /> : (
                            <div className="row mx-auto">
                                {/* Team A */}
                                <div className="col-6 d-flex gap-3 justify-content-center align-items-center">
                                    {renderPlayerSlot(teamAData[0], 0, false, "A")}
                                    {renderPlayerSlot(teamAData[1], 1, true, "A")}
                                </div>

                                {/* Team B */}
                                <div className="col-6 d-flex gap-3 align-items-start justify-content-center align-items-center border-start">
                                    {renderPlayerSlot(teamBData[0], 2, true, "B")}
                                    {renderPlayerSlot(teamBData[1], 3, true, "B")}
                                </div>
                            </div>
                        )}

                        <div className="d-flex justify-content-between mt-3">
                            <p className=" mb-1" style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500", color: "blue" }}>
                                Team A
                            </p>
                            <p className="mb-0" style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500", color: "red" }}>
                                Team B
                            </p>
                        </div>
                    </div>

                    {/* Club Info */}
                    <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <div className="d-flex gap-3 align-items-start">
                            <img src={clubData?.courtImage?.[0] || club} alt="court" className="rounded" width={150} />
                            <div className="flex-grow-1">
                                <p className="mb-1" style={{ fontSize: "20px", fontWeight: "500" }}>{clubData?.clubName || "Unknown Club"}</p>
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
                    </div>

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
                            <p className="mb-0" style={{ fontSize: "16px", fontWeight: "500", color: "#374151" }}>
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
                            <p className="mb-0" style={{ fontSize: "16px", fontWeight: "500", color: "#374151" }}>
                                Today at 10:00 PM
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Booking Summary */}
                <div className="col-5 pe-0">
                    <div className="row mb-4 align-items-center text-white rounded-4 px-3 ms-2 pt-3" style={{ background: "linear-gradient(to right, #101826, #1e293b)", overflow: "visible", position: "relative" }}>
                        <div className="col-md-6 mb-4 mb-md-0">
                            <h4 className="fw-bold">Let the Battles Begin!</h4>
                            <p className="text-light">Great for competitive vibes.</p>
                        </div>
                        <div className="col-md-6 text-center" style={{ position: "relative" }}>
                            <img src={player} alt="Player" className="img-fluid" style={{ maxHeight: "390px", marginTop: "-20px", zIndex: 999, position: "relative" }} />
                        </div>
                    </div>
                    <div className="border rounded px-3 ms-2 pt-3 border-0" style={{ backgroundColor: "#CBD6FF1A" }}>
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
                            <p className="mt-2 mb-1" style={{ fontSize: "20px", fontWeight: "600", color: "#000000", fontFamily: "Poppins" }}>{clubData?.clubName}</p>
                            <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500", color: "#000000", fontFamily: "Poppins" }}>
                                {clubData?.clubName}
                                {clubData?.address || clubData?.city || clubData?.state || clubData?.zipCode ? ', ' : ''}
                                {[clubData?.address, clubData?.city, clubData?.state, clubData?.zipCode]
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                        </div>

                        <h6 className="border-top p-2 mb-3 ps-0 all-matches" >
                            Booking Summary
                        </h6>
                        <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                            {matchesData?.data?.slot && matchesData?.data?.slot?.length > 0 ? (
                                matchesData.data.slot.map((court, index) =>
                                    court.slotTimes.map((slotTime, slotIndex) => {
                                        const formatted = formatDate(matchesData?.data?.matchDate);
                                        return (
                                            <div
                                                key={`${index}-${slotIndex}`}
                                                className="court-row d-flex justify-content-between align-items-center mb-3 px-2"
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div>
                                                    <span style={{ fontWeight: "600", fontFamily: 'Poppins', fontSize: "18px", color: "#374151" }}>
                                                        {formatted.day},{formatted.formattedDate.charAt(0).toUpperCase() + formatted.formattedDate.slice(1)} {slotTime.time} (60m)</span> <span style={{ fontWeight: "400", fontFamily: 'Poppins', fontSize: "16px", color: "#374151" }}>{court.courtName}
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    ₹ <span style={{ fontWeight: "600", fontFamily: 'Poppins', color: "#1A237E", fontSize: "20px" }}>{slotTime.amount}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )
                            ) : (
                                <div>No slots available</div>
                            )}
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