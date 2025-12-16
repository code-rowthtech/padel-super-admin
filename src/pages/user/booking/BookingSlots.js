import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserClub } from "../../../redux/thunks";
import { getSlotData } from "../../../redux/user/slot/thunk";
import { ButtonLoading } from "../../../helpers/loading/Loaders";

const BookingSlots = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [totalSlots, setTotalSlots] = useState(0);

  const clubData = useSelector((state) => state?.userClub?.clubData?.data?.courts[0]) || {};
  const slotData = useSelector((state) => state?.userSlot?.slotData);
  const slotLoading = useSelector((state) => state?.userSlot?.slotLoading);

  useEffect(() => {
    dispatch(getUserClub({ search: "" }));
  }, [dispatch]);

  useEffect(() => {
    if (clubData?._id && selectedDate) {
      dispatch(getSlotData({
        register_club_id: clubData._id,
        date: selectedDate
      }));
    }
  }, [dispatch, clubData?._id, selectedDate]);

  useEffect(() => {
    const newTotalSlots = selectedCourts.reduce((sum, c) => sum + c.time.length, 0);
    const newGrandTotal = selectedCourts.reduce(
      (sum, c) => sum + c.time.reduce((s, t) => s + Number(t.amount || 2000), 0),
      0
    );
    setTotalSlots(newTotalSlots);
    setGrandTotal(newGrandTotal);
  }, [selectedCourts]);

  const handleSlotSelect = (court, timeSlot) => {
    setSelectedCourts(prev => {
      const existingCourtIndex = prev.findIndex(c => c._id === court._id && c.date === selectedDate);
      
      if (existingCourtIndex >= 0) {
        const existingCourt = prev[existingCourtIndex];
        const timeExists = existingCourt.time.some(t => t._id === timeSlot._id);
        
        if (timeExists) {
          // Remove the time slot
          const updatedTime = existingCourt.time.filter(t => t._id !== timeSlot._id);
          if (updatedTime.length === 0) {
            return prev.filter((_, index) => index !== existingCourtIndex);
          } else {
            return prev.map((c, index) => 
              index === existingCourtIndex ? { ...c, time: updatedTime } : c
            );
          }
        } else {
          // Add the time slot
          return prev.map((c, index) => 
            index === existingCourtIndex 
              ? { ...c, time: [...c.time, timeSlot] }
              : c
          );
        }
      } else {
        // Add new court with time slot
        return [...prev, {
          _id: court._id,
          courtName: court.courtName,
          date: selectedDate,
          time: [timeSlot]
        }];
      }
    });
  };

  const isSlotSelected = (courtId, timeSlotId) => {
    return selectedCourts.some(court => 
      court._id === courtId && 
      court.date === selectedDate &&
      court.time.some(t => t._id === timeSlotId)
    );
  };

  const handleProceedToPayment = () => {
    if (totalSlots === 0) {
      alert("Please select at least one slot");
      return;
    }

    navigate("/payment", {
      state: {
        courtData: slotData,
        clubData,
        selectedCourts,
        grandTotal,
        totalSlots
      }
    });
  };

  const formatTime = (timeStr) => {
    return timeStr.replace(" am", ":00 am").replace(" pm", ":00 pm");
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4" style={{ fontFamily: "Poppins", fontWeight: "600" }}>
            Book Your Court
          </h2>
          
          {/* Date Selection */}
          <div className="mb-4">
            <label className="form-label" style={{ fontFamily: "Poppins", fontWeight: "500" }}>
              Select Date
            </label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ maxWidth: "200px" }}
            />
          </div>

          {slotLoading ? (
            <div className="text-center py-5">
              <ButtonLoading />
            </div>
          ) : (
            <>
              {/* Courts and Slots */}
              {slotData?.data?.map((court, courtIndex) => (
                <div key={court._id} className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0" style={{ fontFamily: "Poppins" }}>
                      {court.courtName}
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-2">
                      {court.slot?.[0]?.slotTimes?.map((timeSlot, timeIndex) => (
                        <div key={timeSlot._id} className="col-6 col-md-4 col-lg-3">
                          <button
                            className={`btn w-100 ${
                              isSlotSelected(court._id, timeSlot._id)
                                ? "btn-primary"
                                : timeSlot.availabilityStatus === "available"
                                ? "btn-outline-primary"
                                : "btn-secondary"
                            }`}
                            disabled={timeSlot.availabilityStatus !== "available"}
                            onClick={() => handleSlotSelect(court, timeSlot)}
                            style={{ fontFamily: "Poppins", fontSize: "12px" }}
                          >
                            <div>{formatTime(timeSlot.time)}</div>
                            <div>₹{timeSlot.amount || 2000}</div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary and Proceed Button */}
              {totalSlots > 0 && (
                <div className="card mt-4">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 style={{ fontFamily: "Poppins" }}>
                          Total: ₹{grandTotal.toLocaleString('en-IN')}
                        </h5>
                        <p className="text-muted mb-0" style={{ fontFamily: "Poppins" }}>
                          {totalSlots} slot{totalSlots > 1 ? 's' : ''} selected
                        </p>
                      </div>
                      <button
                        className="btn btn-primary px-4"
                        onClick={handleProceedToPayment}
                        style={{ fontFamily: "Poppins", fontWeight: "600" }}
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingSlots;