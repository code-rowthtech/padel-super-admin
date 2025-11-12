// src/utils/toast.js
import { toast, Slide } from "react-toastify";

export const showSuccess = (message = "Success!") => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    transition: Slide,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const showError = (message = "Something went wrong") => {
  toast.error(message, {
    position: "top-right",
    autoClose: 4000,
    transition: Slide,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    transition: Slide,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const showWarning = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 3000,
    transition: Slide,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};
