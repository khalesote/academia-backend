import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { checkFirebaseStatus, initializeFirebaseSafely } from '../utils/firebaseStatus';

export default function FirebaseDiagnosticScreen() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const firebaseStatus = await checkFirebaseStatus();
      setStatus(firebaseStatus);
    } catch (error: any) {
      console.error('Error checking Firebase status:', error);
      setStatus({
        initialized: false,
        authAvailable: false,
        firestoreAvailable: false,
        error: error?.message || 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const retryInitialization = async () => {
    setRetrying(true);
    try {
      const success = await initializeFirebaseSafely();
      if (success) {
        Alert.alert('Éxito', 'Firebase inicializado correctamente');
        await checkStatus();
      } else {
        Alert.alert('Error', 'No se pudo inicializar Firebase');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Error durante la inicialización: ' + (error?.message || 'Error desconocido'));
    } finally {
      setRetrying(false);
    }
  };

  const getStatusColor = (available: boolean) => {
    return available ? '#4CAF50' : '#F44336';
  };

  const getStatusText = (available: boolean) => {
    return available ? 'Disponible' : 'No disponible';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Verificando estado de Firebase...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="medical" size={32} color="#fff" />
        <Text style={styles.headerTitle}>Diagnóstico Firebase</Text>
        <Text style={styles.headerSubtitle}>Estado de servicios</Text>
      </View>

      <View style={styles.content}>
        {/* Estado general */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Estado General</Text>

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Ionicons name="construct" size={20} color={getStatusColor(status?.initialized)} />
              <Text style={styles.statusLabel}>Firebase Inicializado</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(status?.initialized) }]}>
                {getStatusText(status?.initialized)}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Ionicons name="key" size={20} color={getStatusColor(status?.authAvailable)} />
              <Text style={styles.statusLabel}>Authentication</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(status?.authAvailable) }]}>
                {getStatusText(status?.authAvailable)}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Ionicons name="folder" size={20} color={getStatusColor(status?.firestoreAvailable)} />
              <Text style={styles.statusLabel}>Firestore</Text>
              <Text style={[styles.statusValue, { color: getStatusColor(status?.firestoreAvailable) }]}>
                {getStatusText(status?.firestoreAvailable)}
              </Text>
            </View>
          </View>
        </View>

        {/* Información del error */}
        {status?.error && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Información del Error</Text>

            <View style={styles.errorCard}>
              <Ionicons name="warning" size={24} color="#F44336" />
              <Text style={styles.errorText}>{status.error}</Text>
              <Text style={styles.errorTimestamp}>
                Timestamp: {status.timestamp}
              </Text>
            </View>
          </View>
        )}

        {/* Acciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Acciones</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={checkStatus}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Verificar Estado</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, retrying && styles.actionButtonDisabled]}
            onPress={retryInitialization}
            disabled={retrying}
          >
            {retrying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="construct" size={20} color="#fff" />
            )}
            <Text style={styles.actionButtonText}>
              {retrying ? 'Reintentando...' : 'Reintentar Inicialización'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Información</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Este diagnóstico ayuda a identificar problemas con la configuración de Firebase.
              Si Firebase no se inicializa correctamente, la aplicación funcionará en modo local usando AsyncStorage.
            </Text>

            <Text style={styles.infoText}>
              Para solucionar problemas comunes:
            </Text>

            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Verifica la conexión a internet</Text>
              <Text style={styles.tipItem}>• Revisa las credenciales de Firebase</Text>
              <Text style={styles.tipItem}>• Asegúrate de que el proyecto Firebase esté activo</Text>
              <Text style={styles.tipItem}>• Verifica permisos de API en Firebase Console</Text>
            </View>
          </View>
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorCard: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  errorTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionButtonDisabled: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  tipsList: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
  },
  tipItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
});
