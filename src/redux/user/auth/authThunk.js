import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from "../../../helpers/api/apiEndpoint";
import { userApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

// login user thunk

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.post(Url.User_Login, data);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error);
    }
  }
);

// login number thunk

export const loginUserNumber = createAsyncThunk(
  "auth/loginNumber",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.post(Url.User_Login_Number, data);
      return res?.data;
    } catch (error) {
      showError(error || error?.message);
      return rejectWithValue(error);
    }
  }
);

// signup user thunk

export const Usersignup = createAsyncThunk(
  "auth/Usersignup",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.post(Url.User_Signup, data);
      return res?.data;
    } catch (error) {
      showError(error || error?.message);
      return rejectWithValue(error);
    }
  }
);

// send otp thunk

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.post(Url.Send_Otp, data);
      return res?.data;
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error);
    }
  }
);

// verify otp thunk

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.post(Url.Verify_Otp, data);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// get user thunk

export const getUser = createAsyncThunk(
  "auth/getUser",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.get(Url.Verify_Otp, data);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error);
    }
  }
);

// get all user thunk

export const getAllUsers = createAsyncThunk(
  "auth/getAllUsers",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.get(Url.Verify_Otp, data);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error);
    }
  }
);

// get logo thunk

export const getLogo = createAsyncThunk(
  "auth/getLogo",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.get(`${Url.GET_LOGO}?ownerId=${data}`);
      return res?.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// update user thunk

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.put(Url.UPDATE_USER, data);
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error?.message || error);
      return rejectWithValue(error)
    }
  }
)

// get profile thunk

export const getUserProfile = createAsyncThunk(
  "auth/getUserProfile",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.get(Url.GET_USER,);
      return res?.data;
    } catch (error) {
      showError(error?.message || error);
      return rejectWithValue(error)
    }
  }
)

// get state thunk

export const getStates = createAsyncThunk(
  "auth/getStates",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userApi.get(Url.GET_STATES);
      return res?.data;
    } catch (error) {
      showError(error?.message || error);
      return rejectWithValue(error);
    }
  }
)