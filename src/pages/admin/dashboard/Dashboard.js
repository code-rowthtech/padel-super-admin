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
  Legend,
} from "recharts";
import { FaArrowUp, FaArrowDown, FaEye, FaCalendarAlt, FaTimes, FaMobileAlt, FaDesktop } from "react-icons/fa";
import { BsCalendar2Check, BsFileText, BsCurrencyRupee } from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";
import {
  MdOutlineDateRange,
  MdOutlineInsertDriveFile,
  MdOutlineTrendingUp,
  MdOutlineGroup,
  MdOutlineCancel,
  MdOutlinePhoneIphone,
  MdOutlineComputer,
} from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Dashboard.css";
import {
  getCountDataForDashboard,
  getCancelledBookingsForDashboard,
  getRecentBookingsForDashboard,
  getBookingDetailsById,
  updateBookingStatus,
  getRevenueForDashboard,
  getDaywiseRevenueForDashboard,
  getCategoryList,
  getClubsBookingModeRatio,
  getOpenMatchOverview,
} from "../../../redux/thunks";
// Booking Analytics APIs (monthly): GET_REVENUE_DASHBOARD → getRevenueForDashboard
// Booking Analytics APIs (daily):   GET_DAYWISE_DASHBOARD → getDaywiseRevenueForDashboard
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

const formatToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_MAP = {
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

/** API: { onlineBookings, offlineBookings } or legacy array when filtered */
const getBookingAnalyticsSeries = (apiData, bookingMode) => {
  if (Array.isArray(apiData)) {
    if (bookingMode === "online") return { online: apiData, offline: [] };
    if (bookingMode === "offline") return { online: [], offline: apiData };
    return { online: apiData, offline: [] };
  }
  return {
    online: apiData?.onlineBookings || [],
    offline: apiData?.offlineBookings || [],
  };
};

const buildMonthlyChartData = (apiData, bookingMode) => {
  const { online, offline } = getBookingAnalyticsSeries(apiData, bookingMode);
  const showBothModes = !bookingMode;

  const chartData = MONTHS.map((month) => ({
    month,
    ...(showBothModes
      ? { Online: 0, Admin: 0 }
      : { Booking: 0 }),
    year: new Date().getFullYear(),
  }));

  const applyMonthlySeries = (series, dataKey) => {
    series.forEach((item) => {
      const shortMonth = MONTH_MAP[item?.month];
      const monthIndex = chartData.findIndex((d) => d?.month === shortMonth);
      if (monthIndex === -1) return;

      if (showBothModes) {
        chartData[monthIndex][dataKey] = item?.totalBookings || 0;
      } else {
        chartData[monthIndex].Booking =
          (chartData[monthIndex].Booking || 0) + (item?.totalBookings || 0);
      }
      chartData[monthIndex].year = item?.year || chartData[monthIndex].year;
    });
  };

  if (showBothModes) {
    applyMonthlySeries(online, "Online");
    applyMonthlySeries(offline, "Admin");
  } else if (bookingMode === "online") {
    applyMonthlySeries(online, "Booking");
  } else if (bookingMode === "offline") {
    applyMonthlySeries(offline, "Booking");
  } else {
    applyMonthlySeries(online, "Booking");
    applyMonthlySeries(offline, "Booking");
  }

  return chartData;
};

const buildDailyChartData = (apiData, bookingMode) => {
  const { online, offline } = getBookingAnalyticsSeries(apiData, bookingMode);
  const showBothModes = !bookingMode;
  const dayMap = new Map();

  const ensureDay = (item) => {
    const key = item?.day;
    if (!dayMap.has(key)) {
      dayMap.set(key, {
        day: key,
        ...(showBothModes ? { Online: 0, Admin: 0 } : { Booking: 0 }),
      });
    }
    return dayMap.get(key);
  };

  const applyDailySeries = (series, dataKey) => {
    series.forEach((item) => {
      const row = ensureDay(item);
      if (showBothModes) {
        row[dataKey] = item?.totalBookings || 0;
      } else {
        row.Booking = (row.Booking || 0) + (item?.totalBookings || 0);
      }
    });
  };

  if (showBothModes) {
    applyDailySeries(online, "Online");
    applyDailySeries(offline, "Admin");
  } else if (bookingMode === "online") {
    applyDailySeries(online, "Booking");
  } else {
    applyDailySeries(offline, "Booking");
  }

  return Array.from(dayMap.values()).sort((a, b) => a.day - b.day);
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { selectedOwnerId } = useSuperAdminContext();
  const Owner = getOwnerFromSession();
  const ownerData = Owner?.user || Owner;
  const isSuperAdmin = ownerData?.role === 'super_admin';
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState("all");
  const [category, setCategory] = useState("");
  const [bookingMode, setBookingMode] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(false);

  const filterSelectStyle = {
    fontSize: "13px",
    fontFamily: "Poppins",
    borderRadius: "6px",
    border: "2px solid #dee2e6",
    padding: "10px 12px",
    backgroundColor: "#fff",
    fontWeight: "500",
    boxShadow: "none",
    minWidth: "160px",
  };

  const {
    dashboardLoading,
    dashboardRevenue,
    dashboardDaywiseRevenue,
    dashboardCounts,
    dashboardRecentBookings,
    dashboardCancelledBookings,
    clubsBookingModeRatio,
    clubsBookingModeRatioLoading,
    openMatchOverview,
    openMatchOverviewLoading,
    openMatchOverviewError,
  } = useSelector((state) => state?.dashboard);
  const { categoryList } = useSelector((state) => state.booking);
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
  };

  const bookingModeRatio = dashboardCounts?.bookingModeRatio;
  const mobileRatio = bookingModeRatio?.mobile;
  const webRatio = bookingModeRatio?.system;

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
      theme: "purple",
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
      theme: "green",
    },
    {
      title: "Online Revenue",
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
      variant: "revenue",
      theme: "orange",
    },
    {
      title: "Mobile vs Web Bookings",
      variant: "bookingRatio",
      bigicon: <FaMobileAlt size={26} />,
      iconClass: "stat-icon-blue",
      theme: "blue",
    },
  ];

  const renderStatCardBody = (card) => {
    if (card.variant === "revenue") {
      const adminRev = dashboardCounts?.adminRevenue || 0;
      const userRev = dashboardCounts?.userPanelRevenue || 0;
      const totalRev = dashboardCounts?.totalRevenue || (adminRev + userRev) || 1;
      const adminPct = ((adminRev / totalRev) * 100).toFixed(1);
      const userPct = ((userRev / totalRev) * 100).toFixed(1);

      const isUp = card.percent && card.percent.startsWith("+");
      const hasTrend = card.percent && card.percent !== "+0.0%" && card.percent !== "0.0%";

      return (
        <div className="d-flex flex-column h-100 w-100 justify-content-between" style={{ minHeight: "105px" }}>
          {/* Header Row */}
          <div className="d-flex justify-content-between align-items-center w-100">
            <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: "10.5px", letterSpacing: "0.6px" }}>
              {card.title}
            </span>
            <div className={`stat-icon flex-shrink-0 ${card?.iconClass}`} style={{ width: "32px", height: "32px", borderRadius: "8px", fontSize: "14px" }}>
              {React.cloneElement(card?.bigicon, { size: 16 })}
            </div>
          </div>

          {/* Metric + Trend Row */}
          <div className="d-flex align-items-center gap-2 flex-wrap my-1">
            <span className="fw-bold fs-4" style={{ color: "#111827", letterSpacing: "-0.03em", lineHeight: "1" }}>
              ₹{formatRevenue(userRev)}
              <small> ({userPct + '%'})</small>
            </span>
            {/* {hasTrend && (
              <div className={`trend-badge ${isUp ? 'success' : 'danger'}`} style={{ scale: "0.9", transformOrigin: "left center" }}>
                {isUp ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: '2px', display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M5 1.5L8.5 5M5 1.5L1.5 5M5 1.5V8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: '2px', display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M5 8.5L1.5 5M5 8.5L8.5 5M5 8.5V1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span style={{ verticalAlign: 'middle' }}>{card.percent}</span>
              </div>
            )} */}
          </div>

          {/* Segmented Progress Bar */}
          <div className="segmented-progress my-1" style={{ height: "4px" }}>
            <div
              className="progress-segment progress-segment-primary"
              style={{ width: `${adminPct}%` }}
              title={`Offline: ${adminPct}%`}
            />
            <div
              className="progress-segment progress-segment-secondary"
              style={{ width: `${userPct}%` }}
              title={`Online: ${userPct}%`}
            />
          </div>

          {/* Details Row */}
          <div className="d-flex justify-content-between align-items-center flex-wrap pt-0.5" style={{ fontSize: "11.5px" }}>
            <div className="d-flex align-items-center gap-1">
              <span className="rounded-circle" style={{ width: "5px", height: "5px", backgroundColor: "#6366f1", display: "inline-block" }} />
              <span className="text-dark fw-bold">Offline:</span>
              <span className="fw-bold text-dark">{adminPct}%</span>
              <span className="fw-semibold" style={{ color: "#4b5563", fontSize: "11.5px" }}>({formatRevenue(adminRev)})</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <span className="text-dark fw-bold">Total Revenue:</span>
              <span className="fw-semibold" style={{ color: "#4b5563", fontSize: "11.5px" }}>₹{formatRevenue(dashboardCounts?.totalRevenue)}</span>
            </div>
          </div>
        </div>
      );
    }

    if (card.variant === "bookingRatio") {
      const mobRatioPct = mobileRatio?.percentage ?? 0;
      const webRatioPct = webRatio?.percentage ?? 0;
      const totalRatios = mobRatioPct + webRatioPct || 1;
      const normalizedMob = Math.round((mobRatioPct / totalRatios) * 100);
      const totalBookingsCount = (mobileRatio?.count ?? 0) + (webRatio?.count ?? 0);

      return (
        <div className="d-flex flex-column h-100 w-100 justify-content-between" style={{ minHeight: "105px" }}>
          {/* Header Row */}
          <div className="d-flex justify-content-between align-items-center w-100">
            <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: "10.5px", letterSpacing: "0.6px" }}>
              {card.title}
            </span>
            <div className={`stat-icon flex-shrink-0 ${card?.iconClass}`} style={{ width: "32px", height: "32px", borderRadius: "8px", fontSize: "14px" }}>
              {React.cloneElement(card?.bigicon, { size: 16 })}
            </div>
          </div>

          {/* Body Content: 2 Columns */}
          <div className="d-flex align-items-center gap-2 mt-1 w-100">
            {/* SVG Donut */}
            <div className="donut-container flex-shrink-0" style={{ width: "60px", height: "60px" }}>
              <svg className="donut-svg" width="60" height="60" viewBox="0 0 40 40">
                <circle className="donut-track" cx="20" cy="20" r="16" />
                {totalBookingsCount > 0 && (
                  <>
                    <circle
                      className="donut-segment-secondary"
                      cx="20"
                      cy="20"
                      r="16"
                      strokeDasharray="100.53"
                      strokeDashoffset="0"
                    />
                    <circle
                      className="donut-segment-primary"
                      cx="20"
                      cy="20"
                      r="16"
                      strokeDasharray="100.53"
                      strokeDashoffset={100.53 * (1 - normalizedMob / 100)}
                    />
                  </>
                )}
              </svg>
              <div className="donut-center-text" style={{ gap: "0.5px" }}>
                <span className="donut-value" style={{ fontSize: "11px", fontWeight: "800" }}>{totalBookingsCount}</span>
                <span className="donut-label text-black" style={{ fontSize: "6.5px" }}>Total</span>
              </div>
            </div>

            {/* Right Legend Info */}
            <div className="flex-grow-1 min-w-0 d-flex flex-column gap-1">
              {/* Mobile Booking Source Item */}
              <div
                className="d-flex align-items-center justify-content-between p-1 px-2 rounded"
                style={{
                  background: "linear-gradient(90deg, rgba(99, 102, 241, 0.06) 0%, rgba(99, 102, 241, 0.01) 100%)",
                  borderLeft: "2px solid #6366f1",
                  lineHeight: "1.1"
                }}
              >
                <span className="fw-bold" style={{ fontSize: "9.5px", color: "#4f46e5" }}>
                  Mobile
                </span>
                <div className="text-end">
                  <span className="fw-extrabold text-dark" style={{ fontSize: "11px", fontFamily: "Poppins, sans-serif" }}>
                    {(mobileRatio?.percentage ?? 0).toFixed(0)}%
                  </span>
                  <span className="fw-semibold ms-1" style={{ fontSize: "9px", color: '#4b5563' }}>
                    ({mobileRatio?.count ?? 0})
                  </span>
                </div>
              </div>

              {/* Web Booking Source Item */}
              <div
                className="d-flex align-items-center justify-content-between p-1 px-2 rounded"
                style={{
                  background: "linear-gradient(90deg, rgba(16, 185, 129, 0.06) 0%, rgba(16, 185, 129, 0.01) 100%)",
                  borderLeft: "2px solid #10b981",
                  lineHeight: "1.1"
                }}
              >
                <span className="fw-bold" style={{ fontSize: "9.5px", color: "#059669" }}>
                  Web
                </span>
                <div className="text-end">
                  <span className="fw-extrabold text-dark" style={{ fontSize: "11px", fontFamily: "Poppins, sans-serif" }}>
                    {(webRatio?.percentage ?? 0).toFixed(0)}%
                  </span>
                  <span className="fw-semibold ms-1" style={{ fontSize: "9px", color: '#4b5563' }}>
                    ({webRatio?.count ?? 0})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const showCountSubtext = card.title === "Completed Booking";
    const isUp = card.percent && card.percent.startsWith("+");
    const hasTrend = card.percent && card.percent !== "+0.0%" && card.percent !== "0.0%";

    return (
      <div className="d-flex flex-column h-100 w-100 justify-content-between" style={{ minHeight: "105px" }}>
        {/* Top Header Row */}
        <div className="d-flex justify-content-between align-items-center w-100">
          <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: "10.5px", letterSpacing: "0.6px" }}>
            {card.title}
          </span>
          <div className={`stat-icon flex-shrink-0 ${card?.iconClass}`} style={{ width: "32px", height: "32px", borderRadius: "8px", fontSize: "14px" }}>
            {React.cloneElement(card?.bigicon, { size: 16 })}
          </div>
        </div>

        {/* Middle Metric Row */}
        <div className="my-1">
          <div className="fw-bold fs-5" style={{ color: "#111827", letterSpacing: "-0.03em", lineHeight: "1.1" }}>
            {card.value}
          </div>
        </div>

        {/* Bottom Trend/Count Row */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {hasTrend && (
            <div className={`trend-badge ${isUp ? 'success' : 'danger'}`} style={{ scale: "0.9", transformOrigin: "left center" }}>
              {isUp ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: '2px', display: 'inline-block', verticalAlign: 'middle' }}>
                  <path d="M5 1.5L8.5 5M5 1.5L1.5 5M5 1.5V8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: '2px', display: 'inline-block', verticalAlign: 'middle' }}>
                  <path d="M5 8.5L1.5 5M5 8.5L8.5 5M5 8.5V1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span style={{ verticalAlign: 'middle' }}>{card.percent}</span>
            </div>
          )}
          {showCountSubtext ? (
            <span style={{ fontSize: "11px", color: "#4b5563", fontWeight: "600" }}>
              ({dashboardCounts?.totalBookingsCount || 0} bookings)
            </span>
          ) : (
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>vs last month</span>
          )}
        </div>
      </div>
    );
  };

  const [loadingById, setLoadingById] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showBookingCancel, setShowBookingCancel] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [chartView, setChartView] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const dateFilterKey =
    startDate && endDate
      ? `${formatToYYYYMMDD(startDate)}|${formatToYYYYMMDD(endDate)}`
      : "";

  const buildAnalyticsParams = () => {
    const params = selectedOwnerId ? { ownerId: selectedOwnerId } : {};
    if (selectedClubId !== "all") {
      params.clubId = selectedClubId;
    }
    if (category) {
      params.category = category;
    }
    if (dateFilterKey) {
      params.startDate = formatToYYYYMMDD(startDate);
      params.endDate = formatToYYYYMMDD(endDate);
    }
    if (bookingMode) {
      params.bookingMode = bookingMode;
    }
    return params;
  };

  // Fetch clubs for filter
  useEffect(() => {
    dispatch(getCategoryList());
  }, [dispatch]);

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
    const params = buildAnalyticsParams();
    dispatch(getCountDataForDashboard(params));
    // dispatch(getCancelledBookingsForDashboard(params));
    // dispatch(getRecentBookingsForDashboard(params));
    dispatch(getClubsBookingModeRatio(params));
    dispatch(getOpenMatchOverview(params));
  }, [
    dispatch,
    selectedOwnerId,
    selectedClubId,
    category,
    bookingMode,
    dateFilterKey,
  ]);

  // Booking Analytics – monthly chart (getRevenueForDashboard / GET_REVENUE_DASHBOARD)
  useEffect(() => {
    if (chartView !== "monthly") return;
    dispatch(getRevenueForDashboard(buildAnalyticsParams()));
  }, [
    dispatch,
    chartView,
    selectedOwnerId,
    selectedClubId,
    category,
    bookingMode,
    dateFilterKey,
  ]);

  // Booking Analytics – daily chart (getDaywiseRevenueForDashboard / GET_DAYWISE_DASHBOARD)
  useEffect(() => {
    if (chartView !== "daily") return;
    const params = buildAnalyticsParams();
    params.month = selectedMonth + 1;
    params.year = selectedYear;
    dispatch(getDaywiseRevenueForDashboard(params));
  }, [
    dispatch,
    chartView,
    selectedMonth,
    selectedYear,
    selectedOwnerId,
    selectedClubId,
    category,
    bookingMode,
    dateFilterKey,
  ]);

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

  const months = MONTHS;

  const showBothBookingModes = !bookingMode;

  let chartData = [];

  if (chartView === "monthly") {
    chartData = buildMonthlyChartData(dashboardRevenue, bookingMode);
  } else {
    chartData = buildDailyChartData(dashboardDaywiseRevenue, bookingMode);
  }

  const { pathname } = useLocation();

  const renderBookingAreaChart = (data) => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBookingOnline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorBookingAdmin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorBookingSingle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey={chartView === "monthly" ? "month" : "day"}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          interval={chartView === "daily" ? "preserveStartEnd" : 0}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
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
        {showBothBookingModes && (
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            formatter={(value) =>
              value === "Online" ? "Online Bookings" : "Offline Bookings"
            }
          />
        )}
        {showBothBookingModes ? (
          <>
            <Area
              type="monotone"
              dataKey="Online"
              name="Online"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorBookingOnline)"
              dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="Admin"
              name="Offline"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorBookingAdmin)"
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </>
        ) : (
          <Area
            type="monotone"
            dataKey="Booking"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorBookingSingle)"
            dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );

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
      className="p-2 pt-md-0 p-md-4 px-md-0"
      style={{ background: "#f9fafb", minHeight: "100vh" }}
    >
      {dashboardLoading ? (
        <DataLoading height="80vh" />
      ) : (
        <>
          <Row className="mb-3">
            <Col xs={12} className="d-flex justify-content-end">
              <div className="d-flex align-items-center gap-2 flex-nowrap">
                <Form.Select
                  value={selectedClubId}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                  disabled={loadingClubs || clubs.length === 0}
                  style={filterSelectStyle}
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
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={filterSelectStyle}
                >
                  <option value="">All Categories</option>
                  {categoryList?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Select
                  value={bookingMode}
                  onChange={(e) => setBookingMode(e.target.value)}
                  style={filterSelectStyle}
                >
                  <option value="">All Booking Modes</option>
                  <option value="offline">Offline Bookings</option>
                  <option value="online">Online Bookings</option>
                </Form.Select>
                {!showDatePicker && !startDate && !endDate ? (
                  <div
                    className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                    style={{
                      fontSize: "13px",
                      fontFamily: "Poppins",
                      borderRadius: "6px",
                      border: "2px solid #dee2e6",
                      padding: "10px 12px",
                      backgroundColor: "#fff",
                      fontWeight: "500",
                      boxShadow: "none",
                      width: "40px",
                      height: "42px",
                      cursor: "pointer",
                    }}
                    onClick={() => setShowDatePicker(true)}
                  >
                    <MdOutlineDateRange size={16} className="text-muted" />
                  </div>
                ) : (
                  <div
                    className="d-flex align-items-center rounded flex-shrink-0"
                    style={{
                      backgroundColor: "#FAFBFF",
                      maxWidth: "280px",
                      height: "42px",
                      border: "2px solid #dee2e6",
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
            </Col>
          </Row>
          <Row className="mb-4 g-3">
            {summaryCards?.map((card, index) => (
              <Col key={index} xs={12} sm={6} lg={3} className="fade-in-up">
                <Card className={`stat-card stat-card-border ${card.theme || 'purple'} border-0 h-100`}>
                  <Card.Body className="p-0 d-flex flex-column h-100 justify-content-between">
                    {renderStatCardBody(card)}
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
                            border: "1px solid #dee2e6", boxShadow: "none"
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

                  {renderBookingAreaChart(chartData)}
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} lg={5} className="fade-in-up">
              <Card className="border-0 h-100" style={{ maxHeight: "450px" }}>
                <Card.Body className="py-2">
                  <div
                    className="pb-2"
                    style={{
                      height: "45vh",
                      overflowY: "auto",
                    }}
                  >
                    {clubsBookingModeRatioLoading ? (
                      <div className="d-flex justify-content-center align-items-center h-100" style={{ minHeight: "150px" }}>
                        <ButtonLoading color="blue" size={8} />
                      </div>
                    ) : clubsBookingModeRatio && clubsBookingModeRatio.length > 0 ? (
                      <>
                        <Table
                          borderless
                          size="sm"
                          rounded
                          className="dashboard-table d-none d-md-table"
                          style={{ borderCollapse: "separate", borderSpacing: "0" }}
                        >
                          <thead>
                            <tr className="text-center">
                              <th style={{ borderTopLeftRadius: '12px' }}>#</th>
                              <th>Club Name</th>
                              <th>Online</th>
                              <th style={{ borderTopRightRadius: '12px' }}>Offline</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clubsBookingModeRatio.map((item, index) => (
                              <tr
                                key={item?._id}
                                className="table-data border-bottom text-center"
                              >
                                <td
                                  className="text-truncate   fw-semibold"
                                  style={{ maxWidth: "150px" }}
                                >
                                  {index + 1 || "N/A"}
                                </td>
                                <td
                                  className="text-truncate  fw-semibold"
                                  style={{ maxWidth: "150px" }}
                                >
                                  {item?.clubName || "N/A"}
                                </td>
                                <td className="">
                                  <div className="d-flex flex-column align-items-center">
                                    <span className="fw-semibold text-primary">
                                      {item?.onlineBookings ?? 0}
                                    </span>
                                    <span className="text-muted small" style={{ fontSize: "10px" }}>
                                      {item?.onlineRatio !== undefined ? `${Number(item.onlineRatio).toFixed(1)}%` : "0.0%"}
                                    </span>
                                  </div>
                                </td>
                                <td className="">
                                  <div className="d-flex flex-column align-items-center">
                                    <span className="fw-semibold text-success">
                                      {item?.offlineBookings ?? 0}
                                    </span>
                                    <span className="text-muted small" style={{ fontSize: "10px" }}>
                                      {item?.offlineRatio !== undefined ? `${Number(item.offlineRatio).toFixed(1)}%` : "0.0%"}
                                    </span>
                                  </div>
                                </td>
                                {/* <td className=" fw-bold" style={{ color: "#374151" }}>
                                  {item?.totalBookings ?? 0}
                                </td> */}
                              </tr>
                            ))}
                          </tbody>
                        </Table>

                        <div className="mobile-card-table d-block d-md-none">
                          {clubsBookingModeRatio.map((item) => (
                            <div key={item?._id} className="card mb-2">
                              <div className="card-body">
                                <div className="mobile-card-item">
                                  <span className="mobile-card-label">
                                    Club Name:
                                  </span>
                                  <span className="mobile-card-value fw-bold">
                                    {item?.clubName || "N/A"}
                                  </span>
                                </div>
                                <div className="mobile-card-item">
                                  <span className="mobile-card-label">
                                    Online Bookings:
                                  </span>
                                  <span className="mobile-card-value text-primary fw-semibold">
                                    {item?.onlineBookings ?? 0} ({item?.onlineRatio !== undefined ? `${Number(item.onlineRatio).toFixed(1)}%` : "0.0%"})
                                  </span>
                                </div>
                                <div className="mobile-card-item">
                                  <span className="mobile-card-label">
                                    Offline Bookings:
                                  </span>
                                  <span className="mobile-card-value text-success fw-semibold">
                                    {item?.offlineBookings ?? 0} ({item?.offlineRatio !== undefined ? `${Number(item.offlineRatio).toFixed(1)}%` : "0.0%"})
                                  </span>
                                </div>
                                <div className="mobile-card-item">
                                  <span className="mobile-card-label">
                                    Total Bookings:
                                  </span>
                                  <span className="mobile-card-value fw-bold">
                                    {item?.totalBookings ?? 0}
                                  </span>
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
                        <div className="empty-state-title">No ratios found!</div>
                        <div className="empty-state-text">Check back later.</div>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card className="border-0 fade-in-up" style={{ maxHeight: "450px" }}>
                <Card.Body className="pb-3" style={{ height: "45vh", display: "flex", flexDirection: "column" }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold" style={{ color: "#1f2937" }}>
                      Open Matches Overview
                    </h5>
                    {/* <Link
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
                    </Link> */}
                  </div>

                  <div
                    className="pb-2 custom-scroll-container"
                    style={{
                      flex: 1,
                      overflowY: "auto",
                    }}
                  >
                    {openMatchOverviewLoading ? (
                      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "250px" }}>
                        <ButtonLoading color="blue" size={8} />
                      </div>
                    ) : openMatchOverviewError ? (
                      <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: "250px" }}>
                        <div className="text-danger mb-2">Failed to load open matches.</div>
                        <button className="btn btn-sm btn-primary" onClick={() => {
                          const params = selectedOwnerId ? { ownerId: selectedOwnerId } : {};
                          if (selectedClubId !== "all") {
                            params.clubId = selectedClubId;
                          }
                          dispatch(getOpenMatchOverview(params));
                        }}>Retry</button>
                      </div>
                    ) : !openMatchOverview || !openMatchOverview.openMatches || openMatchOverview.openMatches.length === 0 ? (
                      <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: "250px" }}>
                        <div className="mb-3 p-3 rounded-circle" style={{ backgroundColor: "#f3f4f6", color: "#9ca3af" }}>
                          <MdOutlineGroup size={40} />
                        </div>
                        <h6 className="fw-bold mb-1" style={{ color: "#4b5563" }}>No Open Matches Available</h6>
                        <p className="text-muted small mb-0">Matches created by players will show up here.</p>
                      </div>
                    ) : (
                      <>
                        <div className="d-none d-md-block">
                          <Table
                            borderless
                            size="sm"
                            className="custom-table"
                            style={{ borderCollapse: "separate", borderSpacing: "0", width: "100%" }}
                          >
                            <thead>
                              <tr className="text-center">
                                <th style={{ position: "sticky", top: 0, zIndex: 10, background: "rgb(31, 65, 187)", color: "white" }}>#</th>
                                <th className="text-start" style={{ position: "sticky", top: 0, zIndex: 10, background: "rgb(31, 65, 187)", color: "white" }}>Host / Creator</th>
                                <th className="text-start" style={{ position: "sticky", top: 0, zIndex: 10, background: "rgb(31, 65, 187)", color: "white" }}>Club & Court</th>
                                <th className="text-start" style={{ position: "sticky", top: 0, zIndex: 10, background: "rgb(31, 65, 187)", color: "white" }}>Date & Time</th>
                                <th style={{ position: "sticky", top: 0, zIndex: 10, background: "rgb(31, 65, 187)", color: "white" }}>Skill Level</th>
                                <th style={{ position: "sticky", top: 0, zIndex: 10, background: "rgb(31, 65, 187)", color: "white" }}>Players Joined</th>
                                <th style={{ position: "sticky", top: 0, zIndex: 10, background: "rgb(31, 65, 187)", color: "white" }}>Fee</th>
                                <th style={{ position: "sticky", top: 0, zIndex: 10, background: "rgb(31, 65, 187)", color: "white" }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(openMatchOverview.openMatches || []).map((item, index) => {
                                const joinedCount = item?.totalPlayers ?? (Number(item?.teamA?.length || 0) + Number(item?.teamB?.length || 0));
                                const maxCount = item?.totalPlayersCount ?? item?.maxPlayers ?? 4;
                                const progressPct = Math.min(100, (joinedCount / maxCount) * 100);
                                const skill = item?.skillLevel || "All Skills";
                                const priceText = item?.teamA?.[0]?.amountPaid !== undefined ? `₹${item.teamA[0].amountPaid}` : (item?.totalMatchPayment !== undefined ? `₹${item.totalMatchPayment}` : "N/A");
                                const hostName = item?.createdBy?.name || item?.creatorId?.name || item?.userId?.name || "N/A";
                                const hostPhone = item?.createdBy?.phoneNumber ? `${item?.createdBy?.countryCode || ""}${item?.createdBy?.phoneNumber}` : "";
                                const clubName = item?.clubId?.clubName || "N/A";
                                const courtName = item?.slot?.[0]?.courtName || "";
                                const bookingDate = item?.matchDate || item?.bookingDate;
                                const timeText = item?.matchTime?.[0] || (item?.startTime && item?.endTime ? `${item.startTime} - ${item.endTime}` : "N/A");
                                const status = item?.openMatchStatus || "open";

                                return (
                                  <tr key={item?._id || index} className="table-data border-bottom text-center">
                                    <td className="fw-semibold">{index + 1}</td>
                                    <td className="text-start">
                                      <div>
                                        <div className="fw-bold" style={{ fontSize: "13px", color: "#111827" }}>{hostName}</div>
                                        {hostPhone && <div className="text-muted" style={{ fontSize: "11px" }}>{hostPhone}</div>}
                                      </div>
                                    </td>
                                    <td className="text-start">
                                      <div>
                                        <div className="fw-semibold" style={{ fontSize: "13px" }}>{clubName}</div>
                                        {courtName && <div className="text-muted" style={{ fontSize: "11px" }}>{courtName}</div>}
                                      </div>
                                    </td>
                                    <td className="text-start">
                                      <div>
                                        <div className="fw-semibold" style={{ fontSize: "12px" }}>{bookingDate ? formatDate(bookingDate) : "N/A"}</div>
                                        <div className="text-muted" style={{ fontSize: "11px" }}>{timeText}</div>
                                      </div>
                                    </td>
                                    <td>
                                      <span className="badge bg-light text-dark border fw-medium" style={{ fontSize: "11px", padding: "4px 8px" }}>
                                        {skill}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minWidth: "120px" }}>
                                        <div className="d-flex justify-content-between w-100 px-2 mb-1" style={{ fontSize: "10.5px" }}>
                                          <span className="fw-bold text-dark">{joinedCount}/{maxCount}</span>
                                          <span className="text-muted">{progressPct.toFixed(0)}%</span>
                                        </div>
                                        <div className="progress w-100" style={{ height: "6px", backgroundColor: "#e5e7eb", borderRadius: "3px" }}>
                                          <div
                                            className="progress-bar rounded-pill"
                                            role="progressbar"
                                            style={{
                                              width: `${progressPct}%`,
                                              backgroundColor: progressPct >= 100 ? "#10b981" : "#6366f1",
                                              transition: "width 0.4s ease"
                                            }}
                                            aria-valuenow={progressPct}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                          />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="fw-bold text-success" style={{ fontSize: "13px" }}>
                                      {priceText}
                                    </td>
                                    <td>
                                      <span
                                        className="badge text-uppercase"
                                        style={{
                                          fontSize: "10px",
                                          padding: "4px 8px",
                                          borderRadius: "4px",
                                          fontWeight: "600",
                                          letterSpacing: "0.5px",
                                          background: status.toLowerCase() === "open" ? "rgba(99, 102, 241, 0.12)" : status.toLowerCase() === "full" ? "rgba(16, 185, 129, 0.12)" : "rgba(107, 114, 128, 0.12)",
                                          color: status.toLowerCase() === "open" ? "#4f46e5" : status.toLowerCase() === "full" ? "#059669" : "#6b7280"
                                        }}
                                      >
                                        {status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        </div>

                        <div className="mobile-card-table d-block d-md-none">
                          {(openMatchOverview.openMatches || []).map((item, index) => {
                            const joinedCount = item?.totalPlayers ?? (Number(item?.teamA?.length || 0) + Number(item?.teamB?.length || 0));
                            const maxCount = item?.totalPlayersCount ?? item?.maxPlayers ?? 4;
                            const progressPct = Math.min(100, (joinedCount / maxCount) * 100);
                            const skill = item?.skillLevel || "All Skills";
                            const priceText = item?.teamA?.[0]?.amountPaid !== undefined ? `₹${item.teamA[0].amountPaid}` : (item?.totalMatchPayment !== undefined ? `₹${item.totalMatchPayment}` : "N/A");
                            const hostName = item?.createdBy?.name || item?.creatorId?.name || item?.userId?.name || "N/A";
                            const hostPhone = item?.createdBy?.phoneNumber ? `${item?.createdBy?.countryCode || ""}${item?.createdBy?.phoneNumber}` : "";
                            const clubName = item?.clubId?.clubName || "N/A";
                            const courtName = item?.slot?.[0]?.courtName || "";
                            const bookingDate = item?.matchDate || item?.bookingDate;
                            const timeText = item?.matchTime?.[0] || (item?.startTime && item?.endTime ? `${item.startTime} - ${item.endTime}` : "N/A");
                            const status = item?.openMatchStatus || "open";

                            return (
                              <div key={item?._id || index} className="card mb-2 border">
                                <div className="card-body p-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="fw-bold text-dark" style={{ fontSize: "14px" }}>{hostName}</span>
                                    <span
                                      className="badge text-uppercase"
                                      style={{
                                        fontSize: "9px",
                                        padding: "3px 6px",
                                        borderRadius: "4px",
                                        fontWeight: "600",
                                        background: status.toLowerCase() === "open" ? "rgba(99, 102, 241, 0.12)" : status.toLowerCase() === "full" ? "rgba(16, 185, 129, 0.12)" : "rgba(107, 114, 128, 0.12)",
                                        color: status.toLowerCase() === "open" ? "#4f46e5" : status.toLowerCase() === "full" ? "#059669" : "#6b7280"
                                      }}
                                    >
                                      {status}
                                    </span>
                                  </div>
                                  {hostPhone && <div className="text-muted small mb-2">{hostPhone}</div>}
                                  <div className="mobile-card-item">
                                    <span className="mobile-card-label">Club & Court:</span>
                                    <span className="mobile-card-value text-end">{clubName} {courtName ? `• ${courtName}` : ""}</span>
                                  </div>
                                  <div className="mobile-card-item">
                                    <span className="mobile-card-label">Date & Time:</span>
                                    <span className="mobile-card-value text-end">{bookingDate ? formatDate(bookingDate) : "N/A"} • {timeText}</span>
                                  </div>
                                  <div className="mobile-card-item">
                                    <span className="mobile-card-label">Skill Level:</span>
                                    <span className="mobile-card-value text-end">{skill}</span>
                                  </div>
                                  <div className="mobile-card-item">
                                    <span className="mobile-card-label">Fee / Player:</span>
                                    <span className="mobile-card-value text-end text-success fw-bold">{priceText}</span>
                                  </div>
                                  <div className="mt-2 pt-2 border-top">
                                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: "11px" }}>
                                      <span className="fw-bold text-dark">Players Joined:</span>
                                      <span className="text-muted fw-bold">{joinedCount}/{maxCount} ({progressPct.toFixed(0)}%)</span>
                                    </div>
                                    <div className="progress" style={{ height: "6px", backgroundColor: "#e5e7eb", borderRadius: "3px" }}>
                                      <div
                                        className="progress-bar rounded-pill"
                                        role="progressbar"
                                        style={{
                                          width: `${progressPct}%`,
                                          backgroundColor: progressPct >= 100 ? "#10b981" : "#6366f1"
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
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
