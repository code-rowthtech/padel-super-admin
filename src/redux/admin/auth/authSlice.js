import { createSlice } from "@reduxjs/toolkit";
import { forgotPassword, getOwner, loginOwner, sendOtp, signupOwner, updateOwner, verifyOtp, resetPassword } from "./authThunk";
import { setLoggedInUser, getUserFromSession, setAuthorization, updateUserInSession } from "../../../helpers/api/apiCore";

const initialState = {
  authLoading: false,
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
      // window.location.href = '/admin/login';
    },
    resetAuth(state) {
      state.authLoading = false;
      state.user = null;
      state.otp = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // -----------------------------------------------------//----Login 
      .addCase(loginOwner.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(loginOwner.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
        const { response } = action.payload
        setAuthorization(response?.token)
        const user = {
          ...response?.user,
          token: response.token
        }
        setLoggedInUser(user);
      })
      .addCase(loginOwner.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      // -----------------------------------------------------//----Signup 
      .addCase(signupOwner.pending, (state) => {
        state.authLoading = true
        state.error = null;
      })
      .addCase(signupOwner.fulfilled, (state, action) => {
        state.authLoading = false
        state.user = action.payload;
        setLoggedInUser(action.payload);
      })
      .addCase(signupOwner.rejected, (state, action) => {
        state.authLoading = false
        state.error = action.payload;
      })

      // -----------------------------------------------------//---- Send Otp  ---  Forgot Password
      .addCase(sendOtp.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.authLoading = false;
        state.otp = action.payload;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      // -----------------------------------------------------//---- Verify Otp
      .addCase(verifyOtp.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.authLoading = false;
        state.otp = action.payload;
        // setLoggedInUser(action.payload); 
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload?.message || "OTP verification failed";
      })

      // -----------------------------------------------------//---- Get Owner
      .addCase(getOwner.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(getOwner.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
      })
      .addCase(getOwner.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      // -----------------------------------------------------//----  Update Owner
      .addCase(updateOwner.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(updateOwner.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
        updateUserInSession(action.payload?.response)
      })
      .addCase(updateOwner.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })
      // -----------------------------------------------------//----  Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })
  },
});

export const { logout, resetAuth } = authSlice.actions;
export default authSlice.reducer;