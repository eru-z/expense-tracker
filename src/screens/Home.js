import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../api/client";
import { TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { formatMoney, setCurrency } from "../utils/Currency";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";



const COLORS = {
  primary: "#7ED957",        // soft premium green
  primarySoft: "rgba(126,217,87,0.15)",
  primaryGlow: "rgba(126,217,87,0.25)",
  textMain: "#E5FBE0",
  textMuted: "#9CA3AF",
  danger: "#FF6B6B",
  background: "#020202",
  card: "#0B0F0C",
  barBg: "#1F2937",
};


const { width, height } = Dimensions.get("window");




const Upcoming = ({ text }) => (
  <View style={styles.upcoming}>
    <Ionicons name="time" size={16} color="#a3ff12" />
    <Text style={styles.upcomingText}>{text}</Text>
  </View>
);

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);
// ================================
// MAIN COMPONENT
// ================================
const Insight = ({ text }) => {
  if (!text) return null;
  return (
    <View style={styles.insight}>
      <Text style={styles.insightText}>{text}</Text>
    </View>
  );
};


const PulseScore = ({ score }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!score) return;
    const id = score.addListener(v => setVal(Math.round(v.value || 0)));
    return () => score.removeListener(id);
  }, [score]);

  return (
    <View style={styles.scoreCard}>
      <Text style={styles.scoreLabel}>Pulse Score</Text>
      <Text style={styles.scoreValue}>{val}</Text>
    </View>
  );
};

const SummaryCards = ({ transactions = [] }) => {
  const income = transactions
    .filter(t => Number(t.amount) > 0)
    .reduce((s, t) => s + Number(t.amount), 0);

  const expense = transactions
    .filter(t => Number(t.amount) < 0)
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  const savings = income - expense;

  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Income</Text>
<Text style={[styles.summaryValue, { color: "#a3ff12" }]}>
  {formatMoney(income)}
</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Expenses</Text>
<Text style={[styles.summaryValue, { color: "#ff7676" }]}>
  {formatMoney(expense)}
</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Savings</Text>
<Text style={styles.summaryValue}>
  {formatMoney(savings)}
</Text>
      </View>
    </View>
  );
};


