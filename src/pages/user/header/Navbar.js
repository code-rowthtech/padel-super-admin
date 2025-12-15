import { logo } from '../../../assets/files';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Dropdown, OverlayTrigger, Tooltip, Offcanvas } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp, FaHeadphones, FaRegUserCircle, FaBars, FaBell, FaTimes } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../../redux/user/auth/authSlice';
import { IoTennisballOutline } from 'react-icons/io5';
import { Avatar } from '@mui/material';
import { getUserFromSession, isUserAuthenticated } from '../../../helpers/api/apiCore';
import { MdOutlineDateRange, MdSportsTennis } from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp, IoIosLogOut } from 'react-icons/io';
import { PiRanking } from "react-icons/pi";
import { getUserProfile } from '../../../redux/user/auth/authThunk';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { io } from 'socket.io-client';
import config from '../../../config';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ButtonLoading, DataLoading } from '../../../helpers/loading/Loaders';
import updateLocale from "dayjs/plugin/updateLocale";
import { getNotificationCount, getNotificationData, getNotificationView, readAllNotification } from '../../../redux/user/notifiction/thunk';
import { clearall } from '../../../assets/files'
import { getUserClub } from '../../../redux/thunks';
const SOCKET_URL = config.API_URL;
const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [openNoteId, setOpenNoteId] = useState(null);
    const [userData, setUserData] = useState(null);
    const store = useSelector((state) => state?.userAuth);

    const User = useSelector((state) => state?.userAuth)
    const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0]) || [];

    const notificationData = useSelector((state) => state.notificationData?.getNotificationData);
    const notificationLoading = useSelector((state) => state.notificationData?.getCountLoading);
    let token = isUserAuthenticated()
    const logo = clubData?.logo;
    const { user, } = useSelector((state) => state?.userAuth);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const mobileDropdownRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const userId = getUserFromSession()?._id;
    const [notificationCount, setNotificationCount] = useState();
    dayjs.extend(relativeTime);
    dayjs.extend(updateLocale);

    dayjs.updateLocale("en", {
        relativeTime: {
            future: "in %s",
            past: "%s ago",
            s: "a few seconds",
            m: "1 minute",
            mm: "%d minutes",
            h: "1 hour",
            hh: "%d hours",
            d: "1 day",
            dd: "%d days",
            M: "1 month",
            MM: "%d months",
            y: "1 year",
            yy: "%d years",
        },
    });
    useEffect(() => {
        if (userId) {


            const socket = io(SOCKET_URL, { transports: ["websocket"] });

            dispatch(getNotificationData()).unwrap().then((res) => {
                if (res?.notifications) {
                    setNotifications(res.notifications);
                }
            });
            dispatch(getNotificationCount()).unwrap().then((res) => {
                if (res?.notifications) {
                    setNotificationCount(res);
                }
            });
            socket.on("connect", () => {
                socket.emit("registerUser", userId);
            });



            socket.on("user_request", (data) => {
                setNotifications((prevNotifications) => [data, ...prevNotifications]);
            });

            socket.on("userNotificationCountUpdate", (data) => {
                console.log(data, 'pankaj1');
                setNotificationCount(data);
            });
            socket.on('matchNotification', (notification) => {
                console.log(notification, 'pankaj2');
                setNotifications((prevNotifications) => [notification, ...prevNotifications]);

            })

            socket.on("approved_request", (data) => {
                console.log(data, 'datahdata');
                setNotifications((prevNotifications) => [data, ...prevNotifications]);
            });

            socket.on("userNotificationCountUpdate", (data) => {
                console.log(data, 'pankaj3');

                setNotificationCount(data);
            });


            return () => socket.disconnect();
        }
    }, [userId, dispatch, open, SOCKET_URL]);

    useEffect(() => {
        if (store?.user?.status === '200' && store?.user?.response?.user) {
            setUserData(store.user.response.user);
        } else {
            const userLocal = localStorage.getItem('padel_user');
            if (userLocal) {
                try {
                    const parsedData = JSON.parse(userLocal);
                    setUserData(parsedData);
                } catch (error) {
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }
        }



        const updateUserData = () => {
            const userLocal = localStorage.getItem('padel_user');
            if (userLocal) {
                try {
                    const parsedData = JSON.parse(userLocal);
                    setUserData(parsedData);
                } catch (error) {
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }
        };

        window.addEventListener('storage', updateUserData);

        return () => {
            window.removeEventListener('storage', updateUserData);
        };
    }, [store?.user?.status, store?.user?.response?.user,]);
    const updateName = JSON.parse(localStorage.getItem("updateprofile"));
    const initialFormData = {
        fullName: user?.response?.name || updateName?.fullName || User?.name || "",
        phone: user?.response?.phoneNumber || updateName?.phone || User?.phoneNumber || "",
        profileImage: updateName?.profile || user?.response?.profilePic || store?.userSignUp?.response?.profilePic || User?.profilePic,
    };

    useEffect(() => {
        if (User?.token || token) {
            dispatch(getUserProfile());
        }
    }, [User?.token, token, dispatch])

    useEffect(() => {
        dispatch(getUserClub({ search: "" }));
    }, [dispatch]);

    useEffect(() => {
        if (clubData && clubData._id) {
            localStorage.setItem("register_club_id", clubData._id);
            localStorage.setItem("owner_id", clubData?.ownerId?._id);
        }
    }, [clubData]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            // Only close on desktop, not mobile
            if (window.innerWidth >= 992 && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleViewNotification = (note) => {
        console.log({ note });
        const socket = io(SOCKET_URL, { transports: ["websocket"] });

        dispatch(getNotificationView({ noteId: note._id })).unwrap()
            .then(() => {
                if (note?.notificationType === 'match_message' || note?.notificationType === "match_request_accept" || note?.notificationType === "match_request_reject" || note?.notificationType === 'join_match_request' && note?.matchId) {
                    const matchDate = note?.matchCreateDate || note?.createdAt || new Date().toISOString();
                    const dateObj = new Date(matchDate);
                    navigate('/open-matches', {
                        state: {
                            matchId: note.matchId,
                            selectedDate: {
                                fullDate: matchDate,
                                day: dateObj.toLocaleDateString("en-US", { weekday: "long" })
                            }
                        }
                    });
                    setOpen(false)
                } else {
                    navigate(note?.notificationUrl);
                }
                socket.on("userNotificationCountUpdate", (data) => {
                    console.log(data, 'pankaj4');
                    setNotificationCount(data);
                });
                dispatch(getNotificationData()).unwrap().then((res) => {
                    if (res?.notifications) {
                        setNotifications(res.notifications);
                    }
                });
            });
    };

    const handleMarkAllRead = () => {
        const socket = io(SOCKET_URL, { transports: ["websocket"] });

        dispatch(readAllNotification()).unwrap()
            .then(() => {
                socket.on("userNotificationCountUpdate", (data) => {
                    console.log(data, 'pankaj5');
                    setNotificationCount(data);
                });
                dispatch(getNotificationData()).unwrap().then((res) => {
                    if (res?.notifications) {
                        setNotifications(res.notifications);
                    }
                });
            });
    };

    return (
        <nav className="navbar navbar-expand-lg fixed-top bg-white py-md-2 py-0 navbar-shadow-mobile" style={{ zIndex: 1030 }}>
            <div className="container py-md-1 py-0 ps-md-0 ">
                <div className="d-flex justify-content-between align-items-center w-100 pe-0 ps-2 ps-md-0 mt-md-1 mt-0 position-relative">
                    <Link to="/home" style={{ textDecoration: 'none' }} className="text-white d-flex gap-1 align-items-center navbar-brand col-md-3 col-8">
                        {logo ? (
                            <div className='add_logo_font'
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                <img
                                    src={logo}
                                    alt="User Profile"
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                        backgroundSize: "cover",
                                    }}
                                />
                            </div>
                        ) : (
                            <Avatar
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    fontSize: "20px",
                                    backgroundColor: "#ccc",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                            </Avatar>
                        )}

                        <h4 className='text-dark m-0 ps-2 add_font_size_nav_logo' style={{ fontFamily: "Poppins", fontSize: "18px", fontWeight: "500" }}>{clubData?.clubName || "Courtline"}</h4>
                    </Link>

                    <div className="mx-auto d-none d-lg-flex col-6 align-items-center justify-content-center">
                        <ul className="navbar-nav ps-md-0 ps-0 ms-md-0 ms-0 mb-2 mb-lg-0 gap-md-5">
                            {/* <li className="nav-item">
                                <NavLink
                                    to="/home"
                                    className={`nav-link`}
                                    style={({ isActive }) => ({
                                        color: isActive ? '#1F41BB' : '#374151',
                                        textDecoration: 'none',
                                    })}
                                >
                                    Home
                                </NavLink>
                            </li> */}
                            <li className="nav-item">
                                <NavLink
                                    to="/booking"
                                    className={`nav-link`}
                                    style={({ isActive }) => ({
                                        color: isActive ? '#1F41BB' : '#374151',
                                        textDecoration: 'none',
                                    })}
                                >
                                    Booking
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    to="/open-matches"
                                    className={`nav-link`}
                                    style={({ isActive }) => ({
                                        color: isActive ? '#1F41BB' : '#374151',
                                        textDecoration: 'none',
                                    })}
                                >
                                    Open Matches
                                </NavLink>
                            </li>
                            {/* <li className="nav-item">
                                <NavLink
                                    to="/americano"
                                    className='nav-link'
                                    style={({ isActive }) => ({
                                        color: isActive ? '#1F41BB' : '#374151',
                                        textDecoration: 'none',
                                    })}
                                >
                                    Americanos
                                </NavLink>
                            </li> */}
                        </ul>
                    </div>

                    <div className="d-lg-none position-absolute d-flex align-items-center gap-2" style={{ right: "0px", top: "50%", transform: "translateY(-50%)", zIndex: 1001 }}>
                        {(store?.user?.status === '200' || token || store?.user?.status === 200) && (
                            <div className="position-relative" ref={dropdownRef}>
                                <div
                                    className="d-flex rounded-circle justify-content-center mt-1 notification-bg align-items-center"
                                    style={{
                                        cursor: "pointer",
                                        position: "relative",
                                    }}
                                    onClick={() => setOpen(!open)}
                                >
                                    <Badge badgeContent={notificationCount?.unreadCount || notifications?.length} color="error">
                                        <NotificationsIcon size={30} className={`text-dark`} />
                                    </Badge>
                                </div>

                                {open && (
                                    <div
                                        className="shadow-sm p-2"
                                        style={{
                                            position: "fixed",
                                            top: "57px",
                                            right: "30%",
                                            width: "320px",
                                            margin: "0 auto",
                                            backgroundColor: "#fff",
                                            borderRadius: "12px",
                                            zIndex: 1050,
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center mb-0 pt-1 ps-1">
                                            <h6 style={{ fontWeight: 600, fontFamily: "Poppins" }}>Notifications pankaj</h6>
                                            {notifications.length > 3 && (
                                                <button
                                                    className="btn btn-link p-0"
                                                    style={{
                                                        fontSize: "13px",
                                                        fontWeight: 500,
                                                        textDecoration: "none",
                                                        color: "#007bff",
                                                    }}
                                                    onClick={handleMarkAllRead}
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ maxHeight: "320px", overflowY: "auto" }} className="hide-notification-scrollbar">
                                            {notificationLoading ? <ButtonLoading /> :
                                                notifications?.length > 0 ? (
                                                    notifications?.map((note) => (
                                                        <div
                                                            key={note._id}
                                                            className="d-flex gap-3 align-items-start justify-content-between p-3 mb-2 rounded"
                                                            style={{
                                                                borderBottom: "1px solid #f0f0f0",
                                                                cursor: "pointer",
                                                            }}
                                                            onClick={() => handleViewNotification(note)}
                                                        >


                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ fontWeight: 500, fontSize: "13px" }}>
                                                                    {note?.adminId ? "Padel" : ''} – {note.title}
                                                                </div>
                                                                {note?.message && (
                                                                    <p
                                                                        className="text-muted mb-1"
                                                                        style={{ fontSize: "12px", fontFamily: "Poppins" }}
                                                                    >
                                                                        {note.message}
                                                                    </p>
                                                                )}
                                                                <p
                                                                    className="text-muted text-nowrap mb-0"
                                                                    style={{ fontSize: "12px", fontFamily: "Poppins" }}
                                                                >
                                                                    {dayjs(note.createdAt).fromNow()} <b>.</b>{" "}
                                                                    <OverlayTrigger
                                                                        placement="top"
                                                                        overlay={
                                                                            <Tooltip id={`tooltip-${note._id}`}>
                                                                                {note?.notificationType}
                                                                            </Tooltip>
                                                                        }
                                                                    >
                                                                        <span style={{ cursor: "pointer" }}>
                                                                            {note?.notificationType?.length > 15
                                                                                ? note?.notificationType.slice(0, 15) + "..."
                                                                                : note?.notificationType}
                                                                        </span>
                                                                    </OverlayTrigger>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div
                                                        className="text-center text-muted py-3"
                                                        style={{
                                                            fontWeight: 400,
                                                            width: "300px",
                                                            fontFamily: "Poppins",
                                                        }}
                                                    >
                                                        No new notifications
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            className="btn ps-0 pe-0 border-0 bg-transparent"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowOffcanvas(true);
                            }}
                            style={{
                                minWidth: "48px",
                                minHeight: "48px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                WebkitTapHighlightColor: "transparent",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                backgroundColor: "rgba(255,255,255,0.9)"
                            }}
                            aria-label="Open menu"
                            type="button"
                        >
                            <img src={clearall} alt='Menu' style={{ width: "20px", height: "10px", pointerEvents: "none" }} />
                        </button>
                    </div>

                    <div className="d-none d-lg-flex gap-3 align-items-center col-3 justify-content-end pe-2">

                        {store?.user?.status === '200' || token || store?.user?.status === 200 ? (
                            <>
                                <div className="position-relative" ref={dropdownRef}>
                                    <div
                                        className="d-flex rounded-circle justify-content-center mt-1 notification-bg align-items-center"
                                        style={{
                                            cursor: "pointer",
                                            position: "relative",
                                        }}
                                        onClick={() => setOpen(!open)}
                                    >
                                        <Badge badgeContent={notificationCount?.unreadCount || notifications?.length} color="error">
                                            <NotificationsIcon size={30} className={`text-dark`} />
                                        </Badge>
                                    </div>

                                    {open && (
                                        <div
                                            className="shadow-sm p-2"
                                            style={{
                                                position: "absolute",
                                                top: "50px",
                                                right: 0,
                                                width: "320px",
                                                backgroundColor: "#fff",
                                                borderRadius: "12px",
                                                zIndex: 10,
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-0 pt-1 ps-1">
                                                <h6 style={{ fontWeight: 600, fontFamily: "Poppins" }}>Notifications</h6>
                                                {notifications.length > 3 && (
                                                    <button
                                                        className="btn btn-link p-0"
                                                        style={{
                                                            fontSize: "13px",
                                                            fontWeight: 500,
                                                            textDecoration: "none",
                                                            color: "#007bff",
                                                        }}
                                                        onClick={handleMarkAllRead}
                                                    >
                                                        Mark all as read
                                                    </button>
                                                )}
                                            </div>

                                            <div style={{ maxHeight: "300px", overflowY: "auto" }} className="hide-notification-scrollbar">
                                                {notificationLoading ? <ButtonLoading /> :
                                                    notifications?.length > 0 ? (
                                                        notifications?.map((note) => (
                                                            <div
                                                                key={note._id}
                                                                className="d-flex gap-3 align-items-start justify-content-between p-3 mb-2 rounded"
                                                                style={{
                                                                    borderBottom: "1px solid #f0f0f0",
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={() => handleViewNotification(note)}
                                                            >


                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontWeight: 500, fontSize: "13px" }}>
                                                                        {note?.adminId ? "Padel" : ''} – {note.title}
                                                                    </div>
                                                                    {note?.message && (
                                                                        <p
                                                                            className="text-muted mb-1"
                                                                            style={{ fontSize: "12px", fontFamily: "Poppins" }}
                                                                        >
                                                                            {note.message}
                                                                        </p>
                                                                    )}
                                                                    <p
                                                                        className="text-muted text-nowrap mb-0"
                                                                        style={{ fontSize: "12px", fontFamily: "Poppins" }}
                                                                    >
                                                                        {dayjs(note.createdAt).fromNow()} <b>.</b>{" "}
                                                                        <OverlayTrigger
                                                                            placement="top"
                                                                            overlay={
                                                                                <Tooltip id={`tooltip-${note._id}`}>
                                                                                    {note?.notificationType}
                                                                                </Tooltip>
                                                                            }
                                                                        >
                                                                            <span style={{ cursor: "pointer" }}>
                                                                                {note?.notificationType?.length > 15
                                                                                    ? note?.notificationType.slice(0, 15) + "..."
                                                                                    : note?.notificationType}
                                                                            </span>
                                                                        </OverlayTrigger>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div
                                                            className="text-center text-muted py-3"
                                                            style={{
                                                                fontWeight: 400,
                                                                fontFamily: "Poppins",
                                                            }}
                                                        >
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
                                        {/* Profile for all screens */}
                                        <div className="d-flex align-items-center gap-2">
                                            <img
                                                src={User?.user?.response?.profilePic || updateName?.profile || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                                alt="user"
                                                className="rounded-circle"
                                                width="40"
                                                height="40"
                                                loading="lazy"
                                            />
                                            <div className="text-start d-none d-lg-block">
                                                <div className="fw-semibold" style={{ textTransform: "capitalize" }}>
                                                    {store?.user?.response?.name
                                                        ? store?.user?.response?.name.charAt(0).toUpperCase() + store?.user?.response?.name.slice(1)
                                                        : initialFormData?.fullName || 'User'}

                                                </div>
                                                <div className="text-muted small">+91 {User?.user?.response?.phoneNumber || userData?.phoneNumber || initialFormData?.phoneNumber || 'N/A'}</div>
                                            </div>
                                            <FaChevronDown className="ms-2 text-muted d-none d-lg-block" />
                                        </div>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="table-data mt-2 border-0 shadow p-1 fw-medium" style={{ color: '#374151', width: "200px" }}>
                                        <Dropdown.Item className='mb-2 d-flex align-items-center' as={NavLink} to="/user-profile">
                                            <FaRegUserCircle size={20} style={{ minWidth: "24px" }} className="me-2" /> Profile
                                        </Dropdown.Item>

                                        <Dropdown.Item className='mb-2 d-flex align-items-center' as={NavLink} to="/booking-history">
                                            <MdOutlineDateRange size={20} style={{ minWidth: "24px" }} className="me-2" /> My Booking
                                        </Dropdown.Item>

                                        <Dropdown.Item className='mb-2 d-flex align-items-center' as={NavLink} to="/support">
                                            <FaHeadphones size={20} style={{ minWidth: "24px" }} className="me-2" /> Help & Support
                                        </Dropdown.Item>

                                        <Dropdown.Item
                                            className='mb-2 d-flex align-items-center'
                                            onClick={() => {
                                                dispatch(logoutUser());
                                                localStorage.removeItem('padel_user');
                                                localStorage.removeItem('logo');
                                                localStorage.removeItem('updateprofile');
                                                setUserData(null);
                                                navigate('/home');
                                            }}
                                        >
                                            <IoIosLogOut size={20} style={{ minWidth: "24px" }} className="me-2" /> Logout
                                        </Dropdown.Item>
                                    </Dropdown.Menu>

                                </Dropdown>
                            </>

                        ) : (
                            <Link to="/login" style={{ textDecoration: 'none' }} className="text-white">
                                <button
                                    className=" login-btn px-4 border-0   rounded-pill text-white"
                                >
                                    Login
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <Offcanvas
                show={showOffcanvas}
                onHide={() => setShowOffcanvas(false)}
                placement="end"
                className="border-0 w-75"
                style={{ zIndex: 1055 }}
                backdrop={true}
                keyboard={true}
                scroll={false}
            >
                <Offcanvas.Header className="border-bottom d-flex align-items-center justify-content-between p-2 py-2">
                    <Offcanvas.Title className="d-flex align-items-center gap-3">

                        <Link
                            to="/home"
                            className="d-flex align-items-center text-decoration-none"
                            onClick={() => setShowOffcanvas(false)}
                            style={{ color: "inherit" }}
                        >
                            {logo ? (
                                <img
                                    src={logo}
                                    alt="Logo"
                                    className="rounded-circle"
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <Avatar sx={{ width: 40, height: 40 }}>
                                    {clubData?.clubName
                                        ? clubData.clubName.charAt(0).toUpperCase()
                                        : "C"}
                                </Avatar>
                            )}
                        </Link>


                    </Offcanvas.Title>

                    <button
                        className="btn p-2 border-0 bg-transparent"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowOffcanvas(false);
                        }}
                        style={{
                            minWidth: "44px",
                            minHeight: "44px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            WebkitTapHighlightColor: "transparent"
                        }}
                        aria-label="Close menu"
                    >
                        <FaTimes size={20} />
                    </button>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <div className="d-flex flex-column h-100">
                        <div className="flex-grow-1">
                            {/* <NavLink
                                to="/home"
                                className="d-flex align-items-center px-4 py-3 text-decoration-none border-bottom"
                                style={({ isActive }) => ({
                                    color: isActive ? '#1F41BB' : '#374151',
                                    backgroundColor: isActive ? '#f8f9fa' : 'transparent'
                                })}
                                onClick={() => setShowOffcanvas(false)}
                            >
                                <span className="me-3">🏠</span>
                                <span>Home</span>
                            </NavLink> */}

                            <NavLink
                                to="/booking"
                                className="d-flex align-items-center px-4 py-3 text-decoration-none border-bottom"
                                style={({ isActive }) => ({
                                    color: isActive ? '#1F41BB' : '#374151',
                                    backgroundColor: isActive ? '#f8f9fa' : 'transparent'
                                })}
                                onClick={() => setShowOffcanvas(false)}
                            >
                                <span className="me-3">📅</span>
                                <span>Booking</span>
                            </NavLink>

                            <NavLink
                                to="/open-matches"
                                className="d-flex align-items-center px-4 py-3 text-decoration-none border-bottom"
                                style={({ isActive }) => ({
                                    color: isActive ? '#1F41BB' : '#374151',
                                    backgroundColor: isActive ? '#f8f9fa' : 'transparent'
                                })}
                                onClick={() => setShowOffcanvas(false)}
                            >
                                <MdSportsTennis size={20} className="me-3" />
                                <span>Open Matches</span>
                            </NavLink>

                            {/* <NavLink
                                to="/americano"
                                className="d-flex align-items-center px-4 py-3 text-decoration-none border-bottom"
                                style={({ isActive }) => ({
                                    color: isActive ? '#1F41BB' : '#374151',
                                    backgroundColor: isActive ? '#f8f9fa' : 'transparent'
                                })}
                                onClick={() => setShowOffcanvas(false)}
                            >
                                <PiRanking size={20} className="me-3" />
                                <span>Americanos</span>
                            </NavLink> */}

                            {(store?.user?.status === '200' || token || store?.user?.status === 200) && (
                                <>
                                    <div className="px-4 py-2 bg-light border-bottom">
                                        <small className="text-muted fw-semibold">ACCOUNT</small>
                                    </div>

                                    <NavLink
                                        to="/user-profile"
                                        className="d-flex align-items-center px-4 py-3 text-decoration-none border-bottom"
                                        style={({ isActive }) => ({
                                            color: isActive ? '#1F41BB' : '#374151',
                                            backgroundColor: isActive ? '#f8f9fa' : 'transparent'
                                        })}
                                        onClick={() => setShowOffcanvas(false)}
                                    >
                                        <FaRegUserCircle size={20} className="me-3" />
                                        <span>Profile</span>
                                    </NavLink>

                                    <NavLink
                                        to="/booking-history"
                                        className="d-flex align-items-center px-4 py-3 text-decoration-none border-bottom"
                                        style={({ isActive }) => ({
                                            color: isActive ? '#1F41BB' : '#374151',
                                            backgroundColor: isActive ? '#f8f9fa' : 'transparent'
                                        })}
                                        onClick={() => setShowOffcanvas(false)}
                                    >
                                        <MdOutlineDateRange size={20} className="me-3" />
                                        <span>My Booking</span>
                                    </NavLink>

                                    <NavLink
                                        to="/support"
                                        className="d-flex align-items-center px-4 py-3 text-decoration-none border-bottom"
                                        style={({ isActive }) => ({
                                            color: isActive ? '#1F41BB' : '#374151',
                                            backgroundColor: isActive ? '#f8f9fa' : 'transparent'
                                        })}
                                        onClick={() => setShowOffcanvas(false)}
                                    >
                                        <FaHeadphones size={20} className="me-3" />
                                        <span>Help & Support</span>
                                    </NavLink>
                                </>
                            )}
                        </div>

                        <div className="border-top">
                            {(store?.user?.status === '200' || token || store?.user?.status === 200) ? (
                                <>
                                    <div className="px-4 py-3 border-bottom">
                                        <div className="d-flex align-items-center gap-3">
                                            {initialFormData?.profileImage ? (
                                                <img
                                                    src={initialFormData.profileImage}
                                                    alt="user"
                                                    className="rounded-circle"
                                                    width="50"
                                                    height="50"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <Avatar
                                                sx={{
                                                    width: 50,
                                                    height: 50,
                                                    backgroundColor: '#1F41BB',
                                                    fontSize: '20px',
                                                    fontWeight: 600,
                                                    display: initialFormData?.profileImage ? 'none' : 'flex'
                                                }}
                                            >
                                                {(userData?.name || initialFormData?.fullName || 'User').charAt(0).toUpperCase()}
                                            </Avatar>
                                            <div>
                                                <div className="fw-semibold">
                                                    {userData?.name
                                                        ? userData.name.charAt(0).toUpperCase() + userData.name.slice(1)
                                                        : initialFormData?.fullName || 'User'}
                                                </div>
                                                <div className="text-muted small">+91 {User?.user?.response?.phoneNumber || userData?.phoneNumber || initialFormData?.phoneNumber || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="btn w-100 d-flex align-items-center px-4 py-3 text-start border-0 bg-transparent"
                                        style={{ color: '#dc3545' }}
                                        onClick={() => {
                                            dispatch(logoutUser());
                                            localStorage.removeItem('padel_user');
                                            localStorage.removeItem('logo');
                                            localStorage.removeItem('updateprofile');
                                            setUserData(null);
                                            setShowOffcanvas(false);
                                            navigate('/home');
                                        }}
                                    >
                                        <IoIosLogOut size={20} className="me-3" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <div className="p-4">
                                    <Link to="/login" className="text-decoration-none" onClick={() => setShowOffcanvas(false)}>
                                        <button className="btn text-white fw-semibold w-100 rounded-pill w-100 login-btn">
                                            Login
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </nav>
    );
};

export default Navbar;