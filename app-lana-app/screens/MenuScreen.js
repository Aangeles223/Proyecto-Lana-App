import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function MenuScreen({ navigation }) {
  return (
    <LinearGradient colors={["#fff", "#faf7f7"]} style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        {/* Flecha eliminada */}
        <Image
          source={{ uri: "https://i.ibb.co/3Nw2yQk/lana-app-logo.png" }}
          style={styles.logo}
        />
      </View>
      <Text style={styles.title}>Menú</Text>
      {/* Opciones */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.navigate("Perfil")}
        >
          <Ionicons
            name="person-circle-outline"
            size={32}
            color="#222"
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn}>
          <FontAwesome5
            name="user-cog"
            size={28}
            color="#222"
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Configuracion</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuBtn}>
          <MaterialIcons
            name="security"
            size={28}
            color="#222"
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Seguridad</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.navigate("AgregarDineroMonto")}
        >
          <Feather
            name="dollar-sign"
            size={28}
            color="#222"
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Agregar Dinero</Text>
        </TouchableOpacity>
      </View>
      {/* Botón Salir */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => navigation.replace("Login")}
      >
        <Text style={styles.logoutText}>Salir</Text>
        <Ionicons
          name="arrow-forward"
          size={28}
          color="red"
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 10,
    paddingHorizontal: 16,
    justifyContent: "center", // Centra el logo
  },
  logo: {
    width: 90,
    height: 40,
    resizeMode: "contain",
  },
  title: {
    fontSize: 38,
    fontFamily: "serif",
    fontWeight: "400",
    textAlign: "center",
    marginVertical: 18,
    color: "#222",
  },
  menuContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  menuBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ededed",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 8,
    width: "80%",
    elevation: 2,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 22,
    fontFamily: "serif",
    color: "#222",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  logoutText: {
    color: "red",
    fontSize: 22,
    fontFamily: "serif",
    marginRight: 4,
  },
});
