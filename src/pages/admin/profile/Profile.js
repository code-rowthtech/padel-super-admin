import React, { useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import { getUserFromSession } from '../../../helpers/api/apiCore';
import { useNavigate } from 'react-router-dom';
import { updateOwner } from '../../../redux/thunks';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonLoading } from '../../../helpers/loading/Loaders';

const Profile = () => {
    const user = getUserFromSession();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { authLoading } = useSelector((state) => state.ownerAuth);

    const formatDateForInput = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const [formData, setFormData] = useState({
        fullName: user?.name,
        email: user?.email,
        phone: user?.phoneNumber,
        dob: formatDateForInput(user?.dob),
        location: 'Chandigarh',
        gender: user?.gender,
        profileImage: user?.profilePic,
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


    const dataURLtoBlob = (dataURL) => {
        const [header, base64] = dataURL.split(',');
        const mimeMatch = header.match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const binary = atob(base64);
        const array = [];

        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }

        return new Blob([new Uint8Array(array)], { type: mime });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = new FormData();
        // payload.append("_id", user._id);
        payload.append("name", formData.fullName);
        payload.append("email", formData.email);
        payload.append("phoneNumber", formData.phone);
        payload.append("dob", formData.dob);

        // payload.append("location", formData.location);
        payload.append('location[coordinates][0]', '50.90');
        payload.append('location[coordinates][1]', '80.09');
        payload.append("gender", formData.gender);
        // navigator.geolocation.getCurrentPosition((position) => {
        //     const { latitude, longitude } = position.coords;
        //     const cords = {
        //         latitude, longitude
        //     }
        //     payload.append('location', cords);
        // });

        // Check if profileImage is base64 string or already file
        if (formData.profileImage && formData.profileImage.startsWith('data:image')) {
            // Convert base64 to Blob if necessary (optional, but better)
            const blob = dataURLtoBlob(formData.profileImage);
            payload.append("profilePic", blob, "profile.jpg");
        }

        dispatch(updateOwner(payload))
            .then(() => {
                // alert("Profile updated!");
                // navigate('/admin/dashboard')
            })
            .catch((err) => {
                console.error("Update failed:", err);
            });
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
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Allow only digits and max 10 characters
                                if (/^\d{0,10}$/.test(value)) {
                                    setFormData((prev) => ({ ...prev, phone: value }));
                                }
                            }}
                            className="form-control"
                            maxLength={10}
                        />
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
                        {authLoading ? <ButtonLoading /> : 'Update'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
