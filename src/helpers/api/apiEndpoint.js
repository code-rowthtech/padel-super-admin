//_#_#_#_#_#_#_#_#_#_#_#--USER--_#_#_#_#_#_#_#_#_#_#_#_#_#_
export const User_Login = "/api/customer/customerLogin";
export const User_Login_Number = "/api/customer/customerLoginByPhoneNumber";
export const User_Signup = "/api/customer/customerSignupWithOutPassword";
export const Send_Otp = "/api/customer/sentOtp";
export const Verify_Otp = "/api/customer/verifyOtp";
export const GET_MATCH_API = "";
export const API = "";
export const GET_CLUB_API = "/api/club/getAllRegisteredCourts";
export const GET_SLOT_API = "/api/slot/getAllActiveCourts";
export const GET_SLOT_BOOKING_API = "/api/slot/getAllActiveCourtsForSlotWise"
export const GET_MATCHES_SLOT_API = "/api/slot/getAvailableSlot";
export const CREATE_BOOKING_API = "/api/booking/manualBookingByOwner";
export const GET_BOOKING_API = "/api/booking/getUserBookings";
export const BOOKING_STATUS_CHANGE = "/api/booking/updateBookingStatus";
export const ADD_REVIEW_CLUB = "/api/review/saveCustomerReview";
export const GET_REVIEW_CLUB = "/api/review/getownerClubReview";
export const CREATE_MATCHES = "/api/openmatch/createOpenMatch";
export const GET_OPENMATCH_USER = "/api/openmatch/getAllOpenMatches";
export const VIEW_OPENMATCH = "/api/openmatch/findByOpenMatchId";
export const ADD_PLAYERS = "/api/openmatch/addPlayerToMatch"
export const REMOVE_PLAYERS = "/api/openmatch/removePlayerFromMatch"
export const UPDATE_USER = '/api/customer/updateCustomer'
export const GET_USER = '/api/customer/getCustomer'
// notifection count api
export const GET_NOTIFICATION_USER_VIEW = "/api/userNotification/markAsRead";
export const GET_NOTIFICATION_USER_DATA = "/api/userNotification/readNotification";
export const GET_NOTIFICATION_USER_COUNT = "/api/userNotification/ureadCount";
export const READ_ALL_NOTIFICATION_USER = "/api/userNotification/markAsAllAsRead";




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
export const GET_CLUB_REGISTER = "/api/club/getRegisterClubDataById";
export const UPDATE_COURT = "/api/slot/updateCourt";

//-----------------------------------------------M_A_N_U_A_L_-_B_O_O_K_I_N_G--------------------------//
export const GET_REGISTERED_CLUB = "/api/club/getOwnerRegisterClub";
export const UPDATE_REGISTERED_CLUB = "/api/club/updateRegisterClub";
export const GET_ACTIVE_COURTS = "/api/slot/getAllActiveCourts";
export const MANUAL_BOOKING_BY_OWNER = "/api/booking/manualBookingByOwner";

//-----------------------------------------------B_O_O_K_I_N_G----------------------------------------//
export const GET_BOOKING_BY_STATUS = "/api/booking/getAllBookingByStatus";
export const GET_BOOKING_DETAILS_BY_ID = "/api/booking/findById";
export const UPDATE_BOOKING_STATUS = "/api/booking/updateBookingStatus";
export const GET_BOOKING_COUNT = "/api/booking/getBookingStatusCounts";
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
export const GET_REVENUE_DASHBOARD = "/api/booking/monthWiseBookings";
//-----------------------------------------------R_E_V_I_E_W_S-----------------------------------//
export const GET_REVIEWS_FOR_OWNER = "/api/review/getownerClubReview";

// notifection count api
export const GET_NOTIFICATION_VIEW = "/api/adminNotification/markAsRead";
export const GET_NOTIFICATION_DATA = "/api/adminNotification/readNotification";
export const GET_NOTIFICATION_COUNT = "/api/adminNotification/ureadCount";
export const READ_ALL_NOTIFICATION_ADMIN = "/api/adminNotification/markAsAllAsRead";


//-----------------------------------------------U_S_E_R_S-----------------------------------//
export const GET_SUBOWNER = "/api/owners/getusers";
export const UPDATE_SUBOWNER = "/api/owners/updatesubowner";

//-----------------------------------------------U_S_E_R_S-----------------------------------//
export const GET_LOGO = "/api/logo/getLogo";
export const CREATE_LOGO = "/api/logo/saveLogo";
export const UPDATE_LOGO = "/api/logo/updateLogo";

//-----------------------------------------------O_P_E_N_M_A_T_C_H_E_S-----------------------------------//
export const GET_OPEN_MATCHES = "/api/openmatch/getAllOpenMatches";
export const GET_OPEN_MATCH_BY_ID = "/api/openmatch/findByOpenMatchId";
export const CREATE_OPEN_MATCH = "/api/openmatch/createOpenMatch ";

// search user by phone number

export const SEARCH_USER_BY_PHONE_NUMBER = "/api/booking/getCustomerDataByPhoneNumber";
