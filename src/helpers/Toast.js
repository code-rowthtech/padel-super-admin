import { toast, Bounce } from "react-toastify";

const activeToasts = new Map();

const createToastWithCount = (message, type, options) => {
  const key = `${type}-${message}`;
  
  if (activeToasts.has(key)) {
    const toastData = activeToasts.get(key);
    toastData.count += 1;
    
    toast.update(toastData.id, {
      render: `${message} (${toastData.count})`,
      ...options
    });
  } else {
    const toastId = toast[type](message, {
      ...options,
      onClose: () => {
        activeToasts.delete(key);
      }
    });
    
    activeToasts.set(key, {
      id: toastId,
      count: 1,
      message
    });
  }
};

export const showSuccess = (message = "Success!") => {
  createToastWithCount(message, 'success', {
    position: "top-right",
    autoClose: 3000,
    transition: Bounce,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const showError = (message = "Something went wrong") => {
  createToastWithCount(message, 'error', {
    position: "top-right",
    autoClose: 4000,
    transition: Bounce,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const showInfo = (message) => {
  createToastWithCount(message, 'info', {
    position: "top-right",
    autoClose: 3000,
    transition: Bounce,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const showWarning = (message) => {
  createToastWithCount(message, 'warning', {
    position: "top-right",
    autoClose: 3000,
    transition: Bounce,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  });
};
