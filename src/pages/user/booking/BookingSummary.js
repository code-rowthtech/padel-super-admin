import React from 'react';
import { MdKeyboardArrowUp, MdKeyboardArrowDown, MdOutlineDeleteOutline } from 'react-icons/md';
import { Button } from 'react-bootstrap';
import { booking_logo_img } from '../../../assets/files';

// Helper function to parse time to minutes for comparison
const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    
    let cleaned = timeStr.toString().toLowerCase().trim();
    let hour, minute = 0, period = "";
    
    if (cleaned.includes("am") || cleaned.includes("pm")) {
        period = cleaned.endsWith("am") ? "am" : "pm";
        cleaned = cleaned.replace(/am|pm/gi, "").trim();
    }
    
    if (cleaned.includes(":")) {
        const parts = cleaned.split(":");
        hour = parseInt(parts[0]);
        minute = parseInt(parts[1]) || 0;
    } else {
        hour = parseInt(cleaned);
    }
    
    if (isNaN(hour)) return null;
    
    // Convert to 24-hour format
    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
    
    return hour * 60 + minute;
};

// Function to group consecutive slots based on FULL slot logic
const groupConsecutiveSlots = (selectedCourts, halfSelectedSlots) => {
    const groupedResults = [];
    
    selectedCourts.forEach(court => {
        if (!court.time || court.time.length === 0) return;
        
        // Sort slots by time
        const sortedSlots = [...court.time].sort((a, b) => {
            const timeA = parseTimeToMinutes(a.time);
            const timeB = parseTimeToMinutes(b.time);
            return timeA - timeB;
        });
        
        const dateKey = court.date;
        const courtId = court._id;
        
        const groups = [];
        let currentGroup = [];
        
        for (let i = 0; i < sortedSlots.length; i++) {
            const slot = sortedSlots[i];
            const leftKey = `${courtId}-${slot._id}-${dateKey}-left`;
            const rightKey = `${courtId}-${slot._id}-${dateKey}-right`;
            
            const leftSelected = halfSelectedSlots?.has(leftKey);
            const rightSelected = halfSelectedSlots?.has(rightKey);
            
            // Check if this is a FULL slot
            const isFullSlot = (leftSelected && rightSelected) || (!leftSelected && !rightSelected);
            const isLeftOnly = leftSelected && !rightSelected;
            const isRightOnly = !leftSelected && rightSelected;
            
            if (currentGroup.length === 0) {
                // First slot - always start new group
                currentGroup = [slot];
            } else {
                const lastSlot = currentGroup[currentGroup.length - 1];
                const lastTime = parseTimeToMinutes(lastSlot.time);
                const currentTime = parseTimeToMinutes(slot.time);
                const timeDiff = currentTime - lastTime;
                
                // Check if slots are consecutive (60 minutes apart)
                if (timeDiff === 60) {
                    // Get last slot's selection type
                    const lastLeftKey = `${courtId}-${lastSlot._id}-${dateKey}-left`;
                    const lastRightKey = `${courtId}-${lastSlot._id}-${dateKey}-right`;
                    const lastLeftSelected = halfSelectedSlots?.has(lastLeftKey);
                    const lastRightSelected = halfSelectedSlots?.has(lastRightKey);
                    const lastIsFullSlot = (lastLeftSelected && lastRightSelected) || (!lastLeftSelected && !lastRightSelected);
                    
                    // Grouping rules:
                    // 1. FULL + LEFT = Group
                    // 2. FULL + FULL = Group  
                    // 3. FULL + RIGHT = Separate
                    // 4. LEFT + anything = Separate
                    // 5. RIGHT + anything = Separate
                    
                    const canGroup = lastIsFullSlot && (isFullSlot || isLeftOnly);
                    
                    if (canGroup) {
                        // Add to current group
                        currentGroup.push(slot);
                    } else {
                        // Start new group
                        groups.push([...currentGroup]);
                        currentGroup = [slot];
                    }
                } else {
                    // Not consecutive - start new group
                    groups.push([...currentGroup]);
                    currentGroup = [slot];
                }
            }
        }
        
        // Add remaining group if exists
        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }
        
        // Create grouped results
        groups.forEach(group => {
            if (group.length === 1) {
                // Single slot
                const slot = group[0];
                const displayTime = getSlotDisplayTime(slot, court, halfSelectedSlots);
                
                groupedResults.push({
                    court,
                    slots: group,
                    isGroup: false,
                    displayTime,
                    totalAmount: Number(slot.amount || 0)
                });
            } else {
                // Multiple consecutive slots - create time range
                const startTime = group[0].time;
                const endTime = calculateCorrectEndTime(group, court, halfSelectedSlots);
                const totalAmount = group.reduce((sum, slot) => sum + Number(slot.amount || 0), 0);
                
                groupedResults.push({
                    court,
                    slots: group,
                    isGroup: true,
                    displayTime: `${formatTimeForRange(startTime)} – ${formatTimeForRange(endTime)}`,
                    totalAmount
                });
            }
        });
    });
    
    return groupedResults;
};

