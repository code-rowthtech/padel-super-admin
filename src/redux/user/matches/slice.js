import { createSlice } from "@reduxjs/toolkit";
import { createMatches, getMatches } from "./thunk";

const initialState = {
    matchesLoading: false,
    matchesData: null,
    matchesError: null
};

const matchesSlice = createSlice({
    name: "matches",
    initialState,
    reducers: {
        resetMatches(state) {
            state.matchesLoading = false;
            state.matchesData = null;
            state.matchesError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // -------------------------C-R-E-A-T-E--B-O-O-K-I-N-G----------------------//
            .addCase(createMatches.pending, (state) => {
                state.matchesLoading = true;
                state.matchesError = null;
            })
            .addCase(createMatches.fulfilled, (state, action) => {
                state.matchesLoading = false;
                state.matchesData = action.payload;
            })
            .addCase(createMatches.rejected, (state, action) => {
                state.matchesLoading = false;
                state.matchesError = action.payload;
            })
            // -------------------------G-E-T--B-O-O-K-I-N-G----------------------//
            .addCase(getMatches.pending, (state) => {
                state.matchesLoading = true;
                state.matchesError = null;
            })
            .addCase(getMatches.fulfilled, (state, action) => {
                state.matchesLoading = false;
                state.matchesData = action.payload;
            })
            .addCase(getMatches.rejected, (state, action) => {
                state.matchesLoading = false;
                state.matchesError = action.payload;
            })
            // -------------------------C-H-A-N-G-E--B-O-O-K-I-N-G--S-T-A-T-U-S--------------------//
          

    }
});

export const { resetMatches } = matchesSlice.actions
export default matchesSlice.reducer;