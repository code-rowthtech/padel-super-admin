import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button, Col, Container, Form, Modal, Offcanvas, Row, Table } from "react-bootstrap";
import { FaEdit, FaPhone, FaPlus, FaSave, FaSearch, FaTimes, FaUser } from "react-icons/fa";
import Select, { components as selectComponents } from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import { ownerApi } from "../../../helpers/api/apiCore";
import {
  POST_MATCH_REQUEST_PAYMENT_LINK,
  SUPER_ADMIN_GET_ALL_CLUBS,
  SUPER_ADMIN_OPEN_MATCH_OVERVIEW,
} from "../../../helpers/api/apiEndpoint";
import {
  createPlayerPreference,
  getAllPlayerPreferences,
  lookupCustomerByPhone,
  updatePlayerPreference,
} from "../../../redux/admin/playerPreferences/thunk";
import { resetLookup } from "../../../redux/admin/playerPreferences/slice";
import { sendMatchRequest } from "../../../redux/admin/matchRequest/thunk";

const TIME_SLOT_GROUPS = [
  {
    label: "30 Minutes",
    options: [
      "5:00 AM – 5:30 AM", "5:30 AM – 6:00 AM", "6:00 AM – 6:30 AM", "6:30 AM – 7:00 AM",
      "7:00 AM – 7:30 AM", "7:30 AM – 8:00 AM", "8:00 AM – 8:30 AM", "8:30 AM – 9:00 AM",
      "9:00 AM – 9:30 AM", "9:30 AM – 10:00 AM", "10:00 AM – 10:30 AM", "10:30 AM – 11:00 AM",
      "11:00 AM – 11:30 AM", "11:30 AM – 12:00 PM", "12:00 PM – 12:30 PM", "12:30 PM – 1:00 PM",
      "1:00 PM – 1:30 PM", "1:30 PM – 2:00 PM", "2:00 PM – 2:30 PM", "2:30 PM – 3:00 PM",
      "3:00 PM – 3:30 PM", "3:30 PM – 4:00 PM", "4:00 PM – 4:30 PM", "4:30 PM – 5:00 PM",
      "5:00 PM – 5:30 PM", "5:30 PM – 6:00 PM", "6:00 PM – 6:30 PM", "6:30 PM – 7:00 PM",
      "7:00 PM – 7:30 PM", "7:30 PM – 8:00 PM", "8:00 PM – 8:30 PM", "8:30 PM – 9:00 PM",
      "9:00 PM – 9:30 PM", "9:30 PM – 10:00 PM", "10:00 PM – 10:30 PM", "10:30 PM – 11:00 PM",
      "11:00 PM – 11:30 PM",
    ].map((value) => ({ value, label: value })),
  },
  {
    label: "60 Minutes",
    options: [
      "5 AM – 6 AM", "6 AM – 7 AM", "7 AM – 8 AM", "8 AM – 9 AM", "9 AM – 10 AM",
      "10 AM – 11 AM", "11 AM – 12 PM", "12 PM – 1 PM", "1 PM – 2 PM", "2 PM – 3 PM",
      "3 PM – 4 PM", "4 PM – 5 PM", "5 PM – 6 PM", "6 PM – 7 PM", "7 PM – 8 PM",
      "8 PM – 9 PM", "9 PM – 10 PM", "10 PM – 11 PM", "11 PM – 12 AM",
    ].map((value) => ({ value, label: value })),
  },
  {
    label: "90 Minutes",
    options: [
      "5:00 AM – 6:30 AM", "6:00 AM – 7:30 AM", "7:00 AM – 8:30 AM", "8:00 AM – 9:30 AM",
      "9:00 AM – 10:30 AM", "10:00 AM – 11:30 AM", "11:00 AM – 12:30 PM", "12:00 PM – 1:30 PM",
      "1:00 PM – 2:30 PM", "2:00 PM – 3:30 PM", "3:00 PM – 4:30 PM", "4:00 PM – 5:30 PM",
      "5:00 PM – 6:30 PM", "6:00 PM – 7:30 PM", "7:00 PM – 8:30 PM", "8:00 PM – 9:30 PM",
      "9:00 PM – 10:30 PM", "10:00 PM – 11:30 PM", "11:00 PM – 12:30 AM",
    ].map((value) => ({ value, label: value })),
  },
];

const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SKILL_LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Professional"];
const GENDER_OPTIONS = ["Male", "Female", "Other"];
const SKILL_COLORS = { Beginner: "success", Intermediate: "warning", Advanced: "danger", Professional: "dark" };
const EMPTY_PREFERENCE_FORM = {
  preferredClubs: [],
  preferredSchedule: [],
  skillLevel: "",
  notes: "",
  playerTendency: "",
};
const EMPTY_PLAYER_FORM = { phoneNumber: "", name: "", email: "", gender: "", residence: "" };
const EMPTY_FILTERS = {
  search: "",
  skillLevel: [],
  gender: [],
  residence: [],
  clubId: [],
  day: [],
  timeSlot: [],
  hasPreference: [],
};

