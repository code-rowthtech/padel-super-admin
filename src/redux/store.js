import { configureStore } from '@reduxjs/toolkit';

import matchReducer from './match/matchSlice';
const store = configureStore({
    reducer: {
        yourState: matchReducer,
    },
});

export default store;
