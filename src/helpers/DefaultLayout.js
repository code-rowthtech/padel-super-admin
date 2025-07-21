import { Outlet, useLocation } from "react-router-dom";
import { useMemo } from "react";
import Navbar from "../pages/header/Navbar";

const DefaultLayout = () => {
  const location = useLocation();

  // List of pages where we want to hide TopBar and Footer
  const excludedPages = useMemo(
    () => ["login", "verify-otp", "forgot-password","sign-up","reset-password"],
    []
  );

  // Get current page name from URL path
  const currentPageName = useMemo(() => {
    const path = location.pathname.substring(
      location.pathname.lastIndexOf("/") + 1
    );
    return path.toLowerCase();
  }, [location.pathname]);

  // Check if current page should hide TopBar and Footer
  const shouldHideHeaderFooter = useMemo(() => {
    return excludedPages.includes(currentPageName);
  }, [currentPageName, excludedPages]);

  return (
    <div>
      {!shouldHideHeaderFooter ? (
        <>
          <Navbar />
          <div className="" style={{ height: "75vh", overflowY: "auto" }}>
            <Outlet />
          </div>
        </>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default DefaultLayout;