export default function Home({ navigation }) {
  const insets = useSafeAreaInsets();
const [currencyVersion, setCurrencyVersion] = useState(0);

  // --- Animated refs ---
  const fade = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const balanceAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const actionScale = useRef(new Animated.Value(1)).current;
  const particles = useRef([...Array(12)].map(() => new Animated.Value(Math.random()))).current;

  // --- State ---

const [transactions, setTransactions] = useState([]);
const [budgets, setBudgets] = useState([]);

  const computedBudgets = useMemo(() => budgets, [budgets]);

  // --- Insight ---
const insight = useMemo(() => {
  if (!budgets.length && !transactions.length) return "";

  const overspent = budgets.find(b => b.used > b.limit);
  if (overspent) {
    return `Overspent on ${overspent.category} by ${formatMoney(
  overspent.used - overspent.limit
)}`;
  }

  const big = transactions.find(t => t.amount < -200);
  if (big) {
    return `Large expense: ${big.title} (${formatMoney(Math.abs(big.amount))})`;
  }

  return "You're financially healthy this week 🎉";
}, [budgets, transactions]);


  // --- Data loader ---
const loadData = useCallback(async () => {
  try {
    const [txRes, budgetRes] = await Promise.all([
      api.get("/transactions"),
      api.get("/budgets"),
    ]);

    const rawTx = Array.isArray(txRes.data.transactions)
      ? txRes.data.transactions
      : Array.isArray(txRes.data)
      ? txRes.data
      : [];

    const normalizedTx = rawTx.map(t => ({
      id: t.id,
      title: t.note || "Untitled",
      category: t.category_name || t.category || "General",
      amount: Number(t.amount),
      date: t.occurred_at ? t.occurred_at.slice(0, 10) : "",
      type: t.type,
    }));

    const rawBudgets = Array.isArray(budgetRes.data) ? budgetRes.data : [];

    setTransactions(normalizedTx);
    setBudgets(rawBudgets);
  } catch (e) {
    console.warn("Load failed:", e.message);
  }
}, []);


const loadCurrency = useCallback(async () => {
  try {
    const { data } = await api.get("/settings");
    if (data?.currency) {
      setCurrency(data.currency);
      setCurrencyVersion(v => v + 1);
    }
  } catch {
    // silent fail
  }
}, []);



useFocusEffect(
  useCallback(() => {
    loadCurrency();
    loadData();
  }, [loadCurrency, loadData])
);



  // --- Finance core ---
  const { balance, burnRate, runway, savingsRate } = useMemo(() => {
    const tx = Array.isArray(transactions) ? transactions : [];
    const bal = tx.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const expenses = tx.filter(t => t.amount < 0);
    const days = new Set(expenses.map(t => t.date)).size || 1;
    const burn = expenses.reduce((s, t) => s + Math.abs(t.amount), 0) / days;
    const income = tx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const saveRate = income ? (income - expenses.reduce((s, t) => s + Math.abs(t.amount), 0)) / income : 0;

    return {
      balance: bal,
      burnRate: Math.round(burn),
      runway: burn ? Math.round(bal / burn) : Infinity,
      savingsRate: saveRate,
    };
  }, [transactions]);


  const netWorth = balance;

  // --- Pulse score ---
  const pulseScore = useMemo(() => {
    let score = 100;
computedBudgets.forEach(b => b.used > b.limit && (score -= 15));
    if (balance < 0) score -= 25;
    if (savingsRate < 0.1) score -= 10;
    return Math.max(0, Math.min(score, 100));
 }, [computedBudgets, balance, savingsRate]);

  const personality = useMemo(() => {
    if (pulseScore > 85) return { label: "Wealth Monk 🧘‍♂️", color: "#a3ff12" };
    if (pulseScore > 70) return { label: "Balanced Builder 🏗", color: "#60a5fa" };
    if (pulseScore > 50) return { label: "Risk Taker 🎢", color: "#facc15" };
    return { label: "Fire Fighter 🔥", color: "#ff7676" };
  }, [pulseScore]);

  // --- Animations ---
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: false }),
      Animated.timing(balanceAnim, { toValue: balance, duration: 1200, useNativeDriver: false }),
      Animated.timing(scoreAnim, { toValue: pulseScore, duration: 1200, useNativeDriver: false }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 2400, useNativeDriver: false }),
          Animated.timing(breathe, { toValue: 0, duration: 2400, useNativeDriver: false }),
        ])
      ),
    ]).start();
  }, [balance, pulseScore]);

  useEffect(() => {
    particles.forEach(p => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(p, { toValue: 1, duration: 6000 + Math.random() * 4000, useNativeDriver: false }),
          Animated.timing(p, { toValue: 0, duration: 6000 + Math.random() * 4000, useNativeDriver: false }),
        ])
      ).start();
    });
  }, []);



  // --- Derived ---
  const anomalies = useMemo(() => {
    const tx = Array.isArray(transactions) ? transactions : [];
    const avg = tx.reduce((s, t) => s + Math.abs(t.amount || 0), 0) / (tx.length || 1);
    return tx.filter(t => Math.abs(t.amount || 0) > avg * 3);
  }, [transactions]);

  const glowOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.35] });
  const safeNav = (route, params) => navigation?.navigate && navigation.navigate(route, params);

  // --- Render ---
  return (
    <View key={currencyVersion} style={styles.root}>
      <LinearGradient colors={["#020202", "#071a11", "#020202"]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 40, paddingBottom: 200 }}>
        <Animated.View style={{ opacity: fade }}>
          <PulseScore score={scoreAnim} />
          <Text style={{ color: personality.color, textAlign: "center", marginBottom: 12 }}>
            {personality.label}
          </Text>

<Balance amount={balanceAnim} />

<SummaryCards transactions={transactions} />
<QuickActions navigate={safeNav} scale={actionScale} />


          {insight ? <Insight text={insight} /> : null}

          <Section title="Overview">
<Text style={styles.rowText}>
  Net Worth: {formatMoney(netWorth)}
</Text>

<Text style={styles.rowText}>
  Burn Rate: {formatMoney(burnRate)}/day
</Text>

            <Text style={styles.rowText}>Runway: {runway} days</Text>
          </Section>

          <Section title="Recent Transactions">
  {transactions.slice(0,5).map(t => (
    <TransactionRow key={t.id} {...t} navigate={safeNav} />
  ))}
</Section>

<Section title="Budgets">
{computedBudgets.map(b => (
  <BudgetRow key={b.id} {...b} navigate={safeNav} />
))}
</Section>


<HomeExtensions transactions={transactions} budgets={computedBudgets} />


        </Animated.View>
      </ScrollView>
<AICopilot
  transactions={transactions}
  budgets={budgets}
  balance={balance}
/>

    </View>
  );
}

// ================================
// UI COMPONENTS
// ================================




