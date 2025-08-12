import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { create, getApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const getAllPackages = createAsyncThunk(
  "packages/getAllPackages",
  async (params, { rejectWithValue }) => {
    try {
      const res = await getApi(
        `${Url.GET_ALL_PACKAGES}?search=${params?.search}`
      );
      const { status, data, message } = res?.data || {};
      if (status === 200 || "200") {
        return data;
      }
      const errorMessage = message || "error fetching packages";
      showError(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      showError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createPackage = createAsyncThunk(
  "club/createPackage",
  async (data, { rejectWithValue }) => {
    try {
      const res = await create(Url.CREATE_PACKAGE, data);
      if (res?.status === 200) {
        showSuccess(res?.data?.message);
        return res?.data;
      } else {
        showError(res?.data?.message || "Failed to create package");
        return rejectWithValue(
          res?.data?.message || "Failed to create package"
        );
      }
    } catch (error) {
      showError(error);
      return rejectWithValue(error?.response?.data?.message || "Network error");
    }
  }
);
