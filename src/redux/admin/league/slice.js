import { createSlice } from "@reduxjs/toolkit";
import { createLeague, getLeagues, updateLeague, getStates, getClubsWithState, getSponsorCategories, getLeagueById } from "./thunk";

const initialState = {
  leagues: [],
  currentLeague: null,
  leagueId: null,
  states: [],
  clubs: [],
  sponsorCategories: [],
  loading: false,
  error: null,
};

const leagueSlice = createSlice({
  name: "league",
  initialState,
  reducers: {
    resetLeague: (state) => {
      state.leagues = [];
      state.currentLeague = null;
      state.leagueId = null;
      state.loading = false;
      state.error = null;
    },
    setLeagueId: (state, action) => {
      state.leagueId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLeagueById.fulfilled, (state, action) => {
        state.currentLeague = action.payload;
        state.leagueId = action.payload?._id;
      })
      .addCase(getSponsorCategories.fulfilled, (state, action) => {
        state.sponsorCategories = action.payload;
      })
      .addCase(getStates.fulfilled, (state, action) => {
        state.states = action.payload;
      })
      .addCase(getClubsWithState.fulfilled, (state, action) => {
        state.clubs = action.payload;
      })
      .addCase(getLeagues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeagues.fulfilled, (state, action) => {
        state.loading = false;
        state.leagues = action.payload;
      })
      .addCase(getLeagues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLeague.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLeague = action.payload;
        state.leagueId = action.payload?._id || action.payload?.id;
        state.leagues.push(action.payload);
      })
      .addCase(createLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeague.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLeague = action.payload;
        const index = state.leagues.findIndex(l => l._id === action.payload._id || l.id === action.payload.id);
        if (index !== -1) state.leagues[index] = action.payload;
      })
      .addCase(updateLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetLeague, setLeagueId } = leagueSlice.actions;
export default leagueSlice.reducer;
