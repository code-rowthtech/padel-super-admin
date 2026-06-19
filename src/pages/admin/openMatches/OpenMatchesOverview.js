import React, { useState, useEffect, useRef } from "react";
import { Container, Card, Table, Pagination, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getOpenMatchOverview } from "../../../redux/thunks";
import { useSuperAdminContext } from "../../../contexts/SuperAdminContext";
import { formatDate } from "../../../helpers/Formatting";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { MdOutlineGroup } from "react-icons/md";
import PlayersJoinedModal from "../../../components/modals/PlayersJoinedModal";
import MatchRequestModal from "../../../components/modals/MatchRequestModal";
import "./OpenMatchesOverview.css";

const isMatchRequestDisabled = (match) => {
  const statuses = [
    match?.openMatchStatus,
    match?.matchStatus,
    match?.bookingStatus,
    match?.status,
  ].map((status) => String(status || "").toLowerCase());

  if (statuses.some((status) => ["complete", "completed", "cancelled", "canceled"].includes(status))) {
    return true;
  }

  return false;
};

const getOpenMatchDisplayStatus = (match) => {
  const status = String(match?.status || "").toLowerCase();
  if (["complete", "completed", "cancelled", "canceled"].includes(status)) return match.status;

  return match?.openMatchStatus || match?.status || "upcoming";
};

const getMatchCreator = (match) => match?.createdBy || match?.creatorId || match?.userId || null;

const getCreatorDisplayName = (creator) =>
  creator?.name || creator?.nickName || creator?.email || "N/A";

const getCreatorPhone = (creator) =>
  creator?.phoneNumber ? `${creator?.countryCode || ""}${creator.phoneNumber}` : "";

