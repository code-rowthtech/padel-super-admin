import { createSlice } from "@reduxjs/toolkit";
import { addPlayers, createMatches, getMatches, getMatchesUser, getMatchesView, removePlayers } from "./thunk";

const initialState = {
    matchesLoading: false,
    matchesData: null,
    matchesError: null,
    usersLoading: false,
    usersData: null,
    usersError: null,
    viewMatchesLoading: false,
    viewMatchesData: null,
    viewMatchesError: null,
};

const matchesSlice = createSlice({
    name: "matches",
    initialState,
    reducers: {
        resetMatches(state) {
            state.matchesLoading = false;
            state.matchesData = null;
            state.matchesError = null;
            state.usersLoading = false;
            state.usersData = null;
            state.usersError = null;
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
            // -------------------------O-P-E-N-M-A-T-C-H-E-S-U-S-E-R--------------------//

            .addCase(getMatchesUser.pending, (state) => {
                state.usersLoading = true;
                state.usersError = null;
            })
            .addCase(getMatchesUser.fulfilled, (state, action) => {
                state.usersLoading = false;
                state.usersData = action.payload;
            })
            .addCase(getMatchesUser.rejected, (state, action) => {
                state.usersLoading = false;
                state.usersError = action.payload;
            })
            // -------------------------C-H-A-N-G-E--B-O-O-K-I-N-G--S-T-A-T-U-S--------------------//
            .addCase(getMatchesView.pending, (state) => {
                state.viewMatchesLoading = true;
                state.viewMatchesData = null;
            })
            .addCase(getMatchesView.fulfilled, (state, action) => {
                state.viewMatchesLoading = false;
                state.viewMatchesData = action.payload;
            })
            .addCase(getMatchesView.rejected, (state, action) => {
                state.viewMatchesLoading = false;
                state.viewMatchesError = action.payload;
            })

             // -------------------------C-H-A-N-G-E--B-O-O-K-I-N-G--S-T-A-T-U-S--------------------//
            .addCase(addPlayers.pending, (state) => {
                state.viewMatchesLoading = true;
                state.viewMatchesData = null;
            })
            .addCase(addPlayers.fulfilled, (state, action) => {
                state.viewMatchesLoading = false;
                state.viewMatchesData = action.payload;
            })
            .addCase(addPlayers.rejected, (state, action) => {
                state.viewMatchesLoading = false;
                state.viewMatchesError = action.payload;
            })

               // -------------------------C-H-A-N-G-E--B-O-O-K-I-N-G--S-T-A-T-U-S--------------------//
            .addCase(removePlayers.pending, (state) => {
                state.viewMatchesLoading = true;
                state.viewMatchesData = null;
            })
            .addCase(removePlayers.fulfilled, (state, action) => {
                state.viewMatchesLoading = false;
                state.viewMatchesData = action.payload;
            })
            .addCase(removePlayers.rejected, (state, action) => {
                state.viewMatchesLoading = false;
                state.viewMatchesError = action.payload;
            })


    }
});

export const { resetMatches } = matchesSlice.actions
export default matchesSlice.reducer;