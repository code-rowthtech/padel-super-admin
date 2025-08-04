import React, { Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { getUserFromSession } from "../helpers/api/apiCore";
import DefaultLayout from "../helpers/layout/DefaultLayout";
import Root from "./Root";
import PrivateRoute from "./PrivateRoute";
import { Loading } from "../helpers/loading/Loaders";
import NoInternet from "../helpers/network/NoInternet";
import AdminLayout from "../helpers/layout/AdminLayout";

// Lazy imports

//_#_#_#_#_#_#_#_#_#_#_--USER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_

const Home = React.lazy(() => import('../pages/user/home/Home'));
const Booking = React.lazy(() => import('../pages/user/booking/Booking'));
const OpenMatches = React.lazy(() => import("../pages/user/openMatches/Openmatches"));
const CreateMatches = React.lazy(() => import('../pages/user/openMatches/CreateMatches'))
const ViewMatch = React.lazy(() => import('../pages/user/VeiwMatch/VeiwMatch'));
const Payment = React.lazy(() => import('../pages/user/payment/Payment'));

const Login = React.lazy(() => import('../pages/user/auth/LoginPage'));

const VerifyOtpUser = React.lazy(() => import('../pages/user/auth/VerifyOtp'));


//_#_#_#_#_#_#_#_#_#_#_--COURT_OWNER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_
const AdminLogin = React.lazy(() => import('../pages/admin/auth/Login'));
const ResetPassword = React.lazy(() => import('../pages/admin/auth/ResetPassword'));
const SignUpPage = React.lazy(() => import('../pages/admin/auth/SignUpPage'));
const VerifyOtp = React.lazy(() => import('../pages/admin/auth/VerifyOtp'));
const ForgotPassword = React.lazy(() => import('../pages/admin/auth/ForgotPassword'));

const AdminDashboard = React.lazy(() => import('../pages/admin/dashboard/index'));
const BookingPage = React.lazy(() => import('../pages/admin/booking/index'));
const ManualBooking = React.lazy(() => import('../pages/admin/booking/manual booking/ManualBooking'));
const OpenMatchesPage = React.lazy(() => import('../pages/admin/open-matches/index'));
const CompetitionPage = React.lazy(() => import('../pages/admin/competition/index'));
const Register = React.lazy(() => import('../pages/admin/registerClub/index'));
const RegisterClub = React.lazy(() => import('../pages/admin/registerClub/RegisterClub'));
const MatchDetails = React.lazy(() => import('../pages/admin/open-matches/matchDetails/MatchDetails'));
const Profile = React.lazy(() => import('../pages/admin/profile/Profile'));
const CusromerReviews = React.lazy(() => import('../pages/admin/reviews/CustomerReviews'));



// Errors
const UnAuthorized = React.lazy(() => import('../pages/error/UnAuthorized'));
const NotFound = React.lazy(() => import('../pages/error/NotFound'));
// const NoInternet = React.lazy(() => import('../helpers/network/NoInternet'));
const loading = <Loading color={'#3dbe64ff'} />
const LoadComponent = (Component) => (
    <Suspense fallback={loading}>
        <Component />
    </Suspense>
);

const AllRoutes = () => {
    const Role = getUserFromSession()?.role;

    return useRoutes([
        { path: "/", element: <Root /> },
        { path: "/admin", element: <Navigate to="/admin/login" replace /> },

        //_#_#_#_#_#_#_#_#_#_#_--USER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_

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
                    path: "payment",
                    element: LoadComponent(Payment),
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
                    path: "unauthorized",
                    element: LoadComponent(UnAuthorized),
                },
                {
                    path: "no-internet",
                    element: LoadComponent(NoInternet),
                },
                {
                    path: "*",
                    element: <Navigate to="/not-found" replace />
                },
                {
                    path: "not-found",
                    element: LoadComponent(NotFound),
                },
                {
                    element: <PrivateRoute />,
                    children: [

                        {
                            path: "open-matches",
                            element: LoadComponent(OpenMatches),
                        },
                        {
                            path: "create-matches",
                            element: LoadComponent(CreateMatches),
                        },
                    ],
                },
            ],
        },


        //_#_#_#_#_#_#_#_#_#_#_--COURT_OWNER--#_#_#_#_#_#_#_#_#_#_#_#_#_#_

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
                    // element: (<DefaultLayout />),
                    element: (
                        <PrivateRoute>
                            <DefaultLayout />
                        </PrivateRoute>
                    ),
                    children: [
                        // { index: true, element: <Navigate to="register" replace /> }, // redirect
                        {
                            path: "register",
                            element: LoadComponent(Register),
                        },
                        {
                            path: "register-club",
                            element: LoadComponent(RegisterClub),
                        }]
                },
                {
                    element: (
                        <PrivateRoute>
                            <AdminLayout />
                        </PrivateRoute>
                    ),
                    children: [
                        { index: true, element: <Navigate to="dashboard" replace /> },
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
                            path: "open-matches",
                            element: LoadComponent(OpenMatchesPage),
                        },
                        {
                            path: "competition",
                            element: LoadComponent(CompetitionPage),
                        },
                        {
                            path: "match-details",
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
                    ],
                },
            ],
        },

    ]);
};

export { AllRoutes };