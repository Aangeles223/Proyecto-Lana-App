import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Switch,
  TextInput,
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

export default function SeguridadScreen({ navigation }) {
  const [notifsCount, setNotifsCount] = useState(0);
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Configuraciones de seguridad
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [showSecurityAlerts, setShowSecurityAlerts] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchNotifs = async () => {
        try {
          const userStr = await AsyncStorage.getItem("user");
          if (!userStr) return;
          const userData = JSON.parse(userStr);
          setUser(userData);
          const { id: usuario_id } = userData;
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
    const loadSecuritySettings = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (!userStr) return;
        const { id: usuario_id } = JSON.parse(userStr);

        const res = await fetch(`${BASE_URL}/usuario/seguridad/${usuario_id}`);
        const data = await res.json();

        if (data.success) {
          setTwoFactorEnabled(data.settings.two_factor_enabled || false);
          setLoginNotifications(data.settings.login_notifications || true);
          setShowSecurityAlerts(data.settings.security_alerts || true);
        }
      } catch (e) {
        console.log("Error loading security settings:", e);
      }
    };
    loadSecuritySettings();
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Error",
        "La nueva contraseña debe tener al menos 6 caracteres"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/usuario/cambiar-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: user.id,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert("¡Éxito!", "Contraseña cambiada correctamente");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert(
          "Error",
          data.message || "No se pudo cambiar la contraseña"
        );
      }
    } catch (e) {
      Alert.alert("Error", "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const updateSecuritySetting = async (setting, value) => {
    try {
      const res = await fetch(`${BASE_URL}/usuario/seguridad`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: user.id,
          [setting]: value,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Error", "No se pudo actualizar la configuración");
      }
    } catch (e) {
      Alert.alert("Error", "Error de conexión");
    }
  };

  return (
    <LinearGradient colors={["#7fd8f7", "#e0f7fa"]} style={{ flex: 1 }}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#222" />
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

      <ScrollView style={styles.card} showsVerticalScrollIndicator={false}>
        <View style={styles.cardContent}>
          <Text style={styles.title}>Seguridad</Text>
          <Text style={styles.subtitle}>
            Protege tu cuenta con estas configuraciones
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cambiar contraseña</Text>

            <TextInput
              style={styles.input}
              placeholder="Contraseña actual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholderTextColor="#888"
            />

            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholderTextColor="#888"
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholderTextColor="#888"
            />

            <TouchableOpacity
              style={[styles.changePasswordBtn, loading && styles.btnDisabled]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.changePasswordBtnText}>
                {loading ? "Cambiando..." : "Cambiar contraseña"}
              </Text>
              <Ionicons name="key" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  backBtn: {
    padding: 8,
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
  },
  cardContent: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: "#222",
    fontFamily: "serif",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontFamily: "serif",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  section: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#222",
    fontFamily: "serif",
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: "#222",
    fontFamily: "serif",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  changePasswordBtn: {
    backgroundColor: "#7fd8f7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    elevation: 3,
    gap: 8,
    marginTop: 8,
  },
  btnDisabled: {
    backgroundColor: "#ccc",
  },
  changePasswordBtnText: {
    fontSize: 16,
    color: "white",
    fontFamily: "serif",
    fontWeight: "600",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#222",
    fontFamily: "serif",
    fontWeight: "600",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    fontFamily: "serif",
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  dangerBtn: {
    borderColor: "#ff4444",
    borderWidth: 1,
  },
  actionTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    color: "#222",
    fontFamily: "serif",
    fontWeight: "600",
  },
  dangerText: {
    color: "#ff4444",
  },
  actionDescription: {
    fontSize: 14,
    color: "#666",
    fontFamily: "serif",
    marginTop: 2,
  },
});
