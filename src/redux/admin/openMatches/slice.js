import { createSlice } from "@reduxjs/toolkit";
import { createOpenMatch, getAllOpenMatches, getMatchById } from "./thunk";

const initialState = {
  openMatchesData: null,
  getMatchDetails: null,
  openMatchesLoading: false,
  openMatchesError: null,
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
    // -----------------------------------------------------//---- Get Open Matches
    builder.addCase(getAllOpenMatches.pending, (state) => {
      state.openMatchesLoading = true;
      state.openMatchesData = null;
      state.openMatchesError = null;
    });
    builder.addCase(getAllOpenMatches.fulfilled, (state, action) => {
      console.log({action});
      state.openMatchesLoading = false;
      state.openMatchesData = action.payload;
      state.openMatchesError = null;
    });
    builder.addCase(getAllOpenMatches.rejected, (state, action) => {
      state.openMatchesLoading = false;
      state.openMatchesData = null;
      state.openMatchesError = action.payload;
    });
    // -----------------------------------------------------//---- Get Match By Id
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
    // -----------------------------------------------------//---- Create open Match
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
  },
});

export const { resetMatchData } = openMatchesSlice.actions;
export default openMatchesSlice.reducer;
