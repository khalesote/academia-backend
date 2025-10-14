import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { userStorage, userDB } from '../../utils/userDatabase';

export default function ConfirmacionPagoScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);

  // Obtener parámetros de la ruta
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

  // Verificar si el usuario ya existe
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await userStorage.getCurrentUser();
        setUserExists(currentUser !== null);
      } catch (error) {
        console.error('Error verificando usuario:', error);
        setUserExists(false);
      }
    };

    checkUser();
  }, []);

  const handleConfirmarPago = () => {
    // Para formación profesional, verificamos que tenga el parámetro tipo
    if (params.tipo === 'formacion-profesional') {
      if (!params.tipo) {
        Alert.alert('Error', 'Faltan parámetros necesarios para el pago');
        return;
      }
    }
    // Para escuela virtual, verificamos que tenga el parámetro bloque
    else {
      if (!params.bloque) {
        Alert.alert('Error', 'Faltan parámetros necesarios para el pago');
        return;
      }
    }

    // Navegar a la pantalla de pago correspondiente
    if (params.tipo === 'formacion-profesional') {
      console.log('🔄 Navegando a PagoFormacionScreen con params:', params);
      router.push({
        pathname: '/PagoFormacionScreen',
        params: params
      });
    } else {
      // Para escuela virtual, navegar de vuelta a MatriculaScreen para procesar el pago
      console.log('🔄 Navegando a MatriculaScreen con params:', params);
      router.push({
        pathname: '/MatriculaScreen',
        params: params
      });
    }
  };

  const handleVolver = () => {
    router.back();
  };

  const getPrecio = () => {
    if (params.tipo === 'formacion-profesional') {
      return '10,00 €';
    }
    if (params.bloque === 'A1A2') {
      return '20,00 €';
    }
    if (params.bloque === 'B1B2') {
      return '30,00 €';
    }
    return '0,00 €';
  };

  const getDescripcion = () => {
    if (params.tipo === 'formacion-profesional') {
      return 'Acceso completo a Formación Profesional (1 año)';
    }
    if (params.bloque === 'A1A2') {
      return 'Matrícula niveles A1 y A2';
    }
    if (params.bloque === 'B1B2') {
      return 'Matrícula niveles B1 y B2';
    }
    return '';
  };

  if (userExists === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Verificando usuario...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#45a049']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleVolver}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirmación de Pago</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Información del usuario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Personales</Text>
          <View style={styles.dataCard}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Nombre:</Text>
              <Text style={styles.dataValue}>
                {params.nombre} {params.apellido1} {params.apellido2 || ''}
              </Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Fecha de Nacimiento:</Text>
              <Text style={styles.dataValue}>{params.fechaNacimiento}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Provincia:</Text>
              <Text style={styles.dataValue}>{params.provincia}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Teléfono:</Text>
              <Text style={styles.dataValue}>{params.telefono}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Documento:</Text>
              <Text style={styles.dataValue}>
                {params.tipoDocumento} {params.documento}
              </Text>
            </View>
          </View>
        </View>

        {/* Información del pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del Pago</Text>
          <View style={styles.paymentCard}>
            <Text style={styles.paymentDescription}>{getDescripcion()}</Text>
            <Text style={styles.paymentPrice}>{getPrecio()}</Text>

            <View style={styles.benefitsList}>
              <Text style={styles.benefitsTitle}>Incluye:</Text>
              {params.tipo === 'formacion-profesional' ? (
                <>
                  <Text style={styles.benefitItem}>• Acceso completo por 1 año</Text>
                  <Text style={styles.benefitItem}>• 15 cursos profesionales</Text>
                  <Text style={styles.benefitItem}>• Certificados de finalización</Text>
                  <Text style={styles.benefitItem}>• Soporte técnico incluido</Text>
                </>
              ) : (
                <>
                  <Text style={styles.benefitItem}>• Material didáctico completo</Text>
                  <Text style={styles.benefitItem}>• Ejercicios interactivos</Text>
                  <Text style={styles.benefitItem}>• Exámenes y certificados</Text>
                  <Text style={styles.benefitItem}>• Soporte personalizado</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Información de registro */}
        {!userExists && (
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#2196F3" />
              <Text style={styles.infoText}>
                Se creará automáticamente una cuenta de usuario con los datos proporcionados.
                Podrás acceder a tu progreso desde cualquier dispositivo.
              </Text>
            </View>
          </View>
        )}

        {/* Métodos de pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          <View style={styles.paymentMethod}>
            <Ionicons name="card" size={24} color="#4CAF50" />
            <Text style={styles.paymentMethodText}>Pago seguro con tarjeta</Text>
          </View>
          <Text style={styles.securityNote}>
            Procesamos pagos de forma segura a través de Stripe. No almacenamos los datos de tu tarjeta.
          </Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleVolver}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmarPago}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.confirmButtonText}>Confirmar Pago</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dataCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dataLabel: {
    width: 120,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dataValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  paymentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  benefitsList: {
    marginTop: 8,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  paymentMethod: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  securityNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
