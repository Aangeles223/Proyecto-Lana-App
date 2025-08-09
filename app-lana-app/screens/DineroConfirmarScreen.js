import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import LogoLana from "../components/LogoLana";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Determinar base URL
const host = Constants.manifest?.debuggerHost?.split(":")[0] || "172.20.10.6";
const BASE_URL = `http://${host}:3000`;

export default function AgregarDineroConfirmarScreen({ navigation, route }) {
  const { monto, metodo, icon, extra } = route.params;

  const handleConfirmar = async () => {
    try {
      // Crear transacción de ingreso
      const userStr = await AsyncStorage.getItem("user");
      const { id: usuario_id } = JSON.parse(userStr);
      const fecha = new Date().toISOString().split("T")[0];
      await fetch(`${BASE_URL}/transacciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id,
          categoria_id: null, // ajusta si necesitas una categoría específica
          monto: Number(monto),
          tipo: "ingreso",
          fecha,
        }),
      });
    } catch (e) {
      console.error(e);
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Depósito exitoso",
        body: `Se depositaron $${monto} a tu cuenta.`,
        sound: true,
      },
      trigger: null,
    });
    navigation.replace("MainTabs", { screen: "Menu" });
  };

  let MetodoIcon = null;
  if (icon === "cc-visa")
    MetodoIcon = <FontAwesome5 name="cc-visa" size={32} color="#1976d2" />;
  if (icon === "bank-transfer")
    MetodoIcon = (
      <MaterialCommunityIcons name="bank-transfer" size={32} color="#388e3c" />
    );
  if (icon === "cash")
    MetodoIcon = (
      <MaterialCommunityIcons name="cash" size={32} color="#388e3c" />
    );
  if (icon === "dots-horizontal")
    MetodoIcon = (
      <MaterialCommunityIcons name="dots-horizontal" size={32} color="#888" />
    );

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
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          {/* Si quieres una campana aquí, agrégala. Si no, deja vacío */}
        </View>
      </View>
      {/* Contenido centrado */}
      <View style={styles.centerContent}>
        <Text style={styles.title}>Agregar dinero</Text>
        <Text style={styles.monto}>${monto}</Text>
        <Text style={styles.confirmar}>Confirmar Pago</Text>
        <Text style={styles.label}>Metodo de pago</Text>
        <View style={styles.metodoRow}>
          {MetodoIcon}
          <Text style={styles.metodoText}>
            {metodo} {extra ? <Text style={styles.extra}>{extra}</Text> : null}
          </Text>
        </View>
      </View>
      {/* Botón Confirmar y Salir abajo */}
      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.button} onPress={handleConfirmar}>
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await AsyncStorage.removeItem("isLoggedIn");
            await AsyncStorage.removeItem("user");
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          }}
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
    marginTop: 10,
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
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },
  monto: {
    fontSize: 48,
    color: "#222",
    fontFamily: "serif",
    marginTop: 10,
    textAlign: "center",
  },
  confirmar: {
    fontSize: 22,
    color: "#222",
    fontFamily: "serif",
    textAlign: "center",
    marginTop: 10,
  },
  label: {
    fontSize: 18,
    color: "#222",
    fontFamily: "serif",
    marginTop: 30,
    textAlign: "center",
  },
  metodoRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  metodoText: {
    fontSize: 22,
    fontFamily: "serif",
    color: "#222",
    marginLeft: 10,
  },
  extra: { fontSize: 18, color: "#222", fontFamily: "serif", marginLeft: 8 },
  bottomArea: {
    alignItems: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#54bcd4",
    borderRadius: 8,
    paddingVertical: 12,
    width: 260,
    alignItems: "center",
    marginBottom: 18,
  },
  buttonText: { color: "#222", fontSize: 18, fontFamily: "serif" },
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
