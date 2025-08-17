import { createSlice } from "@reduxjs/toolkit";
import {
  getBookingByStatus,
  getBookingDetailsById,
  updateBookingStatus,
} from "./thunk";

const initialState = {
  getBookingData: null,
  getBookingLoading: false,
  getBookingError: null,

  getBookingDetailsData: null,
  getBookingDetailsLoading: false,
  getBookingDetailsError: null,

  updateBookingData: null,
  updateBookingLoading: false,
  updateBookingError: null,
};

const BookingSlice = createSlice({
  name: "Booking",
  initialState,
  reducers: {
    resetBookingData: (state) => {
      state.getBookingData = null;
      state.getBookingLoading = false;
      state.getBookingError = null;

      state.getBookingDetailsData = null;
      state.getBookingDetailsLoading = false;
      state.getBookingDetailsError = null;

      state.updateBookingData = null;
      state.updateBookingLoading = false;
      state.updateBookingError = null;
    },
  },
  extraReducers: (builder) => {
    // -----------------------------------------------------//---- Get Bookings by status
    builder.addCase(getBookingByStatus.pending, (state) => {
      state.getBookingLoading = true;
      state.getBookingData = null;
      state.getBookingError = null;
    });
    builder.addCase(getBookingByStatus.fulfilled, (state, action) => {
      state.getBookingLoading = false;
      state.getBookingData = action.payload;
      state.getBookingError = null;
    });
    builder.addCase(getBookingByStatus.rejected, (state, action) => {
      state.getBookingLoading = false;
      state.getBookingData = null;
      state.getBookingError = action.payload;
    });
    // -----------------------------------------------------//---- Get Booking Details By Id
    builder.addCase(getBookingDetailsById.pending, (state) => {
      state.getBookingDetailsLoading = true;
      state.getBookingDetailsData = null;
      state.getBookingDetailsError = null;
    });
    builder.addCase(getBookingDetailsById.fulfilled, (state, action) => {
      state.getBookingDetailsLoading = false;
      state.getBookingDetailsData = action.payload;
      state.getBookingDetailsError = null;
    });
    builder.addCase(getBookingDetailsById.rejected, (state, action) => {
      state.getBookingDetailsLoading = false;
      state.getBookingDetailsData = null;
      state.getBookingDetailsError = action.payload;
    });
    // -----------------------------------------------------//---- Update Booking Status
    builder.addCase(updateBookingStatus.pending, (state) => {
      state.updateBookingLoading = true;
      state.updateBookingData = null;
      state.updateBookingError = null;
    });
    builder.addCase(updateBookingStatus.fulfilled, (state, action) => {
      console.log({ action, state });
      state.updateBookingLoading = false;
      state.updateBookingData = action.payload;
      state.updateBookingError = null;
    });
    builder.addCase(updateBookingStatus.rejected, (state, action) => {
      state.updateBookingLoading = false;
      state.updateBookingData = null;
      state.updateBookingError = action.payload;
    });
  },
});

export const { resetBookingData } = BookingSlice.actions;
export default BookingSlice.reducer;
