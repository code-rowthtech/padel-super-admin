import { createSlice } from "@reduxjs/toolkit";
import { bookingStatus, createBooking, getBooking } from "./thunk";

const initialState = {
    bookingLoading: false,
    bookingData: null,
    bookingError: null
};

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        resetBooking(state) {
            state.bookingLoading = false;
            state.bookingData = null;
            state.bookingError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // -------------------------C-R-E-A-T-E--B-O-O-K-I-N-G----------------------//
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
            // -------------------------G-E-T--B-O-O-K-I-N-G----------------------//
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
            // -------------------------C-H-A-N-G-E--B-O-O-K-I-N-G--S-T-A-T-U-S--------------------//
            .addCase(bookingStatus.pending, (state) => {
                state.bookingLoading = true;
                state.bookingError = null
            })
            .addCase(bookingStatus.fulfilled, (state,action) => {
                state.bookingLoading = false;
                state.bookingData = action.payload;
            })
            .addCase(bookingStatus.rejected, (state,action) => {
                state.bookingLoading = false;
                state.bookingError = action.payload
            })

    }
});

export const { resetBooking } = bookingSlice.actions
export default bookingSlice.reducer;