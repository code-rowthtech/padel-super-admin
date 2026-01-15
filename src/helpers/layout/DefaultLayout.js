import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";

const DefaultLayout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname])

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <div className="flex-grow-1">
        <Outlet />
      </div>
    </div>
  );
};

export default DefaultLayout;
