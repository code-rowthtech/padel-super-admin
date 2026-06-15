import React, { useState, useEffect, useRef } from "react";
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
  FaClipboardList,
} from "react-icons/fa";
import { MdNotificationsActive } from "react-icons/md";
import { HiOutlineTrophy } from "react-icons/hi2";
import { GoVersions } from "react-icons/go";
import { useDispatch } from "react-redux";
import { RiWallet3Line } from "react-icons/ri";
import { getOwnerFromSession, ownerApi } from "../../../helpers/api/apiCore";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { useSuperAdminContext } from "../../../contexts/SuperAdminContext";
import { SUPER_ADMIN_GET_ALL_OWNERS } from "../../../helpers/api/apiEndpoint";
import { Form } from "react-bootstrap";
import BallLogo from '../../../assets/images/BallLogo.png';

const flyoutStyle = (top) => ({
  position: "fixed",
  left: "70px",
  top,
  zIndex: 9999,
  minWidth: "170px",
  backgroundColor: "#1C2434",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "6px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
  padding: "6px 0",
});

const flyoutLinkStyle = {
  display: "flex",
  alignItems: "center",
  padding: "8px 16px",
  color: "#CCD2DD",
  fontSize: "14px",
  fontFamily: "Poppins",
  textDecoration: "none",
  cursor: "pointer",
};

const useAnchorTop = (anchorRef, visible) => {
  const [top, setTop] = useState(0);
  useEffect(() => {
    if (visible && anchorRef.current) {
      setTop(anchorRef.current.getBoundingClientRect().top);
    }
  }, [visible, anchorRef]);
  return top;
};

const SimpleTooltip = ({ label, anchorRef, visible }) => {
  const top = useAnchorTop(anchorRef, visible);
  if (!visible) return null;
  return (
    <div style={{ ...flyoutStyle(top), padding: "8px 14px", whiteSpace: "nowrap", minWidth: "unset" }}>
      <span style={{ color: "#CCD2DD", fontSize: "14px", fontFamily: "Poppins", fontWeight: 500 }}>{label}</span>
    </div>
  );
};

