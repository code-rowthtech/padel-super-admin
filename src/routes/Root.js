import { Navigate } from "react-router-dom";

// ✅ SUPER ADMIN ONLY - Redirect to admin login
const Root = () => {
  return <Navigate to="/admin/login" replace />;
};

export default Root;
