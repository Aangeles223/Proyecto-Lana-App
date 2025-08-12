import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ContactUsScreen({ navigation }) {
  const [message, setMessage] = useState("");

  const contactEmail = "support@lanaapp.com";
  const contactPhone = "+525512345678";

  const handleSend = () => {
    Alert.alert("Enviado", "Tu mensaje ha sido enviado correctamente.");
    setMessage("");
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.title}>Contáctanos</Text>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#1976d2" />
            <Text
              style={styles.infoText}
              onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
            >
              {contactEmail}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#1976d2" />
            <Text
              style={styles.infoText}
              onPress={() => Linking.openURL(`tel:${contactPhone}`)}
            >
              {contactPhone}
            </Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu mensaje aquí"
            multiline
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.button} onPress={handleSend}>
            <Text style={styles.btnText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: "flex-start",
    backgroundColor: "#faf7f7",
  },
  back: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#222" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#1976d2",
    textDecorationLine: "underline",
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
