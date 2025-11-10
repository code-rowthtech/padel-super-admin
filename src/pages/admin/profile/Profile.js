import React, { useState, useEffect } from "react";
import { FaEdit, FaUserCircle } from "react-icons/fa";
import { IoTennisballOutline } from "react-icons/io5";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { useNavigate } from "react-router-dom";
import { updateOwner, getLogo, createLogo, updateLogo } from "../../../redux/thunks";
import { useDispatch, useSelector } from "react-redux";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";

const Profile = () => {
  const user = getOwnerFromSession();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { authLoading } = useSelector((state) => state.ownerAuth);
  const { getLogoData, getLogoLoading } = useSelector((state) => state?.logo);
  const ownerId = user?._id || user?.generatedBy;
  const [clubLogo, setClubLogo] = useState(null);

  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const [formData, setFormData] = useState({
    fullName: user?.name,
    email: user?.email,
    phone: user?.phoneNumber,
    dob: formatDateForInput(user?.dob),
    location: "Chandigarh",
    gender: user?.gender,
    profileImage: user?.profilePic,
  });

  useEffect(() => {
    dispatch(getLogo({ ownerId: ownerId }));
  }, [dispatch, ownerId]);

  useEffect(() => {
    setClubLogo(getLogoData?.logo?.logo?.[0] || null);
  }, [getLogoData?.logo?._id]);

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

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setClubLogo(reader.result);

      const formData = new FormData();
      formData.append("ownerId", ownerId);
      formData.append("image", file);

      if (getLogoData?.logo?._id) {
        dispatch(updateLogo(formData));
      } else {
        dispatch(createLogo(formData));
      }
    };
    reader.readAsDataURL(file);
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
    // payload.append("_id", user._id);
    payload.append("name", formData.fullName);
    payload.append("email", formData.email);
    payload.append("phoneNumber", formData.phone);
    if (formData.dob) {
      payload.append("dob", formData.dob);
    }

    // payload.append("location", formData.location);
    payload.append("location[coordinates][0]", "50.90");
    payload.append("location[coordinates][1]", "80.09");
    payload.append("gender", formData.gender);
    // navigator.geolocation.getCurrentPosition((position) => {
    //     const { latitude, longitude } = position.coords;
    //     const cords = {
    //         latitude, longitude
    //     }
    //     payload.append('location', cords);
    // });

    // Check if profileImage is base64 string or already file
    if (
      formData.profileImage &&
      formData.profileImage.startsWith("data:image")
    ) {
      // Convert base64 to Blob if necessary (optional, but better)
      const blob = dataURLtoBlob(formData.profileImage);
      payload.append("profilePic", blob, "profile.jpg");
    }

    dispatch(updateOwner(payload))
      .then(() => {
        // alert("Profile updated!");
        // navigate('/admin/dashboard')
        window.location.reload();
      })
      .catch((err) => {
        console.error("Update failed:", err);
      });
  };

  const handleCancel = () => {
    // window.location.reload();
    navigate("/admin/dashboard");
  };

  return (
    <div className="container p-5">
      <div
        style={{
          background: "linear-gradient(to right, #A18CD1, #FBC2EB)",
          height: "80px",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
        className="mt-5"
      ></div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-bottom shadow p-4"
      >
        <div
          className="d-flex align-items-center"
          style={{ marginTop: "-80px" }}
        >
          {/* Club Logo */}
          <div className="position-relative me-3">
            {getLogoLoading ? (
              <DataLoading height="100px" color="#ca60ad" />
            ) : (
              <>
                {clubLogo ? (
                  <img
                    src={clubLogo}
                    alt="Club Logo"
                    className="rounded-circle border bg-secondary"
                    style={{ objectFit: "cover" }}
                    width="100"
                    height="100"
                    loading="lazy"
                  />
                ) : (
                  <div className="bg-secondary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "100px", height: "100px" }}>
                    <IoTennisballOutline size={60} color="white" />
                  </div>
                )}

                <label
                  htmlFor="logoUpload"
                  className="position-absolute bottom-0 end-0 rounded-circle p-1"
                  style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: "#565758",
                    opacity: 0.8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <FaEdit style={{ color: "white", fontSize: "14px" }} />
                </label>
              </>
            )}
          </div>
          {/* Logo File Input (Hidden) */}
          <input
            type="file"
            id="logoUpload"
            accept="image/*"
            onChange={handleLogoChange}
            hidden
          />
          {/* Profile Image */}
          {/* <div className="position-relative me-3">
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
              <FaEdit style={{ color: "white", fontSize: "14px" }} />
            </label>
          </div> */}
          {/* Profile File Input (Hidden) */}
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
                  // If not empty, check if first digit is between 6–9
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
          <button
            type="button"
            className="btn btn-secondary px-4"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn text-white px-4"
            style={{ backgroundColor: "#3DBE64" }}
          >
            {authLoading ? <ButtonLoading /> : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
