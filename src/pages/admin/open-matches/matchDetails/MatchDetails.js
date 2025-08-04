import { FaShareAlt } from "react-icons/fa";
import { BsChatDots } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const MatchDetails = () => {
    const navigate = useNavigate();
    return (
        <div className="container py-3">
            <div
                className="d-flex align-items-center mx-auto "
                style={{ maxWidth: "1024px", cursor: 'pointer' }}
                onClick={() => navigate(-1)}
            >
                <div className="col-1 d-flex align-items-center text-primary">
                    <i class="bi bi-arrow-left-short fs-4"></i>Back
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
                    <h5 className="fw-bold mb-0">The Good Club</h5>

                    <div className="d-flex gap-2">
                        {/* Share Icon */}
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
                        {/* Chat Icon */}
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
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/686/686589.png"
                                alt="padel"
                                width={32}
                            />
                            <strong>PADEL</strong>
                        </div>
                        <div className="text-muted small">21 June | 9:00am - 10:00am</div>
                    </div>

                    <div className="row text-center border-top p-1">
                        <div className="col border-end">
                            <div className="text-muted">Gender</div>
                            <div className="fw-semibold">All players</div>
                        </div>
                        <div className="col border-end">
                            <div className="text-muted">Level</div>
                            <div className="fw-semibold">0.92 ~ 0.132</div>
                        </div>
                        <div className="col">
                            <div className="text-muted">Price</div>
                            <div className="fw-semibold">₹ 2000</div>
                        </div>
                    </div>
                </div>

                {/* Court Number */}
                <div className="d-flex justify-content-between align-items-center bg-light mt-3 rounded-2 fw-medium p-2">
                    <div className="text-muted">Court Number</div>
                    <div>1</div>
                </div>

                {/* Players Section */}
                <div className="mt-4">
                    <h6 className="fw-bold mb-3">Players</h6>
                    <div className="row align-items-center justify-content-between border rounded-4 p-4 ">
                        {/* Team A Players */}
                        <div className="col-6 d-flex justify-content-evenly">
                            <div className="text-center">
                                <img
                                    src="https://randomuser.me/api/portraits/men/75.jpg"
                                    alt="Player"
                                    className="rounded-circle"
                                    style={{ width: "100px", height: "100px" }}
                                />
                                <div className="fw-semibold small mt-2">Courtney Henry</div>
                                <span
                                    className="badge rounded-pill"
                                    style={{ backgroundColor: "#D1FAE5", color: "#059669" }}
                                >
                                    A/B
                                </span>
                            </div>

                            <div className="text-center">
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
                                    DL
                                </div>
                                <div className="fw-semibold small mt-2">Devon Lane</div>
                                <span
                                    className="badge rounded-pill"
                                    style={{ backgroundColor: "#D1FAE5", color: "#059669" }}
                                >
                                    B/C
                                </span>
                            </div>
                        </div>

                        {/* Divider */}
                        {/* <div
                                className="border-end mx-2"
                                style={{ height: "128px", borderWidth: "2px" }}
                            ></div> */}

                        {/* Add Me */}
                        <div className="col-6 d-flex justify-content-evenly border-start">
                            <div className="text-center">
                                <button
                                    className="btn btn-outline-primary rounded-circle"
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        fontSize: "24px",
                                        borderColor: "#0D6EFD",
                                    }}
                                >
                                    +
                                </button>
                                <div className="fw-semibold small mt-2 text-primary">Add Me</div>
                            </div>

                            {/* Empty Spot */}
                            <div className="text-center">
                                <button
                                    className="btn btn-light rounded-circle border"
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        opacity: 0.5,
                                        borderColor: "#E5E7EB",
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between">
                            <div className="fw-semibold small mt-2 text-muted">Team A</div>
                            <div className="fw-semibold small mt-2 text-muted">Team B</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchDetails;