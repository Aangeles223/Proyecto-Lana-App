import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
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

export default function AyudaScreen({ navigation }) {
  const [notifsCount, setNotifsCount] = useState(0);
  const [info, setInfo] = useState(null);

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
    const fetchInfo = async () => {
      try {
        const res = await fetch(`${BASE_URL}/ayuda/info`);
        const data = await res.json();
        if (data.success) setInfo(data.info);
      } catch (e) {
        setInfo(null);
      }
    };
    fetchInfo();
  }, []);

  return (
    <LinearGradient colors={["#7fd8f7", "#e0f7fa"]} style={{ flex: 1 }}>
      {/* Header igual que antes */}
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
      {/* Card */}
      <View style={styles.card}>
        {info ? (
          <>
            <Text style={styles.optionText}>Contacto: {info.contacto}</Text>
            <Text style={styles.optionText}>Email: {info.email}</Text>
            {/* Puedes mostrar más campos de la tabla ayuda */}
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.optionBtn}>
              <Text style={styles.optionText}>Contáctanos</Text>
              <Ionicons name="chevron-forward" size={24} color="#222" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionBtn}>
              <Text style={styles.optionText}>Ayúdanos a mejorar</Text>
              <Ionicons name="chevron-forward" size={24} color="#222" />
            </TouchableOpacity>
          </>
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
    paddingTop: 60,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginVertical: 12,
    width: "80%",
    justifyContent: "space-between",
    elevation: 2,
  },
  optionText: {
    fontSize: 20,
    color: "#222",
    fontFamily: "serif",
  },
});
