import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import "react-datepicker/dist/react-datepicker.css";
import Routes from './routes/Routes';
import CustomButton from './pages/button';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason && /Loading chunk [\d]+ failed/.test(reason.message)) {
      // Navigate to fallback route or render directly
      window.location.href = '/no-internet';
    }
  });

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