const selectStyles = {
  control: (base) => ({ ...base, borderColor: "#dee2e6", minHeight: 36, fontSize: 13 }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
  multiValue: (base) => ({ ...base, backgroundColor: "rgba(31,65,187,0.12)" }),
};

const checkboxSelectStyles = {
  ...selectStyles,
  control: (base) => ({
    ...base,
    borderColor: "#dee2e6",
    minHeight: 31,
    fontSize: 13,
    boxShadow: "none",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
    flexWrap: "nowrap",
    overflow: "hidden",
  }),
  placeholder: (base) => ({ ...base, color: "#111827", whiteSpace: "nowrap" }),
  input: (base) => ({ ...base, margin: 0, padding: 0 }),
  indicatorsContainer: (base) => ({ ...base, minHeight: 31 }),
  option: (base, state) => ({
    ...base,
    alignItems: "center",
    backgroundColor: state.isFocused ? "rgba(31,65,187,0.08)" : "#fff",
    color: "#111827",
    display: "flex",
    fontSize: 13,
    gap: 8,
    padding: "7px 10px",
  }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
};

const toSelectOptions = (arr) => arr.map((value) => ({ value, label: value }));
const selectValues = (options, values) => {
  const valueSet = new Set(Array.isArray(values) ? values : [values].filter(Boolean));
  const selectedOptions = options.filter((option) => valueSet.has(option.value));
  const selectedValues = new Set(selectedOptions.map((option) => option.value));

  valueSet.forEach((value) => {
    if (!selectedValues.has(value)) selectedOptions.push({ value, label: value });
  });

  return selectedOptions;
};

const getMultiPlaceholder = (emptyText, values) => {
  const count = Array.isArray(values) ? values.length : (values ? 1 : 0);
  return count ? `${count} selected` : emptyText;
};

const CheckboxOption = (props) => (
  <selectComponents.Option {...props}>
    <span
      aria-hidden="true"
      style={{
        alignItems: "center",
        background: props.isSelected ? "#1f41bb" : "#fff",
        border: `1px solid ${props.isSelected ? "#1f41bb" : "#cbd5e1"}`,
        borderRadius: 3,
        color: "#fff",
        display: "inline-flex",
        flex: "0 0 14px",
        fontSize: 10,
        height: 14,
        justifyContent: "center",
        lineHeight: "14px",
        width: 14,
      }}
    >
      {props.isSelected ? "✓" : ""}
    </span>
    <span className="text-truncate">{props.label}</span>
  </selectComponents.Option>
);

const checkboxMultiComponents = {
  MultiValue: () => null,
  Option: CheckboxOption,
};

const CheckboxMultiSelect = ({ options, value, onChange, placeholder }) => {
  const flatOptions = Array.isArray(options?.[0]?.options)
    ? options.flatMap((group) => group.options)
    : options;

  return (
    <Select
      isMulti
      closeMenuOnSelect={false}
      controlShouldRenderValue={false}
      hideSelectedOptions={false}
      components={checkboxMultiComponents}
      options={options}
      value={selectValues(flatOptions, value)}
      onChange={(selected) => onChange((selected || []).map((option) => option.value))}
      placeholder={placeholder}
      styles={checkboxSelectStyles}
    />
  );
};

const normalizeTimeSlotText = (value) =>
  String(value || "").replace(/[–—]/g, "-").replace(/\s+/g, " ").replace(/\s*-\s*/g, "-").trim().toUpperCase();

const TIME_SLOT_LABEL_BY_COMPACT = TIME_SLOT_GROUPS
  .flatMap((group) => group.options)
  .reduce((acc, option) => {
    acc[normalizeTimeSlotText(option.value)] = option.value;
    return acc;
  }, {});

const normalizeTimePartLabel = (value) => {
  const raw = String(value || "").replace(/\./g, "").trim();
  if (!raw) return "";

  const twentyFourHour = raw.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (twentyFourHour) {
    let hours = Number(twentyFourHour[1]);
    const minutes = twentyFourHour[2];
    const period = hours >= 12 ? "PM" : "AM";
    hours %= 12;
    if (hours === 0) hours = 12;
    return minutes === "00" ? `${hours} ${period}` : `${hours}:${minutes} ${period}`;
  }

  const twelveHour = raw.match(/^0?(\d{1,2})(?::([0-5]\d))?\s*(AM|PM)$/i);
  if (!twelveHour) return raw;

  const hour = Number(twelveHour[1]);
  const minutes = twelveHour[2] || "00";
  const period = twelveHour[3].toUpperCase();
  return minutes === "00" ? `${hour} ${period}` : `${hour}:${minutes} ${period}`;
};

const normalizeTimeRangeLabel = (value) => {
  const source = Array.isArray(value) ? value.join(" - ") : String(value || "");
  const normalized = source
    .replace(/[–—]/g, "-")
    .replace(/\bto\b/gi, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "";

  const parts = normalized.includes(",")
    ? normalized.split(",")
    : normalized.split(/\s*-\s*/);

  const cleanParts = parts.map(normalizeTimePartLabel).filter(Boolean);
  if (cleanParts.length >= 2) {
    const label = `${cleanParts[0]} – ${cleanParts[cleanParts.length - 1]}`;
    return TIME_SLOT_LABEL_BY_COMPACT[normalizeTimeSlotText(label)] || label;
  }

  return TIME_SLOT_LABEL_BY_COMPACT[normalizeTimeSlotText(cleanParts[0])] || cleanParts[0] || normalized;
};

const getEntityId = (value) => (typeof value === "object" && value !== null ? value._id : value);

const getMatchDay = (match) => {
  const date = match?.matchDate || match?.bookingDate || match?.slot?.[0]?.slotTimes?.[0]?.date;
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { weekday: "long" });
};

const formatMatchDate = (match) => {
  const date = match?.matchDate || match?.bookingDate || match?.slot?.[0]?.slotTimes?.[0]?.date;
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const getMatchSlotTimeRange = (match) => {
  const times = (match?.slot || [])
    .flatMap((slot) => slot?.slotTimes || [])
    .map((slotTime) => slotTime?.time)
    .filter(Boolean);

  if (!times.length) return "";
  return times.length === 1 ? times[0] : `${times[0]} - ${times[times.length - 1]}`;
};

const getMatchTime = (match) =>
  normalizeTimeRangeLabel(
    match?.startTime && match?.endTime
      ? `${match.startTime} - ${match.endTime}`
      : match?.matchTime || getMatchSlotTimeRange(match),
  ) || "Any Time";

const getMatchClubName = (match) => match?.clubId?.clubName || match?.clubId?.name || "N/A";

const getMatchCourtName = (match) => match?.slot?.[0]?.courtName || match?.courtName || "";

const getMatchFee = (match) => {
  const bookingSlotTotal = (match?.bookingId?.slot || []).reduce((sum, slot) => (
    sum + (slot?.slotTimes || []).reduce((slotSum, slotTime) => slotSum + Number(slotTime?.amount || 0), 0)
  ), 0);
  const slotTotal = (match?.slot || []).reduce((sum, slot) => (
    sum + (slot?.slotTimes || []).reduce((slotSum, slotTime) => slotSum + Number(slotTime?.amount || 0), 0)
  ), 0);
  const total = Number(
    match?.totalMatchPayment ||
    match?.matchFee ||
    match?.fee ||
    match?.bookingId?.totalAmount ||
    bookingSlotTotal ||
    slotTotal ||
    0,
  );
  const share = Number(match?.perPlayerMatchShare || (total > 0 ? total.toFixed(2) : 0));
  const platformFee = Number(match?.platformFee || 30);
  const gstOnPlatformFee = Number((platformFee * 0.18).toFixed(2));
  return {
    total,
    share,
    platformFee,
    gstOnPlatformFee,
    payable: Number((share + platformFee + gstOnPlatformFee).toFixed(2)),
  };
};

const getSlotRangeLabel = (slots = []) => {
  if (!slots.length) return "Any time";
  const firstParts = normalizeTimeSlotText(slots[0]).split("-");
  const lastParts = normalizeTimeSlotText(slots[slots.length - 1]).split("-");
  const start = firstParts[0]?.trim();
  const end = (lastParts[1] || lastParts[0])?.trim();
  return start && end ? `${start} - ${end}` : slots[0];
};

const formatScheduleSummary = (preferredSchedule = [], maxRows = 2) => {
  if (!preferredSchedule.length) return <span className="text-muted">No schedule</span>;

  const groupedByRange = preferredSchedule.reduce((acc, entry) => {
    const range = entry.timeSlots?.length ? getSlotRangeLabel(entry.timeSlots) : "Any time";
    if (!acc[range]) acc[range] = [];
    acc[range].push(entry.day);
    return acc;
  }, {});

  const entries = Object.entries(groupedByRange);
  const visibleEntries = entries.slice(0, maxRows);
  const hiddenCount = entries.length - visibleEntries.length;

  return (
    <div>
      {visibleEntries.map(([range, days]) => (
        <div
          key={`${range}-${days.join("-")}`}
          className="d-flex align-items-center gap-2 mb-1"
          style={{ fontSize: 12, minWidth: 0 }}
        >
          <span
            style={{
              background: "rgba(31,65,187,0.08)",
              borderRadius: 4,
              color: "#1f41bb",
              flex: "0 0 auto",
              fontWeight: 700,
              maxWidth: 120,
              overflow: "hidden",
              padding: "2px 7px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {days.length === 7 ? "All week" : days.map((day) => day.slice(0, 3)).join(", ")}
          </span>
          <span className="text-muted text-truncate" style={{ minWidth: 0 }}>{range}</span>
        </div>
      ))}
      {hiddenCount > 0 && (
        <span className="text-muted" style={{ fontSize: 11 }}>+{hiddenCount} more</span>
      )}
    </div>
  );
};

const renderPreferenceSummary = (row) => {
  const clubs = (row.preferredClubs || []).map((club) => club.clubName || club.name).filter(Boolean);

  return (
    <div
      style={{
        border: "1px solid #eef2f7",
        borderRadius: 6,
        margin: "0 auto",
        maxWidth: "100%",
        overflow: "hidden",
        padding: "7px 9px",
        width: 720,
      }}
    >
      <div className="d-flex align-items-center gap-2 mb-1" style={{ minWidth: 0 }}>
        {row.skillLevel ? (
          <Badge bg={SKILL_COLORS[row.skillLevel] || "secondary"}>{row.skillLevel}</Badge>
        ) : (
          <Badge bg="light" text="dark" className="border">No level</Badge>
        )}
        <span className="text-muted text-truncate" style={{ fontSize: 12, minWidth: 0 }}>
          {clubs.length ? clubs.join(", ") : "No club preference"}
        </span>
      </div>
      <div style={{ minWidth: 0, textAlign: row.preferredSchedule?.length ? "left" : "center" }}>
        {formatScheduleSummary(row.preferredSchedule)}
      </div>
      {row.playerTendency && (
        <div
          className="text-muted text-truncate mt-1"
          style={{
            borderTop: "1px solid #eef2f7",
            fontSize: 12,
            paddingTop: 5,
          }}
          title={row.playerTendency}
        >
          Tendency: {row.playerTendency}
        </div>
      )}
    </div>
  );
};

const ScheduleBuilder = ({ value, onChange }) => {
  const selectedDays = value.map((entry) => entry.day);

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      onChange(value.filter((entry) => entry.day !== day));
      return;
    }

    const next = [...value, { day, timeSlots: [] }];
    next.sort((a, b) => DAY_OPTIONS.indexOf(a.day) - DAY_OPTIONS.indexOf(b.day));
    onChange(next);
  };

  const handleTimeSlotsChange = (day, slots) => {
    onChange(value.map((entry) => (entry.day === day ? { ...entry, timeSlots: slots || [] } : entry)));
  };

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {DAY_OPTIONS.map((day) => {
          const active = selectedDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              style={{
                backgroundColor: active ? "rgba(31,65,187,0.1)" : "#fff",
                border: active ? "2px solid #1f41bb" : "2px solid #dee2e6",
                borderRadius: 20,
                color: active ? "#1f41bb" : "#6c757d",
                cursor: "pointer",
                fontFamily: "Poppins",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                padding: "5px 14px",
              }}
            >
              {day.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {value.length === 0 && (
        <div className="text-muted small">Select days, then choose time slots for each selected day.</div>
      )}

      {value.map((entry) => (
        <div key={entry.day} className="d-flex align-items-start gap-2 mb-2">
          <div style={{ color: "#1f41bb", fontFamily: "Poppins", fontSize: 13, fontWeight: 600, minWidth: 88, paddingTop: 6 }}>
            {entry.day}
          </div>
          <div style={{ flex: 1 }}>
            <CheckboxMultiSelect
              options={TIME_SLOT_GROUPS}
              value={(entry.timeSlots || []).map((slot) => slot.value)}
              onChange={(values) => handleTimeSlotsChange(entry.day, toSelectOptions(values))}
              placeholder={getMultiPlaceholder("Select time slots...", entry.timeSlots)}
            />
          </div>
          <button
            type="button"
            onClick={() => handleDayToggle(entry.day)}
            style={{ background: "none", border: "none", color: "#adb5bd", cursor: "pointer", paddingTop: 8 }}
            title="Remove day"
          >
            <FaTimes size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};

const PlayerPreferences = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    preferences: players,
    loading,
    pagination,
    lookupLoading,
    lookupResult,
    saveLoading,
    residenceOptions,
  } = useSelector((state) => state.playerPreferences);

  const [clubOptions, setClubOptions] = useState([]);
  const [clubLocationOptions, setClubLocationOptions] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [playerForm, setPlayerForm] = useState(EMPTY_PLAYER_FORM);
  const [playerFormErrors, setPlayerFormErrors] = useState({});
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);
  const [editingPreferencePlayerId, setEditingPreferencePlayerId] = useState("");
  const [preferenceForm, setPreferenceForm] = useState(EMPTY_PREFERENCE_FORM);
  const [showOpenMatchPanel, setShowOpenMatchPanel] = useState(true);
  const [openMatches, setOpenMatches] = useState([]);
  const [openMatchesLoading, setOpenMatchesLoading] = useState(false);
  const [selectedOpenMatch, setSelectedOpenMatch] = useState(null);
  const [requestingPlayerId, setRequestingPlayerId] = useState("");
  const [generatingLinkPlayerId, setGeneratingLinkPlayerId] = useState("");
  const [paymentLinksByPlayerId, setPaymentLinksByPlayerId] = useState({});
  const [routeOpenMatchLoaded, setRouteOpenMatchLoaded] = useState(false);

  useEffect(() => {
    ownerApi.get(SUPER_ADMIN_GET_ALL_CLUBS).then((res) => {
      const list = res.data?.data?.clubs || res.data?.data || [];
      setClubOptions(list.map((club) => ({ value: club._id, label: club.clubName || club.name })));
      const uniqueLocations = new Map();
      list.forEach((club) => {
        (club.locations || []).forEach((location, index) => {
          const label = location?.name || location?.locationName || location?.address || `Location ${index + 1}`;
          if (label) uniqueLocations.set(label, { value: label, label });
        });
      });
      setClubLocationOptions([...uniqueLocations.values()]);
    }).catch(() => {});
  }, []);

  const residenceDropdownOptions = useMemo(() => {
    const uniqueOptions = new Map();
    clubLocationOptions.forEach((option) => uniqueOptions.set(option.value, option));
    (residenceOptions || []).forEach((residence) => {
      if (residence) uniqueOptions.set(residence, { value: residence, label: residence });
    });
    return [...uniqueOptions.values()];
  }, [clubLocationOptions, residenceOptions]);

  const selectedMatchFee = useMemo(() => (
    selectedOpenMatch ? getMatchFee(selectedOpenMatch) : null
  ), [selectedOpenMatch]);

  const routeMatchId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("matchId") || location.state?.selectedOpenMatchId || "";
  }, [location.search, location.state]);

  const loadPlayers = useCallback((page = 1) => {
    dispatch(getAllPlayerPreferences({
      page,
      limit: pagination.limit,
      search: filters.search,
      skillLevel: filters.skillLevel,
      gender: filters.gender,
      residence: filters.residence,
      clubId: filters.clubId,
      day: filters.day,
      timeSlot: filters.timeSlot,
      hasPreference: filters.hasPreference,
    }));
  }, [dispatch, filters, pagination.limit]);

  useEffect(() => {
    loadPlayers(1);
  }, [loadPlayers]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSelectedOpenMatch(null);
  };

  const getPlayerId = (row) => row?.customerId?._id || "";

  const loadOpenMatches = useCallback(async () => {
    setOpenMatchesLoading(true);
    try {
      const res = await ownerApi.get(`${SUPER_ADMIN_OPEN_MATCH_OVERVIEW}?page=1&limit=50`);
      const payload = res?.data?.data || res?.data || {};
      setOpenMatches(payload?.openMatches || payload?.data || []);
    } catch (error) {
      setOpenMatches([]);
    } finally {
      setOpenMatchesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showOpenMatchPanel && openMatches.length === 0) loadOpenMatches();
  }, [loadOpenMatches, openMatches.length, showOpenMatchPanel]);

  useEffect(() => {
    if (!showOpenMatchPanel) return undefined;

    loadOpenMatches();
    const intervalId = setInterval(loadOpenMatches, 60000);

    return () => clearInterval(intervalId);
  }, [loadOpenMatches, showOpenMatchPanel]);

  const handleOpenMatchSelect = (match) => {
    const clubId = getEntityId(match?.clubId);
    const day = getMatchDay(match);
    const timeSlot = getMatchTime(match);
    const skillLevel = match?.skillLevel;

    setSelectedOpenMatch(match);
    setFilters((current) => ({
      ...current,
      clubId: clubId ? [clubId] : [],
      day: day ? [day] : [],
      timeSlot: timeSlot && timeSlot !== "Any Time" ? [timeSlot] : [],
      skillLevel: skillLevel ? [skillLevel] : [],
      hasPreference: ["yes"],
    }));
  };

  useEffect(() => {
    if (!routeMatchId || selectedOpenMatch?._id === routeMatchId) return;

    const existingMatch = openMatches.find((match) => match?._id === routeMatchId);
    if (existingMatch) {
      handleOpenMatchSelect(existingMatch);
      return;
    }

    if (!routeOpenMatchLoaded) {
      setRouteOpenMatchLoaded(true);
      loadOpenMatches();
    }
  }, [loadOpenMatches, openMatches, routeMatchId, routeOpenMatchLoaded, selectedOpenMatch]);

  const handleRequestPlayer = async (row) => {
    const playerId = getPlayerId(row);
    if (!selectedOpenMatch?._id || !playerId) return;

    setRequestingPlayerId(playerId);
    try {
      await dispatch(sendMatchRequest({
        matchId: selectedOpenMatch._id,
        playerId,
        preferredTeam: "any",
      })).unwrap();
    } finally {
      setRequestingPlayerId("");
    }
  };

  const handleGeneratePaymentLink = async (row) => {
    const playerId = getPlayerId(row);
    if (!selectedOpenMatch?._id || !playerId) return;

    setGeneratingLinkPlayerId(playerId);
    try {
      const res = await ownerApi.post(POST_MATCH_REQUEST_PAYMENT_LINK, {
        matchId: selectedOpenMatch._id,
        playerId,
        preferredTeam: "any",
        platformFee: 30,
      });
      const data = res?.data?.data || {};
      if (data.paymentLink) {
        setPaymentLinksByPlayerId((current) => ({
          ...current,
          [playerId]: data,
        }));
      }
    } finally {
      setGeneratingLinkPlayerId("");
    }
  };

  const handleCopyPaymentLink = async (playerId) => {
    const link = paymentLinksByPlayerId[playerId]?.paymentLink;
    if (!link) return;

    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = link;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  const openAddPlayer = () => {
    setPlayerForm(EMPTY_PLAYER_FORM);
    setPlayerFormErrors({});
    setPhoneSubmitted(false);
    dispatch(resetLookup());
    setShowPlayerModal(true);
  };

  const closeAddPlayer = () => {
    setShowPlayerModal(false);
    setPlayerForm(EMPTY_PLAYER_FORM);
    setPlayerFormErrors({});
    setPhoneSubmitted(false);
    dispatch(resetLookup());
  };

  const handleLookup = () => {
    const phone = String(playerForm.phoneNumber || "").trim();
    if (!phone) {
      setPlayerFormErrors({ phoneNumber: "Phone number is required" });
      return;
    }

    dispatch(lookupCustomerByPhone(phone)).then((res) => {
      if (res.error) return;
      const customer = res.payload?.customer;
      setPhoneSubmitted(true);
      setPlayerForm((current) => ({
        ...current,
        name: customer?.name || "",
        email: customer?.email || "",
        gender: customer?.gender || "",
        residence: customer?.city || "",
      }));
      setPlayerFormErrors({});
    });
  };

  const handleSavePlayer = async (event) => {
    event.preventDefault();

    const errors = {};
    if (!String(playerForm.phoneNumber || "").trim()) errors.phoneNumber = "Phone number is required";
    if (!String(playerForm.name || "").trim()) errors.name = "Name is required";
    if (Object.keys(errors).length) {
      setPlayerFormErrors(errors);
      return;
    }

    const result = await dispatch(createPlayerPreference({
      phoneNumber: Number(String(playerForm.phoneNumber).trim()),
      name: playerForm.name.trim(),
      email: playerForm.email.trim() || undefined,
      gender: playerForm.gender || undefined,
      residence: playerForm.residence.trim() || undefined,
    }));

    if (!result.error) {
      closeAddPlayer();
      loadPlayers(1);
    }
  };

  const openPreferenceEditor = (row) => {
    setEditingPreferencePlayerId(getPlayerId(row));
    setPreferenceForm({
      preferredClubs: (row.preferredClubs || []).map((club) => ({
        value: club._id,
        label: club.clubName || club.name,
      })),
      preferredSchedule: (row.preferredSchedule || []).map((entry) => ({
        day: entry.day,
        timeSlots: toSelectOptions(entry.timeSlots || []),
      })),
      skillLevel: row.skillLevel || "",
      notes: row.notes || "",
      playerTendency: row.playerTendency || "",
    });
  };

  const closePreferenceEditor = () => {
    setEditingPreferencePlayerId("");
    setPreferenceForm(EMPTY_PREFERENCE_FORM);
  };

  const handleSavePreference = async (row) => {
    const payload = {
      preferredClubs: preferenceForm.preferredClubs.map((option) => option.value),
      preferredSchedule: preferenceForm.preferredSchedule.map((entry) => ({
        day: entry.day,
        timeSlots: entry.timeSlots.map((slot) => slot.value),
      })),
      skillLevel: preferenceForm.skillLevel || undefined,
      notes: preferenceForm.notes || undefined,
      playerTendency: preferenceForm.playerTendency || undefined,
    };

    const result = row.preferenceId
      ? await dispatch(updatePlayerPreference({ id: row.preferenceId, data: payload }))
      : await dispatch(createPlayerPreference({
        phoneNumber: Number(row.customerId?.phoneNumber),
        ...payload,
      }));

    if (!result.error) {
      closePreferenceEditor();
      loadPlayers(pagination.page);
    }
  };

  const renderPreferenceEditor = (row) => (
    <tr>
      <td colSpan={6} style={{ background: "#f8fafc", padding: 16 }}>
        <Row className="g-3">
          <Col xs={12} lg={4}>
            <Form.Label className="small mb-1">Preferred Clubs</Form.Label>
            <CheckboxMultiSelect
              options={clubOptions}
              value={preferenceForm.preferredClubs.map((club) => club.value)}
              onChange={(values) => setPreferenceForm((form) => ({
                ...form,
                preferredClubs: selectValues(clubOptions, values),
              }))}
              placeholder={getMultiPlaceholder("Select clubs...", preferenceForm.preferredClubs)}
            />
          </Col>
          <Col xs={12} lg={2}>
            <Form.Label className="small mb-1">Skill Level</Form.Label>
            <Form.Select
              size="sm"
              value={preferenceForm.skillLevel}
              onChange={(event) => setPreferenceForm((form) => ({ ...form, skillLevel: event.target.value }))}
            >
              <option value="">Select level</option>
              {SKILL_LEVEL_OPTIONS.map((level) => <option key={level} value={level}>{level}</option>)}
            </Form.Select>
          </Col>
          <Col xs={12} lg={3}>
            <Form.Label className="small mb-1">Player Tendency</Form.Label>
            <Form.Control
              size="sm"
              value={preferenceForm.playerTendency}
              onChange={(event) => setPreferenceForm((form) => ({ ...form, playerTendency: event.target.value }))}
              placeholder="e.g. evening regular, last-minute, competitive"
            />
          </Col>
          <Col xs={12} lg={3}>
            <Form.Label className="small mb-1">Notes</Form.Label>
            <Form.Control
              size="sm"
              value={preferenceForm.notes}
              onChange={(event) => setPreferenceForm((form) => ({ ...form, notes: event.target.value }))}
              placeholder="Optional notes"
            />
          </Col>
          <Col xs={12}>
            <Form.Label className="small mb-2">Preferred Playing Schedule</Form.Label>
            <ScheduleBuilder
              value={preferenceForm.preferredSchedule}
              onChange={(value) => setPreferenceForm((form) => ({ ...form, preferredSchedule: value }))}
            />
          </Col>
          <Col xs={12} className="d-flex justify-content-end gap-2">
            <Button size="sm" variant="outline-secondary" onClick={closePreferenceEditor} disabled={saveLoading}>
              <FaTimes size={12} className="me-1" />Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleSavePreference(row)}
              disabled={saveLoading}
              style={{ backgroundColor: "#1f41bb", border: "none", fontFamily: "Poppins" }}
            >
              {saveLoading ? <ButtonLoading size={8} /> : <><FaSave size={12} className="me-1" />Save Preferences</>}
            </Button>
          </Col>
        </Row>
      </td>
    </tr>
  );

  return (
    <Container
      fluid
      className={`player-preferences-workspace px-0 px-md-4 mt-md-0 mt-2 ${showOpenMatchPanel ? "open-match-panel-active" : ""}`}
    >
      <style>
        {`
          @media (min-width: 1200px) {
            .player-preferences-workspace.open-match-panel-active {
              padding-right: 376px !important;
              transition: padding-right 0.2s ease;
            }
            .player-preferences-open-match-panel {
              width: 376px !important;
            }
          }
          @media (max-width: 1199.98px) {
            .player-preferences-open-match-panel {
              width: min(376px, 100vw) !important;
            }
          }
        `}
      </style>
      <div className="bg-white rounded shadow-sm p-md-3 p-2">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div>
            <h6 className="mb-1 tabel-title">Players</h6>
            <div className="text-muted small">Manage players and update their preferences directly from the list.</div>
          </div>
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => setShowOpenMatchPanel(true)}
              style={{ fontFamily: "Poppins", fontWeight: 600 }}
            >
              Open Match
            </Button>
            <Button
              size="sm"
              onClick={openAddPlayer}
              style={{ backgroundColor: "#1f41bb", border: "none", fontFamily: "Poppins" }}
            >
              <FaPlus size={12} className="me-1" />Add Player
            </Button>
          </div>
        </div>

        {selectedOpenMatch && (
          <div
            className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3"
            style={{
              background: "#f0f4ff",
              border: "1px solid #c7d3f8",
              borderRadius: 6,
              padding: "8px 10px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div className="fw-semibold text-truncate" style={{ fontSize: 13, color: "#111827" }}>
                {formatMatchDate(selectedOpenMatch)} | {getMatchTime(selectedOpenMatch)} | {getMatchClubName(selectedOpenMatch)}
                {getMatchCourtName(selectedOpenMatch) ? ` | ${getMatchCourtName(selectedOpenMatch)}` : ""} | {selectedOpenMatch.skillLevel || "Any Level"}
              </div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                Player payable estimate: ₹{selectedMatchFee?.share || 0} match share + ₹{selectedMatchFee?.platformFee || 30} platform fee + ₹{selectedMatchFee?.gstOnPlatformFee || 5.4} GST = ₹{selectedMatchFee?.payable || 0}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => {
                setSelectedOpenMatch(null);
                resetFilters();
              }}
            >
              <FaTimes size={11} className="me-1" />Clear Match
            </Button>
          </div>
        )}

        <Row
          className="g-2 mb-3 align-items-end"
          style={{
            background: "#f8fafc",
            border: "1px solid #eef2f7",
            borderRadius: 6,
            margin: 0,
            padding: 10,
          }}
        >
          <Col xs={12} xl={2} lg={3} md={6}>
            <Form.Label className="small mb-1">Player</Form.Label>
            <Form.Control
              size="sm"
              placeholder="Name or phone..."
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
          </Col>
          <Col xs={6} xl={1} lg={2} md={3}>
            <Form.Label className="small mb-1">Gender</Form.Label>
            <CheckboxMultiSelect
              options={toSelectOptions(GENDER_OPTIONS)}
              value={filters.gender}
              onChange={(value) => updateFilter("gender", value)}
              placeholder={getMultiPlaceholder("All", filters.gender)}
            />
          </Col>
          <Col xs={6} xl={1} lg={2} md={3}>
            <Form.Label className="small mb-1">Residence</Form.Label>
            <CheckboxMultiSelect
              options={residenceDropdownOptions}
              value={filters.residence}
              onChange={(value) => updateFilter("residence", value)}
              placeholder={getMultiPlaceholder("All", filters.residence)}
            />
          </Col>
          <Col xs={6} xl={1} lg={2} md={3}>
            <Form.Label className="small mb-1">Skill</Form.Label>
            <CheckboxMultiSelect
              options={toSelectOptions(SKILL_LEVEL_OPTIONS)}
              value={filters.skillLevel}
              onChange={(value) => updateFilter("skillLevel", value)}
              placeholder={getMultiPlaceholder("All Levels", filters.skillLevel)}
            />
          </Col>
          <Col xs={12} xl={2} lg={3} md={4}>
            <Form.Label className="small mb-1">Club Preference</Form.Label>
            <CheckboxMultiSelect
              options={clubOptions}
              value={filters.clubId}
              onChange={(value) => updateFilter("clubId", value)}
              placeholder={getMultiPlaceholder("All Clubs", filters.clubId)}
            />
          </Col>
          <Col xs={12} xl={1} lg={2} md={4}>
            <Form.Label className="small mb-1">Day</Form.Label>
            <CheckboxMultiSelect
              options={toSelectOptions(DAY_OPTIONS)}
              value={filters.day}
              onChange={(value) => updateFilter("day", value)}
              placeholder={getMultiPlaceholder("Any", filters.day)}
            />
          </Col>
          <Col xs={12} xl={2} lg={3} md={4}>
            <Form.Label className="small mb-1">Time Slot</Form.Label>
            <CheckboxMultiSelect
              options={TIME_SLOT_GROUPS}
              value={filters.timeSlot}
              onChange={(value) => updateFilter("timeSlot", value)}
              placeholder={getMultiPlaceholder("Any Time", filters.timeSlot)}
            />
          </Col>
          <Col xs={8} xl={1} lg={2} md={8}>
            <Form.Label className="small mb-1">Prefs</Form.Label>
            <CheckboxMultiSelect
              options={[
                { value: "yes", label: "Saved" },
                { value: "no", label: "Missing" },
              ]}
              value={filters.hasPreference}
              onChange={(value) => updateFilter("hasPreference", value)}
              placeholder={getMultiPlaceholder("All", filters.hasPreference)}
            />
          </Col>
          <Col xs={4} xl={1} lg={2} md={4}>
            <Button size="sm" variant="outline-secondary" className="w-100" onClick={resetFilters}>
              Reset
            </Button>
          </Col>
        </Row>

        {loading ? (
          <DataLoading height="300px" />
        ) : players.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: 200 }}>
            No players found
          </div>
        ) : (
          <>
            <div className="d-none d-lg-block">
              <Table
                responsive
                borderless
                size="sm"
                className="custom-table align-middle"
                style={{ tableLayout: "fixed", minWidth: 1080 }}
              >
                <thead>
                  <tr>
                    <th className="text-center" style={{ width: 48 }}>#</th>
                    <th style={{ width: 245 }}>Player</th>
                    <th style={{ width: 92 }}>Gender</th>
                    <th style={{ width: 135 }}>Residence</th>
                    <th>Player Preferences</th>
                    <th className="text-center" style={{ width: 145 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((row, index) => {
                    const playerId = getPlayerId(row);
                    const isEditing = editingPreferencePlayerId === playerId;
                    return (
                      <React.Fragment key={row._id || playerId}>
                        <tr>
                          <td className="text-muted text-center">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                          <td style={{ minWidth: 0 }}>
                            <div className="fw-semibold text-truncate" style={{ fontSize: 13 }}>
                              {row.customerId?.name || "N/A"} {row.customerId?.lastName || ""}
                            </div>
                            <div className="text-muted text-truncate" style={{ fontSize: 12 }}>
                              {row.customerId?.countryCode || "+91"} {row.customerId?.phoneNumber || "N/A"}
                            </div>
                          </td>
                          <td>
                            {row.customerId?.gender ? (
                              <Badge bg="light" text="dark" className="border">{row.customerId.gender}</Badge>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>
                            <span className="text-muted text-truncate d-block" style={{ fontSize: 12 }}>
                              {row.customerId?.city || "N/A"}
                            </span>
                          </td>
                          <td>
                            {renderPreferenceSummary(row)}
                          </td>
                          <td className="text-center">
                            <div className="d-flex flex-column gap-1 align-items-center">
                              {selectedOpenMatch && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleRequestPlayer(row)}
                                    disabled={requestingPlayerId === playerId}
                                    style={{
                                      backgroundColor: "#1f41bb",
                                      border: "none",
                                      fontSize: 11,
                                      minWidth: 118,
                                    }}
                                  >
                                    {requestingPlayerId === playerId ? <ButtonLoading size={6} /> : "Request Match"}
                                  </Button>
                                  {paymentLinksByPlayerId[playerId]?.paymentLink ? (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline-success"
                                        onClick={() => handleCopyPaymentLink(playerId)}
                                        style={{ fontSize: 11, minWidth: 118 }}
                                      >
                                        Copy Link
                                      </Button>
                                      <span className="text-muted" style={{ fontSize: 11 }}>
                                        ₹{paymentLinksByPlayerId[playerId]?.paymentAmount || 0}
                                      </span>
                                    </>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline-primary"
                                      onClick={() => handleGeneratePaymentLink(row)}
                                      disabled={generatingLinkPlayerId === playerId}
                                      style={{ fontSize: 11, minWidth: 118 }}
                                    >
                                      {generatingLinkPlayerId === playerId ? <ButtonLoading size={6} color="blue" /> : "Generate Link"}
                                    </Button>
                                  )}
                                </>
                              )}
                            <Button
                              size="sm"
                              variant={isEditing ? "secondary" : "outline-primary"}
                              onClick={() => (isEditing ? closePreferenceEditor() : openPreferenceEditor(row))}
                              style={{ minWidth: 118 }}
                            >
                              {isEditing ? <><FaTimes size={12} className="me-1" />Cancel</> : <><FaEdit size={12} className="me-1" />Preferences</>}
                            </Button>
                            </div>
                          </td>
                        </tr>
                        {isEditing && renderPreferenceEditor(row)}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            <div className="d-block d-lg-none">
              {players.map((row) => {
                const playerId = getPlayerId(row);
                const isEditing = editingPreferencePlayerId === playerId;
                return (
                  <div key={row._id || playerId} className="card mb-2 border-0 shadow-sm">
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between gap-2 align-items-start">
                        <div style={{ minWidth: 0 }}>
                          <div className="fw-semibold text-truncate" style={{ fontSize: 13 }}>
                            {row.customerId?.name || "N/A"} {row.customerId?.lastName || ""}
                          </div>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            {row.customerId?.countryCode || "+91"} {row.customerId?.phoneNumber || "N/A"}
                          </div>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            Gender: {row.customerId?.gender || "N/A"}
                          </div>
                          <div className="text-muted text-truncate" style={{ fontSize: 12 }}>
                            Residence: {row.customerId?.city || "N/A"}
                          </div>
                        </div>
                        <div className="d-flex flex-column gap-1" style={{ flex: "0 0 auto" }}>
                          {selectedOpenMatch && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleRequestPlayer(row)}
                                disabled={requestingPlayerId === playerId}
                                style={{ backgroundColor: "#1f41bb", border: "none" }}
                              >
                                {requestingPlayerId === playerId ? <ButtonLoading size={6} /> : "Request"}
                              </Button>
                              {paymentLinksByPlayerId[playerId]?.paymentLink ? (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => handleCopyPaymentLink(playerId)}
                                >
                                  Copy Link
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => handleGeneratePaymentLink(row)}
                                  disabled={generatingLinkPlayerId === playerId}
                                >
                                  {generatingLinkPlayerId === playerId ? <ButtonLoading size={6} color="blue" /> : "Generate Link"}
                                </Button>
                              )}
                            </>
                          )}
                          <Button
                            size="sm"
                            variant={isEditing ? "secondary" : "outline-primary"}
                            onClick={() => (isEditing ? closePreferenceEditor() : openPreferenceEditor(row))}
                          >
                            {isEditing ? "Cancel" : "Preferences"}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        {renderPreferenceSummary(row)}
                      </div>
                      {isEditing && (
                        <div className="mt-3 p-2 rounded" style={{ background: "#f8fafc" }}>
                          <Row className="g-2">
                            <Col xs={12}>
                              <Form.Label className="small mb-1">Preferred Clubs</Form.Label>
                              <CheckboxMultiSelect
                                options={clubOptions}
                                value={preferenceForm.preferredClubs.map((club) => club.value)}
                                onChange={(values) => setPreferenceForm((form) => ({
                                  ...form,
                                  preferredClubs: selectValues(clubOptions, values),
                                }))}
                                placeholder={getMultiPlaceholder("Select clubs...", preferenceForm.preferredClubs)}
                              />
                            </Col>
                            <Col xs={12}>
                              <Form.Label className="small mb-1">Skill Level</Form.Label>
                              <Form.Select
                                size="sm"
                                value={preferenceForm.skillLevel}
                                onChange={(event) => setPreferenceForm((form) => ({ ...form, skillLevel: event.target.value }))}
                              >
                                <option value="">Select level</option>
                                {SKILL_LEVEL_OPTIONS.map((level) => <option key={level} value={level}>{level}</option>)}
                              </Form.Select>
                            </Col>
                            <Col xs={12}>
                              <Form.Label className="small mb-2">Schedule</Form.Label>
                              <ScheduleBuilder
                                value={preferenceForm.preferredSchedule}
                                onChange={(value) => setPreferenceForm((form) => ({ ...form, preferredSchedule: value }))}
                              />
                            </Col>
                            <Col xs={12}>
                              <Form.Label className="small mb-1">Player Tendency</Form.Label>
                              <Form.Control
                                size="sm"
                                placeholder="e.g. evening regular, last-minute, competitive"
                                value={preferenceForm.playerTendency}
                                onChange={(event) => setPreferenceForm((form) => ({ ...form, playerTendency: event.target.value }))}
                              />
                            </Col>
                            <Col xs={12}>
                              <Form.Control
                                size="sm"
                                placeholder="Optional notes"
                                value={preferenceForm.notes}
                                onChange={(event) => setPreferenceForm((form) => ({ ...form, notes: event.target.value }))}
                              />
                            </Col>
                            <Col xs={12} className="d-flex justify-content-end gap-2">
                              <Button size="sm" variant="outline-secondary" onClick={closePreferenceEditor}>Cancel</Button>
                              <Button
                                size="sm"
                                onClick={() => handleSavePreference(row)}
                                disabled={saveLoading}
                                style={{ backgroundColor: "#1f41bb", border: "none" }}
                              >
                                {saveLoading ? <ButtonLoading size={8} /> : "Save"}
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => loadPlayers(pagination.page - 1)}
                >
                  Prev
                </Button>
                <span className="align-self-center text-muted" style={{ fontSize: 13 }}>
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadPlayers(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Offcanvas
        show={showOpenMatchPanel}
        onHide={() => setShowOpenMatchPanel(false)}
        placement="end"
        backdrop={false}
        scroll
        className="player-preferences-open-match-panel"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700 }}>
            Open Matches
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex gap-2 mb-3">
            <Button
              size="sm"
              className="flex-fill"
              onClick={() => navigate("/admin/open-matches/create")}
              style={{ backgroundColor: "#1f41bb", border: "none", fontFamily: "Poppins", fontWeight: 600 }}
            >
              <FaPlus size={12} className="me-1" />Add Open Match
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={loadOpenMatches} disabled={openMatchesLoading}>
              Refresh
            </Button>
          </div>

          {openMatchesLoading ? (
            <DataLoading height="220px" />
          ) : openMatches.length === 0 ? (
            <div className="text-center text-muted py-5" style={{ fontSize: 13 }}>
              No open matches found.
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {openMatches.map((match) => {
                const joinedCount = match?.totalPlayers ?? (Number(match?.teamA?.length || 0) + Number(match?.teamB?.length || 0));
                const maxPlayers = match?.totalPlayersCount ?? match?.maxPlayers ?? 4;
                const fee = getMatchFee(match);
                const isSelected = selectedOpenMatch?._id === match?._id;

                return (
                  <button
                    key={match._id}
                    type="button"
                    onClick={() => handleOpenMatchSelect(match)}
                    className="text-start"
                    style={{
                      background: isSelected ? "#f0f4ff" : "#fff",
                      border: `1px solid ${isSelected ? "#1f41bb" : "#eef2f7"}`,
                      borderRadius: 6,
                      cursor: "pointer",
                      padding: 10,
                    }}
                  >
                    <div className="d-flex justify-content-between gap-2 align-items-start">
                      <div style={{ minWidth: 0 }}>
                        <div className="fw-semibold text-truncate" style={{ fontSize: 13 }}>
                          {getMatchClubName(match)}
                        </div>
                        <div className="text-muted text-truncate" style={{ fontSize: 12 }}>
                          {getMatchCourtName(match) || "Court N/A"}
                        </div>
                      </div>
                      <Badge bg={SKILL_COLORS[match?.skillLevel] || "light"} text={match?.skillLevel ? undefined : "dark"}>
                        {match?.skillLevel || "Any"}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between mt-2 text-muted" style={{ fontSize: 12 }}>
                      <span>{formatMatchDate(match)}</span>
                      <span>{getMatchTime(match)}</span>
                    </div>
                    <div className="d-flex justify-content-between mt-2" style={{ fontSize: 12 }}>
                      <span className="text-muted">Players {joinedCount}/{maxPlayers}</span>
                      <span className="fw-semibold text-success">Payable ₹{fee.payable || 0}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <Modal show={showPlayerModal} onHide={closeAddPlayer} size="md" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontFamily: "Poppins", fontSize: 16 }}>Add Player</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSavePlayer}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="number"
                  placeholder="e.g. 9876543210"
                  value={playerForm.phoneNumber}
                  onChange={(event) => {
                    setPlayerForm((form) => ({ ...form, phoneNumber: event.target.value }));
                    setPhoneSubmitted(false);
                  }}
                  isInvalid={!!playerFormErrors.phoneNumber}
                />
                <Button
                  type="button"
                  variant="outline-primary"
                  onClick={handleLookup}
                  disabled={lookupLoading || !String(playerForm.phoneNumber || "").trim()}
                  style={{ minWidth: 92 }}
                >
                  {lookupLoading ? <ButtonLoading size={8} color="blue" /> : <><FaSearch size={12} /> Lookup</>}
                </Button>
              </div>
              <Form.Control.Feedback type="invalid">{playerFormErrors.phoneNumber}</Form.Control.Feedback>
            </Form.Group>

            {phoneSubmitted && (
              <div
                className="p-2 mb-3 rounded d-flex align-items-center justify-content-between"
                style={{
                  background: lookupResult?.exists ? "#f0f4ff" : "#fff8e6",
                  border: `1px solid ${lookupResult?.exists ? "#c7d3f8" : "#ffc107"}`,
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  {lookupResult?.exists ? <FaUser size={13} color="#1f41bb" /> : <FaPhone size={13} color="#b58100" />}
                  <span className="small">
                    {lookupResult?.exists ? "Existing player found. You can update details." : "New player. Fill details to add."}
                  </span>
                </div>
                <Badge bg={lookupResult?.exists ? "success" : "warning"} text={lookupResult?.exists ? undefined : "dark"}>
                  {lookupResult?.exists ? "Found" : "New"}
                </Badge>
              </div>
            )}

            <Row>
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    placeholder="Player name"
                    value={playerForm.name}
                    onChange={(event) => setPlayerForm((form) => ({ ...form, name: event.target.value }))}
                    isInvalid={!!playerFormErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">{playerFormErrors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-muted">(optional)</span></Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="email@example.com"
                    value={playerForm.email}
                    onChange={(event) => setPlayerForm((form) => ({ ...form, email: event.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    value={playerForm.gender}
                    onChange={(event) => setPlayerForm((form) => ({ ...form, gender: event.target.value }))}
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label>Residence</Form.Label>
                  <Form.Select
                    value={playerForm.residence}
                    onChange={(event) => setPlayerForm((form) => ({ ...form, residence: event.target.value }))}
                  >
                    <option value="">Select residence</option>
                    {residenceDropdownOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeAddPlayer} disabled={saveLoading}>
              {lookupResult?.exists ? "Cancel Update" : "Cancel"}
            </Button>
            <Button type="submit" disabled={saveLoading} style={{ backgroundColor: "#1f41bb", border: "none" }}>
              {saveLoading ? <ButtonLoading size={8} /> : (lookupResult?.exists ? "Update Player" : "Add Player")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default PlayerPreferences;
