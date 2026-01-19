import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../api/client";
import { startLogout } from "../api/client";

export default function Profile({ navigation, route, setLogged }) {
  const insets = useSafeAreaInsets();
  const user = route.params?.user || {};

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const validate = () => {
    if (!name.trim()) return "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email";

    const wantsPasswordChange =
      currentPassword || newPassword || confirmPassword;

    if (wantsPasswordChange) {
      if (!currentPassword) return "Enter current password";
      if (newPassword.length < 6)
        return "New password must be at least 6 characters";
      if (newPassword !== confirmPassword)
        return "Passwords do not match";
    }
    return null;
  };

  const saveProfile = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.put("/account/profile", {
        name,
        email,
        currentPassword,
        newPassword,
      });

if (newPassword) {
  setSaving(false);

  // 🔥 wait for request to fully finish before locking auth
  setTimeout(() => {
    startLogout();
    setLogged(false);
  }, 0);

  return;
}


      setSaving(false);
      navigation.goBack();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Update failed"
      );
      setSaving(false);
    }
  };

return (
  <KeyboardAvoidingView
    style={styles.root}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    {/* HEADER */}
    <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={16} color="#aaff00" />
      </Pressable>
      <Text style={styles.headerTitle}>IDENTITY AUTHORITY</Text>
    </View>

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      {/* FRAME */}
      <View style={styles.frame}>
        {/* IDENTITY */}
        <Section title="IDENTITY RECORD">
          <Field label="FULL NAME">
            <Input value={name} onChangeText={setName} />
          </Field>

          <Field label="EMAIL VECTOR">
            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Field>
        </Section>

        {/* SECURITY */}
        <Section title="CREDENTIAL OVERRIDE" danger>
          <Field label="CURRENT PASSWORD">
            <Input
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
          </Field>

          <Field label="NEW PASSWORD">
            <Input
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </Field>

          <Field label="CONFIRM PASSWORD">
            <Input
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </Field>

          <Text style={styles.warning}>
            SESSION TERMINATES ON SUCCESS
          </Text>
        </Section>

        {/* EXECUTE */}
        <View style={styles.executeZone}>
          <Pressable
            onPress={saveProfile}
            disabled={saving}
            style={({ pressed }) => [
              styles.executeBtn,
              pressed && { opacity: 0.7 },
              saving && { opacity: 0.4 },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#020202" />
            ) : (
              <Text style={styles.executeText}>EXECUTE AUTHORIZATION</Text>
            )}
          </Pressable>
        </View>

        {/* STATUS */}
        {error && (
          <View style={styles.status}>
            <Text style={styles.statusText}>{error}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);


}

/* ---------- SYSTEM COMPONENTS ---------- */
const Section = ({ title, danger, children }) => (
  <View style={[styles.section, danger && styles.sectionDanger]}>
    <Text style={[styles.sectionTitle, danger && styles.sectionTitleDanger]}>
      {title}
    </Text>
    {children}
  </View>
);

const Field = ({ label, children }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

const Input = props => (
  <TextInput
    {...props}
    placeholderTextColor="#2a2a2a"
    style={styles.input}
  />
);


const SystemBlock = ({ label, children }) => (
  <View style={styles.systemBlock}>
    <Text style={styles.systemLabel}>{label}</Text>
    <View style={styles.systemBody}>{children}</View>
  </View>
);

const SystemRow = ({ label, children }) => (
  <View style={styles.systemRow}>
    <Text style={styles.systemRowLabel}>{label}</Text>
    {children}
  </View>
);

const SystemInput = props => (
  <TextInput
    {...props}
    placeholderTextColor="#3d3d3d"
    style={styles.systemInput}
  />
);

const SystemDivider = () => <View style={styles.systemDivider} />;

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#010102",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    marginBottom: 20,
  },

  back: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#1f4020",
  },

  headerTitle: {
    color: "#aaff00",
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: "900",
  },

  frame: {
    marginHorizontal: 18,
    borderWidth: 1,
    borderColor: "#142e1c",
    paddingVertical: 26,
  },

  section: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },

  sectionDanger: {
    borderTopWidth: 1,
    borderTopColor: "#2a1414",
    marginTop: 8,
  },

  sectionTitle: {
    color: "#6b7280",
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 18,
  },

  sectionTitleDanger: {
    color: "#ff6b6b",
  },

  field: {
    marginBottom: 18,
  },

  fieldLabel: {
    color: "#9ca3af",
    fontSize: 9,
    letterSpacing: 2.4,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#1f4020",
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: "#e6ffe1",
    fontSize: 15,
  },

  warning: {
    color: "#a16262",
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 6,
  },

  executeZone: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 26,
    borderTopWidth: 1,
    borderTopColor: "#142e1c",
  },

  executeBtn: {
    height: 52,
    backgroundColor: "#aaff00",
    alignItems: "center",
    justifyContent: "center",
  },

  executeText: {
    color: "#010102",
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: "900",
  },

  status: {
    paddingHorizontal: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#2a1414",
  },

  statusText: {
    color: "#ff6b6b",
    fontSize: 10,
    letterSpacing: 1.6,
    textAlign: "center",
  },
});

