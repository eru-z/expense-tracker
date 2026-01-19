import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../api/client";
import { setCurrency } from "../utils/Currency";

const CURRENCIES = [
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "CHF", label: "Swiss Franc", symbol: "CHF" },
  { code: "MKD", label: "Macedonian Denar", symbol: "ден" },
];

export default function CurrencyScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("EUR");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCurrency();
  }, []);

  /* ---------- LOAD ---------- */

  const loadCurrency = async () => {
    try {
      const { data } = await api.get("/settings");
      if (data?.currency) {
        setSelected(data.currency);
      }
    } catch {
      // silent fallback
    } finally {
      setLoading(false);
    }
  };

  /* ---------- SAVE ---------- */

const saveCurrency = async code => {
  if (code === selected || saving) return;

  setSaving(true);
  setSelected(code);
  setCurrency(code); // 🔥 THIS IS THE MAGIC

  try {
    await api.put("/settings", { currency: code });
  } catch {}
  finally {
    setSaving(false);
  }
};


  /* ---------- LOADER ---------- */

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#a3ff12" />
      </View>
    );
  }

  /* ---------- UI ---------- */

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 20 },
      ]}
    >
      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <Ionicons
            name="chevron-back"
            size={30}
            color="#a3ff12"
          />
        </Pressable>
        <View>
          <Text style={styles.title}>Currency</Text>
          <Text style={styles.subtitle}>
            Used for all expenses and totals
          </Text>
        </View>
        <View style={{ width: 30 }} />
      </View>

      {/* ---------- CURRENT ---------- */}
      <LinearGradient
        colors={["#052e16", "#020202"]}
        style={styles.currentCard}
      >
        <Text style={styles.currentLabel}>
          CURRENT CURRENCY
        </Text>
        <Text style={styles.currentValue}>
          {selected}
        </Text>
      </LinearGradient>

      {/* ---------- LIST ---------- */}
      <Text style={styles.section}>AVAILABLE</Text>

      {CURRENCIES.map(c => {
        const active = c.code === selected;

        return (
          <Pressable
            key={c.code}
            onPress={() => saveCurrency(c.code)}
            style={({ pressed }) => [
              styles.row,
              active && styles.active,
              pressed && { opacity: 0.65 },
            ]}
          >
            <View style={styles.rowLeft}>
              <View style={styles.symbolBox}>
                <Text style={styles.symbol}>{c.symbol}</Text>
              </View>
              <View>
                <Text style={styles.label}>{c.label}</Text>
                <Text style={styles.code}>{c.code}</Text>
              </View>
            </View>

            {active && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#a3ff12"
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020202",
    paddingHorizontal: 22,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020202",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 26,
  },

  title: {
    color: "#a3ff12",
    fontSize: 28,
    fontWeight: "900",
  },

  subtitle: {
    color: "#6ee7b7",
    fontSize: 13,
    marginTop: 2,
  },

  currentCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: "#0f2a16",
  },

  currentLabel: {
    color: "#6ee7b7",
    fontSize: 12,
    letterSpacing: 1.5,
  },

  currentValue: {
    color: "#e5ffe0",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 6,
  },

  section: {
    color: "#777",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 12,
  },

  row: {
    backgroundColor: "#0b0b0b",
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#0f2a16",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  active: {
    borderColor: "#a3ff12",
    backgroundColor: "#052e16",
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  symbolBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#052e16",
    justifyContent: "center",
    alignItems: "center",
  },

  symbol: {
    color: "#a3ff12",
    fontSize: 20,
    fontWeight: "800",
  },

  label: {
    color: "#e5ffe0",
    fontSize: 16,
    fontWeight: "600",
  },

  code: {
    color: "#6ee7b7",
    fontSize: 13,
    marginTop: 2,
  },

  footer: {
    color: "#777",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
  },
});
