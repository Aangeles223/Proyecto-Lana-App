import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ConfiguracionScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#222" />
      </TouchableOpacity>
      <Text style={styles.title}>Configuración</Text>
      <View style={styles.content}>
        <Text style={styles.text}>
          Aquí puedes ajustar las preferencias de la aplicación.
        </Text>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Idioma</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Notificaciones</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Tema</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
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
  text: { fontSize: 16, color: "#666", marginBottom: 12 },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  optionText: { fontSize: 16, color: "#222" },
});
