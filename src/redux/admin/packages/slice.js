import { createSlice } from "@reduxjs/toolkit";
import { getAllPackages, createPackage } from "./thunk";

const initialState = {
  packageData: null,
  packageLoading: false,
  packageError: null,
};

const packageSlice = createSlice({
  name: "packages",
  initialState,
  reducers: {
    resetPackageData: (state) => {
      state.packageData = null;
      state.packageLoading = false;
      state.packageError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // -----------------------------------------------------//---- Get All Packages
      .addCase(getAllPackages.pending, (state) => {
        state.packageLoading = true;
        state.packageError = null;
      })
      .addCase(getAllPackages.fulfilled, (state, action) => {
        state.packageLoading = false;
        state.packageData = action.payload;
      })
      .addCase(getAllPackages.rejected, (state, action) => {
        state.packageLoading = false;
        state.packageError = action.payload;
      })
      // -----------------------------------------------------//---- Create Package
      .addCase(createPackage.pending, (state) => {
        state.packageLoading = true;
        state.packageError = null;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        state.packageLoading = false;
        state.packageData = action.payload;
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.packageLoading = false;
        state.packageError = action.payload;
      });
    // -----------------------------------------------------//---- Update Package

    // -----------------------------------------------------//---- Delete Package
  },
});

export const { resetPackageData } = packageSlice.actions;
export default packageSlice.reducer;
