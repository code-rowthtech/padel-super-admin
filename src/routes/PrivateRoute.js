import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  isUserAuthenticated,
  getUserFromSession,
} from "../helpers/api/apiCore";

/**
 * PrivateRoute ensures only authenticated (and optionally authorized) users can access a route.
 *
 * @param {Object} props
 * @param {React.ComponentType} props.component - The component to render for this route
 * @param {string} [props.roles] - Optional role(s) required to access the route
 */
const PrivateRoute = ({ component: RouteComponent, roles }) => {
  const location = useLocation();
  const isAuthenticated = isUserAuthenticated();
  const user = getUserFromSession();

  if (!isAuthenticated) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Handle roles as string or array
  if (roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!user?.role || !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <RouteComponent />;
};

export default PrivateRoute;