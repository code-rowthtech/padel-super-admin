import { useEffect, useState } from "react";
import DirectionsIcon from "@mui/icons-material/Directions";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { padal, club } from "../../../assets/files";
import { useDispatch, useSelector } from "react-redux";
import { createMatches } from "../../../redux/user/matches/thunk";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { Avatar } from "@mui/material";
import { getUserClub } from "../../../redux/user/club/thunk";
import { createBooking } from "../../../redux/user/booking/thunk";
import { Alert, Button, Modal } from "react-bootstrap";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { showError } from "../../../helpers/Toast";
import NewPlayers from "./NewPlayers";
import { MdOutlineDeleteOutline } from "react-icons/md";

const convertTo24Hour = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    let [hours] = time.split(":").map(Number);
    if (period.toLowerCase() === "pm" && hours !== 12) hours += 12;
    if (period.toLowerCase() === "am" && hours === 12) hours = 0;
    return hours * 60;
};

const formatTime = (timeStr) => {
    return timeStr.replace(" am", ":00 AM").replace(" pm", ":00 PM");
};

const getLatestTime = (courts, currentDate, currentTime) => {
    const currentDateStr = currentDate.toISOString().split("T")[0];
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    let allTimes = [];
    courts.forEach((court) => {
        court.time.forEach((timeObj) => {
            allTimes.push({
                time: timeObj.time,
                date: court.date,
                courtName: court.courtName,
            });
        });
    });

    let todayTimes = allTimes
        .filter((t) => t.date === currentDateStr)
        .filter((t) => convertTo24Hour(t.time) > currentMinutes);

    if (todayTimes.length > 0) {
        const latestToday = todayTimes.reduce((latest, curr) => {
            return convertTo24Hour(curr.time) > convertTo24Hour(latest.time) ? curr : latest;
        });
        return formatTime(latestToday.time);
    }

    const futureTimes = allTimes.filter((t) => t.date > currentDateStr);
    if (futureTimes.length > 0) {
        const earliestFuture = futureTimes.reduce((earliest, curr) => {
            return curr.date < earliest.date ||
                (curr.date === earliest.date && convertTo24Hour(curr.time) < convertTo24Hour(earliest.time))
                ? curr
                : earliest;
        });
        return formatTime(earliestFuture.time);
    }

    return "No available times";
};

