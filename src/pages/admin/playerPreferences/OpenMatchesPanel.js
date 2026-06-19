iimport React, { useState, useEffect } from "react";
import { Badge, Button, Form, Offcanvas, Dropdown } from "react-bootstrap";
import { FaPlus, FaUser } from "react-icons/fa";
import { DataLoading } from "../../../helpers/loading/Loaders";

const SKILL_COLORS = {
    Beginner: "success",
    Intermediate: "warning",
    Advanced: "danger",
    Professional: "dark"
};

const OpenMatchesPanel = ({
    show,
    onHide,
    openMatches,
    openMatchesLoading,
    selectedOpenMatch,
    onMatchSelect,
    onRefresh,
    onSearch,
    getMatchClubName,
    getMatchCourtName,
    getMatchFee,
    formatMatchDate,
    getMatchTime,
    onAddOpenMatch,
    availablePlayers = [],
    onAddPlayerToMatch,
}) => {
    const [matchSearchQuery, setMatchSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Debounce search to avoid too many API calls
    useEffect(() => {
        if (!onSearch) return;

        const timer = setTimeout(() => {
            onSearch(matchSearchQuery);
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timer);
    }, [matchSearchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

    const renderMatch = (match, index) => {
        const joinedCount = match?.totalPlayers ?? (Number(match?.teamA?.length || 0) + Number(match?.teamB?.length || 0));
        const maxPlayers = match?.totalPlayersCount ?? match?.maxPlayers ?? 4;
        const fee = getMatchFee(match);
        const isSelected = selectedOpenMatch?._id === match?._id;

        // Get team players - only for selected match
        const teamA = isSelected ? (match?.teamA || []) : [];
        const teamB = isSelected ? (match?.teamB || []) : [];

        const renderPlayerIcon = (team, slotIndex, color) => {
            const players = team === 'A' ? teamA : teamB;
            const player = players[slotIndex];
            const playerCount = players.length;
            const totalTeamSlots = 2;
            const isEmpty = !player;

            // Filter available players based on match requirements
            const filteredAvailablePlayers = availablePlayers.filter(p => {
                // Filter by gender if match has gender requirement
                if (match?.gender && match.gender !== 'Mixed') {
                    return p.gender === match.gender;
                }
                return true;
            });

            return (
                <Dropdown
                    onClick={(e) => e.stopPropagation()}
                    onToggle={(isOpen, event, metadata) => {
                        if (event && typeof event.stopPropagation === 'function') {
                            event.stopPropagation();
                        }
                    }}
                    align="end"
                >
                    <Dropdown.Toggle
                        variant="link"
                        bsPrefix="custom-dropdown-toggle"
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            backgroundColor: player ? color : "#fff",
                            border: `2px solid ${color}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            position: "relative",
                            padding: 0,
                            textDecoration: "none",
                        }}
                    >
                        {player ? (
                            <FaUser size={10} color="#fff" />
                        ) : (
                            <span style={{ color: color, fontSize: 14, fontWeight: "bold", lineHeight: "1", marginTop: "-2px" }}>+</span>
                        )}
                        {slotIndex === 0 && playerCount > 0 && (
                            <span
                                style={{
                                    position: "absolute",
                                    top: -6,
                                    right: -6,
                                    backgroundColor: color,
                                    color: "#fff",
                                    borderRadius: "50%",
                                    width: 16,
                                    height: 16,
                                    fontSize: 9,
                                    fontWeight: "bold",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px solid #fff",
                                }}
                            >
                                {playerCount}/{totalTeamSlots}
                            </span>
                        )}
                    </Dropdown.Toggle>

                    <Dropdown.Menu
                        style={{
                            minWidth: 200,
                            maxHeight: 250,
                            overflowY: "auto",
                            fontSize: 12,
                            zIndex: 9999,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isEmpty ? (
                            // Show available players when slot is empty
                            <>
                                <Dropdown.Header style={{ fontSize: 11, fontWeight: 600 }}>
                                    Add Player to Team {team}
                                </Dropdown.Header>
                                {filteredAvailablePlayers.length > 0 ? (
                                    filteredAvailablePlayers.map((p, idx) => (
                                        <Dropdown.Item
                                            key={idx}
                                            style={{ fontSize: 12, padding: "8px 12px" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onAddPlayerToMatch) {
                                                    onAddPlayerToMatch(match, team, slotIndex, p);
                                                }
                                            }}
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                <div
                                                    style={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: "50%",
                                                        backgroundColor: color,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: "#fff",
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {p?.name?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div className="fw-semibold text-truncate" style={{ fontSize: 12 }}>
                                                        {p?.name || "Unknown"}
                                                    </div>
                                                    <div className="text-muted" style={{ fontSize: 10 }}>
                                                        {p?.skillLevel && `${p.skillLevel} • `}
                                                        {p?.phoneNumber}
                                                    </div>
                                                </div>
                                            </div>
                                        </Dropdown.Item>
                                    ))
                                ) : (
                                    <Dropdown.Item disabled style={{ fontSize: 12 }}>
                                        No available players
                                    </Dropdown.Item>
                                )}
                            </>
                        ) : (
                            // Show current player when slot is filled
                            <>
                                <Dropdown.Header style={{ fontSize: 11, fontWeight: 600 }}>
                                    Team {team} - Slot {slotIndex + 1}
                                </Dropdown.Header>
                                <Dropdown.Item
                                    style={{ fontSize: 12, padding: "8px 12px" }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: "50%",
                                                backgroundColor: color,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#fff",
                                                fontSize: 11,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {player?.name?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="fw-semibold text-truncate" style={{ fontSize: 12 }}>
                                                {player?.name || "Unknown"}
                                            </div>
                                            {player?.level && (
                                                <div className="text-muted" style={{ fontSize: 10 }}>
                                                    Level: {player.level}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Dropdown.Item>
                            </>
                        )}
                    </Dropdown.Menu>
                </Dropdown>
            );
        };

        return (
            <button
                key={`${match._id}-${index}`}
                type="button"
                onClick={() => onMatchSelect(match)}
                className="text-start"
                style={{
                    background: isSelected ? "#f0f4ff" : "#fff",
                    border: `1px solid ${isSelected ? "#1f41bb" : "#eef2f7"}`,
                    borderRadius: 6,
                    cursor: "pointer",
                    padding: 10,
                    flexShrink: 0,
                }}
            >
                <div className="d-flex justify-content-between gap-2 align-items-start">
                    <div style={{ minWidth: 0 }}>
                        <div className="fw-semibold text-truncate" style={{ fontSize: 13 }}>
                            {getMatchClubName(match)}
                        </div>
                        <div className="text-muted text-truncate" style={{ fontSize: 12 }}>
                            {getMatchCourtName(match) || "Court N/A"}
                        </div>
                    </div>
                    <Badge bg={SKILL_COLORS[match?.skillLevel] || "light"} text={match?.skillLevel ? undefined : "dark"}>
                        {match?.skillLevel || "Any"}
                    </Badge>
                </div>
                <div className="d-flex justify-content-between mt-2 text-muted" style={{ fontSize: 12 }}>
                    <span>{formatMatchDate(match)}</span>
                    <span>{getMatchTime(match)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2" style={{ fontSize: 12 }}>
                    <span className="text-muted">Players {joinedCount}/{maxPlayers}</span>
                    <span className="fw-semibold text-success">Payable ₹{fee.payable || 0}</span>
                </div>

                {/* Player Icons Row - Only show for selected match */}
                {isSelected && (
                    <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                        <div className="d-flex gap-1 align-items-center">
                            <span style={{ fontSize: 10, color: "#3DBE64", fontWeight: 600, marginRight: 4 }}>A:</span>
                            {renderPlayerIcon('A', 0, '#3DBE64')}
                            {renderPlayerIcon('A', 1, '#3DBE64')}
                        </div>
                        <div className="d-flex gap-1 align-items-center">
                            <span style={{ fontSize: 10, color: "#1F41BB", fontWeight: 600, marginRight: 4 }}>B:</span>
                            {renderPlayerIcon('B', 0, '#1F41BB')}
                            {renderPlayerIcon('B', 1, '#1F41BB')}
                        </div>
                    </div>
                )}
            </button>
        );
    };


    return (
        <>
            <style>
                {`
          @keyframes scrollMatches {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(-50%);
            }
          }

          .open-matches-scroll-container {
            cursor: default !important;
          }

          .open-matches-scroll-container.scrolling .open-matches-list {
            animation: scrollMatches 30s linear infinite;
            cursor: default !important;
          }

          .open-matches-scroll-container.scrolling:hover .open-matches-list {
            animation-play-state: paused;
            cursor: default !important;
          }

          .open-matches-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding-bottom: 0;
            cursor: default !important;
          }

          .custom-dropdown-toggle {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
          }

          .custom-dropdown-toggle:hover,
          .custom-dropdown-toggle:focus,
          .custom-dropdown-toggle:active {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
          }

          .custom-dropdown-toggle::after {
            display: none !important;
          }
        `}
            </style>

            <Offcanvas
                show={show}
                onHide={onHide}
                placement="end"
                backdrop={false}
                scroll
                className="player-preferences-open-match-panel"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700 }}>
                        Open Matches
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className="mb-3">
                        <Form.Control
                            size="sm"
                            placeholder="Search..."
                            value={matchSearchQuery}
                            onChange={(e) => setMatchSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            style={{ fontFamily: "Poppins", fontSize: 13 }}
                        />
                    </div>

                    <div className="d-flex gap-2 mb-3">
                        <Button
                            size="sm"
                            className="flex-fill"
                            onClick={onAddOpenMatch}
                            style={{ backgroundColor: "#1f41bb", border: "none", fontFamily: "Poppins", fontWeight: 600 }}
                        >
                            <FaPlus size={12} className="me-1" />Add Open Match
                        </Button>
                        <Button size="sm" variant="outline-secondary" onClick={onRefresh} disabled={openMatchesLoading}>
                            Refresh
                        </Button>
                    </div>

                    {openMatchesLoading ? (
                        <DataLoading height="220px" />
                    ) : openMatches.length === 0 ? (
                        <div className="text-center text-muted py-5" style={{ fontSize: 13 }}>
                            No open matches found.
                        </div>
                    ) : (
                        <div
                            className={`open-matches-scroll-container ${!isSearchFocused ? 'scrolling' : ''}`}
                            style={{
                                height: 'calc(100vh - 180px)',
                                maxHeight: 'calc(100vh - 180px)',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            <div className="open-matches-list">
                                {openMatches.map((match, index) => renderMatch(match, index))}
                                {!isSearchFocused && openMatches.map((match, index) => renderMatch(match, `duplicate-${index}`))}
                            </div>
                        </div>
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default OpenMatchesPanel;

// Made with Bob
