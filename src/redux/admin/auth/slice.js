import { createSlice } from "@reduxjs/toolkit";
import {
  forgotPassword,
  getOwner,
  loginOwner,
  sendOtp,
  signupOwner,
  updateOwner,
  verifyOtp,
  resetPassword,
} from "./thunk";
import {
  setLoggedInOwner,
  getOwnerFromSession,
  updateSessionData,
} from "../../../helpers/api/apiCore";

const initialState = {
  authLoading: false,
  user: getOwnerFromSession(),
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
      setLoggedInOwner(null);
      localStorage.removeItem("padel_owner");
      sessionStorage.clear();
      window.location.href = "/admin/login";
    },
    resetAuth(state) {
      state.authLoading = false;
      state.user = null;
      state.otp = null;
      state.error = null;
    },
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
        const { response } = action.payload;
        const owner = {
          ...response.user,
          token: response.token,
          hasCourt: response.hasCourt,
        };
        setLoggedInOwner(owner);
      })
      .addCase(loginOwner.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      // -----------------------------------------------------//----Signup
      .addCase(signupOwner.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(signupOwner.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
        setLoggedInOwner(action.payload);
      })
      .addCase(signupOwner.rejected, (state, action) => {
        state.authLoading = false;
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
        // setLoggedInOwner(action.payload);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload || "OTP verification failed";
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
        updateSessionData(action.payload?.response, "owner");
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
      });
  },
});

export const { logout, resetAuth } = authSlice.actions;
export default authSlice.reducer;
