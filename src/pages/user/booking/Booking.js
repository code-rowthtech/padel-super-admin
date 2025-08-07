import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import { logo, twoball } from "../../../assets/files";
import { FaShoppingCart } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { getUserSlot } from "../../../redux/user/slot/thunk";
import { useDispatch, useSelector } from "react-redux";
import { DataLoading } from '../../../helpers/loading/Loaders'
const Booking = ({
    className = ""
}) => {
    const [startDate, setStartDate] = useState(new Date());
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const scrollRef = useRef(null);
    const selectedButtonRef = useRef(null)
    const dateRefs = useRef({});
    const dispatch = useDispatch()
    const { slotData } = useSelector((state) => state?.userSlot);
    const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);
    const location = useLocation();
    console.log(slotData, 'slotData');
    const clubData = location.state?.clubData;
    const handleClickOutside = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [selectedCourts, setSelectedCourts] = useState([]);

    const [selectedDate, setSelectedDate] = useState({
        fullDate: new Date(),
        day: new Date().toLocaleDateString("en-US", { weekday: "long" })
    });


    const today = new Date();
    const dates = Array.from({ length: 41 }).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return {
            day: date.toLocaleDateString("en-US", { weekday: "long" }),
            date: date.getDate(),
            month: date.toLocaleDateString("en-US", { month: "short" }),
            fullDate: date.toISOString().split("T")[0],
        };
    });


    const scroll = (direction) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: direction === "left" ? -120 : 120,
                behavior: "smooth",
            });
        }
    };
    const toggleTime = (time) => {
        const isAlreadySelected = selectedTimes.some(t => t._id === time._id);

        if (isAlreadySelected) {
            setSelectedTimes(selectedTimes.filter(t => t._id !== time._id));
        } else {
            setSelectedTimes([...selectedTimes, time]);
        }
    };



    const dayShortMap = {
        Monday: "Mon",
        Tuesday: "Tue",
        Wednesday: "Wed",
        Thursday: "Thu",
        Friday: "Fri",
        Saturday: "Sat",
        Sunday: "Sun"
    };

    const handleCourtSelect = (court) => {
        const timeOnly = selectedTimes.map((item) => item?.time); // Extract time strings only
        const newCourt = { ...court, time: timeOnly, date: selectedDate?.fullDate };
        setSelectedCourts((prev) => [...prev, newCourt]);
    };


    const total = selectedCourts.reduce((sum, c) => sum + c.price, '');

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

    const savedClubId = localStorage.getItem("register_club_id");
    console.log(savedClubId, selectedDate, '000000000000000');
    useEffect(() => {

        dispatch(
            getUserSlot({
                register_club_id: savedClubId,
                day: selectedDate?.day,
            })
        );
    }, [selectedDate])

    useEffect(() => {
        if (selectedButtonRef.current && scrollRef.current) {
            const container = scrollRef.current;
            const selected = selectedButtonRef.current;
            const offsetLeft = selected.offsetLeft;
            const scrollWidth = container.clientWidth;

            container.scrollTo({
                left: offsetLeft - scrollWidth / 2 + selected.offsetWidth / 2,
                behavior: "smooth",
            });
        }
    }, [selectedDate]);

    const maxSelectableDate = new Date();
    maxSelectableDate.setDate(maxSelectableDate.getDate() + 40);

    useEffect(() => {
        if (selectedDate?.fullDate && dateRefs.current[selectedDate.fullDate]) {
            dateRefs.current[selectedDate.fullDate].scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
            });
        }
    }, [selectedDate]);



    return (
        <>
            <div className='container p-0'>
                <div className="ps-0" style={{ height: "340px" }}>
                    <div className="image-zoom-container position-relative overflow-hidden rounded-3" style={{ height: '100%' }}>
                        <img src={twoball} alt="Paddle" className="img-fluid w-100 h-100 object-fit-cover rounded-3" />
                        <div
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center text-white p-5"
                            style={{
                                background: 'linear-gradient(to right, rgba(17, 20, 39, 1) 3%, rgba(255, 255, 255, 0) 100%)'
                            }}
                        >
                            <p className='mb-0' style={{ fontSize: "20px" }}>BOOK YOUR SLOT</p>
                            <h1 className="fw-bold display-5">The Good <br />Club<br /></h1>
                        </div>
                    </div>
                </div>
            </div>
            {/* Booking UI */}
            <div className="container mt-4 d-flex gap-4 px-4 flex-wrap">
                <div className="row">
                    {/* Left Section */}
                    <div className="col-7 py-5 rounded-3 px-4" style={{ backgroundColor: " #F5F5F566" }}>
                        {/* Date Selector */}
                        <div className="calendar-strip ">
                            <div className="mb-3" style={{ fontSize: "20px", fontWeight: "600" }}>Select Date <div
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

                                                const formattedDate = date.toISOString().split("T")[0];
                                                const day = date.toLocaleDateString("en-US", { weekday: "long" });

                                                setSelectedDate({ fullDate: formattedDate, day });
                                                setSelectedTimes([]);
                                            }}
                                            inline
                                            maxDate={maxSelectableDate}
                                            minDate={new Date()}
                                            dropdownMode="select"
                                            calendarClassName="custom-calendar w-100 shadow-sm"
                                        />

                                    </div>
                                )}
                            </div></div>
                            <div className="d-flex  align-items-center gap-2 mb-3">
                                <button className="btn btn-light p-0" onClick={() => scroll("left")}>
                                    <i className="bi bi-chevron-left"></i>
                                </button>

                                <div
                                    ref={scrollRef}
                                    className="d-flex gap-2  w-100 overflow-auto no-scrollbar"
                                    style={{
                                        scrollBehavior: "smooth",
                                        whiteSpace: "nowrap",
                                        maxWidth: "620px", // Enough space for 7 buttons ~88px each
                                    }}
                                >
                                    {dates?.map((d, i) => {
                                        const formatDate = (date) => {
                                            return date.toISOString().split("T")[0];
                                        };
                                        const isSelected = formatDate(new Date(selectedDate?.fullDate)) === d.fullDate;
                                        console.log(isSelected, selectedDate, d.fullDate, 'isSelected');

                                        return (
                                            <button
                                                ref={(el) => (dateRefs.current[d.fullDate] = el)}
                                                key={i}
                                                className={`calendar-day-btn px-3 py-2 rounded border ${isSelected ? "text-white" : "bg-light text-dark"}`}
                                                style={{
                                                    backgroundColor: isSelected ? "#374151" : undefined,
                                                    border: "none",
                                                }}
                                                onClick={() => {
                                                    setSelectedDate({ fullDate: d.fullDate, day: d.day });
                                                    setStartDate(new Date(d.fullDate));
                                                    setSelectedTimes([]);
                                                }}
                                            >
                                                <div className="text-center">
                                                    <div style={{ fontSize: "14px", fontWeight: "400" }}>{dayShortMap[d.day]}</div>
                                                    <div style={{ fontSize: "26px", fontWeight: "500" }}>{d.date}</div>
                                                    <div style={{ fontSize: "14px", fontWeight: "400" }}>{d.month}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
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
                        {slotLoading ? (
                            <DataLoading height={"30vh"} />
                        ) : (
                            <>
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    {slotData?.data?.length > 0 &&
                                        slotData?.data?.[0]?.slot?.[0]?.slotTimes?.length > 0 ? (
                                        slotData?.data?.[0]?.slot?.[0]?.slotTimes?.map((slot, i) => {
                                            // Parse slot time into a Date object for today
                                            const slotDate = new Date();
                                            const [hourString, period] = slot?.time?.toLowerCase().split(" ");
                                            let hour = parseInt(hourString);

                                            if (period === "pm" && hour !== 12) hour += 12;
                                            if (period === "am" && hour === 12) hour = 0;

                                            // Set hours to slotDate for comparison
                                            slotDate.setHours(hour, 0, 0, 0);

                                            const now = new Date();
                                            const isPast = slotDate.getTime() < now.getTime();

                                            const isSelected = selectedTimes.some(t => t._id === slot._id);

                                            return (
                                                <button
                                                    key={i}
                                                    className="btn border-0 rounded-pill px-4"
                                                    onClick={() => !isPast && toggleTime(slot)}
                                                    disabled={isPast}
                                                    style={{
                                                        backgroundColor: isSelected ? "#374151" : "#CBD6FF1A",
                                                        color: isSelected ? "white" : isPast ? "#888888" : "#000000",
                                                        cursor: isPast ? "not-allowed" : "pointer",
                                                        opacity: isPast ? 0.6 : 1,
                                                    }}
                                                >
                                                    {slot?.time}
                                                </button>
                                            );
                                        })

                                    ) : (
                                    <div className="text-end">
                                        <p className="text-danger text-center fw-medium">No slots available for this date.</p>
                                    </div>
                                    )}
                                </div>
                                <div>

                                    <div className="d-flex justify-content-between align-items-center py-2">
                                        <p className="mb-0" style={{ fontSize: "20px", fontWeight: 600 }}>
                                            Available Court
                                        </p>
                                        <div>
                                            <a
                                                href="#"
                                                className="text-decoration-none d-inline-flex align-items-center"
                                                style={{ color: "#1F41BB" }}
                                                data-bs-toggle="modal"
                                                data-bs-target="#courtLayoutModal"
                                            >
                                                View Court Layout <i className="bi bi-arrow-right fs-5 ms-2"></i>
                                            </a>
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
                                                                <h5 className="modal-title m-0" id="courtLayoutModalLabel">View Court Layout</h5>
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
                                        {slotData?.data?.length > 0 &&
                                            slotData?.data?.[0]?.slot?.[0]?.slotTimes?.length > 0 ? (
                                            slotData.data[0]?.courts?.map((court) => (
                                                <div
                                                    key={court.id}
                                                    className="d-flex justify-content-between align-items-center border-bottom py-3"
                                                >
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img
                                                            src='https://www.brookstreet.co.uk/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBMEZCVXc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--4accdb1f96a306357a7fdeec518b142d3d50f1f2/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2QzNKbGMybDZaVWtpRFRnd01IZzJOVEE4QmpzR1ZBPT0iLCJleHAiOm51bGwsInB1ciI6InZhcmlhdGlvbiJ9fQ==--bcd925903d97179ca0141ad2735607ce8eed3d71/bs_court-ushers_800.jpg'
                                                            alt={court.name}
                                                            style={{
                                                                width: "45px",
                                                                height: "45px",
                                                                borderRadius: "50%",
                                                                objectFit: "cover",
                                                            }}
                                                        />
                                                        <div>
                                                            <div className="fw-semibold">{court?.courtName}</div>
                                                            <small className="text-muted">{court.type}</small>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="fw-semibold"
                                                            style={{ fontSize: "20px", fontWeight: "500" }}
                                                        >
                                                            ₹{court?.price || 100}
                                                        </div>
                                                        <button
                                                            className="btn btn-dark rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                            style={{ width: "32px", height: "32px" }}
                                                            onClick={() => handleCourtSelect(court)}
                                                        >
                                                            <FaShoppingCart size={14} color="white" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-muted">No courts available</div>
                                        )}
                                    </div>

                                </div>
                            </>
                        )}
                    </div >

                    {/* Right Section - Booking Summary */}
                    <div div className="col-5" >
                        <div className="border rounded px-3 py-5  border-0 " style={{ backgroundColor: " #CBD6FF1A" }}>
                            <div className="text-center mb-3">
                                <div className="rounded-circle bg-white mx-auto mb-2 shadow " style={{ width: "90px", height: "90px", lineHeight: '90px' }}>
                                    <img src={logo} width={80} alt="" />
                                </div>
                                <p className=" mt-4 mb-1" style={{ fontSize: "20px", fontWeight: "600" }}>{clubData?.clubName}</p>
                                <p className="small mb-0"> {clubData?.clubName}
                                    {clubData?.address || clubData?.city || clubData?.state || clubData?.zipCode ? ', ' : ''}
                                    {[clubData?.address, clubData?.city, clubData?.state, clubData?.zipCode]
                                        .filter(Boolean)
                                        .join(', ')}  </p>
                            </div>

                            <h6 className=" border-top  p-2 mb-3 ps-0" style={{ fontSize: "20px", fontWeight: "600" }}>Booking summary</h6>
                            <div
                                style={{
                                    maxHeight: "240px", // ~4 rows x 60px each
                                    overflowY: "auto",
                                }}
                            >
                                {selectedCourts?.map((court, index) => (
                                    <>
                                        <div> <span style={{ fontWeight: "600" }}>{court?.name}</span></div>
                                        <div key={index} className="court-row d-flex justify-content-between align-items-center mb-3 ">

                                            <div>
                                                <span style={{ fontWeight: "500" }}>
                                                    {(() => {
                                                        const date = new Date(court.date);
                                                        const day = date.toLocaleString('en-US', { day: '2-digit' });
                                                        const month = date.toLocaleString('en-US', { month: 'short' });
                                                        return `${day}${month}`;
                                                    })()},
                                                </span>  {Array.isArray(court.time)
                                                    ? court.time.join(' | ')
                                                    : court.time}{' '}
                                                (60m)
                                            </div>


                                            <div className="d-flex align-items-center gap-2">
                                                <button
                                                    className="btn btn-sm text-danger delete-btn "
                                                    onClick={() => handleDelete(index)}
                                                >
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                                <div>₹ {court.price || 100}</div>

                                            </div>

                                        </div>
                                    </>
                                ))}
                            </div>




                            <div className="border-top pt-2 mt-2 d-flex justify-content-between fw-bold">
                                <span style={{ fontSize: "16px", fontWeight: "600" }}>Total to pay</span>
                                <span className="text-primary">₹ {total}</span>
                            </div>


                            <div className="d-flex justify-content-center mt-3">
                                <button
                                    style={buttonStyle}
                                    className={className}

                                >
                                    <Link to="/payment" state={{
                                        courtData: {
                                            day: selectedDate?.day,
                                            date: selectedDate?.fullDate,
                                            time: selectedTimes,
                                            court: selectedCourts,
                                            slot: slotData?.data?.[0]?.slot
                                        }, clubData
                                    }} style={{ textDecoration: 'none' }} className="">
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
                    </div >
                </div >
            </div >
        </>

    );
};

export default Booking;
