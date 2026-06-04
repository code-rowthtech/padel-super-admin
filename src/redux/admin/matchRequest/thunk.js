import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const getMatchRequestPlayers = createAsyncThunk(
  "matchRequest/getMatchRequestPlayers",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.matchId) queryParams.append('matchId', params.matchId);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.gender) queryParams.append('gender', params.gender);
      if (params.level) queryParams.append('level', params.level);
      if (params.skillLevel) queryParams.append('skillLevel', params.skillLevel);
      
      const res = await ownerApi.get(`${Url.GET_MATCH_REQUEST}?${queryParams.toString()}`);
      const { status, data } = res || {};
      if (status === 200) {
        return {
          players: data?.data?.players || [],
          automaticRequest: data?.data?.automaticRequest || null,
          pagination: data?.data?.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 }
        };
      }
      return rejectWithValue("Failed to fetch players");
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Error fetching players";
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const sendMatchRequest = createAsyncThunk(
  "matchRequest/sendMatchRequest",
  async ({ matchId, playerId, playerIds, preferredTeam = "any", auto, sendMode }, { rejectWithValue }) => {
    try {
      let payload;
      let endpoint;
      
      if (auto) {
        endpoint = Url.POST_MATCH_REQUEST_AUTO;
        payload = { matchId, sendMode };
      } else if (playerIds && playerIds.length > 0) {
        endpoint = Url.POST_MATCH_REQUEST;
        payload = { matchId, playerIds, preferredTeam };
      } else {
        endpoint = Url.POST_MATCH_REQUEST;
        payload = { matchId, playerId, preferredTeam };
      }
      
      const res = await ownerApi.post(endpoint, payload);
      const { status, data } = res || {};
      if (status === 200 || status === 201) {
        showSuccess(data?.message || "Request sent successfully");
        return data;
      }
      return rejectWithValue("Failed to send request");
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Error sending request";
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
