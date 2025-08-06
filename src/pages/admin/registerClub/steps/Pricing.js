import { useEffect, useState } from 'react';
import { Form, Row, Col, Button, InputGroup, FormControl, Dropdown } from 'react-bootstrap';
import { getSlots, updatePrice } from '../../../../redux/thunks';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonLoading, DataLoading } from '../../../../helpers/loading/Loaders';
import { useNavigate } from 'react-router-dom';
import { resetClub } from '../../../../redux/admin/club/slice';


const Pricing = () => {
    const dispatch = useDispatch();
    const registerId = sessionStorage.getItem('registerId');
    const { clubLoading, clubData } = useSelector((state) => state.club);
    const PricingData = clubData?.data || [];
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        selectedSlots: 'Morning',
        days: {
            Monday: true,
            Tuesday: false,
            Wednesday: false,
            Thursday: false,
            Friday: false,
            Saturday: false,
            Sunday: false,
        },
        prices: {
            Morning: {},
            Afternoon: {},
            Evening: {},
            All: {},
        },
        changesConfirmed: false,
    });

    // Track if "Select All" is checked
    const [selectAllChecked, setSelectAllChecked] = useState(false);

    // Initialize form data with API response
    useEffect(() => {
        if (
            PricingData &&
            Array.isArray(PricingData) &&
            PricingData?.length > 0 &&
            Array.isArray(PricingData[0]?.courts) &&
            PricingData[0]?.courts?.length > 0 &&
            formData?.selectedSlots
        ) {
            const slotData = PricingData[0]?.courts[0]?.slotTimes || [];

            if (slotData.length > 0) {
                setFormData(prev => {
                    const newPrices = { ...prev.prices };
                    newPrices[prev.selectedSlots] = {}; // Clear previous slots

                    slotData.forEach(slot => {
                        const time12hr = convertTo12HourFormat(slot.time);
                        newPrices[prev.selectedSlots][time12hr] = slot.amount?.toString() || '';
                    });

                    return {
                        ...prev,
                        prices: newPrices
                    };
                });
            }
        }
    }, [PricingData, formData.selectedSlots]);


    // Update selectAllChecked when days change
    useEffect(() => {
        const allSelected = Object.values(formData.days).every(day => day);
        setSelectAllChecked(allSelected);
    }, [formData.days]);

    const convertTo12HourFormat = (time) => {
        const [hour, period] = time.split(' ');
        if (period === 'am') {
            return hour === '12' ? '12:00 AM' : `${hour}:00 AM`;
        } else {
            return hour === '12' ? '12:00 PM' : `${parseInt(hour) + 12}:00 PM`;
        }
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleDayChange = (day) => {
        const updatedDays = Object.keys(formData.days).reduce((acc, d) => {
            acc[d] = d === day;
            return acc;
        }, {});

        setFormData(prevData => ({
            ...prevData,
            days: updatedDays,
        }));

        setSelectAllChecked(false); // uncheck 'Select All' explicitly
    };

    const handleSelectAllChange = (e) => {
        const shouldSelectAll = e.target.checked;
        setSelectAllChecked(shouldSelectAll);

        if (shouldSelectAll) {
            // Select all days
            const allDaysSelected = Object.keys(formData.days).reduce((acc, day) => {
                acc[day] = true;
                return acc;
            }, {});

            setFormData(prevData => ({
                ...prevData,
                days: allDaysSelected,
            }));
        } else {
            // Only Monday selected
            const resetDays = Object.keys(formData.days).reduce((acc, day) => {
                acc[day] = day === 'Monday';
                return acc;
            }, {});

            setFormData(prevData => ({
                ...prevData,
                days: resetDays,
            }));
        }
    };

    const handlePriceChange = (slotType, time, value) => {
        setFormData(prevData => ({
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
        return (
            <div>
                {daysOfWeek?.map((day) => (
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
                                border: '2px solid #1F2937',
                                backgroundColor: formData.days[day] ? '#1F2937' : 'transparent',
                                cursor: 'pointer',
                                marginLeft: 'auto',
                            }}
                        />
                    </Form.Check>
                ))}
            </div>
        );
    };

    const renderTimeSlots = () => {
        if (Object.values(formData.days).every(day => day)) {
            return renderAllSlots();
        }

        const slots = formData.selectedSlots;
        const slotData = PricingData[0]?.slot[0]?.slotTimes || [];
        if (slotData.length === 0) {
            return <div>No slots available for selected day/time</div>;
        }

        return slotData.map((slot) => {
            const time12hr = convertTo12HourFormat(slot.time);
            return (
                <Row key={slot._id} className="align-items-center mb-2">
                    <Col xs={9}>
                        <FormControl
                            readOnly
                            value={time12hr}
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
                                value={formData.prices[slots][time12hr] || ''}
                                onChange={(e) => handlePriceChange(slots, time12hr, e.target.value)}
                                style={{
                                    height: '30px',
                                    border: 'none',
                                    fontSize: '14px',
                                    backgroundColor: 'transparent',
                                }}
                            />
                        </InputGroup>
                    </Col>
                </Row>
            );
        });
    };

    const renderAllSlots = () => {
        const allTimes = PricingData?.[0]?.slot?.[0]?.slotTimes?.map(slot => (slot.time)) || [];
        const selectedTimes = Object.keys(formData.prices.All).filter(
            time => formData.prices.All[time] !== undefined
        );

        const getCommonPrice = () => {
            if (selectedTimes.length === 0) return '';
            const firstPrice = formData.prices.All[selectedTimes[0]];
            const allSame = selectedTimes.every(time => formData.prices.All[time] === firstPrice);
            return allSame ? firstPrice : '';
        };

        const toggleSlot = (time) => {
            setFormData(prev => {
                const newPrices = { ...prev.prices.All };
                if (newPrices[time] === undefined) {
                    newPrices[time] = getCommonPrice() || '';
                } else {
                    delete newPrices[time];
                }
                return {
                    ...prev,
                    prices: {
                        ...prev.prices,
                        All: newPrices
                    }
                };
            });
        };

        const updatePriceForAll = (price) => {
            setFormData(prev => {
                const newPrices = { ...prev.prices.All };
                selectedTimes.forEach(time => {
                    newPrices[time] = price;
                });
                return {
                    ...prev,
                    prices: {
                        ...prev.prices,
                        All: newPrices
                    }
                };
            });
        };

        return (
            <div>
                <div className="d-flex flex-wrap gap-2 mb-3">
                    {allTimes.map(time => {
                        const isSelected = formData.prices.All[time] !== undefined;
                        return (
                            <Button
                                key={time}
                                variant={isSelected ? 'primary' : 'outline-primary'}
                                onClick={() => toggleSlot(time)}
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    color: isSelected ? '#fff' : '#1F2937',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                    backgroundColor: isSelected ? '#22C55E' : '#F9FAFB',
                                }}
                            >
                                {time}
                            </Button>
                        );
                    })}
                </div>
                <div className="mt-3">
                    <h5 style={{
                        fontWeight: 700,
                        color: '#1F2937',
                        marginBottom: '10px'
                    }}>
                        {selectedTimes.length > 0
                            ? `Set Price for ${selectedTimes.length} slot${selectedTimes.length > 1 ? 's' : ''}`
                            : 'Set Price (select slots first)'}
                    </h5>
                    <InputGroup>
                        <FormControl
                            placeholder={selectedTimes.length > 0 ? "Enter price" : ""}
                            value={getCommonPrice()}
                            onChange={(e) => updatePriceForAll(e.target.value)}
                            disabled={selectedTimes.length === 0}
                            style={{
                                height: '40px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                fontSize: '14px',
                                backgroundColor: '#fff',
                            }}
                        />
                    </InputGroup>
                </div>
            </div>
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.changesConfirmed) {
            alert('Please confirm that you have completed all changes.');
            return;
        }

        const selectedDays = Object.keys(formData.days).filter(day => formData.days[day]);
        const selectedSlotType = selectAllChecked ? 'All' : formData.selectedSlots;

        // Validate slot prices
        const slotPrices = formData.prices[selectedSlotType];
        if (!slotPrices || Object.keys(slotPrices).length === 0) {
            alert('No prices entered for the selected slot.');
            return;
        }

        // Extract slotTimes and businessHours from the new structure
        const slot = PricingData?.[0]?.slot?.[0];
        const slotData = slot?.slotTimes || [];
        const businessHours = slot?.businessHours || [];

        if (slotData.length === 0 || businessHours.length === 0) {
            alert("Slot times or business hours not found in response.");
            return;
        }
        // Map filled slot times
        function normalizeTime(timeStr) {
            const match = timeStr.match(/(\d+)[\s:]*(am|pm)/i);
            if (!match) return null;
            const h = parseInt(match[1]);
            const ampm = match[2].toLowerCase();
            return `${h} ${ampm}`;
        }

        // Normalize slotPrices keys once
        const normalizedSlotPrices = {};
        for (const [key, price] of Object.entries(slotPrices)) {
            const normalizedKey = key.replace(/:\d{2}/, '').trim().toLowerCase();
            normalizedSlotPrices[normalizedKey] = price;
        }

        // Now filter and map using normalized keys
        const filledSlotTimes = slotData
            .filter(slot => {
                const key = normalizeTime(slot.time); // "6 am"
                const price = normalizedSlotPrices[key];
                return price != null && price.toString().trim() !== '';
            })
            .map(slot => {
                const key = normalizeTime(slot.time);
                const price = parseFloat(normalizedSlotPrices[key]);
                return {
                    _id: slot._id,
                    amount: isNaN(price) ? 0 : price,
                };
            });

        // Map business hours for selected days
        const selectedBusinessHours = businessHours
            .filter(bh => selectedDays.includes(bh.day))
            .map(bh => ({
                _id: bh._id,
                time: bh.time,
            }));

        const courtId = PricingData?.[0]?._id;
        if (!courtId) {
            alert('Court ID is missing.');
            return;
        }

        const payload = {
            _id: courtId,
            businessHoursUpdates: selectedBusinessHours,
            slotTimesUpdates: filledSlotTimes,
        };
        console.log({ payload })
        dispatch(updatePrice(payload))
            .unwrap()
            .then(() => {
                navigate('/admin/dashboard');
                sessionStorage.removeItem('registerId');
                dispatch(resetClub())
            })
            .catch((error) => {
                console.log("Price update failed:", error);
                alert('Failed to update prices. Please try again.');
            });
    };





    useEffect(() => {
        const daysObj = formData.days || {};
        const allDays = Object.keys(daysObj);
        const selectedDays = allDays.filter((day) => daysObj[day]);

        const isAllSelected = selectedDays.length === allDays.length;
        const payloadDays = isAllSelected ? "All" : selectedDays;

        if (selectedDays.length > 0 && registerId && formData.selectedSlots) {
            dispatch(getSlots({ register_club_id: registerId, day: payloadDays, time: !isAllSelected ? formData.selectedSlots : '' }));
        }
    }, [formData.days, registerId, formData.selectedSlots]);
    useEffect(() => {
        const allSelected = Object.values(formData.days).every(Boolean);
        setSelectAllChecked(allSelected);
    }, [formData.days]);

    return (
        <div className="border-top p-4">
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6}>
                        <div className="d-flex justify-content-between">
                            <h5 style={{ fontWeight: 700, color: '#1F2937', marginBottom: '10px' }}>Set Price</h5>
                            <Form.Check
                                type="checkbox"
                                id="selectAll"
                                checked={selectAllChecked}
                                onChange={handleSelectAllChange}
                                label="Select All"
                                style={{
                                    fontSize: '14px',
                                    color: '#1F2937',
                                    fontWeight: 500,
                                }}
                            />
                        </div>
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
                        {!selectAllChecked &&
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
                                </Dropdown.Menu>
                            </Dropdown>
                        }

                        <h5 style={{ fontWeight: 700, color: '#1F2937', marginBottom: '10px' }}>{selectAllChecked ? 'All' : formData.selectedSlots} slots</h5>
                        <div
                            style={{
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                padding: '10px',
                                background: '#F9FAFB',
                            }}
                        >
                            {clubLoading ? <DataLoading /> : <>{renderTimeSlots()}</>}
                        </div>
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

                <div className="d-flex justify-content-end mt-4">
                    {/* <span onClick={() => { navigate('/admin/dashboard') }} style={{ color: '#1F2937', fontWeight: 600, cursor: 'pointer' }} className='d-flex align-items-center'>
                        <i class="bi bi-arrow-left-short fs-4 fw-bold"></i>Back
                    </span> */}
                    <div className="">
                        {/* <Button
                            type="button"
                            // onClick={() => onSave(formData)}
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
                        </Button> */}
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
                            disabled={clubLoading}
                        >
                            {clubLoading ? <ButtonLoading /> : 'Update'}
                        </Button>
                    </div>
                </div>
            </Form >
        </div >
    );
};

export default Pricing;