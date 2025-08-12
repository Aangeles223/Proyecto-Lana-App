import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Switch,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import LogoLana from "../components/LogoLana";
import Constants from "expo-constants";

// Host detection and base URL
const manifest = Constants.manifest || {};
const debuggerHost = manifest.debuggerHost?.split(":")[0];
const host =
  debuggerHost || (Platform.OS === "android" ? "10.0.2.2" : "10.0.0.11");
const BASE_URL = `http://${host}:3000`;

export default function ConfiguracionScreen({ navigation }) {
  const [notifsCount, setNotifsCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  

  useFocusEffect(
    React.useCallback(() => {
      const fetchNotifs = async () => {
        try {
          const userStr = await AsyncStorage.getItem("user");
          if (!userStr) return;
          const { id: usuario_id } = JSON.parse(userStr);
          const res = await fetch(`${BASE_URL}/notificaciones/${usuario_id}`);
          const data = await res.json();
          const unread = Array.isArray(data)
            ? data.filter((n) => n.leido === 0).length
            : 0;
          setNotifsCount(unread);
        } catch (e) {
          console.error("Error fetching notification count:", e);
        }
      };
      fetchNotifs();
    }, [])
  );

  useEffect(() => {
    // Cargar configuraciones guardadas
    const loadSettings = async () => {
      try {
        const notifications = await AsyncStorage.getItem("notifications_enabled");
        const sound = await AsyncStorage.getItem("sound_enabled");
        const update = await AsyncStorage.getItem("auto_update");
        
        if (notifications !== null) setNotificationsEnabled(JSON.parse(notifications));
        if (sound !== null) setSoundEnabled(JSON.parse(sound));
        if (update !== null) setAutoUpdate(JSON.parse(update));
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    };
    loadSettings();
  }, []);

  const handleNotificationToggle = async (value) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem("notifications_enabled", JSON.stringify(value));
  };

  const handleSoundToggle = async (value) => {
    setSoundEnabled(value);
    await AsyncStorage.setItem("sound_enabled", JSON.stringify(value));
  };

  const handleAutoUpdateToggle = async (value) => {
    setAutoUpdate(value);
    await AsyncStorage.setItem("auto_update", JSON.stringify(value));
  };

  return (
    <LinearGradient colors={["#7fd8f7", "#e0f7fa"]} style={{ flex: 1 }}>
      {/* Header igual que la plantilla */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, alignItems: "flex-start" }} />
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

      {/* Card de Configuración */}
      <View style={styles.card}>
        <Text style={styles.titleText}>Configuración</Text>
        
        {/* Sección de Notificaciones */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={20} color="#222" />
              <Text style={styles.settingText}>Activar notificaciones</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: "#d3d3d3", true: "#7fd8f7" }}
              thumbColor={notificationsEnabled ? "#0891b2" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Sección de Sonidos */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sonidos</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="volume-high-outline" size={20} color="#222" />
              <Text style={styles.settingText}>Sonidos de la app</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: "#d3d3d3", true: "#7fd8f7" }}
              thumbColor={soundEnabled ? "#0891b2" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Opciones de botones */}

        <TouchableOpacity 
          style={styles.optionBtn} 
          onPress={() => setMostrarTerminos(!mostrarTerminos)}
        >
          <View style={styles.optionContent}>
            <Ionicons name="document-text-outline" size={20} color="#222" />
            <Text style={styles.optionText}>Términos y condiciones</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#222" />
        </TouchableOpacity>

      {/* Texto desplegable */}
      {mostrarTerminos && (
        <View style={styles.cajaTexto}>
          <Text style={styles.texto}>
            Bienvenido/a a nuestra aplicación. Al usar este servicio aceptas
            los siguientes términos y condiciones:
          </Text>
          <Text style={styles.texto}>
            1. Uso permitido: Solo podrás usar la aplicación de forma legal y
            ética.
          </Text>
          <Text style={styles.texto}>
            2. Privacidad: Nos comprometemos a proteger tus datos según nuestra
            política de privacidad.
          </Text>
          <Text style={styles.texto}>
            Al continuar usando esta aplicación aceptas cualquier cambio que
            realicemos en estos términos. 
          </Text>
        </View>
      )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 24,
    backgroundColor: "transparent",
    justifyContent: "center",
  },
  bellContainer: {
    alignItems: "flex-end",
    marginLeft: 10,
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
  card: {
    backgroundColor: "#faf7f7",
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    marginTop: 30,
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 28,
    color: "#222",
    fontFamily: "serif",
    fontWeight: "bold",
    marginBottom: 30,
  },
  sectionContainer: {
    width: "90%",
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#222",
    fontFamily: "serif",
    fontWeight: "600",
    marginBottom: 15,
    paddingLeft: 5,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 10,
    elevation: 2,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: "#222",
    fontFamily: "serif",
    marginLeft: 12,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginVertical: 8,
    width: "90%",
    justifyContent: "space-between",
    elevation: 2,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: "#222",
    fontFamily: "serif",
    marginLeft: 12,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e74c3c",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginTop: 20,
    width: "90%",
    justifyContent: "center",
    elevation: 2,
  },
  logoutText: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "serif",
    fontWeight: "600",
    marginLeft: 8,
  },
  boton: {
    padding: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },
  botonTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  cajaTexto: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  texto: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
    color: "#333",
  },
});