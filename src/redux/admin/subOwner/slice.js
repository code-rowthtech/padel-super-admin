import { createSlice } from "@reduxjs/toolkit";
import { getSubOwner, updateSubOwner } from "./thunk";

const initialState = {
  getSubOwnerData: null,
  getSubOwnerLoading: false,
  getSubOwnerError: null,

  updateSubOwnerLoading: false,
  updateSubOwnerData: null,
};

const subOwnerSlice = createSlice({
  name: "subOwner",
  initialState,
  reducers: {
    resetUserData: (state) => {
      state.getSubOwnerData = null;
      state.getSubOwnerLoading = false;
      state.getSubOwnerError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSubOwner.pending, (state) => {
      state.getSubOwnerLoading = true;
      state.getSubOwnerData = null;
      state.getSubOwnerError = null;
    });
    builder.addCase(getSubOwner.fulfilled, (state, action) => {
      state.getSubOwnerLoading = false;
      state.getSubOwnerData = action.payload;
      state.getSubOwnerError = null;
    });
    builder.addCase(getSubOwner.rejected, (state, action) => {
      state.getSubOwnerLoading = false;
      state.getSubOwnerData = null;
      state.getSubOwnerError = action.payload;
    });
    builder.addCase(updateSubOwner.pending, (state) => {
      state.updateSubOwnerLoading = true;
      state.updateSubOwnerData = null;
      state.getSubOwnerError = null;
    });
    builder.addCase(updateSubOwner.fulfilled, (state, action) => {
      state.updateSubOwnerLoading = false;
      state.updateSubOwnerData = action.payload;
      state.getSubOwnerError = null;
    });
    builder.addCase(updateSubOwner.rejected, (state, action) => {
      state.updateSubOwnerLoading = false;
      state.updateSubOwnerData = null;
      state.getSubOwnerError = action.payload;
    });
  },
});

export const { resetUserData } = subOwnerSlice.actions;
export default subOwnerSlice.reducer;
