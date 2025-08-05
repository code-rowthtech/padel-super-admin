import { createSlice } from "@reduxjs/toolkit";
import { getOwnerRegisteredClub } from "./thunk";


const initialState = {
    ownerClubData: null,
    ownerClubLoading: false,
    ownerClubError: null,
};


const manualBookingSlice = createSlice({
    name: "manualBooking",
    initialState,
    reducers: {
        resetOwnerClub: (state) => {
            state.ownerClubData = null;
            state.ownerClubLoading = false;
            state.ownerClubError = null;
        },
    },
    extraReducers: (builder) => {
        // -----------------------------------------------------//---- Get Owner Registered Club
        builder.addCase(getOwnerRegisteredClub.pending, (state) => {
            state.ownerClubLoading = true;
            state.ownerClubError = null;
        });
        builder.addCase(getOwnerRegisteredClub.fulfilled, (state, action) => {
            state.ownerClubLoading = false;
            state.ownerClubData = action.payload;
        });
        builder.addCase(getOwnerRegisteredClub.rejected, (state, action) => {
            state.ownerClubLoading = false;
            state.ownerClubError = action.payload;
        });
    },
});

export const { resetOwnerClub } = manualBookingSlice.actions;
export default manualBookingSlice.reducer;
