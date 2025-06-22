import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome, MaterialIcons, Feather } from "@expo/vector-icons";

export default function RegisterScreen({ navigation }) {
  return (
    <LinearGradient colors={["#7fd8f7", "#185a9d"]} style={styles.background}>
      {/* Título decorativo */}
      <Text style={styles.title}>Registro</Text>
      {/* Logo */}
      <Image
        source={{ uri: "https://i.ibb.co/3Nw2yQk/lana-app-logo.png" }}
        style={styles.logo}
      />
      {/* Card */}
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
                placeholder="Nombre"
                style={styles.input}
                placeholderTextColor="#222"
              />
              <FontAwesome name="user" size={20} style={styles.icon} />
            </View>
            <View style={styles.inputBox}>
              <TextInput
                placeholder="Apellidos"
                style={styles.input}
                placeholderTextColor="#222"
              />
              <FontAwesome name="user" size={20} style={styles.icon} />
            </View>
            <View style={styles.inputBox}>
              <TextInput
                placeholder="Telefono"
                style={styles.input}
                keyboardType="phone-pad"
                placeholderTextColor="#222"
              />
              <Feather name="phone" size={20} style={styles.icon} />
            </View>
            <View style={styles.inputBox}>
              <TextInput
                placeholder="Correo electrónico"
                style={styles.input}
                keyboardType="email-address"
                placeholderTextColor="#222"
              />
              <MaterialIcons name="email" size={20} style={styles.icon} />
            </View>
            <View style={styles.inputBox}>
              <TextInput
                placeholder="Contraseña"
                style={styles.input}
                secureTextEntry
                placeholderTextColor="#222"
              />
              <Feather name="lock" size={20} style={styles.icon} />
            </View>
          </View>
          {/* Botón */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>REGISTRAR</Text>
          </TouchableOpacity>
          {/* Texto de navegación */}
          <Text style={styles.bottomText}>
            Ya tienes cuenta?{" "}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate("Login")}
            >
              Inicia Sesión aquí
            </Text>
          </Text>
        </LinearGradient>
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
    fontSize: 54,
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
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: 36,
    marginTop: 10,
  },
  card: {
    width: 320,
    borderRadius: 36,
    alignItems: "center",
    paddingBottom: 18,
    paddingTop: 40,
    overflow: "hidden",
  },
  avatarContainer: {
    position: "absolute",
    top: -40,
    alignSelf: "center",
    zIndex: 2,
    backgroundColor: "transparent",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#e0f7fa",
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
