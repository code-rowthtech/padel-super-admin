import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from '../../../helpers/api/apiEndpoint';
import { getApi, create, update, remove } from "../../../helpers/api/apiCore";
import { showSuccess, showError } from "../.././../helpers/Toast";

export const registerClub = createAsyncThunk(
    "club/registerClub",
    async (data, { rejectWithValue }) => {
        try {
            const res = await create(Url.REGISTER_CLUB, data);
            if (res?.data?.status === 200) {
                showSuccess(res?.data?.message);
                return res?.data;
            } else {
                showError(res?.data?.message || 'Failed to register club');
                return rejectWithValue(res?.data?.message || 'Failed to register club');
            }
        } catch (error) {
            showError(error);
            return rejectWithValue(error?.response?.data?.message || 'Network error');
        }
    }
);

export const createSlot = createAsyncThunk(
    "club/createSlot",
    async (data, { rejectWithValue }) => {
        try {
            const res = await create(Url.CREATE_SLOT, data);
            if (res?.data?.status === 200) {
                showSuccess(res?.data?.message);
                return res?.data;
            } else {
                showError(res?.data?.message || 'Failed to create slot');
                return rejectWithValue(res?.data?.message || 'Failed to create slot');
            }
        } catch (error) {
            showError(error);
            return rejectWithValue(error?.response?.data?.message || 'Network error');
        }
    }
);