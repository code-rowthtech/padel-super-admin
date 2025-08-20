import { createSlice } from "@reduxjs/toolkit";
import { getUsers } from "./thunk";

const initialState = {
  getUserData: null,
  getUserLoading: false,
  getUserError: null,
};

const UserSlice = createSlice({
  name: "User",
  initialState,
  reducers: {
    resetUserData: (state) => {
      state.getUserData = null;
      state.getUserLoading = false;
      state.getUserError = null;
    },
  },
  extraReducers: (builder) => {
    // -----------------------------------------------------//---- Get Users
    builder.addCase(getUsers.pending, (state) => {
      state.getUserLoading = true;
      state.getUserData = null;
      state.getUserError = null;
    });
    builder.addCase(getUsers.fulfilled, (state, action) => {
      state.getUserLoading = false;
      state.getUserData = action.payload;
      state.getUserError = null;
    });
    builder.addCase(getUsers.rejected, (state, action) => {
      state.getUserLoading = false;
      state.getUserData = null;
      state.getUserError = action.payload;
    });
  },
});

export const { resetUserData } = UserSlice.actions;
export default UserSlice.reducer;
