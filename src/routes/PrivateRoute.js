import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../helpers/api/apiCore";

/**
 * PrivateRoute ensures only authenticated users can access a route.
 */
const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    // Check if it's an admin route
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // For normal users
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
