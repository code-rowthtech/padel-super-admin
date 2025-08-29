import React, { useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Nav,
    NavItem,
    NavLink,
} from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { scrore_bg } from "../../../assets/files";

const ViewScore = ({ setScore }) => {
    const [activeTab, setActiveTab] = useState("leaderboard");

    const players = [
        { id: 1, name: "Dianne", points: 120, record: "8-2-1", img: "https://i.pravatar.cc/50?img=1" },
        { id: 2, name: "Jane", points: 110, record: "8-2-1", img: "https://i.pravatar.cc/50?img=2" },
        { id: 3, name: "Lily", points: 100, record: "8-2-1", img: "https://i.pravatar.cc/50?img=3" },
        { id: 4, name: "Aubrey", points: 95, record: "8-2-1", img: "https://i.pravatar.cc/50?img=4" },
        { id: 5, name: "Connie", points: 90, record: "8-2-1", img: "https://i.pravatar.cc/50?img=5" },
    ];

    return (
        <Col md={5} className="p-0" style={{ backgroundColor: "#1F41BB" }}>
            <div className="position-relative text-white p-3 mb-5  mt-3 d-flex align-items-center">
                <FaArrowLeft
                    size={20}
                    onClick={() => setScore(false)}
                    className="ms-2 position-absolute start-0"
                    style={{ left: "10px", cursor: "pointer" }}
                />

                <h5 className="m-0 w-100 text-center text-white custom-title">Score View</h5>
            </div>


            {/* Tabs */}
            <Nav
                variant="tabs"
                className="justify-content-evenly mb-2 p-2 ms-4 rounded me-4 border-0 text-white"
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                style={{ backgroundColor: "#4668E0" }}
            >
                <NavItem className="flex-fill">
                    <NavLink
                        eventKey="leaderboard"
                        className={
                            activeTab === "leaderboard"
                                ? "active text-white border-0 text-center rounded"
                                : "text-white border-0 text-center rounded"
                        }
                        style={{
                            backgroundColor: activeTab === "leaderboard" ? "#08429F" : "transparent",
                            fontSize: "16px", fontFamily: "Poppins", fontWeight: '600'
                        }}
                    >
                        Leader Board
                    </NavLink>
                </NavItem>
                <NavItem className="flex-fill">
                    <NavLink
                        eventKey="rounds"
                        className={
                            activeTab === "rounds"
                                ? "active text-white border-0 text-center rounded"
                                : "text-white border-0 text-center rounded"
                        }
                        style={{
                            backgroundColor: activeTab === "rounds" ? "#08429F" : "transparent",
                            fontSize: "16px", fontFamily: "Poppins", fontWeight: '600'
                        }}
                    >
                        Rounds
                    </NavLink>
                </NavItem>
            </Nav>


            {/* Tab Content */}
            <Card className="rounded-0 rounded-bottom border-0" style={{ backgroundColor: "#1F41BB" }}>
                {activeTab === "leaderboard" && (
                    <>
                        {/* Rank Info */}
                        <div className="  p-2 pt-3 pb-0 ms-4 rounded me-4 text-center  d-flex align-items-center justify-content-start gap-3" style={{ backgroundColor: "#CBD6FF" }}>
                            <p className="fw-bold rounded py-2 px-3 text-white" style={{ backgroundColor: "#374151" }}>#4</p>
                            <p style={{ color: "#1F41BB", fontSize: "14px", fontWeight: "600", fontFamily: "Poppins" }}>You are doing better than 60% of other players!</p>
                        </div>

                        {/* Podium */}
                        <div
                            className="mb-4"
                            style={{
                                height: "450px",
                                backgroundImage: `url("${scrore_bg}")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                position: "relative",
                            }}
                        >
                            {/* Top podium section */}
                            <div className="d-flex justify-content-center gap-5 align-items-end" style={{ marginTop: "60px" }}>
                                {/* 2nd place */}
                                <div className="text-center mx-2" style={{ marginTop: "40px" }}>
                                    <img src={players[1].img} alt="" className="rounded-circle" width={50} height={50} />
                                    <p className="text-white m-0">{players[1].name}</p>
                                </div>

                                {/* 1st place */}
                                <div className="text-center mx-2" style={{ marginTop: "0px" }}>
                                    <img src={players[0].img} alt="" className="rounded-circle" width={60} height={60} />
                                    <p className="text-white m-0">{players[0].name}</p>
                                </div>

                                {/* 3rd place */}
                                <div className="text-center mx-2" style={{ marginTop: "50px" }}>
                                    <img src={players[2].img} alt="" className="rounded-circle" width={50} height={50} />
                                    <p className="text-white m-0">{players[2].name}</p>
                                </div>
                            </div>

                            <div
                                className="position-absolute start-50 translate-middle-x"
                                style={{
                                    top: "71.5%",
                                    width: "70px",
                                    height: "25px",
                                    backgroundColor: "#fff",
                                    borderRadius: "25px 25px 0 0 ",
                                    zIndex: 10,
                                }}
                            >
                                <div
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        backgroundColor: "#838282ff",
                                        borderRadius: "50%",
                                        margin: "auto",
                                        marginTop: "10px",
                                    }}
                                ></div>
                            </div>                            <div
                                className="p-3 pt-0 position-relative"
                                style={{
                                    overflowY: "auto",
                                    backgroundColor: "#fff",
                                    marginTop: "27%",
                                    borderRadius: "20px 20px 0 0",
                                }}
                            >
                                {/* Center Tab Shape */}


                                {players.map((p, idx) => (
                                    <div
                                        key={p.id}
                                        className="d-flex justify-content-between align-items-center border-bottom py-3"
                                    >
                                        <div className="d-flex align-items-center">
                                            <span className="me-3 fw-bold">{idx + 1}</span>
                                            <img
                                                src={p.img}
                                                alt={p.name}
                                                className="rounded-circle me-2"
                                                width={40}
                                                height={40}
                                            />
                                            <span className="fw-bold">{p.name}</span>
                                        </div>
                                        <div>
                                            <span className="me-3 text-success fw-bold">{p.points} pts</span>
                                            <span className="fw-bold">{p.record}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>



                    </>
                )}

                {activeTab === "rounds" && (
                    <>
                        <h6 className="fw-bold mb-3">Your Match</h6>
                        <Row className="mb-3">
                            <Col className="text-center">
                                <Card className="p-2">
                                    <img src="https://i.pravatar.cc/50?img=6" className="rounded-circle" alt="" />
                                    <div>Claire</div>
                                </Card>
                            </Col>
                            <Col className="text-center align-self-center">
                                <h5>VS</h5>
                            </Col>
                            <Col className="text-center">
                                <Card className="p-2">
                                    <img src="https://i.pravatar.cc/50?img=7" className="rounded-circle" alt="" />
                                    <div>Jane</div>
                                </Card>
                            </Col>
                        </Row>
                        <Button variant="primary" className="w-100 mb-3">
                            View All
                        </Button>

                        {/* Round Matches */}
                        <h6 className="fw-bold">Round 1</h6>
                        <Row>
                            <Col>
                                <Card className="p-2 text-center mb-2">
                                    <span>Benita vs Kathryn</span>
                                    <div className="d-flex justify-content-around mt-2">
                                        <span>16</span>
                                        <span>19</span>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
            </Card>
        </Col >
    );
};

export default ViewScore;
