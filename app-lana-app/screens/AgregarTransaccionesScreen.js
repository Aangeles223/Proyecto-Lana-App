import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import LogoLana from "../components/LogoLana";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

export default function AgregarTransaccionScreen({ navigation }) {
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [fecha, setFecha] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("egreso");

  // Cargar categorías desde la BD
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch("http://192.168.1.67:3000/categorias");
        const data = await res.json();
        if (data.success) {
          setCategorias(data.categorias);
          if (data.categorias.length > 0) setCategoria(data.categorias[0].id);
        }
      } catch (e) {
        setCategorias([]);
      }
    };
    fetchCategorias();
  }, []);

  const handleAgregar = async () => {
    if (!monto || isNaN(Number(monto))) {
      Alert.alert("Error", "Ingresa un monto válido.");
      return;
    }
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = JSON.parse(userStr);

      const res = await fetch("http://10.0.0.11:3000/transacciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: user.id,
          tipo,
          categoria_id: categoria,
          monto: Number(monto),
          fecha: fecha.toISOString().slice(0, 10),
          descripcion,
        }),
      });
      const data = await res.json();

      if (data.success) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Transacción completada",
            body: `Transacción registrada: $${monto}.`,
            sound: true,
          },
          trigger: null,
        });
        navigation.goBack();
      } else {
        Alert.alert("Error", "No se pudo agregar la transacción.");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar al servidor.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#faf7f7" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <LogoLana />
          </View>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={28} color="#222" />
          </TouchableOpacity>
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
          {/* Tipo de transacción */}
          <View style={styles.tipoRow}>
            <TouchableOpacity
              style={[
                styles.tipoBtn,
                tipo === "egreso" && styles.tipoBtnActivo,
              ]}
              onPress={() => setTipo("egreso")}
            >
              <Text
                style={[
                  styles.tipoBtnText,
                  tipo === "egreso" && styles.tipoBtnTextActivo,
                ]}
              >
                Egreso
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tipoBtn,
                tipo === "ingreso" && styles.tipoBtnActivo,
              ]}
              onPress={() => setTipo("ingreso")}
            >
              <Text
                style={[
                  styles.tipoBtnText,
                  tipo === "ingreso" && styles.tipoBtnTextActivo,
                ]}
              >
                Ingreso
              </Text>
            </TouchableOpacity>
          </View>
          {/* Picker de Categoría */}
          <View style={styles.pickerContainer}>
            <MaterialIcons
              name="category"
              size={24}
              color="#43a047"
              style={{ marginRight: 8 }}
            />
            <View style={styles.pickerBox}>
              <Picker
                selectedValue={categoria}
                style={styles.picker}
                onValueChange={(itemValue) => setCategoria(itemValue)}
                dropdownIconColor="#1976d2"
              >
                {categorias.map((cat) => (
                  <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
                ))}
              </Picker>
            </View>
          </View>
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
            placeholder="Descripción (opcional)"
            placeholderTextColor="#bdbdbd"
          />
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
    justifyContent: "space-between",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
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
    borderColor: "#1976d2",
    borderRadius: 10,
    width: 240,
    marginBottom: 18,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tipoRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
    width: "100%",
  },
  tipoBtn: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1976d2",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  tipoBtnActivo: {
    backgroundColor: "#1976d2",
  },
  tipoBtnText: {
    color: "#1976d2",
    fontWeight: "bold",
    fontSize: 16,
  },
  tipoBtnTextActivo: {
    color: "#fff",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#43a047",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
    width: 260,
  },
  pickerBox: {
    flex: 1,
    justifyContent: "center",
  },
  picker: {
    width: "100%",
    color: "#222",
    fontSize: 16,
    backgroundColor: "#fff",
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginVertical: 8,
    width: 260,
    borderWidth: 1,
    borderColor: "#1976d2",
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
    borderRadius: 10,
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
    borderRadius: 10,
    paddingVertical: 14,
    width: 220,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
    elevation: 2,
  },
  buttonText: { color: "#fff", fontSize: 20, fontFamily: "serif" },
});
