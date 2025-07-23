import React from "react";
import { Image, View, StyleSheet } from "react-native";
import logoLana from "../assets/Logo.png";

export default function LogoLana({ style }) {
  return (
    <View style={styles.container}>
      <Image source={logoLana} style={[styles.logo, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 94,
    resizeMode: "contain",
  },
});
