import { createAsyncThunk } from "@reduxjs/toolkit";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showSuccess, showError } from "../../../helpers/Toast";

export const CREATE_TOURNAMENT = "/api/tournaments/createTournament";
export const GET_TOURNAMENTS = "/api/tournaments/getAllTournaments";
export const GET_TOURNAMENT_BY_ID = "/api/tournaments/getTournamentById";
export const UPDATE_TOURNAMENT = "/api/tournaments/updateTournament";
export const DELETE_TOURNAMENT = "/api/tournaments/deleteTournament";
export const SAVE_TOURNAMENT_SCHEDULE = "/api/tournament-schedules/saveSchedule";
export const GET_TOURNAMENT_SCHEDULES = "/api/tournament-schedules/getSchedules";
export const EXPORT_PLAYERS_CSV = "/api/tournament-players/exportCSV";
export const UPLOAD_PLAYERS_CSV = "/api/tournament-players/uploadCSV";

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

export const saveTournamentSchedule = createAsyncThunk(
  "tournament/saveTournamentSchedule",
  async (scheduleData, { rejectWithValue }) => {
    try {
      const response = await ownerApi.post(SAVE_TOURNAMENT_SCHEDULE, scheduleData);
      if (response?.status === 200 || response?.status === 201) {
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
