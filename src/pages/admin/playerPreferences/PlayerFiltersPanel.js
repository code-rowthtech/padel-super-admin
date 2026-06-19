import React, { useRef, useEffect } from "react";
import { Badge, Button, Card, Col, Form, Row } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";

const PlayerFiltersPanel = ({
    show,
    onHide,
    filters,
    onFilterChange,
    onReset,
    clubOptions,
    residenceDropdownOptions,
    CheckboxMultiSelect,
    toSelectOptions,
    getMultiPlaceholder,
    TIME_SLOT_GROUPS,
    DAY_OPTIONS,
    SKILL_LEVEL_OPTIONS,
    GENDER_OPTIONS,
    anchorRef,
}) => {
    const panelRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(event.target) &&
                anchorRef?.current &&
                !anchorRef.current.contains(event.target)
            ) {
                onHide();
            }
        };

        if (show) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [show, onHide, anchorRef]);

    if (!show) return null;

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.gender?.length > 0) count++;
        if (filters.residence?.length > 0) count++;
        if (filters.skillLevel?.length > 0) count++;
        if (filters.clubId?.length > 0) count++;
        if (filters.day?.length > 0) count++;
        if (filters.timeSlot?.length > 0) count++;
        if (filters.hasPreference?.length > 0) count++;
        return count;
    };

    const activeCount = getActiveFilterCount();

    return (
        <Card
            className="border border-muted shadow-lg "
            ref={panelRef}
            style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 8,
                width: 550,
                maxWidth: "calc(100vw - 32px)",
                zIndex: 1050,
                maxHeight: "calc(100vh - 200px)",
                overflowY: "auto",
            }}
        >
            <Card.Header
                style={{
                    background: "#fff",
                    borderBottom: "1px solid #e0e0e0",
                    padding: "12px 16px",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                }}
            >
                <div className="d-flex justify-content-between align-items-center">
                    <div style={{ fontFamily: "Poppins", fontSize: 14, fontWeight: 600 }}>
                        Filters
                    </div>
                    <Button
                        variant="link"
                        size="sm"
                        onClick={onReset}
                        style={{
                            fontFamily: "Poppins",
                            fontSize: 12,
                            // textDecoration: "none",
                            // color: "#6c757d",
                            padding: 0,
                        }}
                    >
                        Clear all
                    </Button>
                </div>
            </Card.Header>
            <Card.Body style={{ padding: 16 }}>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                            Search Player
                        </Form.Label>
                        <Form.Control
                            size="sm"
                            placeholder="Name or phone number..."
                            value={filters.search}
                            onChange={(e) => onFilterChange("search", e.target.value)}
                            style={{ fontFamily: "Poppins", fontSize: 13 }}
                        />
                    </Form.Group>

                    <Row className="g-2">
                        <Col xs={6}>
                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                                    Gender
                                </Form.Label>
                                <CheckboxMultiSelect
                                    options={toSelectOptions(GENDER_OPTIONS)}
                                    value={filters.gender}
                                    onChange={(value) => onFilterChange("gender", value)}
                                    placeholder={getMultiPlaceholder("All", filters.gender)}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={6}>
                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                                    Skill Level
                                </Form.Label>
                                <CheckboxMultiSelect
                                    options={toSelectOptions(SKILL_LEVEL_OPTIONS)}
                                    value={filters.skillLevel}
                                    onChange={(value) => onFilterChange("skillLevel", value)}
                                    placeholder={getMultiPlaceholder("All", filters.skillLevel)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                            Residence
                        </Form.Label>
                        <CheckboxMultiSelect
                            options={residenceDropdownOptions}
                            value={filters.residence}
                            onChange={(value) => onFilterChange("residence", value)}
                            placeholder={getMultiPlaceholder("All Locations", filters.residence)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                            Club Preference
                        </Form.Label>
                        <CheckboxMultiSelect
                            options={clubOptions}
                            value={filters.clubId}
                            onChange={(value) => onFilterChange("clubId", value)}
                            placeholder={getMultiPlaceholder("All Clubs", filters.clubId)}
                        />
                    </Form.Group>

                    <Row className="g-2">
                        <Col xs={6}>
                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                                    Day
                                </Form.Label>
                                <CheckboxMultiSelect
                                    options={toSelectOptions(DAY_OPTIONS)}
                                    value={filters.day}
                                    onChange={(value) => onFilterChange("day", value)}
                                    placeholder={getMultiPlaceholder("Any", filters.day)}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={6}>
                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                                    Preferences
                                </Form.Label>
                                <CheckboxMultiSelect
                                    options={[
                                        { value: "yes", label: "Saved" },
                                        { value: "no", label: "Missing" },
                                    ]}
                                    value={filters.hasPreference}
                                    onChange={(value) => onFilterChange("hasPreference", value)}
                                    placeholder={getMultiPlaceholder("All", filters.hasPreference)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-0">
                        <Form.Label style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                            Time Slot
                        </Form.Label>
                        <CheckboxMultiSelect
                            options={TIME_SLOT_GROUPS}
                            value={filters.timeSlot}
                            onChange={(value) => onFilterChange("timeSlot", value)}
                            placeholder={getMultiPlaceholder("Any Time", filters.timeSlot)}
                        />
                    </Form.Group>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default PlayerFiltersPanel;

// Made with Bob
