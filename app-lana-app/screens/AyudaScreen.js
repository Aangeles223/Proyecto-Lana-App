import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import LogoLana from "../components/LogoLana";

export default function AyudaScreen() {
  return (
    <LinearGradient colors={["#7fd8f7", "#e0f7fa"]} style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          {/* Si quieres un botón atrás, ponlo aquí. Si no, deja vacío */}
        </View>
        <View style={{ flex: 2, alignItems: "center" }}>
          <LogoLana />
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <TouchableOpacity style={styles.bellContainer}>
            <Ionicons name="notifications-outline" size={28} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Card */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.optionBtn}>
          <Text style={styles.optionText}>Contáctanos</Text>
          <Ionicons name="chevron-forward" size={24} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionBtn}>
          <Text style={styles.optionText}>Ayúdanos a mejorar</Text>
          <Ionicons name="chevron-forward" size={24} color="#222" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 24,
    backgroundColor: "transparent",
    justifyContent: "center",
  },
  bellContainer: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  card: {
    backgroundColor: "#faf7f7",
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    marginTop: 30,
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginVertical: 12,
    width: "80%",
    justifyContent: "space-between",
    elevation: 2,
  },
  optionText: {
    fontSize: 20,
    color: "#222",
    fontFamily: "serif",
  },
});
