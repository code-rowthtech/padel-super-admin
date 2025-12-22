import axios from "axios";
import { jwtDecode } from "jwt-decode";
import config from "../../config";
import { SESSION_KEYS } from "../../constants";

const { USER, OWNER } = SESSION_KEYS;

/* =========================
   SESSION HELPERS
========================= */

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getUserFromSession = () =>
  safeParse(localStorage.getItem(USER));

export const getOwnerFromSession = () =>
  safeParse(localStorage.getItem(OWNER));

export const setLoggedInUser = (session) => {
  session?.token
    ? localStorage.setItem(USER, JSON.stringify(session))
    : localStorage.removeItem(USER);
};

export const setLoggedInOwner = (session) => {
  session
    ? localStorage.setItem(OWNER, JSON.stringify(session))
    : localStorage.removeItem(OWNER);
};

/* =========================
   TOKEN VALIDATION (PURE)
========================= */

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    return exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

export const isUserAuthenticated = () =>
  isTokenValid(getUserFromSession()?.token);

export const isOwnerAuthenticated = () =>
  isTokenValid(getOwnerFromSession()?.token);

export const isAuthenticated = () =>
  isUserAuthenticated() || isOwnerAuthenticated();

/* =========================
   AXIOS INSTANCES
========================= */

const createAxiosInstance = (getToken) => {
  const instance = axios.create({
    baseURL: config.API_URL,
  });

  instance.interceptors.request.use((config) => {
    const token = getToken()?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

export const userAxios = createAxiosInstance(getUserFromSession);
export const ownerAxios = createAxiosInstance(getOwnerFromSession);

/* =========================
   SESSION EXPIRY HANDLER
========================= */

let sessionHandled = false;

const handleExpiredSession = (type) => {
  if (sessionHandled) return;
  sessionHandled = true;

  type === "owner"
    ? setLoggedInOwner(null)
    : setLoggedInUser(null);

  setTimeout(() => {
    const isAdmin = window.location.pathname
      .toLowerCase()
      .startsWith("/admin");

    window.location.href = isAdmin ? "/admin/login" : "/";
  }, 500);
};

/* =========================
   ERROR INTERCEPTOR
========================= */

const errorInterceptor = (error) => {
  if (!navigator.onLine) {
    window.location.href = "/no-internet";
    return Promise.reject("No internet connection");
  }

  const status = error?.response?.status;

  if (status === 401) {
    const isAdmin = window.location.pathname
      .toLowerCase()
      .startsWith("/admin");

    handleExpiredSession(isAdmin ? "owner" : "user");
    return Promise.reject("Session expired");
  }

  const message =
    error?.response?.data?.message ||
    {
      400: "Bad Request",
      403: "Access Forbidden",
      404: "Data not found",
      500: "Server error",
    }[status] ||
    error.message;

  return Promise.reject(message);
};

userAxios.interceptors.response.use((res) => res, errorInterceptor);
ownerAxios.interceptors.response.use((res) => res, errorInterceptor);

/* =========================
   FILE UPLOAD HELPER
========================= */

const buildFormData = (data = {}) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

/* =========================
   API WRAPPERS
========================= */

const createApi = (axiosInstance) => ({
  get: (url, params = {}) => axiosInstance.get(url, { params }),
  post: (url, data) => axiosInstance.post(url, data),
  put: (url, data) => axiosInstance.put(url, data),
  patch: (url, data) => axiosInstance.patch(url, data),
  delete: (url, params = {}) =>
    axiosInstance.delete(url, { params }),

  postFile: (url, data) =>
    axiosInstance.post(url, buildFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  patchFile: (url, data) =>
    axiosInstance.patch(url, buildFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    }),
});

export const userApi = createApi(userAxios);
export const ownerApi = createApi(ownerAxios);

/* =========================
   SESSION UPDATE HELPER
========================= */

export const updateSessionData = (updatedData, type = "user") => {
  if (!updatedData || typeof updatedData !== "object") return;

  if (type === "owner") {
    const owner = getOwnerFromSession();
    owner && setLoggedInOwner({ ...owner, ...updatedData });
  } else {
    const user = getUserFromSession();
    user && setLoggedInUser({ ...user, ...updatedData });
  }
};
