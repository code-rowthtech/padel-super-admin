import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const getLogo = createAsyncThunk(
  "logo/getLogo",
  async (params, { rejectWithValue }) => {
    try {
      const buildQuery = (params) => {
        const query = new URLSearchParams();

        if (params?.ownerId) query.append("ownerId", params?.ownerId);

        return query.toString();
      };
      const res = await ownerApi.get(`${Url.GET_LOGO}?${buildQuery(params)}`);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message;
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      return rejectWithValue(errorMessage);
    }
  }
);
export const createLogo = createAsyncThunk(
  "logo/createLogo",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(Url.CREATE_LOGO, payload);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message;
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      return rejectWithValue(errorMessage);
    }
  }
);
export const updateLogo = createAsyncThunk(
  "logo/updateLogo",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await ownerApi.put(Url.UPDATE_LOGO, payload);
      const { status, data, message } = res || {};
      if (status === 200 || "200") {
        return data;
      }

      const errorMessage = message;
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      return rejectWithValue(errorMessage);
    }
  }
);
