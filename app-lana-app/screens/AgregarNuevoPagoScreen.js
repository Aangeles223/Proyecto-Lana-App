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
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Determinar base URL
const host = Constants.manifest?.debuggerHost?.split(":")[0] || "10.16.36.167";
const BASE_URL = `http://${host}:3000`;

export default function AgregarPagoFijoScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [proximo, setProximo] = useState("");
  const [servicios, setServicios] = useState([]);
  const [servicio, setServicio] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState(null);

  useEffect(() => {
    // fetch servicios y categorias
    const fetchData = async () => {
      try {
        const res1 = await fetch(`${BASE_URL}/servicios`);
        const list1 = await res1.json();
        setServicios(list1);
        if (list1.length) setServicio(list1[0].id);
        const res2 = await fetch(`${BASE_URL}/categorias`);
        const json2 = await res2.json();
        const list2 = Array.isArray(json2) ? json2 : json2.categorias || [];
        setCategorias(list2);
        if (list2.length) setCategoria(list2[0].id);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const handleGuardar = async () => {
    try {
      // Obtener usuario actual de AsyncStorage
      const usuario = await AsyncStorage.getItem("user");
      const { id: usuario_id } = JSON.parse(usuario);
      // Extraer día de pago de la cadena 'proximo' (e.g. '5 jun.')
      const dia_pago = parseInt(proximo.split(" ")[0], 10) || 1;
      const ahora = new Date();
      const ultima_fecha = ahora.toISOString().split("T")[0];
      const res = await fetch(`${BASE_URL}/pagos_fijos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id,
          servicio_id: servicio,
          nombre,
          monto: Number(monto),
          categoria_id: categoria,
          dia_pago,
          activo: 1,
          pagado: 0,
          ultima_fecha,
        }),
      });
      const data = await res.json();
      if (data.success) {
        navigation.goBack();
      } else {
        Alert.alert("Error", "No se pudo crear el pago fijo.");
      }
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.background}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Agregar Pago Fijo</Text>
        {/* Picker de servicio */}
        <Text style={styles.label}>Servicio</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={servicio} onValueChange={setServicio}>
            {servicios.map((s) => (
              <Picker.Item key={s.id} label={s.nombre} value={s.id} />
            ))}
          </Picker>
        </View>
        {/* Picker de categoría */}
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={categoria} onValueChange={setCategoria}>
            {categorias.map((c) => (
              <Picker.Item key={c.id} label={c.nombre} value={c.id} />
            ))}
          </Picker>
        </View>
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
          placeholder="Día pago (ej. 5)"
          placeholderTextColor="#bdbdbd"
          keyboardType="numeric"
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
      </ScrollView>
    </KeyboardAvoidingView>
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
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    color: "#1976d2",
    fontFamily: "serif",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
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
  label: {
    fontSize: 18,
    color: "#222",
    fontFamily: "serif",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#1976d2",
    borderRadius: 12,
    width: 320,
    marginBottom: 18,
    backgroundColor: "#fff",
  },
});
