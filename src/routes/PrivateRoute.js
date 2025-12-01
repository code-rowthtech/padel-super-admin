import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getUserFromSession, isOwnerAuthenticated } from "../helpers/api/apiCore";

/**
 * PrivateRoute ensures only authenticated users can access a route.
 */
const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const authenticated = isOwnerAuthenticated();
  const user = getUserFromSession()

  if (!authenticated) {
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
