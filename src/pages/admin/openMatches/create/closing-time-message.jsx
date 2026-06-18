{isAfterClosingTime() && selectedDate?.fullDate === new Date().toISOString().split("T")[0] && (
  <div
    className="text-center py-4 d-flex flex-column justify-content-center align-items-center mt-5"
    style={{ fontFamily: "Poppins", fontWeight: 500, color: "#6B7280", }}
  >
    <p className="mb-3 label_font text-danger">Booking closed for today. Please select tomorrow or next date.</p>
    <Button
      className="rounded-pill px-4 py-2"
      style={{
        background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
        border: "none",
        fontWeight: "600",
        fontSize: "13px",
      }}
      onClick={() => {
        const nextDate = new Date(selectedDate.fullDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const formattedDate = nextDate.toISOString().split("T")[0];
        const day = nextDate.toLocaleDateString("en-US", { weekday: "long" });
        setSelectedDate({ fullDate: formattedDate, day });
        setStartDate(nextDate);
        setTimeout(() => scrollToSelectedDate(formattedDate), 100);
        setSelectedCourts([]);
        setSelectedTimes({});
        setSelectedBuisness([]);
        setHalfSelectedSlots(new Set());
        setSlotError("");
        dispatch(getAdminSlotBooking({
          day,
          date: formattedDate,
          register_club_id: savedClubId || "",
          categoryId: selectedCategoryId,
          location: activeLocationId
        }));
        dispatch(getAdminHalfSlotPrice({
          day,
          register_club_id: savedClubId || "",
          categoryId: selectedCategoryId,
          location: activeLocationId
        }));
      }}
    >
      Select Next Date
    </Button>
  </div>
)}
