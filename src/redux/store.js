import { configureStore } from '@reduxjs/toolkit';
//_#_#_#_#_#_#_#_#_#_#_--COURT_OWNER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_
import ownerAuthReducer from './admin/auth/authSlice'
import clubReducer from './admin/club/slice';
import manualBookingReducer from './admin/manualBooking/slice';

//_#_#_#_#_#_#_#_#_#_#_--USER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_

const store = configureStore({
    reducer: {
        //_#_#_#_#_#_#_#_#_#_#_--COURT_OWNER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_

        ownerAuth: ownerAuthReducer,
        club: clubReducer,
        manualBooking: manualBookingReducer,


        //_#_#_#_#_#_#_#_#_#_#_--USER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_

    },
});

export default store;
