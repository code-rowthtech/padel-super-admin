import React, { useState } from 'react'
import { Button, Card, Col, Container, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import { americano_reactangle, player } from '../../../assets/files';
import { Box, Tab, Tabs } from '@mui/material';
import { IoMdFemale } from "react-icons/io";
import { IoPersonCircleOutline } from 'react-icons/io5';


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
    const [value, setValue] = useState(0);
    const getReviewData = useSelector((store) => store?.userClub?.getReviewData?.data);
    const tournaments = [
        { date: '23 June 9:00 AM', grade: 'B/C', type: 'Female Only', players: '12 Players' },
        { date: '23 June 9:00 AM', grade: 'B/C', type: 'Female Only', players: '12 Players' },
        { date: '23 June 9:00 AM', grade: 'A/B', type: 'Female Only', players: '12 Players' },
        { date: '23 June 9:00 AM', grade: 'A', type: 'Male Only', players: '12 Players' },
        { date: '23 June 9:00 AM', grade: 'C/D', type: 'Female Only', players: '12 Players' },
    ];

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <>
            <Container>
                <Row>
                    <Col md={7} style={{ backgroundColor: "#F5F5F566" }} className="p-4">
                        <Box className="d-flex justify-content-evenly  align-items-center" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs className='' value={value} onChange={handleChange}  centered>
                                <Tab label="Ongoing" {...a11yProps(0)} />
                                <Tab label="Upcoming" {...a11yProps(1)} />
                            </Tabs>
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
                                            <p className="mb-2 " style={{ fontSize: '14px', fontWeight: "500", fontFamily: "Poppins", color: "#374151" }}>
                                                <IoPersonCircleOutline className='me-3' size={20} />
                                                {tournament.players}</p>
                                        </div>
                                        <div>
                                            <Button variant="outline-primary" size="sm" className="rounded-pill">
                                                View Score
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </div>
                            ))}
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={1}>
                            Item Two
                        </CustomTabPanel>
                    </Col>
                    {/* Right Section - Booking Summary */}
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

                                            // Distribute percentages based on averageRating and ratingCategory
                                            const rating = getReviewData?.averageRating || 0;
                                            if (label === getReviewData?.ratingCategory) {
                                                percent = Math.round(rating * 20); // e.g., 3.5 * 20 = 70% for "Good"
                                            } else {
                                                // Estimated distribution for other categories
                                                const basePercent = Math.round((5 - rating) * 20 / 4); // Spread remaining percentage
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
                                                                    idx === 0 ? "#3DBE64" : // Excellent (Green)
                                                                        idx === 1 ? "#7CBA3D" : // Very Good (Dark Green)
                                                                            idx === 2 ? "#ECD844" : // Good (Dark Green)
                                                                                idx === 3 ? "#FC702B" : // Average (Yellow)
                                                                                    "#E9341F", // Poor (Red)
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
                </Row>
            </Container>
        </>
    )
}

export default Americano