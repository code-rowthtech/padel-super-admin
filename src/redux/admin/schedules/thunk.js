import { createAsyncThunk } from "@reduxjs/toolkit";
import { ownerAxios } from "../../../helpers/api/apiCore";
import { SUPER_ADMIN_GET_TODAY_SCHEDULES } from "../../../helpers/api/apiEndpoint";

export const getTodaySchedules = createAsyncThunk(
  "schedules/getTodaySchedules",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      const query = new URLSearchParams();
      if (params.date) query.append("date", params.date);
      if (params.categoryId) query.append("categoryId", params.categoryId);
      if (params.clubId) query.append("clubId", params.clubId);
      if (params.ownerId) query.append("ownerId", params.ownerId);

      const url = query.toString()
        ? `${SUPER_ADMIN_GET_TODAY_SCHEDULES}?${query.toString()}`
        : SUPER_ADMIN_GET_TODAY_SCHEDULES;

      const res = await ownerAxios.get(url, { signal });
      // Return full response so slice can access data, summary, total
      return res?.data || {};
    } catch (error) {
      if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
        return rejectWithValue({ aborted: true });
      }
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch schedules"
      );
    }
  }
);
