import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";
import { useToast } from "../components/Toast";

export default function Settings({ navigation, setLogged }) {
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [stats, setStats] = useState({ today: 0, month: 0, budget: 1 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await api.get("/stats/summary");
      setStats(data);
    } catch {}
  };

  const toggleSetting = async (key, value, setter) => {
    setter(value);
    try {
      await api.put("/settings", { [key]: value });
      toast.show("Saved");
    } catch {}
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setLogged(false);
  };

  const theme = darkMode ? DARK : LIGHT;
  const ratio = stats.month / stats.budget;

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.bg, paddingTop: insets.top + 12 },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={[styles.headerTop, { color: theme.muted }]}>
            CONTROL CORE
          </Text>
          <Text style={[styles.headerMain, { color: theme.accent }]}>
            SETTINGS
          </Text>
        </View>

        {/* TELEMETRY CORE */}
        <LinearGradient
          colors={theme.coreFrame}
          style={styles.coreFrame}
        >
          <View
            style={[
              styles.core,
              { backgroundColor: theme.surface },
            ]}
          >
            <CoreStat
              label="TODAY"
              value={`€${stats.today}`}
              theme={theme}
            />
            <CoreStat
              label="MONTH"
              value={`€${stats.month}`}
              theme={theme}
            />
            <CoreStat
              label="LEFT"
              value={`€${stats.budget - stats.month}`}
              danger={ratio > 1}
              theme={theme}
            />
          </View>
        </LinearGradient>

        {/* ORBIT CONTROLS */}
        <View style={styles.orbitRow}>
          <OrbitButton
            icon="contrast"
            label="APPEARANCE"
            value={darkMode ? "DARK" : "LIGHT"}
            onPress={() =>
              toggleSetting("darkMode", !darkMode, setDarkMode)
            }
            theme={theme}
          />
          <OrbitButton
            icon="notifications"
            label="NOTIFICATIONS"
            value={notifications ? "ON" : "OFF"}
            onPress={() =>
              toggleSetting(
                "notifications",
                !notifications,
                setNotifications
              )
            }
            theme={theme}
          />
        </View>

        {/* CURRENCY AXIS */}
        <Pressable
          onPress={() => navigation.navigate("CurrencyScreen")}
          style={[
            styles.axis,
            { borderColor: theme.border },
          ]}
        >
          <Text style={[styles.axisText, { color: theme.text }]}>
            CURRENCY CONFIGURATION →
          </Text>
        </Pressable>

        {/* ACCOUNT ZONE */}
        <View style={styles.accountZone}>
          <Pressable
            onPress={() => navigation.navigate("ProfileScreen")}
            style={[
              styles.accountBtn,
              { borderColor: theme.border },
            ]}
          >
            <Text
              style={[
                styles.accountText,
                { color: theme.text },
              ]}
            >
              PROFILE ACCESS
            </Text>
          </Pressable>

          <Pressable
            onPress={logout}
            style={[
              styles.accountBtn,
              styles.dangerBtn,
              { borderColor: theme.danger },
            ]}
          >
            <Text
              style={[
                styles.accountText,
                { color: theme.danger },
              ]}
            >
              LOGOUT SESSION
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* ───────── COMPONENTS ───────── */

const CoreStat = ({ label, value, danger, theme }) => (
  <View style={styles.coreStat}>
    <Text style={[styles.coreLabel, { color: theme.muted }]}>
      {label}
    </Text>
    <Text
      style={[
        styles.coreValue,
        { color: danger ? theme.danger : theme.text },
      ]}
    >
      {value}
    </Text>
  </View>
);

const OrbitButton = ({
  icon,
  label,
  value,
  onPress,
  theme,
}) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.orbit,
      { borderColor: theme.border, backgroundColor: theme.surface },
    ]}
  >
    <Ionicons
      name={icon}
      size={20}
      color={theme.accent}
    />
    <Text
      style={[
        styles.orbitLabel,
        { color: theme.text },
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.orbitValue,
        { color: theme.muted },
      ]}
    >
      {value}
    </Text>
  </Pressable>
);

/* ───────── THEMES ───────── */

const DARK = {
  bg: "#010102",
  surface: "#07070b",
  text: "#e6ffe1",
  muted: "#6b7280",
  accent: "#a3ff12",
  border: "#1f3d2b",
  danger: "#ff6b6b",
  coreFrame: ["#1f3d2b", "#0b1a12"],
};

const LIGHT = {
  bg: "#edf7f1",
  surface: "#ffffff",
  text: "#064e3b",
  muted: "#4b5563",
  accent: "#15803d",
  border: "#c7ead6",
  danger: "#dc2626",
  coreFrame: ["#bbf7d0", "#dcfce7"],
};

/* ───────── STYLES ───────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 18,
  },

  header: {
    alignItems: "center",
    marginBottom: 24,
  },

  headerTop: {
    fontSize: 10,
    letterSpacing: 3,
  },

  headerMain: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 1,
  },

  coreFrame: {
    borderRadius: 999,
    padding: 3,
    alignSelf: "center",
    marginBottom: 30,
  },

  core: {
    borderRadius: 999,
    padding: 26,
    alignItems: "center",
    gap: 14,
    minWidth: 220,
  },

  coreStat: {
    alignItems: "center",
  },

  coreLabel: {
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
  },

  coreValue: {
    fontSize: 20,
    fontWeight: "900",
  },

  orbitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  orbit: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
    marginHorizontal: 6,
    borderWidth: 1,
    borderRadius: 18,
    gap: 6,
  },

  orbitLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },

  orbitValue: {
    fontSize: 11,
    letterSpacing: 1.6,
  },

  axis: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 30,
    alignItems: "center",
  },

  axisText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
  },

  accountZone: {
    gap: 14,
  },

  accountBtn: {
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
  },

  dangerBtn: {
    marginTop: 6,
  },

  accountText: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
});
