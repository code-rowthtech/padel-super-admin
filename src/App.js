import Routes from './routes/Routes';
import CustomButton from './pages/user/button';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
function App() {

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason && /Loading chunk [\d]+ failed/.test(reason.message)) {
      // Navigate to fallback route or render directly
      window.location.href = '/no-internet';
    }
  });

  useEffect(() => {
    const defaultTitle = "Padel";
    const isAdminRoute = window.location.pathname.startsWith("/admin");

    document.title = isAdminRoute ? `${defaultTitle} | Admin` : defaultTitle;
  }, [window.location.pathname]);

  return (
    <>
      <Routes />
      <CustomButton />
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
