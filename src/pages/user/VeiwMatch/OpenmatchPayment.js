import { useEffect, useState } from "react";
import DirectionsIcon from "@mui/icons-material/Directions";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { player, padal, club } from "../../../assets/files";
import { useDispatch, useSelector } from "react-redux";
import { createMatches } from "../../../redux/user/matches/thunk";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import { Avatar } from "@mui/material";
import { getUserClub } from "../../../redux/user/club/thunk";
import { NewPlayers } from "./NewPlayers";
import { createBooking } from "../../../redux/user/booking/thunk";
import { Alert, Button, Modal } from "react-bootstrap";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

const OpenmatchPayment = (props) => {
    const [modal, setModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState("");
    const [showAddMeForm, setShowAddMeForm] = useState(false);
    const [errorShow, setErrorShow] = useState(false);
    const [activeSlot, setActiveSlot] = useState('slot-1');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const { state } = useLocation();
    const User = getUserFromSession();
    const navigate = useNavigate();
    const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0] || {});
    const logo = localStorage.getItem("logo") ? JSON.parse(localStorage.getItem("logo")) : null;
    const userPlayersData = localStorage.getItem('players') ? JSON.parse(localStorage.getItem('players')) : [];
    const { slotData, finalSkillDetails, selectedDate, selectedCourts } = state || {};
    const savedClubId = localStorage.getItem("register_club_id");
    const owner_id = localStorage.getItem("owner_id");

    const playerIds = userPlayersData?.map(player => player._id) || [];
    const players = User?._id ? [...playerIds, User._id] : playerIds;

    useEffect(() => {
        dispatch(getUserClub({ search: "" }));
    }, [dispatch]);

    const handleBooking = () => {
        if (!selectedPayment) {
            setError("Select a payment method.");
            setErrorShow(true);
            return;
        }
        if (userPlayersData.length < 1) {
            setError("Add at least 2 players to proceed.");
            setErrorShow(true)
            return;
        }
        const formattedData = {
            slot: selectedCourts?.flatMap(court =>
                court.times.map(timeSlot => ({
                    slotId: timeSlot?._id,
                    businessHours: slotData?.data?.[0]?.slot?.[0]?.businessHours?.map((t) => ({
                        time: t?.time,
                        day: t?.day,
                    })) || [],
                    slotTimes: [{
                        time: timeSlot?.time,
                        amount: timeSlot?.amount || 1000,
                    }],
                    courtName: court?.courtName,
                    courtId: court?._id,
                    bookingDate: new Date(selectedDate?.fullDate).toISOString(),
                }))
            ) || [],
            clubId: savedClubId,
            matchDate: new Date(selectedDate?.fullDate).toISOString().split("T")[0],
            skillLevel: finalSkillDetails?.[0],
            skillDetails: finalSkillDetails?.slice(1),
            matchStatus: "open",
            matchTime: selectedCourts?.flatMap(court => court.times.map(time => time.time)).join(","),
            players: players,
        };

        dispatch(createMatches(formattedData)).unwrap().then((res) => {
            if (!res?.match?.clubId) return;
            try {
                setIsLoading(true);
                const name = User?.name;
                const phoneNumber = User?.phoneNumber;
                const email = User?.email;
                if (!name || !phoneNumber || !email) {
                    showError('User information missing !')
                } else {
                    const payload = {
                        name,
                        phoneNumber,
                        email,
                        register_club_id: savedClubId,
                        ownerId: owner_id,
                        paymentMethod: selectedPayment || "Gpay",
                        type: "openMatch",
                        slot: selectedCourts?.flatMap(court =>
                            court.times.map(timeSlot => ({
                                slotId: timeSlot?._id,
                                businessHours: slotData?.data?.[0]?.slot?.[0]?.businessHours?.map((t) => ({
                                    time: t?.time,
                                    day: t?.day,
                                })) || [],
                                slotTimes: [{
                                    time: timeSlot?.time,
                                    amount: timeSlot?.amount || 1000,
                                }],
                                courtName: court?.courtName || "Court",
                                courtId: court?._id,
                                bookingDate: new Date(selectedDate?.fullDate).toISOString(),
                            }))
                        ) || [],
                    };

                    dispatch(createBooking(payload)).unwrap().then((res) => {
                        localStorage.removeItem('players');
                        navigate('/open-matches');
                        setErrorShow(false);
                        setIsLoading(true);
                    });
                    setModal(true);
                }


            } catch (err) {
                setError(err.message || err || "Booking ke dauraan error aaya.");
                setModal(false);
            } finally {
                setIsLoading(false);
            }
        });
    };

    const skillLabels = ["A/B", "B/C", "C/D", "D/E"];

    const handleAddMeClick = (slot) => {
        if (activeSlot === slot && showAddMeForm) {
            setShowAddMeForm(false);
            setActiveSlot(null);
        } else {
            setShowAddMeForm(true);
            setActiveSlot(slot);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        return { day, formattedDate };
    };

    const matchDate = selectedDate?.fullDate ? formatDate(selectedDate.fullDate) : { day: 'Fri', formattedDate: '29 Aug' };
    // सभी कोर्ट्स के स्लॉट्स को एक स्ट्रिंग में जोड़ें
    const matchTime = selectedCourts?.flatMap(court => court.times.map(time => time.time)).join(", ") || '5 am,6 am';

    // कुल कीमत की गणना
    const totalAmount = selectedCourts?.reduce((total, court) =>
        total + court.times.reduce((sum, slot) => sum + Number(slot.amount || 1000), 0),
        0
    ) || 6000;

    // Styling for button
    const width = 370;
    const height = 75;
    const circleRadius = height * 0.3;
    const curvedSectionStart = width * 0.76;
    const curvedSectionEnd = width * 0.996;
    const circleX = curvedSectionStart + (curvedSectionEnd - curvedSectionStart) * 0.68 + 1;
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
        opacity: (isLoading),
        pointerEvents: (isLoading ? 'none' : 'auto'),
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
        fontSize: `16px`,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        paddingRight: `${circleRadius * 2}px`,
    };

    useEffect(() => {
        if (errorShow) {
            setInterval(() => {
                setErrorShow(false)
                setError('')
            }, 3000);
        }
    }, [errorShow])

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
                                {matchDate.day}, {matchDate.formattedDate} | {matchTime?.slice(0, 20)}{matchTime.length > 20 ? "..." : ""} (60m)
                            </small>
                        </div>
                        <div className="row text-center border-top">
                            <div className="col py-3">
                                <p className="mb-1 text-muted small">Gender</p>
                                <p className="mb-0 fw-semibold">Mixed</p>
                            </div>
                            <div className="col border-start border-end py-3">
                                <p className="mb-1 text-muted small">Level</p>
                                <p className="mb-0 fw-semibold">{finalSkillDetails?.[0] || "Open Match"}</p>
                            </div>
                            <div className="col py-3">
                                <p className="mb-1 text-muted small">Price</p>
                                <p className="mb-0 fw-semibold">₹ {totalAmount.toFixed(0)}</p>
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
                            Open Match
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

                        <div className="row mx-auto">
                            {/* Team A */}
                            <div className="col-6 d-flex gap-3 justify-content-center">
                                {(() => {
                                    const leftComponents = [];

                                    // First slot: Logged-in User
                                    if (User) {
                                        const player = User;
                                        leftComponents.push(
                                            <div key="left-match-0" className="text-center mx-auto mb-3">
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
                                    } else {
                                        leftComponents.push(
                                            <div
                                                key="left-add-match-0"
                                                className="text-center mx-auto"
                                                onClick={() => handleAddMeClick("slot-1")}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div
                                                    className="rounded-circle d-flex bg-white align-items-center justify-content-center"
                                                    style={{ width: 80, height: 80, border: "1px solid #1F41BB" }}
                                                >
                                                    <span className="fs-3" style={{ color: "#1F41BB" }}>
                                                        +
                                                    </span>
                                                </div>
                                                <p className="mb-0 mt-2 fw-semibold" style={{ color: "#1F41BB" }}>
                                                    Add Me
                                                </p>
                                            </div>
                                        );
                                    }

                                    // Second slot: First player from userPlayersData
                                    const userPlayersArray = Array.isArray(userPlayersData) ? userPlayersData : [];
                                    if (userPlayersArray.length > 0 && userPlayersArray[0]) {
                                        const player = userPlayersArray[0];
                                        leftComponents.push(
                                            <div key="left-user-1" className="text-center mx-auto mb-3">
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
                                                            {player.name ? player.name.charAt(0).toUpperCase() : "U"}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mb-0 mt-2 fw-semibold">
                                                    {player.name ? player.name.charAt(0).toUpperCase() + player.name.slice(1) : "Unknown"}
                                                </p>
                                                <span className="badge bg-success-subtle text-success">{skillLabels[1]}</span>
                                            </div>
                                        );
                                    } else {
                                        leftComponents.push(
                                            <div
                                                key="left-add-user-1"
                                                className="text-center mx-auto"
                                                onClick={() => handleAddMeClick("slot-2")}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div
                                                    className="rounded-circle d-flex bg-white align-items-center justify-content-center"
                                                    style={{ width: 80, height: 80, border: "1px solid #1F41BB" }}
                                                >
                                                    <span className="fs-3" style={{ color: "#1F41BB" }}>
                                                        +
                                                    </span>
                                                </div>
                                                <p className="mb-0 mt-2 fw-semibold" style={{ color: "#1F41BB" }}>
                                                    Add Me
                                                </p>
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

                                    // First slot: Second player from userPlayersData
                                    if (userPlayersArray.length > 1 && userPlayersArray[1]) {
                                        const player = userPlayersArray[1];
                                        rightComponents.push(
                                            <div key="right-user-0" className="text-center mx-auto mb-3">
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
                                                            {player.name ? player.name.charAt(0).toUpperCase() : "U"}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mb-0 mt-2 fw-semibold">
                                                    {player.name ? player.name.charAt(0).toUpperCase() + player.name.slice(1) : "Unknown"}
                                                </p>
                                                <span className="badge bg-success-subtle text-success">{skillLabels[2]}</span>
                                            </div>
                                        );
                                    } else {
                                        rightComponents.push(
                                            <div
                                                key="right-add-0"
                                                className="text-center mx-auto"
                                                onClick={() => handleAddMeClick("slot-3")}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div
                                                    className="rounded-circle d-flex bg-white align-items-center justify-content-center"
                                                    style={{ width: 80, height: 80, border: "1px solid #1F41BB" }}
                                                >
                                                    <span className="fs-3" style={{ color: "#1F41BB" }}>
                                                        +
                                                    </span>
                                                </div>
                                                <p className="mb-0 mt-2 fw-semibold" style={{ color: "#1F41BB" }}>
                                                    Add Me
                                                </p>
                                            </div>
                                        );
                                    }

                                    // Second slot: Third player from userPlayersData
                                    if (userPlayersArray.length > 2 && userPlayersArray[2]) {
                                        const player = userPlayersArray[2];
                                        rightComponents.push(
                                            <div key="right-user-1" className="text-center mx-auto mb-3">
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
                                                            {player.name ? player.name.charAt(0).toUpperCase() : "U"}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mb-0 mt-2 fw-semibold">
                                                    {player.name ? player.name.charAt(0).toUpperCase() + player.name.slice(1) : "Unknown"}
                                                </p>
                                                <span className="badge bg-success-subtle text-success">{skillLabels[3]}</span>
                                            </div>
                                        );
                                    } else {
                                        rightComponents.push(
                                            <div
                                                key="right-add-1"
                                                className="text-center mx-auto"
                                                onClick={() => handleAddMeClick("slot-4")}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div
                                                    className="rounded-circle d-flex bg-white align-items-center justify-content-center"
                                                    style={{ width: 80, height: 80, border: "1px solid #1F41BB" }}
                                                >
                                                    <span className="fs-3" style={{ color: "#1F41BB" }}>
                                                        +
                                                    </span>
                                                </div>
                                                <p className="mb-0 mt-2 fw-semibold" style={{ color: "#1F41BB" }}>
                                                    Add Me
                                                </p>
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
                    </div>

                    {/* Club Info */}
                    <div
                        className="border rounded-3 p-3 mb-3"
                        style={{ backgroundColor: "#CBD6FF1A" }}
                    >
                        <div className="d-flex gap-3 align-items-start">
                            <img src={clubData?.courtImage?.[0] || club} alt="court" className="rounded" width={150} />
                            <div className="flex-grow-1">
                                <p className="mb-1" style={{ fontSize: "20px", fontWeight: "500" }}>
                                    {clubData?.clubName || "The Good Club"}
                                </p>
                                <p className="small mb-0" style={{ fontSize: "15px", fontWeight: "400" }}>
                                    {clubData?.address || "sector 19 panchkula chandigarh"}
                                    {clubData?.zipCode ? `, ${clubData.zipCode}` : ""}
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
                                Doubles, Outdoor, Crystal
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
                    <div className="rounded-4 pt-4 px-5" style={{ backgroundColor: "#F5F5F566" }}>
                        <h6 className="mb-4" style={{ fontSize: "20px", fontWeight: "600" }}>
                            Payment Method
                        </h6>
                        <div className="d-flex flex-column gap-3">
                            {[
                                { id: "google", name: "Google Pay", icon: "https://img.icons8.com/color/48/google-pay.png" },
                                { id: "apple", name: "Apple Pay", icon: "https://img.icons8.com/ios-filled/48/000000/mac-os.png" },
                                { id: "paypal", name: "Paypal", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" },
                            ].map((method) => (
                                <label
                                    key={method.id}
                                    className="d-flex justify-content-between align-items-center p-3 bg-white rounded-4 p-4"
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <img src={method.icon} alt={method.name} width={28} />
                                        <span className="fw-medium">{method.name}</span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={method.id}
                                        className="form-check-input"
                                        checked={selectedPayment === method.id}
                                        onChange={(e) => setSelectedPayment(e.target.value)}
                                    />
                                </label>
                            ))}
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
                            <p className="mt-2 mb-1" style={{ fontSize: "20px", fontWeight: "600" }}>
                                {clubData?.clubName || "The Good Club"}
                            </p>
                            <p className="small mb-0" style={{ fontSize: "15px", fontWeight: "400" }}>
                                {clubData?.address || "sector 19 panchkula chandigarh"}
                                {clubData?.zipCode ? `, ${clubData.zipCode}` : ""}
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
                            {selectedCourts && selectedCourts.length > 0 ? (
                                selectedCourts?.map((court, courtIndex) => (
                                    <div key={court._id} className="court-section mb-3">

                                        {court.times && court.times.length > 0 ? (
                                            court.times.map((slotTime, slotIndex) => (
                                                <div
                                                    key={slotTime._id}
                                                    className="court-row d-flex justify-content-between align-items-center mb-2 px-2"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <div>
                                                        <strong>{matchDate.day}, {matchDate.formattedDate} {slotTime.time} (60m)</strong> {court.courtName || `Court ${courtIndex + 1}`}
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div>₹ {slotTime.amount || 1000}</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div>No slots selected for this court</div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div>No courts selected</div>
                            )}
                        </div>
                        <div className="border-top pt-2 mb-3 mt-2 d-flex justify-content-between fw-bold">
                            <span style={{ fontSize: "16px", fontWeight: "600" }}>
                                Total to pay
                            </span>
                            <span style={{ fontSize: "16px", fontWeight: "600" }}>
                                Slots: {selectedCourts?.reduce((total, court) => total + court.times.length, 0) || 0}
                            </span>
                            <span className="text-primary">₹ {totalAmount.toFixed(0)}</span>
                        </div>

                        {errorShow && <Alert variant="danger">{error}</Alert>}

                        {/* Book Now Button */}
                        <div className="d-flex justify-content-center mt-3">
                            <button
                                style={buttonStyle}
                                onClick={handleBooking}
                                className={props.className}
                            // disabled={isLoading}
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
                                            <stop offset="0%" stopColor="#3DBE64" />
                                            <stop offset="50%" stopColor="#3DBE64" />
                                            <stop offset="100%" stopColor="#3DBE64" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={`M ${width * 0.76} ${height * 0.15} 
                                            C ${width * 0.79} ${height * 0.15} ${width * 0.81} ${height * 0.20} ${width * 0.83} ${height * 0.30} 
                                            C ${width * 0.83} ${height * 0.32} ${width * 0.84} ${height * 0.34} ${width * 0.84} ${height * 0.34} 
                                            C ${width * 0.85} ${height * 0.34} ${width * 0.86} ${height * 0.32} ${width * 0.86} ${height * 0.30} 
                                            C ${width * 0.88} ${height * 0.20} ${width * 0.90} ${height * 0.15} ${width * 0.92} ${height * 0.15} 
                                            C ${width * 0.97} ${height * 0.15} ${width * 0.996} ${height * 0.30} ${width * 0.996} ${height * 0.50} 
                                            C ${width * 0.996} ${height * 0.70} ${width * 0.97} ${height * 0.85} ${width * 0.92} ${height * 0.85} 
                                            C ${width * 0.90} ${height * 0.85} ${width * 0.88} ${height * 0.80} ${width * 0.86} ${height * 0.70} 
                                            C ${width * 0.86} ${height * 0.68} ${width * 0.85} ${height * 0.66} ${width * 0.84} ${height * 0.66} 
                                            C ${width * 0.84} ${height * 0.66} ${width * 0.83} ${height * 0.68} ${width * 0.83} ${height * 0.70} 
                                            C ${width * 0.81} ${height * 0.80} ${width * 0.79} ${height * 0.85} ${width * 0.76} ${height * 0.85} 
                                            L ${width * 0.08} ${height * 0.85} 
                                            C ${width * 0.04} ${height * 0.85} ${width * 0.004} ${height * 0.70} ${width * 0.004} ${height * 0.50} 
                                            C ${width * 0.004} ${height * 0.30} ${width * 0.04} ${height * 0.15} ${width * 0.08} ${height * 0.15} 
                                            L ${width * 0.76} ${height * 0.15} Z`}
                                        fill={`url(#buttonGradient-${width}-${height})`}
                                    />
                                    <circle
                                        cx={circleX}
                                        cy={circleY}
                                        r={circleRadius}
                                        fill="#3DBE64"
                                    />
                                    <g
                                        stroke="white"
                                        strokeWidth={height * 0.03}
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path
                                            d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4}`}
                                        />
                                        <path
                                            d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4}`}
                                        />
                                        <path
                                            d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1}`}
                                        />
                                    </g>
                                </svg>
                                <div style={contentStyle}>{isLoading ? <ButtonLoading /> : "Book Now"}</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Modal */}
            {!errorShow && (
                <Modal centered show={error} onHide={() => setError(null)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Error</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{error}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setError(null)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            <NewPlayers
                activeSlot={activeSlot}
                setShowAddMeForm={setShowAddMeForm}
                showAddMeForm={showAddMeForm}
                setActiveSlot={setActiveSlot}
            />
        </div>
    );
};

export default OpenmatchPayment;