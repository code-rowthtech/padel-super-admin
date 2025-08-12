import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Url from '../../../helpers/api/apiEndpoint';
import { create, getApi, update } from '../../../helpers/api/apiCore';
import { showError, showSuccess } from '../../../helpers/Toast';

export const loginUser = createAsyncThunk(
    "auth/login", async (data, { rejectWithValue }) => {
        try {
            const res = await create(Url.User_Login, data);
            showSuccess(res?.data?.message);
            return res?.data;
        } catch (error) {
            showError(error?.message);
            return rejectWithValue(error);
        }
    });

export const loginUserNumber = createAsyncThunk(
    "auth/loginNumber", async (data, { rejectWithValue }) => {
        try {
            const res = await create(Url.User_Login_Number, data);
            showSuccess(res?.data?.message);
            return res?.data;
        } catch (error) {
            showError(error?.message);
            return rejectWithValue(error);
        }
    });
export const sendOtp = createAsyncThunk(
    "auth/sendOtp", async (data, { rejectWithValue }) => {
        try {
            const res = await create(Url.Send_Otp, data);
            showSuccess(res?.data?.message);
            return res?.data;
        } catch (error) {
            showError(error?.message);
            return rejectWithValue(error);
        }
    });
export const verifyOtp = createAsyncThunk(
    "auth/verifyOtp", async (data, { rejectWithValue }) => {
        try {
            const res = await create(Url.Verify_Otp, data);
            showSuccess(res?.data?.message);
            return res?.data;
        } catch (error) {
            showError(error?.message);
            return rejectWithValue(error);
        }
    });


export const getUser = createAsyncThunk(
    "auth/getUser", async (data, { rejectWithValue }) => {
        try {
            const res = await getApi(Url.Verify_Otp, data);
            showSuccess(res?.data?.message);
            return res?.data;
        } catch (error) {
            showError(error?.message);
            return rejectWithValue(error);
        }
    });
export const getAllUsers = createAsyncThunk(
    "auth/getAllUsers",
    async (data, { rejectWithValue }) => {
        try {
            const res = await getApi(Url.Verify_Otp, data);
            showSuccess(res?.data?.message);
            return res?.data;
        } catch (error) {
            showError(error?.message);
            return rejectWithValue(error);
        }
    });