import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LogoLana from "../components/LogoLana";

const presupuestosEjemplo = [
  { nombre: "Comida", monto: 1500, gastado: 322, icon: "ios-restaurant" },
  { nombre: "Escuela", monto: 6000, gastado: 4422, icon: "ios-school" },
  { nombre: "Transporte", monto: 1000, gastado: 122, icon: "ios-bus" },
];

export default function PresupuestosScreen({ navigation }) {
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
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={28} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Contenido centrado */}
      <View style={styles.centerContent}>
        <Text style={styles.title}>Presupuesto mensual</Text>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {presupuestosEjemplo.map((p, i) => (
            <TouchableOpacity
              key={i}
              style={styles.presupuestoCard}
              onPress={() =>
                navigation.navigate("EditarPresupuesto", { presupuesto: p })
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name={p.icon}
                size={32}
                color="#1976d2"
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.nombre}>{p.nombre}</Text>
                <Text style={styles.monto}>
                  <Text style={{ color: "#1976d2" }}>
                    Presupuesto: ${p.monto}
                  </Text>
                </Text>
                <Text style={styles.gastado}>
                  <Text style={{ color: "#43a047" }}>
                    Gastado: ${p.gastado}
                  </Text>
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progress,
                      { width: `${(p.gastado / p.monto) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Botón abajo */}
      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("CrearPresupuesto")}
        >
          <Text style={styles.buttonText}>Agregar</Text>
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
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20, // Ajusta si quieres más arriba o abajo
  },
  title: {
    fontSize: 28,
    color: "#222",
    fontFamily: "serif",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
  },
  presupuestoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 18,
    marginVertical: 10,
    padding: 18,
    width: 340,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  nombre: { fontSize: 20, fontFamily: "serif", color: "#222", marginBottom: 2 },
  monto: { fontSize: 16, fontFamily: "serif", marginBottom: 2 },
  gastado: { fontSize: 16, fontFamily: "serif", marginBottom: 6 },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginTop: 2,
    width: "100%",
  },
  progress: { height: 8, backgroundColor: "#1976d2", borderRadius: 4 },
  bottomArea: {
    alignItems: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#54bcd4",
    borderRadius: 12,
    paddingVertical: 14,
    width: 320,
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 10,
  },
  buttonText: { color: "#222", fontSize: 22, fontFamily: "serif" },
});
