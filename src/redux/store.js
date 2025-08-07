import { configureStore } from '@reduxjs/toolkit';
//_#_#_#_#_#_#_#_#_#_#_--COURT_OWNER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_
import ownerAuthReducer from './admin/auth/authSlice'
import clubReducer from './admin/club/slice';
import manualBookingReducer from './admin/manualBooking/slice';
import bookingReducer from './admin/booking/slice';

//_#_#_#_#_#_#_#_#_#_#_--USER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_
import userClubReducer from './user/club/slice'
import userSlotReducer from './user/slot/slice'
import userBookingReducer from './user/booking/slice'


const store = configureStore({
    reducer: {
        //_#_#_#_#_#_#_#_#_#_#_--COURT_OWNER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_

        ownerAuth: ownerAuthReducer,
        club: clubReducer,
        manualBooking: manualBookingReducer,
        booking: bookingReducer,



        //_#_#_#_#_#_#_#_#_#_#_--USER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_
        userClub: userClubReducer,
        userSlot: userSlotReducer,
        userBooking: userBookingReducer


    },
});

export default store;
