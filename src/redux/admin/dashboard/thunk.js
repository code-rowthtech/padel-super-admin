import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const getCountDataForDashboard = createAsyncThunk(
  "dashboard/getCountDataForDashboard",
  async (params = {}, { rejectWithValue }) => {
    try {
      // ✅ SUPER ADMIN: Always use Super Admin global dashboard API
      const url = Url.SUPER_ADMIN_GLOBAL_DASHBOARD;
      const res = await ownerApi.get(url);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        // Map Super Admin response to dashboard format
        const stats = data?.data?.stats || {};
        return {
          totalBookingHours: stats.totalBookings || 0,
          upcomingBookingHours: stats.todayBookings || 0,
          totalRevenue: stats.totalRevenue || 0,
          cancellationRequestCount: 0 // Will be fetched separately
        };
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
  async (params = {}, { rejectWithValue }) => {
    try {
      // ✅ SUPER ADMIN: Use Super Admin booking API with cancellation filter
      const url = params.ownerId
        ? `${Url.SUPER_ADMIN_GET_ALL_BOOKINGS}?ownerId=${params.ownerId}&bookingStatus=in-progress&limit=10`
        : `${Url.SUPER_ADMIN_GET_ALL_BOOKINGS}?bookingStatus=in-progress&limit=10`;
      const res = await ownerApi.get(url);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data?.data?.bookings || [];
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
  async (params = {}, { rejectWithValue }) => {
    try {
      // ✅ SUPER ADMIN: Use Super Admin booking API for recent bookings
      const url = params.ownerId
        ? `${Url.SUPER_ADMIN_GET_ALL_BOOKINGS}?ownerId=${params.ownerId}&bookingStatus=upcoming&limit=6`
        : `${Url.SUPER_ADMIN_GET_ALL_BOOKINGS}?bookingStatus=upcoming&limit=6`;
      const res = await ownerApi.get(url);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data?.data?.bookings || [];
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

