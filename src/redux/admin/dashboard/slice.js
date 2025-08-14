import { createSlice } from "@reduxjs/toolkit";
import {
  getCountDataForDashboard,
  getCancelledBookingsForDashboard,
  getRecentBookingsForDashboard,
} from "./thunk";

const initialState = {
  dashboardCounts: null,
  dashboardCancelledBookings: null,
  dashboardRecentBookings: null,
  dashboardLoading: false,
  dashboardError: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    resetDashboardData: (state) => {
      state.dashboardCounts = null;
      state.dashboardLoading = false;
      state.dashboardError = null;
      state.dashboardCancelledBookings = null;
      state.dashboardRecentBookings = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -----------------------------------------------------//---- Get All Counts
      .addCase(getCountDataForDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(getCountDataForDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardCounts = action.payload;
      })
      .addCase(getCountDataForDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload;
      })
      // -----------------------------------------------------//---- Get cancelled bookings
      .addCase(getCancelledBookingsForDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(getCancelledBookingsForDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardCancelledBookings = action.payload;
      })
      .addCase(getCancelledBookingsForDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload;
      })
      // -----------------------------------------------------//---- Get recent bookings
      .addCase(getRecentBookingsForDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(getRecentBookingsForDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardRecentBookings = action.payload;
      })
      .addCase(getRecentBookingsForDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload;
      });
  },
});

export const { resetDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
