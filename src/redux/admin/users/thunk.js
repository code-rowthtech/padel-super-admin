import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const getUsers = createAsyncThunk(
  "users/getUsers",
  async (params, { rejectWithValue }) => {
    try {
      const buildQuery = (params) => {
        const query = new URLSearchParams();

        if (params?.status) query.append("bookingStatus", params?.status);
        if (params?.ownerId) query.append("ownerId", params?.ownerId);

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

      const errorMessage = message;
      // showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      // showError(error);
      return rejectWithValue(errorMessage);
    }
  }
);
