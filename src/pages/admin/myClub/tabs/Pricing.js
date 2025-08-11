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
import { showInfo, showWarning } from "../../../../helpers/Toast";

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
  const pricingData = clubData?.data || [];

  const [formData, setFormData] = useState({
    selectedSlots: "Morning",
    days: DAYS_OF_WEEK.reduce((acc, day, idx) => {
      acc[day] = idx === 0; // Monday selected by default
      return acc;
    }, {}),
    prices: { Morning: {}, Afternoon: {}, Evening: {}, All: {} },
    changesConfirmed: false,
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
  console.log({ pricingData });
  useEffect(() => {
    if (
      pricingData.length &&
      pricingData[0]?.slot?.length &&
      formData.selectedSlots
    ) {
      const slotData = pricingData[0]?.slot[0]?.slotTimes || [];
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
  }, [pricingData, formData.selectedSlots, convertTo12HourFormat]);

  /** Fetch slots when days/slots change */
  useEffect(() => {
    const selectedDays = Object.keys(formData.days).filter(
      (day) => formData.days[day]
    );
    if (!selectedDays.length || !registerId) return;

    const isAll = selectedDays.length === DAYS_OF_WEEK.length;
    dispatch(
      getSlots({
        register_club_id: registerId,
        day: isAll ? "All" : selectedDays,
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
    const slotData = pricingData[0]?.slot?.[0]?.slotTimes || [];
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
      pricingData[0]?.slot?.[0]?.slotTimes?.map((s) => s.time) || [];
    const selectedTimes = Object.keys(formData.prices.All);

    const getCommonPrice = () => {
      if (!selectedTimes.length) return "";
      const firstPrice = formData.prices.All[selectedTimes[0]];
      return selectedTimes.every((t) => formData.prices.All[t] === firstPrice)
        ? firstPrice
        : "";
    };

    const toggleSlot = (time) =>
      setFormData((prev) => {
        const newPrices = { ...prev.prices.All };
        newPrices[time]
          ? delete newPrices[time]
          : (newPrices[time] = getCommonPrice());
        return { ...prev, prices: { ...prev.prices, All: newPrices } };
      });

    const updatePriceForAll = (price) =>
      setFormData((prev) => ({
        ...prev,
        prices: {
          ...prev.prices,
          All: selectedTimes.reduce((acc, t) => {
            acc[t] = price;
            return acc;
          }, {}),
        },
      }));

    return (
      <div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {allTimes.map((time) => {
            const selected = formData.prices.All[time] !== undefined;
            return (
              <Button
                key={time}
                variant={selected ? "primary" : "outline-primary"}
                onClick={() => toggleSlot(time)}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  backgroundColor: selected ? "#22C55E" : "#F9FAFB",
                  color: selected ? "#fff" : "#1F2937",
                }}
              >
                {time}
              </Button>
            );
          })}
        </div>
        <InputGroup>
          <FormControl
            placeholder={selectedTimes.length ? "Enter price" : ""}
            value={getCommonPrice()}
            onChange={(e) => updatePriceForAll(e.target.value)}
            disabled={!selectedTimes.length}
            style={{
              height: "40px",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
            }}
          />
        </InputGroup>
      </div>
    );
  };

  /** Submit Handler */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.changesConfirmed)
      return showInfo("Please confirm changes first.");

    const selectedDays = Object.keys(formData.days).filter(
      (day) => formData.days[day]
    );
    const slotType = selectAllChecked ? "All" : formData.selectedSlots;
    const slotPrices = formData.prices[slotType];
    if (!Object.keys(slotPrices).length)
      return showWarning("No prices entered.");

    const slotInfo = pricingData[0]?.slot?.[0];
    if (!slotInfo?.slotTimes?.length || !slotInfo?.businessHours?.length) {
      return showInfo("Slot times or business hours missing.");
    }

    const normalizeTime = (t) => t.replace(/:\d{2}/, "").toLowerCase();
    const filledSlotTimes = slotInfo.slotTimes
      .filter((s) => slotPrices[convertTo12HourFormat(s.time)])
      .map((s) => ({
        _id: s._id,
        amount: parseFloat(slotPrices[convertTo12HourFormat(s.time)]) || 0,
      }));

    const selectedBusinessHours = slotInfo.businessHours
      .filter((bh) => selectedDays.includes(bh.day))
      .map(({ _id, time }) => ({ _id, time }));

    const payload = {
      _id: pricingData[0]?._id,
      businessHoursUpdates: selectedBusinessHours,
      slotTimesUpdates: filledSlotTimes,
    };

    dispatch(updatePrice(payload))
      .unwrap()
      // .then(() => {
      //   navigate("/admin/dashboard");
      //   dispatch(resetClub());
      // })
      .catch(() => alert("Failed to update prices."));
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
              <Dropdown className="mb-2">
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
          <Col>
            <Form.Check
              type="checkbox"
              checked={formData.changesConfirmed}
              onChange={(e) => updateForm("changesConfirmed", e.target.checked)}
              label={
                <span>If done, click this before moving to other pages.</span>
              }
            />
          </Col>
        </Row>

        <div className="d-flex justify-content-end mt-4">
          <Button
            type="submit"
            style={{
              backgroundColor: "#374151",
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
