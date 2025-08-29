import React from 'react'
import { Button, Card } from 'react-bootstrap'
import { FiArrowRight } from 'react-icons/fi'
import { americano_reactangle } from '../../../assets/files'
import { IoMdFemale } from 'react-icons/io'
import { IoPersonCircleOutline } from 'react-icons/io5'

const Upcoming = ({ tournaments, players }) => {
    return (
        <>
            {tournaments.map((tournament, index) => (
                <div key={index} className="mb-1" style={{
                    border: "none",
                    backgroundImage: `url("${americano_reactangle}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}>
                    <Card.Body className="d-flex border-0 justify-content-between align-items-center p-3">
                        <div>
                            <div className="d-flex mb-2 gap-2">
                                <p className="mb-1 custom-title">{tournament.date}</p>
                                <p className="mb-1 rounded-pill text-white text-center py-1" style={{ background: "#3DBE64", width: "50px" }}>{tournament.grade}</p>
                            </div>
                            <p className="mb-2" style={{ fontSize: '14px', fontWeight: "500", fontFamily: "Poppins", color: "#374151" }}>
                                <IoMdFemale className='me-3' size={20} />
                                {tournament.type}</p>
                            <p className="mb-2" style={{ fontSize: '14px', fontWeight: "500", fontFamily: "Poppins", color: "#374151" }}>
                                <IoPersonCircleOutline className='me-3' size={20} />
                                {tournament.players}</p>
                        </div>
                        <div className=" py-2 d-flex flex-column align-items-center">
                            <div className="d-flex mb-3 bg-white p-2 rounded-pill align-items-center">
                                {players?.slice(0, 4)?.map((player, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-circle border d-flex align-items-center justify-content-center"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            marginLeft: idx !== 0 ? "-10px" : "0",
                                            zIndex: 4 - idx,
                                            backgroundColor: player.profilePic ? "transparent" : "#1F41BB",
                                            overflow: "hidden"
                                        }}
                                    >
                                        {player.profilePic ? (
                                            <img
                                                src={player.profilePic}
                                                alt={player.userId?.name || "Player"}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <span style={{ color: "white", fontWeight: "600", fontSize: "16px" }}>
                                                {player.userId?.name?.charAt(0).toUpperCase() || "P"}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {(players?.length > 4) && (
                                    <div
                                        className="rounded-circle border d-flex align-items-center justify-content-center"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            marginLeft: "-10px",
                                            zIndex: 0,
                                            backgroundColor: "#1F41BB",
                                            color: "white",
                                            fontWeight: "600",
                                            fontSize: "14px"
                                        }}
                                    >
                                        +
                                    </div>
                                )}
                            </div>
                            <Button size="sm" className="border-0 bg-transparent  ms-2" style={{ fontSize: "16px", color: "#1F41BB", fontWeight: "600", fontFamily: "Poppins" }}>
                                Join Now <FiArrowRight />
                            </Button>
                        </div>
                    </Card.Body>
                </div>
            ))}
        </>
    )
}

export default Upcoming