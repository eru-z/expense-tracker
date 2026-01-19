import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Login from "../screens/Login";
import Register from "../screens/Register";
import Tabs from "./Tabs";

const Stack = createStackNavigator();

export default function Navigator() {
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState(false);

  // Load auth state
  const loadAuth = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      setLogged(!!token);
    } catch (e) {
      console.error("Failed to load auth", e);
      setLogged(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  // While checking token
  if (!ready) return null; // replace with splash if you want

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      key={logged ? "user" : "guest"} // force reset when auth changes
    >
      {logged ? (
        <Stack.Screen name="Main">
          {(props) => <Tabs {...props} setLogged={setLogged} />}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="Login">
            {(props) => <Login {...props} setLogged={setLogged} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {(props) => <Register {...props} setLogged={setLogged} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}
