import React from "react";
import { useEffect, useState } from "react";
import { Row, Col, Container, Table, Card, Form, Button, ListGroup, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDateRange, MdOutlineDateRange } from "react-icons/md";
import { FaTimes, FaSearch, FaFilter, FaCheckCircle, FaTimesCircle, FaBuilding } from "react-icons/fa";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { useSuperAdminContext } from "../../../contexts/SuperAdminContext";
import { FaEye, FaChartLine } from "react-icons/fa";
import {
  BsArrowUpRightCircleFill,
  BsFillArrowDownLeftCircleFill,
} from "react-icons/bs";
import { formatDate } from "../../../helpers/Formatting";
import {
  SUPER_ADMIN_GET_CLUB_PAYMENTS,
  SUPER_ADMIN_GET_CLUB_PAYMENT_BY_ID,
  SUPER_ADMIN_GET_ALL_CLUBS,
  SUPER_ADMIN_PAYMENT_DASHBOARD_COUNTS,
  SUPER_ADMIN_GET_UNPAID_BOOKINGS,
  GET_BOOKING_DETAILS_BY_ID,
} from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { PaymentDetailsModal } from "./modals/PaymentDetailModal";
import { CreatePaymentModal } from "./modals/CreatePaymentModal";
import Pagination from "../../../helpers/Pagination";

