import { configureStore } from "@reduxjs/toolkit";
//_#_#_#_#_#_#_#_#_#_#_--COURT_OWNER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_
import ownerAuthReducer from "./admin/auth/slice";
import clubReducer from "./admin/club/slice";
import manualBookingReducer from "./admin/manualBooking/slice";
import bookingReducer from "./admin/booking/slice";
import packageReducer from "./admin/packages/slice";
import dashboardReducer from "./admin/dashboard/slice";
import reviewReducer from "./admin/reviews/slice";
import subOwnerReducer from "./admin/subOwner/slice";
import logoReducer from "./admin/logo/slice";
//_#_#_#_#_#_#_#_#_#_#_--USER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_
import userClubReducer from "./user/club/slice";
import userSlotReducer from "./user/slot/slice";
import userBookingReducer from "./user/booking/slice";
import userAuthReducer from "./user/auth/authSlice";
import userMatchesReducer from "./user/matches/slice";
import { review } from "../assets/files";
import { use } from "react";

const store = configureStore({
  reducer: {
    //_#_#_#_#_#_#_#_#_#_#_--COURT_OWNER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_

    ownerAuth: ownerAuthReducer,
    club: clubReducer,
    manualBooking: manualBookingReducer,
    booking: bookingReducer,
    package: packageReducer,
    dashboard: dashboardReducer,
    reviews: reviewReducer,
    subOwner: subOwnerReducer,
    logo: logoReducer,
    //_#_#_#_#_#_#_#_#_#_#_--USER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_
    userAuth: userAuthReducer,
    userClub: userClubReducer,
    userSlot: userSlotReducer,
    userBooking: userBookingReducer,
    userMatches: userMatchesReducer,
  },
});

export default store;
