// apiCore.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import config from "../../config";

const AUTH_SESSION_KEY = "padel_user";

// Set base URL
axios.defaults.baseURL = config.API_URL;

// Global error interceptor
// Global error interceptor
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!navigator.onLine) {
      // If offline, redirect to a fallback route
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

export const getUserFromSession = () => {
  const stored = localStorage.getItem(AUTH_SESSION_KEY);
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
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    setAuthorization(session.token);
  } else {
    localStorage.removeItem(AUTH_SESSION_KEY);
    setAuthorization(null);
  }
};

export const updateUserInSession = (updatedData) => {
  const session = getUserFromSession();
  if (session) {
    const updatedSession = { ...session, ...updatedData };
    setLoggedInUser(updatedSession);
  }
};

export const isUserAuthenticated = () => {
  const user = getUserFromSession();
  const token = user?.token;

  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      setLoggedInUser(null);
      localStorage.clear();
      sessionStorage.clear();
      if (window.location.pathname.toLowerCase().startsWith("/admin")) {
        alert("Your session has expired.");
        window.location.href = "/admin/login";
      } else {
        alert("Your session has expired.");
        window.location.href = "/";
      }
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

// --- API Helpers ---
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
const user = getUserFromSession();
if (user?.token) setAuthorization(user.token);
