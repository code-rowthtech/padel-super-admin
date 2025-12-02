import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { userApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const createMatches = createAsyncThunk(
  "matches/createMatches",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.post(`${Url.CREATE_MATCHES}`, data);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error?.message || error);
      return rejectWithValue(error);
    }
  }
);

export const getMatches = createAsyncThunk(
  "matches/getBooking",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.get(`${Url.GET_BOOKING_API}`, data);
      return res?.data;
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error);
    }
  }
);

export const getMatchesUser = createAsyncThunk(
  "matches/getMatchesUser",
  async (data, { rejectWithValue }) => {
    try {
      const { clubId, ...params } = data;
      const res = await userApi.get(`${Url.GET_OPENMATCH_USER}?clubId=${clubId}`, params);
      return res?.data;
    } catch (error) {
      showError(error);
      return rejectWithValue(error);
    }
  }
);

export const getMatchesView = createAsyncThunk(
  "matches/getMatchesView",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.get(`${Url.VIEW_OPENMATCH}?_id=${data}`);
      return res?.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addPlayers = createAsyncThunk(
  "matches/addPlayers",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.put(Url.ADD_PLAYERS, data);
      return res?.data;
    } catch (error) {
      showError(error);
      // return rejectWithValue(error)
    }
  }
)

export const removePlayers = createAsyncThunk(
  "matches/removePlayers",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.put(`${Url.REMOVE_PLAYERS}`, data)
      return res?.data;
    } catch (error) {
      showError(error);
      return rejectWithValue(error)
    }
  }
)
