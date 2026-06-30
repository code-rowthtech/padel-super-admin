import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { padal } from "../../../../assets/files";
import { showError, showSuccess } from "../../../../helpers/Toast";
import { adminCheckBooking, createOpenMatchAdmin, adminRemoveBookedBooking } from "../../../../redux/thunks";
import { ButtonLoading } from "../../../../helpers/loading/Loaders";
import { parseTimeToHour } from "../../../../utils/formatters";
import { toLocalDateString, dateOnlyToLocalDate } from "../../../../utils/dateUtils";
import { ownerApi } from "../../../../helpers/api/apiCore";

const width = 370;
const height = 70;
const circleRadius = height * 0.32;
const curvedSectionStart = width * 0.76;
const curvedSectionEnd = width * 0.996;
const circleX = curvedSectionStart + (curvedSectionEnd - curvedSectionStart) * 0.68 + 1;
const circleY = height * 0.5;
const arrowSize = circleRadius * 0.6;
const arrowX = circleX;
const arrowY = circleY;

const buttonStyle = {
    position: "relative",
    width: `${width}px`,
    height: `${height}px`,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    overflow: "visible",
};

const svgStyle = {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
};

const contentStyle = {
    position: "relative",
    zIndex: 2,
    color: "white",
    fontWeight: "600",
    fontSize: "16px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingRight: `${circleRadius * 2}px`,
    fontFamily: "Poppins",
};

