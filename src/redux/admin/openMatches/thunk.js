import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

const resolveApiId = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed?._id || parsed?.id || value;
    } catch {
      return value;
    }
  }
  return value._id || value.id || "";
};

export const getAllOpenMatches = createAsyncThunk(
  "openMatches/getAllOpenMatches",
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const activeLocationId = state.club?.activeLocationId || "";
      const selectedCategoryId = state.category?.selectedCategoryId || "";
      const clubId = typeof params === 'string' ? params : params?.clubId;
      const page = params?.page || 1;
      const limit = params?.limit || 12;
      const query = new URLSearchParams({ clubId, page, limit }).toString();
      const res = await ownerApi.get(`${Url.GET_OPEN_MATCHES}?${query}&categoryId=${selectedCategoryId}&location=${activeLocationId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Network error");
    }
  }
);

export const getMatchById = createAsyncThunk(
  "openMatches/getMatchById",
  async (params, { rejectWithValue }) => {
    try {
      const buildQuery = (params) => {
        const query = new URLSearchParams();

        if (params?.id) query.append("_id", params?.id);

        return query.toString();
      };
      const res = await ownerApi.get(
        `${Url.GET_OPEN_MATCH_BY_ID}?${buildQuery(params)}`
      );
      const { status, data, message } = res.data || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message || "Failed to get Match Details";
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Network error";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getMatchByIdAdmin = createAsyncThunk(
  "openMatches/getMatchByIdAdmin",
  async (params, { rejectWithValue }) => {
    try {
      const buildQuery = (params) => {
        const query = new URLSearchParams();

        if (params?.id) query.append("_id", params?.id);

        return query.toString();
      };
      const res = await ownerApi.get(
        `${Url.GET_OPEN_MATCH_BY_ID}?${buildQuery(params)}`
      );
      const { status, data, message } = res.data || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message || "Failed to get Match Details";
      return rejectWithValue(errorMessage);
    } catch (error) {
      // Don't redirect on error for admin - just return error
      const errorMessage = error?.response?.data?.message || "Network error";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAdminRequest = createAsyncThunk(
  "openMatches/getAdminRequest",
  async (matchId, { rejectWithValue }) => {
    try {
      const url = matchId ? `${Url.PLAYER_REQUEST_GET}?matchId=${matchId}` : Url.PLAYER_REQUEST_GET;
      const res = await ownerApi.get(url);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message;
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      // showError(error || errorMessage || error.message);
      return rejectWithValue(errorMessage);
    }
  }
);


export const getAdminRequestUpdate = createAsyncThunk(
  "openMatches/getAdminRequestUpdate",
  async (payload, { rejectWithValue }) => {
    try {

      const res = await ownerApi.put(Url.PLAYER_REQUEST_UPDATE, payload);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message;
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      // showError(error || errorMessage || error.message);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createOpenMatch = createAsyncThunk(
  "openMatches/createOpenMatch",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(Url.CREATE_OPEN_MATCH, data);
      if ([200, 201].includes(res?.status)) {
        showSuccess(res?.data?.message);
        return res?.data;
      } else {
        showError(res?.data?.message || "Booking Failed");
        return rejectWithValue(res?.data?.message || "Booking Failed");
      }
    } catch (error) {
      showError(error);
      return rejectWithValue(error?.response?.data?.message || "Network error");
    }
  }
);

export const createOpenMatchAdmin = createAsyncThunk(
  "openMatches/createOpenMatchAdmin",
  async (data, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const activeLocationId = state.club?.activeLocationId || "";
      const selectedCategoryId = state.category?.selectedCategoryId || "";
      if (activeLocationId) {
        data.location = activeLocationId;
      }
      if (selectedCategoryId) {
        data.categoryId = selectedCategoryId;
      }
      data.clubId = resolveApiId(data.clubId);
      data.categoryId = resolveApiId(data.categoryId);
      data.location = resolveApiId(data.location);

      const res = await ownerApi.post(Url.CREATE_OPEN_MATCH_ADMIN, data);
      if ([200, 201].includes(res?.status)) {
        showSuccess(res?.data?.message);
        return res?.data;
      } else {
        showError(res?.data?.message || "Booking Failed");
        return rejectWithValue(res?.data?.message || "Booking Failed");
      }
    } catch (error) {
      showError(error);
      return rejectWithValue(error?.response?.data?.message || "Network error");
    }
  }
);
