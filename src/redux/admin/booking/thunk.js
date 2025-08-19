import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

// Constants for error messages
const ERROR_MESSAGES = {
  FETCH_FAILED: "Failed to get Bookings ",
  NETWORK_ERROR: "Network error",
};

export const getBookingByStatus = createAsyncThunk(
  "manualBooking/getBookingByStatus",
  async (params, { rejectWithValue }) => {
    try {
      const buildQuery = (params) => {
        const query = new URLSearchParams();

        if (params?.status) query.append("bookingStatus", params?.status);
        if (params?.ownerId) query.append("ownerId", params?.ownerId);
        if (params.startDate) query.append("startDate", params.startDate);
        if (params.endDate) query.append("endDate", params.endDate);

        return query.toString();
      };
      const res = await ownerApi.get(
        `${Url.GET_BOOKING_BY_STATUS}?${buildQuery(params)}`
      );
      // Destructure response data
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message || ERROR_MESSAGES.FETCH_FAILED;
      // showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      // showError(error);
      return rejectWithValue(errorMessage);
    }
  }
);
export const getBookingDetailsById = createAsyncThunk(
  "manualBooking/getBookingDetailsById",
  async (params, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(
        `${Url.GET_BOOKING_DETAILS_BY_ID}?_id=${params?.id}`
      );
      // Destructure response data
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message || ERROR_MESSAGES.FETCH_FAILED;
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      showError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  "auth/updateBookingStatus",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.put(Url.UPDATE_BOOKING_STATUS, data);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error);
    }
  }
);
