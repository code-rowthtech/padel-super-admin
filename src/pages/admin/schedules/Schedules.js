import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Container, Form, ListGroup, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdOutlineDateRange } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";
import { FaSun, FaTimes, FaFilter, FaBuilding, FaCalendarAlt } from "react-icons/fa";
import { BsSunFill } from "react-icons/bs";
import { HiMoon } from "react-icons/hi";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { getOwnerFromSession, ownerApi } from "../../../helpers/api/apiCore";
import { useSuperAdminContext } from "../../../contexts/SuperAdminContext";
import { SUPER_ADMIN_GET_ALL_CLUBS } from "../../../helpers/api/apiEndpoint";
import { useDispatch, useSelector } from "react-redux";
import { getCategoryList, getTodaySchedules } from "../../../redux/thunks";

const ROW_HEIGHT = 45;

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    const m2 = timeStr.trim().match(/^(\d{1,2})\s*(AM|PM)$/i);
    if (!m2) return 0;
    let h = parseInt(m2[1]);
    const p = m2[2].toUpperCase();
    if (p === "PM" && h !== 12) h += 12;
    if (p === "AM" && h === 12) h = 0;
    return h * 60;
  }
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const p = match[3].toUpperCase();
  if (p === "PM" && h !== 12) h += 12;
  if (p === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

const formatMinutesToLabel = (totalMins) => {
  let h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const period = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
};

const getTimeIcon = (timeRange) => {
  if (!timeRange) return null;
  const startTime = timeRange.split(" - ")[0];
  const parts = startTime ? startTime.trim().split(" ") : [];
  if (parts.length < 2) return null;
  let hours = parseInt(parts[0].split(":")[0]);
  const modifier = parts[1].toUpperCase();
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  if (hours >= 6 && hours < 12) return FaSun;
  if (hours >= 12 && hours < 17) return BsSunFill;
  if (hours >= 17) return HiMoon;
  return null;
};

const truncateName = (name, length) => {
  var l = length || 12;
  if (!name) return "N/A";
  return name.length > l ? name.substring(0, l) + "..." : name;
};

const formatDuration = (d) => {
  return (Array.isArray(d) ? d.join("/") : d) + " min";
};

const Schedules = () => {
  const dispatch = useDispatch();
  const { categoryList } = useSelector((state) => state.booking);
  const { scheduleResponse, schedulesLoading } = useSelector((state) => state.schedules);

  const scheduleData = (scheduleResponse && scheduleResponse.data) ? scheduleResponse.data : [];
  const summary = (scheduleResponse && scheduleResponse.summary) ? scheduleResponse.summary : {};

  const { selectedOwnerId } = useSuperAdminContext();
  const Owner = useMemo(function() { return getOwnerFromSession(); }, []);
  const ownerData = Owner ? (Owner.user || Owner) : {};
  const isSuperAdmin = ownerData.role === "super_admin";

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedClubId, setSelectedClubId] = useState("");
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);

  useEffect(function() {
    if (categoryList && categoryList.length > 0 && !selectedCategory) {
      var padel = categoryList.find(function(c) { return c.name && c.name.toLowerCase() === "padel"; });
      if (padel) setSelectedCategory(padel._id);
    }
  }, [categoryList]);

  const canSelectClubs = useMemo(function() {
    return !isSuperAdmin || selectedOwnerId !== undefined;
  }, [isSuperAdmin, selectedOwnerId]);

  const selectedClub = clubs.find(function(c) { return c._id === selectedClubId; });

  const ownerId = useMemo(function() {
    if (!isSuperAdmin) return getOwnerFromSession() ? getOwnerFromSession()._id : undefined;
    if (selectedClub) {
      return (selectedClub.ownerId && selectedClub.ownerId._id)
        || (selectedClub.owner && selectedClub.owner._id)
        || null;
    }
    return selectedOwnerId || null;
  }, [isSuperAdmin, selectedClub, selectedOwnerId]);

  var fmtDate = function(d) {
    if (!d) return undefined;
    var y = d.getFullYear();
    var mo = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + mo + "-" + day;
  };

  var formatDisplayDate = function() {
    if (!selectedDate) return "";
    return selectedDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  useEffect(function() {
    var fetchClubs = async function() {
      if (!isSuperAdmin) { setClubs([]); return; }
      try {
        setLoadingClubs(true);
        var url = selectedOwnerId
          ? (SUPER_ADMIN_GET_ALL_CLUBS + "?ownerId=" + selectedOwnerId)
          : SUPER_ADMIN_GET_ALL_CLUBS;
        var res = await ownerApi.get(url);
        var clubsData = (res && res.data && res.data.data) ? res.data.data : [];
        setClubs(clubsData);
        if (clubsData.length > 0 && !selectedClubId) setSelectedClubId(clubsData[0]._id);
      } catch (e) {
        setClubs([]);
      } finally {
        setLoadingClubs(false);
      }
    };
    fetchClubs();
  }, [isSuperAdmin, selectedOwnerId]);

  useEffect(function() {
    var params = {};
    if (ownerId) params.ownerId = ownerId;
    if (selectedClubId) params.clubId = selectedClubId;
    if (selectedCategory) params.categoryId = selectedCategory;
    if (selectedDate) params.date = fmtDate(selectedDate);
    dispatch(getTodaySchedules(params));
  }, [dispatch, ownerId, selectedClubId, selectedCategory, selectedDate]);

  useEffect(function() { dispatch(getCategoryList()); }, [dispatch]);

  var courtColumns = useMemo(function() {
    var set = new Set();
    scheduleData.forEach(function(slot) {
      if (slot.courts) slot.courts.forEach(function(c) { set.add(c.courtName); });
    });
    return Array.from(set).sort();
  }, [scheduleData]);

  var courtDurationMap = useMemo(function() {
    var map = {};
    scheduleData.forEach(function(slot) {
      if (slot.courts) slot.courts.forEach(function(c) {
        if (c.courtName && map[c.courtName] == null) map[c.courtName] = c.duration || 60;
      });
    });
    return map;
  }, [scheduleData]);

  var gridCalc = useMemo(function() {
    if (!scheduleData.length) return { timeAxisMinutes: [], tickTopOffset: {}, gridTotalHeight: 0, minsToTop: function() { return 0; } };
    var minMins = Infinity, maxMins = 0;
    scheduleData.forEach(function(slot) {
      var parts = (slot.timeRange || "").split(" - ");
      var s = parseTimeToMinutes(parts[0]);
      var e = parseTimeToMinutes(parts[1]) || s + 60;
      if (s < minMins) minMins = s;
      if (e > maxMins) maxMins = e;
    });
    if (minMins === Infinity) return { timeAxisMinutes: [], tickTopOffset: {}, gridTotalHeight: 0, minsToTop: function() { return 0; } };
    var startHour = Math.floor(minMins / 60) * 60;
    var endHour = Math.ceil(maxMins / 60) * 60;
    var ticks = [];
    for (var t = startHour; t <= endHour; t += 60) ticks.push(t);
    var offsets = {};
    ticks.forEach(function(tick, i) { offsets[tick] = i * ROW_HEIGHT; });
    var toTop = function(mins) { return ((mins - startHour) / 60) * ROW_HEIGHT; };
    return { timeAxisMinutes: ticks, tickTopOffset: offsets, gridTotalHeight: ticks.length * ROW_HEIGHT, minsToTop: toTop };
  }, [scheduleData]);

  var timeAxisMinutes = gridCalc.timeAxisMinutes;
  var tickTopOffset = gridCalc.tickTopOffset;
  var gridTotalHeight = gridCalc.gridTotalHeight;
  var minsToTop = gridCalc.minsToTop;

  var courtBookingMap = useMemo(function() {
    var map = {};
    courtColumns.forEach(function(c) { map[c] = []; });
    scheduleData.forEach(function(slot) {
      var startMins = parseTimeToMinutes((slot.timeRange || "").split(" - ")[0]);
      var top = minsToTop(startMins);
      if (slot.courts) slot.courts.forEach(function(booking) {
        if (map[booking.courtName] !== undefined) {
          var duration = booking.duration || 60;
          var height = (duration / 60) * ROW_HEIGHT;
          map[booking.courtName].push(Object.assign({}, booking, { top: top, height: height, timeRange: slot.timeRange }));
        }
      });
    });
    return map;
  }, [scheduleData, courtColumns, minsToTop]);

  var hasAnyBooking = scheduleData.some(function(s) { return s.courts && s.courts.length > 0; });

  return (
    <Container fluid className="px-0 mt-md-0 mt-2">
      <Row className="g-1">

        {/* Left: Clubs sidebar */}
        <Col lg={2} md={3} className="pe-1">
          <div className="bg-white rounded-3 shadow-sm p-2 h-100">
            <div className="d-flex align-items-center mb-2 pb-2 border-bottom">
              <FaFilter className="text-primary me-1" size={12} />
              <h6 className="mb-0 fw-bold" style={{ fontSize: "13px" }}>Clubs</h6>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "11px", color: "#6c757d", fontWeight: "600" }}>CLUBS</span>
              <Badge bg="primary" style={{ fontSize: "10px" }}>{clubs.length}</Badge>
            </div>
            <ListGroup variant="flush" className="mb-2">
              <ListGroup.Item
                action
                active={selectedClubId === ""}
                onClick={function() { if (canSelectClubs) setSelectedClubId(""); }}
                className="px-2 py-2"
                style={{
                  cursor: canSelectClubs ? "pointer" : "not-allowed",
                  opacity: canSelectClubs ? 1 : 0.5,
                  borderLeft: selectedClubId === "" ? "3px solid #4361ee" : "3px solid transparent",
                  fontSize: "12px", fontWeight: "600", transition: "all 0.2s",
                }}
              >
                All Clubs
              </ListGroup.Item>
            </ListGroup>
            <div style={{ maxHeight: "calc(100vh - 350px)", overflowY: "auto" }}>
              <ListGroup variant="flush">
                {loadingClubs ? (
                  <DataLoading height="100px" />
                ) : (
                  clubs.map(function(club, i) {
                    var bookingCount = (summary.clubWiseBookings && summary.clubWiseBookings[club.clubName]) || 0;
                    return (
                      <ListGroup.Item
                        key={club._id || i}
                        action
                        active={selectedClubId === club._id}
                        onClick={function() {
                          if (canSelectClubs) setSelectedClubId(selectedClubId === club._id ? "" : club._id);
                        }}
                        className="px-2 py-2"
                        style={{
                          cursor: canSelectClubs ? "pointer" : "not-allowed",
                          opacity: canSelectClubs ? 1 : 0.5,
                          borderLeft: selectedClubId === club._id ? "3px solid #4361ee" : "3px solid transparent",
                          fontSize: "12px", transition: "all 0.2s",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ width: 28, height: 28, backgroundColor: selectedClubId === club._id ? "#fff" : "#e7f3ff", color: "#4361ee", flexShrink: 0 }}
                          >
                            <FaBuilding size={12} />
                          </div>
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="fw-semibold" style={{ fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{club.clubName}</div>
                          </div>
                          {/* <Badge
                            bg={bookingCount > 0 ? (selectedClubId === club._id ? "light" : "primary") : "secondary"}
                            text={bookingCount > 0 && selectedClubId === club._id ? "primary" : undefined}
                            style={{ fontSize: "9px", flexShrink: 0 }}
                          >
                            {bookingCount}
                          </Badge> */}
                        </div>
                      </ListGroup.Item>
                    );
                  })
                )}
              </ListGroup>
            </div>
          </div>
        </Col>

        {/* Right: Main content */}
        <Col lg={10} md={9} className="ps-0">
          <div className="bg-white rounded-3 shadow-sm" style={{ border: "1px solid #e9ecef", display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>

            {/* Header: single line — title + summary + filters */}
            <div className="px-3 pt-2 pb-2 border-bottom" style={{ flexShrink: 0 }}>
              <div className="d-flex align-items-center gap-3 justify-content-between" style={{ flexWrap: "nowrap" }}>

                {/* Left: title + quick summary */}
                <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                  <div style={{ whiteSpace: "nowrap" }}>
                    <h5 className="mb-0 fw-bold" style={{ fontSize: "15px", color: "#1a1a1a" }}>
                      <FaCalendarAlt className="me-2 text-primary" size={14} />
                      {selectedClub ? (selectedClub.clubName + " \u2014 ") : ""}Schedules
                    </h5>
                    <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                      {summary.totalBookings || 0} bookings &middot; {summary.totalBookingHours || 0} hrs
                    </p>
                  </div>
                  <div className="d-flex align-items-center gap-1 px-2 py-1 rounded text-white" style={{ background: "linear-gradient(180deg,#0034E4 0%,#001B76 100%)", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
                    <MdOutlineDateRange size={13} />
                    <span>{summary.totalBookings || 0} Bookings</span>
                  </div>
                  <div className="d-flex align-items-center gap-1 px-2 py-1 rounded text-white" style={{ backgroundColor: "#22c55e", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
                    <IoTimeOutline size={13} />
                    <span>{summary.totalBookingHours || 0} hrs</span>
                  </div>
                </div>

                {/* Right: filters */}
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Date picker */}
                  {!showDatePicker && !selectedDate ? (
                    <button
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                      onClick={function() { setShowDatePicker(true); }}
                      style={{ borderRadius: "6px", padding: "0 10px", fontSize: "12px", height: "34px", whiteSpace: "nowrap", border: "1px solid #dee2e6" }}
                    >
                      <MdOutlineDateRange size={14} />
                      <span>Select Date</span>
                    </button>
                  ) : (
                    <div
                      className="d-flex align-items-center rounded"
                      style={{ backgroundColor: "#FAFBFF", height: "34px", border: "1px solid #dee2e6", padding: "0 8px", gap: "4px" }}
                    >
                      <MdOutlineDateRange size={13} className="text-muted" />
                      <DatePicker
                        selected={selectedDate}
                        onChange={function(date) { setSelectedDate(date); setShowDatePicker(false); }}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="DD/MM/YYYY"
                        className="form-control border-0 bg-transparent shadow-none p-0"
                        style={{ fontSize: "12px", width: "110px", height: "auto" }}
                        open={showDatePicker}
                        onClickOutside={function() { setShowDatePicker(false); }}
                      />
                      {selectedDate && (
                        <div
                          onClick={function() { setSelectedDate(null); setShowDatePicker(false); }}
                          style={{ cursor: "pointer" }}
                        >
                          <FaTimes size={11} className="text-danger" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category */}
                  <Form.Select
                    value={selectedCategory}
                    onChange={function(e) { setSelectedCategory(e.target.value); }}
                    style={{ fontSize: "12px", borderRadius: "6px", border: "1px solid #dee2e6", height: "34px", padding: "0 8px", backgroundColor: "#fff", boxShadow: "none", width: "130px" }}
                  >
                    <option value="">All Categories</option>
                    {categoryList && categoryList.map(function(cat) {
                      return <option key={cat._id} value={cat._id}>{cat.name}</option>;
                    })}
                  </Form.Select>
                </div>
              </div>
            </div>

            {/* Schedule grid with inner scroll */}
            <div style={{ flex: 1, overflow: "hidden", padding: "0" }}>
              {schedulesLoading ? (
                <DataLoading height="100%" />
              ) : !hasAnyBooking ? (
                <div className="text-center py-5 text-muted">
                  <FaCalendarAlt size={40} className="mb-3 opacity-25" />
                  <p style={{ fontSize: "14px" }}>No bookings for {formatDisplayDate()}</p>
                </div>
              ) : (
                <div style={{ height: "100%", overflowY: "auto", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                  <div style={{ display: "inline-block", minWidth: "100%" }}>

                    {/* Header row — sticky */}
                    <div style={{ display: "flex", whiteSpace: "nowrap", position: "sticky", top: 0, zIndex: 10 }}>
                      <div style={{ background: "linear-gradient(180deg,#0034E4 0%,#001B76 100%)", color: "white", fontWeight: 600, fontSize: "12px", fontFamily: "Poppins", minWidth: 80, flex: "0 0 80px", padding: "10px 6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        Time
                      </div>
                      {courtColumns.map(function(courtName) {
                        return (
                          <div key={courtName} style={{ background: "linear-gradient(180deg,#0034E4 0%,#001B76 100%)", color: "white", fontWeight: 600, fontSize: "12px", fontFamily: "Poppins", minWidth: 140, flex: "1 0 140px", padding: "10px 6px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.15)", gap: 2 }}>
                            <span>{courtName}</span>
                            {courtDurationMap[courtName] != null && (
                              <span style={{ fontSize: "10px", fontWeight: 400, opacity: 0.85 }}>({formatDuration(courtDurationMap[courtName])})</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Grid body */}
                    <div style={{ display: "flex" }}>
                      {/* Time axis */}
                      <div style={{ minWidth: 80, flex: "0 0 80px", borderRight: "2px solid #c7d2fe", position: "relative", height: gridTotalHeight + "px" }}>
                        {timeAxisMinutes.map(function(mins, index) {
                          var top = tickTopOffset[mins];
                          var label = formatMinutesToLabel(mins);
                          var isEven = index % 2 === 0;
                          var Icon = getTimeIcon(label + " - " + label);
                          return (
                            <div key={mins} style={{ position: "absolute", top: top + "px", left: 0, right: 0, height: ROW_HEIGHT + "px", backgroundColor: isEven ? "#EEF2FF" : "#E8EDFF", borderBottom: "1px solid #e9ecef", display: "flex", alignItems: "center", justifyContent: "center", gap: 3, padding: "2px 4px" }}>
                              <span style={{ fontSize: "11px", fontWeight: 700, fontFamily: "Poppins", color: "#1e3a8a", whiteSpace: "nowrap" }}>
                                {label.replace(/ AM| PM/i, "")}
                              </span>
                              {Icon && <Icon size={10} color="#1e3a8a" />}
                              <span style={{ fontSize: "8px", fontWeight: 500, fontFamily: "Poppins", color: "#6b7280" }}>
                                {(label.match(/AM|PM/i) || [""])[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Court columns */}
                      {courtColumns.map(function(courtName) {
                        return (
                          <div key={courtName} style={{ minWidth: 140, flex: "1 0 140px", position: "relative", height: gridTotalHeight + "px", borderLeft: "1px solid #e9ecef", backgroundColor: "#ffffff" }}>
                            {timeAxisMinutes.map(function(mins) {
                              return (
                                <div key={mins} style={{ position: "absolute", top: tickTopOffset[mins] + "px", left: 0, right: 0, height: 1, backgroundColor: "#e9ecef", zIndex: 1 }} />
                              );
                            })}
                            {courtBookingMap[courtName] && courtBookingMap[courtName].map(function(booking, bi) {
                              var isUnavailable = booking.type === "availability";
                              var isPending = !isUnavailable && booking.paymentStatus === "pending";

                              // Unavailable slot (weather, maintenance, etc.)
                              if (isUnavailable) {
                                var status = booking.availabilityStatus || "Unavailable";
                                var statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
                                var tooltipUnavail = (
                                  <Tooltip>
                                    <div style={{ textAlign: "left", fontSize: "11px", lineHeight: 1.8 }}>
                                      <div><strong>Court Unavailable</strong></div>
                                      <div>{statusLabel}</div>
                                      <div>{booking.timeRange || "N/A"}</div>
                                      <div>{formatDisplayDate()}</div>
                                    </div>
                                  </Tooltip>
                                );
                                return (
                                  <OverlayTrigger key={bi} placement="top" overlay={tooltipUnavail}>
                                    <div style={{ position: "absolute", top: (booking.top + 1) + "px", left: 3, right: 3, height: (booking.height - 2) + "px", zIndex: 2, borderRadius: 5, overflow: "hidden", borderLeft: "3px solid #ef4444", background: "linear-gradient(135deg,#fee2e2 0%,#fecaca 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3px 6px", cursor: "pointer" }}>
                                      <div style={{ fontWeight: 600, fontSize: "11px", fontFamily: "Poppins", color: "#b91c1c", lineHeight: 1.2, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                                        {statusLabel}
                                      </div>
                                    </div>
                                  </OverlayTrigger>
                                );
                              }

                              // Normal booking
                              var tooltipEl = (
                                <Tooltip>
                                  <div style={{ textAlign: "left", fontSize: "11px", lineHeight: 1.8 }}>
                                    <div><strong>{booking.userName || "N/A"}</strong></div>
                                    <div>{booking.phoneNumber || "N/A"}</div>
                                    <div>{booking.timeRange || "N/A"}</div>
                                    <div>{formatDisplayDate()}</div>
                                    <div>{isPending ? "Payment pending" : (booking.paymentStatus || "N/A")}</div>
                                    <div>{"Rs." + (booking.totalAmount || 0)}</div>
                                  </div>
                                </Tooltip>
                              );
                              return (
                                <OverlayTrigger key={bi} placement="top" overlay={tooltipEl}>
                                  <div style={{ position: "absolute", top: (booking.top + 1) + "px", left: 3, right: 3, height: (booking.height - 2) + "px", zIndex: 2, borderRadius: 5, overflow: "hidden", borderLeft: "3px solid " + (isPending ? "#eab308" : "#22c55e"), background: isPending ? "linear-gradient(135deg,#fef9c3 0%,#fde68a 100%)" : "linear-gradient(135deg,#22c55e 0%,#16a34a 100%)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "3px 6px", gap: 2, cursor: "pointer" }}>
                                    <div style={{ fontWeight: 600, fontSize: "11px", fontFamily: "Poppins", color: isPending ? "#374151" : "white", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      {truncateName(booking.userName)}
                                    </div>
                                    <div style={{ fontSize: "10px", fontFamily: "Poppins", color: isPending ? "#374151" : "rgba(255,255,255,0.9)", lineHeight: 1.2 }}>
                                      {booking.phoneNumber || "N/A"}
                                    </div>
                                  </div>
                                </OverlayTrigger>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>
              )}
            </div>

          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Schedules;
