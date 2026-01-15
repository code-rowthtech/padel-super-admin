import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isOwnerAuthenticated } from "../helpers/api/apiCore";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const authenticated = isOwnerAuthenticated();

  if (!authenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
