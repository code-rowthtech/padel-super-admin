import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaChevronDown,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { useDispatch, useSelector } from "react-redux";
import { DataLoading } from "../../../helpers/loading/Loaders";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import { MdKeyboardArrowDown, MdOutlineArrowBackIosNew } from "react-icons/md";
import { getMatchesUser } from "../../../redux/user/matches/thunk";
import { getReviewClub } from "../../../redux/user/club/thunk";
import "react-datepicker/dist/react-datepicker.css";
import {
  booking_dropdown_img,
  booking_dropdown_img2,
  booking_dropdown_img3,
  booking_dropdown_img4,
  morningTab,
  nighttab,
  player,
  player2,
  sun,
} from "../../../assets/files";
import UpdatePlayers from "../VeiwMatch/UpdatePlayers";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { MdOutlineDateRange } from "react-icons/md";
import debounce from "lodash/debounce";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ViewMatch from "../VeiwMatch/VeiwMatch";
import { HiMoon } from "react-icons/hi";
import { BsSunFill } from "react-icons/bs";
import { PiSunHorizonFill } from "react-icons/pi";
import { IoIosArrowForward } from "react-icons/io";

const normalizeTime = (time) => {
  if (!time) return null;
  const match = time.match(/^(\d{1,2}):00\s*(AM|PM)$/i);
  if (match) {
    return `${match[1]} ${match[2].toLowerCase()}`;
  }
  return time;
};