const Balance = ({ amount }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!amount) return;

    const id = amount.addListener(v => setVal(Math.round(v.value || 0)));
    return () => amount.removeListener(id);
  }, [amount]);

  return (
    <Text style={styles.balance}>{formatMoney(val)}</Text>
  );
};



const QuickActions = ({ navigate, scale }) => {
  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();

  return (
    <View style={styles.actions}>
      {/* EXPENSE */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={styles.action}
          onPressIn={pressIn}
          onPressOut={pressOut}
          onPress={() => navigate("Add")}
        >
          <Ionicons name="remove" size={24} color="#020202" />
          <Text style={styles.actionLabel}>Expense</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* INCOME */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={styles.action}
          onPressIn={pressIn}
          onPressOut={pressOut}
          onPress={() => navigate("Add", { type: "income" })}
        >
          <Ionicons name="add" size={24} color="#020202" />
          <Text style={styles.actionLabel}>Income</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* TRANSFER */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={styles.action}
          onPressIn={pressIn}
          onPressOut={pressOut}
          onPress={() => navigate("Add", { type: "transfer" })}
        >
          <Ionicons name="swap-horizontal" size={24} color="#020202" />
          <Text style={styles.actionLabel}>Transfer</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};


const TransactionRow = ({ id, title, category, amount, date, navigate }) => (
  <TouchableOpacity style={styles.row} onPress={() => navigate("Settings", { highlightTransaction: id })}>
    <View>
      <Text style={styles.rowText}>{title}</Text>
      <Text style={{ color: "#9ca3af", fontSize: 11 }}>{category} • {date}</Text>
    </View>
    <Text style={[styles.rowText, { color: amount > 0 ? "#a3ff12" : "#ff7676" }]}>{amount > 0 ? "+" : "-"}
{formatMoney(Math.abs(amount))}</Text>
  </TouchableOpacity>
);

const BudgetRow = ({ category, used, limit, navigate }) => {
  const percent = limit > 0 ? Math.min(used / limit, 1) : 0;
  return (
    <TouchableOpacity onPress={() => navigate("Budgets", { category })}>
      <View style={{ marginBottom: 12 }}>
        <View style={styles.row}>
          <Text style={styles.rowText}>{category}</Text>
          <Text style={styles.rowText}>{Math.round(percent * 100)}%</Text>
        </View>
        <View style={styles.barBg}><View style={[styles.barFill, { width: `${percent * 100}%` }]} /></View>
      </View>
    </TouchableOpacity>
  );
};


const Achievements = () => (
  <Section title="Achievements">
    <View style={styles.achievementRow}>
      <Achievement icon="trophy" label="Saver" />
      <Achievement icon="flame" label="5-Day Streak" />
      <Achievement icon="rocket" label="Goal Crusher" />
    </View>
  </Section>
);

const Achievement = ({ icon, label }) => (
  <View style={styles.achievement}>
    <Ionicons name={icon} size={22} color="#a3ff12" />
    <Text style={styles.achievementText}>{label}</Text>
  </View>
);



// ================================
// STYLES
// ================================

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020202" },

  glow: {
    position: "absolute",
    top: 140,
    alignSelf: "center",
    width: 340,
    height: 340,
    borderRadius: 999,
    backgroundColor: "rgba(163,255,18,0.4)",
  },

  scoreCard: {
    alignSelf: "center",
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(163,255,18,0.12)",
  },
  scoreLabel: { color: "#a3ff12", fontSize: 12, textAlign: "center" },
  scoreValue: { color: "#a3ff12", fontSize: 20, fontWeight: "600", textAlign: "center" },

  balance: {
    color: "#a3ff12",
    fontSize: 44,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },

  actions: { flexDirection: "row", justifyContent: "space-around", marginHorizontal: 24, marginBottom: 24 },
  action: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#a3ff12",
    alignItems: "center",
    justifyContent: "center",
  },

  insight: { marginHorizontal: 24, marginBottom: 16, padding: 16, borderRadius: 20, backgroundColor: "rgba(163,255,18,0.08)" },
  insightText: { color: "#a3ff12", fontSize: 14, textAlign: "center" },

  upcoming: { marginHorizontal: 24, marginBottom: 24, padding: 14, borderRadius: 18, backgroundColor: "rgba(10,10,10,0.8)", flexDirection: "row", alignItems: "center", gap: 8 },
  upcomingText: { color: "#e5ffe0", fontSize: 13 },

  section: { marginHorizontal: 24, marginBottom: 20 },
  sectionTitle: { color: "#a3ff12", fontSize: 16, fontWeight: "700", marginBottom: 12 },

  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  rowText: { color: "#e5ffe0", fontSize: 14 },

  barBg: { height: 4, backgroundColor: "#1f2937", borderRadius: 2 },
  barFill: { height: 4, backgroundColor: "#a3ff12" },

  trend: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  trendBar: { width: 20, backgroundColor: "#a3ff12", borderRadius: 6 },

  achievementRow: { flexDirection: "row", justifyContent: "space-around" },
  achievement: { alignItems: "center" },
  achievementText: { color: "#a3ff12", fontSize: 12, marginTop: 4 },

  coach: { marginHorizontal: 24, marginBottom: 40, padding: 20, borderRadius: 24, backgroundColor: "rgba(10,10,10,0.85)" },
  coachTitle: { color: "#a3ff12", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  coachText: { color: "#e5ffe0", fontSize: 14 },
copilotBtn: {
  position: "absolute",
  right: 20,
  bottom: 100, // fallback
  width: 60,
  height: 60,
  borderRadius: 24,
  backgroundColor: "#a3ff12",
  alignItems: "center",
  justifyContent: "center",
  elevation: 10,
  shadowColor: "#000",
  shadowOpacity: 0.3,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
},

copilotPanel: {
  marginHorizontal: 16,
  marginBottom: 16,
  width: width - 32,
  maxHeight: height * 0.6,
  backgroundColor: "#020202",
  borderRadius: 28,
  padding: 18,
  borderWidth: 1,
  borderColor: "#1f2937",
  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
},


  copilotTitle: { color: "#a3ff12", fontSize: 16, fontWeight: "700", marginBottom: 8 },

  copilotUser: {
    alignSelf: "flex-end",
    backgroundColor: "#1f2937",
    padding: 10,
    borderRadius: 14,
    marginBottom: 6,
  },

  copilotAI: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(163,255,18,0.15)",
    padding: 10,
    borderRadius: 14,
    marginBottom: 6,
  },

  copilotText: { color: "#e5ffe0", fontSize: 13 },

  copilotInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },

  copilotInput: {
    flex: 1,
    height: 38,
    backgroundColor: "#1f2937",
    borderRadius: 12,
    paddingHorizontal: 10,
    color: "#e5ffe0",
    fontSize: 13,
  },
