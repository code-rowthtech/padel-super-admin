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
import { getUserFromSession } from "../../../helpers/api/apiCore";
import NewPlayers from "./NewPlayers";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { Tooltip, TooltipProvider } from "react-tooltip";
import { loginUserNumber } from "../../../redux/user/auth/authThunk";

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

const OpenmatchPayment = () => {
    const [selectedPayment, setSelectedPayment] = useState("");
    const [showAddMeForm, setShowAddMeForm] = useState(false);
    const [activeSlot, setActiveSlot] = useState(null);
    const [error, setError] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        paymentMethod: '',
        general: '',
        addedPlayers: '',
        booking: ''

    });
    const [isLoading, setIsLoading] = useState(false);
    const [showShareDropdown, setShowShareDropdown] = useState(false);
    const location = useLocation();
    const dispatch = useDispatch();
    const { state } = useLocation();
    const navigate = useNavigate();
    const User = getUserFromSession();
    const userData = useSelector((state) => state?.userAuth?.user?.response);
    const matchesLoading = useSelector((state) => state?.userMatchesReducer?.matchesLoading);
    const bookingLoading = useSelector((state) => state?.userBooking?.bookingLoading);
    const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0] || {});
    const logo = localStorage.getItem("logo") ? JSON.parse(localStorage.getItem("logo")) : null;
    const addedPlayers = localStorage.getItem("addedPlayers")
        ? JSON.parse(localStorage.getItem("addedPlayers"))
        : {};

    const updateName = JSON.parse(localStorage.getItem("updateprofile"));
    const [name, setName] = useState(User?.name || updateName?.fullName || "");
    const [phoneNumber, setPhoneNumber] = useState(
        User?.phoneNumber || updateName?.phone ? `+91 ${User.phoneNumber || updateName?.phone}` : ""
    );
    const [email, setEmail] = useState(User?.email || updateName?.email || "");

    const { slotData = {}, finalSkillDetails = [], selectedDate = {}, selectedCourts = [] } = state || {};

    const savedClubId = localStorage.getItem("register_club_id");
    const owner_id = localStorage.getItem("owner_id");

    const slot2Player = addedPlayers.slot2?._id || null;
    const slot3Player = addedPlayers.slot3?._id || null;
    const slot4Player = addedPlayers.slot4?._id || null;
    const teamA = [User?._id, slot2Player].filter(Boolean);
    const teamB = [slot3Player, slot4Player].filter(Boolean);

    const dayShortMap = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };

    useEffect(() => {
        dispatch(getUserClub({ search: "" }));
    }, [dispatch]);

    const handleBooking = async () => {
        // Validation
        setError({
            name: '', phoneNumber: '', email: '',
            paymentMethod: '', general: '', addedPlayers: ''
        });

        const addedCount = Object.values(addedPlayers).filter(Boolean).length;
        if (addedCount < 1) {
            setError(prev => ({ ...prev, addedPlayers: "Add at least 2 players to proceed." }));
            return;
        }

        if (!selectedPayment) {
            setError(prev => ({ ...prev, paymentMethod: "Select a payment method." }));
            return;
        }

        if (!name?.trim()) {
            setError(prev => ({ ...prev, name: "Name is required." }));
            return;
        }

        if (!email?.trim()) {
            setError(prev => ({ ...prev, email: "Email is required." }));
            return;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError(prev => ({ ...prev, email: "Enter a valid email address." }));
            return;
        }

        const cleanPhone = phoneNumber?.replace(/^\+91\s*/, "").trim();
        if (!cleanPhone) {
            setError(prev => ({ ...prev, phoneNumber: "Phone number is required." }));
            return;
        }
        if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
            setError(prev => ({ ...prev, phoneNumber: "Phone number must be 10 digits and start with 6-9." }));
            return;
        }

        if (!selectedCourts?.length || selectedCourts.some(c => !c.time?.length)) {
            setError(prev => ({ ...prev, general: "Please select a slot" }));
            return;
        }

        setIsLoading(true);

        const formattedData = {
            slot: selectedCourts.flatMap((court) =>
                court.time.map((timeSlot) => ({
                    slotId: timeSlot._id,
                    businessHours: slotData?.data?.[0]?.slot?.[0]?.businessHours?.map(t => ({ time: t.time, day: t.day })) || [],
                    slotTimes: [{ time: timeSlot.time, amount: timeSlot.amount || 1000 }],
                    courtName: court.courtName,
                    courtId: court._id,
                    bookingDate: new Date(court.date || selectedDate.fullDate).toISOString(),
                }))
            ),
            clubId: savedClubId,
            matchDate: new Date(selectedDate.fullDate).toISOString().split("T")[0],
            skillLevel: finalSkillDetails[0] || "Open Match",
            skillDetails: finalSkillDetails.slice(1).map((d, i) => (i === 0 && Array.isArray(d) ? d.join(", ") : d)) || [],
            matchStatus: "open",
            matchTime: selectedCourts.flatMap(c => c.time.map(t => t.time)).join(","),
            teamA,
            teamB,
        };

        try {
            const currentPhone = User?.phoneNumber;
            const currentName = User?.name;
            const currentEmail = User?.email;

            if (!currentName || !currentPhone || !currentEmail) {
                const loginResponse = await dispatch(loginUserNumber({ phoneNumber: phoneNumber.replace(/^\+91\s/, ""), name, email })).unwrap();

                if (loginResponse?.status !== "200") {
                    throw new Error("Login failed. Please try again.");
                }

                const updatedUser = loginResponse?.response;
                sessionStorage.setItem("user", JSON.stringify(updatedUser));
            }
            const matchRes = await dispatch(createMatches(formattedData)).unwrap();
            if (!matchRes?.match?.clubId) throw new Error("Match creation failed.");

            const bookingPayload = {
                name: userData?.name || User?.name,
                phoneNumber: userData?.phoneNumber || User?.phoneNumber,
                email: userData?.email || User?.email,
                register_club_id: savedClubId,
                ownerId: owner_id,
                paymentMethod: selectedPayment,
                bookingType: "open Match",
                bookingStatus: "upcoming",
                slot: selectedCourts.flatMap((court) =>
                    court.time.map((timeSlot) => ({
                        slotId: timeSlot._id,
                        businessHours: slotData?.data?.[0]?.slot?.[0]?.businessHours?.map(t => ({ time: t.time, day: t.day })) || [],
                        slotTimes: [{ time: timeSlot.time, amount: timeSlot.amount || 1000 }],
                        courtName: court.courtName || "Court",
                        courtId: court._id,
                        bookingDate: new Date(court.date || selectedDate.fullDate).toISOString(),
                    }))
                ),
            };

            await dispatch(createBooking(bookingPayload)).unwrap();

            // Success: Clear & Redirect
            localStorage.removeItem("addedPlayers");
            navigate("/open-matches");
        } catch (err) {
            setError(prev => ({ ...prev, booking: err.message || "Booking failed. Please try again." }));
            setIsLoading(false);
        }
    };

    const handleAddMeClick = (slot) => {
        setShowAddMeForm(prev => prev && activeSlot === slot ? false : true);
        setActiveSlot(prev => prev === slot ? null : slot);
    };

    const formatDate = (dateString) => {
        if (!dateString) return { day: "Sun", formattedDate: "27Aug" };
        const date = new Date(dateString);
        const day = dayShortMap[date.toLocaleDateString("en-US", { weekday: "long" })] || "Sun";
        const formattedDate = `${date.toLocaleDateString("en-US", { day: "2-digit" })}, ${date.toLocaleDateString("en-US", { month: "short" })}`;
        return { day, formattedDate };
    };

    const calculateEndRegistrationTime = () => {
        if (!selectedCourts?.length || selectedCourts.every(c => !c.time?.length)) return "Today at 10:00 PM";
        const allTimes = selectedCourts.flatMap(c => c.time.map(s => s.time));
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

    const matchDate = selectedDate?.fullDate ? formatDate(selectedDate.fullDate) : { day: "Fri", formattedDate: "29Aug" };
    const matchTime = selectedCourts.length > 0
        ? selectedCourts.flatMap(c => c.time.map(t => t.time)).join(", ")
        : "5 am, 6 am";
    const totalAmount = selectedCourts.reduce((sum, c) => sum + c.time.reduce((s, t) => s + Number(t.amount || 1000), 0), 0);

    const handleDeleteSlot = (courtId, slotId) => {
        const updated = selectedCourts
            .map(c => c._id === courtId ? { ...c, time: c.time.filter(s => s._id !== slotId) } : c)
            .filter(c => c.time.length > 0);
        navigate("/match-payment", { state: { ...state, selectedCourts: updated } });
    };

    // Button SVG
    const width = 370, height = 75, circleRadius = height * 0.3;
    const curvedStart = width * 0.76, circleX = curvedStart + (width * 0.996 - curvedStart) * 0.68 + 1;
    const circleY = height * 0.5, arrowSize = circleRadius * 0.6;

    const buttonStyle = {
        position: "relative", width: `${width}px`, height: `${height}px`, border: "none",
        background: "transparent", cursor: "pointer", opacity: isLoading ? 0.7 : 1,
        pointerEvents: isLoading ? "none" : "auto"
    };
    const svgStyle = { width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 1 };
    const contentStyle = { position: "relative", zIndex: 2, color: "#001B76", fontWeight: 600, fontSize: "16px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", paddingRight: `${circleRadius * 2}px` };

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [error]);
    return (
        <div className="container mt-4 mb-5 d-flex gap-4 px-4 flex-wrap">
            <div className="row w-100">
                {/* Left Section */}
                <div className="col-7 py-3 rounded-3 px-4" style={{ backgroundColor: "#F5F5F566" }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0" style={{ fontSize: "20px", fontWeight: 600 }}>Details</h5>
                        <div className="d-flex align-items-center gap-2 position-relative">
                            <button className="btn btn-light rounded-circle p-2 border shadow-sm" style={{ width: 36, height: 36 }} onClick={() => setShowShareDropdown(!showShareDropdown)}>
                                <i className="bi bi-share"></i>
                            </button>
                            <button className="btn rounded-circle p-2 text-white" style={{ width: 36, height: 36, backgroundColor: "#1F41BB" }}>
                                <i className="bi bi-chat-left-text"></i>
                            </button>
                            {showShareDropdown && (
                                <div className="position-absolute top-100 end-0 mt-1 bg-white border rounded shadow-sm" style={{ zIndex: 1000, minWidth: "120px" }}>
                                    <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank"); setShowShareDropdown(false); }}>
                                        <i className="bi bi-facebook" style={{ color: "#1877F2" }}></i> Facebook
                                    </button>
                                    <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={() => { window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, "_blank"); setShowShareDropdown(false); }}>
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
                            <div className="col py-2"><p className="mb-1 text-muted small">Gender</p><p className="mb-0 fw-semibold">Mixed</p></div>
                            <div className="col border-start border-end py-2"><p className="mb-1 text-muted small">Level</p><p className="mb-0 fw-semibold">{finalSkillDetails[0] || "Open Match"}</p></div>
                            <div className="col py-2"><p className="mb-1 text-muted small">Price</p><p className="mb-0 fw-semibold">₹ {totalAmount}</p></div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between rounded-3 p-3 mb-2 py-2 border" style={{ backgroundColor: "#CBD6FF1A" }}>
                        <p className="text-muted mb-1" style={{ fontSize: "15px", fontWeight: 500 }}>Open Match</p>
                    </div>

                    {/* Players */}
                    <div className="p-3 rounded-3 mb-2" style={{ backgroundColor: "#CBD6FF1A", border: error?.addedPlayers && Object.values(addedPlayers).filter(Boolean).length < 1 ? "1px solid red" : "1px solid #ddd6d6ff" }}>
                        <h6 className="mb-3" style={{ fontSize: "18px", fontWeight: 600 }}>
                            Players
                        </h6>
                        <div className="row mx-auto">
                            {/* Team A */}
                            <div className="col-6 d-flex flex-column flex-lg-row gap-3 justify-content-center">
                                {User && (
                                    <div className="d-flex flex-column align-items-center mx-auto mb-3">
                                        <div className="rounded-circle border d-flex align-items-center justify-content-center" style={{ width: 80, height: 80, backgroundColor: User.profilePic ? "transparent" : "#1F41BB", overflow: "hidden" }}>
                                            {User.profilePic ? <img src={User.profilePic} alt="you" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "white", fontWeight: 600, fontSize: "24px" }}>{User.name?.[0]?.toUpperCase() || "U"}</span>}
                                        </div>
                                        <TooltipProvider>
                                            <p className="mb-0 mt-2 fw-semibold text-center" style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {User.name?.length > 12 ? <><span data-tooltip-id="you" data-tooltip-content={User.name}>{User.name.substring(0, 12)}...</span><Tooltip id="you" /></> : User.name}
                                            </p>
                                        </TooltipProvider>
                                        <span className="badge text-white" style={{ backgroundColor: "#3DBE64" }}>{finalSkillDetails.slice(-1)}</span>
                                    </div>
                                )}
                                {addedPlayers.slot2 ? (
                                    <div className="d-flex flex-column align-items-center mx-auto mb-3">
                                        <div className="rounded-circle border d-flex justify-content-center align-items-center" style={{ width: 80, height: 80, backgroundColor: addedPlayers.slot2.profilePic ? "transparent" : "#3DBE64", overflow: "hidden" }}>
                                            {addedPlayers.slot2.profilePic ? <img src={addedPlayers.slot2.profilePic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "white", fontWeight: 600, fontSize: "24px" }}>{addedPlayers.slot2.name[0].toUpperCase()}</span>}
                                        </div>
                                        <p className="mb-0 mt-2 fw-semibold" style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{addedPlayers.slot2.name}</p>
                                        <span className="badge text-white" style={{ backgroundColor: "#3DBE64" }}>{addedPlayers.slot2.level}</span>
                                    </div>
                                ) : (
                                    <div className="text-center mx-auto" onClick={() => handleAddMeClick("slot2")} style={{ cursor: "pointer" }}>
                                        <div className="rounded-circle d-flex bg-white align-items-center justify-content-center" style={{ width: 80, height: 80, border: "1px solid #3DBE64" }}><span className="fs-3" style={{ color: "#3DBE64" }}>+</span></div>
                                        <p className="mb-0 mt-2 fw-semibold" style={{ color: "#3DBE64" }}>Add Me</p>
                                    </div>
                                )}
                            </div>

                            {/* Team B */}
                            <div className="col-6 d-flex flex-column flex-lg-row gap-3 align-items-start justify-content-center border-start">
                                {addedPlayers.slot3 ? (
                                    <div className="d-flex flex-column align-items-center mx-auto mb-3">
                                        <div className="rounded-circle d-flex justify-content-center align-items-center border" style={{ width: 80, height: 80, backgroundColor: addedPlayers.slot3.profilePic ? "transparent" : "#1F41BB", overflow: "hidden" }}>
                                            {addedPlayers.slot3.profilePic ? <img src={addedPlayers.slot3.profilePic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "white", fontWeight: 600, fontSize: "24px" }}>{addedPlayers.slot3.name[0].toUpperCase()}</span>}
                                        </div>
                                        <p className="mb-0 mt-2 text-center fw-semibold" style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{addedPlayers.slot3.name}</p>
                                        <span className="badge text-white" style={{ backgroundColor: "#1F41BB" }}>{addedPlayers.slot3.level}</span>
                                    </div>
                                ) : (
                                    <div className="text-center mx-auto" onClick={() => handleAddMeClick("slot3")} style={{ cursor: "pointer" }}>
                                        <div className="rounded-circle d-flex bg-white align-items-center justify-content-center" style={{ width: 80, height: 80, border: "1px solid #1F41BB" }}><span className="fs-3" style={{ color: "#1F41BB" }}>+</span></div>
                                        <p className="mb-0 mt-2 fw-semibold" style={{ color: "#1F41BB" }}>Add Me</p>
                                    </div>
                                )}
                                {addedPlayers.slot4 ? (
                                    <div className="d-flex flex-column align-items-center mx-auto mb-3">
                                        <div className="rounded-circle border d-flex justify-content-center align-items-center" style={{ width: 80, height: 80, backgroundColor: addedPlayers.slot4.profilePic ? "transparent" : "#1F41BB", overflow: "hidden" }}>
                                            {addedPlayers.slot4.profilePic ? <img src={addedPlayers.slot4.profilePic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "white", fontWeight: 600, fontSize: "24px" }}>{addedPlayers.slot4.name[0].toUpperCase()}</span>}
                                        </div>
                                        <p className="mb-0 mt-2 fw-semibold" style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{addedPlayers.slot4.name}</p>
                                        <span className="badge text-white" style={{ backgroundColor: "#1F41BB" }}>{addedPlayers.slot4.level}</span>
                                    </div>
                                ) : (
                                    <div className="text-center mx-auto" onClick={() => handleAddMeClick("slot4")} style={{ cursor: "pointer" }}>
                                        <div className="rounded-circle d-flex bg-white align-items-center justify-content-center" style={{ width: 80, height: 80, border: "1px solid #1F41BB" }}><span className="fs-3" style={{ color: "#1F41BB" }}>+</span></div>
                                        <p className="mb-0 mt-2 fw-semibold" style={{ color: "#1F41BB" }}>Add Me</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <p className="mb-1" style={{ fontSize: "14px", color: "blue" }}>Team A</p>
                            <p className="mb-0" style={{ fontSize: "14px", color: "red" }}>Team B</p>
                        </div>
                    </div>

                    <div
                        className="rounded-4 py-4 px-3  mb-4"
                        style={{ backgroundColor: "#F5F5F566", border: error?.name || error?.email || error?.phoneNumber ? "1px solid red" : "1px solid #ddd6d6ff" }}
                    >
                        <h6 className="mb-3 custom-heading-use">Contact Info</h6>
                        <div className="row">
                            <div className="col-12 col-md-4 mb-3 p-1">
                                <label className="form-label mb-0 ps-lg-2" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                                    Name <span className="text-danger" style={{ fontSize: "16px", fontWeight: "300" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    style={{ boxShadow: "none" }}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || /^[A-Za-z\s]*$/.test(value)) {
                                            if (value.length === 0 && value.trim() === "") {
                                                setName("");
                                                return;
                                            }
                                            const formattedValue = value
                                                .trimStart()
                                                .replace(/\s+/g, " ")
                                                .toLowerCase()
                                                .replace(/(^|\s)\w/g, (letter) => letter.toUpperCase());
                                            setName(formattedValue);
                                        }
                                    }}
                                    className="form-control border-0 p-2"
                                    placeholder="Enter your name"
                                    aria-label="name"
                                />
                                {error?.name && (
                                    <div className="text-danger position-absolute" style={{ fontSize: "12px", marginTop: "4px" }}>
                                        {error?.name}
                                    </div>
                                )}
                            </div>

                            <div className="col-12 col-md-4 mb-3 p-1">
                                <label className="form-label mb-0 ps-lg-1" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                                    Phone Number <span className="text-danger" style={{ fontSize: "16px", fontWeight: "300" }}>*</span>
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text border-0 p-2" style={{ backgroundColor: "#F5F5F5" }}>
                                        <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} />
                                    </span>
                                    <input
                                        type="text"
                                        maxLength={13}
                                        value={phoneNumber}
                                        style={{ boxShadow: "none" }}
                                        disabled={User?.phoneNumber}
                                        onChange={(e) => {
                                            const inputValue = e.target.value.replace(/[^0-9]/g, "");
                                            if (inputValue === "" || /^[6-9][0-9]{0,9}$/.test(inputValue)) {
                                                const formattedValue = inputValue === "" ? "" : `+91 ${inputValue}`;
                                                setPhoneNumber(formattedValue);
                                            }
                                        }}
                                        className="form-control border-0 p-2"
                                        placeholder="+91"
                                    />
                                </div>
                                {error?.phoneNumber && (
                                    <div className="text-danger position-absolute" style={{ fontSize: "12px", marginTop: "4px" }}>
                                        {error?.phoneNumber}
                                    </div>
                                )}
                            </div>

                            <div className="col-12 col-md-4 mb-3 p-1">
                                <label className="form-label mb-0 ps-lg-2" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                                    Email <span className="text-danger" style={{ fontSize: "16px", fontWeight: "300" }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    style={{ boxShadow: "none" }}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || /^[A-Za-z0-9@.]*$/.test(value)) {
                                            if (value.length === 0) {
                                                setEmail("");
                                                return;
                                            }
                                            const formattedValue = value
                                                .replace(/\s+/g, "")
                                                .replace(/^(.)(.*)(@.*)?$/, (match, first, rest, domain = "") => {
                                                    return first.toUpperCase() + rest.toLowerCase() + domain;
                                                });
                                            setEmail(formattedValue);
                                        }
                                    }}
                                    className="form-control border-0 p-2"
                                    placeholder="Enter your email"
                                />
                                {error?.email && (
                                    <div className="text-danger position-absolute" style={{ fontSize: "12px", marginTop: "4px" }}>
                                        {error?.email}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    <h6 className="mb-3 mt-4" style={{ fontSize: "18px", fontWeight: 600 }}>Information</h6>
                    <div className="d-flex mb-4 align-items-center gap-3 px-2">
                        <i className="bi bi-layout-text-window-reverse fs-2 text-dark"></i>
                        <div><p className="mb-0" style={{ fontSize: "14px" }}>Type of Court</p><p className="mb-0" style={{ fontSize: "16px", color: "#374151" }}>Doubles, Outdoor, Crystal</p></div>
                    </div>
                    <div className="d-flex mb-4 align-items-center gap-3 px-2">
                        <i className="bi bi-calendar-check fs-2 text-dark"></i>
                        <div><p className="mb-0" style={{ fontSize: "14px" }}>End registration</p><p className="mb-0" style={{ fontSize: "16px", color: "#374151" }}>{calculateEndRegistrationTime()}</p></div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="col-5 pe-0">
                    <div className="rounded-4 pt-4 px-5 pb-4" style={{ backgroundColor: "#F5F5F566", border: error?.paymentMethod && !selectedPayment ? "1px solid red" : "" }}>
                        <h6 className="mb-4" style={{ fontSize: "20px", fontWeight: 600 }}>
                            Payment Method

                        </h6>
                        <div className="d-flex flex-column gap-3">
                            {[
                                { id: "google", name: "Google Pay", icon: "https://img.icons8.com/color/48/google-pay.png" },
                                { id: "paypal", name: "PayPal", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" },
                                { id: "apple", name: "Apple Pay", icon: "https://img.icons8.com/ios-filled/48/000000/mac-os.png" },
                            ].map(m => (
                                <label key={m.id} className="d-flex justify-content-between align-items-center p-3 bg-white rounded-pill" style={{ boxShadow: "3px 4px 6.3px 0px #0000001F" }}>
                                    <div className="d-flex align-items-center gap-3">
                                        <img src={m.icon} alt={m.name} width={28} />
                                        <span className="fw-medium">{m.name}</span>
                                    </div>
                                    <input type="radio" name="payment" value={m.id} checked={selectedPayment === m.id} onChange={e => setSelectedPayment(e.target.value)} />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="border px-3 ms-2 pb-3 pt-3 mt-3 mb-5 mb-lg-0 border-0" style={{ borderRadius: "10px 30% 10px 10px", background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)" }}>
                        <div className="text-center d-flex justify-content-center align-items-center flex-column mb-3">
                            {logo ? <Avatar src={logo} style={{ height: 112, width: 112, boxShadow: "0px 4px 11.4px 0px #0000002E" }} /> : <Avatar style={{ height: 112, width: 112, fontSize: 30 }}>{clubData?.clubName?.[0]?.toUpperCase() || "C"}</Avatar>}
                            <p className="mt-2 mb-1 text-white" style={{ fontSize: "20px", fontWeight: 600 }}>{clubData?.clubName}</p>
                        </div>
                        <h6 className="border-top p-2 mb-3 text-white ps-0">Booking Summary</h6>
                        <div style={{ maxHeight: 240, overflowY: "auto" }}>
                            {selectedCourts.length > 0 ? selectedCourts.map(court => (
                                <div key={court._id} className="mb-3">
                                    {court.time?.map(slot => {
                                        const f = formatDate(court.date);
                                        return (
                                            <div key={slot._id} className="d-flex justify-content-between align-items-center mb-2 px-2 text-white">
                                                <div>
                                                    <span style={{ fontWeight: 600, fontSize: 16 }}>{f.formattedDate}</span>
                                                    <span className="ps-1" style={{ fontWeight: 600, fontSize: 16 }}>{formatTime(slot.time)}</span>
                                                    <span className="ps-1" style={{ fontWeight: 500, fontSize: 15 }}>{court.courtName}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span style={{ fontWeight: 600 }}>₹ {slot.amount || 1000}</span>
                                                    <MdOutlineDeleteOutline style={{ cursor: "pointer" }} onClick={() => handleDeleteSlot(court._id, slot._id)} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )) : (
                                <div className="text-white">No slot selected <Link className="text-success" to="/create-matches">Add slot</Link></div>
                            )}
                        </div>
                        <div className="border-top pt-2 text-white d-flex justify-content-between align-items-center fw-bold">
                            <p className="d-flex flex-column" style={{ fontSize: 16 }}>
                                Total to pay
                                <span style={{ fontSize: 14 }}>Total Slots {selectedCourts.reduce((t, c) => t + c.time.length, 0)}</span>
                            </p>
                            <p style={{ fontSize: 25 }}>₹ {totalAmount}</p>
                        </div>
                        <div className="d-flex justify-content-center mt-3">
                            {error?.addedPlayers || error?.paymentMethod && (
                                <div
                                    className="text-center mb-3 p-2 rounded"
                                    style={{
                                        backgroundColor: "#ffebee",
                                        color: "#c62828",
                                        border: "1px solid #ffcdd2",
                                        fontWeight: 500,
                                        fontSize: "15px",
                                        width: "100%",
                                        maxWidth: "370px"
                                    }}
                                >
                                    {error?.addedPlayers ? error?.addedPlayers : error?.paymentMethod}
                                </div>
                            )}
                        </div>
                        <div className="d-flex justify-content-center mt-3">
                            <button style={buttonStyle} onClick={handleBooking} disabled={isLoading}>
                                <svg style={svgStyle} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#fff" />
                                        </linearGradient>
                                    </defs>
                                    <path d={`M ${width * 0.76} ${height * 0.15} C ${width * 0.79} ${height * 0.15} ${width * 0.81} ${height * 0.20} ${width * 0.83} ${height * 0.30} C ${width * 0.83} ${height * 0.32} ${width * 0.84} ${height * 0.34} ${width * 0.84} ${height * 0.34} C ${width * 0.85} ${height * 0.34} ${width * 0.86} ${height * 0.32} ${width * 0.86} ${height * 0.30} C ${width * 0.88} ${height * 0.20} ${width * 0.90} ${height * 0.15} ${width * 0.92} ${height * 0.15} C ${width * 0.97} ${height * 0.15} ${width * 0.996} ${height * 0.30} ${width * 0.996} ${height * 0.50} C ${width * 0.996} ${height * 0.70} ${width * 0.97} ${height * 0.85} ${width * 0.92} ${height * 0.85} C ${width * 0.90} ${height * 0.85} ${width * 0.88} ${height * 0.80} ${width * 0.86} ${height * 0.70} C ${width * 0.86} ${height * 0.68} ${width * 0.85} ${height * 0.66} ${width * 0.84} ${height * 0.66} C ${width * 0.84} ${height * 0.66} ${width * 0.83} ${height * 0.68} ${width * 0.83} ${height * 0.70} C ${width * 0.81} ${height * 0.80} ${width * 0.79} ${height * 0.85} ${width * 0.76} ${height * 0.85} L ${width * 0.08} ${height * 0.85} C ${width * 0.04} ${height * 0.85} ${width * 0.004} ${height * 0.70} ${width * 0.004} ${height * 0.50} C ${width * 0.004} ${height * 0.30} ${width * 0.04} ${height * 0.15} ${width * 0.08} ${height * 0.15} L ${width * 0.76} ${height * 0.15} Z`} fill="url(#grad)" />
                                    <circle cx={circleX} cy={circleY} r={circleRadius} fill="#001B76" />
                                    <g stroke="white" strokeWidth={height * 0.03} fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={`M ${circleX - arrowSize * 0.3} ${circleY + arrowSize * 0.4} L ${circleX + arrowSize * 0.4} ${circleY - arrowSize * 0.4}`} />
                                        <path d={`M ${circleX + arrowSize * 0.4} ${circleY - arrowSize * 0.4} L ${circleX - arrowSize * 0.1} ${circleY - arrowSize * 0.4}`} />
                                        <path d={`M ${circleX + arrowSize * 0.4} ${circleY - arrowSize * 0.4} L ${circleX + arrowSize * 0.4} ${circleY + arrowSize * 0.1}`} />
                                    </g>
                                </svg>
                                <div style={contentStyle}>{isLoading ? <ButtonLoading color="#001B76" /> : "Book Now"}</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <NewPlayers activeSlot={activeSlot} setShowAddMeForm={setShowAddMeForm} showAddMeForm={showAddMeForm} setActiveSlot={setActiveSlot} />
        </div>
    );
};

export default OpenmatchPayment;