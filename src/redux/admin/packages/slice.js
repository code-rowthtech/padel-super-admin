import { createSlice } from "@reduxjs/toolkit";
import {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "./thunk";

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
