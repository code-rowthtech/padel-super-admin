import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  sendOtp,
  verifyOtp,
  getUser,
  getAllUsers,
  loginUserNumber,
  getLogo,
  Usersignup,
  updateUser,
  getUserProfile,
  getStates,
} from "./authThunk";
import {
  setLoggedInUser,
  getUserFromSession,
  updateSessionData,
} from "../../../helpers/api/apiCore";

const initialState = {
  userAuthLoading: false,
  user: getUserFromSession(),
  otp: null,
  error: null,
  new: null,
  logo: [],
  logoLoading: false,
  userSignUpLoading: false,
  userSignUp: null,
  errorSignUp: null,
  states: [],
  statesLoading: false,
  statesError: null,
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

    },
    resetAuth(state) {
      state.userAuthLoading = false;
      state.user = null;
      state.error = null;
      state.userSignUpLoading = false;
      state.userSignUp = null;
      state.errorSignUp = null;

    },
  },
  extraReducers: (builder) => {
    builder
    // login slice
      .addCase(loginUser.pending, (state) => {
        state.userAuthLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.userAuthLoading = false;
        state.user = action.payload;
        const { response } = action.payload;
        const user = { ...response.user, token: response.token };
        setLoggedInUser(user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.userAuthLoading = false;
        state.error = action.payload;
      })

      // login phone number slice
      .addCase(loginUserNumber.pending, (state) => {
        state.userAuthLoading = true;
        state.error = null;
      })
      .addCase(loginUserNumber.fulfilled, (state, action) => {
        state.userAuthLoading = false;
        state.user = action.payload;
        const { response } = action.payload;
        const user = { ...response.user, token: response.token };
        setLoggedInUser(user);
      })
      .addCase(loginUserNumber.rejected, (state, action) => {
        state.userAuthLoading = false;
        state.error = action.payload;
      })

      // user signup slice
      .addCase(Usersignup.pending, (state) => {
        state.userSignUpLoading = true;
        state.errorSignUp = null;
      })
      .addCase(Usersignup.fulfilled, (state, action) => {
        state.userSignUpLoading = false;
        state.userSignUp = action.payload;
      })
      .addCase(Usersignup.rejected, (state, action) => {
        state.userSignUpLoading = false;
        state.errorSignUp = action.payload;
      })

      // send otp slice
      .addCase(sendOtp.pending, (state) => {
        state.userAuthLoading = true;
        state.errorSignUp = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.userAuthLoading = false;
        state.otp = action.payload;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.userAuthLoading = false;
        state.error = action.payload;
      })
// verify otp slice
      .addCase(verifyOtp.pending, (state) => {
        state.userAuthLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.userAuthLoading = false;
        state.otp = action.payload;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.userAuthLoading = false;
        state.error = action.payload || "OTP verification failed";
      })

      // get user slice
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

      // get all users slice
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

      // get logo slice
      .addCase(getLogo.pending, (state) => {
        state.logoLoading = true;
        state.error = null;
      })
      .addCase(getLogo.fulfilled, (state, action) => {
        state.logoLoading = false;
        state.logo = action.payload;
        localStorage.setItem("logo", JSON.stringify(action.payload?.logo?.logo));
      })
      .addCase(getLogo.rejected, (state, action) => {
        state.logoLoading = false;
        state.error = action.payload;
      })

      // update user slice
      .addCase(updateUser.pending, (state) => {
        state.userLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.userLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.userLoading = false;
        state.error = action.payload;
      })


      // get profile slice
      .addCase(getUserProfile.pending, (state) => {
        state.userLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.userLoading = false;
        state.user = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.useroLoading = false;
        state.error = action.payload;
      })


      // get state slice
      .addCase(getStates.pending, (state) => {
        state.statesLoading = true;
        state.statesError = null;
      })
      .addCase(getStates.fulfilled, (state, action) => {
        state.statesLoading = false;
        state.states = action.payload;
      })
      .addCase(getStates.rejected, (state, action) => {
        state.statesLoading = false;
        state.statesError = action.payload;
      })

  },
});

export const { logoutUser, resetAuth } = authSlice.actions;
export default authSlice.reducer;
