import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { LevelLock } from '@/components/LevelLock';

const A1_ACCESO_LEVEL = 'A1';

export default function A1Acceso() {
  const router = useRouter();
  const { progress, isLoading } = useUserProgress();
  const [unidadesCompletadas, setUnidadesCompletadas] = useState<number>(0);
  const [expEscritaDone, setExpEscritaDone] = useState<boolean>(false);
  const [expOralDone, setExpOralDone] = useState<boolean>(false);
  const [unitsDone, setUnitsDone] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const allUnitsCompleted = unitsDone.every(Boolean);
  
  // Verificar si el nivel está desbloqueado
  const isUnlocked = progress && progress[A1_ACCESO_LEVEL]?.unlocked;
  
  // Si el nivel no está desbloqueado, mostrar el componente de bloqueo
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }
  
  if (!isUnlocked) {
    return (
      <LevelLock 
        requiredLevel={A1_ACCESO_LEVEL}
        currentLevel=""
        onUnlock={() => router.push('/(tabs)/matricula')}
      />
    );
  }

  useEffect(() => {
    (async () => {
      const val = await AsyncStorage.getItem('A1_unidadesCompletadas');
      setUnidadesCompletadas(parseInt(val || '0') || 0);
      const [escrita, oral] = await Promise.all([
        AsyncStorage.getItem('A1_ExpresionEscrita_Completed'),
        AsyncStorage.getItem('A1_ExpresionOral_Completed'),
      ]);
      setExpEscritaDone(escrita === 'true');
      setExpOralDone(oral === 'true');
      // Usar solo claves legacy para mostrar check de completado
      const unitKeys = [
        'A1_Unidad1_Completed',
        'A1_Unidad2_Completed',
        'A1_Unidad3_Completed',
        'A1_Unidad4_Completed',
        'A1_Unidad5_Completed',
        'A1_Unidad6_Completed',
        'A1_Unidad7_Completed',
      ];
      const unitVals = await Promise.all(unitKeys.map((k) => AsyncStorage.getItem(k)));
      setUnitsDone(unitVals.map((v) => v === 'true'));
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const [val, escrita, oral] = await Promise.all([
            AsyncStorage.getItem('A1_unidadesCompletadas'),
            AsyncStorage.getItem('A1_ExpresionEscrita_Completed'),
            AsyncStorage.getItem('A1_ExpresionOral_Completed'),
          ]);
          if (isActive) {
            setUnidadesCompletadas(parseInt(val || '0') || 0);
            setExpEscritaDone(escrita === 'true');
            setExpOralDone(oral === 'true');
            const unitKeys = [
              'A1_Unidad1_Completed',
              'A1_Unidad2_Completed',
              'A1_Unidad3_Completed',
              'A1_Unidad4_Completed',
              'A1_Unidad5_Completed',
              'A1_Unidad6_Completed',
              'A1_Unidad7_Completed',
            ];
            const unitVals = await Promise.all(unitKeys.map((k) => AsyncStorage.getItem(k)));
            setUnitsDone(unitVals.map((v) => v === 'true'));
          }
        } catch (e) {
          console.warn('No se pudo refrescar el estado del índice A1', e);
        }
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handlePressUnidad = async (n: number) => {
    // Sin bloqueo: abrir directamente
    router.push(`/A1_Acceso/clases/Unidad${n}` as any);
  };

  const oralGatePassed = expOralDone && unitsDone[6]; // La unidad 7 es el índice 6

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/SchoolScreen')}>
        <Text style={styles.backButtonText}>← Regresar al Menú Principal</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>A1: Acceso</Text>
      <Text style={styles.titleAr}>A1: الوصول</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Para abrir la unidad siguiente tienes que completar los ejercicios de la unidad anterior.</Text>
        <Text style={styles.infoTextAr}>لفتح الوحدة التالية يجب إكمال تمارين الوحدة السابقة.</Text>
      </View>

      {/* Controles de testing eliminados para evitar bloqueos */}

      {/* (sin controles de prueba) */}
      
      <ScrollView style={{ width: '100%', marginTop: 24 }}>
        {/* Botones de Alfabeto y Fonética dentro del mismo scroll */}
        <View style={styles.specialButtonsContainer}>
          <TouchableOpacity
            style={[styles.specialButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => router.push("/(tabs)/indice")}
          >
            <Ionicons name="text" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.specialButtonText}>Alfabeto Español</Text>
            <Text style={styles.specialButtonTextAr}>الأبجدية الإسبانية</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.specialButton, { backgroundColor: '#FF9800' }]}
            onPress={() => router.push("/(tabs)/FoneticaMenuScreen")}
          >
            <Ionicons name="volume-high" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.specialButtonText}>Fonética y Pronunciación</Text>
            <Text style={styles.specialButtonTextAr}>الصوتيات والنطق</Text>
          </TouchableOpacity>
        </View>

        {[...Array(7)].map((_, i) => {
          const n = i + 1;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.unitButton]}
              onPress={() => handlePressUnidad(n)}
              disabled={false}
            >
              <Text style={styles.unitButtonText}>{`Unidad ${n}${unitsDone[n-1] ? ' ✓' : ''}`}</Text>
              <Text style={styles.unitButtonTextAr}>{`الوحدة ${n}`}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.unitButton, { backgroundColor: '#388e3c' }]}
          onPress={() => router.push('/A1_Acceso/clases/ExamenOralGateway')}
        >
          <Text style={styles.unitButtonText}>Expresión Oral{expOralDone ? ' ✓' : ''}</Text>
          <Text style={styles.unitButtonTextAr}>التعبير الشفوي</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.examButton}
          onPress={() => router.push('/A1_Acceso/clases/ExamenFinal')}
        >
          <Ionicons name="school" size={20} color="#fff" style={{ marginRight: 8 }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.examButtonText}>Examen Final A1</Text>
            <Text style={styles.examButtonTextAr}>الاختبار النهائي A1</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: { 
    flex: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 24 
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1976d2', marginBottom: 12 },
  titleAr: { fontSize: 26, fontWeight: 'bold', color: '#1976d2', marginBottom: 16, writingDirection: 'rtl' },
  infoBox: {
    width: '100%',
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoText: {
    color: '#0d47a1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  infoTextAr: {
    color: '#0d47a1',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: { fontSize: 18, color: '#444', marginBottom: 8, textAlign: 'center' },
  subtitleAr: { fontSize: 18, color: '#444', marginBottom: 8, textAlign: 'center', writingDirection: 'rtl' },
  specialButtonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  specialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    width: '100%',
  },
  specialButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  specialButtonTextAr: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginLeft: 8,
  },
  unitButton: {
    backgroundColor: '#fbc02d',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    width: '100%',
  },
  unitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  unitButtonTextAr: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  backButton: {
    position: 'absolute',
    top: 44,
    left: 24,
    zIndex: 10,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  examButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    width: '100%',
  },
  examButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  examButtonTextAr: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