const Payments = () => {
  const { selectedOwnerId } = useSuperAdminContext();
  const Owner = getOwnerFromSession();
  const ownerData = Owner?.user || Owner;
  const isSuperAdmin = ownerData?.role === 'super_admin';
  // ✅ SUPER ADMIN: Use selectedOwnerId if explicitly set, otherwise null (for "All Owners")
  // For non-super-admin, use logged-in owner's ID
  const ownerId = isSuperAdmin 
    ? (selectedOwnerId || null)  // null when "All Owners" is selected
    : (getOwnerFromSession()?._id);
  
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Sidebar filters
  const [selectedClubId, setSelectedClubId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("unpaid"); // "paid" or "unpaid"
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);
console.log(selectedPayments,'selectedPayments');

  const setDateRange = (update) => {
    setStartDate(update[0]);
    setEndDate(update[1]);
  };

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const canSelectBookings =
    (!isSuperAdmin ? true : Boolean(selectedOwnerId && selectedClubId)) &&
    paymentStatus === "unpaid";
  const [tab, setTab] = useState(0);

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
    setPaymentStatus(newValue === 0 ? "unpaid" : "paid");
    setCurrentPage(1);
  };

  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const selectedClub = clubs.find((club) => club._id === selectedClubId);

  // Filter payments by selected club (fallback if API doesn't filter)
  const filteredPayments = selectedClubId
    ? payments.filter((p) =>
        p?.register_club_id?._id === selectedClubId ||
        p?.clubId?._id === selectedClubId ||
        p?.club?._id === selectedClubId
      )
    : payments;

  const sendDate = startDate && endDate;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setPaymentsLoading(true);
        const payload = {
          // ✅ SUPER ADMIN: Only include ownerId if explicitly set (not null)
          // If ownerId is null (All Owners selected), don't include it in payload
          ...(ownerId ? { ownerId } : {}),
          ...(selectedClubId ? { clubId: selectedClubId } : {}),
          ...(paymentStatus ? { status: paymentStatus } : {}),
          page: currentPage,
          limit: 15,
        };
        if (sendDate) {
          const formatToYYYYMMDD = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };
          payload.startDate = formatToYYYYMMDD(startDate);
          payload.endDate = formatToYYYYMMDD(endDate);
        }

        const query = new URLSearchParams(payload).toString();
        const endpoint =
          paymentStatus === "unpaid"
            ? SUPER_ADMIN_GET_UNPAID_BOOKINGS
            : SUPER_ADMIN_GET_CLUB_PAYMENTS;
        const res = await ownerApi.get(query ? `${endpoint}?${query}` : endpoint);
        const data = res?.data?.data;
        if (paymentStatus === "unpaid") {
          setPayments(data?.bookings || []);
        } else {
          setPayments(data?.payments || []);
        }
        setTotalRecords(data?.pagination?.totalItems || 0);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setPayments([]);
        setTotalRecords(0);
      } finally {
        setPaymentsLoading(false);
      }
    };

    fetchPayments();
  }, [tab, sendDate, currentPage, ownerId, isSuperAdmin, selectedOwnerId, selectedClubId, paymentStatus, refreshKey]);
  const [loadingPaymentId, setLoadingPaymentId] = useState(null);

  const handlePaymentDetails = async (id) => {
    try {
      if (paymentStatus === "unpaid") {
        const res = await ownerApi.get(`${GET_BOOKING_DETAILS_BY_ID}?_id=${id}`);
        const booking = res?.data?.booking;
        if (booking) {
          setPaymentDetails(booking);
          setShowPaymentDetails(true);
        }
      } else {
        const res = await ownerApi.get(`${SUPER_ADMIN_GET_CLUB_PAYMENT_BY_ID}/${id}`);
        if (res?.data?.data) {
          setPaymentDetails(res.data.data);
          setShowPaymentDetails(true);
        }
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
    } finally {
    }
  };

  const [paymentCounts, setPaymentCounts] = useState({
    totalAmountToday: 0,
    totalAmountMonth: 0,
    totalRefunded: 0
  });
  const [loadingCounts, setLoadingCounts] = useState(false);

  // Fetch payment dashboard counts
  useEffect(() => {
    const fetchPaymentCounts = async () => {
      try {
        setLoadingCounts(true);
        // ✅ Only include ownerId in URL if it's explicitly set (not null)
        const url = ownerId 
          ? `${SUPER_ADMIN_PAYMENT_DASHBOARD_COUNTS}?ownerId=${ownerId}` 
          : SUPER_ADMIN_PAYMENT_DASHBOARD_COUNTS;
        const res = await ownerApi.get(url);
        if (res?.data?.success) {
          setPaymentCounts(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching payment counts:", error);
      } finally {
        setLoadingCounts(false);
      }
    };
    fetchPaymentCounts();
  }, [ownerId, refreshKey]);

  // Fetch clubs for filter
  useEffect(() => {
    const fetchClubs = async () => {
      if (!isSuperAdmin) {
        setClubs([]);
        return;
      }
      try {
        setLoadingClubs(true);
        const { ownerApi } = await import("../../../helpers/api/apiCore");
        const { SUPER_ADMIN_GET_ALL_CLUBS } = await import("../../../helpers/api/apiEndpoint");
        const url = ownerId
          ? `${SUPER_ADMIN_GET_ALL_CLUBS}?ownerId=${ownerId}`
          : SUPER_ADMIN_GET_ALL_CLUBS;
        const res = await ownerApi.get(url);
        setClubs(res?.data?.data || []);
      } catch (error) {
        console.error("Error fetching clubs:", error);
        setClubs([]);
      } finally {
        setLoadingClubs(false);
      }
    };
    fetchClubs();
  }, [isSuperAdmin, ownerId]);

  const formatAmount = (amount) => {
    if (!amount) return "₹0";
    if (amount >= 1000000) {
      return `₹${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const summaryCards = [
    {
      title: "Today",
      value: formatAmount(paymentCounts.totalAmountToday),
      percent: "+15%",
      icon: <BsArrowUpRightCircleFill />,
      color: "success",
      bigicon: <FaChartLine size={24} />,
    },
    {
      title: "Monthly",
      value: formatAmount(paymentCounts.totalAmountMonth),
      percent: "-3.5%",
      icon: <BsFillArrowDownLeftCircleFill />,
      color: "danger",
      bigicon: <FaChartLine size={24} />,
    },
    {
      title: "Unpaid",
      value: formatAmount(paymentCounts.totalRefunded),
      percent: "-",
      icon: <BsFillArrowDownLeftCircleFill />,
      color: "danger",
      bigicon: <FaChartLine size={24} />,
    },
  ];

  const totalRecordsCount = totalRecords || 0;
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle checkbox selection
  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedPayments(payments.map(p => p._id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (id) => {
    if (selectedPayments.includes(id)) {
      setSelectedPayments(selectedPayments.filter(p => p !== id));
    } else {
      setSelectedPayments([...selectedPayments, id]);
    }
  };

  useEffect(() => {
    if (paymentStatus !== "unpaid") {
      setSelectedPayments([]);
      setSelectAll(false);
      setSelectedTotal(0);
      return;
    }
    if (!canSelectBookings) {
      setSelectedPayments([]);
      setSelectAll(false);
      setSelectedTotal(0);
      return;
    }
    const total = payments
      .filter((p) => selectedPayments.includes(p._id))
      .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    setSelectedTotal(total);
  }, [selectedPayments, payments, paymentStatus, canSelectBookings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [paymentStatus, selectedClubId, selectedOwnerId]);

  // Calculate totals
  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalUnpaid = payments.filter(p => p.status === "unpaid").reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleCreatePayment = (paymentId = null) => {
    setCurrentPaymentId(paymentId);
    setShowCreatePayment(true);
  };

  return (
    <Container fluid className="px-0 px-md-0 mt-md-0 mt-2">
      <style>
        {`
          .payment-card-hover {
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .payment-card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
          }
          .filter-section {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          }
          .table-row-hover:hover {
            background-color: #f8f9fa !important;
            transform: scale(1.01);
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          .action-button {
            transition: all 0.3s ease;
          }
          .action-button:hover {
            transform: scale(1.1);
          }
          .badge-custom {
            font-weight: 500;
            letter-spacing: 0.3px;
          }
        `}
      </style>
      <Row className="mb-2">
        {summaryCards.map((card, index) => (
          <Col key={index} md={4} className="mb-2">
            <Card className="shadow-sm border-0 rounded-3 h-100" style={{ border: "1px solid #e9ecef" }}>
              <Card.Body className="p-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-0" style={{ fontSize: "10px", fontWeight: "500", textTransform: "uppercase" }}>{card.title}</p>
                    <h4 className="mb-0" style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a" }}>{card.value}</h4>
                  </div>
                  <div style={{ opacity: "0.15", color: "#6c757d" }}>{card.bigicon}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {/* <Row className="mb-4">
        <Col xs={12}>
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-lg-center gap-3 bg-white p-3 rounded shadow-sm">
            <Box sx={{ width: { xs: "100%", lg: "auto" } }}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{
                  "& .MuiTab-root": {
                    fontSize: { xs: "13px", sm: "13px", lg: "14px" },
                    minWidth: { xs: "120px", sm: "140px" },
                    fontWeight: "600",
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    padding: "12px 16px",
                  },
                }}
              >
                <Tab label="Recent Transactions" />
                <Tab label="Refund Transactions" />
              </Tabs>
            </Box>

            <div className="d-flex align-items-center gap-2">
              {!showDatePicker && !startDate && !endDate ? (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="d-flex align-items-center gap-2"
                  onClick={() => setShowDatePicker(true)}
                  style={{ borderRadius: "6px", padding: "8px 16px" }}
                >
                  <MdOutlineDateRange size={18} />
                  <span>Select Date</span>
                </Button>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center rounded p-1"
                  style={{
                    backgroundColor: "#FAFBFF",
                    maxWidth: "280px",
                    height: "38px",
                    border: "1px solid #dee2e6",
                    gap: "8px",
                  }}
                >
                  <div className="px-2">
                    <MdOutlineDateRange size={16} className="text-muted" />
                  </div>
                  <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                      setDateRange(update);
                      const [start, end] = update;
                      if (start && end) {
                        setShowDatePicker(false);
                      }
                    }}
                    dateFormat="dd/MM/yy"
                    placeholderText="DD/MM/YY – DD/MM/YY"
                    className="form-control border-0 bg-transparent shadow-none custom-datepicker-input"
                    open={showDatePicker}
                    onClickOutside={() => setShowDatePicker(false)}
                  />
                  {(startDate || endDate) && (
                    <div
                      className="px-2"
                      onClick={() => {
                        setDateRange([null, null]);
                        setShowDatePicker(false);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <FaTimes size={14} className="text-danger" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row> */}

      <Row className="g-1">
        {/* Sidebar */}
        <Col lg={2} md={3} className="pe-1">
          <div className="bg-white rounded-3 shadow-sm p-2 h-100" >
            <div className="d-flex align-items-center mb-2 pb-2 border-bottom">
              <FaFilter className="text-primary me-1" size={12} />
              <h6 className="mb-0 fw-bold" style={{ fontSize: "13px" }}>Filters</h6>
            </div>
          {!canSelectBookings && paymentStatus === "unpaid" && (
            <div className="alert alert-warning py-1 px-2 mb-2" style={{ fontSize: "11px" }}>
              Select an owner and a club to choose bookings.
            </div>
          )}
            
            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold mb-1" style={{ fontSize: "13px", color: "#6c757d" }}>Status</Form.Label>
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${paymentStatus === "paid" ? "btn-success" : "btn-outline-success"}`}
                  style={{ borderRadius: "4px 0 0 4px", fontSize: "12px", padding: "6px 8px" }}
                  onClick={() => {
                    setPaymentStatus("paid");
                    setTab(1);
                    setCurrentPage(1);
                  }}
                >
                  <FaCheckCircle size={10} className="me-1" />
                  Paid
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${paymentStatus === "unpaid" ? "btn-danger" : "btn-outline-danger"}`}
                  style={{ borderRadius: "0 4px 4px 0", fontSize: "12px", padding: "6px 8px" }}
                  onClick={() => {
                    setPaymentStatus("unpaid");
                    setTab(0);
                    setCurrentPage(1);
                  }}
                >
                  <FaTimesCircle size={10} className="me-1" />
                  Unpaid
                </button>
              </div>
            </Form.Group>

            <div className="mt-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: "11px", color: "#6c757d", fontWeight: "600" }}>CLUBS</span>
                <Badge bg="primary" style={{ fontSize: "10px" }}>{clubs.length}</Badge>
              </div>
              <div style={{ maxHeight: "calc(100vh - 400px)", overflowY: "auto" }}>
                <ListGroup variant="flush">
                  {clubs.map((club) => (
                    <ListGroup.Item
                      key={club._id}
                      action
                      active={selectedClubId === club._id}
                      onClick={() => setSelectedClubId(selectedClubId === club._id ? "" : club._id)}
                      className="px-2 py-2"
                      style={{
                        cursor: "pointer",
                        borderLeft: selectedClubId === club._id ? "3px solid #4361ee" : "3px solid transparent",
                        fontSize: "12px",
                        transition: "all 0.2s"
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-2"
                          style={{
                            width: "28px",
                            height: "28px",
                            backgroundColor: selectedClubId === club._id ? "#fff" : "#e7f3ff",
                            color: selectedClubId === club._id ? "#4361ee" : "#4361ee"
                          }}
                        >
                          <FaBuilding size={12} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold" style={{ fontSize: "11px" }}>{club.clubName}</div>
                        </div>
                        <div className="text-end">
                          <Badge 
                            bg={selectedClubId === club._id ? "light" : "secondary"} 
                            text={selectedClubId === club._id ? "primary" : "white"}
                            style={{ fontSize: "9px" }}
                          >
                            {club.transactionCount || 0}
                          </Badge>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </div>

            {/* <div className="mt-3 pt-2 border-top">
              <h6 className="fw-bold mb-2" style={{ fontSize: "12px", color: "#6c757d", textTransform: "uppercase" }}>Summary</h6>
              <div className="bg-light rounded p-2 mb-1" style={{ borderLeft: "2px solid #28a745" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "12px", color: "#6c757d" }}>Paid</span>
                  <span className="fw-bold text-success" style={{ fontSize: "12px" }}>₹{totalPaid.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-light rounded p-2" style={{ borderLeft: "2px solid #dc3545" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "12px", color: "#6c757d" }}>Unpaid</span>
                  <span className="fw-bold text-danger" style={{ fontSize: "12px" }}>₹{totalUnpaid.toLocaleString()}</span>
                </div>
              </div>
            </div> */}
          </div>
        </Col>

        <Col lg={10} md={9} className="ps-0">
          <div className="bg-white rounded-3 shadow-sm p-3" style={{ border: "1px solid #e9ecef" }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 pb-3 border-bottom gap-3">
              <div>
                <h5 className="mb-1 fw-bold" style={{ fontSize: "16px", color: "#1a1a1a" }}>
                  {selectedClub ? `${selectedClub.clubName} - ` : ""}Transactions
                </h5>
                <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                  {`Total ${filteredPayments.length} ${paymentStatus === "unpaid" ? "booking" : "payment"}${filteredPayments.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleCreatePayment()}
                disabled={paymentStatus !== "unpaid" || selectedPayments.length === 0 || !canSelectBookings}
                className="d-flex align-items-center gap-2"
                style={{ borderRadius: "6px", fontWeight: "500", fontSize: "13px", padding: "8px 16px" }}
              >
                <span>Create Payment</span>
              </Button>
            </div>

            {paymentsLoading ? (
              <DataLoading height="60vh" />
            ) : (
              <>
                {filteredPayments?.length > 0 ? (
                  <>
                    <div className="custom-scroll-container d-none d-md-block" style={{ overflowX: "auto" }}>
                      <Table
                        responsive
                        hover
                        className="custom-table align-middle"
                        style={{ minWidth: "800px" }}
                      >
                        <thead style={{ backgroundColor: "#4361ee", color: "white" }}>
                          <tr>
                            <th style={{ width: "50px", padding: "14px", borderTopLeftRadius: "6px" }}>
                              {paymentStatus === "unpaid" && (
                                <Form.Check
                                  type="checkbox"
                                  checked={selectAll}
                                  onChange={handleSelectAll}
                                  disabled={!canSelectBookings}
                                  style={{ accentColor: "white" }}
                                />
                              )}
                            </th>
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Club</th>
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Owner</th>
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              {paymentStatus === "unpaid" ? "Booking Date" : "Paid Date"}
                            </th>
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              {paymentStatus === "unpaid" ? "Booking Status" : "Status"}
                            </th>
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Amount</th>
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", borderTopRightRadius: "6px" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPayments?.map((item, index) => (
                            <tr
                              key={item?._id}
                              className="border-bottom"
                              style={{ 
                                backgroundColor: selectedPayments.includes(item._id) ? "#f0f8ff" : "white",
                                transition: "background-color 0.2s"
                              }}
                            >
                              <td style={{ padding: "12px" }}>
                                {paymentStatus === "unpaid" && (
                                  <Form.Check
                                    type="checkbox"
                                    checked={selectedPayments.includes(item._id)}
                                    onChange={() => handleSelectPayment(item._id)}
                                    disabled={!canSelectBookings}
                                  />
                                )}
                              </td>
                              <td style={{ padding: "12px", fontWeight: "500" }}>
                                {paymentStatus === "unpaid" ? item?.register_club_id?.clubName : item?.clubId?.clubName || "N/A"}
                              </td>
                              <td style={{ padding: "12px", color: "#6c757d" }}>
                                {paymentStatus === "unpaid"
                                  ? item?.ownerId?.name || item?.register_club_id?.ownerId?.name || "N/A"
                                  : item?.ownerId?.name || item?.clubId?.ownerId?.name || "N/A"}
                              </td>
                              <td style={{ padding: "12px" }}>
                                <span className="fw-medium" style={{ fontSize: "13px" }}>
                                  {formatDate(paymentStatus === "unpaid" ? item?.bookingDate : item?.paidDate)}
                                </span>
                              </td>
                              <td style={{ padding: "12px" }}>
                                <span className="badge bg-light text-dark" style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "6px" }}>
                                  {paymentStatus === "unpaid"
                                    ? item?.bookingStatus?.slice(0, 1)?.toUpperCase()?.concat(item?.bookingStatus?.slice(1)) || "-"
                                    : item?.status?.slice(0, 1)?.toUpperCase()?.concat(item?.status?.slice(1)) || "-"}
                                </span>
                              </td>
                              <td style={{ padding: "12px", fontWeight: "600", color: "#28a745", fontSize: "14px" }}>
                                ₹{paymentStatus === "unpaid" ? item?.totalAmount || 0 : item?.amount || 0}
                              </td>
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <div
                                  className="d-inline-flex align-items-center justify-content-center"
                                  style={{ 
                                    cursor: "pointer",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    backgroundColor: "#e7f3ff",
                                    transition: "all 0.2s"
                                  }}
                                  onClick={() => handlePaymentDetails(item?._id)}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#cce5ff"}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e7f3ff"}
                                >
                                  {loadingPaymentId === item?._id ? (
                                    <ButtonLoading color="blue" size={7} />
                                  ) : (
                                    <FaEye className="text-primary" size={16} />
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    <div className="mobile-card-table d-block d-md-none">
                      {filteredPayments?.map((item) => (
                        <div key={item?._id} className="card mb-2">
                          <div className="card-body">
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Club:</span>
                              <span className="mobile-card-value">
                                {paymentStatus === "unpaid" ? item?.register_club_id?.clubName : item?.clubId?.clubName || "N/A"}
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Owner:</span>
                              <span className="mobile-card-value">
                                {paymentStatus === "unpaid"
                                  ? item?.ownerId?.name || item?.register_club_id?.ownerId?.name || "N/A"
                                  : item?.ownerId?.name || item?.clubId?.ownerId?.name || "N/A"}
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Date:</span>
                              <span className="mobile-card-value">
                                {formatDate(paymentStatus === "unpaid" ? item?.bookingDate : item?.paidDate)}
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Status:</span>
                              <span className="mobile-card-value">
                                {paymentStatus === "unpaid" ? item?.bookingStatus || "-" : item?.status || "-"}
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Amount:</span>
                              <span className="mobile-card-value">
                                ₹{paymentStatus === "unpaid" ? item?.totalAmount || 0 : item?.amount || 0}
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Action:</span>
                              <div className="mobile-card-value">
                                {loadingPaymentId === item?._id ? (
                                  <ButtonLoading color="blue" size={7} />
                                ) : (
                                  <FaEye
                                    className="text-primary"
                                    onClick={() =>
                                      handlePaymentDetails(item?._id)
                                    }
                                    size={18}
                                    style={{ cursor: "pointer" }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div
                    className="d-flex text-danger justify-content-center align-items-center"
                    style={{ height: "60vh" }}
                  >
                    No
                    <span className="px-1">
                      {paymentStatus === "unpaid"
                        ? "Unpaid bookings found!"
                        : "Paid transactions found!"}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col className="d-flex justify-content-center">
          <Pagination
            totalRecords={totalRecordsCount}
            defaultLimit={15}
            handlePageChange={handlePageChange}
            currentPage={currentPage}
          />
        </Col>
      </Row>
      <PaymentDetailsModal
        show={showPaymentDetails}
        handleClose={() => setShowPaymentDetails(false)}
        paymentDetails={paymentDetails}
      />
      <CreatePaymentModal
        show={showCreatePayment}
        handleClose={() => {
          setShowCreatePayment(false);
          setCurrentPaymentId(null);
        }}
        selectedClubId={selectedClubId}
        selectedBookingIds={selectedPayments}
        totalAmount={selectedTotal}
        onCreated={() => {
          setCurrentPage(1);
          setRefreshKey((prev) => prev + 1);
        }}
      />
    </Container>
  );
};

export default Payments;
