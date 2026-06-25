import React from "react";
import { Modal, Spinner } from "react-bootstrap";
import { FaTrashAlt, FaUsers } from "react-icons/fa";
import "./PlayersJoinedModal.css";

const PlayersJoinedModal = ({
  show,
  onHide,
  players,
  onMouseEnter,
  onMouseLeave,
  onRemovePlayer,
  removingPlayerId,
  title = "Players Joined",
  subtitle = "",
  hoverMode = false,
}) => {
  const matchStatus = String(players?.openMatchStatus || players?.status || "").toLowerCase();
  const isMatchBooked = ["booked", "completed", "complete"].includes(matchStatus);

  const teamA = players?.teamA || [];
  const teamB = players?.teamB || [];

  const renderPlayer = (player, index, teamLabel) => {
    const userId = player.userId || player;
    const name = userId?.name || player.name || "Unknown Player";
    const phone = userId?.phoneNumber ? `${userId.countryCode || "+91"} ${userId.phoneNumber}` : "";
    const email = userId?.email || player.email;
    const level = userId?.level || player.level;
    const gender = userId?.gender || player.gender;
    const playerId = userId?._id;

    return (
      <div
        key={player._id || index}
        className="player-joined-item"
      >
        <div className="d-flex align-items-start gap-3">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontSize: "16px",
              fontWeight: "700",
              flexShrink: 0
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow-1">
            <div className="fw-bold" style={{ fontSize: "14px", color: "#111827", marginBottom: "4px" }}>
              {name}
            </div>
            <div className="text-muted" style={{ fontSize: "12px", marginBottom: "6px" }}>
              {phone && <div>{phone}</div>}
              {email && <div>{email}</div>}
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <span
                className="badge"
                style={{
                  fontSize: "10px",
                  padding: "3px 8px",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  color: "#2563eb",
                  border: "1px solid rgba(59, 130, 246, 0.2)"
                }}
              >
                {gender}
              </span>
              <span
                className="badge"
                style={{
                  fontSize: "10px",
                  padding: "3px 8px",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  color: "#059669",
                  border: "1px solid rgba(16, 185, 129, 0.2)"
                }}
              >
                Level {level}
              </span>
            </div>
          </div>
          {onRemovePlayer && playerId && !isMatchBooked && (
            <button
              type="button"
              className="player-remove-icon"
              title={`Remove ${name}`}
              aria-label={`Remove ${name}`}
              disabled={removingPlayerId === playerId}
              onClick={() => onRemovePlayer(playerId, { player, team: teamLabel })}
            >
              {removingPlayerId === playerId ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <FaTrashAlt size={12} />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="md"
      centered
      backdrop={hoverMode ? false : true}
      className={hoverMode ? "players-joined-hover-modal" : "players-joined-modal"}
    >
      <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <Modal.Header closeButton className="border-0 pb-2">
        <div>
          <Modal.Title className="fw-bold" style={{ fontSize: "18px", color: "#111827" }}>
            {title}
          </Modal.Title>
          {subtitle && <div className="text-muted mt-1" style={{ fontSize: "12px" }}>{subtitle}</div>}
        </div>
      </Modal.Header>
      <Modal.Body className="px-4 py-3">
        {teamA.length === 0 && teamB.length === 0 ? (
          <div className="text-center py-5 text-muted">No players joined yet</div>
        ) : (
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {/* Team A */}
            {teamA.length > 0 && (
              <div className="mb-4">
                <div
                  className="d-flex align-items-center gap-2 mb-3 pb-2"
                  style={{ borderBottom: "2px solid #667eea" }}
                >
                  <FaUsers style={{ color: "#667eea", fontSize: "16px" }} />
                  <h6 className="mb-0 fw-bold" style={{ fontSize: "15px", color: "#667eea" }}>
                    Team A ({teamA.length})
                  </h6>
                </div>
                {teamA.map((player, index) => renderPlayer(player, `teamA-${index}`, "teamA"))}
              </div>
            )}

            {/* Team B */}
            {teamB.length > 0 && (
              <div>
                <div
                  className="d-flex align-items-center gap-2 mb-3 pb-2"
                  style={{ borderBottom: "2px solid #10b981" }}
                >
                  <FaUsers style={{ color: "#10b981", fontSize: "16px" }} />
                  <h6 className="mb-0 fw-bold" style={{ fontSize: "15px", color: "#10b981" }}>
                    Team B ({teamB.length})
                  </h6>
                </div>
                {teamB.map((player, index) => renderPlayer(player, `teamB-${index}`, "teamB"))}
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      </div>
    </Modal>
  );
};

export default PlayersJoinedModal;
