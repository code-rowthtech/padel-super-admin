// apiCore.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import config from "../../config";

const USER_SESSION_KEY = "padel_user";
const OWNER_SESSION_KEY = "padel_owner";

// -------------------
// SESSION MANAGEMENT
// -------------------
export const getUserFromSession = () => {
  const stored = localStorage.getItem(USER_SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const setLoggedInUser = (session) => {
  if (session?.token) {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(USER_SESSION_KEY);
  }
};

export const getOwnerFromSession = () => {
  const stored = localStorage.getItem(OWNER_SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const setLoggedInOwner = (session) => {
  if (session) {
    localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(OWNER_SESSION_KEY);
  }
};

// -------------------
// TOKEN VALIDATION
// -------------------
const validateToken = (token, userType) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      handleExpiredSession(userType);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

// const handleExpiredSession = (userType) => {
//   if (userType === "user") {
//     setLoggedInUser(null);
//   } else {
//     setLoggedInOwner(null);
//   }

//   const message = "Your session has expired.";
//   alert(message);

//   if (window.location.pathname.toLowerCase().startsWith("/admin")) {
//     window.location.href = "/admin/login";
//   } else {
//     window.location.href = "/";
//   }
// };

export const isUserAuthenticated = () => {
  const user = getUserFromSession();
  return validateToken(user?.token, "user");
};

export const isOwnerAuthenticated = () => {
  const owner = getOwnerFromSession();
  return validateToken(owner?.token, "owner");
};

export const isAuthenticated = () =>
  isUserAuthenticated() || isOwnerAuthenticated();

// -------------------
// AXIOS INSTANCES
// -------------------
const userAxios = axios.create({ baseURL: config.API_URL });
const ownerAxios = axios.create({ baseURL: config.API_URL });

let sessionHandled = false;

const handleExpiredSession = (userType) => {
  if (sessionHandled) return; 
  sessionHandled = true;

  if (userType === "user") {
    setLoggedInUser(null);
  } else {
    setLoggedInOwner(null);
  }

  alert("Your session has expired. Please log in again.");

  if (window.location.pathname.toLowerCase().startsWith("/admin")) {
    window.location.href = "/admin/login";
  } else {
    window.location.href = "/";
  }
};


const errorInterceptor = (err) => {
  if (!navigator.onLine) {
    window.location.href = "/no-internet";
    return Promise.reject("No internet connection");
  }

  const { response } = err;
  const status = response?.status;

  if (status === 401) {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith("/admin")) {
      handleExpiredSession("owner");
    } else {
      handleExpiredSession("user");
    }
    return Promise.reject("Session expired. Please log in again.");
  }

  const message =
    response?.data?.message ||
    {
      400: "Error",
      403: "Access Forbidden",
      404: "Sorry! the data you are looking for could not be found",
    }[status] ||
    err.message;

  return Promise.reject(message);
};

// Attach interceptors
userAxios.interceptors.response.use((res) => res, errorInterceptor);
ownerAxios.interceptors.response.use((res) => res, errorInterceptor);

// Attach tokens dynamically
userAxios.interceptors.request.use((config) => {
  const token = getUserFromSession()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

ownerAxios.interceptors.request.use((config) => {
  const token = getOwnerFromSession()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// -------------------
// ROLE-BASED HELPERS
// -------------------
const buildFormData = (data) => {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  }
  return formData;
};

export const userApi = {
  get: (url, params = {}) => userAxios.get(url, { params }),
  post: (url, data) => userAxios.post(url, data),
  put: (url, data) => userAxios.put(url, data),
  patch: (url, data) => userAxios.patch(url, data),
  delete: (url, params = {}) => userAxios.delete(url, { params }),
  postFile: (url, data) =>
    userAxios.post(url, buildFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  patchFile: (url, data) =>
    userAxios.patch(url, buildFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const ownerApi = {
  get: (url, params = {}) => ownerAxios.get(url, { params }),
  post: (url, data) => ownerAxios.post(url, data),
  put: (url, data) => ownerAxios.put(url, data),
  patch: (url, data) => ownerAxios.patch(url, data),
  delete: (url, params = {}) => ownerAxios.delete(url, { params }),
  postFile: (url, data) =>
    ownerAxios.post(url, buildFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  patchFile: (url, data) =>
    ownerAxios.patch(url, buildFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const updateSessionData = (updatedData, type = "user") => {
  if (!updatedData || typeof updatedData !== "object") return;

  if (type === "user") {
    const user = getUserFromSession();
    if (user) {
      const updatedUser = { ...user, ...updatedData };
      setLoggedInUser(updatedUser);
    }
  }

  if (type === "owner") {
    const owner = getOwnerFromSession();
    if (owner) {
      const updatedOwner = { ...owner, ...updatedData };
      setLoggedInOwner(updatedOwner);
    }
  }
};

// -------------------
// INIT AUTH ON LOAD
// -------------------
const initializeAuth = () => {
  const user = getUserFromSession();
  const owner = getOwnerFromSession();
};
initializeAuth();
