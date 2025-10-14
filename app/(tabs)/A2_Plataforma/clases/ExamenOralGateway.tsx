import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ExamenOralGateway() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const nivel = params.nivel || 'A1';

  const [oralCompleted, setOralCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkOralStatus();
  }, [nivel]);

  const checkOralStatus = async () => {
    try {
      const oralKey = `${nivel}_oral_gate_passed`;
      const oralPassed = await AsyncStorage.getItem(oralKey);
      setOralCompleted(oralPassed === 'true');
    } catch (error) {
      console.error('Error checking oral status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOral = () => {
    const oralRoute = `/${nivel}_Acceso/clases/ExpresionOral`;
    router.push(oralRoute);
  };

  const handleStartWritten = () => {
    const writtenRoute = `/${nivel}_Acceso/clases/ExamenFinal`;
    router.push(writtenRoute);
  };

  const getNivelDisplayName = () => {
    switch(nivel) {
      case 'A1': return 'A1';
      case 'A2': return 'A2';
      case 'B1': return 'B1';
      case 'B2': return 'B2';
      default: return nivel;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace(`/${nivel}_Acceso`)}
      >
        <Ionicons name="arrow-back" size={24} color="#1976d2" />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Ionicons name="school" size={64} color="#1976d2" />
        <Text style={styles.title}>Examen Final {getNivelDisplayName()}</Text>
        <Text style={styles.subtitle}>Flujo de evaluación</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Proceso de Examen</Text>
        <Text style={styles.infoText}>
          • Primero debes completar el examen oral{'\n'}
          • Una vez aprobado, se desbloqueará el examen escrito{'\n'}
          • Ambos exámenes son obligatorios para obtener el certificado
        </Text>
      </View>

      {!oralCompleted ? (
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepIndicator, styles.currentStep]}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Examen Oral</Text>
          </View>
          <Text style={styles.stepDescription}>
            Evaluación de expresión oral y pronunciación
          </Text>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleStartOral}
          >
            <Ionicons name="mic" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Iniciar Examen Oral</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.completedContainer}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepIndicator, styles.completedStep]}>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </View>
            <Text style={styles.stepTitle}>Examen Oral Aprobado ✓</Text>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepIndicator, styles.currentStep]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Examen Escrito</Text>
            </View>
            <Text style={styles.stepDescription}>
              Evaluación de gramática, vocabulario y comprensión
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleStartWritten}
            >
              <Ionicons name="pencil" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Iniciar Examen Escrito</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#0d47a1',
    lineHeight: 24,
  },
  stepContainer: {
    marginBottom: 24,
  },
  completedContainer: {
    marginBottom: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currentStep: {
    backgroundColor: '#1976d2',
  },
  completedStep: {
    backgroundColor: '#388e3c',
  },
  stepNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginLeft: 48,
    marginBottom: 16,
    lineHeight: 22,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginLeft: 48,
  },
  primaryButton: {
    backgroundColor: '#1976d2',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
