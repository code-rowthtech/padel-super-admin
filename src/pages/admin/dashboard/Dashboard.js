// DashboardPage.js
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  OverlayTrigger,
  Tooltip as BootstrapTooltip,
} from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { FaArrowUp, FaArrowDown, FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  MdOutlineDateRange,
  MdOutlineInsertDriveFile,
  MdOutlineTrendingUp,
  MdOutlineGroup,
  MdOutlineCancel,
} from "react-icons/md";
import {
  getCountDataForDashboard,
  getCancelledBookingsForDashboard,
  getRecentBookingsForDashboard,
  getBookingDetailsById,
  updateBookingStatus,
} from "../../../redux/thunks";
import { useSelector, useDispatch } from "react-redux";
import { formatDate } from "../../../helpers/Formatting";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import {
  BookingCancelModal,
  BookingDetailsModal,
} from "../booking/manual booking/BookingModal";
import {
  BookingCancellationModal,
  CancelRequestModal,
} from "../booking/cancellation/ModalCancellation";

const chartData = [
  { year: "2020", lose: 2000, profit: 4000 },
  { year: "2021", lose: 2500, profit: 4800 },
  { year: "2022", lose: 2800, profit: 5000 },
  { year: "2023", lose: 4000, profit: 6800 },
  { year: "2024", lose: 3200, profit: 5300 },
  { year: "2025", lose: 3000, profit: 4900 },
];

