import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function A2Plataforma() {
  const router = useRouter();
  const [a2Unlocked, setA2Unlocked] = useState<boolean>(true);
  const [unitsDone, setUnitsDone] = useState<boolean[]>(Array(10).fill(false));
  // Sin bloqueo de pruebas en producción
  const allUnitsCompleted = unitsDone.every(Boolean);

  useEffect(() => {
    (async () => {
      try {
        setA2Unlocked(true);
        const unitKeys = Array.from({ length: 10 }, (_, i) => `A2_Unidad${i + 1}_Completed`);
        const unitVals = await Promise.all(unitKeys.map((k) => AsyncStorage.getItem(k)));
        setUnitsDone(unitVals.map((v) => v === 'true'));
      } catch {}
    })();
  }, []);

  // Refrescar estado cada vez que la pantalla obtiene foco
  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        try {
          if (!active) return;
          setA2Unlocked(true);
          const unitKeys = Array.from({ length: 10 }, (_, i) => `A2_Unidad${i + 1}_Completed`);
          const unitVals = await Promise.all(unitKeys.map((k) => AsyncStorage.getItem(k)));
          if (!active) return;
          setUnitsDone(unitVals.map((v) => v === 'true'));
          // DEV helper: abrir examen si hay una marca pendiente
          if (__DEV__) {
            const openFlag = await AsyncStorage.getItem('openA2ExamOnce');
            if (openFlag === 'true') {
              await AsyncStorage.setItem('openA2ExamOnce', 'false');
              setTimeout(() => router.push('/A2_Plataforma/clases/ExamenFinal'), 100);
            }
          }
        } catch {}
      })();
      return () => { active = false; };
    }, [])
  );
  const isLocked = false;

  const handleOpenUnidad = (n: number) => {
    router.push(`/A2_Plataforma/clases/${encodeURIComponent('Unidad' + n)}` as any);
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/SchoolScreen')}>
        <Text style={styles.backButtonText}>← Regresar al Menú Principal</Text>
      </TouchableOpacity>
      {__DEV__ ? (
        <TouchableOpacity
          onLongPress={async () => {
            try {
              // Marcar A2 desbloqueado y todas las unidades como completas
              const unitKeys = Array.from({ length: 10 }, (_, i) => `A2_Unidad${i + 1}_Completed`);
              await Promise.all([
                AsyncStorage.setItem('A2_desbloqueado', 'true'),
                AsyncStorage.setItem('nivelA2', 'true'),
                ...unitKeys.map(k => AsyncStorage.setItem(k, 'true')),
              ]);
              setA2Unlocked(true);
              setUnitsDone(Array(10).fill(true));
              await AsyncStorage.setItem('openA2ExamOnce', 'true');
              Alert.alert('DEV', 'A2 preparado. Abriendo Examen Final A2...');
              router.replace('/A2_Plataforma');
            } catch (e) {
              Alert.alert('Error', 'No se pudo habilitar el examen A2 en DEV');
            }
          }}
        >
          <Text style={styles.title}>A2: Plataforma</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.title}>A2: Plataforma</Text>
      )}
      <Text style={styles.titleAr}>A2: المنصة</Text>
      {/* Nivel siempre accesible: sin mensaje de bloqueo */}
      <ScrollView style={{ width: '100%', marginTop: 24 }}>
        {[...Array(10)].map((_, i) => {
          const n = i + 1;
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.unitButton
              ]}
              onPress={() => handleOpenUnidad(n)}
              disabled={false}
            >
              <Text style={styles.unitButtonText}>{`Unidad ${n}${unitsDone[n-1] ? ' ✓' : ''}`}</Text>
              <Text style={styles.unitButtonTextAr}>{`الوحدة ${n}`}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.unitButton, { backgroundColor: '#1976d2' }]}
          onPress={() => {
            router.push("/(tabs)/VocabularioScreen");
          }}
          disabled={false}
        >
          <Text style={styles.unitButtonText}>Vocabulario</Text>
          <Text style={styles.unitButtonTextAr}>المفردات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.unitButton, { backgroundColor: '#388e3c' }]}
          onPress={() => {
            router.push(`/A2_Plataforma/clases/${encodeURIComponent('ExpresionOral')}` as any);
          }}
          disabled={false}
        >
          <Text style={styles.unitButtonText}>Expresión Oral</Text>
          <Text style={styles.unitButtonTextAr}>التعبير الشفوي</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.examButton
          ]}
          onPress={() => {
            router.push('/A2_Plataforma/clases/ExamenFinal');
          }}
          disabled={false}
        >
          <Text style={styles.examButtonText}>Examen Final</Text>
          <Text style={styles.examButtonTextAr}>الاختبار النهائي</Text>
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
  infoBox: {
    width: '100%',
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#388e3c',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    color: '#1b5e20',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  infoTextAr: {
    color: '#1b5e20',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
