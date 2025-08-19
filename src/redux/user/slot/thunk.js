import { createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../../../helpers/api/apiCore";
import { showError } from "../../../helpers/Toast";
import * as Url from "../../../helpers/api/apiEndpoint";

export const getUserSlot = createAsyncThunk(
  "club/getUserSlot",
  async ({ register_club_id, day }, { rejectWithValue }) => {
    try {
      // Early validation
      if (!register_club_id || !day) {
        throw new Error("Missing required parameters: register_club_id or day");
      }

      const queryParams = new URLSearchParams({
        register_club_id,
        day,
      }).toString();

      const response = await userApi.get(`${Url.GET_SLOT_API}?${queryParams}`);

      return response?.data;
    } catch (error) {
      showError(error?.message || "Something went wrong while fetching slots");
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);
