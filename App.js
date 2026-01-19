import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navigator from "./src/navigation/Navigator";
import { ToastProvider } from "./src/components/Toast";

export default function App() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const t = await AsyncStorage.getItem("token");
      setToken(t);
      setReady(true);
    };

    loadToken();
    const interval = setInterval(loadToken, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!ready) return null;

  return (
    <ToastProvider>
      <NavigationContainer>
        <Navigator isLoggedIn={!!token} />
      </NavigationContainer>
    </ToastProvider>
  );
}
