import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsersCog,
  FaUser,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { RiWallet3Line } from "react-icons/ri";
import { getOwnerFromSession, ownerApi } from "../../../helpers/api/apiCore";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { useSuperAdminContext } from "../../../contexts/SuperAdminContext";
import { SUPER_ADMIN_GET_ALL_OWNERS } from "../../../helpers/api/apiEndpoint";
import { Form } from "react-bootstrap";
import { IoTennisballOutline } from "react-icons/io5";

const AdminSidebar = ({ isOpen, onClose, isCollapsed }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const Owner = getOwnerFromSession();
  const ownerData = Owner?.user || Owner;
  const isSuperAdmin = ownerData?.role === 'super_admin';
  const { selectedOwnerId, updateSelectedOwner } = useSuperAdminContext();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);

  // Fetch owners for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      fetchOwners();
    }
  }, [isSuperAdmin]);

  const fetchOwners = async () => {
    try {
      setLoadingOwners(true);
      const response = await ownerApi.get(SUPER_ADMIN_GET_ALL_OWNERS);
      const ownersData = response.data?.data?.owners || [];
      setOwners(ownersData);
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setLoadingOwners(false);
    }
  };

  const handleOwnerChange = (e) => {
    const newOwnerId = e.target.value;
    const selectedOwnerData = owners.find(o => o._id === newOwnerId);
    updateSelectedOwner(newOwnerId === 'all' ? null : newOwnerId, selectedOwnerData);
    // Refresh the page to reload data with new owner
    window.location.reload();
  };

  const linkClasses = ({ isActive }) =>
    `d-flex align-items-center px-4 py-2 my-1 text-decoration-none mx-3 rounded-2 cursor-pointer ${isActive ? "active-parent-link" : "bg-transparent"
    }`;

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
      {/* Logo Section */}
      <div
        className="d-flex align-items-center justify-content-center mb-2 pb-2"
        style={{ marginTop: "10px" }}
      >
        <div className={`position-relative ${isCollapsed ? "" : "me-3"}`}>
          <div className="bg-primary rounded-circle p-2">
            <IoTennisballOutline
              size={isCollapsed ? 24 : window.innerWidth <= 768 ? 110 : 80}
            />
          </div>
        </div>
      </div>

      {/* Super Admin Badge */}
      {isSuperAdmin && !isCollapsed && (
        <div className="px-3 mb-3">
          <div className="bg-primary text-white p-2 rounded text-center small fw-bold">
            SUPER ADMIN
          </div>
        </div>
      )}

      {/* Owner Selector */}
      {isSuperAdmin && !isCollapsed && (
        <div className="px-3 mb-3">
          <Form.Label className="text-white small mb-1 d-block">Select Owner</Form.Label>
          {loadingOwners ? (
            <ButtonLoading height="38px" color="white" />
          ) : (
            <Form.Select
              value={selectedOwnerId || 'all'}
              onChange={handleOwnerChange}
              size="sm"
              style={{
                backgroundColor: "#2D3748",
                color: "#CCD2DD",
                border: "1px solid #4A5568",
                fontSize: "13px"
              }}
            >
              <option value="all">All Owners (Global View)</option>
              {owners.map((owner) => (
                <option key={owner._id} value={owner._id}>
                  {owner.name || owner.email} {owner.isSuspended ? '(Suspended)' : ''}
                </option>
              ))}
            </Form.Select>
          )}
          {selectedOwnerId && selectedOwnerId !== 'all' && (
            <div className="text-white-50 text-center mt-2 small" style={{ fontSize: '11px' }}>
              Viewing: {owners.find(o => o._id === selectedOwnerId)?.name || 'Owner'}
            </div>
          )}
        </div>
      )}

      <nav className="flex-grow-1 mt-2">
        {!isCollapsed && (
          <p className="px-4 py-0 mb-1" style={{ color: "#8A99AF" }}>
            MENU
          </p>
        )}

        {/* Dashboard */}
        <div
          className="position-relative"
          onMouseEnter={() =>
            isCollapsed && window.innerWidth > 768 && setHoveredItem("dashboard")
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
              minHeight: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
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
          {isCollapsed && window.innerWidth > 768 && hoveredItem === "dashboard" && (
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

        {/* Bookings */}
        <div
          className="position-relative"
          onMouseEnter={() =>
            isCollapsed && window.innerWidth > 768 && setHoveredItem("booking")
          }
          onMouseLeave={() => setHoveredItem(null)}
        >
          <NavLink
            to="/admin/booking"
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
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <FaCalendarAlt
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Bookings"}
          </NavLink>
          {isCollapsed && window.innerWidth > 768 && hoveredItem === "booking" && (
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
              Bookings
            </div>
          )}
        </div>

        {/* Owners Management */}
        {isSuperAdmin && (
          <div
            className="position-relative"
            onMouseEnter={() =>
              isCollapsed && window.innerWidth > 768 && setHoveredItem("owners")
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to="/admin/owners"
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
              onClick={() => window.innerWidth <= 768 && onClose()}
            >
              <FaUsersCog
                className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
                size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
              />
              {(!isCollapsed || window.innerWidth <= 768) && "Owners"}
            </NavLink>
            {isCollapsed && window.innerWidth > 768 && hoveredItem === "owners" && (
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
                Owners
              </div>
            )}
          </div>
        )}

        {/* Payments */}
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
              minHeight: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <RiWallet3Line
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Payments"}
          </NavLink>
          {isCollapsed && window.innerWidth > 768 && hoveredItem === "payments" && (
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
              Payments
            </div>
          )}
        </div>

        {/* Profile */}
        <div
          className="position-relative"
          onMouseEnter={() =>
            isCollapsed && window.innerWidth > 768 && setHoveredItem("profile")
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
              minHeight: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
            })}
            onClick={() => window.innerWidth <= 768 && onClose()}
          >
            <FaUser
              className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
              size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
            />
            {(!isCollapsed || window.innerWidth <= 768) && "Profile"}
          </NavLink>
          {isCollapsed && window.innerWidth > 768 && hoveredItem === "profile" && (
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
              Profile
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
