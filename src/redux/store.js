import { configureStore } from '@reduxjs/toolkit';
//_#_#_#_#_#_#_#_#_#_#_--COURT_OWNER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_
import ownerAuthReducer from './admin/auth/authSlice'
import clubReducer from './admin/club/slice';

//_#_#_#_#_#_#_#_#_#_#_--USER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_
import userClubReducer from './user/club/slice'
const store = configureStore({
    reducer: {
        //_#_#_#_#_#_#_#_#_#_#_--COURT_OWNER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_

        ownerAuth: ownerAuthReducer,
        club: clubReducer,


        //_#_#_#_#_#_#_#_#_#_#_--USER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_
        userClub: userClubReducer,

    },
});

export default store;
