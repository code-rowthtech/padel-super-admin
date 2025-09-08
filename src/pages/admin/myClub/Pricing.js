import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  InputGroup,
  FormControl,
  Dropdown,
} from "react-bootstrap";
import { getSlots, updateCourt } from "../../../redux/thunks";
import { useDispatch, useSelector } from "react-redux";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import { resetClub } from "../../../redux/admin/club/slice";
import { showError, showInfo, showWarning } from "../../../helpers/Toast";
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const containerStyle = {
  // border: "1px solid #E5E7EB",
  borderRadius: "8px",
  padding: "3px 10px",
  // background: "#F9FAFB",
};
/** -------- Time helpers (consistent normalization & display) -------- */
/** Normalize any time string to key form: "h am" / "h pm" */
function normalizeTimeKey(timeStr) {
  if (!timeStr) return null;
  const s = String(timeStr).trim();
  // Case: "6 AM", "06:00 am", "6am", "06am", "06:00AM"
  const ampm = s.match(/(\d{1,2})(?::\d{2})?\s*([aApP][mM])/);
  if (ampm) {
    const h = Math.max(1, Math.min(12, parseInt(ampm[1], 10) || 12));
    return `${h} ${ampm[2].toLowerCase()}`; // "6 am"
  }
  // Case: "13:30" or "09:00"
  const hhmm = s.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    let h = parseInt(hhmm[1], 10);
    const period = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return `${h} ${period}`;
  }
  // Last resort: a bare number like "6" -> assume AM
  const hBare = s.match(/^(\d{1,2})$/);
  if (hBare) {
    const h = Math.max(1, Math.min(12, parseInt(hBare[1], 10) || 12));
    return `${h} am`;
  }
  return null;
}
/** Convert to "hh:mm AM/PM" for display */
function formatTo12HourDisplay(time) {
  if (!time) return "";
  const s = String(time).trim();
  // Already includes AM/PM (with or without minutes)
  const ampm = s.match(/(\d{1,2})(?::(\d{2}))?\s*([aApP][mM])/);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = ampm[2] || "00";
    const p = ampm[3].toUpperCase();
    if (h === 0) h = 12;
    if (h > 12) h = h % 12;
    return `${String(h).padStart(2, "0")}:${m} ${p}`;
  }
  // 24-hour "HH:MM"
  const hhmm = s.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    let h = parseInt(hhmm[1], 10);
    const m = hhmm[2];
    const p = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:${m} ${p}`;
  }
  // Bare hour
  const hBare = s.match(/^(\d{1,2})$/);
  if (hBare) {
    let h = parseInt(hBare[1], 10);
    const p = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:00 ${p}`;
  }
  return s; // fallback (unrecognized)
}

function to24hMinutes(time) {
  const display = formatTo12HourDisplay(time);
  if (!display) return 0;
  const [hm, p] = display.split(" ");
  const [h, m] = hm.split(":").map(Number);
  let hours = h;
  if (p === "PM" && h < 12) hours += 12;
  if (p === "AM" && h === 12) hours = 0;
  return hours * 60 + (m || 0);
}

const Pricing = ({ hitApi, setHitUpdateApi }) => {
  const dispatch = useDispatch();
  const { ownerClubData } = useSelector((state) => state.manualBooking);
  const registerId = ownerClubData?.[0]?._id || "";
  const { updateClubLoading, clubLoading, clubData } = useSelector(
    (state) => state.club
  );
  const PricingData = clubData?.data || [];
  const [formData, setFormData] = useState({
    selectedSlots: "Morning",
    days: DAYS_OF_WEEK.reduce((acc, day, idx) => {
      acc[day] = idx === 0; // Monday selected by default
      return acc;
    }, {}),
    prices: { Morning: {}, Afternoon: {}, Evening: {}, All: {} },
    changesConfirmed: true,
  });
  const [hasPriceChanges, setHasPriceChanges] = useState(false);
  const selectAllChecked = useMemo(
    () => Object.values(formData.days).every(Boolean),
    [formData.days]
  );
  /** Initialize formData prices from API for the selected slot type */
  useEffect(() => {
    if (
      PricingData.length &&
      PricingData[0]?.slot?.length &&
      formData.selectedSlots
    ) {
      const slotTimes = PricingData[0]?.slot?.[0]?.slotTimes || [];
      if (slotTimes.length) {
        setFormData((prev) => ({
          ...prev,
          prices: {
            ...prev.prices,
            [prev.selectedSlots]: slotTimes.reduce((acc, slot) => {
              // Store keys using display format for UI (we normalize later for matching)
              const display = formatTo12HourDisplay(slot?.time);
              acc[display] = slot?.amount?.toString() || "";
              return acc;
            }, {}),
          },
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PricingData, formData.selectedSlots]);
  /** Fetch slots when days/slot-type change */
  const selectedDaysList = useMemo(
    () => Object.keys(formData.days).filter((d) => formData.days[d]),
    [formData.days]
  );
  const isAllDays = selectedDaysList.length === DAYS_OF_WEEK.length;
  useEffect(() => {
    if (!selectedDaysList.length || !registerId) return;
    dispatch(
      getSlots({
        register_club_id: registerId,
        day: isAllDays ? "" : selectedDaysList,
        time: isAllDays ? "" : formData.selectedSlots,
      })
    );
  }, [
    dispatch,
    formData.selectedSlots,
    isAllDays,
    registerId,
    selectedDaysList,
  ]);
  /** Handlers */
  const updateForm = useCallback(
    (field, value) => setFormData((prev) => ({ ...prev, [field]: value })),
    []
  );
  const handleDayChange = useCallback((day) => {
    // Select one day exclusively
    setFormData((prev) => ({
      ...prev,
      days: DAYS_OF_WEEK.reduce((acc, d) => {
        acc[d] = d === day;
        return acc;
      }, {}),
    }));
  }, []);
  const handleSelectAllChange = useCallback((checked) => {
    setFormData((prev) => ({
      ...prev,
      days: DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = checked || day === "Monday";
        return acc;
      }, {}),
    }));
  }, []);
  const handlePriceChange = useCallback((slotType, timeKey, value) => {
    setFormData((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [slotType]: { ...prev.prices[slotType], [timeKey]: value },
      },
    }));
    setHasPriceChanges(true);
  }, []);
  const renderDays = () =>
    DAYS_OF_WEEK.map((day) => (
      <Form.Check
        key={day}
        type="checkbox"
        id={`day-${day}`}
        className="mb-3 d-flex justify-content-between align-items-center"
      >
        <div className="d-flex align-items-center w-100">
          <Form.Check.Input
            id={`day-${day}`}
            type="checkbox"
            checked={!!formData.days[day]}
            onChange={() => handleDayChange(day)}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "4px",
              border: "2px solid #1F2937",
              backgroundColor: formData.days[day] ? "#1F2937" : "transparent",
              cursor: "pointer",
            }}
          />
          <label
            htmlFor={`day-${day}`}
            className="d-block d-md-none ms-2 mb-0"
            style={{
              fontSize: "14px",
              color: "#1F2937",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {day}
          </label>
        </div>
      </Form.Check>
    ));
  /** Render time slots for current slot type (Morning/Afternoon/Evening) */
  const renderTimeSlots = () => {
    if (selectAllChecked) return renderAllSlots();
    const slotType = formData.selectedSlots;
    const slotData = PricingData?.[0]?.slot?.[0]?.slotTimes || [];
    if (!slotData.length) return <div>No slots available</div>;
    return slotData.map((slot) => {
      const display = formatTo12HourDisplay(slot?.time);
      const key = slot?._id || `${display}-${slot?.time}`;
      const value = formData.prices[slotType]?.[display] ?? "";
      const invalid =
        !value || parseFloat(value) <= 0 || isNaN(parseFloat(value));
      return (
        <Row key={key} className="align-items-center mb-2">
          <Col xs={6}>
            <FormControl
              readOnly
              value={display}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                boxShadow: "none",
                cursor: "default",
              }}
            />
          </Col>
          <Col xs={6}>
            <InputGroup className="d-flex align-items-center">
              <span className="me-1">₹</span>
              <FormControl
                type="number"
                min="1"
                placeholder="Price"
                value={value}
                onChange={(e) =>
                  handlePriceChange(slotType, display, e.target.value)
                }
                isInvalid={invalid}
                style={{ background: "transparent" }}
              />
            </InputGroup>
          </Col>
        </Row>
      );
    });
  };
  /** Select-many: set prices for multiple chosen slot times across all days */
  const renderAllSlots = () => {
    let allTimesRaw = Array.from(
      new Set(
        PricingData?.[0]?.slot?.flatMap((s) =>
          (s.slotTimes || []).map((st) => st.time)
        ) || []
      )
    ).sort((a, b) => to24hMinutes(a) - to24hMinutes(b));
    const selectedTimes = Object.keys(formData.prices.All || {}).filter(
      (t) => formData.prices.All[t] !== undefined
    );
    const allSelected =
      allTimesRaw.length > 0 && selectedTimes.length === allTimesRaw.length;
    const getCommonPrice = () => {
      if (selectedTimes.length === 0) return "";
      const first = formData.prices.All[selectedTimes[0]];
      const same = selectedTimes.every((t) => formData.prices.All[t] === first);
      return same ? first : "";
    };
    const toggleSlot = (timeRaw) => {
      const display = formatTo12HourDisplay(timeRaw);
      setFormData((prev) => {
        const newPrices = { ...(prev.prices.All || {}) };
        if (newPrices[display] === undefined) {
          newPrices[display] = getCommonPrice() || "";
        } else {
          delete newPrices[display];
        }
        return {
          ...prev,
          prices: { ...prev.prices, All: newPrices },
        };
      });
    };
    const toggleAllSlots = () => {
      setFormData((prev) => {
        const newPrices = { ...(prev.prices.All || {}) };
        if (!allSelected) {
          const common = getCommonPrice() || "";
          allTimesRaw.forEach((t) => {
            const display = formatTo12HourDisplay(t);
            newPrices[display] = common;
          });
        } else {
          allTimesRaw.forEach((t) => {
            const display = formatTo12HourDisplay(t);
            delete newPrices[display];
          });
        }
        return {
          ...prev,
          prices: { ...prev.prices, All: newPrices },
        };
      });
    };
    const updatePriceForAll = (price) => {
      setFormData((prev) => {
        const newPrices = { ...(prev.prices.All || {}) };
        selectedTimes.forEach((t) => {
          newPrices[t] = price;
        });
        return {
          ...prev,
          prices: { ...prev.prices, All: newPrices },
        };
      });
      setHasPriceChanges(true);
    };
    const common = getCommonPrice();
    const commonInvalid =
      selectedTimes.length > 0 &&
      (!common ||
        common === "" ||
        parseFloat(common) <= 0 ||
        isNaN(parseFloat(common)));
    return (
      <div>
        <div className="d-flex align-items-center mb-3">
          <Form.Check
            type="checkbox"
            id="select-all-slots"
            label="Select All"
            checked={allSelected}
            onChange={toggleAllSlots}
            className="me-2"
          />
          <span className="text-muted small">
            {selectedTimes.length} of {allTimesRaw.length} slots selected
          </span>
        </div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {allTimesRaw.map((timeRaw) => {
            const display = formatTo12HourDisplay(timeRaw);
            const isSelected = formData.prices.All?.[display] !== undefined;
            const price = formData.prices.All?.[display];
            const invalid =
              isSelected &&
              (!price || parseFloat(price) <= 0 || isNaN(parseFloat(price)));
            return (
              <Button
                key={timeRaw}
                variant={isSelected ? "primary" : "outline-primary"}
                onClick={() => toggleSlot(timeRaw)}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  color: isSelected ? "#fff" : "#1F2937",
                  borderRadius: "8px",
                  border: `1px solid ${invalid ? "red" : "#E5E7EB"}`,
                  backgroundColor: isSelected ? "#22C55E" : "#F9FAFB",
                }}
              >
                {display}
              </Button>
            );
          })}
        </div>
        <div className="mt-3">
          <h5
            style={{
              fontWeight: 700,
              color: "#1F2937",
              marginBottom: "10px",
            }}
          >
            {selectedTimes.length > 0
              ? `Set Price for ${selectedTimes.length} slot${
                  selectedTimes.length > 1 ? "s" : ""
                }`
              : "Set Price (select slots first)"}
          </h5>
          <InputGroup>
            <FormControl
              type="number"
              min="1"
              placeholder={selectedTimes.length > 0 ? "Enter price" : ""}
              value={common}
              onChange={(e) => updatePriceForAll(e.target.value)}
              disabled={selectedTimes.length === 0}
              isInvalid={commonInvalid}
              style={{
                height: "40px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                fontSize: "14px",
                backgroundColor: "#fff",
              }}
            />
          </InputGroup>
        </div>
      </div>
    );
  };
  /** Submit Handler (same flow, but safer normalization & params) */
  const handleSubmit = () => {
    if (!formData.changesConfirmed) {
      showInfo("Please confirm that you have completed all changes.");
      return;
    }
    const chosenDays = selectAllChecked
      ? DAYS_OF_WEEK
      : Object.keys(formData.days).filter((day) => formData.days[day]);
    const selectedSlotType = selectAllChecked ? "All" : formData.selectedSlots;
    // Validate slot prices
    const slotPrices = formData.prices[selectedSlotType];
    if (!slotPrices || Object.keys(slotPrices).length === 0) {
      if (selectAllChecked) {
        showWarning("No slots selected to update prices.");
      } else {
        showWarning("No prices entered for the selected slot.");
      }
      return;
    }
    const allSlots = PricingData?.[0]?.slot || [];
    // Pick slots for chosen days (or all)
    const selectedSlotData = allSlots.filter((slot) => {
      const slotDay = slot?.businessHours?.[0]?.day;
      return slotDay && chosenDays.includes(slotDay);
    });
    const slotTimes = selectedSlotData.flatMap((slot) => slot?.slotTimes || []);
    const businessHours = selectedSlotData.flatMap(
      (slot) => slot?.businessHours || []
    );
    if (!slotTimes.length || !businessHours.length) {
      showWarning("Slot times or business hours not found in response.");
      return;
    }
    // For validation: determine targeted slotTimes
    const selectedDisplayTimes = Object.keys(slotPrices);
    const targetedSlotTimes = selectAllChecked
      ? slotTimes.filter((slot) =>
          selectedDisplayTimes.includes(formatTo12HourDisplay(slot.time))
        )
      : slotTimes;
    if (targetedSlotTimes.length === 0) {
      showWarning("No targeted slots to update.");
      return;
    }
    // Build normalized price lookup: "h am/pm" -> price
    const normalizedPrices = {};
    for (const [displayKey, price] of Object.entries(slotPrices)) {
      const key = normalizeTimeKey(displayKey); // "6 am"
      if (key) normalizedPrices[key] = price;
    }
    // Filter & map slot times that have a price
    const filledSlotTimes = targetedSlotTimes
      .map((slot) => {
        const norm = normalizeTimeKey(slot?.time); // "6 am"
        if (!norm) return null;
        const price = normalizedPrices[norm];
        if (price == null || String(price).trim() === "") return null;
        const amount = parseFloat(price);
        if (Number.isNaN(amount) || amount <= 0) return null;
        return {
          _id: slot?._id,
          amount,
        };
      })
      .filter(Boolean);
    if (filledSlotTimes.length !== targetedSlotTimes.length) {
      showWarning("All targeted prices must be filled and greater than 0.");
      return;
    }
    // Keep existing business hours (for selected days), fallback with minimal safe shape
    const completeBusinessHours = chosenDays.map((dayName) => {
      const existing = businessHours.find((bh) => bh?.day === dayName);
      return (
        existing || {
          // _id may be undefined if it doesn't exist; backend should handle
          day: dayName,
          time: "06:00 AM - 11:00 PM",
        }
      );
    });
    const selectedBusinessHours = completeBusinessHours.map((bh) => ({
      _id: bh?._id,
      day: bh?.day,
      time: bh?.time,
    }));
    const courtId = PricingData?.[0]?._id;
    if (!courtId) {
      showWarning("Court ID is missing.");
      return;
    }
    const payload = {
      _id: courtId,
      businessHoursUpdates: selectedBusinessHours,
      slotTimesUpdates: filledSlotTimes,
    };
    dispatch(updateCourt(payload))
      .unwrap()
      .then(() => {
        dispatch(resetClub());
        dispatch(
          getSlots({
            register_club_id: registerId,
            day: isAllDays ? "" : selectedDaysList,
            time: isAllDays ? "" : formData.selectedSlots,
          })
        );
        setHasPriceChanges(false);
      })
      .catch((error) => {
        showError("Failed to update prices. Please try again.");
      });
  };
  useEffect(() => {
    if (hitApi) {
      if (hasPriceChanges) {
        handleSubmit();
      }
      setHitUpdateApi(false);
    }
  }, [hitApi, hasPriceChanges]);
  return (
    <div className="py-3">
      <Row>
        <Col xs={12} md={2}>
          <div style={containerStyle} className="mb-3 mb-md-0">{renderDays()}</div>
        </Col>
        <Col xs={12} md={8} className="position-relative">
          <div className="d-flex justify-content-end align-items-center">
            {/* <Form.Check
              type="checkbox"
              checked={selectAllChecked}
              onChange={(e) => handleSelectAllChange(e.target.checked)}
              label="Select All"
              style={{
                position: "absolute",
                top: "-2em",
                right: "18.5em",
              }}
            /> */}
            <Form.Check
              type="checkbox"
              className="d-none d-md-flex justify-content-between align-items-center"
              style={{
                position: "absolute",
                top: "-3em",
                right: "18.5em",
              }}
              id="all-days"
            >
              <Form.Check.Input
                type="checkbox"
                checked={selectAllChecked}
                id="all-days"
                onChange={(e) => handleSelectAllChange(e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  border: "2px solid #1F2937",
                  backgroundColor: selectAllChecked ? "#1F2937" : "transparent",
                  cursor: "pointer",
                }}
              />
              <label
                htmlFor="all-days"
                className="mt-2 ms-2"
                style={{
                  fontSize: "16px",
                  color: "#1F2937",
                  fontWeight: 500,
                }}
              >
                Select All
              </label>
            </Form.Check>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3 d-md-none">
              <Form.Check
                type="checkbox"
                className="d-flex align-items-center"
                id="all-days-mobile"
              >
                <Form.Check.Input
                  type="checkbox"
                  checked={selectAllChecked}
                  id="all-days-mobile"
                  onChange={(e) => handleSelectAllChange(e.target.checked)}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    border: "2px solid #1F2937",
                    backgroundColor: selectAllChecked ? "#1F2937" : "transparent",
                    cursor: "pointer",
                  }}
                />
                <label
                  htmlFor="all-days-mobile"
                  className="ms-2 mb-0"
                  style={{
                    fontSize: "14px",
                    color: "#1F2937",
                    fontWeight: 500,
                  }}
                >
                  Select All
                </label>
              </Form.Check>
              
              <Dropdown>
                <Dropdown.Toggle
                  variant="secondary"
                  size="sm"
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderColor: "#E5E7EB",
                    borderRadius: "8px",
                    color: "#1F2937",
                    fontSize: "12px"
                  }}
                >
                  {formData.selectedSlots}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {["Morning", "Afternoon", "Evening"].map((slot) => (
                    <Dropdown.Item
                      key={slot}
                      onClick={() => updateForm("selectedSlots", slot)}
                      style={{ fontSize: "12px" }}
                    >
                      {slot} slots
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
          </div>
            
          {!selectAllChecked && (
            <Dropdown className="d-none d-md-block">
              <Dropdown.Toggle
                variant="secondary"
                style={{
                  backgroundColor: "#F9FAFB",
                  borderColor: "#E5E7EB",
                  borderRadius: "8px",
                  color: "#1F2937",
                  position: "absolute",
                  top: "-3em",
                  right: "1em",
                }}
              >
                {formData.selectedSlots} slots
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {["Morning", "Afternoon", "Evening"].map((slot) => (
                  <Dropdown.Item
                    key={slot}
                    onClick={() => updateForm("selectedSlots", slot)}
                  >
                    {slot} slots
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          )}
          {/* <h5 style={{ fontWeight: 700, color: "#1F2937" }}>
            {selectAllChecked ? "All" : formData.selectedSlots} slots
          </h5> */}
          <div style={containerStyle}>
            {clubLoading ? <DataLoading height="20vh" /> : renderTimeSlots()}
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default Pricing;
