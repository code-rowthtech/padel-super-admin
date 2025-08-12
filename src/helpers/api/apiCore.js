// apiCore.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import config from "../../config";

const USER_SESSION_KEY = "padel_user";
const OWNER_SESSION_KEY = "padel_owner";

// Set base URL
axios.defaults.baseURL = config.API_URL;

// Global error interceptor
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!navigator.onLine) {
      window.location.href = "/no-internet";
      return Promise.reject("No internet connection");
    }

    const { response } = err;
    const status = response?.status;
    const message =
      response?.data?.message ||
      {
        400: "Error",
        401: "Invalid credentials",
        403: "Access Forbidden",
        404: "Sorry! the data you are looking for could not be found",
      }[status] ||
      err.message;

    return Promise.reject(message);
  }
);

// --- Authorization Helpers ---
export const setAuthorization = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

// User Session Management
export const getUserFromSession = () => {
  const stored = localStorage.getItem(USER_SESSION_KEY);
  if (!stored) return null;

  try {
    const user = JSON.parse(stored);
    setAuthorization(user?.token);
    return user;
  } catch {
    return null;
  }
};

export const setLoggedInUser = (session) => {
  if (session) {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    setAuthorization(session.token);
    // Clear owner session when setting user session
    localStorage.removeItem(OWNER_SESSION_KEY);
  } else {
    localStorage.removeItem(USER_SESSION_KEY);
    setAuthorization(null);
  }
};

// Owner Session Management
export const getOwnerFromSession = () => {
  const stored = localStorage.getItem(OWNER_SESSION_KEY);
  if (!stored) return null;

  try {
    const owner = JSON.parse(stored);
    setAuthorization(owner?.token);
    return owner;
  } catch {
    return null;
  }
};

export const setLoggedInOwner = (session) => {
  if (session) {
    localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(session));
    setAuthorization(session.token);
    // Clear user session when setting owner session
    localStorage.removeItem(USER_SESSION_KEY);
  } else {
    localStorage.removeItem(OWNER_SESSION_KEY);
    setAuthorization(null);
  }
};

// Common functions
export const updateSessionData = (updatedData) => {
  const user = getUserFromSession();
  const owner = getOwnerFromSession();
  const session = user || owner;

  if (session && typeof updatedData === "object") {
    const updatedSession = { ...session, ...updatedData };
    if (user) {
      setLoggedInUser(updatedSession);
    } else if (owner) {
      setLoggedInOwner(updatedSession);
    }
  }
};

export const isAuthenticated = () => {
  return isUserAuthenticated() || isOwnerAuthenticated();
};

export const isUserAuthenticated = () => {
  const user = getUserFromSession();
  return validateToken(user?.token, "user");
};

export const isOwnerAuthenticated = () => {
  const owner = getOwnerFromSession();
  return validateToken(owner?.token, "owner");
};

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

const handleExpiredSession = (userType) => {
  if (userType === "user") {
    setLoggedInUser(null);
  } else {
    setLoggedInOwner(null);
  }

  localStorage.clear();
  sessionStorage.clear();

  const message = "Your session has expired.";
  alert(message);

  if (window.location.pathname.toLowerCase().startsWith("/admin")) {
    window.location.href = "/admin/login";
  } else if (userType === "owner") {
    window.location.href = "/owner/login";
  } else {
    window.location.href = "/";
  }
};

// --- API Helpers --- (keep these the same as before)
export const getApi = (url, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axios.get(`${url}${query ? `?${query}` : ""}`);
};

export const apiGetFile = (url, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axios.get(`${url}${query ? `?${query}` : ""}`, {
    responseType: "blob",
  });
};

export const apiGetMultiple = (urls, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return axios.all(urls.map((url) => axios.get(`${url}?${query}`)));
};

export const create = (url, data) => axios.post(url, data);
export const update = (url, data) => axios.put(url, data);
export const apiPatch = (url, data) => axios.patch(url, data);
export const remove = (url) => axios.delete(url);

export const apiPostWithFile = (url, data) => {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  }
  return axios.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const apiPatchWithFile = (url, data) => {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  }
  return axios.patch(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Initialize auth header on load
const initializeAuth = () => {
  const user = getUserFromSession();
  const owner = getOwnerFromSession();

  if (user?.token) {
    setAuthorization(user.token);
  } else if (owner?.token) {
    setAuthorization(owner.token);
  }
};

initializeAuth();
