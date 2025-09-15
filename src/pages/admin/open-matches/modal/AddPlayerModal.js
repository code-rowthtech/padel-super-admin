import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { addPlayers } from "../../../../redux/thunks";
import { Usersignup } from "../../../../redux/user/auth/authThunk";
import { resetAuth } from "../../../../redux/user/auth/authSlice";
import { showError } from "../../../../helpers/Toast";
import { ButtonLoading } from "../../../../helpers/loading/Loaders";
import Select from "react-select";

const AddPlayerModal = ({ show, onHide, team, matchId, onPlayerAdded }) => {
  const dispatch = useDispatch();
  const { userSignUpLoading, errorSignUp } = useSelector(
    (state) => state.userAuth
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "",
    level: "",
  });
  const [selectedTeam, setSelectedTeam] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!show) {
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        gender: "",
        level: "",
      });
      setSelectedTeam("");
      setErrors({});
    } else if (team !== "Team A | B") {
      setSelectedTeam(team);
    }
  }, [show, team]);

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.length < 2)
      newErrors.name = "Name must be at least 2 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required";
    else if (formData.phoneNumber.length !== 10)
      newErrors.phoneNumber = "Phone number must be 10 digits";
    if (!formData.level) newErrors.level = "Level is required";
    if (team === "Team A | B" && !selectedTeam)
      newErrors.team = "Team is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapTeam = (teamStr) => {
    if (teamStr === "Team A") return "teamA";
    if (teamStr === "Team B") return "teamB";
    return teamStr;
  };

  const handleAddPlayer = () => {
    if (!validate()) return;

    const userData = {
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      gender: formData.gender,
      level: formData.level,
    };

    dispatch(Usersignup(userData))
      .unwrap()
      .then((res) => {
        if (res?.status === "200") {
          const mapTeam = (team) => {
            switch (team) {
              case "Team A":
                return "teamA";
              case "Team B":
                return "teamB";
              default:
                return null;
            }
          };

          const addTeam =
            team === "Team A | B" ? mapTeam(selectedTeam) : mapTeam(team);
          dispatch(
            addPlayers({
              matchId,
              playerId: res?.response?._id,
              team: addTeam,
            })
          ).then((res) => {
            if (!res?.error) {
              onPlayerAdded();
            }
          });
        }
      })
      .catch((err) => {
        showError(
          err?.response?.data?.message || "An error occurred. Please try again."
        );
      })
      .finally(() => {
        dispatch(resetAuth());
      });
  };

  const lavel = [
    {
      code: "A",
      title: "Top Player",
    },
    {
      code: "B1",
      title: "Experienced Player",
    },
    {
      code: "B2",
      title: "Advanced Player",
    },
    {
      code: "C1",
      title: "Confident Player",
    },
    {
      code: "C2",
      title: "Intermediate Player",
    },
    {
      code: "D1",
      title: "Amateur Player",
    },
    {
      code: "D2",
      title: "Novice Player",
    },
    {
      code: "E",
      title: "Entry Level",
    },
  ]

  const levelOptions = lavel.map((item) => ({
    value: item.code,
    label: (
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ color: "#1d4ed8", fontWeight: "600", fontSize: "15px", fontFamily: "Poppins" }}>
          {item.code}
        </span>
        <span style={{ color: "#374151", fontSize: "13px" }}>
          {item.title}
        </span>
      </div>
    )
  }));

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header className="border-0 pb-0">
        <Modal.Title className="fw-bold" style={{ fontSize: "1.25rem" }}>
          {team === "Team A | B"
            ? "Add Player"
            : `Add Player to ${team === "teamA" ? "Team A" : "Team B"}`}
        </Modal.Title>
        <button
          type="button"
          className="btn-close"
          onClick={onHide}
          aria-label="Close"
        ></button>
      </Modal.Header>
      <Modal.Body className="pt-2">
        {errorSignUp && (
          <div className="alert alert-danger" role="alert">
            {errorSignUp}
          </div>
        )}
        <Form>
          {team === "Team A | B" && (
            <div className="mb-3">
              <label className="form-label fw-medium">
                Select Team <span className="text-danger">*</span>
              </label>
              <select
                value={selectedTeam}
                style={{ boxShadow: "none" }}
                disabled={userSignUpLoading}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className={`form-control border p-2 ${errors.team ? "is-invalid" : ""
                  }`}
                aria-label="Select Team"
              >
                <option value="">Select Team</option>
                <option value="Team A">Team A</option>
                <option value="Team B">Team B</option>
              </select>
              {errors.team && (
                <div className="invalid-feedback">{errors.team}</div>
              )}
            </div>
          )}
          <div className="row">
            <div className="col-12 col-md-6 mb-3">
              <label className="form-label fw-medium">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                disabled={userSignUpLoading}
                style={{ boxShadow: "none" }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^[A-Za-z\s]*$/.test(value)) {
                    if (value.length === 0 && value.trim() === "") {
                      setFormData((prev) => ({ ...prev, name: "" }));
                      return;
                    }
                    const formattedValue = value
                      .trimStart()
                      .replace(/\s+/g, " ")
                      .toLowerCase()
                      .replace(/(^|\s)\w/g, (letter) => letter.toUpperCase());
                    setFormData((prev) => ({ ...prev, name: formattedValue }));
                  }
                }}
                className={`form-control border p-2 ${errors.name ? "is-invalid" : ""
                  }`}
                placeholder="Enter your name"
                pattern="[A-Za-z\s]+"
                title="Name can only contain letters and single spaces between words"
                aria-label="Name"
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name}</div>
              )}
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label className="form-label fw-medium">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                style={{ boxShadow: "none" }}
                disabled={userSignUpLoading}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase();
                  if (value === "" || /^[a-z0-9@.]*$/.test(value)) {
                    setFormData((prev) => ({ ...prev, email: value }));
                  }
                }}
                className={`form-control border p-2 ${errors.email ? "is-invalid" : ""
                  }`}
                placeholder="Enter your email"
                aria-label="Email"
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-6 mb-3">
              <label className="form-label fw-medium">
                Phone No <span className="text-danger">*</span>
              </label>
              <div className="input-group border">
                <span className="input-group-text border-0 p-2">
                  <img
                    src="https://flagcdn.com/w40/in.png"
                    alt="IN"
                    width={20}
                  />
                  <span>+91</span>
                </span>
                <input
                  type="text"
                  maxLength={10}
                  disabled={userSignUpLoading}
                  value={formData.phoneNumber}
                  style={{ boxShadow: "none" }}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    if (value === "" || /^[6-9][0-9]{0,9}$/.test(value)) {
                      setFormData((prev) => ({ ...prev, phoneNumber: value }));
                    }
                  }}
                  className={`form-control border-0 p-2 ${errors.phoneNumber ? "is-invalid" : ""
                    }`}
                  placeholder="Enter phone number"
                  pattern="[6-9][0-9]{9}"
                  title="Phone number must be 10 digits and start with 6, 7, 8, or 9"
                  aria-label="Phone Number"
                />
              </div>
              {errors.phoneNumber && (
                <div className="invalid-feedback">{errors.phoneNumber}</div>
              )}
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label className="form-label fw-medium">Gender</label>
              <div className="d-flex flex-wrap gap-3">
                {["Male", "Female", "Other"].map((gender) => (
                  <div key={gender} className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      id={gender}
                      value={gender}
                      checked={formData.gender === gender}
                      disabled={userSignUpLoading}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                    />
                    <label className="form-check-label" htmlFor={gender}>
                      {gender}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium">
              Level <span className="text-danger">*</span>
            </label>
            <Select
              options={levelOptions}
              value={levelOptions.find((opt) => opt.value === formData.level)}
              onChange={(option) => setFormData((prev) => ({ ...prev, level: option.value }))}
              className="basic-single"
              classNamePrefix="select"
              style={{ boxShadow: "none" }}
            />
            {errors.level && (
              <div className="invalid-feedback">{errors.level}</div>
            )}
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <div className="d-flex flex-column flex-sm-row gap-2 w-100">
          <Button
            variant="outline-secondary"
            onClick={onHide}
            disabled={userSignUpLoading}
            className="flex-fill order-2 order-sm-1"
            style={{ minHeight: "45px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddPlayer}
            disabled={userSignUpLoading}
            className="flex-fill order-1 order-sm-2 text-white"
            style={{
              backgroundColor: "#22c55e",
              border: "none",
              minHeight: "45px",
            }}
          >
            {userSignUpLoading ? (
              <ButtonLoading color="white" size={5} />
            ) : (
              "Add Player"
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AddPlayerModal;
