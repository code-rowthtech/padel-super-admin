import { createSlice } from "@reduxjs/toolkit";
import {
  getCountDataForDashboard,
  getCancelledBookingsForDashboard,
  getRecentBookingsForDashboard,
  getRevenueForDashboard,
} from "./thunk";

const initialState = {
  dashboardCounts: null,
  dashboardCancelledBookings: null,
  dashboardRecentBookings: null,
  dashboardLoading: false,
  dashboardError: null,
  dashboardRevenue: null,
  dashboardRevenueLoading: false,
  dashboardRevenueError: null,
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
      state.dashboardRevenue = null;
      state.dashboardRevenueLoading = false;  
      state.dashboardRevenueError = null;
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
      })

        // -----------------------------------------------------//---- Get revinue dashboard
      .addCase(getRevenueForDashboard.pending, (state) => {
        state.dashboardRevenueLoading = true;
        state.dashboardError = null;
      })
      .addCase(getRevenueForDashboard.fulfilled, (state, action) => {
        state.dashboardRevenueLoading = false;
        state.dashboardRevenue = action.payload;
      })
      .addCase(getRevenueForDashboard.rejected, (state, action) => {
        state.ddashboardRevenueLoading = false;
        state.ddashboardRevenueError = action.payload;
      });
  },
});

export const { resetDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
