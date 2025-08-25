import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { userApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.post(`${Url.CREATE_BOOKING_API}`, data);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error?.message || error);
      return rejectWithValue(error);
    }
  }
);

export const getBooking = createAsyncThunk(
  "booking/getBooking",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.get(`${Url.GET_BOOKING_API}`, data);
      return res?.data;
    } catch (error) {
      showError(error?.message || error);
      return rejectWithValue(error);
    }
  }
);

export const bookingStatus = createAsyncThunk(
  "booking/bookingStatus",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.put(`${Url.BOOKING_STATUS_CHANGE}`, data);
      return res?.data;
    } catch (error) {
      showError(error?.message || error);
      return rejectWithValue(error);
    }
  }
);
