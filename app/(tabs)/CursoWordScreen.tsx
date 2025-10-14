import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CursoWordScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <LinearGradient
        colors={['#2B579A', '#1E3A8A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/PreFormacionScreen")}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Curso de Microsoft Word</Text>
            <Text style={styles.headerTitleAr}>دورة مايكروسوفت وورد</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>📌 ¿Qué aprenderás? / ما الذي ستتعلمه؟</Text>
        <Text style={styles.textBlock}>
          <Text>• Fundamentos de Microsoft Word y su interfaz</Text>
          <Text style={styles.arabicText}>أساسيات برنامج مايكروسوفت وورد وواجهته</Text>
          
          <Text>\n• Creación y formato de documentos profesionales</Text>
          <Text style={styles.arabicText}>إنشاء وتنسيق المستندات المهنية</Text>
          
          <Text>\n• Trabajo con imágenes, tablas y gráficos</Text>
          <Text style={styles.arabicText}>العمل مع الصور والجداول والرسوم البيانية</Text>
          
          <Text>\n• Estilos, plantillas y automatizaciones</Text>
          <Text style={styles.arabicText}>الأنماط والقوالب والأتمتة</Text>
          
          <Text>\n• Herramientas de revisión y colaboración</Text>
          <Text style={styles.arabicText}>أدوات المراجعة والتعاون</Text>
        </Text>

        <Text style={styles.sectionTitle}>📚 Módulos del Curso / وحدات الدورة</Text>
        
        <Text style={styles.subsectionTitle}>MÓDULO 1: INTRODUCCIÓN A WORD / الوحدة 1: مقدمة في وورد</Text>
        <View style={styles.textBlock}>
          <Text style={styles.bulletPoint}>• Elementos principales de la interfaz:</Text>
          <Text style={styles.subBulletPoint}>- Cinta de opciones (Ribbon): Contiene todas las herramientas organizadas en pestañas</Text>
          <Text style={styles.subBulletPoint}>- Barra de herramientas de acceso rápido: Personalizable con tus herramientas más usadas</Text>
          <Text style={styles.subBulletPoint}>- Barra de título: Muestra el nombre del documento</Text>
          <Text style={styles.subBulletPoint}>- Regla: Para ajustar márgenes y sangrías</Text>
          <Text style={styles.subBulletPoint}>- Barra de estado: Muestra información del documento</Text>
          <Text style={styles.arabicText}>العناصر الرئيسية للواجهة: الشريط، شريط الأدوات السريع، شريط العنوان، المسطرة، شريط الحالة</Text>
          
          <Text style={styles.bulletPoint}>• Gestión de documentos:</Text>
          <Text style={styles.subBulletPoint}>- Nuevo: Crear un documento en blanco o desde plantilla</Text>
          <Text style={styles.subBulletPoint}>- Abrir: Documentos recientes o desde ubicación específica</Text>
          <Text style={styles.subBulletPoint}>- Guardar: Guardar cambios (Ctrl + G)</Text>
          <Text style={styles.subBulletPoint}>- Guardar como: Para crear una copia con otro nombre/formato</Text>
          <Text style={styles.subBulletPoint}>- Exportar: Guardar como PDF u otros formatos</Text>
          <Text style={styles.arabicText}>إدارة المستندات: جديد، فتح، حفظ، تصدير</Text>
          
          <Text style={styles.bulletPoint}>• Vistas de documento:</Text>
          <Text style={styles.subBulletPoint}>- Vista de lectura: Para leer documentos largos</Text>
          <Text style={styles.subBulletPoint}>- Vista de diseño de impresión: Ver cómo se imprimirá</Text>
          <Text style={styles.subBulletPoint}>- Vista web: Cómo se verá en navegador</Text>
          <Text style={styles.subBulletPoint}>- Vista esquema: Para documentos estructurados</Text>
          <Text style={styles.subBulletPoint}>- Borrador: Enfocarse solo en el texto</Text>
          <Text style={styles.arabicText}>عرض المستند: قراءة، طباعة، ويب، مسودة، هيكل</Text>
          
          <Text style={styles.bulletPoint}>• Herramientas básicas:</Text>
          <Text style={styles.subBulletPoint}>- Portapapeles: Cortar, copiar, pear, formato</Text>
          <Text style={styles.subBulletPoint}>- Fuente: Tipo, tamaño, color, efectos</Text>
          <Text style={styles.subBulletPoint}>- Párrafo: Alineación, interlineado, sangrías</Text>
          <Text style={styles.subBulletPoint}>- Estilos: Aplicar formatos predefinidos</Text>
          <Text style={styles.subBulletPoint}>- Buscar/Reemplazar: Localizar texto rápidamente</Text>
          <Text style={styles.arabicText}>أدوات أساسية: الحافظة، الخط، الفقرة، الأنماط، البحث والاستبدال</Text>
          
          <Text style={styles.bulletPoint}>• Navegación por el documento:</Text>
          <Text style={styles.subBulletPoint}>- Panel de navegación: Ver encabezados y páginas</Text>
          <Text style={styles.subBulletPoint}>- Zoom: Acercar/alejar la vista</Text>
          <Text style={styles.subBulletPoint}>- Ventana: Trabajar con múltiples documentos</Text>
          <Text style={styles.subBulletPoint}>- Dividir: Ver dos partes del documento</Text>
          <Text style={styles.arabicText}>التنقل في المستند: لوحة التنقل، التكبير/التصغير، النوافذ، التقسيم</Text>
        </View>

        <Text style={styles.subsectionTitle}>MÓDULO 2: FORMATO DE TEXTO / الوحدة 2: تنسيق النص</Text>
        <Text style={styles.textBlock}>
          <Text>• Fuentes, tamaños y colores</Text>
          <Text style={styles.arabicText}>الخطوط، الأحجام، والألوان</Text>
          
          <Text>\n• Alineación y espaciado</Text>
          <Text style={styles.arabicText}>المحاذاة والتباعد</Text>
          
          <Text>\n• Viñetas y numeración</Text>
          <Text style={styles.arabicText}>التعداد النقطي والرقمي</Text>
          
          <Text>\n• Bordes y sombreado</Text>
          <Text style={styles.arabicText}>الحدود والتظليل</Text>
          
          <Text>\n• Copiar formato con el pincel</Text>
          <Text style={styles.arabicText}>نسخ التنسيق باستخدام الفرشاة</Text>
        </Text>

        <Text style={styles.subsectionTitle}>MÓDULO 3: DISEÑO DE PÁGINA / الوحدة 3: تخطيط الصفحة</Text>
        <Text style={styles.textBlock}>
          <Text>• Márgenes, orientación y tamaño</Text>
          <Text style={styles.arabicText}>هوامش الصفحة، الاتجاه، والحجم</Text>
          
          <Text>\n• Encabezados y pies de página</Text>
          <Text style={styles.arabicText}>رؤوس وتذييلات الصفحات</Text>
          
          <Text>\n• Saltos de página y sección</Text>
          <Text style={styles.arabicText}>فصل الصفحات والمقاطع</Text>
          
          <Text>\n• Columnas y saltos de texto</Text>
          <Text style={styles.arabicText}>الأعمدة وفواصل النص</Text>
          
          <Text>\n• Fondo de página y marcas de agua</Text>
          <Text style={styles.arabicText}>خلفية الصفحة والعلامات المائية</Text>
        </Text>

        <Text style={styles.subsectionTitle}>MÓDULO 4: TABLAS Y GRÁFICOS / الوحدة 4: الجداول والرسوم البيانية</Text>
        <Text style={styles.textBlock}>
          <Text>• Insertar y formatear tablas</Text>
          <Text style={styles.arabicText}>إدراج الجداول وتنسيقها</Text>
          
          <Text>\n• Fórmulas básicas en tablas</Text>
          <Text style={styles.arabicText}>الصيغ الأساسية في الجداول</Text>
          
          <Text>\n• Crear y modificar gráficos</Text>
          <Text style={styles.arabicText}>إنشاء وتعديل الرسوم البيانية</Text>
          
          <Text>\n• Organigramas y diagramas SmartArt</Text>
          <Text style={styles.arabicText}>المخططات التنظيمية والرسوم الذكية</Text>
        </Text>

        <Text style={styles.subsectionTitle}>MÓDULO 5: HERRAMIENTAS AVANZADAS / الوحدة 5: أدوات متقدمة</Text>
        <Text style={styles.textBlock}>
          <Text>• Estilos y temas</Text>
          <Text style={styles.arabicText}>الأنماط والسمات</Text>
          
          <Text>\n• Tabla de contenidos e índices</Text>
          <Text style={styles.arabicText}>جدول المحتويات والفهارس</Text>
          
          <Text>\n• Notas al pie y citas</Text>
          <Text style={styles.arabicText}>الحواشي السفلية والاقتباسات</Text>
          
          <Text>\n• Combinar correspondencia</Text>
          <Text style={styles.arabicText}>دمج المراسلات</Text>
          
          <Text>\n• Macros y automatizaciones</Text>
          <Text style={styles.arabicText}>وحدات الماكرو والأتمتة</Text>
        </Text>

        <Text style={styles.subsectionTitle}>MÓDULO 6: COLABORACIÓN Y REVISIÓN / الوحدة 6: التعاون والمراجعة</Text>
        <Text style={styles.textBlock}>
          <Text>• Control de cambios</Text>
          <Text style={styles.arabicText}>تتبع التغييرات</Text>
          
          <Text>\n• Comentarios y resaltado</Text>
          <Text style={styles.arabicText}>التعليقات والتظليل</Text>
          
          <Text>\n• Comparar y combinar documentos</Text>
          <Text style={styles.arabicText}>مقارنة ودمج المستندات</Text>
          
          <Text>\n• Proteger documentos</Text>
          <Text style={styles.arabicText}>حماية المستندات</Text>
          
          <Text>\n• Compartir en la nube</Text>
          <Text style={styles.arabicText}>المشاركة عبر السحابة</Text>
        </Text>

        <Text style={styles.sectionTitle}>💡 Beneficios del Curso / فوائد الدورة</Text>
        <Text style={styles.textBlock}>
          <Text>• Certificado de finalización</Text>
          <Text style={styles.arabicText}>شهادة إتمام الدورة</Text>
          
          <Text>\n• Material didáctico en español y árabe</Text>
          <Text style={styles.arabicText}>مواد تعليمية باللغتين الإسبانية والعربية</Text>
          
          <Text>\n• Ejercicios prácticos</Text>
          <Text style={styles.arabicText}>تمارين عملية</Text>
          
          <Text>\n• Acceso a plantillas profesionales</Text>
          <Text style={styles.arabicText}>الوصول إلى قوالب احترافية</Text>
          
          <Text>\n• Soporte durante el curso</Text>
          <Text style={styles.arabicText}>دعم فني خلال مدة الدورة</Text>
        </Text>

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'left',
  },
  headerTitleAr: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B579A',
    marginTop: 20,
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: '#F0F5FF',
    padding: 10,
    borderRadius: 8,
  },
  textBlock: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 10,
    textAlign: 'left',
  },
  arabicText: {
    writingDirection: 'rtl',
    textAlign: 'right',
    display: 'flex',
    marginBottom: 8,
    color: '#555',
    fontFamily: 'Arial',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    lineHeight: 24,
    fontWeight: '600',
  },
  subBulletPoint: {
    fontSize: 15,
    color: '#444',
    marginLeft: 20,
    marginBottom: 4,
    lineHeight: 22,
  },
  exampleText: {
    fontSize: 14,
    color: '#2B579A',
    backgroundColor: '#F0F5FF',
    padding: 10,
    borderRadius: 6,
    marginVertical: 8,
    fontStyle: 'italic',
    borderLeftWidth: 4,
    borderLeftColor: '#2B579A',
  },
  enrollButton: {
    backgroundColor: '#2B579A',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
