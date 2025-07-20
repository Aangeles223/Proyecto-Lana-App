import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AgregarPagoFijoScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [proximo, setProximo] = useState("");

  const handleGuardar = () => {
    // Aquí puedes guardar el pago fijo en tu BD o estado global
    navigation.goBack();
  };

  return (
    <View style={styles.background}>
      <Text style={styles.title}>Agregar Pago Fijo</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Nombre (ej. Renta)"
        placeholderTextColor="#bdbdbd"
      />
      <TextInput
        style={styles.input}
        value={monto}
        onChangeText={setMonto}
        placeholder="Monto"
        placeholderTextColor="#bdbdbd"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={proximo}
        onChangeText={setProximo}
        placeholder="Próximo pago (ej. 5 jun.)"
        placeholderTextColor="#bdbdbd"
      />
      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelBtnText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#faf7f7",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    color: "#1976d2",
    fontFamily: "serif",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 30,
  },
  input: {
    fontSize: 20,
    color: "#222",
    fontFamily: "serif",
    borderWidth: 1,
    borderColor: "#1976d2",
    borderRadius: 12,
    width: 320,
    marginBottom: 18,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  button: {
    backgroundColor: "#54bcd4",
    borderRadius: 12,
    paddingVertical: 14,
    width: 220,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#222",
    fontSize: 18,
    fontFamily: "serif",
    fontWeight: "bold",
  },
  cancelBtn: {
    marginTop: 16,
  },
  cancelBtnText: {
    color: "#1976d2",
    fontSize: 16,
    fontFamily: "serif",
    textDecorationLine: "underline",
  },
});
