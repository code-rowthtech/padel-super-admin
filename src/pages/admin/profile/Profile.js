import React, { useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import { getUserFromSession } from '../../../helpers/api/apiCore';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const user = getUserFromSession();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: user?.name,
        email: user?.email,
        phone: `${user?.countryCode} ${user?.phoneNumber}`,
        dob: '2000-07-12',
        location: 'Chandigarh',
        gender: 'Female',
        profileImage: 'https://i.pravatar.cc/40',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, profileImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Profile updated!');
        console.log('Submitted Data:', formData);
    };

    const handleCancel = () => {
        // window.location.reload();
        navigate('/admin/dashboard')
    };

    return (
        <div className="container py-4 px-5" style={{ backgroundColor: '#F3F6FB', borderRadius: '12px' }}>
            <div
                style={{
                    background: 'linear-gradient(to right, #A18CD1, #FBC2EB)',
                    height: '80px',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                }}
            ></div>

            <form onSubmit={handleSubmit} className="bg-white rounded-bottom shadow p-4">
                <div className="d-flex align-items-center" style={{ marginTop: '-70px' }}>
                    {/* Profile Image */}
                    <div className="position-relative me-3">
                        <img
                            src={formData.profileImage}
                            alt="Profile"
                            className="rounded-circle border"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                        {/* Camera Icon */}
                        <label
                            htmlFor="profileImageUpload"
                            className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1"
                            style={{
                                width: '30px',
                                height: '30px',
                                backgroundColor: '#0d6efd', // Bootstrap primary color
                                opacity: 0.8, // Slightly transparent
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <FaCamera style={{ color: 'white', fontSize: '14px' }} />
                        </label>
                    </div>
                    {/* File Input (Hidden) */}
                    <input type="file" id="profileImageUpload" accept="image/*" onChange={handleImageChange} hidden />
                </div>

                <div className="row mt-4">
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Phone Number</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Date of Birth</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Location / City</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label d-block">Gender</label>
                        {['Female', 'Male', 'Other'].map((g) => (
                            <div key={g} className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="gender"
                                    value={g}
                                    checked={formData.gender === g}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label">{g}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-3">
                    <button type="button" className="btn btn-secondary px-4" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button type="submit" className="btn text-white px-4" style={{ backgroundColor: '#3DBE64' }}>
                        Update
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