const getTimeCategory = (time) => {
  if (!time) return null;
  const normalized = normalizeTime(time);
  const match = normalized?.match(/^(\d{1,2}) (am|pm)$/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const period = match[2].toLowerCase();
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  if (hour < 12) return "morning"; // 12 AM से 11:59 AM
  if (hour >= 12 && hour < 16) return "noon"; // 12 PM से 3:59 PM
  return "night"; // 4 PM onwards
};

const Openmatches = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUnavailableOnly, setShowUnavailableOnly] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState({
    fullDate: new Date().toISOString().split("T")[0],
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
  });
  const [activeTab, setActiveTab] = useState(0); // Default to morning tab
  const scrollRef = useRef(null);
  const dateRefs = useRef({});
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = getUserFromSession();
  const matchesData = useSelector((state) => state.userMatches?.usersData);
  const matchLoading = useSelector((state) => state.userMatches?.usersLoading);
  const reviewData = useSelector(
    (state) => state.userClub?.getReviewData?.data
  );
  const reviewLoading = useSelector((state) => state.userClub?.reviewLoading);
  const [showModal, setShowModal] = useState(false);
  const [matchId, setMatchId] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [showViewMatch, setShowViewMatch] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const debouncedFetchMatches = useCallback(
    debounce((payload) => {
      dispatch(getMatchesUser(payload));
    }, 300),
    [dispatch]
  );

  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const savedClubId = localStorage.getItem("register_club_id");
    if (savedClubId) {
      dispatch(getReviewClub(savedClubId));
    }
  }, [dispatch]);

  useEffect(() => {
    if (selectedDate?.fullDate && dateRefs.current[selectedDate?.fullDate]) {
      const selectedIndex = dates.findIndex(
        (d) => d.fullDate === selectedDate.fullDate
      );
      if (selectedIndex !== -1) {
        const targetIndex = Math.max(
          0,
          Math.min(
            selectedIndex - Math.floor(visibleDays / 2),
            dates.length - visibleDays
          )
        );
        setStartIndex(targetIndex);
        dateRefs.current[selectedDate?.fullDate].scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [selectedDate?.fullDate]);

  useEffect(() => {
    const payload = {
      matchDate: selectedDate?.fullDate,
      ...(selectedTime && { matchTime: normalizeTime(selectedTime) }),
      ...(selectedLevel && { skillLevel: selectedLevel }),
    };
    debouncedFetchMatches(payload);
  }, [selectedDate, selectedTime, selectedLevel, debouncedFetchMatches]);

  const today = new Date();
  const dates = Array.from({ length: 41 }).map((_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      fullDate: date.toISOString().split("T")[0],
    };
  });

  // Helper to check matches for a specific time category
  const getMatchesForTab = (tabLabel, matches) => {
    return matches.filter((match) => {
      return match.slot?.some((slot) => {
        return slot.slotTimes?.some((slotTime) => {
          const category = getTimeCategory(slotTime.time);
          return category === tabLabel;
        });
      });
    });
  };

  // Filtered matches with tab logic
  const filteredMatches = useMemo(() => {
    let matches = matchesData?.data || [];

    if (showUnavailableOnly) {
      matches = matches.filter((match) => match?.players?.length >= 4);
    }

    const tabLabels = ["morning", "noon", "night"];
    const currentTab = tabLabels[activeTab];

    return getMatchesForTab(currentTab, matches);
  }, [showUnavailableOnly, matchesData, activeTab]);

  // Automatically switch tabs if the current tab has no matches
  useEffect(() => {
    if (
      !matchLoading &&
      filteredMatches.length === 0 &&
      matchesData?.data?.length > 0
    ) {
      const tabLabels = ["morning", "noon", "night"];
      // Try to find the next tab with matches
      for (let i = 0; i < tabLabels.length; i++) {
        if (i === activeTab) continue; // Skip current tab
        const matchesForTab = getMatchesForTab(
          tabLabels[i],
          matchesData?.data || []
        );
        if (matchesForTab.length > 0) {
          setActiveTab(i); // Switch to the first tab with matches
          break;
        }
      }
    }
  }, [filteredMatches, matchesData, activeTab, matchLoading]);

  const toggleTime = (time) => {
    setSelectedTime(selectedTime === time ? null : time);
  };

  const maxSelectableDate = new Date();
  maxSelectableDate.setDate(maxSelectableDate.getDate() + 15);

  const [startIndex, setStartIndex] = useState(0);
  const visibleDays = 7;

  const handleSelect = (level) => {
    setSelectedLevel(level);
  };

  const createMatchesHandle = () => {
    if (user?.id || user?._id) {
      navigate("/create-matches");
    } else {
      navigate("/login", {
        state: {
          redirectTo: "/create-matches",
        },
      });
    }
  };
  const formatMatchDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("en-US", { day: "2-digit" });
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return `${day} ${month}`;
  };

  const calculateMatchPrice = (slots) => {
    return slots
      ?.reduce((total, court) => {
        return (
          total +
          court.slotTimes.reduce(
            (sum, slotTime) => sum + Number(slotTime.amount || 0),
            0
          )
        );
      }, 0)
      .toFixed(0);
  };

  const tabs = [
    { Icon: PiSunHorizonFill, label: "Morning", key: "morning" },
    { Icon: BsSunFill, label: "Noon", key: "noon" },
    { Icon: HiMoon, label: "Evening", key: "night" },
  ];

  const formatTimes = (slots) => {
    if (!slots || slots.length === 0) return "N/A";
    const formatted = slots
      .slice(0, 1)
      .map((slot) => {
        const time = slot?.slotTimes?.[0]?.time;
        if (!time) return null;
        if (/am|pm/i.test(time)) {
          return time.replace(/\s+/g, "").toUpperCase();
        }
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${formattedHour}${period}`;
      })
      .filter(Boolean);
    return formatted.join(",") + (slots.length > 1 ? "...." : "");
  };

  const TagWrapper = ({ children }) => (
    <div
      className="d-flex align-items-center rounded-pill pe-3 me-0"
      style={{
        backgroundColor: "#fff",
        borderRadius: "999px",
        zIndex: 999,
        position: "relative",
        top: "0px",
        left: "20px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      {children}
    </div>
  );

  const AvailableTag = ({ team, match, name }) => (
    <TagWrapper>
      <div
        className="d-flex justify-content-center align-items-center rounded-circle"
        style={{
          width: "30px",
          height: "30px",
          border: "1px solid #1F41BB",
          color: "#1F41BB",
          fontSize: "24px",
          fontWeight: "400",
          marginRight: "10px",
          cursor: "pointer",
        }}
        onClick={() => {
          setShowModal(true);
          setMatchId(match?._id);
          setTeamName(name);
        }}
      >
        <span className="mb-1">+</span>
      </div>

      <div className="d-flex flex-column ps-0 align-items-start">
        <span style={{ fontWeight: 600, color: "#1F41BB", fontSize: "10px" }}>
          Available
        </span>
        <small style={{ fontSize: "10px", color: "#6B7280" }}>{team}</small>
      </div>
    </TagWrapper>
  );

  const FirstPlayerTag = ({ player }) => (
    <TagWrapper>
      <div
        className="d-flex justify-content-center align-items-center rounded-circle overflow-hidden"
        style={{
          width: "30px",
          height: "30px",
          backgroundColor: player?.userId?.profilePic
            ? "transparent"
            : "#374151",
          overflow: "hidden",
          border: "1px solid #E5E7EB",
        }}
      >
        {player?.profilePic ? (
          <img
            src={player?.profilePic}
            alt={player?.name || "Player"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            style={{ color: "#F1F1F1", fontWeight: "600", fontSize: "16px" }}
          >
            {player?.name ? player?.name.charAt(0).toUpperCase() : "P"}
          </span>
        )}
      </div>
      <div className="ps-1 text-start">
        <p
          className="m-0"
          title={player?.name || "Player"}
          style={{
            fontWeight: 600,
            color: "#111827",
            fontSize: "12px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100px",
          }}
        >
          {player?.name
            ? player.name.length > 6
              ? `${player.name.slice(0, 6)}...`
              : player.name
            : "Player"}
        </p>
        <p
          className="m-0 mb-1 d-flex justify-content-center align-items-center rounded"
          style={{
            fontSize: "10px",
            color: "#6B7280",
            fontWeight: "500",
            width: "30px",
            backgroundColor: "#BEEDCC",
          }}
        >
          A|B
        </p>
      </div>
    </TagWrapper>
  );

  const PlayerAvatar = ({ player, idx, total }) => (
    <div
      className="rounded-circle border d-flex align-items-center justify-content-center position-relative"
      style={{
        width: "30px",
        height: "30px",
        marginLeft: idx !== 0 ? "-15px" : "0",
        zIndex: total - idx,
        backgroundColor: player?.userId?.profilePic ? "transparent" : "#374151",
        overflow: "hidden",
        border: "1px solid #E5E7EB",
      }}
    >
      {player?.userId?.profilePic ? (
        <img
          src={player?.userId?.profilePic}
          alt={player?.userId?.name || "Player"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span
          style={{
            color: "white",
            fontWeight: "600",
            fontSize: "16px",
          }}
        >
          {player?.userId?.name
            ? player?.userId?.name.charAt(0).toUpperCase()
            : "U"}
        </span>
      )}
    </div>
  );

  const dayShortMap = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };

  const getCurrentMonth = (selectedDate) => {
    if (!selectedDate || !selectedDate.fullDate) return "MONTH";
    const dateObj = new Date(selectedDate.fullDate);
    const month = dateObj
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    return month.split("").join("\n");
  };

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  return (
    <div className="container mt-lg-4 px-3 px-md-4 mb-md-4 mb-0">
      <div className="row g-md-4 mx-auto">
        {/* Left Section */}
        <div
          className={`col-lg-7 col-12 py-md-4 py-2 rounded-3 px-md-4 px-0 order-2 order-md-1 bg-white-color ${
            showViewMatch ? "d-none d-md-block" : ""
          }`}
          style={{ backgroundColor: "#F5F5F566", height: "auto" }}
        >
          <div className="calendar-strip mb-3">
            <div className="mb-md-4 mb-0 mt-1 mt-md-0 custom-heading-use">
              Select Date
              <div
                className="position-relative d-inline-block"
                ref={wrapperRef}
              >
                <span
                  className="rounded p-1 pt-0 ms-1"
                  style={{
                    cursor: "pointer",
                    width: "26px !important",
                    height: "26px !important",
                  }}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <MdOutlineDateRange size={16} style={{ color: "#374151" }} />
                </span>
                {isOpen && (
                  <div
                    className="position-absolute mt-2 z-3 bg-white border rounded shadow"
                    style={{ top: "100%", left: "0", minWidth: "100%" }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <StaticDatePicker
                        displayStaticWrapperAs="desktop"
                        value={startDate}
                        onChange={(date) => {
                          setStartDate(date);
                          setIsOpen(false);
                          const formattedDate = date
                            .toISOString()
                            .split("T")[0];
                          const day = date.toLocaleDateString("en-US", {
                            weekday: "long",
                          });
                          setSelectedDate({ fullDate: formattedDate, day });
                          setSelectedTime(null);
                        }}
                        minDate={new Date()}
                        maxDate={maxSelectableDate}
                        slotProps={{
                          actionBar: { actions: [] },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                )}
              </div>
            </div>
            <div className="d-flex align-items-center mb-md-3 mb-2 gap-2 border-bottom">
              {/* Dropdown */}
              <div className="position-relative mt-md-0 mt-2">
                <div
                  className="d-flex justify-content-start border align-items-center gap-0 rounded p-2 pe-3 ps-0 mb-md-3 mb-2"
                  style={{
                    backgroundColor: "transparent",
                    width: "52px",
                    height: "58px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="d-flex align-items-center gap-0 p-0">
                    <img
                      src={booking_dropdown_img}
                      style={{ width: "34px", height: "34px" }}
                      alt=""
                    />
                    <MdKeyboardArrowDown
                      size={16}
                      style={{
                        transform: showDropdown
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                      className="d-none d-md-block"
                    />
                  </div>
                </div>

                {showDropdown && (
                  <div
                    className="position-absolute bg-white rounded shadow"
                    style={{
                      top: "100%",
                      left: "-10px",
                      width: "105px",
                      zIndex: 1000,
                      marginTop: "-15px",
                    }}
                  >
                    <div
                      className="d-flex align-items-center p-2 border-bottom"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="flex-grow-1">
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "400",
                            fontFamily: "Poppins",
                          }}
                        >
                          Paddle
                        </div>
                      </div>
                      <img
                        src={booking_dropdown_img2}
                        style={{ width: "23px", height: "23px" }}
                        alt=""
                      />
                    </div>

                    <div
                      className="d-flex align-items-center p-2 border-bottom"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="flex-grow-1">
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "400",
                            fontFamily: "Poppins",
                          }}
                        >
                          Tennis
                        </div>
                      </div>
                      <img
                        src={booking_dropdown_img3}
                        style={{ width: "23px", height: "23px" }}
                        alt=""
                      />
                    </div>

                    <div
                      className="d-flex align-items-center p-2"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="flex-grow-1">
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "400",
                            fontFamily: "Poppins",
                          }}
                        >
                          Pickle Ball
                        </div>
                      </div>
                      <img
                        src={booking_dropdown_img4}
                        style={{ width: "23px", height: "23px" }}
                        alt=""
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Month Box */}
              <div
                className="d-flex calendar-day-btn-mobile justify-content-center align-items-center rounded-1 mb-md-3 mb-2 mt-2 mt-md-0"
                style={{
                  backgroundColor: "#f3f3f5",
                  height: "58px",
                  padding: "2px 10px",
                }}
              >
                <span
                  className="add_font_small_span"
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    whiteSpace: "pre-line",
                    textAlign: "center",
                    lineHeight: "1",
                    letterSpacing: "0px",
                    margin: 0,
                    padding: 0,
                    display: "block",
                  }}
                >
                  {getCurrentMonth(selectedDate)}
                </span>
              </div>

              {/* Scrollable Dates EXACT copy UI */}
              <div
                className="d-flex gap-1"
                style={{ position: "relative", maxWidth: "86%" }}
              >
                {/* Left Arrow */}
                <button
                  className="btn p-2 border-0 d-none d-md-block"
                  style={{
                    position: "absolute",
                    left: "-23%",
                    zIndex: 10,
                    boxShadow: "none",
                  }}
                  onClick={scrollLeft}
                >
                  <MdOutlineArrowBackIosNew className="mt-2" size={20} />
                </button>

                {/* Scrollable dates */}
                <div
                  ref={scrollRef}
                  className="d-flex gap-1 date-scroll-container pt-md-0 pt-2"
                  style={{
                    scrollBehavior: "smooth",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    overflow: "hidden",
                  }}
                >
                  {dates.map((d, i) => {
                    const formatDate = (date) =>
                      date.toISOString().split("T")[0];
                    const isSelected =
                      formatDate(new Date(selectedDate?.fullDate)) ===
                      d.fullDate;

                    return (
                      <button
                        key={i}
                        ref={(el) => (dateRefs.current[d.fullDate] = el)}
                        className={`calendar-day-btn mb-md-3 mb-2 me-1 position-relative ${
                          isSelected ? "text-white border-0" : "bg-white"
                        }`}
                        style={{
                          background: isSelected
                            ? "linear-gradient(180deg, #0034E4 0%, #001B76 100%)"
                            : "#FFFFFF",
                          boxShadow: isSelected
                            ? "0px 4px 4px 0px #00000040"
                            : "",
                          borderRadius: "5px",
                          color: isSelected ? "#FFFFFF" : "#374151",
                        }}
                        onClick={() => {
                          setSelectedDate({ fullDate: d.fullDate, day: d.day });
                          setStartDate(new Date(d.fullDate));
                          dispatch(getMatchesUser({ matchDate: d.fullDate }));
                        }}
                        onMouseEnter={(e) =>
                          !isSelected &&
                          (e.currentTarget.style.border = "1px solid #3DBE64")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.border = "1px solid #4949491A")
                        }
                      >
                        <div className="text-center">
                          <div className="date-center-date">{d.date}</div>
                          <div className="date-center-day">
                            {dayShortMap[d.day]}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Right Arrow */}
                <button
                  className="btn border-0 p-2 d-none d-md-block"
                  style={{
                    position: "absolute",
                    right: -26,
                    zIndex: 10,
                    boxShadow: "none",
                  }}
                  onClick={scrollRight}
                >
                  <MdOutlineArrowForwardIos className="mt-2" size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="row mb-md-2 mb-0 mx-auto">
            <div className="col-12 d-flex justify-content-center align-items-center px-0">
              <div className="weather-tabs-wrapper w-100">
                <div className="weather-tabs rounded-3 d-flex justify-content-center align-items-center">
                  {tabs.map((tab, index) => {
                    const Icon = tab.Icon;
                    return (
                      <div
                        key={index}
                        className={`tab-item rounded-3 ${
                          activeTab === index ? "active" : ""
                        }`}
                        onClick={() => setActiveTab(index)}
                      >
                        <Icon
                          size={24}
                          className={
                            activeTab === index ? "text-primary" : "text-dark"
                          } // dark when inactive
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Labels below tabs */}
                <div className="tab-labels d-flex justify-content-between">
                  {tabs.map((tab, index) => (
                    <p
                      key={index}
                      className={`tab-label ${
                        activeTab === index
                          ? "active text-primary"
                          : "text-muted"
                      }`}
                    >
                      {tab.label}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Match List */}
          <div className="pb-0">
            <div className="d-flex flex-md-row justify-content-between align-items-center gap-3 mb-md-2 mb-2">
              <h5 className="mb-0 custom-heading-use">All Matches</h5>
              <div className="dropdown">
                <button
                  className="btn btn-light text-nowrap rounded-3 border py-1 px-3 d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-label="Select skill level"
                  style={{ width: "130px" }}
                >
                  <span
                    className="me-3"
                    style={{
                      fontSize: "10px",
                      fontFamily: "Poppins",
                      fontWeight: "500",
                    }}
                  >
                    {selectedLevel?.charAt(0)?.toUpperCase() +
                      selectedLevel?.slice(1) || "Choose level"}
                  </span>
                  <FaChevronDown style={{ fontSize: "10px" }} />
                </button>
                <ul className="dropdown-menu shadow-sm w-50">
                  {["beginner", "intermediate", "advanced", "professional"].map(
                    (level) => (
                      <li key={level}>
                        <button
                          className="dropdown-item mb-3"
                          style={{
                            fontSize: "14px",
                            fontWeight: "400",
                            fontFamily: "Poppins",
                          }}
                          onClick={() => handleSelect(level)}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            <div
              style={{
                minHeight: "400px",
                height: "400px",
                maxHeight: filteredMatches.length > 4 ? "380px" : "auto",
                overflowY: filteredMatches.length > 4 ? "auto" : "auto",
                scrollBehavior: "smooth",
              }}
              className="no-scrollbar"
            >
              {matchLoading ? (
                <DataLoading height={380} />
              ) : filteredMatches.length > 0 ? (
                <div className="row mx-auto">
                  {filteredMatches?.map((match, index) => (
                    <div
                      className="col-lg-6 col-12 ps-0 pe-0 gap-2"
                      key={index}
                    >
                      <div className="row px-1">
                        <div className="col">
                          <div
                            className="card  mb-2 py-3 p-0 shadow-0 rounded-2 d-md-block d-none"
                            style={{
                              backgroundColor: "#CBD6FF1A",
                              border: "0.45px solid #0000001A",
                              boxShadow: "none",
                              height: "10rem",
                            }}
                          >
                            <div className="row px-2 mx-auto px-md-0 py-2 d-flex justify-content-between align-items- flex-wrap">
                              <div className="col-lg-7 col-6">
                                <p
                                  className="mb-0 all-match-time text-nowrap"
                                  style={{ fontWeight: "600" }}
                                >
                                  {formatMatchDate(match.matchDate)} |{" "}
                                  {formatTimes(match.slot)}
                                </p>
                                <span className="text-muted all-match-name-level ms-0 d-none d-md-inline">
                                  {match?.skillLevel
                                    ? match.skillLevel.charAt(0).toUpperCase() +
                                      match.skillLevel.slice(1)
                                    : "N/A"}
                                </span>
                                <p className="all-match-time mb-0 d-md-none d-lg-none">
                                  {match?.skillLevel
                                    ? match.skillLevel.charAt(0).toUpperCase() +
                                      match.skillLevel.slice(1)
                                    : "N/A"}
                                </p>
                                <p className="mb-1 all-match-name-level mt-4">
                                  {match?.clubId?.clubName || "Unknown Club"}
                                </p>
                                <p
                                  className="mb-0 text-muted all-match-name-level"
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: "400",
                                  }}
                                >
                                  <FaMapMarkerAlt
                                    className="me-1"
                                    style={{ fontSize: "10px" }}
                                  />
                                  {match?.clubId?.city
                                    .charAt(0)
                                    ?.toUpperCase() +
                                    match?.clubId?.city.slice(1) || "N/A"}{" "}
                                  {match?.clubId?.zipCode || ""}
                                </p>
                              </div>

                              <div className="col-6 col-lg-5 d-flex justify-content-end align-items-center">
                                <div className="d-flex flex-column align-items-end">
                                  <div className="d-flex align-items-center mb-4">
                                    {match?.teamA?.length === 1 ||
                                    match?.teamA?.length === 0 ? (
                                      <AvailableTag
                                        team="Team A"
                                        match={match}
                                        name="teamA"
                                      />
                                    ) : match?.teamB?.length === 1 ||
                                      match?.teamB?.length === 0 ? (
                                      <AvailableTag
                                        team="Team B"
                                        match={match}
                                        name="teamB"
                                      />
                                    ) : match?.teamA?.length === 2 &&
                                      match?.teamB?.length === 2 ? (
                                      <FirstPlayerTag
                                        player={match?.teamA[0]?.userId}
                                      />
                                    ) : null}

                                    <div className="d-flex align-items-center ms-2">
                                      {[
                                        ...(match?.teamA?.filter((_, idx) =>
                                          match?.teamA?.length === 2 &&
                                          match?.teamB?.length === 2
                                            ? idx !== 0
                                            : true
                                        ) || []),
                                        ...(match?.teamB || []),
                                      ].map((player, idx, arr) => (
                                        <PlayerAvatar
                                          key={`player-${idx}`}
                                          player={player}
                                          idx={idx}
                                          total={arr.length}
                                        />
                                      ))}
                                    </div>
                                  </div>

                                  <div
                                    className="d-flex align-items-center justify-content-end"
                                    style={{ width: "100%" }}
                                  >
                                    <div
                                      className="d-flex align-items-center gap-1"
                                      style={{
                                        fontWeight: 500,
                                        fontSize: "20px",
                                        fontFamily: "none",
                                        color: "#1F41BB",
                                      }}
                                    >
                                      ₹
                                      <span
                                        style={{
                                          fontSize: "28px",
                                          fontWeight: 600,
                                          fontFamily: "Poppins",
                                          color: "#1F41BB",
                                        }}
                                      >
                                        {calculateMatchPrice(match?.slot) || 0}
                                      </span>
                                      <button
                                        className="btn rounded-pill d-flex justify-content-center align-items-center text-dark p-0 border-0"
                                        onClick={() => {
                                          setSelectedMatch(match);
                                          setShowViewMatch(true);
                                        }}
                                        aria-label={`View match on ${formatMatchDate(
                                          match.matchDate
                                        )}`}
                                      >
                                        <IoIosArrowForward />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className="card  mb-2 py-2 p-0 shadow-0 rounded-3 d-block d-md-none"
                        style={{
                          backgroundColor: "#CBD6FF1A",
                          border: "0.45px solid #0000001A",
                          boxShadow: "none",
                        }}
                      >
                        <div className="row px-0 px-md-3 pt-0 pb-0 d-flex justify-content-between align-items- flex-wrap mx-auto">
                          <div className="col-12">
                            <p
                              className="mb-1 all-match-time text-nowrap"
                              style={{ fontWeight: "600" }}
                            >
                              {formatMatchDate(match.matchDate)} |{" "}
                              {formatTimes(match.slot)}
                            </p>
                          </div>
                          <div className="col-12">
                            <span className="text-muted all-match-name-level ms-3 d-none d-md-inline">
                              {match?.skillLevel
                                ? match.skillLevel.charAt(0).toUpperCase() +
                                  match.skillLevel.slice(1)
                                : "N/A"}
                            </span>
                          </div>
                          <div className="col-12 mb-2">
                            <p className="all-match-time mb-0 d-md-none d-lg-none">
                              {match?.skillLevel
                                ? match.skillLevel.charAt(0).toUpperCase() +
                                  match.skillLevel.slice(1)
                                : "N/A"}
                            </p>
                          </div>
                          {/* <div className="col-12 d-flex justify-content-end align-items-center">
                                                        <div className="d-flex flex-column align-items-end">
                                                            <div className="d-flex align-items-center mb-3">
                                                                {match?.teamA?.length === 1 || match?.teamA?.length === 0 ? (
                                                                    <AvailableTag team="Team A" match={match} name="teamA" />
                                                                ) : match?.teamB?.length === 1 || match?.teamB?.length === 0 ? (
                                                                    <AvailableTag team="Team B" match={match} name="teamB" />
                                                                ) : match?.teamA?.length === 2 && match?.teamB?.length === 2 ? (
                                                                    <FirstPlayerTag player={match?.teamA[0]?.userId} />
                                                                ) : null}

                                                                <div className="d-flex align-items-center ms-2">
                                                                    {[
                                                                        ...(match?.teamA?.filter((_, idx) =>
                                                                            match?.teamA?.length === 2 && match?.teamB?.length === 2
                                                                                ? idx !== 0
                                                                                : true
                                                                        ) || []),
                                                                        ...(match?.teamB || []),
                                                                    ].map((player, idx, arr) => (
                                                                        <PlayerAvatar
                                                                            key={`player-${idx}`}
                                                                            player={player}
                                                                            idx={idx}
                                                                            total={arr.length}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>


                                                        </div>

                                                    </div> */}

                          <div className="row mx-auto">
                            {/* LEFT SIDE */}
                            <div className="col-6 px-0 d-flex justify-content-between align-items-center  flex-wrap">
                              {/* Player 1 */}
                              <div className="text-center d-flex justify-content-center align-items-center flex-column mb-2 position-relative col-6">
                                <div
                                  className="rounded-circle border d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "68px",
                                    height: "68px",
                                    backgroundColor: "rgb(31, 65, 187)",
                                    overflow: "hidden",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "white",
                                      fontWeight: 600,
                                      fontSize: "24px",
                                    }}
                                  >
                                    A
                                  </span>
                                </div>

                                <span
                                  data-tooltip-id="player-A-0"
                                  data-tooltip-content="Abhishek Balyani"
                                  className="mb-0 mt-2"
                                  style={{
                                    maxWidth: "150px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    display: "inline-block",
                                    cursor: "pointer",
                                    fontSize: "10px",
                                    fontWeight: 500,
                                    fontFamily: "Poppins",
                                  }}
                                >
                                  Abhishek Bal...
                                </span>

                                {/* <span className="badge text-white" style={{ backgroundColor: "rgb(61, 190, 100)" }}>A|B</span> */}
                              </div>

                              {/* Player 2 */}
                              <div className="text-center d-flex justify-content-center align-items-center flex-column mb-2 position-relative col-6">
                                <div
                                  className="rounded-circle border d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "68px",
                                    height: "68px",
                                    backgroundColor: "rgb(31, 65, 187)",
                                    overflow: "hidden",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "white",
                                      fontWeight: 600,
                                      fontSize: "24px",
                                    }}
                                  >
                                    A
                                  </span>
                                </div>

                                <p
                                  className="mb-0 mt-2"
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 500,
                                    fontFamily: "Poppins",
                                  }}
                                >
                                  Ankit
                                </p>

                                {/* <span className="badge text-white" style={{ backgroundColor: "rgb(61, 190, 100)" }}>B2</span> */}
                              </div>
                            </div>

                            {/* RIGHT SIDE */}
                            <div className="col-6  px-0 d-flex justify-content-between align-items-center flex-wrap border-start border-0 border-lg-start">
                              {/* Player 3 */}
                              <div className="text-center d-flex justify-content-center align-items-center flex-column mb-2 position-relative col-6">
                                <div
                                  className="rounded-circle border d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "68px",
                                    height: "68px",
                                    backgroundColor: "rgb(31, 65, 187)",
                                    overflow: "hidden",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "white",
                                      fontWeight: 600,
                                      fontSize: "24px",
                                    }}
                                  >
                                    D
                                  </span>
                                </div>

                                <p
                                  className="mb-0 mt-2"
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 500,
                                    fontFamily: "Poppins",
                                  }}
                                >
                                  Diksha
                                </p>

                                {/* <span className="badge text-white" style={{ backgroundColor: "rgb(31, 65, 187)" }}>D1</span> */}
                              </div>

                              {/* Player 4 */}
                              <div className="text-center d-flex justify-content-center align-items-center flex-column mb-2 position-relative col-6">
                                <div
                                  className="rounded-circle border d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "68px",
                                    height: "68px",
                                    backgroundColor: "rgb(31, 65, 187)",
                                    overflow: "hidden",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "white",
                                      fontWeight: 600,
                                      fontSize: "24px",
                                    }}
                                  >
                                    H
                                  </span>
                                </div>

                                <p
                                  className="mb-0 mt-2"
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 500,
                                    fontFamily: "Poppins",
                                  }}
                                >
                                  H
                                </p>

                                {/* <span className="badge text-white" style={{ backgroundColor: "rgb(31, 65, 187)" }}>C2</span> */}
                              </div>
                            </div>
                          </div>
                          <div className="row mx-auto border-top pt-1">
                            <div className="col-6 ps-0">
                              <p className="mb-1 all-match-name-level">
                                {match?.clubId?.clubName || "Unknown Club"}
                              </p>
                              <p
                                className="mb-0 text-muted all-match-name-level"
                                style={{ fontSize: "10px", fontWeight: "400" }}
                              >
                                <FaMapMarkerAlt
                                  className="me-1"
                                  style={{ fontSize: "10px" }}
                                />
                                {match?.clubId?.city.charAt(0)?.toUpperCase() +
                                  match?.clubId?.city.slice(1) || "N/A"}{" "}
                                {match?.clubId?.zipCode || ""}
                              </p>
                            </div>
                            {/* <div className="col-6 pe-0 d-flex align-items-center justify-content-end">
                                                            <div
                                                                className=" all-matches"
                                                                style={{ fontWeight: "500", fontSize: "20px", fontFamily: "none", color: "#1F41BB" }}
                                                            >
                                                                ₹ <span className="all-matches" style={{ fontWeight: "500", fontSize: "25px", fontWeight: "600", fontFamily: "Poppins", color: "#1F41BB" }}>{calculateMatchPrice(match?.slot) || 0}</span>
                                                            </div>
                                                            <button
                                                                className="btn  rounded-pill d-flex justify-content-end align-items-center text-end view-match-btn text-dark p-0 border-0"
                                                                onClick={() => {
                                                                    setSelectedMatch(match);
                                                                    setShowViewMatch(true);
                                                                }}
                                                                aria-label={`View match on ${formatMatchDate(match.matchDate)}`}
                                                            >
                                                                View
                                                            </button>
                                                        </div> */}
                            <div
                              className="col-6 pe-0 d-flex align-items-center justify-content-end"
                              // style={{ width: "100%" }}
                            >
                              <div
                                className="d-flex align-items-center gap-1"
                                style={{
                                  fontWeight: 500,
                                  fontSize: "20px",
                                  fontFamily: "none",
                                  color: "#1F41BB",
                                }}
                              >
                                ₹
                                <span
                                  style={{
                                    fontSize: "25px",
                                    fontWeight: 600,
                                    fontFamily: "Poppins",
                                    color: "#1F41BB",
                                  }}
                                >
                                  {calculateMatchPrice(match?.slot) || 0}
                                </span>
                                <button
                                  className="btn rounded-pill d-flex justify-content-center align-items-center text-dark p-0 border-0"
                                  onClick={() => {
                                    setSelectedMatch(match);
                                    setShowViewMatch(true);
                                  }}
                                  aria-label={`View match on ${formatMatchDate(
                                    match.matchDate
                                  )}`}
                                >
                                  <IoIosArrowForward />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="d-flex flex-column justify-content-center align-items-center text-danger fw-medium"
                  style={{
                    minHeight: "210px",
                    fontSize: "18px",
                    fontFamily: "Poppins",
                  }}
                >
                  <p>No matches available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`col-12 col-lg-5 px-md-3 px-0 ${
            !showViewMatch ? "ps-md-4 pt-md-3 pt-4" : ""
          } order-1 order-md-2 ${showViewMatch ? "d-block" : ""}`}
        >
          {!showViewMatch ? (
            <div className="ms-0 ms-lg-2">
              <div
                className="row align-items-center text-white rounded-4 py-0 ps-md-4 ps-3 add_height_mobile_banner mx-auto d-flex d-md-none"
                style={{
                  backgroundImage: `linear-gradient(269.34deg, rgba(255, 255, 255, 0) 0.57%, rgba(17, 24, 39, 0.6) 94.62%), url(${player2})`,
                  position: "relative",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right center",
                  height: "312px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  marginTop: "-20px",
                }}
              >
                <div className="col-12 col-md-6 mb-1 text-start mb-md-0">
                  <h4 className="open-match-img-heading text-nowrap">
                    Got a score to <br /> settle?
                  </h4>
                  <p className="text-light font_small_size">
                    Great for competitive vibes.
                  </p>
                  <button
                    className="btn shadow border-0 create-match-btn mt-lg-2 text-white rounded-pill mb-md-3 mb-0 ps-3 pe-3 font_size_data"
                    onClick={createMatchesHandle}
                    style={{
                      background:
                        "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                      fontSize: "14px",
                      fontFamily: "Poppins",
                      fontWeight: "500",
                    }}
                    aria-label="Create open matches"
                  >
                    Create Open Matches
                  </button>
                </div>
              </div>
              <div
                className="row align-items-center text-white rounded-4 py-0 ps-md-4 ps-3 add_height_mobile_banner d-none d-md-block"
                style={{
                  backgroundImage: `linear-gradient(269.34deg, rgba(255, 255, 255, 0) 0.57%, rgba(17, 24, 39, 0.6) 94.62%), url(${player2})`,
                  position: "relative",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right center",
                  height: "312px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  marginTop: "-20px",
                }}
              >
                <div className="col-12 col-md-6 mb-1 text-start mb-md-0">
                  <h4 className="open-match-img-heading text-nowrap">
                    Got a score to <br /> settle?
                  </h4>
                  <p className="text-light font_small_size">
                    Great for competitive vibes.
                  </p>
                  <button
                    className="btn shadow border-0 create-match-btn mt-lg-2 text-white rounded-pill mb-md-3 mb-0 ps-3 pe-3 font_size_data"
                    onClick={createMatchesHandle}
                    style={{
                      background:
                        "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                      fontSize: "14px",
                      fontFamily: "Poppins",
                      fontWeight: "500",
                    }}
                    aria-label="Create open matches"
                  >
                    Create Open Matches
                  </button>
                </div>
              </div>
              <div
                className="px-4 py-4 row rounded-4 border mt-3 mb-5 h-100 d-none d-md-flex"
                style={{ backgroundColor: "#F6F7FB" }}
              >
                {reviewLoading ? (
                  <DataLoading />
                ) : (
                  <>
                    {/* Left: Overall Rating */}
                    <div className="col-12 border-end col-lg-4 pe-lg-3 text-center d-lg-flex align-items-center justify-content-center mb-4 mb-md-0">
                      <div className="w-100">
                        <p
                          className="mb-0"
                          style={{
                            fontSize: "16px",
                            fontWeight: "500",
                            color: "#111",
                            fontFamily: "Poppins",
                          }}
                        >
                          Overall Rating
                        </p>
                        <div className="d-flex flex-lg-column align-items-center justify-content-center">
                          <div
                            className="mb-2"
                            style={{
                              fontFamily: "Poppins",
                              fontWeight: "600",
                              fontSize: "40px",
                              color: "#111",
                            }}
                          >
                            {reviewData?.averageRating?.toFixed(1) || "0.0"}
                          </div>
                          <div className="mb-2 d-flex gap-lg-2">
                            {[...Array(5)].map((_, i) => {
                              const rating = reviewData?.averageRating || 0;
                              if (i < Math.floor(rating)) {
                                return (
                                  <StarIcon
                                    key={i}
                                    style={{
                                      color: "#32B768",
                                      fontSize: "25px",
                                    }}
                                  />
                                );
                              } else if (i < rating && rating % 1 >= 0.5) {
                                return (
                                  <StarHalfIcon
                                    key={i}
                                    style={{
                                      color: "#32B768",
                                      fontSize: "25px",
                                    }}
                                  />
                                );
                              } else {
                                return (
                                  <StarBorderIcon
                                    key={i}
                                    style={{ color: "#ccc", fontSize: "25px" }}
                                  />
                                );
                              }
                            })}
                          </div>
                          <div
                            className="text-muted ps-2 pb-2"
                            style={{
                              fontSize: "12px",
                              fontWeight: "400",
                              fontFamily: "Poppins",
                            }}
                          >
                            Based on {reviewData?.totalReviews || 0} reviews
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Rating Bars */}
                    <div className="col-12 col-lg-8 ps-lg-4 pe-0">
                      <div className="w-100">
                        {[5, 4, 3, 2, 1].map((star, idx) => {
                          const total = reviewData?.totalReviews || 1;
                          let count = 0;
                          if (star === 5)
                            count = reviewData?.ratingCounts?.Excellent || 0;
                          else if (star === 4)
                            count = reviewData?.ratingCounts?.Good || 0;
                          else if (star === 3)
                            count = reviewData?.ratingCounts?.Average || 0;
                          else if (star <= 2)
                            count = reviewData?.ratingCounts?.Below || 0;

                          const percent = Math.round((count / total) * 100);

                          return (
                            <div
                              key={star}
                              className="d-flex align-items-center mb-3 gap-3"
                              style={{ width: "100%" }}
                            >
                              {/* Fixed Width Label */}
                              <div
                                className="text-nowrap"
                                style={{
                                  width: "110px",
                                  minWidth: "110px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  fontFamily: "Poppins",
                                  color: "#111",
                                }}
                              >
                                {star === 5
                                  ? "Excellent"
                                  : star === 4
                                  ? "Good"
                                  : star === 3
                                  ? "Average"
                                  : star === 2
                                  ? "Below Average"
                                  : "Poor"}
                              </div>

                              {/* Progress Bar - Takes Remaining Space */}
                              <div
                                className="progress flex-grow-1 border"
                                style={{
                                  height: "10px",
                                  backgroundColor: "#eee",
                                  minWidth: 0,
                                }}
                              >
                                <div
                                  className="progress-bar"
                                  style={{
                                    width: `${percent}%`,
                                    backgroundColor:
                                      star === 5
                                        ? "#3DBE64"
                                        : star === 4
                                        ? "#7CBA3D"
                                        : star === 3
                                        ? "#ECD844"
                                        : star === 2
                                        ? "#FC702B"
                                        : "#E9341F",
                                    transition: "width 0.4s ease",
                                  }}
                                />
                              </div>

                              {/* Optional: Show Count */}
                              {/* <small className="text-muted ms-2" style={{ fontSize: "12px" }}>
                  {count}
                </small> */}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <ViewMatch
              match={selectedMatch}
              onBack={() => setShowViewMatch(false)}
            />
          )}
        </div>
      </div>
      <UpdatePlayers
        showModal={showModal}
        teamName={teamName}
        matchId={matchId}
        setShowModal={setShowModal}
        selectedDate={selectedDate}
        selectedLevel={selectedLevel}
        selectedTime={selectedTime}
      />
    </div>
  );
};

export default Openmatches;