// Helper to get display time for single slot (handles half-slots)
const getSlotDisplayTime = (slot, court, halfSelectedSlots) => {
    const dateKey = court.date;
    const courtId = court._id;
    const leftKey = `${courtId}-${slot._id}-${dateKey}-left`;
    const rightKey = `${courtId}-${slot._id}-${dateKey}-right`;
    
    const leftSelected = halfSelectedSlots?.has(leftKey);
    const rightSelected = halfSelectedSlots?.has(rightKey);
    
    if (leftSelected && rightSelected) {
        // Full slot selected
        return formatTimeForRange(slot.time);
    } else if (leftSelected) {
        // Only left half selected
        return formatTimeForRange(slot.time);
    } else if (rightSelected) {
        // Only right half selected  
        return formatTimeForRange(slot.time.replace(':00', ':30'));
    }
    
    // Default full slot
    return formatTimeForRange(slot.time);
};

// Helper to calculate correct end time for grouped slots
const calculateCorrectEndTime = (group, court, halfSelectedSlots) => {
    const lastSlot = group[group.length - 1];
    
    // For grouped slots, end time should be the start time of the last slot
    // This gives us ranges like 7PM-8PM instead of 7PM-9PM
    return formatTimeForRange(lastSlot.time);
};

// Helper to format time for range display
const formatTimeForRange = (timeStr) => {
    if (!timeStr) return "";
    
    let cleaned = timeStr.toString().toLowerCase().trim();
    let hour, minute = "00", period = "";
    
    if (cleaned.includes("am") || cleaned.includes("pm")) {
        period = cleaned.endsWith("am") ? "AM" : "PM";
        cleaned = cleaned.replace(/am|pm/gi, "").trim();
    }
    
    if (cleaned.includes(":")) {
        [hour, minute] = cleaned.split(":");
    } else {
        hour = cleaned;
    }
    
    let hourNum = parseInt(hour);
    if (isNaN(hourNum)) return timeStr;
    
    let formattedHour = hourNum.toString().padStart(2, "0");
    minute = minute ? minute.padStart(2, "0") : "00";
    return `${formattedHour}:${minute} ${period}`.trim();
};

