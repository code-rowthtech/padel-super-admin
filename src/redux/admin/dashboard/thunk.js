import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

const appendDashboardQueryParams = (queryParams, params = {}) => {
  if (params.ownerId) {
    queryParams.push(`ownerId=${params.ownerId}`);
  }
  if (params.clubId) {
    queryParams.push(`clubId=${params.clubId}`);
  }
  if (params.bookingMode) {
    queryParams.push(`bookingMode=${params.bookingMode}`);
  }
  if (params.category) {
    queryParams.push(`category=${params.category}`);
  }
  if (params.startDate) {
    queryParams.push(`startDate=${params.startDate}`);
  }
  if (params.endDate) {
    queryParams.push(`endDate=${params.endDate}`);
  }
  if (params.month !== undefined) {
    queryParams.push(`month=${params.month}`);
  }
  if (params.year) {
    queryParams.push(`year=${params.year}`);
  }
};

const buildDashboardUrl = (baseUrl, params = {}) => {
  const queryParams = [];
  appendDashboardQueryParams(queryParams, params);
  return queryParams.length > 0 ? `${baseUrl}?${queryParams.join("&")}` : baseUrl;
};

export const getCountDataForDashboard = createAsyncThunk(
  "dashboard/getCountDataForDashboard",
  async (params = {}, { rejectWithValue }) => {
    try {
      const url = buildDashboardUrl(Url.GET_COUNT_DASHBOARD, params);
      const res = await ownerApi.get(url);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        const stats = data?.data?.stats || data?.data || {};
        return {
          totalBookingHours: stats.totalBookings ?? 0,
          upcomingBookingHours: stats.todayBookings ?? 0,
          totalBookingsCount: stats.totalBookingsCount ?? 0,
          totalRevenue: stats.totalRevenue ?? 0,
          adminRevenue: stats.offlineBookingRevenue ?? 0,
          userPanelRevenue: stats.onlineBookingRevenue ?? 0,
          bookingModeRatio: stats.bookingModeRatio ?? null,
          openMatches: stats.openMatches ?? 0,
          openMatchRequests: stats.openMatchRequests ?? { total: 0, pending: 0, accepted: 0 },
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
      const url = buildDashboardUrl(Url.GET_CANCELLATION_BOOKING_DASHBOARD, params);
      const res = await ownerApi.get(url);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data?.data?.bookings || data?.data || [];
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
      const url = buildDashboardUrl(Url.GET_RECENT_BOOKING_DASHBOARD, params);
      const res = await ownerApi.get(url);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data?.data?.bookings || data?.data || [];
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

/** Monthly Booking Analytics – used by Dashboard chart (monthly view) */
export const getRevenueForDashboard = createAsyncThunk(
  "dashboard/getRevenueForDashboard",
  async (params = {}, { rejectWithValue }) => {
    try {
      const url = buildDashboardUrl(Url.GET_REVENUE_DASHBOARD, params);
      const res = await ownerApi.get(url);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        // { onlineBookings: [], offlineBookings: [] } when all modes; filtered shape may vary
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

/** Daily Booking Analytics – used by Dashboard chart (daily view) */
export const getDaywiseRevenueForDashboard = createAsyncThunk(
  "dashboard/getDaywiseRevenueForDashboard",
  async (params = {}, { rejectWithValue }) => {
    try {
      const url = buildDashboardUrl(Url.GET_DAYWISE_DASHBOARD, params);
      const res = await ownerApi.get(url);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        // { onlineBookings: [], offlineBookings: [] } when all modes; filtered shape may vary
        return data?.data;
      }
      const errorMessage = message || "error fetching Daywise Data";
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const getClubsBookingModeRatio = createAsyncThunk(
  "dashboard/getClubsBookingModeRatio",
  async (params = {}, { rejectWithValue }) => {
    try {
      const url = buildDashboardUrl(Url.GET_CLUBS_BOOKING_MODE_RATIO, params);
      const res = await ownerApi.get(url);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data?.data || data;
      }
      const errorMessage = message || "error fetching Booking Mode Ratio";
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const getOpenMatchOverview = createAsyncThunk(
  "dashboard/getOpenMatchOverview",
  async (params = {}, { rejectWithValue }) => {
    try {
      const url = buildDashboardUrl(Url.SUPER_ADMIN_OPEN_MATCH_OVERVIEW, params);
      const res = await ownerApi.get(url);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data?.data || data || [];
      }
      const errorMessage = message || "error fetching open matches overview";
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message;
      return rejectWithValue(errorMessage);
    }
  }
);


