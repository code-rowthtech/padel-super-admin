import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getMatchRequestPlayers, sendMatchRequest } from "../../redux/admin/matchRequest/thunk";
import { setFilters, setPagination } from "../../redux/admin/matchRequest/slice";
import { ButtonLoading } from "../../helpers/loading/Loaders";
import { FaCheckCircle, FaClock, FaTimesCircle, FaSearch, FaUser, FaTimes } from "react-icons/fa";
import "./MatchRequestModal.css";

const MatchRequestModal = ({ show, onHide, matchId }) => {
  const dispatch = useDispatch();
  const { matchRequestPlayers, matchRequestLoading, filters, pagination } = useSelector((state) => state.matchRequest);
  const [localSearch, setLocalSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("any");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingPlayerId, setSendingPlayerId] = useState(null);
  const [isWhatsappShareEnabled, setIsWhatsappShareEnabled] = useState(false);

  const resetModalState = useCallback(() => {
    setLocalSearch("");
    setSelectedTeam("any");
    setIsSelectMode(false);
    setSelectedPlayers([]);
    setSendingAll(false);
    setSendingPlayerId(null);
    setIsWhatsappShareEnabled(false);
    dispatch(setFilters({ search: "", gender: "", level: "", skillLevel: "" }));
    dispatch(setPagination({ page: 1 }));
  }, [dispatch]);

  const fetchPlayers = useCallback(() => {
    dispatch(getMatchRequestPlayers({
      matchId,
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
    }));
  }, [dispatch, matchId, pagination.limit, pagination.page, filters]);

  useEffect(() => {
    if (show && matchId) {
      fetchPlayers();
    }
  }, [show, matchId, fetchPlayers]);

  useEffect(() => {
    if (!show) {
      resetModalState();
    }
  }, [show, resetModalState]);

  const handleSearch = (searchValue = localSearch) => {
    dispatch(setFilters({ search: searchValue }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleSendSingle = async (playerId) => {
    setSendingPlayerId(playerId);
    try {
      await dispatch(sendMatchRequest({ matchId, playerId, preferredTeam: selectedTeam })).unwrap();
      fetchPlayers();
    } finally {
      setSendingPlayerId(null);
    }
  };

  const handleSendAll = async () => {
    if (selectedPlayers.length === 0) return;
    
    setSendingAll(true);
    try {
      // Send single request with all player IDs
      await dispatch(sendMatchRequest({ 
        matchId, 
        playerIds: selectedPlayers, 
        preferredTeam: selectedTeam 
      })).unwrap();
      
      // Reset selection and refresh
      setSelectedPlayers([]);
      setIsSelectMode(false);
      fetchPlayers();
    } catch (error) {
      console.error("Error sending requests:", error);
    } finally {
      setSendingAll(false);
    }
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedPlayers([]);
  };

  const togglePlayerSelection = (playerId) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const isPlayerSelected = (playerId) => {
    return selectedPlayers.includes(playerId);
  };

  const getRequestStatus = (player) => {
    if (player.isAlreadyInMatch) return "joined";
    if (player.isRequestAlreadySent) return "pending";
    if (player.isSendAgain) return "rejected";
    return null;
  };

  const getStatusBadge = (player) => {
    const status = getRequestStatus(player);

    if (!status) return null;

    const statusConfig = {
      pending: { icon: <FaClock size={10} />, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", text: "Pending", showRecent: true },
      joined: { icon: <FaCheckCircle size={10} />, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", text: "Joined", showRecent: false },
      rejected: { icon: <FaTimesCircle size={10} />, color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", text: "Rejected", showRecent: false },
    };

    const config = statusConfig[status];

    return (
      <div className="d-flex align-items-center gap-2">
        {config.showRecent && (
          <button
            type="button"
            className="recent-badge"
            onClick={(e) => {
              e.stopPropagation();
              handleSendSingle(player._id);
            }}
            disabled={sendingPlayerId === player._id}
          >
            {sendingPlayerId === player._id ? (
              <ButtonLoading color="blue" size={3} />
            ) : (
              "Send Again"
            )}
          </button>
        )}
        <span
          className="status-badge"
          style={{
            color: config.color,
            backgroundColor: config.bg,
            border: `1px solid ${config.color}20`
          }}
        >
          {config.icon}
          <span>{config.text}</span>
        </span>
      </div>
    );
  };

  const canSendRequest = (player) => {
    return !player.isAlreadyInMatch && !player.isRequestAlreadySent && !player.isSendAgain;
  };

  const canSelectPlayer = (player) => {
    // Allow selection for all players except those already joined
    return !player.isAlreadyInMatch;
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="match-request-modal">
      <Modal.Header closeButton className="modal-header-custom">
        <div className="modal-header-content">
          <div className="modal-icon bg-transparent">
            <FaUser size={18} />
          </div>
          <div>
            <Modal.Title className="modal-title-custom">
              Match Request Players
            </Modal.Title>
            <p className="modal-subtitle">
              {isSelectMode ? "Select players to send requests" : "Select and send match requests to available players"}
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="modal-body-custom">
        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-bar-container">
            <InputGroup className="search-input-group">
              <InputGroup.Text className="search-icon">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by name, email or phone..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="search-input"
              />
              {localSearch && (
                <Button
                  variant="link"
                  className="clear-search-btn"
                  onClick={() => {
                    setLocalSearch("");
                    dispatch(setFilters({ search: "" }));
                  }}
                >
                  <FaTimes />
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleSearch}
                className="search-btn"
              >
                Search
              </Button>
            </InputGroup>
          </div>

          <div className="selection-actions">
            <button
              type="button"
              className={`whatsapp-toggle ${isWhatsappShareEnabled ? "whatsapp-toggle-active" : ""}`}
              onClick={() => setIsWhatsappShareEnabled((prev) => !prev)}
              aria-pressed={isWhatsappShareEnabled}
            >
              <span className="whatsapp-toggle-label">WhatsApp</span>
              <span className="whatsapp-ios-switch" aria-hidden="true">
                <span className="whatsapp-ios-switch-handle" />
              </span>
            </button>

            <Button
              variant={isSelectMode ? "danger" : "primary"}
              onClick={toggleSelectMode}
              className="select-mode-btn"
            >
              {isSelectMode ? (
                <>
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <span>Select</span>
                </>
              )}
            </Button>

            {isSelectMode && (
              <Button
                variant="success"
                onClick={handleSendAll}
                disabled={sendingAll}
                className="send-all-btn"
              >
                {sendingAll ? (
                  <ButtonLoading color="white" size={4} />
                ) : (
                  <>
                    <FaCheckCircle />
                    <span>Send ({selectedPlayers?.length})</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        {/* Results Info */}
        {!matchRequestLoading && matchRequestPlayers && matchRequestPlayers.length > 0 && (
          <div className="results-info">
            <span className="results-count">
              {isSelectMode && selectedPlayers.length > 0
                ? `${selectedPlayers.length} player${selectedPlayers.length > 1 ? 's' : ''} selected`
                : `Showing ${matchRequestPlayers.length} of ${pagination.total} players`
              }
            </span>
            <span className="page-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </div>
        )}

        {/* Players List */}
        <div className="players-list-container">
          {matchRequestLoading ? (
            <div className="loading-state">
              <ButtonLoading color="blue" size={8} />
              <p>Loading players...</p>
            </div>
          ) : !matchRequestPlayers || matchRequestPlayers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaUser />
              </div>
              <h6>No Players Found</h6>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="players-list">
              {matchRequestPlayers.map((player) => {
                const isSelected = isPlayerSelected(player._id);
                const canSelect = canSelectPlayer(player);
                const playerPhone = `${player.countryCode || ""} ${player.phoneNumber || ""}`.trim();
                const playerEmail = player.email || "";

                return (
                  <div
                    key={player._id}
                    className={`player-card ${isSelected ? 'player-card-selected' : ''} ${isSelectMode && canSelect ? 'player-card-selectable' : ''}`}
                    onClick={() => isSelectMode && canSelect && togglePlayerSelection(player._id)}
                    style={{ cursor: isSelectMode && canSelect ? 'pointer' : 'default' }}
                  >
                    {isSelectMode && canSelect && (
                      <div className="player-checkbox">
                        <Form.Check
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePlayerSelection(player._id)}
                          onClick={(e) => e.stopPropagation()}
                          className="custom-checkbox"
                        />
                      </div>
                    )}

                    <div className="player-info">
                      <div className="player-avatar">
                        {player.name ? player.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="player-details">
                        <div className="player-main">
                          <div className="player-name-row">
                            <h6 className="player-name">{player.name || "Unknown Player"}</h6>
                            {(player.gender || player.level || player.skillLevel) && (
                              <div className="player-badges">
                                {player.gender && (
                                  <span className="player-badge badge-gender">{player.gender}</span>
                                )}
                                {player.level && (
                                  <span className="player-badge badge-level">Level {player.level}</span>
                                )}
                                {player.skillLevel && (
                                  <span className="player-badge badge-skill">{player.skillLevel}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="player-contact">
                          {playerPhone ? (
                            <span className="player-phone">{playerPhone}</span>
                          ) : playerEmail ? (
                            <span className="player-phone">{playerEmail}</span>
                          ) : (
                            <span className="player-phone">No contact</span>
                          )}
                          {playerPhone && playerEmail && (
                            <span className="player-email">{playerEmail}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isSelectMode && (
                      <div className="player-action">
                        {getStatusBadge(player) || (
                          <Button
                            variant="primary"
                            onClick={() => handleSendSingle(player._id)}
                            disabled={sendingPlayerId === player._id || !canSendRequest(player)}
                            className="send-request-btn"
                          >
                            {sendingPlayerId === player._id ? (
                              <ButtonLoading color="white" size={4} />
                            ) : (
                              <span>Send</span>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!matchRequestLoading && matchRequestPlayers && matchRequestPlayers.length > 0 && (
          <div className="pagination-controls">
            <Button
              variant="outline-secondary"
              onClick={() => dispatch(setPagination({ page: pagination.page - 1 }))}
              disabled={pagination.page === 1 || matchRequestLoading}
              className="pagination-btn"
            >
              Previous
            </Button>
            <div className="pagination-info">
              <span className="current-page">{pagination.page}</span>
              <span className="page-separator">/</span>
              <span className="total-pages">{pagination.totalPages}</span>
            </div>
            <Button
              variant="outline-secondary"
              onClick={() => dispatch(setPagination({ page: pagination.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages || matchRequestLoading}
              className="pagination-btn"
            >
              Next
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default MatchRequestModal;
