// src/utils/toast.js
<<<<<<< HEAD
import { toast, Slide } from "react-toastify";
=======
import { toast, Bounce } from "react-toastify";
>>>>>>> da00ece597a665ac1b9b9d5c398c194693ba1533

export const showSuccess = (message = "Success!") => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
<<<<<<< HEAD
    transition: Slide,
=======
    transition: Bounce,
>>>>>>> da00ece597a665ac1b9b9d5c398c194693ba1533
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const showError = (message = "Something went wrong") => {
  toast.error(message, {
    position: "top-right",
    autoClose: 4000,
<<<<<<< HEAD
    transition: Slide,
=======
    transition: Bounce,
>>>>>>> da00ece597a665ac1b9b9d5c398c194693ba1533
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
<<<<<<< HEAD
    transition: Slide,
=======
    transition: Bounce,
>>>>>>> da00ece597a665ac1b9b9d5c398c194693ba1533
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const showWarning = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 3000,
<<<<<<< HEAD
    transition: Slide,
=======
    transition: Bounce,
>>>>>>> da00ece597a665ac1b9b9d5c398c194693ba1533
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};
