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
import { MdOutlineDeleteOutline } from "react-icons/md";
import { loginUserNumber } from "../../../redux/user/auth/authThunk";

const formatTime = (timeStr) =>
    timeStr.replace(" am", ":00 AM").replace(" pm", ":00 PM");

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
        <div className="container mt-4 mb-5 d-flex gap-4 px-4 flex-wrap">
            <div className="row w-100">
                {/* Left: Contact + Payment */}
                <div className="col-7 py-3 rounded-3">
                    {/* Contact Info */}
                    <div
                        className="rounded-4 py-4 px-3 mb-4"
                        style={{ backgroundColor: "#F5F5F566", border: error.name || error.email || error.phoneNumber ? "1px solid red" : "" }}
                    >
                        <h6 className="mb-3 custom-heading-use">Contact Info</h6>
                        <div className="row">
                            <div className="col-12 col-md-4 mb-3 p-1">
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

                            <div className="col-12 col-md-4 mb-3 p-1">
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

                            <div className="col-12 col-md-4 mb-3 p-1">
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
                        className="rounded-4 pt-4 px-5 pb-4"
                        style={{ backgroundColor: "#F5F5F566", border: error.paymentMethod ? "1px solid red" : "" }}
                    >
                        <h6 className="mb-4" style={{ fontSize: 20, fontWeight: 600 }}>Payment Method</h6>
                        <div className="d-flex flex-column gap-3">
                            {[
                                { id: "google", name: "Google Pay", icon: "https://img.icons8.com/color/48/google-pay.png" },
                                { id: "paypal", name: "PayPal", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" },
                                { id: "apple", name: "Apple Pay", icon: "https://img.icons8.com/ios-filled/48/000000/mac-os.png" },
                            ].map(m => (
                                <label
                                    key={m.id}
                                    className="d-flex justify-content-between align-items-center p-3 bg-white rounded-pill"
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
                <div className="col-5 pe-0">
                    <div
                        className="border px-3 ms-2 pb-3 pt-3 mt-3 mb-5 mb-lg-0 border-0"
                        style={{
                            borderRadius: "10px 30% 10px 10px",
                            background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"
                        }}
                    >
                        <div className="text-center d-flex justify-content-center align-items-center flex-column mb-3">
                            {logo ? (
                                <Avatar src={logo} sx={{ width: 112, height: 112, boxShadow: 3 }} />
                            ) : (
                                <Avatar sx={{ width: 112, height: 112, fontSize: 30 }}>
                                    {clubData?.clubName?.[0]?.toUpperCase() || "C"}
                                </Avatar>
                            )}
                            <p className="mt-2 mb-1 text-white" style={{ fontSize: "20px", fontWeight: "600", fontFamily: "Poppins" }}>{clubData?.clubName}</p>
                        </div>

                        <h6 className="border-top p-2 mb-3 text-white ps-0">Booking Summary</h6>
                        <div style={{ maxHeight: 240, overflowY: "auto" }}>
                            {selectedCourts.length > 0 ? (
                                selectedCourts.map(court =>
                                    court.time?.map(slot => {
                                        const f = formatDate(court.date || selectedDate.fullDate);
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
                                    })
                                )
                            ) : (
                                <div className="text-white">
                                    No slot selected <Link className="text-success" to="/create-matches">Add slot</Link>
                                </div>
                            )}
                        </div>

                        <div className="border-top pt-2 text-white d-flex justify-content-between align-items-center fw-bold">
                            <p className="d-flex flex-column" style={{ fontSize: 16 }}>
                                Total to pay
                                <span style={{ fontSize: 14 }}>
                                    Players: {totalPlayers}/4 | Slots: {selectedCourts.reduce((t, c) => t + c.time.length, 0)}
                                </span>
                            </p>
                            <p style={{ fontSize: 25 }}>₹ {totalAmount}</p>
                        </div>

                        {(error.addedPlayers || error.paymentMethod) && (
                            <div
                                className="text-center mb-3 p-2 rounded"
                                style={{
                                    backgroundColor: "#ffebee",
                                    color: "#c62828",
                                    border: "1px solid #ffcdd2",
                                    fontWeight: 500,
                                    fontSize: 15,
                                    maxWidth: 370,
                                    margin: "0 auto"
                                }}
                            >
                                {error.addedPlayers || error.paymentMethod}
                            </div>
                        )}

                        <div className="d-flex justify-content-center mt-3">
                            <button
                                style={{
                                    position: "relative", width: 370, height: 75, border: "none",
                                    background: "transparent", cursor: isLoading ? "not-allowed" : "pointer",
                                    opacity: isLoading ? 0.7 : 1, pointerEvents: isLoading ? "none" : "auto"
                                }}
                                onClick={handleBooking}
                                disabled={isLoading}
                            >
                                <svg style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 1 }} viewBox="0 0 370 75" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#fff" />
                                            <stop offset="100%" stopColor="#fff" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={`M 281 11.25 C 292 11.25 300 15 306 22.5 C 306 24 307 25.5 307 25.5 C 308 25.5 309 24 309 22.5 C 314 15 322 11.25 333 11.25 C 355 11.25 368 22.5 368 37.5 C 368 52.5 355 63.75 333 63.75 C 322 63.75 314 60 309 52.5 C 309 51 308 49.5 307 49.5 C 307 49.5 306 51 306 52.5 C 300 60 292 63.75 281 63.75 L 30 63.75 C 15 63.75 1.5 52.5 1.5 37.5 C 1.5 22.5 15 11.25 30 11.25 L 281 11.25 Z`}
                                        fill="url(#grad)"
                                    />
                                    <circle cx="340" cy="37.5" r="22.5" fill="#001B76" />
                                    <g stroke="white" strokeWidth="2.25" fill="none" strokeLinecap="round">
                                        <path d="M 330 45 L 345 35" />
                                        <path d="M 345 35 L 330 35" />
                                        <path d="M 345 35 L 345 40" />
                                    </g>
                                </svg>
                                <div
                                    style={{
                                        position: "relative", zIndex: 2, color: "#001B76", fontWeight: 600,
                                        fontSize: 16, textAlign: "center", display: "flex", alignItems: "center",
                                        justifyContent: "center", height: "100%", paddingRight: 45
                                    }}
                                >
                                    {isLoading ? <ButtonLoading color="#001B76" /> : "Book Now"}
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