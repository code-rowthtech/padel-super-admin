import React from "react";
import { Col, Modal, ProgressBar, Row } from "react-bootstrap";
import {
    FaCalendarAlt,
    FaClock,
    FaEnvelope,
    FaMapMarkerAlt,
    FaPhone,
    FaTimes,
    FaTrophy,
    FaUser,
    FaVenusMars,
} from "react-icons/fa";

/* ─── design tokens ─────────────────────────────────────── */
const T = {
    primary: "#2563EB",
    bg: "#F8FAFC",
    border: "#E5E7EB",
    borderStrong: "#CBD5E1",
    text: "#0F172A",
    textMid: "#374151",
    textSub: "#64748B",
    textMuted: "#94A3B8",
    white: "#FFFFFF",
    shadow: "0 1px 3px rgba(0,0,0,.06)",
    radius: 14,
};

const SKILL_STYLES = {
    Beginner: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" },
    Intermediate: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A" },
    Advanced: { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA" },
    Professional: { bg: "#0F172A", color: "#F8FAFC", border: "#334155" },
};

/* ─── helpers ───────────────────────────────────────────── */
const initials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const formatDate = (val) => {
    if (!val) return "—";
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/* ─── primitives ────────────────────────────────────────── */
const Section = ({ title, children, action }) => (
    <div
        style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
            boxShadow: T.shadow,
            marginBottom: 16,
            overflow: "hidden",
        }}
    >
        <div
            style={{
                alignItems: "center",
                borderBottom: `1px solid ${T.border}`,
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 18px",
            }}
        >
            <span style={{ color: T.text, fontSize: 13, fontWeight: 700, letterSpacing: "0.01em" }}>
                {title}
            </span>
            {action}
        </div>
        <div style={{ padding: "14px 18px" }}>{children}</div>
    </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
    <div
        style={{
            alignItems: "center",
            borderBottom: `1px solid ${T.bg}`,
            display: "flex",
            gap: 10,
            padding: "8px 0",
        }}
    >
        <Icon size={13} color={T.textMuted} style={{ flexShrink: 0 }} />
        <span
            style={{
                color: T.textSub,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.04em",
                minWidth: 90,
                textTransform: "uppercase",
            }}
        >
            {label}
        </span>
        <span style={{ color: T.text, fontSize: 13, fontWeight: 600, wordBreak: "break-word" }}>
            {value || <span style={{ color: T.textMuted, fontWeight: 400 }}>—</span>}
        </span>
    </div>
);

const Stat = ({ label, value }) => (
    <div
        style={{
            background: T.white,
            border: `1px solid ${T.border}`,
            borderRadius: T.radius,
            boxShadow: T.shadow,
            flex: 1,
            minWidth: 0,
            padding: "14px 10px",
            textAlign: "center",
        }}
    >
        <div style={{ color: "#1E40AF", fontSize: 26, fontWeight: 700, lineHeight: 1 }}>
            {value ?? 0}
        </div>
        <div style={{ color: T.textSub, fontSize: 11, fontWeight: 500, marginTop: 5 }}>{label}</div>
    </div>
);

