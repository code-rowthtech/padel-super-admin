import React, { useState } from "react";
import { logo, google } from '../../assets/files'
import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";




const payment = ({ className = "" }) => {
    // const [selectedTime, setSelectedTime] = useState("09:00am");
    // const [selectedCourts, setSelectedCourts] = useState([]);

    // const [selectedDate, setSelectedDate] = useState(null);

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
    const times = [
        "8:00am", "9:00am", "10:00am", "11:00am", "12:00am",
        "1:00pm", "2:00pm", "3:00pm", "4:00pm", "5:00pm",
        "6:00pm", "7:00pm", "8:00pm", "9:00pm", "10:00pm", "11:00pm"
    ];

    const courts = [
        {
            id: 1,
            name: "Court 1",
            type: "Outdoor | wall | Double",
            price: 1000,
            image: "https://images.unsplash.com/photo-1583454110551-d9f43f24d2bf?auto=format&fit=crop&w=100&q=80", // Badminton
        },
        {
            id: 2,
            name: "Court 2",
            type: "Outdoor | wall | Double",
            price: 1000,
            image: "https://images.unsplash.com/photo-1583454154908-59a9c43fa7c2?auto=format&fit=crop&w=100&q=80", // Tennis
        },
        {
            id: 3,
            name: "Court 3",
            type: "Outdoor | wall | Double",
            price: 1000,
            image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=100&q=80", // Basketball
        },
        {
            id: 4,
            name: "Court 4",
            type: "Outdoor | wall | Double",
            price: 1000,
            image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80", // Volleyball
        },
    ];


    // const handleCourtSelect = (court) => {
    //     const newCourt = { ...court, time: selectedTime, date: selectedDate };
    //     setSelectedCourts((prev) => [...prev, newCourt]);
    // };

    // const total = selectedCourts.reduce((sum, c) => sum + c.price, 0);

    // const handleDelete = (index) => {
    //     const updatedCourts = [...selectedCourts];
    //     updatedCourts.splice(index, 1);
    //     setSelectedCourts(updatedCourts);
    // };


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

    // Mock Link component since we don't have react-router-dom
    //   const Link = ({ to, children, style, className }) => (
    //     <div style={style} className={className}>
    //       {children}
    //     </div>
    //   );


    return (
        <>





            {/* Booking UI */}
            <div className="container mt-4 d-flex gap-4 px-4 flex-wrap">
                <div className="row w-100">
                    <div className="col-7">
                        <div className="bg-white  rounded ">
                            {/* Info Section */}
                            <div className=" rounded-4 py-4 px-5 mb-4" style={{ backgroundColor: " #F5F5F566" }}>
                                <h6 className="mb-3" style={{ fontSize: "20px", fontWeight: "600" }}>Information</h6>
                                <div className="row ">
                                    <div className="col-md-4 mb-3 p-1">
                                        <label className="form-label">Name *</label>
                                        <input type="text" className="form-control border-0 p-2" placeholder="Enter your name" />
                                    </div>
                                    <div className="col-md-4 mb-3 p-1">
                                        <label className="form-label">Phone No *</label>
                                        <div className="input-group">
                                            <span className="input-group-text border-0 p-2">
                                                <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} />
                                            </span>
                                            <input type="text" className="form-control border-0 p-2" placeholder="91+" />
                                        </div>
                                    </div>
                                    <div className="col-md-4 mb-3 p-1">
                                        <label className="form-label">Email *</label>
                                        <input type="email" className="form-control border-0 p-2" placeholder="Enter your email" />
                                    </div>
                                </div>
                            </div>
                            <div className=" rounded-4 py-4 px-5" style={{ backgroundColor: " #F5F5F566" }}>

                                {/* Payment Method Section */}
                                <h6 className=" mb-4" style={{ fontSize: "20px", fontWeight: "600" }}>Payment Method</h6>
                                <div className="d-flex flex-column gap-3">
                                    {[
                                        { id: "google", name: "Google Pay", icon: google },
                                        { id: "paypal", name: "PayPal", icon: "https://img.icons8.com/color/48/paypal.png" },
                                        { id: "apple", name: "ApplePay", icon: "https://img.icons8.com/ios-filled/48/000000/mac-os.png" },
                                    ].map((method) => (
                                        <label key={method.id} className="d-flex justify-content-between align-items-center p-3 bg-white rounded-4  p-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <img src={method.icon} alt={method.name} width={28} />
                                                <span className="fw-medium">{method.name}</span>
                                            </div>
                                            <input type="radio" name="payment" value={method.id} className="form-check-input" />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Booking Summary */}
                    <div className="col-5" >
                        <div className="border rounded px-3 py-5  border-0 " style={{ backgroundColor: " #CBD6FF1A" }}>
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
                                {/* {selectedCourts.map((court, index) => (
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
                                ))} */}
                            </div>




                            <div className="border-top pt-2 mt-2 d-flex justify-content-between fw-bold">
                                <span style={{ fontSize: "16px", fontWeight: "600" }}>Total to pay</span>
                                {/* <span className="text-primary">₹ {total}</span> */}
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

export default payment;
