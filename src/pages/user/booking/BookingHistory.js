import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import {
    Container,
    Row,
    Col,
    Table,
    Form,
    InputGroup,
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap";
import { Tab, Tabs } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaSearch, FaTimes } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { FiEye } from "react-icons/fi";
import {
    AcceptedRejectedModal,
    BookingHistoryCancelModal,
    CancellationConfirmationModal,
} from "./bookingModals/Modals";
import { format } from "date-fns";
import { BookingRatingModal } from "./bookingModals/RatingModal";
import { useDispatch, useSelector } from "react-redux";
import { getBooking } from "../../../redux/user/booking/thunk";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { resetBooking } from "../../../redux/user/booking/slice";
import { getReviewClub } from "../../../redux/user/club/thunk";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import Pagination from "../../../helpers/Pagination";
import { formatDate } from "../../../helpers/Formatting";
import TokenExpire from "../../../helpers/TokenExpire";

const BookingHistory = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState("all");
    const [searchDate, setSearchDate] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [modalCancel, setModalCancel] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedOption, setSelectedOption] = useState("All");
    const [isOpen, setIsOpen] = useState(false);
    const [ratings, setRatings] = useState({});
    const [changeCancelShow, setChangeCancelShow] = useState(false);
    const [ratingBookingIndex, setRatingBookingIndex] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [acceptedRejected, setAcceptedRejected] = useState(false);
    const [expireModal, setExpireModal] = useState(false);
    const [tableData, setCourtData] = useState(null);
    const [statusData, setStatusData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const getBookingData = useSelector((state) => state?.userBooking);
    const User = getUserFromSession();
    const renderSlotTimes = (slotTimes) =>
        slotTimes?.length ? slotTimes.map((slot) => slot.time).join(", ") : "-";

    const a11yProps = (index) => ({
        id: `full-width-tab-${index}`,
        "aria-controls": `full-width-tabpanel-${index}`,
    });

    const handleChange = (event, newValue) => {
        setActiveTab(newValue);
        setCurrentPage(1);
        setSearchDate(null);
        dispatch(resetBooking());
        let type = "";
        if (newValue === "cancelled") type = "cancelled";
        else if (newValue === "upcoming") type = "upcoming";
        else if (newValue === "completed") type = "completed";
        else if (newValue === "all") type = "all";
        dispatch(getBooking({ type, page: 1 }));
    };

    const handleSelect = (value) => {
        setSelectedOption(value);
        setIsOpen(false);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (getBookingData?.bookingData?.message === "jwt token is expired") {
            setExpireModal(true);
        }
    }, [getBookingData?.bookingData?.message === "jwt token is expired"]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchDate, searchText, selectedOption, activeTab]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        let type = "";
        if (activeTab === "cancelled") type = "cancelled";
        else if (activeTab === "upcoming") type = "upcoming";
        else if (activeTab === "completed") type = "completed";
        else if (activeTab === "all") type = "all";
        dispatch(getBooking({ type, page: pageNumber }));
    };

    const handleClearDate = () => setSearchDate(null);
    const club_id = localStorage.getItem("register_club_id");
    useEffect(() => {
        if (User?.token) dispatch(getBooking({ page: 1 }));
        if (club_id) dispatch(getReviewClub(club_id));
    }, [User?.token, club_id]);

    const filterStatus = getBookingData?.bookingData?.data?.filter((booking) => {
        const status = booking?.bookingStatus?.toLowerCase();
        let statusMatch = false;

        if (activeTab === "cancelled") {
            if (selectedOption === "Rejected") {
                statusMatch = status === "rejected";
            } else if (selectedOption === "Accepted") {
                statusMatch = status === "refunded";
            } else if (selectedOption === "Requested") {
                statusMatch = status === "in-progress";
            } else {
                statusMatch = ["in-progress", "refunded", "rejected"].includes(status);
            }
        } else if (activeTab === "upcoming") {
            // upcoming tab => upcoming + in-progress
            statusMatch = ["upcoming", "in-progress"].includes(status);
        } else if (activeTab === "completed") {
            // completed tab => only completed
            statusMatch = status === "completed";
        } else if (activeTab === "all") {
            statusMatch = true;
        } else {
            // other tabs => show all
            statusMatch = true;
        }

        let dateMatch = true;
        if (searchDate) {
            dateMatch = booking?.slot?.some((slotItem) => {
                const bookingDate = new Date(slotItem?.bookingDate);
                return bookingDate.toDateString() === searchDate.toDateString();
            });
        }

        let courtMatch = true;
        if (searchText.trim() !== "") {
            courtMatch = booking?.slot?.some((slotItem) =>
                slotItem?.courtName?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        return statusMatch && dateMatch && courtMatch;
    });

    const totalRecords = getBookingData?.bookingData?.total || getBookingData?.bookingData?.length;
    return (
        <Container>
            <Row className="mb-3 mt-5">
                <Col md={6}>
                    <h2 className="manual-heading" style={{ fontWeight: "700", fontSize: "36px" }}>Booking History</h2>
                </Col>
            </Row>

            <Box className="mb-3" sx={{ bgcolor: "white" }}>
                <AppBar
                    position="static"
                    color="default"
                    className="bg-white border-light"
                    elevation={0}
                >
                    <Tabs
                        value={activeTab}
                        onChange={handleChange}
                        textColor="primary"
                        aria-label="booking history tabs"
                        TabIndicatorProps={{ style: { display: "none" } }}
                        sx={{
                            "& .MuiTabs-flexContainer": {
                                justifyContent: "start",
                            },
                        }}
                    >
                        {["all", "upcoming", "cancelled", "completed"].map((tab, i) => (
                            <Tab
                                key={tab}
                                label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                                value={tab}
                                {...a11yProps(i)}
                                className="fw-medium table-data me-1 ms-0"
                                sx={{
                                    textTransform: "capitalize",
                                    borderRadius: "50px",
                                    px: 3, // horizontal padding
                                    py: 0, // vertical padding
                                    mx: 0.5, // margin between tabs
                                    fontSize: "16px",
                                    fontWeight: 500,
                                    fontFamily: "Poppins",
                                    "&.Mui-selected": {
                                        backgroundColor: "#CBD6FFA1",
                                        color: "primary.main",
                                    },
                                    "&:hover": {
                                        backgroundColor: "#E8EDFF",
                                    },
                                }}
                            />
                        ))}
                    </Tabs>


                </AppBar>
            </Box>

            <Row className="mb-3">
                <Col md={6}>
                    <h2 className="tabel-title mt-2" style={{ fontWeight: "600", fontSize: "24px" }}>
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Booking
                    </h2>
                </Col>
                <Col
                    md={6}
                    className="d-flex gap-2 justify-content-end align-items-center"
                >
                    <InputGroup className="rounded  p-1 align-items-center" style={{ backgroundColor: "#FAFBFF" }}>
                        <InputGroup.Text className="bg-light border-0 px-3">
                            <FaCalendarAlt className="text-muted" />
                        </InputGroup.Text>
                        <DatePicker
                            selected={searchDate}
                            onChange={(date) => setSearchDate(date)}
                            dateFormat="dd/MM/yy"
                            placeholderText="dd/mm/yy"
                            calendarClassName="custom-calendar"
                            className="form-control border-0 bg-transparent  shadow-none custom-datepicker-input"

                        />
                        {searchDate && (
                            <InputGroup.Text
                                className="bg-light border-0 px-3"
                                onClick={handleClearDate}
                                style={{ cursor: "pointer" }}
                            >
                                <FaTimes className="text-danger" />
                            </InputGroup.Text>
                        )}
                    </InputGroup>

                    <InputGroup
                        className="rounded overflow-hidden bg-light p-1"
                        style={{ maxWidth: "300px", backgroundColor: "#F5F5F5" }}
                    >
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

            <Row>
                <Col md={12}>
                    <div className="custom-scroll-container">
                        <Table borderless size="sm" className="custom-table position-relative">
                            <thead>
                                <tr className="">
                                    <th className="text-start px-5">Booking Date / Time</th>
                                    <th>Court Name</th>
                                    <th>Booking Type</th>
                                    {activeTab === "cancelled" && <th>Reason</th>}
                                    {activeTab === "completed" && <th>Rating</th>}
                                    {activeTab === "completed" && <th>Message</th>}
                                    <th>Amount</th>
                                    {activeTab === "cancelled" && (
                                        <th>
                                            <div className="dropdown-wrapper">
                                                <div
                                                    className="dropdown-header"
                                                    onClick={() => setIsOpen(!isOpen)}
                                                >
                                                    Status{" "}
                                                    <b className="arrow">
                                                        <i className="bi bi-chevron-down text-dark fw-bold"></i>
                                                    </b>
                                                </div>
                                                {isOpen && (
                                                    <div className="dropdown-list text-start">
                                                        <div className="mb-0" onClick={() => handleSelect("All")}>
                                                            All
                                                        </div>
                                                        <div
                                                            className="mb-0"
                                                            onClick={() => handleSelect("Accepted")}
                                                        >
                                                            Accepted
                                                        </div>
                                                        <div
                                                            className="mb-0"
                                                            onClick={() => handleSelect("Rejected")}
                                                        >
                                                            Rejected
                                                        </div>
                                                        <div
                                                            className="mb-0"
                                                            onClick={() => handleSelect("Requested")}
                                                        >
                                                            Requested
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                    )}
                                    <th>Action</th>
                                </tr>
                            </thead>
                            {getBookingData?.bookingLoading ? (
                                <tbody>
                                    <tr>
                                        <td
                                            colSpan={8}
                                            style={{ height: "60vh", verticalAlign: "middle" }}
                                            className="text-center"
                                        >
                                            <DataLoading height={100} />
                                        </td>
                                    </tr>
                                </tbody>
                            ) : filterStatus?.length > 0 ? (
                                <tbody className="border">
                                    {filterStatus?.map((booking, i) =>
                                        booking?.slot?.map((slotItem, index) => (
                                            <tr
                                                key={`${i}-${index}`}
                                                className="table-data border-bottom"
                                            >
                                                <td className="table-data py-2 ps-5 text-start" style={{fontWeight:"600",fontSize:"18pxc",olor:"#000000"}}>
                                                    {formatDate(new Date(slotItem?.bookingDate))}  {(() => {
                                                        const times =
                                                            slotItem?.slotTimes?.map(
                                                                (slot) => slot?.time
                                                            ) || [];
                                                        const displayed =
                                                            times?.slice(0, 5).join(", ");
                                                        return times?.length > 5
                                                            ? `${displayed} ...`
                                                            : displayed;
                                                    })()}
                                                </td>
                                                <td className="table-data py-2">
                                                    {slotItem?.courtName || "N/A"}
                                                </td>
                                                <td className="table-data py-2">
                                                    {booking?.bookingType || "N/A"}
                                                </td>

                                                {activeTab === "cancelled" && (
                                                    <td className="py-2">
                                                        {booking?.cancellationReason?.charAt(0).toUpperCase() +
                                                            (booking?.cancellationReason?.slice(1) || "")}
                                                    </td>
                                                )}
                                                {activeTab === "completed" && (
                                                    <td className="text-center py-2">
                                                        {[1, 2, 3, 4, 5].map((star) => {
                                                            const averageRating =
                                                                booking?.customerReview?.reviewRating || 0;
                                                            let iconClass = "bi-star";
                                                            if (star <= Math.floor(averageRating))
                                                                iconClass = "bi-star-fill";
                                                            else if (
                                                                star - averageRating <= 0.5 &&
                                                                star - averageRating > 0
                                                            )
                                                                iconClass = "bi-star-half";
                                                            return (
                                                                <i
                                                                    key={star}
                                                                    className={`bi ${iconClass} ms-2`}
                                                                    style={{
                                                                        color: "#3DBE64",
                                                                        fontSize: "18px",
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </td>
                                                )}
                                                {activeTab === "completed" && (
                                                    <td>
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={
                                                                <Tooltip id="review-tooltip">
                                                                    {booking?.customerReview?.reviewComment?.charAt(0).toUpperCase() +
                                                                        booking?.customerReview?.reviewComment?.slice(1)}
                                                                </Tooltip>
                                                            }
                                                        >
                                                            <span>
                                                                {(() => {
                                                                    const comment = booking?.customerReview?.reviewComment || "No Message";

                                                                    if (comment.length === 0) return "";

                                                                    if (comment.length <= 20) {
                                                                        return comment.charAt(0).toUpperCase() + comment.slice(1);
                                                                    } else if (comment.length < 200) {
                                                                        return (
                                                                            comment.charAt(0).toUpperCase() +
                                                                            comment.slice(1, 20) +
                                                                            "...."
                                                                        );
                                                                    } else {
                                                                        return comment.charAt(0).toUpperCase() + comment.slice(1);
                                                                    }
                                                                })()}
                                                            </span>
                                                        </OverlayTrigger>

                                                    </td>
                                                )}
                                                <td className="py-2"
                                                    style={{
                                                        color: "#1A237E",
                                                        fontSize: "16px",
                                                        fontFamily: "Poppins",
                                                        fontWeight: "500",
                                                    }}
                                                >
                                                    ₹{booking?.totalAmount || "N/A"}
                                                </td>
                                                {activeTab === "cancelled" && (
                                                    <td className="py-2"
                                                        style={{
                                                            color:
                                                                booking?.bookingStatus === "rejected"
                                                                    ? "red"
                                                                    : booking?.bookingStatus === "refunded"
                                                                        ? "green"
                                                                        : "#F29410",
                                                            fontSize: "16px",
                                                            fontFamily: "Poppins",
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        {booking?.bookingStatus === "rejected"
                                                            ? "Rejected"
                                                            : booking?.bookingStatus === "refunded"
                                                                ? "Accepted"
                                                                : "Requested"}
                                                    </td>
                                                )}
                                                <td className="text-center py-2">
                                                    {activeTab === "completed" ? null : (
                                                        <>
                                                            {booking?.bookingStatus === "in-progress" ? (
                                                                <span
                                                                    style={{
                                                                        color: "#F29410",
                                                                        fontSize: "12px",
                                                                        fontWeight: "500",
                                                                        fontFamily: "Poppins",
                                                                    }}
                                                                >
                                                                    Request For Cancellation
                                                                </span>
                                                            ) : booking?.bookingStatus === "refunded" ? (
                                                                <span
                                                                    style={{
                                                                        color: "darkcyan",
                                                                        fontSize: "12px",
                                                                        fontWeight: "600",
                                                                        fontFamily: "Poppins",
                                                                    }}
                                                                >
                                                                    Cancelled
                                                                </span>
                                                            ) : booking?.bookingStatus === "rejected" ? (
                                                                <span
                                                                    style={{
                                                                        color: "red",
                                                                        fontSize: "12px",
                                                                        fontWeight: "600",
                                                                        fontFamily: "Poppins",
                                                                    }}
                                                                >
                                                                    Rejected
                                                                </span>
                                                            ) : booking?.bookingStatus === "completed" ? (
                                                                <span
                                                                    className="text-success"
                                                                    style={{
                                                                        fontSize: "12px",
                                                                        fontWeight: "600",
                                                                        fontFamily: "Poppins",
                                                                    }}
                                                                >
                                                                    Completed
                                                                </span>
                                                            ) : booking?.bookingStatus === "upcoming" && activeTab !== "upcoming" ? (
                                                                <span
                                                                    className="text-info"
                                                                    style={{
                                                                        fontSize: "12px",
                                                                        fontWeight: "600",
                                                                        fontFamily: "Poppins",
                                                                    }}
                                                                >
                                                                    Upcoming
                                                                </span>
                                                            ) : (
                                                                <MdOutlineCancel
                                                                    size={20}
                                                                    onClick={() => {
                                                                        setSelectedBooking(booking);
                                                                        setChangeCancelShow(true);
                                                                        setCourtData({ slotItem, booking });
                                                                        setModalCancel(true);
                                                                    }}
                                                                    className="text-danger"
                                                                    style={{ cursor: "pointer" }}
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                    <FiEye
                                                        size={20}
                                                        className="text-muted ms-2"
                                                        onClick={() => {
                                                            if (activeTab === "cancelled") {
                                                                if (booking?.bookingStatus === "in-progress") {
                                                                    setModalCancel(true);
                                                                    setCourtData({ slotItem, booking });
                                                                } else if (booking?.bookingStatus === "refunded") {
                                                                    setAcceptedRejected(true);
                                                                    setStatusData({ booking, slotItem });
                                                                } else {
                                                                    setAcceptedRejected(true);
                                                                    setStatusData({ booking, slotItem });
                                                                }
                                                            } else if (["upcoming", "cancelled"].includes(activeTab)) {
                                                                if (
                                                                    booking?.bookingStatus === "refunded" ||
                                                                    booking?.bookingStatus === "rejected"
                                                                ) {
                                                                    setAcceptedRejected(true);
                                                                    setStatusData({ booking, slotItem });
                                                                } else if (booking?.customerReview?._id) {
                                                                    setModalCancel(true);
                                                                    setCourtData({ slotItem, booking });
                                                                } else {
                                                                    setModalCancel(true);
                                                                    setCourtData({ slotItem, booking });
                                                                }
                                                            } else if (activeTab === "completed") {
                                                                setShowRatingModal(true);
                                                                setStatusData({ booking, slotItem });
                                                            } else if (activeTab === "all") {
                                                                if (booking?.customerReview?._id) {
                                                                    setModalCancel(true);
                                                                    setCourtData({ slotItem, booking });
                                                                } else if (booking?.bookingStatus === "completed") {
                                                                    setShowRatingModal(true);
                                                                    setStatusData({ booking, slotItem });
                                                                } else if (
                                                                    booking?.bookingStatus === "refunded" ||
                                                                    booking?.bookingStatus === "rejected"
                                                                ) {
                                                                    setAcceptedRejected(true);
                                                                    setStatusData({ booking, slotItem });
                                                                } else if (booking?.bookingStatus === "in-progress") {
                                                                    setModalCancel(true);
                                                                    setCourtData({ slotItem, booking });
                                                                } else {
                                                                    setModalCancel(true);
                                                                    setCourtData({ slotItem, booking });
                                                                }
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
                                        <td
                                            colSpan={8}
                                            className="text-center"
                                            style={{ height: "60vh", verticalAlign: "middle" }}
                                        >
                                            <p className="table-data text-danger">No bookings found.</p>
                                        </td>
                                    </tr>
                                </tbody>
                            )}
                        </Table>
                    </div>
                </Col>
            </Row>

            <Row className=" mb-5">
                <Col className="d-flex mb-3 justify-content-center">
                    <Pagination
                        totalRecords={totalRecords}
                        defaultLimit={10}
                        handlePageChange={handlePageChange}
                        currentPage={currentPage}
                    />
                </Col>
            </Row>

            <BookingHistoryCancelModal
                show={modalCancel}
                onHide={() => setModalCancel(false)}
                booking={selectedBooking}
                isCancelledTab={activeTab === "cancelled"}
                tableData={tableData}
                setChangeCancelShow={setChangeCancelShow}
                changeCancelShow={changeCancelShow}
                activeTab={activeTab}
            />
            <BookingRatingModal
                show={showRatingModal}
                tableData={statusData}
                onHide={() => {
                    setShowRatingModal(false);
                    setRatingBookingIndex(null);
                }}
                onSubmit={({ rating, review }) => {
                    setRatings((prev) => ({
                        ...prev,
                        [ratingBookingIndex]: { rating, review },
                    }));
                    setShowRatingModal(false);
                    setRatingBookingIndex(null);
                }}
                initialRating={
                    ratingBookingIndex !== null
                        ? ratings[ratingBookingIndex]?.rating
                        : 0
                }
                defaultMessage={
                    ratingBookingIndex !== null
                        ? ratings[ratingBookingIndex]?.review
                        : ""
                }
            />
            <CancellationConfirmationModal />
            <AcceptedRejectedModal
                booking={statusData}
                selectedOption={selectedOption}
                onHide={() => setAcceptedRejected(false)}
                show={acceptedRejected}
                tableData={tableData}
            />

            <TokenExpire isTokenExpired={expireModal} />
        </Container>
    );
};

export default BookingHistory;