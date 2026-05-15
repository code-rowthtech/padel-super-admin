import { createSlice } from "@reduxjs/toolkit";
import { getAppUsers, getDeviceTypeCount, updateCustomerStatus, deleteCustomer } from "./thunk";

const initialState = {
  users: null,
  deviceCounts: null,
  loading: false,
  actionLoading: false,
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
      state.actionLoading = false;
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
    builder.addCase(updateCustomerStatus.pending, (state) => {
      state.actionLoading = true;
    });
    builder.addCase(updateCustomerStatus.fulfilled, (state) => {
      state.actionLoading = false;
    });
    builder.addCase(updateCustomerStatus.rejected, (state) => {
      state.actionLoading = false;
    });
    builder.addCase(deleteCustomer.pending, (state) => {
      state.actionLoading = true;
    });
    builder.addCase(deleteCustomer.fulfilled, (state) => {
      state.actionLoading = false;
    });
    builder.addCase(deleteCustomer.rejected, (state) => {
      state.actionLoading = false;
    });
  },
});

export const { resetAppUsers } = appUsersSlice.actions;
export default appUsersSlice.reducer;
