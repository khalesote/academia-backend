import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CienciaTecnologia() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/B2_Avanzado')}
        accessibilityLabel='Volver al menú B2: Avanzado'
      >
        <Ionicons name='arrow-back' size={28} color='#1976d2' />
      </TouchableOpacity>

      <Text style={styles.title}>?? Ciencia y Tecnología</Text>
      <Text style={styles.titleAr}>?? ????? ????????????</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>?? Importancia de la ciencia y tecnología</Text>
        <Text style={styles.sectionText}>
          La ciencia y tecnología son fundamentales para el progreso humano.
        </Text>
        <Text style={styles.sectionTextAr}>
          ????? ???????????? ??????? ?????? ??????.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>?? Ejercicios de práctica</Text>
        <Text style={styles.sectionText}>Los ejercicios están disponibles en la aplicación móvil.</Text>
        <Text style={styles.sectionTextAr}>???????? ????? ?? ??????? ???????.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
    textAlign: 'center',
  },
  titleAr: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 16,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  sectionTextAr: {
    fontSize: 16,
    color: '#333',
    writingDirection: 'rtl',
    fontFamily: 'System',
    lineHeight: 24,
  },
});
