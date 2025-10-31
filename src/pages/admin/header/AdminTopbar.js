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
import { Dropdown } from "react-bootstrap";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/admin/auth/slice";
import { NavLink } from "react-router-dom";
import { resetOwnerClub } from "../../../redux/admin/manualBooking/slice";
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';

const AdminTopbar = ({ onToggleSidebar, sidebarOpen, onToggleCollapse, sidebarCollapsed }) => {
  const user = getOwnerFromSession();
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const handleClearSearch = () => setSearchValue("");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: "Your booking has been confirmed!" },
    { id: 2, text: "New message from club admin." },
    { id: 3, text: "Your refund has been processed." },
  ];
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
              backgroundColor: "#CBD6FF54",
              padding: "8px",
              position: "relative",
            }}
            onClick={() => setOpen(!open)}
          >
            <Badge badgeContent={17} color="error">
              <NotificationsIcon className="text-muted" size={18} />
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
                width: "250px",
                backgroundColor: "#fff",
                borderRadius: "10px",
                zIndex: 10,
              }}
            >
              <h6 className="text-muted mb-2">Notifications</h6>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {notifications.length > 0 ? (
                  notifications.map((note) => (
                    <div
                      key={note.id}
                      className="p-2 mb-1 rounded"
                      style={{
                        backgroundColor: "#f7f8ff",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      {note.text}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-3">
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
