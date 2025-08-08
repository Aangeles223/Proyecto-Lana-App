import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";

export default function EditarPagoFijoScreen({ route, navigation }) {
  const { pago } = route.params;

  const [nombre, setNombre] = useState(pago.nombre);
  const [monto, setMonto] = useState(String(pago.monto));
  const [diaPago, setDiaPago] = useState(pago.dia_pago ? String(pago.dia_pago) : ""); // asumiendo campo dia_pago
  const [usuarioId, setUsuarioId] = useState(null);

  // Dropdown picker states para categorías
  const [categoriaOpen, setCategoriaOpen] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [categorias, setCategorias] = useState([]);

  // Dropdown picker estados para servicios
  const [servicioOpen, setServicioOpen] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [servicios, setServicios] = useState([]);

  const [loading, setLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    const cargarUsuarioYCategoriasServicios = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUsuarioId(user.id);
        }

        // Cargar categorías
        const resCat = await fetch("http://172.20.10.6:3000/categorias");
        const dataCat = await resCat.json();
        if (dataCat.success) {
          const catItems = dataCat.categorias.map((c) => ({
            label: c.nombre,
            value: c.id,
          }));
          setCategorias(catItems);

          // Si hay categoría en pago, seleccionarla
          const catValue = pago.categoria_id || (catItems.length > 0 && catItems[0].value);
          setCategoriaSeleccionada(catValue);
        }

        // Cargar servicios
        const resServ = await fetch("http://172.20.10.6:3000/servicios");
        const dataServ = await resServ.json();
        if (dataServ.success) {
          const servItems = dataServ.servicios.map((s) => ({
            label: s.nombre,
            value: s.id,
          }));
          setServicios(servItems);

          // Si hay servicio en pago, seleccionarlo
          const servValue = pago.servicio_id || (servItems.length > 0 && servItems[0].value);
          setServicioSeleccionado(servValue);
        }
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar categorías o servicios.");
        console.error(error);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarUsuarioYCategoriasServicios();
  }, [pago]);

  // Evitar que se abran los dos dropdowns al mismo tiempo
  const onCategoriaOpen = () => setServicioOpen(false);
  const onServicioOpen = () => setCategoriaOpen(false);

  const handleGuardar = async () => {
    if (
      !nombre.trim() ||
      !monto ||
      !diaPago.trim() ||
      !categoriaSeleccionada ||
      !servicioSeleccionado
    ) {
      Alert.alert("Error", "Por favor llena todos los campos.");
      return;
    }

    if (isNaN(Number(monto))) {
      Alert.alert("Error", "El monto debe ser un número válido.");
      return;
    }

    setLoading(true);

    try {
      // Aquí llamas a tu API para actualizar el pago fijo, ejemplo:
      const res = await fetch(`http://172.20.10.6:3000/pagos-fijos/${pago.id}`, {
        method: "PUT", // o PATCH según tu API
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuarioId,
          nombre: nombre.trim(),
          monto: parseFloat(monto),
          dia_pago: diaPago.trim(),
          categoria_id: categoriaSeleccionada,
          servicio_id: servicioSeleccionado,
          activo: pago.activo,
          pagado: pago.pagado,
          ultima_fecha: pago.ultima_fecha,
        }),
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert("Éxito", "Pago fijo actualizado correctamente.");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.message || "No se pudo actualizar el pago.");
      }
    } catch (error) {
      Alert.alert("Error", "Error al conectar con el servidor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (cargandoDatos) {
    return (
      <View style={[styles.background, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={styles.background}>
      <Text style={styles.title}>Editar Pago Fijo</Text>

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
        value={diaPago}
        onChangeText={setDiaPago}
        placeholder="Día de pago"
        placeholderTextColor="#bdbdbd"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Categoría:</Text>
      <DropDownPicker
        open={categoriaOpen}
        value={categoriaSeleccionada}
        items={categorias}
        setOpen={setCategoriaOpen}
        setValue={setCategoriaSeleccionada}
        onOpen={onCategoriaOpen}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        listItemLabelStyle={{ fontFamily: "serif" }}
        dropDownDirection="BOTTOM"
        zIndex={3000}
        zIndexInverse={1000}
      />

      <Text style={styles.label}>Servicio:</Text>
      <DropDownPicker
        open={servicioOpen}
        value={servicioSeleccionado}
        items={servicios}
        setOpen={setServicioOpen}
        setValue={setServicioSeleccionado}
        onOpen={onServicioOpen}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        listItemLabelStyle={{ fontFamily: "serif" }}
        dropDownDirection="BOTTOM"
        zIndex={2000}
        zIndexInverse={2000}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleGuardar}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Guardando..." : "Guardar cambios"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => navigation.goBack()}
        disabled={loading}
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
    paddingTop: 30,
    paddingHorizontal: 16,
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
    marginBottom: 18,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  label: {
    fontSize: 16,
    fontFamily: "serif",
    marginBottom: 6,
    color: "#1976d2",
    fontWeight: "bold",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderColor: "#1976d2",
    borderRadius: 12,
    marginBottom: 18,
    height: 40,
    paddingHorizontal: 10,
  },
  dropdownContainer: {
    borderColor: "#1976d2",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#54bcd4",
    borderRadius: 12,
    paddingVertical: 14,
    width: "100%",
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