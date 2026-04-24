import { createAsyncThunk } from "@reduxjs/toolkit";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showSuccess, showError } from "../../../helpers/Toast";

export const CREATE_TOURNAMENT = "/api/tournaments/createTournament";
export const GET_TOURNAMENTS = "/api/tournaments/getAllTournaments";
export const GET_TOURNAMENT_BY_ID = "/api/tournaments/getTournamentById";
export const UPDATE_TOURNAMENT = "/api/tournaments/updateTournament";
export const DELETE_TOURNAMENT = "/api/tournaments/deleteTournament";
export const DELETE_TOURNAMENT_SCHEDULE = "/api/tournament-schedules/deleteScheduleTournament";
export const SAVE_TOURNAMENT_SCHEDULE = "/api/tournament-schedules/saveSchedule";
export const UPDATE_TOURNAMENT_SCHEDULE = "/api/tournament-schedules/updateSchedule";
export const GET_TOURNAMENT_SCHEDULES = "/api/tournament-schedules/getSchedules";
export const EXPORT_PLAYERS_CSV = "/api/tournament-players/exportCSV";
export const UPLOAD_PLAYERS_CSV = "/api/tournament-players/uploadCSV";
export const GET_PLAYERS_BY_CATEGORY_GENDER = "/api/tournament-players/getPlayersByCategoryGender";
export const ADD_TOURNAMENT_PLAYERS = "/api/tournament-players/addPlayer";
export const SAVE_TOURNAMENT_TEAMS = "/api/tournament-teams/saveTeams";
export const GET_TOURNAMENT_TEAMS = "/api/tournament-teams/getTeams";
export const EXPORT_SCHEDULE_CSV = "/api/tournament-schedules/exportCSV";
export const IMPORT_SCHEDULE_CSV = "/api/tournament-schedules/importCSV";

export const getTournaments = createAsyncThunk(
  "tournament/getTournaments",
  async ({ page = 1, limit = 15 } = {}, { rejectWithValue }) => {
    try {
      const response = await ownerApi.get(GET_TOURNAMENTS, { page, limit });
      if (response?.status === 200) return response.data || { data: [], pagination: {} };
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error);
      return rejectWithValue(error);
    }
  }
);

export const getTournamentById = createAsyncThunk(
  "tournament/getTournamentById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await ownerApi.get(`${GET_TOURNAMENT_BY_ID}?id=${id}`);
      if (response?.status === 200) return response.data?.data;
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createTournament = createAsyncThunk(
  "tournament/createTournament",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await ownerApi.postFile(CREATE_TOURNAMENT, formData);
      if (response?.status === 200 || response?.status === 201) {
        showSuccess(response?.data?.message || "Tournament created successfully");
        return response.data;
      }
      showError(response?.data?.message || "Failed to create tournament");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error);
      return rejectWithValue(error);
    }
  }
);

export const updateTournament = createAsyncThunk(
  "tournament/updateTournament",
  async ({ tournamentData }, { rejectWithValue, dispatch }) => {
    try {
      let formData;
      if (tournamentData instanceof FormData) {
        formData = tournamentData;
      } else {
        formData = new FormData();
        Object.keys(tournamentData).forEach(key => formData.append(key, tournamentData[key]));
      }
      const response = await ownerApi.putFile(UPDATE_TOURNAMENT, formData);
      if (response?.status === 200 && response?.data?.success) {
        showSuccess(response?.data?.message || "Tournament updated successfully");
        const id = formData.get('id');
        if (id) await dispatch(getTournamentById(id));
        return response.data;
      }
      showError(response?.data?.message || "Failed to update tournament");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error);
      return rejectWithValue(error);
    }
  }
);

