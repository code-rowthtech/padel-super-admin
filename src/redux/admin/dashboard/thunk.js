import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const getCountDataForDashboard = createAsyncThunk(
  "dashboard/getCountDataForDashboard",
  async (params, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(Url.GET_COUNT_DASHBOARD);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data?.data;
      }
      const errorMessage = message || "error fetching Data";
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      return rejectWithValue(errorMessage);
    }
  }
);
export const getCancelledBookingsForDashboard = createAsyncThunk(
  "dashboard/getCancelledBookingsForDashboard",
  async (params, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(Url.GET_CANCELLATION_BOOKING_DASHBOARD);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data?.data;
      }
      const errorMessage = message || "error fetching Bookings";
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      return rejectWithValue(errorMessage);
    }
  }
);
export const getRecentBookingsForDashboard = createAsyncThunk(
  "dashboard/getRecentBookingsForDashboard",
  async (params, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(Url.GET_RECENT_BOOKING_DASHBOARD);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data?.data;
      }
      const errorMessage = message || "error fetching Bookings";
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const getRevenueForDashboard = createAsyncThunk(
  "dashboard/getRevenueForDashboard",
  async (params, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(Url.GET_REVENUE_DASHBOARD);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data?.data;
      }
      const errorMessage = message || "error fetching Bookings";
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      return rejectWithValue(errorMessage);
    }
  }
);

