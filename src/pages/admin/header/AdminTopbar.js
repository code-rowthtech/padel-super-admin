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
import { getNotificationCount, getNotificationData, getNotificationView, readAllNotification } from "../../../redux/admin/notifiction/thunk";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import updateLocale from "dayjs/plugin/updateLocale";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";


const SOCKET_URL = config.API_URL;

const AdminTopbar = ({ onToggleSidebar, sidebarOpen, onToggleCollapse, sidebarCollapsed, pageName }) => {
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
  const userId = getOwnerFromSession()?._id;
  const notificationData = useSelector((state) => state.notificationData?.getNotificationData);
  const notificationLoading = useSelector((state) => state.notificationData?.getCountLoading);

  const navigate = useNavigate();
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
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Socket Connection Error:', error);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket Disconnected:', reason);
    });

    dispatch(getNotificationData()).unwrap().then((res) => {
      if (res?.notifications) {
        setNotifications(res.notifications);
      }
    }).catch((error) => {
      console.error('❌ getNotificationData API Error:', error);
    });

    dispatch(getNotificationCount()).unwrap().then((res) => {
      if (res?.unreadCount) {
        setNotificationCount(res);
      }
    }).catch((error) => {
      console.error('❌ getNotificationCount API Error:', error);
    });

    socket.on("connect", () => {
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
      // Update notification count when cancellation request is received
      dispatch(getNotificationCount()).unwrap().then((res) => {
        if (res?.unreadCount) {
          setNotificationCount(res);
        }
      });
    });

    socket.on("notificationCountUpdate", (data) => {
      setNotificationCount(data);
    });

    return () => socket.disconnect();
  }, [userId, open, dispatch, SOCKET_URL]);


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

    dispatch(getNotificationView({ noteId: note._id })).unwrap()
      .then(() => {
        navigate(note?.notificationUrl)
        socket.on("notificationCountUpdate", (data) => {
          setNotificationCount(data);
        });
        dispatch(getNotificationData()).unwrap().then((res) => {
          if (res?.notifications) {
            setNotifications(res.notifications);
          }
        });
        setOpen(false)
      });
  };

  const handleMarkAllRead = () => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    dispatch(readAllNotification()).unwrap()
      .then(() => {
        socket.on("notificationCountUpdate", (data) => {
          setNotificationCount(data);
        });
        dispatch(getNotificationData()).unwrap().then((res) => {
          if (res?.notifications) {
            setNotifications(res.notifications);
          }
        });
      });
  };

  return (
    <header
      className={`admin-topbar d-flex justify-content-between align-items-center px-3 px-md-4 py-2 ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      style={{ backgroundColor: "#fff" }}
    >
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-link d-lg-none p-0 border-0 text-dark"
          onClick={onToggleSidebar}
          style={{ fontSize: "1.2rem" }}
        >
          <FaBars />
        </button>

        <button
          className="btn btn-link d-none d-lg-block p-0 border-0 text-dark"
          onClick={onToggleCollapse}
          style={{ fontSize: "1.2rem" }}
        >
          <FaBars />
        </button>

        {pageName && (
          <h5 className="mb-0" style={{ fontFamily: "Poppins", fontWeight: "600", color: "#374151" }}>
            {pageName}
          </h5>
        )}
      </div>
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

      <div className="d-flex align-items-center gap-2 gap-md-4">
        <div className="position-relative" ref={dropdownRef}>
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
            <Badge
              badgeContent={
                notificationCount?.unreadCount > 99
                  ? '99+'
                  : notificationCount?.unreadCount
              }
              color="error"
            >
              <NotificationsIcon
                className={`${open ? 'text-white' : 'text-dark'}`}
                size={18}
              />
            </Badge>
          </div>

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
                {notifications.length > 3 && (
                  <button
                    className="btn btn-link p-0"
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      textDecoration: "none",
                      color: "#007bff",
                    }}
                    onClick={handleMarkAllRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: "300px", overflowY: "auto" }} className="hide-notification-scrollbar">
                {notificationLoading ? <ButtonLoading /> :
                  notifications?.length > 0 ? (
                    notifications?.map((note) => (
                      <div
                        key={note._id}
                        className="d-flex gap-2 align-items-start justify-content-between p-3 mb-2 rounded "
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          cursor: "pointer",
                        }}
                        onClick={() => handleViewNotification(note)}
                      >
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
                                {note?.notificationType?.length > 12
                                  ? note?.notificationType.slice(0, 12) + "..."
                                  : note?.notificationType}
                              </span>
                            </OverlayTrigger>
                          </p>
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