const OpenMatchesOverview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedOwnerId } = useSuperAdminContext();
  const { openMatchOverview, openMatchOverviewLoading, openMatchOverviewError } = useSelector((state) => state.dashboard);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;
  const playersModalCloseTimer = useRef(null);

  const clearPlayersModalCloseTimer = () => {
    if (playersModalCloseTimer.current) {
      clearTimeout(playersModalCloseTimer.current);
      playersModalCloseTimer.current = null;
    }
  };

  const openPlayersModal = (match) => {
    clearPlayersModalCloseTimer();
    setSelectedMatch(match);
    setShowPlayersModal(true);
  };

  const schedulePlayersModalClose = () => {
    clearPlayersModalCloseTimer();
    playersModalCloseTimer.current = setTimeout(() => {
      setShowPlayersModal(false);
    }, 180);
  };

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: recordsPerPage,
      ...(selectedOwnerId && { ownerId: selectedOwnerId })
    };
    dispatch(getOpenMatchOverview(params));
  }, [dispatch, selectedOwnerId, currentPage]);

  useEffect(() => {
    return () => clearPlayersModalCloseTimer();
  }, []);

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
    if (isMatchRequestDisabled(match)) return;

    setSelectedMatch(match);
    setShowRequestModal(true);
  };

  const handleFindPlayersClick = (match) => {
    if (!match?._id) return;

    navigate(`/admin/player-preferences?tab=findPlayers&matchId=${match._id}`, {
      state: {
        tab: "findPlayers",
        selectedOpenMatchId: match._id,
      },
    });
  };

  const allMatches = openMatchOverview?.openMatches || [];
  const pagination = openMatchOverview?.pagination || {};
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || allMatches.length;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container fluid className="p-2 pt-md-0 p-md-4 px-md-0" style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <Card className="border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div></div>
            <Button
              size="sm"
              onClick={() => navigate("/admin/open-matches/create")}
              style={{ backgroundColor: "#1F41BB", borderColor: "#1F41BB", fontWeight: 600 }}
            >
              Create Open Match
            </Button>
          </div>

          {openMatchOverviewLoading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
              <ButtonLoading color="blue" size={8} />
            </div>
          ) : openMatchOverviewError ? (
            <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: "400px" }}>
              <div className="text-danger mb-2">Failed to load open matches.</div>
              <button className="btn btn-sm btn-primary" onClick={() => dispatch(getOpenMatchOverview({ page: currentPage, limit: recordsPerPage, ...(selectedOwnerId && { ownerId: selectedOwnerId }) }))}>
                Retry
              </button>
            </div>
          ) : !openMatchOverview || !allMatches || allMatches.length === 0 ? (
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
                    {allMatches.map((item, index) => {
                      const displayIndex = (currentPage - 1) * recordsPerPage + index + 1;
                      const joinedCount = item?.totalPlayers ?? (Number(item?.teamA?.length || 0) + Number(item?.teamB?.length || 0));
                      const maxCount = item?.totalPlayersCount ?? item?.maxPlayers ?? 4;
                      const progressPct = Math.min(100, (joinedCount / maxCount) * 100);
                      const skill = item?.skillLevel || "All Skills";
                      const priceText = item?.teamA?.[0]?.amountPaid !== undefined ? `₹${item.teamA[0].amountPaid}` : (item?.totalMatchPayment !== undefined ? `₹${item.totalMatchPayment}` : "N/A");
                      const creator = getMatchCreator(item);
                      const hostName = getCreatorDisplayName(creator);
                      const hostPhone = getCreatorPhone(creator);
                      const clubName = item?.clubId?.clubName || "N/A";
                      const courtName = item?.slot?.[0]?.courtName || "";
                      const bookingDate = item?.matchDate || item?.bookingDate;
                      const timeText = item?.matchTime?.[0] || (item?.startTime && item?.endTime ? `${item.startTime} - ${item.endTime}` : "N/A");
                      const status = getOpenMatchDisplayStatus(item);
                      const isMatchCompleted = isMatchRequestDisabled(item);
                      const isApproaching = item?.isWithin24Hours;
                      const approachingStyle = isApproaching ? { backgroundColor: "#fffbeb" } : undefined;
                      const statusStyle = getStatusBadgeStyle(status);

                      return (
                        <tr
                          key={item?._id || index}
                          className="table-data border-bottom text-center"
                          style={{ ...approachingStyle, cursor: "pointer" }}
                          onClick={() => handleFindPlayersClick(item)}
                          title="Find matching players for this open match"
                        >
                          <td className="fw-semibold" style={approachingStyle}>{displayIndex}</td>
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
                          <td style={approachingStyle} className="skill-level-cell">
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
                          <td
                            style={approachingStyle}
                            onMouseEnter={() => {
                              if (joinedCount > 0) {
                                openPlayersModal(item);
                              }
                            }}
                            onMouseMove={() => {
                              if (joinedCount > 0) {
                                openPlayersModal(item);
                              }
                            }}
                            onMouseLeave={schedulePlayersModalClose}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className="d-flex flex-column align-items-center justify-content-center players-joined-cell"
                              style={{ minWidth: "120px", cursor: joinedCount > 0 ? "pointer" : "default" }}
                            >
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestClick(item);
                              }}
                              disabled={isMatchCompleted}
                              title={isMatchCompleted ? "Requests are disabled for completed matches." : "Send request"}
                              style={{
                                fontSize: "11px",
                                padding: "5px 12px",
                                backgroundColor: isMatchCompleted ? "#e5e7eb" : "rgba(99, 102, 241, 0.12)",
                                color: isMatchCompleted ? "#9ca3af" : "#4f46e5",
                                border: "none",
                                borderRadius: "4px",
                                fontWeight: "600",
                                cursor: isMatchCompleted ? "not-allowed" : "pointer",
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
                {allMatches.map((item, index) => {
                  const displayIndex = (currentPage - 1) * recordsPerPage + index + 1;
                  const joinedCount = item?.totalPlayers ?? (Number(item?.teamA?.length || 0) + Number(item?.teamB?.length || 0));
                  const maxCount = item?.totalPlayersCount ?? item?.maxPlayers ?? 4;
                  const progressPct = Math.min(100, (joinedCount / maxCount) * 100);
                  const skill = item?.skillLevel || "All Skills";
                  const priceText = item?.teamA?.[0]?.amountPaid !== undefined ? `₹${item.teamA[0].amountPaid}` : (item?.totalMatchPayment !== undefined ? `₹${item.totalMatchPayment}` : "N/A");
                  const creator = getMatchCreator(item);
                  const hostName = getCreatorDisplayName(creator);
                  const hostPhone = getCreatorPhone(creator);
                  const clubName = item?.clubId?.clubName || "N/A";
                  const courtName = item?.slot?.[0]?.courtName || "";
                  const bookingDate = item?.matchDate || item?.bookingDate;
                  const timeText = item?.matchTime?.[0] || (item?.startTime && item?.endTime ? `${item.startTime} - ${item.endTime}` : "N/A");
                  const status = getOpenMatchDisplayStatus(item);
                  const isMatchCompleted = isMatchRequestDisabled(item);
                  const isApproaching = item?.isWithin24Hours;
                  const statusStyle = getStatusBadgeStyle(status);

                  return (
                    <div
                      key={item?._id || index}
                      className="card mb-2 border"
                      style={{
                        ...(isApproaching ? { backgroundColor: "#fffbeb", borderColor: "#f59e0b" } : {}),
                        cursor: "pointer",
                      }}
                      onClick={() => handleFindPlayersClick(item)}
                      title="Find matching players for this open match"
                    >
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold text-dark" style={{ fontSize: "14px" }}>#{displayIndex} - {hostName}</span>
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
                              onMouseEnter={() => {
                                if (joinedCount > 0) {
                                  openPlayersModal(item);
                                }
                              }}
                              onMouseLeave={schedulePlayersModalClose}
                              onClick={(e) => e.stopPropagation()}
                            >
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestClick(item);
                            }}
                            disabled={isMatchCompleted}
                            title={isMatchCompleted ? "Requests are disabled for completed matches." : "Send request"}
                            style={{
                              fontSize: "12px",
                              padding: "8px",
                              backgroundColor: isMatchCompleted ? "#e5e7eb" : "rgba(99, 102, 241, 0.12)",
                              color: isMatchCompleted ? "#9ca3af" : "#4f46e5",
                              border: "none",
                              borderRadius: "4px",
                              fontWeight: "600",
                              cursor: isMatchCompleted ? "not-allowed" : "pointer",
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

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return <Pagination.Ellipsis key={pageNum} disabled />;
                      }
                      return null;
                    })}
                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <PlayersJoinedModal
        show={showPlayersModal}
        onHide={schedulePlayersModalClose}
        players={selectedMatch || []}
        onMouseEnter={clearPlayersModalCloseTimer}
        onMouseLeave={schedulePlayersModalClose}
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
