// src/pages/user/CreateMatches/OpenmatchPayment.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createMatches } from "../../../redux/user/matches/thunk";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { Avatar } from "@mui/material";
import { getUserClub } from "../../../redux/user/club/thunk";
import { createBooking } from "../../../redux/user/booking/thunk";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { MdOutlineDeleteOutline, MdKeyboardDoubleArrowUp, MdKeyboardDoubleArrowDown, MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { loginUserNumber } from "../../../redux/user/auth/authThunk";
import { booking_logo_img } from "../../../assets/files";

const formatTime = (timeStr) =>
    timeStr.replace(" am", ":00 AM").replace(" pm", ":00 PM");

// Button styling variables
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
    padding: 0,
    overflow: "visible",
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
    color: "#001B76",
    fontWeight: "600",
    fontSize: "16px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingRight: `${circleRadius * 2}px`,
    fontFamily: "Poppins",
};

const OpenmatchPayment = () => {
    const [selectedPayment, setSelectedPayment] = useState("");
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // LIVE addedPlayers from localStorage (in case of refresh)
    const [addedPlayers, setAddedPlayers] = useState(() => {
        const saved = localStorage.getItem("addedPlayers");
        return saved ? JSON.parse(saved) : {};
    });

    // Sync with localStorage changes
    useEffect(() => {
        const sync = () => {
            const saved = localStorage.getItem("addedPlayers");
            setAddedPlayers(saved ? JSON.parse(saved) : {});
        };
        sync();
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, []);

    const dispatch = useDispatch();
    const { state } = useLocation();
    const navigate = useNavigate();
    const User = getUserFromSession();
    const userData = useSelector((state) => state?.userAuth?.user?.response);
    const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts?.[0] || {});
    const logo = localStorage.getItem("logo") ? JSON.parse(localStorage.getItem("logo")) : null;

    const updateProfile = JSON.parse(localStorage.getItem("updateprofile") || "{}");

    const [name, setName] = useState(User?.name || updateProfile?.fullName || "");
    const [phoneNumber, setPhoneNumber] = useState(
        User?.phoneNumber ? `+91 ${User.phoneNumber}` : updateProfile?.phone ? `+91 ${updateProfile.phone}` : ""
    );
    const [email, setEmail] = useState(User?.email || updateProfile?.email || "");
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        slotData = {},
        finalSkillDetails = [],
        selectedDate = {},
        selectedCourts = [],
        addedPlayers: stateAddedPlayers = {} // fallback from navigation
    } = state || {};

    // Prefer state.addedPlayers (from navigation), fallback to localStorage
    const finalAddedPlayers = Object.keys(stateAddedPlayers).length > 0 ? stateAddedPlayers : addedPlayers;

    const savedClubId = localStorage.getItem("register_club_id");
    const owner_id = localStorage.getItem("owner_id");

    // Build teams
    const teamA = [User?._id, finalAddedPlayers.slot2?._id].filter(Boolean);
    const teamB = [finalAddedPlayers.slot3?._id, finalAddedPlayers.slot4?._id].filter(Boolean);

    console.log('User ID:', User?._id);
    console.log('Added Players:', finalAddedPlayers);
    console.log('Team A IDs:', teamA);
    console.log('Team B IDs:', teamB);

    useEffect(() => {
        dispatch(getUserClub({ search: "" }));
    }, [dispatch]);

    const handleBooking = async () => {
        setError({});

        if (!selectedPayment) return setError({ paymentMethod: "Select a payment method." });
        if (!name?.trim()) return setError({ name: "Name is required." });
        if (!email?.trim()) return setError({ email: "Email is required." });
        if (!/^\S+@\S+\.\S+$/.test(email)) return setError({ email: "Invalid email." });

        const cleanPhone = phoneNumber?.replace(/^\+91\s*/, "").trim();
        if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone))
            return setError({ phoneNumber: "Valid 10-digit phone required." });

        if (!selectedCourts?.length || selectedCourts.some(c => !c.time?.length))
            return setError({ general: "Select at least one slot." });


        setIsLoading(true);

        const formattedMatch = {
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

        console.log('Formatted Match Data:', formattedMatch);

        try {
            if (!User?.name || !User?.phoneNumber || !User?.email) {
                const loginRes = await dispatch(
                    loginUserNumber({ phoneNumber: cleanPhone, name, email })
                ).unwrap();
                if (loginRes?.status !== "200") throw new Error("Login failed.");
                sessionStorage.setItem("user", JSON.stringify(loginRes.response));
            }

            const matchRes = await dispatch(createMatches(formattedMatch)).unwrap();
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
                slot: selectedCourts.flatMap(court =>
                    court.time.map(timeSlot => ({
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

            // Only clear localStorage after both APIs succeed
            localStorage.removeItem("addedPlayers");
            window.dispatchEvent(new Event("playersUpdated")); // Notify other components
            navigate("/open-matches");
        } catch (err) {
            setError({ booking: err.message || "Booking failed." });
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return { day: "Sun", formattedDate: "27 Aug" };
        const date = new Date(dateStr);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });
        const formattedDate = `${date.getDate()} ${date.toLocaleDateString("en-US", { month: "short" })}`;
        return { day, formattedDate };
    };

    const totalAmount = selectedCourts.reduce((sum, c) => sum + c.time.reduce((s, t) => s + Number(t.amount || 1000), 0), 0);
    const totalPlayers = 1 + Object.keys(finalAddedPlayers).length;

    // Local state for mobile summary
    const localSelectedCourts = selectedCourts || [];
    const localTotalSlots = localSelectedCourts.reduce((sum, c) => sum + (c.time?.length || 0), 0);
    const localGrandTotal = localSelectedCourts.reduce((sum, c) => sum + c.time.reduce((s, t) => s + Number(t.amount || 0), 0), 0);

    const handleDeleteSlot = (courtId, slotId) => {
        const updated = selectedCourts
            .map(c => c._id === courtId ? { ...c, time: c.time.filter(s => s._id !== slotId) } : c)
            .filter(c => c.time.length > 0);
        navigate("/match-payment", { state: { ...state, selectedCourts: updated } });
    };

    useEffect(() => {
        if (Object.keys(error).length > 0) {
            const t = setTimeout(() => setError({}), 4000);
            return () => clearTimeout(t);
        }
    }, [error]);

    return (
        <div className="container mt-md-4 mt-0 mb-md-5 mb-0 d-flex gap-4 px-md-4 px-0 flex-wrap">
            <div className="row  mx-auto">
                {/* Left: Contact + Payment */}
                <div className="col-lg-7 col-12 py-md-3 pt-0 pb-3 rounded-3 mobile-payment-content" style={{ paddingBottom: localSelectedCourts.length > 0 ? "120px" : "20px" }}>
                    {/* Contact Info */}
                    <div
                        className="rounded-4 py-md-4 py-3 px-3 mb-4"
                        style={{ backgroundColor: "#F5F5F566", border: error.name || error.email || error.phoneNumber ? "1px solid red" : "" }}
                    >
                        <h6 className="mb-md-3 mb-1 small_font_mobile" style={{ fontSize: 20, fontWeight: 600 }}>Contact Info</h6>
                        <div className="row mx-auto">
                            <div className="col-12 col-md-4 mb-md-3 mb-0 p-1">
                                <label className="form-label mb-0 ps-lg-2" style={{ fontSize: 12, fontWeight: 500 }}>
                                    Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (!v || /^[A-Za-z\s]*$/.test(v)) {
                                            setName(v.trimStart().replace(/\s+/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
                                        }
                                    }}
                                    className="form-control border-0 p-2"
                                    placeholder="Enter your name"
                                />
                                {error.name && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{error.name}</div>}
                            </div>

                            <div className="col-12 col-md-4 mb-md-3 mb-0 p-1">
                                <label className="form-label mb-0 ps-lg-1" style={{ fontSize: 12, fontWeight: 500 }}>
                                    Phone Number <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text border-0 p-2" style={{ backgroundColor: "#F5F5F5" }}>
                                        <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} />
                                    </span>
                                    <input
                                        type="text"
                                        maxLength={13}
                                        value={phoneNumber}
                                        disabled={!!User?.phoneNumber}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/[^0-9]/g, "");
                                            if (!v || /^[6-9][0-9]{0,9}$/.test(v)) {
                                                setPhoneNumber(v ? `+91 ${v}` : "");
                                            }
                                        }}
                                        className="form-control border-0 p-2"
                                        placeholder="+91"
                                    />
                                </div>
                                {error.phoneNumber && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{error.phoneNumber}</div>}
                            </div>

                            <div className="col-12 col-md-4 mb-md-3 mb-0 p-1">
                                <label className="form-label mb-0 ps-lg-2" style={{ fontSize: 12, fontWeight: 500 }}>
                                    Email <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
                                    className="form-control border-0 p-2"
                                    placeholder="Enter your email"
                                />
                                {error.email && <div className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>{error.email}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div
                        className="rounded-4 py-3 py-md-4 px-md-3 px-2"
                        style={{ backgroundColor: "#F5F5F566", border: error.paymentMethod ? "1px solid red" : "" }}
                    >
                        <h6 className="mb-md-4 mb-3 small_font_mobile" style={{ fontSize: 20, fontWeight: 600 }}>Payment Method</h6>
                        <div className="d-flex flex-column gap-3">
                            {[
                                { id: "google", name: "Google Pay", icon: "https://img.icons8.com/color/48/google-pay.png" },
                                { id: "paypal", name: "PayPal", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" },
                                { id: "apple", name: "Apple Pay", icon: "https://img.icons8.com/ios-filled/48/000000/mac-os.png" },
                            ].map(m => (
                                <label
                                    key={m.id}
                                    className="d-flex justify-content-between align-items-center py-md-3 py-2 p-3 bg-white rounded-4"
                                    style={{ boxShadow: "3px 4px 6.3px 0px #0000001F" }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <img src={m.icon} alt={m.name} width={28} />
                                        <span className="fw-medium">{m.name}</span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={m.id}
                                        checked={selectedPayment === m.id}
                                        onChange={(e) => setSelectedPayment(e.target.value)}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Summary */}


                <div className="col-lg-5 col-12 ps-lg-4 ps-0 py-lg-4 mt-lg-0 mobile-payment-summary">
                    <div className="border w-100 px-0 py-4 border-0 mobile-payment-summary-container" style={{ height: "62vh", borderRadius: '10px 30% 10px 10px', background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)" }}>
                        {/* Desktop Logo/Address Section */}
                        <div className="d-flex mb-4 position-relative d-none d-lg-flex">
                            <img src={booking_logo_img} className="booking-logo-img" alt="" />
                            <div className="text-center ps-2 pe-1 mt-3">
                                <p className="mt-2 mb-0 text-white" style={{ fontSize: "25px", fontWeight: "600", fontFamily: "Poppins" }}>{clubData?.clubName}</p>
                                <p className=" mb-1 text-white" style={{ fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>{clubData?.address} <br />  {clubData?.zipCode}</p>
                            </div>
                            <div className="position-absolute" style={{ top: "11px", left: "17.5%" }}>
                                {logo ? (
                                    <div
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            boxShadow: "0px 4px 11.4px 0px #0000002E",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "#f9f9f9",
                                        }}
                                    >
                                        <img
                                            src={logo}
                                            alt="Club logo"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                backgroundSize: "contain",
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                            height: "60px",
                                            width: "60px",
                                            backgroundColor: "#374151",
                                            border: "2px solid white",
                                            boxShadow: "0px 4px 11.4px 0px #0000002E",
                                            fontSize: "24px",
                                            fontWeight: "600",
                                            color: "white"
                                        }}
                                    >
                                        {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop Booking Summary */}
                        <div className="d-none d-lg-block">
                            <div className="d-flex border-top px-3 pt-2 justify-content-between align-items-center">
                                <h6 className="p-2 mb-1 ps-0 text-white custom-heading-use">Booking Summary</h6>
                            </div>
                            <div className="px-3">
                                <style jsx>{`
                                     .slots-container::-webkit-scrollbar {
                                       width: 8px;
                                       border-radius : 3px;
                                     }
                                     .slots-container::-webkit-scrollbar-track {
                                       background: #F5F5F5;
                                       border-radius: 3px;
                                     }
                                     .slots-container::-webkit-scrollbar-thumb {
                                       background:  #626262;
                                       
                                     }
                                     .slots-container::-webkit-scrollbar-thumb:hover {
                                       background: #626262;
                                     }
                                   `}</style>
                                <div
                                    className="slots-container"
                                    style={{
                                        maxHeight: localTotalSlots > 4 ? "200px" : "auto",
                                        overflowY: localTotalSlots > 4 ? "auto" : "visible",
                                        overflowX: "hidden",
                                        paddingRight: "8px",
                                    }}
                                >
                                    {localSelectedCourts.length > 0 ? (
                                        localSelectedCourts.map((court, index) =>
                                            court.time.map((timeSlot, timeIndex) => (
                                                <div key={`${index}-${timeIndex}`} className="row mb-2">
                                                    <div className="col-12 d-flex gap-2 mb-0 m-0 align-items-center justify-content-between">
                                                        <div className="d-flex text-white">
                                                            <span style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "16px" }}>
                                                                {court.date ? `${new Date(court.date).toLocaleString("en-US", { day: "2-digit" })}, ${new Date(court.date).toLocaleString("en-US", { month: "short" })}` : ""}
                                                            </span>
                                                            <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "16px" }}>
                                                                {formatTime(timeSlot.time)}
                                                            </span>
                                                            <span className="ps-2" style={{ fontWeight: "500", fontFamily: "Poppins", fontSize: "15px" }}>{court.courtName}</span>
                                                        </div>
                                                        <div className="text-white">
                                                            ₹<span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins" }}>{timeSlot.amount || "N/A"}</span>
                                                            <MdOutlineDeleteOutline className="ms-2 mb-2 text-white" style={{ cursor: "pointer" }} onClick={() => handleDeleteSlot(court._id, timeSlot._id)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    ) : (
                                        <div className="d-flex flex-column justify-content-center align-items-center text-white" style={{ height: "25vh" }}>
                                            <p style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500" }}>No slot selected</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {console.log(localTotalSlots, isExpanded, 'muskannegi')}
                        {/* Mobile Booking Summary - Fixed Bottom */}
                        <div className="d-lg-none mobile-openmatch-payment-summary" style={{
                            position: "fixed",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                            borderRadius: "10px 10px 0 0",
                            padding: "0px 15px",
                        }}>
                            {localSelectedCourts.length > 0 && (
                                <>
                                    {/* Arrow controls - First row */}
                                    {/* <div className="d-flex justify-content-center align-items-center py-2" style={{ borderBottom: isExpanded ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
                                        <div onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: "pointer" }}>
                                            {!isExpanded ? (
                                                <MdKeyboardDoubleArrowUp size={25} style={{ color: "white" }} className="arrow-shake-infinite" />
                                            ) : (
                                                <MdKeyboardDoubleArrowDown size={25} style={{ color: "white" }} className="arrow-shake-infinite" />
                                            )}
                                        </div>
                                    </div> */}

                                    <div
                                        className="small-curve-arrow d-lg-none"
                                        onClick={() => setIsExpanded(!isExpanded)}
                                    >
                                        {!isExpanded ? (
                                            <MdKeyboardArrowUp
                                                size={25}
                                                color="white"
                                                className="arrow-shake-infinite"
                                            />
                                        ) : (
                                            <MdKeyboardArrowDown
                                                size={25}
                                                color="white"
                                                className="arrow-shake-infinite"
                                            />
                                        )}
                                    </div>
                                    <style jsx>{`
    .small-curve-arrow {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 5;
      background: #0b39d7;
      width: 49px;
      height: 27px;
      border-radius: 20px 20px 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 2px;
      cursor: pointer;
    }
  `}</style>

                                    {/* Expandable slots list */}
                                    <div className="mobile-expanded-slots" style={{
                                        maxHeight: isExpanded ? (localTotalSlots > 2 ? "120px" : "auto") : "0px",
                                        overflowY: localTotalSlots > 2 && isExpanded ? "auto" : "hidden",
                                        overflowX: "hidden",
                                        paddingRight: "8px",
                                        transition: "max-height 0.3s ease",
                                        marginBottom: isExpanded ? "10px" : "0",
                                    }}>
                                        <style jsx>{`
                                            .mobile-expanded-slots::-webkit-scrollbar {
                                                width: 8px;
                                                border-radius: 3px;
                                            }
                                            .mobile-expanded-slots::-webkit-scrollbar-track {
                                                background: #f5f5f5;
                                                border-radius: 3px;
                                            }
                                            .mobile-expanded-slots::-webkit-scrollbar-thumb {
                                                background: #626262;
                                                border-radius: 3px;
                                            }
                                            .mobile-expanded-slots::-webkit-scrollbar-thumb:hover {
                                                background: #626262;
                                            }
                                            .mobile-expanded-slots {
                                                scrollbar-width: thin;
                                                scrollbar-color: #626262 #f5f5f5;
                                            }
                                        `}</style>

                                        {localSelectedCourts.map((court, cIdx) =>
                                            court.time.map((timeSlot, sIdx) => (
                                                <div key={`${cIdx}-${sIdx}`} className="row mb-1">
                                                    <div className="col-12 d-flex gap-1 mb-0 m-0 align-items-center justify-content-between">
                                                        <div className="d-flex text-white">
                                                            <span style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "11px" }}>
                                                                {court.date ? `${new Date(court.date).toLocaleString("en-US", { day: "2-digit" })}, ${new Date(court.date).toLocaleString("en-US", { month: "short" })}` : ""}
                                                            </span>
                                                            <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "11px" }}>
                                                                {formatTime(timeSlot.time)}
                                                            </span>
                                                            <span className="ps-1" style={{ fontWeight: "500", fontFamily: "Poppins", fontSize: "10px" }}>
                                                                {court.courtName}
                                                            </span>
                                                        </div>

                                                        <div className="text-white">
                                                            <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "11px" }}>
                                                                ₹ {timeSlot.amount || "N/A"}
                                                            </span>
                                                            <MdOutlineDeleteOutline
                                                                className="ms-1 text-white"
                                                                style={{ cursor: "pointer", fontSize: "14px" }}
                                                                onClick={() => handleDeleteSlot(court._id, timeSlot._id)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Total Section - Second row */}
                                    <div className="py-0 pt-1">
                                        <div className="d-flex justify-content-between align-items-center px-0">
                                            <div>
                                                <span className="text-white" style={{ fontSize: "14px", fontWeight: "500" }}>
                                                    Total to Pay
                                                </span>
                                                <span className="d-block text-white" style={{ fontSize: "12px" }}>
                                                    Total Slots: {localTotalSlots}
                                                </span>
                                            </div>

                                            <span className="text-white" style={{ fontSize: "20px", fontWeight: "600" }}>
                                                ₹{localGrandTotal}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Book Button */}
                                    <div className="d-flex justify-content-center align-items-center px-lg-3">
                                        <button
                                            style={{
                                                ...buttonStyle,
                                                opacity: localTotalSlots === 0 ? 0.5 : 1,
                                                cursor: localTotalSlots === 0 ? "not-allowed" : "pointer",
                                                pointerEvents: localTotalSlots === 0 ? "none" : "auto",
                                            }}
                                            className=""
                                            disabled={localTotalSlots === 0}
                                            onClick={handleBooking}
                                        >
                                            <svg style={svgStyle} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id={`buttonGradient-${width}-${height}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#fff" />
                                                        <stop offset="50%" stopColor="#fff" />
                                                        <stop offset="100%" stopColor="#fff" />
                                                    </linearGradient>
                                                </defs>
                                                <path d={`M ${width * 0.76} ${height * 0.15} C ${width * 0.79} ${height * 0.15} ${width * 0.81} ${height * 0.20} ${width * 0.83} ${height * 0.30} C ${width * 0.83} ${height * 0.32} ${width * 0.84} ${height * 0.34} ${width * 0.84} ${height * 0.34} C ${width * 0.85} ${height * 0.34} ${width * 0.86} ${height * 0.32} ${width * 0.86} ${height * 0.30} C ${width * 0.88} ${height * 0.20} ${width * 0.90} ${height * 0.15} ${width * 0.92} ${height * 0.15} C ${width * 0.97} ${height * 0.15} ${width * 0.996} ${height * 0.30} ${width * 0.996} ${height * 0.50} C ${width * 0.996} ${height * 0.70} ${width * 0.97} ${height * 0.85} ${width * 0.92} ${height * 0.85} C ${width * 0.90} ${height * 0.85} ${width * 0.88} ${height * 0.80} ${width * 0.86} ${height * 0.70} C ${width * 0.86} ${height * 0.68} ${width * 0.85} ${height * 0.66} ${width * 0.84} ${height * 0.66} C ${width * 0.84} ${height * 0.66} ${width * 0.83} ${height * 0.68} ${width * 0.83} ${height * 0.70} C ${width * 0.81} ${height * 0.80} ${width * 0.79} ${height * 0.85} ${width * 0.76} ${height * 0.85} L ${width * 0.08} ${height * 0.85} C ${width * 0.04} ${height * 0.85} ${width * 0.004} ${height * 0.70} ${width * 0.004} ${height * 0.50} C ${width * 0.004} ${height * 0.30} ${width * 0.04} ${height * 0.15} ${width * 0.08} ${height * 0.15} L ${width * 0.76} ${height * 0.15} Z`} fill={`url(#buttonGradient-${width}-${height})`} />
                                                <circle cx={circleX} cy={circleY} r={circleRadius} fill="#001B76" />
                                                <g stroke="white" strokeWidth={height * 0.03} fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4}`} />
                                                    <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4}`} />
                                                    <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1}`} />
                                                </g>
                                            </svg>
                                            <div style={contentStyle}>
                                                {isLoading ? <ButtonLoading color={"#001B76"} /> : "Book Now"}
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        {/* Desktop Total Section */}
                        {localTotalSlots > 0 && (
                            <div className="border-top pt-2 px-3 mt-2 text-white d-flex justify-content-between align-items-center fw-bold mobile-total-section d-none d-lg-flex">
                                <p className="d-flex flex-column mb-0" style={{ fontSize: "16px", fontWeight: "600" }}>
                                    Total to Pay <span style={{ fontSize: "13px", fontWeight: "500" }}>Total slots {localTotalSlots}</span>
                                </p>
                                <p className="mb-0" style={{ fontSize: "25px", fontWeight: "600" }}>₹ {localGrandTotal}</p>
                            </div>
                        )}

                        {/* Desktop Book Button */}
                        <div className="d-flex justify-content-center align-items-center d-none d-lg-flex">
                            <button style={{ ...buttonStyle }} className="" onClick={handleBooking}>
                                <svg style={svgStyle} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id={`buttonGradient-desktop-${width}-${height}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#fff" />
                                            <stop offset="50%" stopColor="#fff" />
                                            <stop offset="100%" stopColor="#fff" />
                                        </linearGradient>
                                    </defs>
                                    <path d={`M ${width * 0.76} ${height * 0.15} C ${width * 0.79} ${height * 0.15} ${width * 0.81} ${height * 0.20} ${width * 0.83} ${height * 0.30} C ${width * 0.83} ${height * 0.32} ${width * 0.84} ${height * 0.34} ${width * 0.84} ${height * 0.34} C ${width * 0.85} ${height * 0.34} ${width * 0.86} ${height * 0.32} ${width * 0.86} ${height * 0.30} C ${width * 0.88} ${height * 0.20} ${width * 0.90} ${height * 0.15} ${width * 0.92} ${height * 0.15} C ${width * 0.97} ${height * 0.15} ${width * 0.996} ${height * 0.30} ${width * 0.996} ${height * 0.50} C ${width * 0.996} ${height * 0.70} ${width * 0.97} ${height * 0.85} ${width * 0.92} ${height * 0.85} C ${width * 0.90} ${height * 0.85} ${width * 0.88} ${height * 0.80} ${width * 0.86} ${height * 0.70} C ${width * 0.86} ${height * 0.68} ${width * 0.85} ${height * 0.66} ${width * 0.84} ${height * 0.66} C ${width * 0.84} ${height * 0.66} ${width * 0.83} ${height * 0.68} ${width * 0.83} ${height * 0.70} C ${width * 0.81} ${height * 0.80} ${width * 0.79} ${height * 0.85} ${width * 0.76} ${height * 0.85} L ${width * 0.08} ${height * 0.85} C ${width * 0.04} ${height * 0.85} ${width * 0.004} ${height * 0.70} ${width * 0.004} ${height * 0.50} C ${width * 0.004} ${height * 0.30} ${width * 0.04} ${height * 0.15} ${width * 0.08} ${height * 0.15} L ${width * 0.76} ${height * 0.15} Z`} fill={`url(#buttonGradient-desktop-${width}-${height})`} />
                                    <circle cx={circleX} cy={circleY} r={circleRadius} fill="#001B76" />
                                    <g stroke="white" strokeWidth={height * 0.03} fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4}`} />
                                        <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4}`} />
                                        <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1}`} />
                                    </g>
                                </svg>
                                <div style={contentStyle}>
                                    {isLoading ? <ButtonLoading color={"#001B76"} /> : "Book Now"}
                                </div>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OpenmatchPayment;