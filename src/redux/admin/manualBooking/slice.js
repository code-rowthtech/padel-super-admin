import { createSlice } from "@reduxjs/toolkit";
import {
  getActiveCourts,
  getOwnerRegisteredClub,
  manualBookingByOwner,
  getCourtByRegisterClubId,
  getAdminSlotBooking,
  getAdminHalfSlotPrice,
  getAdminSlotPrice,
  getAdminMatchesSlot,
  adminCheckBooking,
  adminRemoveBookedBooking
} from "./thunk";

const initialState = {
  ownerClubData: null,
  ownerClubLoading: false,
  ownerClubError: null,

  manualBookingData: null,
  manualBookingLoading: false,
  manualBookingError: null,

  activeCourtsData: null,
  activeCourtsLoading: false,
  activeCourtsError: null,

  courtByClubIdData: null,
  courtByClubIdLoading: false,
  courtByClubIdError: null,

  slotData: null,
  slotLoading: false,
  slotError: null,

  slotPriceData: null,
  slotPriceLoading: false,
  slotPriceError: null,

  selectedSlots: {},
};

const manualBookingSlice = createSlice({
  name: "manualBooking",
  initialState,
  reducers: {
    resetOwnerClub: (state) => {
      state.ownerClubData = null;
      state.ownerClubLoading = false;
      state.ownerClubError = null;

      state.manualBookingData = null;
      state.manualBookingLoading = false;
      state.manualBookingError = null;

      state.activeCourtsData = null;
      state.activeCourtsLoading = false;
      state.activeCourtsError = null;

      state.slotData = null;
      state.slotLoading = false;
      state.slotError = null;

      state.slotPriceData = null;
      state.slotPriceLoading = false;
      state.slotPriceError = null;
    },
    setSlotWiseDataFromSocket(state, action) {
      const payload = action?.payload || {};
      const nextData = payload?.data ?? payload;

      if (!Array.isArray(nextData)) return;

      state.slotLoading = false;
      state.slotError = null;
      state.slotData = {
        ...(state.slotData || {}),
        status: (state.slotData && state.slotData.status) ? state.slotData.status : 200,
        data: nextData,
      };
    },
    setSelectedSlots(state, action) {
      state.selectedSlots = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getOwnerRegisteredClub.pending, (state) => {
      state.ownerClubLoading = true;
      state.ownerClubError = null;
    });
    builder.addCase(getOwnerRegisteredClub.fulfilled, (state, action) => {
      state.ownerClubLoading = false;
      state.ownerClubData = action.payload;
    });
    builder.addCase(getOwnerRegisteredClub.rejected, (state, action) => {
      state.ownerClubLoading = false;
      state.ownerClubError = action.payload;
    });
    builder.addCase(manualBookingByOwner.pending, (state) => {
      state.manualBookingLoading = true;
      state.manualBookingError = null;
    });
    builder.addCase(manualBookingByOwner.fulfilled, (state, action) => {
      state.manualBookingLoading = false;
      state.manualBookingData = action.payload;
    });
    builder.addCase(manualBookingByOwner.rejected, (state, action) => {
      state.manualBookingLoading = false;
      state.manualBookingError = action.payload;
    });
    builder.addCase(getActiveCourts.pending, (state) => {
      state.activeCourtsLoading = true;
      state.activeCourtsError = null;
    });
    builder.addCase(getActiveCourts.fulfilled, (state, action) => {
      state.activeCourtsLoading = false;
      state.activeCourtsData = action.payload;
    });
    builder.addCase(getActiveCourts.rejected, (state, action) => {
      state.activeCourtsLoading = false;
      state.activeCourtsError = action.payload;
    });
    builder.addCase(getCourtByRegisterClubId.pending, (state) => {
      state.courtByClubIdLoading = true;
      state.courtByClubIdError = null;
    });
    builder.addCase(getCourtByRegisterClubId.fulfilled, (state, action) => {
      state.courtByClubIdLoading = false;
      state.courtByClubIdData = action.payload;
    });
    builder.addCase(getCourtByRegisterClubId.rejected, (state, action) => {
      state.courtByClubIdLoading = false;
      state.courtByClubIdError = action.payload;
    });

    // Admin Slot Booking
    builder.addCase(getAdminSlotBooking.pending, (state) => {
      state.slotLoading = true;
      state.slotError = null;
      state.slotData = null;
    });
    builder.addCase(getAdminSlotBooking.fulfilled, (state, action) => {
      state.slotLoading = false;
      state.slotData = action.payload;
    });
    builder.addCase(getAdminSlotBooking.rejected, (state, action) => {
      state.slotLoading = false;
      state.slotError = action.payload;
    });

    // Admin Half Slot Price
    builder.addCase(getAdminHalfSlotPrice.pending, (state) => {
      state.slotPriceLoading = true;
      state.slotPriceError = null;
      state.slotPriceData = null;
    });
    builder.addCase(getAdminHalfSlotPrice.fulfilled, (state, action) => {
      state.slotPriceLoading = false;
      state.slotPriceData = action.payload;
    });
    builder.addCase(getAdminHalfSlotPrice.rejected, (state, action) => {
      state.slotPriceLoading = false;
      state.slotPriceError = action.payload;
    });

    // Admin Slot Price
    builder.addCase(getAdminSlotPrice.pending, (state) => {
      state.slotPriceLoading = true;
      state.slotPriceError = null;
      state.slotPriceData = null;
    });
    builder.addCase(getAdminSlotPrice.fulfilled, (state, action) => {
      state.slotPriceLoading = false;
      state.slotPriceData = action.payload;
    });
    builder.addCase(getAdminSlotPrice.rejected, (state, action) => {
      state.slotPriceLoading = false;
      state.slotPriceError = action.payload;
    });

    // Admin Matches Slot
    builder.addCase(getAdminMatchesSlot.pending, (state) => {
      state.slotLoading = true;
      state.slotError = null;
    });
    builder.addCase(getAdminMatchesSlot.fulfilled, (state, action) => {
      state.slotLoading = false;
      state.slotData = action.payload;
    });
    builder.addCase(getAdminMatchesSlot.rejected, (state, action) => {
      state.slotLoading = false;
      state.slotError = action.payload;
    });

    // Admin Check Booking
    builder.addCase(adminCheckBooking.pending, (state) => {
      state.manualBookingLoading = true;
    });
    builder.addCase(adminCheckBooking.fulfilled, (state) => {
      state.manualBookingLoading = false;
    });
    builder.addCase(adminCheckBooking.rejected, (state, action) => {
      state.manualBookingLoading = false;
      state.manualBookingError = action.payload;
    });

    // Admin Remove Booked Booking
    builder.addCase(adminRemoveBookedBooking.pending, (state) => {
      state.manualBookingLoading = true;
    });
    builder.addCase(adminRemoveBookedBooking.fulfilled, (state) => {
      state.manualBookingLoading = false;
    });
    builder.addCase(adminRemoveBookedBooking.rejected, (state, action) => {
      state.manualBookingLoading = false;
      state.manualBookingError = action.payload;
    });
  },
});

export const { resetOwnerClub, setSlotWiseDataFromSocket, setSelectedSlots } = manualBookingSlice.actions;
export default manualBookingSlice.reducer;
