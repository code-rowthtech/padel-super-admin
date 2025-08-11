// src/utils/toast.js
import { toast } from "react-toastify";

export const showSuccess = (message = "Success!") => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
  });
};

export const showError = (message = "Something went wrong") => {
  toast.error(message, {
    position: "top-right",
    autoClose: 4000,
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
  });
};
export const showWarning = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 3000,
  });
};
