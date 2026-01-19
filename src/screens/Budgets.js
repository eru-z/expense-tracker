import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../api/client";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";


/* ======================================================
   CONSTANTS
====================================================== */

const PRESET_CATEGORIES = [
  "Food",
  "Transport",
  "Fun",
  "Subscriptions",
  "Shopping",
  "Health",
  "Other",
];

/* ======================================================
   SCREEN
====================================================== */

export default function Budgets() {
  const insets = useSafeAreaInsets();

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [limit, setLimit] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [saving, setSaving] = useState(false);

  /* ===================== DATA ===================== */

const loadBudgets = useCallback(async () => {
  try {
    const res = await api.get("/budgets");
    setBudgets(res.data || []);
  } catch (e) {
    if (!e.isAuthError) {
      console.warn("Failed to load budgets:", e.message);
    }
  }
}, []);


useEffect(() => {
  setLoading(false); // 👈 show UI immediately
  loadBudgets();     // 👈 fetch in background
}, []);


  const totals = useMemo(() => {
    const totalLimit = budgets.reduce((s, b) => s + Number(b.limit || 0), 0);
    const totalUsed = budgets.reduce((s, b) => s + Number(b.used || 0), 0);
    return { totalLimit, totalUsed };
  }, [budgets]);

  /* ===================== ACTIONS ===================== */

  const resetModal = () => {
    setEditing(null);
    setLimit("");
    setCustomCategory("");
  };

  const openCreate = () => {
    resetModal();
    setModalVisible(true);
  };

  const openEdit = b => {
    setEditing({ ...b });
    setLimit(String(b.limit));
    setCustomCategory("");
    setModalVisible(true);
  };

  const saveBudget = async () => {
    if (saving) return;

    const amount = Number(limit);
    const category = editing?.category || customCategory.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return Alert.alert("Invalid amount", "Enter a positive number");
    }

    if (!editing && !category) {
      return Alert.alert("Missing category", "Select or enter a category");
    }

    try {
      setSaving(true);

      if (editing?.id) {
        await api.put(`/budgets/${editing.id}`, { amount });
      } else {
        await api.post("/budgets", { category, amount });
      }

      setModalVisible(false);
      resetModal();
      await loadBudgets();
    } catch (e) {
      Alert.alert("Error", e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  const removeBudget = id => {
    Alert.alert("Delete budget?", "This cannot be undone.", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await api.delete(`/budgets/${id}`);
          loadBudgets();
        },
      },
    ]);
  };

  /* ===================== RENDER ===================== */

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#000", "#020202"]}
        style={StyleSheet.absoluteFill}
      />

      {/* FIXED HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Budgets</Text>

        <TouchableOpacity style={styles.headerAdd} onPress={openCreate}>
          <Ionicons name="add" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
{/* HERO — VINFINITY GLASS */}
<Animated.View
  entering={FadeInUp.duration(600)}
  style={styles.heroGlass}
>
  <Text style={styles.heroLabel}>Total usage</Text>

  <Text style={styles.heroValue}>
    ${totals.totalUsed}
    <Text style={styles.heroMuted}> / {totals.totalLimit}</Text>
  </Text>

  <View style={styles.heroBarBg}>
    <Animated.View
      style={[
        styles.heroBarFill,
        {
          width:
            totals.totalLimit > 0
              ? `${Math.min(
                  totals.totalUsed / totals.totalLimit,
                  1
                ) * 100}%`
              : "0%",
        },
      ]}
    />
  </View>
</Animated.View>


        {/* LOADING */}
        {loading && (
          <ActivityIndicator
            size="large"
            color="#a3ff12"
            style={{ marginTop: 40 }}
          />
        )}

        {/* EMPTY */}
        {!loading && budgets.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={48} color="#a3ff12" />
            <Text style={styles.emptyTitle}>No budgets yet</Text>
            <Text style={styles.emptySub}>
              Create budgets to stay in control
            </Text>
          </View>
        )}

        {/* LIST */}
{budgets.map((b, i) => {
  const ratio = b.limit > 0 ? Math.min(b.used / b.limit, 1) : 0;

  return (
    <Animated.View
      key={b.id}
      entering={FadeInDown.delay(i * 80)}
      style={styles.budgetCard}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{b.category}</Text>

        <View style={styles.rowActions}>
          <TouchableOpacity onPress={() => openEdit(b)}>
            <Ionicons name="create-outline" size={18} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeBudget(b.id)}>
            <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.cardSub}>
        ${b.used} of ${b.limit}
      </Text>

      <View style={styles.cardBarBg}>
        <View
          style={[
            styles.cardBarFill,
            { width: `${ratio * 100}%` },
          ]}
        />
      </View>
    </Animated.View>
  );
})}

      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
