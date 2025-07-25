import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function PerfilScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [editando, setEditando] = useState(false);
  const [userId, setUserId] = useState(null);

  // Cargar datos reales del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserId(user.id);
          // Obtener datos actualizados de la BD
          const res = await fetch(`http://10.0.0.11:3000/usuario/${user.id}`);
          const data = await res.json();
          if (data.success && data.user) {
            setNombre(data.user.nombre);
            setApellidos(data.user.apellidos);
            setCorreo(data.user.email);
            setTelefono(data.user.telefono || "");
          }
        }
      } catch (e) {
        Alert.alert("Error", "No se pudo cargar el perfil.");
      }
    };
    fetchUser();
  }, []);

  // Guardar cambios en la BD y en AsyncStorage
  const guardarCambios = async () => {
    try {
      const res = await fetch(`http://10.0.0.11:3000/usuario/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellidos,
          email: correo,
          telefono,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Actualiza AsyncStorage
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const updatedUser = {
            ...user,
            nombre,
            apellidos,
            email: correo,
            telefono,
          };
          await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        }
        setEditando(false);
        Alert.alert("Éxito", "Perfil actualizado correctamente.");
      } else {
        Alert.alert(
          "Error",
          data.message || "No se pudo actualizar el perfil."
        );
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    }
  };

  return (
    <View style={styles.background}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Image
          source={{ uri: "https://i.ibb.co/3Nw2yQk/lana-app-logo.png" }}
          style={styles.logo}
        />
      </View>
      <Text style={styles.title}>Bienvenido, {nombre}</Text>
      {/* Avatar */}
      <View style={styles.avatarModal}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
          }}
          style={styles.avatar}
        />
      </View>
      <Text style={styles.perfilText}>Perfil</Text>
      {/* Datos o Inputs */}
      <View style={styles.dataBox}>
        <Text style={styles.dataLabel}>Nombre:</Text>
        {editando ? (
          <TextInput
            style={styles.dataValue}
            value={nombre}
            onChangeText={setNombre}
          />
        ) : (
          <Text style={styles.dataValue}>{nombre}</Text>
        )}
        <Text style={styles.dataLabel}>Apellidos:</Text>
        {editando ? (
          <TextInput
            style={styles.dataValue}
            value={apellidos}
            onChangeText={setApellidos}
          />
        ) : (
          <Text style={styles.dataValue}>{apellidos}</Text>
        )}
        <Text style={styles.dataLabel}>Correo electrónico:</Text>
        {editando ? (
          <TextInput
            style={styles.dataValue}
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
          />
        ) : (
          <Text style={styles.dataValue}>{correo}</Text>
        )}
        <Text style={styles.dataLabel}>Teléfono:</Text>
        {editando ? (
          <TextInput
            style={styles.dataValue}
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.dataValue}>{telefono}</Text>
        )}
      </View>
      {/* Botón Editar/Guardar */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (editando) {
            guardarCambios();
          } else {
            setEditando(true);
          }
        }}
      >
        <Text style={styles.buttonText}>{editando ? "Guardar" : "Editar"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // ...tus estilos actuales...
  // Puedes dejar los estilos igual, solo asegúrate que dataValue funcione para TextInput también
  background: {
    flex: 1,
    backgroundColor: "#faf7f7",
    paddingTop: 30,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "flex-start",
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  logo: {
    width: 90,
    height: 30,
    resizeMode: "contain",
    marginLeft: 60,
  },
  title: {
    fontSize: 28,
    color: "#222",
    fontFamily: "serif",
    marginTop: 10,
    marginBottom: 0,
    textAlign: "center",
    fontWeight: "bold",
  },
  avatarModal: {
    backgroundColor: "#fff",
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    alignSelf: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  perfilText: {
    fontSize: 22,
    color: "#222",
    fontFamily: "serif",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  dataBox: {
    width: width > 400 ? 300 : "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginTop: 10,
    marginBottom: 10,
    elevation: 2,
  },
  dataLabel: {
    fontSize: 15,
    color: "#888",
    fontFamily: "serif",
    marginTop: 6,
  },
  dataValue: {
    fontSize: 17,
    color: "#222",
    fontFamily: "serif",
    marginBottom: 2,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 2,
  },
  button: {
    backgroundColor: "#54bcd4",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 10,
    width: "60%",
    alignItems: "center",
  },
  buttonText: {
    color: "#222",
    fontSize: 18,
    fontFamily: "serif",
  },
});
