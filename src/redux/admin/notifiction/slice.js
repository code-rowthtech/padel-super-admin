import { createSlice } from "@reduxjs/toolkit";
import { getLogo, createLogo, updateLogo, getNotificationCount, getNotificationData } from "./thunk";

const initialState = {
  getCount: null,
  getNotificationData: null,
  getCountLoading: false,
  getCountError: null,
};

const NotificationSlice = createSlice({
  name: "Notification",
  initialState,
  reducers: {
    resetCount: (state) => {
      state.getCount = null;
      state.getCountLoading = false;
      state.getNotificationData = null;
      state.getCountError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -------------------------G-E-T--NOTIFICATION----------------------//
      .addCase(getNotificationCount.pending, (state) => {
        state.getCountLoading = true;
        state.getCountError = null;
      })
      .addCase(getNotificationCount.fulfilled, (state, action) => {
        state.getCountLoading = false;
        state.getCount = action.payload;
      })
      .addCase(getNotificationCount.rejected, (state, action) => {
        state.getCountLoading = false;
        state.getCountError = action.payload;
      })

      .addCase(getNotificationData.pending, (state) => {
        state.getCountLoading = true;
        state.getCountError = null;
      })
      .addCase(getNotificationData.fulfilled, (state, action) => {
        state.getCountLoading = false;
        state.getNotificationData = action.payload;
      })
      .addCase(getNotificationData.rejected, (state, action) => {
        state.getCountLoading = false;
        state.getCountError = action.payload;
      })

  },
});

export default NotificationSlice.reducer;
