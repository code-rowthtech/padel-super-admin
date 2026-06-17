import { createSlice } from "@reduxjs/toolkit";
import { createOpenMatch, createOpenMatchAdmin, getAdminRequest, getAdminRequestUpdate, getAllOpenMatches, getMatchById, getMatchByIdAdmin } from "./thunk";

const initialState = {
  openMatchesData: null,
  getMatchDetails: null,
  openMatchesLoading: false,
  openMatchesError: null,
  getMatchRequest: null,
  getMatchRequestLoading: false,
  getMatchRequestError: null,
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
      state.getMatchRequest = null;
      state.getMatchRequestLoading = false;
      state.getMatchRequestError = null;
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
    builder.addCase(getMatchByIdAdmin.pending, (state) => {
      state.openMatchesLoading = true;
      state.getMatchDetails = null;
      state.openMatchesError = null;
    });
    builder.addCase(getMatchByIdAdmin.fulfilled, (state, action) => {
      state.openMatchesLoading = false;
      state.getMatchDetails = action.payload;
      state.openMatchesError = null;
    });
    builder.addCase(getMatchByIdAdmin.rejected, (state, action) => {
      state.openMatchesLoading = false;
      state.getMatchDetails = null;
      state.openMatchesError = action.payload;
    });

    builder.addCase(getAdminRequest.pending, (state) => {
      state.getMatchRequestLoading = true;
      state.getMatchRequest = null;
      state.getMatchRequestError = null;
    });
    builder.addCase(getAdminRequest.fulfilled, (state, action) => {
      state.getMatchRequestLoading = false;
      state.getMatchRequest = action.payload;
      state.getMatchRequestError = null;
    });
    builder.addCase(getAdminRequest.rejected, (state, action) => {
      state.getMatchRequestLoading = false;
      state.getMatchRequest = null;
      state.getMatchRequestError = action.payload;
    });
     builder.addCase(getAdminRequestUpdate.pending, (state) => {
      state.getMatchRequestLoading = true;
      state.getMatchRequest = null;
      state.getMatchRequestError = null;
    });
    builder.addCase(getAdminRequestUpdate.fulfilled, (state, action) => {
      state.getMatchRequestLoading = false;
      state.getMatchRequest = action.payload;
      state.getMatchRequestError = null;
    });
    builder.addCase(getAdminRequestUpdate.rejected, (state, action) => {
      state.getMatchRequestLoading = false;
      state.getMatchRequest = null;
      state.getMatchRequestError = action.payload;
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

    builder.addCase(createOpenMatchAdmin.pending, (state) => {
      state.openMatchesLoading = true;
      state.openMatchesData = null;
      state.openMatchesError = null;
    });
    builder.addCase(createOpenMatchAdmin.fulfilled, (state, action) => {
      state.openMatchesLoading = false;
      state.openMatchesData = action.payload;
      state.openMatchesError = null;
    });
    builder.addCase(createOpenMatchAdmin.rejected, (state, action) => {
      state.openMatchesLoading = false;
      state.openMatchesData = null;
      state.openMatchesError = action.payload;
    });
  },
});

export const { resetMatchData } = openMatchesSlice.actions;
export default openMatchesSlice.reducer;
