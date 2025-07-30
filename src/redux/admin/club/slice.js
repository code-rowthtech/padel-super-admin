import { createSlice } from "@reduxjs/toolkit";
import { createSlot, registerClub } from "./thunk";


const initialState = {
    clubData: null,
    clubLoading: false,
    clubError: null,
};


const clubSlice = createSlice({
    name: "club",
    initialState,
    reducers: {
        resetClub: (state) => {
            state.clubData = null;
            state.clubLoading = false;
            state.clubError = null;
        },
    },
    extraReducers: (builder) => {
        // -----------------------------------------------------//---- Register Club
        builder.addCase(registerClub.pending, (state) => {
            state.clubLoading = true;
            state.clubError = null;
        });
        builder.addCase(registerClub.fulfilled, (state, action) => {
            state.clubLoading = false;
            state.clubData = action.payload;
        });
        builder.addCase(registerClub.rejected, (state, action) => {
            state.clubLoading = false;
            state.clubError = action.payload;
        });
        // -----------------------------------------------------//---- Create Slot
        builder.addCase(createSlot.pending, (state) => {
            state.clubLoading = true;
            state.clubError = null;
        });
        builder.addCase(createSlot.fulfilled, (state, action) => {
            state.clubLoading = false;
            state.clubData = action.payload;
        });
        builder.addCase(createSlot.rejected, (state, action) => {
            state.clubLoading = false;
            state.clubError = action.payload;
        });

        //  -----------------------------------------------------//---- 

        //  -----------------------------------------------------//---- 
    },
});
export const { resetClub } = clubSlice.actions;
export default clubSlice.reducer;
