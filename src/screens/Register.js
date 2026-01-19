import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const API = "http://192.168.100.98:5050/api";

export default function Register({ navigation }) {
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  async function handleRegister() {
    if (!email || !password || !confirm) {
      return setError("Please fill in all fields");
    }

    if (password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    if (password !== confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      alert("Account created successfully!");
      navigation.goBack();
    } catch (err) {
      if (err.message.toLowerCase().includes("network")) {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.glow} />

      <Animated.View
        style={[
          styles.card,
          { opacity: fade, marginTop: insets.top + 100 },
        ]}
      >
        <LinearGradient
          colors={["#020202", "#0f1f18"]}
          style={styles.cardInner}
        >
          <Text style={styles.title}>Start tracking your expenses</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#6b7280"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6b7280"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#6b7280"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating account..." : "Create account"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020202",
  },

  glow: {
    position: "absolute",
    top: height * 0.2,
    left: width * 0.1,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "#a3ff12",
    opacity: 0.35,
  },

  card: {
    marginHorizontal: 24,
    borderRadius: 32,
    overflow: "hidden",
  },

  cardInner: {
    padding: 28,
    borderRadius: 32,
  },

  title: {
    color: "#a3ff12",
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#020202",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    color: "#e5ffe0",
    borderWidth: 1,
    borderColor: "#1f2933",
  },

  button: {
    backgroundColor: "#a3ff12",
    padding: 16,
    borderRadius: 20,
    marginTop: 8,
  },

  buttonText: {
    color: "#020202",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },

  link: {
    marginTop: 18,
    textAlign: "center",
    color: "#6b7280",
  },

  error: {
    color: "#ff6b6b",
    marginBottom: 10,
    textAlign: "center",
  },
});
