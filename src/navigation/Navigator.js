import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Login from "../screens/Login";
import Register from "../screens/Register";
import Tabs from "./Tabs";

const Stack = createStackNavigator();

export default function Navigator() {
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setLogged(!!token);
      } finally {
        setReady(true);
      }
    };

    checkToken();
  }, []);

  if (!ready) return null; // splash screen later

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {logged ? (
        <Stack.Screen name="Main">
          {props => <Tabs {...props} setLogged={setLogged} />}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="Login">
            {props => <Login {...props} setLogged={setLogged} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {props => <Register {...props} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}
