import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function PreFormacionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ refresh?: string }>();
  const [cargando, setCargando] = useState(true);
  const [tieneAcceso, setTieneAcceso] = useState(false);

  // Verificar si el usuario ya pagó por el acceso
  useEffect(() => {
    const verificarAcceso = async () => {
      try {
        console.log('🔍 Verificando acceso a formación profesional...');
        const accesoGuardado = await AsyncStorage.getItem('@acceso_formacion_profesional');
        console.log('📦 Datos de acceso encontrados:', accesoGuardado);

        if (accesoGuardado) {
          const accesoData = JSON.parse(accesoGuardado);
          console.log('📋 Datos parseados:', accesoData);

          const { tieneAcceso, expira } = accesoData;
          const fechaExpiracion = new Date(expira);
          const ahora = new Date();

          console.log('⏰ Fecha expiración:', fechaExpiracion);
          console.log('🕐 Fecha actual:', ahora);
          console.log('✅ Tiene acceso:', tieneAcceso);
          console.log('⏳ No expirado:', fechaExpiracion > ahora);

          if (tieneAcceso && fechaExpiracion > ahora) {
            console.log('🎉 Acceso válido - mostrando cursos');
            setTieneAcceso(true);
          } else {
            console.log('❌ Acceso inválido o expirado');
            setTieneAcceso(false);
          }
        } else {
          console.log('🚫 No hay datos de acceso guardados');
          setTieneAcceso(false);
        }
      } catch (error) {
        console.error('❌ Error al verificar acceso:', error);
        Alert.alert('Error', 'No se pudo verificar el acceso. Por favor, inténtalo de nuevo.');
        setTieneAcceso(false);
      } finally {
        setCargando(false);
      }
    };

    verificarAcceso();
  }, [params.refresh]); // Agregar params.refresh como dependencia para recargar cuando llegue desde pago

  const manejarAccesoCurso = (screen: string) => {
    if (!tieneAcceso) {
      Alert.alert(
        'Acceso Requerido',
        'Para acceder a los cursos de formación profesional, es necesario realizar un pago único de 0,50€.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Pagar', onPress: () => router.push({
            pathname: '/(tabs)/FormularioDatosPersonales',
            params: { tipo: 'formacion-profesional' }
          }) }
        ]
      );
    } else {
      router.push(screen);
    }
  };

  const cursos = [
    {
      key: 'CuidadoMayores',
      label: 'Cuidado de Personas Mayores',
      labelAr: 'رعاية المسنين',
      screen: '/(tabs)/CursoCuidadoMayoresScreen',
      icon: 'people' as any,
      color: '#9C27B0'
    },
    {
      key: 'ManipulacionAlimentos',
      label: 'Manipulación de Alimentos',
      labelAr: 'تداول الأغذية',
      screen: '/(tabs)/CursoManipulacionAlimentosScreen',
      icon: 'restaurant' as any,
      color: '#E91E63'
    },
    {
      key: 'Jardineria',
      label: 'Jardinería y Paisajismo',
      labelAr: 'الحدائق وتنسيقها',
      screen: '/(tabs)/CursoJardineriaScreen',
      icon: 'leaf' as any,
      color: '#4CAF50'
    },
    {
      key: 'Fontanero',
      label: 'Fontanero',
      labelAr: 'سباك',
      screen: '/(tabs)/CursoFontaneroScreen',
      icon: 'water' as any,
      color: '#2196F3'
    },
    {
      key: 'Electricidad',
      label: 'Electricidad',
      labelAr: 'كهرباء',
      screen: '/(tabs)/CursoElectricidadScreen',
      icon: 'flash' as any,
      color: '#FF9800'
    },
    {
      key: 'Cocina',
      label: 'Ayudante de Cocina',
      labelAr: 'مساعد مطبخ',
      screen: '/(tabs)/CursoCocinaScreen',
      icon: 'restaurant' as any,
      color: '#E91E63'
    },
    {
      key: 'Limpieza',
      label: 'Limpieza',
      labelAr: 'تنظيف',
      screen: '/(tabs)/CursoLimpiezaScreen',
      icon: 'sparkles' as any,
      color: '#4CAF50'
    },
    {
      key: 'Carpinteria',
      label: 'Carpintería',
      labelAr: 'نجارة',
      screen: '/(tabs)/CursoCarpinteriaScreen',
      icon: 'hammer' as any,
      color: '#795548'
    },
    {
      key: 'Albañileria',
      label: 'Albañilería',
      labelAr: 'بناء',
      screen: '/(tabs)/CursoAlbanileriaScreen',
      icon: 'construct' as any,
      color: '#607D8B'
    },
    {
      key: 'Word',
      label: 'Microsoft Word',
      labelAr: 'مايكروسوفت وورد',
      screen: '/(tabs)/CursoWordScreen',
      icon: 'document-text' as any,
      color: '#2B579A'
    },
    {
      key: 'Excel',
      label: 'Microsoft Excel',
      labelAr: 'مايكروسوفت إكسل',
      screen: '/(tabs)/CursoExcelScreen',
      icon: 'grid' as any,
      color: '#217346'
    },
    {
      key: 'Comercio',
      label: 'Comercio y Atención',
      labelAr: 'تجارة وخدمة عملاء',
      screen: '/(tabs)/CursoComercioScreen',
      icon: 'cart' as any,
      color: '#9C27B0'
    },
    {
      key: 'Informatica',
      label: 'Informática Básica',
      labelAr: 'حاسوب',
      screen: '/(tabs)/CursoInformaticaScreen',
      icon: 'laptop' as any,
      color: '#00BCD4'
    },
    {
      key: 'Almacen',
      label: 'Almacén',
      labelAr: 'مستودع',
      screen: '/(tabs)/CursoAlmacenScreen',
      icon: 'cube' as any,
      color: '#FF5722'
    },
    {
      key: 'Agricultura',
      label: 'Agricultura',
      labelAr: 'زراعة',
      screen: '/(tabs)/CursoAgriculturaScreen',
      icon: 'leaf' as any,
      color: '#8BC34A'
    },
  ];

  if (cargando) {
    return (
      <View style={styles.contenedorCarga}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.textoCarga}>Cargando cursos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <LinearGradient colors={['#1976D2', '#1565C0']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              // Intentar volver atrás, si no hay pantalla a la que volver, ir al inicio
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/home');
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {tieneAcceso ? 'Formación Profesional' : 'Acceso a Formación Profesional'}
            </Text>
            <Text style={styles.headerSubtitle}>Cursos de Formación Profesional</Text>
            <Text style={styles.headerSubtitleAr}>دورات التدريب المهني</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {!tieneAcceso && (
            <View style={styles.tarjetaAcceso}>
              <Ionicons name="lock-closed" size={40} color="#f39c12" style={styles.iconoBloqueo} />
              <Text style={styles.tituloAcceso}>Acceso Restringido</Text>
              <Text style={styles.textoAcceso}>
                Desbloquea el acceso completo a todos los cursos de formación profesional por solo 10,00€.
                Contenido exclusivo disponible.
              </Text>
              <TouchableOpacity
                style={styles.botonDesbloquear}
                onPress={() => router.push({
                  pathname: '/(tabs)/FormularioDatosPersonales',
                  params: { tipo: 'formacion-profesional' }
                })}
              >
                <Ionicons name="lock-open" size={20} color="#fff" />
                <Text style={styles.textoBotonDesbloquear}>Desbloquear por 10,00€</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.coursesGrid}>
            {cursos.map((curso) => (
              <View key={curso.key} style={styles.courseCardContainer}>
                <TouchableOpacity
                  style={styles.courseCard}
                  onPress={() => manejarAccesoCurso(curso.screen as any)}
                  disabled={!tieneAcceso}
                >
                  <LinearGradient
                    colors={[curso.color, `${curso.color}CC`]}
                    style={styles.courseGradient}
                  >
                    <View style={styles.courseIcon}>
                      <Ionicons name={curso.icon} size={32} color="#fff" />
                    </View>
                    <Text style={styles.courseTitle}>{curso.label}</Text>
                    <Text style={styles.courseTitleAr}>{curso.labelAr}</Text>
                    <View style={styles.courseArrow}>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
                {!tieneAcceso && (
                  <View style={styles.lockOverlay}>
                    <Ionicons name="lock-closed" size={32} color="#fff" />
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#1976D2" />
            <Text style={styles.infoText}>
              Estos cursos están diseñados para ayudarte a prepararte para el mercado laboral español.
              Cada curso incluye vocabulario específico y conocimientos prácticos.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contenedorCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCarga: {
    marginTop: 10,
    color: '#666',
  },

  // Header styles
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  headerSubtitleAr: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },

  // Content styles
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    width: '100%',
    overflow: 'scroll',
  },
  content: {
    padding: 8,
    width: '100%',
  },

  // Access card styles
  tarjetaAcceso: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconoBloqueo: {
    marginBottom: 15,
  },
  tituloAcceso: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  textoAcceso: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  botonDesbloquear: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  textoBotonDesbloquear: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Course grid and cards
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 30,
    width: '100%',
  },
  courseCardContainer: {
    position: 'relative',
    width: '48%', // Slightly less than half to account for spacing
    marginBottom: 16,
    borderRadius: 15,
    overflow: 'hidden',
    aspectRatio: 0.9, // Maintain aspect ratio for all cards
  },
  courseCard: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  lockOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    zIndex: 1,
  },
  courseGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
    position: 'relative',
  },
  courseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  courseTitleAr: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Arial',
  },
  courseArrow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Info card styles
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
