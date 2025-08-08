import React, { useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogoLana from "../components/LogoLana";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import Constants from "expo-constants";

// Determinar base URL
const host = Constants.manifest?.debuggerHost?.split(":")[0] || "10.16.36.167";
const BASE_URL = `http://${host}:3000`;

const PagosFijosScreen = ({ navigation }) => {
  const [pagosFijos, setPagosFijos] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const isFocused = useIsFocused();

  // Function to fetch pagos fijos
  const fetchPagos = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const { id: usuario_id } = JSON.parse(userStr);
      const res = await fetch(`${BASE_URL}/pagos_fijos/usuario/${usuario_id}`);
      const data = await res.json();
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data.success && data.pagos_fijos) {
        list = data.pagos_fijos;
      } else {
        console.error("Error al obtener pagos fijos:", data);
      }
      // Compute next payment date and ensure monto is number
      const computed = list.map((pago) => {
        const dia = pago.dia_pago;
        const hoy = new Date();
        let mes = hoy.getMonth();
        let anio = hoy.getFullYear();
        if (dia < hoy.getDate()) {
          mes += 1;
          if (mes > 11) {
            mes = 0;
            anio += 1;
          }
        }
        const fechaProxima = new Date(anio, mes, dia);
        return {
          ...pago,
          monto: Number(pago.monto),
          proximo: fechaProxima.toLocaleDateString(),
        };
      });
      setPagosFijos(computed);
    } catch (e) {
      console.error(e);
    }
  };

  // Refresh list on screen focus
  useEffect(() => {
    if (isFocused) {
      fetchPagos();
    }
  }, [isFocused]);

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
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {(pagosFijos || []).map((pago) => (
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
                <View style={styles.iconsContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("EditarPagoFijo", { pago })
                    }
                    style={styles.iconButton}
                  >
                    <Ionicons name="create-outline" size={20} color="#222" />
                  </TouchableOpacity>
                  <Ionicons
                    name={
                      expandedId === pago.id ? "chevron-up" : "chevron-forward"
                    }
                    size={24}
                    color="#222"
                  />
                </View>
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
};

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
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 12,
  },
});

export default PagosFijosScreen;
