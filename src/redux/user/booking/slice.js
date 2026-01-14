import { createSlice } from "@reduxjs/toolkit";
import { bookingStatus, checkBooking, createBooking, getBooking, removeBookedBooking } from "./thunk";

const initialState = {
    bookingLoading: false,
    bookingData: null,
    bookingError: null,
    bookingStatusData: null,
    bookingStatusLoading: false
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
            // create booking slice
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

            // create booking slice
            .addCase(checkBooking.pending, (state) => {
                state.bookingLoading = true;
                state.bookingError = null;
            })
            .addCase(checkBooking.fulfilled, (state, action) => {
                state.bookingLoading = false;
                state.bookingData = action.payload;
            })
            .addCase(checkBooking.rejected, (state, action) => {
                state.bookingLoading = false;
                state.bookingError = action.payload;
            })

            // create booking slice
            .addCase(removeBookedBooking.pending, (state, action) => {
                console.log({ action });
                if (action?.meta?.arg?.loading === false) {
                    state.bookingLoading = false;
                } else {
                    state.bookingLoading = true;
                }
                state.bookingError = null;
            })
            .addCase(removeBookedBooking.fulfilled, (state, action) => {
                state.bookingLoading = false;
                state.bookingData = action.payload;
            })
            .addCase(removeBookedBooking.rejected, (state, action) => {
                state.bookingLoading = false;
                state.bookingError = action.payload;
            })
            // get booking slice
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
            // update status booking slice
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