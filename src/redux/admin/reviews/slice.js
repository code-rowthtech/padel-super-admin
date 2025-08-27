import { createSlice } from "@reduxjs/toolkit";
import { getReviewsForOwner } from "./thunk";

const initialState = {
  reviewsData: null,
  reviewsLoading: false,
  reviewsError: null,
};

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    resetReviewsData: (state) => {
      state.reviewsData = null;
      state.reviewsLoading = false;
      state.reviewsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -----------------------------------------------------//---- Get All Reviews
      .addCase(getReviewsForOwner.pending, (state) => {
        state.reviewsLoading = true;
        state.reviewsData = null;
        state.reviewsError = null;
      })
      .addCase(getReviewsForOwner.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviewsData = action.payload;
      })
      .addCase(getReviewsForOwner.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.reviewsError = action.payload;
      });
  },
});

export const { resetReviewsData } = reviewSlice.actions;
export default reviewSlice.reducer;
