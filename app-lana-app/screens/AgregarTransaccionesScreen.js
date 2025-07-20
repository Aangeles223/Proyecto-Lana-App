import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AgregarTransaccionScreen({ navigation }) {
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("Comida");
  const [fecha, setFecha] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [descripcion, setDescripcion] = useState("");

  const handleAgregar = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Transacción completada",
        body: `Transacción registrada: $${monto}.`,
        sound: true,
      },
      trigger: null,
    });
    navigation.goBack(); // O navega a la pantalla de Transacciones si tienes una
  };

  return (
    <View style={styles.background}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Image
          source={{ uri: "https://i.ibb.co/3Nw2yQk/lana-app-logo.png" }}
          style={styles.logo}
        />
        <Ionicons
          name="notifications-outline"
          size={28}
          color="#222"
          style={{ marginLeft: "auto" }}
        />
      </View>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Agregar Transacción</Text>
        <TextInput
          style={styles.input}
          value={monto}
          onChangeText={setMonto}
          keyboardType="numeric"
          placeholder="$0"
          placeholderTextColor="#bdbdbd"
        />
        {/* Categoría */}
        <TouchableOpacity
          style={styles.selectRow}
          onPress={() =>
            setCategoria(categoria === "Comida" ? "Opcional" : "Comida")
          }
        >
          <MaterialIcons name="category" size={24} color="#43a047" />
          <Text style={styles.selectText}>{categoria}</Text>
          <Ionicons
            name="chevron-forward"
            size={22}
            color="#222"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>
        {/* Fecha */}
        <TouchableOpacity
          style={styles.selectRow}
          onPress={() => setShowDate(true)}
        >
          <MaterialIcons name="date-range" size={24} color="#1976d2" />
          <Text style={styles.selectText}>{fecha.toLocaleDateString()}</Text>
          <Ionicons
            name="chevron-forward"
            size={22}
            color="#222"
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>
        {showDate && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, selectedDate) => {
              setShowDate(false);
              if (selectedDate) setFecha(selectedDate);
            }}
          />
        )}
        {/* Descripción */}
        <TextInput
          style={styles.descripcion}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Opcional"
          placeholderTextColor="#bdbdbd"
        />
        {/* Botón Agregar */}
        <TouchableOpacity style={styles.button} onPress={handleAgregar}>
          <Text style={styles.buttonText}>Agregar</Text>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 18,
    marginBottom: 10,
    marginTop: 10,
  },
  logo: { width: 90, height: 30, resizeMode: "contain", marginLeft: 60 },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -40,
  },
  title: {
    fontSize: 28,
    color: "#222",
    fontFamily: "serif",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    fontSize: 28,
    color: "#222",
    fontFamily: "serif",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 8,
    width: 220,
    marginBottom: 20,
    backgroundColor: "#fff",
    paddingVertical: 8,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginVertical: 8,
    width: 260,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectText: {
    fontSize: 18,
    color: "#222",
    fontFamily: "serif",
    marginLeft: 12,
  },
  descripcion: {
    width: 260,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    marginTop: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#222",
    fontFamily: "serif",
  },
  button: {
    backgroundColor: "#185a9d",
    borderRadius: 8,
    paddingVertical: 12,
    width: 200,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 18, fontFamily: "serif" },
});