<View style={[styles.modalVinfinity, { paddingBottom: insets.bottom + 24 }]}>
            <Text style={styles.modalTitle}>
              {editing ? "Edit budget" : "New budget"}
            </Text>

            {!editing && (
              <>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryRow}>
                  {PRESET_CATEGORIES.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={styles.catChip}
                      onPress={() => {
                        setEditing({ category: c });
                        setCustomCategory("");
                      }}
                    >
                      <Text style={styles.catChipText}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  value={customCategory}
                  onChangeText={setCustomCategory}
                  placeholder="Custom category"
                  placeholderTextColor="#6b7280"
                  style={styles.input}
                />
              </>
            )}

            <Text style={styles.label}>Budget limit</Text>
            <TextInput
              value={limit}
              onChangeText={setLimit}
              keyboardType="numeric"
              placeholder="e.g. 800"
              placeholderTextColor="#6b7280"
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetModal();
                }}
              >
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={saveBudget}
                disabled={saving}
              >
                <Text style={styles.saveText}>
                  {saving ? "Saving…" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

/* ======================================================
   STYLES — iPhone 15 Pro tuned
====================================================== */
const NEON = "#a3ff12";

const styles = StyleSheet.create({
  /* ================= ROOT ================= */
  root: {
    flex: 1,
    backgroundColor: "#000",
  },

  /* ================= HEADER ================= */
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 96,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.78)",
    borderBottomWidth: 0.5,
    borderColor: "#1f1f1f",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.6,
  },

  headerAdd: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: NEON,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: NEON,
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },

  /* ================= SCROLL ================= */
  scroll: {
    paddingTop: 120,
  },

  /* ================= HERO (VINFINITY GLASS) ================= */
  heroGlass: {
    marginHorizontal: 20,
    padding: 26,
    borderRadius: 30,
    backgroundColor: "rgba(12,12,12,0.88)",
    borderWidth: 1,
    borderColor: "#1f2937",
    shadowColor: NEON,
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 18,
    marginBottom: 40,
  },

  heroLabel: {
    color: "#9ca3af",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },

  heroValue: {
    marginTop: 8,
    fontSize: 42,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.4,
  },

  heroMuted: {
    color: "#6b7280",
    fontSize: 18,
    fontWeight: "500",
  },

  heroSub: {
    marginTop: 6,
    color: "#9ca3af",
    fontSize: 14,
  },

  heroBarBg: {
    marginTop: 20,
    height: 12,
    backgroundColor: "#0a0a0a",
    borderRadius: 999,
    overflow: "hidden",
  },

  heroBarFill: {
    height: "100%",
    backgroundColor: NEON,
    borderRadius: 999,
    shadowColor: NEON,
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },

  /* ================= EMPTY ================= */
  empty: {
    alignItems: "center",
    marginTop: 90,
    opacity: 0.85,
  },

  emptyTitle: {
    marginTop: 14,
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },

  emptySub: {
    marginTop: 6,
    color: "#9ca3af",
    fontSize: 14,
  },

  /* ================= BUDGET CARD ================= */
  budgetCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 22,
    borderRadius: 26,
    backgroundColor: "#050505",
    borderWidth: 1,
    borderColor: "#1f2937",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.2,
  },

  cardSub: {
    marginTop: 8,
    color: "#9ca3af",
    fontSize: 14,
  },

  rowActions: {
    flexDirection: "row",
    gap: 18,
  },

  cardBarBg: {
    marginTop: 16,
    height: 6,
    backgroundColor: "#0e0e0e",
    borderRadius: 999,
    overflow: "hidden",
  },

  cardBarFill: {
    height: "100%",
    backgroundColor: NEON,
    borderRadius: 999,
  },

  /* ================= CATEGORY CHIPS ================= */
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },

  catChip: {
    backgroundColor: "#0b0b0b",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  catChipText: {
    color: NEON,
    fontSize: 12,
    fontWeight: "600",
  },

  /* ================= MODAL ================= */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },

  modalVinfinity: {
    backgroundColor: "#050505",
    padding: 26,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    borderTopWidth: 1,
    borderColor: "#1f2937",
  },

  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  label: {
    color: "#9ca3af",
    marginTop: 22,
    fontSize: 13,
  },

  input: {
    borderBottomWidth: 1,
    borderColor: "#1f2937",
    color: "#fff",
    paddingVertical: 12,
    marginTop: 8,
    fontSize: 16,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 34,
  },

  cancel: {
    color: "#9ca3af",
    fontSize: 15,
  },

  saveBtn: {
    backgroundColor: NEON,
    paddingHorizontal: 34,
    paddingVertical: 14,
    borderRadius: 26,
    shadowColor: NEON,
    shadowOpacity: 0.5,
    shadowRadius: 14,
  },

  saveText: {
    color: "#020202",
    fontWeight: "800",
    fontSize: 15,
  },
});
