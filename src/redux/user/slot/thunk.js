import { createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../../../helpers/api/apiCore";
import { showError } from "../../../helpers/Toast";
import * as Url from "../../../helpers/api/apiEndpoint";

export const getUserSlotBooking = createAsyncThunk(
  "club/getUserSlotBooking",
  async ({ register_club_id, day, date, time ,type}, { rejectWithValue }) => {
    try {
      if (!register_club_id || !day || !date) {
        throw new Error("Missing required parameters: register_club_id, day, or date");
      }

      const queryParams = new URLSearchParams({
        register_club_id,
        day,
        date,
      });

      if (time) {
        queryParams.append("time", time);
      }
      if (type) {
        queryParams.append("type", type);
      }

      const response = await userApi.get(`${Url.GET_SLOT_BOOKING_API}?${queryParams.toString()}`);

      return response?.data;
    } catch (error) {
      // Display error message and reject with error data
      showError(error?.message || "Something went wrong while fetching slots");
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);
export const getUserSlot = createAsyncThunk(
  "club/getUserSlot",
  async ({ register_club_id, day, date, time }, { rejectWithValue }) => {
    try {
      if (!register_club_id || !day || !date) {
        throw new Error("Missing required parameters: register_club_id, day, or date");
      }

      const queryParams = new URLSearchParams({
        register_club_id,
        day,
        date,
      });

      if (time) {
        queryParams.append("time", time);
      }
      const response = await userApi.get(`${Url.GET_SLOT_API}?${queryParams.toString()}`);

      return response?.data;
    } catch (error) {
      // Display error message and reject with error data
      showError(error?.message || "Something went wrong while fetching slots");
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);



export const getMatchesSlot = createAsyncThunk(
  "club/getMathcesSlot",
  async ({ register_club_id, day, date }, { rejectWithValue }) => {
    try {
      // Early validation
      if (!register_club_id || !day || !date) {
        throw new Error("Missing required parameters: register_club_id or day");
      }

      const queryParams = new URLSearchParams({
        register_club_id,
        day,
        date,
      }).toString();

      const response = await userApi.get(`${Url.GET_MATCHES_SLOT_API}?${queryParams}`);

      return response?.data;
    } catch (error) {
      showError(error?.message || "Something went wrong while fetching slots");
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);
