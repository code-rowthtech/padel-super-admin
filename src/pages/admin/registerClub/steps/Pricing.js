import React, { useState } from 'react';
import { Form, Row, Col, Button, InputGroup, FormControl, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { createSlot } from '../../../../redux/thunks';
import { useDispatch } from 'react-redux';
const Pricing = ({ onSave, onSubmit, onBack }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        selectedSlots: 'Morning', // Default slot type
        days: {
            Monday: true,
            Tuesday: true,
            Wednesday: true,
            Thursday: true,
            Friday: true,
            Saturday: true,
            Sunday: true,
        },
        prices: {
            Morning: {
                '8:00 AM': '',
                '9:00 AM': '',
                '10:00 AM': '',
                '11:00 AM': '',
                '12:00 PM': '',
            },
            Afternoon: {
                '1:00 PM': '',
                '2:00 PM': '',
                '3:00 PM': '',
                '4:00 PM': '',
                '5:00 PM': '',
            },
            Evening: {
                '6:00 PM': '',
                '7:00 PM': '',
                '8:00 PM': '',
                '9:00 PM': '',
                '10:00 PM': '',
                '11:00 PM': '',
            },
            All: {}, // New slot type for "All Slots"
        },
        changesConfirmed: false,
    });

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleDayChange = (day) => {
        setFormData((prevData) => ({
            ...prevData,
            days: {
                ...prevData.days,
                [day]: !prevData.days[day],
            },
        }));
    };

    const handlePriceChange = (slotType, time, value) => {
        setFormData((prevData) => ({
            ...prevData,
            prices: {
                ...prevData.prices,
                [slotType]: {
                    ...prevData.prices[slotType],
                    [time]: value,
                },
            },
        }));
    };

    const handleSlotChange = (slotType) => {
        setFormData({ ...formData, selectedSlots: slotType });
    };

    const renderDays = () => {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return daysOfWeek.map((day) => (
            <Form.Check
                key={day}
                type="checkbox"
                id={day}
                checked={formData.days[day]}
                onChange={() => handleDayChange(day)}
                className="mb-1 d-flex justify-content-between align-items-center"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}
            >
                <Form.Label
                    style={{
                        fontSize: '16px',
                        color: '#1F2937',
                        fontWeight: 500,
                    }}
                >
                    {day}
                </Form.Label>
                <Form.Check.Input
                    type="checkbox"
                    checked={formData.days[day]}
                    onChange={() => handleDayChange(day)}
                    style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        border: '2px solid #1F2937', // Border color for unchecked state
                        backgroundColor: formData.days[day] ? '#1F2937' : 'transparent', // Background color for checked state
                        cursor: 'pointer',
                        marginLeft: 'auto', // Aligns the checkbox to the right
                    }}
                />
            </Form.Check>
        ));
    };

    const renderTimeSlots = () => {
        const slots = formData.selectedSlots;
        const times = Object.keys(formData.prices[slots]);
        return times.map((time) => (
            <Row key={time} className="align-items-center mb-2">
                <Col xs={9}>
                    <FormControl
                        readOnly
                        value={time}
                        style={{
                            height: '30px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            fontSize: '14px',
                            color: '#1F2937',
                        }}
                    />
                </Col>
                <Col xs={3}>
                    <InputGroup>
                        ₹
                        <FormControl
                            placeholder="Price"
                            value={formData.prices[slots][time]}
                            onChange={(e) => handlePriceChange(slots, time, e.target.value)}
                            style={{
                                height: '30px',
                                // borderRadius: '8px',
                                border: 'none',
                                // border: '1px solid #E5E7EB',
                                fontSize: '14px',
                                backgroundColor: 'transparent',
                            }}
                        />
                    </InputGroup>
                </Col>
            </Row>
        ));
    };

    const renderAllSlots = () => {
        const allTimes = [
            '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
            '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
            '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM',
        ];

        // Get currently selected times
        const selectedTimes = Object.entries(formData.prices.All)
            .filter(([_, price]) => price !== '')
            .map(([time]) => time);

        // Handle slot selection
        const handleSlotClick = (time) => {
            setFormData((prevData) => ({
                ...prevData,
                prices: {
                    ...prevData.prices,
                    All: {
                        ...prevData.prices.All,
                        [time]: prevData.prices.All[time] === '' ? '0' : '',
                    },
                },
            }));
        };

        // Handle price change for selected slots
        const handlePriceChange = (time, value) => {
            setFormData((prevData) => ({
                ...prevData,
                prices: {
                    ...prevData.prices,
                    All: {
                        ...prevData.prices.All,
                        [time]: value,
                    },
                },
            }));
        };

        return (
            <div>
                <div className="d-flex flex-wrap gap-2">
                    {allTimes.map((time) => (
                        <Button
                            key={time}
                            variant={formData.prices.All[time] ? 'primary' : 'outline-primary'}
                            onClick={() => handleSlotClick(time)}
                            style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                color: formData.prices.All[time] ? '#fff' : '#1F2937',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                backgroundColor: formData.prices.All[time] ? '#22C55E' : '#F9FAFB',
                            }}
                        >
                            {time}
                        </Button>
                    ))}
                </div>

                {/* Price inputs for selected slots */}
                {selectedTimes.length > 0 && (
                    <>
                        <h5 style={{ fontWeight: 700, color: '#1F2937', marginTop: '20px', marginBottom: '10px' }}>
                            Set Prices
                        </h5>
                        {selectedTimes.map((time) => (
                            <div key={time} style={{ marginBottom: '10px' }}>
                                <InputGroup>
                                    <InputGroup.Text style={{
                                        minWidth: '80px',
                                        fontSize: '14px',
                                        backgroundColor: '#F9FAFB',
                                        border: '1px solid #E5E7EB'
                                    }}>
                                        {time}
                                    </InputGroup.Text>
                                    <FormControl
                                        placeholder="Enter amount"
                                        value={formData.prices.All[time]}
                                        onChange={(e) => handlePriceChange(time, e.target.value)}
                                        style={{
                                            height: '30px',
                                            borderRadius: '8px',
                                            border: '1px solid #E5E7EB',
                                            fontSize: '14px',
                                            backgroundColor: '#fff',
                                        }}
                                    />
                                </InputGroup>
                            </div>
                        ))}
                    </>
                )}
            </div>
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.changesConfirmed) {
            alert('Please confirm that you have completed all changes.');
            return;
        }
        // dispatch(createSlot(formData));
        console.log(formData); // For debugging, you can remove this later
        onSubmit(formData); // Send the data to the parent
    };

    return (
        <div className="border-top p-4">
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6}>
                        <h5 style={{ fontWeight: 700, color: '#1F2937', marginBottom: '10px' }}>Set Price</h5>
                        <div
                            style={{
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                padding: '10px',
                                background: '#F9FAFB',
                            }}
                        >
                            {renderDays()}
                        </div>
                    </Col>
                    <Col md={6}>
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="secondary"
                                id="slot-selector"
                                style={{
                                    backgroundColor: '#F9FAFB',
                                    borderColor: '#E5E7EB',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    fontSize: '14px',
                                    color: '#1F2937',
                                    position: 'absolute',
                                    top: '-1em',
                                    right: '0%',
                                }}
                            >
                                {formData.selectedSlots} slots
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleSlotChange('Morning')}>Morning slots</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSlotChange('Afternoon')}>Afternoon slots</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSlotChange('Evening')}>Evening slots</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSlotChange('All')}>All slots</Dropdown.Item> {/* Added All Slots */}
                            </Dropdown.Menu>
                        </Dropdown>

                        <h5 style={{ fontWeight: 700, color: '#1F2937', marginBottom: '10px' }}>{formData.selectedSlots} slots</h5>

                        {formData.selectedSlots === 'All' ? (
                            renderAllSlots()
                        ) : (
                            <div
                                style={{
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    background: '#F9FAFB',
                                    // marginTop: '2.1em',
                                }}

                            >
                                {renderTimeSlots()}
                            </div>
                        )}
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col>
                        <Form.Check
                            type="checkbox"
                            id="changesConfirmed"
                            checked={formData.changesConfirmed}
                            onChange={(e) => handleChange('changesConfirmed', e.target.checked)}
                            label={
                                <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: 500 }}>
                                    If you done all changes in price module so{' '}
                                    <a href="#" style={{ color: '#22C55E', textDecoration: 'underline' }}>
                                        click
                                    </a>{' '}
                                    this first to move other pages.
                                </span>
                            }
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}
                        />
                    </Col>
                </Row>

                <div className="d-flex justify-content-between mt-4">
                    <span onClick={onBack} style={{ color: '#1F2937', fontWeight: 600, cursor: 'pointer' }} className='d-flex align-items-center'>
                        <i class="bi bi-arrow-left-short fs-4 fw-bold"></i>Back
                    </span>
                    <div className="">
                        <Button
                            type="button"
                            onClick={() => onSave(formData)}
                            style={{
                                backgroundColor: '#22C55E',
                                border: 'none',
                                borderRadius: '30px',
                                padding: '10px 30px',
                                fontWeight: 600,
                                fontSize: '16px',
                                color: '#fff',
                                marginRight: '10px',
                            }}
                        >
                            Save
                        </Button>
                        <Button
                            type="submit"
                            style={{
                                backgroundColor: '#374151',
                                border: 'none',
                                borderRadius: '30px',
                                padding: '10px 30px',
                                fontWeight: 600,
                                fontSize: '16px',
                                color: '#fff',
                            }}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </Form>
        </div >
    );
};

export default Pricing;