export const deleteTournament = createAsyncThunk(
  "tournament/deleteTournament",
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await ownerApi.delete(DELETE_TOURNAMENT, { _id: tournamentId });
      if (response?.status === 200 && response?.data?.success) {
        showSuccess(response?.data?.message || "Tournament deleted successfully");
        return tournamentId;
      }
      showError(response?.data?.message || "Failed to delete tournament");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error);
      return rejectWithValue(error);
    }
  }
);
export const deleteTournamentSchedule = createAsyncThunk(
  "tournament/deleteTournamentSchedule",
  async (scheduleId, { rejectWithValue }) => {
    try {
      const response = await ownerApi.delete(DELETE_TOURNAMENT_SCHEDULE, { _id: scheduleId });
      if (response?.status === 200 && response?.data?.success) {
        showSuccess(response?.data?.message || "Tournament deleted successfully");
        return scheduleId;
      }
      showError(response?.data?.message || "Failed to delete tournament");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error);
      return rejectWithValue(error);
    }
  }
);

export const saveTournamentSchedule = createAsyncThunk(
  "tournament/saveTournamentSchedule",
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await ownerApi.post(SAVE_TOURNAMENT_SCHEDULE, scheduleData);
      if (response?.status === 200 || response?.status === 201) {
        console.log({ response })
        showSuccess(response?.data?.message || "Schedule saved successfully");
        return response.data;
      }
      showError(response?.data?.message || "Failed to save schedule");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error);
      return rejectWithValue(error);
    }
  }
);

export const updateTournamentSchedule = createAsyncThunk(
  "tournament/updateTournamentSchedule",
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await ownerApi.put(UPDATE_TOURNAMENT_SCHEDULE, scheduleData);
      if (response?.status === 200 || response?.status === 201) {
        showSuccess(response?.data?.message || "Schedule updated successfully");
        return response.data;
      }
      showError(response?.data?.message || "Failed to update schedule");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error);
      return rejectWithValue(error);
    }
  }
);

export const getTournamentSchedules = createAsyncThunk(
  "tournament/getTournamentSchedules",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      Object.keys(params).forEach(k => { if (params[k]) query.append(k, params[k]); });
      const response = await ownerApi.get(`${GET_TOURNAMENT_SCHEDULES}${query.toString() ? `?${query.toString()}` : ''}`);
      if (response?.status === 200) return response.data?.data || [];
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const exportPlayersCSV = createAsyncThunk(
  "tournament/exportPlayersCSV",
  async ({ tournamentId, tournamentName }, { rejectWithValue }) => {
    try {
      const response = await ownerApi.getBlob(`${EXPORT_PLAYERS_CSV}?tournamentId=${tournamentId}`);
      if (response?.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${tournamentName}-players-template.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showSuccess('CSV template downloaded successfully');
        return { success: true };
      }
      showError('Failed to export CSV');
      return rejectWithValue('Failed to export CSV');
    } catch (error) {
      showError(error || 'Failed to export CSV');
      return rejectWithValue(error);
    }
  }
);

export const uploadPlayersCSV = createAsyncThunk(
  "tournament/uploadPlayersCSV",
  async ({ file, tournamentId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tournamentId', tournamentId);
      const response = await ownerApi.postFile(UPLOAD_PLAYERS_CSV, formData);
      if (response?.status === 200 || response?.status === 201) {
        showSuccess(response?.data?.message || 'Players imported successfully');
        return response.data;
      }
      showError(response?.data?.message || 'Failed to import players');
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error?.response?.data?.message || error || 'Failed to import players');
      return rejectWithValue(error);
    }
  }
);

