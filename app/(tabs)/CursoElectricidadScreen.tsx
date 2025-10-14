import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CursoElectricidadScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <LinearGradient
        colors={['#FF9800', '#F57C00']}
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
            <Text style={styles.headerTitle}>Curso de Electricidad</Text>
            <Text style={styles.headerTitleAr}>دورة الكهرباء</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>📌 ¿Qué aprenderás?</Text>
        <Text style={styles.textBlock}>{`
1. Instalaciones eléctricas básicas.
2. Reparación de enchufes e interruptores.
3. Instalación de lámparas y luces.
4. Mantenimiento de cuadros eléctricos.
5. Seguridad en trabajos eléctricos.`}</Text>
        <Text style={styles.sectionTitle}>📚 Módulos:</Text>
        <Text style={styles.textBlock}>{`- Instalaciones básicas.
- Enchufes e interruptores.
- Iluminación.
- Cuadros eléctricos.
- Seguridad.`}</Text>
        <Text style={styles.sectionTitle}>🗣️ Vocabulario útil:</Text>
        <Text style={styles.textBlock}>{`- Electricidad – كهرباء
- Enchufe – قابس
- Interruptor – مفتاح
- Lámpara – مصباح
- Seguridad – سلامة`}</Text>
        <Text style={styles.sectionTitleAr}>📌 ماذا ستتعلم؟</Text>
        <Text style={styles.textBlockAr}>{`
1. التركيبات الكهربائية الأساسية.
2. إصلاح القوابس والمفاتيح.
3. تركيب المصابيح والأضواء.
4. صيانة لوحات الكهرباء.
5. السلامة في الأعمال الكهربائية.`}</Text>
        <Text style={styles.sectionTitleAr}>📚 الوحدات:</Text>
        <Text style={styles.textBlockAr}>{`- التركيبات الأساسية.
- القوابس والمفاتيح.
- الإضاءة.
- لوحات الكهرباء.
- السلامة.`}</Text>
        <Text style={styles.sectionTitleAr}>🗣️ المفردات المهمة:</Text>
        <Text style={styles.textBlockAr}>{`- كهرباء – Electricidad
- قابس – Enchufe
- مفتاح – Interruptor
- مصباح – Lámpara
- سلامة – Seguridad`}</Text>

        <Text style={styles.sectionTitle}>📚 MÓDULOS DETALLADOS:</Text>
        <Text style={styles.textBlock}>{`MÓDULO 1: FUNDAMENTOS DE LA ELECTRICIDAD
- Conceptos básicos: voltaje, corriente, resistencia
- Ley de Ohm y potencia eléctrica
- Tipos de corriente: continua y alterna
- Medición de magnitudes eléctricas
- Simbología eléctrica básica

MÓDULO 2: MATERIALES Y HERRAMIENTAS
- Cables y conductores eléctricos
- Tubos y canalizaciones
- Cajas de conexión y empalmes
- Herramientas manuales y eléctricas
- Equipos de medición y prueba

MÓDULO 3: INSTALACIONES ELÉCTRICAS BÁSICAS
- Instalación de enchufes e interruptores
- Conexión de lámparas y puntos de luz
- Instalación de ventiladores de techo
- Conexión de electrodomésticos
- Instalación de timbres y alarmas

MÓDULO 4: CUADROS ELÉCTRICOS
- Componentes del cuadro eléctrico
- Interruptores automáticos y diferenciales
- Instalación y conexión de cuadros
- Protecciones eléctricas básicas
- Mantenimiento de cuadros eléctricos

MÓDULO 5: ILUMINACIÓN ELÉCTRICA
- Tipos de lámparas y luminarias
- Instalación de iluminación interior
- Instalación de iluminación exterior
- Sistemas de iluminación de emergencia
- Control de iluminación (dimmers, sensores)

MÓDULO 6: INSTALACIONES ESPECIALES
- Instalación de aire acondicionado
- Instalación de calefacción eléctrica
- Sistemas de seguridad y vigilancia
- Instalación de antenas y TV
- Sistemas de domótica básica

MÓDULO 7: MANTENIMIENTO Y REPARACIÓN
- Diagnóstico de averías eléctricas
- Reparación de enchufes e interruptores
- Cambio de lámparas y luminarias
- Reparación de electrodomésticos básicos
- Mantenimiento preventivo

MÓDULO 8: SEGURIDAD ELÉCTRICA
- Normativas de seguridad eléctrica
- Equipos de protección personal
- Procedimientos de trabajo seguro
- Primeros auxilios en caso de accidente
- Prevención de incendios eléctricos`}</Text>

        <Text style={styles.sectionTitle}>⚡ CONCEPTOS BÁSICOS:</Text>
        <Text style={styles.textBlock}>{`MAGNITUDES ELÉCTRICAS:
- Voltaje (V) / جهد كهربائي – Fuerza que mueve los electrones
- Corriente (A) / تيار كهربائي – Flujo de electrones
- Resistencia (Ω) / مقاومة كهربائية – Oposición al paso de corriente
- Potencia (W) / قدرة كهربائية – Energía consumida por unidad de tiempo
- Frecuencia (Hz) / تردد – Número de ciclos por segundo

LEY DE OHM:
- V = I × R / ج = ت × م – Voltaje = Corriente × Resistencia
- I = V ÷ R / ت = ج ÷ م – Corriente = Voltaje ÷ Resistencia
- R = V ÷ I / م = ج ÷ ت – Resistencia = Voltaje ÷ Corriente

TIPOS DE CORRIENTE:
- Corriente continua (DC) / تيار مستمر – Flujo constante en una dirección
- Corriente alterna (AC) / تيار متناوب – Flujo que cambia de dirección
- Fase / طور – Línea de corriente alterna
- Neutro / محايد – Línea de retorno
- Tierra / أرض – Conexión de seguridad`}</Text>

        <Text style={styles.sectionTitle}>🔌 MATERIALES ELÉCTRICOS:</Text>
        <Text style={styles.textBlock}>{`CABLES Y CONDUCTORES:
- Cable unipolar / كابل أحادي – Un conductor aislado
- Cable bipolar / كابل ثنائي – Dos conductores
- Cable tripolar / كابل ثلاثي – Tres conductores (fase, neutro, tierra)
- Cable flexible / كابل مرن – Para conexiones móviles
- Cable rígido / كابل صلب – Para instalaciones fijas

TUBOS Y CANALIZACIONES:
- Tubo PVC / أنبوب PVC – Aislamiento y protección
- Tubo metálico / أنبوب معدني – Mayor protección
- Canaleta / قناة – Para instalaciones superficiales
- Bandeja portacables / صينية كابلات – Para múltiples cables
- Conduit / قناة مرنة – Para instalaciones complejas

CAJAS Y EMPALMES:
- Caja de conexión / صندوق توصيل – Para unir cables
- Caja de registro / صندوق تسجيل – Para acceso a conexiones
- Caja de derivación / صندوق تفرع – Para dividir circuitos
- Empalmes / وصلات – Conexión de cables
- Terminales / أطراف – Conexión segura`}</Text>

        <Text style={styles.sectionTitle}>🛠️ HERRAMIENTAS ELÉCTRICAS:</Text>
        <Text style={styles.textBlock}>{`HERRAMIENTAS MANUALES:
- Destornillador / مفك براغي – Para tornillos y conexiones
- Alicates / كماشة – Para sujetar y cortar cables
- Pelacables / قاطع عزل – Para quitar aislamiento
- Crimpadora / آلة كبس – Para terminales
- Cinta aislante / شريط عازل – Para aislar conexiones

HERRAMIENTAS ELÉCTRICAS:
- Taladro / مثقاب – Para perforar paredes
- Sierra de calar / منشار منحني – Para cortes en cajas
- Multímetro / مقياس متعدد – Para mediciones eléctricas
- Buscador de tensión / كاشف جهد – Para detectar corriente
- Probador de continuidad / مقياس استمرارية – Para verificar circuitos

EQUIPOS DE MEDICIÓN:
- Voltímetro / مقياس جهد – Medir voltaje
- Amperímetro / مقياس تيار – Medir corriente
- Óhmetro / مقياس مقاومة – Medir resistencia
- Vatímetro / مقياس قدرة – Medir potencia
- Frecuencímetro / مقياس تردد – Medir frecuencia`}</Text>

        <Text style={styles.sectionTitle}>🏠 INSTALACIONES DOMÉSTICAS:</Text>
        <Text style={styles.textBlock}>{`INSTALACIÓN DE ENCHUFES:
- Enchufe simple / قابس بسيط – Una toma de corriente
- Enchufe doble / قابس مزدوج – Dos tomas de corriente
- Enchufe con interruptor / قابس مع مفتاح – Control individual
- Enchufe USB / قابس USB – Para cargar dispositivos
- Enchufe de cocina / قابس مطبخ – Para electrodomésticos

INSTALACIÓN DE INTERRUPTORES:
- Interruptor simple / مفتاح بسيط – Control de una lámpara
- Interruptor doble / مفتاح مزدوج – Control de dos lámparas
- Interruptor de tres vías / مفتاح ثلاثي – Control desde dos puntos
- Interruptor con indicador / مفتاح مع مؤشر – Luz indicadora
- Interruptor de escalera / مفتاح سلم – Control automático

INSTALACIÓN DE LÁMPARAS:
- Lámpara de techo / مصباح سقف – Iluminación general
- Lámpara de pared / مصباح حائط – Iluminación decorativa
- Lámpara de mesa / مصباح طاولة – Iluminación local
- Lámpara de emergencia / مصباح طوارئ – Iluminación de seguridad
- Lámpara LED / مصباح LED – Eficiencia energética`}</Text>

        <Text style={styles.sectionTitle}>⚡ CUADROS ELÉCTRICOS:</Text>
        <Text style={styles.textBlock}>{`COMPONENTES PRINCIPALES:
- Interruptor general / مفتاح عام – Control principal de la instalación
- Interruptor automático / قاطع تلقائي – Protección contra sobrecargas
- Interruptor diferencial / قاطع تفاضلي – Protección contra fugas
- Fusibles / صمامات – Protección adicional
- Relé térmico / مرحل حراري – Protección de motores

INSTALACIÓN DEL CUADRO:
- Ubicación del cuadro / موقع اللوحة – Accesible y ventilado
- Conexión de entrada / توصيل الدخول – Desde la red eléctrica
- Distribución de circuitos / توزيع الدوائر – Por zonas de la vivienda
- Conexión de salidas / توصيل المخارج – Hacia enchufes e interruptores
- Pruebas de funcionamiento / اختبارات التشغيل – Verificar instalación

MANTENIMIENTO:
- Revisión periódica / فحص دوري – Comprobar estado de componentes
- Limpieza del cuadro / تنظيف اللوحة – Eliminar polvo y suciedad
- Verificación de conexiones / التحقق من الوصلات – Asegurar buen contacto
- Prueba de protecciones / اختبار الحماية – Verificar funcionamiento
- Actualización de componentes / تحديث المكونات – Si es necesario`}</Text>

        <Text style={styles.sectionTitle}>💡 SISTEMAS DE ILUMINACIÓN:</Text>
        <Text style={styles.textBlock}>{`TIPOS DE LÁMPARAS:
- Incandescente / متوهجة – Luz cálida, alto consumo
- Fluorescente / فلورية – Luz fría, bajo consumo
- LED / LED – Muy eficiente, larga duración
- Halógena / هالوجين – Luz intensa, color natural
- Descarga / تفريغ – Para iluminación industrial

SISTEMAS DE CONTROL:
- Interruptor simple / مفتاح بسيط – Encendido/apagado
- Interruptor con regulador / مفتاح مع منظم – Control de intensidad
- Sensor de movimiento / مستشعر حركة – Encendido automático
- Sensor de crepúsculo / مستشعر شفق – Encendido por oscuridad
- Control remoto / تحكم عن بعد – Mando a distancia

ILUMINACIÓN DE EMERGENCIA:
- Lámpara de emergencia / مصباح طوارئ – Funciona con batería
- Sistema centralizado / نظام مركزي – Control desde cuadro
- Tiempo de autonomía / وقت الاستقلالية – Duración de funcionamiento
- Pruebas periódicas / اختبارات دورية – Verificar funcionamiento
- Mantenimiento de baterías / صيانة البطاريات – Reemplazo cuando sea necesario`}</Text>

        <Text style={styles.sectionTitle}>🔧 REPARACIONES ELÉCTRICAS:</Text>
        <Text style={styles.textBlock}>{`DIAGNÓSTICO DE AVERÍAS:
- Falta de tensión / انعدام الجهد – Verificar suministro eléctrico
- Cortocircuito / دارة قصيرة – Conexión directa entre fase y neutro
- Fuga a tierra / تسرب للأرض – Corriente que se pierde
- Sobrecalentamiento / ارتفاع درجة الحرارة – Exceso de corriente
- Ruidos eléctricos / ضوضاء كهربائية – Interferencias

REPARACIÓN DE ENCHUFES:
- Cambio de enchufe / تغيير قابس – Reemplazar enchufe dañado
- Reparación de conexiones / إصلاح الوصلات – Ajustar conexiones sueltas
- Limpieza de contactos / تنظيف نقاط التلامس – Eliminar óxido
- Verificación de aislamiento / التحقق من العزل – Comprobar estado
- Prueba de funcionamiento / اختبار التشغيل – Verificar reparación

REPARACIÓN DE INTERRUPTORES:
- Cambio de interruptor / تغيير مفتاح – Reemplazar interruptor defectuoso
- Ajuste de mecanismo / ضبط الآلية – Corregir funcionamiento
- Limpieza de contactos / تنظيف نقاط التلامس – Mejorar contacto
- Verificación de conexiones / التحقق من الوصلات – Asegurar conexión
- Prueba de funcionamiento / اختبار التشغيل – Comprobar reparación`}</Text>

        <Text style={styles.sectionTitle}>⚠️ SEGURIDAD ELÉCTRICA:</Text>
        <Text style={styles.textBlock}>{`NORMAS DE SEGURIDAD:
- Cortar corriente antes de trabajar / قطع التيار قبل العمل
- Usar herramientas aisladas / استخدام أدوات معزولة
- Verificar ausencia de tensión / التحقق من انعدام الجهد
- Trabajar con una sola mano / العمل بيد واحدة
- Mantener orden y limpieza / الحفاظ على النظام والنظافة

EQUIPOS DE PROTECCIÓN:
- Guantes aislantes / قفازات عازلة – Protección de manos
- Gafas de seguridad / نظارات أمان – Protección ocular
- Calzado aislante / أحذية عازلة – Protección de pies
- Ropa de trabajo / ملابس عمل – Sin elementos metálicos
- Casco de seguridad / خوذة أمان – Protección de cabeza

PROCEDIMIENTOS DE TRABAJO:
- Planificación del trabajo / تخطيط العمل – Definir tareas y riesgos
- Aislamiento de circuitos / عزل الدوائر – Cortar corriente necesaria
- Señalización / إشارات – Indicar trabajos en curso
- Verificación de ausencia de tensión / التحقق من انعدام الجهد
- Liberación de circuitos / تحرير الدوائر – Restaurar suministro`}</Text>

        <Text style={styles.sectionTitle}>🏢 INSTALACIONES INDUSTRIALES:</Text>
        <Text style={styles.textBlock}>{`SISTEMAS TRIFÁSICOS:
- Conexión estrella / توصيل نجمة – Tres fases y neutro
- Conexión triángulo / توصيل مثلث – Tres fases sin neutro
- Factor de potencia / معامل القدرة – Eficiencia del sistema
- Compensación de reactiva / تعويض القدرة التفاعلية
- Medición de energía / قياس الطاقة

MOTORES ELÉCTRICOS:
- Motor monofásico / محرك أحادي الطور – Para pequeñas potencias
- Motor trifásico / محرك ثلاثي الطور – Para potencias medias y altas
- Arranque directo / تشغيل مباشر – Para motores pequeños
- Arranque estrella-triángulo / تشغيل نجمة-مثلث – Para motores grandes
- Variador de frecuencia / محول تردد – Control de velocidad

PROTECCIONES INDUSTRIALES:
- Relé de protección / مرحل حماية – Protección específica
- Interruptor magnetotérmico / قاطع مغناطيسي حراري
- Fusibles de alta tensión / صمامات جهد عالي
- Pararrayos / مانع صواعق – Protección contra rayos
- Sistema de puesta a tierra / نظام التأريض – Seguridad`}</Text>

        <Text style={styles.sectionTitle}>🌱 ENERGÍAS RENOVABLES:</Text>
        <Text style={styles.textBlock}>{`SISTEMAS SOLARES:
- Paneles fotovoltaicos / ألواح شمسية – Generación de electricidad
- Inversor solar / محول شمسي – Conversión de corriente
- Baterías solares / بطاريات شمسية – Almacenamiento de energía
- Regulador de carga / منظم شحن – Control de baterías
- Conexión a red / توصيل بالشبكة – Venta de excedentes

SISTEMAS EÓLICOS:
- Aerogenerador / مولد رياح – Generación con viento
- Controlador de carga / منظم شحن – Gestión de energía
- Baterías de almacenamiento / بطاريات تخزين
- Inversor híbrido / محول هجين – Múltiples fuentes
- Sistema de monitoreo / نظام مراقبة – Control remoto

EFICIENCIA ENERGÉTICA:
- Iluminación LED / إضاءة LED – Bajo consumo
- Electrodomésticos eficientes / أجهزة منزلية فعالة
- Sistemas de domótica / أنظمة أتمتة منزلية
- Aislamiento térmico / عزل حراري – Reducir pérdidas
- Gestión inteligente / إدارة ذكية – Optimizar consumo`}</Text>

        <Text style={styles.sectionTitle}>💼 OPORTUNIDADES LABORALES:</Text>
        <Text style={styles.textBlock}>{`PUESTOS DE TRABAJO:
- Electricista de instalaciones / كهربائي تركيبات
- Electricista de mantenimiento / كهربائي صيانة
- Técnico de cuadros eléctricos / فني لوحات كهربائية
- Instalador de sistemas solares / مركب أنظمة شمسية
- Técnico de domótica / فني أتمتة منزلية

ESPECIALIZACIONES:
- Electricidad industrial / كهرباء صناعية
- Electricidad de baja tensión / كهرباء جهد منخفض
- Electricidad de alta tensión / كهرباء جهد عالي
- Instalaciones de seguridad / تركيبات أمان
- Sistemas de control / أنظمة تحكم

EMPRENDIMIENTO:
- Empresa de instalaciones eléctricas / شركة تركيبات كهربائية
- Servicios de mantenimiento / خدمات صيانة
- Venta de material eléctrico / بيع المواد الكهربائية
- Consultoría energética / استشارات طاقية
- Formación profesional / تدريب مهني

CERTIFICACIONES:
- Certificado de profesionalidad / شهادة مهنية
- Carné de instalador / رخصة مركب
- Certificación en seguridad / شهادة في السلامة
- Especialización en energías renovables / تخصص في الطاقات المتجددة
- Formación continua / تدريب مستمر`}</Text>

        <Text style={styles.sectionTitleAr}>📚 الوحدات المفصلة:</Text>
        <Text style={styles.textBlockAr}>{`الوحدة الأولى: أساسيات الكهرباء
- المفاهيم الأساسية: الجهد، التيار، المقاومة
- قانون أوم والقدرة الكهربائية
- أنواع التيار: مستمر ومتناوب
- قياس المقادير الكهربائية
- الرموز الكهربائية الأساسية

الوحدة الثانية: المواد والأدوات
- الكابلات والموصلات الكهربائية
- الأنابيب والقنوات
- صناديق التوصيل والوصلات
- الأدوات اليدوية والكهربائية
- معدات القياس والاختبار

الوحدة الثالثة: التركيبات الكهربائية الأساسية
- تركيب القوابس والمفاتيح
- توصيل المصابيح ونقاط الإضاءة
- تركيب مراوح السقف
- توصيل الأجهزة المنزلية
- تركيب الأجراس والإنذارات

الوحدة الرابعة: لوحات الكهرباء
- مكونات لوحة الكهرباء
- القواطع التلقائية والتفاضلية
- تركيب وتوصيل اللوحات
- الحماية الكهربائية الأساسية
- صيانة لوحات الكهرباء

الوحدة الخامسة: الإضاءة الكهربائية
- أنواع المصابيح والثريات
- تركيب الإضاءة الداخلية
- تركيب الإضاءة الخارجية
- أنظمة الإضاءة الطارئة
- التحكم في الإضاءة (منظمات، مستشعرات)

الوحدة السادسة: التركيبات الخاصة
- تركيب مكيف الهواء
- تركيب التدفئة الكهربائية
- أنظمة الأمان والمراقبة
- تركيب الهوائيات والتلفاز
- أنظمة الأتمتة المنزلية الأساسية

الوحدة السابعة: الصيانة والإصلاح
- تشخيص أعطال الكهرباء
- إصلاح القوابس والمفاتيح
- تغيير المصابيح والثريات
- إصلاح الأجهزة المنزلية الأساسية
- الصيانة الوقائية

الوحدة الثامنة: السلامة الكهربائية
- لوائح السلامة الكهربائية
- معدات الحماية الشخصية
- إجراءات العمل الآمن
- الإسعافات الأولية في حالة الحوادث
- منع الحرائق الكهربائية`}</Text>

        <Text style={styles.sectionTitleAr}>⚡ المفاهيم الأساسية:</Text>
        <Text style={styles.textBlockAr}>{`المقادير الكهربائية:
- جهد كهربائي (V) – القوة التي تحرك الإلكترونات
- تيار كهربائي (A) – تدفق الإلكترونات
- مقاومة كهربائية (Ω) – المعارضة لمرور التيار
- قدرة كهربائية (W) – الطاقة المستهلكة لكل وحدة زمن
- تردد (Hz) – عدد الدورات في الثانية

قانون أوم:
- ج = ت × م – الجهد = التيار × المقاومة
- ت = ج ÷ م – التيار = الجهد ÷ المقاومة
- م = ج ÷ ت – المقاومة = الجهد ÷ التيار

أنواع التيار:
- تيار مستمر (DC) – تدفق ثابت في اتجاه واحد
- تيار متناوب (AC) – تدفق يتغير اتجاهه
- طور – خط التيار المتناوب
- محايد – خط العودة
- أرض – توصيل الأمان`}</Text>

        <Text style={styles.sectionTitleAr}>🔌 المواد الكهربائية:</Text>
        <Text style={styles.textBlockAr}>{`الكابلات والموصلات:
- كابل أحادي – موصل واحد معزول
- كابل ثنائي – موصلان
- كابل ثلاثي – ثلاثة موصلات (طور، محايد، أرض)
- كابل مرن – للتوصيلات المتحركة
- كابل صلب – للتركيبات الثابتة

الأنابيب والقنوات:
- أنبوب PVC – عزل وحماية
- أنبوب معدني – حماية أكبر
- قناة – للتركيبات السطحية
- صينية كابلات – لعدة كابلات
- قناة مرنة – للتركيبات المعقدة

الصناديق والوصلات:
- صندوق توصيل – لربط الكابلات
- صندوق تسجيل – للوصول للوصلات
- صندوق تفرع – لتقسيم الدوائر
- وصلات – ربط الكابلات
- أطراف – توصيل آمن`}</Text>

        <Text style={styles.sectionTitleAr}>🛠️ الأدوات الكهربائية:</Text>
        <Text style={styles.textBlockAr}>{`الأدوات اليدوية:
- مفك براغي – للبراغي والوصلات
- كماشة – للإمساك وقطع الكابلات
- قاطع عزل – لإزالة العزل
- آلة كبس – للأطراف
- شريط عازل – لعزل الوصلات

الأدوات الكهربائية:
- مثقاب – لحفر الجدران
- منشار منحني – لقطع الصناديق
- مقياس متعدد – للقياسات الكهربائية
- كاشف جهد – لكشف التيار
- مقياس استمرارية – للتحقق من الدوائر

معدات القياس:
- مقياس جهد – قياس الجهد
- مقياس تيار – قياس التيار
- مقياس مقاومة – قياس المقاومة
- مقياس قدرة – قياس القدرة
- مقياس تردد – قياس التردد`}</Text>

        <Text style={styles.sectionTitleAr}>🏠 التركيبات المنزلية:</Text>
        <Text style={styles.textBlockAr}>{`تركيب القوابس:
- قابس بسيط – مأخذ تيار واحد
- قابس مزدوج – مأخذي تيار
- قابس مع مفتاح – تحكم فردي
- قابس USB – لشحن الأجهزة
- قابس مطبخ – للأجهزة المنزلية

تركيب المفاتيح:
- مفتاح بسيط – تحكم بمصباح واحد
- مفتاح مزدوج – تحكم بمصباحين
- مفتاح ثلاثي – تحكم من نقطتين
- مفتاح مع مؤشر – ضوء مؤشر
- مفتاح سلم – تحكم تلقائي

تركيب المصابيح:
- مصباح سقف – إضاءة عامة
- مصباح حائط – إضاءة تزيينية
- مصباح طاولة – إضاءة محلية
- مصباح طوارئ – إضاءة أمان
- مصباح LED – كفاءة طاقية`}</Text>

        <Text style={styles.sectionTitleAr}>⚡ لوحات الكهرباء:</Text>
        <Text style={styles.textBlockAr}>{`المكونات الرئيسية:
- مفتاح عام – التحكم الرئيسي في التركيبة
- قاطع تلقائي – الحماية من الزيادة
- قاطع تفاضلي – الحماية من التسرب
- صمامات – حماية إضافية
- مرحل حراري – حماية المحركات

تركيب اللوحة:
- موقع اللوحة – قابل للوصول ومهوى
- توصيل الدخول – من الشبكة الكهربائية
- توزيع الدوائر – حسب مناطق المنزل
- توصيل المخارج – نحو القوابس والمفاتيح
- اختبارات التشغيل – التحقق من التركيبة

الصيانة:
- فحص دوري – التحقق من حالة المكونات
- تنظيف اللوحة – إزالة الغبار والأوساخ
- التحقق من الوصلات – التأكد من التلامس الجيد
- اختبار الحماية – التحقق من التشغيل
- تحديث المكونات – عند الحاجة`}</Text>

        <Text style={styles.sectionTitleAr}>💡 أنظمة الإضاءة:</Text>
        <Text style={styles.textBlockAr}>{`أنواع المصابيح:
- متوهجة – ضوء دافئ، استهلاك عالي
- فلورية – ضوء بارد، استهلاك منخفض
- LED – فعالة جداً، عمر طويل
- هالوجين – ضوء مكثف، لون طبيعي
- تفريغ – للإضاءة الصناعية

أنظمة التحكم:
- مفتاح بسيط – تشغيل/إيقاف
- مفتاح مع منظم – التحكم في الشدة
- مستشعر حركة – تشغيل تلقائي
- مستشعر شفق – تشغيل بالظلام
- تحكم عن بعد – جهاز تحكم

إضاءة الطوارئ:
- مصباح طوارئ – يعمل بالبطارية
- نظام مركزي – تحكم من اللوحة
- وقت الاستقلالية – مدة التشغيل
- اختبارات دورية – التحقق من التشغيل
- صيانة البطاريات – الاستبدال عند الحاجة`}</Text>

        <Text style={styles.sectionTitleAr}>🔧 إصلاحات الكهرباء:</Text>
        <Text style={styles.textBlockAr}>{`تشخيص الأعطال:
- انعدام الجهد – التحقق من التغذية الكهربائية
- دارة قصيرة – توصيل مباشر بين الطور والمحايد
- تسرب للأرض – تيار يضيع
- ارتفاع درجة الحرارة – زيادة في التيار
- ضوضاء كهربائية – تداخلات

إصلاح القوابس:
- تغيير قابس – استبدال قابس تالف
- إصلاح الوصلات – ضبط الوصلات المفككة
- تنظيف نقاط التلامس – إزالة الصدأ
- التحقق من العزل – فحص الحالة
- اختبار التشغيل – التحقق من الإصلاح

إصلاح المفاتيح:
- تغيير مفتاح – استبدال مفتاح معطل
- ضبط الآلية – تصحيح التشغيل
- تنظيف نقاط التلامس – تحسين التلامس
- التحقق من الوصلات – التأكد من التوصيل
- اختبار التشغيل – التحقق من الإصلاح`}</Text>

        <Text style={styles.sectionTitleAr}>⚠️ السلامة الكهربائية:</Text>
        <Text style={styles.textBlockAr}>{`قواعد السلامة:
- قطع التيار قبل العمل
- استخدام أدوات معزولة
- التحقق من انعدام الجهد
- العمل بيد واحدة
- الحفاظ على النظام والنظافة

معدات الحماية:
- قفازات عازلة – حماية اليدين
- نظارات أمان – حماية العينين
- أحذية عازلة – حماية القدمين
- ملابس عمل – بدون عناصر معدنية
- خوذة أمان – حماية الرأس

إجراءات العمل:
- تخطيط العمل – تحديد المهام والمخاطر
- عزل الدوائر – قطع التيار المطلوب
- إشارات – إشارة الأعمال الجارية
- التحقق من انعدام الجهد
- تحرير الدوائر – استعادة التغذية`}</Text>

        <Text style={styles.sectionTitleAr}>🏢 التركيبات الصناعية:</Text>
        <Text style={styles.textBlockAr}>{`الأنظمة ثلاثية الطور:
- توصيل نجمة – ثلاثة أطوار ومحايد
- توصيل مثلث – ثلاثة أطوار بدون محايد
- معامل القدرة – كفاءة النظام
- تعويض القدرة التفاعلية
- قياس الطاقة

المحركات الكهربائية:
- محرك أحادي الطور – للقدرات الصغيرة
- محرك ثلاثي الطور – للقدرات المتوسطة والعالية
- تشغيل مباشر – للمحركات الصغيرة
- تشغيل نجمة-مثلث – للمحركات الكبيرة
- محول تردد – التحكم في السرعة

الحماية الصناعية:
- مرحل حماية – حماية خاصة
- قاطع مغناطيسي حراري
- صمامات جهد عالي
- مانع صواعق – الحماية من الصواعق
- نظام التأريض – الأمان`}</Text>

        <Text style={styles.sectionTitleAr}>🌱 الطاقات المتجددة:</Text>
        <Text style={styles.textBlockAr}>{`الأنظمة الشمسية:
- ألواح شمسية – توليد الكهرباء
- محول شمسي – تحويل التيار
- بطاريات شمسية – تخزين الطاقة
- منظم شحن – التحكم في البطاريات
- توصيل بالشبكة – بيع الفائض

الأنظمة الريحية:
- مولد رياح – التوليد بالرياح
- منظم شحن – إدارة الطاقة
- بطاريات تخزين
- محول هجين – مصادر متعددة
- نظام مراقبة – تحكم عن بعد

الكفاءة الطاقية:
- إضاءة LED – استهلاك منخفض
- أجهزة منزلية فعالة
- أنظمة أتمتة منزلية
- عزل حراري – تقليل الخسائر
- إدارة ذكية – تحسين الاستهلاك`}</Text>

        <Text style={styles.sectionTitleAr}>💼 فرص العمل:</Text>
        <Text style={styles.textBlockAr}>{`الوظائف:
- كهربائي تركيبات
- كهربائي صيانة
- فني لوحات كهربائية
- مركب أنظمة شمسية
- فني أتمتة منزلية

التخصصات:
- كهرباء صناعية
- كهرباء جهد منخفض
- كهرباء جهد عالي
- تركيبات أمان
- أنظمة تحكم

ريادة الأعمال:
- شركة تركيبات كهربائية
- خدمات صيانة
- بيع المواد الكهربائية
- استشارات طاقية
- تدريب مهني

الشهادات:
- شهادة مهنية
- رخصة مركب
- شهادة في السلامة
- تخصص في الطاقات المتجددة
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
