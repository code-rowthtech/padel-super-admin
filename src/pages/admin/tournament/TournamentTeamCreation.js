import React, { useState, useEffect } from "react";
import { Container, Row, Col, Dropdown, Button } from "react-bootstrap";
import { MdShuffle } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { LuPencilLine } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { getTournaments, getPlayersByCategoryGender, saveTournamentTeams, getTournamentTeams } from "../../../redux/admin/tournament/thunk";
import { DataLoading } from "../../../helpers/loading/Loaders";
import { showError, showSuccess } from "../../../helpers/Toast";

const TournamentTeamCreation = () => {
    const dispatch = useDispatch();
    const { tournaments, loadingTournament, players: availablePlayers, loadingPlayers, savingTeams, teamsData, loadingTeams } = useSelector(s => s.tournament);

    const [selectedTournamentId, setSelectedTournamentId] = useState("");
    const [activeTab, setActiveTab] = useState("");
    const [openDropdown, setOpenDropdown] = useState(null);
    const [teams, setTeams] = useState([]);

    const tournamentsData = Array.isArray(tournaments?.data) ? tournaments.data : [];
    const selectedTournament = tournamentsData.find(t => t._id === selectedTournamentId);
    const categories = selectedTournament?.category || [];
    const selectedCategory = categories.find(cat => cat._id === activeTab);

    useEffect(() => {
        dispatch(getTournaments({ page: 1, limit: 100 }));
    }, [dispatch]);

    useEffect(() => {
        if (tournamentsData.length > 0 && !selectedTournamentId) {
            setSelectedTournamentId(tournamentsData[0]._id);
        }
    }, [tournamentsData, selectedTournamentId]);

    useEffect(() => {
        if (categories.length > 0) {
            setActiveTab(categories[0]._id);
        } else {
            setActiveTab("");
        }
    }, [selectedTournamentId]);

    // Fetch players when tournament or category changes
    useEffect(() => {
        if (!selectedTournamentId || !activeTab) return;
        const selectedCategory = categories.find(cat => cat._id === activeTab);
        if (selectedCategory) {
            const params = { 
                tournamentId: selectedTournamentId, 
                categoryType: selectedCategory.categoryType,
                page: 1,
                limit: 1000 // Get all players for team creation
            };
            
            // Add gender based on tag
            if (selectedCategory.tag === "Men's Doubles") {
                params.gender = "Male";
            } else if (selectedCategory.tag === "Women's Doubles") {
                params.gender = "Female";
            }
            
            dispatch(getPlayersByCategoryGender(params));
        }
    }, [selectedTournamentId, activeTab, dispatch, categories]);

    // Fetch existing teams when tournament or category changes
    useEffect(() => {
        if (!selectedTournamentId || !activeTab) return;
        const selectedCategory = categories.find(cat => cat._id === activeTab);
        if (selectedCategory) {
            dispatch(getTournamentTeams({ 
                tournamentId: selectedTournamentId, 
                categoryType: selectedCategory.categoryType,
                tag: selectedCategory.tag
            }));
        }
    }, [selectedTournamentId, activeTab, dispatch, categories]);

    // Initialize teams when category changes or when existing teams are loaded
    useEffect(() => {
        if (!selectedCategory) return;
        
        const maxParticipants = selectedCategory.maxParticipants || 16;
        const numberOfTeams = Math.floor(maxParticipants / 2);
        
        // Check if we have existing teams from API
        if (teamsData && teamsData.teams && teamsData.teams.length > 0) {
            // Map existing teams from API to component state
            const mappedTeams = teamsData.teams.map((team, index) => ({
                id: index + 1,
                teamName: team.teamName,
                players: team.players.map(p => ({
                    playerId: p.playerId,
                    playerName: p.playerName,
                    phoneNumber: p.phoneNumber,
                    profileImage: p.profileImage || null
                }))
            }));
            
            // Fill remaining empty teams if needed
            const remainingTeams = numberOfTeams - mappedTeams.length;
            if (remainingTeams > 0) {
                const emptyTeams = Array.from({ length: remainingTeams }, (_, i) => ({
                    id: mappedTeams.length + i + 1,
                    teamName: `Team ${String.fromCharCode(65 + mappedTeams.length + i)}`,
                    players: [null, null]
                }));
                setTeams([...mappedTeams, ...emptyTeams]);
            } else {
                setTeams(mappedTeams);
            }
        } else {
            // No existing teams, create empty ones
            const initialTeams = Array.from({ length: numberOfTeams }, (_, i) => ({
                id: i + 1,
                teamName: `Team ${String.fromCharCode(65 + i)}`,
                players: [null, null]
            }));
            setTeams(initialTeams);
        }
    }, [selectedCategory, teamsData]);

    const getNameInitials = (name) => {
        if (!name) return 'P';
        return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').slice(0, 2);
    };

    const handleAddPlayer = (teamId, playerIndex) => {
        const dropdownId = `${teamId}-${playerIndex}`;
        setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
    };

    const handlePlayerSelect = (teamId, playerIndex, player) => {
        setTeams(prevTeams => 
            prevTeams.map(team => {
                if (team.id === teamId) {
                    const newPlayers = [...team.players];
                    newPlayers[playerIndex] = {
                        playerId: player._id,
                        playerName: player.playerName,
                        phoneNumber: player.phoneNumber,
                        profileImage: player.customerData?.profileImage
                    };
                    return { ...team, players: newPlayers };
                }
                return team;
            })
        );
        setOpenDropdown(null);
    };

    const handleRemovePlayer = (teamId, playerIndex) => {
        setTeams(prevTeams => 
            prevTeams.map(team => {
                if (team.id === teamId) {
                    const newPlayers = [...team.players];
                    newPlayers[playerIndex] = null;
                    return { ...team, players: newPlayers };
                }
                return team;
            })
        );
    };

    const handleTeamNameChange = (teamId, newName) => {
        setTeams(prevTeams => 
            prevTeams.map(team => 
                team.id === teamId ? { ...team, teamName: newName } : team
            )
        );
    };

    const getSelectedPlayerIds = () => {
        const ids = new Set();
        teams.forEach(team => {
            team.players.forEach(player => {
                if (player?.playerId) ids.add(player.playerId);
            });
        });
        return ids;
    };

    const handleSaveTeams = async () => {
        if (!selectedTournamentId || !selectedCategory) {
            showError("Please select a tournament and category");
            return;
        }

        // Validate teams
        const validTeams = teams.filter(team => 
            team.players[0]?.playerId && team.players[1]?.playerId
        );

        if (validTeams.length === 0) {
            showError("Please create at least one complete team with 2 players");
            return;
        }

        // Prepare payload
        const payload = {
            tournamentId: selectedTournamentId,
            categoryType: selectedCategory.categoryType,
            tag: selectedCategory.tag,
            teams: validTeams.map(team => ({
                teamName: team.teamName,
                players: team.players.map(p => ({
                    playerId: p.playerId,
                    playerName: p.playerName,
                    phoneNumber: p.phoneNumber
                }))
            }))
        };

        const result = await dispatch(saveTournamentTeams(payload));
        if (result.meta.requestStatus === 'fulfilled') {
            // Refresh teams after successful save
            dispatch(getTournamentTeams({ 
                tournamentId: selectedTournamentId, 
                categoryType: selectedCategory.categoryType,
                tag: selectedCategory.tag
            }));
        }
    };

    const selectedPlayerIds = getSelectedPlayerIds();
    // availablePlayers is directly an array from Redux, not an object with .data
    const playersData = Array.isArray(availablePlayers) ? availablePlayers : [];
    const availablePlayersForSelection = playersData.filter(
        player => player && player._id && !selectedPlayerIds.has(player._id)
    );

    return (
        <Container fluid className="p-4 bg-white" style={{ minHeight: "100vh" }}>
            <div className="mb-4">
                <div className="d-flex justify-content-end align-items-center mb-3 flex-wrap gap-2">
                    {selectedTournamentId && activeTab && (
                        <Button
                            onClick={handleSaveTeams}
                            disabled={savingTeams || loadingPlayers}
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
                            {savingTeams ? "Saving..." : "Save Teams"}
                        </Button>
                    )}
                    <select
                        className="form-select"
                        value={selectedTournamentId}
                        onChange={(e) => setSelectedTournamentId(e.target.value)}
                        style={{ minWidth: '200px', maxWidth: '250px' }}
                    >
                        <option value="">Select Tournament</option>
                        {tournamentsData.map((tournament) => (
                            <option key={tournament._id} value={tournament._id}>
                                {tournament.tournamentName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category Tabs */}
                {selectedTournamentId && categories.length > 0 && (
                    <div className="d-flex gap-2 mb-4 border-top ps-2" style={{ flexWrap: "wrap" }}>
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => setActiveTab(cat._id)}
                                style={{
                                    padding: "10px 16px",
                                    border: "none",
                                    backgroundColor: activeTab === cat._id ? "#1F41BB" : "transparent",
                                    color: activeTab === cat._id ? "white" : "#6b7280",
                                    borderRadius: "0px 0px 8px 8px",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {cat.categoryType} ({cat.tag})
                            </button>
                        ))}
                    </div>
                )}

                {/* Tournament Selection & Teams Grid */}
                {loadingTournament ? (
                    <DataLoading height="50vh" />
                ) : !selectedTournamentId ? (
                    <div className="text-center py-5">
                        <h5 className="text-muted">Please select a tournament to view team creation</h5>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-5">
                        <h5 className="text-muted">No categories found for this tournament</h5>
                    </div>
                ) : loadingPlayers ? (
                    <DataLoading height="50vh" />
                ) : loadingTeams ? (
                    <DataLoading height="50vh" />
                ) : (
                    <>
                        {selectedCategory && (
                            <div className="mb-3 d-flex justify-content-between align-items-center">
                                <div className="text-muted" style={{ fontSize: "14px" }}>
                                    Max Participants: {selectedCategory.maxParticipants} | Teams: {teams.length} | Total Players: {playersData.length} | Available: {availablePlayersForSelection.length}
                                </div>
                                {teamsData && teamsData.teams && teamsData.teams.length > 0 && (
                                    <div className="text-success" style={{ fontSize: "14px", fontWeight: "500" }}>
                                        ✓ {teamsData.teams.length} Existing Teams Loaded
                                    </div>
                                )}
                            </div>
                        )}
                        <Row className="g-4">
                            {teams.map((team) => (
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
                                            <input
                                                type="text"
                                                value={team.teamName}
                                                onChange={(e) => handleTeamNameChange(team.id, e.target.value)}
                                                className="form-control form-control-sm"
                                                style={{
                                                    color: "rgba(31, 65, 187, 1)",
                                                    fontSize: "16px",
                                                    fontWeight: "600",
                                                    border: "none",
                                                    background: "transparent",
                                                    padding: "0"
                                                }}
                                            />
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
                                                                <div 
                                                                    style={{ position: 'relative', cursor: 'pointer' }}
                                                                    onClick={() => handleRemovePlayer(team.id, playerIndex)}
                                                                    title="Click to remove"
                                                                >
                                                                    {player.profileImage ? (
                                                                        <img
                                                                            src={player.profileImage}
                                                                            alt={player.playerName || 'Player'}
                                                                            style={{
                                                                                width: "50px",
                                                                                height: "50px",
                                                                                borderRadius: "50%",
                                                                                objectFit: "cover",
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
                                                                            }}
                                                                        >
                                                                            {getNameInitials(player.playerName)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <p className="mb-0 text-center text-capitalize" style={{ fontSize: "11px", fontFamily: "Poppins", fontWeight: "500", color: "rgba(31, 65, 187, 1)" }}>
                                                                    {player.playerName || 'Player'}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Dropdown show={openDropdown === dropdownId} onToggle={() => setOpenDropdown(openDropdown === dropdownId ? null : dropdownId)}>
                                                                    <Dropdown.Toggle
                                                                        as="button"
                                                                        onClick={() => handleAddPlayer(team.id, playerIndex)}
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
                                                                    <Dropdown.Menu style={{ maxHeight: "200px", overflowY: "auto", minWidth: "250px", width: "auto" }}>
                                                                        {loadingPlayers ? (
                                                                            <Dropdown.Item disabled>Loading players...</Dropdown.Item>
                                                                        ) : availablePlayersForSelection.length === 0 ? (
                                                                            <Dropdown.Item disabled>
                                                                                {playersData.length === 0 ? 'No players found' : 'All players assigned'}
                                                                            </Dropdown.Item>
                                                                        ) : (
                                                                            availablePlayersForSelection.map((availablePlayer) => (
                                                                                <Dropdown.Item
                                                                                    key={availablePlayer._id}
                                                                                    onClick={() => handlePlayerSelect(team.id, playerIndex, availablePlayer)}
                                                                                    className="text-capitalize"
                                                                                    style={{ fontSize: "13px", whiteSpace: "normal", wordWrap: "break-word" }}
                                                                                >
                                                                                    {availablePlayer.playerName}
                                                                                </Dropdown.Item>
                                                                            ))
                                                                        )}
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
                            ))}
                        </Row>
                    </>
                )}
            </div>
        </Container>
    );
};

export default TournamentTeamCreation;
