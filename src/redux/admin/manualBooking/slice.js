import { createSlice } from "@reduxjs/toolkit";
import { getActiveCourts, getOwnerRegisteredClub, manualBookingByOwner } from "./thunk";


const initialState = {
    ownerClubData: null,
    ownerClubLoading: false,
    ownerClubError: null,

    manualBookingData: null,
    manualBookingLoading: false,
    manualBookingError: null,

    activeCourtsData: null,
    activeCourtsLoading: false,
    activeCourtsError: null,
};


const manualBookingSlice = createSlice({
    name: "manualBooking",
    initialState,
    reducers: {
        resetOwnerClub: (state) => {
            state.ownerClubData = null;
            state.ownerClubLoading = false;
            state.ownerClubError = null;

            state.manualBookingData = null;
            state.manualBookingLoading = false;
            state.manualBookingError = null;

            state.activeCourtsData = null;
            state.activeCourtsLoading = false;
            state.activeCourtsError = null;
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
        // -----------------------------------------------------//---- Manual Booking By Owner
        builder.addCase(manualBookingByOwner.pending, (state) => {
            state.manualBookingLoading = true;
            state.manualBookingError = null;
        });
        builder.addCase(manualBookingByOwner.fulfilled, (state, action) => {
            state.manualBookingLoading = false;
            state.manualBookingData = action.payload;
        });
        builder.addCase(manualBookingByOwner.rejected, (state, action) => {
            state.manualBookingLoading = false;
            state.manualBookingError = action.payload;
        });
        // -----------------------------------------------------//---- Get Active Courts
        builder.addCase(getActiveCourts.pending, (state) => {
            state.activeCourtsLoading = true;
            state.activeCourtsError = null;
        });
        builder.addCase(getActiveCourts.fulfilled, (state, action) => {
            state.activeCourtsLoading = false;
            state.activeCourtsData = action.payload;
        });
        builder.addCase(getActiveCourts.rejected, (state, action) => {
            state.activeCourtsLoading = false;
            state.activeCourtsError = action.payload;
        });

    },
});

export const { resetOwnerClub } = manualBookingSlice.actions;
export default manualBookingSlice.reducer;
