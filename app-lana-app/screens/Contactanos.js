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
  Linking,
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

export default function ContactanosScreen({ navigation }) {
  const [notifsCount, setNotifsCount] = useState(0);
  const [contactInfo, setContactInfo] = useState(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

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
    const fetchContactInfo = async () => {
      try {
        const res = await fetch(`${BASE_URL}/contacto/info`);
        const data = await res.json();
        if (data.success) setContactInfo(data.info);
      } catch (e) {
        console.log("Error fetching contact info:", e);
      }
    };
    fetchContactInfo();
  }, []);

  const handleSendMessage = async () => {
    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Por favor ingresa un email válido");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/contacto/mensaje`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          email,
          mensaje,
        }),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert("¡Mensaje enviado!", "Te responderemos pronto");
        setNombre("");
        setEmail("");
        setMensaje("");
      } else {
        Alert.alert("Error", "No se pudo enviar el mensaje");
      }
    } catch (e) {
      Alert.alert("Error", "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const openPhone = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/\s+/g, "");
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
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
          <Text style={styles.title}>Contáctanos</Text>
          <Text style={styles.subtitle}>
            Estamos aquí para ayudarte
          </Text>

          
          {contactInfo && (
            <View style={styles.contactInfoContainer}>
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => openPhone(contactInfo.telefono)}
              >
                <Ionicons name="call" size={24} color="#7fd8f7" />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>Teléfono</Text>
                  <Text style={styles.contactValue}>{contactInfo.telefono}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => openEmail(contactInfo.email)}
              >
                <Ionicons name="mail" size={24} color="#7fd8f7" />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>{contactInfo.email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>

              {contactInfo.whatsapp && (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => openWhatsApp(contactInfo.whatsapp)}
                >
                  <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>WhatsApp</Text>
                    <Text style={styles.contactValue}>{contactInfo.whatsapp}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#888" />
                </TouchableOpacity>
              )}

              {contactInfo.direccion && (
                <View style={styles.contactItem}>
                  <Ionicons name="location" size={24} color="#7fd8f7" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Dirección</Text>
                    <Text style={styles.contactValue}>{contactInfo.direccion}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Envíanos un mensaje</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Tu nombre"
              value={nombre}
              onChangeText={setNombre}
              placeholderTextColor="#888"
            />

            <TextInput
              style={styles.input}
              placeholder="Tu email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tu mensaje"
              value={mensaje}
              onChangeText={setMensaje}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholderTextColor="#888"
            />

            <TouchableOpacity
              style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
              onPress={handleSendMessage}
              disabled={loading}
            >
              <Text style={styles.sendBtnText}>
                {loading ? "Enviando..." : "Enviar Mensaje"}
              </Text>
              <Ionicons name="send" size={20} color="white" />
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
  contactInfoContainer: {
    marginBottom: 30,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    elevation: 2,
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  contactLabel: {
    fontSize: 14,
    color: "#666",
    fontFamily: "serif",
  },
  contactValue: {
    fontSize: 16,
    color: "#222",
    fontFamily: "serif",
    fontWeight: "600",
  },
  formContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 20,
    elevation: 1,
  },
  formTitle: {
    fontSize: 20,
    color: "#222",
    fontFamily: "serif",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#222",
    fontFamily: "serif",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    minHeight: 100,
  },
  sendBtn: {
    backgroundColor: "#7fd8f7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 16,
    elevation: 3,
    gap: 8,
    marginTop: 8,
  },
  sendBtnDisabled: {
    backgroundColor: "#ccc",
  },
  sendBtnText: {
    fontSize: 18,
    color: "white",
    fontFamily: "serif",
    fontWeight: "600",
  },
});
