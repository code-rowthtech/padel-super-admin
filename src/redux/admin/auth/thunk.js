import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { ownerApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const loginOwner = createAsyncThunk(
  "auth/loginOwner",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(Url.OWNER_LOGIN, data);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error);
      return rejectWithValue(error);
    }
  }
);

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(Url.SEND_OTP, data);

      if (res?.data?.status === "200") {
        showSuccess(res?.data?.message);
        return res?.data;
      } else {
        // showError(res?.data?.message || "Failed to send OTP");
        return rejectWithValue(res?.data?.message || "Failed to send OTP");
      }
    } catch (error) {
      showError(error);
      return rejectWithValue(error?.response?.data?.message || "Network error");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(Url.VERIFY_OTP, data);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error);
    }
  }
);

export const signupOwner = createAsyncThunk(
  "auth/signupOwner",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.post(Url.OWNER_SIGNUP, data);
      localStorage.setItem("owner_signup_id", res?.data?.response?._id);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error);
      return rejectWithValue(error);
    }
  }
);

export const updateOwner = createAsyncThunk(
  "auth/updateOwner",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.put(Url.UPDATE_OWNER, data);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error);
    }
  }
);

export const getOwner = createAsyncThunk(
  "auth/getOwner",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.get(Url.GET_OWNER, data);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error);
    }
  }
);
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const res = await ownerApi.put(Url.RESET_PASSWORD, data);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error);
    }
  }
);
