import React, { Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { getOwnerFromSession } from "../helpers/api/apiCore";
import DefaultLayout from "../helpers/layout/DefaultLayout";
import Root from "./Root";
import PrivateRoute from "./PrivateRoute";
import { Loading } from "../helpers/loading/Loaders";
import NoInternet from "../helpers/network/NoInternet";
import AdminLayout from "../helpers/layout/AdminLayout";



const Home = React.lazy(() => import("../pages/user/home/Home"));
const Booking = React.lazy(() => import("../pages/user/booking/Booking"));
const OpenMatches = React.lazy(() =>
  import("../pages/user/openMatches/Openmatches")
);

const CreateMatches = React.lazy(() =>
  import("../pages/user/openMatches/CreateMatches")
);
const ViewMatch = React.lazy(() => import("../pages/user/VeiwMatch/VeiwMatch"));
const OpenmatchPayment = React.lazy(() =>
  import("../pages/user/VeiwMatch/OpenmatchPayment")
);
const AmericanoUser = React.lazy(() =>
  import("../pages/user/americano/Americano")
);
const UserProfile = React.lazy(() => import("../pages/user/profile/Profile"));
const PaymentWrapper = React.lazy(() => import("../components/PaymentWrapper"));
const BookingHistory = React.lazy(() =>
  import("../pages/user/booking/BookingHistory")
);

const HelpSupport = React.lazy(() =>
  import("../pages/user/helpAndSupport/PadelSupportPage")
);
const Login = React.lazy(() => import("../pages/user/auth/LoginPage"));

const VerifyOtpUser = React.lazy(() => import("../pages/user/auth/VerifyOtp"));

const AdminLogin = React.lazy(() => import("../pages/admin/auth/Login"));
const ResetPassword = React.lazy(() =>
  import("../pages/admin/auth/ResetPassword")
);
const SignUpPage = React.lazy(() => import("../pages/admin/auth/SignUpPage"));
const VerifyOtp = React.lazy(() => import("../pages/admin/auth/VerifyOtp"));
const ForgotPassword = React.lazy(() =>
  import("../pages/admin/auth/ForgotPassword")
);

const AdminDashboard = React.lazy(() =>
  import("../pages/admin/dashboard/Dashboard")
);
const BookingPage = React.lazy(() => import("../pages/admin/booking/Booking"));
const ManualBooking = React.lazy(() =>
  import("../pages/admin/booking/manual booking/ManualBooking")
);
const Cancellation = React.lazy(() =>
  import("../pages/admin/booking/cancellation/Cancellation")
);
const OpenMatchesPage = React.lazy(() =>
  import("../pages/admin/open-matches/OpenMatches")
);
const Register = React.lazy(() =>
  import("../pages/admin/registerClub/Register")
);
const RegisterClub = React.lazy(() =>
  import("../pages/admin/registerClub/RegisterClub")
);
const MatchDetails = React.lazy(() =>
  import("../pages/admin/open-matches/matchDetails/MatchDetails")
);
const Profile = React.lazy(() => import("../pages/admin/profile/Profile"));
const CusromerReviews = React.lazy(() =>
  import("../pages/admin/reviews/CustomerReviews")
);
const Payments = React.lazy(() => import("../pages/admin/payments/Payments"));
const Packages = React.lazy(() => import("../pages/admin/packages/Packages"));
const PackageDetails = React.lazy(() =>
  import("../pages/admin/packages/PackageDetails")
);
const MyClub = React.lazy(() => import("../pages/admin/myClub/ClubUpdateForm"));
const Americano = React.lazy(() =>
  import("../pages/admin/americano/Americano")
);
const SubOwner = React.lazy(() => import("../pages/admin/subOwner/SubOwner"));
const CourtAvailability = React.lazy(() =>
  import("../pages/admin/court/CourtAvailability")
);
const CreateMatch = React.lazy(() =>
  import("../pages/admin/open-matches/create/CreateMatch")
);
const Privacy = React.lazy(() => import("../pages/admin/privacy/Privacy"));
const PrivacyPolicy = React.lazy(() => import("../pages/user/legalpages/PrivacyPolicy"));
const ManageCookies = React.lazy(() => import("../pages/user/legalpages/ManageCookies"));
const Sitemap = React.lazy(() => import("../pages/user/legalpages/Sitemap"));
const Sameprivacy = React.lazy(() =>
  import("../pages/admin/privacy/Sameprivacy")
);

const Support = React.lazy(() =>
  import("../pages/admin/helpAndSupport/Support")
);

const UnAuthorized = React.lazy(() => import("../pages/error/UnAuthorized"));
const NotFound = React.lazy(() => import("../pages/error/NotFound"));
const loading = <Loading color={"#3dbe64ff"} />;
const LoadComponent = (Component) => (
  <Suspense fallback={loading}>
    <Component />
  </Suspense>
);

const AllRoutes = () => {
  const skipRegister = getOwnerFromSession()?.hasCourt;

  return useRoutes([
    { path: "/", element: <Root /> },
    { path: "/admin", element: <Navigate to="/admin/login" replace /> },


    {
      path: "/",
      element: <DefaultLayout />,
      children: [
        {
          path: "login",
          element: LoadComponent(Login),
        },

        {
          path: "verify-otp",
          element: LoadComponent(VerifyOtpUser),
        },

        {
          path: "home",
          element: LoadComponent(Home),
        },
        {
          path: "booking",
          element: LoadComponent(Booking),
        },
        {
          path: "booking-history",
          element: LoadComponent(BookingHistory),
        },
        {
          path: "payment",
          element: LoadComponent(PaymentWrapper),
        },
        {
          path: "open-matches",
          element: LoadComponent(OpenMatches),
        },
        {
          path: "view-match",
          element: LoadComponent(ViewMatch),
        },
        {
          path: "create-matches",
          element: LoadComponent(CreateMatches),
        },

        {
          path: "match-payment",
          element: LoadComponent(OpenmatchPayment),
        },
        {
          path: "americano",
          element: LoadComponent(AmericanoUser),
        },
        {
          path: "user-profile",
          element: LoadComponent(UserProfile),
        },
        {
          path: "support",
          element: LoadComponent(HelpSupport),
        },
        {
          path: "unauthorized",
          element: LoadComponent(UnAuthorized),
        },
        {
          path: "no-internet",
          element: LoadComponent(NoInternet),
        },
        {
          path: "*",
          element: <Navigate to="/not-found" replace />,
        },
        {
          path: "privacy-policy",
          element: LoadComponent(PrivacyPolicy),
        },
        {
          path: "sitemap",
          element: LoadComponent(Sitemap),
        },
        {
          path: "manage-cookies",
          element: LoadComponent(ManageCookies),
        },
        {
          path: "not-found",
          element: LoadComponent(NotFound),
        },
      ],
    },


    {
      path: "/admin",
      element: <DefaultLayout />,
      children: [
        {
          path: "login",
          element: LoadComponent(AdminLogin),
        },
        {
          path: "sign-up",
          element: LoadComponent(SignUpPage),
        },
        {
          path: "forgot-password",
          element: LoadComponent(ForgotPassword),
        },
        {
          path: "reset-password",
          element: LoadComponent(ResetPassword),
        },
        {
          path: "verify-otp",
          element: LoadComponent(VerifyOtp),
        },
        {
          path: "sameprivacy",
          element: LoadComponent(Sameprivacy),
        },
        {
          path: "no-internet",
          element: LoadComponent(NoInternet),
        },
        {
          element: (
            <PrivateRoute>
              <DefaultLayout />
            </PrivateRoute>
          ),
          children: [
            {
              path: "register",
              element: LoadComponent(Register),
            },
            {
              path: "register-club",
              element: LoadComponent(RegisterClub),
            },
          ],
        },
        {
          element: (
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          ),
          children: [
            {
              path: "dashboard",
              element: LoadComponent(AdminDashboard),
            },
            {
              path: "booking",
              element: LoadComponent(BookingPage),
            },
            {
              path: "manualbooking",
              element: LoadComponent(ManualBooking),
            },
            {
              path: "cancellation",
              element: LoadComponent(Cancellation),
            },
            {
              path: "open-matches",
              element: LoadComponent(OpenMatchesPage),
            },
            {
              path: "match-details/:id",
              element: LoadComponent(MatchDetails),
            },
            {
              path: "profile",
              element: LoadComponent(Profile),
            },
            {
              path: "customer-reviews",
              element: LoadComponent(CusromerReviews),
            },
            {
              path: "payments",
              element: LoadComponent(Payments),
            },
            {
              path: "packages",
              element: LoadComponent(Packages),
            },
            {
              path: "package-details",
              element: LoadComponent(PackageDetails),
            },
            {
              path: "my-club",
              element: LoadComponent(MyClub),
            },
            {
              path: "americano",
              element: LoadComponent(Americano),
            },
            {
              path: "users",
              element: LoadComponent(SubOwner),
            },
            {
              path: "court-availability",
              element: LoadComponent(CourtAvailability),
            },
            {
              path: "create-match",
              element: LoadComponent(CreateMatch),
            },
            {
              path: "privacy",
              element: LoadComponent(Privacy),
            },
            {
              path: "help-support",
              element: LoadComponent(Support),
            },
          ],
        },
      ],
    },
  ]);
};

export { AllRoutes };
