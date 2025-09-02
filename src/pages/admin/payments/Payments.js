import { useEffect, useState } from "react";
import { Row, Col, Container, Table, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDateRange } from "react-icons/md";
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
import { format } from "date-fns";

const Payments = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch();
  const { getBookingData, getBookingLoading, getBookingDetailsData } =
    useSelector((state) => state.booking);
  const [tab, setTab] = useState(0);

  const handleTabChange = (_, newValue) => {
    dispatch(resetBookingData());
    setTab(newValue);
  };

  const DateButton = ({ value, onClick }) => (
    <button
      onClick={onClick}
      style={{
        border: "none",
        backgroundColor: "white",
        padding: "8px 16px",
        cursor: "pointer",
        fontWeight: 600,
        color: "#495057",
      }}
    >
      {value || "Select Date"} <MdDateRange className="ms-2 mb-1" size={20} />
    </button>
  );

  const payments = getBookingData?.bookings || [];
  const paymentDetails = getBookingDetailsData?.booking || {};

  const status = tab === 0 ? "" : "refund";
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
      <h3 className="fw-bold">Payment</h3>
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
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center">
            <Box sx={{ bgcolor: "white" }}>
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
                >
                  <Tab className="fw-medium table-data" label="Recent" />
                  <Tab className="fw-medium table-data" label="Refund" />
                </Tabs>
              </AppBar>
            </Box>

            <div className="d-flex align-items-center gap-2">
              <span className="fw-semibold">From</span>
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  if (!date) setEndDate(null);
                }}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                customInput={<DateButton />}
              />

              <span className="fw-semibold">To</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                customInput={<DateButton />}
              />
              {sendDate && (
                <i
                  className="bi bi-x-square-fill text-danger"
                  onClick={() => {
                    setStartDate(null, setEndDate(null));
                  }}
                ></i>
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
                  <div className="custom-scroll-container">
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
                          {/* <th>Slot</th> */}
                          {/* <th>Court No</th> */}
                          <th>Amount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments?.map((item, index) => (
                          <tr
                            key={item?._id}
                            className="table-data border-bottom"
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
                                  display: "inline-grid", // shrink to content
                                  gridTemplateColumns: "140px auto", // fixed col for date, flexible for time
                                  textAlign: "left", // keep text aligned from start
                                }}
                              >
                                <span className="fw-medium text-nowrap">
                                  {formatDate(item?.bookingDate)}
                                </span>
                                <span className="text-muted small ms-1">
                                  |{" "}
                                  {formatTime(
                                    renderSlotTimes(item?.slot?.[0]?.slotTimes)
                                  )}{" "}
                                </span>
                              </div>
                            </td>
                            <td>
                              {item?.bookingType
                                ?.slice(0, 1)
                                ?.toUpperCase()
                                ?.concat(item?.bookingType?.slice(1)) || "-"}
                            </td>
                            {/* <td>
                              {item?.slot?.[0]?.businessHours?.[0]?.day || ""}{" "}
                              {renderSlotTimes(item?.slot?.[0]?.slotTimes)}
                            </td> */}
                            {/* <td >
                              {item?.slot?.[0]?.courtName || "-"}
                            </td> */}
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
