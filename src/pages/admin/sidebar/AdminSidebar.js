import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaUsersCog,
  FaBuilding,
  FaUser,
} from "react-icons/fa";
import { logout } from "../../../redux/admin/auth/slice";
import { useDispatch, useSelector } from "react-redux";
import { RiLogoutCircleLine, RiWallet3Line } from "react-icons/ri";
import { LuSwords } from "react-icons/lu";
import { FaRankingStar } from "react-icons/fa6";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";
import { IoTennisballOutline } from "react-icons/io5";
import { getOwnerRegisteredClub } from "../../../redux/thunks";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";

const AdminSidebar = ({ isOpen, onClose, isCollapsed }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const Owner = getOwnerFromSession();

  const ownerId = Owner?._id || Owner?.generatedBy;
  const { getClubData, ownerClubLoading } = useSelector(
    (state) => state?.manualBooking
  );
  const statedate = useSelector(
    (state) => state.manualBooking?.ownerClubData?.[0]?.logo
  );

  const [isBookingOpen, setBookingOpen] = useState(false);
  const [clubLogo, setClubLogo] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const bookingPaths = [
    "/admin/booking",
    "/admin/cancellation",
    "/admin/manualbooking",
    "/admin/court-availability",
  ];

  useEffect(() => {
    if (bookingPaths.includes(location.pathname)) {
      setBookingOpen(true);
    } else {
      setBookingOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    dispatch(getOwnerRegisteredClub({ ownerId })).unwrap();
  }, [dispatch, ownerId]);

  useEffect(() => {
    setClubLogo(statedate || null);
  }, [statedate]);

  const linkClasses = ({ isActive }) =>
    `d-flex align-items-center px-4 py-2 my-1 text-decoration-none mx-3 rounded-2 cursor-pointer ${isActive ? "active-parent-link" : "bg-transparent"
    }`;

  const isDropdownActive = bookingPaths.includes(location.pathname);
  const isActiveLink = bookingPaths.includes(location.pathname);

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <aside
      className={`admin-sidebar text-white vh-100 d-flex flex-column ${isOpen ? "mobile-open" : ""
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
          {ownerClubLoading ? (
            <ButtonLoading
              height={isCollapsed ? "40px" : "100px"}
              color="white"
            />
          ) : (
            <>

              {clubLogo ? (
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f9f9f9",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={clubLogo}
                    alt="User Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      // backgroundSize: "cover",
                    }}
                    onClick={() => handleNavigation("/admin/dashboard")}
                  />
                </div>
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
        </div>
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
                ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                : linkClasses
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#333B48" : "transparent",
              color: "#CCD2DD",
              fontSize: "15px",
              fontWeight: "500",
              fontFamily: "Poppins",
              boxShadow: isActive ? "-28px 22px 45px 0px #1B1D4224" : "none",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <FaTachometerAlt
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Dashboard"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "dashboard" && (
              <div
                className="position-absolute bg-dark px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                  color: "#CCD2DD",
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
            className={`btn ${isCollapsed && window.innerWidth > 768
              ? "w-auto d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2"
              : " d-flex align-items-center px-4 py-2 my-1 text-decoration-none mx-3 rounded-2"
              } ${isDropdownActive ? "active-parent-link" : "bg-transparent"}`}
            style={{
              backgroundColor: isDropdownActive ? "#333B48" : "transparent",
              color: "#CCD2DD",
              fontSize: "15px",
              fontWeight: "500",
              fontFamily: "Poppins",
              boxShadow: isDropdownActive
                ? "-28px 22px 45px 0px #1B1D4224"
                : "none",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "225px",
            }}
          >
            <div
              className={`d-flex align-items-center fs-6 ${isCollapsed && window.innerWidth > 768 ? "" : "w-100"
                }`}
            >
              <FaCalendarAlt
                className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
                size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
              />
              {(!isCollapsed || window.innerWidth <= 768) && "Booking"}
            </div>
            {(!isCollapsed || window.innerWidth <= 768) &&
              (isBookingOpen ? <FaChevronUp /> : <FaChevronDown />)}
          </button>

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
                className="d-block px-3 py-2 my-1 text-decoration-none rounded"
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "#333B48" : "transparent",
                  color: "#CCD2DD",
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                  boxShadow: isActive
                    ? "-28px 22px 45px 0px #1B1D4224"
                    : "none",
                  transition: "background-color 0.2s",
                  whiteSpace: "nowrap",
                })}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#4A5568")
                }
                onMouseLeave={(e) =>
                (e.target.style.backgroundColor =
                  location.pathname === "/admin/booking" ||
                    location.pathname === "/admin/manualbooking"
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
                className="d-block px-3 py-2 my-1 text-decoration-none rounded"
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "#333B48" : "transparent",
                  color: "#CCD2DD",
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                  boxShadow: isActive
                    ? "-28px 22px 45px 0px #1B1D4224"
                    : "none",
                  transition: "background-color 0.2s",
                  whiteSpace: "nowrap",
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
              <NavLink
                to="/admin/court-availability"
                className="d-block px-3 py-2 my-1 text-decoration-none rounded"
                style={({ isActive }) => ({
                  backgroundColor: isActive ? "#333B48" : "transparent",
                  color: "#CCD2DD",
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                  boxShadow: isActive
                    ? "-28px 22px 45px 0px #1B1D4224"
                    : "none",
                  transition: "background-color 0.2s",
                  whiteSpace: "nowrap",
                })}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#4A5568")
                }
                onMouseLeave={(e) =>
                (e.target.style.backgroundColor =
                  location.pathname === "/admin/court-availability"
                    ? "#333B48"
                    : "transparent")
                }
                onClick={() => {
                  setShowDropdown(false);
                  window.innerWidth <= 768 && onClose();
                }}
              >
                Court Availability
              </NavLink>
            </div>
          )}
        </div>

        {isBookingOpen && (!isCollapsed || window.innerWidth <= 768) && (
          <div className="ms-4 d-flex flex-column me-2">
            <NavLink
              to="/admin/booking"
              className={({ isActive }) =>
                `d-flex align-items-center px-4 py-2 my-1 text-decoration-none ${isActive ? "active-child-link" : ""
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? "#333B48" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isActive ? "-28px 22px 45px 0px #1B1D4224" : "none",
                borderRadius: "4px",
                whiteSpace: "nowrap",
              })}
              onClick={() => window.innerWidth <= 768 && onClose()}
            >
              Bookings
            </NavLink>
            <NavLink
              to="/admin/cancellation"
              className={({ isActive }) =>
                `d-flex align-items-center px-4 py-2 my-1 text-decoration-none ${isActive ? "active-child-link" : ""
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? "#333B48" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isActive ? "-28px 22px 45px 0px #1B1D4224" : "none",
                borderRadius: "4px",
                whiteSpace: "nowrap",
              })}
              onClick={() => window.innerWidth <= 768 && onClose()}
            >
              Cancellation
            </NavLink>
            <NavLink
              to="/admin/court-availability"
              className={({ isActive }) =>
                `d-flex align-items-center px-4 py-2 my-1 text-decoration-none ${isActive ? "active-child-link" : ""
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? "#333B48" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isActive ? "-28px 22px 45px 0px #1B1D4224" : "none",
                borderRadius: "4px",
                whiteSpace: "nowrap",
              })}
              onClick={() => window.innerWidth <= 768 && onClose()}
            >
              Court Availability
            </NavLink>
          </div>
        )}

        <div
          className="position-relative"
          onMouseEnter={() =>
            isCollapsed && window.innerWidth > 768 && setHoveredItem("myclub")
          }
          onMouseLeave={() => setHoveredItem(null)}
        >
          <NavLink
            to="/admin/my-club"
            className={
              isCollapsed && window.innerWidth > 768
                ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                : linkClasses
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#333B48" : "transparent",
              color: "#CCD2DD",
              fontSize: "15px",
              fontWeight: "500",
              fontFamily: "Poppins",
              boxShadow: isActive ? "-28px 22px 45px 0px #1B1D4224" : "none",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <FaBuilding
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "My Club"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "myclub" && (
              <div
                className="position-absolute bg-dark px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                  color: "#CCD2DD",
                  whiteSpace: "nowrap",
                }}
              >
                My Club
              </div>
            )}
        </div>

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
              `d-flex align-items-center ${isCollapsed && window.innerWidth > 768
                ? "justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2"
                : "px-4 py-2 my-1 text-decoration-none mx-3 rounded-2"
              } cursor-pointer ${isActive || location.pathname === "/admin/create-match"
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
              color: "#CCD2DD",
              fontSize: "15px",
              fontWeight: "500",
              fontFamily: "Poppins",
              boxShadow:
                location.pathname === "/admin/open-matches" ||
                  location.pathname === "/admin/create-match"
                  ? "-28px 22px 45px 0px #1B1D4224"
                  : "none",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <LuSwords
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Open Matches"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "matches" && (
              <div
                className="position-absolute bg-dark px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                  color: "#CCD2DD",
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
                ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                : linkClasses
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#333B48" : "transparent",
              color: "#CCD2DD",
              fontSize: "15px",
              fontWeight: "500",
              fontFamily: "Poppins",
              boxShadow: isActive ? "-28px 22px 45px 0px #1B1D4224" : "none",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <FaRankingStar
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Americano"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "americano" && (
              <div
                className="position-absolute bg-dark px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                  color: "#CCD2DD",
                  whiteSpace: "nowrap",
                }}
              >
                Americano
              </div>
            )}
        </div>

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
              `d-flex align-items-center ${isCollapsed && window.innerWidth > 768
                ? "justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2"
                : "px-4 py-2 my-1 text-decoration-none mx-3 rounded-2"
              } cursor-pointer ${isActive || location.pathname === "/admin/package-details"
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
              color: "#CCD2DD",
              fontSize: "15px",
              fontWeight: "500",
              fontFamily: "Poppins",
              boxShadow:
                location.pathname === "/admin/packages" ||
                  location.pathname === "/admin/package-details"
                  ? "-28px 22px 45px 0px #1B1D4224"
                  : "none",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <LiaFileInvoiceDollarSolid
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Packages"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "packages" && (
              <div
                className="position-absolute bg-dark px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                  color: "#CCD2DD",
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
                ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                : linkClasses
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#333B48" : "transparent",
              color: "#CCD2DD",
              fontSize: "15px",
              fontWeight: "500",
              fontFamily: "Poppins",
              boxShadow: isActive ? "-28px 22px 45px 0px #1B1D4224" : "none",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <FaUsersCog
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Users"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "users" && (
              <div
                className="position-absolute bg-dark px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                  color: "#CCD2DD",
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
                ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                : linkClasses
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#333B48" : "transparent",
              color: "#CCD2DD",
              fontSize: "15px",
              fontWeight: "500",
              fontFamily: "Poppins",
              boxShadow: isActive ? "-28px 22px 45px 0px #1B1D4224" : "none",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <RiWallet3Line
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Payment"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "payments" && (
              <div
                className="position-absolute bg-dark px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                  color: "#CCD2DD",
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
            isCollapsed &&
            window.innerWidth > 768 &&
            setHoveredItem("myprofile")
          }
          onMouseLeave={() => setHoveredItem(null)}
        >
          <NavLink
            to="/admin/profile"
            className={
              isCollapsed && window.innerWidth > 768
                ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                : linkClasses
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#333B48" : "transparent",
              color: "#CCD2DD",
              fontSize: "15px",
              fontWeight: "500",
              fontFamily: "Poppins",
              boxShadow: isActive ? "-28px 22px 45px 0px #1B1D4224" : "none",
              minHeight:
                isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <FaUser
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "My Profile"}
          </NavLink>
          {isCollapsed &&
            window.innerWidth > 768 &&
            hoveredItem === "myprofile" && (
              <div
                className="position-absolute bg-dark px-2 py-1 rounded"
                style={{
                  left: "75px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1200,
                  fontSize: "15px",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                  color: "#CCD2DD",
                  whiteSpace: "nowrap",
                }}
              >
                My Profile
              </div>
            )}
        </div>

        {/* <div
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
                ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                : linkClasses
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? "#333B48" : "transparent",
              color: "#CCD2DD",
              fontSize: "15px",
              fontWeight: "500",
              fontFamily: "Poppins",
              boxShadow: isActive ? "-28px 22px 45px 0px #1B1D4224" : "none",
              minHeight: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => {
              dispatch(logout());
              window.innerWidth <= 768 && onClose();
            }}
          >
            <RiLogoutCircleLine
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Log out"}
          </NavLink>
          {isCollapsed && window.innerWidth > 768 && hoveredItem === "logout" && (
            <div
              className="position-absolute bg-dark px-2 py-1 rounded"
              style={{
                left: "75px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1200,
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                color: "#CCD2DD",
                whiteSpace: "nowrap",
              }}
            >
              Log out
            </div>
          )}
        </div> */}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
