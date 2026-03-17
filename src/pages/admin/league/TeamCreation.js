import React, { useState } from "react";
import { Container, Row, Col, Dropdown } from "react-bootstrap";
import { MdShuffle } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { LuPencilLine } from "react-icons/lu";

const TeamCreation = () => {
    const [selectedLeague, setSelectedLeague] = useState("league-1");
    const [activeTab, setActiveTab] = useState("A/B");
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showShuffleHelp, setShowShuffleHelp] = useState(false);

    // Static Dummy Data
    const leagues = [
        { leagueId: "league-1", leagueName: "Summer Padel League" },
        { leagueId: "league-2", leagueName: "Winter Championship" }
    ];

    const allCategories = [
        { id: "A/B", label: "A/B (16)", count: 16 },
        { id: "C/D", label: "C/D (24)", count: 24 },
        { id: "Women's", label: "Women's (12)", count: 12 },
        { id: "All", label: "All Player (52)", count: 52 }
    ];

    const dummyTeams = {
        "A/B": [
            { id: 1, name: "Team A", players: [{ playerName: "Alex Johnson", customerData: { profileImage: "" } }, { playerName: "Sam Smith" }] },
            { id: 2, name: "Team B", players: [{ playerName: "Chris Brown" }, null] },
            { id: 3, name: "Team C", players: [null, null] },
            { id: 4, name: "Team D", players: [{ playerName: "Mike Davis" }, { playerName: "Sarah Wilson" }] },
        ],
        "C/D": [
            { id: 1, name: "Team A", players: [{ playerName: "Alice" }, { playerName: "Bob" }] },
            { id: 2, name: "Team B", players: [null, null] }
        ],
        "Women's": [
            { id: 1, name: "Team A", players: [{ playerName: "Emma" }, { playerName: "Olivia" }] }
        ]
    };

    const availablePlayers = [
        { _id: "p1", playerName: "Tom Hardy" },
        { _id: "p2", playerName: "Emma Stone" },
        { _id: "p3", playerName: "Ryan Gosling" }
    ];

    const getNameInitials = (name) => {
        if (!name) return 'P';
        return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
    };

    const handleAddPlayer = (teamId) => {
        setOpenDropdown(openDropdown === teamId ? null : teamId);
    };

    return (
        <Container fluid className="p-4 bg-white" style={{ minHeight: "100vh" }}>
            <div className="mb-4">
                <div className="d-flex justify-content-end align-items-center mb-3 flex-wrap gap-2">
                    {selectedLeague && activeTab && activeTab !== "All" && (
                        <div className="d-flex align-items-center gap-2">
                            {showShuffleHelp && (
                                <div className="d-flex align-items-center gap-2 text-dark" style={{ fontSize: "12px" }}>
                                    <span>💡 Drag players between teams to shuffle</span>
                                    <button
                                        onClick={() => setShowShuffleHelp(false)}
                                        style={{ background: "none", border: "none", color: "#999", fontSize: "16px" }}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={() => setShowShuffleHelp(!showShuffleHelp)}
                                className="btn d-flex align-items-center gap-2"
                                style={{
                                    backgroundColor: "#1F41BB",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "8px 16px",
                                    fontSize: "14px",
                                    fontWeight: "500"
                                }}
                            >
                                <MdShuffle size={16} />
                                Shuffle Teams
                            </button>
                        </div>
                    )}
                    <select
                        className="form-select"
                        value={selectedLeague}
                        onChange={(e) => setSelectedLeague(e.target.value)}
                        style={{ minWidth: '200px', maxWidth: '250px' }}
                    >
                        <option value="">Select League</option>
                        {leagues.map((league) => (
                            <option key={league.leagueId} value={league.leagueId}>
                                {league.leagueName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tabs */}
                {selectedLeague && (
                    <div className="d-flex gap-2 mb-4 border-top ps-2">
                        {allCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                style={{
                                    padding: "10px 16px",
                                    border: "none",
                                    backgroundColor: activeTab === cat.id ? "#1F41BB" : "transparent",
                                    color: activeTab === cat.id ? "white" : "#6b7280",
                                    borderRadius: "0px 0px 8px 8px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* League Selection & Teams Grid */}
                {!selectedLeague ? (
                    <div className="text-center py-5">
                        <h5 className="text-muted">Please select a league to view team creation</h5>
                    </div>
                ) : (
                    <Row className="g-4">
                        {activeTab === "All" ? (
                            // Show all dummy teams 
                            Object.keys(dummyTeams).flatMap(category =>
                                dummyTeams[category]?.map((team) => {
                                    const globalTeamId = `${category}-${team.id}`;
                                    return (
                                        <Col key={globalTeamId} lg={3} md={6} sm={12}>
                                            <div
                                                style={{
                                                    background: 'linear-gradient(100.97deg, #FDFDFF 0%, #9EBAFF 317.27%)',
                                                    border: "1px solid #E0E3F2",
                                                    borderRadius: "16px",
                                                    padding: "20px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "16px",
                                                }}
                                            >
                                                <div className="d-flex gap-2 align-items-center">
                                                    <h6 className="mb-0 fw-semibold" style={{ color: "rgba(31, 65, 187, 1)", fontSize: "16px" }}>
                                                        {team.name} ({category})
                                                    </h6>
                                                    <LuPencilLine size={18} style={{ color: "rgba(31, 65, 187, 1)", cursor: "pointer" }} />
                                                </div>

                                                <div className="d-flex align-items-center justify-content-evenly gap-3">
                                                    {[0, 1].map((playerIndex) => {
                                                        const player = team.players[playerIndex];
                                                        return (
                                                            <div
                                                                key={playerIndex}
                                                                className="d-flex flex-column align-items-center gap-2"
                                                                style={{
                                                                    cursor: player ? 'pointer' : 'pointer',
                                                                    position: 'relative'
                                                                }}
                                                            >
                                                                {player ? (
                                                                    <>
                                                                        <div style={{ position: 'relative' }}>
                                                                            {player.customerData?.profileImage ? (
                                                                                <img
                                                                                    src={player.customerData.profileImage}
                                                                                    alt={player.playerName || 'Player'}
                                                                                    style={{
                                                                                        width: "50px",
                                                                                        height: "50px",
                                                                                        borderRadius: "50%",
                                                                                        objectFit: "cover",
                                                                                        border: showShuffleHelp ? "2px dashed #1F41BB" : "none"
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <div
                                                                                    style={{
                                                                                        width: "50px",
                                                                                        height: "50px",
                                                                                        borderRadius: "50%",
                                                                                        backgroundColor: "#1F41BB",
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        justifyContent: "center",
                                                                                        color: "white",
                                                                                        fontSize: "16px",
                                                                                        fontWeight: "600"
                                                                                    }}
                                                                                >
                                                                                    {getNameInitials(player.playerName)}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <p className="mb-0 text-center" style={{ fontSize: "11px", fontFamily: "Poppins", fontWeight: "500", color: "rgba(31, 65, 187, 1)" }}>
                                                                            {player.playerName || 'Player'}
                                                                        </p>
                                                                    </>
                                                                ) : (
                                                                    <div className="d-flex flex-column align-items-center gap-2">
                                                                        <div
                                                                            style={{
                                                                                width: "50px",
                                                                                height: "50px",
                                                                                borderRadius: "50%",
                                                                                backgroundColor: "#f0f0f0",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                            }}
                                                                        >
                                                                            <span style={{ fontSize: "20px", color: "#ccc" }}>+</span>
                                                                        </div>
                                                                        <p className="mb-0 text-center" style={{ fontSize: "11px", color: "#999" }}>Empty</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </Col>
                                    );
                                }) || []
                            )
                        ) : (
                            // Specific Category Dummy Teams
                            (dummyTeams[activeTab] || []).map((team) => {
                                return (
                                    <Col key={team.id} lg={3} md={6} sm={12}>
                                        <div
                                            style={{
                                                background: 'linear-gradient(100.97deg, #FDFDFF 0%, #9EBAFF 317.27%)',
                                                border: "1px solid #E0E3F2",
                                                borderRadius: "16px",
                                                padding: "20px",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "16px",
                                            }}
                                        >
                                            <div className="d-flex gap-2 align-items-center">
                                                <h6 className="mb-0 fw-semibold" style={{ color: "rgba(31, 65, 187, 1)", fontSize: "16px" }}>
                                                    {team.name}
                                                </h6>
                                                <LuPencilLine size={18} style={{ color: "rgba(31, 65, 187, 1)", cursor: "pointer" }} />
                                            </div>

                                            <div className="d-flex align-items-center justify-content-evenly gap-3">
                                                {[0, 1].map((playerIndex) => {
                                                    const player = team.players[playerIndex];
                                                    const dropdownId = `${team.id}-${playerIndex}`;
                                                    return (
                                                        <div
                                                            key={playerIndex}
                                                            className="d-flex flex-column align-items-center gap-2 position-relative"
                                                        >
                                                            {player ? (
                                                                <>
                                                                    <div style={{ position: 'relative' }}>
                                                                        {player.customerData?.profileImage ? (
                                                                            <img
                                                                                src={player.customerData.profileImage}
                                                                                alt={player.playerName || 'Player'}
                                                                                style={{
                                                                                    width: "50px",
                                                                                    height: "50px",
                                                                                    borderRadius: "50%",
                                                                                    objectFit: "cover",
                                                                                    border: showShuffleHelp ? "2px dashed #1F41BB" : "none"
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div
                                                                                style={{
                                                                                    width: "50px",
                                                                                    height: "50px",
                                                                                    borderRadius: "50%",
                                                                                    backgroundColor: "#1F41BB",
                                                                                    display: "flex",
                                                                                    alignItems: "center",
                                                                                    justifyContent: "center",
                                                                                    color: "white",
                                                                                    fontSize: "16px",
                                                                                    fontWeight: "600",
                                                                                    border: showShuffleHelp ? "2px dashed #fff" : "none"
                                                                                }}
                                                                            >
                                                                                {getNameInitials(player.playerName)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <p className="mb-0 text-center" style={{ fontSize: "11px", fontFamily: "Poppins", fontWeight: "500", color: "rgba(31, 65, 187, 1)" }}>
                                                                        {player.playerName || 'Player'}
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Dropdown show={openDropdown === dropdownId} onToggle={() => setOpenDropdown(openDropdown === dropdownId ? null : dropdownId)}>
                                                                        <Dropdown.Toggle
                                                                            as="button"
                                                                            onClick={() => handleAddPlayer(dropdownId)}
                                                                            style={{
                                                                                backgroundColor: "transparent",
                                                                                border: "2px solid #1F41BB",
                                                                                color: "#1F41BB",
                                                                                padding: "0",
                                                                                borderRadius: "50%",
                                                                                width: "50px",
                                                                                height: "50px",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                cursor: "pointer",
                                                                            }}
                                                                        >
                                                                            <FiPlus size={20} />
                                                                        </Dropdown.Toggle>
                                                                        <Dropdown.Menu style={{ maxHeight: "200px", overflowY: "auto" }}>
                                                                            {availablePlayers.map((availablePlayer) => (
                                                                                <Dropdown.Item
                                                                                    key={availablePlayer._id}
                                                                                    onClick={() => setOpenDropdown(null)}
                                                                                >
                                                                                    {availablePlayer.playerName}
                                                                                </Dropdown.Item>
                                                                            ))}
                                                                        </Dropdown.Menu>
                                                                    </Dropdown>
                                                                    <p className="mb-0 text-center" style={{ fontSize: "11px", fontFamily: "Poppins", fontWeight: "500", color: "rgba(31, 65, 187, 1)" }}>
                                                                        Add Player
                                                                    </p>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })
                        )}
                    </Row>
                )}
            </div>
        </Container>
    );
};

export default TeamCreation;
