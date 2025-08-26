import { createSlice } from "@reduxjs/toolkit";
import { getAllOpenMatches } from "./thunk";

const initialState = {
  openMatchesData: null,
  openMatchesLoading: false,
  openMatchesError: null,
};

const OpenMatchesSlice = createSlice({
  name: "openMatches",
  initialState,
  reducers: {
    resetMatchData: (state) => {
      state.openMatchesData = null;
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
      state.openMatchesLoading = false;
      state.openMatchesData = action.payload;
      state.openMatchesError = null;
    });
    builder.addCase(getAllOpenMatches.rejected, (state, action) => {
      state.openMatchesLoading = false;
      state.openMatchesData = null;
      state.openMatchesError = action.payload;
    });
    // -----------------------------------------------------//----
  },
});

export const { resetMatchData } = OpenMatchesSlice.actions;
export default OpenMatchesSlice.reducer;
