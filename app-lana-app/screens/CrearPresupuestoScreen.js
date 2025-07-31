import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogoLana from "../components/LogoLana";

export default function CrearPresupuestoScreen({ navigation }) {
  const [monto, setMonto] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [periodo, setPeriodo] = useState("mensual");

  useEffect(() => {
    const fetchCategorias = async () => {
      const res = await fetch("http://192.168.1.67:3000/categorias");
      const data = await res.json();
      if (data.success) {
        setCategorias(data.categorias);
        if (data.categorias.length > 0) setCategoria(data.categorias[0].id);
      }
    };
    fetchCategorias();
  }, []);

  const handleAgregar = async () => {
    if (!monto || isNaN(Number(monto))) {
      Alert.alert("Error", "Ingresa un monto válido.");
      return;
    }
    const userStr = await AsyncStorage.getItem("user");
    const user = JSON.parse(userStr);
    const fecha = new Date();
    let mes = fecha.getMonth() + 1;
    let anio = fecha.getFullYear();

    const res = await fetch("http://10.0.0.11:3000/presupuestos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id: user.id,
        categoria_id: categoria,
        monto_mensual: Number(monto),
        mes,
        anio,
      }),
    });
    const data = await res.json();
    if (data.success) {
      navigation.goBack();
    } else {
      Alert.alert("Error", "No se pudo agregar el presupuesto.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.background}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={60}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <LogoLana />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.title}>Crear presupuesto</Text>
          {/* Picker de Categoría */}
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoria}
              style={styles.picker}
              onValueChange={(itemValue) => setCategoria(itemValue)}
            >
              {categorias.map((cat) => (
                <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
              ))}
            </Picker>
          </View>
          {/* Monto */}
          <Text style={styles.label}>Monto</Text>
          <TextInput
            style={styles.input}
            value={monto}
            onChangeText={setMonto}
            placeholder="Monto"
            placeholderTextColor="#bdbdbd"
            keyboardType="numeric"
          />
          {/* Periodo */}
          <Text style={styles.label}>Periodo</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={periodo}
              style={styles.picker}
              onValueChange={(itemValue) => setPeriodo(itemValue)}
            >
              <Picker.Item label="Mensual" value="mensual" />
              <Picker.Item label="Quincenal" value="quincenal" />
              <Picker.Item label="Semanal" value="semanal" />
            </Picker>
          </View>
          {/* Botón Agregar */}
          <TouchableOpacity style={styles.button} onPress={handleAgregar}>
            <Text style={styles.buttonText}>Agregar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#faf7f7",
    paddingTop: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
  },
  title: {
    fontSize: 28,
    color: "#222",
    fontFamily: "serif",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: "#222",
    fontFamily: "serif",
    marginTop: 10,
    marginBottom: 2,
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1976d2",
    marginBottom: 10,
    width: 320,
    alignSelf: "center",
  },
  picker: {
    width: "100%",
    color: "#222",
    fontSize: 16,
    backgroundColor: "#fff",
  },
  input: {
    fontSize: 22,
    color: "#222",
    fontFamily: "serif",
    textAlign: "left",
    borderWidth: 1,
    borderColor: "#222",
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
    paddingVertical: 16,
    width: 320,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: { color: "#222", fontSize: 22, fontFamily: "serif" },
});
