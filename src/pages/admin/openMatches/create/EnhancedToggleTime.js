// Enhanced Toggle Time Logic from Booking.js adapted for CreateMatch
// This provides sophisticated 30 & 60 min combined slot selection

const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;

    const cleaned = timeStr.toString().toLowerCase().trim();
    const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
    if (!match) return null;

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2] || "0", 10);
    const period = match[3];

    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;

    return hour * 60 + minute;
};

const cleanupIsolatedHalves = (times, halfSelectedSlots, courtId, dateKey) => {
    // Only remove truly isolated halves that have NO neighbors on either side
    const cleanedTimes = [...times];
    const blockSet = new Set();
    const blockMap = new Map();

    cleanedTimes.forEach(t => {
        const timeMin = timeToMinutes(t.time);
        if (timeMin !== null) {
            if (t.side === "both") {
                blockSet.add(timeMin);
                blockSet.add(timeMin + 30);
                blockMap.set(timeMin, t._id);
                blockMap.set(timeMin + 30, t._id);
            } else if (t.side === "left") {
                blockSet.add(timeMin);
                blockMap.set(timeMin, t._id);
            } else if (t.side === "right") {
                blockSet.add(timeMin + 30);
                blockMap.set(timeMin + 30, t._id);
            }
        }
    });

    const toRemove = [];
    cleanedTimes.forEach(t => {
        if (t.side === "left" || t.side === "right") {
            const timeMin = timeToMinutes(t.time);
            if (timeMin !== null) {
                const blockVal = t.side === "left" ? timeMin : timeMin + 30;
                const leftNeighbor = blockVal - 30;
                const rightNeighbor = blockVal + 30;

                // Check if this half has ANY neighbor (from same or different slot)
                const hasLeftNeighbor = blockSet.has(leftNeighbor);
                const hasRightNeighbor = blockSet.has(rightNeighbor);

                // Only remove if COMPLETELY isolated (no neighbors on either side)
                if (!hasLeftNeighbor && !hasRightNeighbor) {
                    toRemove.push(t._id);
                }
            }
        }
    });

    return cleanedTimes.filter(t => !toRemove.includes(t._id));
};

