import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaUsersCog,
} from "react-icons/fa";
import { logout } from "../../../redux/admin/auth/slice";
import { useDispatch, useSelector } from "react-redux";
import { RiLogoutCircleLine, RiWallet3Line } from "react-icons/ri";
import { LuSwords } from "react-icons/lu";
import { FaRankingStar } from "react-icons/fa6";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { IoTennisballOutline } from "react-icons/io5";
import { getLogo, createLogo, updateLogo } from "../../../redux/thunks";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { DataLoading } from "../../../helpers/loading/Loaders";
const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const Owner = getOwnerFromSession();
  const { getLogoData, getLogoLoading } = useSelector((state) => state?.logo);
  const ownerId = Owner?._id || Owner?.generatedBy;
  // Tracks active status of dropdown based on location
  const [isBookingOpen, setBookingOpen] = useState(false);
  const [clubLogo, setClubLogo] = useState(null);
  const bookingPaths = ["/admin/booking", "/admin/cancellation"];

  useEffect(() => {
    if (bookingPaths.includes(location.pathname)) {
      setBookingOpen(true);
    }
  }, [location.pathname]);

  // Utility function for active link styling
  const linkClasses = ({ isActive }) =>
    `d-flex align-items-center px-4 py-2 text-white text-decoration-none mx-3 rounded-2 cursor-pointer ${
      isActive ? "" : "bg-transparent"
    } hover-bg-dark`;

  const isDropdownActive = bookingPaths.includes(location.pathname);
  const isActiveLink =
    location.pathname === "/admin/booking" ||
    location.pathname === "/admin/manualbooking";

  const handleLogoChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Create a preview URL for UI display
      const reader = new FileReader();
      reader.onloadend = () => {
        setClubLogo(reader.result);

        // Prepare FormData
        const formData = new FormData();
        formData.append("ownerId", ownerId);
        formData.append("image", file);

        // Dispatch with FormData
        if (getLogoData?.logo?._id) {
          dispatch(updateLogo(formData));
        } else {
          dispatch(createLogo(formData));
        }
      };
      reader.readAsDataURL(file);
    },
    [dispatch, ownerId, getLogoData?.logo?._id]
  );
  useEffect(() => {
    dispatch(getLogo({ ownerId: ownerId }));
  }, []);
  useEffect(() => {
    setClubLogo(getLogoData?.logo?.logo?.[0]);
  }, [getLogoData?.logo?._id]);
  return (
    <aside
      className=" text-white vh-100 d-flex flex-column"
      style={{ width: "250px", backgroundColor: "#1C2434" }}
    >
      <div
        className="d-flex align-items-center justify-content-center mb-2 pb-2"
        style={{ marginTop: "10px" }}
      >
        <div className="position-relative me-3">
          {getLogoLoading ? (
            <DataLoading height="100px" color="white" />
          ) : (
            <>
              {clubLogo ? (
                <img
                  src={clubLogo}
                  alt="Profile"
                  className="rounded-circle "
                  loading="lazy"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                  onClick={() => {
                    navigate("/admin/dashboard");
                  }}
                />
              ) : (
                <div className="bg-secondary rounded-circle p-2">
                  <IoTennisballOutline size={80} />
                </div>
              )}
            </>
          )}
          {!getLogoLoading && (
            <label
              htmlFor="clubLogoUpload"
              className="position-absolute bottom-0 end-0 rounded-circle p-0"
              style={{
                width: "25px",
                height: "25px",
                backgroundColor: "#565758",
                opacity: 0.8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <FaEdit style={{ color: "white", fontSize: "14px" }} />
            </label>
          )}
        </div>
        <input
          type="file"
          id="clubLogoUpload"
          accept="image/*"
          hidden
          onChange={handleLogoChange}
        />
      </div>

      <nav className="flex-grow-1 mt-2">
        <p className="px-4 py-0 mb-1" style={{ color: "#8A99AF" }}>
          MENU
        </p>
        <NavLink
          to="/admin/dashboard"
          className={linkClasses}
          style={({ isActive }) => ({
            backgroundColor: isActive ? "#333B48" : "transparent",
            fontWeight: "600",
          })}
        >
          <FaTachometerAlt className="me-4" />
          Dashboard
        </NavLink>

        <button
          onClick={() => setBookingOpen((prev) => !prev)}
          className={`btn w-75  d-flex align-items-center px-4 py-2 text-white text-decoration-none mx-3 rounded-2 ${
            isDropdownActive ? "#333B48" : "bg-transparent"
          }`}
        >
          <div
            className="d-flex align-items-center w-100"
            style={{ fontWeight: "600" }}
          >
            <FaCalendarAlt className="me-4" />
            Booking
          </div>
          {isBookingOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {isBookingOpen && (
          <div className="ms-4 d-flex flex-column me-2">
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
                      backgroundColor: "#333B48",
                      color: "#fff",
                      borderRadius: "4px",
                      fontWeight: "600",
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
                      backgroundColor: "#333B48",
                      color: "#fff",
                      borderRadius: "4px",
                      fontWeight: "600",
                    }
                  : {}
              }
            >
              Cancellation
            </NavLink>
          </div>
        )}

        <NavLink
          to="/admin/open-matches"
          className={linkClasses}
          style={({ isActive }) => ({
            backgroundColor: isActive ? "#333B48" : "transparent",
            fontWeight: "600",
          })}
        >
          <LuSwords className="me-4" />
          Open Matches
        </NavLink>

        <NavLink
          to="/admin/americano"
          className={linkClasses}
          style={({ isActive }) => ({
            backgroundColor: isActive ? "#333B48" : "transparent",
            fontWeight: "600",
          })}
        >
          <FaRankingStar className="me-4" />
          Americano
        </NavLink>

        <NavLink
          to="/admin/packages"
          className={linkClasses}
          style={({ isActive }) => ({
            backgroundColor: isActive ? "#333B48" : "transparent",
            fontWeight: "600",
          })}
        >
          <LiaFileInvoiceDollarSolid className="me-4" />
          Packages
        </NavLink>

        <NavLink
          to="/admin/users"
          className={linkClasses}
          style={({ isActive }) => ({
            backgroundColor: isActive ? "#333B48" : "transparent",
            fontWeight: "600",
          })}
        >
          <FaUsersCog className="me-4" />
          Users
        </NavLink>
        <NavLink
          to="/admin/payments"
          className={linkClasses}
          style={({ isActive }) => ({
            backgroundColor: isActive ? "#333B48" : "transparent",
            fontWeight: "600",
          })}
        >
          <RiWallet3Line className="me-4" />
          Payment
        </NavLink>

        <NavLink
          to="/admin/login"
          className={linkClasses}
          style={({ isActive }) => ({
            backgroundColor: isActive ? "#333B48" : "transparent",
            fontWeight: "600",
          })}
          onClick={() => dispatch(logout())}
        >
          <RiLogoutCircleLine className="me-4" />
          Log out
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
