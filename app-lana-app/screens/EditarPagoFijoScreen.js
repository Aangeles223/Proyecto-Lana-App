import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { Switch } from "react-native";
import Constants from "expo-constants";

// Determinar base URL
const host = Constants.manifest?.debuggerHost?.split(":")[0] || "10.16.36.167";
const BASE_URL = `http://${host}:3000`;

export default function EditarPagoFijoScreen({ route, navigation }) {
  const { pago } = route.params;
  const [nombre, setNombre] = useState(pago.nombre);
  const [monto, setMonto] = useState(String(pago.monto));
  const [proximo, setProximo] = useState(String(pago.dia_pago));
  const [servicios, setServicios] = useState([]);
  const [servicio, setServicio] = useState(pago.servicio_id);
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState(pago.categoria_id);
  const [activo, setActivo] = useState(!!pago.activo);
  const [pagado, setPagado] = useState(!!pago.pagado);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const resS = await fetch(`${BASE_URL}/servicios`);
        const listS = await resS.json();
        setServicios(listS);
        const resC = await fetch(`${BASE_URL}/categorias`);
        const jsonC = await resC.json();
        const listC = Array.isArray(jsonC) ? jsonC : jsonC.categorias || [];
        setCategorias(listC);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLists();
  }, []);

  const handleGuardar = async () => {
    try {
      // Preparar datos para actualizar pago fijo
      const dia_pago = Number(proximo) || pago.dia_pago;
      const body = {
        nombre,
        usuario_id: pago.usuario_id,
        servicio_id: servicio,
        categoria_id: categoria,
        monto: Number(monto),
        dia_pago,
        activo: activo ? 1 : 0,
        pagado: pagado ? 1 : 0,
      };
      const res = await fetch(`${BASE_URL}/pagos_fijos/${pago.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      // Mostrar alerta de éxito
      Alert.alert("Éxito", "Pago fijo actualizado correctamente", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Pago Fijo</Text>
      <Text style={styles.label}>Servicio</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={servicio} onValueChange={setServicio}>
          {servicios.map((s) => (
            <Picker.Item key={s.id} label={s.nombre} value={s.id} />
          ))}
        </Picker>
      </View>
      <Text style={styles.label}>Categoría</Text>
      <View style={styles.pickerContainer}>
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
      <TextInput
        style={styles.input}
        value={proximo}
        onChangeText={setProximo}
        placeholder="Día de pago (1-31)"
        placeholderTextColor="#bdbdbd"
        keyboardType="numeric"
      />
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Activo</Text>
        <Switch value={activo} onValueChange={setActivo} />
        <Text style={styles.switchLabel}>Pagado</Text>
        <Switch value={pagado} onValueChange={setPagado} />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#faf7f7",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    color: "#1976d2",
    fontFamily: "serif",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    color: "#222",
    fontFamily: "serif",
    marginBottom: 8,
    alignSelf: "flex-start",
    marginLeft: 20,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#1976d2",
    borderRadius: 12,
    width: 320,
    marginBottom: 18,
    backgroundColor: "#fff",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 320,
    marginBottom: 18,
  },
  switchLabel: {
    fontSize: 18,
    color: "#222",
    fontFamily: "serif",
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
});
