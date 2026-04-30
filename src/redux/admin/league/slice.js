import { createSlice } from "@reduxjs/toolkit";
import { createLeague, getLeagues, getLeaguesIDS, updateLeague, getStates, getClubsWithState, getSponsorCategories, getLeagueById, deleteLeague, getLeagueClubs, getClubTeams, getAllSchedules, saveSchedule, exportLeagueSchedulesPDF, getLeagueSummary, getScheduleDates } from "./thunk";

const initialState = {
  leagues: [],
  leaguesIDS: [],
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
  loadingExport: false,
  loadingSummary: false,
  leagueSummary: null,
  scheduleDates: [],
  loadingScheduleDates: false,
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
    clearCurrentLeague: (state) => {
      state.currentLeague = null;
      state.leagueId = null;
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
      .addCase(getLeaguesIDS.fulfilled, (state, action) => {
        state.leaguesIDS = action.payload;
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
        // Removed: state.currentLeague = action.payload; // getLeagueById handles updating currentLeague
        if (Array.isArray(state.leagues) && action.payload?.data) {
          const index = state.leagues.findIndex(l => l._id === action.payload.data._id || l.id === action.payload.data.id);
          if (index !== -1) state.leagues[index] = action.payload.data;
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
      })
      .addCase(exportLeagueSchedulesPDF.pending, (state) => {
        state.loadingExport = true;
        state.error = null;
      })
      .addCase(exportLeagueSchedulesPDF.fulfilled, (state) => {
        state.loadingExport = false;
      })
      .addCase(exportLeagueSchedulesPDF.rejected, (state, action) => {
        state.loadingExport = false;
        state.error = action.payload;
      })
      .addCase(getLeagueSummary.pending, (state) => {
        state.loadingSummary = true;
        state.error = null;
      })
      .addCase(getLeagueSummary.fulfilled, (state, action) => {
        state.loadingSummary = false;
        state.leagueSummary = action.payload;
      })
      .addCase(getLeagueSummary.rejected, (state, action) => {
        state.loadingSummary = false;
        state.error = action.payload;
      })
      .addCase(getScheduleDates.pending, (state) => {
        state.loadingScheduleDates = true;
        state.error = null;
      })
      .addCase(getScheduleDates.fulfilled, (state, action) => {
        state.loadingScheduleDates = false;
        state.scheduleDates = action.payload;
      })
      .addCase(getScheduleDates.rejected, (state, action) => {
        state.loadingScheduleDates = false;
        state.error = action.payload;
      });
  },
});

export const { resetLeague, clearCurrentLeague, setLeagueId } = leagueSlice.actions;
export default leagueSlice.reducer;
