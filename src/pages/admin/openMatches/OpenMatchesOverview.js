import React, { useState, useEffect } from "react";
import { Container, Card, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getOpenMatchOverview } from "../../../redux/thunks";
import { useSuperAdminContext } from "../../../contexts/SuperAdminContext";
import { formatDate } from "../../../helpers/Formatting";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { MdOutlineGroup } from "react-icons/md";
import PlayersJoinedModal from "../../../components/modals/PlayersJoinedModal";
import MatchRequestModal from "../../../components/modals/MatchRequestModal";
import "./OpenMatchesOverview.css";

const OpenMatchesOverview = () => {
  const dispatch = useDispatch();
  const { selectedOwnerId } = useSuperAdminContext();
  const { openMatchOverview, openMatchOverviewLoading, openMatchOverviewError } = useSelector((state) => state.dashboard);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState([]);

  useEffect(() => {
    const params = selectedOwnerId ? { ownerId: selectedOwnerId } : {};
    dispatch(getOpenMatchOverview(params));
  }, [dispatch, selectedOwnerId]);

  const getStatusBadgeStyle = (status) => {
    const statusLower = status?.toLowerCase() || "";
    const statusStyles = {
      upcoming: { bg: "rgba(59, 130, 246, 0.12)", color: "#2563eb" },
      complete: { bg: "rgba(16, 185, 129, 0.12)", color: "#059669" },
      pending: { bg: "rgba(245, 158, 11, 0.12)", color: "#d97706" },
      cancelled: { bg: "rgba(239, 68, 68, 0.12)", color: "#dc2626" },
      open: { bg: "rgba(99, 102, 241, 0.12)", color: "#4f46e5" },
      full: { bg: "rgba(16, 185, 129, 0.12)", color: "#059669" },
    };
    return statusStyles[statusLower] || statusStyles.open;
  };


  const handleRequestClick = (match) => {
    setSelectedMatch(match);
    setShowRequestModal(true);
  };

  return (
    <Container fluid className="p-2 pt-md-0 p-md-4 px-md-0" style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <Card className="border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0 fw-bold" style={{ color: "#1f2937" }}>
              Open Matches Overview
            </h4>
          </div>

          {openMatchOverviewLoading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
              <ButtonLoading color="blue" size={8} />
            </div>
          ) : openMatchOverviewError ? (
            <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: "400px" }}>
              <div className="text-danger mb-2">Failed to load open matches.</div>
              <button className="btn btn-sm btn-primary" onClick={() => dispatch(getOpenMatchOverview(selectedOwnerId ? { ownerId: selectedOwnerId } : {}))}>
                Retry
              </button>
            </div>
          ) : !openMatchOverview || !openMatchOverview.openMatches || openMatchOverview.openMatches.length === 0 ? (
            <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: "400px" }}>
              <div className="mb-3 p-3 rounded-circle" style={{ backgroundColor: "#f3f4f6", color: "#9ca3af" }}>
                <MdOutlineGroup size={40} />
              </div>
              <h6 className="fw-bold mb-1" style={{ color: "#4b5563" }}>No Open Matches Available</h6>
              <p className="text-muted small mb-0">Matches created by players will show up here.</p>
            </div>
          ) : (
            <>
              <div className="d-none d-md-block">
                <Table borderless size="sm" className="custom-table" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
                  <thead>
                    <tr className="text-center">
                      <th>#</th>
                      <th className="text-start">Host / Creator</th>
                      <th className="text-start">Club & Court</th>
                      <th className="text-start">Date & Time</th>
                      <th>Skill Level</th>
                      <th>Total Requests</th>
                      <th>Players Joined</th>
                      <th>Fee</th>
                      <th>Status</th>
                      <th>Actions</th>
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
                      const status = item?.openMatchStatus || item?.status || "upcoming";
                      const isApproaching = item?.isWithin24Hours;
                      const approachingStyle = isApproaching ? { backgroundColor: "#fffbeb" } : undefined;
                      const statusStyle = getStatusBadgeStyle(status);

                      return (
                        <tr key={item?._id || index} className="table-data border-bottom text-center" style={approachingStyle}>
                          <td className="fw-semibold" style={approachingStyle}>{index + 1}</td>
                          <td className="text-start" style={approachingStyle}>
                            <div>
                              <div className="fw-bold" style={{ fontSize: "13px", color: "#111827" }}>{hostName}</div>
                              {hostPhone && <div className="text-muted" style={{ fontSize: "11px" }}>{hostPhone}</div>}
                            </div>
                          </td>
                          <td className="text-start" style={approachingStyle}>
                            <div>
                              <div className="fw-semibold" style={{ fontSize: "13px" }}>{clubName}</div>
                              {courtName && <div className="text-muted" style={{ fontSize: "11px" }}>{courtName}</div>}
                            </div>
                          </td>
                          <td className="text-start" style={approachingStyle}>
                            <div>
                              <div className="fw-semibold" style={{ fontSize: "12px" }}>{bookingDate ? formatDate(bookingDate) : "N/A"}</div>
                              <div className="text-muted" style={{ fontSize: "11px" }}>{timeText}</div>
                            </div>
                          </td>
                          <td style={approachingStyle}>
                            <span className="badge bg-light text-dark border fw-medium" style={{ fontSize: "11px", padding: "4px 8px" }}>
                              {skill}
                            </span>
                          </td>
                          <td style={approachingStyle}>
                            <div>
                              <div className="fw-bold">{item?.requestCounts?.total || 0}</div>
                              <div className="text-muted" style={{ fontSize: "11px" }}>
                                Pending: {item?.requestCounts?.pending || 0} | Accepted: {item?.requestCounts?.accepted || 0}
                              </div>
                            </div>
                          </td>
                          <td style={approachingStyle}>
                            <div
                              className="d-flex flex-column align-items-center justify-content-center players-joined-cell"
                              style={{ minWidth: "120px", cursor: joinedCount > 0 ? "pointer" : "default" }}
                              onClick={() => {
                                if (joinedCount > 0) {
                                  setSelectedMatch(item);
                                  setShowPlayersModal(true);
                                }
                              }}                            >
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
                                />
                              </div>
                            </div>
                          </td>
                          <td className="fw-bold text-success" style={{ fontSize: "13px", ...approachingStyle }}>
                            {priceText}
                          </td>
                          <td className="text-center" style={approachingStyle}>
                            <span
                              className="badge text-uppercase"
                              style={{
                                fontSize: "10px",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontWeight: "600",
                                letterSpacing: "0.5px",
                                background: statusStyle.bg,
                                color: statusStyle.color
                              }}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="text-center" style={approachingStyle}>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleRequestClick(item)}
                              style={{
                                fontSize: "11px",
                                padding: "5px 12px",
                                backgroundColor: "rgba(99, 102, 241, 0.12)",
                                color: "#4f46e5",
                                border: "none",
                                borderRadius: "4px",
                                fontWeight: "600"
                              }}
                            >
                              Request
                            </button>
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
                  const status = item?.openMatchStatus || item?.status || "upcoming";
                  const isApproaching = item?.isWithin24Hours;
                  const statusStyle = getStatusBadgeStyle(status);

                  return (
                    <div
                      key={item?._id || index}
                      className="card mb-2 border"
                      style={isApproaching ? { backgroundColor: "#fffbeb", borderColor: "#f59e0b" } : undefined}
                    >
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
                              background: statusStyle.bg,
                              color: statusStyle.color
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
                          <span className="mobile-card-label">Requests:</span>
                          <span className="mobile-card-value text-end">
                            <div className="fw-bold">{item?.requestCounts?.total || 0}</div>
                            <div className="text-muted" style={{ fontSize: "11px" }}>
                              Pending: {item?.requestCounts?.pending || 0} | Accepted: {item?.requestCounts?.accepted || 0}
                            </div>
                          </span>
                        </div>
                        <div className="mobile-card-item">
                          <span className="mobile-card-label">Fee / Player:</span>
                          <span className="mobile-card-value text-end text-success fw-bold">{priceText}</span>
                        </div>
                        <div className="mt-2 pt-2 border-top">
                          <div className="d-flex justify-content-between mb-1" style={{ fontSize: "11px" }}>
                            <span className="fw-bold text-dark">Players Joined:</span>
                            <span
                              className="text-muted fw-bold"
                              style={{ cursor: joinedCount > 0 ? "pointer" : "default", textDecoration: joinedCount > 0 ? "underline" : "none" }}
                              onClick={() => {
                                if (joinedCount > 0) {
                                  setSelectedMatch(item);
                                  setShowPlayersModal(true);
                                }
                              }}                            >
                              {joinedCount}/{maxCount} ({progressPct.toFixed(0)}%)
                            </span>
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
                        <div className="mt-3">
                          <button
                            className="btn btn-sm w-100"
                            onClick={() => handleRequestClick(item)}
                            style={{
                              fontSize: "12px",
                              padding: "8px",
                              backgroundColor: "rgba(99, 102, 241, 0.12)",
                              color: "#4f46e5",
                              border: "none",
                              borderRadius: "4px",
                              fontWeight: "600"
                            }}
                          >
                            Send Request
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      <PlayersJoinedModal
        show={showPlayersModal}
        onHide={() => setShowPlayersModal(false)}
        players={selectedMatch || []}
      />

      <MatchRequestModal
        show={showRequestModal}
        onHide={() => setShowRequestModal(false)}
        matchId={selectedMatch?._id}
      />
    </Container>
  );
};

export default OpenMatchesOverview;
