import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import LogoLana from "../components/LogoLana";

export default function CrearPresupuestoScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [showInicio, setShowInicio] = useState(false);
  const [showFin, setShowFin] = useState(false);
  const [recurrencia, setRecurrencia] = useState("Cada dos semanas");

  const handleGuardar = () => {
    // Aquí puedes guardar el presupuesto en la BD o en estado global
    navigation.goBack();
  };

  return (
    <View style={styles.background}>
      {/* Logo centrado */}
      <View style={styles.logoContainer}>
        <LogoLana />
      </View>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Crear presupuesto</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre"
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
        {/* Fecha de inicio */}
        <TouchableOpacity
          style={styles.selectRow}
          onPress={() => setShowInicio(true)}
        >
          <Ionicons name="calendar" size={22} color="#1976d2" />
          <Text style={styles.selectText}>
            {fechaInicio.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {showInicio && (
          <DateTimePicker
            value={fechaInicio}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              setShowInicio(false);
              if (selectedDate) setFechaInicio(selectedDate);
            }}
          />
        )}
        {/* Fecha de fin */}
        <TouchableOpacity
          style={styles.selectRow}
          onPress={() => setShowFin(true)}
        >
          <Ionicons name="calendar" size={22} color="#1976d2" />
          <Text style={styles.selectText}>{fechaFin.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showFin && (
          <DateTimePicker
            value={fechaFin}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              setShowFin(false);
              if (selectedDate) setFechaFin(selectedDate);
            }}
          />
        )}
        {/* Recurrencia */}
        <TouchableOpacity
          style={styles.selectRow}
          onPress={() => setRecurrencia("Cada dos semanas")}
        >
          <Ionicons name="repeat" size={22} color="#1976d2" />
          <Text style={styles.selectText}>{recurrencia}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleGuardar}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#faf7f7",
    paddingTop: 30,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -40, // Ajusta si quieres más arriba o abajo
  },
  title: {
    fontSize: 32,
    color: "#222",
    fontFamily: "serif",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 30,
  },
  input: {
    fontSize: 22,
    color: "#222",
    fontFamily: "serif",
    textAlign: "left",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 12,
    width: 340,
    marginBottom: 18,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginVertical: 10,
    width: 340,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectText: {
    fontSize: 20,
    color: "#222",
    fontFamily: "serif",
    marginLeft: 12,
  },
  button: {
    backgroundColor: "#54bcd4",
    borderRadius: 12,
    paddingVertical: 16,
    width: 320,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: { color: "#222", fontSize: 22, fontFamily: "serif" },
});
