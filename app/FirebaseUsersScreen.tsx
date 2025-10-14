import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getFirebaseUsersList, getFirebaseUsersStats } from '../utils/firebaseUsers';
import { checkFirebaseStatus } from '../utils/firebaseStatus';

interface FirebaseUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date | null;
  lastLogin: Date | null;
  progress?: {
    nivelActual: string;
    puntuacionTotal: number;
    unidadesCompletadas: number;
  };
}

export default function FirebaseUsersScreen() {
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Verificar estado de Firebase primero
      const firebaseStatus = await checkFirebaseStatus();

      if (!firebaseStatus.initialized) {
        Alert.alert(
          'Firebase No Disponible',
          'Firebase no está inicializado. Los usuarios aparecerán aquí cuando Firebase esté disponible.',
          [
            { text: 'Ver Diagnóstico', onPress: () => router.push('/FirebaseDiagnosticScreen') },
            { text: 'OK' }
          ]
        );
        setUsers([]);
        setStats(null);
        return;
      }

      const [usersList, usersStats] = await Promise.all([
        getFirebaseUsersList(),
        getFirebaseUsersStats()
      ]);
      setUsers(usersList);
      setStats(usersStats);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los datos de Firebase. ' + (error?.message || 'Error desconocido'),
        [
          { text: 'Ver Diagnóstico', onPress: () => router.push('/FirebaseDiagnosticScreen') },
          { text: 'Reintentar', onPress: loadData },
          { text: 'OK' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return '#FF9800';
      case 'admin': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1': return '#FF5722';
      case 'A2': return '#FF9800';
      case 'B1': return '#2196F3';
      case 'B2': return '#4CAF50';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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

          <View style={styles.headerInfo}>
            <Ionicons name="people" size={32} color="#fff" />
            <Text style={styles.headerTitle}>Usuarios Firebase</Text>
            <Text style={styles.headerSubtitle}>Panel administrativo</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Estadísticas generales */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Estadísticas Generales</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalUsers}</Text>
                <Text style={styles.statLabel}>Total Usuarios</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.activeUsers}</Text>
                <Text style={styles.statLabel}>Activos (7 días)</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.newUsersThisMonth}</Text>
                <Text style={styles.statLabel}>Nuevos (30 días)</Text>
              </View>
            </View>
          </View>
        )}

        {/* Estadísticas por nivel */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Usuarios por Nivel</Text>

            <View style={styles.levelStatsGrid}>
              {Object.entries(stats.usersByLevel).map(([level, count]) => (
                <View key={level} style={styles.levelStatCard}>
                  <View style={[styles.levelIndicator, { backgroundColor: getLevelColor(level) }]} />
                  <Text style={styles.levelName}>{level}</Text>
                  <Text style={styles.levelCount}>{count as number}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Lista de usuarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Lista de Usuarios</Text>

          {users.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No hay usuarios registrados</Text>
              <Text style={styles.emptySubtext}>Los usuarios aparecerán aquí cuando se registren</Text>
            </View>
          ) : (
            <View style={styles.usersList}>
              {users.map((user) => (
                <View key={user.uid} style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>

                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
                      <Text style={styles.roleText}>{user.role}</Text>
                    </View>
                  </View>

                  <View style={styles.userDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        Registrado: {formatDate(user.createdAt)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        Último acceso: {formatDate(user.lastLogin)}
                      </Text>
                    </View>

                    {user.progress && (
                      <>
                        <View style={styles.detailRow}>
                          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(user.progress.nivelActual) }]}>
                            <Text style={styles.levelBadgeText}>{user.progress.nivelActual}</Text>
                          </View>
                          <Text style={styles.detailText}>
                            Nivel actual
                          </Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Ionicons name="star" size={16} color="#FFC107" />
                          <Text style={styles.detailText}>
                            Puntuación: {user.progress.puntuacionTotal}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Información adicional */}
        <View style={styles.section}>
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <Text style={styles.infoTitle}>Información</Text>
            <Text style={styles.infoText}>
              Los usuarios aparecen aquí automáticamente cuando se registran en la aplicación.
              Los datos se sincronizan con Firebase en tiempo real.
            </Text>

            <TouchableOpacity
              style={styles.diagnosticButton}
              onPress={() => router.push('/FirebaseDiagnosticScreen')}
            >
              <Ionicons name="medical" size={20} color="#fff" />
              <Text style={styles.diagnosticButtonText}>Ver Diagnóstico Firebase</Text>
            </TouchableOpacity>
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
  headerInfo: {
    flex: 1,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  levelStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  levelStatCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    margin: 4,
    minWidth: 80,
  },
  levelIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  levelName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  usersList: {
    gap: 12,
  },
  userCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  userDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  levelBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
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
  infoContainer: {
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 8,
  },
  diagnosticButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  diagnosticButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
