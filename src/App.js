import { useEffect } from "react";
import Routes from "./routes/Routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  // Handle unhandled chunk load error
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (reason && /Loading chunk [\d]+ failed/.test(reason.message)) {
      window.location.href = "/no-internet";
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Routes />
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
