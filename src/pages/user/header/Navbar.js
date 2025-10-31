import { logo } from '../../../assets/files';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {  Dropdown } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp, FaHeadphones, FaRegUserCircle, FaBars, FaBell } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../../redux/user/auth/authSlice';
import { IoTennisballOutline } from 'react-icons/io5';
import { Avatar } from '@mui/material';
import { getUserFromSession, isUserAuthenticated } from '../../../helpers/api/apiCore';
import { MdOutlineDateRange, MdSportsTennis } from "react-icons/md";
import { IoIosLogOut } from 'react-icons/io';
import { PiRanking } from "react-icons/pi";
import { getLogo, getUserProfile } from '../../../redux/user/auth/authThunk';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const store = useSelector((state) => state?.userAuth);
    const User = useSelector((state) => state?.userAuth)
    const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0]) || [];
    let token = isUserAuthenticated()
    const logo = JSON.parse(localStorage.getItem("logo"));
    const { user, } = useSelector((state) => state?.userAuth);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
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

    const notifications = [
        { id: 1, text: "Your booking has been confirmed!" },
        { id: 2, text: "New message from club admin." },
        { id: 3, text: "Your refund has been processed." },
    ];



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
                <div className="d-flex gap-3">
                    <div className="position-relative" ref={dropdownRef}>
                        {/* Bell Icon */}
                        <div
                            className="d-flex rounded-circle justify-content-center mt-1 align-items-center"
                            style={{
                                cursor: "pointer",
                                backgroundColor: "#CBD6FF54",
                                width: "40px",
                                height: "40px",
                                position: "relative",
                            }}
                            onClick={() => setOpen(!open)}
                        >
                            <Badge badgeContent={17} color="error">
                                <NotificationsIcon className="text-muted" size={18} />
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
                                    width: "250px",
                                    backgroundColor: "#fff",
                                    borderRadius: "10px",
                                    zIndex: 10,
                                }}
                            >
                                <h6 className="text-muted mb-2">Notifications</h6>
                                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                                    {notifications.length > 0 ? (
                                        notifications.map((note) => (
                                            <div
                                                key={note.id}
                                                className="p-2 mb-1 rounded"
                                                style={{
                                                    backgroundColor: "#f7f8ff",
                                                    fontSize: "14px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {note.text}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted py-3">
                                            No new notifications
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {store?.user?.status === '200' || token || store?.user?.status === 200 ? (
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

                                <Dropdown.Item className='mb-2 d-flex align-items-center' as={NavLink} to="/admin/settings">
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