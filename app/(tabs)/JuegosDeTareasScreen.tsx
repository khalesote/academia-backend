import React from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

type Juego = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const juegos: Juego[] = [
  {
    key: "alfabeto",
    label: "Juego de Letras",
    icon: "text",
  },
  {
    key: "emparejar",
    label: "Juego de Emparejar",
    icon: "git-compare",
  },
  {
    key: "palabras",
    label: "Juego de Palabras",
    icon: "chatbubbles",
  },
  {
    key: "ordenar",
    label: "Juego de Ordenar Letras",
    icon: "reorder-four",
  },
  {
    key: "audio",
    label: "Juego de Audio",
    icon: "volume-high",
  },
  {
    key: "colores",
    label: "Juego de Colores",
    icon: "color-palette",
  },
  {
    key: "numeros",
    label: "Juego de Números",
    icon: "calculator",
  },
];



type JuegoRoute =
  | "/(tabs)/AdjetivosScreen"
  | "/(tabs)/VerbosScreen"
  | "/(tabs)/JuegoAlfabetoScreen"
  | "/(tabs)/JuegoEmparejarScreen"
  | "/(tabs)/JuegoPalabrasScreen"
  | "/(tabs)/JuegoOrdenarScreen"
  | "/(tabs)/JuegoAudioScreen"
  | "/(tabs)/JuegoColoresScreen"
  | "/(tabs)/JuegoNumerosScreen";
const juegoKeyToRoute: Record<string, JuegoRoute> = {
  adjetivos: "/(tabs)/AdjetivosScreen",
  verbos: "/(tabs)/VerbosScreen",
  alfabeto: "/(tabs)/JuegoAlfabetoScreen",
  emparejar: "/(tabs)/JuegoEmparejarScreen",
  palabras: "/(tabs)/JuegoPalabrasScreen",
  ordenar: "/(tabs)/JuegoOrdenarScreen",
  audio: "/(tabs)/JuegoAudioScreen",
  colores: "/(tabs)/JuegoColoresScreen",
  numeros: "/(tabs)/JuegoNumerosScreen",
};

export default function JuegosDeTareasScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/(tabs)/index")}
        >
          <Ionicons name="arrow-back" size={28} color="#2c3e50" />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.title}>Juegos de Tareas</Text>
        <View style={styles.menu}>
          {juegos.map((juego) => (
            <Pressable
              key={juego.key}
              style={styles.botonJuego}
              onPress={() => {
                // Si es la opción de papeles, navegar a la pantalla personalizada
                if (juego.key === "papeles") {
                  router.push("/(tabs)/AprendeGestionarPapelesScreen");
                } else {
                  const route = juegoKeyToRoute[juego.key as keyof typeof juegoKeyToRoute];
                  if (route) {
                    router.push(route);
                  } else {
                    console.warn("Ruta no válida:", juego.key);
                  }
                }
              }}
            >
              {juego.icon && (
                <Ionicons name={juego.icon} size={24} color="#fff" style={{ marginBottom: 6 }} />
              )}
              <Text style={styles.textoBotonJuego}>{juego.label}</Text>
            </Pressable>
          ))}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 8,
    minHeight: 40,
  },
  backButton: {
    padding: 8,
    marginLeft: 0,
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#f7f9fb", // Fondo suave
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 36,
    color: "#2c3e50",
    letterSpacing: 1,
  },
  menu: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#ffffffee",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 16,
  },
  juegoContainer: {
    width: "100%",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 18,
  },
  botonVolver: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    marginBottom: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  textoVolver: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  botonJuego: {
    backgroundColor: "#2196f3",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 18,
    alignItems: "center",
    width: 240,
    shadowColor: "#2196f3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  textoBotonJuego: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
