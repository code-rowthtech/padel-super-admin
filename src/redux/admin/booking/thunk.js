import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerAxios } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

const ERROR_MESSAGES = {
  FETCH_FAILED: "Failed to get Bookings ",
  NETWORK_ERROR: "Network error",
};

const buildBookingQueryString = (params = {}) => {
  const query = new URLSearchParams();

  if (params?.status) {
    if (params.status === "upcoming") {
      query.append("bookingStatus", "upcoming");
    } else if (params.status === "completed") {
      query.append("bookingStatus", "completed");
    } else {
      query.append("bookingStatus", params.status);
    }
  }
  if (params?.ownerId) query.append("ownerId", params.ownerId);
  if (params?.clubId) query.append("clubId", params.clubId);
  if (params?.paymentStatus) query.append("paymentStatus", params.paymentStatus);
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.search) query.append("search", params.search);
  if (params.category) query.append("category", params.category);
  if (params.bookingMode) query.append("bookingMode", params.bookingMode);
  if (params.page) query.append("page", params.page);
  if (params.limit) query.append("limit", params.limit);

  return query.toString();
};

export const getBookingByStatus = createAsyncThunk(
  "manualBooking/getBookingByStatus",
  async (params, { rejectWithValue, signal }) => {
    try {
      const res = await ownerAxios.get(
        `${Url.SUPER_ADMIN_GET_ALL_BOOKINGS}?${buildBookingQueryString(params)}`,
        { signal }
      );
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        // Map Super Admin response format to expected format
        return {
          bookings: data?.data?.bookings || [],
          totalItems: data?.data?.pagination?.totalItems || 0,
          currentPage: data?.data?.pagination?.currentPage || 1,
          totalPages: data?.data?.pagination?.totalPages || 1
        };
      }

      const errorMessage = message || ERROR_MESSAGES.FETCH_FAILED;
      return rejectWithValue(errorMessage);
    } catch (error) {
      if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
        return rejectWithValue({ aborted: true });
      }
      const errorMessage =
        error?.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR;
      return rejectWithValue(errorMessage);
    }
  }
);
export const getBookingDetailsById = createAsyncThunk(
  "manualBooking/getBookingDetailsById",
  async (params, { rejectWithValue }) => {
    try {
      const res = await ownerAxios.get(
        `${Url.GET_BOOKING_DETAILS_BY_ID}?_id=${params?.id}`
      );
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
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  "manualBooking/updateBookingStatus",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerAxios.put(Url.UPDATE_BOOKING_STATUS, data);
      return res?.data;
    } catch (error) {
      showError(error?.message);
    }
  }
);

const buildBookingCountUrl = (params = {}) => {
  const queryString = buildBookingQueryString(params);
  return queryString
    ? `${Url.SUPER_ADMIN_GET_ALL_BOOKINGS}?${queryString}`
    : Url.SUPER_ADMIN_GET_ALL_BOOKINGS;
};

export const bookingCount = createAsyncThunk(
  "manualBooking/bookingCount",
  async (data, { rejectWithValue, signal }) => {
    try {
      const baseParams = {
        ...(data?.ownerId ? { ownerId: data.ownerId } : {}),
        ...(data?.clubId ? { clubId: data.clubId } : {}),
        ...(data?.startDate ? { startDate: data.startDate } : {}),
        ...(data?.endDate ? { endDate: data.endDate } : {}),
        ...(data?.search ? { search: data.search } : {}),
        ...(data?.category ? { category: data.category } : {}),
        ...(data?.bookingMode ? { bookingMode: data.bookingMode } : {}),
        limit: 1,
      };

      const requestConfig = { signal };

      const allRes = await ownerAxios.get(
        buildBookingCountUrl(baseParams),
        requestConfig
      );
      const upcomingRes = await ownerAxios.get(
        buildBookingCountUrl({ ...baseParams, status: "upcoming" }),
        requestConfig
      );
      const completedRes = await ownerAxios.get(
        buildBookingCountUrl({ ...baseParams, status: "completed" }),
        requestConfig
      );

      return {
        allCount: allRes?.data?.data?.pagination?.totalItems || 0,
        upcomingCount: upcomingRes?.data?.data?.pagination?.totalItems || 0,
        completedCount: completedRes?.data?.data?.pagination?.totalItems || 0
      };
    } catch (error) {
      if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
        return rejectWithValue({ aborted: true });
      }
      showError(error?.message);
      return rejectWithValue(error?.message);
    }
  }
);

export const getCategoryList = createAsyncThunk(
  "booking/getCategoryList",
  async (_, { rejectWithValue }) => {
    try {
      const res = await ownerAxios.get(Url.GET_CATEGORY_LIST);
      const { status, data } = res || {};
      if (status === 200) {
        return data?.data || [];
      }
      return rejectWithValue("Failed to fetch categories");
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Network error");
    }
  }
);

export const getAllClubs = createAsyncThunk(
  "booking/getAllClubs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await ownerAxios.get(Url.SUPER_ADMIN_GET_ALL_CLUBS);
      const { status, data } = res || {};
      if (status === 200) {
        return data?.data || [];
      }
      return rejectWithValue("Failed to fetch clubs");
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Network error");
    }
  }
);
