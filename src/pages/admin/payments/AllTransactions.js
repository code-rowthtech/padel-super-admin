import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Form, Table, Card } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch, FaDownload } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import { formatDate } from "../../../helpers/Formatting";
import { getOwnerFromSession, ownerApi } from "../../../helpers/api/apiCore";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { useSuperAdminContext } from "../../../contexts/SuperAdminContext";
import Pagination from "../../../helpers/Pagination";
import { useDispatch, useSelector } from "react-redux";
import { getAllTransactions } from "../../../redux/admin/transactions/thunk";
import { GET_BOOKING_DETAILS_BY_ID } from "../../../helpers/api/apiEndpoint";
import { TbFileInvoice } from "react-icons/tb";


const AllTransactions = () => {
  const dispatch = useDispatch();
  const { selectedOwnerId } = useSuperAdminContext();
  const Owner = useMemo(() => getOwnerFromSession(), []);
  const ownerData = Owner?.user || Owner;
  const isSuperAdmin = ownerData?.role === "super_admin";
  const ownerId = useMemo(
    () =>
      isSuperAdmin
        ? selectedOwnerId || null
        : getOwnerFromSession()?._id,
    [isSuperAdmin, selectedOwnerId],
  );

  const { transactions, loading, pagination } = useSelector(
    (state) => state.transactions
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);
  const recordsPerPage = 20;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchTransactions();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, ownerId, startDate, endDate]);

  const fetchTransactions = () => {
    const payload = {
      ...(ownerId ? { ownerId } : {}),
      page: currentPage,
      limit: recordsPerPage,
      search: searchTerm.trim() ? searchTerm.trim() : ''
    };


    if (startDate) {
      const formatToYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      payload.startDate = formatToYYYYMMDD(startDate);
      payload.endDate = endDate
        ? formatToYYYYMMDD(endDate)
        : formatToYYYYMMDD(startDate);
    }

    dispatch(getAllTransactions(payload));
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      setDownloadingInvoice(bookingId);
      const res = await ownerApi.get(`${GET_BOOKING_DETAILS_BY_ID}?_id=${bookingId}`);
      const invoiceUrl = res?.data?.booking?.invoiceUrl;
      
      if (invoiceUrl) {
        window.open(invoiceUrl, "_blank");
      } else {
        console.error("Invoice URL not found");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const filteredTransactions = transactions;
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid className="px-3 py-3">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-3">
          {/* Top Section */}
          <Row className="mb-3 align-items-center">
            <Col md={6}>
              <h4 className="mb-0 fw-bold" style={{ fontSize: "20px", color: "#1a1a1a", fontFamily: "Poppins" }}>
                All Transactions
              </h4>
            </Col>
            <Col md={6}>
              <Row className="g-2">
                {/* Search Input */}
                <Col md={6}>
                  <div className="position-relative">
                    <FaSearch
                      className="position-absolute"
                      style={{
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6c757d",
                        fontSize: "14px"
                      }}
                    />
                    <Form.Control
                      type="text"
                      placeholder="Search by name, phone, or club..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        paddingLeft: "38px",
                        fontSize: "14px",
                        height: "38px",
                        borderRadius: "6px",
                        border: "1px solid #dee2e6"
                      }}
                    />
                  </div>
                </Col>

                {/* Date Filter */}
                <Col md={6}>
                  <div
                    className="d-flex align-items-center rounded"
                    style={{
                      backgroundColor: "#FAFBFF",
                      height: "38px",
                      border: "1px solid #dee2e6",
                      padding: "0 10px",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                    onClick={() => setShowDatePicker(true)}
                  >
                    <MdOutlineDateRange size={18} className="text-muted" />
                    <DatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        const [start, end] = update;
                        setStartDate(start);
                        setEndDate(end);
                        if (start && end) setShowDatePicker(false);
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Select date range"
                      className="form-control border-0 bg-transparent shadow-none p-0"
                      style={{ fontSize: "14px", width: "100%", height: "auto" }}
                      open={showDatePicker}
                      onClickOutside={() => setShowDatePicker(false)}
                      maxDate={new Date()}
                      isClearable
                    />
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Table */}
          {loading ? (
            <DataLoading height="60vh" />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <Table hover responsive className="align-middle mb-0">
                <thead style={{ backgroundColor: "#4361ee", color: "white" }}>
                  <tr>
                    <th style={{ padding: "14px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", fontFamily: "Poppins" }}>
                      S.No
                    </th>
                    <th style={{ padding: "14px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", fontFamily: "Poppins" }}>
                      Name
                    </th>
                    <th style={{ padding: "14px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", fontFamily: "Poppins" }}>
                      Phone Number
                    </th>
                    <th style={{ padding: "14px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", fontFamily: "Poppins" }}>
                      Club Name
                    </th>
                    <th style={{ padding: "14px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", fontFamily: "Poppins" }}>
                      Booking Date
                    </th>
                    <th style={{ padding: "14px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", fontFamily: "Poppins" }}>
                      Transaction Date
                    </th>
                    <th style={{ padding: "14px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", fontFamily: "Poppins", textAlign: "center" }}>
                      Booking Type
                    </th>
                    <th style={{ padding: "14px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", fontFamily: "Poppins", textAlign: "center" }}>
                      Booking Status
                    </th>
                    <th style={{ padding: "14px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", fontFamily: "Poppins", textAlign: "center" }}>
                      Payment Type
                    </th>
                    <th style={{ padding: "14px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", fontFamily: "Poppins", textAlign: "center" }}>
                      Payment Status
                    </th>
                    <th style={{ padding: "14px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", fontFamily: "Poppins", textAlign: "center" }}>
                      Amount
                    </th>
                    <th style={{ padding: "14px", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", fontFamily: "Poppins", textAlign: "center" }}>
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions?.length > 0 ? (
                    filteredTransactions?.map((transaction, idx) => (
                      <tr key={transaction.bookingId} style={{ borderBottom: "1px solid #dee2e6" }}>
                        <td style={{ padding: "12px", fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px", fontWeight: "500", fontFamily: "Poppins" }}>
                          {transaction?.customer?.name || "N/A"}
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px", fontFamily: "Poppins" }}>
                          {transaction?.customer?.phone || "N/A"}
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px", fontFamily: "Poppins" }}>
                          {transaction?.club?.name || "N/A"}
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px", fontFamily: "Poppins" }}>
                          {formatDate(transaction?.bookingDate)}
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px", fontFamily: "Poppins" }}>
                          <div>{formatDate(transaction?.createdAt)}</div>
                          <div className="text-muted" style={{ fontSize: "12px", fontFamily: "Poppins" }}>
                            {transaction?.createdAt
                              ? new Date(transaction.createdAt).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                              : "N/A"}
                          </div>
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px", fontFamily: "Poppins", textAlign: "center" }}>
                          <span
                            className={`badge ${transaction?.bookingType === "regular" || transaction?.bookingType === "manual"
                              ? "bg-primary"
                              : transaction?.bookingType === "open-match"
                                ? "bg-info"
                                : "bg-secondary"
                              }`}
                            style={{ fontSize: "11px", padding: "4px 8px", textTransform: "uppercase" }}
                          >
                            {transaction?.bookingType || "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px", fontFamily: "Poppins", textAlign: "center" }}>
                          <span
                            className={`badge ${transaction?.bookingStatus === "booked"
                              ? "bg-success"
                              : transaction?.bookingStatus === "cancelled"
                                ? "bg-danger"
                                : transaction?.bookingStatus === "failed"
                                  ? "bg-warning"
                                  : "bg-secondary"
                              }`}
                            style={{ fontSize: "11px", padding: "4px 8px", textTransform: "uppercase" }}
                          >
                            {transaction?.bookingStatus || "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px", fontFamily: "Poppins", textAlign: "center" }}>
                          <span
                            className={`badge ${transaction?.payment?.mode === "wallet"
                              ? "bg-info"
                              : transaction?.payment?.mode === "admin"
                                ? "bg-warning"
                                : transaction?.payment?.mode === "wallet+razorpay"
                                  ? "bg-primary"
                                  : "bg-secondary"
                              }`}
                            style={{ fontSize: "11px", padding: "4px 8px", textTransform: "uppercase" }}
                          >
                            {transaction?.payment?.mode || "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px", fontFamily: "Poppins", textAlign: "center" }}>
                          <span
                            className={`badge ${transaction?.paymentStatus === "paid"
                              ? "bg-success"
                              : transaction?.paymentStatus === "pending"
                                ? "bg-warning"
                                : transaction?.paymentStatus === "failed"
                                  ? "bg-danger"
                                  : "bg-secondary"
                              }`}
                            style={{ fontSize: "11px", padding: "4px 8px", textTransform: "uppercase" }}
                          >
                            {transaction?.paymentStatus || "N/A"}
                          </span>
                        </td>
                        <td style={{
                          padding: "12px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#28a745",
                          fontFamily: "Poppins",
                          textAlign: "center"
                        }}>
                          ₹{transaction?.payment?.totalAmount || 0}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <div
                            className="d-inline-flex align-items-center justify-content-center"
                            style={{
                              cursor: downloadingInvoice === transaction.bookingId ? "not-allowed" : "pointer",
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              backgroundColor: "#e7ffe7",
                              transition: "all 0.2s",
                              opacity: downloadingInvoice === transaction.bookingId ? 0.6 : 1
                            }}
                            onClick={() => downloadingInvoice !== transaction.bookingId && handleDownloadInvoice(transaction.bookingId)}
                            onMouseEnter={(e) => {
                              if (downloadingInvoice !== transaction.bookingId) {
                                e.currentTarget.style.backgroundColor = "#ccffcc";
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#e7ffe7";
                            }}
                            title="Download Invoice"
                          >
                            <FaDownload className="text-success" size={14} />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="text-center text-muted py-4" style={{ fontSize: "14px", fontFamily: "Poppins" }}>
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Pagination */}
      {!loading && pagination.totalItems > 0 && (
        <Row className="mt-3">
          <Col className="d-flex justify-content-center">
            <Pagination
              totalRecords={pagination.totalItems}
              defaultLimit={recordsPerPage}
              handlePageChange={handlePageChange}
              currentPage={currentPage}
            />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AllTransactions;
