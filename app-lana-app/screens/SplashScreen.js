import React from "react";
import { View, StyleSheet } from "react-native";
import LogoLana from "../components/LogoLana";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <LogoLana />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#64C7D0",
    justifyContent: "center",
    alignItems: "center",
  },
});
