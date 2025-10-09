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
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, defs, Bar, BarChart } from "recharts";
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
  getRevenueForDashboard,
} from "../../../redux/thunks";
import { useSelector, useDispatch } from "react-redux";
import { formatDate, formatTime } from "../../../helpers/Formatting";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import {
  BookingDetailsModal,
  BookingCancelModal,
} from "../booking/manual booking/BookingModal";
import {
  BookingCancellationModal,
  CancelRequestModal,
} from "../booking/cancellation/ModalCancellation";



const AdminDashboard = () => {
  const dispatch = useDispatch();

  const {
    dashboardLoading,
    dashboardRevenueLoading,
    dashboardRevenue,
    dashboardCounts,
    dashboardRecentBookings,
    dashboardCancelledBookings,
  } = useSelector((state) => state.dashboard);
  console.log(dashboardCancelledBookings, 'dashboardCancelledBookings');
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
  const [viewMode, setViewMode] = useState("both");
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showBookingCancel, setShowBookingCancel] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);
  const [showRequest, setShowRequest] = useState(false);

  useEffect(() => {
    dispatch(getCountDataForDashboard());
    dispatch(getCancelledBookingsForDashboard());
    dispatch(getRecentBookingsForDashboard());
    dispatch(getRevenueForDashboard())
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
console.log({bookingDetails});
  const formatDateMonth = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" }); // Jan, Feb, Mar...

    // ordinal suffix add karna
    const getOrdinal = (n) => {
      if (n > 3 && n < 21) return "th"; // 11th, 12th, 13th
      switch (n % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    return `${day}${getOrdinal(day)} ${month} `;
  };

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const monthMap = {
    January: "Jan",
    February: "Feb",
    March: "Mar",
    April: "Apr",
    May: "May",
    June: "Jun",
    July: "Jul",
    August: "Aug",
    September: "Sep",
    October: "Oct",
    November: "Nov",
    December: "Dec",
  };

  let chartData = months.map((month) => ({
    month,
    Booking: 0,
    totalAmount: 0,
    Cancelation: 0,
    year: 2025,
  }));

  // Aggregate booking & amount data
  dashboardRevenue?.forEach((item) => {
    const shortMonth = monthMap[item.month];
    const monthIndex = chartData.findIndex((d) => d.month === shortMonth);
    if (monthIndex !== -1) {
      chartData[monthIndex].Booking = (chartData[monthIndex].Booking || 0) + (item.totalBookings || 0); // Ensure updates to 11
      chartData[monthIndex].totalAmount = (chartData[monthIndex].totalAmount || 0) + (item.totalAmount || 0);
      chartData[monthIndex].year = item.year || 2025;
    }
  });

  // Aggregate cancelations
  console.log('Dashboard Revenue Data:', dashboardRevenue);
  dashboardRevenue?.forEach((item) => {
    console.log('Processing item:', item);
    const shortMonth = monthMap[item.month];
    const monthIndex = chartData.findIndex((d) => d.month === shortMonth);
    if (monthIndex !== -1) {
      console.log('Before:', chartData[monthIndex].Cancelation, 'Adding:', item.cancelBookings);
      chartData[monthIndex].Cancelation = (chartData[monthIndex].Cancelation || 0) + (item.cancelBookings || 0);
      console.log('After:', chartData[monthIndex].Cancelation);
      chartData[monthIndex].year = item.year || 2025;
    }
  });
  console.log('Final Chart Data:', chartData);
  return (
    <Container
      fluid
      className="p-2 p-md-4"
      style={{ background: "#f4f7fd", minHeight: "100vh" }}
    >
      {dashboardLoading ? (
        <DataLoading height="80vh" />
      ) : (
        <>
          <Row className="mb-4">
            {summaryCards.map((card, index) => (
              <Col key={index} xs={12} sm={6} lg={3} className="mb-3">
                <Card className="shadow border-0 rounded-0 h-100">
                  <Card.Body className="d-flex justify-content-between">
                    <div className="mt-2">
                      <div className="table-data">{card.title}</div>
                      <div className="card-value">{card.value}</div>
                      <div
                        className={`d-flex align-items-center gap-1 text-${card.color} fw-semibold`}
                      >
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingLeft: "6px",
                            paddingRight: "6px",
                            paddingTop: "4px",
                            paddingBottom: "4px",
                            borderRadius: "50%",
                            backgroundColor:
                              card.color === "danger" ? "#FFD9D7" : "#B5FFCE", // red vs blue background
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              transform:
                                card.color === "danger"
                                  ? "rotate(45deg)"
                                  : "rotate(-45deg)",
                              transition: "transform 0.3s ease",
                            }}
                          >
                            {card.icon}
                          </span>
                        </div>

                        <span className="small">{card.percent}</span>
                      </div>
                    </div>
                    <div className=" mb-2 text-end">
                      <div className="mb-4 text-end text-dark">
                        {card.bigicon}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="mb-4">
            <Col xs={12} lg={7} className="mb-4 mb-lg-0">
              <Card className="shadow border-0 rounded-3">
                <Card.Body>
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-sm-center mb-4">
                    <div>
                      <h6
                        className="mb-1"
                        style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937" }}
                      >
                        Monthly Booking Analytics
                      </h6>
                      <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                        Track your booking performance over time
                      </p>
                    </div>

                  </div>

                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                        tick={{ fill: "#6b7280", fontSize: 12, fontWeight: "500" }}
                        interval={0}
                        height={50}
                        padding={{  right: 10 }}
                      />
                      <YAxis
                        type="number"
                        domain={[0, 50]}
                        ticks={[0, 10, 20, 30, 40, 50]}
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                        width={60}
                        tick={{ fill: "#6b7280", fontSize: 12, fontWeight: "500" }}
                        label={{
                          value: 'Booking Count',
                          angle: -90,
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fill: '#6b7280', fontSize: '12px', fontWeight: '600' }
                        }}
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{ backgroundColor: "white", border: "none" }}
                        content={({ label, payload }) => {
                          if (payload && payload.length > 0) {
                            const dataPoint = payload[0].payload;
                            console.log({payload});
                            return (
                              <div
                                style={{
                                  backgroundColor: "#fff",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "12px",
                                  padding: "12px",
                                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                                  fontSize: "13px",
                                  minWidth: "180px"
                                }}
                              >
                                <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#1f2937" }}>{label} 2024</p>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span style={{ color: "#6b7280" }}>📊 Bookings:</span>
                                  <span style={{ fontWeight: "600", color: "#3b82f6" }}>{dataPoint.Booking}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span style={{ color: "#6b7280" }}>❌ Cancellations:</span>
                                  <span style={{ fontWeight: "600", color: "#ef4444" }}>{dataPoint.Cancelation}</span>
                                </div>
                                <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #f3f4f6" }} />
                                <div className="d-flex justify-content-between align-items-center">
                                  <span style={{ color: "#6b7280" }}>💰 Revenue:</span>
                                  <span style={{ fontWeight: "700", color: "#059669" }}>₹{(dataPoint.totalAmount || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="Booking"
                        name="Bookings"
                        fill="#3b82f6"
                        barSize={30}
                        radius={[6, 6, 0, 0]}
                        isAnimationActive={true}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} lg={5}>
              <Card className="shadow border-0" style={{ height:dashboardCancelledBookings?.length > 0 ? "450px" : "450px" }}>
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <h6
                      className="mb-3"
                      style={{ fontSize: "20px", fontWeight: "600" }}
                    >
                      Today Cancellation
                    </h6>
                    <Link
                      to="/admin/cancellation"
                      className="dashboard-viewmore"
                    >
                      View More
                    </Link>
                  </div>
                  <div
                    className="custom-scroll-container p-0"
                    style={{
                      height: "250px",
                      overflowY: "auto",
                    }}
                  >
                    {dashboardCancelledBookings?.length > 0 ? (
                      <>
                        {/* Desktop Table */}
                        <Table
                          responsive
                          borderless
                          size="sm"
                          className="custom-table d-none d-md-table"
                        >
                          <thead>
                            <tr className="text-center">
                              <th>Sr No.</th>
                              <th>User Name</th>
                              <th>Date</th>
                              <th>Court No</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardCancelledBookings?.map((item, idx) => (
                              <tr
                                key={item?._id}
                                className="table-dat border-bottom"
                              >
                                <td
                                  className="text-truncate py-2"
                                  style={{ maxWidth: "120px" }}
                                >
                                  {idx + 1}
                                </td>
                                <td
                                  className="text-truncate py-2"
                                  style={{ maxWidth: "120px" }}
                                >
                                  {item?.userId?.name
                                    ?.slice(0, 1)
                                    ?.toUpperCase()
                                    ?.concat(item?.userId?.name?.slice(1)) ||
                                    "N/A"}
                                </td>
                                <td className="text-truncate py-2">
                                  <div className="d-flex justify-content-center">
                                    <span className="fw-medium small">
                                      {formatDateMonth(item?.bookingDate)}
                                    </span>
                                    <span className="text-muted ps-1 small">
                                      {formatTime(
                                        renderSlotTimes(
                                          item?.slot?.[0]?.slotTimes
                                        )
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td
                                  className="text-truncate py-2"
                                  style={{ maxWidth: "80px" }}
                                >
                                  {item?.slot[0]?.courtName || "-"}
                                </td>
                                <td className='py-2' style={{ cursor: "pointer" }}>
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
                                          className="text-primary"
                                          onClick={() =>
                                            handleBookingDetails(item?._id, "")
                                          }
                                          size={16}
                                        />
                                      </OverlayTrigger>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        {/* Mobile Card Layout */}
                        <div className="mobile-card-table d-block d-md-none">
                          {dashboardCancelledBookings?.map((item) => (
                            <div key={item?._id} className="card">
                              <div className="card-body">
                                <div className="mobile-card-item">
                                  <span className="mobile-card-label">
                                    User:
                                  </span>
                                  <span className="mobile-card-value">
                                    {item?.userId?.name
                                      ?.slice(0, 1)
                                      ?.toUpperCase()
                                      ?.concat(item?.userId?.name?.slice(1)) ||
                                      "N/A"}
                                  </span>
                                </div>
                                <div className="mobile-card-item">
                                  <span className="mobile-card-label">
                                    Date:
                                  </span>
                                  <span className="mobile-card-value">
                                    {formatDate(item?.bookingDate)}
                                  </span>
                                </div>
                                <div className="mobile-card-item">
                                  <span className="mobile-card-label">
                                    Time:
                                  </span>
                                  <span className="mobile-card-value">
                                    {formatTime(
                                      renderSlotTimes(
                                        item?.slot?.[0]?.slotTimes
                                      )
                                    )}
                                  </span>
                                </div>
                                <div className="mobile-card-item">
                                  <span className="mobile-card-label">
                                    Court:
                                  </span>
                                  <span className="mobile-card-value">
                                    {item?.slot[0]?.courtName || "-"}
                                  </span>
                                </div>
                                <div className="mobile-card-item">
                                  <span className="mobile-card-label">
                                    Action:
                                  </span>
                                  <div className="mobile-card-value">
                                    {loadingById === item?._id ? (
                                      <ButtonLoading color="blue" size={7} />
                                    ) : (
                                      <FaEye
                                        className="text-primary"
                                        onClick={() =>
                                          handleBookingDetails(item?._id, "")
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
                      <div className="d-flex text-danger small justify-content-center align-items-center mt-5 pt-5">
                        <p className="mt-5">No cancellations were found !</p>
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
                    <h6
                      className="mb-3"
                      style={{ fontSize: "20px", fontWeight: "600" }}
                    >
                      Recent Bookings
                    </h6>
                    <Link to="/admin/booking" className="dashboard-viewmore">
                      View More
                    </Link>
                  </div>
                  {dashboardRecentBookings?.length > 0 ? (
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
                            <tr className="text-center">
                              <th>Sr No.</th>
                              <th>User Name</th>
                              <th>Date</th>
                              <th>Court No</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardRecentBookings?.map((item, idx) => (
                              <tr
                                key={item._id}
                                className="table-data border-bottom align-middle text-center"
                              >
                                <td
                                  className="text-truncate"
                                  style={{ maxWidth: "120px" }}
                                >
                                  {idx + 1}
                                </td>
                                <td
                                  className="text-truncate"
                                  style={{ maxWidth: "120px" }}
                                >
                                  {item?.userId?.name
                                    ?.slice(0, 1)
                                    ?.toUpperCase()
                                    ?.concat(item?.userId?.name?.slice(1)) ||
                                    "N/A"}
                                </td>
                                <td>
                                  <div className="d-flex justify-content-center">
                                    <span className="fw-medium small">
                                      {formatDateMonth(item?.bookingDate)}
                                    </span>
                                    <span className="text-muted small ms-2">
                                      {formatTime(
                                        renderSlotTimes(
                                          item?.slot?.[0]?.slotTimes
                                        )
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td
                                  className="text-truncate"
                                  style={{ maxWidth: "80px" }}
                                >
                                  {item?.slot[0]?.courtName || "-"}
                                </td>
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
                                          size={16}
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
                                          size={16}
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

                      {/* Mobile Card Layout */}
                      <div className="mobile-card-table d-block d-md-none">
                        {dashboardRecentBookings?.map((item) => (
                          <div key={item._id} className="card">
                            <div className="card-body">
                              <div className="mobile-card-item">
                                <span className="mobile-card-label">User:</span>
                                <span className="mobile-card-value">
                                  {item?.userId?.name
                                    ?.slice(0, 1)
                                    ?.toUpperCase()
                                    ?.concat(item?.userId?.name?.slice(1)) ||
                                    "N/A"}
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
                                <span className="mobile-card-label">
                                  Court:
                                </span>
                                <span className="mobile-card-value">
                                  {item?.slot[0]?.courtName || "-"}
                                </span>
                              </div>
                              <div className="mobile-card-item">
                                <span className="mobile-card-label">
                                  Actions:
                                </span>
                                <div className="mobile-card-value">
                                  {loadingById === item?._id ? (
                                    <ButtonLoading color="blue" size={7} />
                                  ) : (
                                    <div className="d-flex gap-2">
                                      <MdOutlineCancel
                                        onClick={() =>
                                          handleBookingDetails(
                                            item?._id,
                                            "cancel"
                                          )
                                        }
                                        className="text-danger"
                                        style={{ cursor: "pointer" }}
                                        size={18}
                                      />
                                      <FaEye
                                        className="text-primary"
                                        onClick={() =>
                                          handleBookingDetails(
                                            item?._id,
                                            "details"
                                          )
                                        }
                                        size={18}
                                        style={{ cursor: "pointer" }}
                                      />
                                    </div>
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
                      className="d-flex text-danger small justify-content-center align-items-center"
                      style={{ height: "20vh" }}
                    >
                      No recent bookings were found
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