import React, { createContext, useContext, useRef, useState } from "react";
import { Animated, Text, StyleSheet } from "react-native";

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;

  const show = (text, duration = 2000) => {
    setMessage(text);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMessage(null));
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <Animated.View style={[styles.toast, { opacity }]}>
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: "#111",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  text: {
    color: "#e5ffe0",
    fontWeight: "600",
  },
});