const BookingSummary = ({
    totalSlots,
    isExpanded,
    setIsExpanded,
    clubData,
    logo,
    selectedCourts,
    handleDeleteSlot,
    handleClearAll,
    grandTotal,
    errorShow,
    errorMessage,
    buttonConfig,
    className,
    handleBookNow,
    displayedSlotCount,
    duration,  // Add duration prop
    halfSelectedSlots  // Add halfSelectedSlots prop
}) => {
    console.log('BookingSummary selectedCourts:', selectedCourts);
    console.log('BookingSummary duration:', duration);

    return (
        <>
            <div
                className={`col-lg-5 col-12 ps-lg-4 ps-0 py-lg-4 mt-lg-0 mobile-booking-summary ${totalSlots === 0 ? "d-lg-block d-none" : ""
                    }`}
            >

                <div
                    className="border w-100 px-0 pt-1 pb-0 border-0 mobile-summary-container small-curve-wrapper"
                    style={{
                        height: "68vh",
                        borderRadius: "10px 30% 10px 10px",
                        background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                        position: "relative",
                    }}
                >
                    {totalSlots > 0 && (
                        <div
                            className="small-curve-arrow d-lg-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                        >
                            {!isExpanded ? (
                                <MdKeyboardArrowUp
                                    size={25}
                                    color="white"
                                    className="arrow-shake-infinite"
                                />
                            ) : (
                                <MdKeyboardArrowDown
                                    size={25}
                                    color="white"
                                    className="arrow-shake-infinite"
                                />
                            )}
                        </div>
                    )}

                    <style>{`
                      .small-curve-arrow {
                        position: absolute;
                        top: -14px;
                        left: 50%;
                        transform: translateX(-50%);
                        z-index: 5;
                        background: #0b39d7;
                        width: 49px;
                        height: 27px;
                        border-radius: 20px 20px 0 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding-top: 2px;
                        cursor: pointer;
                      }
                    `}</style>

                    <div className="d-flex mb-3 mt-2 position-relative d-none d-lg-flex">
                        <img
                            src={booking_logo_img}
                            className="booking-logo-img"
                            alt=""
                        />

                        <div
                            className="text-center ps-2 pe-1 mt-3"
                            style={{ maxWidth: "200px" }}
                        >
                            <p
                                className="mt-2 mb-1 text-white"
                                style={{
                                    fontSize: "20px",
                                    fontWeight: "600",
                                    fontFamily: "Poppins",
                                }}
                            >
                                {clubData?.clubName}
                            </p>
                            <p
                                className="mt-2 mb-1 text-white"
                                style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    fontFamily: "Poppins",
                                    lineHeight: "1.3",
                                    wordWrap: "break-word",
                                }}
                            >
                                {clubData?.address} <br /> {clubData?.zipCode}
                            </p>
                        </div>
                        <div
                            className="position-absolute"
                            style={{ top: "13px", left: "17.5%" }}
                        >
                            {logo ? (
                                <div
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        boxShadow: "0px 4px 11.4px 0px #0000002E",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#f9f9f9",
                                    }}
                                >
                                    <img
                                        src={logo}
                                        alt="Club logo"
                                        style={{
                                            width: "100%",
                                            height: "auto",
                                            backgroundSize: "contain",
                                        }}
                                    />
                                </div>
                            ) : (
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        backgroundColor: "#374151",
                                        border: "2px solid white",
                                        boxShadow: "0px 4px 11.4px 0px #0000002E",
                                        fontSize: "24px",
                                        fontWeight: "600",
                                        color: "white",
                                    }}
                                >
                                    {clubData?.clubName
                                        ? clubData?.clubName.charAt(0).toUpperCase()
                                        : "C"}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="d-flex border-top px-3 pt-2 justify-content-between align-items-center d-none d-lg-flex">
                        <h6 className="p-2 mb-1 ps-0 text-white custom-heading-use">
                            Booking Summary ({displayedSlotCount} Slot{displayedSlotCount !== 1 ? 's' : ''} selected)
                        </h6>
                        {displayedSlotCount >= 10 && (
                            <Button
                                className="float-end me-3 btn border-0 shadow rounded-pill"
                                style={{
                                    cursor: "pointer",
                                    background: "#111827",
                                    fontSize: "10px",
                                    fontWeight: "600",
                                    fontFamily: "Poppins",
                                }}
                                onClick={handleClearAll}
                            >
                                Clear All
                            </Button>
                        )}
                    </div>

                    <div
                        className="px-3"
                        style={{
                            maxHeight: "250px",
                            overflowY: "auto",
                            overflowX: "hidden",
                            paddingRight: "16px",
                        }}
                    >
                        <style>{`
                        div::-webkit-scrollbar {
                          width: 8px;
                          border-radius: 3px;
                        }
                        div::-webkit-scrollbar-track {
                          background: #f5f5f5;
                          border-radius: 3px;
                        }
                        div::-webkit-scrollbar-thumb {
                          background: #626262;
                        }
                        div::-webkit-scrollbar-thumb:hover {
                          background: #626262;
                        }
                      `}</style>

                        {/* Desktop Slots */}
                        <div
                            className="div d-none d-lg-block"
                            style={{ height: "18vh" }}
                        >
                            {selectedCourts?.length > 0 ? (
                                (() => {
                                    const groupedSlots = groupConsecutiveSlots(selectedCourts, halfSelectedSlots);
                                    
                                    return groupedSlots?.map((group, index) => (
                                        <div key={`group-${index}`} className="row mb-2">
                                            <div className="col-12 d-flex gap-2 mb-0 m-0 align-items-center justify-content-between">
                                                <div className="d-flex text-white">
                                                    <span
                                                        style={{
                                                            fontWeight: "600",
                                                            fontFamily: "Poppins",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        {group.court?.date
                                                            ? `${new Date(group.court.date).toLocaleString(
                                                                "en-US",
                                                                {
                                                                    day: "2-digit",
                                                                }
                                                            )}, ${new Date(group.court.date).toLocaleString(
                                                                "en-US",
                                                                {
                                                                    month: "short",
                                                                }
                                                            )}`
                                                            : ""}
                                                    </span>
                                                    <span
                                                        className="ps-1"
                                                        style={{
                                                            fontWeight: "600",
                                                            fontFamily: "Poppins",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        {group.displayTime}
                                                    </span>
                                                    <span
                                                        className="ps-2"
                                                        style={{
                                                            fontWeight: "500",
                                                            fontFamily: "Poppins",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        {group.court?.courtName}
                                                    </span>
                                                </div>
                                                <div className="text-white align-items-center">
                                                    ₹
                                                    <span
                                                        className="ps-0"
                                                        style={{
                                                            fontWeight: "600",
                                                            fontFamily: "Poppins",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        {Number(group.totalAmount).toLocaleString("en-IN")}
                                                    </span>
                                                    <MdOutlineDeleteOutline
                                                        className="ms-1 mb-1 mt-1 text-white"
                                                        size={15}
                                                        style={{ cursor: "pointer" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Delete all slots in the group
                                                            group.slots.forEach(slot => {
                                                                handleDeleteSlot(
                                                                    group.court._id,
                                                                    group.court.date,
                                                                    slot.originalId || slot._id
                                                                );
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ));
                                })()
                            ) : (
                                <div
                                    className="d-flex flex-column justify-content-center align-items-center text-white"
                                    style={{ height: "25vh" }}
                                >
                                    <p
                                        style={{
                                            fontSize: "14px",
                                            fontFamily: "Poppins",
                                            fontWeight: "500",
                                        }}
                                    >
                                        No slot selected
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="div d-lg-none px-0 mobile-slots-container">
                            <div
                                className={`mobile-expanded-slots ${isExpanded ? "expanded border-bottom" : " "
                                    }`}
                                style={{
                                    maxHeight: isExpanded
                                        ? totalSlots > 2
                                            ? "175px"
                                            : "200px"
                                        : "0",
                                    overflowY:
                                        isExpanded && totalSlots > 2 ? "auto" : "hidden",
                                    transition: "max-height 0.3s ease",
                                }}
                            >
                                {isExpanded && (
                                    <h6
                                        className="mb-0 pb-1 text-white fw-semibold pt-2"
                                        style={{ fontSize: "15px" }}
                                    >
                                        Booking Summary
                                    </h6>
                                )}

                                <style>{`
                            .mobile-expanded-slots.expanded::-webkit-scrollbar {
                              width: 6px;
                              border-radius: 3px;
                            }
                            .mobile-expanded-slots.expanded::-webkit-scrollbar-track {
                              background: rgba(255, 255, 255, 0.2);
                              border-radius: 3px;
                              margin: 4px 0;
                            }
                            .mobile-expanded-slots.expanded::-webkit-scrollbar-thumb {
                              background: #ffffff;
                              border-radius: 3px;
                              border: 1px solid #001b76;
                            }
                            .mobile-expanded-slots.expanded::-webkit-scrollbar-thumb:hover {
                              background: #cccccc;
                            }
                          `}</style>

                                {isExpanded &&
                                    selectedCourts?.length > 0 &&
                                    (() => {
                                        const groupedSlots = groupConsecutiveSlots(selectedCourts, halfSelectedSlots);
                                        
                                        return groupedSlots.map((group, index) => (
                                            <div
                                                key={`mobile-group-${index}`}
                                                className="row mb-0"
                                            >
                                                <div className="col-12 d-flex gap-1 mb-0 m-0 align-items-center justify-content-between">
                                                    <div className="d-flex text-white">
                                                        <span
                                                            style={{
                                                                fontWeight: "600",
                                                                fontFamily: "Poppins",
                                                                fontSize: "11px",
                                                            }}
                                                        >
                                                            {group.court?.date
                                                                ? `${new Date(group.court.date).toLocaleString(
                                                                    "en-US",
                                                                    {
                                                                        day: "2-digit",
                                                                    }
                                                                )}, ${new Date(group.court.date).toLocaleString(
                                                                    "en-US",
                                                                    {
                                                                        month: "short",
                                                                    }
                                                                )}`
                                                                : ""}
                                                        </span>
                                                        <span
                                                            className="ps-1"
                                                            style={{
                                                                fontWeight: "600",
                                                                fontFamily: "Poppins",
                                                                fontSize: "11px",
                                                            }}
                                                        >
                                                            {group.displayTime}
                                                        </span>
                                                        <span
                                                            className="ps-1"
                                                            style={{
                                                                fontWeight: "500",
                                                                fontFamily: "Poppins",
                                                                fontSize: "10px",
                                                            }}
                                                        >
                                                            {group.court.courtName}
                                                        </span>
                                                    </div>
                                                    <div className="text-white">
                                                        <span
                                                            className="ps-1"
                                                            style={{
                                                                fontWeight: "600",
                                                                fontFamily: "Poppins",
                                                                fontSize: "11px",
                                                            }}
                                                        >
                                                            ₹ {Number(group.totalAmount).toLocaleString("en-IN")}
                                                        </span>
                                                        <MdOutlineDeleteOutline
                                                            className="ms-1 text-white"
                                                            style={{
                                                                cursor: "pointer",
                                                                fontSize: "14px",
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Delete all slots in the group
                                                                group.slots.forEach(slot => {
                                                                    handleDeleteSlot(
                                                                        group.court._id,
                                                                        group.court.date,
                                                                        slot.originalId || slot._id
                                                                    );
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                            </div>
                        </div>
                    </div>

                    {totalSlots > 0 && (
                        <>
                            <div className="d-lg-none py-0 pt-1">
                                <div className="d-flex justify-content-between align-items-center px-3">
                                    <div className="d-flex flex-column">
                                        <span className="text-white" style={{ fontSize: "14px", fontWeight: "500" }}>
                                            Total to Pay
                                        </span>
                                        <span className="text-white" style={{ fontSize: "12px", color: "#e5e7eb" }}>
                                            Total Slot: {displayedSlotCount}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-white" style={{ fontSize: "20px", fontWeight: "600" }}>
                                            ₹{Number(grandTotal).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-top pt-2 px-3 mt-2 text-white d-flex justify-content-between align-items-center fw-bold d-none d-lg-flex">
                                <p className="d-flex flex-column mb-0" style={{ fontSize: "16px", fontWeight: "600" }}>
                                    Total to Pay
                                </p>
                                <p className="mb-0" style={{ fontSize: "25px", fontWeight: "600" }}>
                                    ₹{Number(grandTotal).toLocaleString('en-IN')}
                                </p>
                            </div>
                        </>
                    )}

                    {errorShow && errorMessage && (
                        <div
                            className="text-center mx-3 mb-2 p-2 rounded"
                            style={{
                                fontWeight: 500,
                                backgroundColor: "rgba(255, 235, 238, 0.9)",
                                color: "#c62828",
                                border: "1px solid #ffcdd2",
                                fontSize: "12px",
                                fontFamily: "Poppins"
                            }}
                        >
                            {errorMessage}
                        </div>
                    )}

                    <div className="d-flex justify-content-center align-items-center px-3">
                        <button
                            style={{
                                ...buttonConfig.buttonStyle,
                                opacity: totalSlots === 0 ? 0.5 : 1,
                                cursor: totalSlots === 0 ? "not-allowed" : "pointer",
                                pointerEvents: totalSlots === 0 ? "none" : "auto",
                            }}
                            className={`${className} `}
                            disabled={totalSlots === 0}
                            onClick={handleBookNow}
                        >
                            <svg
                                style={buttonConfig.svgStyle}
                                viewBox={`0 0 ${buttonConfig.width} ${buttonConfig.height}`}
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <linearGradient
                                        id={`buttonGradient-${buttonConfig.width}-${buttonConfig.height}`}
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="0%"
                                    >
                                        <stop offset="0%" stopColor="#fff" />
                                        <stop offset="50%" stopColor="#fff" />
                                        <stop offset="100%" stopColor="#fff" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d={`M ${buttonConfig.width * 0.76} ${buttonConfig.height * 0.15} C ${buttonConfig.width * 0.79
                                        } ${buttonConfig.height * 0.15} ${buttonConfig.width * 0.81} ${buttonConfig.height * 0.2} ${buttonConfig.width * 0.83
                                        } ${buttonConfig.height * 0.3} C ${buttonConfig.width * 0.83} ${buttonConfig.height * 0.32} ${buttonConfig.width * 0.84
                                        } ${buttonConfig.height * 0.34} ${buttonConfig.width * 0.84} ${buttonConfig.height * 0.34} C ${buttonConfig.width * 0.85
                                        } ${buttonConfig.height * 0.34} ${buttonConfig.width * 0.86} ${buttonConfig.height * 0.32} ${buttonConfig.width * 0.86
                                        } ${buttonConfig.height * 0.3} C ${buttonConfig.width * 0.88} ${buttonConfig.height * 0.2} ${buttonConfig.width * 0.9
                                        } ${buttonConfig.height * 0.15} ${buttonConfig.width * 0.92} ${buttonConfig.height * 0.15} C ${buttonConfig.width * 0.97
                                        } ${buttonConfig.height * 0.15} ${buttonConfig.width * 0.996} ${buttonConfig.height * 0.3} ${buttonConfig.width * 0.996
                                        } ${buttonConfig.height * 0.5} C ${buttonConfig.width * 0.996} ${buttonConfig.height * 0.7} ${buttonConfig.width * 0.97
                                        } ${buttonConfig.height * 0.85} ${buttonConfig.width * 0.92} ${buttonConfig.height * 0.85} C ${buttonConfig.width * 0.9
                                        } ${buttonConfig.height * 0.85} ${buttonConfig.width * 0.88} ${buttonConfig.height * 0.8} ${buttonConfig.width * 0.86
                                        } ${buttonConfig.height * 0.7} C ${buttonConfig.width * 0.86} ${buttonConfig.height * 0.68} ${buttonConfig.width * 0.85
                                        } ${buttonConfig.height * 0.66} ${buttonConfig.width * 0.84} ${buttonConfig.height * 0.66} C ${buttonConfig.width * 0.84
                                        } ${buttonConfig.height * 0.66} ${buttonConfig.width * 0.83} ${buttonConfig.height * 0.68} ${buttonConfig.width * 0.83
                                        } ${buttonConfig.height * 0.7} C ${buttonConfig.width * 0.81} ${buttonConfig.height * 0.8} ${buttonConfig.width * 0.79
                                        } ${buttonConfig.height * 0.85} ${buttonConfig.width * 0.76} ${buttonConfig.height * 0.85} L ${buttonConfig.width * 0.08
                                        } ${buttonConfig.height * 0.85} C ${buttonConfig.width * 0.04} ${buttonConfig.height * 0.85} ${buttonConfig.width * 0.004
                                        } ${buttonConfig.height * 0.7} ${buttonConfig.width * 0.004} ${buttonConfig.height * 0.5} C ${buttonConfig.width * 0.004
                                        } ${buttonConfig.height * 0.3} ${buttonConfig.width * 0.04} ${buttonConfig.height * 0.15} ${buttonConfig.width * 0.08
                                        } ${buttonConfig.height * 0.15} L ${buttonConfig.width * 0.76} ${buttonConfig.height * 0.15} Z`}
                                    fill={`url(#buttonGradient-${buttonConfig.width}-${buttonConfig.height})`}
                                />
                                <circle
                                    cx={buttonConfig.width * 0.76 + (buttonConfig.width * 0.996 - buttonConfig.width * 0.76) * 0.68 + 1}
                                    cy={buttonConfig.height * 0.5}
                                    r={buttonConfig.circleRadius}
                                    fill="#001B76"
                                />

                                <g
                                    stroke="white"
                                    strokeWidth={buttonConfig.height * 0.03}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="book-now-arrow"
                                    style={{
                                        transformOrigin: `${buttonConfig.arrowX}px ${buttonConfig.arrowY}px`,
                                        transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.4, 1)"
                                    }}
                                >
                                    <path
                                        d={`M ${buttonConfig.width * 0.76 + (buttonConfig.width * 0.996 - buttonConfig.width * 0.76) * 0.68 + 1 - buttonConfig.circleRadius * 0.6 * 0.3} ${buttonConfig.height * 0.5 + buttonConfig.circleRadius * 0.6 * 0.4
                                            } L ${buttonConfig.width * 0.76 + (buttonConfig.width * 0.996 - buttonConfig.width * 0.76) * 0.68 + 1 + buttonConfig.circleRadius * 0.6 * 0.4} ${buttonConfig.height * 0.5 - buttonConfig.circleRadius * 0.6 * 0.4
                                            }`}
                                    />
                                    <path
                                        d={`M ${buttonConfig.width * 0.76 + (buttonConfig.width * 0.996 - buttonConfig.width * 0.76) * 0.68 + 1 + buttonConfig.circleRadius * 0.6 * 0.4} ${buttonConfig.height * 0.5 - buttonConfig.circleRadius * 0.6 * 0.4
                                            } L ${buttonConfig.width * 0.76 + (buttonConfig.width * 0.996 - buttonConfig.width * 0.76) * 0.68 + 1 - buttonConfig.circleRadius * 0.6 * 0.1} ${buttonConfig.height * 0.5 - buttonConfig.circleRadius * 0.6 * 0.4
                                            }`}
                                    />
                                    <path
                                        d={`M ${buttonConfig.width * 0.76 + (buttonConfig.width * 0.996 - buttonConfig.width * 0.76) * 0.68 + 1 + buttonConfig.circleRadius * 0.6 * 0.4} ${buttonConfig.height * 0.5 - buttonConfig.circleRadius * 0.6 * 0.4
                                            } L ${buttonConfig.width * 0.76 + (buttonConfig.width * 0.996 - buttonConfig.width * 0.76) * 0.68 + 1 + buttonConfig.circleRadius * 0.6 * 0.4} ${buttonConfig.height * 0.5 + buttonConfig.circleRadius * 0.6 * 0.1
                                            }`}
                                    />
                                </g>
                            </svg>
                            <div style={buttonConfig.contentStyle}>Book Now</div>
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}

export default BookingSummary