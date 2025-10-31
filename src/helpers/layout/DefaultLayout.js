import { Outlet, useLocation } from "react-router-dom";
import { useMemo } from "react";
import Navbar from "../../pages/user/header/Navbar";
import Footer from "../../pages/user/footer/Footer";
import { getUserFromSession } from "../api/apiCore";

const DefaultLayout = () => {
  const location = useLocation();
  const user = getUserFromSession();

  // List of pages where Navbar/Footer should be hidden
  const excludedPages = useMemo(
    () => [
      "login",
      "verify-otp",
      "forgot-password",
      "sign-up",
      "reset-password",
      "unauthorized",
      "no-internet",
      "not-found",
    ],
    []
  );

  // Get current page name from URL
  const currentPageName = useMemo(() => {
    const path = location.pathname.substring(
      location.pathname.lastIndexOf("/") + 1
    );
    return path.toLowerCase();
  }, [location.pathname]);

  // Determine if header/footer should be hidden
  const shouldHideHeaderFooter = useMemo(() => {
    return (
      excludedPages.includes(currentPageName) ||
      location.pathname.toLowerCase().startsWith("/admin")
    );
  }, [currentPageName, excludedPages, location.pathname]);

  return (
    <div className="d-flex flex-column" style={{ height: "100vh", overflowY: "auto", overflowX: "hidden" }}>
      {!shouldHideHeaderFooter && <Navbar user={user} />}

      <div
        className="flex-grow-1"
        style={{marginTop:!shouldHideHeaderFooter ? "5.5rem" :"" }}
      >
        <Outlet />
      </div>

      {!shouldHideHeaderFooter && <Footer />}
    </div>
  );
};

export default DefaultLayout;
