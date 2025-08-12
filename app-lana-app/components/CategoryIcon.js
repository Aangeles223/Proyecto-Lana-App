import React from "react";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

// Mapea nombre de categoría a ícono
const iconMap = {
  Comida: { component: MaterialIcons, name: "restaurant" },
  Transporte: { component: Ionicons, name: "car" },
  Salud: { component: FontAwesome5, name: "heartbeat" },
  Entretenimiento: { component: MaterialIcons, name: "movie" },
  Hogar: { component: MaterialIcons, name: "home" },
  Servicios: { component: MaterialIcons, name: "build" },
  Sueldo: { component: MaterialIcons, name: "attach-money" },
};

export default function CategoryIcon({ categoria, size = 24, color = "#222" }) {
  const map = iconMap[categoria] || {
    component: MaterialIcons,
    name: "category",
  };
  const Icon = map.component;
  return <Icon name={map.name} size={size} color={color} />;
}
