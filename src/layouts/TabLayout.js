import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function TabLayout({ children }) {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View style={styles.root}>
      <View style={styles.content}>{children}</View>

      <View style={styles.nav}>
        <Tab icon="home" route="Home" active={route.name === "Home"} />
        <Tab icon="add-circle" route="Add" active={route.name === "Add"} />
        <Tab icon="stats-chart" route="Budgets" active={route.name === "Budgets"} />
        <Tab icon="settings" route="Settings" active={route.name === "Settings"} />
      </View>
    </View>
  );
}

function Tab({ icon, route, active }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.navigate(route)} style={[styles.icon, active && styles.active]}>
      <Ionicons name={icon} size={24} color={active ? "#000" : "#777"} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  nav: {
    position: "absolute",
    bottom: 30,
    left: 22,
    right: 22,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(20,30,15,0.9)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  active: {
    backgroundColor: "#9AFF00",
  },
});
