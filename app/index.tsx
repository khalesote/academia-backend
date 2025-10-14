import React, { useRef, useEffect, useState } from 'react';
import { Video, ResizeMode } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated, PanResponder, View as RNView, StyleSheet as RNStyleSheet, Platform } from 'react-native';
// REMOVED: import LottieView from 'lottie-react-native'; // Not used in this component
import { userDB, userStorage, User, UserProgress, getFullName } from '../utils/userDatabase';
import { initializeB1Progress, syncA1A2FromLegacy } from '../utils/unitProgress';
import { testAsyncStorage } from '../utils/asyncStorageTest';

// Variables de texto
const TITLE_ES = "Academia de Inmigrantes";
const AUTHOR_ES = "Antonio de Nebrija";
const AUTHOR_AR = "أنطونيو دي نبريخا";

import {
  Text,
  Linking,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
  Image,
  ImageBackground,
  ActivityIndicator,
  Dimensions
} from "react-native";

import MaskedView from '@react-native-masked-view/masked-view';
import { useRouter } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';

import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function HomeScreenContent() {
  const videoRef = useRef<any>(null);
  // Ticker de frases de propaganda (scroll automático y ligero)
  const promoTickerRef = useRef<ScrollView>(null);
  const promoScrollPosRef = useRef<number>(0);
  const [promoContentWidth, setPromoContentWidth] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Función para ejecutar la acción del menú
  const handleMenuPress = async (originalAction: () => void) => {
    originalAction();
  }

  const [showStarVideo, setShowStarVideo] = useState(false);
  const [showFoneticaModal, setShowFoneticaModal] = useState(false);

  const router = useRouter();
  
  // Auto-scroll continuo de frases (ticker). Español y su traducción al árabe por separado.
  const promoPhrasesEs = [
    '🔥 OFERTÓN inauguración de la Academia: matrículate en nuestros cursos y obtén tu diploma por solo 20€',
    '🎓 Aprende español paso a paso',
    '📚 Recursos y Biblioteca Digital',
    '🎯 Progreso por niveles A1 → A2 → B1 → B2',
    '📝 Exámenes finales y diplomas',
    '💡 Curso de preformación: Aprende lenguaje y herramientas en árabe - ¡Solo 10€!',
  ];
  const promoPhrasesAr = [
    '🔥 عرض افتتاح الأكاديمية: سجّل في دوراتنا واحصل على شهادتك مقابل 20€ فقط',
    '🎓 تعلّم الإسبانية خطوة بخطوة',
    '📚 موارد ومكتبة رقمية',
    '🎯 التقدّم حسب المستويات A1 → A2 → B1 → B2',
    '📝 امتحانات نهائية وشهادات',
    '💡 دورة تدريبية: تعلم اللغة والأدوات بالعربية - فقط 10 يورو!',
  ];
  const promoPhrases = [...promoPhrasesEs, ...promoPhrasesAr];

  useEffect(() => {
    const stepPx = 1; // velocidad del ticker (px por frame)
    const intervalMs = 16; // ~60fps
    const timer = setInterval(() => {
      if (!promoTickerRef.current || promoContentWidth <= 0) return;
      promoScrollPosRef.current += stepPx;
      // Reiniciar cuando hemos recorrido la mitad (porque duplicamos el contenido)
      const loopWidth = promoContentWidth / 2;
      if (promoScrollPosRef.current >= loopWidth) {
        promoScrollPosRef.current = 0;
      }
      promoTickerRef.current.scrollTo({ x: promoScrollPosRef.current, animated: false });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [promoContentWidth]);

  // Inicializar progreso unificado y sincronizar claves legacy (una vez al arrancar)
  useEffect(() => {
    (async () => {
      try {
        // Test AsyncStorage first
        console.log('🚀 Iniciando test de AsyncStorage...');
        const asyncStorageWorking = await testAsyncStorage();
        if (!asyncStorageWorking) {
          console.error('❌ AsyncStorage no está funcionando correctamente');
          // You could show an alert or handle this error
        } else {
          console.log('✅ AsyncStorage funcionando correctamente');
        }
        
        await initializeB1Progress();
        await syncA1A2FromLegacy();
      } catch (e) {
        console.warn('No se pudo inicializar/sincronizar progreso:', e);
      }
    })();
  }, []);

  // Cargar usuario actual y verificar permisos de administrador
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await userStorage.getCurrentUser();
        setCurrentUser(user);

        // Verificar si el usuario es el administrador específico
        if (user?.email) {
          const adminStatus = user.email === 'admin@academiadeinmigrantes.es';
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error('Error cargando usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header Dashboard */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>¡Bienvenido!</Text>
            <Text style={styles.welcomeTextAr}>مرحباً!</Text>
          </View>
          <View style={styles.profileSection}>
            {currentUser && (
              <TouchableOpacity
                style={styles.profileDisplay}
                onPress={() => router.push("/UserProfileScreen")}
              >
                <Ionicons name="person-circle" size={20} color="#007AFF" />
                <Text style={styles.userNameText}>{getFullName(currentUser)}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Ticker de frases (auto-scroll, compacto) */}
        <View style={styles.tickerSection}>
          <ScrollView
            ref={promoTickerRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            onContentSizeChange={(w) => setPromoContentWidth(w)}
          >
            {/* Duplicamos el contenido para que el bucle sea suave */}
            <View style={styles.tickerInner}>
              {promoPhrases.map((p, idx) => {
                const isArabic = idx >= promoPhrasesEs.length;
                const isOffer = idx === 0 || idx === promoPhrasesEs.length; // OFERTÓN ES y AR
                return (
                  <TouchableOpacity
                    key={`t1-${idx}`}
                    onPress={() => {
                      // Enlaces rápidos opcionales según la frase (aplican a ES y AR)
                      if (p.includes('A1')) router.push('/(tabs)/A1_Acceso');
                      else if (p.includes('B2')) router.push('/(tabs)/B2_Avanzado');
                    }}
                  >
                    <Text style={[
                      styles.tickerText,
                      isArabic && styles.tickerTextAr,
                      isOffer && styles.tickerTextBold,
                    ]}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
              {promoPhrases.map((p, idx) => {
                const isArabic = idx >= promoPhrasesEs.length;
                const isOffer = idx === 0 || idx === promoPhrasesEs.length;
                return (
                  <TouchableOpacity
                    key={`t2-${idx}`}
                    onPress={() => {
                      if (p.includes('A1')) router.push('/(tabs)/A1_Acceso');
                      else if (p.includes('B2')) router.push('/(tabs)/B2_Avanzado');
                    }}
                  >
                    <Text style={[
                      styles.tickerText,
                      isArabic && styles.tickerTextAr,
                      isOffer && styles.tickerTextBold,
                    ]}>{p}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Mostrar loading mientras se carga el usuario */}
      {loading ? (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
          <ActivityIndicator size="large" color="#9DC3AA" />
          <Text style={{ marginTop: 16, color: '#666' }}>Cargando...</Text>
        </View>
      ) : (
        <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo Principal */}
        <View style={styles.mainLogoContainer}>
          <Image
            source={require('./assets/logo.jpg')}
            style={styles.mainLogo}
            resizeMode="contain"
          />
          <Text style={styles.arabicText}>
            مدرستك لتعلم الإسبانية. نساعدك على تعلم اللغة الإسبانية والاندماج في المجتمع الإسباني والحصول على شهادة من أكاديميتنا
          </Text>
        </View>

        

        {/* Widget de Usuarios */}
        <View style={styles.progressWidget}>
          <View style={styles.widgetHeader}>
            <Ionicons name="people" size={20} color="#007AFF" />
            <Text style={styles.widgetTitle}>
              {currentUser ? 'Mi Progreso' : 'Usuarios'}
            </Text>
          </View>
          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentUser ? currentUser.progress?.nivelActual || 'A1' : '000'}
              </Text>
              <Text style={styles.statLabel}>
                {currentUser ? 'Nivel Actual' : 'Registrados'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentUser ? currentUser.progress?.puntuacionTotal || 0 : '000'}
              </Text>
              <Text style={styles.statLabel}>
                {currentUser ? 'Puntuación' : 'Activos'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentUser ? currentUser.progress?.unidadesCompletadas || 0 : '000'}
              </Text>
              <Text style={styles.statLabel}>
                {currentUser ? 'Unidades' : 'Nuevos'}
              </Text>
            </View>
          </View>
        </View>

        {/* Video de Presentación */}

        <View style={styles.videoWidget}>
          <View style={styles.widgetHeader}>
            <Ionicons name="play-circle" size={20} color="#FF6B6B" />
            <View style={styles.titleContainer}>
              <Text style={styles.widgetTitle}>Presentación</Text>
              <Text style={styles.widgetTitleAr}>عرض تقديمي</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.presentationButton}
            onPress={() => router.push("/VideoPresentationScreen")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#9DC3AA', '#79A890']}
              style={styles.presentationButtonGradient}
            >
              <Ionicons name="play-circle" size={48} color="#fff" />
              <Text style={styles.presentationButtonText}>Ver Presentación</Text>
              <Text style={styles.presentationButtonTextAr}>شاهد العرض التقديمي</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Escuela Virtual - Botón Principal */}
        <View style={styles.mainSchoolSection}>
          <TouchableOpacity
            style={styles.mainSchoolButton}
            onPress={() => handleMenuPress(() => router.replace("/SchoolScreen"))}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#9DC3AA', '#79A890']}
              style={styles.mainSchoolButtonGradient}
            >
              <View style={styles.mainSchoolContent}>
                <View style={styles.mainSchoolIconContainer}>
                  <Ionicons name="school" size={48} color="#fff" />
                </View>
                <View style={styles.mainSchoolTextContainer}>
                  <Text style={styles.mainSchoolTitle}>Tu Escuela Virtual de Español</Text>
                  <Text style={styles.mainSchoolTitleAr}>مدرستك الافتراضية للإسبانية</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Formación Profesional - Botón Principal */}
        <View style={[styles.mainSchoolSection, {marginTop: 10}]}>
          <TouchableOpacity
            style={styles.mainSchoolButton}
            onPress={() => handleMenuPress(() => router.push("/PreFormacionScreen"))}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#9DC3AA', '#79A890']}
              style={styles.mainSchoolButtonGradient}
            >
              <View style={styles.mainSchoolContent}>
                <View style={styles.mainSchoolIconContainer}>
                  <Ionicons name="briefcase" size={40} color="#fff" />
                </View>
                <View style={styles.mainSchoolTextContainer}>
                  <Text style={[styles.mainSchoolTitle, {marginTop: 30}]}>Tu Centro de Preformación</Text>
                  <Text style={styles.mainSchoolTitleAr}>مركزك للتدريب المسبق</Text>
                  <Text style={[styles.mainSchoolSubtitle, {color: '#F0F0F0'}]}>Cursos profesionales</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Categorías Principales */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categorías Principales</Text>

          <View style={styles.categoriesGrid}>
            {/* Diccionario */}
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => handleMenuPress(() => router.push("/DiccionarioScreen"))}
            >
              <LinearGradient
                colors={['#9DC3AA', '#79A890']}
                style={styles.categoryGradient}
              >
                <Ionicons name="book" size={32} color="#fff" />
                                 <Text style={styles.categoryTitle}>Diccionario</Text>
                 <Text style={styles.categoryTitleAr}>قاموس</Text>
                 <Text style={styles.categorySubtitle}>Traducciones</Text>
                 <Text style={styles.categorySubtitleAr}>ترجمات</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Cultura */}
             <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => handleMenuPress(() => router.push("/CulturaGeneralScreen"))}
            >
               <LinearGradient
                colors={['#9DC3AA', '#79A890']}
                style={styles.categoryGradient}
              >
                <Ionicons name="globe" size={32} color="#fff" />
                                 <Text style={styles.categoryTitle}>Cultura</Text>
                 <Text style={styles.categoryTitleAr}>ثقافة</Text>
                 <Text style={styles.categorySubtitle}>España</Text>
                 <Text style={styles.categorySubtitleAr}>إسبانيا</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Biblioteca */}
             <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => handleMenuPress(() => router.push("/BibliotecaDigitalScreen"))}
            >
               <LinearGradient
                colors={['#9DC3AA', '#79A890']}
                style={styles.categoryGradient}
              >
                <Ionicons name="library" size={32} color="#fff" />
                                 <Text style={styles.categoryTitle}>Biblioteca</Text>
                 <Text style={styles.categoryTitleAr}>مكتبة</Text>
                 <Text style={styles.categorySubtitle}>Recursos</Text>
                 <Text style={styles.categorySubtitleAr}>موارد</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Noticias */}
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => handleMenuPress(() => router.push("/NoticiasInmigracionScreen"))}
            >
              <LinearGradient
                colors={['#9DC3AA', '#79A890']}
                style={styles.categoryGradient}
              >
                <Ionicons name="newspaper" size={32} color="#fff" />
                <Text style={styles.categoryTitle}>Noticias</Text>
                <Text style={styles.categoryTitleAr}>أخبار</Text>
                <Text style={styles.categorySubtitle}>Inmigración</Text>
                <Text style={styles.categorySubtitleAr}>هجرة</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Asesoría */}
             <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => handleMenuPress(() => router.push("/AsesoriaScreen"))}
            >
               <LinearGradient
                colors={['#9DC3AA', '#79A890']}
                style={styles.categoryGradient}
              >
                <Ionicons name="people" size={32} color="#fff" />
                                 <Text style={styles.categoryTitle}>Asesoría y Acompañamiento</Text>
                 <Text style={styles.categoryTitleAr}>استشارة ومرافقة</Text>
                 <Text style={styles.categorySubtitle}>Inmigración</Text>
                 <Text style={styles.categorySubtitleAr}>هجرة</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Agenda del Inmigrante */}
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => handleMenuPress(() => router.push("/AgendaScreen"))}
            >
              <LinearGradient
                colors={['#9DC3AA', '#79A890']}
                style={styles.categoryGradient}
              >
                <Ionicons name="calendar" size={32} color="#fff" />
                <Text style={styles.categoryTitle}>Agenda del Inmigrante</Text>
                <Text style={styles.categoryTitleAr}>دليل المهاجر</Text>
                <Text style={styles.categorySubtitle}>Guía práctica</Text>
                <Text style={styles.categorySubtitleAr}>دليل عملي</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Accesos Rápidos */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>

          <View style={styles.quickAccessGrid}>
            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => handleMenuPress(() => router.push("/CafeLiterarioScreen"))}
            >
              <View style={styles.quickAccessIcon}>
                <FontAwesome5 name="coffee" size={24} color="#fff" />
              </View>
                             <Text style={styles.quickAccessText}>Café Literario</Text>
               <Text style={styles.quickAccessTextAr}>مقهى أدبي</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => handleMenuPress(() => router.push("/NoticiasInmigracionScreen"))}
            >
              <View style={styles.quickAccessIcon}>
                <Ionicons name="newspaper" size={24} color="#fff" />
              </View>
                             <Text style={styles.quickAccessText}>Noticias</Text>
               <Text style={styles.quickAccessTextAr}>أخبار</Text>
            </TouchableOpacity>

            <TouchableOpacity
  style={styles.quickAccessItem}
  onPress={() => handleMenuPress(() => router.push("/AgendaScreen"))}
