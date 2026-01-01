import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { IoArrowBackOutline } from 'react-icons/io5';
import { getSlots, updateCourt } from '../../../redux/thunks';
import { resetClub } from '../../../redux/admin/club/slice';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonLoading } from '../../../helpers/loading/Loaders';
import { showError } from '../../../helpers/Toast';
import { duration } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const PriceSlotUpdate = ({ onHide, setUpdateImage, onBack, onFinalSuccess }) => {
    const [selectedDuration, setSelectedDuration] = useState(60);
    const [allPrice, setAllPrice] = useState('');
    const [rowLoading, setRowLoading] = useState({});
    const [applyAllLoading, setApplyAllLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { clubData, clubLoading } = useSelector((state) => state.club);
    console.log({ clubData });
    const { ownerClubData } = useSelector((state) => state.manualBooking);
    const registerId = ownerClubData?.[0]?._id || sessionStorage.getItem("registerId") || "";
    const PricingData = clubData?.data || [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [periods, setPeriods] = useState([
        { name: 'Morning', value: 'morning', minHour: 5, maxHour: 12 },
        { name: 'Afternoon', value: 'afternoon', minHour: 12, maxHour: 17 },
        { name: 'Evening', value: 'evening', minHour: 17, maxHour: 23 },
    ]);

    const [periodRanges, setPeriodRanges] = useState({
        morning: '05:00 AM - 11:00 AM',
        afternoon: '12:00 PM - 05:00 PM',
        evening: '06:00 PM - 10:00 PM'
    });

    const [prices, setPrices] = useState(() => {
        const initial = {};
        days.forEach(day => {
            initial[day] = { morning: '', afternoon: '', evening: '' };
        });
        return initial;
    });

    useEffect(() => {
        if (registerId) {
            dispatch(getSlots({
                register_club_id: registerId,
                day: "",
                time: "",
                duration: selectedDuration
            }));
        }
    }, [dispatch, onBack, registerId, selectedDuration]);

    const timeTo24Hour = (timeStr) => {
        if (!timeStr) return 0;
        const match = String(timeStr).trim().toLowerCase().match(/(\d{1,2}):?(\d\d)?\s*(am|pm)/i);
        if (!match) return 0;
        let hour = parseInt(match[1], 10);
        const period = match[3];
        if (period === 'pm' && hour !== 12) hour += 12;
        if (period === 'am' && hour === 12) hour = 0;
        return hour;
    };

    const formatTime = (timeStr) => {
        const match = String(timeStr).trim().toLowerCase().match(/(\d{1,2}):?(\d\d)?\s*(am|pm)/i);
        if (!match) return timeStr;
        let h = parseInt(match[1], 10);
        const m = match[2] ? match[2] : '00';
        const p = match[3].toUpperCase();
        h = h % 12 || 12;
        return `${String(h).padStart(2, "0")}:${m} ${p}`;
    };

    const getSlotTimesForDay = (dayName) => {
        if (PricingData.length === 0) return [];
        const dayIndex = days.indexOf(dayName);
        if (dayIndex === -1) return [];
        return PricingData[0]?.slot?.[dayIndex]?.slotTimes || [];
    };

    useEffect(() => {
        if (PricingData.length === 0) return;

        const sampleSlots = getSlotTimesForDay('Monday');
        if (sampleSlots.length === 0) return;

        const allHours = sampleSlots.map(slot => timeTo24Hour(slot.time));

        const dynamicPeriods = [
            { name: 'Morning', value: 'morning', minHour: 5, maxHour: 12 },
            { name: 'Afternoon', value: 'afternoon', minHour: 12, maxHour: 17 },
            { name: 'Evening', value: 'evening', minHour: 17, maxHour: 23 },
        ].filter(p => allHours.some(h => h >= p.minHour && h < p.maxHour));

        setPeriods(dynamicPeriods);

        const newRanges = {};
        dynamicPeriods.forEach(p => {
            const times = sampleSlots.filter(s => {
                const h = timeTo24Hour(s.time);
                return h >= p.minHour && h < p.maxHour;
            });
            if (times.length > 0) {
                const sorted = times.map(t => timeTo24Hour(t.time)).sort((a, b) => a - b);
                const start = times.find(t => timeTo24Hour(t.time) === sorted[0]);
                const end = times.find(t => timeTo24Hour(t.time) === sorted[sorted.length - 1]);
                newRanges[p.value] = `${formatTime(start?.time)} - ${formatTime(end?.time)}`;
            } else {
                newRanges[p.value] = '-';
            }
        });
        setPeriodRanges(newRanges);

        setPrices(prevPrices => {
            const updated = { ...prevPrices };
            days.forEach(day => {
                const slots = getSlotTimesForDay(day);
                dynamicPeriods.forEach(p => {
                    const periodSlots = slots.filter(s => {
                        const h = timeTo24Hour(s.time);
                        return h >= p.minHour && h < p.maxHour;
                    });
                    if (periodSlots.length === 0) {
                        updated[day][p.value] = '';
                        return;
                    }
                    const amounts = periodSlots.map(s => s.amount).filter(a => a > 0);
                    if (amounts.length === 0) {
                        updated[day][p.value] = '';
                        return;
                    }
                    if (amounts.every(a => a === amounts[0])) {
                        updated[day][p.value] = String(amounts[0]);
                    } else {
                        const frequency = {};
                        amounts.forEach(a => frequency[a] = (frequency[a] || 0) + 1);
                        const mostCommon = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
                        if (frequency[mostCommon] > amounts.length / 2) {
                            updated[day][p.value] = mostCommon;
                        } else {
                            updated[day][p.value] = prevPrices[day]?.[p.value] || '';
                        }
                    }
                });
            });
            return updated;
        });
    }, [PricingData]);
    const [selectedPeriodByDay, setSelectedPeriodByDay] = useState({});

    const handlePriceChange = (day, period, value) => {
        const numeric = value.replace(/[^0-9]/g, '');
        setPrices(prev => ({
            ...prev,
            [day]: { ...prev[day], [period]: numeric }
        }));
        setSelectedPeriodByDay(prev => ({
            ...prev,
            [day]: period
        }));
    };

    // Apply to All
    const applyAllPrice = async () => {
        if (!allPrice.trim()) return;
        const numericPrice = parseInt(allPrice.replace(/[^0-9]/g, ''), 10);
        if (isNaN(numericPrice) || numericPrice <= 0) return;

        setApplyAllLoading(true);

        setPrices(prev => {
            const updated = { ...prev };
            days.forEach(day => {
                periods.forEach(p => {
                    updated[day][p.value] = String(numericPrice);
                });
            });
            return updated;
        });

        const slotUpdates = [];
        const businessHoursUpdates = [];

        days.forEach(dayName => {
            const dayIndex = days.indexOf(dayName);
            const daySlotData = PricingData[0]?.slot?.[dayIndex];
            if (!daySlotData) return;

            if (daySlotData.businessHours?.length > 0) {
                daySlotData.businessHours.forEach(bh => {
                    businessHoursUpdates.push({
                        _id: bh._id,
                        day: bh.day,
                        time: bh.time
                    });
                });
            }

            if (daySlotData?.slotTimes?.length > 0) {
                daySlotData.slotTimes.forEach(slot => {
                    slotUpdates.push({
                        _id: slot?._id,
                        amount: numericPrice,
                        duration: selectedDuration
                    });
                });
            } else {
                // No slotTimes - just send amount and duration
                slotUpdates.push({
                    amount: numericPrice,
                    duration: selectedDuration
                });
            }
        });

        const courtId = PricingData[0]?._id;

        const payload = {
            _id: courtId,
            timePeriod: "all",
            businessHoursUpdates,
            slotTimesUpdates: slotUpdates
        };

        try {
            await dispatch(updateCourt(payload)).unwrap();
            setAllPrice('');
            dispatch(resetClub());
            dispatch(getSlots({ register_club_id: registerId, day: '', time: '', duration: selectedDuration }));
        } catch (err) {
            showError("Update failed");
        } finally {
            setApplyAllLoading(false);
        }
    };

    const handleRowUpdate = async (dayName) => {
        setRowLoading(prev => ({ ...prev, [dayName]: true }));

        const periodValue = selectedPeriodByDay[dayName];

        if (!periodValue) {
            setRowLoading(prev => ({ ...prev, [dayName]: false }));
            return showError("Please enter price first");
        }

        const period = periods.find(p => p.value === periodValue);
        if (!period) {
            setRowLoading(prev => ({ ...prev, [dayName]: false }));
            return showError("Invalid time period");
        }

        const amount = parseInt(prices[dayName]?.[periodValue], 10);
        if (!amount || amount <= 0) {
            setRowLoading(prev => ({ ...prev, [dayName]: false }));
            return showError("Invalid price");
        }

        const dayIndex = days.indexOf(dayName);
        const daySlotData = PricingData[0]?.slot?.[dayIndex];
        const slotUpdates = [];
        const businessHoursUpdates = [];

        if (daySlotData?.businessHours?.length > 0) {
            daySlotData.businessHours.forEach(bh => {
                businessHoursUpdates.push({
                    _id: bh._id,
                    day: bh.day,
                    time: bh.time
                });
            });
        }

        if (daySlotData?.slotTimes?.length > 0) {
            daySlotData.slotTimes.forEach(slot => {
                const hour24 = timeTo24Hour(slot.time);
                if (hour24 >= period.minHour && hour24 < period.maxHour) {
                    slotUpdates.push({
                        _id: slot._id,
                        amount,
                        duration: selectedDuration
                    });
                }
            });
        } else {
            // No slotTimes - just send amount and duration
            slotUpdates.push({
                amount,
                duration: selectedDuration
            });
        }

        const courtId = PricingData[0]?._id;

        const timePeriodMap = {
            morning: "morning",
            afternoon: "afternoon",
            evening: "night"
        };

        const payload = {
            _id: courtId,
            timePeriod: timePeriodMap[periodValue],
            businessHoursUpdates,
            slotTimesUpdates: slotUpdates
        };

        try {
            await dispatch(updateCourt(payload)).unwrap();
            dispatch(resetClub());
            dispatch(getSlots({ register_club_id: registerId, day: '', time: '', duration: selectedDuration }));
        } catch (err) {
            showError("Update failed");
        } finally {
            setRowLoading(prev => ({ ...prev, [dayName]: false }));
        }
    };
    const handleFinish = () => {
        onFinalSuccess();
        navigate("/admin/dashboard");
        sessionStorage.removeItem("registerId");
        localStorage.removeItem("clubFormData");
        localStorage.removeItem("owner_signup_id");
        dispatch(resetClub());
    };

    return (
        <>
            {/* UI same as before */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 onClick={() => {
                    if (onHide) onHide();

                }} style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: 'Poppins',
                    gap: '8px'
                }}>
                    {!onFinalSuccess && (
                        <>
                            <IoArrowBackOutline size={24} /> Back
                        </>
                    )}
                </h6>

                <div className="d-flex align-items-center gap-3">
                    <input
                        type="text"
                        placeholder="Enter price for all"
                        value={allPrice}
                        onChange={(e) => setAllPrice(e.target.value.replace(/[^0-9]/g, ''))}
                        className='form-control py-1'
                        style={{ boxShadow: "none", width: '140px', padding: '8px 5px', borderRadius: '6px', textAlign: 'center' }}
                        disabled={applyAllLoading}
                    />

                    <Button
                        variant="success"
                        size="sm"
                        disabled={!allPrice.trim() || applyAllLoading}
                        onClick={applyAllPrice}
                    >
                        {applyAllLoading ? <ButtonLoading color={'white'} /> : 'Apply to all'}
                    </Button>

                    <div className="d-flex border " style={{ borderRadius: '6px', overflow: 'hidden' }}>
                        {[30, 60].map((dur) => (
                            <Button
                                key={dur}
                                variant={selectedDuration === dur ? 'success' : 'outline-success'}
                                size="sm"
                                onClick={() => setSelectedDuration(dur)}
                                disabled={applyAllLoading}
                                className='rounded-0 border-0'
                                style={{
                                    minWidth: '60px',
                                    fontWeight: selectedDuration === dur ? 'bold' : 'normal',
                                }}
                            >
                                {dur === 30 ? '30m' : '60m'}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Poppins' }}>
                    <thead>
                        <tr>
                            <th style={{
                                width: '150px',
                                textAlign: 'left',
                                padding: '10px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                fontWeight: '600',
                                borderRadius: '10px 0 0 0',
                            }}>
                                Day
                            </th>
                            {periods.map(period => (
                                <th key={period.value} style={{
                                    textAlign: 'center',
                                    padding: '10px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    fontWeight: '600',
                                }}>
                                    {period.name}
                                </th>
                            ))}
                            <th style={{
                                width: '150px',
                                textAlign: 'center',
                                padding: '10px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                fontWeight: '600',
                                borderRadius: '0 10px 0 0',
                            }}>
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {clubLoading ? (
                            // Shimmer Loader Rows
                            [...Array(7)].map((_, index) => (
                                <tr key={`skeleton-${index}`}>
                                    <td style={{
                                        padding: '12px 10px',
                                        borderBottom: '1px solid #dee2e6',
                                    }}>
                                        <div className="shimmer" style={{
                                            height: '20px',
                                            width: '100px',
                                            borderRadius: '4px'
                                        }} />
                                    </td>
                                    {[1, 2, 3].map(col => (
                                        <td key={col} style={{
                                            padding: '10px',
                                            textAlign: 'center',
                                            borderBottom: '1px solid #dee2e6',
                                        }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                                <div className="shimmer" style={{
                                                    height: '12px',
                                                    width: '140px',
                                                    borderRadius: '4px'
                                                }} />
                                                <div className="shimmer" style={{
                                                    height: '36px',
                                                    width: '120px',
                                                    borderRadius: '4px'
                                                }} />
                                            </div>
                                        </td>
                                    ))}
                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                        <div className="shimmer" style={{
                                            height: '32px',
                                            width: '80px',
                                            borderRadius: '6px',
                                            margin: '0 auto'
                                        }} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // Real Data Rows
                            days?.map(day => (
                                <tr key={day}>
                                    <td style={{
                                        padding: '12px 10px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        borderBottom: '1px solid #dee2e6',
                                    }}>
                                        {day}
                                    </td>
                                    {periods?.map(period => (
                                        <td key={period.value} style={{
                                            padding: '10px',
                                            textAlign: 'center',
                                            borderBottom: '1px solid #dee2e6',
                                        }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                                <div style={{ fontSize: '11px', fontWeight: '600', color: '#495057' }}>
                                                    {periodRanges[period.value] || '-'}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={prices[day]?.[period.value] || ''}
                                                    onChange={(e) => handlePriceChange(day, period.value, e.target.value)}
                                                    style={{
                                                        border: '1px solid #ced4da',
                                                        borderRadius: '4px',
                                                        padding: '4px 8px',
                                                        textAlign: 'center',
                                                        fontSize: '13px',
                                                        fontWeight: 'bold',
                                                        color: prices[day]?.[period.value] ? '#28a745' : '#6c757d',
                                                        width: '120px',
                                                        outline: 'none',
                                                    }}
                                                    placeholder="Price"
                                                    disabled={rowLoading[day] || applyAllLoading}
                                                />
                                            </div>
                                        </td>
                                    ))}
                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                        <Button
                                            size="sm"
                                            variant="success"
                                            disabled={rowLoading[day] || applyAllLoading}
                                            onClick={() => handleRowUpdate(day)}
                                        >
                                            {rowLoading[day] ? <ButtonLoading color={'white'} /> : 'Update'}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {onFinalSuccess && (
                    <div className="d-flex justify-content-end gap-3 pt-3">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                onBack();
                                setUpdateImage(true);
                            }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="success"
                            onClick={handleFinish}
                        >
                            Finish
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};

export default PriceSlotUpdate;