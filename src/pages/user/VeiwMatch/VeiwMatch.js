import { useEffect, useState } from "react";
import DirectionsIcon from "@mui/icons-material/Directions";
import { Link } from "react-router-dom";
import { player, padal, club } from "../../../assets/files"; // Assuming padal is for padel icon
import { useDispatch, useSelector } from "react-redux";
import { getMatchesUser } from "../../../redux/user/matches/thunk";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { Avatar } from "@mui/material";
import { getUserClub } from "../../../redux/user/club/thunk";
import { MdOutlineDateRange } from "react-icons/md";
import { NewPlayers } from "./NewPlayers";

const ViewMatch = ({ className = "" }) => {
    const [selectedTime, setSelectedTime] = useState("8:00am");
    const [selectedCourts, setSelectedCourts] = useState([]);
    const [selectedDate, setSelectedDate] = useState("22 Jun");
    const [selectedPayment, setSelectedPayment] = useState("");
    const [showAddMeForm, setShowAddMeForm] = useState(false);
    const [activeSlot, setActiveSlot] = useState(null);
    const dispatch = useDispatch();
    const matchesData = useSelector((state) => state.userMatches?.usersData);
    const userLoading = useSelector((state) => state.userMatches?.usersLoading);
    const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0] || []);
    const logo = JSON.parse(localStorage.getItem("logo"));
    const today = new Date();
    const dates = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return {
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            date: date.getDate(),
            month: date.toLocaleDateString("en-US", { month: "short" }),
            fullDate: date.toISOString().split("T")[0],
        };
    });

    const handleCourtSelect = (court) => {
        const newCourt = { ...court, time: selectedTime, date: selectedDate };
        setSelectedCourts((prev) => [...prev, newCourt]);
    };

    const total = selectedCourts.reduce((sum, c) => sum + c.price, 0);

    const handleDelete = (index) => {
        const updatedCourts = [...selectedCourts];
        updatedCourts.splice(index, 1);
        setSelectedCourts(updatedCourts);
    };

    // Mock props for demonstration
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
        color: "white",
        fontWeight: "600",
        fontSize: "16px",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        paddingRight: `${circleRadius * 2}px`,
    };

    const onClick = () => {
        alert("Button clicked! (would navigate to /payment)");
    };

    // Mock court data to match the image
    const mockCourt = {
        name: "Court 1",
        price: 1000,
        date: "22 Jun",
    };

    useEffect(() => {
        dispatch(getMatchesUser())
        dispatch(getUserClub({ search: "" }))
    }, [dispatch])


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
                                22 June | 8:00am – 10:00am
                            </small>
                        </div>
                        <div className="row text-center border-top">
                            <div className="col py-3">
                                <p className="mb-1 text-muted small">Gender</p>
                                <p className="mb-0 fw-semibold">Mixed</p>
                            </div>
                            <div className="col border-start border-end py-3">
                                <p className="mb-1 text-muted small">Level</p>
                                <p className="mb-0 fw-semibold">Open Match</p>
                            </div>
                            <div className="col py-3">
                                <p className="mb-1 text-muted small">Price</p>
                                <p className="mb-0 fw-semibold">₹ 2000</p>
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
                            Court Number
                        </p>
                        <h5 className="mb-0">1</h5>
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
                                    <div className="col-6 d-flex gap-3  justify-content-center">
                                        {(() => {
                                            const players = matchesData?.data?.flatMap((m) => m.players || []) || [];

                                            // पहले 2 Player Team A में
                                            const leftPlayers = players.slice(0, 2);
                                            const leftComponents = [];

                                            leftPlayers.forEach((player, idx) => {
                                                leftComponents.push(
                                                    <div key={`left-${idx}`} className="text-center mx-auto mb-3">
                                                        <div
                                                            className="rounded-circle border d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: 80, height: 80,
                                                                backgroundColor: player.profilePic ? "transparent" : "#1F41BB",
                                                                overflow: "hidden"
                                                            }}
                                                        >
                                                            {player.profilePic ? (
                                                                <img src={player.profilePic} alt="player"
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                            ) : (
                                                                <span style={{ color: "white", fontWeight: "600", fontSize: "24px" }}>
                                                                    {player.userId?.name ? player.userId.name.charAt(0).toUpperCase() : "U"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mb-0 mt-2 fw-semibold">{player.userId?.name.charAt().toUpperCase(1) + player?.userId?.name?.slice(1) || "Unknown"}</p>
                                                        <span className="badge bg-success-subtle text-success">
                                                            {skillLabels[idx]}
                                                        </span>
                                                    </div>
                                                );
                                            });

                                            // अगर player 2 से कम हैं तो "Add Me" दिखाना
                                            while (leftComponents.length < 2) {
                                                leftComponents.push(
                                                    <div key={`left-add-${leftComponents.length}`} className="text-center mx-auto"
                                                        onClick={() => handleAddMeClick("slot-1")}
                                                        style={{ cursor: "pointer" }}>
                                                        <div
                                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                                            style={{ width: 80, height: 80, border: "1px solid #1F41BB" }}
                                                        >
                                                            <span className="fs-3" style={{ color: "#1F41BB" }}>+</span>
                                                        </div>
                                                        <p className="mb-0 mt-2 fw-semibold" style={{ color: "#1F41BB" }}>Add Me</p>
                                                    </div>
                                                );
                                            }

                                            return leftComponents;
                                        })()}
                                    </div>

                                    {/* Team B */}
                                    <div className="col-6 d-flex gap-3 align-items-start justify-content-center border-start">
                                        {(() => {
                                            const players = matchesData?.data?.flatMap((m) => m.players || []) || [];

                                            // 3rd और 4th player Team B में
                                            const rightPlayers = players.slice(2, 4);
                                            const rightComponents = [];

                                            rightPlayers.forEach((player, idx) => {
                                                rightComponents.push(
                                                    <div key={`right-${idx}`} className="text-center mx-auto mb-3">
                                                        <div
                                                            className="rounded-circle border d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: 80, height: 80,
                                                                backgroundColor: player.profilePic ? "transparent" : "#1F41BB",
                                                                overflow: "hidden"
                                                            }}
                                                        >
                                                            {player.profilePic ? (
                                                                <img src={player.profilePic} alt="player"
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                            ) : (
                                                                <span style={{ color: "white", fontWeight: "600", fontSize: "24px" }}>
                                                                    {player.userId?.name ? player.userId.name.charAt(0).toUpperCase() : "U"}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mb-0 mt-2 fw-semibold">{player.userId?.name.charAt().toUpperCase(1) + player?.userId?.name?.slice(1) || "Unknown"}</p>
                                                        <span className="badge bg-success-subtle text-success">
                                                            {skillLabels[idx + 2]}
                                                        </span>
                                                    </div>
                                                );
                                            });

                                            // बचे हुए slots भरना
                                            const remaining = 2 - rightPlayers.length;
                                            if (remaining > 0) {
                                                rightComponents.push(
                                                    <div key="right-add" className="text-center mx-auto"
                                                        onClick={() => handleAddMeClick("slot-1")}
                                                        style={{ cursor: "pointer" }}>
                                                        <div
                                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                                            style={{ width: 80, height: 80, border: "1px solid #1F41BB" }}
                                                        >
                                                            <span className="fs-3" style={{ color: "#1F41BB" }}>+</span>
                                                        </div>
                                                        <p className="mb-0 mt-2 fw-semibold" style={{ color: "#1F41BB" }}>Add Me</p>
                                                    </div>
                                                );
                                            }
                                            if (remaining === 2) {
                                                rightComponents.push(
                                                    <div key="right-gray" className="d-flex flex-column align-items-center justify-content-center mx-auto">
                                                        <div
                                                            className="rounded-circle border d-flex align-items-center justify-content-center"
                                                            style={{ width: 80, height: 80, cursor: "not-allowed" }}
                                                        >
                                                            <span className="fs-3" style={{ color: "gray" }}>+</span>
                                                        </div>
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
                            <img src={club} alt="court" className="rounded" width={150} />
                            <div className="flex-grow-1">
                                <p className=" mb-1" style={{ fontSize: "20px", fontWeight: "500" }}>{clubData?.clubName}</p>
                                <p className="small mb-0" style={{ fontSize: "15px", fontWeight: "400" }}>
                                    {clubData?.clubName}
                                    {clubData?.address || clubData?.city || clubData?.state || clubData?.zipCode ? ', ' : ''}
                                    {[clubData?.address, clubData?.city, clubData?.state, clubData?.zipCode]
                                        .filter(Boolean)
                                        .join(', ')}
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
                                Type of Court (2 courts)
                            </p>
                            <p
                                className=" mb-0"
                                style={{ fontSize: "18px", fontWeight: "500", color: "#374151" }}
                            >
                                Outdoor, crystal, Double
                            </p>
                        </div>
                    </div>

                    <div className="d-flex mb-4 align-items-center gap-3 px-2">
                        <MdOutlineDateRange className="fs-2 text-dark" />
                        <div>
                            <p
                                className="mb-0"
                                style={{ fontSize: "14px", fontWeight: "400" }}
                            >
                                End registration
                            </p>
                            <p
                                className=" mb-0"
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
                            <p className="mt-2 mb-1" style={{ fontSize: "20px", fontWeight: "600" }}>{clubData?.clubName}</p>
                            <p className="small mb-0">
                                {clubData?.clubName}
                                {clubData?.address || clubData?.city || clubData?.state || clubData?.zipCode ? ', ' : ''}
                                {[clubData?.address, clubData?.city, clubData?.state, clubData?.zipCode]
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                        </div>

                        <h6
                            className="border-top p-2 mb-3 ps-0"
                            style={{ fontSize: "20px", fontWeight: "600" }}
                        >
                            Booking summary
                        </h6>
                        <div
                            style={{
                                maxHeight: "240px",
                                overflowY: "auto",
                            }}
                        >
                            {selectedCourts.length === 0 && (
                                <div
                                    className="court-row d-flex justify-content-between align-items-center mb-3 px-2"
                                    onClick={() => handleCourtSelect(mockCourt)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div>
                                        <strong>Sun, 22 Jun</strong> 8:00am (60m) Court 1
                                    </div>
                                    <div>₹ 1000</div>
                                </div>
                            )}
                            {selectedCourts.map((court, index) => (
                                <div
                                    key={index}
                                    className="court-row d-flex justify-content-between align-items-center mb-3 px-2"
                                >
                                    <div>
                                        <strong>Sun, {court.date}</strong> {court.time} (60m) {court.name}
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <button
                                            className="btn btn-sm text-danger delete-btn"
                                            onClick={() => handleDelete(index)}
                                        >
                                            <i className="bi bi-trash-fill"></i>
                                        </button>
                                        <div>₹ {court.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-top pt-2 mt-2 d-flex justify-content-between fw-bold">
                            <span style={{ fontSize: "16px", fontWeight: "600" }}>
                                Total to pay
                            </span>
                            <span className="text-primary">₹ {total || 1000}</span>
                        </div>

                        <div className="d-flex justify-content-center mt-3">
                            <button
                                style={buttonStyle}
                                onClick={onClick}
                                className={className}
                            >
                                <Link to="/payment" style={{ textDecoration: "none" }} className="">
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
                                                <stop offset="50%" stopColor="#1F41BB" />
                                                <stop offset="100%" stopColor="#1F41BB" />
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
                                    <div style={contentStyle}>Book Now</div>
                                </Link>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <NewPlayers activeSlot={activeSlot} setShowAddMeForm={setShowAddMeForm} showAddMeForm={showAddMeForm} setActiveSlot={setActiveSlot}/>
        </div>
    );
};

export default ViewMatch;