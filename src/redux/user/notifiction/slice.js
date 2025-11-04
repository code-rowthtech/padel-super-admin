import { createSlice } from "@reduxjs/toolkit";
import { getLogo, createLogo, updateLogo, getNotificationCount, getNotificationData, getNotificationView, readAllNotification } from "./thunk";

const initialState = {
  getCount: null,
  getNotificationData: null,
  getCountLoading: false,
  getCountError: null,
};

const UserNotificationSlice = createSlice({
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
// -------------------------G-E-T--NOTIFICATION--D-A-T-A----------------------//
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

      // -------------------------V-I-E-W--NOTIFICATION----------------------//

      .addCase(getNotificationView.pending, (state) => {
        state.getCountLoading = true;
        state.getCountError = null;
      })
      .addCase(getNotificationView.fulfilled, (state, action) => {
        state.getCountLoading = false;
        state.getNotificationData = action.payload;
      })
      .addCase(getNotificationView.rejected, (state, action) => {
        state.getCountLoading = false;
        state.getCountError = action.payload;
      })

      // -------------------------READ---ALL----NOTIFICATION----------------------//

      .addCase(readAllNotification.pending, (state) => {
        state.getCountLoading = true;
        state.getCountError = null;
      })
      .addCase(readAllNotification.fulfilled, (state, action) => {
        state.getCountLoading = false;
        state.getNotificationData = action.payload;
      })
      .addCase(readAllNotification.rejected, (state, action) => {
        state.getCountLoading = false;
        state.getCountError = action.payload;
      })

  },
});

export default UserNotificationSlice.reducer;
