import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SeguridadScreen({ navigation }) {
  const [biometrico, setBiometrico] = useState(false);
  const [pin, setPin] = useState(false);

  const toggleBiometrico = () => setBiometrico(!biometrico);
  const togglePin = () => setPin(!pin);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>
      <Text style={styles.title}>Seguridad</Text>
      <View style={styles.content}>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Biométrico</Text>
          <Switch value={biometrico} onValueChange={toggleBiometrico} />
        </View>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>PIN de seguridad</Text>
          <Switch value={pin} onValueChange={togglePin} />
        </View>
        <TouchableOpacity
          style={styles.reset}
          onPress={() =>
            Alert.alert("Restablecer PIN", "PIN restablecido exitosamente.")
          }
        >
          <Text style={styles.resetText}>Restablecer PIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#faf7f7", padding: 20 },
  back: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#222", marginBottom: 10 },
  content: { backgroundColor: "#fff", borderRadius: 8, padding: 16 },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  optionText: { fontSize: 16, color: "#222" },
  reset: { marginTop: 20, alignItems: "center" },
  resetText: { color: "#e74c3c", fontSize: 16, fontWeight: "bold" },
});
