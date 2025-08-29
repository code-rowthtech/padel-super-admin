import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const getAllOpenMatches = createAsyncThunk(
  "openMatches/getAllOpenMatches",
  async (params, { rejectWithValue }) => {
    try {
      const buildQuery = (params) => {
        const query = new URLSearchParams();

        if (params?.status) query.append("bookingStatus", params?.status);

        return query.toString();
      };
      const res = await ownerApi.get(
        `${Url.GET_OPEN_MATCHES}?${buildQuery(params)}`
      );
      // Destructure response data
      const { status, data, message } = res.data || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message || "Failed to get Open Matches";
      // showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Network error";
      // showError(error);
      // return rejectWithValue(errorMessage);
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
      // Destructure response data
      const { status, data, message } = res.data || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message || "Failed to get Match Details";
      // showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Network error";
      // showError(error);
      // return rejectWithValue(errorMessage);
    }
  }
);
