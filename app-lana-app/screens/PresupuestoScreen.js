import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LogoLana from "../components/LogoLana";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

// Host detection
const manifest = Constants.manifest || {};
const debuggerHost = manifest.debuggerHost?.split(":")[0];
const devHost = debuggerHost || "10.0.0.11";
const BASE_URL = `http://${devHost}:3000`;

export default function PresupuestosScreen({ navigation }) {
  const [presupuestos, setPresupuestos] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener notificaciones
  const fetchNotificaciones = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = JSON.parse(userStr);
      console.log(
        `Fetching notificaciones from ${BASE_URL}/notificaciones/${user.id}`
      );
      const res = await fetch(`${BASE_URL}/notificaciones/${user.id}`);
      if (!res.ok) {
        console.error("HTTP error fetching notificaciones:", res.status);
        return;
      }
      const data = await res.json();
      setNotifs(data);
      // Programar notificaciones locales para nuevas
      data
        .filter((n) => !n.leido)
        .forEach((n) => {
          Notifications.scheduleNotificationAsync({
            content: { title: "Notificación Lana App", body: n.mensaje },
            trigger: null,
          });
        });
    } catch (e) {
      console.error("Error fetchNotificaciones:", e);
    }
  };

  const fetchPresupuestos = useCallback(async () => {
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = JSON.parse(userStr);
      console.log(
        `Fetching presupuestos from ${BASE_URL}/presupuestos/${user.id}`
      );
      const res = await fetch(`${BASE_URL}/presupuestos/${user.id}`);
      if (!res.ok) {
        console.error("HTTP error fetching presupuestos:", res.status);
        Alert.alert("Error", "No se pudo cargar los presupuestos.");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setPresupuestos(data.presupuestos);
      } else {
        console.error("API error fetching presupuestos:", data);
        Alert.alert("Error", "Error en datos de presupuestos.");
      }
    } catch (e) {
      console.error("Error fetchPresupuestos:", e);
      Alert.alert("Error", "No se pudo cargar los presupuestos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPresupuestos();
      fetchNotificaciones();
    }, [fetchPresupuestos])
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
          <TouchableOpacity
            onPress={() => navigation.navigate("Notificaciones")}
          >
            <Ionicons name="notifications-outline" size={28} color="#222" />
            {notifs.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifs.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {/* Contenido centrado */}
      <View style={styles.centerContent}>
        <Text style={styles.title}>Presupuesto mensual</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#1976d2" />
        ) : presupuestos.length === 0 ? (
          <Text style={styles.emptyText}>No hay presupuestos</Text>
        ) : (
          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {presupuestos.map((p, i) => (
              <TouchableOpacity
                key={i}
                style={styles.presupuestoCard}
                onPress={() =>
                  navigation.navigate("EditarPresupuesto", { presupuesto: p })
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="ios-wallet"
                  size={32}
                  color="#1976d2"
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.nombre}>{p.categoria}</Text>
                  <Text style={styles.monto}>
                    <Text style={{ color: "#1976d2" }}>
                      Presupuesto: ${p.monto_mensual}
                    </Text>
                  </Text>
                  <Text style={styles.gastado}>
                    <Text style={{ color: "#43a047" }}>
                      Gastado: ${p.gastado}
                    </Text>
                  </Text>
                  <Text style={styles.fecha}>{`Mes: ${p.mes}/${p.anio}`}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progress,
                        {
                          width: `${
                            p.monto_mensual > 0
                              ? Math.min(
                                  (p.gastado / p.monto_mensual) * 100,
                                  100
                                )
                              : 0
                          }%`,
                          backgroundColor:
                            p.gastado >= p.monto_mensual
                              ? "#d32f2f"
                              : "#1976d2",
                        },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
  fecha: { fontSize: 14, fontFamily: "serif", color: "#666" },
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
  badge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "#d32f2f",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});
