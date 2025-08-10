import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

// Determinar base URL según Expo debuggerHost o IP de la máquina (LAN)
const manifest = Constants.manifest || {};
const debuggerHost = manifest.debuggerHost?.split(":")[0];
const host = debuggerHost || "10.0.0.11";
const BASE_URL = `http://${host}:3000`;
console.log("BASE_URL EditarPresupuestoScreen:", BASE_URL);
console.log("BASE_URL EditarPresupuestoScreen:", BASE_URL);

export default function EditarPresupuestoScreen({ route, navigation }) {
  const { presupuesto } = route.params;
  const [monto, setMonto] = useState(String(presupuesto.monto_mensual));

  const handleGuardar = async () => {
    if (!monto || isNaN(Number(monto))) {
      Alert.alert("Error", "Ingresa un monto válido.");
      return;
    }
    try {
      const userStr = await AsyncStorage.getItem("user");
      const { id: usuario_id } = JSON.parse(userStr);
      const body = {
        usuario_id,
        categoria_id: presupuesto.categoria_id,
        monto_mensual: Number(monto),
        mes: presupuesto.mes,
        anio: presupuesto.anio,
      };
      const res = await fetch(`${BASE_URL}/presupuestos/${presupuesto.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Éxito", "Presupuesto actualizado correctamente.");
        // Notificación local
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Lana App",
            body: "Tu presupuesto ha sido actualizado.",
          },
          trigger: null,
        });
        navigation.goBack();
      } else {
        Alert.alert("Error", "No se pudo actualizar el presupuesto.");
      }
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleEliminar = () => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Seguro quieres eliminar este presupuesto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const url = `${BASE_URL}/presupuestos/${presupuesto.id}`;
              console.log("DELETE presupuesto URL:", url);
              const res = await fetch(url, { method: "DELETE" });
              console.log("DELETE response status:", res.status);
              if (!res.ok) {
                Alert.alert(
                  "Error",
                  `HTTP ${res.status} al eliminar presupuesto.`
                );
                return;
              }
              const data = await res.json();
              console.log("DELETE response JSON:", data);
              if (data.success) {
                Alert.alert("Éxito", "Presupuesto eliminado.");
                navigation.goBack();
              } else {
                Alert.alert("Error", "No se pudo eliminar presupuesto.");
              }
            } catch (e) {
              console.error("Error al eliminar presupuesto:", e);
              Alert.alert("Error", e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.background}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.centerContent}>
          <Text style={styles.title}>Editar presupuesto</Text>
          <Text style={styles.label}>Categoría</Text>
          <Text style={styles.categoriaText}>{presupuesto.categoria}</Text>
          <Text style={styles.label}>Monto</Text>
          <TextInput
            style={styles.input}
            value={monto}
            onChangeText={setMonto}
            placeholder="Monto"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handleGuardar}>
            <Text style={styles.buttonText}>Guardar cambios</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              { marginTop: 10, backgroundColor: "#d32f2f" },
            ]}
            onPress={handleEliminar}
          >
            <Text style={styles.buttonText}>Eliminar presupuesto</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#faf7f7",
    paddingTop: 30,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -40,
  },
  title: {
    fontSize: 32,
    color: "#222",
    fontFamily: "serif",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    color: "#222",
    fontFamily: "serif",
    marginTop: 10,
    marginBottom: 2,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  categoriaText: {
    fontSize: 20,
    color: "#1976d2",
    fontFamily: "serif",
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  input: {
    fontSize: 22,
    color: "#222",
    fontFamily: "serif",
    textAlign: "left",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 12,
    width: 340,
    marginBottom: 18,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  button: {
    backgroundColor: "#54bcd4",
    borderRadius: 12,
    paddingVertical: 16,
    width: 320,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: { color: "#222", fontSize: 22, fontFamily: "serif" },
});
