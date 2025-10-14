import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CursoAlbanileriaScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <LinearGradient
        colors={['#607D8B', '#455A64']}
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
            <Text style={styles.headerTitle}>Curso de Albañilería</Text>
            <Text style={styles.headerTitleAr}>دورة البناء</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>📌 ¿Qué aprenderás?</Text>
        <Text style={styles.textBlock}>{`
1. Técnicas básicas de construcción.
2. Trabajo con cemento y ladrillos.
3. Reparación de paredes y muros.
4. Uso de herramientas de construcción.
5. Seguridad en construcción.`}</Text>
        <Text style={styles.sectionTitle}>📚 Módulos:</Text>
        <Text style={styles.textBlock}>{`- Técnicas de construcción.
- Materiales básicos.
- Herramientas.
- Reparaciones básicas.
- Seguridad.`}</Text>
        <Text style={styles.sectionTitle}>🗣️ Vocabulario útil:</Text>
        <Text style={styles.textBlock}>{`- Ladrillo – طوبة
- Cemento – إسمنت
- Pared – جدار
- Herramienta – أداة
- Seguridad – سلامة`}</Text>
        <Text style={styles.sectionTitleAr}>📌 ماذا ستتعلم؟</Text>
        <Text style={styles.textBlockAr}>{`
1. التقنيات الأساسية للبناء.
2. العمل مع الإسمنت والطوب.
3. إصلاح الجدران والجدران.
4. استخدام أدوات البناء.
5. السلامة في البناء.`}</Text>
        <Text style={styles.sectionTitleAr}>📚 الوحدات:</Text>
        <Text style={styles.textBlockAr}>{`- تقنيات البناء.
- المواد الأساسية.
- الأدوات.
- الإصلاحات الأساسية.
- السلامة.`}</Text>
        <Text style={styles.sectionTitleAr}>🗣️ المفردات المهمة:</Text>
        <Text style={styles.textBlockAr}>{`- طوبة – Ladrillo
- إسمنت – Cemento
- جدار – Pared
- أداة – Herramienta
- سلامة – Seguridad`}</Text>

        <Text style={styles.sectionTitle}>📚 MÓDULOS DETALLADOS:</Text>
        <Text style={styles.textBlock}>{`MÓDULO 1: FUNDAMENTOS DE LA CONSTRUCCIÓN
- Tipos de suelo y cimentación
- Lectura de planos básicos
- Medidas y nivelación
- Geometría aplicada a la construcción
- Normativas de construcción locales

MÓDULO 2: MATERIALES DE CONSTRUCCIÓN
- Tipos de cemento y sus usos
- Agregados (arena, grava, piedra)
- Ladrillos: cerámicos, de hormigón, refractarios
- Bloques de hormigón y sus dimensiones
- Materiales aislantes y de acabado

MÓDULO 3: HERRAMIENTAS Y EQUIPOS
- Herramientas manuales básicas
- Herramientas eléctricas portátiles
- Equipos de medición y nivelación
- Herramientas de corte y perforación
- Mantenimiento y seguridad de herramientas

MÓDULO 4: TÉCNICAS DE ALBAÑILERÍA
- Preparación de morteros y hormigones
- Técnicas de asentado de ladrillos
- Juntas y aparejos de mampostería
- Construcción de pilares y columnas
- Refuerzos y armaduras básicas

MÓDULO 5: CONSTRUCCIÓN DE MUROS
- Tipos de aparejo (soga, tizón, palomero)
- Construcción de muros de carga
- Muros divisorios y tabiques
- Aberturas (puertas y ventanas)
- Juntas de dilatación y control

MÓDULO 6: ACABADOS Y REVOCOS
- Tipos de revoco (interior y exterior)
- Preparación de superficies
- Técnicas de aplicación
- Acabados especiales (estuco, texturizado)
- Pintura y tratamientos superficiales

MÓDULO 7: REPARACIONES Y MANTENIMIENTO
- Diagnóstico de problemas estructurales
- Reparación de grietas y fisuras
- Reconstrucción de muros deteriorados
- Impermeabilización de muros
- Mantenimiento preventivo

MÓDULO 8: SEGURIDAD Y NORMATIVAS
- Equipos de protección personal (EPP)
- Normativas de seguridad en construcción
- Prevención de accidentes
- Primeros auxilios básicos
- Gestión de residuos de construcción`}</Text>

        <Text style={styles.sectionTitle}>🛠️ HERRAMIENTAS PRINCIPALES:</Text>
        <Text style={styles.textBlock}>{`HERRAMIENTAS MANUALES:
- Paleta / مجرفة – Para aplicar mortero
- Cincel / إزميل – Para cortar y picar
- Martillo / مطرقة – Para golpear y clavar
- Nivel / ميزان – Para nivelación
- Plomada / شاقول – Para verticalidad
- Metro / شريط قياس – Para mediciones
- Escuadra / زاوية قائمة – Para ángulos
- Llana / مالج – Para alisar superficies

HERRAMIENTAS ELÉCTRICAS:
- Taladro / مثقاب كهربائي – Para perforaciones
- Amoladora / طاحونة – Para cortes y desbaste
- Vibrador / هزاز – Para compactar hormigón
- Sierra circular / منشار دائري – Para cortes
- Compresor / ضاغط هواء – Para herramientas neumáticas

EQUIPOS DE MEDICIÓN:
- Nivel láser / ميزان ليزر – Para nivelación precisa
- Teodolito / ثيودوليت – Para mediciones angulares
- Cinta métrica láser / شريط قياس ليزر – Para distancias
- Escáner 3D / ماسح ضوئي ثلاثي الأبعاد – Para modelado`}</Text>

        <Text style={styles.sectionTitle}>🧱 TÉCNICAS DE CONSTRUCCIÓN:</Text>
        <Text style={styles.textBlock}>{`PREPARACIÓN DE MORTEROS:
- Mortero de cemento (1:3, 1:4, 1:6)
- Mortero de cal y cemento
- Mortero de yeso para interiores
- Hormigón armado (1:2:3, 1:2:4)
- Hormigón celular y ligero

TÉCNICAS DE ASENTADO:
- Aparejo a soga (ladrillos longitudinales)
- Aparejo a tizón (ladrillos transversales)
- Aparejo palomero (alternando soga y tizón)
- Aparejo inglés (dos sogas, una tizón)
- Aparejo flamenco (alternando cabezas)

CONSTRUCCIÓN DE PILARES:
- Pilares de ladrillo macizo
- Pilares de hormigón armado
- Pilares metálicos recubiertos
- Pilares de bloques de hormigón
- Refuerzos con malla electrosoldada

ABERTURAS Y VANOS:
- Dinteles de hormigón armado
- Arcos de medio punto
- Arcos rebajados
- Ventanas y puertas
- Instalación de marcos`}</Text>

        <Text style={styles.sectionTitle}>🏗️ TIPOS DE CONSTRUCCIÓN:</Text>
        <Text style={styles.textBlock}>{`CONSTRUCCIÓN TRADICIONAL:
- Muros de carga de ladrillo
- Forjados de vigueta y bovedilla
- Cubiertas inclinadas de teja
- Cimentación de mampostería
- Estructura de madera

CONSTRUCCIÓN MODERNA:
- Estructura de hormigón armado
- Muros de cerramiento ligeros
- Forjados de hormigón in situ
- Cubiertas planas impermeabilizadas
- Fachadas ventiladas

CONSTRUCCIÓN INDUSTRIAL:
- Estructuras metálicas
- Paneles prefabricados
- Muros cortina
- Cubiertas de chapa
- Naves industriales

CONSTRUCCIÓN SOSTENIBLE:
- Materiales ecológicos
- Aislamiento térmico avanzado
- Sistemas de ventilación natural
- Energías renovables integradas
- Gestión de residuos`}</Text>

        <Text style={styles.sectionTitle}>📐 CÁLCULOS Y MEDICIONES:</Text>
        <Text style={styles.textBlock}>{`CÁLCULO DE MATERIALES:
- Volumen de muros y pilares
- Cantidad de mortero por m²
- Número de ladrillos necesarios
- Cantidad de hormigón para cimientos
- Rendimiento de materiales

MEDICIONES Y NIVELACIÓN:
- Uso del nivel de burbuja
- Nivelación con láser
- Medición de ángulos rectos
- Cálculo de pendientes
- Trazado de curvas y arcos

GEOMETRÍA APLICADA:
- Cálculo de áreas y volúmenes
- Trazado de escaleras
- Diseño de rampas
- Cálculo de cargas
- Distribución de pesos`}</Text>

        <Text style={styles.sectionTitle}>🔧 REPARACIONES ESPECIALIZADAS:</Text>
        <Text style={styles.textBlock}>{`REPARACIÓN DE GRIETAS:
- Identificación del tipo de grieta
- Limpieza y preparación
- Inyección de resinas
- Reparación con mortero
- Refuerzo con malla

RECONSTRUCCIÓN DE MUROS:
- Demolición controlada
- Preparación de cimientos
- Reconstrucción por fases
- Integración con estructura existente
- Acabados finales

IMPERMEABILIZACIÓN:
- Tratamiento de humedades
- Aplicación de impermeabilizantes
- Sistemas de drenaje
- Barreras de vapor
- Ventilación de cámaras

REFUERZOS ESTRUCTURALES:
- Encamisado de pilares
- Refuerzo de muros
- Consolidación de cimientos
- Anclajes químicos
- Mallas de fibra de carbono`}</Text>

        <Text style={styles.sectionTitle}>🎨 ACABADOS Y REVOCOS:</Text>
        <Text style={styles.textBlock}>{`TIPOS DE REVOCO:
- Revoco de cemento y arena
- Revoco de cal y arena
- Revoco de yeso
- Revoco monocapa
- Revoco proyectado

TÉCNICAS DE APLICACIÓN:
- Preparación de la superficie
- Aplicación manual con llana
- Proyección mecánica
- Acabado con regla
- Pulido y texturizado

ACABADOS ESPECIALES:
- Estuco veneciano
- Revoque texturizado
- Acabado rústico
- Revoque decorativo
- Pintura mineral

TRATAMIENTOS SUPERFICIALES:
- Hidrofugado
- Antigraffiti
- Antihumedad
- Antisalitre
- Protección UV`}</Text>

        <Text style={styles.sectionTitle}>⚠️ SEGURIDAD Y PREVENCIÓN:</Text>
        <Text style={styles.textBlock}>{`EQUIPOS DE PROTECCIÓN:
- Casco de seguridad
- Gafas de protección
- Guantes de trabajo
- Botas de seguridad
- Mascarilla antipolvo
- Arnés de seguridad (altura)

NORMATIVAS DE SEGURIDAD:
- Normativa de prevención de riesgos
- Protocolos de trabajo seguro
- Señalización de obra
- Gestión de residuos
- Control de acceso

PREVENCIÓN DE ACCIDENTES:
- Revisión de herramientas
- Orden y limpieza
- Comunicación entre trabajadores
- Procedimientos de emergencia
- Formación continua

PRIMEROS AUXILIOS:
- Botiquín de obra
- Protocolos de actuación
- Contactos de emergencia
- Evacuación de heridos
- Prevención de infecciones`}</Text>

        <Text style={styles.sectionTitle}>📊 GESTIÓN DE OBRA:</Text>
        <Text style={styles.textBlock}>{`PLANIFICACIÓN DE TRABAJOS:
- Cronograma de actividades
- Asignación de recursos
- Control de calidad
- Seguimiento de avances
- Gestión de imprevistos

CONTROL DE CALIDAD:
- Inspección de materiales
- Verificación de ejecución
- Ensayos de resistencia
- Control de tolerancias
- Documentación fotográfica

GESTIÓN DE MATERIALES:
- Almacenamiento adecuado
- Control de inventario
- Rotación de stock
- Protección contra intemperie
- Gestión de sobrantes

COSTOS Y PRESUPUESTOS:
- Cálculo de costos unitarios
- Presupuesto de materiales
- Control de horas de trabajo
- Análisis de rentabilidad
- Optimización de recursos`}</Text>

        <Text style={styles.sectionTitle}>🌱 CONSTRUCCIÓN SOSTENIBLE:</Text>
        <Text style={styles.textBlock}>{`MATERIALES ECOLÓGICOS:
- Ladrillos de adobe
- Bloques de tierra comprimida
- Aislamientos naturales
- Pinturas ecológicas
- Materiales reciclados

TÉCNICAS SOSTENIBLES:
- Construcción con tierra
- Muros trombe
- Cubiertas verdes
- Sistemas de captación de agua
- Ventilación natural

EFICIENCIA ENERGÉTICA:
- Aislamiento térmico avanzado
- Ventanas de alta eficiencia
- Sistemas de calefacción eficientes
- Energías renovables
- Domótica básica

GESTIÓN AMBIENTAL:
- Reducción de residuos
- Reciclaje de materiales
- Uso eficiente del agua
- Minimización de emisiones
- Certificaciones ambientales`}</Text>

        <Text style={styles.sectionTitle}>💼 OPORTUNIDADES LABORALES:</Text>
        <Text style={styles.textBlock}>{`PUESTOS DE TRABAJO:
- Albañil especializado
- Maestro de obras
- Encargado de obra
- Técnico de control de calidad
- Supervisor de construcción

ESPECIALIZACIONES:
- Albañilería de fachadas
- Construcción de piscinas
- Restauración de edificios
- Construcción industrial
- Obra civil

EMPRENDIMIENTO:
- Empresa de construcción
- Servicios de rehabilitación
- Consultoría técnica
- Venta de materiales
- Formación profesional

CERTIFICACIONES:
- Certificado de profesionalidad
- Carné de operador de maquinaria
- Certificación en seguridad
- Especialización en técnicas específicas
- Formación continua`}</Text>

        <Text style={styles.sectionTitleAr}>📚 الوحدات المفصلة:</Text>
        <Text style={styles.textBlockAr}>{`الوحدة الأولى: أساسيات البناء
- أنواع التربة والأساسات
- قراءة المخططات الأساسية
- القياسات والتسوية
- الهندسة التطبيقية في البناء
- لوائح البناء المحلية

الوحدة الثانية: مواد البناء
- أنواع الإسمنت واستخداماتها
- الركام (الرمل، الحصى، الحجر)
- الطوب: السيراميك، الخرسانة، المقاوم للحرارة
- كتل الخرسانة وأبعادها
- المواد العازلة ومواد التشطيب

الوحدة الثالثة: الأدوات والمعدات
- الأدوات اليدوية الأساسية
- الأدوات الكهربائية المحمولة
- معدات القياس والتسوية
- أدوات القطع والحفر
- صيانة وسلامة الأدوات

الوحدة الرابعة: تقنيات البناء
- تحضير الملاط والخرسانة
- تقنيات وضع الطوب
- المفاصل وأنماط البناء
- بناء الأعمدة والأبراج
- التعزيزات والتسليح الأساسي

الوحدة الخامسة: بناء الجدران
- أنواع الأنماط (طولية، عرضية، مختلطة)
- بناء الجدران الحاملة
- الجدران الفاصلة والحواجز
- الفتحات (الأبواب والنوافذ)
- مفاصل التمدد والتحكم

الوحدة السادسة: التشطيبات والطلاء
- أنواع الطلاء (داخلي وخارجي)
- تحضير الأسطح
- تقنيات التطبيق
- التشطيبات الخاصة (الجص، الملمس)
- الطلاء والمعالجات السطحية

الوحدة السابعة: الإصلاحات والصيانة
- تشخيص المشاكل الهيكلية
- إصلاح الشقوق والتصدعات
- إعادة بناء الجدران المتدهورة
- العزل المائي للجدران
- الصيانة الوقائية

الوحدة الثامنة: السلامة واللوائح
- معدات الحماية الشخصية
- لوائح السلامة في البناء
- منع الحوادث
- الإسعافات الأولية الأساسية
- إدارة نفايات البناء`}</Text>

        <Text style={styles.sectionTitleAr}>🛠️ الأدوات الرئيسية:</Text>
        <Text style={styles.textBlockAr}>{`الأدوات اليدوية:
- مجرفة – لتطبيق الملاط
- إزميل – للقطع والنقر
- مطرقة – للطرق والمسامير
- ميزان – للتسوية
- شاقول – للعمودية
- شريط قياس – للقياسات
- زاوية قائمة – للزوايا
- مالج – لتسوية الأسطح

الأدوات الكهربائية:
- مثقاب كهربائي – للحفر
- طاحونة – للقطع والتشذيب
- هزاز – لضغط الخرسانة
- منشار دائري – للقطع
- ضاغط هواء – للأدوات الهوائية

معدات القياس:
- ميزان ليزر – للتسوية الدقيقة
- ثيودوليت – للقياسات الزاوية
- شريط قياس ليزر – للمسافات
- ماسح ضوئي ثلاثي الأبعاد – للنمذجة`}</Text>

        <Text style={styles.sectionTitleAr}>🧱 تقنيات البناء:</Text>
        <Text style={styles.textBlockAr}>{`تحضير الملاط:
- ملاط الإسمنت (1:3، 1:4، 1:6)
- ملاط الجير والإسمنت
- ملاط الجبس للداخل
- خرسانة مسلحة (1:2:3، 1:2:4)
- خرسانة خفيفة وخلوية

تقنيات الوضع:
- نمط طولي (طوب طولي)
- نمط عرضي (طوب عرضي)
- نمط مختلط (تبديل طولي وعرضي)
- نمط إنجليزي (طوليان، عرضي واحد)
- نمط فلمنكي (تبديل الرؤوس)

بناء الأعمدة:
- أعمدة طوب صلب
- أعمدة خرسانة مسلحة
- أعمدة معدنية مكسوة
- أعمدة كتل خرسانة
- تعزيزات بشبكة لحام كهربائي

الفتحات والفراغات:
- عتبات خرسانة مسلحة
- أقواس نصف دائرية
- أقواس منخفضة
- نوافذ وأبواب
- تركيب الإطارات`}</Text>

        <Text style={styles.sectionTitleAr}>🏗️ أنواع البناء:</Text>
        <Text style={styles.textBlockAr}>{`البناء التقليدي:
- جدران حاملة من الطوب
- أرضيات من عوارض وبلاطات
- أسقف مائلة من القرميد
- أساسات من البناء الحجري
- هيكل خشبي

البناء الحديث:
- هيكل خرسانة مسلحة
- جدران إغلاق خفيفة
- أرضيات خرسانة في الموقع
- أسقف مسطحة معزولة
- واجهات مهواة

البناء الصناعي:
- هياكل معدنية
- ألواح مسبقة الصنع
- جدران ستارية
- أسقف من الصفائح
- مستودعات صناعية

البناء المستدام:
- مواد صديقة للبيئة
- عزل حراري متقدم
- أنظمة تهوية طبيعية
- طاقات متجددة مدمجة
- إدارة النفايات`}</Text>

        <Text style={styles.sectionTitleAr}>📐 الحسابات والقياسات:</Text>
        <Text style={styles.textBlockAr}>{`حساب المواد:
- حجم الجدران والأعمدة
- كمية الملاط لكل م²
- عدد الطوب المطلوب
- كمية الخرسانة للأساسات
- مردود المواد

القياسات والتسوية:
- استخدام ميزان الفقاعة
- التسوية بالليزر
- قياس الزوايا القائمة
- حساب المنحدرات
- رسم المنحنيات والأقواس

الهندسة التطبيقية:
- حساب المساحات والأحجام
- رسم السلالم
- تصميم المنحدرات
- حساب الأحمال
- توزيع الأوزان`}</Text>

        <Text style={styles.sectionTitleAr}>🔧 إصلاحات متخصصة:</Text>
        <Text style={styles.textBlockAr}>{`إصلاح الشقوق:
- تحديد نوع الشق
- التنظيف والتحضير
- حقن الراتنجات
- الإصلاح بالملاط
- التعزيز بالشبكة

إعادة بناء الجدران:
- هدم محكوم
- تحضير الأساسات
- إعادة البناء على مراحل
- التكامل مع الهيكل الموجود
- التشطيبات النهائية

العزل المائي:
- معالجة الرطوبة
- تطبيق العوازل المائية
- أنظمة الصرف
- حواجز البخار
- تهوية الفراغات

التعزيزات الهيكلية:
- تغليف الأعمدة
- تعزيز الجدران
- تثبيت الأساسات
- مراسي كيميائية
- شبكات من ألياف الكربون`}</Text>

        <Text style={styles.sectionTitleAr}>🎨 التشطيبات والطلاء:</Text>
        <Text style={styles.textBlockAr}>{`أنواع الطلاء:
- طلاء إسمنت ورمل
- طلاء جير ورمل
- طلاء جبس
- طلاء أحادي الطبقة
- طلاء مرشوش

تقنيات التطبيق:
- تحضير السطح
- التطبيق اليدوي بالمالج
- الرش الميكانيكي
- التشطيب بالمسطرة
- الصقل والملمس

التشطيبات الخاصة:
- جص البندقية
- طلاء ملمس
- تشطيب ريفي
- طلاء تزييني
- طلاء معدني

المعالجات السطحية:
- طارد للماء
- مضاد للكتابة
- مضاد للرطوبة
- مضاد للأملاح
- حماية من الأشعة فوق البنفسجية`}</Text>

        <Text style={styles.sectionTitleAr}>⚠️ السلامة والوقاية:</Text>
        <Text style={styles.textBlockAr}>{`معدات الحماية:
- خوذة أمان
- نظارات حماية
- قفازات عمل
- أحذية أمان
- قناع مضاد للغبار
- حزام أمان (للارتفاعات)

لوائح السلامة:
- لائحة منع المخاطر
- بروتوكولات العمل الآمن
- إشارات الموقع
- إدارة النفايات
- التحكم في الوصول

منع الحوادث:
- فحص الأدوات
- النظام والنظافة
- التواصل بين العمال
- إجراءات الطوارئ
- التدريب المستمر

الإسعافات الأولية:
- صندوق إسعافات الموقع
- بروتوكولات العمل
- جهات اتصال الطوارئ
- إخلاء المصابين
- منع العدوى`}</Text>

        <Text style={styles.sectionTitleAr}>📊 إدارة الموقع:</Text>
        <Text style={styles.textBlockAr}>{`تخطيط الأعمال:
- جدول الأنشطة
- تخصيص الموارد
- مراقبة الجودة
- متابعة التقدم
- إدارة الطوارئ

مراقبة الجودة:
- فحص المواد
- التحقق من التنفيذ
- اختبارات المقاومة
- مراقبة التسامحات
- توثيق فوتوغرافي

إدارة المواد:
- تخزين مناسب
- مراقبة المخزون
- دوران المخزون
- الحماية من العوامل الجوية
- إدارة الفائض

التكاليف والميزانيات:
- حساب التكاليف الوحدة
- ميزانية المواد
- مراقبة ساعات العمل
- تحليل الربحية
- تحسين الموارد`}</Text>

        <Text style={styles.sectionTitleAr}>🌱 البناء المستدام:</Text>
        <Text style={styles.textBlockAr}>{`المواد الصديقة للبيئة:
- طوب اللبن
- كتل التربة المضغوطة
- عوازل طبيعية
- دهانات صديقة للبيئة
- مواد معاد تدويرها

التقنيات المستدامة:
- البناء بالتربة
- جدران ترومب
- أسقف خضراء
- أنظمة جمع المياه
- تهوية طبيعية

كفاءة الطاقة:
- عزل حراري متقدم
- نوافذ عالية الكفاءة
- أنظمة تدفئة فعالة
- طاقات متجددة
- أتمتة منزلية أساسية

الإدارة البيئية:
- تقليل النفايات
- إعادة تدوير المواد
- استخدام فعال للماء
- تقليل الانبعاثات
- شهادات بيئية`}</Text>

        <Text style={styles.sectionTitleAr}>💼 فرص العمل:</Text>
        <Text style={styles.textBlockAr}>{`الوظائف:
- بناء متخصص
- معلم أعمال
- مسؤول موقع
- فني مراقبة جودة
- مشرف بناء

التخصصات:
- بناء الواجهات
- بناء المسابح
- ترميم المباني
- بناء صناعي
- أعمال مدنية

ريادة الأعمال:
- شركة بناء
- خدمات إعادة التأهيل
- استشارات تقنية
- بيع المواد
- تدريب مهني

الشهادات:
- شهادة مهنية
- رخصة تشغيل الآلات
- شهادة في السلامة
- تخصص في تقنيات محددة
- تدريب مستمر`}</Text>
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
