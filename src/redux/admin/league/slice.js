import { createSlice } from "@reduxjs/toolkit";
import { createLeague, getLeagues, updateLeague, getStates, getClubsWithState, getSponsorCategories, getLeagueById, deleteLeague, getLeagueClubs, getClubTeams, getAllSchedules, saveSchedule } from "./thunk";

const initialState = {
  leagues: [],
  currentLeague: null,
  leagueId: null,
  states: [],
  clubs: [],
  leagueClubs: [],
  clubTeams: [],
  sponsorCategories: [],
  loading: false,
  loadingLeague: false,
  loadingClubs: false,
  loadingTeams: false,
  schedules: [],
  loadingSchedules: false,
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
      .addCase(getLeagueById.pending, (state) => {
        state.loadingLeague = true;
        state.error = null;
      })
      .addCase(getLeagueById.fulfilled, (state, action) => {
        state.loadingLeague = false;
        state.currentLeague = action.payload;
        state.leagueId = action.payload?._id;
      })
      .addCase(getLeagueById.rejected, (state, action) => {
        state.loadingLeague = false;
        state.error = action.payload;
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
        if (Array.isArray(state.leagues)) {
          state.leagues.push(action.payload);
        } else {
          state.leagues = [action.payload];
        }
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
        if (Array.isArray(state.leagues)) {
          const index = state.leagues.findIndex(l => l._id === action.payload._id || l.id === action.payload.id);
          if (index !== -1) state.leagues[index] = action.payload;
        }
      })
      .addCase(updateLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteLeague.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLeague.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(state.leagues)) {
          state.leagues = state.leagues.filter(l => l._id !== action.payload);
        }
      })
      .addCase(deleteLeague.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getLeagueClubs.pending, (state) => {
        state.loadingClubs = true;
        state.error = null;
      })
      .addCase(getLeagueClubs.fulfilled, (state, action) => {
        state.loadingClubs = false;
        state.leagueClubs = action.payload;
      })
      .addCase(getLeagueClubs.rejected, (state, action) => {
        state.loadingClubs = false;
        state.error = action.payload;
      })
      .addCase(getClubTeams.pending, (state) => {
        state.loadingTeams = true;
        state.error = null;
      })
      .addCase(getClubTeams.fulfilled, (state, action) => {
        state.loadingTeams = false;
        state.clubTeams = action.payload;
      })
      .addCase(getClubTeams.rejected, (state, action) => {
        state.loadingTeams = false;
        state.error = action.payload;
      })
      .addCase(getAllSchedules.pending, (state) => {
        state.loadingSchedules = true;
        state.error = null;
      })
      .addCase(getAllSchedules.fulfilled, (state, action) => {
        state.loadingSchedules = false;
        state.schedules = action.payload;
      })
      .addCase(getAllSchedules.rejected, (state, action) => {
        state.loadingSchedules = false;
        state.error = action.payload;
      })
      .addCase(saveSchedule.pending, (state) => {
        state.loadingSchedules = true;
        state.error = null;
      })
      .addCase(saveSchedule.fulfilled, (state, action) => {
        state.loadingSchedules = false;
      })
      .addCase(saveSchedule.rejected, (state, action) => {
        state.loadingSchedules = false;
        state.error = action.payload;
      });
  },
});

export const { resetLeague, setLeagueId } = leagueSlice.actions;
export default leagueSlice.reducer;
