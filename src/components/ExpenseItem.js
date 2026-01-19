import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ExpenseItem({ title, amount, currency, category }) {
  return (
    <View style={styles.row}>
      <Ionicons name="pricetag" size={20} color="#6ee7b7" />
      <View style={styles.middle}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.category}>{category}</Text>
      </View>
      <Text style={styles.amount}>
        {currency}
        {amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#0f2a16",
  },
  middle: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: "#e5ffe0",
    fontWeight: "600",
    fontSize: 15,
  },
  category: {
    color: "#6ee7b7",
    fontSize: 12,
  },
  amount: {
    color: "#a3ff12",
    fontWeight: "800",
  },
});
