import React from "react";
import { useEffect, useState, useMemo, useRef } from "react";
import { Row, Col, Container, Table, Card, Form, Button, ListGroup, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdOutlineDateRange } from "react-icons/md";
import { FaTimes, FaSearch, FaFilter, FaBuilding, FaDownload, FaEye } from "react-icons/fa";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { useSuperAdminContext } from "../../../contexts/SuperAdminContext";
import { FaChartLine } from "react-icons/fa";
import {
  BsArrowUpRightCircleFill,
  BsFillArrowDownLeftCircleFill,
} from "react-icons/bs";
import { formatDate } from "../../../helpers/Formatting";
import {
  SUPER_ADMIN_GET_CLUB_PAYMENTS,
  SUPER_ADMIN_GET_ALL_CLUBS,
  SUPER_ADMIN_PAYMENT_DASHBOARD_COUNTS,
} from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import Pagination from "../../../helpers/Pagination";
import config from "../../../config";

const SUPER_ADMIN_EXPORT_TRANSACTIONS = `${config.API_URL}api/super-admin/export-transactions`;

const PaymentReconciliation = () => {
  const { selectedOwnerId } = useSuperAdminContext();
  const Owner = useMemo(() => getOwnerFromSession(), []);
  const ownerData = Owner?.user || Owner;
  const isSuperAdmin = ownerData?.role === 'super_admin';
  const ownerId = useMemo(() => isSuperAdmin 
    ? (selectedOwnerId || null)
    : (getOwnerFromSession()?._id), [isSuperAdmin, selectedOwnerId]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSearchTerm, setExportSearchTerm] = useState("");
  const exportDropdownRef = useRef(null);

  const setDateRange = (update) => {
    setStartDate(update[0]);
    setEndDate(update[1]);
  };

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const canSelectClubs = useMemo(() => 
    !isSuperAdmin || selectedOwnerId !== undefined,
    [isSuperAdmin, selectedOwnerId]
  );

  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const selectedClub = clubs.find((club) => club._id === selectedClubId);

  const filteredPayments = payments.filter((p) => {
    const matchesClub = selectedClubId
      ? p?.clubId?._id === selectedClubId
      : true;
    
    return matchesClub;
  });
  
  const sendDate = startDate && endDate;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setPaymentsLoading(true);
        const payload = {
          ...(ownerId ? { ownerId } : {}),
          ...(selectedClubId ? { clubId: selectedClubId } : {}),
          status: "paid",
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
        const endpoint = SUPER_ADMIN_GET_CLUB_PAYMENTS;
        const res = await ownerApi.get(query ? `${endpoint}?${query}` : endpoint);
        const data = res?.data?.data;
        
        setPayments(data?.payments || []);
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
  }, [sendDate, currentPage, ownerId, selectedClubId, refreshKey]);

  const [paymentCounts, setPaymentCounts] = useState({
    totalAmountToday: 0,
    totalAmountMonth: 0,
    totalRefunded: 0
  });
  const [loadingCounts, setLoadingCounts] = useState(false);

  useEffect(() => {
    const fetchPaymentCounts = async () => {
      try {
        setLoadingCounts(true);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClubId, selectedOwnerId]);

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

  const handleExport = async (clubId = null) => {
    try {
      setExportLoading(true);
      const params = new URLSearchParams();
      if (startDate && endDate) {
        params.append('startDate', startDate.toISOString().split('T')[0]);
        params.append('endDate', endDate.toISOString().split('T')[0]);
      }
      if (ownerId) params.append('ownerId', ownerId);
      if (clubId) params.append('clubId', clubId);
      params.append('status', 'paid');
      
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

  return (
    <Container fluid className="px-0 px-md-0 mt-md-0 mt-2">
      <style>
        {`
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
        <Col lg={2} md={3} className="pe-1">
          <div className="bg-white rounded-3 shadow-sm p-2 h-100" >
            <div className="d-flex align-items-center mb-2 pb-2 border-bottom">
              <FaFilter className="text-primary me-1" size={12} />
              <h6 className="mb-0 fw-bold" style={{ fontSize: "13px" }}>Filters</h6>
            </div>

            <div className="mt-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: "11px", color: "#6c757d", fontWeight: "600" }}>CLUBS</span>
                <Badge bg="primary" style={{ fontSize: "10px" }}>{clubs.length}</Badge>
              </div>
              <div style={{ maxHeight: "calc(100vh - 400px)", overflowY: "auto" }}>
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
          </div>
        </Col>

        <Col lg={10} md={9} className="ps-0">
          <div className="bg-white rounded-3 shadow-sm p-3" style={{ border: "1px solid #e9ecef" }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 pb-3 border-bottom gap-3">
              <div className="d-flex align-items-center gap-3">
                <div>
                  <h5 className="mb-1 fw-bold" style={{ fontSize: "16px", color: "#1a1a1a" }}>
                    {selectedClub ? `${selectedClub.clubName} - ` : ""}Payment Reconciliation
                  </h5>
                  <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                    {`Total ${filteredPayments.length} payment${filteredPayments.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              {/* <div className="d-flex align-items-center gap-2">
                {!showDatePicker && !startDate && !endDate ? (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center gap-2"
                    onClick={() => setShowDatePicker(true)}
                    style={{ borderRadius: "6px", padding: "8px 16px", fontSize: "13px" }}
                  >
                    <MdOutlineDateRange size={16} />
                    <span>Select Date</span>
                  </Button>
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center rounded p-1"
                    style={{
                      backgroundColor: "#FAFBFF",
                      maxWidth: "200px",
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
                        setDateRange(update);
                        const [start, end] = update;
                        if (start && end) {
                          setShowDatePicker(false);
                        }
                      }}
                      dateFormat="dd/MM/yy"
                      placeholderText="DD/MM/YY – DD/MM/YY"
                      className="form-control border-0 bg-transparent shadow-none"
                      style={{ fontSize: "12px", width: "120px" }}
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
                        <FaTimes size={12} className="text-danger" />
                      </div>
                    )}
                  </div>
                )}
                <div className="position-relative" ref={exportDropdownRef}>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    className="d-flex align-items-center gap-2"
                    style={{ borderRadius: "6px", fontSize: "13px", padding: "8px 16px" }}
                    disabled={exportLoading}
                  >
                    <FaDownload size={12} />
                    <span>{exportLoading ? "Exporting..." : "Export"}</span>
                  </Button>
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
              </div> */}
            </div>

            {paymentsLoading ? (
              <DataLoading height="60vh" />
            ) : (
              <>
                {filteredPayments?.length > 0 ? (
                  <div className="custom-scroll-container d-none d-md-block" style={{ overflowX: "auto" }}>
                    <Table
                      responsive
                      hover
                      className="custom-table align-middle"
                      style={{ minWidth: "800px" }}
                    >
                      <thead style={{ backgroundColor: "#4361ee", color: "white" }}>
                        <tr>
                          <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", borderTopLeftRadius: "6px" }}>Club & Owner</th>
                          <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Amount</th>
                          <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                          <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment Date</th>
                          <th style={{ padding: "14px", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", borderTopRightRadius: "6px" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments?.map((item, index) => (
                          <tr
                            key={item?._id || `payment-${index}`}
                            className="border-bottom"
                          >
                            <td style={{ padding: "12px", fontWeight: "500" }}>
                              <div>
                                <div style={{ fontSize: "13px" }}>
                                  {item?.clubId?.clubName || "N/A"}
                                </div>
                                <div className="text-muted" style={{ fontSize: "11px" }}>
                                  {item?.ownerId?.name || "N/A"}
                                </div>
                                <div className="text-muted" style={{ fontSize: "10px" }}>
                                  {item?.ownerId?.email || "N/A"}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "12px", fontWeight: "600", color: "#28a745", fontSize: "14px" }}>
                              ₹{item?.amount || 0}
                            </td>
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              <span className={`badge ${item?.status === 'paid' ? 'bg-success' : 'bg-warning'}`} style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "4px" }}>
                                {item?.status?.toUpperCase() || "UNPAID"}
                              </span>
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
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              <div className="d-flex align-items-center justify-content-center gap-2">
                                {item?.csvUrl && (
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
                                    onClick={() => window.open(item.csvUrl, '_blank')}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#cce5ff"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e7f3ff"}
                                    title="Download CSV"
                                  >
<FaDownload className="text-primary" size={14} />
                                  </div>
                                )}
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
                                    title="View Document"
                                  >
                                    <FaEye className="text-success" size={14} />
                                  </div>
                                ) : (
                                  !item?.csvUrl && <span className="text-muted" style={{ fontSize: "11px" }}>N/A</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div
                    className="d-flex text-danger justify-content-center align-items-center"
                    style={{ height: "60vh" }}
                  >
                    No paid transactions found!
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
    </Container>
  );
};

export default PaymentReconciliation;