const OpenmatchPayment = (props) => {
    const [modal, setModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState("");
    const [showAddMeForm, setShowAddMeForm] = useState(false);
    const [errorShow, setErrorShow] = useState(false);
    const [showShareDropdown, setShowShareDropdown] = useState(false);

    const [activeSlot, setActiveSlot] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const { state } = useLocation();
    const User = getUserFromSession();
    const userData = useSelector((state) => state?.userAuth?.user?.response);
    const matchesLoading = useSelector((state) => state?.userMatchesReducer?.matchesLoading);
    const bookingLoading = useSelector((state) => state?.userBooking?.bookingLoading);
    const navigate = useNavigate();
    const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0] || {});
    const logo = localStorage.getItem("logo") ? JSON.parse(localStorage.getItem("logo")) : null;
    const addedPlayers = localStorage.getItem("addedPlayers")
        ? JSON.parse(localStorage.getItem("addedPlayers"))
        : {};
    const { slotData = {}, finalSkillDetails = [], selectedDate = {}, selectedCourts = [] } = state || {};
    const savedClubId = localStorage.getItem("register_club_id");
    const owner_id = localStorage.getItem("owner_id");
    const slot2Player = addedPlayers.slot2 ? addedPlayers.slot2._id : null;
    const slot3Player = addedPlayers.slot3 ? addedPlayers.slot3._id : null;
    const slot4Player = addedPlayers.slot4 ? addedPlayers.slot4._id : null;
    const teamA = [User?._id, slot2Player].filter((id) => id !== null);
    const teamB = [slot3Player, slot4Player].filter((id) => id !== null);

    const dayShortMap = {
        Monday: "Mon",
        Tuesday: "Tue",
        Wednesday: "Wed",
        Thursday: "Thu",
        Friday: "Fri",
        Saturday: "Sat",
        Sunday: "Sun",
    };

    useEffect(() => {
        dispatch(getUserClub({ search: "" }));
    }, [dispatch]);

    const handleBooking = () => {
        if (Object.values(addedPlayers).filter((player) => player !== undefined).length < 1) {
            setError("Add at least 2 players to proceed.");
            setErrorShow(true);
            return;
        } else if (!selectedPayment) {
            setError("Select a payment method.");
            setErrorShow(true);
            return;
        } else if (!selectedCourts || selectedCourts.length === 0 || selectedCourts.some((court) => court.time?.length === 0)) {
            setError("Please select a slot");
            setErrorShow(true);
            return;
        }
        const formattedData = {
            slot: selectedCourts.flatMap((court) =>
                court.time.map((timeSlot) => ({
                    slotId: timeSlot?._id,
                    businessHours:
                        slotData?.data?.[0]?.slot?.[0]?.businessHours?.map((t) => ({
                            time: t?.time,
                            day: t?.day,
                        })) || [],
                    slotTimes: [
                        {
                            time: timeSlot?.time,
                            amount: timeSlot?.amount || 1000,
                        },
                    ],
                    courtName: court?.courtName,
                    courtId: court?._id,
                    bookingDate: new Date(court?.date || selectedDate?.fullDate).toISOString(),
                }))
            ) || [],
            clubId: savedClubId,
            matchDate: new Date(selectedDate?.fullDate).toISOString().split("T")[0],
            skillLevel: finalSkillDetails?.[0] || "Open Match",
            skillDetails:
                finalSkillDetails
                    ?.slice(1)
                    ?.map((detail, index) => (index === 0 && Array.isArray(detail) ? detail.join(", ") : detail)) || [],
            matchStatus: "open",
            matchTime: selectedCourts.flatMap((court) => court.time.map((time) => time.time)).join(","),
            teamA: teamA,
            teamB: teamB,
        };

        setIsLoading(true);
        dispatch(createMatches(formattedData))
            .unwrap()
            .then((res) => {
                if (!res?.match?.clubId) {
                    setError("Failed to create match: Invalid club ID.");
                    setErrorShow(true);
                    setIsLoading(false);
                    return;
                }
                try {
                    const name = userData?.name || User?.name;
                    const phoneNumber = userData?.phoneNumber || User?.phoneNumber;
                    const email = userData?.email || User?.email;
                    if (!phoneNumber) {
                        showError("User information missing!");
                        setIsLoading(false);
                        return;
                    }
                    const payload = {
                        name,
                        phoneNumber,
                        email,
                        register_club_id: savedClubId,
                        ownerId: owner_id,
                        paymentMethod: selectedPayment || "Gpay",
                        bookingType: "open Match",
                        bookingStatus: "upcoming",
                        slot: selectedCourts.flatMap((court) =>
                            court.time.map((timeSlot) => ({
                                slotId: timeSlot?._id,
                                businessHours:
                                    slotData?.data?.[0]?.slot?.[0]?.businessHours?.map((t) => ({
                                        time: t?.time,
                                        day: t?.day,
                                    })) || [],
                                slotTimes: [
                                    {
                                        time: timeSlot?.time,
                                        amount: timeSlot?.amount || 1000,
                                    },
                                ],
                                courtName: court?.courtName || "Court",
                                courtId: court?._id,
                                bookingDate: new Date(court?.date || selectedDate?.fullDate).toISOString(),
                            }))
                        ) || [],
                    };

                    dispatch(createBooking(payload))
                        .unwrap()
                        .then((res) => {
                            localStorage.removeItem("addedPlayers");
                            navigate("/open-matches");
                            setErrorShow(false);
                            setIsLoading(false);
                        })
                        .catch((err) => {
                            setError(err.message || "Booking ke dauraan error aaya.");
                            setErrorShow(true);
                            setIsLoading(false);
                        });
                    setModal(true);
                } catch (err) {
                    setError(err.message || "Booking ke dauraan error aaya.");
                    setErrorShow(true);
                    setModal(false);
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                setError(err.message || "Match creation failed.");
                setErrorShow(true);
                setIsLoading(false);
            });
    };

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
        if (!dateString) {
            return { day: "Sun", formattedDate: "27Aug" };
        }
        const date = new Date(dateString);
        const day = dayShortMap[date.toLocaleDateString("en-US", { weekday: "long" })] || "Sun";
        const formattedDate = `${date.toLocaleDateString("en-US", { day: "2-digit" })}, ${date.toLocaleDateString("en-US", { month: "short" })}`;
        return { day, formattedDate };
    };

    const calculateEndRegistrationTime = () => {
        if (!selectedCourts || selectedCourts.length === 0 || selectedCourts.every((court) => !court.time || court.time.length === 0)) {
            return "Today at 10:00 PM";
        }

        const allTimes = selectedCourts.flatMap(court =>
            court.time.map(slot => slot.time)
        );

        const latestTime = allTimes.reduce((latest, timeStr) => {
            const [hour, period] = timeStr.split(" ");
            let hourNum = parseInt(hour);
            if (period.toLowerCase() === "pm" && hourNum !== 12) hourNum += 12;
            if (period.toLowerCase() === "am" && hourNum === 12) hourNum = 0;
            return Math.max(latest, hourNum);
        }, 0);

        const slotCount = allTimes.length;
        let endHour = latestTime;
        if (slotCount > 1) {
            endHour += 1;
        } else {
            endHour += 1;
        }

        const period = endHour >= 12 ? "PM" : "AM";
        const displayHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;

        return `Today at ${displayHour}:00 ${period}`;
    };

    const matchDate = selectedDate?.fullDate ? formatDate(selectedDate.fullDate) : { day: "Fri", formattedDate: "29Aug" };
    const matchTime = selectedCourts.length > 0
        ? selectedCourts.flatMap((court) => court.time.map((time) => time.time)).join(", ")
        : "5 am,6 am";

    const totalAmount = selectedCourts.length > 0
        ? selectedCourts.reduce((total, court) => total + court.time.reduce((sum, slot) => sum + Number(slot.amount || 1000), 0), 0)
        : 0;

    const handleDeleteSlot = (courtId, slotId) => {
        const updatedCourts = selectedCourts
            .map((court) => {
                if (court._id === courtId) {
                    return {
                        ...court,
                        time: court.time.filter((slot) => slot._id !== slotId),
                    };
                }
                return court;
            })
            .filter((court) => court.time.length > 0);

        navigate("/match-payment", {
            state: {
                ...state,
                selectedCourts: updatedCourts,
            },
        });
    };

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
        opacity: isLoading ? 0.7 : 1,
        pointerEvents: isLoading ? "none" : "auto",
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
        color: " #001B76",
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
            const timer = setTimeout(() => {
                setErrorShow(false);
                setError("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorShow]);



    return (
        <div className="container mt-4 mb-5 d-flex gap-4 px-4 flex-wrap">
            <div className="row w-100">
                {/* Left Section */}
                <div className="col-7 py-3 rounded-3 px-4" style={{ backgroundColor: "#F5F5F566" }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0" style={{ fontSize: "20px", fontWeight: "600" }}>
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
                                <div className="position-absolute top-100 end-0 mt-1 bg-white border rounded shadow-sm" style={{ zIndex: 1000, minWidth: '120px' }}>
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
                            <div className="d-flex align-items-center gap-2">
                                <img src={padal} alt="padel" width={24} />
                                <span className="ms-2" style={{ fontSize: "18px", fontWeight: "600" }}>
                                    PADEL
                                </span>
                            </div>
                            <small className="text-muted d-none d-lg-block" style={{ fontWeight: "500" }}>
                                {matchDate.day}, {matchDate.formattedDate} | {matchTime?.slice(0, 20)}
                                {matchTime.length > 20 ? "..." : ""} (60m)
                            </small>
                            <small className="text-muted d-lg-none" style={{ fontWeight: "500" }}>
                                {matchDate.day}, {matchDate.formattedDate} <br /> {matchTime?.slice(0, 20)}
                                {matchTime.length > 20 ? "..." : ""} (60m)
                            </small>
                        </div>
                        <div className="row text-center border-top">
                            <div className="col py-2">
                                <p className="mb-1 text-muted small">Gender</p>
                                <p className="mb-0 fw-semibold">Mixed</p>
                            </div>
                            <div className="col border-start border-end py-2">
                                <p className="mb-1 text-muted small">Level</p>
                                <p className="mb-0 fw-semibold">{finalSkillDetails?.[0] || "Open Match"}</p>
                            </div>
                            <div className="col py-2">
                                <p className="mb-1 text-muted small">Price</p>
                                <p className="mb-0 fw-semibold">₹ {totalAmount.toFixed(0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Court Number */}
                    <div className="d-flex justify-content-between rounded-3 p-3 mb-2 py-2 border" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <p className="text-muted mb-1" style={{ fontSize: "15px", fontWeight: "500" }}>
                            Open Match
                        </p>
                    </div>

                    {/* Players Section */}
                    <div
                        className="p-3 rounded-3 mb-2 "
                        style={{
                            backgroundColor: "#CBD6FF1A",
                            border: error && Object.values(addedPlayers).filter((player) => player !== undefined).length < 1 ? "1px solid red" : "1px solid #ddd6d6ff",
                        }}
                    >
                        <h6 className="mb-3" style={{ fontSize: "18px", fontWeight: "600" }}>
                            Players{" "}
                            <span className="text-danger" style={{ fontSize: "15px", fontFamily: "Poppins", fontWeight: "500" }}>
                                {error && Object.values(addedPlayers).filter((player) => player !== undefined).length < 1 ? "Add at least 2 players to proceed." : ""}
                            </span>
                        </h6>
                        <div className="row mx-auto">
                            {/* Team A */}
                            <div className="col-6 d-flex flex-column flex-lg-row gap-3 justify-content-center align-items-center">
                                {(() => {
                                    const leftComponents = [];
                                    if (User) {
                                        const player = User;
                                        leftComponents.push(
                                            <div key="left-match-0" className="d-flex flex-column justify-content-center align-items-center mx-auto mb-3">
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
                                                    {player?.name ? player.name.charAt(0).toUpperCase() + player.name.slice(1) : "User"}
                                                </p>
                                                <span className="badge text-white" style={{ backgroundColor: "#3DBE64" }}>AB</span>
                                            </div>
                                        );
                                    } else {
                                        leftComponents.push(
                                            <div key="left-add-match-0" className="text-center mx-auto" style={{ cursor: "not-allowed" }}>
                                                <div
                                                    className="rounded-circle d-flex bg-white align-items-center justify-content-center"
                                                    style={{ width: 80, height: 80, border: "1px solid #3DBE64" }}
                                                >
                                                    <span className="fs-3" style={{ color: "#3DBE64" }}>
                                                        +
                                                    </span>
                                                </div>
                                                <p className="mb-0 mt-2 fw-semibold" style={{ color: "#3DBE64" }}>
                                                    Self Add
                                                </p>
                                            </div>
                                        );
                                    }

                                    if (addedPlayers.slot2) {
                                        const player = addedPlayers.slot2;
                                        leftComponents.push(
                                            <div key="left-user-1" className="d-flex flex-column justify-content-center align-items-center mx-auto mb-3">
                                                <div
                                                    className="rounded-circle border d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: 80,
                                                        height: 80,
                                                        backgroundColor: player.profilePic ? "transparent" : "#3DBE64",
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
                                                <span className="badge  text-white" style={{ backgroundColor: "#3DBE64" }}>{player?.level}</span>
                                            </div>
                                        );
                                    } else {
                                        leftComponents.push(
                                            <div
                                                key="left-add-user-1"
                                                className="text-center mx-auto"
                                                onClick={() => handleAddMeClick("slot2")}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div
                                                    className="rounded-circle d-flex bg-white align-items-center justify-content-center"
                                                    style={{ width: 80, height: 80, border: "1px solid #3DBE64" }}
                                                >
                                                    <span className="fs-3" style={{ color: "#3DBE64" }}>
                                                        +
                                                    </span>
                                                </div>
                                                <p className="mb-0 mt-2 fw-semibold" style={{ color: "#3DBE64" }}>
                                                    Add Me
                                                </p>
                                            </div>
                                        );
                                    }

                                    return leftComponents;
                                })()}
                            </div>

                            {/* Team B */}
                            <div className="col-6 d-flex flex-column flex-lg-row gap-3 align-items-center justify-content-center border-start">
                                {(() => {
                                    const rightComponents = [];

                                    if (addedPlayers.slot3) {
                                        const player = addedPlayers.slot3;
                                        rightComponents.push(
                                            <div key="right-user-0" className="d-flex flex-column justify-content-center align-items-center mx-auto mb-3">
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
                                                <span className="badge text-white" style={{ backgroundColor: "#1F41BB" }}>{player?.level}</span>
                                            </div>
                                        );
                                    } else {
                                        rightComponents.push(
                                            <div
                                                key="right-add-0"
                                                className="text-center mx-auto"
                                                onClick={() => handleAddMeClick("slot3")}
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

                                    if (addedPlayers.slot4) {
                                        const player = addedPlayers.slot4;
                                        rightComponents.push(
                                            <div key="right-user-1" className="d-flex flex-column justify-content-center align-items-center mx-auto mb-3">
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
                                                <span className="badge text-white" style={{ backgroundColor: "#1F41BB" }}>{player?.level}</span>
                                            </div>
                                        );
                                    } else {
                                        rightComponents.push(
                                            <div
                                                key="right-add-1"
                                                className="text-center mx-auto"
                                                onClick={() => handleAddMeClick("slot4")}
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

                        <div className="d-flex justify-content-between mt-2">
                            <p className="mb-1" style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500", color: "blue" }}>
                                Team A
                            </p>
                            <p className="mb-0" style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500", color: "red" }}>
                                Team B
                            </p>
                        </div>
                    </div>

                    {/* Club Info */}
                    <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <div className="d-lg-flex gap-3 align-items-start text-center text-lg-start">
                            <img src={clubData?.courtImage?.[0] || club} alt="court" className="rounded" width={150} />
                            <div className="flex-grow-1">
                                <h3 style={{ fontSize: "18px", fontWeight: "600", fontFamily: "Poppins" }}>{clubData?.clubName}</h3>
                                <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500", color: "#000000", fontFamily: "Poppins" }}>
                                    {clubData?.address || clubData?.city || clubData?.state || clubData?.zipCode ? " " : ""}
                                    {[clubData?.address, clubData?.city, clubData?.state, clubData?.zipCode].filter(Boolean).join(", ")}
                                </p>
                                <div className="mb-3" style={{ color: "#3DBE64", fontSize: "12px" }}>
                                    Opened
                                </div>
                                <Link to="#" style={{ color: "#1F41BB", fontSize: "15px", fontWeight: "500" }}>
                                    More Info
                                </Link>
                            </div>
                            <div className="ms-auto">
                                <DirectionsIcon style={{ color: "#22C55E", fontSize: 36, cursor: "pointer" }} />
                            </div>
                        </div>
                    </div>

                    {/* Court Type Info */}
                    <div>
                        <h6 className="mb-3 mt-4" style={{ fontSize: "18px", fontWeight: "600" }}>
                            Information
                        </h6>
                    </div>
                    <div className="d-flex mb-4 align-items-center gap-3 px-2">
                        <i className="bi bi-layout-text-window-reverse fs-2 text-dark"></i>
                        <div>
                            <p className="mb-0" style={{ fontSize: "14px", fontWeight: "400" }}>
                                Type of Court
                            </p>
                            <p className="mb-0" style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500", color: "#374151" }}>
                                Doubles, Outdoor, Crystal
                            </p>
                        </div>
                    </div>
                    <div className="d-flex mb-4 align-items-center gap-3 px-2">
                        <i className="bi bi-calendar-check fs-2 text-dark"></i>
                        <div>
                            <p className="mb-0" style={{ fontSize: "14px", fontWeight: "400" }}>
                                End registration
                            </p>
                            <p className="mb-0" style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500", color: "#374151" }}>
                                {calculateEndRegistrationTime()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="col-5 pe-0">
                    <div
                        className="rounded-4 pt-4 px-5 pb-4"
                        style={{ backgroundColor: "#F5F5F566", border: error && !selectedPayment ? "1px solid red" : "" }}
                    >
                        <h6 className="mb-4" style={{ fontSize: "20px", fontWeight: "600" }}>
                            Payment Method{" "}
                            <span className="text-danger" style={{ fontSize: "15px", fontFamily: "Poppins", fontWeight: "500" }}>
                                {error && !selectedPayment ? "Add at least 2 players to proceed." : ""}
                            </span>
                        </h6>
                        <div className="d-flex flex-column gap-3">
                            {[
                                { id: "google", name: "Google Pay", icon: "https://img.icons8.com/color/48/google-pay.png" },
                                { id: "paypal", name: "Paypal", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" },
                                { id: "apple", name: "Apple Pay", icon: "https://img.icons8.com/ios-filled/48/000000/mac-os.png" },
                            ].map((method) => (
                                <label key={method.id} className="d-flex justify-content-between align-items-center p-3 bg-white rounded-pill "
                                    style={{ boxShadow: '3px 4px 6.3px 0px #0000001F' }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <img src={method.icon} alt={method.name} width={28} />
                                        <span className="fw-medium">{method.name}</span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={method.id}
                                        className="form-check-input border-4 border-primary"
                                        checked={selectedPayment === method.id}
                                        onChange={(e) => setSelectedPayment(e.target.value)}
                                        style={{ boxShadow: "none" }}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="border  px-3 ms-2 pb-3 pt-3 mt-3 mb-5 mb-lg-0 border-0" style={{ borderRadius: "10px 30% 10px 10px", background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)" }}>
                        <div className="text-center mb-3">
                            <div className="d-flex justify-content-center">
                                {logo ? (
                                    <Avatar src={logo} alt="User Profile" style={{ height: "112px", width: "112px", boxShadow: "0px 4px 11.4px 0px #0000002E" }} />
                                ) : (
                                    <Avatar
                                        style={{
                                            height: "112px",
                                            width: "112px",
                                            fontSize: "30px",
                                            boxShadow: "0px 4px 11.4px 0px #0000002E",
                                        }}
                                    >
                                        {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                                    </Avatar>
                                )}
                            </div>
                            <p className="mt-2 mb-1 text-white" style={{ fontSize: "20px", fontWeight: "600", fontFamily: "Poppins" }}>
                                {clubData?.clubName}
                            </p>
                        </div>

                        <h6 className="border-top p-2 mb-3 text-white ps-0 custom-heading-use">Booking Summary</h6>
                        <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                            {selectedCourts.length > 0 ? (
                                selectedCourts.map((court, courtIndex) => (
                                    <div key={court._id} className="court-section mb-3">
                                        {court.time && court.time.length > 0 ? (
                                            court.time.map((slotTime, slotIndex) => {
                                                const formatted = formatDate(court.date);
                                                return (
                                                    <div
                                                        key={slotTime._id}
                                                        className="court-row d-flex justify-content-between align-items-center mb-2 px-2"
                                                        style={{
                                                            cursor: "pointer",
                                                            borderRadius: "4px",
                                                            transition: "background-color 0.2s ease, border-color 0.2s ease, border-width 0.2s ease",
                                                        }}
                                                    >
                                                        <div className="d-flex text-white">
                                                            <span className="" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "16px" }}>
                                                                {formatted.formattedDate.charAt(0).toUpperCase() + formatted.formattedDate.slice(1)}
                                                            </span>
                                                            <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "16px" }}>
                                                                {formatTime(slotTime.time)}
                                                            </span>
                                                            <span className="ps-1" style={{ fontWeight: "500", fontFamily: "Poppins", fontSize: "15px" }}>
                                                                {court.courtName}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2 text-white" >
                                                            <span style={{ fontWeight: "600", fontFamily: "Poppins" }}>₹ {slotTime.amount || 1000}</span>
                                                            <MdOutlineDeleteOutline className="text-white"
                                                                style={{ cursor: "pointer" }}
                                                                onClick={() => handleDeleteSlot(court._id, slotTime._id)}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-white">
                                                No slots selected for this court <Link className="text-success" to="/create-matches">Add slot</Link>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-white">
                                    No slot selected <Link className="text-success" to="/create-matches">Add slot</Link>
                                </div>
                            )}
                        </div>
                        <div className="border-top pt-2 mb-0  text-white mt-2 d-flex justify-content-between align-items-center fw-bold">
                            <p className="d-flex flex-column" style={{ fontSize: "16px", fontWeight: "600", fontFamily: "Poppins" }}>
                                Total to pay{" "}
                                <span style={{ fontSize: "14px", fontWeight: "600" }}>
                                    Total Slots {selectedCourts.length > 0 ? selectedCourts.reduce((total, court) => total + court.time.length, 0) : 0}
                                </span>
                            </p>
                            <p className="text-white" style={{ fontWeight: "500", fontSize: "25px" }}>
                                ₹ <span style={{ fontSize: "25px", fontFamily: "Poppins", fontWeight: "500" }}>{totalAmount.toFixed(0)}</span>
                            </p>
                        </div>

                        {/* Book Now Button */}
                        <div className="d-flex justify-content-center mt-3">
                            <button style={buttonStyle} onClick={handleBooking} className={props.className}>
                                <svg style={svgStyle} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id={`buttonGradient-${width}-${height}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#fff" />
                                            <stop offset="50%" stopColor="#fff" />
                                            <stop offset="100%" stopColor="#fff" />
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
                                    <circle cx={circleX} cy={circleY} r={circleRadius} fill="#001B76" />
                                    <g stroke="white" strokeWidth={height * 0.03} fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4}`} />
                                        <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4}`} />
                                        <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1}`} />
                                    </g>
                                </svg>
                                <div style={contentStyle}>{matchesLoading || bookingLoading ? <ButtonLoading color={"#001B76"} /> : "Book Now"}</div>
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