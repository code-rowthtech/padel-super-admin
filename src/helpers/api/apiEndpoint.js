//_#_#_#_#_#_#_#_#_#_#_#--USER--_#_#_#_#_#_#_#_#_#_#_#_#_#_
export const User_Login = "/api/customer/customerLogin";
export const User_Login_Number = "/api/customer/customerLoginByPhoneNumber";
export const Send_Otp = "/api/customer/sentOtp";
export const Verify_Otp = "/api/customer/verifyOtp";
export const GET_MATCH_API = "";
export const API = "";
export const GET_CLUB_API = "/api/club/getAllRegisteredCourts";
export const GET_SLOT_API = "/api/slot/getAllActiveCourts";
export const CREATE_BOOKING_API = "/api/booking/manualBookingByOwner";
export const GET_BOOKING_API = "/api/booking/getUserBookings";
export const BOOKING_STATUS_CHANGE = "/api/booking/updateBookingStatus";
export const ADD_REVIEW_CLUB = "/api/review/saveCustomerReview";
export const GET_REVIEW_CLUB = "/api/review/getownerClubReview";
export const CREATE_MATCHES = "/api/openmatch/createOpenMatch";

//_#_#_#_#_#_#_#_#_#_#_--COURT_OWNER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_
//-----------------------------------------------A_U_T_H----------------------------------------------//
export const OWNER_SIGNUP = "/api/owners/ownerSignup";
export const OWNER_LOGIN = "/api/owners/ownerLogin";
export const SEND_OTP = "/api/owners/sentOtp";
export const VERIFY_OTP = "/api/owners/verifyOtp";
export const RESET_PASSWORD = "/api/owners/forgotPassword";
export const UPDATE_OWNER = "/api/owners/updateowner";
export const GET_OWNER = "/api/owners/getowner";

//-----------------------------------------------R_E_G_I_S_T_E_R--------------------------------------//
export const REGISTER_CLUB = "/api/club/registerClub";
export const CREATE_SLOT = "/api/slot/createSlot";
export const GET_SLOT = "/api/slot/getSlot";
export const UPDATE_PRICE = "/api/slot/updateCourt";

//-----------------------------------------------M_A_N_U_A_L_-_B_O_O_K_I_N_G--------------------------//
export const GET_REGISTERED_CLUB = "/api/club/getOwnerRegisterClub";
export const UPDATE_REGISTERED_CLUB = "/api/club/updateRegisterClub";
export const GET_ACTIVE_COURTS = "/api/slot/getAllActiveCourts";
export const MANUAL_BOOKING_BY_OWNER = "/api/booking/manualBookingByOwner";

//-----------------------------------------------B_O_O_K_I_N_G----------------------------------------//
export const GET_BOOKING_BY_STATUS = "/api/booking/getAllBookingByStatus";
export const GET_BOOKING_DETAILS_BY_ID = "/api/booking/findById";
export const UPDATE_BOOKING_STATUS = "/api/booking/updateBookingStatus";

//-----------------------------------------------P_A_C_K_A_G_E_S--------------------------------------//
export const CREATE_PACKAGE = "/api/package/createPackage";
export const GET_ALL_PACKAGES = "/api/package/getAllPackages";
export const UPDATE_PACKAGE = "/api/package/editPackage";
export const DELETE_PACKAGE = "/api/package/deletePackage";

//-----------------------------------------------D_A_S_H_B_O_A_R_D-----------------------------------//
export const GET_COUNT_DASHBOARD = "/api/booking/dashboardData";
export const GET_CANCELLATION_BOOKING_DASHBOARD =
  "/api/booking/dashboardCancellationBooking";
export const GET_RECENT_BOOKING_DASHBOARD =
  "/api/booking/dashboardShowCurrentBooking";

//-----------------------------------------------R_E_V_I_E_W_S-----------------------------------//
export const GET_REVIEWS_FOR_OWNER = "/api/review/getownerClubReview";
