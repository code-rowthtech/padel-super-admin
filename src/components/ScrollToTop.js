import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    scrollToTop();

    const timer1 = setTimeout(scrollToTop, 0);
    const timer2 = setTimeout(scrollToTop, 10);
    const timer3 = setTimeout(scrollToTop, 50);
    const timer4 = setTimeout(scrollToTop, 100);
    const timer5 = setTimeout(scrollToTop, 200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
