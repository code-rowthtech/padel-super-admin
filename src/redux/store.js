import { configureStore } from "@reduxjs/toolkit";
import ownerAuthReducer from "./admin/auth/slice";
import clubReducer from "./admin/club/slice";
import manualBookingReducer from "./admin/manualBooking/slice";
import bookingReducer from "./admin/booking/slice";
import dashboardReducer from "./admin/dashboard/slice";
import logoReducer from "./admin/logo/slice";
import notificationDataReducer from "./admin/notifiction/slice";

const store = configureStore({
  reducer: {
    ownerAuth: ownerAuthReducer,
    club: clubReducer,
    manualBooking: manualBookingReducer,
    booking: bookingReducer,
    dashboard: dashboardReducer,
    logo: logoReducer,
    notificationData: notificationDataReducer,
  },
});

export default store;
