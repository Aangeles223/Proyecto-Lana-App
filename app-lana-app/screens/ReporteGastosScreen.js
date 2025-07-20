import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart, LineChart } from "react-native-chart-kit";

// Ejemplo de registros (puedes importar o compartir el array real)
const transaccionesPorMes = {
  "2025-05": [
    { categoria: "Comida", monto: 450 },
    { categoria: "Compras", monto: 2000 },
    { categoria: "Renta", monto: 5000 },
    { categoria: "Transporte", monto: 122 },
    { categoria: "Comida", monto: 322 },
    { categoria: "Entretenimiento", monto: 1000 },
  ],
  "2025-04": [
    { categoria: "Comida", monto: 300 },
    { categoria: "Compras", monto: 1500 },
    { categoria: "Renta", monto: 5000 },
    { categoria: "Transporte", monto: 100 },
    { categoria: "Entretenimiento", monto: 800 },
  ],
};

const meses = [
  { label: "Mayo 2025", value: "2025-05" },
  { label: "Abril 2025", value: "2025-04" },
];

const coloresCategorias = {
  Comida: "#FFD700",
  Compras: "#FF0000",
  Renta: "#4B0082",
  Transporte: "#00FA9A",
  Entretenimiento: "#4169E1",
  Otros: "#888",
};

export default function ReporteGastosScreen({ navigation }) {
  const [mesSeleccionado, setMesSeleccionado] = useState(meses[0].value);

  // Agrupa y suma por categoría
  const datosMes = transaccionesPorMes[mesSeleccionado] || [];
  const resumen = {};
  datosMes.forEach((t) => {
    resumen[t.categoria] = (resumen[t.categoria] || 0) + t.monto;
  });

  const total = Object.values(resumen).reduce((a, b) => a + b, 0);

  // Pie chart data
  const pieData = Object.keys(resumen).map((cat, i) => ({
    name: cat,
    amount: resumen[cat],
    color: coloresCategorias[cat] || "#888",
    legendFontColor: "#222",
    legendFontSize: 14,
  }));

  // Simulación de ingresos/gastos para el gráfico de líneas
  const lineLabels = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
  const gastosLine = [total * 0.2, total * 0.4, total * 0.7, total];
  const ingresosLine = [1000, 2000, 3000, 4000];

  return (
    <View style={styles.background}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Image
          source={{ uri: "https://i.ibb.co/3Nw2yQk/lana-app-logo.png" }}
          style={styles.logo}
        />
        <Ionicons
          name="notifications-outline"
          size={28}
          color="#222"
          style={{ marginLeft: "auto" }}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Control de Gastos</Text>
        {/* Selector de mes */}
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
        {/* Pie Chart */}
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
                style={[styles.leyendaColor, { backgroundColor: item.color }]}
              />
              <Text style={styles.leyendaText}>
                <Text style={{ fontWeight: "bold" }}>{item.amount}</Text>{" "}
                {item.name}
              </Text>
            </View>
          ))}
        </View>
        {/* Leyenda de colores */}
        <View style={styles.leyendaColores}>
          <View style={styles.leyendaFila}>
            <View
              style={[styles.leyendaColor, { backgroundColor: "#FFD700" }]}
            />
            <Text style={styles.leyendaTextColor}>Comida</Text>
            <View
              style={[styles.leyendaColor, { backgroundColor: "#FF0000" }]}
            />
            <Text style={styles.leyendaTextColor}>Compras</Text>
            <View
              style={[styles.leyendaColor, { backgroundColor: "#4B0082" }]}
            />
            <Text style={styles.leyendaTextColor}>Renta</Text>
          </View>
          <View style={styles.leyendaFila}>
            <View
              style={[styles.leyendaColor, { backgroundColor: "#00FA9A" }]}
            />
            <Text style={styles.leyendaTextColor}>Transporte</Text>
            <View
              style={[styles.leyendaColor, { backgroundColor: "#4169E1" }]}
            />
            <Text style={styles.leyendaTextColor}>Entretenimiento</Text>
          </View>
        </View>
        {/* Line Chart */}
        <View style={{ marginTop: 20 }}>
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
  logo: { width: 90, height: 30, resizeMode: "contain", marginLeft: 60 },
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
    marginBottom: 16,
    width: "100%",
  },
  mesBtn: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    backgroundColor: "#e0f7fa",
    borderRadius: 24,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  mesBtnActivo: {
    backgroundColor: "#54bcd4",
  },
  mesBtnText: {
    color: "#1976d2",
    fontSize: 20,
    fontFamily: "serif",
  },
  mesBtnTextActivo: {
    color: "#fff",
    fontWeight: "bold",
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
  leyendaColores: {
    width: "90%",
    marginTop: 8,
    marginBottom: 8,
  },
  leyendaFila: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  leyendaTextColor: {
    fontSize: 15,
    color: "#222",
    fontFamily: "serif",
    marginRight: 18,
    marginLeft: 4,
  },
});
