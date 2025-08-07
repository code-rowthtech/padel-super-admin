import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import React, { useState } from 'react';
import { Container, Row, Col, Table, Button, Form } from 'react-bootstrap';
import { Tab, Tabs } from '@mui/material';

const BookingHistory = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [searchDate, setSearchDate] = useState('');

    const bookings = [
        { dateTime: '27th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Upcoming' },
        { dateTime: '20th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Upcoming' },
        { dateTime: '16th Jun 2025 10:00AM', courtNumber: 'Court 3', amount: '₹ 1000', status: 'Cancelled' },
        { dateTime: '12th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Complete' },
        { dateTime: '10th Jun 2025 10:00AM', courtNumber: 'Court 2', amount: '₹ 1000', status: 'Upcoming' },
        { dateTime: '8th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Cancelled' },
        { dateTime: '19th Jun 2025 10:00AM', courtNumber: 'Court 2', amount: '₹ 1000', status: 'Complete' },
        { dateTime: '15th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Upcoming' },
        { dateTime: '14th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Cancelled' },
        { dateTime: '13th Jun 2025 10:00AM', courtNumber: 'Court 1', amount: '₹ 1000', status: 'Complete' },
    ];

    const filteredBookings = bookings.filter(booking =>
        (activeTab === 'all' || booking.status.toLowerCase() === activeTab.toLowerCase()) &&
        (searchDate === '' || booking.dateTime.includes(searchDate))
    );

    function a11yProps(index) {
        return {
            id: `full-width-tab-${index}`,
            'aria-controls': `full-width-tabpanel-${index}`,
        };
    }

    const handleChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Container>
            <Row className="mb-3 mt-5">
                <Col md={6}>
                    <h2 className='manual-heading'>Booking History</h2>
                </Col>
                <Col md={6} className="d-flex justify-content-end align-items-center">
                    <Form.Control
                        type="text"
                        placeholder="Select Date (dd/mm/yy)"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="me-2"
                    />
                    <Button variant="outline-secondary">Search</Button>
                </Col>
            </Row>
            <Box sx={{ bgcolor: 'white' }}>
                <AppBar position="static" color="default" className="bg-white  border-light" elevation={0}>
                    <Tabs
                        value={activeTab}
                        onChange={handleChange}
                        textColor="primary"
                        aria-label="booking history tabs"
                    >
                        <Tab 
                            className="fw-medium table-data rounded-pill" 
                            label="All" 
                            value="all" 
                            {...a11yProps(0)} 
                            sx={{ 
                                '&.Mui-selected': { backgroundColor: '#CBD6FFA1', color: 'primary.main' },
                                borderRadius: '20px',
                                margin: '0 4px'
                            }} 
                        />
                        <Tab 
                            className="fw-medium table-data rounded-pill" 
                            label="Upcoming" 
                            value="upcoming" 
                            {...a11yProps(1)} 
                            sx={{ 
                                '&.Mui-selected': { backgroundColor: '#CBD6FFA1', color: 'primary.main' },
                                borderRadius: '20px',
                                margin: '0 4px'
                            }} 
                        />
                        <Tab 
                            className="fw-medium table-data rounded-pill" 
                            label="Cancelled" 
                            value="cancelled" 
                            {...a11yProps(2)} 
                            sx={{ 
                                '&.Mui-selected': { backgroundColor: '#CBD6FFA1', color: 'primary.main' },
                                borderRadius: '20px',
                                margin: '0 4px'
                            }} 
                        />
                        <Tab 
                            className="fw-medium table-data rounded-pill" 
                            label="Complete" 
                            value="complete" 
                            {...a11yProps(3)} 
                            sx={{ 
                                '&.Mui-selected': { backgroundColor: '#CBD6FFA1', color: 'primary.main' },
                                borderRadius: '20px',
                                margin: '0 4px'
                            }} 
                        />
                    </Tabs>
                </AppBar>
            </Box>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Court Number</th>
                        <th>Amount</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.map((booking, index) => (
                        <tr key={index}>
                            <td>{booking.dateTime}</td>
                            <td>{booking.courtNumber}</td>
                            <td>{booking.amount}</td>
                            <td>
                                <Button variant="danger" size="sm">X</Button>{' '}
                                <Button variant="info" size="sm">O</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default BookingHistory;