export const getPlayersByCategoryGender = createAsyncThunk(
  "tournament/getPlayersByCategoryGender",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      Object.keys(params).forEach(k => { if (params[k]) query.append(k, params[k]); });
      const response = await ownerApi.get(`${GET_PLAYERS_BY_CATEGORY_GENDER}${query.toString() ? `?${query.toString()}` : ''}`);
      if (response?.status === 200) {
        return {
          data: response.data?.data || [],
          total: response.data?.total || 0,
          page: response.data?.page || 1,
          limit: response.data?.limit || 10,
          totalPages: response.data?.totalPages || 1
        };
      }
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addTournamentPlayers = createAsyncThunk(
  "tournament/addTournamentPlayers",
  async ({ tournamentId, players, categoryType, tag }, { rejectWithValue, dispatch }) => {
    try {
      const payload = {
        tournamentId,
        ...(categoryType && { categoryType }),
        ...(tag && { tag }),
        players: players.map(p => ({
          playerName: p.playerName.trim(),
          phoneNumber: p.phoneNumber.trim(),
          email: p.email.trim(),
          gender: p.gender.toLowerCase()
        }))
      };
      const response = await ownerApi.post(ADD_TOURNAMENT_PLAYERS, payload);
      if (response?.status === 200 || response?.status === 201) {
        const data = response.data;
        const addedCount = data.added?.length || 0;
        const skippedCount = data.skipped?.length || 0;

        // Show toast messages
        if (addedCount > 0 && skippedCount > 0) {
          showSuccess(`${addedCount} player(s) added successfully, ${skippedCount} skipped`);
        } else if (addedCount > 0) {
          showSuccess(`${addedCount} player(s) added successfully`);
        } else if (skippedCount > 0) {
          showError(`All ${skippedCount} player(s) were skipped`);
        }

        return data;
      }
      showError(response?.data?.message || 'Failed to create players');
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error?.response?.data?.message || error || 'Failed to create players');
      return rejectWithValue(error);
    }
  }
);

export const saveTournamentTeams = createAsyncThunk(
  "tournament/saveTournamentTeams",
  async ({ tournamentId, categoryType, tag, teams }, { rejectWithValue }) => {
    try {
      const payload = { tournamentId, categoryType, tag, teams };
      const response = await ownerApi.post(SAVE_TOURNAMENT_TEAMS, payload);
      if (response?.status === 200 || response?.status === 201) {
        showSuccess(response?.data?.message || "Teams saved successfully");
        return response.data;
      }
      showError(response?.data?.message || "Failed to save teams");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error?.response?.data?.message || error || "Failed to save teams");
      return rejectWithValue(error);
    }
  }
);

export const getTournamentTeams = createAsyncThunk(
  "tournament/getTournamentTeams",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      Object.keys(params).forEach(k => { if (params[k]) query.append(k, params[k]); });
      const response = await ownerApi.get(`${GET_TOURNAMENT_TEAMS}${query.toString() ? `?${query.toString()}` : ''}`);
      if (response?.status === 200) {
        // API returns { success: true, data: { teams: [...] } }
        return response.data?.data || null;
      }
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const exportScheduleCSV = createAsyncThunk(
  "tournament/exportScheduleCSV",
  async ({ tournamentId, tournamentName }, { rejectWithValue }) => {
    try {
      const response = await ownerApi.getBlob(`${EXPORT_SCHEDULE_CSV}?tournamentId=${tournamentId}`);
      if (response?.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${tournamentName || 'tournament'}-schedules.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showSuccess('Schedule CSV exported successfully');
        return { success: true };
      }
      showError('Failed to export schedule CSV');
      return rejectWithValue('Failed to export schedule CSV');
    } catch (error) {
      showError(error || 'Failed to export schedule CSV');
      return rejectWithValue(error);
    }
  }
);

export const importScheduleFromCSV = createAsyncThunk(
  "tournament/importScheduleFromCSV",
  async ({ file, tournamentId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await ownerApi.postFile(`${IMPORT_SCHEDULE_CSV}?tournamentId=${tournamentId}`, formData);
      if (response?.status === 200 || response?.status === 201) {
        showSuccess(response?.data?.message || 'Schedule imported successfully');
        return response.data;
      }
      showError(response?.data?.message || 'Failed to import schedule');
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error?.response?.data?.message || error || 'Failed to import schedule');
      return rejectWithValue(error);
    }
  }
);
