import { createSlice } from "@reduxjs/toolkit";
import { getTodaySchedules } from "./thunk";

const initialState = {
  scheduleResponse: null, // full API response: { data, summary, total, filters }
  schedulesLoading: false,
  schedulesError: null,
};

const schedulesSlice = createSlice({
  name: "schedules",
  initialState,
  reducers: {
    resetSchedules: (state) => {
      state.scheduleResponse = null;
      state.schedulesLoading = false;
      state.schedulesError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTodaySchedules.pending, (state) => {
        state.schedulesLoading = true;
        state.schedulesError = null;
      })
      .addCase(getTodaySchedules.fulfilled, (state, action) => {
        state.schedulesLoading = false;
        state.scheduleResponse = action.payload;
        state.schedulesError = null;
      })
      .addCase(getTodaySchedules.rejected, (state, action) => {
        if (action.payload?.aborted) return;
        state.schedulesLoading = false;
        state.scheduleResponse = null;
        state.schedulesError = action.payload;
      });
  },
});

export const { resetSchedules } = schedulesSlice.actions;
export default schedulesSlice.reducer;
