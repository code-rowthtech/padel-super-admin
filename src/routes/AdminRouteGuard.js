import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isOwnerAuthenticated } from "../helpers/api/apiCore";

/**
 * AdminRouteGuard blocks URL changes based on authentication and current context
 */
const AdminRouteGuard = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const authenticated = isOwnerAuthenticated();

  useEffect(() => {
    const currentPath = location.pathname;
    
    if (!authenticated && currentPath.startsWith("/admin")) {
      // For unauthenticated users, only allow auth-related pages
      const allowedPaths = [
        "/admin/login",
        "/admin/sign-up", 
        "/admin/forgot-password",
        "/admin/reset-password",
        "/admin/verify-otp",
        "/admin/sameprivacy",
        "/admin/no-internet"
      ];
      
      if (!allowedPaths.includes(currentPath)) {
        navigate("/admin/login", { replace: true });
        return;
      }
    }

    if (authenticated) {
      // For authenticated users, block access to auth pages from dashboard context
      const isDashboardContext = sessionStorage.getItem('dashboardAccessed') === 'true';
      const authPages = [
        "/admin/login",
        "/admin/sign-up",
        "/admin/forgot-password",
        "/admin/reset-password",
        "/admin/verify-otp",
        "/admin/register",
        "/admin/register-club"
      ];

      // Set dashboard context when accessing dashboard
      if (currentPath === '/admin/dashboard') {
        sessionStorage.setItem('dashboardAccessed', 'true');
      }

      // Block auth pages if dashboard was accessed
      if (isDashboardContext && authPages.some(path => currentPath.includes(path))) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      // Allow auth page navigation only from login context
      const isLoginContext = currentPath === '/admin/login' || 
                            currentPath === '/admin/sign-up' || 
                            currentPath === '/admin/forgot-password';
      
      if (isLoginContext) {
        sessionStorage.removeItem('dashboardAccessed');
      }
    }
  }, [location.pathname, authenticated, navigate]);

  // Block browser back navigation for authenticated users who accessed dashboard
  useEffect(() => {
    if (!authenticated) return;
    
    const isDashboardContext = sessionStorage.getItem('dashboardAccessed') === 'true';
    if (!isDashboardContext) return;

    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, '', '/admin/dashboard');
      navigate('/admin/dashboard', { replace: true });
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [authenticated, navigate, location.pathname]);

  return children;
};

export default AdminRouteGuard;