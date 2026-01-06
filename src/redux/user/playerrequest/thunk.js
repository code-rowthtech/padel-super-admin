import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { showError, showSuccess } from "../../../helpers/Toast";
import { userApi } from "../../../helpers/api/apiCore";

export const getRequest = createAsyncThunk(
  "playerrequest/getRequest",
  async (matchId, { rejectWithValue }) => {
    try {
      const url = matchId ? `${Url.PLAYER_REQUEST_GET}?matchId=${matchId}` : Url.PLAYER_REQUEST_GET;
      const res = await userApi.get(url);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message;
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      showError(error || errorMessage || error.message);
      return rejectWithValue(errorMessage);
    }
  }
);
export const createRequest = createAsyncThunk(
  "playerrequest/createRequest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await userApi.post(Url.PLAYER_REQUEST, payload);
      showSuccess(res?.data?.message );
      const { status, data,message } = res || {};
      if (status === 200 || "200") {
        return data;
      }
      const errorMessage = res?.data?.message || message;
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      showError(error.message || error || errorMessage);
      // return rejectWithValue(errorMessage);
    }
  }
);
export const updateRequest = createAsyncThunk(
  "playerrequest/updateRequest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await userApi.put(Url.PLAYER_REQUEST_UPDATE, payload);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }
      showSuccess(message || res?.data?.message);
      const errorMessage = message;
      return rejectWithValue(errorMessage);
    } catch (error) {
      showError(error || error.message);
      return rejectWithValue(error);
    }
  }
);
