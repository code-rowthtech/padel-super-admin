import React, { Suspense } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import DefaultLayout from "../helpers/layout/DefaultLayout";
import Root from "./Root";
import PrivateRoute from "./PrivateRoute";
import AdminRouteGuard from "./AdminRouteGuard";
import { DataLoading, Loading } from "../helpers/loading/Loaders";
import NoInternet from "../helpers/network/NoInternet";
import AdminLayout from "../helpers/layout/AdminLayout";



// ✅ SUPER ADMIN ONLY - Removed all user-facing pages
const AdminLogin = React.lazy(() => import("../pages/admin/auth/Login"));
// ✅ SUPER ADMIN ONLY - Keep only essential pages
const AdminDashboard = React.lazy(() => import("../pages/admin/dashboard/Dashboard"));
const BookingPage = React.lazy(() => import("../pages/admin/booking/Booking"));
const Payments = React.lazy(() => import("../pages/admin/payments/Payments"));
const Profile = React.lazy(() => import("../pages/admin/profile/Profile"));
const OwnersManagement = React.lazy(() => import("../pages/admin/owners/OwnersManagement"));
const NotFound = React.lazy(() => import("../pages/error/NotFound"));
const loading = <DataLoading  height={900} />;
const LoadComponent = (Component) => (
  <Suspense fallback={loading}>
    <Component />
  </Suspense>
);

const AllRoutes = () => {
  return useRoutes([
    { path: "/", element: <Navigate to="/admin/login" replace /> },
    { path: "/admin", element: <Navigate to="/admin/login" replace /> },

    // ✅ SUPER ADMIN ONLY - Login route
    {
      path: "/admin",
      element: (
        <AdminRouteGuard>
          <DefaultLayout />
        </AdminRouteGuard>
      ),
      children: [
        {
          path: "login",
          element: LoadComponent(AdminLogin),
        },
        {
          path: "no-internet",
          element: LoadComponent(NoInternet),
        },
        // ✅ SUPER ADMIN ONLY - Protected routes
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
              path: "owners",
              element: LoadComponent(OwnersManagement),
            },
            {
              path: "payments",
              element: LoadComponent(Payments),
            },
            {
              path: "profile",
              element: LoadComponent(Profile),
            },
            {
              path: "*",
              element: <Navigate to="/admin/dashboard" replace />,
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: LoadComponent(NotFound),
    },
  ]);
};

export { AllRoutes };
