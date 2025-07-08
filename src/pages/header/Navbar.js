import React from 'react'
import logo from '../../assets/logo.png'
import { Button } from 'bootstrap/dist/js/bootstrap.bundle.min'
import { Link, NavLink } from 'react-router-dom';


const Navbar = () => {
    return (
        <>
            <nav className="navbar navbar-expand-lg bg-white py-1 ">
                <div className="container">
                    {/* Logo */}
                    <a className="navbar-brand" href="#">
                        <Link to="/" style={{ textDecoration: 'none' }} className="text-white">
                            <img src={logo} alt="Logo" style={{ width: "120px" }} /></Link>
                    </a>

                    {/* Toggle button for mobile */}
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Navigation links */}
                    <div className="collapse navbar-collapse" id="mainNav">
                        <ul className="navbar-nav w-100 ps-md-5 ps-0 ms-md-5 ms-0 mb-2 mb-lg-0 gap-4">
                            <li className="nav-item">
                                <NavLink
                                    to="/"
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


                        {/* Book Now button */}
                        <div className="d-flex ">
                            <button href="#" className="btn px-4 py-2 rounded-pill text-white" style={{ whiteSpace: "nowrap", backgroundColor: " #3DBE64", fontSize: "20", fontWeight: "600" }}>
                                <Link to="/booking" style={{ textDecoration: 'none' }} className="text-white">
                                    Book Now </Link>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar