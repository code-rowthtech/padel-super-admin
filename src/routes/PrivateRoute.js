import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { isOwnerAuthenticated, getOwnerFromSession } from "../helpers/api/apiCore";
import { useSelector } from "react-redux";

/**
 * PrivateRoute ensures only authenticated users can access a route.
 */
const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const authenticated = isOwnerAuthenticated();
  const { ownerClubData } = useSelector((state) => state.manualBooking);
  const owner = getOwnerFromSession();

  // Block URL changes for unauthenticated admin users
  useEffect(() => {
    if (!authenticated && location.pathname.startsWith("/admin")) {
      const allowedPaths = ["/admin/login", "/admin/sign-up", "/admin/forgot-password", "/admin/reset-password", "/admin/verify-otp", "/admin/sameprivacy", "/admin/no-internet"];
      
      if (!allowedPaths.includes(location.pathname)) {
        navigate("/admin/login", { replace: true });
        return;
      }
    }

    // Block access to registration pages if club already exists
    if (authenticated && owner) {
      const registerId = ownerClubData?.[0]?._id || sessionStorage.getItem("registerId");
      const registrationPaths = ["/admin/register", "/admin/register-club"];
      
      if (registerId && registrationPaths.some(path => location.pathname.includes(path))) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
    }
  }, [location.pathname, authenticated, navigate, owner, ownerClubData]);

  if (!authenticated) {
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
