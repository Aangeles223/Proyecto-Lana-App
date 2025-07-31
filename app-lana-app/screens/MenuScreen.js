import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LogoLana from "../components/LogoLana";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MenuScreen({ navigation, onLogout }) {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          // (Opcional) Refresca datos desde la BD
          const res = await fetch(
            `http://192.168.1.67:3000/usuario/${userObj.id}`
          );
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(userObj); // fallback a local
          }
        }
      } catch (e) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    setShowModal(false);
    onLogout();
    navigation.navigate("Principal");
  };

  return (
    <LinearGradient colors={["#fff", "#faf7f7"]} style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.logoContainer}>
          <LogoLana />
        </View>
      </View>
      <Text style={styles.title}>Menú</Text>
      {/* Info de usuario */}
      {user && (
        <View style={styles.userInfoBox}>
          <Ionicons name="person-circle-outline" size={60} color="#185a9d" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.userName}>
              {user.nombre} {user.apellidos}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      )}
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
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.logoutText}>Salir</Text>
        <Ionicons
          name="arrow-forward"
          size={28}
          color="red"
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>

      {/* Modal de confirmación */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>¿Estás seguro de salir?</Text>
            <View style={styles.modalBtnRow}>
              <Pressable style={styles.modalBtn} onPress={handleLogout}>
                <Text style={{ color: "red", fontWeight: "bold" }}>Sí</Text>
              </Pressable>
              <Pressable
                style={styles.modalBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ color: "#222" }}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: "center",
  },
  title: {
    fontSize: 38,
    fontFamily: "serif",
    fontWeight: "400",
    textAlign: "center",
    marginVertical: 18,
    color: "#222",
  },
  userInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f7fa",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 10,
    elevation: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#185a9d",
  },
  userEmail: {
    fontSize: 15,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: 300,
    alignItems: "center",
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 18,
    textAlign: "center",
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
});
