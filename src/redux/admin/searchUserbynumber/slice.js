import { createSlice } from "@reduxjs/toolkit";
import { searchUserByNumber } from "./thunk";

const initialState = {
  getSearchData: null,
  getSearchLoading: false,
  getSearchError: null,
};

const SearchUserByNumber = createSlice({
  name: "Logo",
  initialState,
  reducers: {
    resetSearchData: (state) => {
      state.getSearchData = null;
      state.getSearchLoading = false;
      state.getSearchError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(searchUserByNumber.pending, (state) => {
      state.getSearchLoading = true;
      state.getSearchData = null;
      state.getSearchError = null;
    });
    builder.addCase(searchUserByNumber.fulfilled, (state, action) => {
      state.getSearchLoading = false;
      state.getSearchData = action.payload;
      state.getSearchError = null;
    });
    builder.addCase(searchUserByNumber.rejected, (state, action) => {
      state.getSearchLoading = false;
      state.getSearchData = null;
      state.getSearchError = action.payload;
    });
  },
});

export const { resetSearchData } = SearchUserByNumber.actions; 
export default SearchUserByNumber.reducer;
