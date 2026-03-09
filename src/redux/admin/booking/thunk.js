import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

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

        // ✅ SUPER ADMIN: Map status to bookingStatus
        if (params?.status) {
          if (params.status === "upcoming") {
            query.append("bookingStatus", "upcoming");
          } else if (params.status === "completed") {
            query.append("bookingStatus", "completed");
          } else {
            query.append("bookingStatus", params.status);
          }
        }
        if (params?.ownerId) query.append("ownerId", params?.ownerId);
        if (params?.clubId) query.append("clubId", params?.clubId);
        if (params?.paymentStatus) query.append("paymentStatus", params?.paymentStatus);
        if (params.startDate) query.append("startDate", params.startDate);
        if (params.endDate) query.append("endDate", params.endDate);
        if (params.page) query.append("page", params.page);
        if (params.limit) query.append("limit", params.limit);

        return query.toString();
      };
      
      // ✅ SUPER ADMIN: Use Super Admin booking API
      const res = await ownerApi.get(
        `${Url.SUPER_ADMIN_GET_ALL_BOOKINGS}?${buildQuery(params)}`
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
      const res = await ownerApi.get(
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
      const res = await ownerApi.put(Url.UPDATE_BOOKING_STATUS, data);
      return res?.data;
    } catch (error) {
      showError(error?.message);
    }
  }
);

export const bookingCount = createAsyncThunk(
  "manualBooking/bookingCount",
  async (data, { rejectWithValue }) => {
    try {
      // ✅ SUPER ADMIN: Use Super Admin booking API to get counts
      const buildUrl = (params = {}) => {
        const query = new URLSearchParams(params);
        const queryString = query.toString();
        return queryString
          ? `${Url.SUPER_ADMIN_GET_ALL_BOOKINGS}?${queryString}`
          : Url.SUPER_ADMIN_GET_ALL_BOOKINGS;
      };
      const baseParams = {
        ...(data?.ownerId ? { ownerId: data.ownerId } : {}),
        ...(data?.startDate ? { startDate: data.startDate } : {}),
        ...(data?.endDate ? { endDate: data.endDate } : {}),
      };

      const allRes = await ownerApi.get(
        buildUrl({ ...baseParams, limit: 1 })
      );
      const upcomingRes = await ownerApi.get(
        buildUrl({ ...baseParams, bookingStatus: "upcoming", limit: 1 })
      );
      const completedRes = await ownerApi.get(
        buildUrl({ ...baseParams, bookingStatus: "completed", limit: 1 })
      );

      return {
        allCount: allRes?.data?.data?.pagination?.totalItems || 0,
        upcomingCount: upcomingRes?.data?.data?.pagination?.totalItems || 0,
        completedCount: completedRes?.data?.data?.pagination?.totalItems || 0
      };
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error?.message);
    }
  }
);
