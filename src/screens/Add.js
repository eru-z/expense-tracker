import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";

/* ================= CONSTANTS ================= */

const TYPES = ["expense", "income", "transfer"];
const NEON = "#a3ff12";

const inferCategory = title => {
  const t = title?.toLowerCase?.() || "";
  if (t.includes("uber") || t.includes("taxi")) return "Transport";
  if (t.includes("coffee") || t.includes("restaurant")) return "Food";
  if (t.includes("netflix") || t.includes("spotify")) return "Subscriptions";
  if (t.includes("salary") || t.includes("payroll")) return "Income";
  return "General";
};

/* ================= SCREEN ================= */

export default function Add({ navigation, route }) {
  const insets = useSafeAreaInsets();

  const fade = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const scaleBtn = useRef(new Animated.Value(1)).current;

  const [type, setType] = useState(route?.params?.type || "expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= ANIMATION ================= */

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, {
            toValue: 1,
            duration: 2600,
            useNativeDriver: true,
          }),
          Animated.timing(breathe, {
            toValue: 0,
            duration: 2600,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const glowOpacity = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.18],
  });

  /* ================= ACTION ================= */

  const submit = async () => {
    Keyboard.dismiss();

    if (!amount || isNaN(amount) || (type !== "transfer" && !title)) {
      setError("Please enter a valid title and amount");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setLoading(true);
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const numericAmount = Math.abs(Number(amount));

    let finalAmount = numericAmount;
    let finalCategory = category || inferCategory(title);

    switch (type) {
      case "expense":
        finalAmount = -numericAmount;
        break;

      case "income":
        finalAmount = numericAmount;
        break;

      case "transfer":
        finalAmount = numericAmount;
        finalCategory = "Transfer";
        break;
    }

    const payload = {
      amount: finalAmount,
      type,
      note: title || finalCategory,
      category_name: finalCategory,
      wallet_id: 1,
      occurred_at: new Date().toISOString(),
    };

    try {
      await api.post("/transactions", payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (e) {
      if (!e.response) {
        const q = JSON.parse((await AsyncStorage.getItem("offlineQueue")) || "[]");
        q.push(payload);
        await AsyncStorage.setItem("offlineQueue", JSON.stringify(q));
        setError("Saved offline. Will sync later.");
      } else {
        setError(e.response?.data?.error || "Failed to save transaction");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <LinearGradient
        colors={["#020202", "#071a11", "#020202"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      <Animated.View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 32,
            opacity: fade,
          },
        ]}
      >
        <Text style={styles.header}>New Entry</Text>
        <Text style={styles.subheader}>Record a financial event</Text>

        {/* TYPE SELECTOR */}
        <View style={styles.typeRow}>
          {TYPES.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => {
                setType(t);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.typeText, type === t && styles.typeActive]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <ScrollView showsVerticalScrollIndicator={false}>
          {type !== "transfer" && (
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor="#6b7280"
              style={styles.input}
            />
          )}

          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Amount"
            keyboardType="numeric"
            placeholderTextColor="#6b7280"
            style={styles.amountInput}
          />

          {(type === "expense" || type === "income") && (
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="Category (optional)"
              placeholderTextColor="#6b7280"
              style={styles.input}
            />
          )}
        </ScrollView>

        <Animated.View style={{ transform: [{ scale: scaleBtn }] }}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={submit}
            disabled={loading}
            onPressIn={() =>
              Animated.spring(scaleBtn, { toValue: 0.96, useNativeDriver: true }).start()
            }
            onPressOut={() =>
              Animated.spring(scaleBtn, { toValue: 1, useNativeDriver: true }).start()
            }
          >
            <Ionicons name="checkmark" size={22} color="#020202" />
            <Text style={styles.saveText}>
              {loading ? "Saving…" : "Save"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020202" },
  container: { paddingHorizontal: 28 },

  glow: {
    position: "absolute",
    top: 160,
    alignSelf: "center",
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: "rgba(163,255,18,0.25)",
  },

  header: {
    color: NEON,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },

  subheader: {
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 26,
  },

  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  typeText: {
    fontSize: 11,
    letterSpacing: 1.4,
    color: "#6b7280",
  },

  typeActive: {
    color: NEON,
    fontWeight: "700",
  },

  input: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#0b0f0c",
    paddingHorizontal: 18,
    color: "#e5fbe0",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  amountInput: {
    height: 62,
    borderRadius: 20,
    backgroundColor: "#0b0f0c",
    paddingHorizontal: 18,
    color: "#e5fbe0",
    fontSize: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  saveBtn: {
    marginTop: 24,
    borderRadius: 26,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: NEON,
  },

  saveText: {
    fontWeight: "800",
    color: "#020202",
  },

  error: {
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 14,
    fontSize: 13,
  },
});
