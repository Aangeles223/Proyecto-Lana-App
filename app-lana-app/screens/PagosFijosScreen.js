import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogoLana from "../components/LogoLana";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function PagosFijosScreen({ navigation }) {
  const [pagos, setPagos] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        const user = JSON.parse(userStr);

        const res = await fetch(`http://192.168.1.67:3000/pagos-fijos/${user.id}`);
        const data = await res.json();

        if (data.success) {
          setPagos(data.pagos);
        } else {
          console.error("Error desde API:", data);
        }
      } catch (error) {
        console.error("Error al obtener pagos fijos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, []);

  const getIconoPorNombre = (nombre) => {
    const lower = nombre.toLowerCase();
    if (lower.includes("luz")) return <Ionicons name="flash" size={24} color="#43a047" />;
    if (lower.includes("agua")) return <Ionicons name="water" size={24} color="#00bcd4" />;
    if (lower.includes("renta") || lower.includes("alquiler"))
      return <FontAwesome5 name="home" size={24} color="#1976d2" />;
    if (lower.includes("escuela") || lower.includes("colegiatura"))
      return <MaterialIcons name="school" size={24} color="#ab47bc" />;
    return <Ionicons name="document-text-outline" size={24} color="#666" />;
  };

  const getColorFondo = (id) => {
    const colores = ["#e0f7fa", "#f1f8e9", "#e3f2fd", "#f3e5f5", "#fce4ec"];
    return colores[id % colores.length];
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
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={28} color="#222" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.topCard}>
        <Text style={styles.title}>Pagos fijos</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1976d2" />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {pagos.map((pago) => (
              <TouchableOpacity
                key={pago.id}
                style={[styles.pagoCard, { backgroundColor: getColorFondo(pago.id) }]}
                activeOpacity={0.9}
                onPress={() => setExpandedId(expandedId === pago.id ? null : pago.id)}
              >
                <View style={styles.pagoRow}>
                  {getIconoPorNombre(pago.nombre)}
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.pagoNombre}>{pago.nombre}</Text>
                    <Text style={styles.pagoMonto}>
                      ${Number(pago.monto).toFixed(2)}
                    </Text>

                    <Text style={styles.pagoProximo}>
                      Próximo pago: {new Date(pago.ultima_fecha).toLocaleDateString()}
                    </Text>
                  </View>
                  <Ionicons
                    name={expandedId === pago.id ? "chevron-up" : "chevron-forward"}
                    size={24}
                    color="#222"
                  />
                </View>

                {expandedId === pago.id && (
                  <View style={styles.detallePago}>
                    <Text style={styles.detalleLabel}>Detalles del pago:</Text>
                    <Text style={styles.detalleDato}>Nombre: {pago.nombre}</Text>
                    <Text style={styles.detalleDato}>Monto: ${pago.monto}</Text>
                    <Text style={styles.detalleDato}>Último pago: {pago.ultima}</Text>
                    <Text style={styles.detalleDato}>
                      Estado: {pago.pagado ? "Pagado" : "Pendiente"}
                    </Text>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => navigation.navigate("EditarPagoFijo", { pago })}
                    >
                      <Text style={styles.editBtnText}>Editar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

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
