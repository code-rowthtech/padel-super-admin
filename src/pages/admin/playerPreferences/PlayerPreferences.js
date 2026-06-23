import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button, Col, Container, Dropdown, Form, Modal, OverlayTrigger, Row, Table, Tooltip } from "react-bootstrap";
import { FaCheck, FaEdit, FaFilter, FaPhone, FaPlus, FaRegEye, FaSave, FaSearch, FaTimes, FaUser } from "react-icons/fa";
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
import PlayerFiltersPanel from "./PlayerFiltersPanel";
import CreateMatchModal from "../openMatches/create/CreateMatchModal";
import PlayerDetailsModal from "./PlayerDetailsModal";
import { showError, showSuccess } from "../../../helpers/Toast";
import { getCategoryList } from "../../../redux/thunks";

const TIME_SLOT_GROUPS = [
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
  {
    label: "120 Minutes",
    options: [
      "5:00 AM – 7:00 AM",
      "6:00 AM – 8:00 AM",
      "7:00 AM – 9:00 AM",
      "8:00 AM – 10:00 AM",
      "9:00 AM – 11:00 AM",
      "10:00 AM – 12:00 PM",
      "11:00 AM – 1:00 PM",
      "12:00 PM – 2:00 PM",
      "1:00 PM – 3:00 PM",
      "2:00 PM – 4:00 PM",
      "3:00 PM – 5:00 PM",
      "4:00 PM – 6:00 PM",
      "5:00 PM – 7:00 PM",
      "6:00 PM – 8:00 PM",
      "7:00 PM – 9:00 PM",
      "8:00 PM – 10:00 PM",
      "9:00 PM – 11:00 PM",
      "10:00 PM – 12:00 AM",
    ].map((value) => ({ value, label: value })),
  }
];

const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SKILL_LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Professional"];
const GENDER_OPTIONS = ["Male", "Female", "Other"];
const SCHEDULE_TIME_SLOT_GROUPS = TIME_SLOT_GROUPS.filter((group) => group.label === "60 Minutes");
const SKILL_COLORS = { Beginner: "success", Intermediate: "warning", Advanced: "danger", Professional: "dark" };
const EMPTY_PREFERENCE_FORM = {
  preferredClubs: [],
  preferredSchedule: [],
  skillLevel: "",
  residence: "",
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
  preferredDuration: [],
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
  const platformFee = Number(match?.platformFee || 1);
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
  // Handle both string and object formats
  const getSlotValue = (slot) => (typeof slot === 'string' ? slot : slot?.value || slot?.label || slot);
  const firstSlot = getSlotValue(slots[0]);
  const lastSlot = getSlotValue(slots[slots.length - 1]);
  const firstParts = normalizeTimeSlotText(firstSlot).split("-");
  const lastParts = normalizeTimeSlotText(lastSlot).split("-");
  const start = firstParts[0]?.trim();
  const end = (lastParts[1] || lastParts[0])?.trim();
  return start && end ? `${start} - ${end}` : firstSlot;
};

const formatScheduleSummary = (preferredSchedule = [], maxRows = 2) => {
  if (!preferredSchedule.length) return <span className="text-muted">No schedule</span>;

  return (
    <div className="d-flex flex-wrap gap-1 justify-content-center">
      {preferredSchedule.map((entry, index) => {
        const dayAbbr = entry.day.slice(0, 3);
        const timeSlots = entry.timeSlots || [];
        const getSlotValue = (slot) => (typeof slot === 'string' ? slot : slot?.value || slot?.label || slot);
        const timeRange = timeSlots.length
          ? timeSlots.map(getSlotValue).join(", ")
          : "Any time";

        const tooltipContent = (
          <div>
            <div className="fw-bold mb-1">{entry.day}</div>
            <div style={{ fontSize: 11 }}>{timeRange}</div>
          </div>
        );

        return (
          <OverlayTrigger
            key={`${entry.day}-${index}`}
            placement="top"
            overlay={<Tooltip id={`tooltip-${entry.day}-${index}`}>{tooltipContent}</Tooltip>}
          >
            <span
              style={{
                background: "rgba(31,65,187,0.12)",
                borderRadius: 4,
                color: "#1f41bb",
                cursor: "help",
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 8px",
                whiteSpace: "nowrap",
              }}
            >
              {dayAbbr}
            </span>
          </OverlayTrigger>
        );
      })}
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
              options={SCHEDULE_TIME_SLOT_GROUPS}
              value={(entry.timeSlots || []).map((slot) => (
                typeof slot === "string" ? slot : slot?.value || slot?.label || slot
              ))}
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
  const categoryList = useSelector((state) => state?.booking?.categoryList) || [];
  const [clubOptions, setClubOptions] = useState([]);
  const [residenceStateOptions, setResidenceStateOptions] = useState([]);
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
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showCreateMatchModal, setShowCreateMatchModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleModalData, setScheduleModalData] = useState({ schedule: [], playerId: "" });
  const [matchSearchQuery, setMatchSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState(false);
  const [callConfirm, setCallConfirm] = useState({ show: false, row: null, nextValue: false, loading: false });
  const [durationConfirm, setDurationConfirm] = useState({ show: false, row: null, field: null, loading: false });
  const [openDropdownKey, setOpenDropdownKey] = useState(null); // Track which dropdown is open
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [selectedPlayerForAdd, setSelectedPlayerForAdd] = useState(null);
  const [addingPlayerToMatch, setAddingPlayerToMatch] = useState(false);
  const [selectedPlayerDetails, setSelectedPlayerDetails] = useState(null);
  const filterButtonRef = React.useRef(null);
  const scrollContainerRef = React.useRef(null);
  const autoScrollRef = React.useRef(null);
  const scrollPausedRef = React.useRef(false);


  useEffect(() => {
    dispatch(getCategoryList());
  }, [dispatch]);

  // ref callback — fires the moment the DOM node is assigned or removed.
  // Starts the RAF loop as soon as the container exists in the DOM.
  const setScrollContainer = React.useCallback((node) => {
    // Cleanup previous node
    if (scrollContainerRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
      scrollContainerRef.current.removeEventListener("mouseenter", scrollContainerRef._onEnter);
      scrollContainerRef.current.removeEventListener("mouseleave", scrollContainerRef._onLeave);
    }

    scrollContainerRef.current = node;

    if (!node) return;

    const onEnter = () => { scrollPausedRef.current = true; };
    const onLeave = () => { scrollPausedRef.current = false; };
    scrollContainerRef._onEnter = onEnter;
    scrollContainerRef._onLeave = onLeave;
    node.addEventListener("mouseenter", onEnter);
    node.addEventListener("mouseleave", onLeave);

    const step = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const isSearching = !!scrollContainerRef._isSearchFocused;
      const hasSelected = !!scrollContainerRef._selectedMatch;

      if (!isSearching && !hasSelected && !scrollPausedRef.current) {
        const half = container.scrollHeight / 2;
        if (half > container.clientHeight) {
          container.scrollTop += 0.5;
          if (container.scrollTop >= half) {
            container.scrollTop -= half;
          }
        }
      }
      autoScrollRef.current = requestAnimationFrame(step);
    };

    autoScrollRef.current = requestAnimationFrame(step);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep side-channel refs updated each render so the RAF reads fresh values
  scrollContainerRef._isSearchFocused = isSearchFocused;
  scrollContainerRef._selectedMatch = selectedOpenMatch;

  useEffect(() => {
    ownerApi.get(SUPER_ADMIN_GET_ALL_CLUBS).then((res) => {
      const responseData = res.data?.data;
      const list = responseData?.clubs || (Array.isArray(responseData) ? responseData : []);
      const states = res.data?.states || responseData?.states || [];
      setClubOptions(list.map((club) => ({ value: club._id, label: club.clubName || club.name })));
      setResidenceStateOptions(
        states
          .filter((state) => state?._id && state?.name && state.isActive !== false)
          .map((state) => ({ value: state._id, label: state.name })),
      );
    }).catch(() => { });
  }, []);

  const residenceDropdownOptions = useMemo(() => {
    const uniqueOptions = new Map();
    const sourceOptions = residenceStateOptions.length
      ? residenceStateOptions
      : (residenceOptions || []).map((residence) => ({ value: residence, label: residence }));
    sourceOptions.forEach((option) => {
      if (option?.value) uniqueOptions.set(option.value, option);
    });
    return [...uniqueOptions.values()];
  }, [residenceOptions, residenceStateOptions]);

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
      limit: 25,
      search: filters.search,
      skillLevel: filters.skillLevel,
      gender: filters.gender,
      residence: filters.residence,
      clubId: filters.clubId,
      day: filters.day,
      timeSlot: filters.timeSlot,
      hasPreference: filters.hasPreference,
      is60: filters.preferredDuration?.includes("is60") || undefined,
      is90: filters.preferredDuration?.includes("is90") || undefined,
      is120: filters.preferredDuration?.includes("is120") || undefined,
    }));
  }, [dispatch, filters]);

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

  const loadOpenMatches = useCallback(async (searchQuery = "") => {
    setOpenMatchesLoading(true);
    try {
      const searchParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery)}` : "";
      const res = await ownerApi.get(`${SUPER_ADMIN_OPEN_MATCH_OVERVIEW}?page=1&limit=50${searchParam}&playerPreferences=true`);
      const payload = res?.data?.data || res?.data || {};
      setOpenMatches(payload?.openMatches || payload?.data || []);
    } catch (error) {
      setOpenMatches([]);
    } finally {
      setOpenMatchesLoading(false);
    }
  }, []);

  // Debounce search for open matches
  useEffect(() => {
    const timer = setTimeout(() => {
      loadOpenMatches(matchSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [matchSearchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

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
        platformFee: 1,
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

  const handleViewPlayerDetails = (row) => {
    setSelectedPlayerDetails(row);
    setShowPlayerDetailsModal(true);
  };

  const closePlayerDetailsModal = () => {
    setShowPlayerDetailsModal(false);
    setSelectedPlayerDetails(null);
  };

  const handleAddPlayerToMatch = async () => {
    if (!selectedPlayerForAdd) return;

    const { player, match, team, slotIndex } = selectedPlayerForAdd;
    const playerId = player._id || player.customerId?._id;
    const matchId = match._id;

    // Convert team letter to API format (A -> teamA, B -> teamB)
    const teamName = team === 'A' ? 'teamA' : 'teamB';

    setAddingPlayerToMatch(true);
    try {
      const response = await ownerApi.post('/openmatch/addPlayerToMatch', {
        matchId,
        playerId,
        team: teamName
      });

      if (response.data) {
        // Success - refresh the open matches list
        await loadOpenMatches();
        setShowAddPlayerModal(false);
        setSelectedPlayerForAdd(null);

        // Show success message
        showSuccess(`Player added to ${team === 'A' ? 'Team A' : 'Team B'} successfully!`);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add player to match. Please try again.');
    } finally {
      setAddingPlayerToMatch(false);
    }
  };

  const handleDurationToggle = (row, field) => {
    if (!row?.preferenceId) return;
    setDurationConfirm({ show: true, row, field, loading: false });
  };

  const handleDurationConfirm = async () => {
    const { row, field } = durationConfirm;
    if (!row?.preferenceId || !field) return;
    setDurationConfirm((c) => ({ ...c, loading: true }));

    const current = row.preferredDuration || {};
    const nextDuration = {
      is60: field === "is60" ? !current.is60 : (current.is60 === true),
      is90: field === "is90" ? !current.is90 : (current.is90 === true),
      is120: field === "is120" ? !current.is120 : (current.is120 === true),
    };

    const payload = {
      preferredClubs: (row.preferredClubs || []).map((club) =>
        typeof club === "string" ? club : club._id,
      ),
      preferredSchedule: (row.preferredSchedule || []).map((entry) => ({
        day: entry.day,
        timeSlots: (entry.timeSlots || []).map((slot) =>
          typeof slot === "string" ? slot : slot.value || slot.label || slot,
        ),
      })),
      skillLevel: row.skillLevel || undefined,
      city: row.customerId?.city || undefined,
      notes: row.notes || undefined,
      playerTendency: row.playerTendency || undefined,
      preferredDuration: nextDuration,
    };

    try {
      const result = await dispatch(updatePlayerPreference({ id: row.preferenceId, data: payload }));
      if (!result.error) loadPlayers(pagination.page);
    } catch { /* error toast handled in thunk */ } finally {
      setDurationConfirm({ show: false, row: null, field: null, loading: false });
    }
  };

  const handleCallStatusClick = (row) => {
    const nextValue = !row.isCalled;
    setCallConfirm({ show: true, row, nextValue, loading: false });
  };

  const handleCallStatusConfirm = async () => {
    const { row, nextValue } = callConfirm;
    setCallConfirm((c) => ({ ...c, loading: true }));
    try {
      // Build the same full payload shape that handleSavePreference uses,
      // so the API doesn't reject unknown / missing fields.
      const payload = {
        preferredClubs: (row.preferredClubs || []).map((club) =>
          typeof club === "string" ? club : club._id,
        ),
        preferredSchedule: (row.preferredSchedule || []).map((entry) => ({
          day: entry.day,
          timeSlots: (entry.timeSlots || []).map((slot) =>
            typeof slot === "string" ? slot : slot.value || slot.label || slot,
          ),
        })),
        skillLevel: row.skillLevel || undefined,
        city: row.customerId?.city || undefined,
        notes: row.notes || undefined,
        playerTendency: row.playerTendency || undefined,
        isCalled: nextValue,
      };

      let result;
      if (row?.preferenceId) {
        result = await dispatch(updatePlayerPreference({ id: row.preferenceId, data: payload }));
      } else {
        result = await dispatch(createPlayerPreference({
          phoneNumber: Number(row.customerId?.phoneNumber),
          ...payload,
        }));
      }

      // Only reload on success — thunk already shows error toast on failure
      if (!result.error) {
        loadPlayers(pagination.page);
      }
    } catch {
      // swallow — error toast is handled inside the thunk
    } finally {
      setCallConfirm({ show: false, row: null, nextValue: false, loading: false });
    }
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

  // Auto-lookup when phone number reaches 10 digits
  useEffect(() => {
    const phone = String(playerForm.phoneNumber || "").trim();

    // If phone number is modified after a successful lookup, reset the form
    if (phoneSubmitted && phone.length !== 10) {
      setPhoneSubmitted(false);
      setPlayerForm((current) => ({
        ...current,
        name: "",
        email: "",
        gender: "",
        residence: "",
      }));
      setPlayerFormErrors({});
      dispatch(resetLookup());
    }

    // Auto-lookup when exactly 10 digits
    if (phone.length === 10 && !phoneSubmitted && !lookupLoading) {
      handleLookup();
    }
  }, [playerForm.phoneNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSavePlayer = async (event) => {
    event.preventDefault();

    const errors = {};
    const phone = String(playerForm.phoneNumber || "").trim();

    if (!phone) {
      errors.phoneNumber = "Phone number is required";
    } else if (phone.length !== 10) {
      errors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    if (!String(playerForm.name || "").trim()) errors.name = "Name is required";

    if (Object.keys(errors).length) {
      setPlayerFormErrors(errors);
      return;
    }

    const result = await dispatch(createPlayerPreference({
      phoneNumber: Number(phone),
      name: playerForm.name.trim(),
      email: playerForm.email.trim() || undefined,
      gender: playerForm.gender || undefined,
      city: playerForm.residence.trim() || undefined,
    }));

    if (!result.error) {
      closeAddPlayer();
      loadPlayers(1);
    }
  };

  const handleEditPreference = (row) => {
    const playerId = getPlayerId(row);
    setEditingPreferencePlayerId(playerId);
    setPreferenceForm({
      preferredClubs: (row.preferredClubs || []).map((club) => ({
        value: club._id,
        label: club.clubName || club.name,
      })),
      preferredSchedule: (row.preferredSchedule || []).map((entry) => ({
        day: entry.day,
        timeSlots: (entry.timeSlots || []).map((slot) => {
          const value = typeof slot === "string" ? slot : slot?.value || slot?.label || slot;
          return { value, label: value };
        }),
      })),
      skillLevel: row.skillLevel || "",
      residence: row.customerId?.city || "",
      notes: row.notes || "",
      playerTendency: row.playerTendency || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingPreferencePlayerId("");
    setPreferenceForm(EMPTY_PREFERENCE_FORM);
  };

  const handleSavePreference = async (row) => {
    const payload = {
      preferredClubs: preferenceForm.preferredClubs.map((option) => option.value),
      preferredSchedule: preferenceForm.preferredSchedule.map((entry) => ({
        day: entry.day,
        timeSlots: entry.timeSlots.map((slot) => (
          typeof slot === "string" ? slot : slot?.value || slot?.label || slot
        )),
      })),
      skillLevel: preferenceForm.skillLevel || undefined,
      city: preferenceForm.residence || undefined,
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
      handleCancelEdit();
      loadPlayers(pagination.page);
    }
  };

  const openScheduleModal = (row) => {
    setScheduleModalData({
      schedule: preferenceForm.preferredSchedule,
      playerId: getPlayerId(row),
      row: row,
    });
    setShowScheduleModal(true);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setScheduleModalData({ schedule: [], playerId: "", row: null });
  };

  const handleSaveScheduleFromModal = () => {
    setPreferenceForm((form) => ({
      ...form,
      preferredSchedule: scheduleModalData.schedule,
    }));
    closeScheduleModal();
  };

  return (
    <Container fluid className="player-preferences-workspace px-0 px-md-0 mt-md-0 mt-2">
      <style>
        {`
          .open-matches-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .open-matches-list .clone-list {
            pointer-events: none;
          }

          .custom-dropdown-toggle {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
          }

          .custom-dropdown-toggle:hover,
          .custom-dropdown-toggle:focus,
          .custom-dropdown-toggle:active {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
          }

          .custom-dropdown-toggle::after {
            display: none !important;
          }
        `}
      </style>
      <Row className="g-3">
        {/* Player Table - col-9 */}
        <Col lg={10} xs={12}>
          <div className="bg-white rounded shadow-sm p-md-3 p-2 h-100">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <h6 className="mb-1 tabel-title">Players</h6>
              </div>
              <div className="d-flex gap-2 flex-wrap align-items-center" style={{ position: "relative" }}>
                <Form.Select
                  value={filters.categoryType}
                  onChange={(e) => updateFilter("categoryType", e.target.value)}
                  style={{ fontFamily: "Poppins", fontSize: 13, width: 180 }}>
                  <option value=''>All Categories</option>
                  {categoryList?.map((category) => (
                    <option value={category?._id} key={category?._id}>{category?.name}</option>
                  ))}
                </Form.Select>
                <Form.Control
                  size="sm"
                  placeholder="Search players..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  style={{ fontFamily: "Poppins", fontSize: 13, width: 180 }}
                />
                <Button
                  ref={filterButtonRef}
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  style={{ fontFamily: "Poppins", fontWeight: 600 }}
                >
                  <FaFilter size={12} className="me-1" />
                  Filters
                  {(filters.gender?.length > 0 || filters.residence?.length > 0 ||
                    filters.skillLevel?.length > 0 || filters.clubId?.length > 0 || filters.day?.length > 0 ||
                    filters.timeSlot?.length > 0 || filters.hasPreference?.length > 0 ||
                    filters.preferredDuration?.length > 0) && (
                      <Badge bg="danger" className="ms-1" style={{ fontSize: 9 }}>
                        {[
                          filters.gender?.length || 0,
                          filters.residence?.length || 0,
                          filters.skillLevel?.length || 0,
                          filters.clubId?.length || 0,
                          filters.day?.length || 0,
                          filters.timeSlot?.length || 0,
                          filters.hasPreference?.length || 0,
                          filters.preferredDuration?.length || 0,
                        ].reduce((a, b) => a + (b > 0 ? 1 : 0), 0)}
                      </Badge>
                    )}
                </Button>
                <PlayerFiltersPanel
                  show={showFiltersPanel}
                  onHide={() => setShowFiltersPanel(false)}
                  filters={filters}
                  onFilterChange={updateFilter}
                  onReset={resetFilters}
                  clubOptions={clubOptions}
                  residenceDropdownOptions={residenceDropdownOptions}
                  CheckboxMultiSelect={CheckboxMultiSelect}
                  toSelectOptions={toSelectOptions}
                  getMultiPlaceholder={getMultiPlaceholder}
                  TIME_SLOT_GROUPS={TIME_SLOT_GROUPS}
                  DAY_OPTIONS={DAY_OPTIONS}
                  SKILL_LEVEL_OPTIONS={SKILL_LEVEL_OPTIONS}
                  GENDER_OPTIONS={GENDER_OPTIONS}
                  anchorRef={filterButtonRef}
                />
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => setShowOpenMatchPanel(true)}
                  style={{ fontFamily: "Poppins", fontWeight: 600 }}
                  className="d-lg-none"
                >
                  Open Match
                </Button>
                <Button
                  size="sm"
                  onClick={openAddPlayer}
                  style={{ backgroundColor: "#1f41bb", border: "none", fontFamily: "Poppins", fontWeight: 600 }}
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
                    Player payable estimate: ₹{selectedMatchFee?.share || 0} match share + ₹{selectedMatchFee?.platformFee || 1} platform fee + ₹{selectedMatchFee?.gstOnPlatformFee || 0.18} GST = ₹{selectedMatchFee?.payable || 0}
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
                      <th style={{ width: 200 }}>Player</th>
                      <th style={{ width: 85 }}>Gender</th>
                      <th style={{ width: 120 }}>Residence</th>
                      <th style={{ width: 200 }}>Preferred Clubs</th>
                      <th style={{ width: 120 }}>Skill Level</th>
                      <th className='pe-2' style={{ width: 200 }}>Schedule</th>
                      <th style={{ width: 130 }}>Duration</th>
                      <th className="text-center" style={{ width: 100 }}>Intro Call</th>
                      <th className="text-center" style={{ width: 145 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={10}>
                          <DataLoading height="240px" />
                        </td>
                      </tr>
                    ) : players.length === 0 ? (
                      <tr>
                        <td colSpan={10}>
                          <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: 200 }}>
                            No players found
                          </div>
                        </td>
                      </tr>
                    ) : players.map((row, index) => {
                      const playerId = getPlayerId(row);
                      const isEditing = editingPreferencePlayerId === playerId;
                      return (
                        <tr key={row._id || playerId}>
                          <td className="text-muted text-center">{(pagination.page - 1) * 25 + index + 1}</td>
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
                            {isEditing ? (
                              <Form.Select
                                size="sm"
                                value={preferenceForm.residence}
                                onChange={(event) => setPreferenceForm((form) => ({ ...form, residence: event.target.value }))}
                                style={{ fontSize: 12 }}
                              >
                                <option value="">Select residence</option>
                                {residenceDropdownOptions.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </Form.Select>
                            ) : row.customerId?.city ? (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>{row?.customerId?.cityName || row.customerId.city}</Tooltip>}
                              >
                                <span className="text-muted text-truncate d-block" style={{ fontSize: 12, cursor: 'help' }}>
                                  {row?.customerId?.cityName || row.customerId.city}
                                </span>
                              </OverlayTrigger>
                            ) : (
                              <span className="text-muted" style={{ fontSize: 12 }}>N/A</span>
                            )}
                          </td>
                          <td style={{ minWidth: 0 }}>
                            {isEditing ? (
                              <CheckboxMultiSelect
                                options={clubOptions}
                                value={preferenceForm.preferredClubs.map((club) => club.value)}
                                onChange={(values) => setPreferenceForm((form) => ({
                                  ...form,
                                  preferredClubs: selectValues(clubOptions, values),
                                }))}
                                placeholder={getMultiPlaceholder("Select clubs...", preferenceForm.preferredClubs)}
                              />
                            ) : (
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip>
                                    {(row.preferredClubs || []).map((club) => club.clubName || club.name).filter(Boolean).join(", ") || "No clubs"}
                                  </Tooltip>
                                }
                              >
                                <span className="text-muted text-truncate d-block" style={{ fontSize: 12, cursor: 'help' }}>
                                  {(row.preferredClubs || []).map((club) => club.clubName || club.name).filter(Boolean).join(", ") || "No clubs"}
                                </span>
                              </OverlayTrigger>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <Form.Select
                                size="sm"
                                value={preferenceForm.skillLevel}
                                onChange={(event) => setPreferenceForm((form) => ({ ...form, skillLevel: event.target.value }))}
                              >
                                <option value="">Select level</option>
                                {SKILL_LEVEL_OPTIONS.map((level) => <option key={level} value={level}>{level}</option>)}
                              </Form.Select>
                            ) : row.skillLevel === "Beginner" ? (
                              <Form.Select
                                size="sm"
                                value={row.skillLevel}
                                onChange={async (event) => {
                                  const newSkillLevel = event.target.value;
                                  if (row.preferenceId) {
                                    await dispatch(updatePlayerPreference({
                                      id: row.preferenceId,
                                      data: { skillLevel: newSkillLevel }
                                    }));
                                    loadPlayers(pagination.page);
                                  }
                                }}
                                style={{ fontSize: 12 }}
                              >
                                {SKILL_LEVEL_OPTIONS.map((level) => <option key={level} value={level}>{level}</option>)}
                              </Form.Select>
                            ) : row.skillLevel ? (
                              <Badge bg={SKILL_COLORS[row.skillLevel] || "secondary"}>{row.skillLevel}</Badge>
                            ) : (
                              <span className="text-muted">No level</span>
                            )}
                          </td>
                          <td style={{ minWidth: 0 }}>
                            {isEditing ? (
                              <div className="d-flex align-items-center gap-2">
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {formatScheduleSummary(preferenceForm.preferredSchedule, 2)}
                                </div>
                                <FaEdit
                                  onClick={() => openScheduleModal(row)}
                                  size={13} className="text-info" />
                              </div>
                            ) : (
                              formatScheduleSummary(row.preferredSchedule, 2)
                            )}
                          </td>
                          {/* Duration column — always-editable inline toggles */}
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {[
                                { field: "is60", label: "60 min", activeBg: "#EFF6FF", activeBorder: "#BFDBFE", activeColor: "#1D4ED8" },
                                { field: "is90", label: "90 min", activeBg: "#F5F3FF", activeBorder: "#DDD6FE", activeColor: "#6D28D9" },
                                { field: "is120", label: "120 min", activeBg: "#ECFDF5", activeBorder: "#BBF7D0", activeColor: "#047857" },
                              ].map(({ field, label, activeBg, activeBorder, activeColor }) => {
                                const active = !!row.preferredDuration?.[field];
                                return (
                                  <button
                                    key={field}
                                    type="button"
                                    disabled={!row.preferenceId}
                                    onClick={() => handleDurationToggle(row, field)}
                                    title={row.preferenceId ? (active ? `Remove ${label}` : `Add ${label}`) : "No preference record"}
                                    style={{
                                      background: active ? activeBg : "#F8FAFC",
                                      border: `1.5px solid ${active ? activeBorder : "#E2E8F0"}`,
                                      borderRadius: 20,
                                      color: active ? activeColor : "#94A3B8",
                                      // cursor: "pointer",
                                      cursor: row.preferenceId ? "pointer" : "not-allowed",
                                      fontSize: 11,
                                      fontWeight: active ? 600 : 400,
                                      opacity: row.preferenceId ? 1 : 0.5,
                                      padding: "3px 10px",
                                      transition: "all 0.12s",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              onClick={() => handleCallStatusClick(row)}
                              title={row.isCalled ? "Mark as not called" : "Mark as called"}
                              style={{
                                alignItems: "center",
                                background: row.isCalled ? "#ECFDF5" : "#F8FAFC",
                                border: `1.5px solid ${row.isCalled ? "#6EE7B7" : "#CBD5E1"}`,
                                borderRadius: 8,
                                color: row.isCalled ? "#059669" : "#94A3B8",
                                cursor: "pointer",
                                display: "inline-flex",
                                height: 28,
                                justifyContent: "center",
                                transition: "all 0.15s",
                                width: 28,
                              }}
                            >
                              <FaCheck size={11} />
                            </button>
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
                              {isEditing ? (
                                <div className="d-flex gap-2">
                                  <FaTimes onClick={handleCancelEdit} size={13} style={{ cursor: 'pointer' }} className="text-danger" />
                                  <FaSave onClick={() => handleSavePreference(row)} size={13} style={{ cursor: 'pointer' }} className="text-success" />
                                </div>
                              ) : (
                                <div className="d-flex gap-2">
                                  <FaRegEye onClick={() => handleViewPlayerDetails(row)} className="text-info" size={13} style={{ cursor: 'pointer' }} />
                                  <FaEdit onClick={() => handleEditPreference(row)} className="text-primary" size={13} style={{ cursor: 'pointer' }} />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              <div className="d-block d-lg-none">
                {loading ? (
                  <DataLoading height="240px" />
                ) : players.length === 0 ? (
                  <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: 200 }}>
                    No players found
                  </div>
                ) : players.map((row) => {
                  const playerId = getPlayerId(row);
                  const isEditing = editingPreferencePlayerId === playerId;
                  return (
                    <div key={row._id || playerId} className="card mb-2 border-0 shadow-sm">
                      <div className="card-body p-2">
                        <div className="d-flex justify-content-between gap-2 align-items-start mb-2">
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
                            {isEditing ? (
                              <Form.Select
                                size="sm"
                                value={preferenceForm.residence}
                                onChange={(event) => setPreferenceForm((form) => ({ ...form, residence: event.target.value }))}
                                className="mt-1"
                                style={{ fontSize: 12 }}
                              >
                                <option value="">Select residence</option>
                                {residenceDropdownOptions.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </Form.Select>
                            ) : (
                              <div className="text-muted text-truncate" style={{ fontSize: 12 }}>
                                Residence: {row.customerId?.cityName || row.customerId?.city || "N/A"}
                              </div>
                            )}
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
                          </div>
                        </div>

                        <div className="border-top pt-2">
                          <Row className="g-2">
                            <Col xs={12}>
                              <Form.Label className="small mb-1 fw-semibold">Preferred Clubs</Form.Label>
                              {isEditing ? (
                                <CheckboxMultiSelect
                                  options={clubOptions}
                                  value={preferenceForm.preferredClubs.map((club) => club.value)}
                                  onChange={(values) => setPreferenceForm((form) => ({
                                    ...form,
                                    preferredClubs: selectValues(clubOptions, values),
                                  }))}
                                  placeholder={getMultiPlaceholder("Select clubs...", preferenceForm.preferredClubs)}
                                />
                              ) : (
                                <div className="text-muted" style={{ fontSize: 12 }}>
                                  {(row.preferredClubs || []).map((club) => club.clubName || club.name).filter(Boolean).join(", ") || "No clubs"}
                                </div>
                              )}
                            </Col>
                            <Col xs={12}>
                              <Form.Label className="small mb-1 fw-semibold">Skill Level</Form.Label>
                              {isEditing ? (
                                <Form.Select
                                  size="sm"
                                  value={preferenceForm.skillLevel}
                                  onChange={(event) => setPreferenceForm((form) => ({ ...form, skillLevel: event.target.value }))}
                                >
                                  <option value="">Select level</option>
                                  {SKILL_LEVEL_OPTIONS.map((level) => <option key={level} value={level}>{level}</option>)}
                                </Form.Select>
                              ) : row.skillLevel ? (
                                <Badge bg={SKILL_COLORS[row.skillLevel] || "secondary"}>{row.skillLevel}</Badge>
                              ) : (
                                <span className="text-muted">No level</span>
                              )}
                            </Col>
                            <Col xs={12}>
                              <Form.Label className="small mb-1 fw-semibold">Schedule</Form.Label>
                              {isEditing ? (
                                <div className="d-flex align-items-start gap-2">
                                  <div style={{ flex: 1 }}>
                                    {formatScheduleSummary(preferenceForm.preferredSchedule, 3)}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() => openScheduleModal(row)}
                                    title="Edit Schedule"
                                  >
                                    <FaEdit size={12} />
                                  </Button>
                                </div>
                              ) : (
                                formatScheduleSummary(row.preferredSchedule, 3)
                              )}
                            </Col>
                            <Col xs={12}>
                              <Form.Label className="small mb-1 fw-semibold">Player Tendency</Form.Label>
                              {isEditing ? (
                                <Form.Control
                                  size="sm"
                                  placeholder="e.g. evening regular, last-minute, competitive"
                                  value={preferenceForm.playerTendency}
                                  onChange={(event) => setPreferenceForm((form) => ({ ...form, playerTendency: event.target.value }))}
                                />
                              ) : (
                                <div className="text-muted" style={{ fontSize: 12 }}>
                                  {row.playerTendency || "N/A"}
                                </div>
                              )}
                            </Col>
                            <Col xs={12}>
                              <Form.Label className="small mb-1 fw-semibold">Notes</Form.Label>
                              {isEditing ? (
                                <Form.Control
                                  size="sm"
                                  placeholder="Optional notes"
                                  value={preferenceForm.notes}
                                  onChange={(event) => setPreferenceForm((form) => ({ ...form, notes: event.target.value }))}
                                />
                              ) : (
                                <div className="text-muted" style={{ fontSize: 12 }}>
                                  {row.notes || "N/A"}
                                </div>
                              )}
                            </Col>
                            <Col xs={12} className="d-flex justify-content-end gap-2 mt-2">
                              {isEditing ? (
                                <>
                                  <Button size="sm" variant="outline-secondary" onClick={handleCancelEdit}>
                                    <FaTimes size={12} className="me-1" />Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSavePreference(row)}
                                    disabled={saveLoading}
                                    style={{ backgroundColor: "#1f41bb", border: "none" }}
                                  >
                                    {saveLoading ? <ButtonLoading size={8} /> : <><FaSave size={12} className="me-1" />Save</>}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline-info"
                                    onClick={() => handleViewPlayerDetails(row)}
                                  >
                                    <FaRegEye size={12} className="me-1" />View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() => handleEditPreference(row)}
                                  >
                                    <FaEdit size={12} className="me-1" />Edit
                                  </Button>
                                  <button
                                    type="button"
                                    onClick={() => handleCallStatusClick(row)}
                                    title={row.isCalled ? "Mark as not called" : "Mark as called"}
                                    style={{
                                      alignItems: "center",
                                      background: row.isCalled ? "#ECFDF5" : "#F8FAFC",
                                      border: `1.5px solid ${row.isCalled ? "#6EE7B7" : "#CBD5E1"}`,
                                      borderRadius: 6,
                                      color: row.isCalled ? "#059669" : "#94A3B8",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      fontSize: 11,
                                      fontWeight: 600,
                                      gap: 5,
                                      padding: "4px 10px",
                                    }}
                                  >
                                    <FaCheck size={10} />
                                    {row.isCalled ? "Called" : "Not Called"}
                                  </button>
                                </>
                              )}
                            </Col>
                          </Row>
                        </div>
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
          </div>
        </Col>
        {/* Open Matches Sidebar - col-3 */}
        <Col lg={2} className="d-none d-lg-block">
          <div className="bg-white rounded shadow-sm p-3" style={{ position: 'sticky', top: 20 }}>
            <h6 className="mb-3" style={{ fontFamily: "Poppins", fontSize: 16, fontWeight: 700 }}>
              Open Matches
            </h6>
            <div className="mb-3">
              <Form.Control
                size="sm"
                placeholder="Search..."
                value={matchSearchQuery}
                onChange={(e) => setMatchSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                style={{ fontFamily: "Poppins", fontSize: 13 }}
              />
            </div>
            <div className="d-flex gap-2 mb-3">
              <Button
                size="sm"
                className="flex-fill"
                onClick={() => setShowCreateMatchModal(true)}
                style={{ backgroundColor: "#1f41bb", border: "none", fontFamily: "Poppins", fontWeight: 600, fontSize: 11 }}
              >
                <FaPlus size={10} className="me-1" />Add
              </Button>
              <Button size="sm" variant="outline-secondary" onClick={() => loadOpenMatches("")} disabled={openMatchesLoading} style={{ fontSize: 11 }}>
                Refresh
              </Button>
            </div>
            {openMatchesLoading ? (
              <DataLoading height="73vh" />
            ) : openMatches.length === 0 ? (
              <div className="text-center text-muted py-5" style={{ fontSize: 13, height: '73vh', }}>
                No open matches found.
              </div>
            ) : (
              <div
                className="open-matches-scroll-container"
                ref={setScrollContainer}
                style={{
                  height: '73vh',
                  maxHeight: '73vh',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  position: 'relative'
                }}
              >
                <div className="open-matches-list">
                  {openMatches.map((match, index) => {
                    const joinedCount = match?.totalPlayers ?? (Number(match?.teamA?.length || 0) + Number(match?.teamB?.length || 0));
                    const maxPlayers = match?.totalPlayersCount ?? match?.maxPlayers ?? 4;
                    const fee = getMatchFee(match);
                    const isSelected = selectedOpenMatch?._id === match?._id;
                    const teamA = isSelected ? (match?.teamA || []) : [];
                    const teamB = isSelected ? (match?.teamB || []) : [];

                    const renderPlayerIcon = (team, slotIndex, color) => {
                      const teamPlayers = team === 'A' ? teamA : teamB;
                      const player = teamPlayers[slotIndex];
                      const playerCount = teamPlayers.length;
                      const totalTeamSlots = 2;
                      const isEmpty = !player;

                      // Filter available players based on match requirements
                      const filteredAvailablePlayers = (players || []).filter(p => {
                        // Filter by gender if match has gender requirement
                        const matchGender = match?.gender || '';

                        // For Mixed or Mixed Doubles, show all players
                        if (!matchGender || matchGender.toLowerCase().includes('mixed')) {
                          return true;
                        }

                        // For gender-specific matches (Male Only, Female Only, etc.)
                        // Extract the base gender (Male, Female)
                        const matchGenderBase = matchGender.replace(' Only', '').trim();
                        const playerGender = p.customerId?.gender;
                        return playerGender === matchGenderBase;
                      });

                      const dropdownKey = `${match._id}-${team}-${slotIndex}`;
                      const isDropdownOpen = openDropdownKey === dropdownKey;

                      return (
                        <div style={{ position: "relative" }}>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownKey(isDropdownOpen ? null : dropdownKey);
                            }}
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              backgroundColor: player ? color : "#fff",
                              border: `1px solid ${color}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              position: "relative",
                              padding: 0,
                            }}
                          >
                            {player ? (
                              <FaUser size={8} color="#fff" />
                            ) : (
                              <span style={{ color: color, fontSize: 12, fontWeight: "bold", lineHeight: "1", marginTop: "-1px" }}>+</span>
                            )}
                            {slotIndex === 0 && playerCount > 0 && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: -5,
                                  right: -5,
                                  backgroundColor: color,
                                  color: "#fff",
                                  borderRadius: "50%",
                                  width: 14,
                                  height: 14,
                                  fontSize: 8,
                                  fontWeight: "bold",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "1px solid #fff",
                                }}
                              >
                                {playerCount}/{totalTeamSlots}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    };

                    return (
                      <button
                        key={`${match._id}-${index}`}
                        type="button"
                        onClick={() => handleOpenMatchSelect(match)}
                        className="text-start"
                        style={{
                          background: isSelected ? "#f0f4ff" : "#fff",
                          border: `1px solid ${isSelected ? "#1f41bb" : "#eef2f7"}`,
                          borderRadius: 6,
                          cursor: "pointer",
                          padding: 10,
                          position: "relative",
                        }}
                      >
                        {isSelected && (
                          <span
                            title="Deselect match and resume animation"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOpenMatch(null);
                              resetFilters();
                            }}
                            style={{
                              position: "absolute",
                              top: -6,
                              right: -2,
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              backgroundColor: "#1f41bb",
                              zIndex: 1,
                            }}
                            className="d-flex align-items-center justify-content-center cursor-pointer cp"
                          >
                            <FaTimes size={10} color="#fff" />
                          </span>
                        )}
                        <div className="d-flex justify-content-between gap-2 align-items-start">
                          <div style={{ minWidth: 0 }}>
                            <div className="fw-semibold text-truncate" style={{ fontSize: 12 }}>
                              {getMatchClubName(match)}
                            </div>
                            <div className="text-muted text-truncate" style={{ fontSize: 11 }}>
                              {getMatchCourtName(match) || "Court N/A"}
                            </div>
                          </div>
                          <Badge bg={SKILL_COLORS[match?.skillLevel] || "light"} text={match?.skillLevel ? undefined : "dark"} style={{ fontSize: 10 }}>
                            {match?.skillLevel || "Any"}
                          </Badge>
                        </div>
                        <div className="d-flex justify-content-between mt-2 text-muted" style={{ fontSize: 11 }}>
                          <span>{formatMatchDate(match)}</span>
                          <span>{getMatchTime(match)}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2" style={{ fontSize: 11 }}>
                          <span className="text-muted">Players {joinedCount}/{maxPlayers}</span>
                          <span className="fw-semibold text-success">₹{fee.payable || 0}</span>
                        </div>

                        {/* Player Icons Row - Only show for selected match */}
                        {isSelected && (
                          <>
                            <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                              <div className="d-flex gap-1 align-items-center">
                                <span style={{ fontSize: 13, color: "#3DBE64", fontWeight: 600, marginRight: 3 }}>A:</span>
                                {renderPlayerIcon('A', 0, '#3DBE64')}
                                {renderPlayerIcon('A', 1, '#3DBE64')}
                              </div>
                              <div className="d-flex gap-1 align-items-center">
                                <span style={{ fontSize: 13, color: "#1F41BB", fontWeight: 600, marginRight: 3 }}>B:</span>
                                {renderPlayerIcon('B', 0, '#1F41BB')}
                                {renderPlayerIcon('B', 1, '#1F41BB')}
                              </div>
                            </div>

                            {/* Dropdown Menu - Show below card when any icon is clicked */}
                            {openDropdownKey && openDropdownKey.startsWith(match._id) && (() => {
                              const [, team, slotIndex] = openDropdownKey.split('-');
                              const color = team === 'A' ? '#3DBE64' : '#1F41BB';
                              const teamPlayers = team === 'A' ? teamA : teamB;
                              const player = teamPlayers[parseInt(slotIndex)];
                              const isEmpty = !player;

                              // Filter available players
                              const matchGender = match?.gender || '';
                              const filteredAvailablePlayers = (players || []).filter(p => {
                                if (!matchGender || matchGender.toLowerCase().includes('mixed')) {
                                  return true;
                                }
                                const matchGenderBase = matchGender.replace(' Only', '').trim();
                                return p.customerId?.gender === matchGenderBase;
                              });

                              return (
                                <div
                                  style={{
                                    marginTop: 8,
                                    minWidth: '100%',
                                    maxHeight: 250,
                                    overflowY: "auto",
                                    fontSize: 11,
                                    backgroundColor: "#f8f9fa",
                                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                                    border: "1px solid #dee2e6",
                                    borderRadius: "6px",
                                    padding: "8px 0",
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div style={{ fontSize: 11, fontWeight: 600, padding: "8px 12px", color: "#1f41bb" }}>
                                    Add Player to Team {team} - Slot {parseInt(slotIndex) + 1}
                                  </div>
                                  {filteredAvailablePlayers.length > 0 ? (
                                    filteredAvailablePlayers.slice(0, 20).map((p, idx) => {
                                      const playerName = p.customerId?.name || "Unknown";
                                      const playerPhone = p.customerId?.phoneNumber || "N/A";
                                      const playerGender = p.customerId?.gender || "";
                                      const playerSkillLevel = p.skillLevel || "";

                                      return (
                                        <div
                                          key={p._id || idx}
                                          style={{
                                            fontSize: 11,
                                            padding: "8px 12px",
                                            cursor: 'pointer',
                                            backgroundColor: "#fff",
                                            marginBottom: 4,
                                            marginLeft: 8,
                                            marginRight: 8,
                                            borderRadius: 4,
                                          }}
                                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e3f2fd"}
                                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenDropdownKey(null);
                                            setSelectedPlayerForAdd({
                                              player: p,
                                              playerName,
                                              playerPhone,
                                              playerGender,
                                              playerSkillLevel,
                                              team,
                                              slotIndex: parseInt(slotIndex),
                                              match,
                                              color
                                            });
                                            setShowAddPlayerModal(true);
                                          }}
                                        >
                                          <div className="d-flex align-items-center gap-2">
                                            <div
                                              style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: "50%",
                                                backgroundColor: color,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#fff",
                                                fontSize: 10,
                                                fontWeight: 600,
                                              }}
                                            >
                                              {playerName.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                              <div className="fw-semibold text-truncate" style={{ fontSize: 11 }}>
                                                {playerName}
                                              </div>
                                              <div className="text-muted" style={{ fontSize: 9 }}>
                                                {playerSkillLevel && `${playerSkillLevel} • `}
                                                {playerGender && `${playerGender} • `}
                                                {playerPhone}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div style={{ fontSize: 11, padding: "8px 12px", color: "#999", textAlign: "center" }}>
                                      No available players
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </>
                        )}
                      </button>
                    );
                  })}
                  {/* Clone list — always rendered so scrollHeight is always doubled for the RAF loop */}
                  <div className="clone-list" aria-hidden="true" style={{ pointerEvents: "none", userSelect: "none" }}>{openMatches.map((match, index) => {
                    const joinedCount = match?.totalPlayers ?? (Number(match?.teamA?.length || 0) + Number(match?.teamB?.length || 0));
                    const maxPlayers = match?.totalPlayersCount ?? match?.maxPlayers ?? 4;
                    const fee = getMatchFee(match);
                    const isSelected = selectedOpenMatch?._id === match?._id;

                    return (
                      <div
                        key={`clone-${match._id}-${index}`}
                        tabIndex={-1}
                        style={{
                          background: isSelected ? "#f0f4ff" : "#fff",
                          border: `1px solid ${isSelected ? "#1f41bb" : "#eef2f7"}`,
                          borderRadius: 6,
                          padding: 10,
                        }}
                      >
                        <div className="d-flex justify-content-between gap-2 align-items-start">
                          <div style={{ minWidth: 0 }}>
                            <div className="fw-semibold text-truncate" style={{ fontSize: 12 }}>
                              {getMatchClubName(match)}
                            </div>
                            <div className="text-muted text-truncate" style={{ fontSize: 11 }}>
                              {getMatchCourtName(match) || "Court N/A"}
                            </div>
                          </div>
                          <Badge bg={SKILL_COLORS[match?.skillLevel] || "light"} text={match?.skillLevel ? undefined : "dark"} style={{ fontSize: 10 }}>
                            {match?.skillLevel || "Any"}
                          </Badge>
                        </div>
                        <div className="d-flex justify-content-between mt-2 text-muted" style={{ fontSize: 11 }}>
                          <span>{formatMatchDate(match)}</span>
                          <span>{getMatchTime(match)}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2" style={{ fontSize: 11 }}>
                          <span className="text-muted">Players {joinedCount}/{maxPlayers}</span>
                          <span className="fw-semibold text-success">₹{fee.payable || 0}</span>
                        </div>
                      </div>
                    );
                  })}</div>
                </div>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Call Status Confirmation Modal */}
      <Modal
        show={callConfirm.show}
        onHide={() => setCallConfirm({ show: false, row: null, nextValue: false, loading: false })}
        size="md"
        centered
      >
        <Modal.Body style={{ padding: "28px 24px 20px" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                alignItems: "center",
                background: callConfirm.nextValue ? "#ECFDF5" : "#FEF2F2",
                border: `1.5px solid ${callConfirm.nextValue ? "#6EE7B7" : "#FECACA"}`,
                borderRadius: "50%",
                color: callConfirm.nextValue ? "#059669" : "#DC2626",
                display: "inline-flex",
                height: 48,
                justifyContent: "center",
                marginBottom: 14,
                width: 48,
              }}
            >
              <FaPhone size={18} />
            </div>
            <div style={{ color: "#0F172A", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
              {callConfirm.nextValue ? "Mark as Called?" : "Mark as Not Called?"}
            </div>
            <div style={{ color: "#64748B", fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>
              {callConfirm.nextValue ? (
                <>
                  Mark <strong>{callConfirm.row?.customerId?.name || "this player"}</strong> as called?
                </>
              ) : (
                <>
                  Remove the called status for{" "}
                  <strong>{callConfirm.row?.customerId?.name || "this player"}</strong>?
                </>
              )}
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                onClick={() => setCallConfirm({ show: false, row: null, nextValue: false, loading: false })}
                disabled={callConfirm.loading}
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  color: "#374151",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "8px 20px",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCallStatusConfirm}
                disabled={callConfirm.loading}
                style={{
                  alignItems: "center",
                  background: callConfirm.nextValue ? "#059669" : "#DC2626",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  cursor: callConfirm.loading ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  fontSize: 13,
                  fontWeight: 600,
                  gap: 6,
                  opacity: callConfirm.loading ? 0.7 : 1,
                  padding: "8px 20px",
                }}
              >
                {callConfirm.loading ? (
                  <ButtonLoading size={8} />
                ) : (
                  <>
                    <FaCheck size={11} />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Duration Confirmation Modal */}
      <Modal
        show={durationConfirm.show}
        onHide={() => setDurationConfirm({ show: false, row: null, field: null, loading: false })}
        size="md"
        centered
      >
        <Modal.Body style={{ padding: "28px 24px 20px" }}>
          <div style={{ textAlign: "center" }}>
            {(() => {
              const durationMeta = {
                is60: { label: "60 min", bg: "#EFF6FF", border: "#BFDBFE", color: "#1D4ED8" },
                is90: { label: "90 min", bg: "#F5F3FF", border: "#DDD6FE", color: "#6D28D9" },
                is120: { label: "120 min", bg: "#ECFDF5", border: "#BBF7D0", color: "#047857" },
              };
              const theme = durationMeta[durationConfirm.field] || durationMeta.is60;
              const label = theme.label;
              const isActive = !!durationConfirm.row?.preferredDuration?.[durationConfirm.field];
              const willAdd = !isActive;

              return (
                <>
                  <div
                    style={{
                      alignItems: "center",
                      background: theme.bg,
                      border: `1.5px solid ${theme.border}`,
                      borderRadius: "50%",
                      color: theme.color,
                      display: "inline-flex",
                      fontSize: 13,
                      fontWeight: 700,
                      height: 48,
                      justifyContent: "center",
                      marginBottom: 14,
                      width: 48,
                    }}
                  >
                    {label.replace(" min", "")}
                  </div>
                  <div style={{ color: "#0F172A", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                    {willAdd ? "Add Duration?" : "Remove Duration?"}
                  </div>
                  <div style={{ color: "#64748B", fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>
                    {willAdd ? "Add" : "Remove"} <strong>{label}</strong> for{" "}
                    <strong>{durationConfirm.row?.customerId?.name || "this player"}</strong>?
                  </div>
                </>
              );
            })()}
            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                onClick={() => setDurationConfirm({ show: false, row: null, field: null, loading: false })}
                disabled={durationConfirm.loading}
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  color: "#374151",
                  cursor: durationConfirm.loading ? "not-allowed" : "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  opacity: durationConfirm.loading ? 0.7 : 1,
                  padding: "8px 20px",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDurationConfirm}
                disabled={durationConfirm.loading}
                style={{
                  alignItems: "center",
                  background: "#1f41bb",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  cursor: durationConfirm.loading ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  fontSize: 13,
                  fontWeight: 600,
                  gap: 6,
                  opacity: durationConfirm.loading ? 0.7 : 1,
                  padding: "8px 20px",
                }}
              >
                {durationConfirm.loading ? (
                  <ButtonLoading size={8} />
                ) : (
                  <>
                    <FaCheck size={11} />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Schedule Edit Modal */}
      <Modal show={showScheduleModal} onHide={closeScheduleModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 18, fontFamily: "Poppins" }}>Edit Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ScheduleBuilder
            value={scheduleModalData.schedule}
            onChange={(value) => setScheduleModalData((data) => ({ ...data, schedule: value }))}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={closeScheduleModal}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveScheduleFromModal}
            style={{ backgroundColor: "#1f41bb", border: "none", fontFamily: "Poppins" }}
          >
            <FaSave size={12} className="me-1" />
            Save Schedule
          </Button>
        </Modal.Footer>
      </Modal>

      <PlayerFiltersPanel
        show={showFiltersPanel}
        onHide={() => setShowFiltersPanel(false)}
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        clubOptions={clubOptions}
        residenceDropdownOptions={residenceDropdownOptions}
        CheckboxMultiSelect={CheckboxMultiSelect}
        toSelectOptions={toSelectOptions}
        getMultiPlaceholder={getMultiPlaceholder}
        TIME_SLOT_GROUPS={TIME_SLOT_GROUPS}
        DAY_OPTIONS={DAY_OPTIONS}
        SKILL_LEVEL_OPTIONS={SKILL_LEVEL_OPTIONS}
        GENDER_OPTIONS={GENDER_OPTIONS}
      />

      <Modal show={showPlayerModal} onHide={closeAddPlayer} size="md" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontFamily: "Poppins", fontSize: 16 }}>Add Player</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSavePlayer}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: 13, fontFamily: "Poppins" }}>
                Phone Number <span className="text-danger">*</span>
              </Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  size="sm"
                  type="number"
                  placeholder="e.g. 9876543210"
                  value={playerForm.phoneNumber}
                  onChange={(event) => {
                    setPlayerForm((form) => ({ ...form, phoneNumber: event.target.value }));
                    setPhoneSubmitted(false);
                  }}
                  isInvalid={!!playerFormErrors.phoneNumber}
                  style={{ fontSize: 13 }}
                />
                {/* <Button
                  type="button"
                  size="sm"
                  variant="outline-primary"
                  onClick={handleLookup}
                  disabled={lookupLoading || !String(playerForm.phoneNumber || "").trim()}
                  style={{ minWidth: 80, fontFamily: "Poppins", fontSize: 13 }}
                >
                  {lookupLoading ? <ButtonLoading size={8} color="blue" /> : <><FaSearch size={11} className="me-1" /> Lookup</>}
                </Button> */}
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
                  <Form.Label style={{ fontSize: 13, fontFamily: "Poppins" }}>
                    Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    placeholder="Player name"
                    value={playerForm.name}
                    onChange={(event) => setPlayerForm((form) => ({ ...form, name: event.target.value }))}
                    isInvalid={!!playerFormErrors.name}
                    style={{ fontSize: 13 }}
                  />
                  <Form.Control.Feedback type="invalid">{playerFormErrors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: 13, fontFamily: "Poppins" }}>
                    Email <span className="text-muted">(optional)</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="email"
                    placeholder="email@example.com"
                    value={playerForm.email}
                    onChange={(event) => setPlayerForm((form) => ({ ...form, email: event.target.value }))}
                    style={{ fontSize: 13 }}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label style={{ fontSize: 13, fontFamily: "Poppins" }}>Gender</Form.Label>
                  <Form.Select
                    size="sm"
                    value={playerForm.gender}
                    onChange={(event) => setPlayerForm((form) => ({ ...form, gender: event.target.value }))}
                    style={{ fontSize: 13 }}
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label style={{ fontSize: 13, fontFamily: "Poppins" }}>Residence</Form.Label>
                  <Form.Select
                    size="sm"
                    value={playerForm.residence}
                    onChange={(event) => setPlayerForm((form) => ({ ...form, residence: event.target.value }))}
                    style={{ fontSize: 13 }}
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
            <Button
              size="sm"
              variant="secondary"
              onClick={closeAddPlayer}
              disabled={saveLoading}
              style={{ fontFamily: "Poppins", fontSize: 13 }}
            >
              {lookupResult?.exists ? "Cancel Update" : "Cancel"}
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={saveLoading}
              style={{ backgroundColor: "#1f41bb", border: "none", fontFamily: "Poppins", fontSize: 13 }}
            >
              {saveLoading ? <ButtonLoading size={8} /> : (lookupResult?.exists ? "Update Player" : "Add Player")}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <CreateMatchModal
        show={showCreateMatchModal}
        onHide={() => setShowCreateMatchModal(false)}
        clubId={null}
      />

      <PlayerDetailsModal
        show={showPlayerDetailsModal}
        onHide={closePlayerDetailsModal}
        playerData={selectedPlayerDetails}
      />

      {/* Add Player Confirmation Modal */}
      <Modal show={showAddPlayerModal} onHide={() => setShowAddPlayerModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: "2px solid #1f41bb" }}>
          <Modal.Title style={{ color: "#1f41bb", fontSize: 18, fontWeight: 600 }}>
            Confirm Player Addition
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "24px" }}>
          {selectedPlayerForAdd && (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                  You are about to add the following player:
                </div>
                <div style={{
                  backgroundColor: "#f8f9fa",
                  padding: 16,
                  borderRadius: 8,
                  border: "1px solid #dee2e6"
                }}>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        backgroundColor: selectedPlayerForAdd.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 20,
                        fontWeight: 600,
                      }}
                    >
                      {selectedPlayerForAdd.playerName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                        {selectedPlayerForAdd.playerName}
                      </div>
                      <div style={{ fontSize: 13, color: "#666" }}>
                        {selectedPlayerForAdd.playerPhone}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                    <div>
                      <span style={{ color: "#666" }}>Gender:</span>{" "}
                      <span style={{ fontWeight: 600 }}>{selectedPlayerForAdd.playerGender || "N/A"}</span>
                    </div>
                    <div>
                      <span style={{ color: "#666" }}>Skill:</span>{" "}
                      <span style={{ fontWeight: 600 }}>{selectedPlayerForAdd.playerSkillLevel || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: "#e3f2fd",
                padding: 16,
                borderRadius: 8,
                marginBottom: 20
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#1f41bb" }}>
                  Match Details
                </div>
                <div style={{ fontSize: 13, color: "#333", marginBottom: 4 }}>
                  <strong>Club:</strong> {selectedPlayerForAdd.match?.clubName || "N/A"}
                </div>
                <div style={{ fontSize: 13, color: "#333", marginBottom: 4 }}>
                  <strong>Court:</strong> {selectedPlayerForAdd.match?.courtName || "N/A"}
                </div>
                <div style={{ fontSize: 13, color: "#333" }}>
                  <strong>Position:</strong> Team {selectedPlayerForAdd.team} - Slot {selectedPlayerForAdd.slotIndex + 1}
                </div>
              </div>

              <div style={{
                backgroundColor: "#fff3cd",
                padding: 12,
                borderRadius: 6,
                fontSize: 12,
                color: "#856404",
                border: "1px solid #ffeaa7"
              }}>
                <strong>Note:</strong> This action will add the player to the match. Make sure all details are correct before confirming.
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "1px solid #dee2e6", padding: "16px 24px" }}>
          <Button
            variant="outline-secondary"
            onClick={() => setShowAddPlayerModal(false)}
            style={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            style={{
              backgroundColor: "#1f41bb",
              border: "none",
              minWidth: 100
            }}
            onClick={handleAddPlayerToMatch}
            disabled={addingPlayerToMatch}
          >
            {addingPlayerToMatch ? <ButtonLoading size={8} /> : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PlayerPreferences;
