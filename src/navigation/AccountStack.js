import React, { memo } from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Settings from "../screens/Settings";
import Profile from "../screens/Profile";
import Currency from "../screens/Currency";

const Stack = createStackNavigator();

function AccountStack({ setLogged }) {
  return (
    <Stack.Navigator
      initialRouteName="SettingsHome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      {/* SETTINGS HOME */}
      <Stack.Screen name="SettingsHome">
        {props => (
          <Settings
            {...props}
            setLogged={setLogged}
          />
        )}
      </Stack.Screen>

      {/* PROFILE */}
<Stack.Screen name="ProfileScreen">
  {props => (
    <Profile
      {...props}
      setLogged={setLogged}
    />
  )}
</Stack.Screen>


      {/* CURRENCY */}
      <Stack.Screen
        name="CurrencyScreen"
        component={Currency}
      />
    </Stack.Navigator>
  );
}

export default memo(AccountStack);
