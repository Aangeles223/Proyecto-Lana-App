import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Feather,
  FontAwesome5,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";

export default function PrincipalScreen() {
  return (
    <LinearGradient colors={["#7fd8f7", "#e0f7fa"]} style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />
        <Text style={styles.bienvenida}>Bienvenido, Juan</Text>
        <TouchableOpacity style={styles.bellContainer}>
          <Ionicons name="notifications-outline" size={28} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={{
            uri: "https://i.ibb.co/3Nw2yQk/lana-app-logo.png",
          }}
          style={styles.logo}
        />
      </View>
      {/* Card principal */}
      <View style={styles.card}>
        <Text style={styles.saldoLabel}>Saldo total</Text>
        <Text style={styles.saldo}>$3,800.00</Text>
        {/* Acciones rápidas */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="plus-circle" size={28} color="#222" />
            <Text style={styles.actionText}>Agregar{"\n"}Transacciones</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <FontAwesome5 name="piggy-bank" size={24} color="#222" />
            <Text style={styles.actionText}>Presupuesto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <FontAwesome5 name="chart-bar" size={24} color="#222" />
            <Text style={styles.actionText}>Reporte{"\n"}de gastos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
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
          <View style={styles.transaccionRow}>
            <View style={[styles.transIcon, { backgroundColor: "#b2f0e6" }]}>
              <MaterialIcons name="restaurant" size={24} color="#222" />
            </View>
            <View style={styles.transInfo}>
              <Text style={styles.transTitle}>Comida</Text>
              <Text style={styles.transDate}>10 de mayo de 2025</Text>
              <Text style={styles.transDesc}>Almuerzo en restaurante</Text>
            </View>
            <Text style={styles.transAmountRed}>- $450.00</Text>
          </View>
          <View style={styles.transaccionRow}>
            <View style={[styles.transIcon, { backgroundColor: "#f7c6c7" }]}>
              <MaterialIcons name="shopping-cart" size={24} color="#222" />
            </View>
            <View style={styles.transInfo}>
              <Text style={styles.transTitle}>Compras</Text>
              <Text style={styles.transDate}>17 de mayo de 2025</Text>
              <Text style={styles.transDesc}>Zapatos nuevos</Text>
            </View>
            <Text style={styles.transAmountRed}>- $2,000.00</Text>
          </View>
          <View style={styles.transaccionRow}>
            <View style={[styles.transIcon, { backgroundColor: "#e2d1f9" }]}>
              <MaterialIcons name="home" size={24} color="#222" />
            </View>
            <View style={styles.transInfo}>
              <Text style={styles.transTitle}>Renta</Text>
              <Text style={styles.transDate}>21 de mayo de 2025</Text>
              <Text style={styles.transDesc}>Renta de vivienda</Text>
            </View>
            <Text style={styles.transAmountRed}>- $5,000.00</Text>
          </View>
          <View style={styles.transaccionRow}>
            <View style={[styles.transIcon, { backgroundColor: "#b2f7b8" }]}>
              <Feather name="plus-circle" size={24} color="#222" />
            </View>
            <View style={styles.transInfo}>
              <Text style={styles.transTitle}>Dinero añadido</Text>
              <Text style={styles.transDate}>22 de mayo de 2025</Text>
              <Text style={styles.transDesc}>Visa ****9999</Text>
            </View>
            <Text style={styles.transAmountGreen}>$1,000.00</Text>
          </View>
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
    justifyContent: "space-between",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
  },
  bienvenida: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    color: "#222",
    fontWeight: "600",
    marginLeft: -48,
  },
  bellContainer: {
    marginLeft: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  logo: {
    width: 110,
    height: 40,
    resizeMode: "contain",
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
