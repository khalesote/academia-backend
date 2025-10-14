import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { userStorage, User, getFullName } from '../utils/userDatabase';

interface StudyEntry {
  id: string;
  date: string;
  level: string;
  progress: string;
  notes: string;
  timestamp: string;
}

export default function UserProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [studyEntries, setStudyEntries] = useState<StudyEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    level: '',
    progress: '',
    notes: ''
  });

  const router = useRouter();

  useEffect(() => {
    loadUserData();
    loadStudyEntries();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await userStorage.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudyEntries = async () => {
    try {
      const entries = await AsyncStorage.getItem('studyEntries');
      if (entries) {
        setStudyEntries(JSON.parse(entries));
      }
    } catch (error) {
      console.error('Error cargando entradas de estudio:', error);
    }
  };

  const saveStudyEntry = async () => {
    if (!newEntry.level || !newEntry.progress) {
      Alert.alert('Error', 'Por favor completa el nivel y el progreso');
      return;
    }

    try {
      const entry: StudyEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('es-ES'),
        level: newEntry.level,
        progress: newEntry.progress,
        notes: newEntry.notes,
        timestamp: new Date().toISOString()
      };

      const updatedEntries = [entry, ...studyEntries];
      setStudyEntries(updatedEntries);
      await AsyncStorage.setItem('studyEntries', JSON.stringify(updatedEntries));

      setNewEntry({
        level: '',
        progress: '',
        notes: ''
      });

      Alert.alert('¡Guardado!', 'Tu entrada de estudio ha sido guardada correctamente');
    } catch (error) {
      console.error('Error guardando entrada:', error);
      Alert.alert('Error', 'No se pudo guardar la entrada');
    }
  };

  const deleteStudyEntry = async (id: string) => {
    try {
      const updatedEntries = studyEntries.filter(entry => entry.id !== id);
      setStudyEntries(updatedEntries);
      await AsyncStorage.setItem('studyEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Error eliminando entrada:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await userStorage.logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-circle-outline" size={64} color="#666" />
        <Text style={styles.errorText}>No se encontró información del usuario</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.errorButtonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#388E3C']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
            <Text style={styles.userName}>{getFullName(user)}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userSince}>
              Miembro desde {formatDate(user.createdAt)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Mensaje de bienvenida */}
        <View style={styles.section}>
          <View style={styles.welcomeContainer}>
            <Ionicons name="heart" size={32} color="#E91E63" />
            <Text style={styles.welcomeTitle}>¡Gracias por estar con nosotros!</Text>
            <Text style={styles.welcomeSubtitle}>Bienvenido a tu academia</Text>
            <Text style={styles.welcomeMessage}>
              Estamos encantados de acompañarte en tu viaje de aprendizaje del español.
              Aquí podrás llevar un registro de tu progreso y continuar avanzando en tu dominio del idioma.
            </Text>
          </View>
        </View>

        {/* Agenda de estudios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Agenda de Estudios</Text>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Añadir nueva entrada</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nivel estudiado:</Text>
              <TouchableOpacity
                style={styles.levelSelector}
                onPress={() => {
                  Alert.alert(
                    'Seleccionar Nivel',
                    '¿Qué nivel estudiaste hoy?',
                    [
                      { text: 'A1', onPress: () => setNewEntry(prev => ({ ...prev, level: 'A1' })) },
                      { text: 'A2', onPress: () => setNewEntry(prev => ({ ...prev, level: 'A2' })) },
                      { text: 'B1', onPress: () => setNewEntry(prev => ({ ...prev, level: 'B1' })) },
                      { text: 'B2', onPress: () => setNewEntry(prev => ({ ...prev, level: 'B2' })) },
                    ]
                  );
                }}
              >
                <Text style={styles.levelText}>
                  {newEntry.level || 'Seleccionar nivel'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>¿Dónde llegaste?</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Unidad 5, Lección 3, Tema: Presente simple..."
                value={newEntry.progress}
                onChangeText={(text) => setNewEntry(prev => ({ ...prev, progress: text }))}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notas adicionales (opcional):</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Me costó el subjuntivo, necesito repasar..."
                value={newEntry.notes}
                onChangeText={(text) => setNewEntry(prev => ({ ...prev, notes: text }))}
                multiline
                numberOfLines={2}
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveStudyEntry}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Guardar Entrada</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Historial de estudios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Historial de Estudios</Text>

          {studyEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="school-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Aún no tienes entradas de estudio</Text>
              <Text style={styles.emptySubtext}>¡Empieza a registrar tu progreso!</Text>
            </View>
          ) : (
            <View style={styles.entriesContainer}>
              {studyEntries.map((entry) => (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>{entry.date}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => {
                        Alert.alert(
                          'Eliminar entrada',
                          '¿Estás seguro de que quieres eliminar esta entrada?',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Eliminar', style: 'destructive', onPress: () => deleteStudyEntry(entry.id) }
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#f44336" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.entryContent}>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelBadgeText}>{entry.level}</Text>
                    </View>
                    <Text style={styles.entryProgress}>{entry.progress}</Text>
                    {entry.notes && (
                      <Text style={styles.entryNotes}>{entry.notes}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Acciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Acciones</Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#f44336' }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Cerrar Sesión</Text>
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
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
  userInfo: {
    flex: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  userSince: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
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
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    marginTop: 10,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  levelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  levelText: {
    fontSize: 16,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  entriesContainer: {
    gap: 12,
  },
  entryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  deleteButton: {
    padding: 4,
  },
  entryContent: {
    gap: 8,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  entryProgress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },
  entryNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});
