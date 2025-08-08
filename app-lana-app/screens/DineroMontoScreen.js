import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LogoLana from "../components/LogoLana";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AgregarDineroMontoScreen({ navigation }) {
  const [monto, setMonto] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUsuarioId(user.id);
        } else {
          Alert.alert("Error", "No se encontró usuario guardado.");
        }
      } catch (error) {
        console.error("Error obteniendo usuario:", error);
        Alert.alert("Error", "No se pudo cargar información de usuario.");
      }
    };
    obtenerUsuario();
  }, []);

  const handleContinuar = () => {
    const montoNum = parseFloat(monto);
    if (!usuarioId) {
      Alert.alert("Error", "No se pudo obtener el usuario. Intenta de nuevo.");
      return;
    }
    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      Alert.alert("Error", "Ingresa un monto válido mayor a 0.");
      return;
    }
    navigation.navigate("AgregarDineroMetodo", { monto: montoNum, usuario_id: usuarioId });
  };

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
          style={[
            styles.button,
            (!usuarioId || !monto || parseFloat(monto) <= 0) && styles.buttonDisabled,
          ]}
          onPress={handleContinuar}
          disabled={!usuarioId || !monto || parseFloat(monto) <= 0}
        >
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </View>

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
  buttonDisabled: {
    backgroundColor: "#a0a0a0",
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