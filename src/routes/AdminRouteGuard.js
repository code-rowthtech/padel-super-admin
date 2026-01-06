import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isOwnerAuthenticated } from "../helpers/api/apiCore";

/**
 * AdminRouteGuard blocks URL changes for unauthenticated admin users
 * Only allows login, sign-up, forgot-password, reset-password, verify-otp
 */
const AdminRouteGuard = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const authenticated = isOwnerAuthenticated();

  useEffect(() => {
    if (!authenticated && location.pathname.startsWith("/admin")) {
      const allowedPaths = [
        "/admin/login",
        "/admin/sign-up", 
        "/admin/forgot-password",
        "/admin/reset-password",
        "/admin/verify-otp",
        "/admin/sameprivacy",
        "/admin/no-internet"
      ];
      
      if (!allowedPaths.includes(location.pathname)) {
        // Block URL change by redirecting to login
        navigate("/admin/login", { replace: true });
        return;
      }
    }
  }, [location.pathname, authenticated, navigate]);

  return children;
};

export default AdminRouteGuard;