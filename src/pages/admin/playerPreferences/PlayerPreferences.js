import React, { useState, useEffect, useCallback, useRef } from "react";
import { Container, Row, Col, Table, Button, Modal, Form, Badge, Tab, Nav } from "react-bootstrap";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaUser, FaPhone, FaTimes } from "react-icons/fa";
import { MdSportsHandball } from "react-icons/md";
import Select, { components as selectComponents } from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";
import { ownerApi } from "../../../helpers/api/apiCore";
import { SUPER_ADMIN_GET_ALL_CLUBS, SUPER_ADMIN_OPEN_MATCH_OVERVIEW } from "../../../helpers/api/apiEndpoint";
import {
  getAllPlayerPreferences,
  createPlayerPreference,
  updatePlayerPreference,
  deletePlayerPreference,
  lookupCustomerByPhone,
  searchPlayersForMatch,
  searchPlayersByOpenMatch,
} from "../../../redux/admin/playerPreferences/thunk";
import { sendMatchRequest } from "../../../redux/admin/matchRequest/thunk";
import { resetLookup, resetMatchSearch } from "../../../redux/admin/playerPreferences/slice";

// ─── Constants ────────────────────────────────────────────────────────────────

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
    ].map((v) => ({ value: v, label: v })),
  },
  {
    label: "60 Minutes",
    options: [
      "5 AM – 6 AM", "6 AM – 7 AM", "7 AM – 8 AM", "8 AM – 9 AM", "9 AM – 10 AM",
      "10 AM – 11 AM", "11 AM – 12 PM", "12 PM – 1 PM", "1 PM – 2 PM",
      "2 PM – 3 PM", "3 PM – 4 PM", "4 PM – 5 PM", "5 PM – 6 PM",
      "6 PM – 7 PM", "7 PM – 8 PM", "8 PM – 9 PM", "9 PM – 10 PM",
      "10 PM – 11 PM", "11 PM – 12 AM",
    ].map((v) => ({ value: v, label: v })),
  },
  {
    label: "90 Minutes",
    options: [
      "5:00 AM – 6:30 AM", "6:00 AM – 7:30 AM", "7:00 AM – 8:30 AM",
      "8:00 AM – 9:30 AM", "9:00 AM – 10:30 AM", "10:00 AM – 11:30 AM",
      "11:00 AM – 12:30 PM", "12:00 PM – 1:30 PM", "1:00 PM – 2:30 PM",
      "2:00 PM – 3:30 PM", "3:00 PM – 4:30 PM", "4:00 PM – 5:30 PM",
      "5:00 PM – 6:30 PM", "6:00 PM – 7:30 PM", "7:00 PM – 8:30 PM",
      "8:00 PM – 9:30 PM", "9:00 PM – 10:30 PM", "10:00 PM – 11:30 PM",
      "11:00 PM – 12:30 AM",
    ].map((v) => ({ value: v, label: v })),
  },
];
const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SKILL_LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Professional"];
const SKILL_COLORS = { Beginner: "success", Intermediate: "warning", Advanced: "danger", Professional: "dark" };
const CREATE_OPEN_MATCH_VALUE = "__create_open_match__";
const EMPTY_MATCH_FILTERS = { clubId: "", day: [], timeSlot: [], skillLevel: [] };

const toSelectOptions = (arr) => arr.map((v) => ({ value: v, label: v }));

const selectStyles = {
  control: (b) => ({ ...b, borderColor: "#dee2e6", minHeight: "36px", fontSize: "13px" }),
  multiValue: (b) => ({ ...b, backgroundColor: "rgba(31,65,187,0.12)" }),
  menu: (b) => ({ ...b, zIndex: 9999 }),
};

const compactSelectStyles = {
  ...selectStyles,
  control: (b) => ({ ...b, borderColor: "#dee2e6", minHeight: "31px", fontSize: "13px" }),
  valueContainer: (b) => ({ ...b, padding: "0 8px", flexWrap: "nowrap", overflow: "hidden" }),
  input: (b) => ({ ...b, margin: 0, padding: 0 }),
  indicatorsContainer: (b) => ({ ...b, minHeight: "31px" }),
  placeholder: (b) => ({ ...b, color: "#111827", whiteSpace: "nowrap" }),
  option: (b, state) => ({
    ...b,
    alignItems: "center",
    backgroundColor: state.isFocused ? "rgba(31,65,187,0.08)" : "#fff",
    color: "#111827",
    display: "flex",
    fontSize: 13,
    gap: 8,
    padding: "7px 10px",
  }),
  menu: (b) => ({ ...b, zIndex: 9999 }),
};

const toValueArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

const selectValues = (options, values) => {
  const valueSet = new Set(toValueArray(values));
  return options.filter((option) => valueSet.has(option.value));
};

const getMultiPlaceholder = (emptyText, values) => {
  const count = toValueArray(values).length;
  return count ? `${count} selected` : emptyText;
};

const CheckboxOption = (props) => (
  <selectComponents.Option {...props}>
    <span
      aria-hidden="true"
      style={{
        alignItems: "center",
        border: `1px solid ${props.isSelected ? "#1f41bb" : "#cbd5e1"}`,
        borderRadius: 3,
        background: props.isSelected ? "#1f41bb" : "#fff",
        color: "#fff",
        display: "inline-flex",
        flex: "0 0 14px",
        height: 14,
        justifyContent: "center",
        fontSize: 10,
        lineHeight: "14px",
        width: 14,
      }}
    >
      {props.isSelected ? "✓" : ""}
    </span>
    <span>{props.label}</span>
  </selectComponents.Option>
);

const compactMultiSelectComponents = {
  MultiValue: () => null,
  Option: CheckboxOption,
};

// A schedule entry in form state: { day: "Monday", timeSlots: [{value,label}] }
const EMPTY_FORM = { preferredClubs: [], preferredSchedule: [], skillLevel: "", notes: "" };

// ─── Schedule builder sub-component ──────────────────────────────────────────

const ScheduleBuilder = ({ value, onChange }) => {
  // value = [{ day, timeSlots: [{value,label}] }]

  const selectedDays = value.map((e) => e.day);

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      onChange(value.filter((e) => e.day !== day));
    } else {
      // Keep order matching DAY_OPTIONS
      const next = [...value, { day, timeSlots: [] }];
      next.sort((a, b) => DAY_OPTIONS.indexOf(a.day) - DAY_OPTIONS.indexOf(b.day));
      onChange(next);
    }
  };

  const handleTimeSlotsChange = (day, slots) => {
    onChange(value.map((e) => e.day === day ? { ...e, timeSlots: slots || [] } : e));
  };

  return (
    <div>
      {/* Day chips */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {DAY_OPTIONS.map((day) => {
          const active = selectedDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              style={{
                padding: "5px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontFamily: "Poppins",
                border: active ? "2px solid #1f41bb" : "2px solid #dee2e6",
                backgroundColor: active ? "rgba(31,65,187,0.1)" : "#fff",
                color: active ? "#1f41bb" : "#6c757d",
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {day.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {/* Per-day time slot selectors */}
      {value.length === 0 && (
        <div className="text-muted small">Select one or more days above, then choose time slots for each.</div>
      )}
      {value.map((entry) => (
        <div key={entry.day} className="d-flex align-items-start gap-2 mb-2">
          <div
            style={{
              minWidth: 90, fontSize: 13, fontWeight: 600, color: "#1f41bb",
              paddingTop: 6, fontFamily: "Poppins",
            }}
          >
            {entry.day}
          </div>
          <div style={{ flex: 1 }}>
            <Select
              isMulti
              options={TIME_SLOT_GROUPS}
              value={entry.timeSlots}
              onChange={(v) => handleTimeSlotsChange(entry.day, v)}
              placeholder="Select time slots..."
              styles={selectStyles}
            />
          </div>
          <button
            type="button"
            onClick={() => handleDayToggle(entry.day)}
            style={{ background: "none", border: "none", color: "#adb5bd", paddingTop: 8, cursor: "pointer" }}
            title="Remove day"
          >
            <FaTimes size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const PlayerPreferences = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const routeMatchId = location.state?.selectedOpenMatchId || searchParams.get("matchId") || "";
  const routeTab = location.state?.tab || searchParams.get("tab");
  const initialTab = routeTab === "findPlayers" || routeMatchId ? "findPlayers" : "preferences";
  const pendingRouteMatchIdRef = useRef(routeMatchId);
  const {
    preferences, loading, pagination,
    lookupLoading, lookupResult,
    saveLoading, deleteLoading,
    matchSearchResults, matchSearchLoading, matchSearchError, matchSearchPagination,
    selectedMatchContext,
  } = useSelector((s) => s.playerPreferences);

  const [clubs, setClubs] = useState([]);
  const [clubOptions, setClubOptions] = useState([]);
  const [openMatches, setOpenMatches] = useState([]);
  const [openMatchesLoading, setOpenMatchesLoading] = useState(false);
  const [selectedOpenMatchId, setSelectedOpenMatchId] = useState("");
  const [search, setSearch] = useState("");
  const [filterSkillLevel, setFilterSkillLevel] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPref, setEditingPref] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [phoneInput, setPhoneInput] = useState("");
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const [matchFilters, setMatchFilters] = useState(EMPTY_MATCH_FILTERS);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [requestingPlayerId, setRequestingPlayerId] = useState("");

  // Load clubs
  useEffect(() => {
    ownerApi.get(SUPER_ADMIN_GET_ALL_CLUBS).then((res) => {
      const list = res.data?.data?.clubs || res.data?.data || [];
      setClubs(list);
      setClubOptions(list.map((c) => ({ value: c._id, label: c.clubName || c.name })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setOpenMatchesLoading(true);
    ownerApi
      .get(`${SUPER_ADMIN_OPEN_MATCH_OVERVIEW}?page=1&limit=100`)
      .then((res) => {
        const list = res.data?.data?.openMatches || res.data?.data || [];
        setOpenMatches(Array.isArray(list) ? list : []);
      })
      .catch(() => setOpenMatches([]))
      .finally(() => setOpenMatchesLoading(false));
  }, []);

  // Load preferences
  const loadPreferences = useCallback((page = 1) => {
    dispatch(getAllPlayerPreferences({ page, limit: pagination.limit, search, skillLevel: filterSkillLevel }));
  }, [dispatch, pagination.limit, search, filterSkillLevel]);

  useEffect(() => { loadPreferences(1); }, [search, filterSkillLevel]); // eslint-disable-line

  // ── Modal open/close ─────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingPref(null); setPhoneInput(""); setPhoneSubmitted(false);
    setNewName(""); setNewEmail(""); setForm(EMPTY_FORM); setFormErrors({});
    dispatch(resetLookup()); setShowFormModal(true);
  };

  const openEdit = (pref) => {
    setEditingPref(pref); setPhoneSubmitted(true);
    setPhoneInput(String(pref.customerId?.phoneNumber || ""));
    setForm({
      preferredClubs: (pref.preferredClubs || []).map((c) => ({ value: c._id, label: c.clubName || c.name })),
      preferredSchedule: (pref.preferredSchedule || []).map((e) => ({
        day: e.day,
        timeSlots: toSelectOptions(e.timeSlots || []),
      })),
      skillLevel: pref.skillLevel || "",
      notes: pref.notes || "",
    });
    setFormErrors({}); setShowFormModal(true);
  };

  const closeModal = () => { setShowFormModal(false); setEditingPref(null); dispatch(resetLookup()); };

  // ── Phone lookup ─────────────────────────────────────────────────────────────

  const handleLookup = () => {
    if (!phoneInput.trim()) return;
    setPhoneSubmitted(false);
    dispatch(lookupCustomerByPhone(phoneInput.trim())).then((res) => {
      if (!res.error) {
        setPhoneSubmitted(true);
        const payload = res.payload;
        if (payload?.hasPreference && payload?.preference) {
          // Existing preference found — auto-switch to edit mode with pre-filled fields
          const pref = payload.preference;
          setEditingPref({ _id: pref._id, customerId: payload.customer });
          setForm({
            preferredClubs: (pref.preferredClubs || []).map((c) => ({ value: c._id, label: c.clubName || c.name })),
            preferredSchedule: (pref.preferredSchedule || []).map((e) => ({
              day: e.day,
              timeSlots: toSelectOptions(e.timeSlots || []),
            })),
            skillLevel: pref.skillLevel || "",
            notes: pref.notes || "",
          });
        } else if (payload?.exists && payload.customer?.skillLevel) {
          setForm((f) => ({ ...f, skillLevel: payload.customer.skillLevel }));
        }
      }
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!editingPref) {
      if (!phoneInput.trim()) errs.phoneInput = "Phone number is required";
      if (lookupResult && !lookupResult.exists && !newName.trim()) errs.newName = "Name is required";
    }
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    const payload = {
      preferredClubs: form.preferredClubs.map((o) => o.value),
      preferredSchedule: form.preferredSchedule.map((e) => ({
        day: e.day,
        timeSlots: e.timeSlots.map((t) => t.value),
      })),
      skillLevel: form.skillLevel || undefined,
      notes: form.notes || undefined,
    };

    let result;
    if (editingPref) {
      result = await dispatch(updatePlayerPreference({ id: editingPref._id, data: payload }));
    } else {
      result = await dispatch(createPlayerPreference({
        phoneNumber: Number(phoneInput.trim()),
        name: lookupResult?.exists ? undefined : newName.trim(),
        email: lookupResult?.exists ? undefined : (newEmail.trim() || undefined),
        ...payload,
      }));
    }
    if (!result.error) { closeModal(); loadPreferences(1); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────

  const confirmDelete = (id) => { setDeletingId(id); setShowDeleteModal(true); };
  const handleDelete = async () => {
    const result = await dispatch(deletePlayerPreference(deletingId));
    if (!result.error) { setShowDeleteModal(false); setDeletingId(null); }
  };

  // ── Search for match ──────────────────────────────────────────────────────────

  const handleMatchSearch = () => {
    if (selectedOpenMatchId) {
      dispatch(searchPlayersByOpenMatch({ matchId: selectedOpenMatchId, page: 1, limit: 20 }));
      return;
    }
    dispatch(searchPlayersForMatch({ ...matchFilters, page: 1, limit: 20 }));
  };

  const getMatchDayName = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    });
  };

  const formatMatchDateShort = (dateString) => {
    if (!dateString) return "Date N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      weekday: "short",
    });
  };

  const getOpenMatchTimeLabel = (match) => {
    if (!match) return "Time N/A";
    if (Array.isArray(match?.matchTime) && match.matchTime.length > 0) return match.matchTime[0];
    if (match?.bookingId?.startTime && match?.bookingId?.endTime) return `${match.bookingId.startTime} - ${match.bookingId.endTime}`;
    if (match?.startTime && match?.endTime) return `${match.startTime} - ${match.endTime}`;
    if (typeof match?.matchTime === "string" && match.matchTime) return match.matchTime;
    return "Time N/A";
  };

  const normalizeTimeSlotText = (value) =>
    String(value || "")
      .replace(/[–—]/g, "-")
      .replace(/\s+/g, " ")
      .replace(/\s*-\s*/g, "-")
      .trim()
      .toUpperCase();

  const getTimeSlotOptionsForSearch = () => {
    const allOptions = TIME_SLOT_GROUPS.flatMap((group) => group.options);
    const selectedTimes = toValueArray(matchFilters.timeSlot);
    if (!selectedTimes.length) return TIME_SLOT_GROUPS;

    const selectedMatchOptions = selectedTimes
      .filter((selectedTime) => !allOptions.some(
        (option) => normalizeTimeSlotText(option.value) === normalizeTimeSlotText(selectedTime)
      ))
      .map((selectedTime) => ({ value: selectedTime, label: selectedTime }));

    if (!selectedMatchOptions.length) return TIME_SLOT_GROUPS;

    return [
      { label: "Selected Match", options: selectedMatchOptions },
      ...TIME_SLOT_GROUPS,
    ];
  };

  const getOpenMatchLabel = (match) => {
    const clubName = match?.clubId?.clubName || match?.clubName || "Club N/A";
    const courtName = match?.slot?.[0]?.courtName ? ` | ${match.slot[0].courtName}` : "";
    return `${formatMatchDateShort(match?.matchDate || match?.bookingDate)} | ${getOpenMatchTimeLabel(match)} | ${clubName}${courtName} | ${match?.skillLevel || "Level N/A"}`;
  };

  const handleOpenMatchSelect = (matchId) => {
    if (matchId === CREATE_OPEN_MATCH_VALUE) {
      navigate("/admin/open-matches/create", {
        state: {
          fromPlayerPreferences: true,
          clubId: matchFilters.clubId || "",
        },
      });
      return;
    }

    setSelectedOpenMatchId(matchId);
    dispatch(resetMatchSearch());
    const match = openMatches.find((item) => item?._id === matchId);

    if (!matchId || !match) {
      setMatchFilters(EMPTY_MATCH_FILTERS);
      return;
    }

    setMatchFilters({
      clubId: match?.clubId?._id || match?.clubId || "",
      day: [getMatchDayName(match?.matchDate || match?.bookingDate)].filter(Boolean),
      timeSlot: [getOpenMatchTimeLabel(match)].filter((value) => value && value !== "Time N/A"),
      skillLevel: [match?.skillLevel].filter(Boolean),
    });
    dispatch(searchPlayersByOpenMatch({ matchId, page: 1, limit: 20 }));
  };

  useEffect(() => {
    const nextMatchId = location.state?.selectedOpenMatchId || new URLSearchParams(location.search).get("matchId") || "";
    const nextTab = location.state?.tab || new URLSearchParams(location.search).get("tab");

    if (nextTab === "findPlayers" || nextMatchId) {
      setActiveTab("findPlayers");
    }

    if (nextMatchId && nextMatchId !== selectedOpenMatchId) {
      pendingRouteMatchIdRef.current = nextMatchId;
    }
  }, [location.search, location.state, selectedOpenMatchId]);

  useEffect(() => {
    const pendingMatchId = pendingRouteMatchIdRef.current;
    if (!pendingMatchId || openMatchesLoading || openMatches.length === 0) return;

    const matchExists = openMatches.some((match) => match?._id === pendingMatchId);
    if (!matchExists) return;

    pendingRouteMatchIdRef.current = "";
    handleOpenMatchSelect(pendingMatchId);
  }, [openMatches, openMatchesLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleManualFilterChange = (field, value) => {
    if (selectedOpenMatchId) {
      setSelectedOpenMatchId("");
      dispatch(resetMatchSearch());
    }
    setMatchFilters((filters) => ({ ...filters, [field]: value }));
  };

  const handleResetMatchFilters = () => {
    setSelectedOpenMatchId("");
    setMatchFilters(EMPTY_MATCH_FILTERS);
    setRequestingPlayerId("");
    dispatch(resetMatchSearch());
  };

  const hasMatchFilters = Boolean(
    selectedOpenMatchId ||
    matchFilters.clubId ||
    toValueArray(matchFilters.day).length ||
    toValueArray(matchFilters.timeSlot).length ||
    toValueArray(matchFilters.skillLevel).length
  );

  const refreshSelectedMatchSearch = () => {
    if (selectedOpenMatchId) {
      dispatch(searchPlayersByOpenMatch({ matchId: selectedOpenMatchId, page: 1, limit: 20 }));
      return;
    }

    dispatch(searchPlayersForMatch({ ...matchFilters, page: 1, limit: 20 }));
  };

  const handleSendMatchRequest = async (preference) => {
    const playerId = preference?.customerId?._id || preference?.customerId;
    if (!selectedOpenMatchId || !playerId || preference?.isAlreadyInMatch || preference?.isRequestAlreadySent) return;

    setRequestingPlayerId(playerId);
    try {
      const result = await dispatch(sendMatchRequest({
        matchId: selectedOpenMatchId,
        playerId,
        preferredTeam: "any",
      }));

      if (!result.error) {
        refreshSelectedMatchSearch();
      }
    } finally {
      setRequestingPlayerId("");
    }
  };

  const getMatchRequestButton = (preference) => {
    if (!selectedOpenMatchId) {
      return <Badge bg="light" text="dark" className="border fw-medium">Select match</Badge>;
    }
    if (preference?.isAlreadyInMatch) {
      return <Badge bg="success">Joined</Badge>;
    }
    if (preference?.isRequestAlreadySent || preference?.requestStatus === "pending") {
      return <Badge bg="warning" text="dark">Requested</Badge>;
    }
    if (preference?.requestStatus === "accepted") {
      return <Badge bg="success">Accepted</Badge>;
    }
    if (preference?.requestStatus === "rejected") {
      return (
        <Button
          size="sm"
          variant="outline-primary"
          onClick={() => handleSendMatchRequest(preference)}
          disabled={requestingPlayerId === (preference?.customerId?._id || preference?.customerId)}
        >
          {requestingPlayerId === (preference?.customerId?._id || preference?.customerId)
            ? <ButtonLoading size={6} color="blue" />
            : "Send Again"}
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        onClick={() => handleSendMatchRequest(preference)}
        disabled={requestingPlayerId === (preference?.customerId?._id || preference?.customerId)}
        style={{ backgroundColor: "#1f41bb", border: "none", fontFamily: "Poppins", minWidth: 82 }}
      >
        {requestingPlayerId === (preference?.customerId?._id || preference?.customerId)
          ? <ButtonLoading size={6} />
          : "Request"}
      </Button>
    );
  };

  // ── Customer banner (form modal) ──────────────────────────────────────────────

  const customer = lookupResult?.customer;

  const renderCustomerBanner = () => {
    if (editingPref) {
      const c = editingPref.customerId;
      return (
        <div className="p-3 mb-3 rounded" style={{ background: "#f0f4ff", border: "1px solid #c7d3f8" }}>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <FaUser size={14} color="#1f41bb" />
            <strong style={{ color: "#1f41bb" }}>{c?.name} {c?.lastName || ""}</strong>
            <span className="text-muted"><FaPhone size={11} /> {c?.countryCode} {c?.phoneNumber}</span>
            {c?.email && <span className="text-muted">{c.email}</span>}
          </div>
        </div>
      );
    }

    if (!phoneSubmitted) {
      return (
        <>
          <p className="text-muted small mb-3">
            Enter the player's mobile number. If they don't exist, you can create them here.
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Mobile Number <span className="text-danger">*</span></Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="number" placeholder="e.g. 9876543210" value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)} isInvalid={!!formErrors.phoneInput}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              />
              <Button type="button" variant="primary" onClick={handleLookup} disabled={lookupLoading || !phoneInput.trim()} style={{ minWidth: 90 }}>
                {lookupLoading ? <ButtonLoading size={8} /> : <><FaSearch size={12} /> Look Up</>}
              </Button>
            </div>
            {formErrors.phoneInput && <div className="text-danger small mt-1">{formErrors.phoneInput}</div>}
          </Form.Group>
        </>
      );
    }

    if (lookupResult?.exists) {
      return (
        <div className="p-3 mb-3 rounded" style={{ background: "#f0f4ff", border: "1px solid #c7d3f8" }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <FaUser size={14} color="#1f41bb" />
              <strong style={{ color: "#1f41bb" }}>{customer?.name} {customer?.lastName || ""}</strong>
              <span className="text-muted"><FaPhone size={11} /> {customer?.countryCode} {customer?.phoneNumber}</span>
              {customer?.email && <span className="text-muted">{customer.email}</span>}
            </div>
            <Badge bg="success">Found</Badge>
          </div>
        </div>
      );
    }

    return (
      <div className="p-3 mb-3 rounded" style={{ background: "#fff8e6", border: "1px solid #ffc107" }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="text-warning fw-semibold">Customer not found — enter details</span>
          <Button variant="link" size="sm" className="p-0 text-secondary"
            onClick={() => { setPhoneSubmitted(false); dispatch(resetLookup()); }}>
            Change number
          </Button>
        </div>
        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-2">
              <Form.Label>Name <span className="text-danger">*</span></Form.Label>
              <Form.Control size="sm" placeholder="Full name" value={newName}
                onChange={(e) => setNewName(e.target.value)} isInvalid={!!formErrors.newName} />
              <Form.Control.Feedback type="invalid">{formErrors.newName}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="mb-2">
              <Form.Label>Email <span className="text-muted">(optional)</span></Form.Label>
              <Form.Control size="sm" type="email" placeholder="email@example.com" value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)} />
            </Form.Group>
          </Col>
        </Row>
      </div>
    );
  };

  // ── Preference fields ─────────────────────────────────────────────────────────

  const renderPreferenceFields = () => (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Preferred Clubs</Form.Label>
        <Select isMulti options={clubOptions} value={form.preferredClubs}
          onChange={(v) => setForm((f) => ({ ...f, preferredClubs: v || [] }))}
          placeholder="Select clubs..." styles={selectStyles} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Preferred Playing Schedule</Form.Label>
        <div className="text-muted small mb-2">Select days, then choose time slots for each day.</div>
        <ScheduleBuilder
          value={form.preferredSchedule}
          onChange={(v) => setForm((f) => ({ ...f, preferredSchedule: v }))}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Skill Level</Form.Label>
        <Form.Select value={form.skillLevel} onChange={(e) => setForm((f) => ({ ...f, skillLevel: e.target.value }))}>
          <option value="">Select skill level</option>
          {SKILL_LEVEL_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-2">
        <Form.Label>Notes <span className="text-muted">(optional)</span></Form.Label>
        <Form.Control as="textarea" rows={2}
          placeholder="e.g. Available on short notice, prefers evening matches..."
          value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
      </Form.Group>
    </>
  );

  // ── Schedule summary for table cells ─────────────────────────────────────────

  const getSlotRangeLabel = (slots = []) => {
    if (!slots.length) return "Any time";

    const firstParts = normalizeTimeSlotText(slots[0]).split("-");
    const lastParts = normalizeTimeSlotText(slots[slots.length - 1]).split("-");
    const start = firstParts[0]?.trim();
    const end = (lastParts[1] || lastParts[0])?.trim();

    return start && end ? `${start} - ${end}` : slots[0];
  };

  const formatScheduleSummary = (preferredSchedule, compact = false) => {
    if (!preferredSchedule?.length) return null;

    if (compact) {
      const groupedByRange = preferredSchedule.reduce((acc, entry) => {
        const range = entry.timeSlots?.length ? getSlotRangeLabel(entry.timeSlots) : "Any time";
        if (!acc[range]) acc[range] = [];
        acc[range].push(entry.day);
        return acc;
      }, {});

      return Object.entries(groupedByRange).map(([range, days]) => {
        const dayLabel = days.length === 7
          ? "All week"
          : days.map((day) => day.slice(0, 3)).join(", ");

        return (
          <div
            key={`${dayLabel}-${range}`}
            className="d-flex align-items-center gap-2 mb-1"
            style={{ fontSize: 12, lineHeight: 1.4, minWidth: 260 }}
          >
            <span
              style={{
                background: "rgba(31,65,187,0.08)",
                borderRadius: 4,
                color: "#1f41bb",
                flex: "0 0 auto",
                fontWeight: 700,
                padding: "2px 7px",
              }}
            >
              {dayLabel}
            </span>
            <span className="text-muted">{range}</span>
          </div>
        );
      });
    }

    return preferredSchedule.map((e) => (
      <div
        key={e.day}
        className="d-flex align-items-center gap-2 mb-1"
        style={{ fontSize: 11, lineHeight: 1.35, minWidth: compact ? 260 : undefined }}
      >
        <span
          style={{
            background: "rgba(31,65,187,0.08)",
            borderRadius: 4,
            color: "#1f41bb",
            flex: "0 0 34px",
            fontWeight: 700,
            padding: "2px 5px",
            textAlign: "center",
          }}
        >
          {e.day.slice(0, 3)}
        </span>
        {e.timeSlots?.length > 0 ? (
          <>
            <span
              className="text-muted"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: compact ? "nowrap" : "normal",
              }}
            >
              {compact ? getSlotRangeLabel(e.timeSlots) : e.timeSlots.join(", ")}
            </span>
            {compact && e.timeSlots.length > 1 && (
              <span
                style={{
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  borderRadius: 4,
                  color: "#6b7280",
                  flex: "0 0 auto",
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "1px 5px",
                }}
              >
                {e.timeSlots.length} slots
              </span>
            )}
          </>
        ) : (
          <span className="text-muted">Any time</span>
        )}
      </div>
    ));
  };

  // Show the save button as soon as we're past the phone-lookup step.
  // Disable it only when the customer already has a preference (can't create a duplicate).
  const showSave = !!editingPref || phoneSubmitted;
  const saveDisabled = saveLoading;

  // ─── Render ────────────────────────────────────────────────────────────────────

  return (
    <Container fluid className="px-0 px-md-4 mt-md-0 mt-2">
      <Tab.Container activeKey={activeTab} onSelect={(key) => setActiveTab(key || "preferences")}>
        <Row className="mb-3">
          <Col>
            <Nav variant="tabs" className="border-bottom-0">
              <Nav.Item>
                <Nav.Link eventKey="preferences" style={{ fontFamily: "Poppins", fontSize: 14 }}>
                  Player Preferences
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="findPlayers" style={{ fontFamily: "Poppins", fontSize: 14 }}>
                  <MdSportsHandball size={16} className="me-1" />Find Players for Match
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>

        <Tab.Content>
          {/* ── Tab 1: List ── */}
          <Tab.Pane eventKey="preferences">
            <div className="bg-white rounded shadow-sm p-md-3 p-2">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <h6 className="mb-0 tabel-title">Player Preferences</h6>
                <Button size="sm" onClick={openCreate}
                  style={{ backgroundColor: "#1f41bb", border: "none", fontFamily: "Poppins" }}>
                  <FaPlus size={12} className="me-1" /> Add Preference
                </Button>
              </div>

              <Row className="g-2 mb-3">
                <Col xs={12} md={5}>
                  <Form.Control size="sm" placeholder="Search by name or phone..."
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                </Col>
                <Col xs={12} md={3}>
                  <Form.Select size="sm" value={filterSkillLevel} onChange={(e) => setFilterSkillLevel(e.target.value)}>
                    <option value="">All Skill Levels</option>
                    {SKILL_LEVEL_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Form.Select>
                </Col>
              </Row>

              {loading ? (
                <DataLoading height="300px" />
              ) : preferences.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center text-muted" style={{ height: 200 }}>
                  No player preferences found
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="d-none d-md-block">
                    <Table responsive borderless size="sm" className="custom-table">
                      <thead>
                        <tr>
                          <th>#</th><th>Player</th><th>Phone</th>
                          <th>Skill Level</th><th>Preferred Clubs</th>
                          <th>Schedule (Day → Times)</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preferences.map((pref, idx) => (
                          <tr key={pref._id}>
                            <td className="text-muted">{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                            <td>
                              <div className="fw-semibold" style={{ fontSize: 13 }}>
                                {pref.customerId?.name} {pref.customerId?.lastName || ""}
                              </div>
                              {pref.customerId?.email && (
                                <div className="text-muted" style={{ fontSize: 11 }}>{pref.customerId.email}</div>
                              )}
                            </td>
                            <td style={{ fontSize: 13 }}>
                              {pref.customerId?.countryCode} {pref.customerId?.phoneNumber}
                            </td>
                            <td>
                              {pref.skillLevel
                                ? <Badge bg={SKILL_COLORS[pref.skillLevel] || "secondary"}>{pref.skillLevel}</Badge>
                                : <span className="text-muted">—</span>}
                            </td>
                            <td style={{ fontSize: 12 }}>
                              {(pref.preferredClubs || []).length > 0
                                ? pref.preferredClubs.map((c) => c.clubName || c.name).join(", ")
                                : <span className="text-muted">—</span>}
                            </td>
                            <td>
                              {(pref.preferredSchedule || []).length > 0
                                ? formatScheduleSummary(pref.preferredSchedule)
                                : <span className="text-muted">—</span>}
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button size="sm" variant="outline-primary" onClick={() => openEdit(pref)} title="Edit">
                                  <FaEdit size={12} />
                                </Button>
                                <Button size="sm" variant="outline-danger" onClick={() => confirmDelete(pref._id)} title="Delete">
                                  <FaTrash size={12} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <div className="d-block d-md-none">
                    {preferences.map((pref) => (
                      <div key={pref._id} className="card mb-2 border-0 shadow-sm">
                        <div className="card-body p-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="fw-semibold" style={{ fontSize: 13 }}>
                                {pref.customerId?.name} {pref.customerId?.lastName || ""}
                              </div>
                              <div className="text-muted" style={{ fontSize: 12 }}>
                                {pref.customerId?.countryCode} {pref.customerId?.phoneNumber}
                              </div>
                            </div>
                            <div className="d-flex gap-1">
                              <Button size="sm" variant="outline-primary" onClick={() => openEdit(pref)}>
                                <FaEdit size={11} />
                              </Button>
                              <Button size="sm" variant="outline-danger" onClick={() => confirmDelete(pref._id)}>
                                <FaTrash size={11} />
                              </Button>
                            </div>
                          </div>
                          {pref.skillLevel && (
                            <Badge bg={SKILL_COLORS[pref.skillLevel] || "secondary"} className="mt-1">
                              {pref.skillLevel}
                            </Badge>
                          )}
                          {(pref.preferredSchedule || []).length > 0 && (
                            <div className="mt-1">{formatScheduleSummary(pref.preferredSchedule)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="d-flex justify-content-center gap-2 mt-3">
                      <Button size="sm" variant="outline-secondary"
                        disabled={pagination.page <= 1} onClick={() => loadPreferences(pagination.page - 1)}>
                        Prev
                      </Button>
                      <span className="align-self-center text-muted" style={{ fontSize: 13 }}>
                        {pagination.page} / {pagination.totalPages}
                      </span>
                      <Button size="sm" variant="outline-secondary"
                        disabled={pagination.page >= pagination.totalPages} onClick={() => loadPreferences(pagination.page + 1)}>
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Tab.Pane>

          {/* ── Tab 2: Find Players for Match ── */}
          <Tab.Pane eventKey="findPlayers">
            <div className="bg-white rounded shadow-sm p-md-3 p-2">
              <h6 className="mb-1 tabel-title">Find Players for Open Match</h6>
              <p className="text-muted small mb-3">
                Select an open match to automatically find players by club, day, time, and skill level.
              </p>

              <Row
                className="g-2 mb-3 align-items-start"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #eef2f7",
                  borderRadius: 6,
                  margin: 0,
                  padding: "10px 8px",
                }}
              >
                <Col xs={12} xl={4} lg={6}>
                  <Form.Label className="small mb-1">Open Match</Form.Label>
                  <Form.Select
                    size="sm"
                    value={selectedOpenMatchId}
                    onChange={(e) => handleOpenMatchSelect(e.target.value)}
                    disabled={openMatchesLoading}
                  >
                    <option value="">
                      {openMatchesLoading ? "Loading open matches..." : "Select an open match"}
                    </option>
                    <option value={CREATE_OPEN_MATCH_VALUE}>+ Create Open Match</option>
                    {openMatches.map((match) => (
                      <option key={match?._id} value={match?._id}>
                        {getOpenMatchLabel(match)}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={12} xl={2} lg={3} md={6}>
                  <Form.Label className="small mb-1">Club</Form.Label>
                  <Form.Select size="sm" value={matchFilters.clubId}
                    onChange={(e) => handleManualFilterChange("clubId", e.target.value)}>
                    <option value="">All Clubs</option>
                    {clubs.map((c) => <option key={c._id} value={c._id}>{c.clubName || c.name}</option>)}
                  </Form.Select>
                </Col>
                <Col xs={12} xl={1} lg={3} md={6}>
                  <Form.Label className="small mb-1">Day</Form.Label>
                  <Select
                    isMulti
                    closeMenuOnSelect={false}
                    controlShouldRenderValue={false}
                    components={compactMultiSelectComponents}
                    hideSelectedOptions={false}
                    options={toSelectOptions(DAY_OPTIONS)}
                    value={selectValues(toSelectOptions(DAY_OPTIONS), matchFilters.day)}
                    onChange={(value) => handleManualFilterChange("day", (value || []).map((option) => option.value))}
                    placeholder={getMultiPlaceholder("Any Day", matchFilters.day)}
                    styles={compactSelectStyles}
                  />
                </Col>
                <Col xs={12} xl={2} lg={4} md={6}>
                  <Form.Label className="small mb-1">Time Slot</Form.Label>
                  <Select
                    isMulti
                    closeMenuOnSelect={false}
                    controlShouldRenderValue={false}
                    components={compactMultiSelectComponents}
                    hideSelectedOptions={false}
                    options={getTimeSlotOptionsForSearch()}
                    value={selectValues(getTimeSlotOptionsForSearch().flatMap((group) => group.options), matchFilters.timeSlot)}
                    onChange={(value) => handleManualFilterChange("timeSlot", (value || []).map((option) => option.value))}
                    placeholder={getMultiPlaceholder("Any Time", matchFilters.timeSlot)}
                    styles={compactSelectStyles}
                  />
                </Col>
                <Col xs={12} xl={1} lg={4} md={6}>
                  <Form.Label className="small mb-1">Skill Level</Form.Label>
                  <Select
                    isMulti
                    closeMenuOnSelect={false}
                    controlShouldRenderValue={false}
                    components={compactMultiSelectComponents}
                    hideSelectedOptions={false}
                    options={toSelectOptions(SKILL_LEVEL_OPTIONS)}
                    value={selectValues(toSelectOptions(SKILL_LEVEL_OPTIONS), matchFilters.skillLevel)}
                    onChange={(value) => handleManualFilterChange("skillLevel", (value || []).map((option) => option.value))}
                    placeholder={getMultiPlaceholder("Any Level", matchFilters.skillLevel)}
                    styles={compactSelectStyles}
                  />
                </Col>
                <Col xs={6} xl={1} lg={4} md={6} className="d-flex align-items-start" style={{ paddingTop: 25 }}>
                  <Button size="sm" className="w-100" onClick={handleMatchSearch} disabled={matchSearchLoading}
                    style={{ backgroundColor: "#1f41bb", border: "none", fontFamily: "Poppins" }}>
                    {matchSearchLoading ? <ButtonLoading size={8} /> : <><FaSearch size={12} className="me-1" />Search</>}
                  </Button>
                </Col>
                <Col xs={6} xl={1} lg={4} md={6} className="d-flex align-items-start" style={{ paddingTop: 25 }}>
                  <Button size="sm" variant="outline-secondary" className="w-100" onClick={handleResetMatchFilters}>
                    <FaTimes size={12} className="me-1" />Reset
                  </Button>
                </Col>
              </Row>

              {matchSearchLoading ? (
                <DataLoading height="200px" />
              ) : matchSearchError ? (
                <div className="text-center text-danger py-4" style={{ fontSize: 14 }}>
                  {matchSearchError}
                </div>
              ) : matchSearchResults.length === 0 ? (
                <div className="text-center text-muted py-4" style={{ fontSize: 14 }}>
                  {hasMatchFilters
                    ? "No matching player preferences found for the selected filters."
                    : "Select an open match above, or use the manual filters and click Search."}
                </div>
              ) : (
                <>
                  <div className="text-muted small mb-2">
                    Found <strong>{matchSearchPagination.total}</strong> matching player{matchSearchPagination.total !== 1 ? "s" : ""}
                    {selectedMatchContext?.day && (
                      <span> for <strong>{selectedMatchContext.day}</strong></span>
                    )}
                  </div>

                  {/* Desktop */}
                  <div className="d-none d-md-block">
                    <Table responsive borderless size="sm" className="custom-table align-middle" style={{ tableLayout: "fixed" }}>
                      <thead>
                        <tr>
                          <th className="text-center" style={{ width: 45 }}>#</th>
                          <th className="text-start" style={{ width: 160 }}>Player</th>
                          <th className="text-start" style={{ width: 150 }}>Phone</th>
                          <th className="text-center" style={{ width: 105 }}>Skill</th>
                          <th className="text-start">Schedule</th>
                          <th className="text-center" style={{ width: 95 }}>Notes</th>
                          <th className="text-center" style={{ width: 125 }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchSearchResults.map((pref, idx) => (
                          <tr key={pref._id}>
                            <td className="text-muted text-center">{idx + 1}</td>
                            <td>
                              <div className="fw-semibold text-truncate" style={{ fontSize: 13 }}>
                                {pref.customerId?.name} {pref.customerId?.lastName || ""}
                              </div>
                              {pref.customerId?.email && (
                                <div className="text-muted text-truncate" style={{ fontSize: 11 }}>{pref.customerId.email}</div>
                              )}
                            </td>
                            <td className="text-nowrap">
                              <strong style={{ fontSize: 12 }}>
                                {pref.customerId?.countryCode} {pref.customerId?.phoneNumber}
                              </strong>
                            </td>
                            <td className="text-center">
                              {pref.skillLevel
                                ? <Badge bg={SKILL_COLORS[pref.skillLevel] || "secondary"}>{pref.skillLevel}</Badge>
                                : <span className="text-muted">—</span>}
                            </td>
                            <td>
                              {(pref.preferredSchedule || []).length > 0
                                ? formatScheduleSummary(pref.preferredSchedule, true)
                                : <span className="text-muted">—</span>}
                            </td>
                            <td className="text-center" style={{ fontSize: 12 }}>
                              {pref.notes || <span className="text-muted">—</span>}
                            </td>
                            <td className="text-center">{getMatchRequestButton(pref)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Mobile */}
                  <div className="d-block d-md-none">
                    {matchSearchResults.map((pref) => (
                      <div key={pref._id} className="card mb-2 border-0 shadow-sm">
                        <div className="card-body p-2">
                          <div className="fw-semibold" style={{ fontSize: 13 }}>
                            {pref.customerId?.name} {pref.customerId?.lastName || ""}
                          </div>
                          <div className="fw-semibold text-primary" style={{ fontSize: 13 }}>
                            {pref.customerId?.countryCode} {pref.customerId?.phoneNumber}
                          </div>
                          {pref.skillLevel && (
                            <Badge bg={SKILL_COLORS[pref.skillLevel] || "secondary"} className="mt-1">
                              {pref.skillLevel}
                            </Badge>
                          )}
                          {(pref.preferredSchedule || []).length > 0 && (
                            <div className="mt-1">{formatScheduleSummary(pref.preferredSchedule)}</div>
                          )}
                          <div className="mt-2">{getMatchRequestButton(pref)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Create / Edit Modal */}
      <Modal show={showFormModal} onHide={closeModal} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontFamily: "Poppins", fontSize: 16 }}>
            {editingPref ? "Edit Player Preference" : "Add Player Preference"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {renderCustomerBanner()}
            {(editingPref || phoneSubmitted) && renderPreferenceFields()}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal} disabled={saveLoading}>Cancel</Button>
            {showSave && (
              <Button type="submit" disabled={saveDisabled} style={{ backgroundColor: "#1f41bb", border: "none", opacity: saveDisabled && !saveLoading ? 0.55 : 1 }}>
                {saveLoading ? <ButtonLoading size={8} /> : (editingPref ? "Update" : "Save Preference")}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 15, fontFamily: "Poppins" }}>Delete Preference</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-3">
          Are you sure you want to delete this player preference?
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <ButtonLoading size={8} /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PlayerPreferences;
