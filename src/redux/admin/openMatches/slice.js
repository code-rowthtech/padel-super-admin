import { createSlice } from "@reduxjs/toolkit";
import { createOpenMatch, getAllOpenMatches, getMatchById, createCustomer, addPlayers } from "./thunk";

const initialState = {
  openMatchesData: null,
  getMatchDetails: null,
  openMatchesLoading: false,
  openMatchesError: null,
  createCustomerLoading: false,
  createCustomerData: null,
  createCustomerError: null,
};

const openMatchesSlice = createSlice({
  name: "openMatches",
  initialState,
  reducers: {
    resetMatchData: (state) => {
      state.openMatchesData = null;
      state.getMatchDetails = null;
      state.openMatchesLoading = false;
      state.openMatchesError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllOpenMatches.pending, (state) => {
      state.openMatchesLoading = true;
      state.openMatchesData = null;
      state.openMatchesError = null;
    });
    builder.addCase(getAllOpenMatches.fulfilled, (state, action) => {
      state.openMatchesLoading = false;
      state.openMatchesData = action.payload;
      state.openMatchesError = null;
    });
    builder.addCase(getAllOpenMatches.rejected, (state, action) => {
      state.openMatchesLoading = false;
      state.openMatchesData = null;
      state.openMatchesError = action.payload;
    });
    builder.addCase(getMatchById.pending, (state) => {
      state.openMatchesLoading = true;
      state.getMatchDetails = null;
      state.openMatchesError = null;
    });
    builder.addCase(getMatchById.fulfilled, (state, action) => {
      state.openMatchesLoading = false;
      state.getMatchDetails = action.payload;
      state.openMatchesError = null;
    });
    builder.addCase(getMatchById.rejected, (state, action) => {
      state.openMatchesLoading = false;
      state.getMatchDetails = null;
      state.openMatchesError = action.payload;
    });
    builder.addCase(createOpenMatch.pending, (state) => {
      state.openMatchesLoading = true;
      state.openMatchesData = null;
      state.openMatchesError = null;
    });
    builder.addCase(createOpenMatch.fulfilled, (state, action) => {
      state.openMatchesLoading = false;
      state.openMatchesData = action.payload;
      state.openMatchesError = null;
    });
    builder.addCase(createOpenMatch.rejected, (state, action) => {
      state.openMatchesLoading = false;
      state.openMatchesData = null;
      state.openMatchesError = action.payload;
    });
    
    builder.addCase(createCustomer.pending, (state) => {
      state.createCustomerLoading = true;
      state.createCustomerError = null;
    });
    builder.addCase(createCustomer.fulfilled, (state, action) => {
      state.createCustomerLoading = false;
      state.createCustomerData = action.payload;
    });
    builder.addCase(createCustomer.rejected, (state, action) => {
      state.createCustomerLoading = false;
      state.createCustomerError = action.payload;
    });
    
    builder.addCase(addPlayers.pending, (state) => {
      state.openMatchesLoading = true;
    });
    builder.addCase(addPlayers.fulfilled, (state, action) => {
      state.openMatchesLoading = false;
    });
    builder.addCase(addPlayers.rejected, (state, action) => {
      state.openMatchesLoading = false;
      state.openMatchesError = action.payload;
    });
  },
});

export const { resetMatchData } = openMatchesSlice.actions;
export default openMatchesSlice.reducer;
