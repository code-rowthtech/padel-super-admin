import { Outlet, useLocation } from "react-router-dom";
import { useMemo } from "react";
import Navbar from "../../pages/user/header/Navbar";

const DefaultLayout = () => {
  const location = useLocation();

  // List of user-auth routes where Navbar/Footer should be hidden
  const excludedPages = useMemo(
    () => ["login", "verify-otp", "forgot-password", "sign-up", "reset-password", "unauthorized", "no-internet","not-found"],
    []
  );

  // Get current page name from URL path
  const currentPageName = useMemo(() => {
    const path = location.pathname.substring(
      location.pathname.lastIndexOf("/") + 1
    );
    return path.toLowerCase();
  }, [location.pathname]);

  // Should hide for excluded pages or admin routes
  const shouldHideHeaderFooter = useMemo(() => {
    return (
      excludedPages.includes(currentPageName) ||
      location.pathname.toLowerCase().startsWith("/admin")
    );
  }, [currentPageName, excludedPages, location.pathname]);

  return (
    <div>
      {!shouldHideHeaderFooter ? (
        <>
          <Navbar />
          <div style={{ height: "100vh", overflowY: "auto" ,overflowX: "hidden"}}>
            <Outlet />
          </div>
        </>
      ) : (
        <div style={{ height: "100vh", overflowY: "auto" ,overflowX: "hidden"}}>
          <Outlet />
        </div>)}
    </div>
  );
};

export default DefaultLayout;
