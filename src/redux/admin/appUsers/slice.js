import { createSlice } from "@reduxjs/toolkit";
import { getAppUsers } from "./thunk";

const initialState = {
  users: null,
  loading: false,
  error: null,
};

const appUsersSlice = createSlice({
  name: "appUsers",
  initialState,
  reducers: {
    resetAppUsers: (state) => {
      state.users = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAppUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAppUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload;
      state.error = null;
    });
    builder.addCase(getAppUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { resetAppUsers } = appUsersSlice.actions;
export default appUsersSlice.reducer;
