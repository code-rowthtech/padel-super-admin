import React, { useRef, useEffect, useState } from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import DatePicker from 'react-datepicker';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { BookingDetailsModal, BookingSuccessModal } from './BookingModal';

const ManualBooking = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate()
    const [showSuccess, setShowSuccess] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
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

    return (
        <>
            <Container className='p-0' fluid>
                <Row>
                    <Col md={6}>
                        <h5 className='manual-heading' style={{ fontFamily: "Poppins", fontWeight: '600' }}>Manual Booking</h5>
                    </Col>
                    <Col md={6} className='text-end'>
                        <Button className='bg-transparent border-0' onClick={() => navigate('/admin/booking')} style={{ color: "#1F41BB", fontSize: "20px", fontWeight: "600", fontFamily: "Poppins" }}> <FaArrowLeft /> Back</Button>
                    </Col>
                </Row>
                <Row className='mx-auto bg-white'>
                    <Col md={8} className="pt-3 rounded-3 px-4" >
                        {/* Date Selector */}
                        <div className="calendar-strip ">
                            <div className="tabel-title mb-3" style={{ fontFamily: "Poppins", fontWeight: '600', color: "#374151" }} >Select Date <div
                                className="position-relative d-inline-block"
                                ref={wrapperRef}
                            >
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
                            <div className="d-flex align-items-center w-100 p-0 gap-2 mb-3">
                                <button className="btn btn-light p-0" onClick={() => scroll("left")}>
                                    <i className="bi bi-chevron-left"></i>
                                </button>

                                <div
                                    ref={scrollRef}
                                    className="d-flex gap-2 "
                                    style={{
                                        scrollBehavior: "smooth",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden", // hides scroll
                                        flex: 1,
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
                            <p className="mb-3 tabel-title" style={{ fontFamily: "Poppins", fontWeight: '600', color: "#374151" }} >
                                Available Slots <span className="fs-6">(60m)</span>
                            </p>
                            <div className="form-switch d-flex align-items-center gap-2 p-0">
                                <input
                                    className="form-check-input fs-5 mb-1"
                                    type="checkbox"
                                    role="switch"
                                    id="flexSwitchCheckDefault"
                                    style={{ boxShadow: "none" }}
                                />
                                <label
                                    className="table-data text-dark mb-0"
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
                                    className={`btn border-0 rounded-pill table-data px-4 `}
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
                                <p className="mb-0 tabel-title" style={{ fontFamily: "Poppins", fontWeight: '600', color: "#374151" }} >
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
                        <div className="mt-4 px-3">
                            <p className="mb-2 tabel-title" style={{ fontFamily: "Poppins", fontWeight: '600', color: "#374151" }}>User Information</p>
                            <div className="d-flex gap-3 mb-3">
                                <input
                                    type="text"
                                    className="form-control rounded-3 py-2"
                                    placeholder="Name"
                                    style={{ backgroundColor: "#CBD6FF7A" }}
                                />
                                <input
                                    type="tel"
                                    className="form-control rounded-3 py-2"
                                    placeholder="Phone Number"
                                    style={{ backgroundColor: "#CBD6FF7A" }}
                                />
                            </div>
                            <div className="d-flex justify-content-end gap-4 align-items-end">
                                <button
                                    className="btn btn-secondary rounded-pill px-4 py-2"
                                    style={{ minWidth: '120px', fontWeight: '500' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-success rounded-pill px-4 py-2"
                                    style={{ minWidth: '120px', fontWeight: '500' }}
                                    onClick={() => setShowSuccess(true)}
                                >
                                    Confirm
                                </button>
                                <BookingSuccessModal
                                    show={showSuccess}
                                    handleClose={() => setShowSuccess(false)}
                                    openDetails={() => {
                                        setShowSuccess(false);
                                        setShowDetails(true); 
                                    }}
                                />

                                <BookingDetailsModal
                                    show={showDetails}
                                    handleClose={() => setShowDetails(false)}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default ManualBooking