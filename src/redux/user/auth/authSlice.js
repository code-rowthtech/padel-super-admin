import { createSlice } from "@reduxjs/toolkit";
import { loginUser, signupUser, sendOtp, verifyOtp, forgotPassword, getUser, getAllUsers, updateUser } from "./authThunks";
import { setLoggedInUser, getUserFromSession, setAuthorization } from "../../helpers/api/apiCore";

const initialState = {
  userAuthLoading: false,
  user: getUserFromSession(),
  otp: null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.error = null;
      setAuthorization(null);
      setLoggedInUser(null);
      localStorage.clear();
      sessionStorage.clear();
      // window.location.href = '/home';
    },
    resetAuth(state) {
      state.userAuthLoading = false;
      state.user = null;
      state.otp = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.userAuthLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.userAuthLoading = false;
        state.user = action.payload;
        const { response } = action.payload
        setAuthorization(response?.token)
        const user = {
          ...response?.user,
          token: response.token
        }
        setLoggedInUser(user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.userAuthLoading = false;
        state.error = action.payload;
      })

      // Signup 
      .addCase(signupUser.pending, (state) => {
        state.userAuthLoading = true
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.userAuthLoading = false
        state.user = action.payload;
        setLoggedInUser(action.payload);
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.userAuthLoading = false
        state.error = action.payload;
      })

      //Send Otp
      .addCase(sendOtp.pending, (state) => {
        state.userAuthLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.userAuthLoading = false;
        state.otp = action.payload;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.userAuthLoading = false;
        state.error = action.payload;
      })

      // Verify Otp
      .addCase(verifyOtp.pending, (state) => {
        state.userAuthLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.userAuthLoading = false;
        state.otp = action.payload;
        // setLoggedInUser(action.payload); 
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.userAuthLoading = false;
        state.error = action.payload?.message || "OTP verification failed";
      })

      //Get User
      .addCase(getUser.pending, (state) => {
        state.userAuthLoading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.userAuthLoading = false;
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.userAuthLoading = false;
        state.error = action.payload;
      })

      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.userAuthLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.userAuthLoading = false;
        state.user = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.userAuthLoading = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.userAuthLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.userAuthLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.userAuthLoading = false;
        state.error = action.payload;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.userAuthLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.userAuthLoading = false;
        // If forgotPassword doesn't return a user, you might skip this line:
        // state.user = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.userAuthLoading = false;
        state.error = action.payload;
      })
  },
});

export const { logout, resetAuth } = authSlice.actions;
export default authSlice.reducer;