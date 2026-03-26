import { createSlice } from "@reduxjs/toolkit";
import { getAppUsers, getDeviceTypeCount } from "./thunk";

const initialState = {
  users: null,
  deviceCounts: null,
  loading: false,
  error: null,
};

const appUsersSlice = createSlice({
  name: "appUsers",
  initialState,
  reducers: {
    resetAppUsers: (state) => {
      state.users = null;
      state.deviceCounts = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAppUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAppUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload;
      state.error = null;
    });
    builder.addCase(getAppUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(getDeviceTypeCount.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getDeviceTypeCount.fulfilled, (state, action) => {
      state.loading = false;
      state.deviceCounts = action.payload;
      state.error = null;
    });
    builder.addCase(getDeviceTypeCount.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { resetAppUsers } = appUsersSlice.actions;
export default appUsersSlice.reducer;
