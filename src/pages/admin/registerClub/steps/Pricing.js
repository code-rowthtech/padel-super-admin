import { useEffect, useState } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  InputGroup,
  FormControl,
  Dropdown,
} from "react-bootstrap";
import { getSlots, updateCourt } from "../../../../redux/thunks";
import { useDispatch, useSelector } from "react-redux";
import {
  ButtonLoading,
  DataLoading,
} from "../../../../helpers/loading/Loaders";
import { useNavigate } from "react-router-dom";
import { resetClub } from "../../../../redux/admin/club/slice";
import { showError, showInfo, showWarning } from "../../../../helpers/Toast";

const Pricing = ({ setUpdateImage, onBack, onFinalSuccess }) => {
  const dispatch = useDispatch();
  const registerId = sessionStorage.getItem("registerId");
  const { clubLoading, clubData, updateClubLoading } = useSelector(
    (state) => state.club
  );
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    selectedSlots: "Morning",
    days: {
      Monday: true,
      Tuesday: false,
      Wednesday: false,
      Thursday: false,
      Friday: false,
      Saturday: false,
      Sunday: false,
    },
    prices: {
      Morning: {},
      Afternoon: {},
      Evening: {},
      All: {},
    },
  });

  const [selectAllChecked, setSelectAllChecked] = useState(false);

  // Helper: Convert time to minutes for sorting
  const convertTimeToMinutes = (timeStr) => {
    const match = timeStr.match(/(\d+)\s*(am|pm)/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const period = match[2].toLowerCase();
    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
    return hours * 60;
  };

  // Helper: Convert time to 12-hour format
  const convertTo12HourFormat = (time) => {
    if (!time) return "";
    let hour, minute, period;

    if (time.includes(":") && !time.toLowerCase().includes("am") && !time.toLowerCase().includes("pm")) {
      [hour, minute] = time.split(":").map(Number);
      period = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${period}`;
    }

    if (time.toLowerCase().includes("am") || time.toLowerCase().includes("pm")) {
      [hour, period] = time.split(" ");
      hour = parseInt(hour, 10);
      minute = "00";
      if (hour === 0) hour = 12;
      if (hour > 12) hour = hour % 12;
      return `${hour.toString().padStart(2, "0")}:${minute} ${period.toUpperCase()}`;
    }

    return time;
  };

  // Get slots for selected days (from fresh clubData)
  const getSelectedDaySlots = () => {
    const allSlots = clubData?.data?.[0]?.slot || [];
    const selectedDays = Object.keys(formData.days).filter((day) => formData.days[day]);

    if (selectAllChecked || selectedDays.length === 0) {
      return allSlots;
    }

    return allSlots.filter((slot) => {
      const day = slot.businessHours?.[0]?.day;
      return day && selectedDays.includes(day);
    });
  };

  // Initialize prices when data loads
  useEffect(() => {
    const selectedDaySlots = getSelectedDaySlots();
    const slotData = selectedDaySlots[0]?.slotTimes || [];

    if (slotData.length > 0 && formData.selectedSlots) {
      setFormData((prev) => {
        const newPrices = { ...prev.prices };
        newPrices[prev.selectedSlots] = {};

        slotData.forEach((slot) => {
          const time12hr = convertTo12HourFormat(slot.time);
          newPrices[prev.selectedSlots][time12hr] = slot.amount?.toString() || "";
        });

        return { ...prev, prices: newPrices };
      });
    }
  }, [clubData?.data, formData.selectedSlots, formData.days]);

  // Sync selectAllChecked
  useEffect(() => {
    const allSelected = Object.values(formData.days).every(Boolean);
    setSelectAllChecked(allSelected);
  }, [formData.days]);

  const handleDayChange = (day) => {
    const updatedDays = Object.keys(formData.days).reduce((acc, d) => {
      acc[d] = d === day;
      return acc;
    }, {});

    setFormData((prev) => ({ ...prev, days: updatedDays }));
    setSelectAllChecked(false);
  };

  const handleSelectAllChange = (e) => {
    const shouldSelectAll = e.target.checked;
    setSelectAllChecked(shouldSelectAll);

    const allDays = Object.keys(formData.days).reduce((acc, day) => {
      acc[day] = shouldSelectAll ? true : day === "Monday";
      return acc;
    }, {});

    setFormData((prev) => ({ ...prev, days: allDays }));
  };

  const handlePriceChange = (slotType, time, value) => {
    setFormData((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [slotType]: {
          ...prev.prices[slotType],
          [time]: value,
        },
      },
    }));
  };

  const handleSlotChange = (slotType) => {
    setFormData((prev) => ({ ...prev, selectedSlots: slotType }));
  };

  const renderDays = () => {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return (
      <div>
        {daysOfWeek.map((day) => (
          <Form.Check
            key={day}
            type="checkbox"
            id={day}
            checked={formData.days[day]}
            onChange={() => handleDayChange(day)}
            className="mb-1 d-flex justify-content-between align-items-center"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <Form.Label style={{ fontSize: "16px", color: "#1F2937", fontWeight: 500 }}>
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
                marginLeft: "auto",
              }}
            />
          </Form.Check>
        ))}
      </div>
    );
  };

  // Render slots for single day
  const renderTimeSlots = () => {
    if (selectAllChecked) return renderAllSlots();

    const selectedDaySlots = getSelectedDaySlots();
    if (selectedDaySlots.length === 0) return <div>No slots available</div>;

    const slotData = selectedDaySlots[0]?.slotTimes || [];
    const slots = formData.selectedSlots;

    return slotData.map((slot) => {
      const time12hr = convertTo12HourFormat(slot.time);
      return (
        <Row key={slot._id} className="align-items-center mb-2">
          <Col xs={9}>
            <FormControl
              readOnly
              value={time12hr}
              style={{
                height: "30px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                color: "#1F2937",
              }}
            />
          </Col>
          <Col xs={3}>
            <InputGroup>
              ₹
              <FormControl
                placeholder="Price"
                value={formData.prices[slots][time12hr] || ""}
                onChange={(e) => handlePriceChange(slots, time12hr, e.target.value)}
                style={{
                  height: "30px",
                  border: "none",
                  fontSize: "14px",
                  backgroundColor: "transparent",
                }}
              />
            </InputGroup>
          </Col>
        </Row>
      );
    });
  };

  // Render All slots (Select All)
  const renderAllSlots = () => {
    const selectedDaySlots = getSelectedDaySlots();
    const timeSet = new Set();

    selectedDaySlots.forEach((slotDay) => {
      slotDay.slotTimes?.forEach((slot) => {
        if (slot.time) timeSet.add(slot.time.trim());
      });
    });

    const allTimes = Array.from(timeSet).sort((a, b) => {
      return convertTimeToMinutes(a) - convertTimeToMinutes(b);
    });

    const selectedTimes = Object.keys(formData.prices.All).filter(
      (time) => formData.prices.All[time] !== undefined
    );

    const allSelected = allTimes.length > 0 && selectedTimes.length === allTimes.length;

    const getCommonPrice = () => {
      if (selectedTimes.length === 0) return "";
      const firstPrice = formData.prices.All[selectedTimes[0]];
      return selectedTimes.every((t) => formData.prices.All[t] === firstPrice) ? firstPrice : "";
    };

    const toggleSlot = (time) => {
      setFormData((prev) => {
        const newPrices = { ...prev.prices.All };
        if (newPrices[time] === undefined) {
          newPrices[time] = getCommonPrice() || "";
        } else {
          delete newPrices[time];
        }
        return { ...prev, prices: { ...prev.prices, All: newPrices } };
      });
    };

    const toggleAllSlots = () => {
      setFormData((prev) => {
        const newPrices = { ...prev.prices.All };
        const commonPrice = getCommonPrice() || "";
        if (!allSelected) {
          allTimes.forEach((t) => (newPrices[t] = commonPrice));
        } else {
          allTimes.forEach((t) => delete newPrices[t]);
        }
        return { ...prev, prices: { ...prev.prices, All: newPrices } };
      });
    };

    const updatePriceForAll = (price) => {
      setFormData((prev) => {
        const newPrices = { ...prev.prices.All };
        selectedTimes.forEach((t) => (newPrices[t] = price));
        return { ...prev, prices: { ...prev.prices, All: newPrices } };
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
            style={{ boxShadow: "none" }}
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
          <h5 style={{ fontWeight: 700, color: "#1F2937", marginBottom: "10px" }}>
            {selectedTimes.length > 0
              ? `Set Price for ${selectedTimes.length} slot${selectedTimes.length > 1 ? "s" : ""}`
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedDays = selectAllChecked
      ? Object.keys(formData.days)
      : Object.keys(formData.days).filter((day) => formData.days[day]);

    const selectedSlotType = selectAllChecked ? "All" : formData.selectedSlots;
    const slotPrices = formData.prices[selectedSlotType];

    if (!slotPrices || Object.keys(slotPrices).length === 0) {
      showWarning("No prices entered for the selected slot.");
      return;
    }

    const allSlots = clubData?.data?.[0]?.slot || [];
    const selectedSlotData = selectAllChecked
      ? allSlots
      : allSlots.filter((slot) => {
        const slotDay = slot.businessHours?.[0]?.day;
        return slotDay && selectedDays.includes(slotDay);
      });

    const slotData = selectAllChecked
      ? selectedSlotData.flatMap((slot) => slot.slotTimes || [])
      : selectedSlotData[0]?.slotTimes || [];

    const businessHours = selectedSlotData.flatMap((slot) => slot.businessHours || []);

    if (slotData.length === 0 || businessHours.length === 0) {
      showWarning("Slot times or business hours not found.");
      return;
    }

    const normalizeTime = (timeStr) => {
      const match = timeStr.match(/(\d+)[\s:]*(am|pm)/i);
      if (!match) return null;
      const h = parseInt(match[1]);
      const ampm = match[2].toLowerCase();
      return `${h} ${ampm}`;
    };

    const normalizedSlotPrices = {};
    for (const [key, price] of Object.entries(slotPrices)) {
      const normalizedKey = key.replace(/:\d{2}/, "").trim().toLowerCase();
      normalizedSlotPrices[normalizedKey] = price;
    }

    const filledSlotTimes = slotData
      .filter((slot) => {
        const key = normalizeTime(slot.time);
        const price = normalizedSlotPrices[key];
        return price != null && price.toString().trim() !== "";
      })
      .map((slot) => {
        const key = normalizeTime(slot.time);
        const price = parseFloat(normalizedSlotPrices[key]);
        return { _id: slot._id, amount: isNaN(price) ? 0 : price };
      });

    const completeBusinessHours = selectedDays.map((day) => {
      const existing = businessHours.find((bh) => bh.day === day);
      return (
        existing || {
          day,
          time: "06:00 AM - 11:00 PM",
        }
      );
    });

    const selectedBusinessHours = completeBusinessHours.map((bh) => ({
      _id: bh._id,
      day: bh.day,
      time: bh.time,
    }));

    const courtId = clubData?.data?.[0]?._id;
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
        onFinalSuccess();
        navigate("/admin/dashboard");
        sessionStorage.removeItem("registerId");
        localStorage.removeItem("clubFormData"); // ← CLEAR
        dispatch(resetClub());
      })
      .catch (() => {
  showError("Failed to update prices. Please try again.");
});
  };

// Fetch slots when days or slot type change
useEffect(() => {
  const selectedDays = Object.keys(formData.days).filter((day) => formData.days[day]);
  const isAllSelected = selectedDays.length === 7;
  const payloadDays = isAllSelected ? "" : selectedDays;

  if (selectedDays.length > 0 && registerId && formData.selectedSlots) {
    dispatch(
      getSlots({
        register_club_id: registerId,
        day: payloadDays,
        time: !isAllSelected ? formData.selectedSlots : "",
      })
    );
  }
}, [formData.days, registerId, formData.selectedSlots, dispatch]);

return (
  <div className="border-top p-4">
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <div className="d-flex justify-content-between">
            <h5 style={{ fontWeight: 700, color: "#1F2937", marginBottom: "10px" }}>
              Set Price
            </h5>
            <Form.Check
              type="checkbox"
              id="selectAll"
              checked={selectAllChecked}
              onChange={handleSelectAllChange}
              label="Select All"
              style={{ fontSize: "14px", color: "#1F2937", fontWeight: 500 }}
            />
          </div>
          <div
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "10px",
              background: "#F9FAFB",
            }}
          >
            {renderDays()}
          </div>
        </Col>
        <Col md={6}>
          {!selectAllChecked && (
            <Dropdown>
              <Dropdown.Toggle
                variant="secondary"
                id="slot-selector"
                style={{
                  backgroundColor: "#F9FAFB",
                  borderColor: "#E5E7EB",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "14px",
                  color: "#1F2937",
                  position: "absolute",
                  top: "-1em",
                  right: "0%",
                }}
              >
                {formData.selectedSlots} slots
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleSlotChange("Morning")}>
                  Morning slots
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleSlotChange("Afternoon")}>
                  Afternoon slots
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleSlotChange("Evening")}>
                  Evening slots
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}

          <h5 style={{ fontWeight: 700, color: "#1F2937", marginBottom: "10px" }}>
            {selectAllChecked ? "All" : formData.selectedSlots} slots
          </h5>
          <div
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "10px",
              background: "#F9FAFB",
            }}
          >
            {clubLoading ? <DataLoading /> : renderTimeSlots()}
          </div>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-4">
        <div>
          <Button
            type="button"
            onClick={() => {
              onBack();
              setUpdateImage(true);
            }}
            style={{
              backgroundColor: "#374151",
              border: "none",
              borderRadius: "30px",
              padding: "10px 30px",
              fontWeight: 600,
              fontSize: "16px",
              color: "#fff",
              marginRight: "10px",
            }}
          >
            Back
          </Button>
          <Button
            type="submit"
            style={{
              backgroundColor: "#22C55E",
              border: "none",
              borderRadius: "30px",
              padding: "10px 30px",
              fontWeight: 600,
              fontSize: "16px",
              color: "#fff",
            }}
            disabled={updateClubLoading}
          >
            {updateClubLoading ? <ButtonLoading color="white" /> : "Update"}
          </Button>
        </div>
      </div>
    </Form>
  </div>
);
};

export default Pricing;