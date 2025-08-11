import { createSlice } from "@reduxjs/toolkit";
import {
  createSlot,
  getSlots,
  registerClub,
  updatePrice,
  updateRegisteredClub,
} from "./thunk";

const initialState = {
  clubData: null,
  clubLoading: false,
  clubError: null,

  updateClubData: null,
  updateClubLoading: false,
  updateClubError: null,
};

const clubSlice = createSlice({
  name: "club",
  initialState,
  reducers: {
    resetClub: (state) => {
      state.clubData = null;
      state.clubLoading = false;
      state.clubError = null;

      state.updateClubData = null;
      state.updateClubLoading = false;
      state.updateClubError = null;
    },
  },
  extraReducers: (builder) => {
    // -----------------------------------------------------//---- Register Club
    builder.addCase(registerClub.pending, (state) => {
      state.clubLoading = true;
      state.clubError = null;
    });
    builder.addCase(registerClub.fulfilled, (state, action) => {
      console.log(state, "action");
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

    //  -----------------------------------------------------//---- Get Slots
    builder.addCase(getSlots.pending, (state) => {
      state.clubLoading = true;
      state.clubError = null;
    });
    builder.addCase(getSlots.fulfilled, (state, action) => {
      state.clubLoading = false;
      state.clubData = action.payload;
    });
    builder.addCase(getSlots.rejected, (state, action) => {
      state.clubLoading = false;
      state.clubError = action.payload;
    });
    //  -----------------------------------------------------//---- update price
    builder.addCase(updatePrice.pending, (state) => {
      state.updateClubLoading = true;
      state.updateClubError = null;
    });
    builder.addCase(updatePrice.fulfilled, (state, action) => {
      state.updateClubLoading = false;
      state.updateClubData = action.payload;
    });
    builder.addCase(updatePrice.rejected, (state, action) => {
      state.updateClubLoading = false;
      state.updateClubError = action.payload;
    });
    //  -----------------------------------------------------//---- update registered club
    builder.addCase(updateRegisteredClub.pending, (state) => {
      state.updateClubLoading = true;
      state.updateClubError = null;
    });
    builder.addCase(updateRegisteredClub.fulfilled, (state, action) => {
      state.updateClubLoading = false;
      state.updateClubData = action.payload;
    });
    builder.addCase(updateRegisteredClub.rejected, (state, action) => {
      state.updateClubLoading = false;
      state.updateClubError = action.payload;
    });
    //  -----------------------------------------------------//----
  },
});
export const { resetClub } = clubSlice.actions;
export default clubSlice.reducer;
