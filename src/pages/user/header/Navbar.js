import { logo } from '../../../assets/files';
import { Link, NavLink } from 'react-router-dom';
import { getUserFromSession } from '../../../helpers/api/apiCore';
import { Dropdown } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../redux/user/auth/authSlice';


const Navbar = () => {
    const dispatch = useDispatch()
    const user = getUserFromSession()
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <nav className="navbar navbar-expand-lg  bg-white py-1 ">
                <div className="container">
                    {/* Logo */}
                    <Link to="/home" style={{ textDecoration: 'none' }} className="text-white navbar-brand">
                        <img src={logo} alt="Logo" style={{ width: "120px" }} />
                    </Link>

                    {/* Toggle button for mobile */}
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Navigation links */}
                    <div className="collapse navbar-collapse" id="mainNav">
                        <ul className="navbar-nav w-100 ps-md-5 ps-0 ms-md-5 ms-0 mb-2 mb-lg-0 gap-4">
                            <li className="nav-item">
                                <NavLink
                                    to="/home"
                                    className={({ isActive }) => `nav-link ${isActive ? "fw-semibold" : ""}`}
                                    style={({ isActive }) => ({
                                        color: isActive ? "#1F41BB" : "#000",
                                        textDecoration: 'none',
                                    })}
                                >
                                    Home
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    to="/booking"
                                    className={({ isActive }) => `nav-link ${isActive ? "fw-semibold" : ""}`}
                                    style={({ isActive }) => ({
                                        color: isActive ? "#1F41BB" : "#000",
                                        textDecoration: 'none',
                                    })}
                                >
                                    Booking
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    to="/open-matches"
                                    className={({ isActive }) => `nav-link ${isActive ? "fw-semibold" : ""}`}
                                    style={({ isActive }) => ({
                                        color: isActive ? "#1F41BB" : "#000",
                                        textDecoration: 'none',
                                    })}
                                >
                                    Open Matches
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    to="/competitions"
                                    className={({ isActive }) => `nav-link ${isActive ? "fw-semibold" : ""}`}
                                    style={({ isActive }) => ({
                                        color: isActive ? "#1F41BB" : "#000",
                                        textDecoration: 'none',

                                    })}
                                >
                                    Competitions
                                </NavLink>
                            </li>
                        </ul>

                        <div className="d-flex ">
                            {user?.token ?
                                <Dropdown align="end" onToggle={(isOpen) => setIsOpen(isOpen)}>
                                    <Dropdown.Toggle
                                        variant="white"
                                        className="d-flex align-items-center gap-2 text-dark text-decoration-none p-0 border-0 shadow-none"
                                    >
                                        <img
                                            src={user?.profilePic || "https://i.pravatar.cc/40"}
                                            alt="user"
                                            className="rounded-circle"
                                            width="40"
                                            height="40"
                                        />
                                        <div className="text-end d-none d-sm-block">

                                            <div className="fw-semibold">
                                                {user?.name || "Danielle Campbell"}
                                            </div>
                                            <div className="text-muted small">{user?.phoneNumber}</div>
                                        </div>

                                        {isOpen ? (
                                            <FaChevronUp className="ms-2 text-muted" />
                                        ) : (
                                            <FaChevronDown className="ms-2 text-muted" />
                                        )}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu
                                        className="table-data fw-medium"
                                        style={{ color: "#374151" }}
                                    >
                                        <Dropdown.Item as={NavLink} to="/admin/profile">
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
                                            }}
                                        >
                                            Logout
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                                :
                                <Link to="/login" style={{ textDecoration: 'none' }} className="text-white">
                                    <button className="btn px-4 py-2 rounded-pill text-white" style={{ whiteSpace: "nowrap", backgroundColor: " #3DBE64", fontSize: "20", fontWeight: "600" }}>
                                        Login
                                    </button>
                                </Link>
                            }
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar