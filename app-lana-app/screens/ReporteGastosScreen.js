import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart, LineChart, BarChart } from "react-native-chart-kit";
import LogoLana from "../components/LogoLana";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Detectar host dinámicamente (como en otras pantallas)
import Constants from "expo-constants";
const manifest = Constants.manifest || {};
const debuggerHost = manifest.debuggerHost?.split(":")[0];
const host = debuggerHost || "10.0.0.11";
const BASE_URL = `http://${host}:3000`;

// Puedes ajustar los colores según tus categorías reales
const coloresCategorias = {
  Comida: "#FFD700",
  Compras: "#FF0000",
  Renta: "#4B0082",
  Transporte: "#00FA9A",
  Entretenimiento: "#4169E1",
  Otros: "#888",
};
// Paleta de colores por defecto para categorías sin color explícito
const defaultColors = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
];

const meses = [
  { label: "Enero", value: 1 },
  { label: "Febrero", value: 2 },
  { label: "Marzo", value: 3 },
  { label: "Abril", value: 4 },
  { label: "Mayo", value: 5 },
  { label: "Junio", value: 6 },
  { label: "Julio", value: 7 },
  { label: "Agosto", value: 8 },
  { label: "Septiembre", value: 9 },
  { label: "Octubre", value: 10 },
  { label: "Noviembre", value: 11 },
  { label: "Diciembre", value: 12 },
];

const anioActual = new Date().getFullYear();

