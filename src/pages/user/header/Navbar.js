import { logo } from '../../../assets/files';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../../redux/user/auth/authSlice';
import { IoTennisballOutline } from 'react-icons/io5';
import { Avatar } from '@mui/material';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const store = useSelector((state) => state?.userAuth);
    const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0]) || [];
    const logo = useSelector((state) => state?.userAuth?.logo?.logo);
    console.log(logo, 'logoooooooooooooooooo');
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

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('storage', updateUserData);
        };
    }, [store?.user?.status, store?.user?.response?.user]); // Depend on Redux store changes

    console.log({ store, userData });

    return (
        <nav className="navbar navbar-expand-lg bg-white py-1">
            <div className="container">
                {/* Logo */}
                <Link to="/home" style={{ textDecoration: 'none' }} className="text-white navbar-brand">
                    {logo?.logo ?
                        <Avatar src={logo?.logo} alt="User Profile" /> :
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
                    <ul className="navbar-nav w-100 ps-md-5 ps-0 ms-md-5 ms-0 mb-2 mb-lg-0 gap-4">
                        <li className="nav-item">
                            <NavLink
                                to="/home"
                                className={({ isActive }) => `nav-link ${isActive ? 'fw-semibold' : ''}`}
                                style={({ isActive }) => ({
                                    color: isActive ? '#1F41BB' : '#000',
                                    textDecoration: 'none',
                                })}
                            >
                                Home
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/booking"
                                className={({ isActive }) => `nav-link ${isActive ? 'fw-semibold' : ''}`}
                                style={({ isActive }) => ({
                                    color: isActive ? '#1F41BB' : '#000',
                                    textDecoration: 'none',
                                })}
                            >
                                Booking
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                to="/open-matches"
                                className={({ isActive }) => `nav-link ${isActive ? 'fw-semibold' : ''}`}
                                style={({ isActive }) => ({
                                    color: isActive ? '#1F41BB' : '#000',
                                    textDecoration: 'none',
                                })}
                            >
                                Open Matches
                            </NavLink>
                        </li>
                        {/* <li className="nav-item">
                            <NavLink
                                to="/competitions"
                                className={({ isActive }) => `nav-link ${isActive ? 'fw-semibold' : ''}`}
                                style={({ isActive }) => ({
                                    color: isActive ? '#1F41BB' : '#000',
                                    textDecoration: 'none',
                                })}
                            >
                                Competitions
                            </NavLink>
                        </li> */}
                    </ul>

                    <div className="d-flex">
                        {store?.user?.status === '200' || userData?.token ? (
                            <Dropdown align="end" onToggle={(isOpen) => setIsOpen(isOpen)}>
                                <Dropdown.Toggle
                                    variant="white"
                                    className="d-flex align-items-center gap-2 text-dark text-decoration-none p-0 border-0 shadow-none"
                                >
                                    <img
                                        src={userData?.profilePic || 'https://i.pravatar.cc/40'}
                                        alt="user"
                                        className="rounded-circle"
                                        width="40"
                                        height="40"
                                    />
                                    <div className="text-end d-none d-sm-block">
                                        <div className="fw-semibold">
                                            {userData?.name
                                                ? userData.name.charAt(0).toUpperCase() + userData.name.slice(1)
                                                : 'User'}
                                        </div>
                                        <div className="text-muted small">{userData?.phoneNumber || 'N/A'}</div>
                                    </div>
                                    {isOpen ? (
                                        <FaChevronUp className="ms-2 text-muted" />
                                    ) : (
                                        <FaChevronDown className="ms-2 text-muted" />
                                    )}
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="table-data fw-medium" style={{ color: '#374151' }}>
                                    <Dropdown.Item as={NavLink} to="/profile">
                                        Profile
                                    </Dropdown.Item>
                                    <Dropdown.Item as={NavLink} to="/booking-history">
                                        My Booking
                                    </Dropdown.Item>
                                    <Dropdown.Item as={NavLink} to="/open-matches">
                                        Open Matches
                                    </Dropdown.Item>
                                    <Dropdown.Item as={NavLink} to="/admin/help-support">
                                        Americano
                                    </Dropdown.Item>
                                    <Dropdown.Item as={NavLink} to="/admin/settings">
                                        Help & Support
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => {
                                            dispatch(logoutUser());
                                            localStorage.removeItem('padel_user');
                                            setUserData(null);
                                            navigate('/home');
                                        }}
                                    >
                                        Logout
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <Link to="/login" style={{ textDecoration: 'none' }} className="text-white">
                                <button
                                    className="btn btn-sm px-4 fw-medium small  rounded-pill text-white"
                                    style={{ backgroundColor: '#3DBE64' }}
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