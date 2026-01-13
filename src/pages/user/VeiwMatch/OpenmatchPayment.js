// src/pages/user/CreateMatches/OpenmatchPayment.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createMatches } from "../../../redux/user/matches/thunk";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { Avatar } from "@mui/material";
import { getUserClub } from "../../../redux/user/club/thunk";
import { createBooking, removeBookedBooking } from "../../../redux/user/booking/thunk";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import {
    MdOutlineDeleteOutline,
    MdKeyboardArrowDown,
    MdKeyboardArrowUp,
} from "react-icons/md";
import {
    getUserProfile,
    loginUserNumber,
    updateUser,
} from "../../../redux/user/auth/authThunk";
import { booking_logo_img } from "../../../assets/files";
import config from "../../../config";

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
        // Only right half selected - add 30 minutes to the base time
        let timeStr = slot.time;
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
            minute = "00";
        }

        let hourNum = parseInt(hour);
        let minuteNum = parseInt(minute) + 30;
        
        // Handle minute overflow
        if (minuteNum >= 60) {
            minuteNum -= 60;
            hourNum += 1;
            
            // Handle 12-hour format overflow
            if (hourNum > 12) {
                hourNum = 1;
                period = period === "AM" ? "PM" : "AM";
            }
        }

        let formattedHour = hourNum.toString().padStart(2, "0");
        let formattedMinute = minuteNum.toString().padStart(2, "0");
        return `${formattedHour}:${formattedMinute} ${period}`.trim();
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

const formatTime = (timeStr) => {
    if (!timeStr) return "";
    // If time already has minutes (e.g., "2:30 pm"), just uppercase AM/PM
    if (timeStr.includes(":")) {
        return timeStr.replace(" am", " AM").replace(" pm", " PM");
    }
    // If time doesn't have minutes (e.g., "2 pm"), add :00
    return timeStr.replace(" am", ":00 AM").replace(" pm", ":00 PM");
};

// Helper function to format time display - shows the time as-is since displaySlots already have correct times
const formatTimeDisplay = (timeStr, duration, timeSlot, halfSelectedSlots, activeHalves, courtId, date) => {
    if (!timeStr) return "";
    
    // For 30min duration, check if this is a right-side selection
    if (duration === 30 && halfSelectedSlots && activeHalves && courtId && date && timeSlot?._id) {
        const slotKey = `${courtId}-${timeSlot._id}-${date}`;
        const activeHalf = activeHalves.get(slotKey);
        
        if (activeHalf === 'right') {
            // This is a right-side selection, add 30 minutes to the base time
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
                minute = "00";
            }

            let hourNum = parseInt(hour);
            let minuteNum = parseInt(minute) + 30;
            
            // Handle minute overflow
            if (minuteNum >= 60) {
                minuteNum -= 60;
                hourNum += 1;
                
                // Handle 12-hour format overflow
                if (hourNum > 12) {
                    hourNum = 1;
                    period = period === "AM" ? "PM" : "AM";
                }
            }

            let formattedHour = hourNum.toString().padStart(2, "0");
            let formattedMinute = minuteNum.toString().padStart(2, "0");
            return `${formattedHour}:${formattedMinute} ${period}`.trim();
        }
    }
    
    // Default formatting for left-side or non-30min slots
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


// Button styling variables
const width = 370;
const height = 75;
const circleRadius = height * 0.3;
const curvedSectionStart = width * 0.76;
const curvedSectionEnd = width * 0.996;
const circleX =
    curvedSectionStart + (curvedSectionEnd - curvedSectionStart) * 0.68 + 1;
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
    color: "#001B76",
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

const RAZORPAY_KEY = `${config.RAZORPAY_KEY}`;


const OpenmatchPayment = () => {
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const { state } = useLocation();
    const navigate = useNavigate();
    const User = getUserFromSession();
    const userData = useSelector((state) => state?.userAuth?.user?.response);
    const clubData = useSelector(
        (state) => state?.userClub?.clubData?.data?.courts?.[0] || {}
    );
    const createId = useSelector((state) => state?.userMatches?.matchesData?.match?._id
    );
    const [userName, setUserName] = useState(User?.name || "");
    const store = useSelector((state) => state?.userAuth);
    const createMatchesLoading = useSelector((state) => state?.userMatches?.matchesLoading);
    const bookingLoading = useSelector((state) => state?.userBooking?.bookingLoading);
    const logo = clubData?.logo;

    const updateProfile = JSON.parse(
        localStorage.getItem("updateprofile") || "{}"
    );
    const [addedPlayers, setAddedPlayers] = useState(() => {
        const saved = localStorage.getItem("addedPlayers");
        if (saved) {
            const players = JSON.parse(saved);
            Object.keys(players).forEach(slot => {
                if (slot !== 'gameType' && players[slot] && typeof players[slot] === 'object') {
                    if (!players[slot]?._id) {
                        players[slot]._id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    }
                }
            });
            localStorage.setItem("addedPlayers", JSON.stringify(players));
            return players;
        }
        return {};
    });

    useEffect(() => {
        const sync = () => {
            const saved = localStorage.getItem("addedPlayers");
            setAddedPlayers(saved ? JSON.parse(saved) : {});
        };
        sync();
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, []);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => document.body.contains(script) && document.body.removeChild(script);
    }, []);

    const [name, setName] = useState(userName || User?.name || updateProfile?.fullName || store?.user?.response?.name || "");
    const [phoneNumber, setPhoneNumber] = useState(
        User?.phoneNumber
            ? `+91 ${User.phoneNumber}`
            : updateProfile?.phone
                ? `+91 ${updateProfile.phone}`
                : ""
    );
    const [email, setEmail] = useState(User?.email || updateProfile?.email || store?.user?.response?.email || "");
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        slotData = {},
        finalSkillDetails = [],
        selectedDate = {},
        selectedCourts = [],
        selectedGender = [],
        addedPlayers: stateAddedPlayers = {},
        dynamicSteps,
        finalLevelStep,
        selectedDuration = 60,
        halfSelectedSlots = new Set(),
        activeHalves = new Map()
    } = state || {};
    console.log(halfSelectedSlots,selectedCourts,'halfSelectedSlots');

    const finalAddedPlayers =
        Object.keys(stateAddedPlayers).length > 0
            ? stateAddedPlayers
            : addedPlayers;

    const savedClubId = localStorage.getItem("register_club_id");
    const owner_id = localStorage.getItem("owner_id");

    const teamA = [User?._id, finalAddedPlayers.slot2?._id].filter(Boolean);
    const teamB = [
        finalAddedPlayers.slot3?._id,
        finalAddedPlayers.slot4?._id,
    ].filter(Boolean);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await dispatch(getUserProfile()).unwrap();
                setUserName(result?.response?.name || User?.name || "");
                setEmail(result?.response?.email);
            } catch (err) {
                setUserName(User?.name || "");
            }
        };

        fetchData();
    }, [dispatch, User?.name]);

    useEffect(() => {
        dispatch(getUserClub({ search: "" }));
    }, [dispatch]);

    const handleBooking = async () => {
        setError({});

        // Validation
        if (!name?.trim()) return setError({ name: "Name required" });

        const cleanPhone = phoneNumber?.replace(/^\+91\s*/, "").trim();
        if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone))
            return setError({ phoneNumber: "Valid 10-digit phone required" });

        if (localTotalSlots === 0) return setError({ general: "Select at least one slot" });

        setIsLoading(true);

        try {
            if (User?.phoneNumber) {
                await dispatch(updateUser({ phoneNumber: cleanPhone, name, email, gender: selectedGender })).unwrap();
            }
            const answersArray = finalSkillDetails
                ? Object.keys(finalSkillDetails)
                    .sort((a, b) => a - b)
                    .map(key => finalSkillDetails[key])
                : [];

            const formattedMatch = {
                slot: localSelectedCourts.flatMap((court, courtIndex) => court?.time?.map((timeSlot, timeIndex) => {
                    const slotInfo = slotData?.data?.find(c => c._id === court?._id)?.slots?.find(s => s._id === timeSlot?._id);
                    let bookingTime = formatTime(timeSlot?.time);
                    let slotTime = timeSlot?.time;

                    // Check if this is a half-slot selection
                    const dateKey = court?.date;
                    const courtId = court?._id;
                    const leftKey = `${courtId}-${timeSlot?._id}-${dateKey}-left`;
                    const rightKey = `${courtId}-${timeSlot?._id}-${dateKey}-right`;
                    
                    const leftSelected = halfSelectedSlots?.has(leftKey);
                    const rightSelected = halfSelectedSlots?.has(rightKey);
                    
                    // Debug logging
                    console.log(`Slot ${timeSlot?.time}: leftSelected=${leftSelected}, rightSelected=${rightSelected}`);
                    
                    // Determine if this is a half-slot selection
                    // Only consider it a half-slot if exactly one half is selected
                    const isHalfSlot = (leftSelected && !rightSelected) || (rightSelected && !leftSelected);
                    
                    console.log(`Slot ${timeSlot?.time}: isHalfSlot=${isHalfSlot}, duration will be ${isHalfSlot ? 30 : 60}`);
                    
                    if (rightSelected && !leftSelected) {
                        // For right half, we need to add 30 minutes to the original time
                        // First, let's use the timeSlot time which should be correct
                        const originalTime = timeSlot?.time;
                        
                        // Simple approach: if it's already formatted correctly, use it
                        if (originalTime.includes(':30')) {
                            slotTime = originalTime;
                            bookingTime = formatTime(originalTime);
                        } else {
                            // Parse the original time and add 30 minutes
                            const timeMatch = originalTime.match(/(\d+)(?::(\d+))?\s*(am|pm)/i);
                            if (timeMatch) {
                                let hour = parseInt(timeMatch[1]);
                                let minute = parseInt(timeMatch[2] || '0') + 30;
                                const period = timeMatch[3];
                                
                                // Handle minute overflow
                                if (minute >= 60) {
                                    minute -= 60;
                                    hour += 1;
                                    
                                    // Handle 12-hour format overflow
                                    if (hour > 12) {
                                        hour = 1;
                                    }
                                }
                                
                                const rightTime = minute === 0 
                                    ? `${hour} ${period}`
                                    : `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
                                slotTime = rightTime;
                                bookingTime = formatTime(rightTime);
                            } else {
                                // Fallback: use the original value
                                slotTime = originalTime;
                                bookingTime = formatTime(originalTime);
                            }
                        }
                    }

                    return {
                        slotId: timeSlot?._id,
                        businessHours: slotInfo?.businessHours || [{ time: "06:00 AM - 11:00 PM", day: selectedDate?.day || court?.day }],
                        slotTimes: [{ time: slotTime, amount: timeSlot?.amount || 1000 }],
                        courtName: court?.courtName,
                        courtId: court?._id,
                        bookingDate: new Date(court?.date || selectedDate?.fullDate).toISOString(),
                        duration: isHalfSlot ? 30 : 60,
                        bookingTime: bookingTime,
                        totalTime: isHalfSlot ? 30 : 60
                    };
                })),
                clubId: savedClubId,
                gender: selectedGender === 'Male' ? 'Male Only' : selectedGender === 'Female' ? 'Female Only' : 'Mixed Double' || "Mixed Double",
                matchDate: new Date(selectedDate?.fullDate).toISOString().split("T")[0],
                ...(answersArray?.length > 0 && {
                    skillLevel: answersArray[0] || "Open Match",
                    skillDetails: answersArray?.slice(1)?.map((answer, i) => {
                        if (i === 0 && Array.isArray(answer)) return answer.join(", ");
                        return answer;
                    })
                }),
                matchStatus: "open",
                matchTime: localSelectedCourts.flatMap(court => 
                    court?.time?.map(timeSlot => {
                        // Apply same half-slot logic for matchTime
                        const dateKey = court?.date;
                        const courtId = court?._id;
                        const leftKey = `${courtId}-${timeSlot?._id}-${dateKey}-left`;
                        const rightKey = `${courtId}-${timeSlot?._id}-${dateKey}-right`;
                        
                        const leftSelected = halfSelectedSlots?.has(leftKey);
                        const rightSelected = halfSelectedSlots?.has(rightKey);
                        
                        if (rightSelected && !leftSelected) {
                            // For right half, we need to add 30 minutes to the original time
                            const originalTime = timeSlot?.time;
                            
                            // Simple approach: if it's already formatted correctly, use it
                            if (originalTime.includes(':30')) {
                                return originalTime;
                            } else {
                                // Parse the original time and add 30 minutes
                                const timeMatch = originalTime.match(/(\d+)(?::(\d+))?\s*(am|pm)/i);
                                if (timeMatch) {
                                    let hour = parseInt(timeMatch[1]);
                                    let minute = parseInt(timeMatch[2] || '0') + 30;
                                    const period = timeMatch[3];
                                    
                                    // Handle minute overflow
                                    if (minute >= 60) {
                                        minute -= 60;
                                        hour += 1;
                                        
                                        // Handle 12-hour format overflow
                                        if (hour > 12) {
                                            hour = 1;
                                        }
                                    }
                                    
                                    return minute === 0 
                                        ? `${hour} ${period}`
                                        : `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
                                } else {
                                    // Fallback: use the original value
                                    return originalTime;
                                }
                            }
                        }
                        
                        return timeSlot?.time;
                    })
                ).join(","),
                teamA,
                teamB,
                initiatePayment: true,
                bookingStatus:'upcoming',
                paymentMethod: 'Online Payment'
            };

            // First API call to initiate payment
            const initialResponse = await dispatch(createMatches(formattedMatch)).unwrap();
            
            if (initialResponse?.requiresPayment && initialResponse?.paymentDetails) {
                // Setup Razorpay with payment details from API
                const options = {
                    key: initialResponse.paymentDetails.key || RAZORPAY_KEY,
                    order_id: initialResponse.paymentDetails.orderId,
                    amount: initialResponse.paymentDetails.amount * 100,
                    currency: initialResponse.paymentDetails.currency || "INR",
                    name: clubData?.clubName || "Open Match",
                    description: "Open Match Booking",
                    image: logo || undefined,
                    prefill: { name, email, contact: cleanPhone },
                    theme: { color: "#001B76" },

                    handler: async function (response) {
                        console.log({response});
                        try {
                            // Second API call after successful payment
                            const finalMatchData = {
                                ...formattedMatch,
                                initiatePayment: false,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpaySignature: response.razorpay_signature,
                                paymentMethod: response.method || 'Razorpay'
                            };

                            const matchResponse = await dispatch(createMatches(finalMatchData)).unwrap();
                            if (matchResponse?.match?._id) {
                                localStorage.removeItem("addedPlayers");
                                window.dispatchEvent(new Event("playersUpdated"));
                                navigate("/open-matches", {
                                    replace: true,
                                    state: { selectedDate }
                                });
                                dispatch(getUserProfile());
                            } else {
                                throw new Error("Failed to create match");
                            }
                        } catch (err) {
                            console.error("Post-payment error:", err);
                            setError({ general: "Match creation failed" });
                        } finally {
                            setIsLoading(false);
                        }
                    },

                    modal: {
                        ondismiss: () => {
                            setIsLoading(false);
                            setError({ general: "Payment cancelled" });
                        }
                    }
                };

                const razorpay = new window.Razorpay(options);
                razorpay.on("payment.failed", (response) => {
                    setIsLoading(false);
                    setError({ general: response.error?.description || "Payment failed" });
                });
                razorpay.open();
            } else {
                throw new Error("Payment initialization failed");
            }

        } catch (err) {
            console.error("Match creation error:", err);
            setError({ general: err.message || "Match creation failed" });
            setIsLoading(false);
        }
    };
    // Local state for mobile summary
    const [localSelectedCourts, setLocalSelectedCourts] = useState(selectedCourts || []);

    // Calculate display slots and totals based on duration and half-slot selections
    const getDisplayData = () => {
        const displaySlots = [];
        localSelectedCourts.forEach(court => {
            court?.time?.forEach(timeSlot => {
                displaySlots.push({
                    ...court,
                    time: [timeSlot]
                });
            });
        });
        
        // Calculate effective slot count considering half-slots
        let effectiveSlotCount = 0;
        
        if (halfSelectedSlots && halfSelectedSlots.size > 0) {
            // If we have half-selected slots, count them as 0.5 each
            effectiveSlotCount = halfSelectedSlots.size * 0.5;
        } else {
            // Otherwise count regular slots
            effectiveSlotCount = displaySlots.length;
        }
        
        return { displaySlots, totalSlots: effectiveSlotCount };
    };

    const { displaySlots, totalSlots } = getDisplayData();
    const localTotalSlots = totalSlots;
    // Calculate total amount considering half-slot selections (same as CreateMatches.js)
    const calculateTotalAmount = () => {
        return localSelectedCourts.reduce((sum, court) => {
            const courtTotal = court.time.reduce((courtSum, timeSlot) => {
                // Simply use the stored amount - it's already correct based on selection
                return courtSum + Number(timeSlot.amount || 0);
            }, 0);
            return sum + courtTotal;
        }, 0);
    };
    
    const localGrandTotal = calculateTotalAmount();

    const handleDeleteSlot = async (courtId, slotId) => {
        const court = localSelectedCourts.find(c => c._id === courtId);
        const slot = court?.time.find(t => t._id === slotId);
        
        if (slot) {
            const payload = {
                slotId: slot._id,
                courtId: courtId,
                bookingDate: court.date,
                time: slot.time,
                bookingTime: slot.bookingTime
            };
            
            try {
                const result = await dispatch(removeBookedBooking(payload));
                if (result.payload?.deleted === true) {
                    setLocalSelectedCourts(prev => {
                        const updated = prev
                            ?.map((c) =>
                                c?._id === courtId
                                    ? { ...c, time: c?.time.filter((s) => s?._id !== slotId) }
                                    : c
                            )
                            .filter((c) => c?.time?.length > 0);

                        // If no slots remain, navigate back to create matches
                        if (updated?.length === 0) {
                            setTimeout(() => {
                                navigate("/create-matches", {
                                    state: { selectedDate },
                                });
                            }, 100);
                        }

                        return updated;
                    });
                }
            } catch (error) {
                console.error('Error removing slot:', error);
            }
        }
    };

    useEffect(() => {
        if (Object.keys(error).length > 0) {
            const t = setTimeout(() => setError({}), 4000);
            return () => clearTimeout(t);
        }
    }, [error]);

    useEffect(() => {
        if (bookingLoading) {
            setIsLoading(false);
        }
    }, [bookingLoading]);

    return (
        <div className="container mt-md-4 mt-0 mb-md-5 mb-0 d-flex gap-4 px-md-4 px-0 flex-wrap">
            {/* Mobile Back Button */}
            <div className="d-lg-none position-fixed" style={{ top: "20px", left: "20px", zIndex: 1001 }}>
                <button
                    className="btn btn-light rounded-circle p-2"
                    onClick={() => navigate("/create-matches", { state: { selectedDate } })}
                    style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <i className="bi bi-arrow-left" style={{ fontSize: "18px" }}></i>
                </button>
            </div>
            <div className="row  mx-auto d-flex align-items-center justify-content-center">
                {/* Left: Contact + Payment */}
                <div
                    className="col-lg-5 col-12 py-md-3 pt-0 pb-3  rounded-3 mobile-payment-content px-0"
                    style={{
                        paddingBottom: localSelectedCourts?.length > 0 ? "120px" : "20px",
                    }}
                >
                    {/* Information Section */}
                    <div
                        className="rounded-4 py-md-4 py-2 px-3 px-md-5 pb-5  mb-md-4"
                        style={{
                            // backgroundColor: "#F5F5F566",
                            border:
                                error?.name || error?.email || error?.phoneNumber
                                    ? "2px solid red"
                                    : "none",
                        }}
                    >

                        <div className="row d-flex justify-content-center align-tems-center">
                            <h6 className="mb-md-3 mb-0 mt-0 mt-lg-0 custom-heading-use fw-semibold text-center text-md-start ps-1">
                                Information
                            </h6>
                            <div className="col-12 col-md-12 mb-md-3 mb-2 p-md-1 py-0">
                                <label
                                    className="form-label mb-0 ps-lg-0"
                                    style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}
                                >
                                    Name <span className="text-danger" style={{ fontSize: "16px", fontWeight: "300" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    style={{ boxShadow: "none" }}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || /^[A-Za-z\s]*$/.test(value)) {
                                            if (value?.length === 0 && value.trim() === "") {
                                                setName("");
                                                return;
                                            }
                                            const formattedValue = value
                                                .trimStart()
                                                .replace(/\s+/g, " ")
                                                .toLowerCase()
                                                .replace(/(^|\s)\w/g, (letter) => letter.toUpperCase());
                                            setName(formattedValue);
                                        }
                                    }}
                                    className="form-control p-2"
                                    placeholder="Enter your name"
                                    aria-label="Name"
                                />
                                {error?.name && (
                                    <div
                                        className="text-danger position-absolute mt-3"
                                        style={{ fontSize: "12px", marginTop: "4px" }}
                                    >
                                        {error?.name}
                                    </div>
                                )}
                            </div>

                            <div className="col-12 col-md-12 mb-md-3 mb-2 p-md-1 py-0">
                                <label
                                    className="form-label mb-0 ps-lg-0"
                                    style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}
                                >
                                    Phone Number <span className="text-danger" style={{ fontSize: "16px", fontWeight: "300" }}>*</span>
                                </label>
                                <div className="input-group">
                                    <span
                                        className="input-group-text border-0 p-2"
                                        style={{ backgroundColor: "#F5F5F5" }}
                                    >
                                        <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} />
                                    </span>
                                    <input
                                        type="text"
                                        maxLength={13}
                                        value={phoneNumber}
                                        style={{ boxShadow: "none" }}
                                        disabled={User?.phoneNumber}
                                        onChange={(e) => {
                                            const inputValue = e.target.value.replace(/[^0-9]/g, "");
                                            if (inputValue === "" || /^[6-9][0-9]{0,9}$/.test(inputValue)) {
                                                const formattedValue = inputValue === "" ? "" : `+91 ${inputValue}`;
                                                setPhoneNumber(formattedValue);
                                            }
                                        }}
                                        className="form-control p-2"
                                        placeholder="+91"
                                    />
                                </div>
                                {error?.phoneNumber && (
                                    <div
                                        className="text-danger position-absolute"
                                        style={{ fontSize: "12px", marginTop: "4px" }}
                                    >
                                        {error?.phoneNumber}
                                    </div>
                                )}
                            </div>

                            <div className="col-12 col-md-12 mb-md-3 mb-2 p-md-1 py-0">
                                <label
                                    className="form-label mb-0 ps-lg-0"
                                    style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    style={{ boxShadow: "none" }}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || /^[A-Za-z0-9@.]*$/.test(value)) {
                                            setEmail(value.replace(/\s+/g, ""));
                                        }
                                    }}
                                    className="form-control p-2"
                                    placeholder="Enter your email"
                                />
                                {error?.email && (
                                    <div
                                        className="text-danger position-absolute"
                                        style={{ fontSize: "12px", marginTop: "4px" }}
                                    >
                                        {error?.email}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Summary */}

                <div className="col-lg-5 col-12 ps-lg-4 ps-0 py-lg-4 mt-lg-0 mobile-payment-summary">
                    <div
                        className="border w-100 px-0 py-4 border-0 mobile-payment-summary-container"
                        style={{
                            height: "62vh",
                            borderRadius: "10px 30% 10px 10px",
                            background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                        }}
                    >
                        {/* Desktop Logo/Address Section */}
                        <div className="d-flex mb-4 position-relative d-none d-md-flex">
                            <img src={booking_logo_img} className="booking-logo-img" alt="" />
                            <div className="text-center ps-2 pe-0 mt-3" style={{ maxWidth: "200px" }}>
                                <p className="mt-2 mb-1 text-white" style={{ fontSize: "20px", fontWeight: "600", fontFamily: "Poppins" }}>
                                    {clubData?.clubName}
                                </p>
                                <p
                                    className="mt-2 mb-1 text-white"
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        fontFamily: "Poppins",
                                        lineHeight: "1.3",
                                    }}
                                >
                                    {clubData?.address} <br /> {clubData?.zipCode}
                                </p>
                            </div>
                            <div
                                className="position-absolute"
                                style={{ top: "11.5px", left: "17.8%" }}
                            >
                                {logo ? (
                                    <div
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            backgroundColor: "#f9f9f9",
                                            boxShadow: "0px 4px 11px #0000002e",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <img src={logo} alt="Club" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                ) : (
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                            backgroundColor: "#374151",
                                            border: "2px solid white",
                                            fontSize: "24px",
                                            fontWeight: "600",
                                            color: "#fff",
                                        }}
                                    >
                                        {clubData?.clubName?.charAt(0).toUpperCase() || "Logo"}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop Booking Summary */}
                        <div className="d-none d-md-block">
                            <div className="d-flex border-top px-3 pt-2 justify-content-between align-items-center d-none d-md-flex">
                                <h6 className="p-2 mb-1 ps-0 text-white custom-heading-use">Booking Summary {localTotalSlots > 0 ? ` (${localTotalSlots % 1 === 0 ? localTotalSlots : localTotalSlots.toFixed(1)} Slot selected)` : ''}</h6>
                            </div>
                            <div className="px-3">
                                <style>{`
                                     .slots-container::-webkit-scrollbar {
                                       width: 8px;
                                       border-radius : 3px;
                                     }
                                     .slots-container::-webkit-scrollbar-track {
                                       background: #F5F5F5;
                                       border-radius: 3px;
                                     }
                                     .slots-container::-webkit-scrollbar-thumb {
                                       background:  #626262;
                                       
                                     }
                                     .slots-container::-webkit-scrollbar-thumb:hover {
                                       background: #626262;
                                     }
                                   `}</style>
                                <div
                                    className="slots-container"
                                    style={{
                                        maxHeight: "250px",
                                        overflowY: "auto",
                                        overflowX: "hidden",
                                        paddingRight: "8px",
                                    }}
                                >
                                    {localSelectedCourts?.length > 0 ? (
                                        (() => {
                                            const groupedSlots = groupConsecutiveSlots(localSelectedCourts, halfSelectedSlots);
                                            
                                            return groupedSlots?.map((group, index) => (
                                                <div key={`group-${index}`} className="row mb-2">
                                                    <div className="col-12 d-flex gap-2 mb-0 m-0 align-items-center justify-content-between">
                                                        <div className="d-flex text-white">
                                                            <span style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "15px" }}>
                                                                {group.court?.date ? `${new Date(group.court.date).toLocaleString("en-US", { day: "2-digit" })}, ${new Date(group.court.date).toLocaleString("en-US", { month: "short" })}` : ""}
                                                            </span>
                                                            <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "15px" }}>
                                                                {group.displayTime}
                                                            </span>
                                                            <span className="ps-2" style={{ fontWeight: "500", fontFamily: "Poppins", fontSize: "15px" }}>
                                                                {group.court?.courtName}
                                                            </span>
                                                        </div>
                                                        <div className="text-white">
                                                            ₹<span className="ps-0 pt-1" style={{ fontWeight: "600", fontFamily: "Poppins" }}>
                                                                {Number(group.totalAmount).toLocaleString("en-IN")}
                                                            </span>
                                                            <MdOutlineDeleteOutline 
                                                                className="mt-1 ms-1 mb-1 text-white" 
                                                                style={{ cursor: "pointer" }} 
                                                                size={15} 
                                                                onClick={() => {
                                                                    // Delete all slots in the group
                                                                    group.slots.forEach(slot => {
                                                                        handleDeleteSlot(group.court._id, slot._id);
                                                                    });
                                                                }} 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ));
                                        })()
                                    ) : (
                                        <div className="d-flex flex-column justify-content-center align-items-center text-white" style={{ height: "22vh" }}>
                                            <p style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500" }}>No slot selected</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Mobile Booking Summary - Fixed Bottom */}
                        <div className="d-lg-none mobile-openmatch-payment-summary" style={{
                            position: "fixed",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
                            borderRadius: "10px 10px 0 0",
                            padding: "0px 15px",
                        }}>
                            {localSelectedCourts?.length > 0 && (
                                <>
                                    {/* Arrow controls - First row */}
                                    {/* <div className="d-flex justify-content-center align-items-center py-2" style={{ borderBottom: isExpanded ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
                                        <div onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: "pointer" }}>
                                            {!isExpanded ? (
                                                <MdKeyboardDoubleArrowUp size={25} style={{ color: "white" }} className="arrow-shake-infinite" />
                                            ) : (
                                                <MdKeyboardDoubleArrowDown size={25} style={{ color: "white" }} className="arrow-shake-infinite" />
                                            )}
                                        </div>
                                    </div> */}

                                    {localSelectedCourts?.length > 0 && (
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

                                    {/* Expandable slots list */}
                                    <div
                                        className={`mobile-expanded-slots ${isExpanded ? "expanded border-bottom" : " "
                                            }`}
                                        style={{
                                            maxHeight: isExpanded
                                                ? localTotalSlots > 2
                                                    ? "175px"
                                                    : "200px"
                                                : "0px",
                                            overflowY:
                                                isExpanded && localTotalSlots > 2 ? "auto" : "hidden",
                                            overflowX: "hidden",
                                            paddingRight: "8px",
                                            transition: "max-height 0.3s ease",
                                            marginBottom: isExpanded ? "0px" : "0",
                                        }}
                                    >
                                        {isExpanded && (
                                            <h6
                                                className="mb-0 pb-1 text-white fw-semibold pt-2"
                                                style={{ fontSize: "15px" }}
                                            >
                                                Order Summary :
                                            </h6>
                                        )}
                                        <style>{`
                      .mobile-expanded-slots::-webkit-scrollbar {
                        width: 8px;
                        border-radius: 3px;
                      }
                      .mobile-expanded-slots::-webkit-scrollbar-track {
                        background: #f5f5f5;
                        border-radius: 3px;
                      }
                      .mobile-expanded-slots::-webkit-scrollbar-thumb {
                        background: #626262;
                        border-radius: 3px;
                      }
                      .mobile-expanded-slots::-webkit-scrollbar-thumb:hover {
                        background: #626262;
                      }
                      .mobile-expanded-slots {
                        scrollbar-width: thin;
                        scrollbar-color: #626262 #f5f5f5;
                      }
                    `}</style>

                                        {isExpanded &&
                                            displaySlots?.map((court, cIdx) =>
                                                court?.time?.map((timeSlot, sIdx) => (
                                                    <div key={`${cIdx}-${sIdx}`} className="row mb-0">
                                                        <div className="col-12 d-flex gap-1 mb-0 m-0 align-items-center justify-content-between">
                                                            <div className="d-flex text-white">
                                                                <span
                                                                    style={{
                                                                        fontWeight: "600",
                                                                        fontFamily: "Poppins",
                                                                        fontSize: "11px",
                                                                    }}
                                                                >
                                                                    {court?.date
                                                                        ? `${new Date(court?.date).toLocaleString(
                                                                            "en-US",
                                                                            { day: "2-digit" }
                                                                        )}, ${new Date(court?.date).toLocaleString(
                                                                            "en-US",
                                                                            { month: "short" }
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
                                                                    {formatTimeDisplay(timeSlot.time, selectedDuration, timeSlot, halfSelectedSlots, activeHalves, court._id, court.date)}
                                                                </span>
                                                                <span
                                                                    className="ps-1"
                                                                    style={{
                                                                        fontWeight: "500",
                                                                        fontFamily: "Poppins",
                                                                        fontSize: "10px",
                                                                    }}
                                                                >
                                                                    {court?.courtName}
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
                                                                    ₹ {timeSlot?.amount ? Number(timeSlot?.amount).toLocaleString("en-IN") : "N/A"}
                                                                </span>
                                                                <MdOutlineDeleteOutline
                                                                    className="ms-1 text-white"
                                                                    style={{
                                                                        cursor: "pointer",
                                                                        fontSize: "14px",
                                                                    }}
                                                                    onClick={() =>
                                                                        handleDeleteSlot(court?._id, timeSlot?._id)
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                    </div>

                                    {/* Total Section - Second row */}
                                    <div className={`py-0 pt-1 ${isExpanded ? 'border-top' : ''}`}>
                                        <div className="d-flex justify-content-between align-items-center px-0">
                                            <div>
                                                <span className="text-white" style={{ fontSize: "14px", fontWeight: "500" }}>
                                                    Total to Pay
                                                </span>
                                                <span className="d-block text-white" style={{ fontSize: "12px" }}>
                                                    Total Slots: {localTotalSlots % 1 === 0 ? localTotalSlots : localTotalSlots.toFixed(1)}
                                                </span>
                                            </div>

                                            <span
                                                className="text-white gap-0"
                                                style={{ fontSize: "20px", fontWeight: "600" }}
                                            >
                                                ₹{Number(localGrandTotal || 0).toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Book Button */}
                                    <div className="d-flex justify-content-center align-items-center px-lg-3">
                                        <button
                                            style={{
                                                ...buttonStyle,
                                                opacity: localTotalSlots === 0 ? 0.5 : 1,
                                                cursor:
                                                    localTotalSlots === 0 ? "not-allowed" : "pointer",
                                                pointerEvents: localTotalSlots === 0 ? "none" : "auto",
                                            }}
                                            className=""
                                            disabled={localTotalSlots === 0}
                                            onClick={handleBooking}
                                        >
                                            <svg
                                                style={svgStyle}
                                                viewBox={`0 0 ${width} ${height}`}
                                                preserveAspectRatio="none"
                                            >
                                                <defs>
                                                    <linearGradient
                                                        id={`buttonGradient-${width}-${height}`}
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
                                                    d={`M ${width * 0.76} ${height * 0.15} C ${width * 0.79
                                                        } ${height * 0.15} ${width * 0.81} ${height * 0.2} ${width * 0.83
                                                        } ${height * 0.3} C ${width * 0.83} ${height * 0.32
                                                        } ${width * 0.84} ${height * 0.34} ${width * 0.84} ${height * 0.34
                                                        } C ${width * 0.85} ${height * 0.34} ${width * 0.86
                                                        } ${height * 0.32} ${width * 0.86} ${height * 0.3
                                                        } C ${width * 0.88} ${height * 0.2} ${width * 0.9} ${height * 0.15
                                                        } ${width * 0.92} ${height * 0.15} C ${width * 0.97
                                                        } ${height * 0.15} ${width * 0.996} ${height * 0.3} ${width * 0.996
                                                        } ${height * 0.5} C ${width * 0.996} ${height * 0.7
                                                        } ${width * 0.97} ${height * 0.85} ${width * 0.92} ${height * 0.85
                                                        } C ${width * 0.9} ${height * 0.85} ${width * 0.88} ${height * 0.8
                                                        } ${width * 0.86} ${height * 0.7} C ${width * 0.86} ${height * 0.68
                                                        } ${width * 0.85} ${height * 0.66} ${width * 0.84} ${height * 0.66
                                                        } C ${width * 0.84} ${height * 0.66} ${width * 0.83
                                                        } ${height * 0.68} ${width * 0.83} ${height * 0.7
                                                        } C ${width * 0.81} ${height * 0.8} ${width * 0.79} ${height * 0.85
                                                        } ${width * 0.76} ${height * 0.85} L ${width * 0.08
                                                        } ${height * 0.85} C ${width * 0.04} ${height * 0.85
                                                        } ${width * 0.004} ${height * 0.7} ${width * 0.004} ${height * 0.5
                                                        } C ${width * 0.004} ${height * 0.3} ${width * 0.04
                                                        } ${height * 0.15} ${width * 0.08} ${height * 0.15
                                                        } L ${width * 0.76} ${height * 0.15} Z`}
                                                    fill={`url(#buttonGradient-${width}-${height})`}
                                                />
                                                <circle
                                                    cx={circleX}
                                                    cy={circleY}
                                                    r={circleRadius}
                                                    fill="#001B76"
                                                />
                                                <g
                                                    stroke="white"
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
                                                    <path
                                                        d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4
                                                            } L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                                                            }`}
                                                    />
                                                    <path
                                                        d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                                                            } L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4
                                                            }`}
                                                    />
                                                    <path
                                                        d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                                                            } L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1
                                                            }`}
                                                    />
                                                </g>
                                            </svg>
                                            <div style={contentStyle}>
                                                {isLoading || createMatchesLoading || bookingLoading ? (
                                                    <ButtonLoading color={"#001B76"} />
                                                ) : (
                                                "Pay Now"
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        {/* Desktop Total Section */}
                        {localTotalSlots > 0 && (
                            <div className="border-top pt-2 px-3 mt-2 text-white d-flex justify-content-between align-items-center fw-bold mobile-total-section d-none d-md-flex">
                                <p
                                    className="d-flex flex-column mb-0"
                                    style={{ fontSize: "16px", fontWeight: "600" }}
                                >
                                    Total to Pay{" "}

                                </p>
                                <p
                                    className="mb-0"
                                    style={{ fontSize: "25px", fontWeight: "600" }}
                                >
                                    ₹{Number(localGrandTotal || 0).toLocaleString("en-IN")}
                                </p>
                            </div>
                        )}

                        {/* Desktop Book Button */}
                        <div className="d-flex justify-content-center  align-items-center d-none d-md-flex">
                            <button
                                style={{ ...buttonStyle }}
                                className=""
                                onClick={handleBooking}
                            >
                                <svg
                                    style={svgStyle}
                                    viewBox={`0 0 ${width} ${height}`}
                                    preserveAspectRatio="none"
                                >
                                    <defs>
                                        <linearGradient
                                            id={`buttonGradient-desktop-${width}-${height}`}
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
                                        d={`M ${width * 0.76} ${height * 0.15} C ${width * 0.79} ${height * 0.15
                                            } ${width * 0.81} ${height * 0.2} ${width * 0.83} ${height * 0.3
                                            } C ${width * 0.83} ${height * 0.32} ${width * 0.84} ${height * 0.34
                                            } ${width * 0.84} ${height * 0.34} C ${width * 0.85} ${height * 0.34
                                            } ${width * 0.86} ${height * 0.32} ${width * 0.86} ${height * 0.3
                                            } C ${width * 0.88} ${height * 0.2} ${width * 0.9} ${height * 0.15
                                            } ${width * 0.92} ${height * 0.15} C ${width * 0.97} ${height * 0.15
                                            } ${width * 0.996} ${height * 0.3} ${width * 0.996} ${height * 0.5
                                            } C ${width * 0.996} ${height * 0.7} ${width * 0.97} ${height * 0.85
                                            } ${width * 0.92} ${height * 0.85} C ${width * 0.9} ${height * 0.85
                                            } ${width * 0.88} ${height * 0.8} ${width * 0.86} ${height * 0.7
                                            } C ${width * 0.86} ${height * 0.68} ${width * 0.85} ${height * 0.66
                                            } ${width * 0.84} ${height * 0.66} C ${width * 0.84} ${height * 0.66
                                            } ${width * 0.83} ${height * 0.68} ${width * 0.83} ${height * 0.7
                                            } C ${width * 0.81} ${height * 0.8} ${width * 0.79} ${height * 0.85
                                            } ${width * 0.76} ${height * 0.85} L ${width * 0.08} ${height * 0.85
                                            } C ${width * 0.04} ${height * 0.85} ${width * 0.004} ${height * 0.7
                                            } ${width * 0.004} ${height * 0.5} C ${width * 0.004} ${height * 0.3
                                            } ${width * 0.04} ${height * 0.15} ${width * 0.08} ${height * 0.15
                                            } L ${width * 0.76} ${height * 0.15} Z`}
                                        fill={`url(#buttonGradient-desktop-${width}-${height})`}
                                    />
                                    <circle
                                        cx={circleX}
                                        cy={circleY}
                                        r={circleRadius}
                                        fill="#001B76"
                                    />
                                    <g
                                        stroke="white"
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
                                        <path
                                            d={`M ${arrowX - arrowSize * 0.3} ${arrowY + arrowSize * 0.4
                                                } L ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                                                }`}
                                        />
                                        <path
                                            d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                                                } L ${arrowX - arrowSize * 0.1} ${arrowY - arrowSize * 0.4
                                                }`}
                                        />
                                        <path
                                            d={`M ${arrowX + arrowSize * 0.4} ${arrowY - arrowSize * 0.4
                                                } L ${arrowX + arrowSize * 0.4} ${arrowY + arrowSize * 0.1
                                                }`}
                                        />
                                    </g>
                                </svg>
                                <div style={contentStyle}>
                                    {isLoading || createMatchesLoading || bookingLoading ? <ButtonLoading color={"#001B76"} /> : "Pay Now"}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OpenmatchPayment;