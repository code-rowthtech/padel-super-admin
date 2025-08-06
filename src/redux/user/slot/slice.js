import { createSlice } from "@reduxjs/toolkit";
import { getUserSlot } from "./thunk";

const initialState = {
    slotLoading: false,
    slotData: null,
    slotError: null
};

const slotSlice = createSlice({
    name: "slot",
    initialState,
    reducers: {
        resetSlot(state) {
            state.slotLoading = false;
            state.slotData = null;
            state.slotError = null;
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
                console.log(action,'action');
                state.slotLoading = false;
                state.slotData = action.payload;
            })
            .addCase(getUserSlot.rejected, (state, action) => {
                state.slotLoading = false;
                state.slotError = action.payload;
            })
        // -------------------------U-P-D-A-T-E--M-A-T-C-H----------------------//
    }
});

export const { resetSlot } = slotSlice.actions
export default slotSlice.reducer;