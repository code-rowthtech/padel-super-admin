import { createAsyncThunk } from "@reduxjs/toolkit";
import { GET_APP_USERS, GET_DEVICE_TYPE_COUNT, UPDATE_CUSTOMER, DELETE_CUSTOMER } from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const getAppUsers = createAsyncThunk(
  "appUsers/getAppUsers",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await ownerApi.get(`${GET_APP_USERS}?page=${page}&limit=${limit}`);
      if (response?.status === 200) {
        return response.data || { data: [], pagination: {} };
      }
      showError(response?.data?.message || "Failed to fetch app users");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error?.message || "Failed to fetch app users");
      return rejectWithValue(error);
    }
  }
);

export const getDeviceTypeCount = createAsyncThunk(
  "appUsers/getDeviceTypeCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerApi.get(GET_DEVICE_TYPE_COUNT);
      if (response?.status === 200) {
        return response.data || {};
      }
      showError(response?.data?.message || "Failed to fetch device counts");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error?.message || "Failed to fetch device counts");
      return rejectWithValue(error);
    }
  }
);

export const updateCustomerStatus = createAsyncThunk(
  "appUsers/updateCustomerStatus",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await ownerApi.put(`${UPDATE_CUSTOMER}/${id}`, { isActive });
      if (response?.status === 200) {
        showSuccess("User status updated successfully");
        return { id, isActive };
      }
      showError(response?.data?.message || "Failed to update user status");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error?.message || "Failed to update user status");
      return rejectWithValue(error);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "appUsers/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      const response = await ownerApi.delete(`${DELETE_CUSTOMER}/${id}`);
      if (response?.status === 200) {
        showSuccess("User deleted successfully");
        return id;
      }
      showError(response?.data?.message || "Failed to delete user");
      return rejectWithValue(response?.data?.message);
    } catch (error) {
      showError(error?.message || "Failed to delete user");
      return rejectWithValue(error);
    }
  }
);
