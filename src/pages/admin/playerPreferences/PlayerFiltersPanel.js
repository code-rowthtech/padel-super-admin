import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
    const [panelStyle, setPanelStyle] = useState({});

    // Position the panel relative to the anchor button using fixed coordinates
    useEffect(() => {
        if (!show || !anchorRef?.current) return;

        const reposition = () => {
            const rect = anchorRef.current?.getBoundingClientRect();
            if (!rect) return;

            const panelWidth = 550;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let left = rect.right - panelWidth;
            if (left < 8) left = 8;
            if (left + panelWidth > viewportWidth - 8) left = viewportWidth - panelWidth - 8;

            const topBelow = rect.bottom + 8;
            const spaceBelow = viewportHeight - topBelow - 16;
            const maxHeight = Math.min(spaceBelow, viewportHeight - 200);

            setPanelStyle({
                position: "fixed",
                top: topBelow,
                left,
                width: panelWidth,
                maxWidth: `calc(100vw - 32px)`,
                zIndex: 1055,
                maxHeight: Math.max(maxHeight, 200),
            });
        };

        reposition();
        window.addEventListener("resize", reposition);
        window.addEventListener("scroll", reposition, true);
        return () => {
            window.removeEventListener("resize", reposition);
            window.removeEventListener("scroll", reposition, true);
        };
    }, [show, anchorRef]);

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
        return [
            filters.gender?.length || 0,
            filters.residence?.length || 0,
            filters.skillLevel?.length || 0,
            filters.clubId?.length || 0,
            filters.day?.length || 0,
            filters.timeSlot?.length || 0,
            filters.hasPreference?.length || 0,
            filters.preferredDuration?.length || 0,
            filters.isCalled !== null ? 1 : 0,
        ].reduce((a, b) => a + (b > 0 ? 1 : 0), 0);
    };

    const DURATION_OPTIONS = [
        { value: "is60", label: "60 min" },
        { value: "is90", label: "90 min" },
        { value: "is120", label: "120 min" },
    ];

    return createPortal(
        <Card
            className="border border-muted shadow-lg"
            ref={panelRef}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
                ...panelStyle,
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
                            placeholder={getMultiPlaceholder("All States", filters.residence)}
                        />
                    </Form.Group>
                    {/* Club Preference */}
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
                    {/* Intro Call */}
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontFamily: "Poppins", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                            Intro Call
                        </Form.Label>
                        <Form.Select
                            value={filters.isCalled === null ? "all" : filters.isCalled ? "yes" : "no"}
                            onChange={(e) => {
                                const val = e.target.value;
                                const newVal = val === "all" ? null : val === "yes";
                                onFilterChange("isCalled", newVal);
                            }}
                        >
                            <option value="all">All</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </Form.Select>
                    </Form.Group>
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
                    {/* Time Slot */}
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
                        >
                            Close
                        </Button>
                    </div>
                </Row>
            </Card.Body>
        </Card>,
        document.body
    );
};

export default PlayerFiltersPanel;
