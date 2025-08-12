import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Host detection según Expo debuggerHost o IP fija
const manifest = Constants.manifest || {};
const debuggerHost = manifest.debuggerHost?.split(":")[0];
const devHost = debuggerHost || "172.20.10.6";
const BASE_URL = `http://${devHost}:3000`;

export default function NotificacionesScreen({ navigation }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotificaciones = useCallback(async () => {
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) return;
      const { id: usuario_id } = JSON.parse(userStr);
      const res = await fetch(`${BASE_URL}/notificaciones/${usuario_id}`);
      const data = await res.json();
      setNotifs(data);
    } catch (e) {
      console.error("Error al cargar notificaciones:", e);
      Alert.alert("Error", "No se pudieron cargar las notificaciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarLeido = async (id) => {
    try {
      await fetch(`${BASE_URL}/notificaciones/${id}/leido`, { method: "PUT" });
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leido: 1 } : n))
      );
    } catch (e) {
      console.error("Error al marcar notificación leída:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotificaciones();
    }, [fetchNotificaciones])
  );

  if (loading) {
    return (
      <ActivityIndicator style={styles.loading} size="large" color="#1976d2" />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifs}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, item.leido ? null : styles.unread]}
            onPress={() => marcarLeido(item.id)}
          >
            <Text style={styles.message}>{item.mensaje}</Text>
            <Text style={styles.date}>
              {new Date(item.fecha_envio).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay notificaciones</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#faf7f7",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  loading: { flex: 1, justifyContent: "center" },
  item: { backgroundColor: "#fff", padding: 12, margin: 8, borderRadius: 8 },
  unread: { borderLeftWidth: 4, borderLeftColor: "#1976d2" },
  message: { fontSize: 16, color: "#222" },
  date: { fontSize: 12, color: "#888", marginTop: 4 },
  empty: { textAlign: "center", marginTop: 20, color: "#888" },
});
