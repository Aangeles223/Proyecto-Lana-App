import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import LogoLana from "../components/LogoLana";

export default function AgregarDineroMetodoScreen({ navigation, route }) {
  const { monto } = route.params;

  return (
    <View style={styles.background}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 2, alignItems: "center" }}>
          <LogoLana />
        </View>
        <View style={{ flex: 1 }} />
      </View>
      {/* Contenido centrado */}
      <View style={styles.centerContent}>
        <Text style={styles.title}>Agregar dinero</Text>
        <TouchableOpacity
          style={styles.metodoBtn}
          onPress={() =>
            navigation.navigate("AgregarDineroConfirmar", {
              monto,
              metodo: "Tarjeta",
              icon: "cc-visa",
              extra: "Visa 7764",
            })
          }
        >
          <FontAwesome5
            name="cc-visa"
            size={28}
            color="#1976d2"
            style={styles.metodoIcon}
          />
          <Text style={styles.metodoText}>Tarjeta</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.metodoBtn}
          onPress={() =>
            navigation.navigate("AgregarDineroConfirmar", {
              monto,
              metodo: "Transferencia",
              icon: "bank-transfer",
              extra: "",
            })
          }
        >
          <MaterialCommunityIcons
            name="bank-transfer"
            size={28}
            color="#388e3c"
            style={styles.metodoIcon}
          />
          <Text style={styles.metodoText}>Transferencia</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.metodoBtn}
          onPress={() =>
            navigation.navigate("AgregarDineroConfirmar", {
              monto,
              metodo: "Efectivo",
              icon: "cash",
              extra: "",
            })
          }
        >
          <MaterialCommunityIcons
            name="cash"
            size={28}
            color="#388e3c"
            style={styles.metodoIcon}
          />
          <Text style={styles.metodoText}>Efectivo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.metodoBtn}
          onPress={() =>
            navigation.navigate("AgregarDineroConfirmar", {
              monto,
              metodo: "Otro",
              icon: "dots-horizontal",
              extra: "",
            })
          }
        >
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={28}
            color="#888"
            style={styles.metodoIcon}
          />
          <Text style={styles.metodoText}>Otro</Text>
        </TouchableOpacity>
      </View>
      {/* Botón Salir abajo */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => navigation.replace("Login")}
        >
          <Text style={styles.logoutText}>Salir</Text>
          <Ionicons
            name="arrow-forward"
            size={28}
            color="red"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#faf7f7",
    paddingTop: 30,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -40,
  },
  title: {
    fontSize: 28,
    color: "#222",
    fontFamily: "serif",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },
  metodoBtn: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 8,
    width: 260,
  },
  metodoIcon: { marginRight: 16 },
  metodoText: { fontSize: 22, fontFamily: "serif", color: "#222" },
  bottomArea: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
  },
  logoutText: {
    color: "red",
    fontSize: 22,
    fontFamily: "serif",
    marginRight: 4,
  },
});