export const createEnhancedToggleTime = (
    selectedTimes,
    halfSelectedSlots,
    slotData,
    selectedDate,
    setHalfSelectedSlots,
    setSelectedTimes,
    setSelectedBuisness,
    setSelectedCourts,
    getPriceForSlotWrapper,
    updateSelectedBusinessAndCourts,
    showError,
    setShowHalfSlots,
    has30MinPrices,
    parseTimeToHour,
    parseTimeToHalfHour
) => {
    return async (slot, courtId, dateKey, clickSide = null, otherSideBooked = false) => {
        if (!slot) return;

        const dateKeyStr = dateKey || selectedDate?.fullDate;
        const currentCourtTimes = selectedTimes[courtId]?.[dateKeyStr] || [];
        const court = slotData?.data?.find(c => c?._id === courtId);
        if (!court) return;

        const slotTimeInMinutes = timeToMinutes(slot.time);
        if (slotTimeInMinutes === null) return;

        const hasThirtyMinPrice = slot?.has30MinPrice === true && has30MinPrices;
        const leftKey = `${courtId}-${slot._id}-${dateKeyStr}-left`;
        const rightKey = `${courtId}-${slot._id}-${dateKeyStr}-right`;

        // NON-30-MIN COURTS (STANDARD 60-MIN / 90-MIN LOGIC)
        if (!slot?.has30MinPrice || !has30MinPrices) {
            const isSelected = currentCourtTimes.some(t => t._id === slot?._id);
            const is90Min = slot?.duration === 90;

            // Count slots by count (each slot = 1, regardless of duration)
            let totalCount = 0;
            Object.keys(selectedTimes).forEach(cId => {
                Object.values(selectedTimes[cId] || {}).forEach(times => {
                    if (times && Array.isArray(times)) {
                        times.forEach(t => {
                            if (t.side === "left" || t.side === "right") {
                                totalCount += 0.5;
                            } else {
                                totalCount += 1;
                            }
                        });
                    }
                });
            });

            if (!isSelected && totalCount + 1 > 3) {
                showError("Maximum 3 slots allowed for open matches");
                return;
            }

            const price = getPriceForSlotWrapper(slot.time, selectedDate?.day, false, courtId, slot?.duration || 60) || 0;
            if (!isSelected) {
                const newTimes = [...currentCourtTimes, { ...slot, side: 'both', amount: price, duration: slot?.duration || 60 }];
                setSelectedTimes(prev => ({
                    ...prev,
                    [courtId]: { ...prev[courtId], [dateKeyStr]: newTimes }
                }));
                updateSelectedBusinessAndCourts(newTimes, courtId, dateKeyStr);
            } else {
                const newTimes = currentCourtTimes.filter(t => t._id !== slot._id);
                setSelectedTimes(prev => ({
                    ...prev,
                    [courtId]: {
                        ...prev[courtId],
                        [dateKeyStr]: newTimes.length ? newTimes : undefined
                    }
                }));
                updateSelectedBusinessAndCourts(newTimes, courtId, dateKeyStr);
            }
            return;
        }

        // 30-MIN COURTS (HALF-SLOT LOGIC)
        if (!clickSide) return;

        const uiLeftKey = leftKey;
        const uiRightKey = rightKey;
        const targetKey = clickSide === "left" ? uiLeftKey : uiRightKey;
        const otherKey = clickSide === "left" ? uiRightKey : uiLeftKey;
        const clickedHalfSelected = halfSelectedSlots.has(targetKey);
        const otherHalfSelected = halfSelectedSlots.has(otherKey);
        const existingSlot = currentCourtTimes.some(t => t._id === slot._id);
        const hasFullSlot = currentCourtTimes.some(t => t._id === slot._id && t.side === "both");

        const updateSplitSelection = (newTimes, nextHalfSet) => {
            setSelectedTimes(prev => ({
                ...prev,
                [courtId]: { ...prev[courtId], [dateKeyStr]: newTimes.length ? newTimes : undefined }
            }));
            setHalfSelectedSlots(nextHalfSet);
            updateSelectedBusinessAndCourts(newTimes, courtId, dateKeyStr);
        };

        const getSelectedBlocks = () => currentCourtTimes
            .map((t) => {
                const start = timeToMinutes(t.time);
                if (start === null) return null;
                if (t.side === "both") return { start, end: start + 60, hasHalf: false };
                if (t.side === "right") return { start: start + 30, end: start + 60, hasHalf: true };
                return { start, end: start + 30, hasHalf: true };
            })
            .filter(Boolean);

        const getSelectedGroups = () => {
            const blocks = getSelectedBlocks().sort((a, b) => a.start - b.start);
            const groups = [];

            blocks.forEach((block) => {
                const lastGroup = groups[groups.length - 1];
                if (lastGroup && block.start <= lastGroup.end) {
                    lastGroup.end = Math.max(lastGroup.end, block.end);
                    lastGroup.hasHalf = lastGroup.hasHalf || block.hasHalf;
                } else {
                    groups.push({ ...block });
                }
            });

            return groups;
        };

        const clickedStart = clickSide === "left" ? slotTimeInMinutes : slotTimeInMinutes + 30;
        const clickedEnd = clickedStart + 30;

        // DESELECTION LOGIC
        if (clickedHalfSelected) {
            const newSet = new Set(halfSelectedSlots);
            newSet.delete(targetKey);

            // Build a complete block map from ALL currently selected slots (including the one being deselected)
            // so we can determine which slots become disconnected after removal
            const buildBlockMap = (timesArr, halfSet) => {
                const map = new Map(); // minute -> slotId
                timesArr.forEach(t => {
                    const tMin = timeToMinutes(t.time);
                    if (tMin === null) return;
                    if (t.side === 'both') {
                        map.set(tMin, t._id);
                        map.set(tMin + 30, t._id);
                    } else {
                        const tLK = `${courtId}-${t._id}-${dateKeyStr}-left`;
                        const tRK = `${courtId}-${t._id}-${dateKeyStr}-right`;
                        if (halfSet.has(tLK)) map.set(tMin, t._id);
                        if (halfSet.has(tRK)) map.set(tMin + 30, t._id);
                    }
                });
                return map;
            };

            // The minute block being removed
            const removedMin = clickSide === 'left' ? slotTimeInMinutes : slotTimeInMinutes + 30;

            // If other half is also selected, decide what to do
            if (otherHalfSelected) {
                // The other half's minute block
                const otherMin = clickSide === 'left' ? slotTimeInMinutes + 30 : slotTimeInMinutes;
                // Check if the other half has an outer neighbor (slot on the far side)
                const outerMin = clickSide === 'left' ? otherMin + 30 : otherMin - 30;
                const blockMapFull = buildBlockMap(currentCourtTimes, halfSelectedSlots);
                const outerNeighborConnected = blockMapFull.has(outerMin) && blockMapFull.get(outerMin) !== slot._id;

                if (outerNeighborConnected) {
                    // Keep the other half, cascade-remove everything on the clicked side
                    const cascadeDirection = clickSide === 'left' ? -1 : 1;
                    const cascadeStartMin = removedMin + cascadeDirection * 30;

                    // Build map excluding the current slot
                    const blockMapOthers = buildBlockMap(
                        currentCourtTimes.filter(t => t._id !== slot._id),
                        halfSelectedSlots
                    );

                    const cascadeSet = new Set();
                    let cur = cascadeStartMin;
                    while (blockMapOthers.has(cur)) {
                        const sid = blockMapOthers.get(cur);
                        if (cascadeSet.has(sid)) break;
                        cascadeSet.add(sid);
                        newSet.delete(`${courtId}-${sid}-${dateKeyStr}-left`);
                        newSet.delete(`${courtId}-${sid}-${dateKeyStr}-right`);
                        // advance in cascade direction
                        blockMapOthers.delete(cur);
                        cur = cur + cascadeDirection * 30;
                    }

                    const apiPrice = getPriceForSlotWrapper(slot.time, selectedDate?.day, false, courtId) || 0;
                    const remainingSide = clickSide === 'left' ? 'right' : 'left';
                    const updatedTimes = currentCourtTimes
                        .filter(t => !cascadeSet.has(t._id))
                        .map(t => t._id === slot._id
                            ? { ...t, side: remainingSide, amount: apiPrice / 2 }
                            : t
                        );

                    updateSplitSelection(updatedTimes, newSet);
                    return;
                }

                // No outer neighbor on the other side — deselect both halves
                newSet.delete(otherKey);
            }

            // At this point: only the clicked half was selected (or both halves with no outer neighbor)
            // Remove the slot entry and cascade-remove any slots that are now disconnected
            let newTimes = currentCourtTimes.filter(t => t._id !== slot._id);

            // Build block map for remaining slots after removing this slot
            const blockToSlotId = buildBlockMap(newTimes, newSet);

            // Determine which minute blocks were just removed
            const removedMins = [removedMin];
            if (otherHalfSelected) {
                // both halves removed
                const otherMin = clickSide === 'left' ? slotTimeInMinutes + 30 : slotTimeInMinutes;
                removedMins.push(otherMin);
            }

            const toRemoveSlotIds = new Set();

            // Cascade: walk away from each removed minute in the direction that has no anchor
            const cascadeRemove = (startMin, direction) => {
                let cur = startMin;
                while (blockToSlotId.has(cur)) {
                    const slotId = blockToSlotId.get(cur);
                    if (toRemoveSlotIds.has(slotId)) break;
                    // The anchor side is opposite to cascade direction
                    const anchorMin = cur - direction * 30;
                    // If the anchor side still has a block that is NOT being removed, stop
                    if (blockToSlotId.has(anchorMin) && !toRemoveSlotIds.has(blockToSlotId.get(anchorMin))) break;
                    toRemoveSlotIds.add(slotId);
                    newSet.delete(`${courtId}-${slotId}-${dateKeyStr}-left`);
                    newSet.delete(`${courtId}-${slotId}-${dateKeyStr}-right`);
                    blockToSlotId.delete(cur);
                    cur = cur + direction * 30;
                }
            };

            removedMins.forEach(rMin => {
                // Cascade forward (right) if the right neighbor has no left anchor
                if (blockToSlotId.has(rMin + 30)) cascadeRemove(rMin + 30, 1);
                // Cascade backward (left) if the left neighbor has no right anchor
                if (blockToSlotId.has(rMin - 30)) cascadeRemove(rMin - 30, -1);
            });

            if (toRemoveSlotIds.size > 0) {
                newTimes = newTimes.filter(t => !toRemoveSlotIds.has(t._id));
            }

            updateSplitSelection(newTimes, newSet);
            return;
        }

        // DESELECT FULL SLOT
        if (hasFullSlot) {
            const newSet = new Set(halfSelectedSlots);
            newSet.delete(uiLeftKey);
            newSet.delete(uiRightKey);
            const newTimes = currentCourtTimes.filter(t => t._id !== slot._id);
            updateSplitSelection(newTimes, newSet);
            return;
        }

        let totalCount = 0;
        Object.keys(selectedTimes).forEach(cId => {
            Object.values(selectedTimes[cId] || {}).forEach(times => {
                if (times && Array.isArray(times)) {
                    times.forEach(t => {
                        totalCount += t.side === "both" ? 1 : (t.side === "left" || t.side === "right" ? 0.5 : 1);
                    });
                }
            });
        });

        if (totalCount + 0.5 > 3) {
            showError("Maximum 3 slots allowed for open matches");
            return;
        }

        const newSet = new Set(halfSelectedSlots);
        newSet.add(targetKey);
        const apiPrice = getPriceForSlotWrapper(slot.time, selectedDate?.day, false, courtId) || 0;
        let newTimes;

        if (currentCourtTimes.length === 0) {
            if (otherSideBooked) {
                const halfSide0 = clickSide === "left" ? "left" : "right";
                newTimes = [...currentCourtTimes, { ...slot, side: halfSide0, amount: apiPrice / 2 }];
                updateSplitSelection(newTimes, newSet);
                return;
            }
            newSet.add(uiLeftKey);
            newSet.add(uiRightKey);
            newTimes = [...currentCourtTimes, { ...slot, side: "both", amount: apiPrice }];
            updateSplitSelection(newTimes, newSet);
            return;
        }

        const selectedGroups = getSelectedGroups();
        const isConsecutiveExtension = selectedGroups.some(group => (
            clickedStart === group.end || clickedEnd === group.start
        ));

        if (!isConsecutiveExtension && !existingSlot) {
            if (otherSideBooked) {
                const halfSideNew = clickSide === "left" ? "left" : "right";
                newTimes = [...currentCourtTimes, { ...slot, side: halfSideNew, amount: apiPrice / 2 }];
                updateSplitSelection(newTimes, newSet);
                return;
            }
            newSet.add(uiLeftKey);
            newSet.add(uiRightKey);
            newTimes = [...currentCourtTimes, { ...slot, side: "both", amount: apiPrice }];
            updateSplitSelection(newTimes, newSet);
            return;
        }

        if (existingSlot && otherHalfSelected) {
            newSet.add(uiLeftKey);
            newSet.add(uiRightKey);
            newTimes = currentCourtTimes.map(t =>
                t._id === slot._id ? { ...slot, side: "both", amount: apiPrice } : t
            );
            updateSplitSelection(newTimes, newSet);
            return;
        }

        const halfSide = clickSide === "left" ? "left" : "right";
        const halfSlot = { ...slot, side: halfSide, amount: apiPrice / 2 };
        newTimes = existingSlot
            ? currentCourtTimes.map(t => t._id === slot._id ? halfSlot : t)
            : [...currentCourtTimes, halfSlot];

        updateSplitSelection(newTimes, newSet);
        return;
    };
};

// Made with Bob
