import { useEffect, useState } from "react";
import { Row, Col, Container, Table, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDateRange, MdOutlineDateRange } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppBar, Tabs, Tab, Box } from "@mui/material";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { FaEye, FaChartLine } from "react-icons/fa";
import {
  BsArrowUpRightCircleFill,
  BsFillArrowDownLeftCircleFill,
} from "react-icons/bs";
import { formatDate, formatTime } from "../../../helpers/Formatting";
import {
  getBookingByStatus,
  getBookingDetailsById,
} from "../../../redux/thunks";
import { Link } from "react-router-dom";
import { PaymentDetailsModal } from "./modals/PaymentDetailModal";
import { resetBookingData } from "../../../redux/admin/booking/slice";
import Pagination from "../../../helpers/Pagination";

const Payments = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const setDateRange = (update) => {
    setStartDate(update[0]);
    setEndDate(update[1]);
  };

  const dispatch = useDispatch();
  const { getBookingData, getBookingLoading, getBookingDetailsData } =
    useSelector((state) => state.booking);
  const [tab, setTab] = useState(0);

  const handleTabChange = (_, newValue) => {
    dispatch(resetBookingData());
    setTab(newValue);
    setCurrentPage(1);
  };



  const payments = getBookingData?.bookings || [];
  const paymentDetails = getBookingDetailsData?.booking || {};

  const status = tab === 0 ? "" : "refunded";
  const sendDate = startDate && endDate;

  useEffect(() => {
    const payload = { status, ownerId, page: currentPage };
    if (sendDate) {
      payload.startDate = formatDate(startDate);
      payload.endDate = formatDate(endDate);
    }

    dispatch(getBookingByStatus(payload));
  }, [tab, sendDate, currentPage]);

  const ownerId = getOwnerFromSession()?._id;
  const [loadingPaymentId, setLoadingPaymentId] = useState(null);

  const handlePaymentDetails = async (id) => {
    setLoadingPaymentId(id); // Start loading for this ID
    try {
      await dispatch(getBookingDetailsById({ id })).unwrap();
      setShowPaymentDetails(true);
    } catch (error) {
      console.error("Failed to fetch booking details:", error);
    } finally {
      setLoadingPaymentId(null); // Stop loading
    }
  };

  const summaryCards = [
    {
      title: "Today Collection",
      value: "25Hrs",
      percent: "+15%",
      icon: <BsArrowUpRightCircleFill />,
      color: "success",
      bigicon: <FaChartLine size={35} />,
    },
    {
      title: "Monthly Collection",
      value: "30Hrs",
      percent: "-3.5%",
      icon: <BsFillArrowDownLeftCircleFill />,
      color: "danger",
      bigicon: <FaChartLine size={35} />,
    },
    {
      title: "Refund Amount",
      value: "3.5M",
      percent: "+15%",
      icon: <BsArrowUpRightCircleFill />,
      color: "success",
      bigicon: <FaChartLine size={35} />,
    },
  ];

  const totalRecords = getBookingData?.totalItems || 1;
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderSlotTimes = (slotTimes) =>
    slotTimes?.length ? slotTimes.map((slot) => slot.time).join(", ") : "-";
  return (
    <Container fluid className=" px-4">
      <Row className="mb-4">
        {summaryCards.map((card, index) => (
          <Col key={index} md={4} className="mb-3">
            <Card className="shadow-sm border-0 rounded-4 h-100">
              <Card.Body className="d-flex justify-content-between">
                <div className="mt-2">
                  <div className="table-data">{card.title}</div>
                  <div className="card-value">{card.value}</div>
                  <div
                    className={`d-flex align-items-center gap-1 text-${card.color} fw-semibold`}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        // transform:
                        //   card.color === "danger"
                        //     ? "rotate(45deg)"
                        //     : "rotate(-45deg)",
                        // transition: "transform 0.3s",
                      }}
                    >
                      {card.icon}
                    </span>
                    <span className="small">{card.percent}</span>
                  </div>
                </div>
                <div className=" mb-2 text-end">
                  <div className="mb-4 text-end text-dark">{card.bigicon}</div>
                  <Link to="#" className="dashboard-viewmore">
                    View Report
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Row className="mb-3">
        <Col xs={12}>
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-lg-center gap-3">
            <Box sx={{ bgcolor: "white", width: { xs: "100%", lg: "auto" } }}>
              <AppBar
                position="static"
                color="default"
                className="bg-white border-bottom border-light"
                elevation={0}
              >
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  sx={{
                    "& .MuiTab-root": {
                      fontSize: { xs: "13px", sm: "14px", lg: "15px" },
                      minWidth: { xs: "100px", sm: "120px" },
                    },
                  }}
                >
                  <Tab className="fw-medium table-data" label="Recent" />
                  <Tab className="fw-medium table-data" label="Refund" />
                </Tabs>
              </AppBar>
            </Box>

            <div className="d-flex align-items-center">
              {!showDatePicker && !startDate && !endDate ? (
                <div
                  className="d-flex align-items-center justify-content-center rounded p-2"
                  style={{
                    backgroundColor: "#FAFBFF",
                    width: "40px",
                    height: "38px",
                    border: "1px solid #dee2e6",
                    cursor: "pointer"
                  }}
                  onClick={() => setShowDatePicker(true)}
                >
                  <MdOutlineDateRange size={16} className="text-muted" />
                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center rounded p-1"
                  style={{
                    backgroundColor: "#FAFBFF",
                    maxWidth: "280px",
                    height: "38px",
                    border: "1px solid #dee2e6",
                    gap: "8px"
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
      </Row>

      <Row>
        <Col md={12}>
          <div className="bg-white rounded shadow-sm p-3">
            <h6 className="mb-3 tabel-title">
              {tab === 0 ? "Recent" : "Refund"} Transactions
            </h6>

            {getBookingLoading ? (
              <DataLoading height="60vh" />
            ) : (
              <>
                {payments?.length > 0 ? (
                  <>
                    {/* Desktop Table */}
                    <div className="custom-scroll-container d-none d-md-block">
                      <Table
                        responsive
                        borderless
                        size="sm"
                        className="custom-table"
                      >
                        <thead>
                          <tr>
                            <th>User Name</th>
                            <th>Contact</th>
                            <th>Date</th>
                            <th>Payment Method</th>
                            <th>Amount</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments?.map((item, index) => (
                            <tr
                              key={item?._id}
                              className="table-data border-bottom align-middle text-center"
                            >
                              <td>
                                {item?.userId?.name
                                  ? item.userId.name.charAt(0).toUpperCase() +
                                  item.userId.name.slice(1)
                                  : "N/A"}
                              </td>
                              <td>
                                {item?.userId?.countryCode || ""}{" "}
                                {item?.userId?.phoneNumber || "N/A"}
                              </td>
                              <td>
                                <div
                                  style={{
                                    display: "inline-grid",
                                    gridTemplateColumns: "140px auto",
                                    textAlign: "left",
                                  }}
                                >
                                  <span className="fw-medium text-nowrap">
                                    {formatDate(item?.bookingDate)}
                                  </span>
                                  <span className="text-muted ms-1">
                                    {formatTime(
                                      renderSlotTimes(
                                        item?.slot?.[0]?.slotTimes
                                      )
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td>
                                {item?.paymentMethod
                                  ?.slice(0, 1)
                                  ?.toUpperCase()
                                  ?.concat(item?.paymentMethod?.slice(1)) || "-"}
                              </td>
                              <td>₹{item?.totalAmount}</td>
                              <td
                                style={{ cursor: "pointer" }}
                                onClick={() => handlePaymentDetails(item?._id)}
                              >
                                {loadingPaymentId === item?._id ? (
                                  <ButtonLoading color="blue" size={7} />
                                ) : (
                                  <FaEye className="text-primary" />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="mobile-card-table d-block d-md-none">
                      {payments?.map((item) => (
                        <div key={item?._id} className="card">
                          <div className="card-body">
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">User:</span>
                              <span className="mobile-card-value">
                                {item?.userId?.name
                                  ? item.userId.name.charAt(0).toUpperCase() +
                                  item.userId.name.slice(1)
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">
                                Contact:
                              </span>
                              <span className="mobile-card-value">
                                {item?.userId?.countryCode || ""}{" "}
                                {item?.userId?.phoneNumber || "N/A"}
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Date:</span>
                              <span className="mobile-card-value">
                                {formatDate(item?.bookingDate)}
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Time:</span>
                              <span className="mobile-card-value">
                                {formatTime(
                                  renderSlotTimes(item?.slot?.[0]?.slotTimes)
                                )}
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Method:</span>
                              <span className="mobile-card-value">
                                {item?.bookingType
                                  ?.slice(0, 1)
                                  ?.toUpperCase()
                                  ?.concat(item?.bookingType?.slice(1)) || "-"}
                              </span>
                            </div>
                            <div className="mobile-card-item">
                              <span className="mobile-card-label">Amount:</span>
                              <span className="mobile-card-value">
                                ₹{item?.totalAmount}
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
                      {tab === 0
                        ? "Recent Tansactions were Found !"
                        : "Tansactions were Found for Refund !"}
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
            totalRecords={totalRecords}
            defaultLimit={10}
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
    </Container>
  );
};

export default Payments;
