import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const getNotificationCount = createAsyncThunk(
  "notification/getNotificationCount",
  async (params, { rejectWithValue }) => {
    try {

      const res = await ownerApi.get(`${Url.GET_NOTIFICATION_COUNT}`);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message;
      return rejectWithValue(errorMessage);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getNotificationView = createAsyncThunk(
  "notification/getNotificationView",
  async (params, { rejectWithValue }) => {
    try {

      const res = await ownerApi.get(`${Url.GET_NOTIFICATION_VIEW}?id=${params.noteId}`);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message;
      return rejectWithValue(errorMessage);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getNotificationData = createAsyncThunk(
  "notification/getNotificationData",
  async (params, { rejectWithValue }) => {
    try {

      const res = await ownerApi.get(`${Url.GET_NOTIFICATION_DATA}`);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message;
      return rejectWithValue(errorMessage);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const readAllNotification = createAsyncThunk(
  "notification/readAllNotification",
  async (params, { rejectWithValue }) => {
    try {

      const res = await ownerApi.get(`${Url.READ_ALL_NOTIFICATION_ADMIN}`);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message;
      return rejectWithValue(errorMessage);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendBulkNotification = createAsyncThunk(
  "notification/sendBulkNotification",
  async (params, { rejectWithValue }) => {
    try {
      const payload = {
        title: params.title,
        message: params.message,
        createdBy: params.createdBy,
      };
      
      // Add type for all users or leagueId for specific league
      if (params.type === 'all') {
        payload.type = 'all';
      } else if (params.leagueId) {
        payload.leagueId = params.leagueId;
      }
      
      const res = await ownerApi.post(`${Url.SEND_BULK_NOTIFICATION}`, payload);
      const { status, data, message } = res || {};
      if (status === 200 || status === 201) {
        showSuccess(message || "Notification sent successfully!");
        return data;
      }
      return rejectWithValue(message);
    } catch (error) {
      showError(error || error?.response?.data?.message || error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const getAdminBulkNotifications = createAsyncThunk(
  "notification/getAdminBulkNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(`${Url.GET_ADMIN_BULK_NOTIFICATIONS}`);
      const { status, data, message } = res || {};
      if (status === 200 || status === 201) {
        return data;
      }
      return rejectWithValue(message);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resendBulkNotification = createAsyncThunk(
  "notification/resendBulkNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(`${Url.RESEND_BULK_NOTIFICATION}`, { notificationId });
      const { status, data, message } = res || {};
      if (status === 200 || status === 201) {
        showSuccess(message || "Notification resent successfully!");
        return data;
      }
      return rejectWithValue(message);
    } catch (error) {
      showError(error?.response?.data?.message || error.message);
      return rejectWithValue(error.message);
    }
  }
);