>
  <View style={styles.quickAccessIcon}>
    <Ionicons name="calendar" size={24} color="#fff" />
  </View>
  <Text style={styles.quickAccessText}>Agenda del Inmigrante</Text>
  <Text style={styles.quickAccessTextAr}>دليل المهاجر</Text>
</TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => handleMenuPress(() => router.push("/(tabs)/JuegosDeTareasScreen"))}
            >
              <View style={styles.quickAccessIcon}>
                <Ionicons name="game-controller" size={24} color="#fff" />
              </View>
                             <Text style={styles.quickAccessText}>Juegos</Text>
               <Text style={styles.quickAccessTextAr}>ألعاب</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => handleMenuPress(() => router.push("/PreFormacionScreen"))}
            >
              <View style={styles.quickAccessIcon}>
                <Ionicons name="school" size={24} color="#fff" />
              </View>
              <Text style={styles.quickAccessText}>Pre-formación SEPE</Text>
              <Text style={styles.quickAccessTextAr}>تدريب مهني</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessItem}
              onPress={() => handleMenuPress(() => router.push("/(tabs)/CuentosPopularesScreen"))}
            >
              <View style={styles.quickAccessIcon}>
                <Ionicons name="book" size={24} color="#fff" />
              </View>
              <Text style={styles.quickAccessText}>Cuentos Populares</Text>
              <Text style={styles.quickAccessTextAr}>قصص شعبية</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contacto */}
        <View style={styles.contactWidget}>
          <View style={styles.widgetHeader}>
            <Ionicons name="call" size={20} color="#4CAF50" />
            <Text style={styles.widgetTitle}>¿Necesitas Ayuda?</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactText}>
              Para contactarnos, por favor envíe un correo a: khalesito@yahoo.fr
              o llame al: +34 665 666 288
            </Text>
          </View>
        </View>
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  welcomeTextAr: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textAlign: 'right',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userNameText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 6,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  authButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 6,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 180,
    height: 90,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  mainLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingVertical: 5,
    marginTop: -20,
  },
  mainLogo: {
    width: '100%',
    height: 120,
    marginTop: 10,
    marginBottom: 10,
  },
  arabicText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'AlNile-Bold' : 'notoserif',
    fontWeight: 'bold',
    writingDirection: 'rtl',
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  // --- Promo ticker (texto compacto) ---
  tickerSection: {
    height: 36,
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  tickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  tickerText: {
    color: '#2c3e50',
    fontSize: 14,
    marginRight: 24,
  },
  tickerTextBold: {
    fontWeight: '800',
    color: '#1b5e20',
  },
  tickerTextAr: {
    writingDirection: 'rtl',
    textAlign: 'right',
    fontSize: 14,
    color: '#2c3e50',
    marginRight: 24,
  },
  progressWidget: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  widgetTitleAr: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
    writingDirection: 'rtl',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  videoWidget: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  videoContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  presentationVideo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  presentationButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  presentationButtonGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  presentationButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  presentationButtonTextAr: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (screenWidth - 60) / 2,
    height: 120,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoCard: {
    width: (screenWidth - 60) / 2,
    height: 120,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoFullCard: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  categoryGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  categoryTitleAr: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  categorySubtitleAr: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  mainSchoolSection: {
    marginBottom: 20,
  },
  mainSchoolButton: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  mainSchoolButtonGradient: {
    flex: 1,
    padding: 20,
  },
  mainSchoolContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainSchoolIconContainer: {
    justifyContent: 'center',
    marginTop: -55,
  },
  mainSchoolTextContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    justifyContent: 'center',
    marginTop: -55,
  },
  mainSchoolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 32,
  },
  mainSchoolTitleAr: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  mainSchoolSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  mainSchoolSubtitleAr: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    writingDirection: 'rtl',
  },
  quickAccessSection: {
    marginBottom: 20,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  quickAccessItem: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9DC3AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickAccessText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  quickAccessTextAr: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    writingDirection: 'rtl',
    marginTop: 2,
  },
  contactWidget: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contactButton: {
    backgroundColor: '#9DC3AA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactInfo: {
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  profileButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminButton: {
    marginLeft: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  adminButtonText: {
    color: '#FF9800',
  },
});

export default HomeScreenContent;

