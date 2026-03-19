import { createAsyncThunk } from "@reduxjs/toolkit";
import { GET_APP_USERS } from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError } from "../../../helpers/Toast";

export const getAppUsers = createAsyncThunk(
  "appUsers/getAppUsers",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await ownerApi.get(`${GET_APP_USERS}?page=${page}&limit=${limit}`);
      if (response?.status === 200) {
        return response.data || { data: [], pagination: {} };
      }
      showError(response?.data?.message || "Failed to fetch app users");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error?.message || "Failed to fetch app users");
      return rejectWithValue(error);
    }
  }
);
