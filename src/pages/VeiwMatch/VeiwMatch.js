import React, { useState } from "react";
import padal from '../../assets/padalsports.png';
import logo from '../../assets/logo.png'
import { FaShoppingCart } from "react-icons/fa";
import player from '../../assets/player.png'
import club from '../../assets/club.png'
import DirectionsIcon from '@mui/icons-material/Directions';
import { Link } from "react-router-dom";






const VeiwMatch = ({
   
    className = ""
}) => {
    const [selectedTime, setSelectedTime] = useState("09:00am");
    const [selectedCourts, setSelectedCourts] = useState([]);

    const [selectedDate, setSelectedDate] = useState(null);

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
  // Calculate the center of the curved end section more precisely
  const curvedSectionStart = width * 0.76; // Where the curve starts
  const curvedSectionEnd = width * 0.996; // Where the curve ends
  const circleX = curvedSectionStart + (curvedSectionEnd - curvedSectionStart) * 0.68 + 1; // Added 1 pixel to the right
  const circleY = height * 0.5;
  const arrowSize = circleRadius * 0.6;
  const arrowX = circleX;
  const arrowY = circleY;
  
  const buttonStyle = {
    position: 'relative',
    width: `${width}px`,
    height: `${height}px`,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    overflow: 'visible',
  };

  const svgStyle = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2,
    color: 'white',
    fontWeight: '600',
    fontSize: `16px`,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingRight: `${circleRadius * 2}px`,
  };

  const onClick = () => {
    console.log('Button clicked!');
    alert('Button clicked! (would navigate to /payment)');
  };

    return (
        <>
            {/* Booking UI */}
            <div className="container mt-4 d-flex gap-4 px-4 flex-wrap">
                <div className="row w-100">
                    {/* Left Section */}
                    <div className="col-7 py-3 rounded-3 px-4" style={{ backgroundColor: " #F5F5F566" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className=" mb-0" style={{ fontSize: "20px", fontWeight: "600" }}>Details</h5>

                            <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border shadow-sm" style={{ width: 36, height: 36 }}>
                                    <i className="bi bi-share"></i>
                                </button>
                                <button className="btn  rounded-circle p-2 d-flex align-items-center justify-content-center text-white" style={{ width: 36, height: 36, backgroundColor: "#1F41BB" }}>
                                    <i className="bi bi-chat-left-text"></i>
                                </button>
                            </div>
                        </div>

                        {/* Game Info Row */}
                        {/* Header Section */}
                        <div className=" rounded-4 border px-3 py-2 mb-3" style={{ backgroundColor: " #CBD6FF1A" }}>
                            <div className="d-flex justify-content-between align-items-start  py-3">
                                <div className="d-flex align-items-center gap-2">
                                    <img src={padal} alt="padel" width={24} />
                                    <span className=" ms-2" style={{ fontSize: "18px", fontWeight: "600" }}>PADEL</span>
                                </div>
                                <small className="text-muted" style={{ fontWeight: "500" }}>21 June | 9:00am – 10:00am</small>
                            </div>

                            {/* Details Row */}
                            <div className="row text-center  border-top">
                                <div className="col py-3">
                                    <p className="mb-1 text-muted small">Gender</p>
                                    <p className="mb-0 fw-semibold">All players</p>
                                </div>
                                <div className="col border-start border-end py-3">
                                    <p className="mb-1 text-muted small">Level</p>
                                    <p className="mb-0 fw-semibold">0.92–0.132</p>
                                </div>
                                <div className="col py-3">
                                    <p className="mb-1 text-muted small">Price</p>
                                    <p className="mb-0 fw-semibold">₹ 2000</p>
                                </div>
                            </div>
                        </div>


                        {/* Court Number */}
                        <div className="d-flex justify-content-between  rounded-3 p-3 mb-3 border" style={{ backgroundColor: " #CBD6FF1A" }}>
                            <p className="text-muted mb-1" style={{ fontSize: "15px", fontWeight: "500" }}>Court Number</p>
                            <h5 className="mb-0">1</h5>
                        </div>

                        {/* Players Section */}
                        <div className=" p-3 rounded-3 mb-3 border" style={{ backgroundColor: " #CBD6FF1A" }}>
                            <h6 className=" mb-3" style={{ fontSize: "18px", fontWeight: "600" }}>Players</h6>
                            <div className="d-flex justify-content-between align-items-start">
                                {/* Team A */}
                                <div className="col-6 d-flex gap-3 align-items-center justify-content-center">
                                    {/* Player 1 */}
                                    <div className="text-center mx-auto">
                                        <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80" className="rounded-circle border" style={{ width: 80, height: 80 }} alt="Courtney" />
                                        <p className="mb-0 mt-2 fw-semibold">Courtney Henry</p>
                                        <span className="badge bg-success-subtle text-success">A/B</span>
                                    </div>

                                    {/* Player 2 */}
                                    <div className="d-flex flex-column align-items-center justify-content-center mx-auto">
                                        <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                                            <span>DL</span>
                                        </div>
                                        <p className="mb-0 mt-2 fw-semibold">Devon Lane</p>
                                        <span className="badge bg-success-subtle text-success ">B/C</span>
                                    </div>

                                </div>

                                {/* Add Me and Empty Slot */}
                                <div className="col-6 d-flex gap-3 align-items-start justify-content-center border-start">
                                    <div className="text-center mx-auto ">
                                        <div className="rounded-circle  d-flex align-items-center justify-content-center" style={{ width: 80, height: 80, border: "1px solid #1F41BB", cursor: "pointer" }}>
                                            <span className="fs-3 " style={{ color: "#1F41BB" }}>+</span>
                                        </div>
                                        <p className="mb-0 mt-2 fw-semibold " style={{ color: "#1F41BB" }}>Add Me</p>
                                    </div>

                                    <div className="d-flex flex-column align-items-center justify-content-center mx-auto" >
                                        <div className="rounded-circle border d-flex align-items-center justify-content-center" style={{ width: 80, height: 80, cursor: "pointer" }}>
                                            <span className="fs-3 " style={{ color: "gray" }}>+</span>
                                        </div>


                                    </div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between mt-3  " >
                                <p className="text-muted mb-1" style={{ fontSize: "14px", fontWeight: "500" }}>Team A</p>
                                <p className="mb-0" style={{ fontSize: "14px", fontWeight: "500" }}>Team B</p>
                            </div>
                        </div>

                        {/* Club Info */}
                        <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: "#CBD6FF1A" }}>
                            <div className="d-flex gap-3 align-items-start">
                                <img src={club} alt="court" className="rounded" width={150} />

                                <div className="flex-grow-1">
                                    <p className="mb-1" style={{ fontSize: "20px", fontWeight: "500" }}>The Good Club</p>
                                    <p className="text-muted mb-1" style={{ fontSize: "15px", fontWeight: "400" }}>
                                        Sukhna Enclave, behind Rock Garden, Kaimbwala,<br />
                                        Kansal, Chandigarh 160001
                                    </p>
                                    <div className="mb-3" style={{ color: "#3DBE64", fontSize: "12px" }}>Opened</div>
                                    <a href="#" style={{ color: "#1F41BB", fontSize: "15px", fontWeight: "500" }}>More Info</a>
                                </div>

                                <div className="ms-auto">
                                    <DirectionsIcon style={{ color: '#22C55E', fontSize: 36, cursor: "pointer" }} />
                                </div>
                            </div>
                        </div>

                        {/* Court Type Info */}
                        <div> <h6 className="mb-3 mt-4" style={{ fontSize: "18px", fontWeight: "600" }}>Information</h6></div>
                        <div className="d-flex align-items-center gap-3 px-2">
                            <i className="bi bi-layout-text-window-reverse fs-2 text-dark"></i>
                            <div>
                                <p className="mb-0 " style={{ fontSize: "14px", fontWeight: "400" }}>Type of Court (2 courts)</p>
                                <p className="text-muted mb-0" style={{ fontSize: "18px", fontWeight: "500" }}>Outdoor, crystal, Double</p>
                            </div>
                        </div>
                    </div>


                    {/* Right Section - Booking Summary */}
                    <div className="col-5  pe-0" >
                        <div className="row align-items-center text-white rounded-4 py-0 pt-2 ps-4 ms-1 mb-3"
                            style={{
                                background: "linear-gradient(to right, #101826, #1e293b)",
                                overflow: "visible", // allow overflow for image
                                position: "relative",
                            }}
                        >
                            {/* Left content */}
                            <div className="col-md-6 mb-4 mb-md-0">
                                <button className="btn btn-outline-light rounded-pill mb-3 px-4">
                                    Open Matches
                                </button>
                                <h2 className="fw-bold">Let the Battlesiujhgfhhjk Begin!</h2>
                                <p className="text-light">Great for competitive vibes.</p>
                            </div>

                            {/* Right image */}
                            <div className="col-md-6 text-center" style={{ position: "relative" }}>
                                <img
                                    src={player}
                                    alt="Player"
                                    className="img-fluid"
                                    style={{
                                        maxHeight: "340px",
                                        marginTop: "-50px", // shift image upward
                                        zIndex: 1,
                                        position: "relative",
                                    }}
                                />
                            </div>
                        </div>
                        <div className="border rounded px-3 ms-2 py-5  border-0 " style={{ backgroundColor: " #CBD6FF1A" }}>
                            <div className="text-center mb-3">
                                <div className="rounded-circle bg-white mx-auto mb-2 shadow " style={{ width: "90px", height: "90px", lineHeight: '90px' }}>
                                    <img src={logo} width={80} alt="" />
                                </div>
                                <p className=" mt-4 mb-1" style={{ fontSize: "20px", fontWeight: "600" }}>The Good Club</p>
                                <p className="small mb-0">The Good Club, Chandigarh, Chandigarh, 160001</p>
                            </div>

                            <h6 className=" border-top  p-2 mb-3 ps-0" style={{ fontSize: "20px", fontWeight: "600" }}>Booking summary</h6>
                            <div
                                style={{
                                    maxHeight: "240px", // ~4 rows x 60px each
                                    overflowY: "auto",
                                }}
                            >
                                {selectedCourts.map((court, index) => (
                                    <div key={index} className="court-row d-flex justify-content-between align-items-center mb-3 px-2">
                                        <div>
                                            <strong>Sun, {court.date} </strong> {court.time} (60m) {court.name}
                                        </div>

                                        <div className="d-flex align-items-center gap-2">
                                            <button
                                                className="btn btn-sm text-danger delete-btn "
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
                                <span style={{ fontSize: "16px", fontWeight: "600" }}>Total to pay</span>
                                <span className="text-primary">₹ {total}</span>
                            </div>


                            <div className="d-flex justify-content-center mt-3">
                                <button
                                    style={buttonStyle}
                                    onClick={onClick}
                                    className={className}
                                >
                                    <Link to="/payment" style={{ textDecoration: 'none' }} className="">
                                    <svg
                                        style={svgStyle}
                                        viewBox={`0 0 ${width} ${height}`}
                                        preserveAspectRatio="none"
                                    >
                                        <defs>
                                            <linearGradient id={`buttonGradient-${width}-${height}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#3DBE64" />
                                                <stop offset="50%" stopColor="#1F41BB" />
                                                <stop offset="100%" stopColor="#1F41BB" />
                                            </linearGradient>
                                        </defs>

                                        {/* Main button shape - responsive to dimensions */}
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

                                        {/* Green circle - properly positioned and sized */}
                                        <circle
                                            cx={circleX}
                                            cy={circleY}
                                            r={circleRadius}
                                            fill="#3DBE64"
                                        />

                                        {/* Arrow icon - scaled proportionally */}
                                        <g stroke="white" strokeWidth={height * 0.03} fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4}`} />
                                            <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4}`} />
                                            <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1}`} />
                                        </g>
                                    </svg>

                                    <div style={contentStyle}>
                                        Book Now
                                    </div>
                                    </Link>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};

export default VeiwMatch;
