import AsyncStorage from "@react-native-async-storage/async-storage";
import { startLogout, resetLogout } from "../api/client";

/* ======================
   AUTH ACTIONS
====================== */

export const performLogout = async () => {
  startLogout(); // 🔐 lock API immediately

  try {
    await AsyncStorage.removeItem("token");
  } catch (e) {
    console.warn("Failed to clear token", e);
  }
};

/* ======================
   AUTH RESET (ON LOGIN)
====================== */

export const restoreSession = async token => {
  if (!token) return;

  await AsyncStorage.setItem("token", token);
  resetLogout(); // 🔓 unlock API after login
};
