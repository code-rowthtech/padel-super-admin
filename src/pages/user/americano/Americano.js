import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import { americano_reactangle, player } from '../../../assets/files';
import { Box, Tab, Tabs } from '@mui/material';
import { IoMdFemale } from "react-icons/io";
import { IoPersonCircleOutline } from 'react-icons/io5';
import { FiArrowRight } from "react-icons/fi";
import { getReviewClub } from '../../../redux/user/club/thunk';
import Upcoming from './Upcoming';
import ViewScore from './ViewScore';
import { styled } from '@mui/system';

const StyledTabs = styled(Tabs)({
  display: "flex",
  justifyContent: "space-evenly",
  width: "100%",
  "& .MuiTabs-flexContainer": {
    display: "flex",
    justifyContent: "space-evenly",
  },
});

const StyledTab = styled(Tab)({
  fontFamily: "Poppins",
  fontSize: "20px",
  fontWeight: 500,
});

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const Americano = () => {
    const dispatch = useDispatch();
    const [value, setValue] = useState(0);
    const [score, setScore] = useState(false);
    const getReviewData = useSelector((store) => store?.userClub?.getReviewData?.data);
    const registerId = localStorage.getItem("register_club_id");

    const tournaments = [
        {
            date: '23 June 9:00 AM', grade: 'B/C', type: 'Female Only', players: '12 Players',
        },
        {
            date: '23 June 9:00 AM', grade: 'B/C', type: 'Female Only', players: '12 Players'
        },
        {
            date: '23 June 9:00 AM', grade: 'A/B', type: 'Female Only', players: '12 Players'
        },
        {
            date: '23 June 9:00 AM', grade: 'A', type: 'Male Only', players: '12 Players'
        },
        { date: '23 June 9:00 AM', grade: 'C/D', type: 'Female Only', players: '12 Players', },
    ];

    const players = [
    ];

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    useEffect(() => {
        if (registerId) {
            dispatch(getReviewClub(registerId));
        }
    }, [registerId]);

    /*
    useEffect(() => {
        if (registerId && selectedDate?.day && selectedDate?.fullDate) {
            const fullDay = new Date(selectedDate.fullDate).toLocaleDateString("en-US", { weekday: "long" });
            dispatch(
                getMatchesSlot({
                    register_club_id: registerId,
                    date: selectedDate.fullDate,
                })
            );
        }
    }, [dispatch, registerId]);
    */

    return (
        <>
            <Container className='mb-4'>
                <Row>
                    <Col md={7} style={{ backgroundColor: "#F5F5F566" }} className="p-4">
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <StyledTabs value={value} onChange={handleChange} aria-label="match tabs">
                                <StyledTab label="Ongoing" {...a11yProps(0)} />
                                <StyledTab label="Upcoming" {...a11yProps(1)} />
                            </StyledTabs>
                        </Box>
                        <CustomTabPanel value={value} index={0}>
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
                                                {players?.slice(0, 3)?.map((player, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="rounded-circle border d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            marginLeft: idx !== 0 ? "-10px" : "0",
                                                            zIndex: 3 - idx,
                                                            backgroundColor: player.profilePic ? "transparent" : "#1F41BB",
                                                            overflow: "hidden"
                                                        }}
                                                    >
                                                        {player.profilePic ? (
                                                            <img
                                                                src={player.profilePic}
                                                                alt={player.userId?.name || "Player"}
                                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <span style={{ color: "white", fontWeight: "600", fontSize: "16px" }}>
                                                                {player.userId?.name?.charAt(0).toUpperCase() || "P"}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                                {tournament.players.length > 3 && (
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
                                                        +{tournament.players.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <Button size="sm" onClick={() => setScore(true)} className="border-0 bg-transparent  ms-2" style={{ fontSize: "16px", color: "#1F41BB", fontWeight: "600", fontFamily: "Poppins" }}>
                                                View Score <FiArrowRight />
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </div>
                            ))}
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={1}>
                            <Upcoming tournaments={tournaments} players={players} />
                        </CustomTabPanel>
                    </Col>
                    {score ? <ViewScore setScore={setScore} /> : (
                        <Col md={5} className="">
                            <div className="container ms-2">
                                <div
                                    className="row align-items-center text-white rounded-4 py-0 pt-2 ps-4"
                                    style={{
                                        background: "linear-gradient(to right, #101826, #1e293b)",
                                        overflow: "visible",
                                        position: "relative",
                                    }}
                                >
                                    <div className="col-md-6 mb-4 mb-md-0">
                                        <button
                                            className="btn create-match-btn text-white border rounded-pill mb-3 ps-3 pe-3"
                                            style={{ fontSize: "14px", fontWeight: "500" }}
                                        >
                                            Americano
                                        </button>
                                        <h4 className="fw-bold">Let the Battles Begin!</h4>
                                        <p className="text-light">Great for competitive vibes.</p>
                                    </div>
                                    <div className="col-md-6 text-center" style={{ position: "relative" }}>
                                        <img
                                            src={player}
                                            alt="Player"
                                            className="img-fluid"
                                            style={{
                                                maxHeight: "390px",
                                                marginTop: "-20px",
                                                zIndex: 999,
                                                position: "relative",
                                            }}
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                                <div className="px-4 py-5 row rounded-4 mt-4 h-100" style={{ backgroundColor: "#F5F5F566" }}>
                                    <div className="col-4 text-center d-flex align-items-center justify-content-center">
                                        <div className="w-100">
                                            <h4 style={{ fontSize: "16px", fontWeight: "500" }}>Overall Rating</h4>
                                            <div className="display-5 fw-bold">{getReviewData?.averageRating || 0}</div>
                                            <div className="text-success">
                                                {[...Array(5)].map((_, i) => {
                                                    const rating = getReviewData?.averageRating || 0;
                                                    if (i < Math.floor(rating)) {
                                                        return <StarIcon key={i} style={{ color: "#32B768" }} />;
                                                    } else if (i < rating && rating % 1 >= 0.5) {
                                                        return <StarHalfIcon key={i} style={{ color: "#32B768" }} />;
                                                    } else {
                                                        return <StarBorderIcon key={i} style={{ color: "#ccc" }} />;
                                                    }
                                                })}
                                            </div>
                                            <div className="text-muted mt-2" style={{ fontSize: "12px", fontFamily: "Poppins" }}>
                                                based on {getReviewData?.totalReviews || 0} reviews
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-8 border-start d-flex align-items-center">
                                        <div className="w-100">
                                            {["Excellent", "Very Good", "Good", "Average", "Poor"].map((label, idx) => {
                                                let width = "0%";
                                                let percent = 0;
                                                const rating = getReviewData?.averageRating || 0;
                                                if (label === getReviewData?.ratingCategory) {
                                                    percent = Math.round(rating * 20);
                                                } else {
                                                    const basePercent = Math.round((5 - rating) * 20 / 4);
                                                    percent = idx < ["Excellent", "Very Good", "Good"].indexOf(getReviewData?.ratingCategory)
                                                        ? basePercent * (3 - idx)
                                                        : idx > ["Excellent", "Very Good", "Good"].indexOf(getReviewData?.ratingCategory)
                                                            ? basePercent * (idx - 2)
                                                            : basePercent;
                                                }
                                                width = `${percent}%`;
                                                return (
                                                    <div className="d-flex align-items-center justify-content-between mb-1 w-100" key={idx}>
                                                        <div className="me-2 fw-medium" style={{ width: "100px", fontSize: "12px", fontFamily: "Poppins" }}>
                                                            {label}
                                                        </div>
                                                        <div className="progress me-3 w-100" style={{ height: "8px", position: "relative" }}>
                                                            <div
                                                                className="progress-bar"
                                                                style={{
                                                                    width,
                                                                    backgroundColor:
                                                                        idx === 0 ? "#3DBE64" :
                                                                            idx === 1 ? "#7CBA3D" :
                                                                                idx === 2 ? "#ECD844" :
                                                                                    idx === 3 ? "#FC702B" :
                                                                                        "#E9341F",
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div
                                                            style={{
                                                                color: "#000",
                                                                fontSize: "12px",
                                                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                                                            }}
                                                        >
                                                            {percent}%
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    )}
                </Row>
            </Container>
        </>
    );
};

export default Americano;