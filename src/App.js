import { useEffect, useState } from "react";
import Routes from "./routes/Routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [centerButton, setCenterButton] = useState(false);

  // Handle unhandled chunk load error
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (reason && /Loading chunk [\d]+ failed/.test(reason.message)) {
      window.location.href = "/no-internet";
    }
  });

  // scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setCenterButton(true);
      else setCenterButton(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Routes />
      
      {/* Floating Button */}
      {/* <button
        style={{
          position: "fixed",
          bottom: "20px",
          right: centerButton ? "50%" : "20px",
          transform: centerButton ? "translateX(50%)" : "none",
          padding: "8px 30px",
          background: "linear-gradient(180deg, #0034E4 0%, #001B76 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "13px",
          cursor: "pointer",
          boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
          transition: "all 0.4s ease",
          zIndex: 9999
        }}
        onClick={() => alert("Button Clicked!")}
      >
        Book Now
      </button> */}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
