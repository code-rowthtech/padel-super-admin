import { FaShareAlt } from "react-icons/fa";
import { BsChatDots } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { getMatchById } from "../../../../redux/thunks";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataLoading } from "../../../../helpers/loading/Loaders";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { padal } from "../../../../assets/files";
import { format } from "date-fns";

const MatchDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { openMatchesLoading, getMatchDetails } = useSelector(
    (state) => state.openMatches
  );

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    dispatch(getMatchById({ id }));
  }, [dispatch, id]);

  // Handle modal open/close
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewUser({ name: "", email: "", phoneNumber: "" });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new user
  const handleAddUser = () => {
    // Assuming addUser is a thunk action that adds a user to the match
    // dispatch(
    //   addUser({ matchId: id, user: { ...newUser, countryCode: "+91" } })
    // );
    handleCloseModal();
  };

  // Format date and time
  //   const formatDate = (dateString) => {
  //     const date = new Date(dateString);
  //     return date.toLocaleDateString("en-GB", {
  //       day: "numeric",
  //       month: "short",
  //     });
  //   };

  const formatTime = (timeString) => {
    return timeString?.split(",")?.join(" - ");
  };

  // Render player or empty slot
  const renderPlayer = (player, index) => {
    if (!player) {
      return (
        <div className="text-center" key={index}>
          <button
            className={`btn ${
              index === 2 ? "btn-outline-primary" : "btn-light border"
            } rounded-circle`}
            style={{
              width: "100px",
              height: "100px",
              fontSize: "24px",
              borderColor: index === 2 ? "#0D6EFD" : "#E5E7EB",
              opacity: index === 2 ? 1 : 0.5,
            }}
            onClick={index === 2 ? handleShowModal : undefined}
          >
            +
          </button>
          {index === 2 && (
            <div className="fw-semibold small mt-2 text-primary">Add Me</div>
          )}
        </div>
      );
    }

    const { userId } = player;
    const initial = userId?.name?.charAt(0)?.toUpperCase();

    return (
      <div className="text-center" key={index}>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: "100px",
            height: "100px",
            backgroundColor: "#374151",
            color: "white",
            fontWeight: 600,
            fontSize: "20px",
          }}
        >
          {initial}
        </div>
        <div className="fw-semibold small mt-2">{userId.name}</div>
        <span
          className="badge rounded-pill"
          style={{ backgroundColor: "#D1FAE5", color: "#059669" }}
        >
          {getMatchDetails.skillLevel.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <div className="container py-3">
      {openMatchesLoading ? (
        <DataLoading height="80vh" />
      ) : (
        <>
          <div
            className="d-flex align-items-center mx-auto"
            style={{ maxWidth: "1024px", cursor: "pointer" }}
            onClick={() => navigate(-1)}
          >
            <div className="col-1 d-flex align-items-center text-primary">
              <i className="bi bi-arrow-left-short fs-4"></i>Back
            </div>
            <div className="col-11 text-center">
              <h4 className="fw-bold mb-0">Match Details</h4>
            </div>
          </div>
          <div
            className="p-4 rounded-4 shadow-sm mx-auto"
            style={{ backgroundColor: "#fff", maxWidth: "1024px" }}
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">
                {getMatchDetails?.clubId?.clubName}
              </h5>
              <div className="d-flex gap-2">
                <div
                  className="d-flex justify-content-center align-items-center rounded-circle p-2 border"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderColor: "#E5E7EB",
                  }}
                >
                  <FaShareAlt size={16} />
                </div>
                <div
                  className="d-flex justify-content-center align-items-center text-white rounded-circle p-2"
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: "#0D6EFD",
                  }}
                >
                  <BsChatDots size={16} />
                </div>
              </div>
            </div>

            {/* Match Details Card */}
            <div
              className="border rounded-3 p-3"
              style={{ backgroundColor: "#F9FBFF" }}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex align-items-center gap-3">
                  <img src={padal} alt="padel" width={32} />
                  <strong>
                    {/* {getMatchDetails?.skillDetails?.[0] || "PADEL"} */}
                    PADEL
                  </strong>
                </div>
                <div className="text-muted small">
                  {getMatchDetails?.matchDate
                    ? format(
                        new Date(getMatchDetails.matchDate),
                        "EEE, dd MMM yyyy"
                      )
                    : "N/A"}{" "}
                  |{" "}
                  {getMatchDetails?.matchTime
                    ? formatTime(getMatchDetails.matchTime)
                    : "N/A"}
                </div>
              </div>

              <div className="row text-center border-top p-1">
                <div className="col border-end">
                  <div className="text-muted">Gender</div>
                  <div className="fw-semibold">
                    {getMatchDetails?.gender.charAt(0).toUpperCase() +
                      getMatchDetails?.gender.slice(1)}
                  </div>
                </div>
                <div className="col border-end">
                  <div className="text-muted">Level</div>
                  <div className="fw-semibold">
                    {getMatchDetails?.skillLevel?.charAt(0).toUpperCase() +
                      getMatchDetails?.skillLevel?.slice(1)}
                  </div>
                </div>
                <div className="col">
                  <div className="text-muted">Price</div>
                  <div className="fw-semibold">
                    ₹ {getMatchDetails?.slot?.[0]?.slotTimes?.[0]?.amount}
                  </div>
                </div>
              </div>
            </div>

            {/* Court Number */}
            <div className="d-flex justify-content-between align-items-center bg-light mt-3 rounded-2 fw-medium p-2">
              <div className="text-muted">Court Number</div>
              <div className="me-1">
                {getMatchDetails?.slot?.[0]?.courtName.split(" ")[1]}
              </div>
            </div>

            {/* Players Section */}
            <div className="mt-4">
              <h6 className="fw-bold mb-3">Players</h6>
              <div className="row align-items-center justify-content-between border rounded-4 p-4">
                {/* Team A Players */}
                <div className="col-6 d-flex justify-content-evenly">
                  {renderPlayer(getMatchDetails?.players?.[0], 0)}
                  {renderPlayer(getMatchDetails?.players?.[1], 1)}
                </div>

                {/* Team B Players */}
                <div className="col-6 d-flex justify-content-evenly border-start">
                  {renderPlayer(getMatchDetails?.players?.[2], 2)}
                  {renderPlayer(getMatchDetails?.players?.[3], 3)}
                </div>
                <div className="d-flex justify-content-between">
                  <div className="fw-semibold small mt-2 text-muted">
                    Team A
                  </div>
                  <div className="fw-semibold small mt-2 text-muted">
                    Team B
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal for Adding User */}
      <Modal
        show={showModal}
        centered
        backdrop="static"
        onHide={handleCloseModal}
      >
        <Modal.Header className="p-2">
          <button
            onClick={handleCloseModal}
            style={{
              position: "absolute",
              top: "5px",
              right: "10px",
              background: "none",
              border: "none",
              fontSize: "26px",
              cursor: "pointer",
              color: "red",
            }}
          >
            ×
          </button>
          <Modal.Title>Add Player</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPhoneNumber">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter phone number"
                name="phoneNumber"
                value={newUser.phoneNumber}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button
            style={{ backgroundColor: "#22c55e" }}
            className="border-0"
            onClick={handleAddUser}
          >
            Add Player
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MatchDetails;