const MatchPlayer = ({
    selectedCourts,
    selectedDate,
    finalSkillDetails,
    totalAmount,
    slotError,
    onBackToSlots,
    onClose,
    slotData,
    halfSelectedSlots, ownerClubData,
    selectedClubId,
    activeLocationId,
    activeCategoryId,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedGender, setSelectedGender] = useState('');
    const defaultSkillLevel = "Open Match";
    const createMatchesLoading = useSelector((state) => state?.openMatches?.openMatchesLoading);
    const resolveId = (value) => {
        if (!value) return "";
        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                return parsed?._id || parsed?.id || value;
            } catch {
                return value;
            }
        }
        return value._id || value.id || "";
    };

    const formatMatchDate = (dateString) => {
        if (!dateString) return { day: "Fri", formattedDate: "29 Aug" };
        const date = new Date(dateString);
        const day = date.toLocaleDateString("en-US", { weekday: "short" });
        const formattedDate = `${date.toLocaleDateString("en-US", { day: "2-digit" })} ${date.toLocaleDateString("en-US", { month: "short" })}`;
        return { day, formattedDate };
    };

    const matchDate = selectedDate?.fullDate
        ? formatMatchDate(selectedDate.fullDate)
        : { day: "Fri", formattedDate: "29 Aug" };

    const generateMatchTimeFromSelections = () => {
        if (!selectedCourts?.length && !halfSelectedSlots?.size) return "";

        const allSelectedTimes = [];
        const processedSlots = new Set();

        selectedCourts.forEach(court => {
            court.time?.forEach(timeSlot => {
                const slotKey = `${court._id}-${timeSlot._id}`;
                if (!processedSlots.has(slotKey)) {
                    processedSlots.add(slotKey);
                    const match = timeSlot.time.match(/(\d+)(?::(\d+))?\s*(am|pm)/i);
                    if (match) {
                        let hour = parseInt(match[1], 10);
                        const minute = match[2] ? parseInt(match[2], 10) : 0;
                        const period = match[3].toLowerCase();

                        if (period === 'pm' && hour !== 12) hour += 12;
                        if (period === 'am' && hour === 12) hour = 0;

                        allSelectedTimes.push({
                            hour,
                            minute,
                            totalMinutes: hour * 60 + minute
                        });
                    }
                }
            });
        });

        if (halfSelectedSlots?.size > 0) {
            halfSelectedSlots.forEach(key => {
                const [courtId, slotId] = key.split('-');
                const slotKey = `${courtId}-${slotId}`;

                if (processedSlots.has(slotKey)) return;

                const court = slotData?.data?.find(c => c._id === courtId);
                const slot = court?.slots?.find(s => s._id === slotId);

                if (slot) {
                    const match = slot.time.match(/(\d+)(?::(\d+))?\s*(am|pm)/i);
                    if (match) {
                        let hour = parseInt(match[1], 10);
                        const minute = match[2] ? parseInt(match[2], 10) : 0;
                        const period = match[3].toLowerCase();

                        if (period === 'pm' && hour !== 12) hour += 12;
                        if (period === 'am' && hour === 12) hour = 0;

                        allSelectedTimes.push({
                            hour,
                            minute,
                            totalMinutes: hour * 60 + minute
                        });
                    }

                    processedSlots.add(slotKey);
                }
            });
        }

        if (allSelectedTimes.length === 0) return "";

        const uniqueTimes = allSelectedTimes.filter((time, index, arr) =>
            arr.findIndex(t => t.totalMinutes === time.totalMinutes) === index
        ).sort((a, b) => a.totalMinutes - b.totalMinutes);

        if (uniqueTimes.length === 1) {
            const time = uniqueTimes[0];
            const displayHour = time.hour > 12 ? time.hour - 12 : time.hour === 0 ? 12 : time.hour;
            const period = time.hour >= 12 ? 'PM' : 'AM';

            const nextHour = time.hour + 1;
            const nextPeriod = nextHour >= 12 ? 'PM' : 'AM';
            const displayNextHour = nextHour > 12 ? nextHour - 12 : (nextHour === 0 ? 12 : nextHour);
            return `${displayHour}:00 ${period} – ${displayNextHour}:00 ${nextPeriod}`;
        }

        const startTime = uniqueTimes[0];
        const endTime = uniqueTimes[uniqueTimes.length - 1];

        const formatTime = (time) => {
            const displayHour = time.hour > 12 ? time.hour - 12 : time.hour === 0 ? 12 : time.hour;
            const period = time.hour >= 12 ? 'PM' : 'AM';
            return `${displayHour}:00 ${period}`;
        };

        const actualEndHour = endTime.hour + 1;
        const endPeriod = actualEndHour >= 12 ? 'PM' : 'AM';
        const displayEndHour = actualEndHour > 12 ? actualEndHour - 12 : (actualEndHour === 0 ? 12 : actualEndHour);

        return `${formatTime(startTime)} – ${displayEndHour}:00 ${endPeriod}`;
    };

    const calculateTotalSlots = () => {
        let total = 0;

        selectedCourts.forEach(court => {
            court.time?.forEach(slot => {
                if (slot.side === "both" || slot.duration === 60) {
                    total += 1; // Full slot
                } else {
                    total += 0.5; // Half slot
                }
            });
        });

        const halfSlotGroups = new Map();
        halfSelectedSlots?.forEach(key => {
            const parts = key.split('-');
            const courtId = parts[0];
            const slotId = parts[1];
            const side = parts[parts.length - 1];
            const date = parts.slice(2, parts.length - 1).join('-');
            const groupKey = `${courtId}-${slotId}-${date}`;

            const isInSelectedCourts = selectedCourts.some(court =>
                court._id === courtId && court.time?.some(slot => slot._id === slotId)
            );

            if (!isInSelectedCourts) {
                if (!halfSlotGroups.has(groupKey)) {
                    halfSlotGroups.set(groupKey, { left: false, right: false });
                }
                halfSlotGroups.get(groupKey)[side] = true;
            }
        });

        halfSlotGroups.forEach(group => {
            if (group.left && group.right) {
                total += 1; // Both halves = 1 full slot
            } else if (group.left || group.right) {
                total += 0.5; // Single half = 0.5 slot
            }
        });

        return Math.ceil(total);
    };

    const totalSlots = calculateTotalSlots();

    const calculateYourShare = () => {
        if (totalAmount && totalAmount > 0) {
            return totalAmount;
        }

        let calculatedAmount = 0;
        const processedSlots = new Set();

        selectedCourts.forEach(court => {
            court.time?.forEach(timeSlot => {
                const slotKey = `${court._id}-${timeSlot?._id}`;
                if (!processedSlots.has(slotKey)) {
                    processedSlots.add(slotKey);
                    calculatedAmount += Number(timeSlot.amount || 0);
                }
            });
        });

        if (halfSelectedSlots && halfSelectedSlots.size > 0) {
            const slotGroups = new Map();

            halfSelectedSlots.forEach(key => {
                const parts = key.split('-');
                const courtId = parts[0];
                const slotId = parts[1];
                const side = parts[parts.length - 1];
                const date = parts.slice(2, parts.length - 1).join('-');
                const groupKey = `${courtId}-${slotId}-${date}`;
                const slotKey = `${courtId}-${slotId}`;

                if (processedSlots.has(slotKey)) {
                    return;
                }

                if (!slotGroups.has(groupKey)) {
                    slotGroups.set(groupKey, { left: false, right: false, courtId, slotId });
                }
                slotGroups.get(groupKey)[side] = true;
            });

            slotGroups.forEach(group => {
                const court = slotData?.data?.find(c => c._id === group.courtId);
                const slot = court?.slots?.find(s => s._id === group.slotId);

                if (slot) {
                    if (group.left && group.right) {
                        const fullSlotPrice = slot.amount || null;
                        calculatedAmount += fullSlotPrice;
                    } else if (group.left || group.right) {
                        const halfSlotPrice = slot.halfSlotPrice || (slot.amount ? slot.amount / 2 : 0);
                        calculatedAmount += halfSlotPrice;
                    }
                } else {
                    if (group.left && group.right) {
                        calculatedAmount += 1600; // Full slot fallback price
                    } else if (group.left || group.right) {
                        calculatedAmount += 800; // Half slot fallback price
                    }
                }
            });
        }

        return calculatedAmount;
    };

    const yourShareAmount = calculateYourShare();
    const matchTime = useMemo(() => generateMatchTimeFromSelections(), [selectedCourts, halfSelectedSlots, slotData]);

    const lockSlots = async (slots) => {

        const slotPayloads = slots.flatMap((slot) =>
            (slot.slotTimes || []).map((st) => ({
                slotId: slot?.slotId,
                courtId: slot?.courtId,
                bookingDate: slot?.bookingDate,
                time: st.time,
                bookingTime: st.bookingTime || slot.bookingTime || st.time,
                duration: slot?.duration
            }))
        );

        const uniqueSlotPayloads = Array.from(
            new Map(
                slotPayloads.map((p) => [
                    `${p.slotId}-${p.courtId}-${p.bookingDate}-${p.time}-${p.bookingTime}-${p.duration}`,
                    p
                ])
            ).values()
        );

        const lockedPayloads = [];
        const failedPayloads = [];

        for (const payload of uniqueSlotPayloads) {
            try {
                const checkBookingPromise = dispatch(adminCheckBooking(payload));
                const res = await checkBookingPromise.unwrap();

                if (res?.created === false || res?.success === false) {
                    showError(res?.message)
                    failedPayloads.push(payload);
                } else {
                    lockedPayloads.push(payload);
                }
            } catch (err) {
                return;

            }
        }

        if (failedPayloads.length > 0) {
            try {
                await Promise.allSettled(
                    lockedPayloads.map((p) => dispatch(adminRemoveBookedBooking(p)))
                );
            } catch (cleanupErr) {
                console.error('Cleanup error (ignored):', cleanupErr);
            }
            throw new Error("Some slots are no longer available. Please select different slots.");
        }

        return true;
    };

    const canBook = (totalSlots >= 1 || halfSelectedSlots?.size > 0);

    const teamA = [];
    const teamB = [];
    const handleBookNow = async () => {

        if (!selectedGender) {
            showError("Please select game type");
            return;
        }

        const savedClubId = ownerClubData?.[0]?._id || localStorage.getItem("register_club_id");
        const answersArray = finalSkillDetails
            ? Object.keys(finalSkillDetails)
                .sort((a, b) => a - b)
                .map(key => finalSkillDetails[key])
            : [];

        const formattedSlots = selectedCourts.flatMap((court) => court?.time?.map((timeSlot) => {
            const slotInfo = slotData?.data?.find(c => c?._id === court?._id)?.slots?.find(s => s?._id === timeSlot?._id);
            const dateKey = court?.date || selectedDate?.fullDate;
            const leftKey = `${court._id}-${timeSlot._id}-${dateKey}-left`;
            const rightKey = `${court._id}-${timeSlot._id}-${dateKey}-right`;
            const isLeftHalf = halfSelectedSlots?.has(leftKey);
            const isRightHalf = halfSelectedSlots?.has(rightKey);
            // Use duration from slotInfo if timeSlot lacks it
            const slotDurationFromInfo = slotInfo?.duration;
            const shouldBe60Minutes = () => {
                if (isLeftHalf && isRightHalf) {
                    return true;
                }
                // Do not force 60 minutes for explicit 90‑minute slots
                if (timeSlot?.duration === 90) {
                    return false;
                }
                const slotHour = parseTimeToHour(timeSlot?.time);
                if (slotHour !== null) {
                    const allSelectedHours = [];
                    selectedCourts.forEach(c => {
                        c.time?.forEach(t => {
                            const hour = parseTimeToHour(t.time);
                            if (hour !== null && !allSelectedHours.includes(hour)) {
                                allSelectedHours.push(hour);
                            }
                        });
                    });
                    allSelectedHours.sort((a, b) => a - b);
                    for (let i = 0; i < allSelectedHours.length - 2; i++) {
                        const first = allSelectedHours[i];
                        const second = allSelectedHours[i + 1];
                        const third = allSelectedHours[i + 2];
                        if (second === first + 1 && third === second + 1) {
                            if (slotHour === first || slotHour === second || slotHour === third) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            };

            // Determine base duration: prefer explicit slot duration, else slotInfo duration
            const explicitDuration = timeSlot?.duration ?? slotDurationFromInfo;
            let finalDuration = shouldBe60Minutes() ? 60 : 30;

            // If slot itself is 60-min and no half-selection, it must be 60
            if (!isLeftHalf && !isRightHalf && explicitDuration === 60) {
                finalDuration = 60;
            }

            // Handle explicit 90-minute slots
            if (explicitDuration === 90) {
                finalDuration = 90;
            }

            // Debug log for each slot mapping
                console.log('Slot mapping debug:', {
                    courtId: court._id,
                    timeSlotId: timeSlot._id,
                    explicitDuration,
                    finalDuration,
                    usedDuration: explicitDuration ?? finalDuration,
                    isLeftHalf,
                    isRightHalf
                });


            let matchTime = timeSlot?.time;

            return {
                slotId: timeSlot?._id,
                businessHours: slotInfo?.businessHours || [{ time: "06:00 AM - 11:00 PM", day: selectedDate?.day || court?.day }],
                slotTimes: [{ time: matchTime, bookingTime: matchTime, amount: timeSlot?.amount }],
                courtName: court?.courtName,
                courtId: court?._id,
                bookingDate: new Date(court?.date || selectedDate?.fullDate).toISOString(),
                // Use the explicit duration if available, otherwise the computed finalDuration
                duration: explicitDuration ?? finalDuration,
                bookingTime: matchTime,
                totalTime: finalDuration
            };
        }));
        try {
            await lockSlots(formattedSlots);
            const resolvedClubId = resolveId(selectedClubId || ownerClubData?.[0]?._id || savedClubId);
            const resolvedLocationId = resolveId(activeLocationId);
            const resolvedCategoryId = resolveId(activeCategoryId);
            const formattedMatch = {
                slot: formattedSlots,
                stateId: ownerClubData?.[0]?.locations?.find((loc) => loc?._id === resolvedLocationId)?.stateId,
                clubId: resolvedClubId,
                gender: selectedGender === 'Male' ? 'Male Only' : selectedGender === 'Female' ? 'Female Only' : 'Mixed Doubles',
                matchDate: toLocalDateString(dateOnlyToLocalDate(selectedDate?.fullDate)),
                ...(answersArray?.length > 0 && {
                    skillLevel: answersArray[0] || "Beginner",
                    skillDetails: answersArray?.slice(1)?.map((answer, i) => {
                        if (i === 0 && Array.isArray(answer)) return answer.join(", ");
                        return answer;
                    })
                }),
                // matchStatus: "open",
                matchTime: selectedCourts
                    .flatMap(court => court.time?.map(timeSlot => timeSlot.time) || [])
                    .join(","),
                teamA,
                teamB,
                initiatePayment: false,
                bookingStatus: 'upcoming',
                paymentMethod: 'Admin',
                adminStatus: true,
                categoryId: resolvedCategoryId,
                location: resolvedLocationId
            };
                console.log('Formatted match payload:', formattedMatch);
            let createdMatchId = null;
            const rescheduleMatchId = location.state?.rescheduleMatchId;
            if (rescheduleMatchId) {
                await ownerApi.put(
                    `/api/super-admin/pay-share-open-matches/${rescheduleMatchId}/reschedule`,
                    {
                        slot: formattedSlots,
                        matchDate: formattedMatch.matchDate,
                        matchTime: formattedMatch.matchTime,
                        reason: location.state?.rescheduleReason || "Slot changed by Super Admin",
                    },
                );
                showSuccess("Pay-share open match rescheduled successfully");
                createdMatchId = rescheduleMatchId;
            } else {
                const result = await dispatch(createOpenMatchAdmin(formattedMatch)).unwrap();
                createdMatchId = result?.data?._id;
            }
            // Pay-share matches remain pending and must not reserve the slot
            // until all four players have completed payment.
            await Promise.allSettled(
                formattedSlots.map((slot) => dispatch(adminRemoveBookedBooking({
                    slotId: slot.slotId,
                    courtId: slot.courtId,
                    bookingDate: slot.bookingDate,
                    time: slot.slotTimes[0]?.time,
                    bookingTime: slot.bookingTime,
                    duration: slot.duration
                })))
            );
            localStorage.removeItem("addedAdminPlayers");
            if (onClose) {
                onClose();
            }
            navigate('/admin/player-preferences', { replace: true, state: { selectedOpenMatchId: createdMatchId } });

        } catch (err) {
            if (formattedSlots?.length > 0) {
                await Promise.allSettled(
                    formattedSlots.map((slot) => {
                        const payload = {
                            slotId: slot.slotId,
                            courtId: slot.courtId,
                            bookingDate: slot.bookingDate,
                            time: slot.slotTimes[0]?.time,
                            bookingTime: slot.bookingTime,
                            duration: slot.duration
                        };
                        return dispatch(adminRemoveBookedBooking(payload));
                    })
                );
            }

            if (onBackToSlots) {
                onBackToSlots();
            }
        }
    };

    const onBack = () => {
        if (onBackToSlots) {
            onBackToSlots();
        } else {
            navigate('/admin/player-preferences', { replace: true });
        }
    };

    return (
        <>
            <div className="py-md-3 pt-0 pb-3 rounded-3 px-md-4 px-2 bgchangemobile" style={{ backgroundColor: "#F5F5F566" }}>
                <div className="d-flex justify-content-between align-items-center mb-md-3 mb-2">
                    <div className="d-flex align-items-center">
                        <button
                            className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                            style={{ width: 36, height: 36 }}
                            onClick={onBack}
                        >
                            <i className="bi bi-arrow-left" />
                        </button>
                        <h5 className="mb-0 all-matches ms-2" style={{ color: "#374151" }}>
                            Details
                        </h5>
                    </div>
                </div>

                <div className="rounded-4 border row mx-auto pt-2 pb-0 mb-2" style={{ backgroundColor: "#CBD6FF1A" }}>
                    <div className="d-flex d-block justify-content-between align-items-start py-2 border-bottom px-md-4 px-2">
                        <div className="d-flex align-items-center justify-content-md-between justify-content-start gap-2">
                            <img src={padal} alt="padel" width={24} />
                            <span className="ms-2 all-matches" style={{ color: "#374151" }}>
                                PADEL
                            </span>
                        </div>
                        <small className="text-muted d-none d-lg-block" style={{ fontWeight: 500 }}>
                            {matchDate?.day}, {matchDate?.formattedDate} | {matchTime?.slice(0, 20)}
                            {matchTime?.length > 20 ? "..." : ""}
                        </small>
                        <small className="text-muted d-lg-none add_font_mobile" style={{ fontWeight: 500 }}>
                            {matchDate?.day}, {matchDate?.formattedDate} {matchTime?.slice(0, 20)}
                            {matchTime?.length > 20 ? "..." : ""}
                        </small>
                    </div>

                    <div className="col-12 ps-0 text-center d-flex">
                        <div className="col-md-5 col-5 py-2">
                            <p className="mb-1 add_font_mobile" style={{ fontWeight: '500', fontFamily: "Poppins", color: "#374151", lineHeight: "1.2" }}>
                                Game Type <span className="text-danger pt-2 mt-2 mb-0">*</span>
                            </p>
                            <div className="d-flex justify-content-center">
                                <select
                                    className={`form-select add_font_mobile p-0 gap-0 form-select-sm shadow-none text-center pe-md-5 pe-4 ${selectedGender === '' ? 'pe-3 ps-0' : 'pe-5 ps-md-0 ps-3'} py-1`}
                                    style={{
                                        fontSize: "15px",
                                        fontWeight: "500",
                                        fontFamily: "Poppins",
                                        color: selectedGender === '' ? "#1F41BB" : "#000000",
                                        backgroundColor: selectedGender === '' ? "#EEF2FF" : "transparent",
                                        border: selectedGender === '' ? "0px solid #1F41BB" : "none",
                                        borderRadius: "4px",
                                        width: "auto",
                                        minWidth: "auto",
                                        appearance: "none",
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "right 15px center",
                                        backgroundSize: "15px",
                                        paddingRight: "0px",
                                        cursor: "pointer",
                                    }}
                                    value={selectedGender}
                                    onChange={(e) => setSelectedGender(e.target.value)}
                                    required
                                >
                                    <option className="add_font_mobile" value="">Select</option>
                                    <option className="add_font_mobile" value="Male">Male Only</option>
                                    <option className="add_font_mobile" value="Female">Female Only</option>
                                    <option className="add_font_mobile" value="Mixed">Mixed Double</option>
                                </select>
                            </div>
                        </div>

                        <div className="col-4 border-start border-end py-2">
                            <p className="mb-1 add_font_mobile" style={{ fontWeight: '500', fontFamily: "Poppins", color: "#374151", lineHeight: "1.2" }}>
                                Level
                            </p>
                            <p className="mb-0 add_font_mobile_bottom" style={{ fontSize: "15px", fontWeight: '500', fontFamily: "Poppins", color: "#000000" }}>
                                {finalSkillDetails && Object.keys(finalSkillDetails).length > 0
                                    ? finalSkillDetails?.[0]
                                    : defaultSkillLevel || "Open Match"}
                            </p>
                        </div>

                        <div className="col-md-3 col-3 py-2">
                            <p className="mb-1 add_font_mobile" style={{ fontWeight: '500', fontFamily: "Poppins", color: "#374151", lineHeight: "1.2" }}>
                                Amount
                            </p>
                            <p className="mb-0 add_font_mobile_bottom_extra fw-bold" style={{ fontSize: '16px', color: '#1F41BB' }}>
                                ₹{yourShareAmount ? Number(yourShareAmount).toLocaleString("en-IN") : 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-between rounded-3 p-3 mb-2 py-2 border" style={{ backgroundColor: "#CBD6FF1A" }}>
                    <p className="text-muted mb-0 add_font_mobile_bottom" style={{ fontSize: "15px", fontWeight: 500 }}>
                        Open Match
                    </p>
                </div>

                <div className="d-flex justify-content-center align-items-center mt-3">
                    <button
                        style={{
                            ...buttonStyle,
                            opacity: !canBook ? 0.5 : 1,
                            cursor: !canBook ? "not-allowed" : "pointer",
                            pointerEvents: !canBook ? "none" : "auto",
                        }}
                        disabled={!canBook}
                        onClick={handleBookNow}
                    >
                        <svg style={svgStyle} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`buttonGradient-${width}-${height}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#1F41BB" />
                                    <stop offset="50%" stopColor="#3B5BDB" />
                                    <stop offset="100%" stopColor="#4F46E5" />
                                </linearGradient>
                            </defs>
                            <path
                                d={`M ${width * 0.76} ${height * 0.15} C ${width * 0.79} ${height * 0.15} ${width * 0.81} ${height * 0.2} ${width * 0.83} ${height * 0.3} C ${width * 0.83} ${height * 0.32} ${width * 0.84} ${height * 0.34} ${width * 0.84} ${height * 0.34} C ${width * 0.85} ${height * 0.34} ${width * 0.86} ${height * 0.32} ${width * 0.86} ${height * 0.3} C ${width * 0.88} ${height * 0.2} ${width * 0.9} ${height * 0.15} ${width * 0.92} ${height * 0.15} C ${width * 0.97} ${height * 0.15} ${width * 0.996} ${height * 0.3} ${width * 0.996} ${height * 0.5} C ${width * 0.996} ${height * 0.7} ${width * 0.97} ${height * 0.85} ${width * 0.92} ${height * 0.85} C ${width * 0.9} ${height * 0.85} ${width * 0.88} ${height * 0.8} ${width * 0.86} ${height * 0.7} C ${width * 0.86} ${height * 0.68} ${width * 0.85} ${height * 0.66} ${width * 0.84} ${height * 0.66} C ${width * 0.84} ${height * 0.66} ${width * 0.83} ${height * 0.68} ${width * 0.83} ${height * 0.7} C ${width * 0.81} ${height * 0.8} ${width * 0.79} ${height * 0.85} ${width * 0.76} ${height * 0.85} L ${width * 0.08} ${height * 0.85} C ${width * 0.04} ${height * 0.85} ${width * 0.004} ${height * 0.7} ${width * 0.004} ${height * 0.5} C ${width * 0.004} ${height * 0.3} ${width * 0.04} ${height * 0.15} ${width * 0.08} ${height * 0.15} L ${width * 0.76} ${height * 0.15} Z`}
                                fill={`url(#buttonGradient-${width}-${height})`}
                            />
                            <ellipse
                                cx={width * 0.76 + (width * 0.996 - width * 0.76) * 0.68 + 2}
                                cy={height * 0.5}
                                rx={circleRadius}
                                ry={circleRadius}
                                fill="white"
                            />
                            <g
                                stroke="#1F41BB"
                                strokeWidth={height * 0.03}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="book-now-arrow"
                                style={{
                                    transformOrigin: `${arrowX}px ${arrowY}px`,
                                    transition: "transform 0.3s ease"
                                }}
                            >
                                <path d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4}`} />
                                <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4}`} />
                                <path d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4} L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1}`} />
                            </g>
                        </svg>
                        <div style={contentStyle}>{createMatchesLoading ? <ButtonLoading color={'white'} /> : ' Create Match'}</div>
                    </button>
                </div>

                {slotError && (
                    <div
                        className="text-center mb-3 p-2 rounded"
                        style={{
                            backgroundColor: "#ffebee",
                            color: "#c62828",
                            border: "1px solid #ffcdd2",
                            fontWeight: 500,
                            fontSize: "14px",
                        }}
                    >
                        {slotError}
                    </div>
                )}
            </div>

        </>
    );
};

export default MatchPlayer;
