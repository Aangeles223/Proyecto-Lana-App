import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import LogoLana from "../components/LogoLana";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import Constants from "expo-constants";
import { Picker } from "@react-native-picker/picker";

// Determina host según Expo debuggerHost o IP fija
const host = Constants.manifest?.debuggerHost?.split(":")[0] || "172.20.10.6";
const BASE_URL = `http://${host}:3000`;

// Mapeo de nombres de categoría a iconos
const categoryIconMap = {
  Comida: { component: MaterialIcons, name: "restaurant" },
  Transporte: { component: Ionicons, name: "car" },
  Salud: { component: FontAwesome5, name: "heartbeat" },
  Entretenimiento: { component: MaterialIcons, name: "movie" },
  Hogar: { component: MaterialIcons, name: "home" },
  Default: { component: MaterialIcons, name: "category" },
};

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
        const res = await fetch(`${BASE_URL}/categorias`);
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error("Raw /categorias response (no JSON):", text);
          return;
        }
        console.log("Fetch /categorias, datos recibidos:", data);
        // Puede devolver array directo o { success, categorias }
        const list = Array.isArray(data) ? data : data.categorias || [];
        setCategorias(list);
        if (list.length > 0) setCategoria(list[0].id);
      } catch (e) {
        console.error("Error fetch categorias:", e);
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
      // Obtener usuario actual y normalizar identificador
      const userStr = await AsyncStorage.getItem("user");
      const parsedUser = JSON.parse(userStr);
      // Normalizar identificador: primero id, luego token
      let usuario_id =
        parsedUser.id || parsedUser.usuario_id || parsedUser.id_usuario;
      if (!usuario_id && parsedUser.access_token) {
        try {
          const decoded = jwt_decode(parsedUser.access_token);
          usuario_id = decoded.usuario_id || decoded.user_id;
        } catch (e) {
          console.warn("Error decoding token en AgregarTransacción:", e);
        }
      }
      console.log("AgregarTransacción - usuario id:", usuario_id);
      // Formatear fecha a YYYY-MM-DD
      const fechaStr = fecha.toISOString().split("T")[0];
      // Construir payload y enviar transacción a la API
      const payload = {
        usuario_id,
        categoria_id: categoria,
        monto: Number(monto), // renombrado para coincidir con API
        tipo,
        fecha: fechaStr,
        descripcion,
      };
      console.log("AgregarTransacción - payload:", payload);
      const res = await fetch(`${BASE_URL}/transacciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success === false) {
        Alert.alert("Error", "No se pudo agregar la transacción.");
        return;
      }
      // Programar notificación local
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Transacción agregada",
          body: `${tipo} de ${monto} registrado.`,
        },
        trigger: { seconds: 2 },
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message);
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
          {/* Selector de Categoría mejorado */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categorias.map((cat) => {
              const { component: Icon, name: iconName } =
                categoryIconMap[cat.nombre] || categoryIconMap.Default;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryBtn,
                    categoria === cat.id && styles.categoryBtnActive,
                  ]}
                  onPress={() => setCategoria(cat.id)}
                >
                  <Icon
                    name={iconName}
                    size={16}
                    color={categoria === cat.id ? "#fff" : "#222"}
                    style={styles.categoryIcon}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      categoria === cat.id && styles.categoryTextActive,
                    ]}
                  >
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    // Shadow Android
    elevation: 3,
    // Shadow iOS
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
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
  // Scroll horizontal para categorías
  categoriesScroll: {
    paddingVertical: 8,
    marginVertical: 16,
  },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#e6f7fa",
    flexDirection: "row",
    alignItems: "center",
  },
  categoryBtnActive: {
    backgroundColor: "#43a047",
  },
  categoryText: {
    color: "#222",
    fontSize: 16,
    marginLeft: 8,
  },
  categoryTextActive: {
    color: "#fff",
  },
  categoryIcon: {
    width: 24,
    height: 24,
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
