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

