import { createSlice } from "@reduxjs/toolkit";
import { getLogo, createLogo, updateLogo, getNotificationCount, getNotificationData, getNotificationView, readAllNotification, getQuestionData, getPlayerLevel, getPlayerLevelBySkillLevel } from "./thunk";

const initialState = {
  getCount: null,
  getNotificationData: null,
  getCountLoading: false,
  getCountError: null,
  getQuestionData: null,
  getQuestionLoading: false,
  getQuestionError: null,
  getPlayerLevel: null,
  getPlayerLevelLoading: false,
  getPlayerLevelError: null,
  getPlayerLevelBySkillLevel: null,
  getPlayerLevelBySkillLevelLoading: false,
  getPlayerLevelBySkillLevelError: null
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
      state.getQuestionData = null;
      state.getQuestionLoading = false;
      state.getQuestionError = null;
      state.getPlayerLevel = null;
      state.getPlayerLevelLoading = false;
      state.getPlayerLevelError = null;
      state.getPlayerLevelBySkillLevel = null;
      state.getPlayerLevelBySkillLevelLoading = false;
      state.getPlayerLevelBySkillLevelError = null;
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


      .addCase(getQuestionData.pending, (state) => {
        state.getListLoading = true;
        state.getListError = null;
      })
      .addCase(getQuestionData.fulfilled, (state, action) => {
        state.getListLoading = false;
        state.getQuestionData = action.payload;
      })
      .addCase(getQuestionData.rejected, (state, action) => {
        state.getListLoading = false;
        state.getListError = action.payload;
      })

      .addCase(getPlayerLevel.pending, (state) => {
        state.getPlayerLevelLoading = true;
        state.getPlayerLevelError = null;
      })
      .addCase(getPlayerLevel.fulfilled, (state, action) => {
        state.getPlayerLevelLoading = false;
        state.getPlayerLevel = action.payload;
      })
      .addCase(getPlayerLevel.rejected, (state, action) => {
        state.getPlayerLevelLoading = false;
        state.getPlayerLevelError = action.payload;
      })

      .addCase(getPlayerLevelBySkillLevel.pending, (state) => {
        state.getPlayerLevelBySkillLevelLoading = true;
        state.getPlayerLevelBySkillLevelError = null;
      })
      .addCase(getPlayerLevelBySkillLevel.fulfilled, (state, action) => {
        state.getPlayerLevelBySkillLevelLoading = false;
        state.getPlayerLevelBySkillLevel = action.payload;
      })
      .addCase(getPlayerLevelBySkillLevel.rejected, (state, action) => {
        state.getPlayerLevelBySkillLevelLoading = false;
        state.getPlayerLevelBySkillLevelError = action.payload;
      })

  },
});

export default UserNotificationSlice.reducer;
