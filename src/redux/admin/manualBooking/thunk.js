import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

const ERROR_MESSAGES = {
  FETCH_FAILED: "Failed to get registered club",
  NETWORK_ERROR: "Network error",
};

export const getOwnerRegisteredClub = createAsyncThunk(
  "manualBooking/getOwnerRegisteredClub",
  async (params, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(
        `${Url.GET_REGISTERED_CLUB}?ownerId=${params?.ownerId}`
      );

      const { status, data, message } = res?.data || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message || ERROR_MESSAGES.FETCH_FAILED;
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      // Don't show error for "No registered courts" - it's expected for new users
      if (!errorMessage.includes('No registered courts')) {
        showError(errorMessage);
      }
      return rejectWithValue(errorMessage);
    }
  }
);
export const getActiveCourts = createAsyncThunk(
  "manualBooking/getActiveCourts",
  async (params, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(
        `${Url.GET_ACTIVE_COURTS}?register_club_id=${params?.register_club_id}&day=${params?.day}&date=${params?.date}&courtId=${params?.courtId}`
      );

      const { status, data, message, allCourts, allSlotTimes, allCourtNames } =
        res?.data || {};
      if (status === 200 || "200") {
        return { data, allCourts, allSlotTimes, allCourtNames };
      }

      const errorMessage = message || "error fetching active clubs";
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      // Don't show error for "No registered courts" - it's expected
      if (!errorMessage.includes('No registered courts')) {
        showError(errorMessage);
      }
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
