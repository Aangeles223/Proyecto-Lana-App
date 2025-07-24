// En App.js o componente raíz
import React, { useEffect, useRef } from "react";
import { AppState, TouchableWithoutFeedback } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const INACTIVITY_LIMIT = 3 * 60 * 1000; // 3 minutos

export default function InactivityHandler({ children, onLogout }) {
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await AsyncStorage.removeItem("user");
      if (onLogout) onLogout();
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    resetTimer();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") resetTimer();
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      subscription.remove();
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={resetTimer}>
      {React.Children.only(children)}
    </TouchableWithoutFeedback>
  );
}
