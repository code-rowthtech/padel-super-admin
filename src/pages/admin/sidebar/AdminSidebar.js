import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsers,
  FaTrophy,
  FaCreditCard,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { logout } from "../../../redux/admin/auth/authSlice";
import { useDispatch } from "react-redux";
import { RiLogoutCircleLine } from "react-icons/ri";
const AdminSidebar = () => {
  const dispatch = useDispatch();
  const [isCompetitionOpen, setCompetitionOpen] = useState(false);

  const linkClasses = ({ isActive }) =>
    `d-flex align-items-center px-4 py-2 text-white text-decoration-none ${
      isActive ? "bg-secondary" : "bg-transparent"
    } hover-bg-dark`;

  return (
    <aside className="bg-dark text-white vh-100 d-flex flex-column" style={{ width: "250px" }}>
      <div className="px-4 py-4 fs-4 fw-bold border-bottom">Logo here</div>

      <nav className="flex-grow-1 mt-3">
        <NavLink to="/admin/dashboard" className={linkClasses}>
          <FaTachometerAlt className="me-2" />
          Dashboard
        </NavLink>

        <NavLink to="/admin/booking" className={linkClasses}>
          <FaCalendarAlt className="me-2" />
          Booking
        </NavLink>

        <NavLink to="/admin/open-matches" className={linkClasses}>
          <FaUsers className="me-2" />
          Open Matches
        </NavLink>

        {/* Dropdown */}
        <button
          onClick={() => setCompetitionOpen((prev) => !prev)}
          className="btn d-flex justify-content-between align-items-center w-100 px-4 py-2 text-white text-start border-0 bg-transparent"
        >
          <div className="d-flex align-items-center">
            <FaTrophy className="me-2" />
            Competition
          </div>
          {isCompetitionOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {isCompetitionOpen && (
          <div className="ms-4 d-flex flex-column">
            <NavLink to="/admin/competition/matches" className={linkClasses}>
              Matches
            </NavLink>
            <NavLink to="/admin/competition/teams" className={linkClasses}>
              Teams
            </NavLink>
          </div>
        )}

        <NavLink to="/admin/payment" className={linkClasses}>
          <FaCreditCard className="me-2" />
          Payment
        </NavLink>
        <NavLink to="/admin/login" className={linkClasses} onClick={() => { dispatch(logout()) }}>
          <RiLogoutCircleLine className="me-2" />
          Log out
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
