import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CursoLimpiezaScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <LinearGradient
        colors={['#4CAF50', '#388E3C']}
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
            <Text style={styles.headerTitle}>Curso de Limpieza</Text>
            <Text style={styles.headerTitleAr}>دورة التنظيف</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>📌 ¿Qué aprenderás?</Text>
        <Text style={styles.textBlock}>{`
1. Técnicas de limpieza profesional.
2. Uso de productos de limpieza.
3. Limpieza de diferentes superficies.
4. Organización del trabajo.
5. Seguridad en la limpieza.`}</Text>
        <Text style={styles.sectionTitle}>📚 Módulos:</Text>
        <Text style={styles.textBlock}>{`- Técnicas de limpieza.
- Productos y equipos.
- Superficies específicas.
- Organización.
- Seguridad.`}</Text>
        <Text style={styles.sectionTitle}>🗣️ Vocabulario útil:</Text>
        <Text style={styles.textBlock}>{`- Limpieza – تنظيف
- Producto – منتج
- Superficie – سطح
- Equipo – معدات
- Seguridad – سلامة`}</Text>
        <Text style={styles.sectionTitleAr}>📌 ماذا ستتعلم؟</Text>
        <Text style={styles.textBlockAr}>{`
1. تقنيات التنظيف المهني.
2. استخدام منتجات التنظيف.
3. تنظيف الأسطح المختلفة.
4. تنظيم العمل.
5. السلامة في التنظيف.`}</Text>
        <Text style={styles.sectionTitleAr}>📚 الوحدات:</Text>
        <Text style={styles.textBlockAr}>{`- تقنيات التنظيف.
- المنتجات والمعدات.
- الأسطح المحددة.
- التنظيم.
- السلامة.`}</Text>
        <Text style={styles.sectionTitleAr}>🗣️ المفردات المهمة:</Text>
        <Text style={styles.textBlockAr}>{`- تنظيف – Limpieza
- منتج – Producto
- سطح – Superficie
- معدات – Equipo
- سلامة – Seguridad`}</Text>

        <Text style={styles.sectionTitle}>📚 MÓDULOS DETALLADOS:</Text>
        <Text style={styles.textBlock}>{`MÓDULO 1: FUNDAMENTOS DE LA LIMPIEZA PROFESIONAL
- Conceptos básicos de limpieza e higiene
- Tipos de suciedad y contaminación
- Principios de limpieza eficiente
- Organización del trabajo de limpieza
- Normativas de seguridad e higiene

MÓDULO 2: PRODUCTOS DE LIMPIEZA
- Clasificación de productos de limpieza
- Productos multiuso y especializados
- Productos ecológicos y sostenibles
- Dilución y preparación de productos
- Almacenamiento y gestión de productos

MÓDULO 3: EQUIPOS Y HERRAMIENTAS
- Equipos manuales de limpieza
- Equipos eléctricos y mecánicos
- Máquinas de limpieza profesional
- Herramientas especializadas
- Mantenimiento de equipos

MÓDULO 4: TÉCNICAS DE LIMPIEZA BÁSICAS
- Limpieza de suelos y pavimentos
- Limpieza de paredes y techos
- Limpieza de ventanas y cristales
- Limpieza de muebles y superficies
- Limpieza de baños y cocinas

MÓDULO 5: LIMPIEZA ESPECIALIZADA
- Limpieza de alfombras y moquetas
- Limpieza de cortinas y textiles
- Limpieza de equipos electrónicos
- Limpieza de espacios exteriores
- Limpieza post-construcción

MÓDULO 6: LIMPIEZA EN SECTORES ESPECÍFICOS
- Limpieza en oficinas y empresas
- Limpieza en hoteles y hostelería
- Limpieza en centros sanitarios
- Limpieza en centros educativos
- Limpieza en espacios industriales

MÓDULO 7: GESTIÓN Y ORGANIZACIÓN
- Planificación de tareas de limpieza
- Control de calidad en limpieza
- Gestión de residuos y reciclaje
- Optimización de tiempos y recursos
- Trabajo en equipo y coordinación

MÓDULO 8: SEGURIDAD Y PREVENCIÓN
- Riesgos laborales en limpieza
- Equipos de protección personal
- Manejo seguro de productos químicos
- Prevención de accidentes
- Primeros auxilios básicos`}</Text>

        <Text style={styles.sectionTitle}>🧹 PRODUCTOS DE LIMPIEZA:</Text>
        <Text style={styles.textBlock}>{`PRODUCTOS BÁSICOS:
- Detergente multiuso / منظف متعدد الاستخدامات – Para limpieza general
- Desinfectante / مطهر – Para eliminar bacterias y virus
- Desengrasante / مزيل للدهون – Para cocinas y superficies grasientas
- Abrillantador / ملمع – Para suelos y superficies brillantes
- Ambientador / معطر – Para perfumar espacios

PRODUCTOS ESPECIALIZADOS:
- Limpiador de cristales / منظف زجاج – Para ventanas y espejos
- Limpiador de baños / منظف حمامات – Para sanitarios y azulejos
- Limpiador de cocinas / منظف مطابخ – Para superficies de cocina
- Limpiador de suelos / منظف أرضيات – Para diferentes tipos de suelo
- Limpiador de muebles / منظف أثاث – Para madera y tapicería

PRODUCTOS ECOLÓGICOS:
- Productos biodegradables / منتجات قابلة للتحلل – Respetuosos con el medio ambiente
- Productos sin fosfatos / منتجات بدون فوسفات – Menos contaminantes
- Productos concentrados / منتجات مركزة – Menor impacto ambiental
- Productos naturales / منتجات طبيعية – Vinagre, bicarbonato, limón
- Productos certificados / منتجات معتمدة – Con sellos ecológicos`}</Text>

        <Text style={styles.sectionTitle}>🛠️ EQUIPOS Y HERRAMIENTAS:</Text>
        <Text style={styles.textBlock}>{`HERRAMIENTAS MANUALES:
- Escoba / مكنسة – Para barrer suelos
- Fregona / ممسحة – Para fregar suelos
- Bayeta / قطعة قماش – Para limpiar superficies
- Esponja / إسفنجة – Para fregar y limpiar
- Cepillo / فرشاة – Para limpiar rincones

EQUIPOS ELÉCTRICOS:
- Aspiradora / مكنسة كهربائية – Para aspirar polvo y suciedad
- Fregadora / آلة غسل الأرضيات – Para limpiar suelos grandes
- Pulidora / آلة تلميع – Para abrillantar suelos
- Limpiadora de cristales / منظف زجاج آلي – Para ventanas altas
- Generador de vapor / مولد بخار – Para desinfección

EQUIPOS ESPECIALIZADOS:
- Máquina de limpieza de alfombras / آلة تنظيف السجاد
- Limpiadora de alta presión / منظف ضغط عالي
- Aspiradora industrial / مكنسة صناعية
- Máquina de limpieza de suelos / آلة تنظيف الأرضيات
- Equipo de limpieza de piscinas / معدات تنظيف المسابح`}</Text>

        <Text style={styles.sectionTitle}>🏠 TÉCNICAS DE LIMPIEZA:</Text>
        <Text style={styles.textBlock}>{`LIMPIEZA DE SUELOS:
- Barrido / كنس – Eliminar polvo y residuos grandes
- Aspirado / شفط – Eliminar polvo fino y partículas
- Fregado / غسل – Limpiar con agua y detergente
- Enjuagado / شطف – Eliminar restos de detergente
- Secado / تجفيف – Dejar superficies secas

LIMPIEZA DE SUPERFICIES:
- Limpieza en seco / تنظيف جاف – Para superficies delicadas
- Limpieza húmeda / تنظيف رطب – Con agua y detergente
- Desinfección / تطهير – Eliminar microorganismos
- Abrillantado / تلميع – Dar brillo a superficies
- Protección / حماية – Aplicar productos protectores

LIMPIEZA DE CRISTALES:
- Limpieza con agua / تنظيف بالماء – Eliminar suciedad básica
- Limpieza con detergente / تنظيف بالمنظف – Para suciedad persistente
- Secado con paño / تجفيف بقطعة قماش – Evitar marcas
- Limpieza de marcos / تنظيف الإطارات – Limpiar juntas y esquinas
- Limpieza de persianas / تنظيف الستائر – Limpiar lamas`}</Text>

        <Text style={styles.sectionTitle}>🚿 LIMPIEZA ESPECIALIZADA:</Text>
        <Text style={styles.textBlock}>{`LIMPIEZA DE BAÑOS:
- Limpieza de sanitarios / تنظيف المراحيض – WC, bidé, urinarios
- Limpieza de duchas / تنظيف الدش – Cabinas y mamparas
- Limpieza de azulejos / تنظيف البلاط – Paredes y suelos
- Desinfección / تطهير – Eliminar bacterias
- Desodorización / إزالة الروائح – Eliminar malos olores

LIMPIEZA DE COCINAS:
- Limpieza de encimeras / تنظيف أسطح العمل – Superficies de trabajo
- Limpieza de electrodomésticos / تنظيف الأجهزة – Hornos, microondas, neveras
- Limpieza de campanas / تنظيف غطاء المطبخ – Extracción de humos
- Desengrasado / إزالة الدهون – Eliminar grasa acumulada
- Limpieza de suelos / تنظيف الأرضيات – Suelos de cocina

LIMPIEZA DE OFICINAS:
- Limpieza de escritorios / تنظيف المكاتب – Superficies de trabajo
- Limpieza de equipos / تنظيف المعدات – Ordenadores, teléfonos
- Limpieza de salas de reuniones / تنظيف قاعات الاجتماعات
- Limpieza de zonas comunes / تنظيف المناطق المشتركة
- Gestión de residuos / إدارة النفايات – Papel y otros desechos`}</Text>

        <Text style={styles.sectionTitle}>🏢 LIMPIEZA EN SECTORES ESPECÍFICOS:</Text>
        <Text style={styles.textBlock}>{`LIMPIEZA EN HOTELES:
- Limpieza de habitaciones / تنظيف الغرف – Limpieza diaria y profunda
- Limpieza de zonas comunes / تنظيف المناطق المشتركة – Recepción, restaurantes
- Limpieza de piscinas / تنظيف المسابح – Mantenimiento del agua
- Limpieza de spa / تنظيف السبا – Áreas de bienestar
- Limpieza post-checkout / تنظيف ما بعد المغادرة – Preparación para nuevos huéspedes

LIMPIEZA EN CENTROS SANITARIOS:
- Limpieza de quirófanos / تنظيف غرف العمليات – Esterilización
- Limpieza de habitaciones / تنظيف الغرف – Limpieza hospitalaria
- Limpieza de laboratorios / تنظيف المختبرات – Contaminación biológica
- Desinfección / تطهير – Eliminar patógenos
- Gestión de residuos sanitarios / إدارة النفايات الطبية

LIMPIEZA INDUSTRIAL:
- Limpieza de maquinaria / تنظيف الآلات – Mantenimiento preventivo
- Limpieza de almacenes / تنظيف المستودعات – Espacios de almacenamiento
- Limpieza de zonas de producción / تنظيف مناطق الإنتاج
- Limpieza de equipos de seguridad / تنظيف معدات الأمان
- Gestión de residuos industriales / إدارة النفايات الصناعية`}</Text>

        <Text style={styles.sectionTitle}>📋 ORGANIZACIÓN Y GESTIÓN:</Text>
        <Text style={styles.textBlock}>{`PLANIFICACIÓN DEL TRABAJO:
- Cronograma de limpieza / جدول التنظيف – Programación de tareas
- Asignación de zonas / تخصيص المناطق – Distribución del trabajo
- Control de tiempos / مراقبة الأوقات – Optimización de recursos
- Priorización de tareas / تحديد أولويات المهام – Urgencias e importancia
- Coordinación de equipos / تنسيق الفرق – Trabajo en equipo

CONTROL DE CALIDAD:
- Inspección visual / فحص بصري – Verificación de resultados
- Listas de verificación / قوائم التحقق – Control sistemático
- Estándares de limpieza / معايير التنظيف – Criterios de calidad
- Evaluación de resultados / تقييم النتائج – Medición de la calidad
- Mejora continua / تحسين مستمر – Optimización de procesos

GESTIÓN DE RESIDUOS:
- Separación de residuos / فصل النفايات – Reciclaje
- Gestión de residuos peligrosos / إدارة النفايات الخطرة
- Reducción de residuos / تقليل النفايات – Minimización
- Reutilización / إعادة الاستخدام – Sostenibilidad
- Disposición final / التخلص النهائي – Gestión ambiental`}</Text>

        <Text style={styles.sectionTitle}>⚠️ SEGURIDAD Y PREVENCIÓN:</Text>
        <Text style={styles.textBlock}>{`RIESGOS LABORALES:
- Riesgos químicos / مخاطر كيميائية – Productos de limpieza
- Riesgos ergonómicos / مخاطر بيئية – Posturas y movimientos
- Riesgos de caídas / مخاطر السقوط – Superficies mojadas
- Riesgos eléctricos / مخاطر كهربائية – Equipos eléctricos
- Riesgos biológicos / مخاطر بيولوجية – Contaminación

EQUIPOS DE PROTECCIÓN:
- Guantes / قفازات – Protección de manos
- Mascarillas / أقنعة – Protección respiratoria
- Gafas de seguridad / نظارات أمان – Protección ocular
- Calzado de seguridad / أحذية أمان – Antideslizante
- Ropa de trabajo / ملابس عمل – Protección corporal

PREVENCIÓN DE ACCIDENTES:
- Formación en seguridad / تدريب في السلامة
- Uso correcto de productos / الاستخدام الصحيح للمنتجات
- Mantenimiento de equipos / صيانة المعدات
- Señalización / إشارات – Indicar zonas de trabajo
- Procedimientos de emergencia / إجراءات الطوارئ`}</Text>

        <Text style={styles.sectionTitle}>🌱 LIMPIEZA SOSTENIBLE:</Text>
        <Text style={styles.textBlock}>{`PRODUCTOS ECOLÓGICOS:
- Productos biodegradables / منتجات قابلة للتحلل – Menor impacto ambiental
- Productos concentrados / منتجات مركزة – Menor uso de envases
- Productos sin fosfatos / منتجات بدون فوسفات – Menos contaminantes
- Productos naturales / منتجات طبيعica – Vinagre, bicarbonato, limón
- Productos certificados / منتجات معتمدة – Sellos ecológicos

TÉCNICAS SOSTENIBLES:
- Uso eficiente del agua / استخدام فعال للماء – Reducir consumo
- Optimización de productos / تحسين المنتجات – Usar solo lo necesario
- Reutilización de materiales / إعادة استخدام المواد – Reducir desperdicios
- Limpieza en seco / تنظيف جاف – Cuando sea posible
- Mantenimiento preventivo / صيانة وقائية – Evitar limpiezas agresivas

GESTIÓN AMBIENTAL:
- Reducción de residuos / تقليل النفايات – Minimizar generación
- Reciclaje / إعادة التدوير – Separación correcta
- Compostaje / تسميد – Residuos orgánicos
- Energía renovable / طاقة متجددة – Equipos eficientes
- Certificaciones ambientales / شهادات بيئية – ISO 14001`}</Text>

        <Text style={styles.sectionTitle}>💼 OPORTUNIDADES LABORALES:</Text>
        <Text style={styles.textBlock}>{`PUESTOS DE TRABAJO:
- Limpiador/a general / عامل تنظيف عام – Limpieza básica
- Limpiador/a especializado / عامل تنظيف متخصص – Áreas específicas
- Supervisor de limpieza / مشرف تنظيف – Coordinación de equipos
- Técnico de limpieza / فني تنظيف – Equipos especializados
- Coordinador de servicios / منسق خدمات – Gestión integral

ESPECIALIZACIONES:
- Limpieza hospitalaria / تنظيف مستشفيات – Centros sanitarios
- Limpieza industrial / تنظيف صناعي – Entornos industriales
- Limpieza de hoteles / تنظيف فنادق – Sector turístico
- Limpieza de oficinas / تنظيف مكاتب – Entornos corporativos
- Limpieza post-construcción / تنظيف ما بعد البناء – Obras

EMPRENDIMIENTO:
- Empresa de limpieza / شركة تنظيف – Servicios profesionales
- Servicios especializados / خدمات متخصصة – Limpieza específica
- Consultoría en limpieza / استشارات تنظيف – Asesoramiento
- Venta de productos / بيع المنتجات – Distribución
- Formación profesional / تدريب مهني – Capacitación

CERTIFICACIONES:
- Certificado de profesionalidad / شهادة مهنية
- Certificación en seguridad / شهادة في السلامة
- Especialización en limpieza industrial / تخصص في التنظيف الصناعي
- Certificación ambiental / شهادة بيئية
- Formación continua / تدريب مستمر`}</Text>

        <Text style={styles.sectionTitleAr}>📚 الوحدات المفصلة:</Text>
        <Text style={styles.textBlockAr}>{`الوحدة الأولى: أساسيات التنظيف المهني
- المفاهيم الأساسية للتنظيف والنظافة
- أنواع الأوساخ والتلوث
- مبادئ التنظيف الفعال
- تنظيم عمل التنظيف
- لوائح السلامة والنظافة

الوحدة الثانية: منتجات التنظيف
- تصنيف منتجات التنظيف
- منتجات متعددة الاستخدامات ومتخصصة
- منتجات صديقة للبيئة ومستدامة
- تخفيف وتحضير المنتجات
- تخزين وإدارة المنتجات

الوحدة الثالثة: المعدات والأدوات
- معدات التنظيف اليدوية
- المعدات الكهربائية والميكانيكية
- آلات التنظيف المهنية
- أدوات متخصصة
- صيانة المعدات

الوحدة الرابعة: تقنيات التنظيف الأساسية
- تنظيف الأرضيات والأرصفة
- تنظيف الجدران والأسقف
- تنظيف النوافذ والزجاج
- تنظيف الأثاث والأسطح
- تنظيف الحمامات والمطابخ

الوحدة الخامسة: التنظيف المتخصص
- تنظيف السجاد والموكيت
- تنظيف الستائر والمنسوجات
- تنظيف الأجهزة الإلكترونية
- تنظيف المساحات الخارجية
- التنظيف بعد البناء

الوحدة السادسة: التنظيف في قطاعات محددة
- التنظيف في المكاتب والشركات
- التنظيف في الفنادق والضيافة
- التنظيف في المراكز الصحية
- التنظيف في المراكز التعليمية
- التنظيف في المساحات الصناعية

الوحدة السابعة: الإدارة والتنظيم
- تخطيط مهام التنظيف
- مراقبة الجودة في التنظيف
- إدارة النفايات وإعادة التدوير
- تحسين الأوقات والموارد
- العمل الجماعي والتنسيق

الوحدة الثامنة: السلامة والوقاية
- المخاطر المهنية في التنظيف
- معدات الحماية الشخصية
- التعامل الآمن مع المواد الكيميائية
- منع الحوادث
- الإسعافات الأولية الأساسية`}</Text>

        <Text style={styles.sectionTitleAr}>🧹 منتجات التنظيف:</Text>
        <Text style={styles.textBlockAr}>{`المنتجات الأساسية:
- منظف متعدد الاستخدامات – للتنظيف العام
- مطهر – للقضاء على البكتيريا والفيروسات
- مزيل للدهون – للمطابخ والأسطح الدهنية
- ملمع – للأرضيات والأسطح اللامعة
- معطر – لتعطير المساحات

المنتجات المتخصصة:
- منظف زجاج – للنوافذ والمرايا
- منظف حمامات – للمراحيض والبلاط
- منظف مطابخ – لأسطح المطبخ
- منظف أرضيات – لأنواع مختلفة من الأرضيات
- منظف أثاث – للخشب والتنجيد

المنتجات الصديقة للبيئة:
- منتجات قابلة للتحلل – محترمة للبيئة
- منتجات بدون فوسفات – أقل تلويثاً
- منتجات مركزة – تأثير بيئي أقل
- منتجات طبيعية – خل، بيكربونات، ليمون
- منتجات معتمدة – بشهادات بيئية`}</Text>

        <Text style={styles.sectionTitleAr}>🛠️ المعدات والأدوات:</Text>
        <Text style={styles.textBlockAr}>{`الأدوات اليدوية:
- مكنسة – لكنس الأرضيات
- ممسحة – لغسل الأرضيات
- قطعة قماش – لتنظيف الأسطح
- إسفنجة – للفرك والتنظيف
- فرشاة – لتنظيف الزوايا

المعدات الكهربائية:
- مكنسة كهربائية – لشفط الغبار والأوساخ
- آلة غسل الأرضيات – لتنظيف الأرضيات الكبيرة
- آلة تلميع – لتلميع الأرضيات
- منظف زجاج آلي – للنوافذ العالية
- مولد بخار – للتطهير

المعدات المتخصصة:
- آلة تنظيف السجاد
- منظف ضغط عالي
- مكنسة صناعية
- آلة تنظيف الأرضيات
- معدات تنظيف المسابح`}</Text>

        <Text style={styles.sectionTitleAr}>🏠 تقنيات التنظيف:</Text>
        <Text style={styles.textBlockAr}>{`تنظيف الأرضيات:
- كنس – إزالة الغبار والمخلفات الكبيرة
- شفط – إزالة الغبار الناعم والجزيئات
- غسل – تنظيف بالماء والمنظف
- شطف – إزالة بقايا المنظف
- تجفيف – ترك الأسطح جافة

تنظيف الأسطح:
- تنظيف جاف – للأسطح الحساسة
- تنظيف رطب – بالماء والمنظف
- تطهير – القضاء على الكائنات الحية الدقيقة
- تلميع – إعطاء بريق للأسطح
- حماية – تطبيق منتجات الحماية

تنظيف الزجاج:
- تنظيف بالماء – إزالة الأوساخ الأساسية
- تنظيف بالمنظف – للأوساخ المستعصية
- تجفيف بقطعة قماش – تجنب العلامات
- تنظيف الإطارات – تنظيف المفاصل والزوايا
- تنظيف الستائر – تنظيف الشرائح`}</Text>

        <Text style={styles.sectionTitleAr}>🚿 التنظيف المتخصص:</Text>
        <Text style={styles.textBlockAr}>{`تنظيف الحمامات:
- تنظيف المراحيض – مرحاض، بيديه، مباول
- تنظيف الدش – كابينات وحواجز
- تنظيف البلاط – الجدران والأرضيات
- تطهير – القضاء على البكتيريا
- إزالة الروائح – القضاء على الروائح الكريهة

تنظيف المطابخ:
- تنظيف أسطح العمل – أسطح العمل
- تنظيف الأجهزة – أفران، ميكروويف، ثلاجات
- تنظيف غطاء المطبخ – استخراج الدخان
- إزالة الدهون – إزالة الدهون المتراكمة
- تنظيف الأرضيات – أرضيات المطبخ

تنظيف المكاتب:
- تنظيف المكاتب – أسطح العمل
- تنظيف المعدات – أجهزة كمبيوتر، هواتف
- تنظيف قاعات الاجتماعات
- تنظيف المناطق المشتركة
- إدارة النفايات – ورق ومخلفات أخرى`}</Text>

        <Text style={styles.sectionTitleAr}>🏢 التنظيف في قطاعات محددة:</Text>
        <Text style={styles.textBlockAr}>{`التنظيف في الفنادق:
- تنظيف الغرف – تنظيف يومي وعميق
- تنظيف المناطق المشتركة – استقبال، مطاعم
- تنظيف المسابح – صيانة الماء
- تنظيف السبا – مناطق الرفاهية
- تنظيف ما بعد المغادرة – تحضير للضيوف الجدد

التنظيف في المراكز الصحية:
- تنظيف غرف العمليات – تعقيم
- تنظيف الغرف – تنظيف مستشفى
- تنظيف المختبرات – تلوث بيولوجي
- تطهير – القضاء على مسببات الأمراض
- إدارة النفايات الطبية

التنظيف الصناعي:
- تنظيف الآلات – صيانة وقائية
- تنظيف المستودعات – مساحات التخزين
- تنظيف مناطق الإنتاج
- تنظيف معدات الأمان
- إدارة النفايات الصناعية`}</Text>

        <Text style={styles.sectionTitleAr}>📋 التنظيم والإدارة:</Text>
        <Text style={styles.textBlockAr}>{`تخطيط العمل:
- جدول التنظيف – برمجة المهام
- تخصيص المناطق – توزيع العمل
- مراقبة الأوقات – تحسين الموارد
- تحديد أولويات المهام – الطوارئ والأهمية
- تنسيق الفرق – العمل الجماعي

مراقبة الجودة:
- فحص بصري – التحقق من النتائج
- قوائم التحقق – مراقبة منهجية
- معايير التنظيف – معايير الجودة
- تقييم النتائج – قياس الجودة
- تحسين مستمر – تحسين العمليات

إدارة النفايات:
- فصل النفايات – إعادة التدوير
- إدارة النفايات الخطرة
- تقليل النفايات – التقليل
- إعادة الاستخدام – الاستدامة
- التخلص النهائي – الإدارة البيئية`}</Text>

        <Text style={styles.sectionTitleAr}>⚠️ السلامة والوقاية:</Text>
        <Text style={styles.textBlockAr}>{`المخاطر المهنية:
- مخاطر كيميائية – منتجات التنظيف
- مخاطر بيئية – الوضعيات والحركات
- مخاطر السقوط – الأسطح المبللة
- مخاطر كهربائية – المعدات الكهربائية
- مخاطر بيولوجية – التلوث

معدات الحماية:
- قفازات – حماية اليدين
- أقنعة – حماية تنفسية
- نظارات أمان – حماية العينين
- أحذية أمان – غير قابلة للانزلاق
- ملابس عمل – حماية الجسم

منع الحوادث:
- تدريب في السلامة
- الاستخدام الصحيح للمنتجات
- صيانة المعدات
- إشارات – إشارة مناطق العمل
- إجراءات الطوارئ`}</Text>

        <Text style={styles.sectionTitleAr}>🌱 التنظيف المستدام:</Text>
        <Text style={styles.textBlockAr}>{`المنتجات الصديقة للبيئة:
- منتجات قابلة للتحلل – تأثير بيئي أقل
- منتجات مركزة – استخدام أقل للحاويات
- منتجات بدون فوسفات – أقل تلويثاً
- منتجات طبيعية – خل، بيكربونات، ليمون
- منتجات معتمدة – شهادات بيئية

التقنيات المستدامة:
- استخدام فعال للماء – تقليل الاستهلاك
- تحسين المنتجات – استخدام الضروري فقط
- إعادة استخدام المواد – تقليل الهدر
- تنظيف جاف – عندما يكون ممكناً
- صيانة وقائية – تجنب التنظيفات العدوانية

الإدارة البيئية:
- تقليل النفايات – تقليل التوليد
- إعادة التدوير – فصل صحيح
- تسميد – نفايات عضوية
- طاقة متجددة – معدات فعالة
- شهادات بيئية – ISO 14001`}</Text>

        <Text style={styles.sectionTitleAr}>💼 فرص العمل:</Text>
        <Text style={styles.textBlockAr}>{`الوظائف:
- عامل تنظيف عام – تنظيف أساسي
- عامل تنظيف متخصص – مناطق محددة
- مشرف تنظيف – تنسيق الفرق
- فني تنظيف – معدات متخصصة
- منسق خدمات – إدارة متكاملة

التخصصات:
- تنظيف مستشفيات – مراكز صحية
- تنظيف صناعي – بيئات صناعية
- تنظيف فنادق – قطاع سياحي
- تنظيف مكاتب – بيئات شركات
- تنظيف ما بعد البناء – أعمال

ريادة الأعمال:
- شركة تنظيف – خدمات مهنية
- خدمات متخصصة – تنظيف محدد
- استشارات تنظيف – استشارات
- بيع المنتجات – توزيع
- تدريب مهني – تدريب

الشهادات:
- شهادة مهنية
- شهادة في السلامة
- تخصص في التنظيف الصناعي
- شهادة بيئية
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
