import { logo } from '../../../assets/files';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp, FaHeadphones, FaRegUserCircle } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../../redux/user/auth/authSlice';
import { IoTennisballOutline } from 'react-icons/io5';
import { Avatar } from '@mui/material';
import { getUserFromSession, isUserAuthenticated } from '../../../helpers/api/apiCore';
import { MdOutlineDateRange, MdSportsTennis } from "react-icons/md";
import { IoIosLogOut } from 'react-icons/io';
import { PiRanking } from "react-icons/pi";

const Navbar = () => {
    const dispatch = useDispatch();

    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const store = useSelector((state) => state?.userAuth);
    const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0]) || [];
    const User = getUserFromSession()
    let token = isUserAuthenticated()
    const logo = JSON.parse(localStorage.getItem("logo"));
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

        // Listen for storage changes (optional, if cross-tab sync is needed)
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
    }, [store?.user?.status, store?.user?.response?.user]); // Depend on Redux store changes


    return (
        <nav className="navbar navbar-expand-lg bg-white py-2">
            <div className="container py-1">
                {/* Logo */}
                <Link to="/home" style={{ textDecoration: 'none' }} className="text-white navbar-brand">
                    {logo ?
                        <Avatar src={logo} alt="User Profile" /> :
                        <Avatar>
                            {clubData?.clubName ? clubData.clubName.charAt(0).toUpperCase() : "C"}
                        </Avatar>
                    }
                    {/* <h4 className='text-dark fw-bold m-0' style={{ fontFamily: "Poppins" }}>Logo</h4> */}
                </Link>

                {/* Toggle button for mobile */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#mainNav"
                    aria-controls="mainNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navigation links */}
                <div className="collapse navbar-collapse" id="mainNav">
                    <ul className="navbar-nav w-100 ps-md-5 ps-0 ms-md-5 ms-0 mb-2 mb-lg-0 gap-5">
                        <li className="nav-item">
                            <NavLink
                                to="/home"
                                className={`nav-link `}
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
                                className={`nav-link `}
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
                                className={`nav-link `}
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
                                Americano
                            </NavLink>
                        </li>
                    </ul>

                    <div className="d-flex">
                        {store?.user?.status === '200' || token ? (
                            <Dropdown align="end" onToggle={(isOpen) => setIsOpen(isOpen)}>
                                <Dropdown.Toggle
                                    variant="white"
                                    className="d-flex align-items-center gap-2 text-dark text-decoration-none p-0 border-0 shadow-none"
                                >
                                    <img
                                        src={userData?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                        alt="user"
                                        className="rounded-circle"
                                        width="40"
                                        height="40"
                                    />
                                    <div className="text-start d-none d-sm-block">
                                        <div className="fw-semibold">
                                            {userData?.name
                                                ? userData.name.charAt(0).toUpperCase() + userData.name.slice(1)
                                                : 'User'}
                                        </div>
                                        <div className="text-muted small">+91 {userData?.phoneNumber || 'N/A'}</div>
                                    </div>
                                    {isOpen ? (
                                        <FaChevronUp className="ms-2 text-muted" />
                                    ) : (
                                        <FaChevronDown className="ms-2 text-muted" />
                                    )}
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="table-data fw-medium" style={{ color: '#374151', width: "200px" }}>
                                    <Dropdown.Item className='mb-2 d-flex align-items-center' as={NavLink} to="/profile">
                                        <FaRegUserCircle size={20} style={{ minWidth: "24px" }} className="me-2" /> Profile
                                    </Dropdown.Item>

                                    <Dropdown.Item className='mb-2 d-flex align-items-center' as={NavLink} to="/booking-history">
                                        <MdOutlineDateRange size={20} style={{ minWidth: "24px" }} className="me-2" /> My Booking
                                    </Dropdown.Item>

                                    <Dropdown.Item className='mb-2 d-flex align-items-center' as={NavLink} to="/open-matches">
                                        <MdSportsTennis size={20} style={{ minWidth: "24px" }} className="me-2" /> Open Matches
                                    </Dropdown.Item>

                                    <Dropdown.Item className='mb-2 d-flex align-items-center' as={NavLink} to="/admin/help-support">
                                        <PiRanking size={20} style={{ minWidth: "24px" }} className="me-2" /> Americano
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
            </div>
        </nav>
    );
};

export default Navbar;