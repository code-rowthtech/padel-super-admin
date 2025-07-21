import React, { Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import { getUserFromSession } from "../helpers/api/apiCore";
import DefaultLayout from "../helpers/DefaultLayout";
import Root from "./Root";
import PrivateRoute from "./PrivateRoute";
import { Loading } from "../helpers/loading/Loaders";
import NoInternet from "../helpers/network/NoInternet";

// Lazy imports
const Home = React.lazy(() => import('../pages/home/Home'));
const Booking = React.lazy(() => import('../pages/booking/Booking'));
const OpenMatches = React.lazy(() => import("../pages/openMatches/Openmatches"));
const ViewMatch = React.lazy(() => import('../pages/VeiwMatch/VeiwMatch'));
const Payment = React.lazy(() => import('../pages/payment/Payment'));

const Login = React.lazy(() => import('../pages/auth/LoginPage'));
const SignUpPage = React.lazy(() => import('../pages/auth/SignUpPage'));
const ForgotPassword = React.lazy(() => import('../pages/auth/ForgotPassword'));
const VerifyOtp = React.lazy(() => import('../pages/auth/VerifyOtp'));
const ResetPassword = React.lazy(() => import('../pages/auth/ResetPassword'));

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

        {
            path: "/",
            element: <DefaultLayout />,
            children: [
                {
                    path: "login",
                    element: LoadComponent(Login),
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
                    path: "verify-otp",
                    element: LoadComponent(VerifyOtp),
                },
                {
                    path: "reset-password",
                    element: LoadComponent(ResetPassword),
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
                    path: "/open-matches",
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
                    element: LoadComponent(NotFound),
                },
            ],
        },

        // Protected Routes
        {
            path: "/",
            element: <PrivateRoute role={Role} />,
            children: [
                {
                    path: "/open-matches",
                    element: LoadComponent(OpenMatches),
                },
            ],
        },
    ]);
};

export { AllRoutes };