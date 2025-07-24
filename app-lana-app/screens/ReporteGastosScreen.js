import React, { useState, useEffect } from "react";
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
import { PieChart, LineChart } from "react-native-chart-kit";
import LogoLana from "../components/LogoLana";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Puedes ajustar los colores según tus categorías reales
const coloresCategorias = {
  Comida: "#FFD700",
  Compras: "#FF0000",
  Renta: "#4B0082",
  Transporte: "#00FA9A",
  Entretenimiento: "#4169E1",
  Otros: "#888",
};

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
  const [mesSeleccionado, setMesSeleccionado] = useState(
    new Date().getMonth() + 1
  );
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);
  const [reporte, setReporte] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos reales de la BD
  useEffect(() => {
    const fetchReporte = async () => {
      setLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      const user = JSON.parse(userStr);
      const res = await fetch(
        `http://10.0.0.11:3000/reporte/${user.id}/${anioSeleccionado}/${mesSeleccionado}`
      );
      const data = await res.json();
      if (data.success) setReporte(data.reporte);
      setLoading(false);
    };
    fetchReporte();
  }, [mesSeleccionado, anioSeleccionado]);

  // Pie chart para egresos
  const pieData = reporte
    .filter((r) => r.egresos > 0)
    .map((r) => ({
      name: r.categoria,
      amount: r.egresos,
      color: coloresCategorias[r.categoria] || "#888",
      legendFontColor: "#222",
      legendFontSize: 14,
    }));

  // Pie chart para ingresos (opcional)
  const pieDataIngresos = reporte
    .filter((r) => r.ingresos > 0)
    .map((r) => ({
      name: r.categoria,
      amount: r.ingresos,
      color: coloresCategorias[r.categoria] || "#888",
      legendFontColor: "#222",
      legendFontSize: 14,
    }));

  // Total ingresos y egresos
  const totalIngresos = reporte.reduce((a, b) => a + (b.ingresos || 0), 0);
  const totalEgresos = reporte.reduce((a, b) => a + (b.egresos || 0), 0);

  // Simulación de datos semanales para el gráfico de líneas (puedes adaptar tu backend para esto)
  const lineLabels = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
  // Aquí deberías traer los datos reales por semana desde el backend
  const gastosLine = [
    totalEgresos * 0.2,
    totalEgresos * 0.4,
    totalEgresos * 0.7,
    totalEgresos,
  ];
  const ingresosLine = [
    totalIngresos * 0.2,
    totalIngresos * 0.4,
    totalIngresos * 0.7,
    totalIngresos,
  ];

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
          Ingresos: <Text style={{ color: "#1976d2" }}>${totalIngresos}</Text> |{" "}
          Egresos: <Text style={{ color: "#e74c3c" }}>${totalEgresos}</Text>
        </Text>
        {/* Pie Chart de egresos */}
        <Text style={styles.subtitulo}>Egresos por categoría</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#1976d2" />
        ) : (
          <>
            <PieChart
              data={pieData}
              width={Dimensions.get("window").width - 40}
              height={200}
              chartConfig={{
                color: () => "#222",
                labelColor: () => "#222",
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="10"
              absolute
            />
            {/* Leyenda con montos */}
            <View style={styles.leyenda}>
              {pieData.map((item) => (
                <View key={item.name} style={styles.leyendaItem}>
                  <View
                    style={[
                      styles.leyendaColor,
                      { backgroundColor: item.color },
                    ]}
                  />
                  <Text style={styles.leyendaText}>
                    <Text style={{ fontWeight: "bold" }}>{item.amount}</Text>{" "}
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
        {/* Pie Chart de ingresos (opcional) */}
        <Text style={styles.subtitulo}>Ingresos por categoría</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#1976d2" />
        ) : (
          <>
            <PieChart
              data={pieDataIngresos}
              width={Dimensions.get("window").width - 40}
              height={200}
              chartConfig={{
                color: () => "#222",
                labelColor: () => "#222",
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="10"
              absolute
            />
            <View style={styles.leyenda}>
              {pieDataIngresos.map((item) => (
                <View key={item.name} style={styles.leyendaItem}>
                  <View
                    style={[
                      styles.leyendaColor,
                      { backgroundColor: item.color },
                    ]}
                  />
                  <Text style={styles.leyendaText}>
                    <Text style={{ fontWeight: "bold" }}>{item.amount}</Text>{" "}
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
        {/* Line Chart semanal */}
        <Text style={styles.subtitulo}>Evolución semanal</Text>
        <View style={{ marginTop: 10 }}>
          <LineChart
            data={{
              labels: lineLabels,
              datasets: [
                {
                  data: ingresosLine,
                  color: () => "#1976d2",
                  strokeWidth: 2,
                  withDots: false,
                },
                {
                  data: gastosLine,
                  color: () => "#e74c3c",
                  strokeWidth: 2,
                  withDots: false,
                },
              ],
              legend: ["Ingresos", "Gastos"],
            }}
            width={Dimensions.get("window").width - 40}
            height={180}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(34,34,34,${opacity})`,
              labelColor: () => "#222",
              propsForDots: { r: "0" },
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </View>
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
});
