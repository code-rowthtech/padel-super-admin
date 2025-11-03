import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { showError, showSuccess } from "../../../helpers/Toast";
import { userApi } from "../../../helpers/api/apiCore";

export const getNotificationCount = createAsyncThunk(
  "notification/getNotificationCount",
  async (params, { rejectWithValue }) => {
    try {

      const res = await userApi.get(`${Url.GET_NOTIFICATION_USER_COUNT}?id=${params.noteId}`);
      // Destructure response data
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message;
      // showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      // showError(error);
      return rejectWithValue(error.message);
    }
  }
);

export const getNotificationData = createAsyncThunk(
  "notification/getNotificationData",
  async (params, { rejectWithValue }) => {
    try {

      const res = await userApi.get(`${Url.GET_NOTIFICATION_USER_DATA}`);
      // Destructure response data
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message;
      // showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      // showError(error);
      return rejectWithValue(error.message);
    }
  }
);