actionLabel: {
  marginTop: 6,
  fontSize: 11,
  fontWeight: "600",
  color: "#020202",
},

summaryRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginHorizontal: 24,
  marginBottom: 24,
},

summaryCard: {
  flex: 1,
  marginHorizontal: 4,
  padding: 14,
  borderRadius: 20,
  backgroundColor: "rgba(163,255,18,0.08)",
  alignItems: "center",
},

summaryLabel: {
  color: "#9ca3af",
  fontSize: 12,
  marginBottom: 4,
},

summaryValue: {
  color: "#e5ffe0",
  fontSize: 16,
  fontWeight: "700",
},
copilotWrapper: {
  position: "absolute",
  left: 0,
  right: 0,
  paddingHorizontal: 16,
},
});

// ================================
// ADDITIVE EXTENSIONS — SAFE MODE
// ================================

const FEATURES = {
  forecast: true,
  trends: true,
  alerts: true,
  wallets: true,
  debug: false,
};

// ---------- Safe helper ----------
const safe = (fn, fallback = null) => {
  try {
    return fn();
  } catch (e) {
    console.warn("Safe block error:", e.message);
    return fallback;
  }
};

// ---------- Forecast ----------
const ForecastCard = ({ transactions }) => {
  if (!FEATURES.forecast) return null;
  const daily = safe(() => {
    const days = new Set(transactions.map(t => t.date)).size || 1;
    const spent = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    return spent / days;
  }, 0);

  const daysLeft = 30 - new Date().getDate();
  const forecast = Math.round(daily * daysLeft);

  return (
    <Section title="Forecast">
      <Text style={{ color: "#e5ffe0" }}>
        Projected spending this month: {formatMoney(forecast)}
      </Text>
    </Section>
  );
};

// ---------- Trends ----------
const Trends = ({ transactions }) => {
  if (!FEATURES.trends) return null;

  const byDay = safe(() => {
    const map = {};
    transactions.forEach(t => {
      map[t.date] = (map[t.date] || 0) + t.amount;
    });
    return Object.values(map).slice(-7);
  }, []);

  return (
    <Section title="7-Day Trend">
      <View style={styles.trend}>
        {byDay.map((v, i) => (
          <View key={i} style={[styles.trendBar, { height: Math.min(80, Math.abs(v)) }]} />
        ))}
      </View>
    </Section>
  );
};

