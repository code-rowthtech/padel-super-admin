import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  sendOtp,
  verifyOtp,
  getUser,
  getAllUsers,
  loginUserNumber,
  getLogo,
} from "./authThunk";
import {
  setLoggedInUser,
  getUserFromSession,
} from "../../../helpers/api/apiCore";

const initialState = {
  userAuthLoading: false,
  user: getUserFromSession(),
  otp: null,
  error: null,
  new: null,
  logo: [],
  logoLoading: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser(state) {
      state.user = null;
      state.error = null;
      setLoggedInUser(null);
      localStorage.removeItem("padel_user");
      sessionStorage.clear();
      // window.location.href = '/home';
    },
    resetAuth(state) {
      state.userAuthLoading = false;
      state.user = null;
      // state.otp = null;
      state.error = null;
    },
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
        const { response } = action.payload;
        console.log(action.payload, 'responseresponse');
        const user = { ...response.user, token: response.token };
        setLoggedInUser(user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.userAuthLoading = false;
        console.log(action.payload, 'responseresponse');
        state.error = action.payload;
      })

      // LoginNumber
      .addCase(loginUserNumber.pending, (state) => {
        state.userAuthLoading = true;
        state.error = null;
      })
      .addCase(loginUserNumber.fulfilled, (state, action) => {
        state.userAuthLoading = false;
        state.user = action.payload;
        const { response } = action.payload;
        console.log({ response }, action.payload, "auth Slice", response.token);
        const user = { ...response.user, token: response.token };
        setLoggedInUser(user);
      })
      .addCase(loginUserNumber.rejected, (state, action) => {
        state.userAuthLoading = false;
        state.error = action.payload;
      })

      //Send Otp
      .addCase(sendOtp.pending, (state) => {
        state.userAuthLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.userAuthLoading = false;
        console.log(action, action.payload, 'slice');
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
        state.error = action.payload || "OTP verification failed";
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

      // Get All Users
      .addCase(getLogo.pending, (state) => {
        state.logoLoading = true;
        state.error = null;
      })
      .addCase(getLogo.fulfilled, (state, action) => {
        state.logoLoading = false;
        state.logo = action.payload;
      })
      .addCase(getLogo.rejected, (state, action) => {
        state.logoLoading = false;
        state.error = action.payload;
      });

  },
});

export const { logoutUser, resetAuth } = authSlice.actions;
export default authSlice.reducer;
