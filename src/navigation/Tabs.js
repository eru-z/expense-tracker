import React, { useRef, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import Home from "../screens/Home";
import Add from "../screens/Add";
import Budgets from "../screens/Budgets";
import AccountStack from "./AccountStack"; // ✅ IMPORTANT

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

function TabButton({ route, focused, onPress }) {
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(lift, {
      toValue: focused ? -8 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [focused]);

  const icon = {
    Home: "home",
    Add: "add",
    Budgets: "pie-chart",
    Settings: "settings",
  }[route.name];

  const isAdd = route.name === "Add";

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.iconWrap,
          isAdd && styles.addWrap,
          focused && styles.activeWrap,
          { transform: [{ translateY: lift }] },
        ]}
      >
        <Ionicons
          name={icon}
          size={isAdd ? 26 : 22}
          color={focused || isAdd ? "#020202" : "#a3ff12"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          return (
            <TabButton
              key={route.key}
              route={route}
              focused={focused}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function Tabs({ setLogged }) {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home">
        {props => <Home {...props} setLogged={setLogged} />}
      </Tab.Screen>

      <Tab.Screen name="Add">
        {props => <Add {...props} setLogged={setLogged} />}
      </Tab.Screen>

      <Tab.Screen name="Budgets" component={Budgets} />

      {/* ✅ SETTINGS TAB NOW USES ACCOUNT STACK */}
      <Tab.Screen name="Settings">
        {props => <AccountStack {...props} setLogged={setLogged} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(10, 10, 10, 0.85)",
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 22,
    width: width * 0.9,
    justifyContent: "space-between",
    shadowColor: "#a3ff12",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  addWrap: {
    backgroundColor: "#a3ff12",
    shadowColor: "#a3ff12",
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },

  activeWrap: {
    backgroundColor: "#a3ff12",
    shadowColor: "#a3ff12",
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
});
