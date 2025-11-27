import React, { useEffect, useRef, useState } from "react";
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
    Modal,
    Offcanvas,
} from "react-bootstrap";
import { Tab, Tabs } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaSearch, FaTimes } from "react-icons/fa";
import { MdOutlineCancel, MdOutlineDateRange } from "react-icons/md";
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
import { formatDate, formatTime } from "../../../helpers/Formatting";
import TokenExpire from "../../../helpers/TokenExpire";
import ReactDOM from "react-dom";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import ViewMatch from "../VeiwMatch/VeiwMatch";

const BookingHistory = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState("all");
    const [searchDate, setSearchDate] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
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
    const [showViewMatchModal, setShowViewMatchModal] = useState(false);
    const [selectedMatchId, setSelectedMatchId] = useState(null);
    const getBookingData = useSelector((state) => state?.userBooking);
    const User = getUserFromSession();
    const headerRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const a11yProps = (index) => ({
        id: `full-width-tab-${index}`,
        "aria-controls": `full-width-tabpanel-${index}`,
    });

    const defaultLimit = 15

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [dispatch]);

    const buildApiParams = () => {
        const params = {
            type: activeTab === "all" ? "" : activeTab,
            page: currentPage,
            limit: defaultLimit,
        };
        if (startDate) params.startDate = format(startDate, "yyyy-MM-dd");
        if (endDate) params.endDate = format(endDate, "yyyy-MM-dd");
        return params;
    };

    useEffect(() => {
        dispatch(resetBooking());
        dispatch(getBooking(buildApiParams()));
    }, [activeTab, currentPage, startDate, endDate]);


    useEffect(() => {
        if (User?.token) dispatch(getBooking({ page: currentPage, limit: defaultLimit }));
        const club_id = localStorage.getItem("register_club_id");
        if (club_id) dispatch(getReviewClub(club_id));
    }, [User?.token]);

    const handleChange = (event, newValue) => {
        setActiveTab(newValue);
        setCurrentPage(1);
        setSearchDate(null);
        dispatch(resetBooking());
        let type = "";
        if (newValue === "cancelled") type = "cancelled";
        else if (newValue === "upcoming") type = "upcoming";
        else if (newValue === "completed") type = "completed";
        else if (newValue === "all") type = "";
        dispatch(getBooking({ type, page: currentPage, limit: defaultLimit }));
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
    const handlePageChange = (page) => setCurrentPage(page);


    const club_id = localStorage.getItem("register_club_id");
    useEffect(() => {
        if (User?.token) dispatch(getBooking({ page: currentPage, limit: defaultLimit }));
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
                statusMatch = ["in-progress", "refunded", "rejected","cancelled"].includes(status);
            }
        } else if (activeTab === "upcoming") {
            statusMatch = ["upcoming", "in-progress", "rejected"].includes(status);
        }
        else if (activeTab === "completed") {
            statusMatch = status === "completed";
        } else if (activeTab === "all") {
            statusMatch = true;
        } else {
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

    const totalRecords = getBookingData?.bookingData?.total || filterStatus?.length || 0;
    const totalPages = getBookingData?.bookingData?.totalPages || Math.ceil(totalRecords / 10);

    const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return "th ";
        switch (day % 10) {
            case 1: return "st ";
            case 2: return "nd ";
            case 3: return "rd ";
            default: return "th";
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const day = d.getDate();
        const month = d.toLocaleString("en-US", { month: "short" });
        const year = d.getFullYear();
        return `${day}${getOrdinalSuffix(day)}${month}' ${year}`;
    };

    useEffect(() => {
        if (isOpen && headerRef.current) {
            const rect = headerRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
            });
        }
    }, [isOpen]);

    const getReasonText = (booking, full = false) => {
        let text = "No Message";

        if (booking?.bookingStatus === "refunded" && booking?.refundDescription) {
            text = booking.refundDescription;
        } else if (booking?.bookingStatus === "rejected" && booking?.cancellationReasonForOwner) {
            text = booking.cancellationReasonForOwner;
        } else if (booking?.cancellationReason) {
            text = booking.cancellationReason;
        }

        text = text.trim();
        if (!text || text === "No Message") return "No Message";

        const capitalized = text.charAt(0).toUpperCase() + text.slice(1);

        return full ? capitalized : (capitalized.length > 35 ? capitalized.slice(0, 35) + "..." : capitalized);
    };

    return (
        <Container>
            <Row className=" mb-2  mt-md-4 mt-0">
                <Col md={6}>
                    <h3 className="booking-history-heading">Booking History</h3>
                </Col>
            </Row>

            <Box className="mb-1" sx={{ bgcolor: "white" }}>
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
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            "& .MuiTabs-flexContainer": {
                                justifyContent: "start",
                            },
                            "& .MuiTabs-scrollButtons": {
                                display: "none",
                            },
                        }}
                    >
                        {["all", "upcoming", "cancelled", "completed"].map((tab, i) => (
                            <Tab
                                key={tab}
                                label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                                value={tab}
                                {...a11yProps(i)}
                                className="booking-history-tab me-1 ms-0"
                                sx={{
                                    textTransform: "capitalize",
                                    borderRadius: "50px",
                                    color: "#000000",
                                    px: { xs: 1.5, md: 3 },
                                    py: { xs: 0.5, md: 1 },
                                    mx: 0.2,
                                    minWidth: { xs: "auto", md: "auto" },
                                    minHeight: { xs: "32px", md: "38px" },
                                    height: { xs: "32px", md: "38px" },
                                    fontSize: { xs: "12px", md: "14px" },
                                    fontFamily: 'Poppins',
                                    fontWeight: "500",
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
                <Col xs={12} md={9} className="mb-3 mb-md-0">
                    <h2 className="step-heading mt-md-2 mt-0">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Booking
                    </h2>
                </Col>

                <Col
                    xs={12}
                    md={3}
                    className="d-flex flex-row gap-2 justify-content-md-end align-items-center"
                >
                    <InputGroup
                        className="rounded d-flex p-1 align-items-center justify-content-between"
                        style={{ backgroundColor: "#FAFBFF" }}
                    >
                        <div className="col-10 d-flex align-items-center ">
                            <InputGroup.Text className="bg-light border-0 px-2">
                                <MdOutlineDateRange size={16} className="text-muted" />
                            </InputGroup.Text>

                            <DatePicker
                                selectsRange
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(update) => setDateRange(update)}
                                dateFormat="dd/MM/yy"
                                placeholderText="dd/mm/yy – dd/mm/yy"
                                className="form-control border-0 bg-transparent shadow-none custom-datepicker-input"
                            />

                        </div>
                        <div className="col-2">

                            {(startDate || endDate) && (
                                <InputGroup.Text
                                    className=" border-0 px-1 d-flex align-items-center justify-content-end"
                                    onClick={() => setDateRange([null, null])}
                                    style={{ cursor: "pointer", background: "transparent" }}
                                >
                                    <FaTimes className="text-danger" />
                                </InputGroup.Text>
                            )}
                        </div>
                    </InputGroup>
                </Col>

            </Row>

            <Row className="mb-4">
                <Col md={12}>
                    <div
                        className="custom-scroll-container flex-grow-1"
                        style={{
                            overflowY: "hidden",
                            overflowX: "hidden",
                            flex: "1 1 auto",
                            maxHeight: "calc(100vh - 300px)",
                        }}
                    >
                        <Table borderless responsive size="sm" className="booking-table p-0 position-relative" style={{ borderCollapse: "collapse" }}>
                            <thead style={{ height: "48px", overflow: "hidden" }}>
                                <tr className="p-0">
                                    <th className="text-start ps-5" style={{ borderRadius: "15px 0 0 0", minHeight: "48px", padding: "8px 0", }}>Booking Date / Time</th>
                                    <th className="text-center" style={{ minHeight: "48px", padding: "8px 0" }}>Court Name</th>
                                    <th style={{ minHeight: "48px", padding: "8px 0" }}>Booking Type</th>
                                    {activeTab === "cancelled" && <th style={{ minHeight: "48px", padding: "8px 0" }}>Reason</th>}
                                    {activeTab === "completed" && <th style={{ minHeight: "48px", padding: "8px 0" }}>Rating</th>}
                                    {activeTab === "completed" && <th style={{ minHeight: "48px", padding: "8px 0" }}>Message</th>}
                                    <th style={{ minHeight: "48px", padding: "8px 0" }}>Amount</th>
                                    {activeTab === "cancelled" && (
                                        <th className="position-relative" style={{ padding: "8px 0" }}>
                                            <div className="dropdown-wrapper">
                                                {/* Header */}
                                                <div
                                                    ref={headerRef}
                                                    className="dropdown-header table-data"
                                                    onClick={() => setIsOpen(!isOpen)}
                                                    style={{
                                                        // minHeight: "48px",
                                                        padding: "0px 8px",
                                                        cursor: "pointer",
                                                        background: "transparent",
                                                        borderRadius: "4px",
                                                    }}
                                                >
                                                    Status{" "}
                                                    <b className="arrow">
                                                        <i className="bi bi-chevron-down text-dark fw-bold"></i>
                                                    </b>
                                                </div>
                                            </div>

                                            {/* Dropdown menu rendered in body */}
                                            {isOpen &&
                                                ReactDOM.createPortal(
                                                    <div
                                                        className="dropdown-list text-start"
                                                        style={{
                                                            position: "absolute",
                                                            top: `${dropdownPosition.top}px`,
                                                            left: `${dropdownPosition.left}px`,
                                                            zIndex: 1000,
                                                            background: "white",
                                                            border: "1px solid #ddd",
                                                            borderRadius: "4px",
                                                            padding: "4px 8px",
                                                            minWidth: "120px",
                                                            maxWidth: "150px",
                                                            maxHeight: "200px",
                                                            overflowY: "auto",
                                                            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                                        }}
                                                    >
                                                        <div className="mb-1" onClick={() => handleSelect("All")}>
                                                            All
                                                        </div>
                                                        <div className="mb-1" onClick={() => handleSelect("Accepted")}>
                                                            Accepted
                                                        </div>
                                                        <div className="mb-1" onClick={() => handleSelect("Rejected")}>
                                                            Rejected
                                                        </div>
                                                        <div className="mb-1" onClick={() => handleSelect("Requested")}>
                                                            Requested
                                                        </div>
                                                    </div>,
                                                    document.body
                                                )}
                                        </th>
                                    )}
                                    <th style={{ borderRadius: "0 15px 0 0", minHeight: "48px", padding: "8px 0" }}>Action</th>
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
                                <tbody className="">
                                    {filterStatus?.map((booking, i) =>
                                        booking?.slot?.map((slotItem, index) => (
                                            <tr key={`${i}-${index}`} className="border-bottom">
                                                <td className="table-data py-1 pt-2 ps-5 text-start" style={{ fontWeight: "570", fontSize: "16px", color: "#000000", width: "20%" }}>
                                                    {formatDate(booking?.bookingDate)} | {(() => {
                                                        const times = slotItem?.slotTimes?.map((slot) => {
                                                            const time = slot?.time;
                                                            return time ? formatTime(time) : "";
                                                        }) || [];
                                                        const displayed = times?.slice(0, 5).join(", ");
                                                        return times?.length > 5 ? `${displayed} ...` : displayed;
                                                    })()}
                                                </td>
                                                <td className="table-data pt-2 py-1" >
                                                    {slotItem?.courtName || "N/A"}
                                                </td>
                                                <td className="table-data pt-2 py-1">
                                                    {booking?.bookingType.charAt(0).toUpperCase() + (booking?.bookingType?.slice(1)) || "N/A"}
                                                </td>

                                                {activeTab === "cancelled" && (

                                                    <td className="py-1 table-data pt-2">
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={
                                                                <Tooltip id={`reason-tooltip-${booking?._id}`}>
                                                                    {getReasonText(booking, true)}
                                                                </Tooltip>
                                                            }
                                                        >
                                                            <span>
                                                                {getReasonText(booking, false)}
                                                            </span>
                                                        </OverlayTrigger>
                                                    </td>


                                                )}
                                                {activeTab === "completed" && (
                                                    <td className="text-center pt-2 py-1">
                                                        {[1, 2, 3, 4, 5].map((star) => {
                                                            const averageRating = booking?.customerReview?.reviewRating || 0;
                                                            const diff = star - averageRating;
                                                            let IconComponent;
                                                            if (star <= Math.floor(averageRating)) {
                                                                IconComponent = <StarIcon sx={{ color: "#3DBE64", fontSize: 20 }} />;
                                                            } else if (diff <= 0.5 && diff > 0) {
                                                                IconComponent = <StarHalfIcon sx={{ color: "#3DBE64", fontSize: 20 }} />;
                                                            } else {
                                                                IconComponent = <StarBorderIcon sx={{ color: "#3DBE64", fontSize: 20 }} />;
                                                            }

                                                            return (
                                                                <span key={star} className="ms-1">
                                                                    {IconComponent}
                                                                </span>
                                                            );
                                                        })}
                                                    </td>
                                                )}
                                                {activeTab === "completed" && (
                                                    <td className="py-1 table-data pt-2">
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={
                                                                <Tooltip id="review-tooltip">
                                                                    {booking?.customerReview?.reviewComment
                                                                        ? booking.customerReview.reviewComment.charAt(0).toUpperCase() +
                                                                        booking.customerReview.reviewComment.slice(1)
                                                                        : "No Message"}
                                                                </Tooltip>
                                                            }
                                                        >
                                                            <span>
                                                                {(() => {
                                                                    const comment = booking?.customerReview?.reviewComment?.trim() || "No Message";
                                                                    if (!comment) return "No Message";

                                                                    const shortText =
                                                                        comment.length > 35
                                                                            ? comment.charAt(0).toUpperCase() + comment.slice(1, 35) + "..."
                                                                            : comment.charAt(0).toUpperCase() + comment.slice(1);

                                                                    return shortText;
                                                                })()}
                                                            </span>
                                                        </OverlayTrigger>
                                                    </td>

                                                )}
                                                <td className="py-1 pt-2"
                                                    style={{
                                                        color: "#1A237E",
                                                    }}
                                                >
                                                    <span style={{ fontFamily: "italic", }}>  ₹ </span>{booking?.totalAmount || "N/A"}
                                                </td>
                                                {activeTab === "cancelled" && (
                                                    <td className="py-1 pt-2"
                                                        style={{
                                                            color:
                                                                booking?.bookingStatus === "rejected"
                                                                    ? "red"
                                                                    : booking?.bookingStatus === "refunded"
                                                                        ? "green"
                                                                        : "#F29410",
                                                            fontSize: "12px",
                                                            fontWeight: "500",
                                                            fontFamily: "Poppins",
                                                        }}
                                                    >
                                                        {booking?.bookingStatus === "rejected"
                                                            ? "Rejected"
                                                            : booking?.bookingStatus === "refunded"
                                                                ? "Accepted"
                                                                : "Requested"}
                                                    </td>
                                                )}
                                                <td className="text-center py-1 pt-2">
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        {activeTab !== "completed" && booking?.bookingStatus !== "completed" ? (
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
                                                                        Request  Cancellation
                                                                    </span>
                                                                ) : booking?.bookingStatus === "refunded" || booking?.bookingStatus === "cancelled" ? (
                                                                    <span
                                                                        style={{
                                                                            color:booking?.bookingStatus === "cancelled" ? "red" : "darkcyan",
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
                                                                ) 
                                                                    : booking?.bookingStatus === "upcoming" &&
                                                                        activeTab !== "upcoming" ? (
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
                                                        ) : (
                                                            booking?.bookingStatus === "completed" && (
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
                                                            )
                                                        )
                                                        }

                                                        <span style={{ minWidth: "24px", display: "flex", justifyContent: "center" }}>
                                                            <FiEye
                                                                size={20}
                                                                className="text-muted"
                                                                onClick={() => {

                                                                    // Check if booking type is open match
                                                                    if (booking?.bookingType === "open Match" && booking?.bookingStatus === 'upcoming') {
                                                                        setSelectedMatchId(booking?.openMatchId || booking?._id);
                                                                        setShowViewMatchModal(true);
                                                                        return;
                                                                    }
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
                                                                        }
                                                                        else if (booking?.customerReview?._id) {
                                                                            setModalCancel(true);
                                                                            setCourtData({ slotItem, booking });
                                                                        }
                                                                        else {
                                                                            setModalCancel(true);
                                                                            setCourtData({ slotItem, booking });
                                                                        }
                                                                    } else if (activeTab === "completed") {
                                                                        setShowRatingModal(true);
                                                                        setStatusData({ booking, slotItem });
                                                                    } else if (activeTab === "all") {
                                                                        if (booking?.customerReview?._id) {
                                                                            setShowRatingModal(true);
                                                                            setCourtData({ slotItem, booking });
                                                                            setStatusData({ booking, slotItem });
                                                                        } else if (booking?.bookingStatus === "completed") {
                                                                            setShowRatingModal(true);
                                                                            setStatusData({ booking, slotItem });
                                                                        } else if (
                                                                            booking?.bookingStatus === "refunded" ||
                                                                            booking?.bookingStatus === "rejected" || booking?.bookingStatus === "cancelled"
                                                                        ) {
                                                                            setAcceptedRejected(true);
                                                                            setStatusData({ booking, slotItem });
                                                                        } else if (booking?.bookingStatus === "in-progress" ) {
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
                                                        </span>
                                                    </div>
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
            {totalPages > 1 && (
                <Row className="mb-5">
                    <Col className="d-flex justify-content-center">
                        <Pagination
                            totalRecords={totalRecords}
                            defaultLimit={defaultLimit}
                            handlePageChange={handlePageChange}
                            currentPage={currentPage}
                        />
                    </Col>
                </Row>
            )}
            <BookingHistoryCancelModal
                show={modalCancel}
                onHide={() => setModalCancel(false)}
                booking={selectedBooking}
                isCancelledTab={activeTab === "cancelled"}
                tableData={tableData}
                setChangeCancelShow={setChangeCancelShow}
                changeCancelShow={changeCancelShow}
                activeTab={activeTab}
                currentPage={currentPage}
            />
            <BookingRatingModal
                show={showRatingModal}
                tableData={statusData}
                activeTab={activeTab}
                currentPage={currentPage}
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

            {/* ViewMatch Modal */}
            <Offcanvas
                show={showViewMatchModal}
                onHide={() => setShowViewMatchModal(false)}
                placement="end"
                className="view-match-offcanvas"
            >
                <Offcanvas.Header closeButton className="border-0">
                    <Offcanvas.Title>Match Details</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    {selectedMatchId && (
                        <ViewMatch
                            match={{ _id: selectedMatchId }}
                            onBack={() => setShowViewMatchModal(false)}
                        />
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </Container>
    );
};

export default BookingHistory;




