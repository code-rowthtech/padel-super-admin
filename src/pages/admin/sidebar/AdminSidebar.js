import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
} from "react-icons/fa";
import { logout } from "../../../redux/admin/auth/authSlice";
import { useDispatch } from "react-redux";
import { RiLogoutCircleLine, RiWallet3Line } from "react-icons/ri";
import { LuSwords } from "react-icons/lu";
import { FaRankingStar } from "react-icons/fa6";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // Tracks active status of dropdown based on location
  const [isBookingOpen, setBookingOpen] = useState(false);

  const bookingPaths = ["/admin/booking", "/admin/cancellation"];

  useEffect(() => {
    if (bookingPaths.includes(location.pathname)) {
      setBookingOpen(true);
    }
  }, [location.pathname]);

  // Utility function for active link styling
  const linkClasses = ({ isActive }) =>
    `d-flex align-items-center px-4 py-2 text-white text-decoration-none ${
      isActive ? "bg-secondary" : "bg-transparent"
    } hover-bg-dark`;

  const isDropdownActive = bookingPaths.includes(location.pathname);
  const isActiveLink =
    location.pathname === "/admin/booking" ||
    location.pathname === "/admin/manualbooking";
  return (
    <aside
      className="bg-dark text-white vh-100 d-flex flex-column"
      style={{ width: "250px" }}
    >
      {/* <div
        className="d-flex align-items-center justify-content-center border-bottom pb-2"
        style={{ marginTop: "10px" }}
      >
        <div className="position-relative me-3">
          <img
            src={"https://i.pravatar.cc/40"}
            alt="Profile"
            className="rounded-circle border"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
          <label
            htmlFor="profileImageUpload"
            className="position-absolute bottom-0 end-0 rounded-circle p-1"
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: "#797b7dff",
              opacity: 0.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <FaEdit style={{ color: "white", fontSize: "14px" }} />
          </label>
        </div>
        <input type="file" id="profileImageUpload" accept="image/*" hidden />
      </div> */}
      <div className="px-4 py-4 fs-4 fw-bold border-bottom">Logo here</div>

      <nav className="flex-grow-1 mt-2">
        <NavLink to="/admin/dashboard" className={linkClasses}>
          <FaTachometerAlt className="me-2" />
          Dashboard
        </NavLink>

        <button
          onClick={() => setBookingOpen((prev) => !prev)}
          className={`btn d-flex justify-content-between align-items-center w-100 px-4 py-2 text-white text-start border-0 ${
            isDropdownActive ? "bg-secondary" : "bg-transparent"
          }`}
        >
          <div className="d-flex align-items-center">
            <FaCalendarAlt className="me-2" />
            Booking
          </div>
          {isBookingOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {isBookingOpen && (
          <div className="ms-4 d-flex flex-column">
            <NavLink
              to="/admin/booking"
              className={({ isActive }) =>
                `d-flex align-items-center px-4 py-2 text-white text-decoration-none ${
                  isActive ? "active-child-link" : ""
                }`
              }
              style={({ isActive }) =>
                isActiveLink
                  ? {
                      backgroundColor: "#6c757da8",
                      color: "#fff",
                      borderRadius: "4px",
                    }
                  : {}
              }
            >
              Bookings
            </NavLink>

            <NavLink
              to="/admin/cancellation"
              className={({ isActive }) =>
                `d-flex align-items-center px-4 py-2 text-white text-decoration-none ${
                  isActive ? "active-child-link" : ""
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      backgroundColor: "#6c757da8",
                      color: "#fff",
                      borderRadius: "4px",
                    }
                  : {}
              }
            >
              Cancellation
            </NavLink>
          </div>
        )}

        <NavLink to="/admin/open-matches" className={linkClasses}>
          <LuSwords className="me-2" />
          Open Matches
        </NavLink>

        <NavLink to="/admin/americano" className={linkClasses}>
          <FaRankingStar className="me-2" />
          Americano
        </NavLink>

        <NavLink to="/admin/packages" className={linkClasses}>
          <LiaFileInvoiceDollarSolid className="me-2" />
          Packages
        </NavLink>

        <NavLink to="/admin/payments" className={linkClasses}>
          <RiWallet3Line className="me-2" />
          Payment
        </NavLink>

        <NavLink
          to="/admin/login"
          className={linkClasses}
          onClick={() => dispatch(logout())}
        >
          <RiLogoutCircleLine className="me-2" />
          Log out
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
