import { useEffect, useState, useCallback } from "react";
import { FaCamera, FaUserCircle } from "react-icons/fa";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import {
  getUserProfile,
  updateUser,
  getStates,
} from "../../../redux/user/auth/authThunk";
import { showError, showSuccess } from "../../../helpers/Toast";

const Profile = () => {
  const User = getUserFromSession();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, userLoading, userError, states, statesLoading } = useSelector(
    (state) => state?.userAuth
  );
  const store = useSelector((state) => state?.userAuth);

  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const initialFormData = {
    fullName:
      user?.response?.name ||
      store?.userSignUp?.response?.name ||
      User?.name ||
      "",
    email:
      user?.response?.email ||
      store?.userSignUp?.response?.email ||
      User?.email ||
      "",
    phone:
      user?.response?.phoneNumber ||
      store?.userSignUp?.response?.phoneNumber ||
      User?.phoneNumber ||
      "",
    dob: formatDateForInput(user?.response?.dob) || "",
    location: user?.response?.city || User?.city || "Chandigarh",
    gender: user?.response?.gender || User?.gender || "",
    profileImage:
      user?.response?.profilePic ||
      store?.userSignUp?.response?.profilePic ||
      User?.profilePic ||
      "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [initialState, setInitialState] = useState(initialFormData);

  useEffect(() => {
    dispatch(getUserProfile()).then((result) => {
      if (result.payload) {
        const newFormData = {
          fullName: result.payload.response?.name || User?.name || "",
          email: result.payload.response?.email || User?.email || "",
          phone:
            result.payload.response?.phoneNumber || User?.phoneNumber || "",
          dob: formatDateForInput(result.payload.response?.dob) || "",
          location: result.payload.response?.city || User?.city || "Chandigarh",
          gender: result.payload.response?.gender || User?.gender || "",
          profileImage:
            result.payload.response?.profilePic || User?.profilePic || "",
        };
        setFormData(newFormData);
      }
    });
    dispatch(getStates());
  }, [dispatch]);
  const updateProfileData = {
    fullName:
      user?.response?.name ||
      store?.userSignUp?.response?.name ||
      User?.name ||
      "",
    email: user?.response?.email || "",
    phone:
      user?.response?.phoneNumber ||
      store?.userSignUp?.response?.phoneNumber ||
      User?.phoneNumber ||
      "",

    profile:
      user?.response?.profilePic ||
      store?.userSignUp?.response?.profilePic ||
      User?.profilePic ||
      "",
    gender:
      user?.response?.gender ||
      store?.userSignUp?.response?.gender ||
      User?.gender ||
      "",
  };

  localStorage.setItem("updateprofile", JSON.stringify(updateProfileData));


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // Prevent unnecessary updates
    if (formData[name] === value) return;

    let formatted = value;
    if (name !== 'email' && value.length > 0) {
      formatted = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formatted,
    }));
  }, [formData]);


  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Only image files are allowed');
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profileImage: reader.result }));
    };
    reader.onerror = () => {
      showError('Failed to read image file');
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  }, []);

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

    const changedFields = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== initialState[key]) {
        changedFields[key] = formData[key];
      }
    });

    if (changedFields.fullName) payload.append("name", changedFields.fullName);
    if (changedFields.email) payload.append("email", changedFields.email);
    if (changedFields.phone) payload.append("phoneNumber", changedFields.phone);
    if (changedFields.dob) payload.append("dob", changedFields.dob);
    if (changedFields.gender) payload.append("gender", changedFields.gender);
    if (
      changedFields.profileImage &&
      changedFields.profileImage.startsWith("data:image")
    ) {
      const blob = dataURLtoBlob(changedFields.profileImage);
      payload.append("profilePic", blob, "profile.jpg");
    }

    if (changedFields.location) {
      payload.append("city", changedFields.location);
    }

    if (Object.keys(changedFields).length > 0) {
      dispatch(updateUser(payload))
        .then((res) => {
          if (res?.payload?.status === '200') {
            showSuccess('Update Successfully')
            dispatch(getUserProfile());

          }
        })
        .catch((err) => {
        });
    } else {
    }
  };

  const handleCancel = () => {
    navigate("/");
  };
  return (
    <div
      className="container py-lg-4 mb-md-5 mb-4 mt-lg-5 px-3 px-md-5"
      style={{ borderRadius: "12px" }}
    >
      <div
        className="mt-md-5 mt-0 height_low"
        style={{
          background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
          height: "80px",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      ></div>

      <form
        onSubmit={handleSubmit}
        className="bg-white mb-md-5 mb-4 rounded-bottom shadow p-3 p-md-4"
      >
        <div
          className="d-md-flex d-none align-items-center"
          style={{ marginTop: "-70px" }}
        >
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
            style={{ boxShadow: "none" }}
          />
        </div>
        <div
          className="d-flex d-md-none align-items-center"
          style={{ marginTop: "-70px" }}
        >
          <div
            className="position-relative me-3"
            style={{
              width: "80px",
              height: "80px",
            }}
          >
            {formData.profileImage ? (
              <img
                src={formData.profileImage}
                alt="Profile"
                className="border bg-secondary"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                }}
                loading="lazy"
              />
            ) : (
              <div
                className=" d-flex align-items-center justify-content-center bg-secondary"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50px"
                }}
              >
                <FaUserCircle style={{ width: "80px", height: "80px" }} />
              </div>
            )}

            <label
              htmlFor="profileImageUpload"
              className="position-absolute"
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: "#ca60ad",
                opacity: 0.9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                bottom: "-5px",
                right: "-5px",
                borderRadius: "50%",
                boxShadow: "0px 2px 8px rgba(0,0,0,0.25)",
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


        <div className="row mt-md-4 mt-3">
          <div className="col-12 col-md-4 mb-3">
            <label className="label">
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="form-control"
              style={{ boxShadow: "none" }}
            />
          </div>
          <div className="col-12 col-md-4 mb-3">
            <label className="label">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData?.email}
              onChange={handleChange}
              className="form-control"
              style={{ boxShadow: "none" }}
            />
          </div>
          <div className="col-12 col-md-4 mb-3">
            <label className="label">
              Phone Number <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              disabled={
                user?.response?.phoneNumber ||
                store?.userSignUp?.response?.phoneNumber ||
                User?.phoneNumber
              }
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
              style={{ boxShadow: "none" }}
            />
          </div>
          <div className="col-12 col-md-4 mb-3">
            <label className="label">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="form-control"
              style={{ boxShadow: "none" }}
              max="2024-12-31"
            />
          </div>
          <div className="col-12 col-md-4 mb-3">
            <label className="label">Location / City</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-control"
              style={{ boxShadow: "none" }}
              disabled={statesLoading}
            >
              <option value="">Select Location</option>
              {states?.data?.map((state) => (
                <option key={state._id} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4 mb-3">
            <label className="label d-block">
              Gender
            </label>
            {["Female", "Male", "Other"].map((g) => {
              const id = `gender-${g}`;

              return (
                <div key={g} className="form-check form-check-inline">
                  <input
                    id={id}
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={handleChange}
                    style={{ boxShadow: "none", cursor: "pointer" }}
                  />
                  <label htmlFor={id} className="form-check-label">
                    {g}
                  </label>
                </div>
              );
            })}

          </div>
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between justify-content-lg-end gap-3 mb-4">
          <button
            type="button"
            className="btn btn-secondary px-4"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn text-white border-0 px-4"
            style={{
              background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
            }}
          >
            {userLoading ? <ButtonLoading color={"white"} /> : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
