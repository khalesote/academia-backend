import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function B2Avanzado() {
  const router = useRouter();
  const [unitProgress, setUnitProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [b2Unlocked, setB2Unlocked] = useState(false);
  const [oralGatePassed, setOralGatePassed] = useState(false);

  useEffect(() => {
    const checkOralGateStatus = async () => {
      try {
        console.log('🔍 B2_Avanzado: Verificando estado del oral gate...');
        const g = await AsyncStorage.getItem('B2_oral_gate_passed');
        console.log('🔍 B2_Avanzado: Estado crudo del oral gate:', g);
        const passed = g === 'true';
        console.log('🔍 B2_Avanzado: oralGatePassed establecido a:', passed);
        setOralGatePassed(passed);
      } catch (error) {
        console.error('❌ B2_Avanzado: Error verificando oral gate:', error);
        setOralGatePassed(false);
      }
    };

    // Pequeño delay para asegurar que otros componentes no interfieran
    const timeoutId = setTimeout(checkOralGateStatus, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const verificarProgreso = async () => {
      try {
        const nivelB2 = await AsyncStorage.getItem('nivelB2');
        const aprobadoB2 = await AsyncStorage.getItem('aprobadoB2');
        console.log('🔍 Revisando progreso guardado:', { nivelB2, aprobadoB2 });
        
        // Check both keys for compatibility
        const isUnlocked = nivelB2 === 'true' || aprobadoB2 === 'true';
        setB2Unlocked(isUnlocked);
        
        if (!isUnlocked) {
          // If not unlocked, set default unlocked state (true) for now
          // This maintains the existing behavior while we test
          setB2Unlocked(true);
        }
      } catch (error) {
        console.error('Error al verificar progreso:', error);
        setB2Unlocked(true); // Default to unlocked on error
      }
      setLoading(false);
    };

    verificarProgreso();
  }, [router]);

  const handleExamFinalPress = () => {
    console.log('🔥 B2_Avanzado: Navegando directamente al ExamenFinal.tsx');
    router.push('/B2_Avanzado/clases/ExamenFinal');
  };

  const getUnitStatus = (unitId: string) => {
    return 'unlocked';
  };

  const isUnitAccessible = (unitId: string) => {
    return true;
  };

  const getUnitStyle = (unitId: string) => {
    return [styles.unitButton, { backgroundColor: '#388e3c' }];
  };

  const handleUnitPress = (unitId: string) => {
    router.push(`/B2_Avanzado/clases/${unitId}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.title}>Cargando progreso...</Text>
      </View>
    );
  }

  // Pantalla de B2 siempre accesible

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/SchoolScreen')}>
        <Text style={styles.backButtonText}>← Regresar al Menú Principal</Text>
      </TouchableOpacity>
      <Text style={styles.title}>B2: Avanzado</Text>
      <Text style={styles.titleAr}>B2: المتقدم</Text>
      <ScrollView style={{ width: '100%', marginTop: 24 }}>
        {/* Botones de las unidades B2 con sistema de progreso */}
        {[
          { id: 'literatura_espanola', es: '📚 Literatura Española', ar: 'الأدب الإسباني' },
          { id: 'trabajo_avanzado', es: '💼 Trabajo Avanzado', ar: 'العمل المتقدم' },
          { id: 'vivienda_avanzada', es: '🏠 Vivienda Avanzada', ar: 'السكن المتقدم' },
          { id: 'salud_avanzada', es: '🏥 Salud Avanzada', ar: 'الصحة المتقدمة' },
          { id: 'tecnologia_avanzada', es: '💻 Tecnología Avanzada', ar: 'التكنولوجيا المتقدمة' },
          { id: 'educacion_avanzada', es: '🎓 Educación Avanzada', ar: 'التعليم المتقدم' },
          { id: 'medioambiente_avanzado', es: '🌍 Medio Ambiente Avanzado', ar: 'البيئة المتقدمة' },
          { id: 'economia', es: '💰 Economía', ar: 'الاقتصاد' },
          { id: 'politica', es: '🏛️ Política', ar: 'السياسة' },
          { id: 'cultura_avanzada', es: '🎭 Cultura Avanzada', ar: 'الثقافة المتقدمة' },
          { id: 'ciencia', es: '🔬 Ciencia', ar: 'العلوم' },
          { id: 'Poesia', es: '🌹 Poesía Española', ar: 'الشعر الإسباني' },
        ].map((unidad) => {
          const status = getUnitStatus(unidad.id);
          const isAccessible = isUnitAccessible(unidad.id);
          
          return (
            <TouchableOpacity
              key={unidad.id}
              style={getUnitStyle(unidad.id)}
              onPress={() => handleUnitPress(unidad.id)}
              disabled={!isAccessible}
            >
              <View style={styles.unitButtonContent}>
                <View style={styles.unitTextContainer}>
                  <Text style={[styles.unitButtonText, !isAccessible && { color: '#666' }]}>
                    {unidad.es}
                  </Text>
                  <Text style={[styles.unitButtonTextAr, !isAccessible && { color: '#666' }]}>
                    {unidad.ar}
                  </Text>
                </View>
                <View style={styles.statusIcon}>
                  {status === 'completed' && (
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  )}
                  {status === 'unlocked' && (
                    <Ionicons name="play-circle" size={24} color="#fff" />
                  )}
                  {status === 'locked' && (
                    <Ionicons name="lock-closed" size={24} color="#666" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.unitButton, { backgroundColor: '#388e3c' }]}
          onPress={() => router.push('/B2_Avanzado/clases/ExpresionOral')}
        >
          <Text style={styles.unitButtonText}>Expresión Oral</Text>
          <Text style={styles.unitButtonTextAr}>التعبير الشفوي</Text>
        </TouchableOpacity>
        
        {/* Examen Final B2 - Siempre accesible */}
        <TouchableOpacity
          style={[
            styles.examButton,
            { backgroundColor: '#d32f2f' }
          ]}
          onPress={handleExamFinalPress}
        >
          <View style={styles.unitButtonContent}>
            <View style={styles.unitTextContainer}>
              <Text style={styles.examButtonText}>Examen Final</Text>
              <Text style={styles.examButtonTextAr}>الاختبار النهائي</Text>
            </View>
            <Ionicons name="school" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#388e3c', marginBottom: 12 },
  titleAr: { fontSize: 26, fontWeight: 'bold', color: '#388e3c', marginBottom: 16, writingDirection: 'rtl' },
  subtitle: { fontSize: 18, color: '#444', marginBottom: 8, textAlign: 'center' },
  subtitleAr: { fontSize: 18, color: '#444', marginBottom: 8, textAlign: 'center', writingDirection: 'rtl' },
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
  unitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  unitTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  statusIcon: {
    marginLeft: 12,
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
    fontFamily: 'System',
  },
  examButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 18,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    width: '100%',
  },
  examButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  examButtonTextAr: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    writingDirection: 'rtl',
    fontFamily: 'System',
    letterSpacing: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 24,
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
