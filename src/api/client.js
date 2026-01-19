import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ======================
   AUTH LOCK (SINGLE SOURCE)
====================== */
let isLoggingOut = false;

export const startLogout = () => {
  isLoggingOut = true;
};

export const resetLogout = () => {
  isLoggingOut = false;
};

export const isAuthLocked = () => isLoggingOut;

/* ======================
   API INSTANCE
====================== */
const LOCAL_IP = "192.168.100.98"; // change only if IP changes

const api = axios.create({
  baseURL: `http://${LOCAL_IP}:5050/api`,
  timeout: 8000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/* ======================
   REQUEST INTERCEPTOR
====================== */
api.interceptors.request.use(
  async config => {
    // ⛔ HARD BLOCK during logout
    if (isLoggingOut) {
      const err = new Error("Auth locked during logout");
      err.isAuthError = true;
      return Promise.reject(err);
    }

    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

/* ======================
   RESPONSE INTERCEPTOR
====================== */
api.interceptors.response.use(
  response => response,
  async error => {
    // Ignore errors while logout already running
    if (isLoggingOut) {
      error.isAuthError = true;
      return Promise.reject(error);
    }

    const status = error?.response?.status;

    if (status === 401) {
      console.warn("🚨 401 Unauthorized — locking auth & clearing token");

      isLoggingOut = true;

      try {
        await AsyncStorage.removeItem("token");
      } catch (e) {
        console.warn("Token cleanup failed", e);
      }

      error.isAuthError = true;
    }

    return Promise.reject(error);
  }
);

export default api;
