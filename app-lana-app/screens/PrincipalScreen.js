import React, { useState, useEffect } from "react";
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

export default function PrincipalScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState(0);
  const [transacciones, setTransacciones] = useState([]);

  useEffect(() => {
    const getUserAndData = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setNombre(user.nombre);

          // Obtener saldo y transacciones del backend
          const res = await fetch(
            `http://172.20.10.6:3000/usuario/${user.id}/resumen`
          );
          const data = await res.json();
          if (data.success) {
            setSaldo(data.saldo);
            setTransacciones(data.transacciones);
          }
        }
      } catch (e) {
        setNombre("");
        setSaldo(0);
        setTransacciones([]);
      }
    };
    getUserAndData();
  }, []);

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
        <Text style={styles.saldo}>
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
          <Text style={styles.verTodo}>Ver todo</Text>
        </View>
        <ScrollView style={{ width: "100%" }}>
          {transacciones.map((t, i) => (
            <View key={i} style={styles.transaccionRow}>
              <View style={[styles.transIcon, { backgroundColor: "#b2f0e6" }]}>
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
          ))}
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
    fontSize: 38,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
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
