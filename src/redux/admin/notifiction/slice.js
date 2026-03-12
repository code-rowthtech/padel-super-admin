import { createSlice } from "@reduxjs/toolkit";
import { getNotificationCount, getNotificationData, getNotificationView, readAllNotification, sendBulkNotification, getAdminBulkNotifications } from "./thunk";

const initialState = {
  getCount: null,
  getNotificationData: null,
  getCountLoading: false,
  getCountError: null,
  sendBulkLoading: false,
  sendBulkError: null,
  bulkNotifications: [],
  bulkNotificationsLoading: false,
  bulkNotificationsError: null,
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

      .addCase(sendBulkNotification.pending, (state) => {
        state.sendBulkLoading = true;
        state.sendBulkError = null;
      })
      .addCase(sendBulkNotification.fulfilled, (state) => {
        state.sendBulkLoading = false;
      })
      .addCase(sendBulkNotification.rejected, (state, action) => {
        state.sendBulkLoading = false;
        state.sendBulkError = action.payload;
      })

      .addCase(getAdminBulkNotifications.pending, (state) => {
        state.bulkNotificationsLoading = true;
        state.bulkNotificationsError = null;
      })
      .addCase(getAdminBulkNotifications.fulfilled, (state, action) => {
        state.bulkNotificationsLoading = false;
        state.bulkNotifications = action.payload;
      })
      .addCase(getAdminBulkNotifications.rejected, (state, action) => {
        state.bulkNotificationsLoading = false;
        state.bulkNotificationsError = action.payload;
      })

  },
});

export default NotificationSlice.reducer;
