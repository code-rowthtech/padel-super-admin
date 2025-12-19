import React, { useState, useEffect } from "react";
import { FaEdit, FaUserCircle } from "react-icons/fa";
import { IoTennisballOutline } from "react-icons/io5";
import { getOwnerFromSession } from "../../../helpers/api/apiCore";
import { useNavigate } from "react-router-dom";
import {
  updateOwner,
  updateRegisteredClub,
  getOwnerRegisteredClub,
  createLogo,
} from "../../../redux/thunks";
import { showError } from "../../../helpers/Toast";
import { useDispatch, useSelector } from "react-redux";
import { ButtonLoading, DataLoading } from "../../../helpers/loading/Loaders";

const Profile = () => {
  const user = getOwnerFromSession();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { authLoading } = useSelector((state) => state.ownerAuth);
  const { getClubData, ownerClubLoading } = useSelector(
    (state) => state?.manualBooking
  );

  const statedate = useSelector(
    (state) => state.manualBooking?.ownerClubData?.[0]?.logo
  );
  const ownerId = user?._id || user?.generatedBy;
  const [clubLogo, setClubLogo] = useState(null);
  const [showLogoConfirm, setShowLogoConfirm] = useState(false);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);

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
    city: user?.city || "",
    // gender: user?.gender || "",
    profileImage: user?.profilePic,
  });

  useEffect(() => {
    dispatch(getOwnerRegisteredClub({ ownerId })).unwrap();
  }, [dispatch, ownerId]);

  useEffect(() => {
    setClubLogo(statedate || null);
  }, [statedate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        showError('Only image files are allowed');
        e.target.value = ''; // Clear the input
        return;
      }

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

    if (!file.type.startsWith('image/')) {
      showError('Only image files are allowed');
      e.target.value = '';
      return;
    }

    setPendingLogoFile(file);
    setShowLogoConfirm(true);
    e.target.value = '';
  };

  const confirmLogoChange = () => {
    if (!pendingLogoFile) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setClubLogo(reader.result);

      const formData = new FormData();
      formData.append("ownerId", ownerId);
      formData.append("logo", pendingLogoFile);

      if (statedate) {
        dispatch(updateRegisteredClub(formData))
          .unwrap()
          .then((res) => {
            if (res?.message === "res") {
              dispatch(getOwnerRegisteredClub({ ownerId }));
            }
          });
      } else {
        dispatch(createLogo(formData));
      }
    };
    reader.readAsDataURL(pendingLogoFile);
    setShowLogoConfirm(false);
    setPendingLogoFile(null);
  };

  const cancelLogoChange = () => {
    setShowLogoConfirm(false);
    setPendingLogoFile(null);
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
    payload.append("name", formData.fullName);
    payload.append("email", formData.email);
    payload.append("phoneNumber", formData.phone);
    // if (formData.dob) {
    //   payload.append("dob", formData.dob);
    // }

    // payload.append("location[coordinates][0]", "50.90");
    // payload.append("location[coordinates][1]", "80.09");

    if (formData.city) payload.append("city", formData.city);
    // if (formData.gender) payload.append("gender", formData.gender);

    if (
      formData.profileImage &&
      formData.profileImage.startsWith("data:image")
    ) {
      const blob = dataURLtoBlob(formData.profileImage);
      payload.append("profilePic", blob, "profile.jpg");
    }

    dispatch(updateOwner(payload))
      .then(() => {
        window.location.reload();
      })
      .catch((err) => { });
  };

  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  return (
    <>
      {showLogoConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h5 style={{ marginBottom: "16px" }}>Change Logo</h5>
            <p style={{ marginBottom: "24px" }}>Are you sure you want to change the logo?</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={cancelLogoChange}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogoChange}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="container p-md-5 p-0">
        <div
          style={{
            background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
            height: "80px",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
          className="mt-md-5 mt-3"
        ></div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-bottom shadow p-md-4 p-3"
        >
          <div
            className="d-flex align-items-center"
            style={{ marginTop: "-80px" }}
          >
            <div className="position-relative me-3">
              {ownerClubLoading ? (
                <DataLoading height="100px" color="#ca60ad" />
              ) : (
                <>
                  {clubLogo ? (
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <img
                        src={clubLogo}
                        alt="User Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          // backgroundSize: "cover",
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className="bg-secondary rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ width: "100px", height: "100px" }}
                    >
                      <IoTennisballOutline size={60} color="white" />
                    </div>
                  )}

                  <label
                    htmlFor="logoUpload"
                    className="position-absolute bottom-0 end-0 rounded-pill p-1"
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
            <input
              type="file"
              id="logoUpload"
              accept="image/*"
              onChange={handleLogoChange}
              hidden
            />
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
            {/* <div className="col-md-4 mb-3">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="form-control"
              max="2024-12-31"
            />
          </div> */}
            <div className="col-md-4 mb-3">
              <label className="form-label">Location / City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            {/* <div className="col-md-4 mb-3">
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
          </div> */}
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
              className="btn border-0 text-white px-4"
              style={{
                background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
              }}
            >
              {authLoading ? <ButtonLoading /> : "Update"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Profile;
