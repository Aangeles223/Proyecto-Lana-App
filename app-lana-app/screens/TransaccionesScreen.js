import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Detección automática de host para ambos servicios
let devHost;
if (Platform.OS === "android") devHost = "10.16.36.167";
else if (Platform.OS === "ios") devHost = "10.16.36.167";
else {
  const debuggerHost = Constants.manifest?.debuggerHost;
  devHost = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
}
const BASE_URL = `http://${devHost}:3000`; // Proxy Express
const API_URL_FASTAPI = `http://${devHost}:8000`; // FastAPI direct

export default function TransaccionesScreen({ navigation }) {
  const [transacciones, setTransacciones] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("Todos");

  const loadHistory = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;
      const { id: usuario_id } = JSON.parse(userStr);
      const url = `${BASE_URL}/transacciones/historial/${usuario_id}`;
      console.log("Intentando cargar historial desde proxy:", url);
      let res = await fetch(url);
      if (!res.ok) throw new Error(`Proxy respondió con status ${res.status}`);
      // Si proxy no responde, fallback al FastAPI directo
      let data = await res.json();
      setTransacciones(Array.isArray(data) ? data : data.pagos_fijos || data);
      return;
    } catch (e) {
      console.warn("Proxy falló, intentando FastAPI directo:", e.message);
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (!userStr) return;
        const { id: usuario_id } = JSON.parse(userStr);
        const directUrl = `${API_URL_FASTAPI}/transacciones/historial/${usuario_id}`;
        console.log(
          "Intentando cargar historial desde FastAPI directo:",
          directUrl
        );
        const res2 = await fetch(directUrl);
        if (!res2.ok)
          throw new Error(`FastAPI respondió status ${res2.status}`);
        const data2 = await res2.json();
        setTransacciones(
          Array.isArray(data2) ? data2 : data2.pagos_fijos || data2
        );
        return;
      } catch (e2) {
        console.error("Error al cargar historial completo:", e2);
        Alert.alert(
          "Error al cargar historial",
          `No se pudo cargar el historial: ${e2.message}. ` +
            "Asegúrate de ejecutar `npm run start:proxy` y tener la API FastAPI en http://" +
            `${devHost}:8000`
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const filtered = useMemo(() => {
    const now = new Date();
    return transacciones.filter((t) => {
      const d = new Date(t.fecha);
      const diffDays = (now - d) / (1000 * 60 * 60 * 24);
      switch (filter) {
        case "Día":
          return diffDays < 1;
        case "Semana":
          return diffDays < 7;
        case "Mes":
          return diffDays < 30;
        case "Año":
          return diffDays < 365;
        default:
          return true; // "Todos"
      }
    });
  }, [transacciones, filter]);

  const exportCSV = async () => {
    let csv = "fecha,categoria,descripcion,monto\n";
    filtered.forEach((t) => {
      const monto =
        typeof t.cantidad === "number"
          ? t.cantidad
          : t.tipo === "ingreso"
          ? t.monto
          : -t.monto;
      csv += `${t.fecha},"${t.categoria || ""}","${
        t.descripcion || ""
      }",${monto}\n`;
    });
    try {
      await Share.share({ message: csv, title: "Historial de Transacciones" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Historial de Transacciones</Text>
        <TouchableOpacity onPress={exportCSV} style={styles.exportBtn}>
          <MaterialIcons name="file-download" size={24} color="#222" />
        </TouchableOpacity>
      </View>
      <View style={styles.filterRow}>
        {["Todos", "Día", "Semana", "Mes", "Año"].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
          >
            <Text style={styles.filterText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filtered.length === 0 ? (
          <Text style={styles.noData}>No hay transacciones para mostrar</Text>
        ) : (
          filtered.map((t, i) => {
            const monto =
              typeof t.cantidad === "number"
                ? t.cantidad
                : t.tipo === "ingreso"
                ? t.monto
                : -t.monto;
            return (
              <View key={i} style={styles.row}>
                <MaterialIcons
                  name="attach-money"
                  size={24}
                  color={monto < 0 ? "#e74c3c" : "#388e3c"}
                />
                <View style={styles.info}>
                  <Text style={styles.category}>
                    {t.categoria || "General"}
                  </Text>
                  <Text style={styles.date}>
                    {new Date(t.fecha).toLocaleDateString()}
                  </Text>
                  {t.descripcion ? (
                    <Text style={styles.desc}>{t.descripcion}</Text>
                  ) : null}
                </View>
                <Text style={monto < 0 ? styles.amountRed : styles.amountGreen}>
                  {monto < 0 ? "- " : ""}$
                  {Math.abs(monto).toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf7f7",
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  exportBtn: { padding: 4 },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  filterActive: { backgroundColor: "#388e3c" },
  filterText: { color: "#222", fontWeight: "600" },
  list: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  info: { flex: 1, marginLeft: 12 },
  category: { fontSize: 16, fontWeight: "600", color: "#222" },
  date: { fontSize: 12, color: "#888" },
  desc: { fontSize: 14, color: "#666", marginTop: 4 },
  amountGreen: { fontSize: 16, fontWeight: "bold", color: "#388e3c" },
  amountRed: { fontSize: 16, fontWeight: "bold", color: "#e74c3c" },
  noData: { textAlign: "center", marginTop: 20, color: "#888" },
});
