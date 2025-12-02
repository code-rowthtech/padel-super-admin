import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";




export const getAllOpenMatches = createAsyncThunk(
  "openMatches/getAllOpenMatches",
  async (clubId, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams({ clubId }).toString();

      const res = await ownerApi.get(`${Url.GET_OPEN_MATCHES}?${query}`);

      const { status, message } = res.data || {};

      if (status === 200) {
        return res.data;
      }

      return rejectWithValue(message || "Failed to get open matches");
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
    }
  }
);

export const createOpenMatch = createAsyncThunk(
  "openMatches/createOpenMatch",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(Url.CREATE_OPEN_MATCH, data);
      if (res?.status === 200) {
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
