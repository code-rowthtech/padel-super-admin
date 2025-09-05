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

    // Create user without team in formData
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
          const addTeam = team === "Team A | B" ? mapTeam(selectedTeam) : team;
          dispatch(
            addPlayers({
              matchId,
              playerId: res?.response?._id,
              team: addTeam,
            })
          ).then(() => {
            onPlayerAdded();
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

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header className="d-flex justify-content-between align-items-center py-1 px-2">
        <Modal.Title>
          {team === "Team A | B"
            ? "Add Player"
            : `Add Player to ${team === "teamA" ? "Team A" : "Team B"}`}
        </Modal.Title>
        <i
          className="bi bi-x fs-2 text-danger fw-bold"
          onClick={onHide}
          style={{ cursor: "pointer" }}
        ></i>
      </Modal.Header>
      <Modal.Body>
        {errorSignUp && (
          <div className="alert alert-danger" role="alert">
            {errorSignUp}
          </div>
        )}
        <Form>
          {team === "Team A | B" && (
            <div className="mb-3">
              <label className="form-label">
                Select Team <span className="text-danger">*</span>
              </label>
              <select
                value={selectedTeam}
                style={{ boxShadow: "none" }}
                disabled={userSignUpLoading}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className={`form-control border p-2 ${
                  errors.team ? "is-invalid" : ""
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
          <div className="mb-3">
            <label className="form-label">
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
              className={`form-control border p-2 ${
                errors.name ? "is-invalid" : ""
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
          <div className="mb-3">
            <label className="form-label">
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
              className={`form-control border p-2 ${
                errors.email ? "is-invalid" : ""
              }`}
              placeholder="Enter your email"
              aria-label="Email"
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">
              Phone No <span className="text-danger">*</span>
            </label>
            <div className="input-group border">
              <span className="input-group-text border-0 p-2">
                <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} />
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
                className={`form-control border-0 p-2 ${
                  errors.phoneNumber ? "is-invalid" : ""
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
          <div className="mb-3">
            <label className="form-label">Gender</label>
            <div className="d-flex gap-3">
              {["Male", "Female", "Other"].map((gender) => (
                <div key={gender}>
                  <input
                    type="radio"
                    id={gender.toLowerCase()}
                    name="gender"
                    disabled={userSignUpLoading}
                    value={gender}
                    checked={formData.gender === gender}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="form-check-input"
                    style={{ boxShadow: "none" }}
                  />
                  <label
                    htmlFor={gender.toLowerCase()}
                    className="form-check-label ms-2"
                  >
                    {gender}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">
              Select Level <span className="text-danger">*</span>
            </label>
            <select
              value={formData.level}
              style={{ boxShadow: "none" }}
              disabled={userSignUpLoading}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, level: e.target.value }))
              }
              className={`form-control border p-2 ${
                errors.level ? "is-invalid" : ""
              }`}
              aria-label="Select Level"
            >
              <option value="">Select Level</option>
              {["A", "B", "C", "D", "A|B", "B|C", "C|D"].map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.level && (
              <div className="invalid-feedback">{errors.level}</div>
            )}
          </div>
          <div className="d-flex justify-content-between">
            <Button
              variant="outline-secondary"
              onClick={onHide}
              style={{ width: "45%" }}
              disabled={userSignUpLoading}
            >
              Cancel
            </Button>
            <Button
              style={{
                width: "45%",
                backgroundColor: "#3DBE64",
                border: "none",
              }}
              className="text-white"
              onClick={handleAddPlayer}
              disabled={userSignUpLoading}
            >
              {userSignUpLoading ? <ButtonLoading /> : "Submit"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddPlayerModal;
