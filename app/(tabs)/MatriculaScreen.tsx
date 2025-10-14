import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { MaterialIcons } from '@expo/vector-icons';
import { userDB, userStorage } from '../../utils/userDatabase';
import PagoEscuelaVirtual from '@/components/PagoEscuelaVirtual';

interface FormData {
  nombre: string;
  apellido1: string;
  apellido2: string;
  fechaNacimiento: string;
  provincia: string;
  telefono: string;
  tipoDocumento: string;
  documento: string;
}

export default function MatriculaScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  type EnrollmentLevel = 'A1A2' | 'B1B2';
  type UnlockableLevel = 'A1' | 'A2' | 'B1' | 'B2';
  const [selectedLevel, setSelectedLevel] = useState<EnrollmentLevel | null>(null);
  const router = useRouter();
  const { unlockLevel } = useUserProgress();

  const params = useLocalSearchParams<{
    bloque?: string;
    tipo?: string;
    nombre?: string;
    apellido1?: string;
    apellido2?: string;
    fechaNacimiento?: string;
    provincia?: string;
    telefono?: string;
    tipoDocumento?: string;
    documento?: string;
  }>();

  useEffect(() => {
    if (params && !formData) {
      const newFormData = {
        nombre: params.nombre || '',
        apellido1: params.apellido1 || '',
        apellido2: params.apellido2 || '',
        fechaNacimiento: params.fechaNacimiento || '',
        provincia: params.provincia || '',
        telefono: params.telefono || '',
        tipoDocumento: params.tipoDocumento || 'NIE',
        documento: params.documento || ''
      };

      if (JSON.stringify(newFormData) !== JSON.stringify(formData)) {
        setFormData(newFormData);

        if (params.bloque && !selectedLevel) {
          const nivel = params.bloque as EnrollmentLevel;
          setSelectedLevel(nivel);
        }
      }
    }
  }, [params, formData]);

  const handleSelectLevel = (level: EnrollmentLevel) => {
    setSelectedLevel(level);
  };

  const handlePaymentSuccess = async (paymentInfo: any) => {
    try {
      setIsLoading(true);
      
      // Unlock the appropriate levels based on the selected level
      if (selectedLevel === 'A1A2') {
        await unlockLevel('A1');
        await unlockLevel('A2');
      } else if (selectedLevel === 'B1B2') {
        await unlockLevel('B1');
        await unlockLevel('B2');
      }

      // Save payment info to AsyncStorage
      const paymentData = {
        ...paymentInfo,
        level: selectedLevel,
        date: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('lastPayment', JSON.stringify(paymentData));
      
      // Show success message
      Alert.alert(
        '¡Matrícula completada!',
        `Has desbloqueado los niveles ${selectedLevel} correctamente.`,
        [
          {
            text: 'Aceptar',
            onPress: () => router.replace('/(tabs)/cursos')
          }
        ]
      );
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      Alert.alert(
        'Error',
        'Hubo un error al procesar tu matrícula. Por favor, contacta con soporte.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPayment = () => {
    Alert.alert(
      'Pago cancelado',
      'El proceso de pago ha sido cancelado.',
      [{ text: 'Aceptar' }]
    );
  };

  if (!formData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Cargando datos del formulario...</Text>
      </View>
    );
  }

  const safeFormData = formData || {
    nombre: '',
    apellido1: '',
    apellido2: '',
    fechaNacimiento: '',
    provincia: '',
    telefono: '',
    tipoDocumento: 'NIE',
    documento: ''
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.sectionTitle}>Selecciona tu matrícula</Text>

        <View style={styles.dataContainer}>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Nombre:</Text>
            <Text style={styles.dataValue}>
              {safeFormData.nombre} {safeFormData.apellido1} {safeFormData.apellido2 || ''}
            </Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Documento:</Text>
            <Text style={styles.dataValue}>
              {safeFormData.tipoDocumento} {safeFormData.documento}
            </Text>
          </View>
        </View>

        {/* Opciones de matrícula */}
        <View style={styles.enrollmentOptions}>
          <TouchableOpacity
            style={[
              styles.enrollmentOption,
              selectedLevel === 'A1A2' && styles.selectedOption
            ]}
            onPress={() => handleSelectLevel('A1A2')}
          >
            <View style={styles.optionHeader}>
              <MaterialIcons
                name={selectedLevel === 'A1A2' ? 'lock-open' : 'lock-outline'}
                size={24}
                color={selectedLevel === 'A1A2' ? '#4CAF50' : '#666'}
              />
              <Text style={styles.optionTitle}>Matrícula A1-A2</Text>
            </View>
            <Text style={styles.optionPrice}>20€</Text>
            <Text style={styles.optionDescription}>Acceso completo a los niveles A1 y A2</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.enrollmentOption,
              selectedLevel === 'B1B2' && styles.selectedOption
            ]}
            onPress={() => handleSelectLevel('B1B2')}
          >
            <View style={styles.optionHeader}>
              <MaterialIcons
                name={selectedLevel === 'B1B2' ? 'lock-open' : 'lock-outline'}
                size={24}
                color={selectedLevel === 'B1B2' ? '#4CAF50' : '#666'}
              />
              <Text style={styles.optionTitle}>Matrícula B1-B2</Text>
            </View>
            <Text style={styles.optionPrice}>30€</Text>
            <Text style={styles.optionDescription}>Acceso completo a los niveles B1 y B2</Text>
          </TouchableOpacity>
        </View>

        {/* Sección de pago para Escuela Virtual */}
        {selectedLevel && (
          <View style={styles.paymentContainer}>
            <PagoEscuelaVirtual
              onPagoExitoso={handlePaymentSuccess}
              onCancelar={handleCancelPayment}
              formData={{
                ...formData,
                nivel: selectedLevel,
                monto: selectedLevel === 'A1A2' ? 20.00 : 30.00,
              }}
              level={selectedLevel}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  dataContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 20 },
  dataRow: { flexDirection: 'row', marginBottom: 10 },
  dataLabel: { fontWeight: 'bold', marginRight: 5 },
  dataValue: { flex: 1 },
  enrollmentOptions: { marginBottom: 20 },
  enrollmentOption: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  selectedOption: { borderColor: '#4CAF50', borderWidth: 2 },
  optionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  optionTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  optionPrice: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginBottom: 5 },
  optionDescription: { color: '#666' },
  paymentContainer: { alignItems: 'center', marginTop: 20 },
  payButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 10
  },
  payButtonText: { color: 'white', fontWeight: 'bold' },
  securityText: { fontSize: 12, color: '#999', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' }
});
