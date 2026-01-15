import { configureStore } from "@reduxjs/toolkit";
import ownerAuthReducer from "./admin/auth/slice";
import clubReducer from "./admin/club/slice";
import manualBookingReducer from "./admin/manualBooking/slice";
import bookingReducer from "./admin/booking/slice";
import packageReducer from "./admin/packages/slice";
import dashboardReducer from "./admin/dashboard/slice";
import reviewReducer from "./admin/reviews/slice";
import subOwnerReducer from "./admin/subOwner/slice";
import logoReducer from "./admin/logo/slice";
import openMatchesReducer from "./admin/openMatches/slice";
import notificationDataReducer from "./admin/notifiction/slice";
import searchUserByNumberReducer from "./admin/searchUserbynumber/slice";

const store = configureStore({
  reducer: {
    ownerAuth: ownerAuthReducer,
    club: clubReducer,
    manualBooking: manualBookingReducer,
    booking: bookingReducer,
    package: packageReducer,
    dashboard: dashboardReducer,
    reviews: reviewReducer,
    subOwner: subOwnerReducer,
    logo: logoReducer,
    openMatches: openMatchesReducer,
    notificationData: notificationDataReducer,
    searchUserByNumber: searchUserByNumberReducer,
  },
});

export default store;