const FlyoutMenu = ({ label, children, anchorRef, visible }) => {
  const top = useAnchorTop(anchorRef, visible);
  if (!visible) return null;
  return (
    <div style={flyoutStyle(top)}>
      <div style={{ padding: "4px 16px 6px", color: "#8A99AF", fontSize: "11px", fontWeight: 600, fontFamily: "Poppins", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </div>
      {children}
    </div>
  );
};

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
  const [paymentsExpanded, setPaymentsExpanded] = useState(false);
  const [bookingsExpanded, setBookingsExpanded] = useState(false);

  const paymentsRef = useRef(null);
  const leagueRef = useRef(null);
  const tournamentRef = useRef(null);
  const americanoRef = useRef(null);
  const dashboardRef = useRef(null);
  const bookingsRef = useRef(null);
  const ownersRef = useRef(null);
  const appUsersRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const versionRef = useRef(null);
  const xpRef = useRef(null);
  const playerPrefsRef = useRef(null);

  const isBookingsActive = location.pathname.startsWith('/admin/booking') || location.pathname.startsWith('/admin/schedules');
  const isTournamentActive = location.pathname.startsWith('/admin/tournament') || location.pathname.startsWith('/admin/new-tournament') || location.pathname.startsWith('/admin/tournament/schedule');
  const isPaymentsActive = location.pathname.startsWith('/admin/payments') || location.pathname === '/admin/wallet' || location.pathname === '/admin/all-transactions';
  const isLeagueActive = location.pathname.startsWith('/admin/league') || location.pathname.startsWith('/admin/new-league') || location.pathname.startsWith('/admin/view-league-schedule');

  useEffect(() => { if (isTournamentActive) setTournamentExpanded(true); }, [isTournamentActive]);
  useEffect(() => { if (isPaymentsActive) setPaymentsExpanded(true); }, [isPaymentsActive]);
  useEffect(() => { if (isLeagueActive) setLeagueExpanded(true); }, [isLeagueActive]);
  useEffect(() => { if (isBookingsActive) setBookingsExpanded(true); }, [isBookingsActive]);

  useEffect(() => {
    if (isSuperAdmin) fetchOwners();
  }, [isSuperAdmin]);

  const fetchOwners = async () => {
    try {
      setLoadingOwners(true);
      const response = await ownerApi.get(SUPER_ADMIN_GET_ALL_OWNERS);
      setOwners(response.data?.data?.owners || []);
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

  const linkClasses = (active) =>
    `d-flex align-items-center px-4 py-2 my-1 text-decoration-none mx-3 rounded-2 cursor-pointer ${active ? "active-parent-link" : "bg-transparent"}`;

  const collapsedIconClass = "d-flex align-items-center justify-content-center py-3 my-1 text-decoration-none mx-2 rounded-2 cursor-pointer";

  const iconStyle = (isActive) => ({
    backgroundColor: isActive ? "rgba(31, 65, 187, 0.15)" : "transparent",
    color: "#CCD2DD",
    fontSize: "15px",
    fontWeight: "500",
    fontFamily: "Poppins",
    boxShadow: isActive ? "0 4px 12px rgba(31, 65, 187, 0.2)" : "none",
    minHeight: isCollapsed ? "48px" : "auto",
    width: isCollapsed ? "48px" : "auto",
    cursor: "pointer",
  });

  const closeFlyout = () => setHoveredItem(null);

  const isDesktopCollapsed = isCollapsed && window.innerWidth > 768;

  return (
    <aside
      className={`admin-sidebar text-white vh-100 d-flex flex-column ${isOpen ? "mobile-open" : ""} ${isCollapsed ? "collapsed" : ""}`}
      style={{ width: isCollapsed ? "70px" : "250px", backgroundColor: "#1C2434" }}
    >
      {/* Logo */}
      <div
        className="d-flex align-items-center justify-content-center mb-4 pb-3 border-bottom"
        style={{ marginTop: "20px", cursor: 'pointer', borderColor: 'rgba(255,255,255,0.1)' }}
        onClick={() => navigate(isSubAdmin ? '/admin/tournament/creation' : '/admin/dashboard')}
      >
        <img src={BallLogo} alt="Swoot App" className="rounded-circle" style={{ width: isCollapsed ? 35 : 75, height: isCollapsed ? 35 : 75 }} />
      </div>

      {/* Super Admin Badge */}
      {isSuperAdmin && !isCollapsed && (
        <div className="px-3 mb-3">
          <div className="text-white p-2 rounded text-center small fw-bold" onClick={() => navigate('/admin/dashboard')}
            style={{ cursor: 'pointer', background: 'rgb(31, 65, 187)', boxShadow: '0 2px 8px rgba(31, 65, 187, 0.3)' }}>
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
            <Form.Select value={selectedOwnerId || 'all'} onChange={handleOwnerChange} size="sm"
              style={{ backgroundColor: "#2D3748", color: "#CCD2DD", border: "1px solid #4A5568", fontSize: "13px" }}>
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
        {!isCollapsed && <p className="px-4 py-0 mb-1" style={{ color: "#8A99AF" }}>MENU</p>}

        {/* Dashboard */}
        {!isSubAdmin && (
          <div className="position-relative" ref={dashboardRef}
            onMouseEnter={() => isDesktopCollapsed && setHoveredItem("dashboard")}
            onMouseLeave={() => setHoveredItem(null)}>
            <NavLink to="/admin/dashboard" end
              className={isDesktopCollapsed ? collapsedIconClass : linkClasses(isActivePath("/admin/dashboard"))}
              style={() => iconStyle(isActivePath("/admin/dashboard"))}
              onClick={() => window.innerWidth <= 768 && onClose()}>
              <FaTachometerAlt className={isDesktopCollapsed ? "" : "me-4"} size={isDesktopCollapsed ? 18 : 20} />
              {!isDesktopCollapsed && "Dashboard"}
            </NavLink>
            <SimpleTooltip label="Dashboard" anchorRef={dashboardRef} visible={isDesktopCollapsed && hoveredItem === "dashboard"} />
          </div>
        )}

        {/* Bookings */}
        {!isSubAdmin && (
          <div className="position-relative" ref={bookingsRef}
            onMouseEnter={() => isDesktopCollapsed && setHoveredItem("bookings")}
            onMouseLeave={(e) => { if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) setHoveredItem(null); }}>
            <div
              className={isDesktopCollapsed ? collapsedIconClass : linkClasses(isBookingsActive)}
              style={iconStyle(isBookingsActive)}
              onClick={() => { if (isDesktopCollapsed) { navigate('/admin/booking'); } else { setBookingsExpanded(!bookingsExpanded); } }}>
              <FaCalendarAlt className={isDesktopCollapsed ? "" : "me-4"} size={isDesktopCollapsed ? 18 : 20} />
              {!isDesktopCollapsed && (
                <><span className="flex-grow-1">Bookings</span>{bookingsExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}</>
              )}
            </div>
            <FlyoutMenu label="Bookings" anchorRef={bookingsRef} visible={isDesktopCollapsed && hoveredItem === "bookings"}>
              <NavLink to="/admin/booking" style={flyoutLinkStyle} onClick={closeFlyout}>Bookings</NavLink>
              <NavLink to="/admin/schedules" style={flyoutLinkStyle} onClick={closeFlyout}>Schedules</NavLink>
            </FlyoutMenu>
            {bookingsExpanded && !isDesktopCollapsed && (
              <div className="ms-4">
                <NavLink to="/admin/booking"
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{ backgroundColor: isActivePath("/admin/booking") ? "rgba(31, 65, 187, 0.1)" : "transparent", color: "#CCD2DD", fontSize: "14px", fontFamily: "Poppins" }}
                  onClick={() => window.innerWidth <= 768 && onClose()}>Bookings</NavLink>
                <NavLink to="/admin/schedules"
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{ backgroundColor: isActivePath("/admin/schedules") ? "rgba(31, 65, 187, 0.1)" : "transparent", color: "#CCD2DD", fontSize: "14px", fontFamily: "Poppins" }}
                  onClick={() => window.innerWidth <= 768 && onClose()}>Schedules</NavLink>
              </div>
            )}
          </div>
        )}

        {/* Owners */}
        {isSuperAdmin && !isSubAdmin && (
          <div className="position-relative" ref={ownersRef}
            onMouseEnter={() => isDesktopCollapsed && setHoveredItem("owners")}
            onMouseLeave={() => setHoveredItem(null)}>
            <NavLink to="/admin/owners" end
              className={isDesktopCollapsed ? collapsedIconClass : linkClasses(isActivePath("/admin/owners"))}
              style={() => iconStyle(isActivePath("/admin/owners"))}
              onClick={() => window.innerWidth <= 768 && onClose()}>
              <FaUsersCog className={isDesktopCollapsed ? "" : "me-4"} size={isDesktopCollapsed ? 18 : 20} />
              {!isDesktopCollapsed && "Owners"}
            </NavLink>
            <SimpleTooltip label="Owners" anchorRef={ownersRef} visible={isDesktopCollapsed && hoveredItem === "owners"} />
          </div>
        )}

        {/* Payments */}
        {!isSubAdmin && (
          <div className="position-relative"
            ref={paymentsRef}
            onMouseEnter={() => isDesktopCollapsed && setHoveredItem("payments")}
            onMouseLeave={(e) => { if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) setHoveredItem(null); }}>
            <div
              className={isDesktopCollapsed ? collapsedIconClass : linkClasses(isPaymentsActive)}
              style={iconStyle(isPaymentsActive)}
              onClick={() => { if (isDesktopCollapsed) { navigate('/admin/all-transactions'); } else { setPaymentsExpanded(!paymentsExpanded); } }}>
              <RiWallet3Line className={isDesktopCollapsed ? "" : "me-4"} size={isDesktopCollapsed ? 18 : 20} />
              {!isDesktopCollapsed && (
                <><span className="flex-grow-1">Payments</span>{paymentsExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}</>
              )}
            </div>
            <FlyoutMenu label="Payments" anchorRef={paymentsRef} visible={isDesktopCollapsed && hoveredItem === "payments"}>
              <NavLink to="/admin/all-transactions" style={flyoutLinkStyle} onClick={closeFlyout}>All</NavLink>
              <NavLink to="/admin/payments?status=unpaid" style={flyoutLinkStyle} onClick={closeFlyout}>Unpaid</NavLink>
              <NavLink to="/admin/payments?status=paid" style={flyoutLinkStyle} onClick={closeFlyout}>Paid</NavLink>
              <NavLink to="/admin/wallet" style={flyoutLinkStyle} onClick={closeFlyout}>Wallet</NavLink>
            </FlyoutMenu>
            {paymentsExpanded && !isDesktopCollapsed && (
              <div className="ms-4">
                <NavLink to="/admin/all-transactions"
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{ backgroundColor: isActivePath("/admin/all-transactions") ? "rgba(31, 65, 187, 0.1)" : "transparent", color: "#CCD2DD", fontSize: "14px", fontFamily: "Poppins" }}
                  onClick={() => window.innerWidth <= 768 && onClose()}>All</NavLink>
                <NavLink to="/admin/payments?status=unpaid"
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{ backgroundColor: location.search === '?status=unpaid' ? "rgba(31, 65, 187, 0.1)" : "transparent", color: "#CCD2DD", fontSize: "14px", fontFamily: "Poppins" }}
                  onClick={() => window.innerWidth <= 768 && onClose()}>Unpaid</NavLink>
                <NavLink to="/admin/payments?status=paid"
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{ backgroundColor: location.search === '?status=paid' ? "rgba(31, 65, 187, 0.1)" : "transparent", color: "#CCD2DD", fontSize: "14px", fontFamily: "Poppins" }}
                  onClick={() => window.innerWidth <= 768 && onClose()}>Paid</NavLink>
                <NavLink to="/admin/wallet"
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{ backgroundColor: isActivePath("/admin/wallet") ? "rgba(31, 65, 187, 0.1)" : "transparent", color: "#CCD2DD", fontSize: "14px", fontFamily: "Poppins" }}
                  onClick={() => window.innerWidth <= 768 && onClose()}>Wallet</NavLink>
              </div>
            )}
          </div>
        )}

        {/* League */}
        {!isSubAdmin && (
          <div className="position-relative"
            ref={leagueRef}
            onMouseEnter={() => isDesktopCollapsed && setHoveredItem("league")}
            onMouseLeave={(e) => { if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) setHoveredItem(null); }}>
            <div
              className={isDesktopCollapsed ? collapsedIconClass : linkClasses(isLeagueActive)}
              style={iconStyle(isLeagueActive)}
              onClick={() => { if (isDesktopCollapsed) { navigate('/admin/league/creation'); } else { setLeagueExpanded(!leagueExpanded); } }}>
              <FaTrophy className={isDesktopCollapsed ? "" : "me-4"} size={isDesktopCollapsed ? 18 : 20} />
              {!isDesktopCollapsed && (
                <><span className="flex-grow-1">League</span>{leagueExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}</>
              )}
            </div>
            <FlyoutMenu label="League" anchorRef={leagueRef} visible={isDesktopCollapsed && hoveredItem === "league"}>
              <NavLink to="/admin/league/creation" style={flyoutLinkStyle} onClick={closeFlyout}>League</NavLink>
              <NavLink to="/admin/league/registration" style={flyoutLinkStyle} onClick={closeFlyout}>Registration</NavLink>
              <NavLink to="/admin/league/schedule" style={flyoutLinkStyle} onClick={closeFlyout}>Schedule</NavLink>
              <NavLink to="/admin/league/points-table" style={flyoutLinkStyle} onClick={closeFlyout}>Points Table</NavLink>
            </FlyoutMenu>
            {leagueExpanded && !isDesktopCollapsed && (
              <div className="ms-4">
                <NavLink to="/admin/league/creation" end
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{ backgroundColor: (isActivePath("/admin/league/creation") || location.pathname.startsWith('/admin/new-league')) ? "rgba(31, 65, 187, 0.1)" : "transparent", color: "#CCD2DD", fontSize: "14px", fontFamily: "Poppins" }}
                  onClick={() => window.innerWidth <= 768 && onClose()}>League</NavLink>
                <NavLink to="/admin/league/registration"
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{ backgroundColor: isActivePath("/admin/league/registration") ? "rgba(31, 65, 187, 0.1)" : "transparent", color: "#CCD2DD", fontSize: "14px", fontFamily: "Poppins" }}
                  onClick={() => window.innerWidth <= 768 && onClose()}>Registration</NavLink>
                <NavLink to="/admin/league/schedule"
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{ backgroundColor: isActivePath("/admin/league/schedule") ? "rgba(31, 65, 187, 0.1)" : "transparent", color: "#CCD2DD", fontSize: "14px", fontFamily: "Poppins" }}
                  onClick={() => window.innerWidth <= 768 && onClose()}>Schedule</NavLink>
                <NavLink to="/admin/league/points-table"
                  className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                  style={{ backgroundColor: isActivePath("/admin/league/points-table") ? "rgba(31, 65, 187, 0.1)" : "transparent", color: "#CCD2DD", fontSize: "14px", fontFamily: "Poppins" }}
                  onClick={() => window.innerWidth <= 768 && onClose()}>Points Table</NavLink>
              </div>
            )}
          </div>
        )}

        {/* Tournament */}
        <div className="position-relative"
          ref={tournamentRef}
          onMouseEnter={() => isDesktopCollapsed && setHoveredItem("tournament")}
          onMouseLeave={(e) => { if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) setHoveredItem(null); }}>
          <div
            className={isDesktopCollapsed ? collapsedIconClass : linkClasses(isTournamentActive)}
            style={iconStyle(isTournamentActive)}
            onClick={() => { if (isDesktopCollapsed) { navigate('/admin/tournament/creation'); } else { setTournamentExpanded(!tournamentExpanded); } }}>
            <HiOutlineTrophy className={isDesktopCollapsed ? "" : "me-4"} size={isDesktopCollapsed ? 18 : 20} />
            {!isDesktopCollapsed && (
              <><span className="flex-grow-1">Tournament</span>{tournamentExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}</>
            )}
          </div>
          <FlyoutMenu label="Tournament" anchorRef={tournamentRef} visible={isDesktopCollapsed && hoveredItem === "tournament"}>
            <NavLink to="/admin/tournament/creation" style={flyoutLinkStyle} onClick={closeFlyout}>Tournaments</NavLink>
            <NavLink to="/admin/tournament/team-creation" style={flyoutLinkStyle} onClick={closeFlyout}>Team Creation</NavLink>
            <NavLink to="/admin/tournament/schedule" style={flyoutLinkStyle} onClick={closeFlyout}>Schedule</NavLink>
          </FlyoutMenu>
          {tournamentExpanded && !isDesktopCollapsed && (
            <div className="ms-4">
              <NavLink to="/admin/tournament/creation" end
                className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                style={{ backgroundColor: isActivePath('/admin/tournament/creation') ? 'rgba(31, 65, 187, 0.1)' : 'transparent', color: '#CCD2DD', fontSize: '14px', fontFamily: 'Poppins' }}
                onClick={() => window.innerWidth <= 768 && onClose()}>Tournaments</NavLink>
              <NavLink to="/admin/tournament/team-creation"
                className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                style={{ backgroundColor: isActivePath('/admin/tournament/team-creation') ? 'rgba(31, 65, 187, 0.1)' : 'transparent', color: '#CCD2DD', fontSize: '14px', fontFamily: 'Poppins' }}
                onClick={() => window.innerWidth <= 768 && onClose()}>Team Creation</NavLink>
              <NavLink to="/admin/tournament/schedule"
                className="d-flex align-items-center px-4 py-2 my-1 text-decoration-none rounded-2"
                style={{ backgroundColor: isActivePath('/admin/tournament/schedule') ? 'rgba(31, 65, 187, 0.1)' : 'transparent', color: '#CCD2DD', fontSize: '14px', fontFamily: 'Poppins' }}
                onClick={() => window.innerWidth <= 768 && onClose()}>Schedule</NavLink>
            </div>
          )}
        </div>

        {/* Americano */}
        {isSuperAdmin && (
          <div className="position-relative" ref={americanoRef}
            onMouseEnter={() => isDesktopCollapsed && setHoveredItem("americano")}
            onMouseLeave={() => setHoveredItem(null)}>
            <NavLink to="/admin/americano" end
              className={isDesktopCollapsed ? collapsedIconClass : linkClasses(isActivePath("/admin/americano"))}
              style={() => iconStyle(isActivePath("/admin/americano"))}
              onClick={() => window.innerWidth <= 768 && onClose()}>
              <FaTrophy className={isDesktopCollapsed ? "" : "me-4"} size={isDesktopCollapsed ? 18 : 20} />
              {!isDesktopCollapsed && "Americano"}
            </NavLink>
            <SimpleTooltip label="Americano" anchorRef={americanoRef} visible={isDesktopCollapsed && hoveredItem === "americano"} />
          </div>
        )}

        {/* App Users */}
        {!isSubAdmin && (
          <div className="position-relative" ref={appUsersRef}
            onMouseEnter={() => isDesktopCollapsed && setHoveredItem("appUsers")}
            onMouseLeave={() => setHoveredItem(null)}>
            <NavLink to="/admin/app-users" end
              className={isDesktopCollapsed ? collapsedIconClass : linkClasses(isActivePath("/admin/app-users"))}
              style={() => iconStyle(isActivePath("/admin/app-users"))}
              onClick={() => window.innerWidth <= 768 && onClose()}>
              <FaUsers className={isDesktopCollapsed ? "" : "me-4"} size={isDesktopCollapsed ? 18 : 20} />
              {!isDesktopCollapsed && "App Users"}
            </NavLink>
            <SimpleTooltip label="App Users" anchorRef={appUsersRef} visible={isDesktopCollapsed && hoveredItem === "appUsers"} />
          </div>
        )}

        {/* Player Preferences */}
        {isSuperAdmin && !isSubAdmin && (
          <div className="position-relative" ref={playerPrefsRef}
            onMouseEnter={() => isDesktopCollapsed && setHoveredItem("playerPrefs")}
            onMouseLeave={() => setHoveredItem(null)}>
            <NavLink to="/admin/player-preferences" end
              className={isDesktopCollapsed ? collapsedIconClass : linkClasses(isActivePath("/admin/player-preferences"))}
              style={() => iconStyle(isActivePath("/admin/player-preferences"))}
              onClick={() => window.innerWidth <= 768 && onClose()}>
              <FaClipboardList className={isDesktopCollapsed ? "" : "me-4"} size={isDesktopCollapsed ? 18 : 20} />
              {!isDesktopCollapsed && "Player Preferences"}
            </NavLink>
            <SimpleTooltip label="Player Preferences" anchorRef={playerPrefsRef} visible={isDesktopCollapsed && hoveredItem === "playerPrefs"} />
          </div>
        )}

        {/* Notifications */}
        {!isSubAdmin && (
          <div className="position-relative" ref={notificationsRef}
            onMouseEnter={() => isDesktopCollapsed && setHoveredItem("notifications")}
            onMouseLeave={() => setHoveredItem(null)}>
            <NavLink to="/admin/notifications" end
              className={isDesktopCollapsed ? collapsedIconClass : linkClasses(isActivePath("/admin/notifications"))}
              style={() => iconStyle(isActivePath("/admin/notifications"))}
              onClick={() => window.innerWidth <= 768 && onClose()}>
              <MdNotificationsActive className={isDesktopCollapsed ? "" : "me-4"} size={isDesktopCollapsed ? 18 : 20} />
              {!isDesktopCollapsed && "Notifications"}
            </NavLink>
            <SimpleTooltip label="Notifications" anchorRef={notificationsRef} visible={isDesktopCollapsed && hoveredItem === "notifications"} />
          </div>
        )}

        {/* Profile */}
        <div className="position-relative" ref={profileRef}
          onMouseEnter={() => isDesktopCollapsed && setHoveredItem("profile")}
          onMouseLeave={() => setHoveredItem(null)}>
          <NavLink to="/admin/profile" end
            className={isDesktopCollapsed ? collapsedIconClass : linkClasses(isActivePath("/admin/profile"))}
            style={() => iconStyle(isActivePath("/admin/profile"))}
            onClick={() => window.innerWidth <= 768 && onClose()}>
            <FaUser className={isDesktopCollapsed ? "" : "me-4"} size={isDesktopCollapsed ? 18 : 20} />
            {!isDesktopCollapsed && "Profile"}
          </NavLink>
          <SimpleTooltip label="Profile" anchorRef={profileRef} visible={isDesktopCollapsed && hoveredItem === "profile"} />
        </div>

        {/* Version */}
        {!isSubAdmin && (
          <div className="position-relative" ref={versionRef}
            onMouseEnter={() => isDesktopCollapsed && setHoveredItem("appVersion")}
            onMouseLeave={() => setHoveredItem(null)}>
            <NavLink to="/admin/app-version" end
              className={isDesktopCollapsed ? collapsedIconClass : linkClasses(isActivePath("/admin/app-version"))}
              style={() => iconStyle(isActivePath("/admin/app-version"))}
              onClick={() => window.innerWidth <= 768 && onClose()}>
              <GoVersions className={isDesktopCollapsed ? "" : "me-4"} size={isDesktopCollapsed ? 18 : 20} />
              {!isDesktopCollapsed && "Version"}
            </NavLink>
            <SimpleTooltip label="Version" anchorRef={versionRef} visible={isDesktopCollapsed && hoveredItem === "appVersion"} />
          </div>
        )}

        {/* XP Settings */}
        {!isSubAdmin && (
          <div className="position-relative" ref={xpRef}
            onMouseEnter={() => isDesktopCollapsed && setHoveredItem("xpSettings")}
            onMouseLeave={() => setHoveredItem(null)}>
            <NavLink to="/admin/settings/xp" end
              className={isDesktopCollapsed ? collapsedIconClass : linkClasses(isActivePath("/admin/settings/xp"))}
              style={() => iconStyle(isActivePath("/admin/settings/xp"))}
              onClick={() => window.innerWidth <= 768 && onClose()}>
              <span className={isDesktopCollapsed ? "" : "me-4"} style={{ fontSize: isDesktopCollapsed ? 18 : 20 }}>⚙️</span>
              {!isDesktopCollapsed && "XP Settings"}
            </NavLink>
            <SimpleTooltip label="XP Settings" anchorRef={xpRef} visible={isDesktopCollapsed && hoveredItem === "xpSettings"} />
          </div>
        )}

      </nav>
    </aside>
  );
};

export default AdminSidebar;
