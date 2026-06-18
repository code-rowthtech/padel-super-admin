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
        `${Url.GET_REGISTERED_CLUB}?${params?.register_club_id ? `register_club_id=${params?.register_club_id}` : `ownerId=${params?.ownerId}`}`
      );
      const { status, data, message } = res?.data || {};
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

export const getActiveCourts = createAsyncThunk(
  "manualBooking/getActiveCourts",
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const activeLocationId = state.club?.activeLocationId || "";
      const selectedCategoryId = state.category?.selectedCategoryId || "";
      const res = await ownerApi.get(
        `${Url.GET_ACTIVE_COURTS}?register_club_id=${params?.register_club_id}&day=${params?.day}&date=${params?.date}&courtId=${params?.courtId}&location=${activeLocationId}&category=${selectedCategoryId}`
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
      return rejectWithValue(errorMessage);
    }
  }
);

export const getCourtByRegisterClubId = createAsyncThunk(
  "manualBooking/getCourtByRegisterClubId",
  async (params, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(
        `${Url.GET_COURT_BY_REGISTER_CLUB_ID}?register_club_id=${params?.register_club_id}&locations=${params?.locationId}${params?.categoryId ? `&categoryId=${params?.categoryId}` : ''}`
      );
      const { status, data, message } = res?.data || {};
      if (status === 200 || "200") {
        return data;
      }
      const errorMessage = message || "Failed to get Courts";
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

export const manualBookingByOwner = createAsyncThunk(
  "manualBooking/manualBookingByOwner",
  async (data, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      data.location = state.club?.activeLocationId || "";
      data.categoryId = state.category?.selectedCategoryId || "";
      const res = await ownerApi.post(Url.MANUAL_BOOKING_BY_OWNER, data);
      if (res?.status === 200) {
        showSuccess(res?.data?.message);
        return res?.data;
      } else {
        showError(res?.data?.message || "Booking Failed");
        return rejectWithValue(res?.data);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || error || "This slot was locked and booked";
      showError(errorMessage);
      return rejectWithValue(error?.response?.data || { message: errorMessage });
    }
  }
);

// Admin check booking thunk
export const adminCheckBooking = createAsyncThunk(
  "manualBooking/adminCheckBooking",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(`${Url.CHECK_BOOKING_API}`, data);
      return res?.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || error || "Booking check failed";
      // showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Admin remove booking thunk
export const adminRemoveBookedBooking = createAsyncThunk(
  "manualBooking/adminRemoveBookedBooking",
  async (params, { rejectWithValue }) => {
    try {
      const res = await ownerApi.delete(`${Url.REMOVE_BOOKING_API}`, params);
      return res?.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to remove booking";
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAdminSlotBooking = createAsyncThunk(
  "manualBooking/getAdminSlotBooking",
  async ({ register_club_id, day, date, time, type, categoryId, location }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        register_club_id,
        day,
        date,
      });
      if (location) queryParams.append("locations", location);
      if (categoryId) queryParams.append("categoryId", categoryId);
      if (time) queryParams.append("time", time);
      if (type) queryParams.append("type", type);
      const response = await ownerApi.get(`${Url.GET_SLOT_BOOKING_API}?${queryParams.toString()}`);
      return response?.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to get slot booking";
      // showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAdminHalfSlotPrice = createAsyncThunk(
  "manualBooking/getAdminHalfSlotPrice",
  async ({ register_club_id, day, location, categoryId }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const queryParams = new URLSearchParams({ register_club_id, day });
      const activeLocationId = state.club?.activeLocationId || "";
      const activeCategoryId = state.category?.selectedCategoryId || "";
      const response = await ownerApi.get(`${Url.GET_SLOT_HALF_PRICES}?${queryParams.toString()}&locations=${location || activeLocationId}&categoryId=${categoryId || activeCategoryId}`);
      return response?.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to get half slot price";
      // showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAdminSlotPrice = createAsyncThunk(
  "manualBooking/getAdminSlotPrice",
  async ({ register_club_id, day, duration, location, categoryId, courtId }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const queryParams = new URLSearchParams({ register_club_id, day, duration });
      const activeLocationId = state.club?.activeLocationId || "";
      const activeCategoryId = state.category?.selectedCategoryId || "";

      // Add courtId to query params if provided
      if (courtId) {
        queryParams.append('courtId', courtId);
      }

      const response = await ownerApi.get(`${Url.GET_SLOT_PRICES}?${queryParams.toString()}&location=${location ? location : activeLocationId}&categoryId=${categoryId ? categoryId : activeCategoryId}`);
      return response?.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to get slot price";
      // showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAdminMatchesSlot = createAsyncThunk(
  "manualBooking/getAdminMatchesSlot",
  async ({ register_club_id, day, date }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const queryParams = new URLSearchParams({ register_club_id, day, date });
      const activeLocationId = state.club?.activeLocationId || "";
      const activeCategoryId = state.category?.selectedCategoryId || "";
      const response = await ownerApi.get(`${Url.GET_MATCHES_SLOT_API}?${queryParams.toString()}&location=${activeLocationId}&categoryId=${activeCategoryId}`);
      return response?.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to get matches slot";
      // showError(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
