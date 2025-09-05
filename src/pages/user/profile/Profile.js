import React, { useEffect, useState } from "react";
import { FaCamera, FaUserCircle } from "react-icons/fa";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { getUserProfile, updateUser } from "../../../redux/user/auth/authThunk";

const Profile = () => {
  const User = getUserFromSession();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, userLoading, userError } = useSelector((state) => state?.userAuth);

  // Format date for input
  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Initial form data state
  const initialFormData = {
    fullName: user?.response?.name || User?.name || "",
    email: user?.response?.email || User?.email || "",
    phone: user?.response?.phoneNumber || User?.phoneNumber || "",
    dob: formatDateForInput(user?.response?.dob) || "",
    location: "Chandigarh",
    gender: user?.response?.gender || User?.gender || "",
    profileImage: user?.response?.profilePic || User?.profilePic || "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [initialState, setInitialState] = useState(initialFormData);

  // Fetch user profile and update form data
  useEffect(() => {
    dispatch(getUserProfile()).then((result) => {
      if (result.payload) {
        const newFormData = {
          fullName: result.payload.response?.name || User?.name || "",
          email: result.payload.response?.email || User?.email || "",
          phone: result.payload.response?.phoneNumber || User?.phoneNumber || "",
          dob: formatDateForInput(result.payload.response?.dob) || "",
          location: "Chandigarh",
          gender: result.payload.response?.gender || User?.gender || "",
          profileImage: result.payload.response?.profilePic || User?.profilePic || "",
        };
        setFormData(newFormData);
        setInitialState(newFormData); // Store initial state for comparison
      }
    });
  }, [dispatch]);

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
    const [header, base64] = dataURL.split(",");
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
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

    // Compare current formData with initialState to find changed fields
    const changedFields = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== initialState[key]) {
        changedFields[key] = formData[key];
      }
    });

    // Append only changed fields to FormData
    if (changedFields.fullName) payload.append("name", changedFields.fullName);
    if (changedFields.email) payload.append("email", changedFields.email);
    if (changedFields.phone) payload.append("phoneNumber", changedFields.phone);
    if (changedFields.dob) payload.append("dob", changedFields.dob);
    if (changedFields.gender) payload.append("gender", changedFields.gender);
    if (changedFields.profileImage && changedFields.profileImage.startsWith("data:image")) {
      const blob = dataURLtoBlob(changedFields.profileImage);
      payload.append("profilePic", blob, "profile.jpg");
    }

    // Only append location if it has changed
    if (changedFields.location) {
      payload.append("location[coordinates][0]", "50.90");
      payload.append("location[coordinates][1]", "80.09");
    }

    // Only dispatch if there are changes
    if (Object.keys(changedFields).length > 0) {
      dispatch(updateUser(payload))
        .then(() => {
          dispatch(getUserProfile());
        })
        .catch((err) => {
          console.error("Update failed:", err);
        });
    } else {
      console.log("No changes detected, skipping API call.");
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="container py-4 mt-5 px-5" style={{  borderRadius: "12px" }}>
      <div className="mt-5"
        style={{
          background: "linear-gradient(to right, #A18CD1, #FBC2EB)",
          height: "80px",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      ></div>

      <form onSubmit={handleSubmit} className="bg-white rounded-bottom shadow p-4">
        <div className="d-flex align-items-center" style={{ marginTop: "-70px" }}>
          <div className="position-relative me-3">
            {formData.profileImage ? (
              <img
                src={formData.profileImage}
                alt="Profile"
                className="rounded-circle border bg-secondary"
                style={{ objectFit: "cover" }}
                width="100"
                height="100"
                loading="lazy"
              />
            ) : (
              <div className="bg-secondary rounded-circle">
                <FaUserCircle size={100} />
              </div>
            )}
            <label
              htmlFor="profileImageUpload"
              className="position-absolute bottom-0 end-0 rounded-circle p-1"
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: "#ca60ad",
                opacity: 0.8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <FaCamera style={{ color: "white", fontSize: "14px" }} />
            </label>
          </div>
          <input
            type="file"
            id="profileImageUpload"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
        </div>

        <div className="row mt-4">
          <div className="col-md-4 mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,10}$/.test(value)) {
                  if (value === "" || /^[6-9]/.test(value)) {
                    setFormData((prev) => ({ ...prev, phone: value }));
                  }
                }
              }}
              className="form-control"
              maxLength={10}
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Location / City</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label d-block">Gender</label>
            {["Female", "Male", "Other"].map((g) => (
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
          <button
            type="submit"
            className="btn text-white px-4"
            style={{ backgroundColor: "#3DBE64" }}
          >
            {userLoading ? <ButtonLoading /> : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;