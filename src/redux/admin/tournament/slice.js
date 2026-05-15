import { createSlice } from "@reduxjs/toolkit";
import { getTournaments, getTournamentById, createTournament, updateTournament, deleteTournament, deleteTournamentSchedule, saveTournamentSchedule, getTournamentSchedules, exportPlayersCSV, uploadPlayersCSV, getPlayersByCategoryGender, addTournamentPlayers, saveTournamentTeams, getTournamentTeams, exportScheduleCSV, importScheduleFromCSV } from "./thunk";

const initialState = {
  tournaments: [],
  currentTournament: null,
  tournamentId: null,
  loading: false,
  loadingTournament: false,
  schedules: [],
  loadingSchedule: false,
  exportingCSV: false,
  uploadingCSV: false,
  exportingScheduleCSV: false,
  importingScheduleCSV: false,
  players: [],
  playersPagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  loadingPlayers: false,
  addingPlayers: false,
  savingTeams: false,
  teamsData: null, // Full teams data object from API
  loadingTeams: false,
  error: null,
};

const tournamentSlice = createSlice({
  name: "tournament",
  initialState,
  reducers: {
    clearCurrentTournament: (state) => {
      state.currentTournament = null;
      state.tournamentId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTournaments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getTournaments.fulfilled, (state, action) => { state.loading = false; state.tournaments = action.payload; })
      .addCase(getTournaments.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(getTournamentById.pending, (state) => { state.loadingTournament = true; state.error = null; })
      .addCase(getTournamentById.fulfilled, (state, action) => { state.loadingTournament = false; state.currentTournament = action.payload; state.tournamentId = action.payload?._id; })
      .addCase(getTournamentById.rejected, (state, action) => { state.loadingTournament = false; state.error = action.payload; })

      .addCase(createTournament.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createTournament.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTournament = action.payload?.data || action.payload;
        state.tournamentId = action.payload?.data?._id || action.payload?._id;
      })
      .addCase(createTournament.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateTournament.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateTournament.fulfilled, (state) => { state.loading = false; })
      .addCase(updateTournament.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(deleteTournament.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteTournament.fulfilled, (state, action) => {
        state.loading = false;
        const data = Array.isArray(state.tournaments?.data) ? state.tournaments.data : [];
        state.tournaments = { ...state.tournaments, data: data.filter(t => t._id !== action.payload) };
      })
      .addCase(deleteTournament.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(deleteTournamentSchedule.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteTournamentSchedule.fulfilled, (state, action) => {
        state.loading = false;
        const data = Array.isArray(state.tournaments?.data) ? state.tournaments.data : [];
        state.tournaments = { ...state.tournaments, data: data.filter(t => t._id !== action.payload) };
      })
      .addCase(deleteTournamentSchedule.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(saveTournamentSchedule.pending, (state) => { state.loadingSchedule = true; })
      .addCase(saveTournamentSchedule.fulfilled, (state) => { state.loadingSchedule = false; })
      .addCase(saveTournamentSchedule.rejected, (state) => { state.loadingSchedule = false; })

      .addCase(getTournamentSchedules.pending, (state) => { state.loadingSchedule = true; })
      .addCase(getTournamentSchedules.fulfilled, (state, action) => { state.loadingSchedule = false; state.schedules = action.payload; })
      .addCase(getTournamentSchedules.rejected, (state) => { state.loadingSchedule = false; })

      .addCase(exportPlayersCSV.pending, (state) => { state.exportingCSV = true; })
      .addCase(exportPlayersCSV.fulfilled, (state) => { state.exportingCSV = false; })
      .addCase(exportPlayersCSV.rejected, (state) => { state.exportingCSV = false; })

      .addCase(uploadPlayersCSV.pending, (state) => { state.uploadingCSV = true; })
      .addCase(uploadPlayersCSV.fulfilled, (state) => { state.uploadingCSV = false; })
      .addCase(uploadPlayersCSV.rejected, (state) => { state.uploadingCSV = false; })

      .addCase(getPlayersByCategoryGender.pending, (state) => { state.loadingPlayers = true; state.error = null; })
      .addCase(getPlayersByCategoryGender.fulfilled, (state, action) => {
        state.loadingPlayers = false;
        state.players = action.payload.data || [];
        state.playersPagination = {
          total: action.payload.total || 0,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          totalPages: action.payload.totalPages || 1
        };
      })
      .addCase(getPlayersByCategoryGender.rejected, (state, action) => { state.loadingPlayers = false; state.error = action.payload; })

      .addCase(addTournamentPlayers.pending, (state) => { state.addingPlayers = true; state.error = null; })
      .addCase(addTournamentPlayers.fulfilled, (state) => { state.addingPlayers = false; })
      .addCase(addTournamentPlayers.rejected, (state, action) => { state.addingPlayers = false; state.error = action.payload; })

      .addCase(saveTournamentTeams.pending, (state) => { state.savingTeams = true; state.error = null; })
      .addCase(saveTournamentTeams.fulfilled, (state) => { state.savingTeams = false; })
      .addCase(saveTournamentTeams.rejected, (state, action) => { state.savingTeams = false; state.error = action.payload; })

      .addCase(getTournamentTeams.pending, (state) => { state.loadingTeams = true; state.error = null; })
      .addCase(getTournamentTeams.fulfilled, (state, action) => { state.loadingTeams = false; state.teamsData = action.payload; })
      .addCase(getTournamentTeams.rejected, (state, action) => { state.loadingTeams = false; state.error = action.payload; })

      .addCase(exportScheduleCSV.pending, (state) => { state.exportingScheduleCSV = true; })
      .addCase(exportScheduleCSV.fulfilled, (state) => { state.exportingScheduleCSV = false; })
      .addCase(exportScheduleCSV.rejected, (state) => { state.exportingScheduleCSV = false; })

      .addCase(importScheduleFromCSV.pending, (state) => { state.importingScheduleCSV = true; })
      .addCase(importScheduleFromCSV.fulfilled, (state) => { state.importingScheduleCSV = false; })
      .addCase(importScheduleFromCSV.rejected, (state) => { state.importingScheduleCSV = false; });
  },
});

export const { clearCurrentTournament } = tournamentSlice.actions;
export default tournamentSlice.reducer;
