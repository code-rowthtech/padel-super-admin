import { createSlice } from "@reduxjs/toolkit";
import { getMatchesSlot, getMathcesSlot, getUnavailableSlot, getUserSlot, getUserSlotBooking, getUserSlotPrice } from "./thunk";

const initialState = {
    slotLoading: false,
    slotData: null,
    slotError: null,
    slotPriceLoading: false,
    slotPriceData: null,
    slotPriceError: null,
};

const slotSlice = createSlice({
    name: "slot",
    initialState,
    reducers: {
        resetSlot(state) {
            state.slotLoading = false;
            state.slotData = null;
            state.slotError = null;
            state.slotPriceLoading = false;
            state.slotPriceData = null;
            state.slotPriceError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserSlot.pending, (state, action) => {
                state.slotLoading = true;
                state.slotError = null;
            })
            .addCase(getUserSlot.fulfilled, (state, action) => {

                state.slotLoading = false;
                state.slotData = action.payload;
            })
            .addCase(getUserSlot.rejected, (state, action) => {
                state.slotLoading = false;
                state.slotPriceError = action.payload;
            })

             .addCase(getUserSlotPrice.pending, (state, action) => {
                state.slotPriceLoading = true;
                state.slotPriceError = null;
            })
            .addCase(getUserSlotPrice.fulfilled, (state, action) => {

                state.slotPriceLoading = false;
                state.slotPriceData = action.payload;
            })
            .addCase(getUserSlotPrice.rejected, (state, action) => {
                state.slotPriceLoading = false;
                state.slotError = action.payload;
            })

            .addCase(getUserSlotBooking.pending, (state,action) => {
                state.slotLoading = action?.meta?.arg?.socket ? false : true;
                state.slotError = null;
            })
            .addCase(getUserSlotBooking.fulfilled, (state, action) => {
                state.slotLoading = false;
                state.slotData = action.payload;
            })
            .addCase(getUserSlotBooking.rejected, (state, action) => {
                state.slotLoading = false;
                state.slotError = action.payload;
            })

            .addCase(getMatchesSlot.pending, (state) => {
                state.slotLoading = true;
                state.slotError = null;
            })
            .addCase(getMatchesSlot.fulfilled, (state, action) => {
                state.slotLoading = false;
                state.slotData = action.payload;
            })
            .addCase(getMatchesSlot.rejected, (state, action) => {
                state.slotLoading = false;
                state.slotError = action.payload;
            })
    }
});

export const { resetSlot } = slotSlice.actions
export default slotSlice.reducer;