const AdminDashboard = () => {
  const dispatch = useDispatch();

  const {
    dashboardLoading,
    dashboardCounts,
    dashboardRecentBookings,
    dashboardCancelledBookings,
  } = useSelector((state) => state.dashboard);

  const formatNumber = (num) => {
    if (!num) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const summaryCards = [
    {
      title: "Total Booking",
      value: `${dashboardCounts?.totalBookingHours || 0} Hrs`,
      percent: "+15%",
      icon: <FaArrowUp />,
      color: "success",
      bigicon: <MdOutlineDateRange size={35} />,
    },
    {
      title: "Upcoming Booking",
      value: `${dashboardCounts?.upcomingBookingHours || 0} Hrs`,
      percent: "-3.5%",
      icon: <FaArrowDown />,
      color: "danger",
      bigicon: <MdOutlineInsertDriveFile size={35} />,
    },
    {
      title: "Total Revenue",
      value: `₹ ${formatNumber(dashboardCounts?.totalRevenue) || 0}`,
      percent: "+15%",
      icon: <FaArrowUp />,
      color: "success",
      bigicon: <MdOutlineTrendingUp size={35} />,
    },
    {
      title: "Cancellation Request",
      value: `${dashboardCounts?.cancellationRequestCount || 0}`,
      percent: "-3.5%",
      icon: <FaArrowDown />,
      color: "danger",
      bigicon: <MdOutlineGroup size={35} />,
    },
  ];
  const [loadingById, setLoadingById] = useState(null);

  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showBookingCancel, setShowBookingCancel] = useState(false);

  const [showCancellation, setShowCancellation] = useState(false);
  const [showRequest, setShowRequest] = useState(false);

  useEffect(() => {
    dispatch(getCountDataForDashboard());
    dispatch(getCancelledBookingsForDashboard());
    dispatch(getRecentBookingsForDashboard());
  }, [dispatch]);

  const renderSlotTimes = (slotTimes) =>
    slotTimes?.length ? slotTimes.map((slot) => slot.time).join(", ") : "-";

  const handleBookingDetails = async (id, type) => {
    setLoadingById(id);
    try {
      await dispatch(getBookingDetailsById({ id })).unwrap();
      type === "details"
        ? setShowBookingDetails(true)
        : type === "cancel"
        ? setShowBookingCancel(true)
        : setShowCancellation(true);
    } catch (error) {
      console.error("Failed to fetch booking details:", error);
    } finally {
      setLoadingById(null);
    }
  };
  const {
    getBookingData,
    getBookingLoading,
    getBookingDetailsData,
    updateBookingLoading,
  } = useSelector((state) => state.booking);

  const bookings = getBookingData?.bookings || [];
  const bookingDetails = getBookingDetailsData?.booking || {};

  return (
    <Container
      fluid
      className="p-4"
      style={{ background: "#f4f7fd", minHeight: "100vh" }}
    >
      {dashboardLoading ? (
        <DataLoading height="80vh" />
      ) : (
        <>
          <Row className="mb-4">
            {summaryCards.map((card, index) => (
              <Col key={index} md={3} className="mb-3">
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
                            transform:
                              card.color === "danger"
                                ? "rotate(45deg)"
                                : "rotate(-45deg)",
                            transition: "transform 0.3s",
                          }}
                        >
                          {card.icon}
                        </span>
                        <span className="small">{card.percent}</span>
                      </div>
                    </div>
                    <div className=" mb-2 text-end">
                      <div className="mb-4 text-end text-dark">
                        {card.bigicon}
                      </div>
                      {/* <Link to="#" className="dashboard-viewmore">
                    View More
                  </Link> */}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="mb-4">
            <Col md={7}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6
                      className="mb-0"
                      style={{ fontSize: "1.1rem", fontWeight: "600" }}
                    >
                      Revenue Performance
                    </h6>
                    <div className="d-flex">
                      <div className="d-flex align-items-center me-3">
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#4f46e5",
                            borderRadius: "2px",
                            marginRight: "6px",
                          }}
                        ></div>
                        <span style={{ fontSize: "0.85rem" }}>Profit</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#ef4444",
                            borderRadius: "2px",
                            marginRight: "6px",
                          }}
                        ></div>
                        <span style={{ fontSize: "0.85rem" }}>Loss</span>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                      />
                      <XAxis
                        dataKey="year"
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tick={{
                          fill: "#6b7280",
                          fontSize: 12,
                        }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tick={{
                          fill: "#6b7280",
                          fontSize: 12,
                        }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value, name) => [
                          `$${value.toLocaleString()}`,
                          name === "profit" ? "Profit" : "Loss",
                        ]}
                        labelFormatter={(label) => `Year: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#4f46e5", strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="lose"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#ef4444", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#ef4444", strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={5}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <h6 className="tabel-title">Today Cancellation</h6>
                    <Link
                      to="/admin/cancellation"
                      className="dashboard-viewmore"
                    >
                      View More
                    </Link>
                  </div>
                  <div
                    className="custom-scroll-container"
                    style={{
                      height: "290px",
                      overflowY: "auto",
                    }}
                  >
                    {dashboardCancelledBookings?.length > 0 ? (
                      <Table
                        responsive
                        borderless
                        size="sm"
                        className="custom-table"
                      >
                        <thead>
                          <tr className="text-center">
                            <th>User Name</th>
                            <th>Date</th>
                            <th>Court No</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardCancelledBookings?.map((item) => (
                            <tr
                              key={item?._id}
                              className="table-data border-bottom"
                            >
                              <td>
                                {item?.userId?.name
                                  ?.slice(0, 1)
                                  ?.toUpperCase()
                                  ?.concat(item?.userId?.name?.slice(1)) ||
                                  "N/A"}
                              </td>{" "}
                              <td>{formatDate(item?.bookingDate)}</td>
                              <td>{item?.slot[0]?.courtName || "-"}</td>
                              <td style={{ cursor: "pointer" }}>
                                {loadingById === item?._id ? (
                                  <ButtonLoading color="blue" size={7} />
                                ) : (
                                  <>
                                    <OverlayTrigger
                                      placement="bottom"
                                      overlay={
                                        <BootstrapTooltip>
                                          View Details
                                        </BootstrapTooltip>
                                      }
                                    >
                                      <FaEye
                                        className="text-primary ms-1"
                                        onClick={() =>
                                          handleBookingDetails(item?._id, "")
                                        }
                                        size={18}
                                      />
                                    </OverlayTrigger>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="d-flex text-danger small justify-content-center align-items-center mt-5 pt-5">
                        No cancellations were found !
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <h6 className="tabel-title">Recent Bookings</h6>
                    <Link to="/admin/booking" className="dashboard-viewmore">
                      View More
                    </Link>
                  </div>
                  {dashboardRecentBookings?.length > 0 ? (
                    <div className="custom-scroll-container">
                      <Table
                        responsive
                        borderless
                        size="sm"
                        className="custom-table"
                      >
                        <thead>
                          <tr className="text-center">
                            <th>User Name</th>
                            <th>Date</th>
                            <th>Court No</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardRecentBookings?.map((item) => (
                            <tr
                              key={item._id}
                              className="table-data border-bottom"
                            >
                              <td>
                                {item?.userId?.name
                                  ?.slice(0, 1)
                                  ?.toUpperCase()
                                  ?.concat(item?.userId?.name?.slice(1)) ||
                                  "N/A"}
                              </td>{" "}
                              <td>{formatDate(item?.bookingDate)}</td>
                              <td>{item?.slot[0]?.courtName || "-"}</td>
                              <td style={{ cursor: "pointer" }}>
                                {loadingById === item?._id ? (
                                  <ButtonLoading color="blue" size={7} />
                                ) : (
                                  <>
                                    <OverlayTrigger
                                      placement="left"
                                      overlay={
                                        <BootstrapTooltip>
                                          Cancel
                                        </BootstrapTooltip>
                                      }
                                    >
                                      <MdOutlineCancel
                                        onClick={() =>
                                          handleBookingDetails(
                                            item?._id,
                                            "cancel"
                                          )
                                        }
                                        className="text-danger me-1"
                                        style={{ cursor: "pointer" }}
                                        size={18}
                                      />
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                      placement="bottom"
                                      overlay={
                                        <BootstrapTooltip>
                                          View Details
                                        </BootstrapTooltip>
                                      }
                                    >
                                      <FaEye
                                        className="text-primary ms-1"
                                        onClick={() =>
                                          handleBookingDetails(
                                            item?._id,
                                            "details"
                                          )
                                        }
                                        size={18}
                                      />
                                    </OverlayTrigger>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div
                      className="d-flex text-danger small justify-content-center align-items-center"
                      style={{ height: "20vh" }}
                    >
                      No rencent bookings were found
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* ---------------Bookings------------------------- */}
      <BookingDetailsModal
        show={showBookingDetails}
        handleClose={() => setShowBookingDetails(false)}
        bookingDetails={bookingDetails}
      />
      <BookingCancelModal
        show={showBookingCancel}
        onHide={() => setShowBookingCancel(false)}
        bookingDetails={bookingDetails}
        loading={updateBookingLoading}
        cancelBooking={(reason) => {
          dispatch(
            updateBookingStatus({
              id: bookingDetails?._id,
              status: "in-progress",
              cancellationReason: reason,
            })
          )
            .unwrap()
            .then(() => {
              dispatch(getRecentBookingsForDashboard());
              setShowBookingCancel(false);
            });
        }}
      />
      {/* ----------------Cancellation------------------------ */}
      <BookingCancellationModal
        show={showCancellation}
        handleClose={() => setShowCancellation(false)}
        updateStatus={() => {
          dispatch(
            updateBookingStatus({ id: bookingDetails._id, status: "refunded" })
          )
            .unwrap()
            .then(() => {
              setShowCancellation(false);
              dispatch(getCancelledBookingsForDashboard());
            });
        }}
        openRejection={() => {
          setShowCancellation(false);
          setTimeout(() => setShowRequest(true), 300);
        }}
        loading={updateBookingLoading}
        bookingDetails={bookingDetails}
      />
      <CancelRequestModal
        show={showRequest}
        handleClose={() => setShowRequest(false)}
        openRequestModal={(reason) => {
          dispatch(
            updateBookingStatus({
              id: bookingDetails._id,
              status: "rejected",
              cancellationReasonForOwner: reason,
            })
          )
            .unwrap()
            .then(() => {
              setShowRequest(false);
              dispatch(getCancelledBookingsForDashboard());
            });
        }}
        loading={updateBookingLoading}
        bookingDetails={bookingDetails}
      />
    </Container>
  );
};

export default AdminDashboard;
