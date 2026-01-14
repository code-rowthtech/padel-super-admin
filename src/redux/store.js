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
import userClubReducer from "./user/club/slice";
import userSlotReducer from "./user/slot/slice";
import userBookingReducer from "./user/booking/slice";
import userAuthReducer from "./user/auth/authSlice";
import userMatchesReducer from "./user/matches/slice";
import { review } from "../assets/files";
import { use } from "react";
import notificationDataReducer from "./admin/notifiction/slice";
import userNotificationDataReducer from "./user/notifiction/slice";
import searchUserByNumberReducer from "./admin/searchUserbynumber/slice";
import requestDataReducer from "./user/playerrequest/slice";
import helpDataReducer from './user/help&support/slice'
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
    userAuth: userAuthReducer,
    userClub: userClubReducer,
    userSlot: userSlotReducer,
    userBooking: userBookingReducer,
    userMatches: userMatchesReducer,
    userNotificationData: userNotificationDataReducer,
    requestData: requestDataReducer,
    helpData: helpDataReducer,


  },
});

export default store;
