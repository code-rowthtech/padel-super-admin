import { createSlice } from "@reduxjs/toolkit";
import {
  bookingCount,
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

  bookingCount: null,
  bookingCountLoading: false,
  bookingCountError: null,
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

      state.bookingCount = null;
      state.bookingCountLoading = false;
      state.bookingCountError = null;
    },
  },
  extraReducers: (builder) => {
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
    builder.addCase(updateBookingStatus.pending, (state) => {
      state.updateBookingLoading = true;
      state.updateBookingData = null;
      state.updateBookingError = null;
    });
    builder.addCase(updateBookingStatus.fulfilled, (state, action) => {
      state.updateBookingLoading = false;
      state.updateBookingData = action.payload;
      state.updateBookingError = null;
    });
    builder.addCase(updateBookingStatus.rejected, (state, action) => {
      state.updateBookingLoading = false;
      state.updateBookingData = null;
      state.updateBookingError = action.payload;
    });

    builder.addCase(bookingCount.pending, (state) => {
      state.bookingCountLoading = true;
      state.bookingCount = null;
      state.bookingCountError = null;
    });
    builder.addCase(bookingCount.fulfilled, (state, action) => {
      state.bookingCountLoading = false;
      state.bookingCount = action.payload;
      state.bookingCountError = null;
    });
    builder.addCase(bookingCount.rejected, (state, action) => {
      state.bookingCountLoading = false;
      state.bookingCount = null;
      state.bookingCountError = action.payload;
    });
  },
});

export const { resetBookingData } = BookingSlice.actions;
export default BookingSlice.reducer;
