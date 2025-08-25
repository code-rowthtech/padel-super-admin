import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const getSubOwner = createAsyncThunk(
  "users/getSubOwner",
  async (params, { rejectWithValue }) => {
    try {
      const buildQuery = (params) => {
        const query = new URLSearchParams();

        if (params?.page) query.append("page", params?.page);
        if (params?.limit) query.append("limit", params?.limit);
        if (params?.ownerId) query.append("ownerId", params?.ownerId);

        return query.toString();
      };
      const res = await ownerApi.get(
        `${Url.GET_SUBOWNER}?${buildQuery(params)}`
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
export const updateSubOwner = createAsyncThunk(
  "users/updateSubOwner",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await ownerApi.put(Url.UPDATE_SUBOWNER, payload);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        showSuccess(res.data.message);
        return data;
      }

      const errorMessage = message || res.data.message;
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      showError(error);
      return rejectWithValue(error);
    }
  }
);
