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
const AdminSidebar = ({ isOpen, onClose, isCollapsed }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const Owner = getOwnerFromSession();
  const { getLogoData, getLogoLoading } = useSelector((state) => state?.logo);
  const ownerId = Owner?._id || Owner?.generatedBy;
  // Tracks active status of dropdown based on location
  const [isBookingOpen, setBookingOpen] = useState(false);
  const [clubLogo, setClubLogo] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
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
  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <aside
      className={`admin-sidebar text-white vh-100 d-flex flex-column ${
        isOpen ? "mobile-open" : ""
      } ${isCollapsed ? "collapsed" : ""}`}
      style={{
        width: isCollapsed ? "70px" : "250px",
        backgroundColor: "#1C2434",
      }}
    >
      <div
        className="d-flex align-items-center justify-content-center mb-2 pb-2"
        style={{ marginTop: "10px" }}
      >
        <div className={`position-relative ${isCollapsed ? "" : "me-3"}`}>
          {getLogoLoading ? (
            <DataLoading
              height={isCollapsed ? "40px" : "100px"}
              color="white"
            />
          ) : (
            <>
              {clubLogo ? (
                <img
                  src={clubLogo}
                  alt="Profile"
                  className="rounded-circle "
                  loading="lazy"
                  style={{
                    width: isCollapsed
                      ? "60px"
                      : window.innerWidth <= 768
                      ? "90px"
                      : "110px",
                    height: isCollapsed
                      ? "60px"
                      : window.innerWidth <= 768
                      ? "90px"
                      : "110px",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={() => handleNavigation("/admin/dashboard")}
                />
              ) : (
                <div className="bg-secondary rounded-circle p-2">
                  <IoTennisballOutline
                    size={
                      isCollapsed ? 24 : window.innerWidth <= 768 ? 110 : 80
                    }
                  />
                </div>
              )}
            </>
          )}
          {!getLogoLoading && (!isCollapsed || window.innerWidth <= 768) && (
            <label
              htmlFor="clubLogoUpload"
              className="position-absolute bottom-0 end-0 rounded-circle p-0"
              style={{
                width: window.innerWidth <= 768 ? "30px" : "25px",
                height: window.innerWidth <= 768 ? "30px" : "25px",
                backgroundColor: "#565758",
                opacity: 0.8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <FaEdit
                style={{
                  color: "white",
                  fontSize: window.innerWidth <= 768 ? "16px" : "14px",
                }}
              />
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
        {!isCollapsed && (
          <p className="px-4 py-0 mb-1" style={{ color: "#8A99AF" }}>
            MENU
          </p>
        )}
        <div
          className="position-relative"
          onMouseEnter={() =>
            isCollapsed &&
            window.innerWidth > 768 &&
            setHoveredItem("dashboard")
          }
          onMouseLeave={() => setHoveredItem(null)}
        >
          <NavLink
            to="/admin/dashboard"
            className={
              isCollapsed && window.innerWidth > 768
                ? "d-flex align-items-center justify-content-center py-3 text-white text-decoration-none mx-2 rounded-2 cursor-pointer"
                : linkClasses
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#333B48" : "transparent",
              fontWeight: "600",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <FaTachometerAlt
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 16}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Dashboard"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "dashboard" && (
              <div
                className="position-absolute bg-dark text-white px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Dashboard
              </div>
            )}
        </div>

        <div
          className="position-relative"
          onMouseEnter={() => {
            if (isCollapsed && window.innerWidth > 768) {
              setHoveredItem("booking");
              setShowDropdown(true);
            }
          }}
          onMouseLeave={() => {
            setHoveredItem(null);
            if (isCollapsed && window.innerWidth > 768) setShowDropdown(false);
          }}
        >
          <button
            onClick={() => {
              if (!isCollapsed || window.innerWidth <= 768) {
                setBookingOpen((prev) => !prev);
              }
            }}
            className={`btn ${
              isCollapsed && window.innerWidth > 768
                ? "w-auto d-flex align-items-center justify-content-center py-3 text-white text-decoration-none mx-2 rounded-2"
                : "w-75 d-flex align-items-center px-4 py-2 text-white text-decoration-none mx-3 rounded-2"
            } ${isDropdownActive ? "#333B48" : "bg-transparent"}`}
            style={{
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            }}
          >
            <div
              className={`d-flex align-items-center fs-6 ${
                isCollapsed && window.innerWidth > 768 ? "" : "w-100"
              }`}
              style={{ fontWeight: "600" }}
            >
              <FaCalendarAlt
                className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
                size={isCollapsed && window.innerWidth > 768 ? 18 : 16}
              />
              {(!isCollapsed || window.innerWidth <= 768) && "Booking"}
            </div>
            {(!isCollapsed || window.innerWidth <= 768) &&
              (isBookingOpen ? <FaChevronUp /> : <FaChevronDown />)}
          </button>

          {/* Desktop Collapsed Hover Dropdown */}
          {isCollapsed && window.innerWidth > 768 && showDropdown && (
            <div
              className="position-absolute"
              style={{
                left: "60px",
                top: "0",
                zIndex: 1100,
                backgroundColor: "#2D3748",
                borderRadius: "8px",
                padding: "8px",
                minWidth: "150px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <NavLink
                to="/admin/booking"
                className="d-block px-3 py-2 text-white text-decoration-none rounded"
                style={({ isActive }) => ({
                  backgroundColor: isActiveLink ? "#333B48" : "transparent",
                  fontWeight: "600",
                  transition: "background-color 0.2s",
                })}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#4A5568")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = isActiveLink
                    ? "#333B48"
                    : "transparent")
                }
                onClick={() => {
                  setShowDropdown(false);
                  window.innerWidth <= 768 && onClose();
                }}
              >
                Bookings
              </NavLink>
              <NavLink
                to="/admin/cancellation"
                className="d-block px-3 py-2 text-white text-decoration-none rounded"
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "#333B48" : "transparent",
                  fontWeight: "600",
                  transition: "background-color 0.2s",
                })}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#4A5568")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor =
                    location.pathname === "/admin/cancellation"
                      ? "#333B48"
                      : "transparent")
                }
                onClick={() => {
                  setShowDropdown(false);
                  window.innerWidth <= 768 && onClose();
                }}
              >
                Cancellation
              </NavLink>
            </div>
          )}
        </div>

        {isBookingOpen && (!isCollapsed || window.innerWidth <= 768) && (
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
              onClick={() => window.innerWidth <= 768 && onClose()}
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
              onClick={() => window.innerWidth <= 768 && onClose()}
            >
              Cancellation
            </NavLink>
          </div>
        )}

        <div
          className="position-relative"
          onMouseEnter={() =>
            isCollapsed && window.innerWidth > 768 && setHoveredItem("matches")
          }
          onMouseLeave={() => setHoveredItem(null)}
        >
          <NavLink
            to="/admin/open-matches"
            className={({ isActive }) =>
              `d-flex align-items-center ${
                isCollapsed && window.innerWidth > 768
                  ? "justify-content-center py-3 text-white text-decoration-none mx-2 rounded-2"
                  : "px-4 py-2 text-white text-decoration-none mx-3 rounded-2"
              } cursor-pointer ${
                isActive || location.pathname === "/admin/create-match"
                  ? "active-parent-link"
                  : ""
              }`
            }
            style={() => ({
              backgroundColor:
                location.pathname === "/admin/open-matches" ||
                location.pathname === "/admin/create-match"
                  ? "#333B48"
                  : "transparent",
              fontWeight: "600",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <LuSwords
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 16}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Open Matches"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "matches" && (
              <div
                className="position-absolute bg-dark text-white px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Open Matches
              </div>
            )}
        </div>

        <div
          className="position-relative"
          onMouseEnter={() =>
            isCollapsed &&
            window.innerWidth > 768 &&
            setHoveredItem("americano")
          }
          onMouseLeave={() => setHoveredItem(null)}
        >
          <NavLink
            to="/admin/americano"
            className={
              isCollapsed && window.innerWidth > 768
                ? "d-flex align-items-center justify-content-center py-3 text-white text-decoration-none mx-2 rounded-2 cursor-pointer"
                : linkClasses
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#333B48" : "transparent",
              fontWeight: "600",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <FaRankingStar
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 16}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Americano"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "americano" && (
              <div
                className="position-absolute bg-dark text-white px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Americano
              </div>
            )}
        </div>

        {/* <NavLink
          to="/admin/packages"
          className={linkClasses}
          style={({ isActive }) => ({
            backgroundColor: isActive ? "#333B48" : "transparent",
            fontWeight: "600",
          })}
        >
          <LiaFileInvoiceDollarSolid className="me-4" />
          Packages
        </NavLink> */}
        <div
          className="position-relative"
          onMouseEnter={() =>
            isCollapsed && window.innerWidth > 768 && setHoveredItem("packages")
          }
          onMouseLeave={() => setHoveredItem(null)}
        >
          <NavLink
            to="/admin/packages"
            className={({ isActive }) =>
              `d-flex align-items-center ${
                isCollapsed && window.innerWidth > 768
                  ? "justify-content-center py-3 text-white text-decoration-none mx-2 rounded-2"
                  : "px-4 py-2 text-white text-decoration-none mx-3 rounded-2"
              } cursor-pointer ${
                isActive || location.pathname === "/admin/package-details"
                  ? "active-parent-link"
                  : ""
              }`
            }
            style={() => ({
              backgroundColor:
                location.pathname === "/admin/packages" ||
                location.pathname === "/admin/package-details"
                  ? "#333B48"
                  : "transparent",
              fontWeight: "600",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <LiaFileInvoiceDollarSolid
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 16}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Packages"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "packages" && (
              <div
                className="position-absolute bg-dark text-white px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Packages
              </div>
            )}
        </div>

        <div
          className="position-relative"
          onMouseEnter={() =>
            isCollapsed && window.innerWidth > 768 && setHoveredItem("users")
          }
          onMouseLeave={() => setHoveredItem(null)}
        >
          <NavLink
            to="/admin/users"
            className={
              isCollapsed && window.innerWidth > 768
                ? "d-flex align-items-center justify-content-center py-3 text-white text-decoration-none mx-2 rounded-2 cursor-pointer"
                : linkClasses
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#333B48" : "transparent",
              fontWeight: "600",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <FaUsersCog
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 16}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Users"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "users" && (
              <div
                className="position-absolute bg-dark text-white px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Users
              </div>
            )}
        </div>
        <div
          className="position-relative"
          onMouseEnter={() =>
            isCollapsed && window.innerWidth > 768 && setHoveredItem("payments")
          }
          onMouseLeave={() => setHoveredItem(null)}
        >
          <NavLink
            to="/admin/payments"
            className={
              isCollapsed && window.innerWidth > 768
                ? "d-flex align-items-center justify-content-center py-3 text-white text-decoration-none mx-2 rounded-2 cursor-pointer"
                : linkClasses
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#333B48" : "transparent",
              fontWeight: "600",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <RiWallet3Line
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 16}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Payment"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "payments" && (
              <div
                className="position-absolute bg-dark text-white px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Payment
              </div>
            )}
        </div>

        <div
          className="position-relative"
          onMouseEnter={() =>
            isCollapsed && window.innerWidth > 768 && setHoveredItem("logout")
          }
          onMouseLeave={() => setHoveredItem(null)}
        >
          <NavLink
            to="/admin/login"
            className={
              isCollapsed && window.innerWidth > 768
                ? "d-flex align-items-center justify-content-center py-3 text-white text-decoration-none mx-2 rounded-2 cursor-pointer"
                : linkClasses
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#333B48" : "transparent",
              fontWeight: "600",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => {
              dispatch(logout());
              window.innerWidth <= 768 && onClose();
            }}
          >
            <RiLogoutCircleLine
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 16}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Log out"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "logout" && (
              <div
                className="position-absolute bg-dark text-white px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                Log out
              </div>
            )}
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
