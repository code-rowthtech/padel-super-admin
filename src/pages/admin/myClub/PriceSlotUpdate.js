import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { IoArrowBackOutline } from 'react-icons/io5';
import {
    getUserSlotPrice,
    createSlotPrice,
    updateSlotPrice,
    updateSlotBulkPrice,
    getOwnerRegisteredClub
} from '../../../redux/thunks';
import { resetClub } from '../../../redux/admin/club/slice';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonLoading } from '../../../helpers/loading/Loaders';
import { showError, showSuccess } from '../../../helpers/Toast';
import { useNavigate } from 'react-router-dom';
import { getOwnerFromSession } from '../../../helpers/api/apiCore';

const PriceSlotUpdate = ({ onHide, setUpdateImage, onBack, onFinalSuccess }) => {
    console.log('=== PriceSlotUpdate component mounted/rendered ===');
    console.log('Props:', { onHide: !!onHide, setUpdateImage: !!setUpdateImage, onBack: !!onBack, onFinalSuccess: !!onFinalSuccess });
    console.log('isCreateMode (has onBack prop):', !!onBack);
    if (onBack) {
        console.log('PriceSlotUpdate: Running in CREATE MODE (registration flow)');
    } else {
        console.log('PriceSlotUpdate: Running in UPDATE MODE (dashboard access)');
    }
    const [selectedDuration, setSelectedDuration] = useState(60);
    const [allPrice, setAllPrice] = useState('');
    const [rowLoading, setRowLoading] = useState({});
    const [applyAllLoading, setApplyAllLoading] = useState(false);
    const [finishLoading, setFinishLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const owner = getOwnerFromSession();
    const ownerId = owner?.generatedBy || owner?._id;
    const slotPrice = useSelector((state) => state?.userSlot?.slotPriceData?.data || []);
    const slotPriceLoading = useSelector((state) => state?.userSlot?.slotPriceLoading || false);
    const { ownerClubData } = useSelector((state) => state.manualBooking);
    const registerId = ownerClubData?.[0]?._id || sessionStorage.getItem("registerId") || "";
    console.log({ slotPrice });
    // CREATE MODE जब onBack है → पहली बार prices create कर रहे हैं
    const isCreateMode = !!onBack;
    console.log({ slotPriceLoading });
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const periods = [
        { name: 'Morning', value: 'morning', slotTime: '5:00 AM - 11:00 AM' },
        { name: 'Afternoon', value: 'afternoon', slotTime: '12:00 PM - 4:00 PM' },
        { name: 'Evening', value: 'evening', slotTime: '5:00 PM - 11:00 PM' },
    ];

    const periodRanges = {
        morning: '5:00 AM - 11:00 AM',
        afternoon: '12:00 PM - 4:00 PM',
        evening: '5:00 PM - 11:00 PM',
    };

    const [prices, setPrices] = useState(() => {
        const initial = {};
        days.forEach(day => {
            initial[day] = { morning: '', afternoon: '', evening: '' };
        });
        return initial;
    });

    const [selectedPeriodByDay, setSelectedPeriodByDay] = useState({});
    const [updateAllLoading, setUpdateAllLoading] = useState(false);
    const [updatedInputs, setUpdatedInputs] = useState(new Set()); // Track which inputs were updated

    // Check if update all button should be enabled
    const canUpdateAll = () => {
        const filledInputs = [];
        const unupdatedInputs = [];

        days.forEach(day => {
            periods.forEach(period => {
                const inputKey = `${day}-${period.value}`;
                if (prices[day]?.[period.value]?.trim()) {
                    filledInputs.push(inputKey);
                    if (!updatedInputs.has(inputKey)) {
                        unupdatedInputs.push(inputKey);
                    }
                }
            });
        });

        return filledInputs.length >= 2 && unupdatedInputs.length >= 2;
    };
    // Clear updated inputs when duration changes
    useEffect(() => {
        setUpdatedInputs(new Set());
    }, [selectedDuration]);

    useEffect(() => {
        if (slotPrice.length === 0) return;

        const updatedPrices = {};
        days.forEach(day => {
            updatedPrices[day] = { morning: '', afternoon: '', evening: '' };
        });

        slotPrice.forEach(entry => {
            if (entry.duration === selectedDuration) {  // ← यह जरूरी check
                const periodKey = entry.timePeriod;
                if (updatedPrices[entry.day] && periodKey) {
                    updatedPrices[entry.day][periodKey] = String(entry.price);
                }
            }
        });

        setPrices(updatedPrices);
    }, [slotPrice, selectedDuration]);


    const ownerApiCalledRef = useRef(false);
    const slotPriceInitCalledRef = useRef(false);

    useEffect(() => {
        if (!registerId) return;

        // first time page open
        if (!slotPriceInitCalledRef.current) {
            slotPriceInitCalledRef.current = true;
        }

        dispatch(getUserSlotPrice({
            register_club_id: registerId,
            day: "",
            duration: selectedDuration
        }));
    }, [registerId, selectedDuration]);


    useEffect(() => {
        if (!onBack) return;              // ✅ only create mode
        if (!ownerId) return;
        if (ownerApiCalledRef.current) return;

        ownerApiCalledRef.current = true;
        dispatch(getOwnerRegisteredClub({ ownerId }));
    }, [onBack, ownerId]);


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

        // Remove this input from updatedInputs when value changes
        const inputKey = `${day}-${period}`;
        setUpdatedInputs(prev => {
            const newSet = new Set(prev);
            newSet.delete(inputKey);
            return newSet;
        });
    };

    // Helper: Full create payload बनाओ (entered prices के साथ)
    const generateCreatePayload = () => {
        const payload = [];

        days.forEach(day => {
            periods.forEach(period => {
                const priceStr = prices[day][period.value];
                const price = parseInt(priceStr, 10);
                if (price > 0) {
                    payload.push({
                        duration: selectedDuration,
                        day: day,
                        price: price,
                        slotTime: period.slotTime,
                        timePeriod: period.value,
                        register_club_id: registerId
                    });
                }
            });
        });

        return payload;
    };

    // Update all filled inputs with their current prices
    const updateAllPrices = async () => {
        setUpdateAllLoading(true);

        if (isCreateMode) {
            // Create mode: send full payload
            const payload = generateCreatePayload();

            if (payload.length === 0) {
                setUpdateAllLoading(false);
                return showError("No prices to update");
            }

            try {
                await dispatch(createSlotPrice(payload)).unwrap();
            } catch (err) {
                showError("Failed to create prices");
            }
        } else {
            // Update mode: send only id and price for existing entries
            const updates = [];

            days.forEach(day => {
                periods.forEach(period => {
                    const currentPrice = prices[day][period.value];
                    const price = parseInt(currentPrice, 10);

                    if (price > 0) {
                        // Find existing entry in slotPrice
                        const existingEntry = slotPrice.find(entry =>
                            entry.day === day &&
                            entry.duration === selectedDuration &&
                            entry.timePeriod === period.value
                        );

                        if (existingEntry) {
                            updates.push({
                                id: existingEntry._id,
                                price: price
                            });
                        }
                    }
                });
            });

            // if (updates.length === 0) {
            //     setUpdateAllLoading(false);
            //     return showError("No prices to update");
            // }

            try {
                await dispatch(updateSlotPrice({ updates })).unwrap();
                dispatch(getUserSlotPrice({ register_club_id: registerId, day: "", duration: selectedDuration }));
            } catch (err) {
                showError("Failed to update prices");
            }
        }

        // Mark all filled inputs as updated
        const filledInputKeys = [];
        days.forEach(day => {
            periods.forEach(period => {
                if (prices[day]?.[period.value]?.trim()) {
                    filledInputKeys.push(`${day}-${period.value}`);
                }
            });
        });
        setUpdatedInputs(new Set(filledInputKeys));

        setUpdateAllLoading(false);
    };
    const applyAllPrice = async () => {
        console.log('applyAllPrice called');
        if (!allPrice.trim()) {
            showError("Please enter a price");
            return;
        }

        const numericPrice = parseInt(allPrice.replace(/[^0-9]/g, ''), 10);
        if (numericPrice <= 0) {
            showError("Invalid price");
            return;
        }

        setApplyAllLoading(true);

        // Fill all input fields with this price
        setPrices(prev => {
            const updated = { ...prev };
            days.forEach(day => {
                periods.forEach(period => {
                    updated[day][period.value] = String(numericPrice);
                });
            });
            return updated;
        });

        if (isCreateMode) {
            // Create mode: call createSlotPrice with full payload (all fields filled)
            const payload = days.flatMap(day =>
                periods.map(period => ({
                    duration: selectedDuration,
                    day: day,
                    price: numericPrice,
                    slotTime: period.slotTime,
                    timePeriod: period.value,
                    register_club_id: registerId
                }))
            );

            console.log("Create Mode - Apply All Payload:", payload);

            try {
                const result = await dispatch(createSlotPrice(payload)).unwrap();
                console.log('applyAllPrice API result:', result);
                // DO NOT navigate here - only navigate when user clicks Finish
            } catch (err) {
                showError("Failed to create prices");
            }
        } else {
            // Update mode: bulk update
            const payload = {
                updateMultiple: true,
                register_club_id: registerId,
                duration: selectedDuration,
                price: numericPrice
            };

            try {
                await dispatch(updateSlotBulkPrice(payload)).unwrap();
                dispatch(getUserSlotPrice({ register_club_id: registerId, day: "", duration: selectedDuration }));
            } catch (err) {
                showError("Bulk update failed");
            }
        }

        setAllPrice('');
        setApplyAllLoading(false);
    };

    // Single Row Update — works in both modes
    const handleRowUpdate = async (dayName) => {
        setRowLoading(prev => ({ ...prev, [dayName]: true }));

        if (isCreateMode) {
            // Create mode: send all currently entered prices
            const payload = generateCreatePayload();

            if (payload.length === 0) {
                setRowLoading(prev => ({ ...prev, [dayName]: false }));
                return showError("No prices entered");
            }

            console.log("Create Mode - Row Update Payload:", payload);

            try {
                const result = await dispatch(createSlotPrice(payload)).unwrap();
                console.log('handleRowUpdate API result:', result);
                // DO NOT navigate here - only navigate when user clicks Finish
            } catch (err) {
                showError("Failed to create prices");
            }
        } else {
            // Update mode: update ALL filled periods for this day
            const updates = [];

            periods.forEach(period => {
                const currentPrice = prices[dayName][period.value];
                const price = parseInt(currentPrice, 10);

                if (price > 0) {
                    // Find existing entry in slotPrice
                    const existingEntry = slotPrice.find(entry =>
                        entry.day === dayName &&
                        entry.duration === selectedDuration &&
                        entry.timePeriod === period.value
                    );

                    if (existingEntry) {
                        updates.push({
                            id: existingEntry._id,
                            price: price
                        });
                    }
                }
            });

            // if (updates.length === 0) {
            //     setRowLoading(prev => ({ ...prev, [dayName]: false }));
            //     return showError("No prices to update for this day");
            // }

            const payload = { updates };
            console.log('Update Mode - Row Update Payload:', payload);

            try {
                await dispatch(updateSlotPrice(payload)).unwrap();
                dispatch(getUserSlotPrice({ register_club_id: registerId, day: "", duration: selectedDuration }));
                
                // Mark all updated inputs for this day
                periods.forEach(period => {
                    if (prices[dayName][period.value]) {
                        const inputKey = `${dayName}-${period.value}`;
                        setUpdatedInputs(prev => new Set([...prev, inputKey]));
                    }
                });
            } catch (err) {
                showError("Update failed");
            }
        }

        setRowLoading(prev => ({ ...prev, [dayName]: false }));
    };

    const handleFinish = async () => {
        console.log('handleFinish called - user clicked Finish button');
        setFinishLoading(true);

        if (isCreateMode) {
            // Check if prices already exist in slotPrice data
            const existingPrices = slotPrice.filter(entry => entry.duration === selectedDuration);
            
            if (existingPrices.length > 0) {
                // Prices already exist, just navigate to dashboard
                console.log('PriceSlotUpdate: Prices already exist, navigating to dashboard');
                onFinalSuccess?.();
                navigate("/admin/dashboard");
                sessionStorage.removeItem("registerId");
                localStorage.removeItem("clubFormData");
                localStorage.removeItem("owner_signup_id");
                dispatch(resetClub());
                setFinishLoading(false);
                return;
            }

            // Create payloads for both 30min and 60min durations
            const payloads = [];
            
            // 30min duration payload
            const payload30 = days.flatMap(day =>
                periods?.map(period => {
                    const currentPrice = prices[day]?.[period.value];
                    const price = parseInt(currentPrice, 10) || 0;
                    return {
                        duration: 30,
                        day: day,
                        price: price,
                        slotTime: period.slotTime,
                        timePeriod: period.value,
                        register_club_id: registerId
                    };
                })
            );
            
            // 60min duration payload
            const payload60 = days.flatMap(day =>
                periods?.map(period => {
                    const currentPrice = prices[day]?.[period.value];
                    const price = parseInt(currentPrice, 10) || 0;
                    return {
                        duration: 60,
                        day: day,
                        price: price,
                        slotTime: period.slotTime,
                        timePeriod: period.value,
                        register_club_id: registerId
                    };
                })
            );

            try {
                // Send both payloads
                const res30 = await dispatch(createSlotPrice(payload30)).unwrap();
                const res60 = await dispatch(createSlotPrice(payload60)).unwrap();
                
                console.log('30min payload result:', res30);
                console.log('60min payload result:', res60);
                
                if ((res30?.success === true || res30?.data || res30?.status === 200) &&
                    (res60?.success === true || res60?.data || res60?.status === 200)) {
                    console.log('PriceSlotUpdate: Finish successful, navigating to dashboard');
                    onFinalSuccess?.();
                    navigate("/admin/dashboard");
                    sessionStorage.removeItem("registerId");
                    localStorage.removeItem("clubFormData");
                    localStorage.removeItem("owner_signup_id");
                    dispatch(resetClub());
                } else {
                    showError("Failed to create prices");
                }
                setFinishLoading(false);
            } catch (err) {
                showError("Failed to create prices");
                setFinishLoading(false);
            }
        } 
    };

    return (
        <>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h6
                    onClick={() => onHide?.()}
                    style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#374151',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: 'Poppins',
                        gap: '8px'
                    }}
                >
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
                        className="form-control py-1"
                        style={{
                            boxShadow: "none",
                            width: '140px',
                            padding: '8px 5px',
                            borderRadius: '6px',
                            textAlign: 'center'
                        }}
                        disabled={applyAllLoading}
                    />

                    <Button
                        variant="success"
                        size="sm"
                        disabled={applyAllLoading || !allPrice.trim()}
                        onClick={applyAllPrice}
                    >
                        {applyAllLoading ? <ButtonLoading color="white" /> : 'Apply to all'}
                    </Button>

                    <div className="d-flex border" style={{ borderRadius: '6px', overflow: 'hidden' }}>
                        {[30, 60].map((dur) => (
                            <Button
                                key={dur}
                                variant={selectedDuration === dur ? 'success' : 'outline-success'}
                                size="sm"
                                onClick={() => setSelectedDuration(dur)}
                                className="rounded-0 border-0"
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
                        {slotPriceLoading ? (
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
                                    {periods.map(() => (
                                        <td style={{
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
                            days?.map(day => {
                                const isRowLoading = rowLoading[day] && !applyAllLoading;

                                if (isRowLoading) {
                                    return (
                                        <tr key={day}>
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
                                            {periods.map(() => (
                                                <td key={Math.random()} style={{
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
                                    );
                                }

                                return (
                                    <tr key={day}>
                                        <td style={{
                                            padding: '12px 10px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            borderBottom: '1px solid #dee2e6',
                                        }}>
                                            {day}
                                        </td>
                                        {periods.map(period => (
                                            <td key={period.value} style={{
                                                padding: '10px',
                                                textAlign: 'center',
                                                borderBottom: '1px solid #dee2e6',
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#495057' }}>
                                                        {periodRanges[period.value]}
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
                                                {rowLoading[day] ? <ButtonLoading color="white" /> : 'Update'}
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Update All Button - Bottom Right */}
                <div className="d-flex justify-content-end pt-3">
                    <Button
                        variant="success"
                        size="sm"
                        disabled={!canUpdateAll() || updateAllLoading || applyAllLoading}
                        onClick={updateAllPrices}
                        style={{ minWidth: '100px' }}
                    >
                        {updateAllLoading ? <ButtonLoading color="white" /> : 'Update All'}
                    </Button>
                </div>

                {isCreateMode && (
                    <div className="d-flex justify-content-end gap-3 pt-3">
                        <Button variant="secondary" onClick={() => { onBack(); setUpdateImage?.(true); }}>
                            Back
                        </Button>
                        <Button variant="success" onClick={handleFinish} disabled={finishLoading}>
                            {finishLoading ? <ButtonLoading color="white" /> : 'Finish'}
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};

export default PriceSlotUpdate;