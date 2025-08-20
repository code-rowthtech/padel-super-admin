import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

// Constants for error messages
const ERROR_MESSAGES = {
  FETCH_FAILED: "Failed to get registered club",
  NETWORK_ERROR: "Network error",
};

export const getOwnerRegisteredClub = createAsyncThunk(
  "manualBooking/getOwnerRegisteredClub",
  async (params, { rejectWithValue }) => {
    // Removed unused 'data' parameter
    try {
      const res = await ownerApi.get(
        `${Url.GET_REGISTERED_CLUB}?ownerId=${params?.ownerId}`
      );

      // Destructure response data
      const { status, data, message } = res?.data || {};
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
export const getActiveCourts = createAsyncThunk(
  "manualBooking/getActiveCourts",
  async (params, { rejectWithValue }) => {
    // Removed unused 'data' parameter
    try {
      const res = await ownerApi.get(
        `${Url.GET_ACTIVE_COURTS}?register_club_id=${
          params?.register_club_id
        }&day=${params?.day}&courtId=${params?.courtId || ""}`
      );

      // Destructure response data
      const { status, data, message } = res?.data || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message || "error fetching active clubs";
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

export const manualBookingByOwner = createAsyncThunk(
  "manualBooking/manualBookingByOwner",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(Url.MANUAL_BOOKING_BY_OWNER, data);
      if (res?.status === 200) {
        showSuccess(res?.data?.message);
        return res?.data;
      } else {
        showError(res?.data?.message || "Booking Failed");
        return rejectWithValue(res?.data?.message || "Booking Failed");
      }
    } catch (error) {
      showError(error);
      return rejectWithValue(error?.response?.data?.message || "Network error");
    }
  }
);
