import { useEffect } from "react";
import DirectionsIcon from "@mui/icons-material/Directions";
import { useLocation } from "react-router-dom";
import { padal, club, player } from "../../../assets/files";
import { useDispatch, useSelector } from "react-redux";
import { getMatchesView } from "../../../redux/user/matches/thunk";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { Avatar } from "@mui/material";

const ViewMatch = ({ className = "" }) => {
    const dispatch = useDispatch();
    const { state } = useLocation();
    const matchesData = useSelector((state) => state.userMatches?.viewMatchesData);
    const userLoading = useSelector((state) => state.userMatches?.viewMatchesLoading);
    const logo = localStorage.getItem("logo") ? JSON.parse(localStorage.getItem("logo")) : null;
    const userPlayersData = matchesData?.data?.players || []; // Players data
    const clubData = matchesData?.data?.clubId || {}; // Club data

    console.log("matchesData:", matchesData);
    console.log("userPlayersData:", userPlayersData);

    useEffect(() => {
        if (state?.match?._id) {
            dispatch(getMatchesView(state?.match?._id));
        }
    }, [state?.match?._id, dispatch]);

    const skillLabels = ["A/B", "B/C", "C/D", "D/E"];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        return { day, formattedDate };
    };

    const matchDate = matchesData?.data?.matchDate ? formatDate(matchesData.data.matchDate) : { day: 'Sun', formattedDate: '27 Aug' };
    const matchTime = matchesData?.data?.matchTime || '5 am,6 am';

    return (
        <div className="container mt-4 mb-5 d-flex gap-4 px-4 flex-wrap">
            <div className="row w-100">
                {/* Left Section */}
                <div
                    className="col-7 py-3 rounded-3 px-4"
                    style={{ backgroundColor: "#F5F5F566" }}
                >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0" style={{ fontSize: "20px", fontWeight: "600" }}>
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
                    <div
                        className="rounded-4 border px-3 py-2 mb-3"
                        style={{ backgroundColor: "#CBD6FF1A" }}
                    >
                        <div className="d-flex justify-content-between align-items-start py-3">
                            <div className="d-flex align-items-center gap-2">
                                <img src={padal} alt="padel" width={24} />
                                <span
                                    className="ms-2"
                                    style={{ fontSize: "18px", fontWeight: "600" }}
                                >
                                    PADEL
                                </span>
                            </div>
                            <small
                                className="text-muted"
                                style={{ fontWeight: "500" }}
                            >
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
                                        return (
                                            total +
                                            court.slotTimes.reduce((sum, slotTime) => sum + Number(slotTime.amount), 0)
                                        );
                                    }, 0)
                                    .toFixed(0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Court Number */}
                    <div
                        className="d-flex justify-content-between rounded-3 p-3 mb-3 border"
                        style={{ backgroundColor: "#CBD6FF1A" }}
                    >
                        <p
                            className="text-muted mb-1"
                            style={{ fontSize: "15px", fontWeight: "500" }}
                        >
                            {matchesData?.data?.matchStatus || "Open Match"}
                        </p>
                    </div>

                    {/* Players Section */}
                    <div
                        className="p-3 rounded-3 mb-3 border"
                        style={{ backgroundColor: "#CBD6FF1A" }}
                    >
                        <h6
                            className="mb-3"
                            style={{ fontSize: "18px", fontWeight: "600" }}
                        >
                            Players
                        </h6>

                        {userLoading ? <DataLoading /> : (
                            <>
                                <div className="row mx-auto">
                                    {/* Team A */}
                                    <div className="col-6 d-flex gap-3 justify-content-center">
                                        {(() => {
                                            const leftComponents = [];
                                            const userPlayersArray = Array.isArray(userPlayersData) ? userPlayersData : [];

                                            // First slot
                                            if (userPlayersArray.length > 0 && userPlayersArray[0]?.userId) {
                                                const player = userPlayersArray[0].userId;
                                                leftComponents.push(
                                                    <div key="left-player-0" className="text-center mx-auto mb-3">
                                                        <div
                                                            className="rounded-circle border d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: 80,
                                                                height: 80,
                                                                backgroundColor: player.profilePic ? "transparent" : "#1F41BB",
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            {player.profilePic ? (
                                                                <img
                                                                    src={player.profilePic}
                                                                    alt="player"
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                />
                                                            ) : (
                                                                <span style={{ color: "white", fontWeight: "600", fontSize: "24px" }}>
                                                                    {player?.name ? player.name.charAt(0).toUpperCase() : "U"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mb-0 mt-2 fw-semibold">
                                                            {player?.name ? player.name.charAt(0).toUpperCase() + player.name.slice(1) : "Unknown"}
                                                        </p>
                                                        <span className="badge bg-success-subtle text-success">{skillLabels[0]}</span>
                                                    </div>
                                                );
                                            }

                                            // Second slot
                                            if (userPlayersArray.length > 1 && userPlayersArray[1]?.userId) {
                                                const player = userPlayersArray[1].userId;
                                                leftComponents.push(
                                                    <div key="left-player-1" className="text-center mx-auto mb-3">
                                                        <div
                                                            className="rounded-circle border d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: 80,
                                                                height: 80,
                                                                backgroundColor: player.profilePic ? "transparent" : "#1F41BB",
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            {player.profilePic ? (
                                                                <img
                                                                    src={player.profilePic}
                                                                    alt="player"
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                />
                                                            ) : (
                                                                <span style={{ color: "white", fontWeight: "600", fontSize: "24px" }}>
                                                                    {player?.name ? player.name.charAt(0).toUpperCase() : "U"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mb-0 mt-2 fw-semibold">
                                                            {player?.name ? player.name.charAt(0).toUpperCase() + player.name.slice(1) : "Unknown"}
                                                        </p>
                                                        <span className="badge bg-success-subtle text-success">{skillLabels[1]}</span>
                                                    </div>
                                                );
                                            }

                                            return leftComponents;
                                        })()}
                                    </div>

                                    {/* Team B */}
                                    <div className="col-6 d-flex gap-3 align-items-start justify-content-center border-start">
                                        {(() => {
                                            const rightComponents = [];
                                            const userPlayersArray = Array.isArray(userPlayersData) ? userPlayersData : [];

                                            // First slot
                                            if (userPlayersArray.length > 2 && userPlayersArray[2]?.userId) {
                                                const player = userPlayersArray[2].userId;
                                                rightComponents.push(
                                                    <div key="right-player-0" className="text-center mx-auto mb-3">
                                                        <div
                                                            className="rounded-circle border d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: 80,
                                                                height: 80,
                                                                backgroundColor: player.profilePic ? "transparent" : "#1F41BB",
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            {player.profilePic ? (
                                                                <img
                                                                    src={player.profilePic}
                                                                    alt="player"
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                />
                                                            ) : (
                                                                <span style={{ color: "white", fontWeight: "600", fontSize: "24px" }}>
                                                                    {player?.name ? player.name.charAt(0).toUpperCase() : "U"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mb-0 mt-2 fw-semibold">
                                                            {player?.name ? player.name.charAt(0).toUpperCase() + player.name.slice(1) : "Unknown"}
                                                        </p>
                                                        <span className="badge bg-success-subtle text-success">{skillLabels[2]}</span>
                                                    </div>
                                                );
                                            }

                                            // Second slot
                                            if (userPlayersArray.length > 3 && userPlayersArray[3]?.userId) {
                                                const player = userPlayersArray[3].userId;
                                                rightComponents.push(
                                                    <div key="right-player-1" className="text-center mx-auto mb-3">
                                                        <div
                                                            className="rounded-circle border d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: 80,
                                                                height: 80,
                                                                backgroundColor: player.profilePic ? "transparent" : "#1F41BB",
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            {player.profilePic ? (
                                                                <img
                                                                    src={player.profilePic}
                                                                    alt="player"
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                />
                                                            ) : (
                                                                <span style={{ color: "white", fontWeight: "600", fontSize: "24px" }}>
                                                                    {player?.name ? player.name.charAt(0).toUpperCase() : "U"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mb-0 mt-2 fw-semibold">
                                                            {player?.name ? player.name.charAt(0).toUpperCase() + player.name.slice(1) : "Unknown"}
                                                        </p>
                                                        <span className="badge bg-success-subtle text-success">{skillLabels[3]}</span>
                                                    </div>
                                                );
                                            }

                                            return rightComponents;
                                        })()}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between mt-3">
                                    <p className="text-muted mb-1" style={{ fontSize: "14px", fontWeight: "500" }}>
                                        Team A
                                    </p>
                                    <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500" }}>
                                        Team B
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Club Info */}
                    <div
                        className="border rounded-3 p-3 mb-3"
                        style={{ backgroundColor: "#CBD6FF1A" }}
                    >
                        <div className="d-flex gap-3 align-items-start">
                            <img src={clubData?.courtImage?.[0] || club} alt="court" className="rounded" width={150} />
                            <div className="flex-grow-1">
                                <p className="mb-1" style={{ fontSize: "20px", fontWeight: "500" }}>{clubData?.clubName || "Unknown Club"}</p>
                                <p className="small mb-0" style={{ fontSize: "15px", fontWeight: "400" }}>
                                    {clubData?.address || "Unknown Address"}
                                </p>
                                <div
                                    className="mb-3"
                                    style={{ color: "#3DBE64", fontSize: "12px" }}
                                >
                                    Opened
                                </div>
                                <a
                                    href="#"
                                    style={{ color: "#1F41BB", fontSize: "15px", fontWeight: "500" }}
                                >
                                    More Info
                                </a>
                            </div>
                            <div className="ms-auto">
                                <DirectionsIcon
                                    style={{ color: "#22C55E", fontSize: 36, cursor: "pointer" }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Court Type Info */}
                    <div>
                        <h6
                            className="mb-3 mt-4"
                            style={{ fontSize: "18px", fontWeight: "600" }}
                        >
                            Information
                        </h6>
                    </div>
                    <div className="d-flex mb-4 align-items-center gap-3 px-2">
                        <i className="bi bi-layout-text-window-reverse fs-2 text-dark"></i>
                        <div>
                            <p
                                className="mb-0"
                                style={{ fontSize: "14px", fontWeight: "400" }}
                            >
                                Type of Court
                            </p>
                            <p
                                className="mb-0"
                                style={{ fontSize: "18px", fontWeight: "500", color: "#374151" }}
                            >
                                {matchesData?.data?.matchType || "Doubles"}, Outdoor, Crystal
                            </p>
                        </div>
                    </div>

                    <div className="d-flex mb-4 align-items-center gap-3 px-2">
                        <i className="bi bi-calendar-check fs-2 text-dark"></i>
                        <div>
                            <p
                                className="mb-0"
                                style={{ fontSize: "14px", fontWeight: "400" }}
                            >
                                End registration
                            </p>
                            <p
                                className="mb-0"
                                style={{ fontSize: "18px", fontWeight: "500", color: "#374151" }}
                            >
                                Today at 10:00 PM
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Booking Summary */}
                <div className="col-5 pe-0">
                    <div
                        className="row mb-4 align-items-center text-white rounded-4 px-3 ms-2 pt-3"
                        style={{
                            background: "linear-gradient(to right, #101826, #1e293b)",
                            overflow: "visible",
                            position: "relative",
                        }}
                    >
                        <div className="col-md-6 mb-4 mb-md-0">
                            <h4 className="fw-bold">Let the Battles Begin!</h4>
                            <p className="text-light">Great for competitive vibes.</p>
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
                    <div
                        className="border rounded px-3 ms-2 pt-3 border-0"
                        style={{ backgroundColor: "#CBD6FF1A" }}
                    >
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
                            <p className="mt-2 mb-1" style={{ fontSize: "20px", fontWeight: "600" }}>{clubData?.clubName || "Unknown Club"}</p>
                            <p className="small mb-0" style={{ fontSize: "15px", fontWeight: "400" }}>
                                {clubData?.address || "Unknown Address"}
                            </p>
                        </div>

                        <h6
                            className="border-top p-2 mb-3 ps-0"
                            style={{ fontSize: "20px", fontWeight: "600" }}
                        >
                            Booking Summary
                        </h6>
                        <div
                            style={{
                                maxHeight: "240px",
                                overflowY: "auto",
                            }}
                        >
                            {matchesData?.data?.slot && matchesData.data.slot.length > 0 ? (
                                matchesData.data.slot.map((court, index) =>
                                    court.slotTimes.map((slotTime, slotIndex) => (
                                        <div
                                            key={`${index}-${slotIndex}`}
                                            className="court-row d-flex justify-content-between align-items-center mb-3 px-2"
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div>
                                                <strong>{matchDate.day}, {matchDate.formattedDate} {slotTime.time} (60m)</strong> {court.courtName}
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <div>₹ {slotTime.amount}</div>
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : (
                                <div>No slots available</div>
                            )}
                        </div>

                        {/* <div className="border-top pt-2 mt-2 d-flex justify-content-between fw-bold">
                            <span style={{ fontSize: "16px", fontWeight: "600" }}>
                                Total to pay
                            </span>
                            <span className="text-primary">₹ {matchesData?.data?.slot
                                ?.reduce((total, court) => {
                                    return (
                                        total +
                                        court.slotTimes.reduce((sum, slotTime) => sum + Number(slotTime.amount), 0)
                                    );
                                }, 0)
                                .toFixed(0)}</span>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewMatch;