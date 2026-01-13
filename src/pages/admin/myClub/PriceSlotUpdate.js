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
    const [allPrice, setAllPrice] = useState('');
    const [rowLoading, setRowLoading] = useState({});
    const [applyAllLoading, setApplyAllLoading] = useState(false);
    const [finishLoading, setFinishLoading] = useState(false);
    const [allPriceError, setAllPriceError] = useState('');
    const [priceErrors, setPriceErrors] = useState({});
    const [enable30Min, setEnable30Min] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const owner = getOwnerFromSession();
    const ownerId = owner?.generatedBy || owner?._id;
    const slotPrice = useSelector((state) => state?.userSlot?.slotPriceData?.data || []);
    const slotPriceLoading = useSelector((state) => state?.userSlot?.slotPriceLoading || false);
    const { ownerClubData } = useSelector((state) => state.manualBooking);
    const registerId = ownerClubData?.[0]?._id || sessionStorage.getItem("registerId") || "";

    const isCreateMode = !!onBack;

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

    const [updateAllLoading, setUpdateAllLoading] = useState(false);

    const canUpdateAll = () => {
        let filled = 0;
        days.forEach(day => {
            periods.forEach(period => {
                if (prices[day]?.[period.value]?.trim()) filled++;
            });
        });
        return filled >= 2;
    };

    useEffect(() => {
        if (slotPrice.length === 0) return;

        const updatedPrices = {};
        days.forEach(day => {
            updatedPrices[day] = { morning: '', afternoon: '', evening: '' };
        });

        slotPrice.forEach(entry => {
            if (entry.duration === 60) {
                const periodKey = entry.timePeriod;
                if (updatedPrices[entry.day] && periodKey) {
                    updatedPrices[entry.day][periodKey] = String(entry.price);
                }
            }
        });

        setPrices(updatedPrices);
    }, [slotPrice]);

    const ownerApiCalledRef = useRef(false);
    const slotPriceInitCalledRef = useRef(false);

    useEffect(() => {
        if (!registerId) return;

        if (!slotPriceInitCalledRef.current) {
            slotPriceInitCalledRef.current = true;
        }

        dispatch(getUserSlotPrice({
            register_club_id: registerId,
            day: "",
            duration: 60
        }));
    }, [registerId]);

    useEffect(() => {
        if (!onBack) return;
        if (!ownerId) return;
        if (ownerApiCalledRef.current) return;

        ownerApiCalledRef.current = true;
        dispatch(getOwnerRegisteredClub({ ownerId }));
    }, [onBack, ownerId]);

    const handlePriceChange = (day, period, value) => {
        const numeric = value.replace(/[^0-9]/g, '');
        const key = `${day}-${period}`;

        setPrices(prev => ({
            ...prev,
            [day]: { ...prev[day], [period]: numeric }
        }));

        // Validate and set error
        if (numeric && (parseInt(numeric) < 500 || parseInt(numeric) > 4000)) {
            setPriceErrors(prev => ({
                ...prev,
                [key]: 'Price must be between 500 and 4000'
            }));
        } else {
            setPriceErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
            });
        }
    };

    // Always create both 60 and 30 (30 with 0 or half based on checkbox)
    const generateCreatePayload = () => {
        const payload60 = [];
        const payload30 = [];

        days.forEach(day => {
            periods.forEach(period => {
                const price60Str = prices[day]?.[period.value] || '';
                const price60 = parseInt(price60Str, 10) || 0;
                const price30 = enable30Min ? Math.round(price60 / 2) : 0;

                payload60.push({
                    duration: 60,
                    day: day,
                    price: price60,
                    slotTime: period.slotTime,
                    timePeriod: period.value,
                    register_club_id: registerId
                });

                payload30.push({
                    duration: 30,
                    day: day,
                    price: price30,
                    slotTime: period.slotTime,
                    timePeriod: period.value,
                    register_club_id: registerId
                });
            });
        });

        return { payload60, payload30 };
    };

    // For update when enabling 30min later
    const generate30MinHalfUpdatePayload = () => {
        const updates = [];

        days.forEach(day => {
            periods.forEach(period => {
                const price60Str = prices[day]?.[period.value] || '';
                const price60 = parseInt(price60Str, 10) || 0;
                const price30 = Math.round(price60 / 2);

                const existing30 = slotPrice.find(entry =>
                    entry.day === day &&
                    entry.duration === 30 &&
                    entry.timePeriod === period.value
                );

                if (existing30) {
                    updates.push({
                        id: existing30._id,
                        price: price30
                    });
                }
            });
        });

        return updates;
    };

    const updateAllPrices = async () => {
        setUpdateAllLoading(true);

        if (isCreateMode) {
            const { payload60, payload30 } = generateCreatePayload();
            try {
                if (payload60.some(p => p.price > 0)) {
                    await dispatch(createSlotPrice(payload60)).unwrap();
                }
                await dispatch(createSlotPrice(payload30)).unwrap(); // Always create 30min (0 or half)
            } catch (err) {
                showError(err);
            }
        } else {
            // Update mode logic (same as before)
            const updates = [];
            days.forEach(day => {
                periods.forEach(period => {
                    const price60Str = prices[day][period.value];
                    const price60 = parseInt(price60Str, 10) || 0;

                    const existing60 = slotPrice.find(entry =>
                        entry.day === day &&
                        entry.duration === 60 &&
                        entry.timePeriod === period.value
                    );
                    if (existing60 && price60 > 0) {
                        updates.push({ id: existing60._id, price: price60 });
                    }

                    if (enable30Min) {
                        const price30 = Math.round(price60 / 2);
                        const existing30 = slotPrice.find(entry =>
                            entry.day === day &&
                            entry.duration === 30 &&
                            entry.timePeriod === period.value
                        );
                        if (existing30) {
                            updates.push({ id: existing30._id, price: price30 });
                        }
                    }
                });
            });

            if (updates.length > 0) {
                try {
                    await dispatch(updateSlotPrice({ updates })).unwrap();
                    dispatch(getUserSlotPrice({ register_club_id: registerId, day: "", duration: 60 }));
                } catch (err) {
                    showError(err);
                }
            }
        }

        setUpdateAllLoading(false);
    };

    const applyAllPrice = async () => {
        if (!allPrice.trim()) {
            showError("Please enter a price");
            return;
        }

        const numericPrice = parseInt(allPrice.replace(/[^0-9]/g, ''), 10);
        if (numericPrice < 500 || numericPrice > 4000) {
            return;
        }

        setApplyAllLoading(true);

        // UI में तुरंत latest price दिखाओ
        setPrices(prev => {
            const updated = { ...prev };
            days.forEach(day => {
                periods.forEach(period => {
                    updated[day][period.value] = String(numericPrice);
                });
            });
            return updated;
        });

        // Check अगर पहले से कोई 60min या 30min price exist करता है
        const hasExisting60Min = slotPrice.some(entry => entry.duration === 60);
        const hasExisting30Min = slotPrice.some(entry => entry.duration === 30);
        const hasAnyPrice = hasExisting60Min || hasExisting30Min;

        if (isCreateMode) {
            if (hasAnyPrice) {
                // Already created earlier → अब update bulk API use करो
                try {
                    const payload60 = {
                        updateMultiple: true,
                        register_club_id: registerId,
                        duration: 60,
                        price: numericPrice,
                        thirtyDuration: enable30Min
                    };
                    await dispatch(updateSlotBulkPrice(payload60)).unwrap();

                    // 30min को हमेशा update करो (0 या half)
                    const price30 = enable30Min ? Math.round(numericPrice / 2) : 0;
                    const payload30 = {
                        updateMultiple: true,
                        register_club_id: registerId,
                        duration: 30,
                        price: price30
                    };
                    await dispatch(updateSlotBulkPrice(payload30)).unwrap();


                    // Fresh data reload
                    dispatch(getUserSlotPrice({ register_club_id: registerId, day: "", duration: 60 }));
                } catch (err) {
                    showError(err);
                    console.error(err);
                }
            } else {
                // First time → create both
                const payload60 = days.flatMap(day =>
                    periods.map(period => ({
                        duration: 60,
                        day: day,
                        price: numericPrice,
                        slotTime: period.slotTime,
                        timePeriod: period.value,
                        register_club_id: registerId
                    }))
                );

                const payload30 = days.flatMap(day =>
                    periods.map(period => ({
                        duration: 30,
                        day: day,
                        price: enable30Min ? Math.round(numericPrice / 2) : 0,
                        slotTime: period.slotTime,
                        timePeriod: period.value,
                        register_club_id: registerId
                    }))
                );

                try {
                    await dispatch(createSlotPrice(payload60)).unwrap();
                    await dispatch(createSlotPrice(payload30)).unwrap();


                    dispatch(getUserSlotPrice({ register_club_id: registerId, day: "", duration: 60 }));
                } catch (err) {
                    showError(err);
                    console.error(err);
                }
            }
        } else {
            // UPDATE MODE (dashboard se open kiya)
            try {
                const payload60 = {
                    updateMultiple: true,
                    register_club_id: registerId,
                    duration: 60,
                    price: numericPrice,
                    thirtyDuration: enable30Min
                };
                await dispatch(updateSlotBulkPrice(payload60)).unwrap();

                const price30 = enable30Min ? Math.round(numericPrice / 2) : 0;
                const payload30 = {
                    updateMultiple: true,
                    register_club_id: registerId,
                    duration: 30,
                    price: price30
                };
                await dispatch(updateSlotBulkPrice(payload30)).unwrap();

                dispatch(getUserSlotPrice({ register_club_id: registerId, day: "", duration: 60 }));
            } catch (err) {
                showError(err);
                console.error(err);
            }
        }

        setAllPrice('');
        setApplyAllLoading(false);
    };

    const handleRowUpdate = async (dayName) => {
        setRowLoading(prev => ({ ...prev, [dayName]: true }));

        if (isCreateMode) {
            const { payload60, payload30 } = generateCreatePayload();
            try {
                if (payload60.some(p => p.price > 0)) {
                    await dispatch(createSlotPrice(payload60)).unwrap();
                }
                await dispatch(createSlotPrice(payload30)).unwrap();
            } catch (err) {
                showError(err);
            }
        } else {
            const updates = [];
            periods.forEach(period => {
                const price60Str = prices[dayName][period.value];
                const price60 = parseInt(price60Str, 10) || 0;

                const existing60 = slotPrice.find(entry =>
                    entry.day === dayName &&
                    entry.duration === 60 &&
                    entry.timePeriod === period.value
                );
                if (existing60 && price60 > 0) {
                    updates.push({ id: existing60._id, price: price60 });
                }

                if (enable30Min) {
                    const price30 = Math.round(price60 / 2);
                    const existing30 = slotPrice.find(entry =>
                        entry.day === dayName &&
                        entry.duration === 30 &&
                        entry.timePeriod === period.value
                    );
                    if (existing30) {
                        updates.push({ id: existing30._id, price: price30 });
                    }
                }
            });

            if (updates?.length > 0) {
                try {
                    await dispatch(updateSlotPrice({ updates })).unwrap();
                    dispatch(getUserSlotPrice({ register_club_id: registerId, day: "", duration: 60 }));
                } catch (err) {
                    showError(err);
                }
            }
        }

        setRowLoading(prev => ({ ...prev, [dayName]: false }));
    };

    const handleFinish = async () => {
        setFinishLoading(true);

        if (isCreateMode) {
            try {
                // After Apply/Update, prices always exist → so always UPDATE
                const updates60 = [];
                const updates30 = [];

                days.forEach(day => {
                    periods.forEach(period => {
                        const price60Str = prices[day]?.[period.value] || '';
                        const price60 = parseInt(price60Str, 10) || 0;

                        // Update 60min
                        const existing60 = slotPrice.find(entry =>
                            entry.day === day &&
                            entry.duration === 60 &&
                            entry.timePeriod === period.value
                        );
                        if (existing60) {
                            updates60.push({ id: existing60?._id, price: price60 });
                        }

                        // Update 30min: half if enabled, else 0
                        const price30 = enable30Min ? Math.round(price60 / 2) : 0;
                        const existing30 = slotPrice.find(entry =>
                            entry.day === day &&
                            entry.duration === 30 &&
                            entry.timePeriod === period.value
                        );
                        if (existing30) {
                            updates30.push({ id: existing30._id, price: price30 });
                        }
                    });
                });

                // Always update both (since they were created earlier with 0 or half)
                if (updates60?.length > 0) {
                    await dispatch(updateSlotPrice({ updates: updates60 })).unwrap();
                }

                if (updates30?.length > 0) {
                    await dispatch(updateSlotPrice({ updates: updates30 })).unwrap();
                }

                onFinalSuccess?.();
                navigate("/admin/dashboard");
                sessionStorage.removeItem("registerId");
                localStorage.removeItem("clubFormData");
                localStorage.removeItem("owner_signup_id");
                dispatch(resetClub());
            } catch (err) {
                console.error(err);
                showError(err);
            }
        }

        setFinishLoading(false);
    };

    return (
        <>
            {/* Header with Apply All and Checkbox - unchanged */}
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
                    <div className="position-relative">
                        <input
                            type="text"
                            placeholder="Enter price for all"
                            value={allPrice}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setAllPrice(value);

                                // Validate and set error
                                if (value && (parseInt(value) < 500 || parseInt(value) > 4000)) {
                                    setAllPriceError('Price must be between 500 and 4000');
                                } else {
                                    setAllPriceError('');
                                }
                            }}
                            className="form-control py-1"
                            style={{
                                boxShadow: "none",
                                width: '140px',
                                padding: '8px 5px',
                                borderRadius: '6px',
                                textAlign: 'center',
                                borderColor: allPriceError ? '#dc3545' : '#ced4da'
                            }}
                            disabled={applyAllLoading}
                        />
                        {allPriceError && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                fontSize: '11px',
                                color: '#dc3545',
                                whiteSpace: 'nowrap',
                                marginTop: '2px'
                            }}>
                                {allPriceError}
                            </div>
                        )}
                    </div>

                    <Button
                        variant="success"
                        size="sm"
                        disabled={applyAllLoading || !allPrice.trim()}
                        onClick={applyAllPrice}
                    >
                        {applyAllLoading ? <ButtonLoading color="white" /> : 'Apply to all'}
                    </Button>

                    <div className="d-flex align-items-center border px-3 py-1" style={{ borderRadius: '6px', backgroundColor: '#28a745', color: 'white', fontWeight: 'bold' }}>
                        <span>60 min</span>
                        <div className="ms-3 d-flex align-items-center gap-2">
                            <input
                                type="checkbox"
                                id="enable30min"
                                checked={enable30Min}
                                onChange={(e) => setEnable30Min(e.target.checked)}
                                style={{ transform: 'scale(1.2)' }}
                            />
                            <label htmlFor="enable30min" className="mb-0" style={{ fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
                                Enable 30-minute slots
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table - unchanged */}
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
                                    <td style={{ padding: '12px 10px', borderBottom: '1px solid #dee2e6' }}>
                                        <div className="shimmer" style={{ height: '20px', width: '100px', borderRadius: '4px' }} />
                                    </td>
                                    {periods.map(() => (
                                        <td key={Math.random()} style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                                <div className="shimmer" style={{ height: '12px', width: '140px', borderRadius: '4px' }} />
                                                <div className="shimmer" style={{ height: '36px', width: '120px', borderRadius: '4px' }} />
                                            </div>
                                        </td>
                                    ))}
                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                        <div className="shimmer" style={{ height: '32px', width: '80px', borderRadius: '6px', margin: '0 auto' }} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            days?.map(day => {
                                const isRowLoading = rowLoading[day] && !applyAllLoading;

                                if (isRowLoading) {
                                    return (
                                        <tr key={day}>
                                            <td style={{ padding: '12px 10px', borderBottom: '1px solid #dee2e6' }}>
                                                <div className="shimmer" style={{ height: '20px', width: '100px', borderRadius: '4px' }} />
                                            </td>
                                            {periods.map(() => (
                                                <td key={Math.random()} style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                                        <div className="shimmer" style={{ height: '12px', width: '140px', borderRadius: '4px' }} />
                                                        <div className="shimmer" style={{ height: '36px', width: '120px', borderRadius: '4px' }} />
                                                    </div>
                                                </td>
                                            ))}
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                <div className="shimmer" style={{ height: '32px', width: '80px', borderRadius: '6px', margin: '0 auto' }} />
                                            </td>
                                        </tr>
                                    );
                                }

                                return (
                                    <tr key={day} style={{
                                        marginBottom: priceErrors[`${day}-${periods?.value}`] ? '20px' : '0',
                                    }}>
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
                                                paddingBottom: priceErrors[`${day}-${period.value}`] ? '25px' : '10px',
                                                textAlign: 'center',
                                                borderBottom: '1px solid #dee2e6',
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', position: 'relative' }}>
                                                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#495057' }}>
                                                        {periodRanges[period.value]}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={prices[day]?.[period.value] || ''}
                                                        onChange={(e) => handlePriceChange(day, period.value, e.target.value)}
                                                        style={{
                                                            border: `1px solid ${priceErrors[`${day}-${period.value}`] ? '#dc3545' : '#ced4da'}`,
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
                                                    {priceErrors[`${day}-${period.value}`] && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            fontSize: '10px',
                                                            color: '#dc3545',
                                                            whiteSpace: 'nowrap',
                                                            marginTop: '2px',
                                                        }}>
                                                            {priceErrors[`${day}-${period.value}`]}
                                                        </div>
                                                    )}
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