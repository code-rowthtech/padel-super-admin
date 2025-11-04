import { logo } from '../../../assets/files';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp, FaHeadphones, FaRegUserCircle, FaBars, FaBell } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../../redux/user/auth/authSlice';
import { IoTennisballOutline } from 'react-icons/io5';
import { Avatar } from '@mui/material';
import { getUserFromSession, isUserAuthenticated } from '../../../helpers/api/apiCore';
import { MdOutlineDateRange, MdSportsTennis } from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp, IoIosLogOut } from 'react-icons/io';
import { PiRanking } from "react-icons/pi";
import { getLogo, getUserProfile } from '../../../redux/user/auth/authThunk';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { io } from 'socket.io-client';
import config from '../../../config';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { DataLoading } from '../../../helpers/loading/Loaders';
import updateLocale from "dayjs/plugin/updateLocale";
import { getNotificationCount, getNotificationData, getNotificationView } from '../../../redux/user/notifiction/thunk';

const SOCKET_URL = config.API_URL;
const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [openNoteId, setOpenNoteId] = useState(null);
    const [userData, setUserData] = useState(null);
    const store = useSelector((state) => state?.userAuth);
    const User = useSelector((state) => state?.userAuth)
    const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0]) || [];
    const notificationData = useSelector((state) => state.notificationData?.getNotificationData);
    const notificationLoading = useSelector((state) => state.notificationData?.getCountLoading);
    let token = isUserAuthenticated()
    const logo = JSON.parse(localStorage.getItem("logo"));
    const { user, } = useSelector((state) => state?.userAuth);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const userId = getUserFromSession()?._id;
    const [notificationCount, setNotificationCount] = useState();
    console.log({ userId });
    console.log({ notificationCount });
    console.log({ notifications });
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
                console.log(res, 'resresres');
                if (res?.notifications) {
                    setNotificationCount(res);
                }
            });
            socket.on("connect", () => {
                console.log("Connected:", socket.id);
                socket.emit("registerUser", userId);
            });



            socket.on("user_request", (data) => {
                console.log("user_request", data);
                setNotifications((prevNotifications) => [data, ...prevNotifications]);
            });

            socket.on("userNotificationCountUpdate", (data) => {
                console.log("userNotificationCountUpdate", data);
                setNotificationCount(data);
            });

            socket.on("approved_request", (data) => {
                console.log("approved_request", data);
                setNotifications((prevNotifications) => [data, ...prevNotifications]);
            });

            socket.on("userNotificationCountUpdate", (data) => {
                console.log("userNotificationCountUpdate", data);
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
                    console.error('Error parsing user data from localStorage:', error);
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
                    console.error('Error parsing user data from localStorage:', error);
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
        fullName: user?.response?.name || updateName?.fullName || store?.userSignUp?.response?.name || User?.name || "",
        phone: user?.response?.phoneNumber || updateName?.phone || store?.userSignUp?.response?.phoneNumber || User?.phoneNumber || "",
        profileImage: user?.response?.profilePic || store?.userSignUp?.response?.profilePic || User?.profilePic || "",
    };

    useEffect(() => {
        if (User?.token) {
            dispatch(getUserProfile())
        }
    }, [User?.token])

    useEffect(() => {
        const ownerId = localStorage.getItem('owner_id') || clubData?.ownerId;
        if (ownerId) {
            dispatch(getLogo(ownerId));
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleViewNotification = (note) => {
        const socket = io(SOCKET_URL, { transports: ["websocket"] });

        dispatch(getNotificationView({ noteId: note._id })).unwrap()
            .then(() => {
                navigate(note?.notificationUrl)
                socket.on("userNotificationCountUpdate", (data) => {
                    console.log('userNotificationCountUpdate', data);
                    setNotificationCount(data);
                });
                dispatch(getNotificationData()).unwrap().then((res) => {
                    if (res?.notifications) {
                        setNotifications(res.notifications);
                    }
                });
                // dispatch(getNotificationCount()).unwrap().then((res) => {
                //   console.log(res?.unreadCount, 'resres');
                //   if (res?.unreadCount) {
                //     setNotificationCount(res);
                //   }
                // });
            });
    };

    return (
        <nav className="navbar navbar-expand-lg fixed-top bg-white py-2">
            <div className="container  px-0 p-0 py-1">
                {/* Logo */}
                <Link to="/home" style={{ textDecoration: 'none' }} className="text-white navbar-brand">
                    {logo ?
                        <Avatar
                            src={logo}
                            alt="User Profile"
                            style={{
                                width: "50px",
                                height: "50px",
                                border: "0.5px solid #928f8fff",
                                objectFit: "contain",
                                imageRendering: "auto",
                                padding: "0px"
                            }}
                        />
                        :
                        <Avatar>
                            {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                        </Avatar>
                    }
                    {/* <h4 className='text-dark fw-bold m-0' style={{ fontFamily: "Poppins" }}>Logo</h4> */}
                </Link>

                {/* Navigation links - Hidden on mobile */}
                <div className="d-none me-auto d-lg-flex">
                    <ul className="navbar-nav ps-md-5 ps-0 ms-md-5  ms-0 mb-2 mb-lg-0 gap-md-5">
                        <li className="nav-item">
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
                        </li>
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
                        <li className="nav-item">
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
                        </li>
                    </ul>
                </div>

                {/* Profile Section */}
                <div className="d-flex gap-3 align-items-center">

                    {store?.user?.status === '200' || token || store?.user?.status === 200 ? (
                        <>
                            <div className="position-relative" ref={dropdownRef}>
                                {/* Bell Icon */}
                                <div
                                    className="d-flex rounded-circle justify-content-center mt-1 notification-bg align-items-center"
                                    style={{
                                        cursor: "pointer",
                                        backgroundColor: open ? "black" : "#CBD6FF54",
                                        position: "relative",
                                    }}
                                    onClick={() => setOpen(!open)}
                                >
                                    <Badge badgeContent={notificationCount?.unreadCount || notifications?.length} color="error">
                                        <NotificationsIcon className={`${open ? 'text-white' : 'text-dark'}`}  />
                                    </Badge>
                                </div>

                                {/* Dropdown */}
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
                                        </div>

                                        <div style={{ maxHeight: "300px", overflowY: "auto" }} className="hide-notification-scrollbar">
                                            {notificationLoading ? <DataLoading /> :
                                                notifications?.length > 0 ? (
                                                    notifications?.map((note) => (
                                                        <div
                                                            key={note._id}
                                                            className="d-flex gap-3 align-items-start justify-content-between p-3 mb-2 rounded"
                                                            style={{
                                                                borderBottom: "1px solid #f0f0f0",
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            {/* Left: Profile Image or Initial */}


                                                            {/* Middle: Notification content */}
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


                                                                {/* Show when expanded */}
                                                                {openNoteId === note._id && (
                                                                    <div className="d-flex gap-2 mt-2">
                                                                        <button
                                                                            className="btn btn-dark btn-sm py-0 px-3"
                                                                            style={{ fontSize: "13px" }}
                                                                            onClick={() => handleViewNotification(note)
                                                                            }
                                                                        >
                                                                            View
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {console.log({ note })}
                                                            {/* Right: Toggle Icon */}
                                                            <div
                                                                className="mt-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenNoteId(openNoteId === note._id ? null : note._id);
                                                                }}
                                                                style={{ cursor: "pointer" }}
                                                            >
                                                                {openNoteId === note._id ? (
                                                                    <IoIosArrowUp size={20} color="#555" />
                                                                ) : (
                                                                    <IoIosArrowDown size={20} color="#555" />
                                                                )}
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
                                    {/* Menu icon for small screens */}
                                    <FaBars size={24} className="text-dark d-lg-none" />

                                    {/* Profile for large screens */}
                                    <div className="d-none d-lg-flex align-items-center gap-2">
                                        <img
                                            src={User?.user?.response?.profilePic || userData?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                            alt="user"
                                            className="rounded-circle"
                                            width="40"
                                            height="40"
                                            loading="lazy"
                                        />
                                        <div className="text-start">
                                            <div className="fw-semibold">
                                                {userData?.name
                                                    ? userData.name.charAt(0).toUpperCase() + userData.name.slice(1)
                                                    : initialFormData?.fullName || User?.user?.response?.name || 'User'}

                                            </div>
                                            <div className="text-muted small">+91 {User?.user?.response?.phoneNumber || userData?.phoneNumber || initialFormData?.phoneNumber || 'N/A'}</div>
                                        </div>
                                        <FaChevronDown className="ms-2 text-muted" />
                                    </div>
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="table-data mt-2  border-0 shadow p-1 fw-medium" style={{ color: '#374151', width: "200px" }}>
                                    {/* Navigation items - visible on mobile */}
                                    <div className="d-lg-none">
                                        <Dropdown.Item className='mb-2 d-flex align-items-center' as={NavLink} to="/home">
                                            <span className="me-2">🏠</span> Home
                                        </Dropdown.Item>
                                        <Dropdown.Item className='mb-2 d-flex align-items-center' as={NavLink} to="/booking">
                                            <span className="me-2">📅</span> Booking
                                        </Dropdown.Item>
                                        <Dropdown.Item className='mb-2 d-flex align-items-center' as={NavLink} to="/open-matches">
                                            <MdSportsTennis size={20} style={{ minWidth: "24px" }} className="me-2" /> Open Matches
                                        </Dropdown.Item>
                                        <Dropdown.Item className='mb-2 d-flex align-items-center' as={NavLink} to="/americano">
                                            <PiRanking size={20} style={{ minWidth: "24px" }} className="me-2" /> Americano
                                        </Dropdown.Item>
                                        <hr className="my-2" />
                                    </div>

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
        </nav>
    );
};

export default Navbar;