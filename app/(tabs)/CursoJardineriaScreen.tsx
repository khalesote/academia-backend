import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CursoJardineriaScreen() {
  const router = useRouter();

  const openVideo = (url: string) => {
    Linking.openURL(url).catch(err => console.error("No se pudo abrir el enlace", err));
  };

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(tabs)/PreFormacionScreen')}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Jardinería y Paisajismo</Text>
            <Text style={styles.headerTitleAr}>الحدائق وتنسيقها</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>📌 Certificado de Profesionalidad / شهادة الكفاءة المهنية</Text>
        <Text style={styles.textBlock}>
          Este curso está basado en el Certificado de Profesionalidad AGAO0108 de Actividades Auxiliares en Viveros, Jardines y Centros de Jardinería, según el catálogo del SEPE (Servicio Público de Empleo Estatal).
          {'\n\n'}
          <Text style={styles.arabicText}>
            يستند هذه الدورة إلى شهادة الكفاءة المهنية AGAO0108 للأنشطة المساعدة في المشاتل والحدائق ومراكز البستنة، وفقًا لكاتالوج SEPE (هيئة الخدمة العامة للتوظيف الحكومي).
          </Text>
        </Text>

        <Text style={styles.sectionTitle}>📚 Módulos del Curso / وحدات الدورة</Text>
        
        <Text style={styles.moduleTitle}>MÓDULO 1: Operaciones básicas en viveros y centros de jardinería / الوحدة 1: العمليات الأساسية في المشاتل ومراكز البستنة</Text>
        <Text style={styles.textBlock}>
          • Infraestructuras de viveros y centros de jardinería / بنية تحتية للمشاتل ومراكز البستنة
          • Preparación del medio de cultivo / تحضير وسط الزراعة
          • Producción de plantas / إنتاج النباتات
          • Manejo de plantas en viveros / التعامل مع النباتات في المشاتل
          • Comercialización de plantas / تسويق النباتات
          • Normativa básica vigente / اللوائح الأساسية السارية
        </Text>

        <Text style={styles.moduleTitle}>MÓDULO 2: Instalación de jardines, parques y zonas verdes / الوحدة 2: تركيب الحدائق والمتنزهات والمناطق الخضراء</Text>
        <Text style={styles.textBlock}>
          • Preparación del terreno / تجهيز التربة
          • Trabajات de replanteo / أعمال إعادة التخطيط
          • Construcción de infraestructuras / إنشاء البنية التحتية
          • Utilización de plantas ornamentales / استخدام النباتات الزينة
          • Establecimiento de elementos vegetales / إنشاء العناصر النباتية
          • Implantación de céspedes / زراعة المروج
        </Text>

        <Text style={styles.moduleTitle}>MÓDULO 3: Mantenimiento de jardines / الوحدة 3: صيانة الحدائق</Text>
        <Text style={styles.textBlock}>
          • Mantenimiento de elementos vegetales / صيانة العناصر النباتية
          • Control fitosanitario / المكافحة الصحية النباتية
          • Mantenimiento de infraestructuras / صيانة البنية التحتية
          • Normativa de mantenimiento / لوائح الصيانة
        </Text>

        <Text style={styles.moduleTitle}>MÓDULO 4: Prácticas profesionales / الوحدة 4: الممارسات المهنية</Text>
        <Text style={styles.textBlock}>
          • Actividades en viveros / أنشطة في المشاتل
          • Mantenimiento de jardines / صيانة الحدائق
          • Integración laboral / الاندماج المهني
        </Text>

        <Text style={styles.sectionTitle}>🎥 Videos Educativos / مقاطع فيديو تعليمية</Text>
        <View style={styles.videoContainer}>
          <TouchableOpacity 
            style={styles.videoButton}
            onPress={() => openVideo('https://www.youtube.com/watch?v=ejemplo1')}
          >
            <Ionicons name="play-circle" size={24} color="#4CAF50" />
            <Text style={styles.videoButtonText}>Introducción a la Jardinería / مقدمة في البستنة</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.videoButton}
            onPress={() => openVideo('https://www.youtube.com/watch?v=ejemplo2')}
          >
            <Ionicons name="play-circle" size={24} color="#4CAF50" />
            <Text style={styles.videoButtonText}>Técnicas de Poda / تقنيات التقليم</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.videoButton}
            onPress={() => openVideo('https://www.youtube.com/watch?v=ejemplo3')}>
            <Ionicons name="play-circle" size={24} color="#4CAF50" />
            <Text style={styles.videoButtonText}>Diseño de Jardines / تصميم الحدائق</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>📝 Actividades Prácticas / الأنشطة العملية</Text>
        <Text style={styles.textBlock}>
          • Diseña un pequeño jardín en un espacio de 4x4 metros. / صمم حديقة صغيرة في مساحة 4×4 أمتار.
          • Realiza un calendario de mantenimiento mensual. / أعد جدولاً شهرياً للصيانة.
          • Prepara una presentación sobre una planta ornamental. / أعد عرضاً تقديمياً عن نبات زينة.
          • Crea un semillero y registra su crecimiento. / أنشئ مشتلاً وسجل نموه.
        </Text>

        <Text style={styles.sectionTitle}>📌 Vocabulario Técnico / المصطلحات الفنية</Text>
        <View style={styles.vocabularyContainer}>
          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Poda / تقليم</Text>
            <Text style={styles.vocabularyTranslation}>التقليم</Text>
            <Text style={styles.vocabularyDefinition}>Corte de ramas para mantener la salud y forma de las plantas. / قطع الفروع للحفاظ على صحة النباتات وشكلها.</Text>
          </View>
          
          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Riego por goteo / ري بالتنقيط</Text>
            <Text style={styles.vocabularyTranslation}>الري بالتنقيط</Text>
            <Text style={styles.vocabularyDefinition}>Sistema de riego que suministra agua directamente a las raíces. / نظام ري يوفر الماء مباشرة إلى الجذور.</Text>
          </View>
          
          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Plaga / آفة</Text>
            <Text style={styles.vocabularyTranslation}>آفة زراعية</Text>
            <Text style={styles.vocabularyDefinition}>Organismos que dañan las plantas cultivadas. / كائنات حية تضر النباتات المزروعة.</Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Abono / سماد</Text>
            <Text style={styles.vocabularyTranslation}>سماد</Text>
            <Text style={styles.vocabularyDefinition}>Sustancia que mejora la calidad del suelo para el crecimiento de las plantas. / مادة تحسن نوعية التربة لنمو النباتات.</Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Semillero / مشتل</Text>
            <Text style={styles.vocabularyTranslation}>مشتل</Text>
            <Text style={styles.vocabularyDefinition}>Lugar donde se siembran las semillas para su germinación. / المكان الذي تُزرع فيه البذور للإنبات.</Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Césped / عشب</Text>
            <Text style={styles.vocabularyTranslation}>حشيش</Text>
            <Text style={styles.vocabularyDefinition}>Superficie cubierta de hierba que se mantiene cortada al ras. / سطح مغطى بالعشب يتم قصه بانتظام.</Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Maceta / أصيص</Text>
            <Text style={styles.vocabularyTranslation}>أصيص</Text>
            <Text style={styles.vocabularyDefinition}>Recipiente para cultivar plantas ornamentales. / وعاء لزراعة النباتات الزينة.</Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Tijeras de podar / مقص تقليم</Text>
            <Text style={styles.vocabularyTranslation}>مقص تقليم</Text>
            <Text style={styles.vocabularyDefinition}>Herramienta para cortar ramas y hojas de plantas. / أداة لقطع الفروع والأوراق من النباتات.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>🛠️ Herramientas y Productos de Jardinería / أدوات ومنتجات البستنة</Text>
        <View style={styles.vocabularyContainer}>
          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Tijeras de podar / مقص تقليم</Text>
            <Text style={styles.vocabularyDefinition}>
              Herramienta esencial para cortar ramas pequeñas y dar forma a las plantas. / أداة أساسية لقطع الفروع الصغيرة وتشكيل النباتات.
            </Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Pala de jardín / مجرفة الحديقة</Text>
            <Text style={styles.vocabularyDefinition}>
              Para cavar, mover tierra y trasplantar plantas. / للحفر ونقل التربة وزراعة النباتات.
            </Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Rastrillo / مِدَمَّاة</Text>
            <Text style={styles.vocabularyDefinition}>
              Para nivelar el suelo y recoger hojas secas. / لتسوية التربة وجمع الأوراق الجافة.
            </Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Manguera de riego / خرطوم الري</Text>
            <Text style={styles.vocabularyDefinition}>
              Para regar las plantas de manera eficiente. / لري النباتات بكفاءة.
            </Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Guantes de jardinería / قفازات البستنة</Text>
            <Text style={styles.vocabularyDefinition}>
              Protegen las manos durante el trabajo. / تحمي اليدين أثناء العمل.
            </Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Tijeras de césped / مقص العشب</Text>
            <Text style={styles.vocabularyDefinition}>
              Para recortar el césped en áreas pequeñas. / لتقليم العشب في المناطق الصغيرة.
            </Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Pulverizador / بخاخ</Text>
            <Text style={styles.vocabularyDefinition}>
              Para aplicar productos fitosanitarios. / لرش المنتجات الصحية النباتية.
            </Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Carretilla / عربة يدوية</Text>
            <Text style={styles.vocabularyDefinition}>
              Para transportar tierra, plantas o herramientas. / لنقل التربة أو النباتات أو الأدوات.
            </Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Sustrato para macetas / تربة الأصص</Text>
            <Text style={styles.vocabularyDefinition}>
              Tierra especial para el cultivo en macetas. / تربة خاصة للزراعة في الأصص.
            </Text>
          </View>

          <View style={styles.vocabularyCard}>
            <Text style={styles.vocabularyTerm}>Fertilizante orgánico / سماد عضوي</Text>
            <Text style={styles.vocabularyDefinition}>
              Nutrientes naturales para las plantas. / مغذيات طبيعية للنباتات.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerTitleAr: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'right',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 20,
    marginBottom: 15,
    backgroundColor: '#F1F8E9',
    padding: 10,
    borderRadius: 5,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginTop: 15,
    marginBottom: 8,
    paddingLeft: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  textBlock: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
    textAlign: 'justify',
  },
  videoContainer: {
    marginVertical: 10,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  videoButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  vocabularyContainer: {
    marginTop: 10,
  },
  vocabularyCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  vocabularyTerm: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  vocabularyTranslation: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginBottom: 8,
  },
  vocabularyDefinition: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  examButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    marginBottom: 20,
    elevation: 3,
  },
  examButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  arabicText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
