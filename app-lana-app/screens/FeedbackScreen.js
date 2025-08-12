import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FeedbackScreen({ navigation }) {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    Alert.alert(
      "Gracias",
      `Tu feedback ha sido enviado. Calificación: ${rating} estrella(s)`
    );
    setFeedback("");
    Keyboard.dismiss();
    setRating(0);
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
          <Text style={styles.title}>Ayúdanos a mejorar</Text>
          <Text style={styles.subtitle}>¿Cómo calificas la app?</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Ionicons
                  name={i <= rating ? "star" : "star-outline"}
                  size={32}
                  color="#f1c40f"
                  style={styles.star}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu sugerencia"
            multiline
            value={feedback}
            onChangeText={setFeedback}
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.btnText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  inner: { flex: 1, padding: 24, backgroundColor: "#faf7f7" },
  back: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#222" },
  subtitle: { fontSize: 16, marginBottom: 20, color: "#666" },
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
  ratingRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  star: {
    marginRight: 10,
  },
});
