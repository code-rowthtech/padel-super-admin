import { createAsyncThunk } from "@reduxjs/toolkit";
import * as Url from '../../../helpers/api/apiEndpoint';
import { create } from "../../../helpers/api/apiCore";
import { showError } from "../../../helpers/Toast";

export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (data, { rejectWithValue }) => {
    try {
      const res = await create(`${Url.CREATE_BOOKING_API}`, data); // use data directly
      return res?.data;
    } catch (error) {
      showError(error?.message);
      return rejectWithValue(error);
    }
  }
);

