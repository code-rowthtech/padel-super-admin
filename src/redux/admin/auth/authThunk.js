import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Url from '../../../helpers/api/apiEndpoint';
import { create, getApi, update } from '../../../helpers/api/apiCore';
import { showError, showSuccess } from '../../../helpers/Toast';

export const loginOwner = createAsyncThunk(
    "auth/loginOwner", async (data, { rejectWithValue }) => {
        try {
            const res = await create(Url.OWNER_LOGIN, data);
            showSuccess(res?.data?.message);
            return res?.data;
        } catch (error) {
            showError(error);
            return rejectWithValue(error);
        }
    });
export const sendOtp = createAsyncThunk(
    "auth/sendOtp", async (data, { rejectWithValue }) => {
        try {
            const res = await create(Url.SEND_OTP, data);
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
            const res = await create(Url.VERIFY_OTP, data);
            showSuccess(res?.data?.message);
            return res?.data;
        } catch (error) {
            showError(error?.message);
            return rejectWithValue(error);
        }
    });

export const signupOwner = createAsyncThunk(
    "auth/signupOwner", async (data, { rejectWithValue }) => {
        try {
            const res = await create(Url.OWNER_SIGNUP, data);
            showSuccess(res?.data?.message);
            return res?.data;
        } catch (error) {
            showError(error);
            return rejectWithValue(error);
        }
    }
);

export const updateOwner = createAsyncThunk(
    "auth/updateOwner", async (data, { rejectWithValue }) => {
        try {
            const res = await update(Url.UPDATE_OWNER, data);
            showSuccess(res?.data?.message);
            return res?.data;
        } catch (error) {
            showError(error?.message);
            return rejectWithValue(error);
        }
    });

export const getOwner = createAsyncThunk(
    "auth/getOwner", async (data, { rejectWithValue }) => {
        try {
            const res = await getApi(Url.GET_OWNER, data);
            showSuccess(res?.data?.message);
            return res?.data;
        } catch (error) {
            showError(error?.message);
            return rejectWithValue(error);
        }
    });
