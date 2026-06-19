import React from "react";
import { Badge, Modal, Row, Col } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";

const SKILL_COLORS = {
    Beginner: "success",
    Intermediate: "warning",
    Advanced: "danger",
    Professional: "dark"
};

const PlayerDetailsModal = ({ show, onHide, playerData }) => {
    if (!playerData) return null;

    const formatScheduleDetails = (preferredSchedule = []) => {
        if (!preferredSchedule || preferredSchedule.length === 0) {
            return <span className="text-muted">No schedule set</span>;
        }

        return (
            <div className="d-flex flex-column gap-2">
                {preferredSchedule.map((entry, index) => {
                    const timeSlots = entry.timeSlots || [];
                    const timeRange = timeSlots.length > 0
                        ? timeSlots.map(slot => {
                            if (typeof slot === 'string') return slot;
                            return slot.label || slot.value || '';
                        }).filter(Boolean).join(", ")
                        : "No time slots";

                    return (
                        <div key={index} className="border-bottom pb-2">
                            <div className="fw-semibold text-primary" style={{ fontSize: 13 }}>
                                {entry.day}
                            </div>
                            <div className="text-muted" style={{ fontSize: 12 }}>
                                {timeRange}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const customer = playerData.customerId || {};
    const preferredClubs = (playerData.preferredClubs || [])
        .map((club) => club.clubName || club.name)
        .filter(Boolean)
        .join(", ") || "No clubs selected";

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header className="border-0 pb-0">
                <Modal.Title style={{ fontSize: 18, fontWeight: 600 }}>
                    Player Details
                </Modal.Title>
                <button
                    type="button"
                    className="btn-close"
                    onClick={onHide}
                    aria-label="Close"
                />
            </Modal.Header>
            <Modal.Body className="pt-2">
                <Row className="g-3">
                    {/* Player Information Section */}
                    <Col xs={12}>
                        <div className="bg-light rounded p-3">
                            <h6 className="text-primary mb-3" style={{ fontSize: 14, fontWeight: 600 }}>
                                Personal Information
                            </h6>
                            <Row className="g-2">
                                <Col xs={12} md={6}>
                                    <div className="mb-2">
                                        <small className="text-muted d-block" style={{ fontSize: 11 }}>Name</small>
                                        <div className="fw-semibold" style={{ fontSize: 13 }}>
                                            {customer.name || "N/A"} {customer.lastName || ""}
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} md={6}>
                                    <div className="mb-2">
                                        <small className="text-muted d-block" style={{ fontSize: 11 }}>Phone Number</small>
                                        <div className="fw-semibold" style={{ fontSize: 13 }}>
                                            {customer.countryCode || "+91"} {customer.phoneNumber || "N/A"}
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} md={6}>
                                    <div className="mb-2">
                                        <small className="text-muted d-block" style={{ fontSize: 11 }}>Email</small>
                                        <div className="fw-semibold" style={{ fontSize: 13 }}>
                                            {customer.email || "N/A"}
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} md={6}>
                                    <div className="mb-2">
                                        <small className="text-muted d-block" style={{ fontSize: 11 }}>Gender</small>
                                        <div>
                                            {customer.gender ? (
                                                <Badge bg="light" text="dark" className="border">
                                                    {customer.gender}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted">N/A</span>
                                            )}
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} md={6}>
                                    <div className="mb-2">
                                        <small className="text-muted d-block" style={{ fontSize: 11 }}>Residence</small>
                                        <div className="fw-semibold" style={{ fontSize: 13 }}>
                                            {customer.city || "N/A"}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>

                    {/* Preferences Section */}
                    <Col xs={12}>
                        <div className="bg-light rounded p-3">
                            <h6 className="text-primary mb-3" style={{ fontSize: 14, fontWeight: 600 }}>
                                Player Preferences
                            </h6>
                            <Row className="g-2">
                                <Col xs={12} md={6}>
                                    <div className="mb-2">
                                        <small className="text-muted d-block" style={{ fontSize: 11 }}>Skill Level</small>
                                        <div>
                                            {playerData.skillLevel ? (
                                                <Badge bg={SKILL_COLORS[playerData.skillLevel] || "secondary"}>
                                                    {playerData.skillLevel}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted">Not set</span>
                                            )}
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} md={6}>
                                    <div className="mb-2">
                                        <small className="text-muted d-block" style={{ fontSize: 11 }}>Player Tendency</small>
                                        <div className="fw-semibold" style={{ fontSize: 13 }}>
                                            {playerData.playerTendency || <span className="text-muted">N/A</span>}
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12}>
                                    <div className="mb-2">
                                        <small className="text-muted d-block" style={{ fontSize: 11 }}>Preferred Clubs</small>
                                        <div className="fw-semibold" style={{ fontSize: 13 }}>
                                            {preferredClubs}
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12}>
                                    <div className="mb-2">
                                        <small className="text-muted d-block" style={{ fontSize: 11 }}>Notes</small>
                                        <div className="fw-semibold" style={{ fontSize: 13 }}>
                                            {playerData.notes || <span className="text-muted">No notes</span>}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>

                    {/* Schedule Section */}
                    <Col xs={12}>
                        <div className="bg-light rounded p-3">
                            <h6 className="text-primary mb-3" style={{ fontSize: 14, fontWeight: 600 }}>
                                Preferred Schedule
                            </h6>
                            <div style={{ maxHeight: 300, overflowY: "auto" }}>
                                {formatScheduleDetails(playerData.preferredSchedule)}
                            </div>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer className="border-0">
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={onHide}
                >
                    <FaTimes size={12} className="me-1" />
                    Close
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default PlayerDetailsModal;

// Made with Bob
