import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { isOwnerAuthenticated } from "../helpers/api/apiCore";

/**
 * PrivateRoute ensures only authenticated users can access a route.
 */
const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const authenticated = isOwnerAuthenticated();

  // Block URL changes for unauthenticated admin users
  useEffect(() => {
    if (!authenticated && location.pathname.startsWith("/admin")) {
      const allowedPaths = ["/admin/login", "/admin/sign-up", "/admin/forgot-password", "/admin/reset-password", "/admin/verify-otp"];
      
      if (!allowedPaths.includes(location.pathname)) {
        // Prevent URL change by navigating back to login
        navigate("/admin/login", { replace: true });
        return;
      }
    }
  }, [location.pathname, authenticated, navigate]);

  if (!authenticated) {
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
