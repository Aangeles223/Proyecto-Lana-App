import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Feather } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <LinearGradient colors={["#7fd8f7", "#185a9d"]} style={styles.background}>
      {/* Título decorativo */}
      <Text style={styles.title}>Iniciar Sesión</Text>
      {/* Logo */}
      <Image
        source={{ uri: "https://i.ibb.co/3Nw2yQk/lana-app-logo.png" }}
        style={styles.logo}
      />
      {/* Card centrado */}
      <View style={styles.centerContainer}>
        <View style={styles.cardShadow}>
          <LinearGradient colors={["#aee9fa", "#fff"]} style={styles.card}>
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                style={styles.avatar}
              />
            </View>
            {/* Campos */}
            <View style={styles.fieldsContainer}>
              <View style={styles.inputBox}>
                <TextInput
                  placeholder="Correo electrónico"
                  style={styles.input}
                  placeholderTextColor="#222"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
                <MaterialIcons name="email" size={20} style={styles.icon} />
              </View>
              <View style={styles.inputBox}>
                <TextInput
                  placeholder="Contraseña"
                  style={styles.input}
                  placeholderTextColor="#222"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <Feather name="lock" size={20} style={styles.icon} />
              </View>
            </View>
            {/* Botón */}
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>ENTRAR</Text>
            </TouchableOpacity>
            {/* Texto de navegación */}
            <Text style={styles.bottomText}>
              ¿No tienes cuenta?{" "}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate("Register")}
              >
                Regístrate aquí
              </Text>
            </Text>
          </LinearGradient>
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
    fontSize: 44,
    color: "#222",
    fontFamily: "cursive",
    marginTop: 30,
    marginBottom: 0,
    textAlign: "center",
    letterSpacing: 2,
  },
  logo: {
    width: 90,
    height: 30,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 5,
  },
  centerContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    minHeight: height * 0.7,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: 36,
    backgroundColor: "transparent",
    alignItems: "center",
    // Asegura que el avatar pueda sobresalir
    overflow: "visible",
  },
  card: {
    width: 320,
    borderRadius: 36,
    alignItems: "center",
    paddingBottom: 18,
    paddingTop: 60, // Espacio para el avatar
    overflow: "visible", // Permite que el avatar sobresalga
    minHeight: 340,
    position: "relative",
    backgroundColor: "transparent",
  },
  avatarWrapper: {
    position: "absolute",
    top: -40, // Hace que sobresalga hacia arriba
    left: "50%",
    marginLeft: -40, // -(avatar width/2)
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#e0f7fa",
  },
  avatarCircle: {
    backgroundColor: "#fff",
    borderRadius: 44,
    padding: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fieldsContainer: {
    width: "85%",
    marginTop: 50,
    marginBottom: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#222",
    borderBottomWidth: 1,
    marginVertical: 10,
    paddingBottom: 2,
  },
  icon: {
    marginLeft: 10,
    color: "#222",
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#222",
    backgroundColor: "transparent",
  },
  button: {
    backgroundColor: "#7fd8f7",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginTop: 18,
    marginBottom: 8,
    width: "80%",
  },
  buttonText: {
    fontFamily: "cursive",
    fontSize: 22,
    color: "#222",
    textAlign: "center",
  },
  bottomText: {
    fontSize: 13,
    color: "#222",
    textAlign: "center",
    marginBottom: 6,
  },
  linkText: {
    color: "#185a9d",
    textDecorationLine: "underline",
  },
});
