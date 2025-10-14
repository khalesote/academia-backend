import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function FoneticaMenuScreen() {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Botón de regreso al menú de unidades A1 */}
      <TouchableOpacity
        style={{ marginBottom: 16, alignSelf: 'flex-start', padding: 8 }}
        onPress={() => router.replace('/A1_Acceso')}
        accessibilityLabel="Volver al menú A1"
      >
        <Ionicons name="arrow-back" size={28} color="#388e3c" />
      </TouchableOpacity>
      <Text style={styles.title}>Menú de Fonética</Text>
      <TouchableOpacity
        style={[styles.menuButton, { backgroundColor: '#388e3c' }]}
        onPress={() => router.push('/(tabs)/FoneticaJuegoReconocimientoScreen')}
      >
        <Ionicons name="game-controller-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.menuButtonText}>Juego Fonética</Text>
          <Text style={styles.menuButtonTextAr}>لعبة الصوتيات</Text>
        </View>
      </TouchableOpacity>

      {/* Botón Fonética Vocales */}
      <TouchableOpacity
        style={[styles.menuButton, { backgroundColor: '#ff9800' }]}
        onPress={() => router.push('/(tabs)/FoneticaVocalesScreen')}
      >
        <Ionicons name="musical-notes-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.menuButtonText}>Fonética Vocales</Text>
          <Text style={styles.menuButtonTextAr}>صوتيات الحروف المتحركة</Text>
        </View>
      </TouchableOpacity>
      {/* Botón Práctica Fonética */}
      <TouchableOpacity
        style={[styles.menuButton, { backgroundColor: '#1976d2' }]}
        onPress={() => router.push('/(tabs)/FoneticaPronunciacionScreen')}
      >
        <Ionicons name="school-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.menuButtonText}>Práctica Fonética</Text>
          <Text style={styles.menuButtonTextAr}>تدريب الصوتيات</Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff8e1',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 36,
    color: '#222',
    textAlign: 'center',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginVertical: 12,
    width: '100%',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  menuButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  menuButtonTextAr: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: 'System',
    marginTop: 2,
  },
});
