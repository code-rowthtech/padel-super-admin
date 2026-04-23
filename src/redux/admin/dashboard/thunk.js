import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const getCountDataForDashboard = createAsyncThunk(
  "dashboard/getCountDataForDashboard",
  async (params = {}, { rejectWithValue }) => {
    try {
      let url;
      const queryParams = [];
      
      if (params.ownerId) {
        queryParams.push(`ownerId=${params.ownerId}`);
      }
      
      // Use new club-dashboard API only if clubId is provided
      if (params.clubId) {
        url = Url.SUPER_ADMIN_CLUB_DASHBOARD_DATA;
        queryParams.push(`clubId=${params.clubId}`);
      } else {
        // Use old API when all clubs selected or first load
        url = Url.GET_COUNT_DASHBOARD;
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }
      
      const res = await ownerApi.get(url);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        const stats = data?.data?.stats || data?.data || {};
        return {
          totalBookingHours: stats.totalBookings || 0,
          upcomingBookingHours: stats.todayBookings || 0,
          totalRevenue: stats.totalRevenue || 0,
          cancellationRequestCount: 0
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
      let url;
      const queryParams = [];
      
      if (params.ownerId) {
        queryParams.push(`ownerId=${params.ownerId}`);
      }
      
      // Use new club-dashboard API only if clubId is provided
      if (params.clubId) {
        url = Url.SUPER_ADMIN_DASHBOARD_CANCELLATIONS;
        queryParams.push(`clubId=${params.clubId}`);
      } else {
        // Use old API when all clubs selected or first load
        url = Url.GET_CANCELLATION_BOOKING_DASHBOARD;
      }
      
      url += `?${queryParams.join("&")}`;
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
      let url;
      const queryParams = [];
      
      if (params.ownerId) {
        queryParams.push(`ownerId=${params.ownerId}`);
      }
      
      // Use new club-dashboard API only if clubId is provided
      if (params.clubId) {
        url = Url.SUPER_ADMIN_DASHBOARD_CURRENT_BOOKINGS;
        queryParams.push(`clubId=${params.clubId}`);
      } else {
        // Use old API when all clubs selected or first load
        url = Url.GET_RECENT_BOOKING_DASHBOARD;
      }
      
      url += `?${queryParams.join("&")}`;
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

export const getRevenueForDashboard = createAsyncThunk(
  "dashboard/getRevenueForDashboard",
  async (params = {}, { rejectWithValue }) => {
    try {
      let url;
      const queryParams = [];
      
      if (params.ownerId) {
        queryParams.push(`ownerId=${params.ownerId}`);
      }
      
      // Use new club-dashboard API only if clubId is provided
      if (params.clubId) {
        url = Url.SUPER_ADMIN_CLUB_DASHBOARD_PAYMENT;
        queryParams.push(`clubId=${params.clubId}`);
      } else {
        // Use old API when all clubs selected or first load
        url = Url.GET_REVENUE_DASHBOARD;
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }
      
      const res = await ownerApi.get(url);
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