// ---------- Wallets ----------
const Wallets = () => {
  if (!FEATURES.wallets) return null;

  const wallets = [
    { id: 1, name: "Cash", balance: 320 },
    { id: 2, name: "Bank", balance: 2100 },
  ];

  return (
    <Section title="Wallets">
      {wallets.map(w => (
        <View key={w.id} style={styles.row}>
          <Text style={styles.rowText}>{w.name}</Text>
          <Text style={styles.rowText}>{formatMoney(w.balance)}</Text>
        </View>
      ))}
    </Section>
  );
};

// ---------- Alerts ----------
const Alerts = ({ budgets }) => {
  if (!FEATURES.alerts) return null;

  const alerts = safe(
    () => budgets.filter(b => b.used / b.limit > 0.8),
    []
  );

  if (!alerts.length) return null;

  return (
    <Section title="Alerts">
      {alerts.map(b => (
        <Text key={b.category} style={{ color: "#ff7676" }}>
          {b.category} is almost over budget
        </Text>
      ))}
    </Section>
  );
};



// ---------- Hook-in Wrapper ----------
export const HomeExtensions = ({ transactions = [], budgets = [] }) => (
  <>
    <ForecastCard transactions={transactions} />
    <Trends transactions={transactions} />
    <Wallets />
    <Alerts budgets={budgets} />
  </>
);


// ================================
// AI CO-PILOT — SAFE ADDITIVE
// ================================

const COPILOT_ENABLED = true;

// Basic local fallback "AI" so it works without backend
const localAI = (text, { transactions = [], budgets = [], balance = 0, netWorth = 0, runway = 0 }) => {
  const q = text.toLowerCase();

  if (q.includes("runway")) return `You have about ${runway} days before balance hits zero.`;
  if (q.includes("net worth")) return `Your net worth is about ${formatMoney(netWorth)}.`;
;

  if (q.includes("afford")) {
    const match = q.match(/\$?(\d+)/);
    if (match) {
      const price = Number(match[1]);
      return balance > price
        ? `Yes — you can afford it and still have ${formatMoney(balance - price)} left.`
        : `It would put you below zero. You might want to wait.`;
    }
  }

  if (q.includes("food")) {
    const food = transactions.filter(t => t.category === "Food")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
return `You’ve spent ${formatMoney(food)} on Food so far.`;
  }

  return "Ask me about your spending, budgets, or affordability 😊";
};


// ---------- UI ----------
const AICopilot = ({ transactions, budgets, balance }) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight(); 
  if (!COPILOT_ENABLED) return null;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I’m your financial co-pilot. Ask me anything 💬" },
  ]);

const send = async () => {
  if (!input.trim()) return;

  const q = input;
  setMessages(m => [...m, { role: "user", text: q }]);
  setInput("");

  try {
    const res = await api.post("/copilot", {
      message: q,
context: {
  balance,
  budgets,
  transactions: transactions.slice(-50),
},
    });

    setMessages(m => [...m, { role: "assistant", text: res.data.reply }]);
  } catch (e) {
    console.warn("AI error:", e.message);
const fallback = localAI(q, { transactions, budgets, balance });

    setMessages(m => [...m, { role: "assistant", text: fallback }]);
  }
};


  return (
    <>
      {/* Floating Button */}
<TouchableOpacity
  style={[
    styles.copilotBtn,
    { bottom: tabBarHeight + insets.bottom + 16 },
  ]}
  onPress={() => setOpen(o => !o)}
>

        <Ionicons name="chatbubble-ellipses" size={22} color="#020202" />
      </TouchableOpacity>

{/* Panel */}
{open && (
<KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  style={[
    styles.copilotWrapper,
    { bottom: tabBarHeight },
  ]}
  keyboardVerticalOffset={tabBarHeight + insets.bottom}
>

    <View style={styles.copilotPanel}>
      <Text style={styles.copilotTitle}>AI Co-Pilot</Text>

      <ScrollView
        style={{ maxHeight: 260 }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((m, i) => (
          <View
            key={i}
            style={m.role === "user" ? styles.copilotUser : styles.copilotAI}
          >
            <Text style={styles.copilotText}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.copilotInputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your money..."
          placeholderTextColor="#6b7280"
          style={styles.copilotInput}
        />
        <TouchableOpacity onPress={send} disabled={!input.trim()}>
          <Ionicons name="send" size={18} color="#a3ff12" />
        </TouchableOpacity>
      </View>
    </View>
  </KeyboardAvoidingView>
)}

    </>
  );
};
