import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import PrincipalScreen from "./screens/PrincipalScreen";
import AyudaScreen from "./screens/AyudaScreen";
import MenuScreen from "./screens/MenuScreen";
import { MaterialIcons, Feather, Entypo } from "@expo/vector-icons";
import PerfilScreen from "./screens/PerfilScreen";
import DineroMontoScreen from "./screens/DineroMontoScreen";
import DineroMetodoScreen from "./screens/DineroMetodoScreen";
import DineroConfirmarScreen from "./screens/DineroConfirmarScreen";
import AgregarTransaccionScreen from "./screens/AgregarTransaccionesScreen";
import PresupuestosScreen from "./screens/PresupuestoScreen";
import CrearPresupuestoScreen from "./screens/CrearPresupuestoScreen";
import EditarPresupuestoScreen from "./screens/EditarPresupuestoScreen";
import ReporteGastosScreen from "./screens/ReporteGastosScreen";
import PagosFijosScreen from "./screens/PagosFijosScreen";
import AgregarNuevoPagoScreen from "./screens/AgregarNuevoPagoScreen";
import EditarPagoFijoScreen from "./screens/EditarPagoFijoScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000",
        tabBarStyle: { backgroundColor: "#54bcd4" },
      }}
    >
      <Tab.Screen
        name="Principal"
        component={PrincipalScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
          tabBarLabel: "",
        }}
      />
      <Tab.Screen
        name="Ayuda"
        component={AyudaScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="info" color={color} size={size} />
          ),
          tabBarLabel: "",
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Entypo name="menu" color={color} size={size} />
          ),
          tabBarLabel: "",
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="Presupuesto" component={PresupuestosScreen} />
        <Stack.Screen name="PagosFijos" component={PagosFijosScreen} />
        <Stack.Screen
          name="AgregarNuevoPago"
          component={AgregarNuevoPagoScreen}
        />
        <Stack.Screen name="EditarPagoFijo" component={EditarPagoFijoScreen} />
        <Stack.Screen name="ReporteGastos" component={ReporteGastosScreen} />
        <Stack.Screen
          name="EditarPresupuesto"
          component={EditarPresupuestoScreen}
        />
        <Stack.Screen
          name="CrearPresupuesto"
          component={CrearPresupuestoScreen}
        />
        <Stack.Screen name="AgregarDineroMonto" component={DineroMontoScreen} />
        <Stack.Screen
          name="AgregarTransacciones"
          component={AgregarTransaccionScreen}
        />
        <Stack.Screen
          name="AgregarDineroMetodo"
          component={DineroMetodoScreen}
        />
        <Stack.Screen
          name="AgregarDineroConfirmar"
          component={DineroConfirmarScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
