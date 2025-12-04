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
import { useNavigate, useLocation } from "react-router-dom";
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
import { getPlayerLevelBySkillLevel } from "../../../redux/user/notifiction/thunk";
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
import { registerClub } from "../../../redux/thunks";
import { getUserProfile } from "../../../redux/user/auth/authThunk";
import { showError, showSuccess } from "../../../helpers/Toast";
import { copyMatchCardWithScreenshot } from "../../../utils/matchCopy";

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

  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "noon";
  if (hour >= 17 || hour < 6) return "night";
  return "morning";
};

const Openmatches = () => {
  const { state } = useLocation();

  const initialDate = state?.selectedDate || {
    fullDate: new Date().toISOString().split("T")[0],
    day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
  };

  const [startDate, setStartDate] = useState(() => {
    return state?.selectedDate ? new Date(state.selectedDate.fullDate) : new Date();
  });
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUnavailableOnly, setShowUnavailableOnly] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [activeTab, setActiveTab] = useState(0);
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
  const User = useSelector((state) => state?.userAuth);

  const reviewLoading = useSelector((state) => state.userClub?.reviewLoading);
  const [showModal, setShowModal] = useState(false);
  const [matchId, setMatchId] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [showViewMatch, setShowViewMatch] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showCreateButton, setShowCreateButton] = useState(() => {
    return localStorage.getItem('hideCreateButton') !== 'true';
  });
  const [playerLevels, setPlayerLevels] = useState([]);
  const [showShareDropdown, setShowShareDropdown] = useState(null);
  const shareDropdownRef = useRef(null);
  const matchCardRefs = useRef({});
  const updateName = JSON.parse(localStorage.getItem("updateprofile"));

  const debouncedFetchMatches = useCallback(
    debounce((payload) => {
      dispatch(getMatchesUser(payload));
    }, 300),
    [dispatch, user?.token]
  );

  useEffect(() => {
    if (user?.token) {
      dispatch(getUserProfile())
    }
  }, [user?.token])

  // Handle mobile state restoration only when coming back from ViewMatch
  useEffect(() => {
    if (window.innerWidth <= 768) {
      const shouldShowViewMatch = localStorage.getItem('mobileViewMatch') === 'true';
      const savedMatch = localStorage.getItem('mobileSelectedMatch');

      // Only restore ViewMatch state if user explicitly navigated to it
      if (shouldShowViewMatch && savedMatch && window.location.hash === '#viewmatch') {
        setShowViewMatch(true);
        setSelectedMatch(JSON.parse(savedMatch));
      } else {
        // Clear any stale mobile state on fresh page load
        localStorage.removeItem('mobileViewMatch');
        localStorage.removeItem('mobileSelectedMatch');
      }
    }
  }, [])

  useEffect(() => {
    if (matchId?.skillLevel) {
      dispatch(getPlayerLevelBySkillLevel(matchId?.skillLevel))
        .unwrap()
        .then((res) => {
          const levels = (res?.data[0]?.levelIds || []).map((l) => ({
            code: l.code,
            title: l.question,
          }));
          setPlayerLevels(levels);
        })
        .catch(() => setPlayerLevels([]));
    }
  }, [matchId?.skillLevel, dispatch]);

  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setIsOpen(false);
    }

    if (shareDropdownRef.current && !shareDropdownRef.current.contains(e.target)) {
      setShowShareDropdown(null);
    }

    // Close modals on outside click (except payment modals)
    if (showModal && !e.target.closest('.modal-content') && !e.target.closest('[data-bs-toggle="modal"]')) {
      setShowModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal, showShareDropdown]);

  useEffect(() => {
    const savedClubId = localStorage.getItem("register_club_id");
    if (savedClubId) {
      dispatch(getReviewClub(savedClubId));
    }
  }, [dispatch]);

  useEffect(() => {
    if (selectedDate?.fullDate && dateRefs.current[selectedDate?.fullDate]) {
      dateRefs.current[selectedDate?.fullDate].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedDate?.fullDate]);
  useEffect(() => {
    const payload = {
      matchDate: selectedDate?.fullDate,
      ...(selectedTime && { matchTime: normalizeTime(selectedTime) }),
      ...(selectedLevel && selectedLevel !== "All" && { skillLevel: selectedLevel }),
      clubId: localStorage.getItem("register_club_id")
    };
    debouncedFetchMatches(payload);
  }, [selectedTime, selectedLevel, debouncedFetchMatches]);

  useEffect(() => {
    if (matchesData?.data && matchesData.data.length > 0) {
      const matchDates = matchesData.data.map(match => match.matchDate);
      const latestDateStr = matchDates.sort().reverse()[0];
      const latestDate = {
        fullDate: latestDateStr,
        day: new Date(latestDateStr).toLocaleDateString("en-US", { weekday: "long" }),
      };

      if (selectedDate.fullDate !== latestDate.fullDate) {
        setSelectedDate(latestDate);
        setStartDate(new Date(latestDate.fullDate));

        setTimeout(() => {
          if (dateRefs.current[latestDate.fullDate]) {
            dateRefs.current[latestDate.fullDate].scrollIntoView({
              behavior: "smooth",
              inline: "center",
              block: "nearest",
            });
          }
        }, 100);
      }
    }
  }, [matchesData?.data]);

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

  const filteredMatches = useMemo(() => {
    let matches = matchesData?.data || [];
    console.log('Raw matches data:', matches);
    console.log('Active tab:', activeTab);

    if (showUnavailableOnly) {
      matches = matches.filter((match) => match?.players?.length >= 4);
    }

    const tabLabels = ["morning", "noon", "night"];
    const currentTab = tabLabels[activeTab];
    console.log('Current tab:', currentTab);

    const filtered = getMatchesForTab(currentTab, matches);
    console.log('Filtered matches:', filtered);
    return filtered;
  }, [showUnavailableOnly, matchesData, activeTab]);

  useEffect(() => {
    if (
      !matchLoading &&
      filteredMatches.length === 0 &&
      matchesData?.data?.length > 0
    ) {
      const tabLabels = ["morning", "noon", "night"];
      for (let i = 0; i < tabLabels.length; i++) {
        const matchesForTab = getMatchesForTab(
          tabLabels[i],
          matchesData?.data || []
        );
        if (matchesForTab.length > 0) {
          setActiveTab(i);
          break;
        }
      }
    }
  }, [filteredMatches, matchesData, activeTab, matchLoading]);

  // Set default tab based on available data
  useEffect(() => {
    if (!matchLoading && matchesData?.data?.length > 0) {
      const tabLabels = ["morning", "noon", "night"];

      // Find first tab with data
      let defaultTabIndex = 0; // Default to morning
      for (let i = 0; i < tabLabels.length; i++) {
        const hasData = getMatchesForTab(tabLabels[i], matchesData.data).length > 0;
        if (hasData) {
          defaultTabIndex = i;
          break;
        }
      }

      setActiveTab(defaultTabIndex);
    }
  }, [matchesData?.data, matchLoading, selectedDate.fullDate]);

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
      navigate("/create-matches", { state: { selectedDate, filteredMatches } });
    } else {
      navigate("/login", {
        state: {
          redirectTo: "/create-matches",
          selectedDate, filteredMatches
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
    const times = slots
      .map((slot) => {
        const time = slot?.slotTimes?.[0]?.time;
        if (!time) return null;

        let hour, period;
        if (/am|pm/i.test(time)) {
          const match = time.match(/(\d+)\s*(am|pm)/i);
          if (match) {
            hour = parseInt(match[1], 10);
            period = match[2].toUpperCase();
          } else {
            return null;
          }
        } else {
          const [hours, minutes] = time.split(":");
          const hourNum = parseInt(hours, 10);
          period = hourNum >= 12 ? "PM" : "AM";
          hour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
        }

        return { hour, period };
      })
      .filter(Boolean);

    if (times.length === 0) return "N/A";
    if (times.length === 1) return `${times[0].hour}${times[0].period}`;

    return `${times[0].hour}-${times[times.length - 1].hour}${times[times.length - 1].period}`;
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
          width: "33px",
          height: "33px",
          border: "1px solid #1F41BB",
          color: "#1F41BB",
          fontSize: "24px",
          fontWeight: "400",
          marginRight: "10px",
          cursor: "pointer",
        }}
        onClick={() => {
          setShowModal(true);
          setMatchId(match);
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
          width: "33px",
          height: "33px",
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
        {/* <p
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
        </p> */}
      </div>
    </TagWrapper>
  );

  const PlayerAvatar = ({ player, idx, total }) => (
    <div
      className="rounded-circle border d-flex align-items-center justify-content-center position-relative"
      style={{
        width: "33px",
        height: "33px",
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
    <div className="container mt-lg-4 px-3 px-md-0 mb-md-4 mb-0 add_margin_top_minus">
      <div className="row g-md-4 mx-auto">
        <div
          className={`col-lg-7 col-12 py-md-4 py-2 rounded-3 px-md-4 px-0 order-2 order-md-1 bg-white-color ${showViewMatch ? "d-none d-md-block " : "pt-0"
            }`}
          style={{ backgroundColor: "#F5F5F566", height: "auto" }}
        >
          <div className="calendar-strip mb-3">
            <div className="mb-md-3 mb-0 mt-1 mt-md-0 custom-heading-use d-flex justify-content-between align-items-center">
              <div>
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
              <button
                className="btn shadow border-0 text-white rounded-pill "
                onClick={createMatchesHandle}
                style={{
                  background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                  fontSize: "12px",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                  padding: "6px 12px",
                  whiteSpace: "nowrap"
                }}
                aria-label="Create open matches"
              >
                Create Open Matches
              </button>
            </div>

            <div className="d-flex align-items-center mb-md-3 mb-2 gap-2 border-bottom">
              <div className="position-relative mt-md-0 mt-2">

              </div>

              <div
                className="d-flex calendar-day-btn-mobile justify-content-center align-items-center rounded-1 mb-md-3 mb-2 mt-2 mt-md-0"
                style={{
                  backgroundColor: "#f3f3f5",
                  height: "58px",
                  padding: "2px 10px",
                  width: "20px",
                }}
              >
                <span
                  className="add_font_small_span"
                  style={{
                    fontSize: "12px",
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

              <div
                className="d-flex gap-1 align-items-center"
                style={{ position: "relative" }}
              >
                <button
                  className="btn p-2 border-0 d-none d-md-block"
                  style={{
                    position: "absolute",
                    left: "-9%",
                    top: "0px",
                    zIndex: 10,
                    boxShadow: "none",
                  }}
                  onClick={scrollLeft}
                >
                  <MdOutlineArrowBackIosNew className="mt-2" size={20} />
                </button>

                <div
                  ref={scrollRef}
                  className="d-flex gap-1 date-scroll-container pt-md-0 pt-2"
                  style={{
                    scrollBehavior: "smooth",
                    whiteSpace: "nowrap",
                    maxWidth: "98%",
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
                        className={`calendar-day-btn mb-md-3 mb-2 me-1 position-relative ${isSelected ? "text-white border-0" : "bg-white"
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
                          dispatch(
                            getMatchesUser({
                              matchDate: d.fullDate,
                              clubId: localStorage.getItem("register_club_id") || "",
                            })
                          );

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

                <button
                  className="btn border-0 p-2 d-none d-md-block"
                  style={{
                    position: "absolute",
                    right: -18,
                    top: '0px',
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
                        className={`tab-item rounded-3 ${activeTab === index ? "active" : ""
                          }`}
                        onClick={() => setActiveTab(index)}
                      >
                        <Icon
                          size={20}
                          className={
                            activeTab === index ? "text-primary" : "text-dark"
                          }
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="tab-labels d-flex justify-content-between">
                  {tabs.map((tab, index) => (
                    <p
                      key={index}
                      className={`tab-label ${activeTab === index
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

          <div className="pb-0">
            <div className="d-flex flex-md-row justify-content-between align-items-center gap-3 mb-md-2 mb-2">
              <h5 className="mb-0 custom-heading-use">Available Matches</h5>
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
                  {["All", "beginner", "intermediate", "advanced", "professional"].map(
                    (level) => (
                      <li key={level}>
                        <button
                          className="dropdown-item mb-1"
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
                minHeight: window.innerWidth <= 768 ? (filteredMatches.length <= 2 ? "auto" : "500px") : "400px",
                height: window.innerWidth <= 768 ? (filteredMatches.length <= 2 ? "auto" : "500px") : "400px",
                maxHeight: window.innerWidth <= 768 ? (filteredMatches.length > 2 ? "500px" : "auto") : (filteredMatches.length > 4 ? "380px" : "auto"),
                overflowY: window.innerWidth <= 768 ? (filteredMatches.length > 2 ? "auto" : "visible") : (filteredMatches.length > 4 ? "auto" : "auto"),
                scrollBehavior: "smooth",
                paddingBottom: window.innerWidth <= 768 ? "400px" : "0px",
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
                            ref={(el) => (matchCardRefs.current[`desktop-${index}`] = el)}
                            className="card  mb-2 py-3 p-0 shadow-0 rounded-2 d-md-block d-none"
                            style={{
                              backgroundColor: "#CBD6FF1A",
                              border: "0.45px solid #0000001A",
                              boxShadow: "none",
                              height: "10rem",
                              cursor: "pointer"
                            }}
                            onClick={() => {
                              setSelectedMatch(match);
                              setShowViewMatch(true);
                              if (window.innerWidth <= 768) {
                                localStorage.setItem('mobileViewMatch', 'true');
                                localStorage.setItem('mobileSelectedMatch', JSON.stringify(match));
                                window.location.hash = 'viewmatch';
                              }
                            }}
                          >
                            <div className="position-absolute top-0 end-0 p-2 pb-2 pt-0  d-flex gap-1 position-relative" ref={showShareDropdown === `desktop-${index}` ? shareDropdownRef : null}>
                              <button className="btn rounded-circle p-1 mb-2 d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, backgroundColor: "transparent", border: "none" }} onClick={async (e) => { e.stopPropagation(); const matchCardElement = matchCardRefs.current[`desktop-${index}`]; if (matchCardElement) { await copyMatchCardWithScreenshot(matchCardElement, match); } else { const matchData = `Match: ${formatMatchDate(match.matchDate)} | ${formatTimes(match.slot)}\nClub: ${match?.clubId?.clubName}\nLevel: ${match?.skillLevel}\nPrice: ₹${calculateMatchPrice(match?.slot)}`; if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(matchData).then(() => showSuccess("Match details copied to clipboard!")).catch(() => showError("Could not copy to clipboard")); } else { showError("Clipboard not supported on this device"); } } }}>
                                <i className="bi bi-copy" style={{ fontSize: "12px", color: "#1F41BB" }} />
                              </button>
                              {showShareDropdown === `desktop-${index}` && (
                                <div className="position-absolute bg-white border rounded shadow-sm" style={{ top: "30px", right: 0, zIndex: 1000, minWidth: "120px" }}>
                                  <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, "_blank"); setShowShareDropdown(null); }}>
                                    <i className="bi bi-facebook" style={{ color: "#1877F2" }} />Facebook
                                  </button>
                                  <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank"); setShowShareDropdown(null); }}>
                                    <i className="bi bi-twitter-x" style={{ color: "#000000" }} />X
                                  </button>
                                  <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; if (navigator.share) { navigator.share({ url, text }); } setShowShareDropdown(null); }}>
                                    <i className="bi bi-instagram" style={{ color: "#E4405F" }} />Instagram
                                  </button>
                                  <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, "_blank"); setShowShareDropdown(null); }}>
                                    <i className="bi bi-whatsapp" style={{ color: "#25D366" }} />WhatsApp
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="row px-2 mx-auto px-md-0 py-2 d-flex justify-content-between align-items- flex-wrap">
                              <div className="col-lg-7 pb-0 col-6">
                                <p
                                  className="mb-0 all-match-time text-nowrap"
                                  style={{ fontWeight: "600" }}
                                >
                                  {formatMatchDate(match.matchDate)} |{" "}
                                  {formatTimes(match.slot)}
                                  <i className="bi bi-share ms-2" onClick={(e) => { e.stopPropagation(); setShowShareDropdown(showShareDropdown === `desktop-${index}` ? null : `desktop-${index}`); }} style={{ fontSize: "12px", color: "#1F41BB", cursor: "pointer" }} />
                                </p>
                                <span className="text-muted all-match-name-level ms-0 d-none d-md-inline">
                                  {match?.skillLevel
                                    ? match.skillLevel.charAt(0).toUpperCase() +
                                    match.skillLevel.slice(1)
                                    : "N/A"} | {match?.gender}
                                </span>
                                <p className="all-match-time   mb-0 d-md-none d-lg-none">
                                  {match?.skillLevel
                                    ? match.skillLevel.charAt(0).toUpperCase() +
                                    match.skillLevel.slice(1)
                                    : "N/A"} | {match?.gender}
                                </p>

                                <div
                                  className="d-flex align-items-start mt-lg-4 pb-0 flex-column justify-content-start"
                                  style={{ width: "100%", maxWidth: "100%" }}
                                >
                                  <p
                                    className="mb-1 all-match-name-level mt-2"
                                    style={{
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      maxWidth: "100%"
                                    }}
                                  >
                                    {match?.clubId?.clubName || "Unknown Club"}
                                  </p>
                                  <p
                                    className="mb-3 text-muted all-match-name-level"
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: "400",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      maxWidth: "100%"
                                    }}
                                  >
                                    <FaMapMarkerAlt
                                      className="me-1"
                                      style={{ fontSize: "10px" }}
                                    />
                                    {match?.clubId?.city
                                      ?.charAt(0)
                                      ?.toUpperCase() +
                                      match?.clubId?.city?.slice(1) || "N/A"}{" "}
                                    {match?.clubId?.zipCode || ""}
                                  </p>
                                </div>
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
                                    className="d-flex align-items-center mt-lg-4 justify-content-end"
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
                                        {Number(calculateMatchPrice(match?.slot) || 0).toLocaleString('en-IN')}
                                      </span>
                                      <button
                                        className="btn rounded-pill d-flex justify-content-center align-items-center text-dark p-0 border-0"
                                        onClick={() => {
                                          setSelectedMatch(match);
                                          setShowViewMatch(true);
                                          if (window.innerWidth <= 768) {
                                            localStorage.setItem('mobileViewMatch', 'true');
                                            localStorage.setItem('mobileSelectedMatch', JSON.stringify(match));
                                            window.location.hash = 'viewmatch';
                                          }
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
                        ref={(el) => (matchCardRefs.current[`mobile-${index}`] = el)}
                        className="card  mb-2 py-2 p-0 shadow-0 rounded-3 d-block d-md-none"
                        style={{
                          backgroundColor: "#CBD6FF1A",
                          border: "0.45px solid #0000001A",
                          boxShadow: "none",
                        }}
                        onClick={() => {
                          setSelectedMatch(match);
                          setShowViewMatch(true);
                          if (window.innerWidth <= 768) {
                            localStorage.setItem('mobileViewMatch', 'true');
                            localStorage.setItem('mobileSelectedMatch', JSON.stringify(match));
                            window.location.hash = 'viewmatch';
                          }
                        }}
                      >
                        <div className="position-absolute top-0 end-0 p-2 d-flex gap-1 position-relative" ref={showShareDropdown === `mobile-${index}` ? shareDropdownRef : null}>
                          <button className="btn rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, backgroundColor: "transparent", border: "none" }} onClick={(e) => { e.stopPropagation(); setShowShareDropdown(showShareDropdown === `mobile-${index}` ? null : `mobile-${index}`); }}>
                            <i className="bi bi-share" style={{ fontSize: "12px", color: "#1F41BB" }} />
                          </button>

                          <button className="btn rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, backgroundColor: "transparent", border: "none" }} onClick={async (e) => { e.stopPropagation(); const matchCardElement = matchCardRefs.current[`mobile-${index}`]; if (matchCardElement) { await copyMatchCardWithScreenshot(matchCardElement, match); } else { const matchData = `Match: ${formatMatchDate(match.matchDate)} | ${formatTimes(match.slot)}\nClub: ${match?.clubId?.clubName}\nLevel: ${match?.skillLevel}\nPrice: ₹${calculateMatchPrice(match?.slot)}`; if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(matchData).then(() => showSuccess("Match details copied to clipboard!")).catch(() => showError("Could not copy to clipboard")); } else { showError("Clipboard not supported on this device"); } } }}>
                            <i className="bi bi-copy" style={{ fontSize: "12px", color: "#1F41BB" }} />
                          </button>
                          {showShareDropdown === `mobile-${index}` && (
                            <div className="position-absolute bg-white border rounded shadow-sm" style={{ top: "30px", right: 0, zIndex: 1000, minWidth: "120px" }}>
                              <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, "_blank"); setShowShareDropdown(null); }}>
                                <i className="bi bi-facebook" style={{ color: "#1877F2" }} />Facebook
                              </button>
                              <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank"); setShowShareDropdown(null); }}>
                                <i className="bi bi-twitter-x" style={{ color: "#000000" }} />X
                              </button>
                              <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; if (navigator.share) { navigator.share({ url, text }); } setShowShareDropdown(null); }}>
                                <i className="bi bi-instagram" style={{ color: "#E4405F" }} />Instagram
                              </button>
                              <button className="btn btn-light w-100 d-flex align-items-center gap-2 border-0 rounded-0" onClick={(e) => { e.stopPropagation(); const url = window.location.href; const text = `Check out this Padel match on ${formatMatchDate(match.matchDate)} at ${formatTimes(match.slot)}`; window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, "_blank"); setShowShareDropdown(null); }}>
                                <i className="bi bi-whatsapp" style={{ color: "#25D366" }} />WhatsApp
                              </button>
                            </div>
                          )}

                        </div>
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
                            <div className="col-6 px-0 d-flex justify-content-between align-items-center flex-wrap">
                              {[0, 1].map((playerIndex) => {
                                const player = match?.teamA?.[playerIndex];
                                const isAvailable = !player;
                                return (
                                  <div
                                    key={`teamA-${playerIndex}`}
                                    className="text-center d-flex justify-content-center align-items-center flex-column mb-2 position-relative col-6"
                                  >
                                    <div
                                      className="rounded-circle border d-flex align-items-center justify-content-center"
                                      style={{
                                        width: "68px",
                                        height: "68px",
                                        backgroundColor: isAvailable
                                          ? "#f0f0f0"
                                          : "rgb(31, 65, 187)",
                                        overflow: "hidden",
                                        cursor: isAvailable
                                          ? "pointer"
                                          : "default",
                                      }}
                                      onClick={() => {
                                        if (isAvailable) {
                                          setShowModal(true);
                                          setMatchId(match);
                                          setTeamName("teamA");
                                        }
                                      }}
                                    >
                                      {isAvailable ? (
                                        <span
                                          style={{
                                            color: "#1F41BB",
                                            fontWeight: 600,
                                            fontSize: "24px",
                                          }}
                                        >
                                          +
                                        </span>
                                      ) : player?.userId?.profilePic ? (
                                        <img
                                          src={player.userId.profilePic}
                                          alt={player.userId.name}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                          }}
                                        />
                                      ) : (
                                        <span
                                          style={{
                                            color: "white",
                                            fontWeight: 600,
                                            fontSize: "24px",
                                          }}
                                        >
                                          {player?.userId?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "A"}
                                        </span>
                                      )}
                                    </div>
                                    <span
                                      className="mb-0 mt-2"
                                      style={{
                                        maxWidth: "60px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        display: "inline-block",
                                        fontSize: "10px",
                                        fontWeight: 500,
                                        fontFamily: "Poppins",
                                        color: isAvailable ? "#1F41BB" : "#000",
                                      }}
                                    >
                                      {isAvailable
                                        ? "Available"
                                        : player?.userId?.name || "Player"}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="col-6 px-0 d-flex justify-content-between align-items-center flex-wrap border-start border-0 border-lg-start">
                              {[0, 1].map((playerIndex) => {
                                const player = match?.teamB?.[playerIndex];
                                const isAvailable = !player;
                                return (
                                  <div
                                    key={`teamB-${playerIndex}`}
                                    className="text-center d-flex justify-content-center align-items-center flex-column mb-2 position-relative col-6"
                                  >
                                    <div
                                      className="rounded-circle border d-flex align-items-center justify-content-center"
                                      style={{
                                        width: "68px",
                                        height: "68px",
                                        backgroundColor: isAvailable
                                          ? "#f0f0f0"
                                          : "rgb(31, 65, 187)",
                                        overflow: "hidden",
                                        cursor: isAvailable
                                          ? "pointer"
                                          : "default",
                                      }}
                                      onClick={() => {
                                        if (isAvailable) {
                                          setShowModal(true);
                                          setMatchId(match);
                                          setTeamName("teamB");
                                        }
                                      }}
                                    >
                                      {isAvailable ? (
                                        <span
                                          style={{
                                            color: "#1F41BB",
                                            fontWeight: 600,
                                            fontSize: "24px",
                                          }}
                                        >
                                          +
                                        </span>
                                      ) : player?.userId?.profilePic ? (
                                        <img
                                          src={player.userId.profilePic}
                                          alt={player.userId.name}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                          }}
                                        />
                                      ) : (
                                        <span
                                          style={{
                                            color: "white",
                                            fontWeight: 600,
                                            fontSize: "24px",
                                          }}
                                        >
                                          {player?.userId?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "B"}
                                        </span>
                                      )}
                                    </div>
                                    <span
                                      className="mb-0 mt-2"
                                      style={{
                                        maxWidth: "60px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        display: "inline-block",
                                        fontSize: "10px",
                                        fontWeight: 500,
                                        fontFamily: "Poppins",
                                        color: isAvailable ? "#1F41BB" : "#000",
                                      }}
                                    >
                                      {isAvailable
                                        ? "Available"
                                        : player?.userId?.name || "Player"}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="row mx-auto  border-top pt-1">
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
                                    if (window.innerWidth <= 768) {
                                      localStorage.setItem('mobileViewMatch', 'true');
                                      localStorage.setItem('mobileSelectedMatch', JSON.stringify(match));
                                      window.location.hash = 'viewmatch';
                                    }
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
                  className="d-flex flex-column justify-content-center align-items-center text-muted fw-medium text-center"
                  style={{
                    minHeight: "210px",
                    fontSize: "16px",
                    fontFamily: "Poppins",
                  }}
                >
                  <p className="mb-2">No matches available for this date</p>
                  <p className="mb-0" style={{ fontSize: "14px" }}>Try searching for a different date or location</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {showCreateButton && (
          <div
            className={`col-12 col-lg-5 ps-md-3 pe-md-0 px-0 ${!showViewMatch ? "ps-md-4 pt-md-1 pt-1" : ""
              } order-1 order-md-2 ${showViewMatch ? "d-block" : ""}`}
          >
            {!showViewMatch ? (
              <div className="ms-0 ms-lg-2 mt-md-3 mt-2">
                {showCreateButton && (
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
                      marginTop: "-10px",
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
                        className="btn shadow border-0 create-match-btn mt-lg-2 rounded-pill mb-md-3 mb-0 ps-3 pe-3 font_size_data"
                        onClick={() => {
                          localStorage.setItem('hideCreateButton', 'true');
                          setShowCreateButton(false);
                          createMatchesHandle();
                        }}
                        style={{
                          background: "#fff",
                          fontSize: "14px",
                          fontFamily: "Poppins",
                          fontWeight: "500",
                          color: "#0034E4"
                        }}
                        aria-label="Create open matches"
                      >
                        Create Open Matches
                      </button>

                    </div>
                  </div>
                )}
                <div
                  className="row align-items-center text-white rounded-4 py-0 ps-md-4 ps-3 add_height_mobile_banner d-none d-md-flex"
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
                      className="btn shadow border-0 create-match-btn mt-lg-3 text-white rounded-pill mb-md-2 mb-0 py-3 ps-3 pe-3 font_size_data"
                      onClick={createMatchesHandle}
                      style={{
                        background:
                          "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                        fontSize: "15px",
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
                      <div className="col-12 border-end col-lg-4 pe-lg-3 text-center d-lg-flex align-items-center justify-content-center mb-4 mb-md-0 ps-0">
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
                            <div className="mb-2 d-flex gap-lg-0">
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
                              className="text-muted ps-0 pb-2"
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
                onBack={() => {
                  setShowViewMatch(false);
                  if (window.innerWidth <= 768) {
                    localStorage.removeItem('mobileViewMatch');
                    localStorage.removeItem('mobileSelectedMatch');
                    window.location.hash = '';
                  }
                }}
                updateName={updateName}
                selectedDate={selectedDate}
              />
            )}
          </div>
        )}
      </div>
      <UpdatePlayers
        showModal={showModal}
        teamName={teamName}
        matchId={matchId}
        setShowModal={setShowModal}
        selectedDate={selectedDate}
        selectedLevel={selectedLevel}
        selectedTime={selectedTime}
        skillLevel={matchId?.skillLevel}
        playerLevels={playerLevels}
        setPlayerLevels={setPlayerLevels}
      />
    </div>
  );
};

export default Openmatches;
