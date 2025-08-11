import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import { Container, Row, Col, Table, Button, Form, InputGroup } from 'react-bootstrap';
import { Tab, Tabs } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaSearch, FaStar } from 'react-icons/fa';
import { MdOutlineCancel } from "react-icons/md";
import { FiEye } from "react-icons/fi";
import { AcceptedRejectedModal, BookingHistoryCancelModal } from './bookingModals/Modals';
import { format, parse } from 'date-fns';
import { BookingRatingModal } from './bookingModals/RatingModal';

const BookingHistory = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchDate, setSearchDate] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [modalCancel, setModalCancel] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedOption, setSelectedOption] = useState('status');
    const [isOpen, setIsOpen] = useState(false);
    const [ratings, setRatings] = useState({});
    const [ratingBookingIndex, setRatingBookingIndex] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [acceptedRejected,setAcceptedRejected] = useState(false)

    const bookings = [
        { dateTime: '27th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Accepted' },
        { dateTime: '20th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Rejected' },
        { dateTime: '16th Jun 2025 10:00AM', courtNumber: 'Court 3', amount: '₹ 1000', status: 'Rejected' },
        { dateTime: '12th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Rejected' },
        { dateTime: '10th Jun 2025 10:00AM', courtNumber: 'Court 2', amount: '₹ 1000', status: 'Accepted' },
        { dateTime: '8th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Rejected' },
        { dateTime: '19th Jun 2025 10:00AM', courtNumber: 'Court 2', amount: '₹ 1000', status: 'Accepted' },
        { dateTime: '15th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Accepted' },
        { dateTime: '14th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Rejected' },
        { dateTime: '13th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Accepted' },
    ];

    const filteredBookings = bookings.filter((booking) => {
        const matchesStatus = activeTab === 'all' || booking.status.toLowerCase() !== activeTab.toLowerCase();
        const matchesSearch = searchText === '' || booking.courtNumber.toLowerCase().includes(searchText.toLowerCase());
        let matchesDate = true;
        if (searchDate) {
            try {
                const cleanedDateStr = booking.dateTime.replace(/(\d{1,2})(st|nd|rd|th)/, '$1');
                const bookingDate = parse(cleanedDateStr, 'd MMM yyyy hh:mma', new Date());
                matchesDate = format(bookingDate, 'dd/MM/yy HH:mm') === format(searchDate, 'dd/MM/yy HH:mm');
            } catch (err) {
                console.error('Error parsing booking date:', booking.dateTime, err);
                matchesDate = false;
            }
        }
        console.log('Booking:', booking, 'Matches Status:', matchesStatus, 'Matches Date:', matchesDate, 'Matches Search:', matchesSearch);
        return matchesStatus && matchesDate && matchesSearch;
    });

    function a11yProps(index) {
        return {
            id: `full-width-tab-${index}`,
            'aria-controls': `full-width-tabpanel-${index}`,
        };
    }

    const handleChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSelect = (value) => {
        setSelectedOption(value);
        setIsOpen(false);
    };

    const handleRatingClick = (index) => {
        setRatingBookingIndex(index);
        setShowRatingModal(true);
    };

    return (
        <Container>
            <Row className="mb-3 mt-5">
                <Col md={6}>
                    <h2 className="manual-heading">Booking History</h2>
                </Col>
            </Row>

            <Box className="mb-3" sx={{ bgcolor: 'white' }}>
                <AppBar position="static" color="default" className="bg-white border-light" elevation={0}>
                    <Tabs
                        value={activeTab}
                        onChange={handleChange}
                        textColor="primary"
                        aria-label="booking history tabs"
                        TabIndicatorProps={{ style: { display: 'none' } }}
                    >
                        {['all', 'upcoming', 'cancelled', 'complete'].map((tab, i) => (
                            <Tab
                                key={tab}
                                label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                                value={tab}
                                {...a11yProps(i)}
                                className="fw-medium table-data rounded-pill"
                                sx={{
                                    '&.Mui-selected': { backgroundColor: '#CBD6FFA1', color: 'primary.main' },
                                    borderRadius: '20px',
                                    margin: '0 4px',
                                    fontSize: '18px',
                                    fontWeight: '500',
                                    fontFamily: 'Poppins',
                                }}
                            />
                        ))}
                    </Tabs>
                </AppBar>
            </Box>

            <Row className="mb-3">
                <Col md={6}>
                    <h2 className="tabel-title mt-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Booking</h2>
                </Col>
                <Col md={6} className="d-flex gap-2 justify-content-end align-items-center">
                    {/* Date Picker */}
                    <InputGroup
                        className="rounded bg-light p-1 align-items-center"
                    >
                        {/* Calendar Icon */}
                        <InputGroup.Text className="bg-light border-0 px-3">
                            <FaCalendarAlt className="text-muted" />
                        </InputGroup.Text>

                        {/* Date Picker */}
                        <DatePicker
                            selected={searchDate}
                            onChange={(date) => setSearchDate(date)}
                            showTimeSelect
                            timeFormat="hh:mm aa"
                            timeIntervals={30}
                            dateFormat="dd/MM/yy hh:mm aa"
                            placeholderText="dd/mm/yy 00:00 AM/PM"
                            calendarClassName="custom-calendar"
                            className="form-control border-0 bg-light shadow-none custom-datepicker-input"
                        />
                    </InputGroup>

                    {/* Search Input */}
                    <InputGroup className="rounded overflow-hidden bg-light p-1" style={{ maxWidth: '300px', backgroundColor: "#F5F5F5" }}>
                        <Form.Control
                            type="text"
                            placeholder="Search"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="border-0 bg-light shadow-none"
                            style={{ backgroundColor: "#F5F5F5" }}
                        />
                        <InputGroup.Text className="bg-light border-0">
                            <FaSearch className="text-muted" />
                        </InputGroup.Text>
                    </InputGroup>
                </Col>
            </Row>

            {/* Table */}
            <Table hover>
                <thead>
                    <tr>
                        <th className="py-3 px-4" style={{ backgroundColor: "#D0D6EA", borderRadius: "10px 0px 0px 0px" }}>Date & Time</th>
                        <th className="py-3" style={{ backgroundColor: "#D0D6EA" }}>Court Number</th>
                        {activeTab === 'cancelled' && (
                            <th className="py-3" style={{ backgroundColor: "#D0D6EA" }}>Reason</th>
                        )}

                        {activeTab === 'complete' && (
                            <th className="py-3 text-center" style={{ backgroundColor: "#D0D6EA" }}>Rating</th>
                        )}

                        {activeTab === 'complete' && (
                            <th className="py-3" style={{ backgroundColor: "#D0D6EA" }}>Message</th>
                        )}
                        <th className="py-3" style={{ backgroundColor: "#D0D6EA" }}>Amount</th>
                        {activeTab === 'cancelled' && (
                            <th className="py-3" style={{ backgroundColor: "#D0D6EA" }}>
                                <div className="dropdown-wrapper">
                                    <div className="dropdown-header" onClick={() => setIsOpen(!isOpen)}>
                                        Status <b className="arrow"><i class="bi bi-chevron-down text-dark fw-bold"></i></b>
                                    </div>
                                    {isOpen && (
                                        <div className="dropdown-list">
                                            <div onClick={() => handleSelect("Accepted")}>Accepted</div>
                                            <div onClick={() => handleSelect("Rejected")}>Rejected</div>
                                        </div>
                                    )}
                                </div>
                            </th>

                        )}
                        <th className="py-3 text-center" style={{ backgroundColor: "#D0D6EA", borderRadius: "0px 10px 0px 0px" }}>Action</th>
                    </tr>
                </thead>
                <tbody className="border">
                    {filteredBookings.length > 0 ? (
                        filteredBookings?.map((booking, index) => (
                            <tr key={index}>
                                <td className="px-4 table-data" style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500" }}>{booking.dateTime}</td>
                                <td className="table-data" style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500" }}>{booking.courtNumber}</td>
                                {activeTab === 'cancelled' && (
                                    <td style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500" }}>reason lorem...............</td>
                                )}

                                {activeTab === 'complete' && (
                                    <td className='text-center' >
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const ratingValue = ratings[index]?.rating || 0;
                                            let iconClass = "bi-star"; // empty star by default

                                            if (star <= Math.floor(ratingValue)) {
                                                iconClass = "bi-star-fill"; // full star
                                            } else if (star - ratingValue <= 0.5 && star - ratingValue > 0) {
                                                iconClass = "bi-star-half"; // half star
                                            }

                                            return (
                                                <i
                                                    key={star}
                                                    className={`bi ${iconClass} ms-2`}
                                                    style={{
                                                        color: "#3DBE64",
                                                        cursor: "pointer",
                                                        fontSize: "18px"
                                                    }}
                                                    onClick={() => handleRatingClick(index)}
                                                ></i>
                                            );
                                        })}

                                    </td>
                                )}

                                {activeTab === 'complete' && (
                                    <td style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500" }}>
                                        {ratings[index]?.review || ""}
                                    </td>
                                )}
                                <td style={{ color: "#1A237E", fontSize: "16px", fontFamily: "Poppins", fontWeight: "500" }}>{booking.amount}</td>
                                {activeTab === 'cancelled' && (
                                    <td style={{ color: selectedOption === 'Rejected' && booking.status === 'Rejected' ? "red" : "lime", fontSize: "16px", fontFamily: "Poppins", fontWeight: "500" }}>{selectedOption === "status" ? booking?.status : selectedOption}</td>
                                )}
                                <td className="text-center">
                                    {activeTab === 'cancelled' || activeTab === 'complete' ? '' : (
                                        <MdOutlineCancel
                                            size={20}
                                            onClick={() => {
                                                setSelectedBooking(booking);
                                                setModalCancel(true);
                                            }}
                                            className="text-danger"
                                            style={{ cursor: 'pointer' }}
                                        />
                                    )}
                                    <FiEye size={20} className="text-muted ms-2" onClick={() => {
                                        if(activeTab === "cancelled"){
                                        setAcceptedRejected(true);
                                        }
                                    }} style={{ cursor: 'pointer' }} />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={activeTab === 'cancelled' ? 5 : 4} className="text-center">No bookings found.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
            <BookingHistoryCancelModal
                show={modalCancel}
                onHide={() => setModalCancel(false)}
                booking={selectedBooking}
                isCancelledTab={activeTab === 'cancelled'}
            />
            <BookingRatingModal
                show={showRatingModal}
                onHide={() => {
                    setShowRatingModal(false);
                    setRatingBookingIndex(null);
                }}
                onSubmit={({ rating, review }) => {
                    setRatings((prev) => ({
                        ...prev,
                        [ratingBookingIndex]: { rating, review }
                    }));
                    setShowRatingModal(false);
                    setRatingBookingIndex(null);
                }}
                initialRating={ratingBookingIndex !== null ? ratings[ratingBookingIndex]?.rating : 0}
                defaultMessage={ratingBookingIndex !== null ? ratings[ratingBookingIndex]?.review : ''}
            />

            <AcceptedRejectedModal booking={filteredBookings} selectedOption={selectedOption} onHide={()=>setAcceptedRejected(false)} show={acceptedRejected} />
        </Container>
    );
};

export default BookingHistory;