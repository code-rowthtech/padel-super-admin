import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import { Container, Row, Col, Table, Button, Form, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Tab, Tabs } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaSearch, FaStar } from 'react-icons/fa';
import { MdOutlineCancel } from "react-icons/md";
import { FiEye } from "react-icons/fi";
import { AcceptedRejectedModal, BookingHistoryCancelModal, CancellationConfirmationModal } from './bookingModals/Modals';
import { format, parse } from 'date-fns';
import { BookingRatingModal } from './bookingModals/RatingModal';
import { useDispatch, useSelector } from 'react-redux';
import { getBooking } from '../../../redux/user/booking/thunk';
import { DataLoading, Loading } from '../../../helpers/loading/Loaders';
import { resetBooking } from '../../../redux/user/booking/slice';
import { formatDate } from '../../../helpers/Formatting';
import { getReviewClub } from '../../../redux/user/club/thunk';

const BookingHistory = () => {
    const store = useSelector((state) => state)
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState('all');
    const [searchDate, setSearchDate] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [modalCancel, setModalCancel] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedOption, setSelectedOption] = useState('All');
    const [isOpen, setIsOpen] = useState(false);
    const [ratings, setRatings] = useState({});
    const [changeCancelShow, setChangeCancelShow] = useState(false);
    const [ratingBookingIndex, setRatingBookingIndex] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [acceptedRejected, setAcceptedRejected] = useState(false)
    const [tableData, setCourtData] = useState(null)
    const [statusData, setStatusData] = useState(null)
    const getBookingData = useSelector((state) => state?.userBooking)
    const getReviewData = store?.userClub?.getReviewData?.data
    console.log({ getReviewData });

    const renderSlotTimes = (slotTimes) =>
        slotTimes?.length ? slotTimes.map((slot) => slot.time).join(", ") : "-";

    function a11yProps(index) {
        return {
            id: `full-width-tab-${index}`,
            'aria-controls': `full-width-tabpanel-${index}`,
        };
    }

    const handleChange = (event, newValue) => {
        setActiveTab(newValue);
        dispatch(resetBooking())
        let type = "";

        if (newValue === "all") {
            type = "";
        } else if (newValue === "cancelled") {
            type = "cancelled";
        } else if (newValue === "upcoming") {
            type = "upcoming";
        } else if (newValue === "completed") {
            type = "completed";
        }

        dispatch(getBooking({ type }));

    };

    const handleSelect = (value) => {
        setSelectedOption(value);
        setIsOpen(false);
    };
    const club_id = localStorage.getItem("register_club_id");

    useEffect(() => {
        dispatch(getBooking({ type: "" }));

        if (club_id) {
            dispatch(getReviewClub(club_id));
        }
    }, [club_id, dispatch]);

    const filterStatus = getBookingData?.bookingData?.data?.filter((booking) => {
        const status = booking?.bookingStatus;

        // Status filter
        let statusMatch = false;
        if (selectedOption === "Rejected") {
            statusMatch = ["in-progress", "rejected"].includes(status);
        } else if (selectedOption === "Accepted") {
            statusMatch = ["refunded"].includes(status);
        } else if (selectedOption === "All") {
            statusMatch = true;
        }

        // Date filter
        let dateMatch = true;
        if (searchDate) {
            dateMatch = booking?.slot?.some((slotItem) => {
                const bookingDate = new Date(slotItem?.bookingDate);
                return bookingDate.toDateString() === searchDate.toDateString();
            });
        }

        // Court name filter (case insensitive)
        let courtMatch = true;
        if (searchText.trim() !== "") {
            courtMatch = booking?.slot?.some((slotItem) =>
                slotItem?.courtName?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        return statusMatch && dateMatch && courtMatch;
    });

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
                        {['all', 'upcoming', 'cancelled', 'completed'].map((tab, i) => (
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
                    <tr className=''>
                        <th className="py-3 ps-4" style={{ backgroundColor: "#D0D6EA", borderRadius: "10px 0px 0px 0px" }}>Date & Time</th>
                        <th className="py-3" style={{ backgroundColor: "#D0D6EA" }}>Time</th>
                        <th className="py-3" style={{ backgroundColor: "#D0D6EA" }}>Court Name</th>
                        {activeTab === 'cancelled' && (
                            <th className="py-3" style={{ backgroundColor: "#D0D6EA" }}>Reason</th>
                        )}

                        {activeTab === 'completed' && (
                            <th className="py-3 text-center" style={{ backgroundColor: "#D0D6EA" }}>Rating</th>
                        )}

                        {activeTab === 'completed' && (
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
                                            <div onClick={() => handleSelect("All")}>All</div>
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
                {getBookingData?.bookingLoading ? (
                    <tbody>
                        <tr>
                            <td colSpan={7} style={{ height: "60vh", verticalAlign: "middle" }} className="text-center">
                                <DataLoading height={100} />
                            </td>
                        </tr>
                    </tbody>
                ) : getBookingData?.bookingData?.data?.length > 0 ? (
                    <tbody className="border">
                        {filterStatus?.map((booking, i) =>
                            booking?.slot?.map((slotItem, index) => (
                                <tr key={`${i}-${index}`}>
                                    <td className="ps-4 table-data" style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500" }}>
                                        {formatDate(slotItem?.bookingDate)}
                                    </td>
                                    <td className="table-data" style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500" }}>
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip id={`slot-tooltip-${slotItem?.id}`}>
                                                    {renderSlotTimes(slotItem?.slotTimes)}
                                                </Tooltip>
                                            }
                                        >
                                            <span>
                                                {(() => {
                                                    const times = slotItem?.slotTimes?.map((slot) => slot?.time) || [];
                                                    const displayed = times?.slice(0, 5).join(", ");
                                                    return times?.length > 5 ? `${displayed} ...` : displayed;
                                                })()}
                                            </span>
                                        </OverlayTrigger>
                                    </td>
                                    <td className="table-data" style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500" }}>
                                        {slotItem?.courtName || 'N/A'}
                                    </td>

                                    {activeTab === 'cancelled' && (
                                        <td style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500" }}>
                                            {booking?.cancellationReason}
                                        </td>
                                    )}

                                    {activeTab === 'completed' && (
                                        <td className="text-center">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const averageRating = getReviewData?.averageRating || 0;
                                                let iconClass = "bi-star"; // empty star by default

                                                if (star <= Math.floor(averageRating)) {
                                                    iconClass = "bi-star-fill"; // full star
                                                } else if (star - averageRating <= 0.5 && star - averageRating > 0) {
                                                    iconClass = "bi-star-half"; // half star
                                                }

                                                return (
                                                    <i
                                                        key={star}
                                                        className={`bi ${iconClass} ms-2`}
                                                        style={{
                                                            color: "#3DBE64",
                                                            fontSize: "18px",
                                                        }}
                                                    ></i>
                                                );
                                            })}
                                        </td>
                                    )}

                                    {activeTab === "completed" && (
                                        <td style={{ fontSize: "16px", fontFamily: "Poppins", fontWeight: "500" }}>
                                            <span>
                                                {getReviewData?.reviews?.[getReviewData?.reviews?.length - 1]?.reviewComment || "No comment"}
                                            </span>
                                        </td>
                                    )}

                                    <td style={{ color: "#1A237E", fontSize: "16px", fontFamily: "Poppins", fontWeight: "500" }}>
                                        ₹{booking?.totalAmount || 'N/A'}
                                    </td>

                                    {activeTab === 'cancelled' && (
                                        <td
                                            style={{
                                                color: booking?.bookingStatus === 'in-progress' || booking?.bookingStatus === 'rejected'
                                                    ? "red"
                                                    : "green",
                                                fontSize: "16px",
                                                fontFamily: "Poppins",
                                                fontWeight: "500"
                                            }}
                                        >
                                            {booking?.bookingStatus === 'in-progress' || booking?.bookingStatus === 'rejected' ? "Rejected" : "Accepted"}
                                        </td>
                                    )}

                                    <td className="text-center">
                                        {activeTab === 'cancelled' || activeTab === 'completed' ? (
                                            ''
                                        ) : booking?.cancellationReason ? (
                                            <span
                                                className="d-inline-block"
                                                style={{
                                                    color: "#F29410",
                                                    fontSize: "12px",
                                                    fontWeight: "500",
                                                    fontFamily: "Poppins"
                                                }}
                                            >
                                                Request For Cancellation
                                            </span>
                                        ) : (
                                            <MdOutlineCancel
                                                size={20}
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setChangeCancelShow(true);
                                                    setCourtData({ slotItem: slotItem, booking: booking });
                                                    setModalCancel(true);
                                                }}
                                                className="text-danger"
                                                style={{ cursor: "pointer" }}
                                            />
                                        )}

                                        <FiEye
                                            size={20}
                                            className="text-muted ms-2"
                                            onClick={() => {
                                                if (activeTab === "cancelled") {
                                                    setAcceptedRejected(true);
                                                    setStatusData({ booking: booking, slotItem: slotItem });
                                                } else if (["all", "upcoming"].includes(activeTab)) {
                                                    setModalCancel(true);
                                                    setCourtData({ slotItem: slotItem, booking: booking });
                                                } else if (activeTab === "completed") {
                                                    setShowRatingModal(true);
                                                    setStatusData({ booking: booking, slotItem: slotItem });

                                                }
                                            }}
                                            style={{ cursor: "pointer" }}
                                        />
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                ) : (
                    <tbody>
                        <tr>
                            <td colSpan={7} className="text-center" style={{ height: "60vh", verticalAlign: "middle" }}>
                                <p className="table-data text-danger">No bookings found.</p>
                            </td>
                        </tr>
                    </tbody>
                )}


            </Table>
            <BookingHistoryCancelModal
                show={modalCancel}
                onHide={() => setModalCancel(false)}
                booking={selectedBooking}
                isCancelledTab={activeTab === 'cancelled'}
                tableData={tableData}
                setChangeCancelShow={setChangeCancelShow}
                changeCancelShow={changeCancelShow}
            />
            <BookingRatingModal
                show={showRatingModal}
                reviewData={getReviewData}
                tableData={statusData}
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
            <CancellationConfirmationModal />

            <AcceptedRejectedModal booking={statusData} selectedOption={selectedOption} onHide={() => setAcceptedRejected(false)} show={acceptedRejected} />
        </Container>
    );
};

export default BookingHistory;