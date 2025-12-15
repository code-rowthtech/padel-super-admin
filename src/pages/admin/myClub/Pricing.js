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
import { IoChevronDown } from "react-icons/io5";
import { getSlots, updateCourt } from "../../../redux/thunks";
import { useDispatch, useSelector } from "react-redux";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import { resetClub } from "../../../redux/admin/club/slice";
import { showError, showInfo, showWarning } from "../../../helpers/Toast";
import SlotDetailsModal from "./SlotDetailsModal";
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
  borderRadius: "8px",
  padding: "3px 10px",
};
function normalizeTimeKey(timeStr) {
  if (!timeStr) return null;
  const s = String(timeStr).trim();
  const ampm = s.match(/(\d{1,2})(?::\d{2})?\s*([aApP][mM])/);
  if (ampm) {
    const h = Math.max(1, Math.min(12, parseInt(ampm[1], 10) || 12));
  }
  const hhmm = s.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    let h = parseInt(hhmm[1], 10);
    const period = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return `${h} ${period}`;
  }
  const hBare = s.match(/^(\d{1,2})$/);
  if (hBare) {
    const h = Math.max(1, Math.min(12, parseInt(hBare[1], 10) || 12));
    return `${h} am`;
  }
  return null;
}
function formatTo12HourDisplay(time) {
  if (!time) return "";
  const s = String(time).trim();
  const ampm = s.match(/(\d{1,2})(?::(\d{2}))?\s*([aApP][mM])/);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = ampm[2] || "00";
    const p = ampm[3].toUpperCase();
    if (h === 0) h = 12;
    if (h > 12) h = h % 12;
    return `${String(h).padStart(2, "0")}:${m} ${p}`;
  }
  const hhmm = s.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    let h = parseInt(hhmm[1], 10);
    const m = hhmm[2];
    const p = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:${m} ${p}`;
  }
  const hBare = s.match(/^(\d{1,2})$/);
  if (hBare) {
    let h = parseInt(hBare[1], 10);
    const p = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:00 ${p}`;
  }
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

