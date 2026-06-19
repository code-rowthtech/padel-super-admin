import React, { useState, useEffect } from "react";
import { Badge, Button, Form, Offcanvas } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
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
                <div className="d-flex justify-content-between mt-2" style={{ fontSize: 12 }}>
                    <span className="text-muted">Players {joinedCount}/{maxPlayers}</span>
                    <span className="fw-semibold text-success">Payable ₹{fee.payable || 0}</span>
                </div>
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
