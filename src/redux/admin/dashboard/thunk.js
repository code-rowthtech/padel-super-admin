import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { create, getApi, remove, update } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const getCountDataForDashboard = createAsyncThunk(
  "dashboard/getCountDataForDashboard",
  async (params, { rejectWithValue }) => {
    try {
      const res = await getApi(
        `${Url.GET_ALL_PACKAGES}?search=${params?.search}`
      );
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }
      const errorMessage = message || "error fetching packages";
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      // showError(error);
      return rejectWithValue(errorMessage);
    }
  }
);
