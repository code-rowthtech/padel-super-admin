import { configureStore } from "@reduxjs/toolkit";
import ownerAuthReducer from "./admin/auth/slice";
import clubReducer from "./admin/club/slice";
import manualBookingReducer from "./admin/manualBooking/slice";
import bookingReducer from "./admin/booking/slice";
import dashboardReducer from "./admin/dashboard/slice";
import logoReducer from "./admin/logo/slice";
import notificationDataReducer from "./admin/notifiction/slice";
import leagueReducer from "./admin/league/slice";
import appUsersReducer from "./admin/appUsers/slice";
import versionReducer from "./admin/version/slice";
import tournamentReducer from "./admin/tournament/slice";
import schedulesReducer from "./admin/schedules/slice";
import matchRequestReducer from "./admin/matchRequest/slice";
import paymentsReducer from "./admin/payments/slice";
import transactionsReducer from "./admin/transactions/slice";
import playerPreferencesReducer from "./admin/playerPreferences/slice";
import openMatchesReducer from "./admin/openMatches/slice";
import searchUserByNumberReducer from "./admin/searchUserbynumber/slice";
import userAuthReducer from "./user/auth/authSlice";
import userNotificationDataReducer from "./user/notifiction/slice";

const store = configureStore({
  reducer: {
    ownerAuth: ownerAuthReducer,
    club: clubReducer,
    manualBooking: manualBookingReducer,
    booking: bookingReducer,
    dashboard: dashboardReducer,
    logo: logoReducer,
    notificationData: notificationDataReducer,
    league: leagueReducer,
    appUsers: appUsersReducer,
    version: versionReducer,
    tournament: tournamentReducer,
    schedules: schedulesReducer,
    matchRequest: matchRequestReducer,
    payments: paymentsReducer,
    transactions: transactionsReducer,
    playerPreferences: playerPreferencesReducer,
    openMatches: openMatchesReducer,
    searchUserByNumber: searchUserByNumberReducer,
    userAuth: userAuthReducer,
    userNotificationData: userNotificationDataReducer,
  },
});

export default store;
