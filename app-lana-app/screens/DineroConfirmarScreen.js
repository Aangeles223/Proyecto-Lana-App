import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import LogoLana from "../components/LogoLana";

export default function AgregarDineroConfirmarScreen({ navigation, route }) {
  const {
    usuario_id,
    monto,
    metodo,
    icon,
    extra,
    categoria_id = null,
    tipo = "ingreso",
    descripcion = "Depósito",
  } = route.params;

  const handleConfirmar = async () => {
    try {
      const response = await fetch("http://172.20.10.6:3000/transacciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id,
          tipo,
          categoria_id,
          monto,
          fecha: new Date().toISOString().split("T")[0], // yyyy-mm-dd
          descripcion,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        Alert.alert("Error", "No se pudo registrar la transacción.");
        return;
      }

      const data = await response.json();

      if (data.success) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Depósito exitoso",
            body: `Se depositaron $${monto} a tu cuenta.`,
            sound: true,
          },
          trigger: null,
        });

        // Aquí muestra el alert de éxito
        Alert.alert(
          "Transacción exitosa",
          `Se registró el depósito de $${monto} correctamente.`,
          [
            {
              text: "Aceptar",
              onPress: () => navigation.replace("MainTabs", { screen: "Menu" }),
            },
          ],
          { cancelable: false }
        );

      } else {
        Alert.alert("Error", "No se pudo registrar la transacción.");
      }
    } catch (error) {
      console.error("Error al registrar transacción:", error);
      Alert.alert("Error", "Ocurrió un error al registrar la transacción.");
    }
  };


  let MetodoIcon = null;
  if (icon === "cc-visa")
    MetodoIcon = <FontAwesome5 name="cc-visa" size={32} color="#1976d2" />;
  else if (icon === "bank-transfer")
    MetodoIcon = (
      <MaterialCommunityIcons name="bank-transfer" size={32} color="#388e3c" />
    );
  else if (icon === "cash")
    MetodoIcon = <MaterialCommunityIcons name="cash" size={32} color="#388e3c" />;
  else if (icon === "dots-horizontal")
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
        <View style={{ flex: 1 }} />
      </View>

      <View style={styles.centerContent}>
        <Text style={styles.title}>Agregar dinero</Text>
        <Text style={styles.monto}>${monto}</Text>
        <Text style={styles.confirmar}>Confirmar Pago</Text>
        <Text style={styles.label}>Método de pago</Text>
        <View style={styles.metodoRow}>
          {MetodoIcon}
          <Text style={styles.metodoText}>
            {metodo} {extra ? <Text style={styles.extra}>{extra}</Text> : null}
          </Text>
        </View>
      </View>

      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.button} onPress={handleConfirmar}>
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
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