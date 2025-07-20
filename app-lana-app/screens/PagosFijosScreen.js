import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const pagosEjemplo = [
  {
    id: 1,
    nombre: "Renta",
    monto: 1500,
    proximo: "5 jun.",
    icon: <FontAwesome5 name="home" size={24} color="#1976d2" />,
    color: "#e0f7fa",
  },
  {
    id: 2,
    nombre: "Luz",
    monto: 150,
    proximo: "30 May.",
    icon: <Ionicons name="flash" size={24} color="#43a047" />,
    color: "#f1f8e9",
  },
  {
    id: 3,
    nombre: "Agua",
    monto: 250,
    proximo: "12 jun.",
    icon: <Ionicons name="water" size={24} color="#00bcd4" />,
    color: "#e3f2fd",
  },
  {
    id: 4,
    nombre: "Escuela",
    monto: 4423,
    proximo: "5 Ago.",
    icon: <MaterialIcons name="school" size={24} color="#ab47bc" />,
    color: "#f3e5f5",
  },
];

export default function PagosFijosScreen({ navigation }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <View style={styles.background}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lana App</Text>
        <Ionicons
          name="notifications-outline"
          size={28}
          color="#222"
          style={{ marginLeft: "auto" }}
        />
      </View>
      <View style={styles.topCard}>
        <Text style={styles.title}>Pagos fijos</Text>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {pagosEjemplo.map((pago) => (
            <TouchableOpacity
              key={pago.id}
              style={[styles.pagoCard, { backgroundColor: pago.color }]}
              activeOpacity={0.9}
              onPress={() =>
                setExpandedId(expandedId === pago.id ? null : pago.id)
              }
            >
              <View style={styles.pagoRow}>
                {pago.icon}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.pagoNombre}>{pago.nombre}</Text>
                  <Text style={styles.pagoMonto}>${pago.monto.toFixed(2)}</Text>
                  <Text style={styles.pagoProximo}>
                    Próximo pago: {pago.proximo}
                  </Text>
                </View>
                <Ionicons
                  name={
                    expandedId === pago.id ? "chevron-up" : "chevron-forward"
                  }
                  size={24}
                  color="#222"
                />
              </View>
              {expandedId === pago.id && (
                <View style={styles.detallePago}>
                  <Text style={styles.detalleLabel}>Detalles del pago:</Text>
                  <Text style={styles.detalleDato}>Nombre: {pago.nombre}</Text>
                  <Text style={styles.detalleDato}>Monto: ${pago.monto}</Text>
                  <Text style={styles.detalleDato}>
                    Próximo pago: {pago.proximo}
                  </Text>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      navigation.navigate("EditarPagoFijo", { pago })
                    }
                  >
                    <Text style={styles.editBtnText}>Editar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AgregarNuevoPago")}
        >
          <Text style={styles.addBtnText}>Agregar nuevo pago</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#7fd8f7",
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
  headerTitle: {
    fontSize: 20,
    color: "#1976d2",
    fontFamily: "serif",
    marginLeft: 16,
    fontWeight: "bold",
  },
  topCard: {
    flex: 1,
    backgroundColor: "#faf7f7",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 30,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    color: "#222",
    fontFamily: "serif",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
  },
  pagoCard: {
    borderRadius: 18,
    marginVertical: 8,
    padding: 18,
    width: 340,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  pagoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pagoNombre: {
    fontSize: 20,
    fontFamily: "serif",
    color: "#222",
    marginBottom: 2,
  },
  pagoMonto: {
    fontSize: 16,
    color: "#1976d2",
    fontFamily: "serif",
    marginBottom: 2,
  },
  pagoProximo: {
    fontSize: 15,
    color: "#43a047",
    fontFamily: "serif",
    marginBottom: 2,
  },
  detallePago: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 1,
  },
  detalleLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 6,
  },
  detalleDato: {
    fontSize: 15,
    color: "#222",
    marginBottom: 2,
  },
  editBtn: {
    backgroundColor: "#54bcd4",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 10,
    alignSelf: "flex-end",
  },
  editBtnText: {
    color: "#222",
    fontSize: 16,
    fontFamily: "serif",
    fontWeight: "bold",
  },
  addBtn: {
    backgroundColor: "#54bcd4",
    borderRadius: 12,
    paddingVertical: 14,
    width: 240,
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 20,
  },
  addBtnText: {
    color: "#222",
    fontSize: 18,
    fontFamily: "serif",
    fontWeight: "bold",
  },
});
