import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from '../../../helpers/api/apiEndpoint';
import { apiPatch, create, getApi } from "../../../helpers/api/apiCore";
import { showError, showSuccess } from "../../../helpers/Toast";

export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (data, { rejectWithValue }) => {
    try {
      const res = await create(`${Url.CREATE_BOOKING_API}`, data); 
      showSuccess(res?.data?.message);
      return res?.data;
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error);
    }
  }
);

export const getBooking = createAsyncThunk(
  "booking/getBooking",
  async (data, { rejectWithValue }) => {
    try {
      const res = await getApi(`${Url.GET_BOOKING_API}`, data); 
      return res?.data;
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error);
    }
  }
);

