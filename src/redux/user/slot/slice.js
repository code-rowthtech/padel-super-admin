import { createSlice } from "@reduxjs/toolkit";
import { getMatchesSlot, getMathcesSlot, getUnavailableSlot, getUserSlot, getUserSlotBooking } from "./thunk";

const initialState = {
    slotLoading: false,
    slotData: null,
    slotError: null,
    unSlotLoading: false,
    unSlotData: null,
};

const slotSlice = createSlice({
    name: "slot",
    initialState,
    reducers: {
        resetSlot(state) {
            state.slotLoading = false;
            state.slotData = null;
            state.slotError = null;
            state.unSlotLoading = false;
            state.unSlotData = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // -------------------------G-E-T--M-A-T-C-H----------------------//
            .addCase(getUserSlot.pending, (state) => {
                state.slotLoading = true;
                state.slotError = null;
            })
            .addCase(getUserSlot.fulfilled, (state, action) => {
                state.slotLoading = false;
                state.slotData = action.payload;
            })
            .addCase(getUserSlot.rejected, (state, action) => {
                state.slotLoading = false;
                state.slotError = action.payload;
            })

            .addCase(getUnavailableSlot.pending, (state) => {
                state.unSlotLoading = true;
                state.slotError = null;
            })
            .addCase(getUnavailableSlot.fulfilled, (state, action) => {
                state.unSlotLoading = false;
                state.unSlotData = action.payload;
            })
            .addCase(getUnavailableSlot.rejected, (state, action) => {
                state.unSlotLoading = false;
                state.slotError = action.payload;
            })

            .addCase(getUserSlotBooking.pending, (state) => {
                state.slotLoading = true;
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
            // -------------------------U-P-D-A-T-E--M-A-T-C-H----------------------//

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