const Pricing = ({
  hitApi,
  setHitUpdateApi,
  selectAllDays,
  onSelectAllChange,
  setSelectAllDays,
  onPriceDataChange,
}) => {
  const dispatch = useDispatch();
  const { ownerClubData } = useSelector((state) => state.manualBooking);
  const registerId = ownerClubData?.[0]?._id || "";
  const { updateClubLoading, clubLoading, clubData } = useSelector(
    (state) => state.club
  );
  const PricingData = clubData?.data || [];
  const [formData, setFormData] = useState({
    selectedSlots: "Morning",
    days: DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = true; // All days selected by default
      return acc;
    }, {}),
    prices: { Morning: {}, Afternoon: {}, Evening: {}, All: {} },
    changesConfirmed: true,
  });
  console.log({formData})
  const [hasPriceChanges, setHasPriceChanges] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedSlotData, setSelectedSlotData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const selectAllChecked = useMemo(
    () =>
      selectAllDays !== undefined
        ? selectAllDays
        : Object.values(formData.days).every(Boolean),
    [selectAllDays, formData.days]
  );
  useEffect(() => {
    if (
      PricingData.length &&
      PricingData[0]?.slot?.length &&
      formData.selectedSlots
    ) {
      onPriceDataChange(PricingData[0]?.slot[0]?.slotTimes[0]?.amount || 0);

      const allSlotTimes = PricingData[0]?.slot?.flatMap(s => s.slotTimes || []) || [];
      if (allSlotTimes.length) {
        const allPrices = {};
        const amounts = [];

        // Get existing pricing data to preserve
        const existingPrices = formData.prices.All || {};
        allSlotTimes.forEach((slot) => {
          const display = formatTo12HourDisplay(slot?.time);
          if (display) {
            // First check if we have existing price for this time slot
            const existingPrice = existingPrices[display];
            if (existingPrice) {
              allPrices[display] = existingPrice;
              amounts.push(parseFloat(existingPrice));
            } else if (slot?.amount) {
              // Auto-populate from API data and auto-select slot
              allPrices[display] = String(slot.amount);
              amounts.push(slot.amount);
            } else {
              // Set empty but still include in allPrices to show slot exists
              allPrices[display] = "";
            }
          }
        });

        // Auto-select all slots and set common price by default
        const existingValues = Object.values(existingPrices).filter(v => v && v !== "");
        const apiValues = amounts.filter(a => a && a > 0);

        let commonPrice = "";
        if (existingValues.length > 0 && existingValues.every(v => v === existingValues[0])) {
          commonPrice = existingValues[0];
        } else if (apiValues.length > 0 && apiValues.every(a => a === apiValues[0])) {
          commonPrice = String(apiValues[0]);
        } else if (apiValues.length > 0) {
          commonPrice = String(apiValues[0]); // Use first available price
        }

        // Auto-select all slots with common price
        if (commonPrice) {
          Object.keys(allPrices).forEach(key => {
            allPrices[key] = commonPrice;
          });
        }

        setFormData((prev) => {
          // Clean up any direct time keys to avoid conflicts
          const cleanPrices = { ...prev.prices };
          Object.keys(allPrices).forEach(timeKey => {
            delete cleanPrices[timeKey];
          });
          
          return {
            ...prev,
            prices: {
              ...cleanPrices,
              All: allPrices,
            },
          };
        });
      }
    }
  }, [PricingData, formData.selectedSlots, onPriceDataChange]);
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
        time: "", // Always fetch all time slots regardless of dropdown selection
      })
    );
  }, [
    dispatch,
    isAllDays,
    registerId,
    selectedDaysList,
  ]);
  const updateForm = useCallback(
    (field, value) => setFormData((prev) =>  ({ ...prev, [field]: value })),
    []
  );
  const handleDayChange = useCallback((day) => {
    setFormData((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: !prev.days[day],
      },
    }));
  }, []);
  const handleSelectAllChange = useCallback(
    (checked) => {
      setFormData((prev) => ({
        ...prev,
        days: DAYS_OF_WEEK.reduce((acc, day) => {
          acc[day] = checked;
          return acc;
        }, {}),
      }));
      if (onSelectAllChange) {
        onSelectAllChange(checked);
      }
    },
    [onSelectAllChange]
  );
  const handlePriceChange = useCallback((slotType, timeKey, value) => {
    const numericValue = Number(value);
    if (value !== "" && (numericValue > 4000 || numericValue < 0)) {
      return;
    }
    onPriceDataChange(value)
    setFormData((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [slotType]: { ...prev.prices[slotType], [timeKey]: value },
      },
    }));
    setHasPriceChanges(true);
  }, []);
  const handleSlotClick = (slot, day) => {
    setSelectedSlotData(slot);
    setSelectedDay(day);
    setShowSlotModal(true);
  };
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
              width: "20px",
              height: "20px",
              borderRadius: "4px",
              border: "2px solid #1F2937",
              backgroundColor: formData.days[day] ? "#1F2937" : "transparent",
              cursor: "pointer",
              transform: "scale(1.2)",
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
  const filterSlotsByPeriod = (slots, period) => {
    return slots.filter((slot) => {
      const timeStr = slot?.time;
      if (!timeStr) return false;

      const display = formatTo12HourDisplay(timeStr);
      const [time, meridian] = display.split(" ");
      const [hour] = time.split(":").map(Number);
      let hour24 = hour;

      if (meridian === "PM" && hour !== 12) hour24 += 12;
      if (meridian === "AM" && hour === 12) hour24 = 0;

      switch (period) {
        case "Morning":
          return hour24 >= 0 && hour24 < 12;
        case "Afternoon":
          return hour24 >= 12 && hour24 < 17;
        case "Evening":
          return hour24 >= 17 && hour24 <= 23;
        default:
          return true;
      }
    });
  };

  const renderTimeSlots = () => {
    if (selectAllChecked) return renderAllSlots();
    const slotType = formData.selectedSlots;
    const allSlotData = PricingData?.[0]?.slot?.[0]?.slotTimes || [];
    const slotData = filterSlotsByPeriod(allSlotData, slotType);
    if (!slotData.length)
      return <div>No {slotType.toLowerCase()} slots available</div>;
    return slotData.map((slot) => {
      const display = formatTo12HourDisplay(slot?.time);
      const key = slot?._id || `${display}-${slot?.time}`;
      const value = formData.prices[slotType]?.[display] ?? (slot?.amount ? String(slot.amount) : "");
      const invalid =
        !value || parseFloat(value) <= 0 || isNaN(parseFloat(value));
      return (
        <Row key={key} className="align-items-center  mb-2">
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
                height: "30px",
                fontSize: "14px",
              }}
            />
          </Col>
          <Col xs={6}>
            <InputGroup className="d-flex align-items-center">
              <span className="me-1">₹</span>
              <FormControl
                type="number"
                min="1"
                max="4000"
                placeholder="Price"
                value={value}
                onChange={(e) =>
                  handlePriceChange(slotType, display, e.target.value)
                }
                isInvalid={invalid}
                style={{
                  background: "transparent",
                  height: "30px",
                  fontSize: "14px",
                  boxShadow: "none",
                }}
              />
            </InputGroup>
          </Col>
        </Row>
      );
    });
  };
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
          // Get existing common price or use first available price from API
          let common = getCommonPrice();
          if (!common) {
            // Find first slot with amount from API data
            const firstSlotWithAmount = PricingData?.[0]?.slot?.flatMap(s => s.slotTimes || [])
              .find(slot => slot?.amount);
            common = firstSlotWithAmount?.amount ? String(firstSlotWithAmount.amount) : "";
          }
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
      const numericValue = Number(price);
      if (price !== "" && (numericValue > 4000 || numericValue < 0)) {
        return;
      }

      setFormData((prev) => {
        const newPrices = { ...(prev.prices.All || {}) };
        selectedTimes.forEach((t) => {
          newPrices[t] = price;
        });
        
        const updatedPrices = { ...prev.prices };
        Object.keys(newPrices).forEach(timeKey => {
          const [time, meridian] = timeKey.split(" ");
          const [hour] = time.split(":").map(Number);
          let hour24 = hour;
          if (meridian === "PM" && hour !== 12) hour24 += 12;
          if (meridian === "AM" && hour === 12) hour24 = 0;
          
          if (hour24 >= 0 && hour24 < 12) {
            updatedPrices.Morning = { ...updatedPrices.Morning, [timeKey]: price };
          } else if (hour24 >= 12 && hour24 < 17) {
            updatedPrices.Afternoon = { ...updatedPrices.Afternoon, [timeKey]: price };
          } else if (hour24 >= 17 && hour24 <= 23) {
            updatedPrices.Evening = { ...updatedPrices.Evening, [timeKey]: price };
          }
        });
        
        return {
          ...prev,
          prices: { ...updatedPrices, All: newPrices },
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
      <>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6
            className=" mb-0"
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#374151",
              fontFamily: "Poppins",
            }}
          >
            Set Price
          </h6>
          <Form.Check
            type="checkbox"
            id="select-all-slots"
            label={
              <span className="text-muted ms-2 small">
                Select All {selectedTimes.length} of {allTimesRaw.length} slots
                selected
              </span>
            }
            checked={allSelected}
            onChange={toggleAllSlots}
            className="me-2"
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
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
                variant={isSelected ? "" : "outline-primary"}
                onClick={() => toggleSlot(timeRaw)}
                className="text-nowrap"
                style={{
                  padding: "4px 16px",
                  fontSize: "14px",
                  color: isSelected ? "#fff" : "#1F2937",
                  borderRadius: "8px",
                  border: `1px solid "#E5E7EB"}`,
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
              fontSize: "20px",
              fontWeight: "600",
              color: "#374151",
              fontFamily: "Poppins",
              marginBottom: "10px",
            }}
          >
            {selectedTimes.length > 0
              ? `Set Price for ${selectedTimes.length} slot${selectedTimes.length > 1 ? "s" : ""
              }`
              : "Set Price (select slots first)"}
          </h5>
          <InputGroup>
            <FormControl
              type="number"
              min={0}
              max={4000}
              placeholder={selectedTimes.length > 0 ? "Enter price" : ""}
              value={common}
              className="w-100"
              onChange={(e) => updatePriceForAll(e.target.value)}
              disabled={selectedTimes.length === 0}
              isInvalid={commonInvalid}
              style={{
                height: "40px",
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                fontSize: "14px",
                backgroundColor: "#fff",
                boxShadow: "none",
              }}
            />
          </InputGroup>
        </div>
      </>
    );
  };
  const handleSubmit = () => {
    const chosenDays = selectAllChecked
      ? DAYS_OF_WEEK
      : Object.keys(formData.days).filter((day) => formData.days[day]);
    
    // Collect all pricing data from all periods
    const morningPrices = formData.prices.Morning || {};
    const afternoonPrices = formData.prices.Afternoon || {};
    const eveningPrices = formData.prices.Evening || {};
    const allPrices = formData.prices.All || {};
    
    // Only use 'All' prices if no period-specific prices exist
    const hasPeriodPrices = Object.keys(morningPrices).length > 0 || 
                           Object.keys(afternoonPrices).length > 0 || 
                           Object.keys(eveningPrices).length > 0;
    
    const allSlotPrices = hasPeriodPrices ? {
      ...morningPrices,
      ...afternoonPrices,
      ...eveningPrices
    } : allPrices;
    
    console.log('Morning prices:', morningPrices);
    console.log('Afternoon prices:', afternoonPrices);
    console.log('Evening prices:', eveningPrices);
    console.log('All prices:', allPrices);
    console.log('Combined slot prices:', allSlotPrices);
    console.log('Morning slots in combined prices:', Object.keys(morningPrices));
    console.log('Afternoon slots in combined prices:', Object.keys(afternoonPrices));

    // Skip validation when called from updateRegisteredClub
    if (!allSlotPrices || Object.keys(allSlotPrices).length === 0) {
      return; // Silently return if no pricing data
    }
    const allSlots = PricingData?.[0]?.slot || [];
    // When updating pricing, include all slots regardless of selected days
    // The pricing should apply to all available slots that match the time
    const selectedSlotData = allSlots;
    const slotTimes = selectedSlotData.flatMap((slot) => slot?.slotTimes || []);
    const businessHours = selectedSlotData.flatMap(
      (slot) => slot?.businessHours || []
    );
    if (!slotTimes.length || !businessHours.length) {
      return; // Silently return if no slot data
    }
    const selectedDisplayTimes = Object.keys(allSlotPrices).filter(key => {
      const price = allSlotPrices[key];
      return price && price.toString().trim() !== '' && !isNaN(parseFloat(price)) && parseFloat(price) > 0;
    });
    
    console.log('Selected display times with valid prices:', selectedDisplayTimes);
    console.log('Morning times in selected:', selectedDisplayTimes.filter(t => {
      const [time, period] = t.split(' ');
      const [hour] = time.split(':').map(Number);
      let hour24 = hour;
      if (period === 'PM' && hour !== 12) hour24 += 12;
      if (period === 'AM' && hour === 12) hour24 = 0;
      return hour24 >= 5 && hour24 < 12;
    }));
    console.log('Afternoon times in selected:', selectedDisplayTimes.filter(t => {
      const [time, period] = t.split(' ');
      const [hour] = time.split(':').map(Number);
      let hour24 = hour;
      if (period === 'PM' && hour !== 12) hour24 += 12;
      if (period === 'AM' && hour === 12) hour24 = 0;
      return hour24 >= 12 && hour24 < 17;
    }));
    console.log('Total slot times from API:', slotTimes.length);
    
    // Log all API slot times for comparison
    slotTimes.forEach((slot, index) => {
      const displayTime = formatTo12HourDisplay(slot.time);
      console.log(`API Slot ${index}: ${slot.time} -> ${displayTime}`);
    });
    
    const targetedSlotTimes = slotTimes.filter((slot) => {
      const displayTime = formatTo12HourDisplay(slot.time);
      const isIncluded = selectedDisplayTimes.includes(displayTime);
      console.log(`Slot ${displayTime} (${slot.time}) - included: ${isIncluded}`);
      return isIncluded;
    });
    
    console.log('Targeted slot times:', targetedSlotTimes.length, 'out of', slotTimes.length);
    if (targetedSlotTimes.length === 0) {
      return; // Silently return if no targeted slots
    }
    const filledSlotTimes = targetedSlotTimes
      .map((slot) => {
        const displayTime = formatTo12HourDisplay(slot.time);
        const price = allSlotPrices[displayTime];
        if (price == null || String(price).trim() === "") return null;
        const amount = parseFloat(price);
        if (Number.isNaN(amount) || amount <= 0) return null;
        return {
          _id: slot?._id,
          amount,
        };
      })
      .filter(Boolean);
      console.log({filledSlotTimes});
    if (filledSlotTimes.length === 0) {
      return; // Silently return if no valid prices
    }
    const completeBusinessHours = chosenDays.map((dayName) => {
      const existing = businessHours.find((bh) => bh?.day === dayName);
      return (
        existing || {
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
      return; // Silently return if no court ID
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
            time: "", // Always fetch all time slots regardless of dropdown selection
          })
        );
        setHasPriceChanges(false);
      })
      .catch((error) => {
        showError("Failed to update prices. Please try again.");
      });
  };
  // Clean up direct time keys from pricing data
  useEffect(() => {
    const timeKeyPattern = /^\d{1,2}:\d{2}\s[AP]M$/;
    const hasDirectTimeKeys = Object.keys(formData.prices).some(key => timeKeyPattern.test(key));
    
    if (hasDirectTimeKeys) {
      setFormData(prev => {
        const cleanPrices = { ...prev.prices };
        Object.keys(cleanPrices).forEach(key => {
          if (timeKeyPattern.test(key)) {
            delete cleanPrices[key];
          }
        });
        return { ...prev, prices: cleanPrices };
      });
    }
  }, []);

  useEffect(() => {
    if (hitApi) {
      // Always call updateCourt API when updateRegisteredClub is called
      // This ensures pricing data is updated with current input values
      handleSubmit();
      setHitUpdateApi(false);
    }
  }, [hitApi]);

  useEffect(() => {
    if (selectAllDays !== undefined) {
      setFormData((prev) => ({
        ...prev,
        days: DAYS_OF_WEEK.reduce((acc, day) => {
          acc[day] = selectAllDays;
          return acc;
        }, {}),
      }));
    }
  }, [selectAllDays]);

  useEffect(() => {
    const selectedDays = Object.values(formData.days).filter(Boolean);
    if (selectedDays.length === 0 && !selectAllDays) {
      setFormData((prev) => ({
        ...prev,
        days: {
          ...prev.days,
          Monday: true,
        },
      }));
    }
  }, [formData.days, selectAllDays]);

  return (
    <div className="">
      <Row>
        <Col xs={12} md={2}>
          <div style={containerStyle} className="mb-3 mb-md-0">
            <Form.Check
              type="checkbox"
              className="d-flex mb-3 align-items-start"
              id="select-all-days"
            >
              <Form.Check.Input
                type="checkbox"
                id="select-all-days"
                checked={selectAllDays}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectAllDays(checked);
                  if (!checked) {
                    setFormData((prev) => ({
                      ...prev,
                      days: DAYS_OF_WEEK.reduce((acc, day, index) => {
                        acc[day] = index === 0;
                        return acc;
                      }, {}),
                    }));
                  }
                }}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  border: "2px solid #1F2937",
                  backgroundColor: selectAllDays ? "#1F2937" : "transparent",
                  cursor: "pointer",
                  boxShadow: "none",
                }}
              />
              <label
                htmlFor="select-all-days"
                className="ms-2 mb-0"
                style={{
                  fontSize: "16px",
                  color: "#1F2937",
                  fontWeight: 500,
                  fontFamily: "Poppins",
                }}
              >
                All
              </label>
            </Form.Check>
            {renderDays()}
          </div>
        </Col>
        <Col xs={12} md={8} className="position-relative">
          <div className="d-flex justify-content-between align-items-center mb-3 d-md-none">
            <Dropdown className="">
              <Dropdown.Toggle
                variant="secondary"
                size="sm"
                style={{
                  backgroundColor: "#F9FAFB",
                  borderColor: "#E5E7EB",
                  borderRadius: "8px",
                  color: "#1F2937",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {formData.selectedSlots}
                <IoChevronDown style={{ fontSize: "10px" }} />
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
                  top: "0.5em",
                  right: "1em",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {formData.selectedSlots} slots
                <IoChevronDown style={{ fontSize: "12px" }} />
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
          <div
            style={containerStyle}
            className={selectAllChecked ? "" : "mt-5"}
          >
            {clubLoading ? <DataLoading height="20vh" /> : renderTimeSlots()}
          </div>
        </Col>
      </Row>
      <SlotDetailsModal
        show={showSlotModal}
        onHide={() => setShowSlotModal(false)}
        slotData={selectedSlotData}
        day={selectedDay}
      />
    </div>
  );
};
export default Pricing;
