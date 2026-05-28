import React, { useState, useEffect } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getMatchRequestPlayers, sendMatchRequest } from "../../redux/admin/matchRequest/thunk";
import { setFilters, setPagination } from "../../redux/admin/matchRequest/slice";
import { ButtonLoading } from "../../helpers/loading/Loaders";
import { FaCheckCircle, FaClock, FaTimesCircle, FaSearch, FaFilter, FaUser, FaTimes, FaCheck } from "react-icons/fa";
import "./MatchRequestModal.css";

const MatchRequestModal = ({ show, onHide, matchId }) => {
  const dispatch = useDispatch();
  const { matchRequestPlayers, matchRequestLoading, sendRequestLoading, filters, pagination, automaticRequest } = useSelector((state) => state.matchRequest);
  const [localSearch, setLocalSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("any");
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingPlayerId, setSendingPlayerId] = useState(null);
  const [isWhatsappShareEnabled, setIsWhatsappShareEnabled] = useState(false);
  const [showSendModeModal, setShowSendModeModal] = useState(false);

  useEffect(() => {
    if (show && matchId) {
      fetchPlayers();
    }
  }, [show, matchId, filters, pagination.page]);

  useEffect(() => {
    if (!show) {
      resetModalState();
    }
  }, [show, dispatch]);

  const resetModalState = () => {
    setLocalSearch("");
    setSelectedTeam("any");
    setIsSelectMode(false);
    setSelectedPlayers([]);
    setSendingAll(false);
    setSendingPlayerId(null);
    setIsWhatsappShareEnabled(false);
    setShowSendModeModal(false);
    dispatch(setFilters({ search: "", gender: "", level: "", skillLevel: "" }));
    dispatch(setPagination({ page: 1 }));
  };

  console.log({ matchRequestPlayers })

  const fetchPlayers = () => {
    dispatch(getMatchRequestPlayers({
      matchId,
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
    }));
  };

  const handleSearch = () => {
    dispatch(setFilters({ search: localSearch }));
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
      await dispatch(sendMatchRequest({
        matchId,
        playerIds: selectedPlayers,
        preferredTeam: selectedTeam
      })).unwrap();

      setSelectedPlayers([]);
      setIsSelectMode(false);
      fetchPlayers();
    } catch (error) {
      console.error("Error sending requests:", error);
    } finally {
      setSendingAll(false);
    }
  };

  const handleAutoSend = async () => {
    if (automaticRequest?.hasOldPlayers === true) {
      setShowSendModeModal(true);
    } else {
      await sendAutoRequest("new");
    }
  };

  const sendAutoRequest = async (sendMode) => {
    setSendingAll(true);
    setShowSendModeModal(false);
    try {
      await dispatch(sendMatchRequest({
        matchId,
        auto: true,
        sendMode: sendMode
      })).unwrap();

      fetchPlayers();
    } catch (error) {
      console.error("Error sending auto requests:", error);
    } finally {
      setSendingAll(false);
    }
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(setPagination({ page: 1 }));
  };

  const clearFilters = () => {
    setLocalSearch("");
    dispatch(setFilters({ search: "", gender: "", level: "", skillLevel: "" }));
    dispatch(setPagination({ page: 1 }));
  };

  const hasActiveFilters = () => {
    return localSearch || filters.gender || filters.level || filters.skillLevel;
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
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              padding: "3px 8px",
              borderRadius: "4px",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              cursor: sendingPlayerId === player._id ? "not-allowed" : "pointer"
            }}
          >
            {sendingPlayerId === player._id ? (
              <ButtonLoading color="blue" size={3} />
            ) : (
              "Resend"
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
    <Modal show={show} onHide={onHide} size="lg" centered className="match-request-modal">
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
                placeholder="Search by name..."
                value={localSearch}
                onChange={(e) => { setLocalSearch(e.target.value); handleSearch(); }}
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
            <div className="form-check whatsapp-toggle form-switch">
              <label className="form-check-label" htmlFor="switchCheckDefault">WhatsApp</label>
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="switchCheckDefault"
                checked={isWhatsappShareEnabled}
                onChange={(e) => setIsWhatsappShareEnabled(e.target.checked)}
              />
            </div>

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

            <Button
              variant="primary"
              onClick={handleAutoSend}
              disabled={sendingAll}
              className="select-mode-btn text-nowrap"
            >
              {sendingAll ? (
                <ButtonLoading color="white" size={4} />
              ) : (
                <span>Auto Send</span>
              )}
            </Button>
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
                const hasStatus = getRequestStatus(player);
                const canSelect = canSelectPlayer(player);

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

                    <div className="player-info d-flex align-items-center ">
                      <div className="player-avatar">
                        {player.name ? player.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div className="player-details d-flex">
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
                        <div className=" d-flex gap-0 flex-column align-items-start w-25" >
                      <p className="player-contact m-0 mb-1 text-start" >
                        {`${player.countryCode || ""} ${player.phoneNumber || ""}`.trim() || "No contact"}
                      </p>
                      {player.email && (
                        <p className="player-contact m-0 mb-0 text-start" >
                          {player.email}
                        </p>
                      )}
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
        {!matchRequestLoading && matchRequestPlayers && matchRequestPlayers?.length > 0 && (
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

      {/* Send Mode Modal */}
      <Modal show={showSendModeModal} onHide={() => setShowSendModeModal(false)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "16px", fontWeight: "600" }}>Select Send Mode</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px" }}>
          <div className="d-flex flex-column gap-2">
            <Button
              variant="primary"
              onClick={() => sendAutoRequest("new")}
              className="w-100"
              style={{ padding: "10px", fontSize: "14px", fontWeight: "600" }}
            >
              Send to New Players
            </Button>
            <Button
              variant="secondary"
              onClick={() => sendAutoRequest("resend")}
              className="w-100"
              style={{ padding: "10px", fontSize: "14px", fontWeight: "600" }}
            >
              Resend to Old Players
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Modal>
  );
};

export default MatchRequestModal;
