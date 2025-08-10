import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LogoLana from "../components/LogoLana";
import {
  Feather,
  FontAwesome5,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
// Determinar host y base URL para API proxy: leer debuggerHost y si es localhost usar fallback emulador/LAN
const manifest = Constants.manifest || {};
let host = manifest.debuggerHost?.split(":")[0];
if (!host || host === "localhost" || host === "127.0.0.1") {
  host = Platform.OS === "android" ? "10.0.2.2" : "10.0.0.11";
}
const BASE_URL = `http://${host}:3000`;
console.log("🔗 BASE_URL PrincipalScreen:", BASE_URL);

export default function PrincipalScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState(0);
  const [transacciones, setTransacciones] = useState([]);

  // Cargar usuario y transacciones
  const getUserAndData = async () => {
    try {
      // Obtener usuario de AsyncStorage
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;
      // Parsear usuario y normalizar identificador
      const parsedUser = JSON.parse(userStr);
      const userId =
        parsedUser.id || parsedUser.usuario_id || parsedUser.id_usuario;
      if (!userId) {
        console.warn(
          "PrincipalScreen: userId indefinido en AsyncStorage",
          parsedUser
        );
        return;
      }
      setNombre(parsedUser.nombre);
      // Obtener historial de transacciones de la API
      const url = `${BASE_URL}/transacciones/historial/${userId}`;
      console.log("Fetching historial desde:", url);
      const res = await fetch(url);
      if (!res.ok) {
        console.error("HTTP error fetching historial:", res.status);
        return;
      }
      let history;
      try {
        history = await res.json();
      } catch (e) {
        const text = await res.text();
        console.error("Error parseando historial, respuesta no JSON:", text);
        return;
      }
      if (Array.isArray(history)) {
        // Convertir monto a número (fallback 0) y calcular cantidad según tipo
        const cleaned = history.map((t) => {
          const montoNum = Number(t.monto) || 0;
          const tipo = (t.tipo || "").toLowerCase();
          const cantidad =
            tipo === "ingreso"
              ? montoNum
              : tipo === "egreso"
              ? -montoNum
              : montoNum;
          return { ...t, monto: montoNum, cantidad };
        });
        setTransacciones(cleaned);
        // Calcular saldo sumando cantidades
        const total = cleaned.reduce((sum, t) => sum + (t.cantidad || 0), 0);
        setSaldo(total);
      }
    } catch (e) {
      console.error("Error cargando datos iniciales:", e);
    }
  };

  // Refrescar cada vez que la pantalla recibe foco
  useFocusEffect(
    React.useCallback(() => {
      getUserAndData();
    }, [])
  );

  return (
    <LinearGradient colors={["#7fd8f7", "#e0f7fa"]} style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }} />
        <Text style={styles.bienvenida}>
          {nombre ? `Bienvenido, ${nombre}` : "Bienvenido"}
        </Text>
        <TouchableOpacity style={styles.bellContainer}>
          <Ionicons name="notifications-outline" size={28} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Logo centrado */}
      <View style={styles.logoContainer}>
        <LogoLana />
      </View>
      {/* Card principal */}
      <View style={styles.card}>
        <Text style={styles.saldoLabel}>Saldo total</Text>
        <Text style={styles.saldo} numberOfLines={1} adjustsFontSizeToFit>
          ${saldo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </Text>
        {/* Acciones rápidas */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("AgregarTransacciones")}
          >
            <Feather name="plus-circle" size={28} color="#222" />
            <Text style={styles.actionText}>Agregar{"\n"}Transacciones</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("Presupuesto")}
          >
            <FontAwesome5 name="piggy-bank" size={24} color="#222" />
            <Text style={styles.actionText}>Presupuesto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("ReporteGastos")}
          >
            <FontAwesome5 name="chart-bar" size={24} color="#222" />
            <Text style={styles.actionText}>Reporte{"\n"}de gastos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("PagosFijos")}
          >
            <Feather name="calendar" size={24} color="#222" />
            <Text style={styles.actionText}>Pagos{"\n"}fijos</Text>
          </TouchableOpacity>
        </View>
        {/* Resumen de transacciones */}
        <View style={styles.resumenHeader}>
          <Text style={styles.resumenTitle}>Resumen de Transacciones</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Transacciones")}
          >
            <Text style={styles.verTodo}>Ver todo</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ width: "100%" }}>
          {transacciones.length === 0 ? (
            <Text style={styles.emptyText}>No hay transacciones</Text>
          ) : (
            transacciones.map((t, i) => (
              <View key={i} style={styles.transaccionRow}>
                <View
                  style={[styles.transIcon, { backgroundColor: "#b2f0e6" }]}
                >
                  <MaterialIcons name="restaurant" size={24} color="#222" />
                </View>
                <View style={styles.transInfo}>
                  <Text style={styles.transTitle}>
                    {t.categoria || "Transacción"}
                  </Text>
                  <Text style={styles.transDate}>
                    {new Date(t.fecha).toLocaleDateString()}
                  </Text>
                  <Text style={styles.transDesc}>{t.descripcion}</Text>
                </View>
                <Text
                  style={
                    t.cantidad < 0
                      ? styles.transAmountRed
                      : styles.transAmountGreen
                  }
                >
                  {t.cantidad < 0 ? "- " : ""}$
                  {Math.abs(t.cantidad).toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginHorizontal: 20,
    justifyContent: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
  },
  bienvenida: {
    flex: 2,
    textAlign: "center",
    fontSize: 22,
    color: "#222",
    fontWeight: "700",
  },
  bellContainer: {
    marginLeft: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#f9f6f6",
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    paddingTop: 30,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  saldoLabel: {
    fontSize: 20,
    color: "#888",
    fontWeight: "500",
    marginBottom: 5,
  },
  saldo: {
    fontSize: 48, // tamaño de fuente aumentado
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
    flexShrink: 1, // permite que el texto se reduzca para caber
    textAlign: "center", // centrar el texto
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    marginBottom: 25,
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: 75,
    marginHorizontal: 3,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  actionText: {
    fontSize: 12,
    color: "#222",
    marginTop: 5,
    textAlign: "center",
  },
  resumenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignItems: "center",
    marginBottom: 10,
  },
  resumenTitle: {
    fontSize: 16,
    color: "#888",
    fontWeight: "600",
  },
  verTodo: {
    fontSize: 14,
    color: "#0099cc",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  transaccionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    marginHorizontal: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  transIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transInfo: {
    flex: 1,
  },
  transTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  transDate: {
    fontSize: 12,
    color: "#888",
  },
  transDesc: {
    fontSize: 12,
    color: "#aaa",
  },
  transAmountRed: {
    color: "#e74c3c",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  transAmountGreen: {
    color: "#27ae60",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 10,
  },
});
