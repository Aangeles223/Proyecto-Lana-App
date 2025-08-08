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
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import LogoLana from "../components/LogoLana";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import Constants from "expo-constants";

// Determina host en función de Expo debuggerHost (localhost, emulador o LAN) o IP fija de tu PC
const host = Constants.manifest?.debuggerHost?.split(":")[0] || "10.0.0.11";
const BASE_URL = `http://${host}:3000`;

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation, setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      console.log("Login URL:", `${BASE_URL}/login`, "Payload:", {
        email,
        contrasena: password,
      });
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          contrasena: password, // Debe coincidir con el backend
        }),
      });
      const data = await response.json();
      console.log("Login response data:", data, "response.ok:", response.ok);
      if (response.ok) {
        // Limpiar datos viejos antes de guardar nuevos
        await AsyncStorage.removeItem("user");
        await AsyncStorage.setItem("isLoggedIn", "true");
        // Decodificar el token para extraer usuario_id
        let userId;
        if (data.access_token) {
          try {
            const decoded = jwt_decode(data.access_token);
            userId = decoded.usuario_id;
          } catch (e) {
            console.warn("Error decoding JWT:", e);
          }
        }
        // Si no vino en token, buscar en data.user/data.usuario
        const basicObj = data.user || data.usuario || data;
        userId =
          userId || basicObj.id || basicObj.usuario_id || basicObj.id_usuario;
        // Obtener perfil completo del usuario
        let profile = basicObj;
        try {
          const profRes = await fetch(`${BASE_URL}/usuario/${userId}`);
          if (profRes.ok) profile = await profRes.json();
        } catch (e) {
          console.warn("Error fetching perfil:", e);
        }
        const normalizedUser = {
          ...profile,
          id: userId,
          access_token: data.access_token,
          token_type: data.token_type,
        };
        console.log("Storing user profile with token:", normalizedUser);
        await AsyncStorage.setItem("user", JSON.stringify(normalizedUser));
        // Verificar AsyncStorage inmediatamente
        const stored = await AsyncStorage.getItem("user");
        console.log("AsyncStorage 'user':", stored);
        // Marcar usuario autenticado para mostrar navegación protegida
        setIsLoggedIn(true);
      } else {
        setError(
          data.detail || data.message || "Correo o contraseña incorrectos"
        );
      }
    } catch (e) {
      console.error("Login fetch error:", e);
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <LinearGradient colors={["#7fd8f7", "#185a9d"]} style={styles.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Iniciar Sesión</Text>
          <View style={styles.centerContainer}>
            <View style={styles.logoContainer}>
              <LogoLana />
            </View>
            <View style={styles.cardWrapper}>
              {/* Avatar en círculo blanco */}
              <View style={styles.avatarModal}>
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.card}>
                {/* Input Email */}
                <View style={styles.inputBox}>
                  <TextInput
                    placeholder="Correo electrónico"
                    style={styles.input}
                    placeholderTextColor="#222"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <MaterialIcons
                    name="email"
                    size={22}
                    color="#185a9d"
                    style={styles.inputIcon}
                  />
                </View>
                {/* Input Password */}
                <View style={styles.inputBox}>
                  <TextInput
                    placeholder="Contraseña"
                    style={styles.input}
                    placeholderTextColor="#222"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                  <Feather
                    name="lock"
                    size={22}
                    color="#185a9d"
                    style={styles.inputIcon}
                  />
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>ENTRAR</Text>
                </TouchableOpacity>
                <Text style={styles.bottomText}>
                  ¿No tienes cuenta?{" "}
                  <Text
                    style={styles.linkText}
                    onPress={() => navigation.navigate("Register")}
                  >
                    Regístrate aquí
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginTop: height * 0.08,
    marginBottom: 10,
    fontFamily: "serif",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    width: width > 500 ? 400 : "90%",
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
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 8,
    fontSize: 16,
  },
  bottomText: {
    marginTop: 18,
    color: "#222",
    fontSize: 15,
    textAlign: "center",
  },
  linkText: {
    color: "#185a9d",
    textDecorationLine: "underline",
  },
});
