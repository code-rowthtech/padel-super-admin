import { createSlice } from "@reduxjs/toolkit";
import { bookingStatus, createBooking, getBooking } from "./thunk";

const initialState = {
    bookingLoading: false,
    bookingData: null,
    bookingError: null,
    bookingStatusData: null,
    bookingStatusLoading:false
};

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        resetBooking(state) {
            state.bookingLoading = false;
            state.bookingStatusLoading = false;
            state.bookingData = null;
            state.bookingError = null;
            state.bookingStatusData = null;

        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createBooking.pending, (state) => {
                state.bookingLoading = true;
                state.bookingError = null;
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.bookingLoading = false;
                state.bookingData = action.payload;
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.bookingLoading = false;
                state.bookingError = action.payload;
            })
            .addCase(getBooking.pending, (state) => {
                state.bookingLoading = true;
                state.bookingError = null;
            })
            .addCase(getBooking.fulfilled, (state, action) => {
                state.bookingLoading = false;
                state.bookingData = action.payload;
            })
            .addCase(getBooking.rejected, (state, action) => {
                state.bookingLoading = false;
                state.bookingError = action.payload;
            })
            .addCase(bookingStatus.pending, (state) => {
                state.bookingStatusLoading = true;
                state.bookingError = null
            })
            .addCase(bookingStatus.fulfilled, (state, action) => {
                state.bookingStatusLoading = false;
                state.bookingStatusData = action.payload;
            })
            .addCase(bookingStatus.rejected, (state, action) => {
                state.bookingStatusLoading = false;
                state.bookingError = action.payload
            })

    }
});

export const { resetBooking } = bookingSlice.actions
export default bookingSlice.reducer;