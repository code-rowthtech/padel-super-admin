import { createSlice } from "@reduxjs/toolkit";
import { createRequest, getRequest, updateRequest } from "./thunk";

const initialState = {
  requestData: null,
  requestLoading: false,
  requestError: null,
   requestUpdateData: null,
  requestUpdateLoading: false,
  requestUpdateError: null,
   requestCreateData: null,
  requestCreateLoading: false,
  requestCreateError: null,
};

const RequestSlice = createSlice({
  name: "Request",
  initialState,
  reducers: {
    resetRequestData: (state) => {
      state.requestData = null;
      state.requestLoading = false;
      state.requestError = null;
        state.requestUpdateData = null;
      state.requestUpdateLoading = false;
      state.requestUpdateError = null;
      state.requestCreateData = null;
      state.requestCreateLoading = false;
      state.requestCreateError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getRequest.pending, (state) => {
      state.requestLoading = true;
      state.requestData = null;
      state.getLogoError = null;
    });
    builder.addCase(getRequest.fulfilled, (state, action) => {
      state.requestLoading = false;
      state.requestData = action.payload;
      state.getLogoError = null;
    });
    builder.addCase(getRequest.rejected, (state, action) => {
      state.requestLoading = false;
      state.requestData = null;
      state.requestError = action.payload;
    });
    builder.addCase(createRequest.pending, (state) => {
      state.requestCreateLoading = true;
      state.requestCreateData = null;
      state.requestCreateError = null;
    });
    builder.addCase(createRequest.fulfilled, (state, action) => {
      state.requestCreateLoading = false;
      state.requestCreateData = action.payload;
      state.requestCreateError = null;
    });
    builder.addCase(createRequest.rejected, (state, action) => {
      state.requestCreateLoading = false;
      state.requestCreateData = null;
      state.requestCreateError = action.payload;
    });
    builder.addCase(updateRequest.pending, (state) => {
      state.requestUpdateLoading = true;
      state.requestUpdateData = null;
      state.requestUpdateError = null;
    });
    builder.addCase(updateRequest.fulfilled, (state, action) => {
      state.requestUpdateLoading = false;
      state.requestUpdateData = action.payload;
      state.requestUpdateError = null;
    });
    builder.addCase(updateRequest.rejected, (state, action) => {
      state.requestUpdateLoading = false;
      state.requestUpdateData = null;
      state.requestUpdateError = action.payload;
    });
  },
});

export const { resetRequestData } = RequestSlice.actions;
export default RequestSlice.reducer;
