import { useState } from "react";
import {
  FaSearch,
  FaTimes,
  FaBell,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/admin/auth/authSlice";
import { NavLink } from "react-router-dom";

const AdminTopbar = () => {
  const user = getOwnerFromSession();
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const handleClearSearch = () => setSearchValue("");

  return (
    <header
      className="d-flex justify-content-between align-items-center px-4 py-2"
      style={{ backgroundColor: "#fff" }}
    >
      {/* Search Bar */}
      <div
        className="d-flex align-items-center px-3 py-2"
        style={{
          width: "400px",
          backgroundColor: "#f8f9fa",
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
      </div>

      {/* User Dropdown + Bell Icon */}
      <div className="d-flex align-items-center gap-4">
        <FaBell className="text-muted" size={18} />

        <Dropdown align="end" onToggle={(isOpen) => setIsOpen(isOpen)}>
          <Dropdown.Toggle
            variant="white"
            className="d-flex align-items-center gap-2 text-dark text-decoration-none p-0 border-0 shadow-none"
          >
            <div className="text-end d-none d-sm-block">
              <div className="fw-semibold">
                {user?.name || "Danielle Campbell"}
              </div>
              <div className="text-muted small">Owner</div>
            </div>
            <img
              src={user?.profilePic}
              alt="user"
              className="rounded-circle"
              width="40"
              height="40"
            />
            {isOpen ? (
              <FaChevronUp className="ms-2 text-muted" />
            ) : (
              <FaChevronDown className="ms-2 text-muted" />
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="table-data fw-medium"
            style={{ color: "#374151" }}
          >
            <Dropdown.Item as={NavLink} to="/admin/profile">
              Edit Profile
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/admin/my-club">
              My Club
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/admin/customer-reviews">
              Review & Rating
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/admin/help-support">
              Help & Support
            </Dropdown.Item>
            <Dropdown.Item as={NavLink} to="/admin/settings">
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
