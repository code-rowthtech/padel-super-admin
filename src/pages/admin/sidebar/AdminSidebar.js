import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsersCog,
  FaUser,
  FaTrophy,
  FaChevronDown,
  FaChevronUp,
  FaUsers,
} from "react-icons/fa";
import { MdNotificationsActive } from "react-icons/md";
import { HiOutlineTrophy } from "react-icons/hi2";
import { GoVersions } from "react-icons/go";
import { useDispatch } from "react-redux";
import { RiWallet3Line, RiWalletLine } from "react-icons/ri";
import { getOwnerFromSession, ownerApi } from "../../../helpers/api/apiCore";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { useSuperAdminContext } from "../../../contexts/SuperAdminContext";
import { SUPER_ADMIN_GET_ALL_OWNERS } from "../../../helpers/api/apiEndpoint";
import { Form } from "react-bootstrap";
import BallLogo from '../../../assets/images/BallLogo.png';

const AdminSidebar = ({ isOpen, onClose, isCollapsed }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const Owner = getOwnerFromSession();
  const ownerData = Owner?.user || Owner;
  const isSuperAdmin = ownerData?.role === 'super_admin';
  const isSubAdmin = ownerData?.isSubAdmin === true;
  const { selectedOwnerId, updateSelectedOwner } = useSuperAdminContext();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const [leagueExpanded, setLeagueExpanded] = useState(false);
  const [tournamentExpanded, setTournamentExpanded] = useState(false);
  const isTournamentActive = location.pathname.startsWith('/admin/tournament') || location.pathname.startsWith('/admin/new-tournament') || location.pathname.startsWith('/admin/tournament/schedule');

  useEffect(() => {
    if (isTournamentActive) setTournamentExpanded(true);
  }, [isTournamentActive]);

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
      setOwners([]);
    } finally {
      setLoadingOwners(false);
    }
  };

  const handleOwnerChange = (e) => {
    const newOwnerId = e.target.value;
    const selectedOwnerData = owners.find(o => o._id === newOwnerId);
    updateSelectedOwner(newOwnerId === 'all' ? null : newOwnerId, selectedOwnerData);
    window.location.reload();
  };

  const isActivePath = (path) => location.pathname === path;
  const isLeagueActive = location.pathname.startsWith('/admin/league');

  useEffect(() => {
    if (isLeagueActive) {
      setLeagueExpanded(true);
    }
  }, [isLeagueActive]);

  const linkClasses = (active) =>
    `d-flex align-items-center px-4 py-2 my-1 text-decoration-none mx-3 rounded-2 cursor-pointer ${active ? "active-parent-link" : "bg-transparent"
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
        className="d-flex align-items-center justify-content-center mb-4 pb-3 border-bottom"
        style={{ marginTop: "20px", cursor: 'pointer', borderColor: 'rgba(255,255,255,0.1)' }}
        onClick={() => navigate(isSubAdmin ? '/admin/tournament/creation' : '/admin/dashboard')}
      >
        <div className={`position-relative ${isCollapsed ? "" : "me-3"}`}>
          {/* <div
            className="rounded-circle p-3"
            style={{
              background: 'rgb(31, 65, 187)',
              boxShadow: '0 4px 12px rgba(31, 65, 187, 0.3)'
            }}
          > */}
          <img src={BallLogo} alt="Swoot App" className="rounded-circle" style={{ width: isCollapsed ? 35 : 75, height: isCollapsed ? 35 : 75 }} />
          {/* </div> */}
        </div>
      </div>

      {/* Super Admin Badge */}
      {isSuperAdmin && !isCollapsed && (
        <div className="px-3 mb-3">
          <div
            className="text-white p-2 rounded text-center small fw-bold"
            onClick={() => navigate(isSubAdmin ? '/admin/tournament/creation' : '/admin/dashboard')}
            style={{
              cursor: 'pointer',
              background: 'rgb(31, 65, 187)',
              boxShadow: '0 2px 8px rgba(31, 65, 187, 0.3)'
            }}
          >
            SUPER ADMIN
          </div>
        </div>
      )}

      {/* Owner Selector */}
      {isSuperAdmin && !isSubAdmin && !isCollapsed && (
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

      <nav className="flex-grow-1 mt-2" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        {!isCollapsed && (
          <p className="px-4 py-0 mb-1" style={{ color: "#8A99AF" }}>
            MENU
          </p>
        )}

        {!isSubAdmin && (
          <div
            className="position-relative"
            onMouseEnter={() =>
              isCollapsed && window.innerWidth > 768 && setHoveredItem("dashboard")
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to="/admin/dashboard"
              end
              className={
                isCollapsed && window.innerWidth > 768
                  ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                  : linkClasses(isActivePath("/admin/dashboard"))
              }
              style={() => ({
                backgroundColor: isActivePath("/admin/dashboard") ? "rgba(31, 65, 187, 0.15)" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isActivePath("/admin/dashboard") ? "0 4px 12px rgba(31, 65, 187, 0.2)" : "none",
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
        )}

        {/* Bookings */}
        {!isSubAdmin && (
          <div
            className="position-relative"
            onMouseEnter={() =>
              isCollapsed && window.innerWidth > 768 && setHoveredItem("booking")
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to="/admin/booking"
              end
              className={
                isCollapsed && window.innerWidth > 768
                  ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                  : linkClasses(isActivePath("/admin/booking"))
              }
              style={() => ({
                backgroundColor: isActivePath("/admin/booking") ? "rgba(31, 65, 187, 0.15)" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isActivePath("/admin/booking") ? "0 4px 12px rgba(31, 65, 187, 0.2)" : "none",
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
        )}

        {/* Owners Management */}
        {isSuperAdmin && !isSubAdmin && (
          <div
            className="position-relative"
            onMouseEnter={() =>
              isCollapsed && window.innerWidth > 768 && setHoveredItem("owners")
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to="/admin/owners"
              end
              className={
                isCollapsed && window.innerWidth > 768
                  ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                  : linkClasses(isActivePath("/admin/owners"))
              }
              style={() => ({
                backgroundColor: isActivePath("/admin/owners") ? "rgba(31, 65, 187, 0.15)" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isActivePath("/admin/owners") ? "0 4px 12px rgba(31, 65, 187, 0.2)" : "none",
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
        {!isSubAdmin && (
          <div
            className="position-relative"
            onMouseEnter={() =>
              isCollapsed && window.innerWidth > 768 && setHoveredItem("payments")
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to="/admin/payments"
              end
              className={
                isCollapsed && window.innerWidth > 768
                  ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                  : linkClasses(isActivePath("/admin/payments"))
              }
              style={() => ({
                backgroundColor: isActivePath("/admin/payments") ? "rgba(31, 65, 187, 0.15)" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isActivePath("/admin/payments") ? "0 4px 12px rgba(31, 65, 187, 0.2)" : "none",
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
        )}

        {/* Payment Reconciliation */}
        {!isSubAdmin && (
          <div
            className="position-relative"
            onMouseEnter={() =>
              isCollapsed && window.innerWidth > 768 && setHoveredItem("reconciliation")
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to="/admin/payment-reconciliation"
              end
              className={
                isCollapsed && window.innerWidth > 768
                  ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                  : linkClasses(isActivePath("/admin/payment-reconciliation"))
              }
              style={() => ({
                backgroundColor: isActivePath("/admin/payment-reconciliation") ? "rgba(31, 65, 187, 0.15)" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isActivePath("/admin/payment-reconciliation") ? "0 4px 12px rgba(31, 65, 187, 0.2)" : "none",
                minHeight: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
                width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              })}
              onClick={() => window.innerWidth <= 768 && onClose()}
            >
              <RiWalletLine
                className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
                size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
              />
              {(!isCollapsed || window.innerWidth <= 768) && "Payment Reconciliation"}
            </NavLink>
            {isCollapsed && window.innerWidth > 768 && hoveredItem === "reconciliation" && (
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
                Payment Reconciliation
              </div>
            )}
          </div>
        )}

        {/* League with Submenu */}
        {!isSubAdmin && (
          <div
            className="position-relative"
            onMouseEnter={() =>
              isCollapsed && window.innerWidth > 768 && setHoveredItem("league")
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div
              className={
                isCollapsed && window.innerWidth > 768
                  ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                  : linkClasses(isLeagueActive)
              }
              style={{
                backgroundColor: isLeagueActive ? "rgba(31, 65, 187, 0.15)" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isLeagueActive ? "0 4px 12px rgba(31, 65, 187, 0.2)" : "none",
                minHeight: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
                width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
                cursor: "pointer"
              }}
              onClick={() => !isCollapsed && setLeagueExpanded(!leagueExpanded)}
            >
              <FaTrophy
                className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
                size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
              />
              {(!isCollapsed || window.innerWidth <= 768) && (
                <>
                  <span className="flex-grow-1">League</span>
                  {leagueExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                </>
              )}
            </div>
            {isCollapsed && window.innerWidth > 768 && hoveredItem === "league" && (
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
                League
              </div>
            )}
            {leagueExpanded && (!isCollapsed || window.innerWidth <= 768) && (
              <div className="ms-4">
                <NavLink
                  to="/admin/league/creation"
                  end
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{
                    backgroundColor: isActivePath("/admin/league") ? "rgba(31, 65, 187, 0.1)" : "transparent",
                    color: "#CCD2DD",
                    fontSize: "14px",
                    fontWeight: "400",
                    fontFamily: "Poppins",
                  }}
                  onClick={() => window.innerWidth <= 768 && onClose()}
                >
                  League
                </NavLink>
                <NavLink
                  to="/admin/league/registration"
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{
                    backgroundColor: isActivePath("/admin/league/registration") ? "rgba(31, 65, 187, 0.1)" : "transparent",
                    color: "#CCD2DD",
                    fontSize: "14px",
                    fontWeight: "400",
                    fontFamily: "Poppins",
                  }}
                  onClick={() => window.innerWidth <= 768 && onClose()}
                >
                  Registration
                </NavLink>
                {/* <NavLink
                  to="/admin/league/team-creation"
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{
                    backgroundColor: isActivePath("/admin/league/team-creation") ? "rgba(31, 65, 187, 0.1)" : "transparent",
                    color: "#CCD2DD",
                    fontSize: "14px",
                    fontWeight: "400",
                    fontFamily: "Poppins",
                  }}
                  onClick={() => window.innerWidth <= 768 && onClose()}
                >
                  Team Creation
                </NavLink> */}
                <NavLink
                  to="/admin/league/schedule"
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{
                    backgroundColor: isActivePath("/admin/league/schedule") ? "rgba(31, 65, 187, 0.1)" : "transparent",
                    color: "#CCD2DD",
                    fontSize: "14px",
                    fontWeight: "400",
                    fontFamily: "Poppins",
                  }}
                  onClick={() => window.innerWidth <= 768 && onClose()}
                >
                  Schedule
                </NavLink>
                <NavLink
                  to="/admin/league/points-table"
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{
                    backgroundColor: isActivePath("/admin/league/points-table") ? "rgba(31, 65, 187, 0.1)" : "transparent",
                    color: "#CCD2DD",
                    fontSize: "14px",
                    fontWeight: "400",
                    fontFamily: "Poppins",
                  }}
                  onClick={() => window.innerWidth <= 768 && onClose()}
                >
                  Points Table
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* Tournament with Submenu */}
        <div
          className="position-relative"
          onMouseEnter={() => isCollapsed && window.innerWidth > 768 && setHoveredItem('tournament')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div
            className={isCollapsed && window.innerWidth > 768 ? 'd-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer' : linkClasses(isTournamentActive)}
            style={{ backgroundColor: isTournamentActive ? 'rgba(31, 65, 187, 0.15)' : 'transparent', color: '#CCD2DD', fontSize: '15px', fontWeight: '500', fontFamily: 'Poppins', boxShadow: isTournamentActive ? '0 4px 12px rgba(31, 65, 187, 0.2)' : 'none', minHeight: isCollapsed && window.innerWidth > 768 ? '48px' : 'auto', width: isCollapsed && window.innerWidth > 768 ? '48px' : 'auto', cursor: 'pointer' }}
            onClick={() => !isCollapsed && setTournamentExpanded(!tournamentExpanded)}
          >
            <HiOutlineTrophy className={isCollapsed && window.innerWidth > 768 ? '' : 'me-4'} size={isCollapsed && window.innerWidth > 768 ? 18 : 20} />
            {(!isCollapsed || window.innerWidth <= 768) && (
              <><span className="flex-grow-1">Tournament</span>{tournamentExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}</>
            )}
          </div>
          {isCollapsed && window.innerWidth > 768 && hoveredItem === 'tournament' && (
            <div className="position-absolute bg-dark px-2 py-1 rounded" style={{ left: '75px', top: '50%', transform: 'translateY(-50%)', zIndex: 1200, fontSize: '15px', fontWeight: '500', fontFamily: 'Poppins', color: '#CCD2DD', whiteSpace: 'nowrap' }}>Tournament</div>
          )}
          {tournamentExpanded && (!isCollapsed || window.innerWidth <= 768) && (
            <div className="ms-4">
              <NavLink to="/admin/tournament/creation" end
                className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                style={{ backgroundColor: isActivePath('/admin/tournament/creation') ? 'rgba(31, 65, 187, 0.1)' : 'transparent', color: '#CCD2DD', fontSize: '14px', fontWeight: '400', fontFamily: 'Poppins' }}
                onClick={() => window.innerWidth <= 768 && onClose()}>
                Tournaments
              </NavLink>
              <NavLink to="/admin/tournament/team-creation"
                className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                style={{ backgroundColor: isActivePath('/admin/tournament/team-creation') ? 'rgba(31, 65, 187, 0.1)' : 'transparent', color: '#CCD2DD', fontSize: '14px', fontWeight: '400', fontFamily: 'Poppins' }}
                onClick={() => window.innerWidth <= 768 && onClose()}>
                Team Creation
              </NavLink>
              <NavLink to="/admin/tournament/schedule"
                className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                style={{ backgroundColor: isActivePath('/admin/tournament/schedule') ? 'rgba(31, 65, 187, 0.1)' : 'transparent', color: '#CCD2DD', fontSize: '14px', fontWeight: '400', fontFamily: 'Poppins' }}
                onClick={() => window.innerWidth <= 768 && onClose()}>
                Schedule
              </NavLink>
            </div>
          )}
        </div>

        {/* Wallet */}
        {!isSubAdmin && (
          <div
            className="position-relative"
            onMouseEnter={() =>
              isCollapsed && window.innerWidth > 768 && setHoveredItem("wallet")
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to="/admin/wallet"
              end
              className={
                isCollapsed && window.innerWidth > 768
                  ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                  : linkClasses(isActivePath("/admin/wallet"))
              }
              style={() => ({
                backgroundColor: isActivePath("/admin/wallet") ? "rgba(31, 65, 187, 0.15)" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isActivePath("/admin/wallet") ? "0 4px 12px rgba(31, 65, 187, 0.2)" : "none",
                minHeight: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
                width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              })}
              onClick={() => window.innerWidth <= 768 && onClose()}
            >
              <RiWalletLine
                className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
                size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
              />
              {(!isCollapsed || window.innerWidth <= 768) && "Wallet"}
            </NavLink>
            {isCollapsed && window.innerWidth > 768 && hoveredItem === "wallet" && (
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
                Wallet
              </div>
            )}
          </div>
        )}

        {/* App Users */}
        {!isSubAdmin && (
          <div
            className="position-relative"
            onMouseEnter={() =>
              isCollapsed && window.innerWidth > 768 && setHoveredItem("appUsers")
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to="/admin/app-users"
              end
              className={
                isCollapsed && window.innerWidth > 768
                  ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                  : linkClasses(isActivePath("/admin/app-users"))
              }
              style={() => ({
                backgroundColor: isActivePath("/admin/app-users") ? "rgba(31, 65, 187, 0.15)" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isActivePath("/admin/app-users") ? "0 4px 12px rgba(31, 65, 187, 0.2)" : "none",
                minHeight: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
                width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              })}
              onClick={() => window.innerWidth <= 768 && onClose()}
            >
              <FaUsers
                className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
                size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
              />
              {(!isCollapsed || window.innerWidth <= 768) && "App Users"}
            </NavLink>
            {isCollapsed && window.innerWidth > 768 && hoveredItem === "appUsers" && (
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
                App Users
              </div>
            )}
          </div>
        )}
        {/* Notifications */}
        {!isSubAdmin && (
          <div
            className="position-relative"
            onMouseEnter={() =>
              isCollapsed && window.innerWidth > 768 && setHoveredItem("notifications")
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to="/admin/notifications"
              end
              className={
                isCollapsed && window.innerWidth > 768
                  ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                  : linkClasses(isActivePath("/admin/notifications"))
              }
              style={() => ({
                backgroundColor: isActivePath("/admin/notifications") ? "rgba(31, 65, 187, 0.15)" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isActivePath("/admin/notifications") ? "0 4px 12px rgba(31, 65, 187, 0.2)" : "none",
                minHeight: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
                width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              })}
              onClick={() => window.innerWidth <= 768 && onClose()}
            >
              <MdNotificationsActive
                className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
                size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
              />
              {(!isCollapsed || window.innerWidth <= 768) && "Notifications"}
            </NavLink>
            {isCollapsed && window.innerWidth > 768 && hoveredItem === "notifications" && (
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
                Notifications
              </div>
            )}
          </div>
        )}
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
            end
            className={
              isCollapsed && window.innerWidth > 768
                ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                : linkClasses(isActivePath("/admin/profile"))
            }
            style={() => ({
              backgroundColor: isActivePath("/admin/profile") ? "rgba(31, 65, 187, 0.15)" : "transparent",
              color: "#CCD2DD",
              fontSize: "15px",
              fontWeight: "500",
              fontFamily: "Poppins",
              boxShadow: isActivePath("/admin/profile") ? "0 4px 12px rgba(31, 65, 187, 0.2)" : "none",
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
        {/* Version */}
        {!isSubAdmin && (
          <div
            className="position-relative"
            onMouseEnter={() =>
              isCollapsed && window.innerWidth > 768 && setHoveredItem("appVersion")
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to="/admin/app-version"
              end
              className={
                isCollapsed && window.innerWidth > 768
                  ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                  : linkClasses(isActivePath("/admin/app-version"))
              }
              style={() => ({
                backgroundColor: isActivePath("/admin/app-version") ? "rgba(31, 65, 187, 0.15)" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isActivePath("/admin/app-version") ? "0 4px 12px rgba(31, 65, 187, 0.2)" : "none",
                minHeight: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
                width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              })}
              onClick={() => window.innerWidth <= 768 && onClose()}
            >
              <GoVersions
                className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"}
                size={isCollapsed && window.innerWidth > 768 ? 18 : 20}
              />
              {(!isCollapsed || window.innerWidth <= 768) && "Version"}
            </NavLink>
            {isCollapsed && window.innerWidth > 768 && hoveredItem === "appVersion" && (
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
                Version
              </div>
            )}
          </div>
        )}

        {/* XP Settings */}
        {!isSubAdmin && (
          <div
            className="position-relative"
            onMouseEnter={() => isCollapsed && window.innerWidth > 768 && setHoveredItem("xpSettings")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to="/admin/settings/xp"
              end
              className={
                isCollapsed && window.innerWidth > 768
                  ? "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer"
                  : linkClasses(isActivePath("/admin/settings/xp"))
              }
              style={() => ({
                backgroundColor: isActivePath("/admin/settings/xp") ? "rgba(31, 65, 187, 0.15)" : "transparent",
                color: "#CCD2DD",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "Poppins",
                boxShadow: isActivePath("/admin/settings/xp") ? "0 4px 12px rgba(31, 65, 187, 0.2)" : "none",
                minHeight: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
                width: isCollapsed && window.innerWidth > 768 ? "48px" : "auto",
              })}
              onClick={() => window.innerWidth <= 768 && onClose()}
            >
              <span className={isCollapsed && window.innerWidth > 768 ? "" : "me-4"} style={{ fontSize: isCollapsed && window.innerWidth > 768 ? 18 : 20 }}>⚙️</span>
              {(!isCollapsed || window.innerWidth <= 768) && "XP Settings"}
            </NavLink>
            {isCollapsed && window.innerWidth > 768 && hoveredItem === "xpSettings" && (
              <div className="position-absolute bg-dark px-2 py-1 rounded"
                style={{ left: "75px", top: "50%", transform: "translateY(-50%)", zIndex: 1200, fontSize: "15px", fontWeight: "500", fontFamily: "Poppins", color: "#CCD2DD", whiteSpace: "nowrap" }}>
                XP Settings
              </div>
            )}
          </div>
        )}

      </nav>
    </aside>
  );
};

export default AdminSidebar;