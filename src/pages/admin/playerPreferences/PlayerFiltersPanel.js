import React, { useRef, useEffect } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";

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
            const target = event.target;
            if (!document.documentElement.contains(target)) return;
            if (panelRef.current && panelRef.current.contains(target)) return;
            if (anchorRef?.current && anchorRef.current.contains(target)) return;
            if (
                target.closest('[class*="menu"]') ||
                target.closest('[class*="-option"]') ||
                target.closest('[class*="indicatorContainer"]') ||
                target.closest('[class*="clearIndicator"]') ||
                target.closest('[class*="multiValue"]')
            ) return;
            if (target.closest('.MuiModal-root')) return;
            onHide();
        };

        if (show) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [show, onHide, anchorRef]);

    if (!show) return null;

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.gender?.length > 0) count++;
        if (filters.residence?.length > 0) count++;
        if (filters.skillLevel?.length > 0) count++;
        if (filters.clubId?.length > 0) count++;
        if (filters.day?.length > 0) count++;
        if (filters.timeSlot?.length > 0) count++;
        if (filters.hasPreference?.length > 0) count++;
        if (filters.preferredDuration?.length > 0) count++;
        return count;
    };

    const DURATION_OPTIONS = [
        { value: "is60", label: "60 min" },
        { value: "is90", label: "90 min" },
    ];

    return (
        <Card
            className="border border-muted shadow-lg"
            ref={panelRef}
            onMouseDown={(e) => e.stopPropagation()}
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
                        {getActiveFilterCount() > 0 && (
                            <span style={{
                                background: "#EF4444",
                                borderRadius: 10,
                                color: "#fff",
                                fontSize: 10,
                                fontWeight: 700,
                                marginLeft: 6,
                                padding: "1px 6px",
                            }}>
                                {getActiveFilterCount()}
                            </span>
                        )}
                    </div>
                    <Button variant="link" size="sm" onClick={onReset} style={{ fontFamily: "Poppins", fontSize: 12, padding: 0 }}>
                        Clear all
                    </Button>
                </div>
            </Card.Header>

            <Card.Body style={{ padding: 16 }}>
                <Form>
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

                    {/* Preferred Duration */}
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                            Preferred Duration
                        </Form.Label>
                        <div className="d-flex gap-3">
                            {DURATION_OPTIONS.map((opt) => {
                                const checked = (filters.preferredDuration || []).includes(opt.value);
                                return (
                                    <label
                                        key={opt.value}
                                        style={{
                                            alignItems: "center",
                                            background: checked ? "#EFF6FF" : "#F8FAFC",
                                            border: `1.5px solid ${checked ? "#2563EB" : "#E2E8F0"}`,
                                            borderRadius: 8,
                                            color: checked ? "#1D4ED8" : "#374151",
                                            cursor: "pointer",
                                            display: "flex",
                                            fontSize: 13,
                                            fontWeight: checked ? 600 : 400,
                                            gap: 8,
                                            padding: "7px 16px",
                                            transition: "all 0.12s",
                                            userSelect: "none",
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                                const current = filters.preferredDuration || [];
                                                const next = checked
                                                    ? current.filter((v) => v !== opt.value)
                                                    : [...current, opt.value];
                                                onFilterChange("preferredDuration", next);
                                            }}
                                            style={{ accentColor: "#2563EB", cursor: "pointer", height: 14, width: 14 }}
                                        />
                                        {opt.label}
                                    </label>
                                );
                            })}
                        </div>
                    </Form.Group>

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

                <Row>
                    <div className="col-12 mt-2 d-flex justify-content-end align-items-center py-2">
                        <Button
                            size="sm"
                            onClick={onHide}
                            className="text-white px-3 py-2"
                            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                            title="Close filters"
                        >
                            Close
                        </Button>
                    </div>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default PlayerFiltersPanel;
