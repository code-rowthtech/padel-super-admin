import React from "react";
import { useEffect, useState, useMemo, useRef } from "react";
import { Row, Col, Container, Table, Card, Form, Button, ListGroup, Badge, Offcanvas } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDateRange, MdOutlineDateRange } from "react-icons/md";
import { FaTimes, FaSearch, FaFilter, FaCheckCircle, FaTimesCircle, FaBuilding, FaDownload, FaFileExcel } from "react-icons/fa";
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
  SUPER_ADMIN_UPDATE_PAYMENT_STATUS,
} from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { PaymentDetailsModal } from "./modals/PaymentDetailModal";
import { CreatePaymentModal } from "./modals/CreatePaymentModal";
import Pagination from "../../../helpers/Pagination";
import config from "../../../config";

// Add export endpoints
const SUPER_ADMIN_EXPORT_TRANSACTIONS = `${config.API_URL}api/super-admin/export-transactions`;

const Payments = () => {
  const { selectedOwnerId } = useSuperAdminContext();
  const Owner = useMemo(() => getOwnerFromSession(), []);
  const ownerData = Owner?.user || Owner;
  const isSuperAdmin = ownerData?.role === 'super_admin';
  // ✅ SUPER ADMIN: Use selectedOwnerId if explicitly set, otherwise null (for "All Owners")
  // For non-super-admin, use logged-in owner's ID
  const ownerId = useMemo(() => isSuperAdmin 
    ? (selectedOwnerId || null)  // null when "All Owners" is selected
    : (getOwnerFromSession()?._id), [isSuperAdmin, selectedOwnerId]);
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSearchTerm, setExportSearchTerm] = useState("");
  const exportDropdownRef = useRef(null);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);
  const [activePayableFilter, setActivePayableFilter] = useState(true);
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [allBookings, setAllBookings] = useState([]);
  const [paymentDocument, setPaymentDocument] = useState(null);
  const [drawerPaymentStatus, setDrawerPaymentStatus] = useState("");
  const [drawerCurrentPage, setDrawerCurrentPage] = useState(1);
  const [generatingPayment, setGeneratingPayment] = useState(false);
  const fileInputRef = useRef(null);

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
  const canSelectBookings = useMemo(() => 
    (!isSuperAdmin ? true : Boolean(selectedOwnerId !== undefined && selectedClubId)) &&
    paymentStatus === "unpaid",
    [isSuperAdmin, selectedOwnerId, selectedClubId, paymentStatus]
  );
  
  const canSelectClubs = useMemo(() => 
    !isSuperAdmin || selectedOwnerId !== undefined,
    [isSuperAdmin, selectedOwnerId]
  );
  const [tab, setTab] = useState(0);

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
    setPaymentStatus(newValue === 0 ? "unpaid" : "paid");
    setCurrentPage(1);
  };

  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const selectedClub = clubs.find((club) => club._id === selectedClubId);

  // Filter payments by selected club only (search is handled by API)
  const filteredPayments = payments.filter((p) => {
    const matchesClub = selectedClubId
      ? p?.register_club_id?._id === selectedClubId
      : true;
    
    return matchesClub;
  });
  
  const sendDate = startDate;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setPaymentsLoading(true);
        const payload = {
          ...(ownerId ? { ownerId } : {}),
          ...(selectedClubId ? { clubId: selectedClubId } : {}),
          ...(paymentStatus ? { status: paymentStatus } : {}),
          ...(searchTerm ? { search: searchTerm } : {}),
          ...(activePayableFilter !== null && paymentStatus === "unpaid" ? { payableStatus: activePayableFilter } : {}),
          page: currentPage,
          limit: 20,
        };
        if (startDate) {
          const formatToYYYYMMDD = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };
          payload.startDate = formatToYYYYMMDD(startDate);
          payload.endDate = endDate ? formatToYYYYMMDD(endDate) : formatToYYYYMMDD(startDate);
        }

        const query = new URLSearchParams(payload).toString();
        const endpoint = SUPER_ADMIN_GET_UNPAID_BOOKINGS;
        const res = await ownerApi.get(query ? `${endpoint}?${query}` : endpoint);
        const data = res?.data?.data;
        
        setPayments(data?.bookings || []);
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
  }, [tab, startDate, endDate, currentPage, ownerId, selectedClubId, paymentStatus, refreshKey, searchTerm, activePayableFilter]);
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
        const clubsData = res?.data?.data || [];
        setClubs(clubsData);
        
        // Auto-select first club if available and no club is currently selected
        if (clubsData.length > 0 && !selectedClubId) {
          setSelectedClubId(clubsData[0]._id);
        }
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
  const handleSelectAll = async (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    
    if (isChecked) {
      try {
        const payload = {
          ...(ownerId ? { ownerId } : {}),
          ...(selectedClubId ? { clubId: selectedClubId } : {}),
          status: paymentStatus,
          ...(activePayableFilter !== null && paymentStatus === "unpaid" ? { payableStatus: activePayableFilter } : {}),
          page: 1,
          limit: 10000,
        };
        if (startDate) {
          const formatToYYYYMMDD = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };
          payload.startDate = formatToYYYYMMDD(startDate);
          payload.endDate = endDate ? formatToYYYYMMDD(endDate) : formatToYYYYMMDD(startDate);
        }
        const query = new URLSearchParams(payload).toString();
        const endpoint = SUPER_ADMIN_GET_UNPAID_BOOKINGS;
        const res = await ownerApi.get(query ? `${endpoint}?${query}` : endpoint);
        const data = res?.data?.data;
        const allData = data?.bookings || [];
        setAllBookings(allData);
        setSelectedPayments(allData.map(p => p._id));
      } catch (error) {
        console.error("Error fetching all bookings:", error);
      }
    } else {
      setSelectedPayments([]);
      setAllBookings([]);
    }
  };

  const handleSelectPayment = (id) => {
    setSelectAll(false);
    const newSelectedPayments = selectedPayments.includes(id)
      ? selectedPayments.filter(p => p !== id)
      : [...selectedPayments, id];
    
    setSelectedPayments(newSelectedPayments);
    
    if (newSelectedPayments.length === 0) {
      setShowPaymentDrawer(false);
    }
  };

  useEffect(() => {
    if (paymentStatus !== "unpaid") {
      if (selectedPayments.length > 0 || selectAll || selectedTotal > 0) {
        setSelectedPayments([]);
        setSelectAll(false);
        setSelectedTotal(0);
        setAllBookings([]);
      }
      return;
    }
    if (!canSelectBookings) {
      if (selectedPayments.length > 0 || selectAll || selectedTotal > 0) {
        setSelectedPayments([]);
        setSelectAll(false);
        setSelectedTotal(0);
        setAllBookings([]);
      }
      return;
    }
    const dataSource = selectAll ? allBookings : payments;
    const total = dataSource
      .filter((p) => selectedPayments.includes(p._id))
      .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    if (total !== selectedTotal) {
      setSelectedTotal(total);
    }
  }, [selectedPayments, payments, paymentStatus, canSelectBookings, selectAll, selectedTotal, allBookings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [paymentStatus, selectedClubId, selectedOwnerId]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };

    if (showExportDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  // Calculate totals
  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalUnpaid = payments.filter(p => p.status === "unpaid").reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleCreatePayment = (paymentId = null) => {
    setCurrentPaymentId(paymentId);
    setDrawerPaymentStatus("paid");
    setShowPaymentDrawer(true);
  };

  const handleGenerateExcel = async () => {
    if (!selectedClubId || selectedPayments.length === 0 || !drawerPaymentStatus) return;
    try {
      setGeneratingPayment(true);
      const payload = new FormData();
      payload.append("clubId", selectedClubId);
      payload.append("amount", selectedTotal);
      selectedPayments.forEach((id) => payload.append("bookingIds", id));
      payload.append("status", drawerPaymentStatus);
      payload.append("paidDate", paymentDate.toISOString());
      if (paymentDocument) payload.append("document", paymentDocument);

      const SUPER_ADMIN_CREATE_CLUB_PAYMENT = `${config.API_URL}api/super-admin/club-payments`;
      await ownerApi.post(SUPER_ADMIN_CREATE_CLUB_PAYMENT, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setShowPaymentDrawer(false);
      setSelectedPayments([]);
      setSelectAll(false);
      setSelectedTotal(0);
      setPaymentDocument(null);
      setDrawerPaymentStatus("");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error creating payment:", error);
    } finally {
      setGeneratingPayment(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentDocument(file);
    }
  };

  const handleExport = async (clubId = null) => {
    try {
      setExportLoading(true);
      const params = new URLSearchParams();
      if (startDate) {
        const formatToYYYYMMDD = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        params.append('startDate', formatToYYYYMMDD(startDate));
        params.append('endDate', endDate ? formatToYYYYMMDD(endDate) : formatToYYYYMMDD(startDate));
      }
      if (ownerId) params.append('ownerId', ownerId);
      if (clubId) params.append('clubId', clubId);
      if (searchTerm) params.append('search', searchTerm);
      if (paymentStatus) params.append('status', paymentStatus);
      
      const res = await ownerApi.get(`${SUPER_ADMIN_EXPORT_TRANSACTIONS}?${params.toString()}`);
      if (res?.data?.success && res?.data?.data?.downloadUrl) {
        window.open(res.data.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
      setShowExportDropdown(false);
    }
  };

  const handleUpdatePaymentStatus = async (isPaid) => {
    try {
      setPaymentsLoading(true);
      setActivePayableFilter(isPaid);
      
      // Call GET API to refresh data with payableStatus
      const payload = {
        ...(ownerId ? { ownerId } : {}),
        ...(selectedClubId ? { clubId: selectedClubId } : {}),
        ...(paymentStatus ? { status: paymentStatus } : {}),
        payableStatus: isPaid,
        page: currentPage,
        limit: 20,
      };
      if (startDate) {
        const formatToYYYYMMDD = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };
        payload.startDate = formatToYYYYMMDD(startDate);
        payload.endDate = endDate ? formatToYYYYMMDD(endDate) : formatToYYYYMMDD(startDate);
      }
      const query = new URLSearchParams(payload).toString();
      const endpoint = SUPER_ADMIN_GET_UNPAID_BOOKINGS;
      const res = await ownerApi.get(query ? `${endpoint}?${query}` : endpoint);
      const data = res?.data?.data;
      setPayments(data?.bookings || []);
      setTotalRecords(data?.pagination?.totalItems || 0);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setPaymentsLoading(false);
    }
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
          .hover-bg-light:hover {
            background-color: #f8f9fa !important;
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
              {!canSelectClubs ? "Select an owner first." : "Select a club to choose bookings."}
            </div>
          )}
            
            {activePayableFilter !== false && (
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
                      if (selectedClubId) {
                        setActivePayableFilter(true);
                      }
                    }}
                  >
                    <FaTimesCircle size={10} className="me-1" />
                    Unpaid
                  </button>
                </div>
              </Form.Group>
            )}

            <div className="mt-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: "11px", color: "#6c757d", fontWeight: "600" }}>CLUBS</span>
                <Badge bg="primary" style={{ fontSize: "10px" }}>{clubs.length}</Badge>
              </div>
              <ListGroup variant="flush" className="mb-2">
                <ListGroup.Item
                  action
                  active={selectedClubId === ""}
                  onClick={() => {
                    if (canSelectClubs) {
                      setSelectedClubId("");
                      setSelectedPayments([]);
                      setSelectAll(false);
                      if (paymentStatus === "unpaid") {
                        setActivePayableFilter(true);
                      }
                    }
                  }}
                  className="px-2 py-2"
                  style={{
                    cursor: canSelectClubs ? "pointer" : "not-allowed",
                    opacity: canSelectClubs ? 1 : 0.5,
                    borderLeft: selectedClubId === "" ? "3px solid #4361ee" : "3px solid transparent",
                    fontSize: "12px",
                    transition: "all 0.2s",
                    fontWeight: "600"
                  }}
                >
                  All Clubs
                </ListGroup.Item>
              </ListGroup>
              <div style={{ maxHeight: "calc(100vh - 450px)", overflowY: "auto" }}>
                <ListGroup variant="flush">
                  {clubs.map((club, index) => (
                    <ListGroup.Item
                      key={club._id || `club-${index}`}
                      action
                      active={selectedClubId === club._id}
                      onClick={() => {
                        if (canSelectClubs) {
                          const newClubId = selectedClubId === club._id ? "" : club._id;
                          setSelectedClubId(newClubId);
                          setSelectedPayments([]);
                          setSelectAll(false);
                          if (newClubId && paymentStatus === "unpaid") {
                            setActivePayableFilter(true);
                          }
                        }
                      }}
                      className="px-2 py-2"
                      style={{
                        cursor: canSelectClubs ? "pointer" : "not-allowed",
                        opacity: canSelectClubs ? 1 : 0.5,
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
                          {paymentStatus === "unpaid" && (
                            <Badge 
                              bg={selectedClubId === club._id ? "light" : "secondary"} 
                              text={selectedClubId === club._id ? "primary" : "white"}
                              style={{ fontSize: "9px" }}
                            >
                              {club.transactionCount || 0}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </div>
          </div>
        </Col>

        <Col lg={10} md={9} className="ps-0">
          <div className="bg-white rounded-3 shadow-sm p-3" style={{ border: "1px solid #e9ecef" }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 pb-3 border-bottom gap-3">
              <div className="d-flex align-items-center gap-3">
                <div>
                  <h5 className="mb-1 fw-bold" style={{ fontSize: "16px", color: "#1a1a1a" }}>
                    {selectedClub ? `${selectedClub.clubName} - ` : ""}Transactions
                  </h5>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                    {paymentStatus === "unpaid" 
                      ? `Total ${filteredPayments.length} ${paymentStatus === "unpaid" ? "booking" : "payment"}${filteredPayments.length !== 1 ? "s" : ""}`
                      : ""}
                  </p>
                </div>
                {paymentStatus === "unpaid" && (
                  <div className="d-flex gap-2">
                    <Button
                      variant={activePayableFilter === true ? "success" : "outline-success"}
                      size="sm"
                      onClick={() => handleUpdatePaymentStatus(true)}
                      style={{ fontSize: "12px", padding: "6px 12px" }}
                    >
                      Payable
                    </Button>
                    <Button
                      variant={activePayableFilter === false ? "danger" : "outline-danger"}
                      size="sm"
                      onClick={() => handleUpdatePaymentStatus(false)}
                      style={{ fontSize: "12px", padding: "6px 12px" }}
                    >
                      Non-Payable
                    </Button>
                  </div>
                )}
              </div>
              <div className="d-flex align-items-center gap-2">
                {!showDatePicker && !startDate && !endDate ? (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center gap-2"
                    onClick={() => setShowDatePicker(true)}
                    style={{ borderRadius: "6px", padding: "8px 16px", fontSize: "13px" }}
                  >
                    <MdOutlineDateRange size={16} />
                    <span>Select Date <span className="text-danger">*</span></span>
                  </Button>
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center rounded p-1"
                    style={{
                      backgroundColor: "#FAFBFF",
                      maxWidth: "280px",
                      height: "36px",
                      border: "1px solid #dee2e6",
                      gap: "8px",
                    }}
                  >
                    <div className="px-2">
                      <MdOutlineDateRange size={14} className="text-muted" />
                    </div>
                    <DatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        const [start, end] = update;
                        setStartDate(start);
                        setEndDate(end);
                        if (start && end) {
                          setShowDatePicker(false);
                        }
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="DD/MM/YYYY – DD/MM/YYYY"
                      className="form-control border-0 bg-transparent shadow-none"
                      style={{ fontSize: "12px", width: "200px" }}
                      open={showDatePicker}
                      onClickOutside={() => setShowDatePicker(false)}
                      maxDate={new Date()}
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
                        <FaTimes size={12} className="text-danger" />
                      </div>
                    )}
                  </div>
                )}
                {activePayableFilter !== false && (
                  <div className="position-relative" ref={exportDropdownRef}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      className="d-flex align-items-center gap-2"
                      style={{ borderRadius: "6px", fontSize: "13px", padding: "8px 16px" }}
                      disabled={exportLoading || !startDate}
                      title={!startDate ? "Please select date first" : ""}
                    >
                      <FaDownload size={12} />
                      <span>{exportLoading ? "Exporting..." : "Export"}</span>
                    </Button>
                  {/* {!startDate && (
                    <div 
                      className="position-absolute text-danger" 
                      style={{ 
                        fontSize: "10px", 
                        top: "100%", 
                        left: "0", 
                        marginTop: "2px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      * Date required
                    </div>
                  )} */}
                  {showExportDropdown && (
                    <div 
                      className="position-absolute bg-white border rounded shadow-sm"
                      style={{ 
                        top: "100%", 
                        right: "0", 
                        zIndex: 1000, 
                        minWidth: "250px",
                        marginTop: "4px"
                      }}
                    >
                      <div className="p-2">
                        <div 
                          className={`p-2 rounded ${exportLoading ? 'text-muted' : 'hover-bg-light cursor-pointer'}`}
                          onClick={() => !exportLoading && handleExport()}
                          style={{ 
                            cursor: exportLoading ? "not-allowed" : "pointer", 
                            fontSize: "13px",
                            opacity: exportLoading ? 0.5 : 1
                          }}
                        >
                          <FaDownload size={12} className="me-2" />
                          Export All
                        </div>
                        {clubs.length > 0 && (
                          <>
                            <hr className="my-1" />
                            <div className="fw-bold" style={{ fontSize: "12px", color: "#6c757d", padding: "4px 8px" }}>By Club:</div>
                            <div className="position-relative mb-2">
                              <FaSearch 
                                className="position-absolute" 
                                style={{ 
                                  left: "8px", 
                                  top: "50%", 
                                  transform: "translateY(-50%)", 
                                  color: "#6c757d", 
                                  fontSize: "10px" 
                                }} 
                              />
                              <Form.Control
                                type="text"
                                placeholder="Search clubs..."
                                value={exportSearchTerm}
                                onChange={(e) => setExportSearchTerm(e.target.value)}
                                style={{
                                  paddingLeft: "25px",
                                  fontSize: "12px",
                                  height: "30px",
                                  borderRadius: "4px",
                                  border: "1px solid #dee2e6"
                                }}
                              />
                            </div>
                            {clubs
                              .filter(club => 
                                club.clubName?.toLowerCase().includes(exportSearchTerm.toLowerCase())
                              )
                              .map((club) => (
                              <div 
                                key={club._id}
                                className={`p-2 rounded ${exportLoading ? 'text-muted' : 'hover-bg-light cursor-pointer'}`}
                                onClick={() => !exportLoading && handleExport(club._id)}
                                style={{ 
                                  cursor: exportLoading ? "not-allowed" : "pointer", 
                                  fontSize: "13px",
                                  opacity: exportLoading ? 0.5 : 1
                                }}
                              >
                                <FaBuilding size={12} className="me-2" />
                                {club.clubName}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                )}
                {/* <div className="position-relative">
                  <FaSearch 
                    className="position-absolute" 
                    style={{ 
                      left: "10px", 
                      top: "50%", 
                      transform: "translateY(-50%)", 
                      color: "#6c757d", 
                      fontSize: "12px" 
                    }} 
                  />
                  <Form.Control
                    type="text"
                    placeholder="Search by club or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      paddingLeft: "35px",
                      fontSize: "13px",
                      height: "36px",
                      borderRadius: "6px",
                      border: "1px solid #dee2e6",
                      width: "250px"
                    }}
                  />
                </div> */}
                {activePayableFilter !== false && paymentStatus === "unpaid" && (
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
                )}
              </div>
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
                              {paymentStatus === "unpaid" && activePayableFilter !== false && (
                                <Form.Check
                                  type="checkbox"
                                  checked={selectAll}
                                  onChange={handleSelectAll}
                                  disabled={!canSelectBookings}
                                  style={{ accentColor: "white" }}
                                />
                              )}
                            </th>
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>User</th>
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Club & Owner</th>
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Court & Time</th>
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Booking Info</th>
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Booking Date</th>
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment Date</th>
                            {(paymentStatus === "paid" || activePayableFilter === true) && (
                              <>
                                <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Club Payment</th>
                                <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment Status</th>
                              </>
                            )}
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Amount</th>
                            <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", borderTopRightRadius: "6px" }}>Invoice</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPayments?.map((item, index) => (
                            <tr
                              key={item?._id || `payment-${index}`}
                              className="border-bottom"
                              style={{ 
                                backgroundColor: selectedPayments.includes(item._id) ? "#f0f8ff" : "white",
                                transition: "background-color 0.2s"
                              }}
                            >
                              <td style={{ padding: "12px" }}>
                                {paymentStatus === "unpaid" && activePayableFilter !== false && (
                                  <Form.Check
                                    type="checkbox"
                                    checked={selectedPayments.includes(item._id)}
                                    onChange={() => handleSelectPayment(item._id)}
                                    disabled={!canSelectBookings}
                                  />
                                )}
                              </td>
                              <td style={{ padding: "12px" }}>
                                <div>
                                  <div className="fw-medium" style={{ fontSize: "13px" }}>
                                    {item?.userId?.name || "N/A"}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: "11px" }}>
                                    {item?.userId?.countryCode} {item?.userId?.phoneNumber}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "12px", fontWeight: "500" }}>
                                <div>
                                  <div style={{ fontSize: "13px" }}>
                                    {item?.register_club_id?.clubName || "N/A"}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: "11px" }}>
                                    {item?.ownerId?.name || "N/A"}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: "10px" }}>
                                    {item?.ownerId?.email || "N/A"}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "12px" }}>
                                <div>
                                  <div className="fw-medium" style={{ fontSize: "12px" }}>
                                    {item?.slot?.[0]?.courtName || "N/A"}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: "11px" }}>
                                    {item?.startTime || "N/A"} - {item?.endTime || "N/A"}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: "10px" }}>
                                    {item?.duration}min
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "12px" }}>
                                <div>
                                  <div className="fw-medium" style={{ fontSize: "11px" }}>
                                    <span className={`badge ${item?.bookingType === 'openMatch' ? 'bg-info' : item?.bookingType === 'regular' ? 'bg-primary' : 'bg-secondary'}`} style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "3px" }}>
                                      {item?.bookingType?.toUpperCase() || "N/A"}
                                    </span>
                                  </div>
                                  <div className="text-muted" style={{ fontSize: "10px", marginTop: "2px" }}>
                                    {item?.matchType || "N/A"}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "12px" }}>
                                <div>
                                  <div className="fw-medium" style={{ fontSize: "12px" }}>
                                    {formatDate(item?.bookingDate)}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: "10px" }}>
                                    {item?.createdAt ? new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "12px" }}>
                                <div>
                                  <div className="fw-medium" style={{ fontSize: "12px" }}>
                                    {item?.paidDate ? formatDate(item.paidDate) : item?.updatedAt ? formatDate(item.updatedAt) : "N/A"}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: "10px" }}>
                                    {item?.updatedAt ? new Date(item.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                                  </div>
                                </div>
                              </td>
                              {(paymentStatus === "paid" || activePayableFilter === true) && (
                                <>
                                  <td style={{ padding: "12px", textAlign: "center" }}>
                                    <span className={`badge ${item?.clubPaidStatus === 'paid' ? 'bg-success' : 'bg-warning'}`} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "4px" }}>
                                      {item?.clubPaidStatus?.toUpperCase() || "UNPAID"}
                                    </span>
                                  </td>
                                  <td style={{ padding: "12px" }}>
                                    <div>
                                      <span className={`badge ${item?.paymentStatus === 'paid' ? 'bg-success' : item?.paymentStatus === 'pending' ? 'bg-warning' : 'bg-secondary'}`} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "4px" }}>
                                        {item?.paymentStatus?.toUpperCase() || "N/A"}
                                      </span>
                                      <div className="text-muted" style={{ fontSize: "10px", marginTop: "2px" }}>
                                        {item?.paymentMethod || "N/A"}
                                      </div>
                                    </div>
                                  </td>
                                </>
                              )}
                              <td style={{ padding: "12px", fontWeight: "600", color: "#28a745", fontSize: "14px" }}>
                                ₹{item?.totalAmount || 0}
                              </td>
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                  {/* <div
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
                                  </div> */}
                                  {item?.invoiceUrl ? (
                                    <div
                                      className="d-inline-flex align-items-center justify-content-center"
                                      style={{ 
                                        cursor: "pointer",
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "8px",
                                        backgroundColor: "#e7ffe7",
                                        transition: "all 0.2s"
                                      }}
                                      onClick={() => window.open(item.invoiceUrl, '_blank')}
                                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#ccffcc"}
                                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e7ffe7"}
                                      title="View Invoice"
                                    >
                                      <FaDownload className="text-success" size={14} />
                                    </div>
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: "11px" }}>N/A</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    <div className="mobile-card-table d-block d-md-none">
                      {filteredPayments?.map((item, index) => (
                        <div key={item?._id || `mobile-payment-${index}`} className="card mb-2">
                          <div className="card-body">
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">User:</span>
                              <span className="mobile-card-value">
                                {item?.userId?.name || "N/A"} ({item?.userId?.countryCode} {item?.userId?.phoneNumber})
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Club & Owner:</span>
                              <span className="mobile-card-value">
                                {item?.register_club_id?.clubName || "N/A"} • {item?.ownerId?.name}
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Court & Time:</span>
                              <span className="mobile-card-value">
                                {item?.slot?.[0]?.courtName || "N/A"} • {item?.startTime || "N/A"} - {item?.endTime || "N/A"} ({item?.duration}min)
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Booking Info:</span>
                              <span className="mobile-card-value">
                                {item?.bookingType?.toUpperCase()} • {item?.matchType}
                              </span>
                            </div>
                            {(paymentStatus === "paid" || activePayableFilter === true) && (
                              <div className="mobile-card-item">
                                <span className="mobile-card-label">Club Payment:</span>
                                <span className="mobile-card-value">
                                  {item?.clubPaidStatus?.toUpperCase() || "UNPAID"}
                                </span>
                              </div>
                            )}
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Booking Date:</span>
                              <span className="mobile-card-value">
                                {formatDate(item?.bookingDate)} {item?.createdAt ? new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ""}
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Payment Date:</span>
                              <span className="mobile-card-value">
                                {item?.paidDate ? formatDate(item.paidDate) : item?.updatedAt ? formatDate(item.updatedAt) : "N/A"} {item?.updatedAt ? new Date(item.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ""}
                              </span>
                            </div>
                            {(paymentStatus === "paid" || activePayableFilter === true) && (
                              <div className="mobile-card-item">
                                <span className="mobile-card-label">Payment:</span>
                                <span className="mobile-card-value">
                                  {item?.paymentStatus?.toUpperCase() || "N/A"} • {item?.paymentMethod || "N/A"}
                                </span>
                              </div>
                            )}
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Amount:</span>
                              <span className="mobile-card-value">
                                ₹{item?.totalAmount || 0}
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Action:</span>
                              <div className="mobile-card-value d-flex align-items-center gap-2">
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
                                {item?.invoiceUrl ? (
                                  <FaDownload
                                    className="text-success"
                                    onClick={() => window.open(item.invoiceUrl, '_blank')}
                                    size={16}
                                    style={{ cursor: "pointer" }}
                                    title="View Invoice"
                                  />
                                ) : (
                                  <span className="text-muted" style={{ fontSize: "11px" }}>N/A</span>
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
            defaultLimit={20}
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

      <Offcanvas show={showPaymentDrawer} onHide={() => setShowPaymentDrawer(false)} placement="end" style={{ width: "500px", zIndex: 1040 }} backdrop={false}>
        <Offcanvas.Header closeButton style={{ borderBottom: "2px solid #e9ecef", padding: "16px 20px", backgroundColor: "#f8f9fa" }}>
          <Offcanvas.Title style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a" }}>
            {selectedClub ? selectedClub.clubName : "Payment Details"}
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#6c757d", marginLeft: "8px" }}>({selectedPayments.length} bookings)</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ padding: "16px", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <div className="alert alert-warning d-flex align-items-start" style={{ fontSize: "11px", padding: "8px", marginBottom: "10px", border: "1px solid #ffc107", borderRadius: "4px", flexShrink: 0 }}>
            <div style={{ marginRight: "6px", fontSize: "14px" }}>⚠️</div>
            <div>
              <strong>Important:</strong> Please select the transaction for the club owner to mark it as Paid. 
              Ensure the payment has been completed before confirming, as this action cannot be reversed and the transaction cannot be retrieved once marked as Paid.
            </div>
          </div>
          <div className="mb-2 p-2 rounded" style={{ backgroundColor: "#f0f8ff", border: "1px solid #cce5ff", flexShrink: 0 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#495057" }}>Total Amount</span>
              <span style={{ fontSize: "20px", fontWeight: "700", color: "#28a745" }}>₹{selectedTotal.toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#495057" }}>Payment Date <span className="text-danger">*</span></span>
              <DatePicker
                selected={paymentDate}
                onChange={(date) => setPaymentDate(date)}
                dateFormat="dd/MM/yyyy"
                className="form-control text-end"
                style={{ fontSize: "13px", width: "130px", padding: "4px 8px" }}
                required disabled
              />
            </div>
          </div>

          <div className="mb-2" style={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <h6 className="fw-bold mb-2" style={{ fontSize: "12px", color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0 }}>Selected Bookings</h6>
            <div style={{ flexGrow: 1, overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "4px" }}>
              {selectedPayments.length === 0 ? (
                <div className="text-center text-muted py-4" style={{ fontSize: "13px" }}>
                  No bookings selected
                </div>
              ) : (
                <table className="table table-sm table-hover mb-0" style={{ fontSize: "13px" }}>
                  <thead style={{ backgroundColor: "#e9ecef", position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th style={{ padding: "12px 8px", fontWeight: "700", color: "#212529", borderBottom: "2px solid #dee2e6", width: "40px" }}></th>
                      <th style={{ padding: "12px 12px", fontWeight: "700", color: "#212529", borderBottom: "2px solid #dee2e6" }}>Booking Date</th>
                      <th style={{ padding: "12px 12px", textAlign: "right", fontWeight: "700", color: "#212529", borderBottom: "2px solid #dee2e6" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectAll ? allBookings : payments)
                      .filter(p => selectedPayments.includes(p._id))
                      .slice((drawerCurrentPage - 1) * 20, drawerCurrentPage * 20)
                      .map((item, index) => (
                        <tr key={item._id} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9" }}>
                          <td style={{ padding: "10px 8px" }}>
                            <Form.Check
                              type="checkbox"
                              checked={true}
                              onChange={() => handleSelectPayment(item._id)}
                            />
                          </td>
                          <td style={{ padding: "10px 12px", color: "#495057" }}>{formatDate(item?.bookingDate)}</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "600", color: "#28a745" }}>
                            ₹{item?.totalAmount || 0}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
            {selectedPayments.length > 20 && (
              <div className="d-flex justify-content-center mt-2" style={{ flexShrink: 0 }}>
                <Pagination
                  totalRecords={selectedPayments.length}
                  defaultLimit={20}
                  handlePageChange={(page) => setDrawerCurrentPage(page)}
                  currentPage={drawerCurrentPage}
                />
              </div>
            )}
          </div>

          <div className="mb-2" style={{ flexShrink: 0 }}>
            <Form.Label  style={{ fontSize: "11px", fontWeight: "600", color: "#495057", marginBottom: "4px" }}>
              <b>Payment Status</b> <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={drawerPaymentStatus}
              onChange={(e) => setDrawerPaymentStatus(e.target.value)}
              size="sm"
              style={{ fontSize: "12px", padding: "5px 8px" }}
              required disabled
            >
              {/* <option value="">Select Status</option> */}
              <option value="paid">Paid</option>
              {/* <option value="unpaid">Unpaid</option> */}
            </Form.Select>
          </div>

          <div className="mb-2" style={{ flexShrink: 0 }}>
            <Form.Label style={{ fontSize: "11px", fontWeight: "600", color: "#495057", marginBottom: "4px" }}><b>{'Upload Document'}</b></Form.Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              style={{ display: "none" }}
            />
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              style={{ fontSize: "11px", padding: "5px 10px" }}
            >
              <FaDownload size={10} />
              <span>{paymentDocument ? `✓ ${paymentDocument.name.substring(0, 20)}...` : "Upload Document"}</span>
            </Button>
          </div>

          <Button
            variant="success"
            className="w-100 d-flex align-items-center justify-content-center gap-2"
            style={{ padding: "8px", fontSize: "12px", fontWeight: "600", flexShrink: 0 }}
            onClick={handleGenerateExcel}
            disabled={selectedPayments.length === 0 || !drawerPaymentStatus || generatingPayment}
          >
            {generatingPayment ? (
              <>
                <ButtonLoading color="white" size={14} />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <FaFileExcel size={14} />
                <span>Generate Excel</span>
              </>
            )}
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default Payments;
