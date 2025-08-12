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
import { Picker } from "@react-native-picker/picker"; // no usado, pendiente de remover
import CategoryIcon from "../components/CategoryIcon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogoLana from "../components/LogoLana";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";

// Determina host mediante Expo debuggerHost o IP LAN del equipo
const manifest = Constants.manifest || {};
const debuggerHost = manifest.debuggerHost?.split(":")[0];
// fallback a IP LAN para acceder desde dispositivo/emulador en red
const devHost = debuggerHost || "172.20.10.6";
const BASE_URL = `http://${devHost}:3000`;

export default function CrearPresupuestoScreen({ navigation }) {
  const [monto, setMonto] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [periodo, setPeriodo] = useState("mensual");

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${BASE_URL}/categorias`);
        const data = await res.json();
        // data is an array of categories
        const list = Array.isArray(data) ? data : data.categorias || [];
        setCategorias(list);
        if (list.length > 0) setCategoria(list[0].id);
      } catch (e) {
        console.error("Error fetch categorias en CrearPresupuestoScreen:", e);
        setCategorias([]);
      }
    };
    fetchCategorias();
  }, []);

  const handleAgregar = async () => {
    try {
      // Validación de monto
      if (!monto || isNaN(Number(monto))) {
        Alert.alert("Error", "Ingresa un monto válido.");
        return;
      }
      const userStr = await AsyncStorage.getItem("user");
      const user = JSON.parse(userStr);
      const fecha = new Date();
      const mes = fecha.getMonth() + 1;
      const anio = fecha.getFullYear();

      // Solicitud al backend para crear presupuesto
      const res = await fetch(`${BASE_URL}/presupuestos`, {
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
      if (!res.ok) {
        console.error("Error HTTP al crear presupuesto:", res.status);
        Alert.alert("Error", "No se pudo agregar el presupuesto.");
        return;
      }
      const data = await res.json();
      if (data.id) {
        navigation.goBack();
      } else {
        Alert.alert("Error", "No se pudo agregar el presupuesto.");
      }
    } catch (e) {
      console.error("Error en handleAgregar CrearPresupuestoScreen:", e);
      Alert.alert("Error", "No se pudo agregar el presupuesto.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.background}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={60}
    >
      {/* Header fijo con flecha de regreso y logo */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <View style={styles.logoHeader}>
          <LogoLana />
        </View>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-start", paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.centerContent}>
          <Text style={styles.title}>Crear presupuesto</Text>
          {/* Selector de Categoría con iconos */}
          <Text style={styles.label}>Categoría</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  categoria === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setCategoria(cat.id)}
              >
                <CategoryIcon
                  categoria={cat.nombre}
                  size={20}
                  color={categoria === cat.id ? '#fff' : '#1976d2'}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    categoria === cat.id && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
          {/* Selector de Periodo segmentado */}
          <Text style={styles.label}>Periodo</Text>
          <View style={styles.periodRow}>
            {['mensual','quincenal','semanal'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.periodBtn,
                  periodo === item && styles.periodBtnActive,
                ]}
                onPress={() => setPeriodo(item)}
              >
                <Text
                  style={[
                    styles.periodText,
                    periodo === item && styles.periodTextActive,
                  ]}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
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
  logoHeader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
     centerContent: {
       flex: 1,
       backgroundColor: '#ffffff',
       borderRadius: 16,
       padding: 16,
       marginHorizontal: 16,
       // llenar espacio vertical
       elevation: 2,
       shadowColor: '#000',
       shadowOpacity: 0.1,
       shadowOffset: { width: 0, height: 2 },
       shadowRadius: 4,
     },
  title: {
    fontSize: 22,
    color: '#222',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
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
  categoriesScroll: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
  },
  categoryChipActive: {
    backgroundColor: '#1976d2',
  },
  categoryChipText: {
    marginLeft: 8,
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#faf9f9',
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 6,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
    width: '100%',
  },
  periodBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1976d2',
    marginHorizontal: 6,
  },
  periodBtnActive: {
    backgroundColor: '#1976d2',
  },
  periodText: {
    color: '#1976d2',
    fontSize: 16,
  },
  periodTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1976d2',
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
