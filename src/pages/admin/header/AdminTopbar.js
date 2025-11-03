import { useEffect, useRef, useState } from "react";
import {
  FaSearch,
  FaTimes,
  FaBell,
  FaChevronDown,
  FaChevronUp,
  FaUserCircle,
  FaBars,
} from "react-icons/fa";
import { Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/admin/auth/slice";
import { NavLink, useNavigate } from "react-router-dom";
import { resetOwnerClub } from "../../../redux/admin/manualBooking/slice";
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { io } from "socket.io-client";
import config from "../../../config";
import { get } from "react-hook-form";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getNotificationCount, getNotificationData } from "../../../redux/admin/notifiction/thunk";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import updateLocale from "dayjs/plugin/updateLocale";
import { DataLoading } from "../../../helpers/loading/Loaders";


const SOCKET_URL = config.API_URL;
const socket = io(SOCKET_URL, { transports: ["websocket"] });

const AdminTopbar = ({ onToggleSidebar, sidebarOpen, onToggleCollapse, sidebarCollapsed }) => {
  const user = getOwnerFromSession();
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const handleClearSearch = () => setSearchValue("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState();
  const [openNoteId, setOpenNoteId] = useState(null);
  console.log({ notificationCount });
  const userId = getOwnerFromSession()?._id;
  const notificationData = useSelector((state) => state.notificationData?.getNotificationData);
  const notificationLoading = useSelector((state) => state.notificationData?.getCountLoading);

  const navigate = useNavigate();
  console.log({ notificationLoading });
  dayjs.extend(relativeTime);
  dayjs.extend(updateLocale);

  dayjs.updateLocale("en", {
    relativeTime: {
      future: "in %s",
      past: "%s ago",
      s: "a few seconds",
      m: "1 minute",
      mm: "%d minutes",
      h: "1 hour",
      hh: "%d hours",
      d: "1 day",
      dd: "%d days",
      M: "1 month",
      MM: "%d months",
      y: "1 year",
      yy: "%d years",
    },
  });
  useEffect(() => {

    dispatch(getNotificationData()).unwrap().then((res) => {
      if (res?.notifications) {
        setNotifications(res.notifications);
      }
    });

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      socket.emit("registerAdmin", userId);
    });

    socket.on("adminNotification", (data) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === data._id);
        if (exists) return prev;
        return [data, ...prev];
      });
    });

    socket.on("cancellationRequest", (data) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === data._id);
        if (exists) return prev;
        return [data, ...prev];
      });
    });

    socket.on("notificationCountUpdate", (data) => {
      setNotificationCount(data);
    });

    return () => socket.disconnect();
  }, [userId, open, dispatch]);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewNotification = (note) => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    dispatch(getNotificationCount({ noteId: note._id })).unwrap()
      .then(() => {
        navigate(note?.notificationUrl)
        socket.on("connect", () => {
          socket.emit("registerAdmin", userId);
        });
        socket.on("notificationCountUpdate", (data) => {
          console.log('notificationCountUpdate', data);
          setNotificationCount(data);
        });
      });
  };

  return (
    <header
      className={`admin-topbar d-flex justify-content-between align-items-center px-3 px-md-4 py-2 ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      style={{ backgroundColor: "#fff" }}
    >
      {/* Mobile Hamburger Menu */}
      <button
        className="btn btn-link d-lg-none p-0 border-0 text-dark"
        onClick={onToggleSidebar}
        style={{ fontSize: "1.2rem" }}
      >
        <FaBars />
      </button>

      {/* Desktop Collapse Toggle */}
      <button
        className="btn btn-link d-none d-lg-block p-0 border-0 text-dark"
        onClick={onToggleCollapse}
        style={{ fontSize: "1.2rem" }}
      >
        <FaBars />
      </button>
      {/* Search Bar */}
      {/* <div
        className="d-flex align-items-center px-3 py-2 "
        style={{
          width: "900px",

          borderRadius: "10px",
        }}
      >
        <FaSearch className="text-muted me-2" />
        <input
          type="text"
          value={searchValue}
          placeholder="Type to search..."
          className="form-control border-0 bg-transparent shadow-none"
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ fontSize: "14px", color: "#333" }}
        />
        {searchValue && (
          <FaTimes
            className="text-muted ms-2"
            style={{ cursor: "pointer" }}
            onClick={handleClearSearch}
          />
        )}
      </div> */}

      {/* User Dropdown + Bell Icon */}
      <div className="d-flex align-items-center gap-2 gap-md-4">
        <div className="position-relative" ref={dropdownRef}>
          {/* Bell Icon */}
          <div
            className="d-flex rounded-circle  align-items-center"
            style={{
              cursor: "pointer",
              backgroundColor: open ? "black" : "#CBD6FF54",
              padding: "8px",
              position: "relative",
            }}
            onClick={() => setOpen(!open)}
          >
            <Badge badgeContent={notificationCount?.unreadCount} color="error">
              <NotificationsIcon className={`${open ? 'text-white' : 'text-dark'}`} size={18} />
            </Badge>
          </div>

          {/* Dropdown */}
          {open && (
            <div
              className="shadow-sm p-2"
              style={{
                position: "absolute",
                top: "50px",
                right: 0,
                width: "320px",
                backgroundColor: "#fff",
                borderRadius: "12px",
                zIndex: 10,
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-0 pt-1 ps-1">
                <h6 style={{ fontWeight: 600, fontFamily: "Poppins" }}>Notifications</h6>
              </div>

              <div style={{ maxHeight: "300px", overflowY: "auto" }} className="hide-notification-scrollbar">
                {notificationLoading ? <DataLoading /> :
                  notifications?.length > 0 ? (
                    notifications?.map((note) => (
                      <div
                        key={note._id}
                        className="d-flex gap-2 align-items-start justify-content-between p-3 mb-2 rounded "
                        style={{
                          // backgroundColor: note.isRead ? "#fff" : "#f9f9ff",
                          borderBottom: "1px solid #f0f0f0",
                          cursor: "pointer",
                        }}
                      >
                        {/* Left: Profile Image or Initial */}
                        {note?.userId?.profilePic ? (
                          <img
                            src={note?.userId?.profilePic}
                            alt="user"
                            style={{
                              width: "35px",
                              height: "35px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "35px",
                              height: "35px",
                              borderRadius: "50%",
                              backgroundColor: "#e5e7eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "600",
                              color: "#111",
                            }}
                          >
                            {note?.userId?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Middle: Notification content */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: "13px" }}>
                            {note?.userId?.name?.trim() || "User"} – {note.title}
                          </div>
                          {note?.message && (
                            <p
                              className="text-muted mb-1"
                              style={{ fontSize: "12px", fontFamily: "Poppins" }}
                            >
                              {note.message}
                            </p>
                          )}
                          <p
                            className="text-muted text-nowrap mb-0"
                            style={{ fontSize: "12px", fontFamily: "Poppins" }}
                          >
                            {dayjs(note.createdAt).fromNow()} <b>.</b>{" "}
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-${note._id}`}>
                                  {note?.notificationType}
                                </Tooltip>
                              }
                            >
                              <span style={{ cursor: "pointer" }}>
                                {note?.notificationType?.length > 15
                                  ? note?.notificationType.slice(0, 15) + "..."
                                  : note?.notificationType}
                              </span>
                            </OverlayTrigger>
                          </p>


                          {/* Show when expanded */}
                          {openNoteId === note._id && (
                            <div className="d-flex gap-2 mt-2">
                              <button
                                className="btn btn-dark btn-sm py-0 px-3"
                                style={{ fontSize: "13px" }}
                                onClick={() => handleViewNotification(note)
                                }
                              >
                                View
                              </button>
                            </div>
                          )}
                        </div>
                        {console.log({ note })}
                        {/* Right: Toggle Icon */}
                        <div
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenNoteId(openNoteId === note._id ? null : note._id);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {openNoteId === note._id ? (
                            <IoIosArrowUp size={20} color="#555" />
                          ) : (
                            <IoIosArrowDown size={20} color="#555" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="text-center text-muted py-3"
                      style={{
                        fontWeight: 400,
                        fontFamily: "Poppins",
                      }}
                    >
                      No new notifications
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        <Dropdown align="end" onToggle={(isOpen) => setIsOpen(isOpen)}>
          <Dropdown.Toggle
            variant="white"
            className="d-flex align-items-center gap-2 text-dark text-decoration-none p-0 border-0 shadow-none"
          >
            <div className="text-end d-none d-md-block">
              <div className="fw-semibold">
                {user?.name || "Danielle Campbell"}
              </div>
              <div className="text-muted small">
                {user?.role
                  .slice(0, 1)
                  .toUpperCase()
                  .concat(user?.role.slice(1)) || "Owner"}
              </div>
            </div>
            {user?.profilePic ? (
              <img
                src={user?.profilePic}
                alt="user"
                className="rounded-circle bg-secondary"
                width="40"
                height="40"
                loading="lazy"
              />
            ) : (
              <div className="bg-secondary rounded-circle">
                <FaUserCircle size={40} />
              </div>
            )}
            {isOpen ? (
              <FaChevronUp className="ms-1 ms-md-2 text-muted d-none d-sm-inline" />
            ) : (
              <FaChevronDown className="ms-1 ms-md-2 text-muted d-none d-sm-inline" />
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="table-data fw-medium"
            style={{ color: "#374151", minWidth: "200px" }}
          >
            <Dropdown.Item as={NavLink} to="/admin/profile">
              Edit Profile
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/admin/my-club">
              My Club
            </Dropdown.Item>
            <Dropdown.Item
              as={NavLink}
              to="/admin/court-availability"
              onClick={() => dispatch(resetOwnerClub())}
            >
              Court Availability
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/admin/customer-reviews">
              Review & Rating
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/admin/help-support">
              Help & Support
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/admin/privacy">
              Privacy
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                dispatch(logout());
              }}
            >
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default AdminTopbar;
