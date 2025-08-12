import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
  ScrollView,
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

export default function AyudanosMejorarScreen({ navigation }) {
  const [notifsCount, setNotifsCount] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [categoria, setCategoria] = useState("");
  const [loading, setLoading] = useState(false);

  const categorias = [
    "Funcionalidad",
    "Diseño",
    "Rendimiento",
    "Bug/Error",
    "Sugerencia",
    "Otro"
  ];

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

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || !categoria) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      const res = await fetch(`${BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: user?.id || null,
          categoria,
          mensaje: feedback,
        }),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert("¡Gracias!", "Tu feedback ha sido enviado correctamente");
        setFeedback("");
        setCategoria("");
      } else {
        Alert.alert("Error", "No se pudo enviar el feedback");
      }
    } catch (e) {
      Alert.alert("Error", "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#7fd8f7", "#e0f7fa"]} style={{ flex: 1 }}>
      {/* Header */}
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

      {/* Card */ }
      <ScrollView style={styles.card} showsVerticalScrollIndicator={false}>
        <View style={styles.cardContent}>
          <Text style={styles.title}>Ayúdanos a mejorar</Text>
          <Text style={styles.subtitle}>
            Tu opinión es muy importante para nosotros
          </Text>

          {/* Selector de categoría */ }
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.categoriaContainer}>
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoriaBtn,
                  categoria === cat && styles.categoriaBtnSelected,
                ]}
                onPress={() => setCategoria(cat)}
              >
                <Text
                  style={[
                    styles.categoriaText,
                    categoria === cat && styles.categoriaTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Campo de texto */ }
          <Text style={styles.label}>Tu feedback</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Cuéntanos qué podemos mejorar..."
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor="#888"
          />

          {/* Botón enviar */ }
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmitFeedback}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? "Enviando..." : "Enviar Feedback"}
            </Text>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
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
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: "#222",
    fontFamily: "serif",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    fontFamily: "serif",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  label: {
    fontSize: 18,
    color: "#222",
    fontFamily: "serif",
    alignSelf: "flex-start",
    marginBottom: 12,
    fontWeight: "600",
  },
  categoriaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    marginBottom: 24,
    justifyContent: "center",
  },
  categoriaBtn: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    elevation: 1,
  },
  categoriaBtnSelected: {
    backgroundColor: "#7fd8f7",
  },
  categoriaText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "serif",
  },
  categoriaTextSelected: {
    color: "#222",
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    minHeight: 120,
    fontSize: 16,
    color: "#222",
    fontFamily: "serif",
    elevation: 1,
    marginBottom: 24,
  },
  submitBtn: {
    backgroundColor: "#7fd8f7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "80%",
    elevation: 3,
    gap: 8,
  },
  submitBtnDisabled: {
    backgroundColor: "#ccc",
  },
  submitBtnText: {
    fontSize: 18,
    color: "white",
    fontFamily: "serif",
    fontWeight: "600",
  },
});
