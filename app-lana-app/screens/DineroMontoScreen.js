import React, { useState } from "react";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LogoLana from "../components/LogoLana";

// Determinar base URL (no usado aquí pero preparado para futuras llamadas API)
const host = Constants.manifest?.debuggerHost?.split(":")[0] || "172.20.10.6";
const BASE_URL = `http://${host}:3000`;

export default function AgregarDineroMontoScreen({ navigation }) {
  const [monto, setMonto] = useState("");

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
        <Text style={styles.label}>Ingresa el monto</Text>
        <TextInput
          style={styles.input}
          value={monto}
          onChangeText={setMonto}
          keyboardType="numeric"
          placeholder="$0"
          placeholderTextColor="#bdbdbd"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            monto && navigation.navigate("AgregarDineroMetodo", { monto })
          }
        >
          <Text style={styles.buttonText}>Continuar</Text>
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
  },
  label: {
    fontSize: 24,
    color: "#222",
    fontFamily: "serif",
    marginTop: 40,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    fontSize: 36,
    color: "#43a047",
    fontFamily: "serif",
    textAlign: "center",
    borderBottomWidth: 2,
    borderColor: "#222",
    width: 200,
    marginBottom: 30,
    backgroundColor: "transparent",
  },
  button: {
    backgroundColor: "#54bcd4",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 20,
    width: 200,
    alignItems: "center",
  },
  buttonText: { color: "#222", fontSize: 18, fontFamily: "serif" },
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