export default function ReporteGastosScreen({ navigation }) {
  const [notifsCount, setNotifsCount] = useState(0);
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date().getMonth() + 1
  );
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);
  const [reporte, setReporte] = useState([]);
  const [loading, setLoading] = useState(true);

  // Contar notificaciones
  useFocusEffect(
    React.useCallback(() => {
      const fetchNotifs = async () => {
        try {
          const userStr = await AsyncStorage.getItem("user");
          if (!userStr) return;
          const { id: usuario_id } = JSON.parse(userStr);
          const res = await fetch(`${BASE_URL}/notificaciones/${usuario_id}`);
          const data = await res.json();
          const unread =
            Array.isArray(data) && data.length > 0
              ? data.filter((n) => n.leido === 0).length
              : 0;
          setNotifsCount(unread);
        } catch (e) {
          console.error("Error fetching notifications count:", e);
        }
      };
      fetchNotifs();
    }, [])
  );

  // Cargar datos reales de la BD
  useEffect(() => {
    const fetchReporte = async () => {
      try {
        setLoading(true);
        const userStr = await AsyncStorage.getItem("user");
        const user = JSON.parse(userStr);
        const res = await fetch(
          `${BASE_URL}/reporte/${user.id}/${anioSeleccionado}/${mesSeleccionado}`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.reporte)) {
          const numeric = data.reporte.map((r) => ({
            categoria: r.categoria,
            ingresos: parseFloat(r.ingresos) || 0,
            egresos: parseFloat(r.egresos) || 0,
          }));
          setReporte(numeric);
        } else {
          setReporte([]);
        }
      } catch (error) {
        console.warn("Error fetchReporte:", error);
        setReporte([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReporte();
  }, [mesSeleccionado, anioSeleccionado]);

  // Parsear y normalizar datos numéricos
  const reporteNum = reporte.map((r) => ({
    categoria: r.categoria,
    ingresos: parseFloat(r.ingresos) || 0,
    egresos: parseFloat(r.egresos) || 0,
  }));
  // Totales
  const totalIngresos = reporteNum.reduce((sum, r) => sum + r.ingresos, 0);
  const totalEgresos = reporteNum.reduce((sum, r) => sum + r.egresos, 0);
  // Formato de moneda
  const totalIngresosFmt = `$${totalIngresos.toFixed(2)}`;
  const totalEgresosFmt = `$${totalEgresos.toFixed(2)}`;
  // Datos para gráfica de barras
  const labels = reporteNum.map((r) => r.categoria);
  const ingresosData = reporteNum.map((r) => r.ingresos);
  const egresosData = reporteNum.map((r) => r.egresos);
  // Preparar datos de gráficos
  const egresoCats = reporteNum.filter((r) => r.egresos > 0);
  const pieDataEgresos = egresoCats.map((r, i) => ({
    name: r.categoria,
    population: r.egresos,
    color:
      coloresCategorias[r.categoria] || defaultColors[i % defaultColors.length],
    legendFontColor: "#222",
    legendFontSize: 12,
  }));
  const ingresoCats = reporteNum.filter((r) => r.ingresos > 0);
  const pieDataIngresos = ingresoCats.map((r, i) => ({
    name: r.categoria,
    population: r.ingresos,
    color:
      coloresCategorias[r.categoria] ||
      defaultColors[(i + pieDataEgresos.length) % defaultColors.length],
    legendFontColor: "#222",
    legendFontSize: 12,
  }));
  // Mock datos semanales: dividir total por 4 semanas
  const weekLabels = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
  const weeklyEgresos = pieDataEgresos.length
    ? weekLabels.map((_, i) => (totalEgresos / 4).toFixed(2))
    : [];
  const weeklyIngresos = pieDataIngresos.length
    ? weekLabels.map((_, i) => (totalIngresos / 4).toFixed(2))
    : [];

  // Configuración común para gráficos
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(34,34,34,${opacity})`,
    labelColor: () => "#222",
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
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notificaciones")}
            style={styles.bellContainer}
          >
            <Ionicons name="notifications-outline" size={28} color="#222" />
            {notifsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Control de Gastos</Text>
        {/* Selector de año */}
        <View style={styles.mesesContainer}>
          <TouchableOpacity
            style={styles.mesBtn}
            onPress={() => setAnioSeleccionado(anioSeleccionado - 1)}
          >
            <Text style={styles.mesBtnText}>{"<"}</Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.mesBtnText,
              { fontWeight: "bold", marginHorizontal: 10 },
            ]}
          >
            {anioSeleccionado}
          </Text>
          <TouchableOpacity
            style={styles.mesBtn}
            onPress={() => setAnioSeleccionado(anioSeleccionado + 1)}
          >
            <Text style={styles.mesBtnText}>{">"}</Text>
          </TouchableOpacity>
        </View>
        {/* Selector de mes */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
        >
          <View style={styles.mesesContainer}>
            {meses.map((mes) => (
              <TouchableOpacity
                key={mes.value}
                style={[
                  styles.mesBtn,
                  mesSeleccionado === mes.value && styles.mesBtnActivo,
                ]}
                onPress={() => setMesSeleccionado(mes.value)}
              >
                <Text
                  style={[
                    styles.mesBtnText,
                    mesSeleccionado === mes.value && styles.mesBtnTextActivo,
                  ]}
                >
                  {mes.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {/* Resumen */}
        <Text style={styles.resumen}>
          Ingresos: <Text style={{ color: "#1976d2" }}>{totalIngresosFmt}</Text>{" "}
          | Egresos: <Text style={{ color: "#e74c3c" }}>{totalEgresosFmt}</Text>
        </Text>
        {/* PieChart: Egresos por Categoría */}
        <Text style={styles.subtitulo}>Egresos por Categoría</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#1976d2" />
        ) : pieDataEgresos.length > 0 ? (
          <PieChart
            data={pieDataEgresos}
            width={Dimensions.get("window").width - 40}
            height={200}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="20"
            absolute
            chartConfig={chartConfig}
            style={styles.chartContainer}
          />
        ) : (
          <Text style={styles.noDataText}>
            No hay egresos para{" "}
            {meses.find((m) => m.value === mesSeleccionado)?.label}{" "}
            {anioSeleccionado}
          </Text>
        )}

        {/* BarChart: Ingresos vs Egresos Totales */}
        <Text style={styles.subtitulo}>Ingresos vs Egresos Totales</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#1976d2" />
        ) : totalIngresos > 0 || totalEgresos > 0 ? (
          <BarChart
            data={{
              labels: ["Ingresos", "Egresos"],
              datasets: [{ data: [totalIngresos, totalEgresos] }],
            }}
            width={Dimensions.get("window").width - 40}
            height={220}
            fromZero
            yAxisLabel="$"
            chartConfig={chartConfig}
            style={styles.chartContainer}
          />
        ) : (
          <Text style={styles.noDataText}>
            No hay datos de ingresos o egresos
          </Text>
        )}
      </ScrollView>
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
  scrollContent: {
    alignItems: "center",
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: "#222",
    fontFamily: "serif",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  mesesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
    width: "100%",
  },
  mesBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#e0f7fa",
    borderRadius: 24,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  mesBtnActivo: {
    backgroundColor: "#54bcd4",
  },
  mesBtnText: {
    color: "#1976d2",
    fontSize: 18,
    fontFamily: "serif",
  },
  mesBtnTextActivo: {
    color: "#fff",
    fontWeight: "bold",
  },
  resumen: {
    fontSize: 18,
    color: "#222",
    fontFamily: "serif",
    marginBottom: 8,
    marginTop: 8,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 18,
    color: "#1976d2",
    fontFamily: "serif",
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 4,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  leyenda: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 8,
    width: "90%",
  },
  leyendaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
    marginLeft: 10,
  },
  leyendaColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  leyendaText: {
    fontSize: 16,
    color: "#222",
    fontFamily: "serif",
    marginRight: 16,
  },
  chartContainer: {
    marginVertical: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noDataText: {
    textAlign: "center",
    color: "#888",
    marginVertical: 16,
    fontSize: 16,
  },
  bellContainer: {
    position: "relative",
    padding: 8,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "red",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
