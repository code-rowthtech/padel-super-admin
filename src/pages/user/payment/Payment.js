import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createBooking, removeBookedBooking } from "../../../redux/user/booking/thunk";
import { getUserProfile, loginUserNumber, updateUser } from "../../../redux/user/auth/authThunk";
import { ButtonLoading } from "../../../helpers/loading/Loaders";
import { Button, Modal } from "react-bootstrap";
import { booking_logo_img, success2 } from "../../../assets/files";
import { getUserFromSession } from "../../../helpers/api/apiCore";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdOutlineDeleteOutline } from "react-icons/md";
import config from "../../../config";
import { showSuccess } from "../../../helpers/Toast";

const RAZORPAY_KEY = `${config.RAZORPAY_KEY}`;

const Payment = ({ className = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courtData, clubData, selectedCourts, grandTotal, totalSlots, duration, halfSelectedSlots } = location.state || {};
  const user = getUserFromSession();
  const store = useSelector((state) => state?.userAuth);
  const bookingStatus = useSelector((state) => state?.userBooking);
  const userLoading = useSelector((state) => state?.userAuth);
  const logo = clubData?.logo;
  const updateName = JSON.parse(localStorage.getItem("updateprofile"));
  const [name, setName] = useState(user?.name || updateName?.fullName || store?.user?.response?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(
    updateName?.phone || user?.phoneNumber || updateName?.phone ? `+91 ${user?.phoneNumber}` : ""
  );
  const [email, setEmail] = useState(updateName?.email || user?.email || store?.user?.response?.email || "");
  const [errors, setErrors] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    paymentMethod: "",
    general: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const dispatch = useDispatch();
  const [localSelectedCourts, setLocalSelectedCourts] = useState(selectedCourts || []);
  const [localGrandTotal, setLocalGrandTotal] = useState(grandTotal || 0);
  const [localTotalSlots, setLocalTotalSlots] = useState(totalSlots || 0);
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => {
    // Calculate effective slot count considering half-slots
    let effectiveSlotCount = 0;
    
    if (halfSelectedSlots && halfSelectedSlots.size > 0) {
      // If we have half-selected slots, count them as 0.5 each
      effectiveSlotCount = halfSelectedSlots.size * 0.5;
    } else {
      // Otherwise count regular slots
      effectiveSlotCount = localSelectedCourts.reduce((sum, c) => sum + c?.time?.length, 0);
    }
    
    const newGrandTotal = localSelectedCourts.reduce(
      (sum, c) => sum + c?.time?.reduce((s, t) => s + Number(t?.amount || 2000), 0),
      0
    );
    
    setLocalTotalSlots(effectiveSlotCount);
    setLocalGrandTotal(newGrandTotal);
  }, [localSelectedCourts, halfSelectedSlots]);

  useEffect(() => {
    // If page is refreshed and no court data exists, redirect to booking
    if (!courtData && !location.state) {
      navigate("/booking");
      return;
    }
    setLocalSelectedCourts(selectedCourts || []);
  }, [courtData, selectedCourts, navigate, location.state]);

  useEffect(() => {
    if (paymentConfirmed && bookingStatus?.bookingData?.message === "Bookings created") {
      setLocalSelectedCourts([]);
      setPaymentConfirmed(false);
      // Don't auto-redirect here - let user click Continue button
    }
  }, [paymentConfirmed, bookingStatus?.bookingData?.message]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setErrors((prev) => ({
        ...prev,
        name: "",
        phoneNumber: "",
        email: "",
        paymentMethod: "",
        general: "",
      }));
    }, 5000);
    return () => clearTimeout(timer);
  }, [errors]);

  // Auto redirect when all slots are deleted - but NOT after successful payment
  useEffect(() => {
    if (localSelectedCourts?.length === 0 && courtData && !modal) {
      navigate("/booking");
    }
  }, [localSelectedCourts, navigate, courtData, modal]);

  const handleDeleteSlot = async (e, courtId, date, timeId) => {
    e.stopPropagation();
    setDeleteLoading(true);

    const slotsToRemove = [];

    // For 90min duration, handle both first slot and auto-selected half slot removal
    if (duration === 90) {
      const court = localSelectedCourts.find(c => c._id === courtId && c.date === date);
      if (court) {
        court.time.forEach(slot => {
          slotsToRemove.push({
            slotId: slot._id,
            courtId: courtId,
            bookingDate: date,
            time: slot.time,
            bookingTime: slot.bookingTime,
            duration: 60
          });
        });
      }
      
      // Remove all slots for this court and date (both first slot and half slot)
      setLocalSelectedCourts((prev) =>
        prev.filter((c) => !(c?._id === courtId && c?.date === date))
      );
    }
    // For 120min duration, handle both consecutive slots removal
    else if (duration === 120) {
      const court = localSelectedCourts.find(c => c._id === courtId && c.date === date);
      if (court) {
        const slotsToRemoveSet = new Set([timeId]);

        // Find all slots that are part of the same 120min booking
        court.time.forEach(slot => {
          if (slot._id !== timeId) {
            slotsToRemoveSet.add(slot._id);
          }
        });

        // Collect slots for API removal
        court.time.forEach(slot => {
          if (slotsToRemoveSet.has(slot._id)) {
            slotsToRemove.push({
              slotId: slot._id,
              courtId: courtId,
              bookingDate: date,
              time: slot.time,
              bookingTime: slot.bookingTime,
              duration: 60
            });
          }
        });

        // Remove all related slots
        setLocalSelectedCourts((prev) =>
          prev
            ?.map((c) =>
              c?._id === courtId && c?.date === date
                ? {
                  ...c,
                  time: c?.time.filter((t) => !slotsToRemoveSet.has(t._id))
                }
                : c
            )
            .filter((c) => c?.time?.length > 0)
        );
      }
    }
    // Regular slot deletion for other durations
    else {
      const court = localSelectedCourts.find(c => c._id === courtId && c.date === date);
      const slot = court?.time.find(t => t._id === timeId);
      
      if (slot) {
        slotsToRemove.push({
          slotId: slot._id,
          courtId: courtId,
          bookingDate: date,
          time: slot.time,
          bookingTime: slot.bookingTime,
          duration: 60
        });
      }

      setLocalSelectedCourts((prev) =>
        prev
          ?.map((court) =>
            court?._id === courtId && court?.date === date
              ? { ...court, time: court?.time.filter((t) => t?._id !== timeId) }
              : court
          )
          .filter((court) => court?.time?.length > 0)
      );
    }

    // Make API calls for all slots to be removed
    for (const slotData of slotsToRemove) {
      // Determine if this is a half-slot deletion and set correct duration
      let duration = 60; // default
      let apiTime = slotData.time;
      
      // Check if this is a half-slot (contains :30 or is marked as half)
      if (slotData.time && slotData.time.includes(':30')) {
        duration = 30;
      } else if (halfSelectedSlots && halfSelectedSlots.size > 0) {
        // Check if any half-slots exist for this slot
        const leftKey = `${slotData.courtId}-${slotData.slotId}-${slotData.bookingDate}-left`;
        const rightKey = `${slotData.courtId}-${slotData.slotId}-${slotData.bookingDate}-right`;
        if (halfSelectedSlots.has(leftKey) || halfSelectedSlots.has(rightKey)) {
          duration = 30;
        }
      }
      
      const payload = {
        slotId: slotData.slotId,
        courtId: slotData.courtId,
        bookingDate: slotData.bookingDate,
        time: apiTime,
        bookingTime: apiTime,
        duration: duration,
        loading:false
      };
      
      try {
        const result = await dispatch(removeBookedBooking(payload));
        if (result?.payload?.deleted !== true) {
          console.error('Failed to delete slot:', slotData.slotId);
        }
      } catch (error) {
        console.error('Error removing slot:', error);
      }
    }

    // If no courts remain, navigate back to booking
    if (localSelectedCourts?.length === 1 && localSelectedCourts[0]?.time?.length === 1) {
      setTimeout(() => navigate("/booking"), 100);
    }
    
    setDeleteLoading(false);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const parseTimeToHour = (timeStr) => {
    if (!timeStr) return null;
    let hour;
    let period = "am";

    if (typeof timeStr === "string") {
      const timeStrLower = timeStr.toLowerCase();
      if (timeStrLower.endsWith("am") || timeStrLower.endsWith("pm")) {
        period = timeStrLower?.slice(-2);
        hour = timeStrLower?.slice(0, -2).trim();
      } else {
        const timeParts = timeStrLower.split(" ");
        if (timeParts?.length > 1) {
          hour = timeParts[0];
          period = timeParts[1];
        } else {
          hour = timeStrLower;
        }
      }
      hour = parseInt(hour.split(":")[0]);
      if (isNaN(hour)) return null;

      if (period === "pm" && hour !== 12) hour += 12;
      if (period === "am" && hour === 12) hour = 0;
    }
    return hour;
  };

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
      if (!court.time || court.time?.length === 0) return;

      // Sort slots by time
      const sortedSlots = [...court.time].sort((a, b) => {
        const timeA = parseTimeToMinutes(a.time);
        const timeB = parseTimeToMinutes(b.time);
        return timeA - timeB;
      });

      const dateKey = court?.date;
      const courtId = court?._id;

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


  // Payment handle function with comprehensive error handling
  const handlePayment = async () => {
    try {
      const rawPhoneNumber = phoneNumber.replace(/^\+91\s/, "").trim();

      // Enhanced validation
      const newErrors = {
        name: !name.trim()
          ? "Name is required"
          : name.trim().length < 2
            ? "Name must be at least 2 characters"
            : "",
        phoneNumber: !rawPhoneNumber
          ? "Phone number is required"
          : !/^[6-9]\d{9}$/.test(rawPhoneNumber)
            ? "Invalid phone number format"
            : "",
        email: email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
          ? "Invalid email format"
          : "",
      };

      setErrors(newErrors);
      if (Object.values(newErrors).some((e) => e)) return;

      if (localTotalSlots === 0) {
        setErrors((prev) => ({ ...prev, general: "Please select at least one slot" }));
        return;
      }

      if (localGrandTotal <= 0) {
        setErrors((prev) => ({ ...prev, general: "Invalid payment amount" }));
        return;
      }

      setIsLoading(true);
      setErrors({ name: "", phoneNumber: "", email: "", paymentMethod: "", general: "" });

      const register_club_id = localStorage.getItem("register_club_id");
      const owner_id = localStorage.getItem("owner_id");

      if (!register_club_id || !owner_id) {
        throw new Error("Club information missing.");
      }

      const slotArray = localSelectedCourts.flatMap((court, courtIndex) => {
        const courtId = court?._id;
        const dateKey = court?.date;

        return court?.time?.map((timeSlot, timeIndex) => {
          const slotTimeStr = timeSlot?.time;
          const slotHour = parseTimeToHour(slotTimeStr);

          let bookingTime = slotTimeStr;
          let slotDuration = duration || 60;

          // Check for half-slot selections regardless of duration
          const leftKey = `${courtId}-${timeSlot._id}-${dateKey}-left`;
          const rightKey = `${courtId}-${timeSlot._id}-${dateKey}-right`;
          const isLeftHalf = halfSelectedSlots?.has(leftKey);
          const isRightHalf = halfSelectedSlots?.has(rightKey);

          // If only one half is selected, set duration to 30
          if ((isLeftHalf && !isRightHalf) || (isRightHalf && !isLeftHalf)) {
            slotDuration = 30;
            
            if (isRightHalf && !isLeftHalf) {
              // For right half, we need to add 30 minutes to the original time
              // First, let's use the slotTimes time which should be correct
              const originalTime = timeSlot?.time || slotTimeStr;
              
              // Simple approach: if it's already formatted correctly in slotTimes, use it
              if (originalTime.includes(':30')) {
                bookingTime = originalTime.replace(' am', ' AM').replace(' pm', ' PM');
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
                  
                  bookingTime = minute === 0 
                    ? `${hour}:00 ${period.toUpperCase()}`
                    : `${hour}:${minute.toString().padStart(2, '0')} ${period.toUpperCase()}`;
                } else {
                  // Fallback: use the slotTimes value if parsing fails
                  bookingTime = originalTime.replace(' am', ' AM').replace(' pm', ' PM');
                }
              }
            }
          } else if (duration === 90) {
            // For 90min, check if this is a half-selected slot (second slot)
            if (timeSlot.side) {
              slotDuration = 30; // Second slot is 30min
              if (timeSlot.side === 'right') {
                // Already has correct time from booking summary
                bookingTime = timeSlot.time;
              }
            } else {
              slotDuration = 60; // First slot is 60min
            }
          }

          const baseAmount = timeSlot?.amount || 300;

          return {
            slotId: timeSlot?.originalId || timeSlot?._id,
            businessHours: courtData?.slot?.[0]?.businessHours?.map((t) => ({
              time: t?.time,
              day: t?.day,
            })) || [{ time: "06:00 AM - 11:00 PM", day: "Friday" }],
            slotTimes: [{
              time: timeSlot?.time,
              amount: baseAmount,
            }],
            courtName: court?.courtName,
            courtId: court?._id,
            bookingDate: court?.date,
            duration: slotDuration,
            totalTime: slotDuration,
            bookingTime: bookingTime
          };
        });
      });

      const basePayload = {
        name: name.trim(),
        phoneNumber: rawPhoneNumber,
        email: email.trim(),
        register_club_id,
        bookingStatus: "upcoming",
        bookingType: "regular",
        ownerId: owner_id,
        slot: slotArray,
        paymentMethod: 'razorpay',
      };

      if (user?.phoneNumber) {
        // Check if any values have actually changed
        const currentName = name.trim();
        const currentEmail = email.trim();
        const hasNameChanged = currentName !== (user?.name || '');
        const hasPhoneChanged = rawPhoneNumber !== (user?.phoneNumber || '');
        const hasEmailChanged = currentEmail !== (user?.email || '');
        
        // Only call updateUser if any value has changed
        if (hasNameChanged || hasPhoneChanged || hasEmailChanged) {
          await dispatch(
            updateUser({
              phoneNumber: rawPhoneNumber,
              name: currentName,
              email: currentEmail,
            })
          ).unwrap()
        }
      }

      const initialBookingResponse = await dispatch(createBooking({
        ...basePayload,
        initiatePayment: true
      })).unwrap();

      if (initialBookingResponse?.paymentDetails?.key || initialBookingResponse?.paymentDetails?.orderId) {
        const options = {
          key: initialBookingResponse?.paymentDetails?.key || RAZORPAY_KEY,
          order_id: initialBookingResponse?.paymentDetails?.orderId,
          amount: localGrandTotal * 100,
          currency: "INR",
          name: clubData?.clubName || "Courtline",
          description: localTotalSlots > 1 ? `${localTotalSlots} Slots` : "1 Slot",
          image: logo || undefined,
          prefill: { name: name.trim(), email: email.trim(), contact: rawPhoneNumber },
          theme: { color: "#001B76" },

          handler: async function (response) {
            try {
              const finalBookingResponse = await dispatch(createBooking({
                ...basePayload,
                initiatePayment: false,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })).unwrap();

              if (finalBookingResponse?.success || finalBookingResponse?.message?.includes("created")) {
                setLocalSelectedCourts([]);
                setModal(true);
                dispatch(getUserProfile());
              } else {
                throw new Error(finalBookingResponse?.message || "Booking confirmation failed");
              }
            } catch (err) {
              console.error(err);
              const errorMsg = err?.response?.data?.message || err?.message || "Booking confirmation failed";
              
              if (errorMsg.toLowerCase().includes("slot already booked") || 
                  err?.message?.toLowerCase().includes("slot already booked") ||
                  (typeof err === 'string' && err.toLowerCase().includes("slot already booked"))) {
                setErrorMessage(errorMsg);
                setErrorModal(true);
              } else {
                setErrors((prev) => ({ ...prev, general: errorMsg }));
              }
            } finally {
              setIsLoading(false);
            }
          },

          modal: {
            ondismiss: () => {
              setIsLoading(false);
              setErrors((prev) => ({ ...prev, general: "Payment cancelled by user" }));
            },
          },
        };

        const razorpay = new window.Razorpay(options);

        razorpay.on("payment.failed", function (response) {
          setErrors((prev) => ({
            ...prev,
            general: response.error?.description || "Payment failed",
          }));
          setIsLoading(false);
        });

        razorpay.open();
      } else {
        throw new Error("Payment initialization failed");
      }

    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        "Payment failed. Please try again.";
      
      if (errorMessage.toLowerCase().includes("slot already booked") || 
          err?.message?.toLowerCase().includes("slot already booked") ||
          (typeof err === 'string' && err.toLowerCase().includes("slot already booked"))) {
        setErrorMessage(errorMessage);
        setErrorModal(true);
      } else {
        setErrors((prev) => ({ ...prev, general: errorMessage }));
      }
    } finally {
      setIsLoading(false);
    }
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

  // Helper function to format time - ONLY START TIME
  const formatTimeDisplay = (timeStr, duration) => {
    if (!timeStr) return "";
    // If time already has minutes (e.g., "2:30 pm"), just uppercase AM/PM
    if (timeStr.includes(":")) {
      return timeStr.replace(" am", " AM").replace(" pm", " PM");
    }
    // If time doesn't have minutes (e.g., "2 pm"), add :00
    return timeStr.replace(" am", ":00 AM").replace(" pm", ":00 PM");
  };

  const width = 370;
  const height = 75;
  const circleRadius = height * 0.3;
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
    color: "#001B76",
    fontWeight: "600",
    fontSize: "16px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingRight: `${circleRadius * 2}px`,
  };

  return (
    <div className="container mt-lg-4 mb-3 mb-md-0 px-0 px-md-0">
      <div className="row g-4 mx-auto d-flex align-items-center justify-content-center">
        <div className="col-12 col-lg-5 mobile-payment-content px-0">
          <div className="bg-white rounded">
            {/* Info Section */}
            <div
              className="rounded-4 py-md-4 py-2 pb-3 pb-lg-1 px-3 px-md-5 h-100 mb-md-4 mb-3"
              style={{
                // backgroundColor: "#F5F5F566",
                border: errors.name || errors.email || errors.phoneNumber ? "2px solid red" : "none"
              }}
            >
              <div className="row d-flex justify-content-center align-tems-center mx-auto">
                <h6 className="mb-md-3 mb-0 mt-3 mt-lg-0 custom-heading-use fw-semibold text-center text-md-start ps-1">Information</h6>

                <div className="col-12 col-md-12 mb-md-3 mb-2 p-md-1 py-0">
                  <label className="form-label mb-0 ps-lg-0" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                    Name <span className="text-danger" style={{ fontSize: "16px", fontWeight: "300" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    style={{ boxShadow: "none" }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^[A-Za-z\s]*$/.test(value)) {
                        if (value.length === 0 && value.trim() === "") {
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
                  {errors.name && (
                    <div className="text-danger" style={{ fontSize: "12px", marginTop: "4px" }}>
                      {errors?.name}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-12 mb-md-3 mb-2 p-md-1 py-0">
                  <label className="form-label mb-0 ps-lg-0" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                    Phone Number <span className="text-danger" style={{ fontSize: "16px", fontWeight: "300" }}>*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text border-0 p-2" style={{ backgroundColor: "#F5F5F5" }}>
                      <img src="https://flagcdn.com/w40/in.png" alt="IN" width={20} />
                    </span>
                    <input
                      type="text"
                      maxLength={13}
                      value={phoneNumber}
                      style={{ boxShadow: "none" }}
                      disabled={user?.phoneNumber}
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
                  {errors?.phoneNumber && (
                    <div className="text-danger" style={{ fontSize: "12px", marginTop: "4px" }}>
                      {errors?.phoneNumber}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-12 mb-md-3 mb-2 p-md-1 py-0 ">
                  <label className="form-label mb-0 ps-lg-0" style={{ fontSize: "12px", fontWeight: "500", fontFamily: "Poppins" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    style={{ boxShadow: "none" }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^[A-Za-z0-9@.]*$/.test(value)) {
                        if (value.length === 0) {
                          setEmail("");
                          return;
                        }
                        const formattedValue = value
                          .replace(/\s+/g, "")
                          .replace(/^(.)(.*)(@.*)?$/, (match, first, rest, domain = "") => {
                            return first.toUpperCase() + rest.toLowerCase() + domain;
                          });
                        setEmail(formattedValue);
                      }
                    }}
                    className="form-control p-2"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <div className="text-danger" style={{ fontSize: "12px", marginTop: "4px" }}>
                      {errors?.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="col-lg-5 col-12 ps-lg-4 ps-0 py-lg-4 mt-lg-0 mobile-payment-summary">
          <div
            className="border w-100 px-0 pt-1 pb-3 border-0 mobile-summary-container small-curve-wrapper d-flex flex-column"
            style={{
              height: "75vh",
              borderRadius: "10px 30% 10px 10px",
              background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
              position: "relative",
            }}
          >
            {/* mobile small curve arrow */}
            {localTotalSlots > 0 && (
              <div
                className="small-curve-arrow d-sm-none"
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

            {/* Desktop Logo & Address */}
            <div className="d-flex my-4 position-relative d-none d-sm-flex">
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

              <div className="position-absolute" style={{ top: "11px", left: "17.1%" }}>
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

            {/* Desktop Booking Summary Title */}
            <div className="d-flex border-top px-3 pt-2 justify-content-between align-items-center d-none d-sm-flex">
              <h6 className="p-2 mb-1 ps-0 text-white custom-heading-use">
                Booking Summary ({localTotalSlots % 1 === 0 ? localTotalSlots : localTotalSlots.toFixed(1)} Slot{localTotalSlots !== 1 ? 's' : ''} selected)
              </h6>
            </div>

            {/* Desktop Slots Scroll */}
            <div className="px-3" style={{ maxHeight: "250px", overflowY: "auto", overflowX: "hidden", paddingRight: "16px" }}>
              <style>{`
      div::-webkit-scrollbar {
        width: 8px;
        border-radius: 3px;
      }
      div::-webkit-scrollbar-thumb {
        background: #626262;
      }
    `}</style>

              <div className="d-none d-sm-block">
                {localSelectedCourts?.length > 0 ? (
                  (() => {
                    const groupedSlots = groupConsecutiveSlots(localSelectedCourts, halfSelectedSlots);

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
                              style={{ cursor: deleteLoading ? "not-allowed" : "pointer", opacity: deleteLoading ? 0.5 : 1 }}
                              onClick={(e) => {
                                if (deleteLoading) return;
                                e.stopPropagation();
                                // Delete all slots in the group
                                group.slots.forEach(slot => {
                                  handleDeleteSlot(
                                    e,
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

              {/* MOBILE Slots */}
              <div className="d-sm-none px-0 mobile-slots-container">
                <div
                  className={`mobile-expanded-slots ${isExpanded ? "expanded border-bottom" : ""}`}
                  style={{
                    maxHeight: isExpanded ? (localTotalSlots > 2 ? "155px" : "200px") : "0",
                    overflowY: isExpanded && localTotalSlots > 2 ? "auto" : "hidden",
                    transition: "max-height 0.3s ease",
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
                  <style>{` .mobile-expanded-slots.expanded::-webkit-scrollbar {
                                width: 6px;} `}
                  </style>

                  {isExpanded && localSelectedCourts?.length > 0 &&
                    (() => {
                      const groupedSlots = groupConsecutiveSlots(localSelectedCourts, halfSelectedSlots);

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
                                  cursor: deleteLoading ? "not-allowed" : "pointer",
                                  fontSize: "14px",
                                  opacity: deleteLoading ? 0.5 : 1
                                }}
                                onClick={(e) => {
                                  if (deleteLoading) return;
                                  e.stopPropagation();
                                  // Delete all slots in the group
                                  group.slots.forEach(slot => {
                                    handleDeleteSlot(
                                      e,
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
                  }}
                </div>
              </div>
            </div>

            {/* Total Section */}
            {/* {localTotalSlots > 0 && (
              <>
                <div className="d-lg-none py-0 pt-1">
                  <div
                    className="d-flex justify-content-between align-items-center px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <span className="text-white" style={{ fontSize: "14px", fontWeight: "500" }}>
                        Total to Pay
                      </span>
                      <span className="d-block text-white" style={{ fontSize: "12px" }}>
                        Total Slots: {localTotalSlots}
                      </span>
                    </div>

                    <span className="text-white" style={{ fontSize: "20px", fontWeight: "600" }}>
                      ₹{localGrandTotal}
                    </span>
                  </div>
                </div>
              </>
            )} */}
            {localTotalSlots > 0 && (
              <>
                <div className="d-sm-none py-0 pt-1">
                  <div
                    className="d-flex justify-content-between align-items-center px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex flex-column">
                      <span
                        className="text-white"
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          fontFamily: "Poppins",
                        }}
                      >
                        Total to Pay
                      </span>
                      <span
                        className="text-white"
                        style={{
                          fontSize: "12px",
                          color: "#e5e7eb",
                          fontFamily: "Poppins",
                        }}
                      >
                        Total Slot: {localTotalSlots % 1 === 0 ? localTotalSlots : localTotalSlots.toFixed(1)}
                      </span>
                    </div>

                    <div>
                      <span
                        className="text-white"
                        style={{
                          fontSize: "20px",
                          fontWeight: "600",
                          fontFamily: "Poppins",
                        }}
                      >
                        ₹{Number(localGrandTotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-top pt-2 px-3 mt-2 text-white d-flex justify-content-between align-items-center fw-bold mobile-total-section d-none d-sm-flex">
                  <p
                    className="d-flex flex-column mb-0"
                    style={{ fontSize: "16px", fontWeight: "600" }}
                  >
                    Total to Pay{" "}
                    {/* <span style={{ fontSize: "13px", fontWeight: "500" }}>
                        Total slots {localTotalSlots}
                      </span> */}
                  </p>
                  <p
                    className="mb-0"
                    style={{ fontSize: "25px", fontWeight: "600" }}
                  >
                    ₹{Number(localGrandTotal).toLocaleString('en-IN')}
                  </p>
                </div>
              </>
            )}

            {/* Book Button */}
            <div className="mt-auto d-flex justify-content-center align-items-center px-3 pb-2">
              <button
                style={{
                  ...buttonStyle,
                  opacity: localTotalSlots === 0 ? 0.5 : 1,
                  cursor: localTotalSlots === 0 ? "not-allowed" : "pointer",
                  pointerEvents: localTotalSlots === 0 ? "none" : "auto",
                }}
                className={`${className} `}
                disabled={localTotalSlots === 0}
                onClick={handlePayment}
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
                      } ${height * 0.3} C ${width * 0.83} ${height * 0.32} ${width * 0.84
                      } ${height * 0.34} ${width * 0.84} ${height * 0.34} C ${width * 0.85
                      } ${height * 0.34} ${width * 0.86} ${height * 0.32} ${width * 0.86
                      } ${height * 0.3} C ${width * 0.88} ${height * 0.2} ${width * 0.9
                      } ${height * 0.15} ${width * 0.92} ${height * 0.15} C ${width * 0.97
                      } ${height * 0.15} ${width * 0.996} ${height * 0.3} ${width * 0.996
                      } ${height * 0.5} C ${width * 0.996} ${height * 0.7} ${width * 0.97
                      } ${height * 0.85} ${width * 0.92} ${height * 0.85} C ${width * 0.9
                      } ${height * 0.85} ${width * 0.88} ${height * 0.8} ${width * 0.86
                      } ${height * 0.7} C ${width * 0.86} ${height * 0.68} ${width * 0.85
                      } ${height * 0.66} ${width * 0.84} ${height * 0.66} C ${width * 0.84
                      } ${height * 0.66} ${width * 0.83} ${height * 0.68} ${width * 0.83
                      } ${height * 0.7} C ${width * 0.81} ${height * 0.8} ${width * 0.79
                      } ${height * 0.85} ${width * 0.76} ${height * 0.85} L ${width * 0.08
                      } ${height * 0.85} C ${width * 0.04} ${height * 0.85} ${width * 0.004
                      } ${height * 0.7} ${width * 0.004} ${height * 0.5} C ${width * 0.004
                      } ${height * 0.3} ${width * 0.04} ${height * 0.15} ${width * 0.08
                      } ${height * 0.15} L ${width * 0.76} ${height * 0.15} Z`}
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
                <div style={contentStyle}>  {isLoading || bookingStatus?.bookingLoading ? <ButtonLoading color="#001B76" /> : "Pay Now"}</div>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Success Modal */}
      <Modal show={modal} centered>
        <div className="p-4 pt-0 text-center">
          <img src={success2} alt="Booking Success" className="img-fluid mx-auto" style={{ width: "294px", height: "254px" }} />
          <h4 className="tabel-title" style={{ fontFamily: "Poppins" }}>Booking Successful!</h4>
          <p className="text-dark" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "400" }}>
            Your slot has been booked successfully.
          </p>
          <Button
            onClick={() => {
              setModal(false);
              navigate("/booking", { replace: true });
            }}
            className="w-75 rounded-pill border-0 text-white py-lg-3 mt-lg-4 mb-lg-4"
            style={{ background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)", boxShadow: "none", fontSize: "14px", fontFamily: "Poppins", fontWeight: "600" }}
          >
            Continue
          </Button>
          <p className="text-dark fw-medium mt-3 mb-1" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "400" }}>
            You’ll receive a reminder before it starts.
          </p>
          <Link to="/booking-history" replace className="nav-link" style={{ color: "#001B76", fontWeight: "600", fontFamily: "Poppins", fontSize: "14px" }}>
            View Booking Details
          </Link>
        </div>
      </Modal>

      {/* Error Modal for Slot Already Booked */}
      <Modal show={errorModal} centered>
        <div className="p-4 pt-0 text-center">
          <div className="text-danger mb-3" style={{ fontSize: "48px" }}>⚠️</div>
          <h4 className="tabel-title text-danger" style={{ fontFamily: "Poppins" }}>Slot Already Booked!</h4>
          <p className="text-dark" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "400" }}>
            {errorMessage || "The selected slot has already been booked by another user."}
          </p>
          <p className="text-dark" style={{ fontFamily: "Poppins", fontSize: "14px", fontWeight: "400" }}>
            This slot has been booked by someone else, please check another slot.
          </p>
          <Button
            onClick={() => {
              setErrorModal(false);
              navigate("/booking", { replace: true, state: { clearSlots: true } });
            }}
            className="w-75 rounded-pill border-0 text-white py-lg-3 mt-lg-4 mb-lg-4"
            style={{ background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)", boxShadow: "none", fontSize: "14px", fontFamily: "Poppins", fontWeight: "600" }}
          >
            Back to Booking
          </Button>
        </div>
      </Modal>

    </div>
  );
};

const PaymentWithRazorpay = (props) => <Payment {...props} />;

export default PaymentWithRazorpay;
