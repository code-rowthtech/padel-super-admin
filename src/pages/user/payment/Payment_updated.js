import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createBooking } from "../../../redux/user/booking/thunk";
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
  const [modal, setModal] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const dispatch = useDispatch();
  const [localSelectedCourts, setLocalSelectedCourts] = useState(selectedCourts || []);
  const [localGrandTotal, setLocalGrandTotal] = useState(grandTotal || 0);
  const [localTotalSlots, setLocalTotalSlots] = useState(totalSlots || 0);
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Rest of the component remains the same...
  return (
    <div className="container mt-lg-4 mb-3 mb-md-0 px-0 px-md-0">
      {/* Component JSX with grouped slots display */}
      <div className="row g-4 mx-auto d-flex align-items-center justify-content-center">
        <div className="col-12 col-lg-5 mobile-payment-content px-0">
          {/* Form section remains same */}
        </div>
        
        <div className="col-lg-5 col-12 ps-lg-4 ps-0 py-lg-4 mt-lg-0 mobile-payment-summary">
          <div className="border w-100 px-0 pt-1 pb-3 border-0 mobile-summary-container small-curve-wrapper d-flex flex-column">
            {/* Desktop Slots with Grouping */}
            <div className="d-none d-lg-block">
              {localSelectedCourts?.length > 0 ? (
                (() => {
                  const groupedSlots = groupConsecutiveSlots(localSelectedCourts, halfSelectedSlots);
                  
                  return groupedSlots?.map((group, index) => (
                    <div key={`group-${index}`} className="row mb-2">
                      <div className="col-12 d-flex gap-2 mb-0 m-0 align-items-center justify-content-between">
                        <div className="d-flex text-white">
                          <span style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "14px" }}>
                            {group.court?.date
                              ? `${new Date(group.court.date).toLocaleString("en-US", { day: "2-digit" })}, ${new Date(group.court.date).toLocaleString("en-US", { month: "short" })}`
                              : ""}
                          </span>
                          <span className="ps-1" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "14px" }}>
                            {group.displayTime}
                          </span>
                          <span className="ps-2" style={{ fontWeight: "500", fontFamily: "Poppins", fontSize: "14px" }}>
                            {group.court?.courtName}
                          </span>
                        </div>
                        <div className="text-white align-items-center">
                          ₹
                          <span className="ps-0" style={{ fontWeight: "600", fontFamily: "Poppins", fontSize: "14px" }}>
                            {Number(group.totalAmount).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ));
                })()
              ) : (
                <div className="d-flex flex-column justify-content-center align-items-center text-white" style={{ height: "25vh" }}>
                  <p style={{ fontSize: "14px", fontFamily: "Poppins", fontWeight: "500" }}>
                    No slot selected
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;