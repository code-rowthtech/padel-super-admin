import { logo } from '../../../assets/files';
import { Link, NavLink } from 'react-router-dom';


const Navbar = () => {
    return (
        <>
            <nav className="navbar navbar-expand-lg bg-white py-1 ">
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
                            <Link to="/login" style={{ textDecoration: 'none' }} className="text-white">
                                <button className="btn px-4 py-2 rounded-pill text-white" style={{ whiteSpace: "nowrap", backgroundColor: " #3DBE64", fontSize: "20", fontWeight: "600" }}>
                                    Login
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar