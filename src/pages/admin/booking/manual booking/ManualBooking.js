import React, { useRef,useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import DatePicker from 'react-datepicker';
import { FaShoppingCart } from 'react-icons/fa';

const ManualBooking = () => {
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
            image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=100&q=80", // Badminton
        },
        {
            id: 2,
            name: "Court 2",
            type: "Outdoor | wall | Double",
            price: 1000,
            image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=100&q=80", // Tennis
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
            <Container className='bg-white' fluid>
                <Row>
                    <Col md={8} className="pt-3 rounded-3 px-4" >
                    <h5 className='manual-heading'>Manual Booking</h5>
                        {/* Date Selector */}
                        <div className="calendar-strip ">
                            <div className="tabel-title" >Select Date <div
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
                            <p className="mb-0 tabel-title" >
                                Available Slots <span className="fs-6">(60m)</span>
                            </p>
                            <div className="form-switch d-flex align-items-center gap-2 p-0">
                                <input
                                    className="form-check-input fs-5 mb-1"
                                    type="checkbox"
                                    role="switch"
                                    id="flexSwitchCheckDefault"
                                    style={{boxShadow:"none"}}
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
                    </Col>
                    <Col md={4} >
                        <div>

                            <div className="d-flex justify-content-between align-items-center pt-3">
                                <p className="mb-0 tabel-title" >
                                    Available Court
                                </p>
                                <div>
                                   
                                    <div
                                        className="modal fade"
                                        id="courtLayoutModal"
                                        tabIndex="-1"
                                        aria-labelledby="courtLayoutModalLabel"
                                        aria-hidden="true"
                                    >
                                        <div className="modal-dialog modal-dialog-centered">
                                            <div className="modal-content rounded-4 p-3">
                                                <div className="modal-header border-0 p-0">
                                                    <div className="w-100 d-flex align-items-center justify-content-center position-relative">
                                                        <h5 className="tabel-title m-0" id="courtLayoutModalLabel">View Court Layout</h5>
                                                        <button
                                                            type="button"
                                                            className="btn-close position-absolute end-0 me-2"
                                                            data-bs-dismiss="modal"
                                                            aria-label="Close"
                                                        ></button>
                                                    </div>
                                                </div>

                                                <div className="modal-body p-0 mt-4">
                                                    <div className="row g-2">
                                                        {[1, 2, 3, 4].map((num) => (
                                                            <div className="col-6" key={num}>
                                                                <div
                                                                    className="border rounded-3 d-flex align-items-center justify-content-center"
                                                                    style={{ height: "80px" }}
                                                                >
                                                                    {num}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </div>
                            <div className="bg-white px-3">
                                {courts.map((court) => (
                                    <div
                                        key={court.id}
                                        className="d-flex justify-content-between align-items-center border-bottom py-3"
                                    >
                                        {/* Left Image & Text */}
                                        <div className="d-flex align-items-center gap-3">
                                            <img
                                                src={court.image}
                                                alt={court.name}
                                                style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover" }}
                                            />
                                            <div>
                                                <div className="fw-semibold">{court.name}</div>
                                                <small className="text-muted">{court.type}</small>
                                            </div>
                                        </div>

                                        {/* Price and Cart Icon */}
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="fw-semibold" style={{ fontSize: "20px", fontWeight: "500" }}>₹{court.price}</div>
                                            <button
                                                className="btn btn-dark rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                style={{ width: "32px", height: "32px" }}
                                                onClick={() => handleCourtSelect(court)}
                                            >
                                                <FaShoppingCart size={14} color="white" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default ManualBooking