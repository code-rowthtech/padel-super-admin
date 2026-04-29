import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  OverlayTrigger,
  Tooltip as BootstrapTooltip,
  Form,
} from "react-bootstrap";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { FaArrowUp, FaArrowDown, FaEye, FaCalendarAlt } from "react-icons/fa";
import { BsCalendar2Check, BsFileText, BsCurrencyRupee, BsXCircle } from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";
import {
  MdOutlineDateRange,
  MdOutlineInsertDriveFile,
  MdOutlineTrendingUp,
  MdOutlineGroup,
  MdOutlineCancel,
} from "react-icons/md";
import "./Dashboard.css";
import {
  getCountDataForDashboard,
  getCancelledBookingsForDashboard,
  getRecentBookingsForDashboard,
  getBookingDetailsById,
  updateBookingStatus,
  getRevenueForDashboard,
  getDaywiseRevenueForDashboard,
} from "../../../redux/thunks";
import { SUPER_ADMIN_GET_ALL_CLUBS } from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { useSelector, useDispatch } from "react-redux";
import { formatDate, formatTime } from "../../../helpers/Formatting";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { useSuperAdminContext } from "../../../contexts/SuperAdminContext";
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
  const { selectedOwnerId } = useSuperAdminContext();
  const Owner = getOwnerFromSession();
  const ownerData = Owner?.user || Owner;
  const isSuperAdmin = ownerData?.role === 'super_admin';
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState("all");
  const [loadingClubs, setLoadingClubs] = useState(false);

  const {
    dashboardLoading,
    dashboardRevenue,
    dashboardDaywiseRevenue,
    dashboardCounts,
    dashboardRecentBookings,
    dashboardCancelledBookings,
  } = useSelector((state) => state?.dashboard);
  const formatNumber = (num) => {
    if (!num) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatRevenue = (num) => {
    if (!num) return "0";
    // Indian number format: 12,34,567
    const numStr = num.toString();
    const lastThree = numStr.substring(numStr.length - 3);
    const otherNumbers = numStr.substring(0, numStr.length - 3);
    if (otherNumbers !== '') {
      return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    }
    return lastThree;
  };

  const calculatePercentage = (current, previous) => {
    if (!previous || previous === 0) return "+0.0%";
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  const previousPeriod = {
    totalBookingHours: 45,
    upcomingBookingHours: 2,
    totalRevenue: 95000,
    cancellationRequestCount: 3,
  };

  const summaryCards = [
    {
      title: "Completed Booking",
      value: `${dashboardCounts?.totalBookingHours || 0} Hrs`,
      percent: calculatePercentage(
        dashboardCounts?.totalBookingHours || 0,
        previousPeriod?.totalBookingHours
      ),
      icon: calculatePercentage(
        dashboardCounts?.totalBookingHours || 0,
        previousPeriod?.totalBookingHours
      ).startsWith("+") ? (
        <FaArrowUp />
      ) : (
        <FaArrowDown />
      ),
      color: calculatePercentage(
        dashboardCounts?.totalBookingHours || 0,
        previousPeriod?.totalBookingHours
      ).startsWith("+")
        ? "success"
        : "danger",
      bigicon: <BsCalendar2Check size={28} />,
      iconClass: "stat-icon-purple",
    },
    {
      title: "Upcoming Booking",
      value: `${dashboardCounts?.upcomingBookingHours || 0} Hrs`,
      percent: calculatePercentage(
        dashboardCounts?.upcomingBookingHours || 0,
        previousPeriod?.upcomingBookingHours
      ),
      icon: calculatePercentage(
        dashboardCounts?.upcomingBookingHours || 0,
        previousPeriod?.upcomingBookingHours
      ).startsWith("+") ? (
        <FaArrowUp />
      ) : (
        <FaArrowDown />
      ),
      color: calculatePercentage(
        dashboardCounts?.upcomingBookingHours || 0,
        previousPeriod?.upcomingBookingHours
      ).startsWith("+")
        ? "success"
        : "danger",
      bigicon: <BsFileText size={28} />,
      iconClass: "stat-icon-green",
    },
    {
      title: "Total Revenue",
      value: `₹ ${formatRevenue(dashboardCounts?.totalRevenue)}`,
      percent: calculatePercentage(
        dashboardCounts?.totalRevenue || 0,
        previousPeriod?.totalRevenue
      ),
      icon: calculatePercentage(
        dashboardCounts?.totalRevenue || 0,
        previousPeriod?.totalRevenue
      ).startsWith("+") ? (
        <FaArrowUp />
      ) : (
        <FaArrowDown />
      ),
      color: calculatePercentage(
        dashboardCounts?.totalRevenue || 0,
        previousPeriod?.totalRevenue
      ).startsWith("+")
        ? "success"
        : "danger",
      bigicon: <BsCurrencyRupee size={28} />,
      iconClass: "stat-icon-orange",
    },
    {
      title: "Cancellation Requests",
      value: `${dashboardCounts?.cancellationRequestCount || 0}`,
      percent: calculatePercentage(
        dashboardCounts?.cancellationRequestCount || 0,
        previousPeriod?.cancellationRequestCount
      ),
      icon: calculatePercentage(
        dashboardCounts?.cancellationRequestCount || 0,
        previousPeriod?.cancellationRequestCount
      ).startsWith("+") ? (
        <FaArrowUp />
      ) : (
        <FaArrowDown />
      ),
      color: calculatePercentage(
        dashboardCounts?.cancellationRequestCount || 0,
        previousPeriod?.cancellationRequestCount
      ).startsWith("+")
        ? "danger"
        : "success",
      bigicon: <BsXCircle size={28} />,
      iconClass: "stat-icon-red",
    },
  ];
  const [loadingById, setLoadingById] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showBookingCancel, setShowBookingCancel] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [chartView, setChartView] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch clubs for filter
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoadingClubs(true);
        const url = selectedOwnerId
          ? `${SUPER_ADMIN_GET_ALL_CLUBS}?ownerId=${selectedOwnerId}`
          : SUPER_ADMIN_GET_ALL_CLUBS;
        const res = await ownerApi.get(url);
        const clubsData = res?.data?.data || [];
        setClubs(clubsData);
      } catch (error) {
        console.error("Error fetching clubs:", error);
        setClubs([]);
      } finally {
        setLoadingClubs(false);
      }
    };
    fetchClubs();
  }, [selectedOwnerId]);

  useEffect(() => {
    const params = selectedOwnerId ? { ownerId: selectedOwnerId } : {};
    if (selectedClubId !== "all") {
      params.clubId = selectedClubId;
    }
    dispatch(getCountDataForDashboard(params));
    dispatch(getCancelledBookingsForDashboard(params));
    dispatch(getRecentBookingsForDashboard(params));
    dispatch(getRevenueForDashboard(params));
  }, [dispatch, selectedOwnerId, selectedClubId]);

  useEffect(() => {
    if (chartView === "daily") {
      const params = selectedOwnerId ? { ownerId: selectedOwnerId } : {};
      if (selectedClubId !== "all") {
        params.clubId = selectedClubId;
      }
      params.month = selectedMonth + 1;
      params.year = selectedYear;
      dispatch(getDaywiseRevenueForDashboard(params));
    }
  }, [dispatch, chartView, selectedMonth, selectedYear, selectedOwnerId, selectedClubId]);

  const renderSlotTimes = (slotTimes) =>
    slotTimes?.length ? slotTimes?.map((slot) => slot?.time).join(", ") : "-";

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
    } finally {
      setLoadingById(null);
    }
  };
  const {
    getBookingData,
    getBookingDetailsData,
    updateBookingLoading,
  } = useSelector((state) => state?.booking);

  const bookings = getBookingData?.bookings || [];
  const bookingDetails = getBookingDetailsData?.booking || {};
  const formatDateMonth = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });

    const getOrdinal = (n) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getOrdinal(day)} ${month} `;
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
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

  let chartData = [];

  if (chartView === "monthly") {
    chartData = months?.map((month) => ({
      month,
      Booking: 0,
      totalAmount: 0,
      Cancelation: 0,
      year: 2025,
    }));

    const revenueArray = Array.isArray(dashboardRevenue) ? dashboardRevenue : [];

    revenueArray.forEach((item) => {
      const shortMonth = monthMap[item?.month];
      const monthIndex = chartData.findIndex((d) => d?.month === shortMonth);
      if (monthIndex !== -1) {
        chartData[monthIndex].Booking =
          (chartData[monthIndex].Booking || 0) + (item?.totalBookings || 0);
        chartData[monthIndex].totalAmount =
          (chartData[monthIndex].totalAmount || 0) + (item?.totalAmount || 0);
        chartData[monthIndex].year = item.year || 2025;
      }
    });

    revenueArray.forEach((item) => {
      const shortMonth = monthMap[item.month];
      const monthIndex = chartData.findIndex((d) => d?.month === shortMonth);
      if (monthIndex !== -1) {
        chartData[monthIndex].Cancelation =
          (chartData[monthIndex].Cancelation || 0) + (item?.cancelBookings || 0);
        chartData[monthIndex].year = item?.year || 2025;
      }
    });
  } else {
    const revenueArray = Array.isArray(dashboardDaywiseRevenue) ? dashboardDaywiseRevenue : [];

    chartData = revenueArray.map((item) => ({
      day: item?.day || "",
      Booking: item?.totalBookings || 0,
      totalAmount: item?.totalAmount || 0,
      Cancelation: item?.cancelBookings || 0,
    }));
  }

  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === "/admin/login" || pathname === "/admin/sign-up") {
      localStorage.removeItem("clubFormData");
      sessionStorage.removeItem("registerId");
    } else if (pathname === "/admin/dashboard") {
      localStorage.removeItem("clubFormData");
    }
  }, [pathname]);
  return (
    <Container
      fluid
      className="p-2 pt-md-0 p-md-4"
      style={{ background: "#f9fafb", minHeight: "100vh" }}
    >
      {dashboardLoading ? (
        <DataLoading height="80vh" />
      ) : (
        <>
          <Row className="mb-3">
            <Col className="d-flex justify-content-end">
              <div style={{ minWidth: "220px" }}>
                <Form.Group className="mb-0">
                  <Form.Select
                    value={selectedClubId}
                    onChange={(e) => setSelectedClubId(e.target.value)}
                    disabled={loadingClubs || clubs.length === 0}
                    style={{
                      fontSize: "13px",
                      fontFamily: "Poppins",
                      borderRadius: "6px",
                      border: "2px solid #dee2e6",
                      padding: "10px 12px",
                      backgroundColor: "#fff",
                      fontWeight: "500",
                      boxShadow: "none",
                    }}
                  >
                    {clubs.length === 0 ? (
                      <option value="">No Available Clubs</option>
                    ) : (
                      <>
                        <option value="all">All Clubs</option>
                        {clubs.map((club) => (
                          <option key={club._id} value={club._id}>
                            {club?.clubName}
                          </option>
                        ))}
                      </>
                    )}
                  </Form.Select>
                </Form.Group>
              </div>
            </Col>
          </Row>
          <Row className="mb-4 g-3">
            {summaryCards?.map((card, index) => (
              <Col key={index} xs={12} sm={6} lg={3} className="fade-in-up">
                <Card className="stat-card border-0">
                  <Card.Body className="d-flex align-items-center gap-3 py-3">
                    <div className={`stat-icon ${card?.iconClass}`}>
                      {card?.bigicon}
                    </div>
                    <div>
                      <div className="text-muted mb-1" style={{ fontSize: "13px", fontWeight: "500" }}>
                        {card?.title}
                      </div>
                      <div className="fw-bold mb-1" style={{ fontSize: "24px", color: "#1f2937" }}>
                        {card?.value}
                      </div>
                      <div className={`percent-badge ${card?.color}`}>
                        {card?.icon}
                        <span>{card?.percent}</span>
                        <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "4px" }}>vs last month</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="mb-4 g-3">
            <Col xs={12} lg={7} className="fade-in-up">
              <Card className="border-0 h-100">
                <Card.Body>
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-sm-center mb-4">
                    <div>
                      <h5 className="mb-1 fw-bold" style={{ color: "#1f2937" }}>
                        {chartView === "monthly" ? "Monthly" : "Daily"} Booking Analytics
                      </h5>
                      <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                        Track your booking performance over time
                      </p>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      {chartView === "daily" && (
                        <Form.Select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(Number(e.target.value))}
                          style={{
                            fontSize: "12px",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontWeight: "500",
                            width: "100px",
                            border: "1px solid #dee2e6",boxShadow:"none"
                          }}
                        >
                          {months.map((month, index) => (
                            <option key={index} value={index}>
                              {month} {selectedYear}
                            </option>
                          ))}
                        </Form.Select>
                      )}
                      <button
                        className={`btn btn-sm ${chartView === "monthly" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setChartView("monthly")}
                        style={{
                          fontSize: "12px",
                          padding: "6px 16px",
                          borderRadius: "6px",
                          fontWeight: "500",
                        }}
                      >
                        Monthly
                      </button>
                      <button
                        className={`btn btn-sm ${chartView === "daily" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setChartView("daily")}
                        style={{
                          fontSize: "12px",
                          padding: "6px 16px",
                          borderRadius: "6px",
                          fontWeight: "500",
                        }}
                      >
                        Daily
                      </button>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorBooking" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis
                        dataKey={chartView === "monthly" ? "month" : "day"}
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "#9ca3af",
                          fontSize: 12,
                        }}
                        interval={chartView === "daily" ? "preserveStartEnd" : 0}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "#9ca3af",
                          fontSize: 12,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                        labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Booking"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorBooking)"
                        dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} lg={5} className="fade-in-up">
              <Card className="border-0 h-100" style={{ maxHeight: "450px" }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold" style={{ color: "#1f2937" }}>
                      Today Cancellation
                    </h5>
                    <Link
                      to="/admin/cancellation"
                      className="text-decoration-none"
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "rgb(31, 65, 187)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      View More →
                    </Link>
                  </div>
                  <div
                    className=" p-0"
                    style={{
                      height: "45vh",
                      overflowY:
                        dashboardCancelledBookings?.length > 9
                          ? "auto"
                          : "scroll",
                    }}
                  >
                    {dashboardCancelledBookings?.length > 0 ? (
                      <>
                        <Table
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
                                  {/* ✅ SUPER ADMIN: Handle both old format (userId) and new format (user/userName) */}
                                  {(item?.userId?.name || item?.user?.name || item?.userName)
                                    ?.slice(0, 1)
                                    ?.toUpperCase()
                                    ?.concat((item?.userId?.name || item?.user?.name || item?.userName)?.slice(1)) ||
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
                                  {/* ✅ SUPER ADMIN: Handle both old format and new format */}
                                  {item?.slot?.[0]?.courtName || item?.club?.clubName || item?.clubName || "-"}
                                </td>
                                <td
                                  className="py-2"
                                  style={{ cursor: "pointer" }}
                                >
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

                        <div className="mobile-card-table d-block d-md-none">
                          {dashboardCancelledBookings?.map((item) => (
                            <div key={item?._id} className="card mb-2">
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
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <FaCalendarAlt style={{ fontSize: "40px" }} />
                        </div>
                        <div className="empty-state-title">No cancellations were found!</div>
                        <div className="empty-state-text">Enjoy your stress-free day.</div>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card className="border-0 fade-in-up">
                <Card.Body className="pb-2">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold" style={{ color: "#1f2937" }}>
                      Recent Bookings
                    </h5>
                    <Link
                      to="/admin/booking"
                      className="text-decoration-none"
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "rgb(31, 65, 187)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      View More →
                    </Link>
                  </div>
                  {dashboardRecentBookings?.length > 0 ? (
                    <>
                      <div className=" d-none d-md-block" style={{ height: "auto" }}>
                        <Table
                          responsive
                          borderless
                          size="sm"
                          className="custom-table"

                        >
                          <thead>
                            <tr className="text-center">
                              <th>SR NO.</th>
                              <th>USER NAME</th>
                              <th>DATE</th>
                              <th>COURT NO.</th>
                              <th>TIME</th>
                              <th>STATUS</th>
                              <th>ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardRecentBookings?.map((item, idx) => (
                              <tr
                                key={item._id}
                                className="table-data border-bottom align-middle text-center"
                              >
                                <td>{idx + 1}</td>
                                <td>
                                  {(item?.userId?.name || item?.user?.name || item?.userName)
                                    ?.slice(0, 1)
                                    ?.toUpperCase()
                                    ?.concat((item?.userId?.name || item?.user?.name || item?.userName)?.slice(1)) ||
                                    "N/A"}
                                </td>
                                <td>
                                  {formatDateMonth(item?.bookingDate)}
                                </td>
                                <td>
                                  {item?.slot?.[0]?.courtName || item?.club?.clubName || item?.clubName || "-"}
                                </td>
                                <td>
                                  {formatTime(
                                    renderSlotTimes(
                                      item?.slot?.[0]?.slotTimes
                                    )
                                  )}
                                </td>
                                <td>
                                  <span className="status-badge status-confirmed">Confirmed</span>
                                </td>
                                <td>
                                  {loadingById === item?._id ? (
                                    <ButtonLoading color="blue" size={7} />
                                  ) : (
                                    <>
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={
                                          <BootstrapTooltip>
                                            View
                                          </BootstrapTooltip>
                                        }
                                      >
                                        <FaEye
                                          className="action-icon text-primary"
                                          onClick={() =>
                                            handleBookingDetails(
                                              item?._id,
                                              "details"
                                            )
                                          }
                                          size={16}
                                        />
                                      </OverlayTrigger>
                                      <OverlayTrigger
                                        placement="top"
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
                                          className="action-icon text-danger"
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

                      <div className="mobile-card-table d-block d-md-none">
                        {dashboardRecentBookings?.map((item) => (
                          <div key={item._id} className="card mb-2">
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
      <BookingCancellationModal
        show={showCancellation}
        handleClose={() => setShowCancellation(false)}
        updateStatus={() => {
          dispatch(
            updateBookingStatus({ id: bookingDetails?._id, status: "refunded" })
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
              id: bookingDetails?._id,
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
