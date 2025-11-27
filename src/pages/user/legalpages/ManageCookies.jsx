import React, { useEffect } from 'react'
import { Link } from 'react-router-dom';

const ManageCookies = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="container py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', marginTop: '40px' }}>

            <div className="bg-white rounded-4 shadow-sm p-5">
                <div className="text-center mb-5">
                    <h1 className="display-5 fw-bold text-success">Manage Cookies</h1>
                    <p className="text-muted">Control how your data is stored and used while using our platform.</p>
                </div>

                <p className="lead mb-4">
                    We use cookies to improve your experience on our court booking platform.
                    You can choose which categories you want to allow. Essential cookies cannot be disabled because the site
                    simply won't function without them.
                </p>

                {/* Essential Cookies */}
                <div className="mb-4 p-4 bg-light rounded-3 border-start border-success border-4">
                    <h4 className="text-success mb-2">Essential Cookies</h4>
                    <p className="text-muted mb-3">
                        These cookies are required for the website to operate properly. They enable features like login,
                        booking court slots, secure payment processing, and basic navigation.
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Always Active</span>
                    </div>
                </div>

                {/* Analytics Cookies */}
                <div className="mb-4 p-4 bg-light rounded-3">
                    <h4 className="text-success mb-2">Analytics Cookies</h4>
                    <p className="text-muted mb-3">
                        These cookies help us understand how users interact with the platform — which pages they visit,
                        where users drop off in the booking flow, and what features need improvement.
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Allow Analytics Cookies</span>
                        <input type="checkbox" className="form-check-input" />
                    </div>
                </div>

                {/* Functional Cookies */}
                <div className="mb-4 p-4 bg-light rounded-3">
                    <h4 className="text-success mb-2">Functional Cookies</h4>
                    <p className="text-muted mb-3">
                        These cookies remember your preferences — like saved clubs, recently viewed courts, selected language,
                        and booking date filters — to make your experience smoother.
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Allow Functional Cookies</span>
                        <input type="checkbox" className="form-check-input" />
                    </div>
                </div>

                {/* Marketing Cookies */}
                <div className="mb-4 p-4 bg-light rounded-3">
                    <h4 className="text-success mb-2">Marketing Cookies</h4>
                    <p className="text-muted mb-3">
                        These cookies help us deliver relevant court offers, discounts, and promotions — only if you choose
                        to receive them. No spam, no selling your data.
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Allow Marketing Cookies</span>
                        <input type="checkbox" className="form-check-input" />
                    </div>
                </div>

                <hr className="my-4" />

                <div className="d-flex justify-content-end gap-3">
                    <button className="btn btn-outline-success px-4 py-2">
                        Decline All
                    </button>
                    <button className="btn btn-success px-4 py-2">
                        Save Preferences
                    </button>
                </div>

                <p className="text-muted mt-4">
                    For more details on how we collect and use data, please refer to our{" "}
                    <Link to="/privacy-policy" className="text-success fw-bold">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    )
}

export default ManageCookies
