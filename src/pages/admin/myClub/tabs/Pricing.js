import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  InputGroup,
  FormControl,
  Dropdown,
} from "react-bootstrap";
import { getSlots, updatePrice } from "../../../../redux/thunks";
import { useDispatch, useSelector } from "react-redux";
import {
  ButtonLoading,
  DataLoading,
} from "../../../../helpers/loading/Loaders";
import { useNavigate } from "react-router-dom";
import { resetClub } from "../../../../redux/admin/club/slice";
import { showError, showInfo, showWarning } from "../../../../helpers/Toast";

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
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  padding: "10px",
  background: "#F9FAFB",
};

const Pricing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const selectAllChecked = useMemo(
    () => Object.values(formData.days).every(Boolean),
    [formData.days]
  );

  /** Convert slot time to 12-hour format */
  const convertTo12HourFormat = useCallback((time) => {
    const [hour, period] = time.split(" ");
    return `${
      hour === "12" ? "12" : period === "pm" ? parseInt(hour) + 12 : hour
    }:00 ${period.toUpperCase()}`;
  }, []);

  /** Initialize formData prices from API */
  console.log({ PricingData });
  useEffect(() => {
    if (
      PricingData.length &&
      PricingData[0]?.slot?.length &&
      formData.selectedSlots
    ) {
      const slotData = PricingData[0]?.slot[0]?.slotTimes || [];
      if (slotData.length) {
        setFormData((prev) => ({
          ...prev,
          prices: {
            ...prev.prices,
            [prev.selectedSlots]: slotData.reduce((acc, slot) => {
              acc[convertTo12HourFormat(slot.time)] =
                slot.amount?.toString() || "";
              return acc;
            }, {}),
          },
        }));
      }
    }
  }, [PricingData, formData.selectedSlots, convertTo12HourFormat]);

  /** Fetch slots when days/slots change */
  const selectedDays = Object.keys(formData.days).filter(
    (day) => formData.days[day]
  );
  const isAll = selectedDays.length === DAYS_OF_WEEK.length;
  useEffect(() => {
    if (!selectedDays.length || !registerId) return;

    dispatch(
      getSlots({
        register_club_id: registerId,
        day: isAll ? "" : selectedDays,
        time: isAll ? "" : formData.selectedSlots,
      })
    );
  }, [formData.days, registerId, formData.selectedSlots, dispatch]);

  /** Handlers */
  const updateForm = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleDayChange = (day) => {
    setFormData((prev) => ({
      ...prev,
      days: DAYS_OF_WEEK.reduce((acc, d) => {
        acc[d] = d === day;
        return acc;
      }, {}),
    }));
  };

  const handleSelectAllChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      days: DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = checked || day === "Monday";
        return acc;
      }, {}),
    }));
  };

  const handlePriceChange = (slotType, time, value) => {
    setFormData((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [slotType]: { ...prev.prices[slotType], [time]: value },
      },
    }));
  };

  const renderDays = () =>
    DAYS_OF_WEEK.map((day) => (
      <Form.Check
        key={day}
        type="checkbox"
        id={day}
        checked={formData.days[day]}
        onChange={() => handleDayChange(day)}
        className="mb-1 d-flex justify-content-between align-items-center"
      >
        <Form.Label
          style={{ fontSize: "16px", color: "#1F2937", fontWeight: 500 }}
        >
          {day}
        </Form.Label>
        <Form.Check.Input
          type="checkbox"
          checked={formData.days[day]}
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
      </Form.Check>
    ));

  /** Render time slots */
  const renderTimeSlots = () => {
    if (selectAllChecked) return renderAllSlots();

    const slots = formData.selectedSlots;
    const slotData = PricingData[0]?.slot?.[0]?.slotTimes || [];
    if (!slotData.length) return <div>No slots available</div>;

    return slotData.map((slot) => {
      const time12hr = convertTo12HourFormat(slot.time);
      return (
        <Row key={slot._id} className="align-items-center mb-2">
          <Col xs={9}>
            <FormControl
              readOnly
              value={time12hr}
              style={{ border: "none", background: "transparent" }}
            />
          </Col>
          <Col xs={3}>
            <InputGroup className="d-flex align-items-center">
              ₹
              <FormControl
                placeholder="Price"
                value={formData.prices[slots][time12hr] || ""}
                onChange={(e) =>
                  handlePriceChange(slots, time12hr, e.target.value)
                }
                style={{ border: "none", background: "transparent" }}
              />
            </InputGroup>
          </Col>
        </Row>
      );
    });
  };

  /** Render all slots price setter */
  const renderAllSlots = () => {
    const allTimes =
      PricingData?.[0]?.slot?.[0]?.slotTimes?.map((slot) => slot.time) || [];
    const selectedTimes = Object.keys(formData.prices.All).filter(
      (time) => formData.prices.All[time] !== undefined
    );

    // Check if all slots are selected
    const allSelected =
      allTimes.length > 0 && selectedTimes.length === allTimes.length;

    const getCommonPrice = () => {
      if (selectedTimes.length === 0) return "";
      const firstPrice = formData.prices.All[selectedTimes[0]];
      const allSame = selectedTimes.every(
        (time) => formData.prices.All[time] === firstPrice
      );
      return allSame ? firstPrice : "";
    };

    const toggleSlot = (time) => {
      setFormData((prev) => {
        const newPrices = { ...prev.prices.All };
        if (newPrices[time] === undefined) {
          newPrices[time] = getCommonPrice() || "";
        } else {
          delete newPrices[time];
        }
        return {
          ...prev,
          prices: {
            ...prev.prices,
            All: newPrices,
          },
        };
      });
    };

    const toggleAllSlots = () => {
      setFormData((prev) => {
        const newPrices = { ...prev.prices.All };

        if (!allSelected) {
          // Select all with current common price or empty
          const commonPrice = getCommonPrice() || "";
          allTimes.forEach((time) => {
            newPrices[time] = commonPrice;
          });
        } else {
          // Deselect all
          allTimes.forEach((time) => {
            delete newPrices[time];
          });
        }

        return {
          ...prev,
          prices: {
            ...prev.prices,
            All: newPrices,
          },
        };
      });
    };

    const updatePriceForAll = (price) => {
      setFormData((prev) => {
        const newPrices = { ...prev.prices.All };
        selectedTimes.forEach((time) => {
          newPrices[time] = price;
        });
        return {
          ...prev,
          prices: {
            ...prev.prices,
            All: newPrices,
          },
        };
      });
    };

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
            {selectedTimes.length} of {allTimes.length} slots selected
          </span>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {allTimes.map((time) => {
            const isSelected = formData.prices.All[time] !== undefined;
            return (
              <Button
                key={time}
                variant={isSelected ? "primary" : "outline-primary"}
                onClick={() => toggleSlot(time)}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  color: isSelected ? "#fff" : "#1F2937",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  backgroundColor: isSelected ? "#22C55E" : "#F9FAFB",
                }}
              >
                {time}
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
              placeholder={selectedTimes.length > 0 ? "Enter price" : ""}
              value={getCommonPrice()}
              onChange={(e) => updatePriceForAll(e.target.value)}
              disabled={selectedTimes.length === 0}
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

  /** Submit Handler */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.changesConfirmed) {
      showInfo("Please confirm that you have completed all changes.");
      return;
    }

    const selectedDays = selectAllChecked
      ? Object.keys(formData.days) // All days when "Select All" is checked
      : Object.keys(formData.days).filter((day) => formData.days[day]);
    console.log({ selectedDays });
    const selectedSlotType = selectAllChecked ? "All" : formData.selectedSlots;

    // Validate slot prices
    const slotPrices = formData.prices[selectedSlotType];
    if (!slotPrices || Object.keys(slotPrices).length === 0) {
      showWarning("No prices entered for the selected slot.");
      return;
    }

    // Extract slotTimes and businessHours from the new structure
    const allSlots = PricingData?.[0]?.slot || [];

    // Get slot data for selected days
    const selectedSlotData = selectAllChecked
      ? allSlots
      : allSlots.filter((slot) => {
          const slotDay = slot.businessHours?.[0]?.day;
          return slotDay && selectedDays.includes(slotDay);
        });

    // Get all slot times (flattened array when selectAllChecked)
    const slotData = selectAllChecked
      ? selectedSlotData.flatMap((slot) => slot.slotTimes || [])
      : selectedSlotData[0]?.slotTimes || [];

    // Get all business hours
    const businessHours = selectedSlotData.flatMap(
      (slot) => slot.businessHours || []
    );
    if (slotData.length === 0 || businessHours.length === 0) {
      showWarning("Slot times or business hours not found in response.");
      return;
    }

    // Normalize time function
    function normalizeTime(timeStr) {
      const match = timeStr.match(/(\d+)[\s:]*(am|pm)/i);
      if (!match) return null;
      const h = parseInt(match[1]);
      const ampm = match[2].toLowerCase();
      return `${h} ${ampm}`;
    }

    // Normalize slotPrices keys once
    const normalizedSlotPrices = {};
    for (const [key, price] of Object.entries(slotPrices)) {
      const normalizedKey = key
        .replace(/:\d{2}/, "")
        .trim()
        .toLowerCase();
      normalizedSlotPrices[normalizedKey] = price;
    }

    // Filter and map using normalized keys
    const filledSlotTimes = slotData
      .filter((slot) => {
        const key = normalizeTime(slot.time); // "6 am"
        const price = normalizedSlotPrices[key];
        return price != null && price.toString().trim() !== "";
      })
      .map((slot) => {
        const key = normalizeTime(slot.time);
        const price = parseFloat(normalizedSlotPrices[key]);
        return {
          _id: slot._id,
          amount: isNaN(price) ? 0 : price,
        };
      });

    // Get business hours - send all when "Select All" is checked
    const completeBusinessHours = selectedDays.map((day) => {
      const existing = businessHours.find((bh) => bh.day === day);
      if (!existing) {
        console.warn(`Missing business hours for ${day}`);
      }
      return (
        existing || {
          _id: day._id, // or generate a proper ID
          day,
          time: "06:00 AM - 11:00 PM", // default time
        }
      );
    });

    const selectedBusinessHours = completeBusinessHours.map((bh) => ({
      _id: bh._id,
      day: bh.day,
      time: bh.time,
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

    dispatch(updatePrice(payload))
      .unwrap()
      .then(() => {
        dispatch(resetClub());
        dispatch(
          getSlots({
            register_club_id: registerId,
            day: isAll ? "All" : selectedDays,
            time: isAll ? "" : formData.selectedSlots,
          })
        );
      })
      .catch((error) => {
        console.log("Price update failed:", error);
        showError("Failed to update prices. Please try again.");
      });
  };

  return (
    <div className="p-4">
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <div className="d-flex justify-content-between">
              <h5 style={{ fontWeight: 700, color: "#1F2937" }}>Set Price</h5>
              <Form.Check
                type="checkbox"
                checked={selectAllChecked}
                onChange={(e) => handleSelectAllChange(e.target.checked)}
                label="Select All"
              />
            </div>
            <div style={containerStyle}>{renderDays()}</div>
          </Col>

          <Col md={6}>
            {!selectAllChecked && (
              <Dropdown>
                <Dropdown.Toggle
                  variant="secondary"
                  style={{
                    backgroundColor: "#F9FAFB",
                    borderColor: "#E5E7EB",
                    borderRadius: "8px",
                    color: "#1F2937",
                    position: "absolute",
                    top: "-1em",
                    right: "0%",
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
            <h5 style={{ fontWeight: 700, color: "#1F2937" }}>
              {selectAllChecked ? "All" : formData.selectedSlots} slots
            </h5>
            <div style={containerStyle}>
              {clubLoading ? <DataLoading /> : renderTimeSlots()}
            </div>
          </Col>
        </Row>

        <Row className="mt-4">
          {/* <Col>
            <Form.Check
              type="checkbox"
              checked={formData.changesConfirmed}
              onChange={(e) => updateForm("changesConfirmed", e.target.checked)}
              label={
                <span>If done, click this before moving to other pages.</span>
              }
            />
          </Col> */}
        </Row>

        <div className="d-flex justify-content-end mt-4">
          <Button
            type="submit"
            style={{
              backgroundColor: "#22c55e",
              border: "none",
              borderRadius: "30px",
              padding: "10px 30px",
              fontWeight: 600,
            }}
            disabled={updateClubLoading}
          >
            {updateClubLoading ? <ButtonLoading /> : "Update"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Pricing;
