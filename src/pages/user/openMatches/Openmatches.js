import React, { useState, useRef } from "react";
import { player } from "../../../assets/files";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { FaChevronDown } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";

const Openmatches = ({ width = 370, height = 70 }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Close on outside click
    const handleClickOutside = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    };

    React.useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [selectedCourts, setSelectedCourts] = useState([]);

    const [selectedDate, setSelectedDate] = useState(null);

    const today = new Date();
    const dates = Array.from({ length: 40 }).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return {
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            date: date.getDate(),
            month: date.toLocaleDateString("en-US", { month: "short" }),
            fullDate: date.toISOString().split("T")[0],
        };
    });


    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === "left" ? -120 : 120,
                behavior: "smooth",
            });
        }
    };
    const toggleTime = (time) => {
        if (selectedTimes.includes(time)) {
            // Remove time
            setSelectedTimes(selectedTimes.filter(t => t !== time));
        } else {
            // Add time
            setSelectedTimes([...selectedTimes, time]);
        }
    };

    const times = [
        "6:00am", "7:00am", "8:00am", "9:00am", "10:00am", "11:00am",
        "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm", "5:00pm",
        "6:00pm", "7:00pm", "8:00pm", "9:00pm", "10:00pm", "11:00pm",
        "12:00am"
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


    const handleCourtSelect = (court) => {
        const newCourt = { ...court, time: selectedTimes, date: selectedDate };
        setSelectedCourts((prev) => [...prev, newCourt]);
    };

    const total = selectedCourts.reduce((sum, c) => sum + c.price, 0);

    const handleDelete = (index) => {
        const updatedCourts = [...selectedCourts];
        updatedCourts.splice(index, 1);
        setSelectedCourts(updatedCourts);
    };



    const buttonStyle = {
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const svgStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
    };

    const contentStyle = {
        position: 'relative',
        zIndex: 2,
        color: 'white',
        fontWeight: '600',
        fontSize: '16px',
        paddingRight: '55px'
    };


    // Calculate proportional values based on width and height
    const circleRadius = height * 0.30; // Smaller radius for equal padding on all sides
    const circleX = width - (height * 0.40); // Adjust horizontal position for equal left/right padding
    const circleY = height * 0.5; // Center vertically

    // Arrow dimensions proportional to circle size
    const arrowSize = circleRadius * 0.6;
    const arrowX = circleX;
    const arrowY = circleY;




    const matchData = [
        {
            level: "Beginner",
            teamInfo: "Team A",
            players: [
                { name: "Player 1", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80" },
                { name: "Player 2", image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=100&q=80" },
                { name: "Player 3", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80" },
            ],
        },
        {
            level: "Intermediate",
            players: [

                { name: "Jane Cooper", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80" },
                { name: "Player 5", image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=100&q=80" },
                { name: "Player 6", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80" },
            ],
        },
        {
            level: "Advance",
            players: [

                { name: "Devon Lane", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80" },
                { name: "Player 8", image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=100&q=80" },
                { name: "Player 9", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80" },
            ],
        },
        {
            level: "Professional",
            players: [


                { name: "Devon Lane", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80" },
                { name: "Player 10", image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=100&q=80" },
                { name: "Player 11", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80" },
            ],
        },
    ];

    const [selectedLevel, setSelectedLevel] = useState("");

    const handleSelect = (level) => {
        setSelectedLevel(level);
    };

    const filteredMatches = selectedLevel
        ? matchData.filter((match) => match.level === selectedLevel)
        : matchData;

const createMatchesHandle = ()=>{
    
}
    return (
        <>
            {/* Booking UI */}
            <div className="container mt-4 d-flex gap-4 px-4 flex-wrap">
                <div className="row">
                    {/* Left Section */}
                    <div className="col-7 py-5 rounded-3 px-4" style={{ backgroundColor: " #F5F5F566" }}>
                        {/* Date Selector */}
                        <div className="calendar-strip ">
                            <div className="" style={{ fontSize: "20px", fontWeight: "600" }}>Select Date <div
                                className="position-relative d-inline-block"
                                ref={wrapperRef}
                            >
                                {/* Icon Button */}
                                <span
                                    className="rounded-circle p-2 ms-2 shadow-sm bg-light"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    <i className="bi bi-calendar2-week" style={{ fontSize: "18px" }}></i>
                                </span>

                                {/* Calendar */}
                                {isOpen && (
                                    <div
                                        className="position-absolute mt-2 z-3 bg-white border rounded shadow h-100"
                                        style={{ top: "100%", left: "0", minWidth: "100%", }}
                                    >
                                        <DatePicker
                                            selected={startDate}
                                            onChange={(date) => {
                                                setStartDate(date);
                                                setIsOpen(false);
                                            }}
                                            inline
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            calendarClassName="custom-calendar w-100 shadow-sm" // 👈 styled class
                                        />
                                    </div>
                                )}
                            </div></div>
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <button className="btn btn-light p-0" onClick={() => scroll("left")}>
                                    <i className="bi bi-chevron-left"></i>
                                </button>

                                <div
                                    ref={scrollRef}
                                    className="d-flex gap-2 w-100 overflow-auto no-scrollbar"
                                    style={{
                                        scrollBehavior: "smooth",
                                        whiteSpace: "nowrap",
                                        maxWidth: "620px", // Enough space for 7 buttons ~88px each
                                    }}
                                >
                                    {dates.map((d, i) => (
                                        <button
                                            key={i}
                                            className={`calendar-day-btn border px-3 py-2 rounded ${selectedDate === d.fullDate ? "text-white" : "bg-light text-dark"}`}
                                            style={{
                                                backgroundColor: selectedDate === d.fullDate ? "#374151" : undefined,
                                                border: "none", minWidth: "85px", border: "none"
                                            }}

                                            onClick={() => setSelectedDate(d.fullDate)}

                                        >
                                            <div className="text-center pb-3">
                                                <div style={{ fontSize: "14px", fontWeight: "400" }}>{d.day}</div>
                                                <div style={{ fontSize: "26px", fontWeight: "500" }}>{d.date}</div>
                                                <div style={{ fontSize: "14px", fontWeight: "400" }}>{d.month}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <button className="btn btn-light p-0" onClick={() => scroll("right")}>
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </div>
                        </div>

                        {/* Time Selector */}
                        <div className="d-flex justify-content-between align-items-center py-2">
                            <p className="mb-0" style={{ fontSize: "20px", fontWeight: 600 }}>
                                Available Slots <span className="fs-6">(60m)</span>
                            </p>
                            <div className="form-switch d-flex align-items-center gap-2 p-0">
                                <input
                                    className="form-check-input fs-5 mb-1"
                                    type="checkbox"
                                    role="switch"
                                    id="flexSwitchCheckDefault"
                                />
                                <label
                                    className="form-check-label mb-0"
                                    htmlFor="flexSwitchCheckDefault"
                                    style={{ whiteSpace: "nowrap" }}
                                >
                                    Show Unavailable Slots
                                </label>
                            </div>
                        </div>


                        <div className="d-flex flex-wrap gap-2 mb-4">
                            {times.map((time, i) => (
                                <button
                                    key={i}
                                    className={`btn border-0 rounded-pill px-4 `}
                                    onClick={() => toggleTime(time)}
                                    style={{
                                        backgroundColor: selectedTimes.includes(time) ? "#374151" : "#CBD6FF1A",
                                        color: selectedTimes.includes(time) ? "white" : "#000000",
                                    }}
                                >
                                    {time}
                                </button>

                            ))}
                        </div>
                        {/* Court List */}
                        <div>



                            <div className="container pb-4">
                                {/* Header and Filter */}
                                <div className="d-flex justify-content-start align-items-center gap-3 mb-4">
                                    <h5 className="mb-0" style={{ fontSize: "20px", fontWeight: "600" }}>All Matches</h5>

                                    {/* Dropdown */}
                                    <div className="dropdown">
                                        <button
                                            className="btn btn-light border py-1 px-3 d-flex align-items-center gap-2 "
                                            type="button"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <span className="me-3"> {selectedLevel || "Choose level"}</span>
                                            <FaChevronDown style={{ fontSize: "10px" }} />
                                        </button>
                                        <ul className="dropdown-menu shadow-sm">
                                            {["Beginner", "Intermediate", "Advance", "Professional"].map((level) => (
                                                <li key={level}>
                                                    <button className="dropdown-item" onClick={() => handleSelect(level)}>
                                                        {level}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Match Cards */}
                                {filteredMatches.map((match, index) => (
                                    <div key={index} className="card border-0 shadow-sm mb-3 rounded-2" style={{ backgroundColor: "#CBD6FF1A" }}>
                                        <div className="card-body px-4 py-3 d-flex justify-content-between  flex-wrap">
                                            {/* Left: Info */}
                                            <div>
                                                <div  >
                                                    <p className="mb-1" style={{ fontSize: "18px", fontWeight: "600" }}>
                                                        22 June | 9:00am{" "}
                                                        <span className="fw-normal text-muted ms-3">{match.level}</span>
                                                    </p>
                                                    <p className="mb-1" style={{ fontSize: "15px", fontWeight: "500" }}>The Good Club</p>
                                                    <p className="mb-0 text-muted" style={{ fontSize: "12px", fontWeight: "400" }}>
                                                        <FaMapMarkerAlt className="me-2" />
                                                        Chandigarh 160001
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right: Players & Actions */}
                                            <div className="gap-4 d-flex flex-wrap justify-content-end mt-3 mt-md-0">
                                                {/* Team Info */}
                                                <div className="text-end">


                                                    {/* Avatars */}
                                                    <div className="d-flex align-items-center justify-content-end">
                                                        {match.teamInfo && (
                                                            <div className="text-end">
                                                                <div className="d-flex align-items-center rounded-pill pe-3 " style={{
                                                                    backgroundColor: "#fff",

                                                                    // marginRight:"-15px",
                                                                    borderRadius: "999px",
                                                                    zIndex: 999
                                                                }}>
                                                                    {/* Circle + Icon */}
                                                                    <div
                                                                        className="d-flex justify-content-center align-items-center rounded-circle"
                                                                        style={{
                                                                            width: "40px",
                                                                            height: "40px",
                                                                            border: "1px solid #1D4ED8",
                                                                            color: "#1D4ED8",
                                                                            fontSize: "24px",
                                                                            fontWeight: "400",
                                                                            marginRight: "10px",

                                                                        }}
                                                                    >
                                                                        <span className="">+</span>
                                                                    </div>

                                                                    {/* Text Content */}
                                                                    <div className="d-flex flex-column align-items-center">
                                                                        <span style={{ fontWeight: 600, color: "#1D4ED8", fontSize: "10px" }}>
                                                                            Available
                                                                        </span>
                                                                        <small style={{ fontSize: "8px", color: "#6B7280" /* gray-500 */ }}>
                                                                            {match.teamInfo}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {match.players.map((player, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={player.image}
                                                                alt={player.name}
                                                                className="rounded-circle border border-white"
                                                                style={{
                                                                    width: "40px",
                                                                    height: "40px",
                                                                    marginLeft: idx !== 0 ? "-10px" : "0",
                                                                    zIndex: match.players.length - idx,
                                                                }}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Price */}
                                                    <div className=" text-primary text-end mb-3" style={{ fontSize: "20px", fontWeight: "500" }}>₹ 2000</div>

                                                    {/* View Button */}
                                                    <button className="btn rounded-pill px-4 text-white  py-0 px-1" style={{ backgroundColor: "#3DBE64", fontSize: "12px", fontWeight: "500" }}> <Link to="/veiw-match" style={{ textDecoration: 'none' }} className="text-white">View</Link></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Booking Summary */}
                    <div className="col-5" >

                        <div className="container ms-2">
                            <div
                                className="row align-items-center text-white rounded-4 py-0 pt-2 ps-4"
                                style={{
                                    background: "linear-gradient(to right, #101826, #1e293b)",
                                    overflow: "visible", // allow overflow for image
                                    position: "relative",
                                }}
                            >
                                {/* Left content */}
                                <div className="col-md-6 mb-4 mb-md-0">
                                   
                                    <h4 className="fw-bold">Let the Battles Begin!</h4>
                                    <p className="text-light">Great for competitive vibes.</p>
                                     <button className="btn create-match-btn text-white rounded-pill mb-3 ps-3 pe-3" onClick={()=>createMatchesHandle()}
                                     style={{backgroundColor:"#3DBE64",fontSize:"14px",fontWeight:"500"}}
                                     >
                                         Create Open Matches
                                    </button>
                                </div>

                                {/* Right image */}
                                <div className="col-md-6 text-center" style={{ position: "relative" }}>
                                    <img
                                        src={player}
                                        alt="Player"
                                        className="img-fluid"
                                        style={{
                                            maxHeight: "390px",
                                            marginTop: "-20px", // shift image upward
                                            zIndex: 999,
                                            position: "relative",
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="px-4 py-5 row rounded-4  mt-4 h-100" style={{ backgroundColor: " #F5F5F566" }}>
                                <div className='col-5 text-center d-flex align-items-center justify-contant-center'>
                                    <div className='w-100'>
                                        <h4 className="" style={{ fontSize: "16px", fontWeight: "500" }}>Overall Rating</h4>
                                        <div className="display-4 fw-bold">4.0</div>
                                        <div className="text-success">

                                            {[...Array(4)].map((_, i) => (
                                                <StarIcon key={i} style={{ color: '#32B768' }} />
                                            ))}
                                            <StarBorderIcon style={{ color: '#ccc' }} />
                                        </div>
                                        <div className="text-muted mt-2">based on 40 reviews</div>
                                    </div>
                                </div>

                                <div className=" col-7 px-4 border-start d-flex align-items-center">
                                    <div className='w-100'>
                                        {["Excellent", "Good", "Average", "Below Average", "Poor"].map(
                                            (label, idx) => (
                                                <div className="d-flex align-items-center mb-1 w-100" key={idx}>
                                                    <div className="me-2" style={{ width: "100px" }}>
                                                        {label}
                                                    </div>
                                                    <div className="progress w-100" style={{ height: "8px" }}>
                                                        <div
                                                            className={`progress-bar bg-${idx === 0
                                                                ? "success"
                                                                : idx === 1
                                                                    ? "info"
                                                                    : idx === 2
                                                                        ? "warning"
                                                                        : idx === 3
                                                                            ? "danger"
                                                                            : "dark"
                                                                }`}
                                                            style={{ width: `${100 - idx * 15}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};

export default Openmatches;
