import { createSlice } from "@reduxjs/toolkit";
import { createBooking } from "./thunk";

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
            // -------------------------G-E-T--M-A-T-C-H----------------------//
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
        // -------------------------U-P-D-A-T-E--M-A-T-C-H----------------------//
    }
});

export const { resetBooking } = bookingSlice.actions
export default bookingSlice.reducer;