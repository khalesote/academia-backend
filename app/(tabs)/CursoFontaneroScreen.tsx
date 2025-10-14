import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CursoFontaneroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
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
            <Text style={styles.headerTitle}>Curso de Fontanería</Text>
            <Text style={styles.headerTitleAr}>دورة السباكة</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>📌 ¿Qué aprenderás?</Text>
        <Text style={styles.textBlock}>{`
1. Instalación y reparación de sistemas de tuberías.
2. Mantenimiento de sistemas de agua potable y saneamiento.
3. Reparación de grifos, sanitarios y electrodomésticos.
4. Instalación de calentadores de agua y sistemas de calefacción.
5. Seguridad en trabajos de fontanería y normativas.
6. Diagnóstico de problemas y soluciones prácticas.
7. Uso de herramientas especializadas y equipos de seguridad.
8. Gestión de materiales y presupuestos básicos.`}</Text>

        <Text style={styles.sectionTitle}>📚 Módulos del Curso:</Text>
        <Text style={styles.textBlock}>{`MÓDULO 1: FUNDAMENTOS DE LA FONTANERÍA
- Materiales y tipos de tuberías (PVC, cobre, PEX)
- Herramientas básicas y especializadas
- Normativas de seguridad y protección personal
- Conceptos de presión y caudal de agua

MÓDULO 2: SISTEMAS DE AGUA POTABLE
- Instalación de tuberías principales
- Conexiones y empalmes
- Válvulas de control y regulación
- Sistemas de filtración y purificación

MÓDULO 3: SISTEMAS DE SANEAMIENTO
- Instalación de desagües y bajantes
- Sistemas de ventilación
- Sifones y trampas de agua
- Conexión a la red municipal

MÓDULO 4: REPARACIONES BÁSICAS
- Reparación de grifos y mezcladores
- Cambio de juntas y empaquetaduras
- Reparación de fugas en tuberías
- Mantenimiento de sanitarios

MÓDULO 5: SISTEMAS DE AGUA CALIENTE
- Instalación de calentadores eléctricos
- Sistemas de calefacción por agua
- Termostatos y controles de temperatura
- Mantenimiento preventivo

MÓDULO 6: DIAGNÓSTICO Y SOLUCIÓN DE PROBLEMAS
- Identificación de problemas comunes
- Herramientas de diagnóstico
- Soluciones prácticas y efectivas
- Prevención de averías futuras`}</Text>

        <Text style={styles.sectionTitle}>🛠️ Herramientas Principales:</Text>
        <Text style={styles.textBlock}>{`HERRAMIENTAS BÁSICAS:
- Llave inglesa / مفتاح إنجليزي – Para apretar y aflojar tuercas
- Llave de tubo / مفتاح أنبوبي – Para tuberías de diferentes tamaños
- Alicates / كماشة – Para sujetar y cortar
- Destornilladores / مفكات – Para tornillos y conexiones
- Cortatubos / قاطع أنابيب – Para cortar tuberías de cobre

HERRAMIENTAS ESPECIALIZADAS:
- Soldador de cobre / لحام النحاس – Para unir tuberías de cobre
- Roscadora / آلة اللولبة – Para hacer roscas en tuberías
- Detector de fugas / كاشف التسرب – Para localizar escapes
- Manómetro / مقياس الضغط – Para medir presión de agua
- Cámara de inspección / كاميرا فحص – Para revisar tuberías`}</Text>

        <Text style={styles.sectionTitle}>🔧 Materiales y Tuberías:</Text>
        <Text style={styles.textBlock}>{`TIPOS DE TUBERÍAS:
- PVC / بلاستيك – Para desagües y saneamiento
- Cobre / نحاس – Para agua potable y calefacción
- PEX / بلاستيك مرن – Para instalaciones flexibles
- Hierro galvanizado / حديد مجلفن – Para instalaciones antiguas
- Polietileno / بولي إيثيلين – Para riego y usos especiales

CONEXIONES Y ACCESORIOS:
- Codos / زوايا – Para cambiar dirección
- Tees / وصلات T – Para derivaciones
- Reducciones / مخفضات – Para cambiar diámetro
- Válvulas / صمامات – Para control de flujo
- Grifos / صنابير – Para salida de agua`}</Text>

        <Text style={styles.sectionTitle}>🚰 Sistemas de Agua Potable:</Text>
        <Text style={styles.textBlock}>{`INSTALACIÓN PRINCIPAL:
- Contador de agua / عداد الماء – Medición de consumo
- Válvula de paso / صمام الإغلاق – Control principal
- Filtro principal / فلتر رئيسي – Purificación básica
- Reductor de presión / مخفض الضغط – Control de presión

DISTRIBUCIÓN INTERIOR:
- Tubería principal / أنبوب رئيسي – Distribución general
- Derivaciones / فروع – Conexión a habitaciones
- Válvulas de corte / صمامات قطع – Control por zonas
- Puntos de consumo / نقاط الاستهلاك – Grifos y sanitarios`}</Text>

        <Text style={styles.sectionTitle}>🚿 Reparación de Grifos:</Text>
        <Text style={styles.textBlock}>{`TIPOS DE GRIFOS:
- Grifo monomando / صنبور أحادي – Control con una palanca
- Grifo tradicional / صنبور تقليدي – Válvulas separadas
- Grifo termostático / صنبور حراري – Control de temperatura
- Grifo de cocina / صنبور المطبخ – Con manguera extensible

REPARACIONES COMUNES:
- Cambio de juntas / تغيير الحلقات – Para evitar fugas
- Limpieza de filtros / تنظيف الفلاتر – Para mejorar caudal
- Reparación de cartuchos / إصلاح الخراطيش – Para grifos modernos
- Ajuste de presión / ضبط الضغط – Para funcionamiento óptimo`}</Text>

        <Text style={styles.sectionTitle}>🚽 Sistemas de Saneamiento:</Text>
        <Text style={styles.textBlock}>{`COMPONENTES PRINCIPALES:
- Inodoro / مرحاض – Sanitario principal
- Desagüe / مصرف – Salida de aguas residuales
- Sifón / سيفون – Trampa de agua anti-olor
- Bajante / أنبوب تصريف – Tubería vertical de desagüe

INSTALACIÓN Y MANTENIMIENTO:
- Conexión al desagüe / توصيل بالمصرف
- Instalación de sifón / تركيب السيفون
- Limpieza de obstrucciones / تنظيف الانسدادات
- Reparación de fugas / إصلاح التسربات`}</Text>

        <Text style={styles.sectionTitle}>🔥 Sistemas de Agua Caliente:</Text>
        <Text style={styles.textBlock}>{`TIPOS DE CALENTADORES:
- Calentador eléctrico / سخان كهربائي – Instalación simple
- Calentador de gas / سخان غاز – Mayor eficiencia
- Calentador solar / سخان شمسي – Energía renovable
- Calentador instantáneo / سخان فوري – Sin depósito

INSTALACIÓN Y MANTENIMIENTO:
- Conexión eléctrica / توصيل كهربائي
- Conexión de agua / توصيل الماء
- Termostato / منظم الحرارة
- Válvula de seguridad / صمام الأمان
- Limpieza de depósito / تنظيف الخزان`}</Text>

        <Text style={styles.sectionTitle}>🔍 Diagnóstico de Problemas:</Text>
        <Text style={styles.textBlock}>{`PROBLEMAS COMUNES:
- Fugas de agua / تسرب الماء – Identificación y reparación
- Baja presión / ضغط منخفض – Causas y soluciones
- Agua caliente insuficiente / ماء ساخن غير كافي
- Obstrucciones / انسدادات – Limpieza y prevención
- Ruidos en tuberías / أصوات في الأنابيب

HERRAMIENTAS DE DIAGNÓSTICO:
- Detector de fugas / كاشف التسرب
- Manómetro / مقياس الضغط
- Cámara de inspección / كاميرا فحص
- Termómetro / مقياس حرارة
- Medidor de pH / مقياس الحموضة`}</Text>

        <Text style={styles.sectionTitle}>⚠️ Seguridad en Fontanería:</Text>
        <Text style={styles.textBlock}>{`PROTECCIÓN PERSONAL:
- Guantes de trabajo / قفازات عمل – Protección de manos
- Gafas de seguridad / نظارات أمان – Protección ocular
- Mascarilla / قناع – Para trabajos con productos químicos
- Botas de seguridad / أحذية أمان – Impermeables y antideslizantes

NORMAS DE SEGURIDAD:
- Cortar agua antes de trabajar / قطع الماء قبل العمل
- Ventilar espacios cerrados / تهوية الأماكن المغلقة
- Usar escaleras seguras / استخدام سلالم آمنة
- Almacenar herramientas correctamente / تخزين الأدوات بشكل صحيح
- Conocer primeros auxilios / معرفة الإسعافات الأولية`}</Text>

        <Text style={styles.sectionTitle}>📋 Mantenimiento Preventivo:</Text>
        <Text style={styles.textBlock}>{`REVISIONES PERIÓDICAS:
- Inspección de tuberías / فحص الأنابيب – Buscar fugas
- Limpieza de filtros / تنظيف الفلاتر – Mantener caudal
- Verificación de presión / التحقق من الضغط
- Revisión de calentadores / فحص السخانات

MANTENIMIENTO ANUAL:
- Limpieza de depósitos / تنظيف الخزانات
- Revisión de válvulas / فحص الصمامات
- Calibración de termostatos / معايرة منظمات الحرارة
- Actualización de juntas / تحديث الحلقات`}</Text>

        <Text style={styles.sectionTitle}>💰 Gestión de Materiales:</Text>
        <Text style={styles.textBlock}>{`PLANIFICACIÓN DE TRABAJOS:
- Inventario de materiales / جرد المواد
- Presupuesto de materiales / ميزانية المواد
- Selección de proveedores / اختيار الموردين
- Control de calidad / مراقبة الجودة

HERRAMIENTAS DE GESTIÓN:
- Lista de materiales / قائمة المواد
- Presupuesto detallado / ميزانية مفصلة
- Cronograma de trabajo / جدول زمني
- Control de costos / مراقبة التكاليف`}</Text>

        <Text style={styles.sectionTitleAr}>📌 ماذا ستتعلم؟</Text>
        <Text style={styles.textBlockAr}>{`
1. تركيب وإصلاح أنظمة الأنابيب.
2. صيانة أنظمة الماء الصالح للشرب والصرف الصحي.
3. إصلاح الصنابير والمراحيض والأجهزة المنزلية.
4. تركيب سخانات الماء وأنظمة التدفئة.
5. السلامة في أعمال السباكة واللوائح.
6. تشخيص المشاكل والحلول العملية.
7. استخدام الأدوات المتخصصة ومعدات السلامة.
8. إدارة المواد والميزانيات الأساسية.`}</Text>

        <Text style={styles.sectionTitleAr}>📚 وحدات الدورة:</Text>
        <Text style={styles.textBlockAr}>{`الوحدة الأولى: أساسيات السباكة
- المواد وأنواع الأنابيب (PVC، نحاس، PEX)
- الأدوات الأساسية والمتخصصة
- لوائح السلامة والحماية الشخصية
- مفاهيم الضغط وتدفق الماء

الوحدة الثانية: أنظمة الماء الصالح للشرب
- تركيب الأنابيب الرئيسية
- الوصلات والربط
- صمامات التحكم والتنظيم
- أنظمة التصفية والتنقية

الوحدة الثالثة: أنظمة الصرف الصحي
- تركيب المصارف والأنابيب الرأسية
- أنظمة التهوية
- السيفونات ومصائد الماء
- الاتصال بالشبكة البلدية

الوحدة الرابعة: الإصلاحات الأساسية
- إصلاح الصنابير والخلاطات
- تغيير الحلقات والطوابع
- إصلاح التسربات في الأنابيب
- صيانة المراحيض

الوحدة الخامسة: أنظمة الماء الساخن
- تركيب السخانات الكهربائية
- أنظمة التدفئة بالماء
- منظمات الحرارة وضوابط الحرارة
- الصيانة الوقائية

الوحدة السادسة: التشخيص وحل المشاكل
- تحديد المشاكل الشائعة
- أدوات التشخيص
- الحلول العملية والفعالة
- الوقاية من الأعطال المستقبلية`}</Text>

        <Text style={styles.sectionTitleAr}>🛠️ الأدوات الرئيسية:</Text>
        <Text style={styles.textBlockAr}>{`الأدوات الأساسية:
- مفتاح إنجليزي – لشد وفك الصواميل
- مفتاح أنبوبي – للأنابيب بأحجام مختلفة
- كماشة – للإمساك والقطع
- مفكات – للبراغي والوصلات
- قاطع أنابيب – لقطع أنابيب النحاس

الأدوات المتخصصة:
- لحام النحاس – لربط أنابيب النحاس
- آلة اللولبة – لعمل اللولبة في الأنابيب
- كاشف التسرب – لتحديد مكان التسربات
- مقياس الضغط – لقياس ضغط الماء
- كاميرا فحص – لفحص الأنابيب`}</Text>

        <Text style={styles.sectionTitleAr}>🔧 المواد والأنابيب:</Text>
        <Text style={styles.textBlockAr}>{`أنواع الأنابيب:
- بلاستيك PVC – للمصارف والصرف الصحي
- نحاس – للماء الصالح للشرب والتدفئة
- بلاستيك مرن PEX – للتركيبات المرنة
- حديد مجلفن – للتركيبات القديمة
- بولي إيثيلين – للري والاستخدامات الخاصة

الوصلات والملحقات:
- زوايا – لتغيير الاتجاه
- وصلات T – للفروع
- مخفضات – لتغيير القطر
- صمامات – للتحكم في التدفق
- صنابير – لخروج الماء`}</Text>

        <Text style={styles.sectionTitleAr}>🚰 أنظمة الماء الصالح للشرب:</Text>
        <Text style={styles.textBlockAr}>{`التركيب الرئيسي:
- عداد الماء – قياس الاستهلاك
- صمام الإغلاق – التحكم الرئيسي
- فلتر رئيسي – التنقية الأساسية
- مخفض الضغط – التحكم في الضغط

التوزيع الداخلي:
- أنبوب رئيسي – التوزيع العام
- فروع – الاتصال بالغرف
- صمامات قطع – التحكم حسب المناطق
- نقاط الاستهلاك – الصنابير والمراحيض`}</Text>

        <Text style={styles.sectionTitleAr}>🚿 إصلاح الصنابير:</Text>
        <Text style={styles.textBlockAr}>{`أنواع الصنابير:
- صنبور أحادي – تحكم برافعة واحدة
- صنبور تقليدي – صمامات منفصلة
- صنبور حراري – التحكم في الحرارة
- صنبور المطبخ – مع خرطوم قابل للتمديد

الإصلاحات الشائعة:
- تغيير الحلقات – لتجنب التسربات
- تنظيف الفلاتر – لتحسين التدفق
- إصلاح الخراطيش – للصنابير الحديثة
- ضبط الضغط – للأداء الأمثل`}</Text>

        <Text style={styles.sectionTitleAr}>🚽 أنظمة الصرف الصحي:</Text>
        <Text style={styles.textBlockAr}>{`المكونات الرئيسية:
- مرحاض – المرحاض الرئيسي
- مصرف – خروج المياه العادمة
- سيفون – مصيدة الماء المضادة للرائحة
- أنبوب تصريف – أنبوب رأسي للمصارف

التركيب والصيانة:
- توصيل بالمصرف
- تركيب السيفون
- تنظيف الانسدادات
- إصلاح التسربات`}</Text>

        <Text style={styles.sectionTitleAr}>🔥 أنظمة الماء الساخن:</Text>
        <Text style={styles.textBlockAr}>{`أنواع السخانات:
- سخان كهربائي – تركيب بسيط
- سخان غاز – كفاءة أعلى
- سخان شمسي – طاقة متجددة
- سخان فوري – بدون خزان

التركيب والصيانة:
- توصيل كهربائي
- توصيل الماء
- منظم الحرارة
- صمام الأمان
- تنظيف الخزان`}</Text>

        <Text style={styles.sectionTitleAr}>🔍 تشخيص المشاكل:</Text>
        <Text style={styles.textBlockAr}>{`المشاكل الشائعة:
- تسرب الماء – تحديد وإصلاح
- ضغط منخفض – الأسباب والحلول
- ماء ساخن غير كافي
- انسدادات – التنظيف والوقاية
- أصوات في الأنابيب

أدوات التشخيص:
- كاشف التسرب
- مقياس الضغط
- كاميرا فحص
- مقياس حرارة
- مقياس الحموضة`}</Text>

        <Text style={styles.sectionTitleAr}>⚠️ السلامة في السباكة:</Text>
        <Text style={styles.textBlockAr}>{`الحماية الشخصية:
- قفازات عمل – حماية اليدين
- نظارات أمان – حماية العينين
- قناع – للأعمال مع المواد الكيميائية
- أحذية أمان – مقاومة للماء وغير قابلة للانزلاق

قواعد السلامة:
- قطع الماء قبل العمل
- تهوية الأماكن المغلقة
- استخدام سلالم آمنة
- تخزين الأدوات بشكل صحيح
- معرفة الإسعافات الأولية`}</Text>

        <Text style={styles.sectionTitleAr}>📋 الصيانة الوقائية:</Text>
        <Text style={styles.textBlockAr}>{`الفحوصات الدورية:
- فحص الأنابيب – البحث عن التسربات
- تنظيف الفلاتر – الحفاظ على التدفق
- التحقق من الضغط
- فحص السخانات

الصيانة السنوية:
- تنظيف الخزانات
- فحص الصمامات
- معايرة منظمات الحرارة
- تحديث الحلقات`}</Text>

        <Text style={styles.sectionTitleAr}>💰 إدارة المواد:</Text>
        <Text style={styles.textBlockAr}>{`تخطيط الأعمال:
- جرد المواد
- ميزانية المواد
- اختيار الموردين
- مراقبة الجودة

أدوات الإدارة:
- قائمة المواد
- ميزانية مفصلة
- جدول زمني
- مراقبة التكاليف`}</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerTitleAr: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'right',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
    marginTop: 18,
    marginBottom: 6,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  sectionTitleAr: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
    marginTop: 18,
    marginBottom: 6,
    textAlign: 'right',
    alignSelf: 'flex-end',
    writingDirection: 'rtl',
    fontFamily: 'System',
  },
  textBlock: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    textAlign: 'left',
    alignSelf: 'flex-start',
    lineHeight: 22,
  },
  textBlockAr: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    textAlign: 'right',
    alignSelf: 'flex-end',
    writingDirection: 'rtl',
    fontFamily: 'System',
    lineHeight: 22,
  },
});
