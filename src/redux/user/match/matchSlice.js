import { createSlice } from "@reduxjs/toolkit";
import { getMatch } from "./matchThunk";

const initialState = {
    matchLoading: false,
    matchData: null,
    matchError: null
};

const matchSlice = createSlice({
    name: "match",
    initialState,
    reducers: {
        resetMatch(state) {
            state.matchLoading = false;
            state.matchData = null;
            state.matchError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // -------------------------G-E-T--M-A-T-C-H----------------------//
            .addCase(getMatch.pending, (state) => {
                state.matchLoading = true;
                state.matchError = null;
            })
            .addCase(getMatch.fulfilled, (state, action) => {
                state.matchLoading = false;
                state.matchData = action.payload;
            })
            .addCase(getMatch.rejected, (state, action) => {
                state.matchLoading = false;
                state.matchError = action.payload;
            })
        // -------------------------U-P-D-A-T-E--M-A-T-C-H----------------------//
    }
});

export const { resetMatch } = matchSlice.actions
export default matchSlice.reducer;