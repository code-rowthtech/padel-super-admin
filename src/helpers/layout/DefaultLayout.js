import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import Navbar from "../../pages/user/header/Navbar";
import Footer from "../../pages/user/footer/Footer";
import { getUserFromSession } from "../api/apiCore";

const DefaultLayout = () => {
  const location = useLocation();
  const user = getUserFromSession();

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
      "sameprivacy"
    ],
    []
  );

  const currentPageName = useMemo(() => {
    const path = location.pathname.substring(
      location.pathname.lastIndexOf("/") + 1
    );
    return path.toLowerCase();
  }, [location.pathname]);

  const shouldHideHeaderFooter = useMemo(() => {
    return (
      excludedPages.includes(currentPageName) ||
      location.pathname.toLowerCase().startsWith("/admin")
    );
  }, [currentPageName, excludedPages, location.pathname]);

  useEffect(() => {
    const currentPath = location.pathname;
    const matchPages = ["/create-matches", "/match-payment", "/match-player"];
    const isMatchPage = matchPages.some(page => currentPath.includes(page));

    if (!isMatchPage) {
      const cleanup = () => {
        localStorage.removeItem("addedPlayers");
      };
      return cleanup;
    }

    return undefined;
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname])

  return (
    <div className="d-flex flex-column" style={{ height: "100vh", overflowY: "auto", overflowX: "hidden" }}>
      {!shouldHideHeaderFooter && <Navbar user={user} />}

      <div
        className="flex-grow-1"
        style={{ marginTop: !shouldHideHeaderFooter ? "4rem" : "" }}
      >
        <Outlet />
      </div>

      {!shouldHideHeaderFooter && <Footer />}
    </div>
  );
};

export default DefaultLayout;
