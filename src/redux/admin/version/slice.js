import { createSlice } from "@reduxjs/toolkit";
import { getVersion, updateVersion } from "./thunk";

const initialState = {
  versionData: null,
  versionLoading: false,
  versionError: null,

  updateVersionData: null,
  updateVersionLoading: false,
  updateVersionError: null,

 
};

const versionSlice = createSlice({
  name: "version",
  initialState,
  reducers: {
    resetVersion: (state) => {
      state.versionData = null;
      state.versionLoading = false;
      state.versionError = null;

      state.updateVersionData = null;
      state.updateVersionLoading = false;
      state.updateVersionError = null;

    },
  },
  extraReducers: (builder) => {
    builder.addCase(getVersion.pending, (state) => {
      state.versionLoading = true;
      state.versionError = null;
    });
    builder.addCase(getVersion.fulfilled, (state, action) => {
      state.versionLoading = false;
      state.versionData = action.payload;
    });
    builder.addCase(getVersion.rejected, (state, action) => {
      state.versionLoading = false;
      state.versionError = action.payload;
    });
    builder.addCase(updateVersion.pending, (state) => {
      state.updateVersionLoading = true;
      state.updateVersionError = null;
    });
    builder.addCase(updateVersion.fulfilled, (state, action) => {
      state.updateVersionLoading = false;
      state.updateVersionData = action.payload;
    });
    builder.addCase(updateVersion.rejected, (state, action) => {
      state.updateVersionLoading = false;
      state.updateVersionError = action.payload;
    });
 
  
  },
});

export const { resetVersion } = versionSlice.actions;
export default versionSlice.reducer;