/* ─── scoreboard score renderer ─────────────────────────── */
const ScoreCell = ({ scoring }) => {
    if (!scoring) return <span style={{ color: T.textMuted, fontSize: 12 }}>—</span>;

    const { teamAScore, teamBScore, winner } = scoring;
    const hasScores = teamAScore != null || teamBScore != null;

    if (!hasScores && !winner) {
        return <span style={{ color: T.textMuted, fontSize: 12 }}>Not recorded</span>;
    }

    return (
        <div style={{ alignItems: "center", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {hasScores && (
                <span
                    style={{
                        background: T.bg,
                        border: `1px solid ${T.border}`,
                        borderRadius: 6,
                        color: T.text,
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "2px 10px",
                        whiteSpace: "nowrap",
                    }}
                >
                    {teamAScore ?? "—"} : {teamBScore ?? "—"}
                </span>
            )}
            {winner && (
                <span
                    style={{
                        background: "#ECFDF5",
                        border: "1px solid #A7F3D0",
                        borderRadius: 20,
                        color: "#065F46",
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        whiteSpace: "nowrap",
                    }}
                >
                    🏆 {winner}
                </span>
            )}
        </div>
    );
};

/* ─── main component ─────────────────────────────────────── */
const PlayerDetailsModal = ({ show, onHide, playerData }) => {
    if (!playerData) return null;

    const customer = playerData.customerId || {};
    const bookingSummary = playerData.bookingCountSummary || {};
    const clubBookings = playerData.clubBookingCounts || [];
    const scoreboard = playerData.playerScoreboard || [];
    const totalBookings = bookingSummary.totalBookingCount || 0;
    const onlineBookings = bookingSummary.onlineBookingCount || 0;
    const offlineBookings = bookingSummary.offlineBookingCount || 0;
    const skillStyle = SKILL_STYLES[playerData.skillLevel] || {
        bg: T.bg, color: T.textMid, border: T.borderStrong,
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered scrollable>
            {/* ── Header ── */}
            <Modal.Header style={{ background: "#1E40AF", borderBottom: "none", padding: "20px 24px" }}>
                <div style={{ alignItems: "center", display: "flex", gap: 14, width: "100%" }}>
                    {/* Avatar */}
                    <div
                        style={{
                            alignItems: "center",
                            background: "rgba(255,255,255,0.15)",
                            border: "1.5px solid rgba(255,255,255,0.25)",
                            borderRadius: "50%",
                            color: "#fff",
                            display: "flex",
                            flexShrink: 0,
                            fontSize: 17,
                            fontWeight: 700,
                            height: 50,
                            justifyContent: "center",
                            letterSpacing: "0.03em",
                            width: 50,
                        }}
                    >
                        {initials(customer.name)}
                    </div>

                    {/* Name + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#fff", fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>
                            {customer.name || "Unknown Player"}
                        </div>
                        <div
                            style={{
                                alignItems: "center",
                                color: "rgba(255,255,255,0.65)",
                                display: "flex",
                                flexWrap: "wrap",
                                fontSize: 12,
                                gap: "4px 10px",
                                marginTop: 5,
                            }}
                        >
                            {customer.gender && <span>{customer.gender}</span>}
                            {customer.gender && <span style={{ opacity: 0.4 }}>•</span>}
                            <span>{customer.countryCode || "+91"} {customer.phoneNumber || "—"}</span>
                            <span style={{ opacity: 0.4 }}>•</span>
                            {playerData.hasPreference
                                ? <span style={{ color: "#6EE7B7" }}>Preferences Saved</span>
                                : <span style={{ color: "#FCA5A5" }}>No Preferences</span>
                            }
                        </div>
                    </div>

                    {/* Skill badge */}
                    {playerData.skillLevel && (
                        <div
                            style={{
                                background: skillStyle.bg,
                                border: `1px solid ${skillStyle.border}`,
                                borderRadius: 8,
                                color: skillStyle.color,
                                flexShrink: 0,
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: "0.04em",
                                padding: "6px 14px",
                                textAlign: "center",
                                textTransform: "uppercase",
                            }}
                        >
                            {playerData.skillLevel}
                        </div>
                    )}

                    {/* Close */}
                    <button
                        type="button"
                        onClick={onHide}
                        aria-label="Close"
                        style={{
                            background: "rgba(255,255,255,0.12)",
                            border: "none",
                            borderRadius: 8,
                            color: "rgba(255,255,255,0.8)",
                            cursor: "pointer",
                            flexShrink: 0,
                            height: 30,
                            lineHeight: "30px",
                            padding: 0,
                            textAlign: "center",
                            width: 30,
                        }}
                    >
                        <FaTimes size={12} />
                    </button>
                </div>
            </Modal.Header>

            {/* ── Body ── */}
            <Modal.Body style={{ background: T.bg, height: "70vh", overflowY: "auto", padding: "20px 24px" }}>

                {/* Stats row */}
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    <Stat label="Total Bookings" value={totalBookings} />
                    <Stat label="Online" value={onlineBookings} />
                    <Stat label="Offline" value={offlineBookings} />
                    <Stat label="Matches Played" value={scoreboard.length} />
                </div>

                <Row className="g-3">
                    {/* ── Left column ── */}
                    {/* <Col xs={12} lg={clubBookings.length > 0 ? 6 : 12}>
                        <Section title="Personal Information">
                            <InfoRow icon={FaUser} label="Full Name" value={customer.name} />
                            <InfoRow icon={FaVenusMars} label="Gender" value={customer.gender} />
                            <InfoRow
                                icon={FaPhone}
                                label="Phone"
                                value={`${customer.countryCode || "+91"} ${customer.phoneNumber || ""}`}
                            />
                            <InfoRow icon={FaEnvelope} label="Email" value={customer.email} />
                            <InfoRow icon={FaMapMarkerAlt} label="Residence" value={customer.cityName || customer.city} />
                        </Section>
                    </Col> */}

                    {/* ── Right column — Bookings by Club ── */}
                    {clubBookings.length > 0 && (
                        <Col xs={12} lg={6}>
                            <Section title="Bookings by Club">
                                {clubBookings.map((entry, i) => {
                                    const pct = totalBookings > 0
                                        ? Math.round((entry.bookingCount / totalBookings) * 100)
                                        : 0;
                                    return (
                                        <div key={entry.clubId || i} style={{ marginBottom: i < clubBookings.length - 1 ? 14 : 0 }}>
                                            <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                                <span style={{ color: T.textMid, fontSize: 13, fontWeight: 600 }}>
                                                    {entry.clubName || "Unknown Club"}
                                                </span>
                                                <span style={{ color: T.textSub, fontSize: 12, fontWeight: 600 }}>
                                                    {entry.bookingCount} {entry.bookingCount === 1 ? "booking" : "bookings"}
                                                </span>
                                            </div>
                                            <ProgressBar
                                                now={pct}
                                                style={{ height: 5, borderRadius: 4, background: T.bg }}
                                                variant="primary"
                                            />
                                        </div>
                                    );
                                })}
                            </Section>
                        </Col>
                    )}
                </Row>

                {/* ── Match History table ── */}
                <Section
                    title="Match History"
                    action={
                        <span
                            style={{
                                background: T.bg,
                                border: `1px solid ${T.border}`,
                                borderRadius: 20,
                                color: T.textSub,
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "2px 9px",
                            }}
                        >
                            {scoreboard.length} {scoreboard.length === 1 ? "match" : "matches"}
                        </span>
                    }
                >
                    {scoreboard.length > 0 ? (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
                                <thead>
                                    <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                                        {["#", "Match Date", "Slot Time", "Club", "Score"].map((h) => (
                                            <th
                                                key={h}
                                                style={{
                                                    color: T.textSub,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    letterSpacing: "0.04em",
                                                    padding: "6px 12px",
                                                    textAlign: "left",
                                                    textTransform: "uppercase",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {scoreboard.map((match, i) => (
                                        <tr
                                            key={match.scoreboardId || match.openMatchId || i}
                                            style={{
                                                background: i % 2 === 0 ? T.white : T.bg,
                                                borderBottom: `1px solid ${T.border}`,
                                            }}
                                        >
                                            {/* # */}
                                            <td
                                                style={{
                                                    color: T.textMuted,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    padding: "10px 12px",
                                                    textAlign: "center",
                                                    whiteSpace: "nowrap",
                                                    width: 40,
                                                }}
                                            >
                                                {i + 1}
                                            </td>

                                            {/* Match Date */}
                                            <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                                                <div style={{ alignItems: "center", display: "flex", gap: 6 }}>
                                                    <FaCalendarAlt size={11} color={T.primary} />
                                                    <span style={{ color: T.textMid, fontWeight: 600 }}>
                                                        {formatDate(match.matchDate)}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Slot Time */}
                                            <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                                                <div style={{ alignItems: "center", display: "flex", gap: 6 }}>
                                                    <FaClock size={11} color={T.textMuted} />
                                                    <span style={{ color: T.textMid, fontWeight: 500 }}>
                                                        {match.slotTime || "—"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Club Name */}
                                            <td style={{ padding: "10px 12px" }}>
                                                <span style={{ color: T.text, fontWeight: 600 }}>
                                                    {match.clubName || "—"}
                                                </span>
                                            </td>

                                            {/* Scoring */}
                                            <td style={{ padding: "10px 12px" }}>
                                                <ScoreCell scoring={match.scoring} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div
                            style={{
                                border: `1px dashed ${T.borderStrong}`,
                                borderRadius: 10,
                                color: T.textMuted,
                                fontSize: 13,
                                padding: 16,
                                textAlign: "center",
                            }}
                        >
                            No match history available
                        </div>
                    )}
                </Section>
            </Modal.Body>

            {/* ── Footer ── */}
            {/* <Modal.Footer style={{ background: T.white, borderTop: `1px solid ${T.border}`, padding: "10px 20px" }}>
                <button
                    type="button"
                    onClick={onHide}
                    style={{
                        background: T.white,
                        border: `1px solid ${T.border}`,
                        borderRadius: 8,
                        color: T.textMid,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        padding: "7px 18px",
                    }}
                >
                    Close
                </button>
            </Modal.Footer> */}
        </Modal>
    );
};

export default PlayerDetailsModal;
