import { createSlice } from "@reduxjs/toolkit";
import {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "./thunk";
import { update } from "../../../helpers/api/apiCore";

const initialState = {
  packageData: null,
  packageLoading: false,
  packageError: null,

  updatePackageLoading: false,
  deletePackageLoading: false,
};

const packageSlice = createSlice({
  name: "packages",
  initialState,
  reducers: {
    resetPackageData: (state) => {
      state.packageData = null;
      state.packageLoading = false;
      state.packageError = null;

      state.updatePackageLoading = false;
      state.deletePackageLoading = false;
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
      })
      // -----------------------------------------------------//---- Update Package
      .addCase(updatePackage.pending, (state) => {
        state.updatePackageLoading = true;
        state.packageError = null;
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        state.updatePackageLoading = false;
        state.packageData = action.payload;
      })
      .addCase(updatePackage.rejected, (state, action) => {
        state.updatePackageLoading = false;
        state.packageError = action.payload;
      })
      // -----------------------------------------------------//---- Delete Package
      .addCase(deletePackage.pending, (state) => {
        state.deletePackageLoading = true;
        state.packageError = null;
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.deletePackageLoading = false;
        state.packageData = action.payload;
      })
      .addCase(deletePackage.rejected, (state, action) => {
        state.deletePackageLoading = false;
        state.packageError = action.payload;
      });
  },
});

export const { resetPackageData } = packageSlice.actions;
export default packageSlice.reducer;
