import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import LogoLana from "../components/LogoLana";
import { FontAwesome, MaterialIcons, Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
// Determina host en función de Expo debuggerHost (localhost, emulador o LAN) o IP fija de tu PC
const host = Constants.manifest?.debuggerHost?.split(":")[0] || "10.16.36.167";
const BASE_URL = `http://${host}:3000`;
// console.log(`Base URL: ${BASE_URL}`);

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    try {
      console.log("Register URL:", `${BASE_URL}/register`);
      console.log("Register payload:", {
        nombre,
        apellidos,
        telefono,
        email,
        contrasena,
      });
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellidos,
          telefono,
          email,
          contrasena,
        }),
      });
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);
      if (res.ok && data.id) {
        setSuccess("Registro exitoso. Por favor inicia sesión.");
        setError("");
        navigation.navigate("Login");
      } else {
        setError(data.error || "Error al registrar usuario");
        setSuccess("");
      }
    } catch (e) {
      console.error("Register error:", e);
      setError("Error de conexión");
      setSuccess("");
    }
  };

  return (
    <LinearGradient colors={["#7fd8f7", "#185a9d"]} style={styles.background}>
      <Text style={styles.title}>Registro</Text>
      <View style={styles.logoContainer}>
        <LogoLana />
      </View>
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Nombre"
              style={styles.input}
              placeholderTextColor="#222"
              value={nombre}
              onChangeText={setNombre}
            />
            <FontAwesome name="user" size={20} style={styles.inputIcon} />
          </View>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Apellidos"
              style={styles.input}
              placeholderTextColor="#222"
              value={apellidos}
              onChangeText={setApellidos}
            />
            <FontAwesome name="user" size={20} style={styles.inputIcon} />
          </View>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Teléfono"
              style={styles.input}
              keyboardType="phone-pad"
              placeholderTextColor="#222"
              value={telefono}
              onChangeText={setTelefono}
            />
            <Feather name="phone" size={20} style={styles.inputIcon} />
          </View>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Correo electrónico"
              style={styles.input}
              keyboardType="email-address"
              placeholderTextColor="#222"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <MaterialIcons name="email" size={20} style={styles.inputIcon} />
          </View>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Contraseña"
              style={styles.input}
              secureTextEntry
              placeholderTextColor="#222"
              value={contrasena}
              onChangeText={setContrasena}
            />
            <Feather name="lock" size={20} style={styles.inputIcon} />
          </View>
          {error ? (
            <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
          ) : null}
          {success ? (
            <Text style={{ color: "green", marginBottom: 8 }}>{success}</Text>
          ) : null}
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>REGISTRAR</Text>
          </TouchableOpacity>
          <Text style={styles.bottomText}>
            ¿Ya tienes cuenta?{" "}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate("Login")}
            >
              Inicia Sesión aquí
            </Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
    paddingTop: 30,
  },
  title: {
    fontSize: 40,
    color: "#222",
    fontFamily: "serif",
    marginTop: 30,
    marginBottom: 0,
    textAlign: "center",
    letterSpacing: 2,
    fontWeight: "bold",
  },
  cardWrapper: {
    width: width > 400 ? 350 : "90%",
    alignItems: "center",
    marginTop: 30,
  },
  avatarModal: {
    backgroundColor: "#fff",
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -45,
    zIndex: 2,
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
  card: {
    backgroundColor: "#e6f7fa",
    borderRadius: 24,
    padding: 24,
    paddingTop: 50,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginTop: -45,
  },
  inputBox: {
    width: "100%",
    marginBottom: 18,
    position: "relative",
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#222",
    borderWidth: 1,
    borderColor: "#b2e0f7",
    paddingRight: 40,
  },
  inputIcon: {
    position: "absolute",
    right: 14,
    top: 13,
    color: "#185a9d",
  },
  button: {
    backgroundColor: "#7fd8f7",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#222",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "serif",
  },
  bottomText: {
    fontSize: 13,
    color: "#222",
    textAlign: "center",
    marginBottom: 6,
    marginTop: 10,
  },
  linkText: {
    color: "#185a9d",
    textDecorationLine: "underline",
  },
});
