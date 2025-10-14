import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function B1Umbral() {
  const router = useRouter();
  const [unitProgress, setUnitProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [oralGatePassed, setOralGatePassed] = useState(false);

  useEffect(() => {
    const checkOralGateStatus = async () => {
      try {
        console.log('🔍 B1_Umbral: Verificando estado del oral gate...');
        const g = await AsyncStorage.getItem('B1_oral_gate_passed');
        console.log('🔍 B1_Umbral: Estado crudo del oral gate:', g);
        const passed = g === 'true';
        console.log('🔍 B1_Umbral: oralGatePassed establecido a:', passed);
        setOralGatePassed(passed);
      } catch (error) {
        console.error('❌ B1_Umbral: Error verificando oral gate:', error);
        setOralGatePassed(false);
      }
    };

    // Pequeño delay para asegurar que otros componentes no interfieran
    const timeoutId = setTimeout(checkOralGateStatus, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    // Sin bloqueo: no cargamos progreso
    setUnitProgress({});
    setLoading(false);
  }, []);

  const handleExamFinalPress = () => {
    console.log('🔥 B1_Umbral: Navegando directamente al ExamenFinal.tsx');
    router.push('/B1_Umbral/clases/ExamenFinal');
  };

  const getUnitStatus = (unitId: string) => {
    // Sin bloqueo: tratar todas como 'unlocked'
    return 'unlocked';
  };

  const isUnitAccessible = (unitId: string) => {
    return true;
  };

  const getUnitStyle = (unitId: string) => {
    return [styles.unitButton, { backgroundColor: '#fbc02d' }];
  };

  const handleUnitPress = (unitId: string) => {
    router.push(`/B1_Umbral/clases/${unitId}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.title}>Cargando progreso...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/SchoolScreen')}>
        <Text style={styles.backButtonText}>← Regresar al Menú Principal</Text>
      </TouchableOpacity>
      <Text style={styles.title}>B1: Umbral</Text>
      <Text style={styles.titleAr}>B1: العتبة</Text>
      <ScrollView style={{ width: '100%', marginTop: 24 }}>
        {/* Gramática - Primera posición */}
        <TouchableOpacity
          style={[styles.unitButton, { backgroundColor: '#1976d2' }]}
          onPress={() => router.push('/GramaticaScreen')}
        >
          <Text style={styles.unitButtonText}>Gramática</Text>
          <Text style={styles.unitButtonTextAr}>القواعد</Text>
        </TouchableOpacity>
        
        {/* Botones de las clases B1 con sistema de progreso */}
        {[
          { id: 'Trabajo', es: 'Trabajo', ar: 'العمل' },
          { id: 'Vivienda', es: 'Vivienda', ar: 'السكن' },
          { id: 'Salud', es: 'Salud', ar: 'الصحة' },
          { id: 'Tecnologia', es: 'Tecnología', ar: 'التكنولوجيا' },
          { id: 'Transporte', es: 'Transporte', ar: 'النقل' },
          { id: 'Cultura', es: 'Cultura', ar: 'الثقافة' },
          { id: 'Estudios', es: 'Estudios', ar: 'الدراسة' },
          { id: 'MedioAmbiente', es: 'Medio Ambiente', ar: 'البيئة' },
          { id: 'Deportes', es: 'Deportes', ar: 'الرياضة' },
          { id: 'GastronomiaHispana', es: 'Gastronomía Hispana', ar: 'فن الطبخ الإسباني' },
          { id: 'MediosComunicacion', es: 'Medios de Comunicación', ar: 'وسائل الإعلام' },
          { id: 'ProblemasSociales', es: 'Problemas Sociales', ar: 'المشاكل الاجتماعية' },
          { id: 'Turismo', es: 'Turismo', ar: 'السياحة' },
          { id: 'Viajes', es: 'Viajes', ar: 'السفر' },
          { id: 'VidaCotidiana', es: 'Vida Cotidiana', ar: 'الحياة اليومية' },
          { id: 'Voluntariado', es: 'Voluntariado', ar: 'التطوع' },
          { id: 'Experiencias', es: 'Experiencias', ar: 'التجارب' },
          { id: 'FiestasTradiciones', es: 'Fiestas y Tradiciones', ar: 'الأعياد والتقاليد' },
          { id: 'LiteraturaExpresiones', es: 'Literatura y Expresiones', ar: 'الأدب والتعبيرات' },
          { id: 'Alimentacion', es: 'Alimentación', ar: 'التغذية' },
          { id: 'Relaciones', es: 'Relaciones', ar: 'العلاقات' },
        ].map((clase) => {
          const status = getUnitStatus(clase.id);
          const isAccessible = isUnitAccessible(clase.id);
          
          return (
            <TouchableOpacity
              key={clase.id}
              style={getUnitStyle(clase.id)}
              onPress={() => handleUnitPress(clase.id)}
              disabled={false}
            >
              <View style={styles.unitButtonContent}>
                <View style={styles.unitTextContainer}>
                  <Text style={[styles.unitButtonText]}>
                    {clase.es}
                  </Text>
                  <Text style={[styles.unitButtonTextAr]}>
                    {clase.ar}
                  </Text>
                </View>
                <View style={styles.statusIcon}>
                  <Ionicons name="play-circle" size={24} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.unitButton, { backgroundColor: '#388e3c' }]}
          onPress={() => router.push('/B1_Umbral/clases/ExpresionOral')}
        >
          <Text style={styles.unitButtonText}>Expresión Oral</Text>
          <Text style={styles.unitButtonTextAr}>التعبير الشفوي</Text>
        </TouchableOpacity>
        
        {/* Examen Final - Siempre accesible */}
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
  title: { fontSize: 28, fontWeight: 'bold', color: '#fbc02d', marginBottom: 12 },
  titleAr: { fontSize: 26, fontWeight: 'bold', color: '#fbc02d', marginBottom: 16, writingDirection: 'rtl' },
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
