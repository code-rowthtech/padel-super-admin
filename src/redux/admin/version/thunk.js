import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

const ERROR_MESSAGES = {
  FETCH_FAILED: "Failed to get registered club",
  NETWORK_ERROR: "Network error",
};

export const getVersion = createAsyncThunk(
  "version/getVersion",
  async (params, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(
        `${Url.GET_VERSION}`
      );

      const { status, data, message } = res?.data || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message || ERROR_MESSAGES.FETCH_FAILED;
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateVersion = createAsyncThunk(
  "version/updateVersion",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.put(Url.UPDATE_VERSION, data);
      if (res?.status === 200) {
        showSuccess(res?.data?.message);
        return res?.data;
      } else {
        showError(res?.data?.message || "Version Failed");
        return rejectWithValue(res?.data?.message || "Version Failed");
      }
    } catch (error) {
      showError(error);
      return rejectWithValue(error?.response?.data?.message || "Network error");
    }
  }
);
