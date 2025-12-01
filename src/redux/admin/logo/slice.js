import { createSlice } from "@reduxjs/toolkit";
import { getLogo, createLogo, updateLogo } from "./thunk";

const initialState = {
  getLogoData: null,
  getLogoLoading: false,
  getLogoError: null,
  logoData: null,
};

const LogoSlice = createSlice({
  name: "Logo",
  initialState,
  reducers: {
    resetLogoData: (state) => {
      state.getLogoData = null;
      state.logoData = null;
      state.getLogoLoading = false;
      state.getLogoError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getLogo.pending, (state) => {
      state.getLogoLoading = true;
      state.getLogoData = null;
      state.getLogoError = null;
    });
    builder.addCase(getLogo.fulfilled, (state, action) => {
      state.getLogoLoading = false;
      state.getLogoData = action.payload;
      state.getLogoError = null;
    });
    builder.addCase(getLogo.rejected, (state, action) => {
      state.getLogoLoading = false;
      state.getLogoData = null;
      state.getLogoError = action.payload;
    });
    builder.addCase(createLogo.pending, (state) => {
      state.getLogoLoading = true;
      state.logoData = null;
      state.getLogoError = null;
    });
    builder.addCase(createLogo.fulfilled, (state, action) => {
      state.getLogoLoading = false;
      state.logoData = action.payload;
      state.getLogoError = null;
    });
    builder.addCase(createLogo.rejected, (state, action) => {
      state.getLogoLoading = false;
      state.logoData = null;
      state.getLogoError = action.payload;
    });
    builder.addCase(updateLogo.pending, (state) => {
      state.getLogoLoading = true;
      state.logoData = null;
      state.getLogoError = null;
    });
    builder.addCase(updateLogo.fulfilled, (state, action) => {
      state.getLogoLoading = false;
      state.logoData = action.payload;
      state.getLogoError = null;
    });
    builder.addCase(updateLogo.rejected, (state, action) => {
      state.getLogoLoading = false;
      state.logoData = null;
      state.getLogoError = action.payload;
    });
  },
});

export const { resetLogoData } = LogoSlice.actions;
export default LogoSlice.reducer;
