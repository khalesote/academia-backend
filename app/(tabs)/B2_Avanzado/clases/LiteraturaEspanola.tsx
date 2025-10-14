import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LiteraturaEspanola() {
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

      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1481627834870-b7833e8f5570?auto=format&fit=crop&w=600&q=80' }}
        style={styles.heroImage}
        accessibilityLabel='Imagen de literatura y libros'
      />

      <Text style={styles.title}>?? Literatura Española</Text>
      <Text style={styles.titleAr}>?? ????? ????????</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>?? Importancia de la literatura española</Text>
        <Text style={styles.sectionText}>
          La literatura española es una de las más ricas y diversas del mundo.
        </Text>
        <Text style={styles.sectionTextAr}>
          ????? ???????? ?? ???? ?? ???? ????? ?????? ?????? ?? ??????.
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
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 18,
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
