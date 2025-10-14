import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CursoCarpinteriaScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <LinearGradient
        colors={['#795548', '#5D4037']}
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
            <Text style={styles.headerTitle}>Curso de Carpintería</Text>
            <Text style={styles.headerTitleAr}>دورة النجارة</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>📌 ¿Qué aprenderás?</Text>
        <Text style={styles.textBlock}>{`
1. Trabajo con madera y herramientas.
2. Técnicas de corte y ensamblaje.
3. Reparación de muebles básicos.
4. Uso de herramientas eléctricas.
5. Seguridad en carpintería.`}</Text>
        <Text style={styles.sectionTitle}>📚 Módulos:</Text>
        <Text style={styles.textBlock}>{`- Trabajo con madera.
- Herramientas manuales.
- Herramientas eléctricas.
- Reparaciones básicas.
- Seguridad.`}</Text>
        <Text style={styles.sectionTitle}>🗣️ Vocabulario útil:</Text>
        <Text style={styles.textBlock}>{`- Madera – خشب
- Herramienta – أداة
- Sierra – منشار
- Clavo – مسمار
- Seguridad – سلامة`}</Text>
        <Text style={styles.sectionTitleAr}>📌 ماذا ستتعلم؟</Text>
        <Text style={styles.textBlockAr}>{`
1. العمل مع الخشب والأدوات.
2. تقنيات القطع والتجميع.
3. إصلاح الأثاث الأساسي.
4. استخدام الأدوات الكهربائية.
5. السلامة في النجارة.`}</Text>
        <Text style={styles.sectionTitleAr}>📚 الوحدات:</Text>
        <Text style={styles.textBlockAr}>{`- العمل مع الخشب.
- الأدوات اليدوية.
- الأدوات الكهربائية.
- الإصلاحات الأساسية.
- السلامة.`}</Text>
        <Text style={styles.sectionTitleAr}>🗣️ المفردات المهمة:</Text>
        <Text style={styles.textBlockAr}>{`- خشب – Madera
- أداة – Herramienta
- منشار – Sierra
- مسمار – Clavo
- سلامة – Seguridad`}</Text>

        <Text style={styles.sectionTitle}>📚 MÓDULOS DETALLADOS:</Text>
        <Text style={styles.textBlock}>{`MÓDULO 1: FUNDAMENTOS DE LA CARPINTERÍA
- Tipos de madera y sus características
- Propiedades físicas y mecánicas
- Secado y estabilización de la madera
- Defectos y cómo identificarlos
- Selección de madera para proyectos

MÓDULO 2: HERRAMIENTAS MANUALES BÁSICAS
- Serruchos y sierras de mano
- Cepillos y lijadoras manuales
- Martillos, destornilladores y alicates
- Escuadras, niveles y metros
- Mantenimiento de herramientas manuales

MÓDULO 3: HERRAMIENTAS ELÉCTRICAS PORTÁTILES
- Sierra circular y sierra de calar
- Taladro y atornillador
- Lijadora orbital y de banda
- Router y fresadora
- Seguridad en herramientas eléctricas

MÓDULO 4: HERRAMIENTAS ESTACIONARIAS
- Sierra de mesa y sierra de cinta
- Cepilladora y regruesadora
- Torno de madera
- Fresadora de columna
- Mantenimiento de máquinas

MÓDULO 5: TÉCNICAS DE CORTE Y ENSAMBLAJE
- Corte recto y corte angular
- Ensamblajes básicos (cola y clavija)
- Ensamblajes avanzados (cola y mortaja)
- Uniones de esquina y uniones en T
- Técnicas de encolado y prensado

MÓDULO 6: ACABADOS Y TRATAMIENTOS
- Lijado y preparación de superficies
- Barnices y lacas
- Aceites y ceras naturales
- Tintes y colorantes
- Técnicas de envejecimiento

MÓDULO 7: PROYECTOS PRÁCTICOS
- Estanterías y repisas
- Mesas y sillas básicas
- Cajas y cajones
- Marcos y molduras
- Proyectos personalizados

MÓDULO 8: REPARACIÓN Y RESTAURACIÓN
- Diagnóstico de daños
- Reparación de muebles antiguos
- Restauración de superficies
- Consolidación de estructuras
- Conservación preventiva`}</Text>

        <Text style={styles.sectionTitle}>🪵 TIPOS DE MADERA:</Text>
        <Text style={styles.textBlock}>{`MADERAS BLANDAS:
- Pino / صنوبر – Fácil de trabajar, económica
- Abeto / شوح – Resistente, buena para construcción
- Cedro / أرز – Aroma agradable, resistente a insectos
- Alerce / صنوبر لاريكس – Muy resistente a la humedad
- Picea / شجرة التنوب – Ligera, buena para instrumentos

MADERAS DURAS:
- Roble / بلوط – Muy resistente, noble
- Nogal / جوز – Hermosa veta, excelente calidad
- Cerezo / كرز – Color cálido, fácil de trabajar
- Arce / قيقب – Clara, buena para instrumentos
- Haya / زان – Dura, buena para herramientas

MADERAS EXÓTICAS:
- Caoba / ماهوغاني – Muy valiosa, color rojizo
- Ébano / خشب الأبنوس – Muy dura, color negro
- Palisandro / خشب الورد – Hermosa veta, aromática
- Teak / خشب الساج – Resistente a la intemperie
- Wengué / ونغه – Muy oscura, elegante`}</Text>

        <Text style={styles.sectionTitle}>🛠️ HERRAMIENTAS PRINCIPALES:</Text>
        <Text style={styles.textBlock}>{`HERRAMIENTAS DE CORTE:
- Serrucho de costilla / منشار ظهر – Para cortes precisos
- Serrucho de punta / منشار سن – Para cortes en espacios pequeños
- Sierra de calar / منشار منحني – Para cortes curvos
- Sierra circular / منشار دائري – Para cortes rectos rápidos
- Sierra de cinta / منشار شريطي – Para cortes complejos

HERRAMIENTAS DE DESBASTE:
- Cepillo manual / مخرطة يدوية – Para alisar superficies
- Cepillo eléctrico / مخرطة كهربائية – Para trabajos grandes
- Lijadora orbital / صقل مداري – Para acabados finos
- Lijadora de banda / صقل شريطي – Para desbaste rápido
- Router / راوتر – Para molduras y ranuras

HERRAMIENTAS DE MEDICIÓN:
- Metro / شريط قياس – Para mediciones largas
- Escuadra / زاوية قائمة – Para ángulos de 90°
- Nivel / ميزان – Para nivelación
- Compás / برجل – Para círculos y arcos
- Calibre / فرجار – Para mediciones precisas`}</Text>

        <Text style={styles.sectionTitle}>🔧 TÉCNICAS DE ENSAMBLAJE:</Text>
        <Text style={styles.textBlock}>{`ENSAMBLAJES BÁSICOS:
- Cola y clavija / غراء ودبوس – Unión simple y resistente
- Cola y mortaja / غراء ولسان – Unión tradicional
- Cola de cola de milano / غراء ذيل الحمامة – Unión decorativa
- Ensamblaje a media madera / تجميع نصف خشب – Para esquinas
- Ensamblaje de caja / تجميع صندوق – Para cajones

ENSAMBLAJES AVANZADOS:
- Cola de milano / ذيل الحمامة – Muy resistente
- Cola de milano oculta / ذيل حمامة مخفي – Elegante
- Ensamblaje de cola de golondrina / ذيل السنونو – Tradicional
- Ensamblaje de espiga y mortaja / لسان ولسان – Clásico
- Ensamblaje de cola de pato / ذيل البط – Para marcos

TÉCNICAS DE ENCOLADO:
- Tipos de cola / أنواع الغراء – PVA, epoxi, resorcinol
- Preparación de superficies / تحضير الأسطح
- Aplicación de cola / تطبيق الغراء
- Tiempo de secado / وقت التجفيف
- Limpieza de excedentes / تنظيف الفائض`}</Text>

        <Text style={styles.sectionTitle}>🎨 ACABADOS Y TRATAMIENTOS:</Text>
        <Text style={styles.textBlock}>{`PREPARACIÓN DE SUPERFICIES:
- Lijado progresivo / صقل تدريجي – Grano 80, 120, 240
- Limpieza de polvo / تنظيف الغبار
- Sellado de poros / سد المسام
- Relleno de grietas / ملء الشقوق
- Imprimación / طبقة أساسية

BARNICES Y LACAS:
- Barniz al agua / ورنيش مائي – Ecológico, fácil aplicación
- Barniz al aceite / ورنيش زيتي – Resistente, acabado natural
- Laca nitrocelulósica / ورنيش نيترو – Secado rápido
- Laca poliuretánica / ورنيش بولي يوريثان – Muy resistente
- Barniz catalizado / ورنيش محفز – Profesional

ACEITES Y CERAS:
- Aceite de linaza / زيت الكتان – Natural, penetrante
- Aceite de tung / زيت تونغ – Muy resistente
- Cera de abejas / شمع العسل – Natural, aromática
- Cera de carnauba / شمع الكرنوبا – Muy dura
- Aceite danés / زيت دانماركي – Tradicional`}</Text>

        <Text style={styles.sectionTitle}>📐 PROYECTOS PRÁCTICOS:</Text>
        <Text style={styles.textBlock}>{`PROYECTOS BÁSICOS:
- Estantería simple / رف بسيط – Corte recto y ensamblaje
- Caja de herramientas / صندوق أدوات – Uniones de esquina
- Marco de fotos / إطار صورة – Ensamblaje de cola de milano
- Taburete / كرسي صغير – Estructura básica
- Organizador de escritorio / منظم مكتب – Múltiples compartimentos

PROYECTOS INTERMEDIOS:
- Mesa de centro / طاولة وسط – Ensamblaje de marco
- Silla de comedor / كرسي طعام – Estructura compleja
- Cómoda / خزانة ملابس – Cajones y uniones
- Estantería modular / رف وحدات – Sistema modular
- Mesa de trabajo / طاولة عمل – Superficie grande

PROYECTOS AVANZADOS:
- Escritorio / مكتب – Múltiples cajones
- Cama / سرير – Estructura robusta
- Armario empotrado / خزانة مدمجة – Medidas precisas
- Escalera / سلالم – Cálculos complejos
- Mueble de cocina / أثاث مطبخ – Múltiples funciones`}</Text>

        <Text style={styles.sectionTitle}>🔧 REPARACIÓN Y RESTAURACIÓN:</Text>
        <Text style={styles.textBlock}>{`DIAGNÓSTICO DE DAÑOS:
- Identificación de problemas / تحديد المشاكل
- Evaluación de la estructura / تقييم الهيكل
- Análisis de materiales / تحليل المواد
- Plan de restauración / خطة الترميم
- Estimación de costos / تقدير التكاليف

TÉCNICAS DE REPARACIÓN:
- Consolidación de juntas / تثبيت المفاصل
- Reparación de grietas / إصلاح الشقوق
- Reemplazo de piezas / استبدال القطع
- Refuerzo estructural / تعزيز هيكلي
- Limpieza de superficies / تنظيف الأسطح

RESTAURACIÓN DE ACABADOS:
- Eliminación de barnices / إزالة الورنيش
- Reparación de marquetería / إصلاح التطعيم
- Restauración de dorados / ترميم الذهب
- Conservación de patinas / الحفاظ على الباتينا
- Protección final / الحماية النهائية`}</Text>

        <Text style={styles.sectionTitle}>⚠️ SEGURIDAD EN CARPINTERÍA:</Text>
        <Text style={styles.textBlock}>{`EQUIPOS DE PROTECCIÓN:
- Gafas de seguridad / نظارات أمان – Protección ocular
- Mascarilla antipolvo / قناع مضاد للغبار – Protección respiratoria
- Guantes de trabajo / قفازات عمل – Protección de manos
- Auriculares / سماعات أذن – Protección auditiva
- Calzado de seguridad / أحذية أمان – Protección de pies

NORMAS DE SEGURIDAD:
- Mantener orden y limpieza / الحفاظ على النظام والنظافة
- Revisar herramientas antes de usar / فحص الأدوات قبل الاستخدام
- Usar herramientas correctamente / استخدام الأدوات بشكل صحيح
- Mantener distancia de seguridad / الحفاظ على مسافة الأمان
- Conocer procedimientos de emergencia / معرفة إجراءات الطوارئ

PREVENCIÓN DE ACCIDENTES:
- Bloquear máquinas cuando no se usen / إيقاف الآلات عند عدم الاستخدام
- Mantener cables eléctricos en buen estado / الحفاظ على الكابلات الكهربائية
- Usar iluminación adecuada / استخدام إضاءة مناسبة
- Ventilar el taller / تهوية الورشة
- Tener botiquín de primeros auxilios / وجود صندوق إسعافات أولية`}</Text>

        <Text style={styles.sectionTitle}>💰 GESTIÓN DE MATERIALES:</Text>
        <Text style={styles.textBlock}>{`SELECCIÓN DE MATERIALES:
- Calidad de la madera / جودة الخشب
- Dimensiones necesarias / الأبعاد المطلوبة
- Costo por proyecto / التكلفة لكل مشروع
- Disponibilidad de materiales / توفر المواد
- Sostenibilidad / الاستدامة

ALMACENAMIENTO:
- Condiciones ambientales / الظروف البيئية
- Organización por tipos / التنظيم حسب الأنواع
- Protección contra humedad / الحماية من الرطوبة
- Control de inventario / مراقبة المخزون
- Rotación de materiales / دوران المواد

OPTIMIZACIÓN:
- Planificación de cortes / تخطيط القطع
- Aprovechamiento de restos / استغلال البقايا
- Minimización de desperdicios / تقليل الهدر
- Reutilización de materiales / إعادة استخدام المواد
- Reciclaje de residuos / إعادة تدوير النفايات`}</Text>

        <Text style={styles.sectionTitle}>🌱 CARPINTERÍA SOSTENIBLE:</Text>
        <Text style={styles.textBlock}>{`MATERIALES ECOLÓGICOS:
- Madera certificada FSC / خشب معتمد FSC
- Maderas locales / أخشاب محلية
- Materiales reciclados / مواد معاد تدويرها
- Adhesivos ecológicos / غراء صديق للبيئة
- Acabados naturales / تشطيبات طبيعية

TÉCNICAS SOSTENIBLES:
- Uso eficiente de materiales / استخدام فعال للمواد
- Minimización de residuos / تقليل النفايات
- Energía renovable / طاقة متجددة
- Herramientas eficientes / أدوات فعالة
- Procesos optimizados / عمليات محسنة

CERTIFICACIONES:
- FSC (Forest Stewardship Council) / مجلس رعاية الغابات
- PEFC (Programme for Endorsement of Forest Certification) / برنامج اعتماد شهادات الغابات
- Certificación de cadena de custodia / شهادة سلسلة العهدة
- Etiquetas ecológicas / علامات بيئية
- Auditorías ambientales / تدقيق بيئي`}</Text>

        <Text style={styles.sectionTitle}>💼 OPORTUNIDADES LABORALES:</Text>
        <Text style={styles.textBlock}>{`PUESTOS DE TRABAJO:
- Carpintero de obra / نجار بناء
- Ebanista / صانع أثاث
- Restaurador de muebles / مرمم أثاث
- Instalador de cocinas / مركب مطابخ
- Fabricante de molduras / صانع قوالب

ESPECIALIZACIONES:
- Carpintería de ventanas / نجارة النوافذ
- Carpintería de puertas / نجارة الأبواب
- Ebanistería artística / صناعة أثاث فني
- Restauración de antigüedades / ترميم التحف
- Carpintería de exteriores / نجارة خارجية

EMPRENDIMIENTO:
- Taller de carpintería / ورشة نجارة
- Tienda de muebles / متجر أثاث
- Servicios de restauración / خدمات الترميم
- Venta de herramientas / بيع الأدوات
- Formación profesional / تدريب مهني

CERTIFICACIONES:
- Certificado de profesionalidad / شهادة مهنية
- Especialización en técnicas específicas / تخصص في تقنيات محددة
- Certificación en seguridad / شهادة في السلامة
- Formación continua / تدريب مستمر
- Acreditación de calidad / اعتماد الجودة`}</Text>

        <Text style={styles.sectionTitleAr}>📚 الوحدات المفصلة:</Text>
        <Text style={styles.textBlockAr}>{`الوحدة الأولى: أساسيات النجارة
- أنواع الخشب وخصائصها
- الخصائص الفيزيائية والميكانيكية
- تجفيف واستقرار الخشب
- العيوب وكيفية تحديدها
- اختيار الخشب للمشاريع

الوحدة الثانية: الأدوات اليدوية الأساسية
- المناشير والمناشير اليدوية
- المخرطة والصنفرة اليدوية
- المطارق والمفكات والكماشة
- الزوايا والميزان والشريط
- صيانة الأدوات اليدوية

الوحدة الثالثة: الأدوات الكهربائية المحمولة
- منشار دائري ومنشار منحني
- مثقاب ومفك براغي
- صنفرة مدارية وشريطية
- راوتر وطاحونة
- السلامة في الأدوات الكهربائية

الوحدة الرابعة: الأدوات الثابتة
- منشار طاولة ومنشار شريطي
- مخرطة ومخفض سمك
- مخرطة خشب
- طاحونة عمودية
- صيانة الآلات

الوحدة الخامسة: تقنيات القطع والتجميع
- قطع مستقيم وقطع زاوي
- تجميعات أساسية (غراء ودبوس)
- تجميعات متقدمة (غراء ولسان)
- وصلات زاوية ووصلات T
- تقنيات اللصق والضغط

الوحدة السادسة: التشطيبات والمعالجات
- الصنفرة وتحضير الأسطح
- الورنيش واللك
- الزيوت والشموع الطبيعية
- الصبغات والألوان
- تقنيات التقادم

الوحدة السابعة: المشاريع العملية
- رفوف وأرفف
- طاولات وكراسي أساسية
- صناديق ودرج
- إطارات وقوالب
- مشاريع مخصصة

الوحدة الثامنة: الإصلاح والترميم
- تشخيص الأضرار
- إصلاح الأثاث القديم
- ترميم الأسطح
- تثبيت الهياكل
- الحفظ الوقائي`}</Text>

        <Text style={styles.sectionTitleAr}>🪵 أنواع الخشب:</Text>
        <Text style={styles.textBlockAr}>{`الأخشاب اللينة:
- صنوبر – سهل العمل، اقتصادي
- شوح – مقاوم، جيد للبناء
- أرز – رائحة طيبة، مقاوم للحشرات
- صنوبر لاريكس – مقاوم جداً للرطوبة
- شجرة التنوب – خفيف، جيد للآلات الموسيقية

الأخشاب الصلبة:
- بلوط – مقاوم جداً، نبيل
- جوز – عروق جميلة، جودة ممتازة
- كرز – لون دافئ، سهل العمل
- قيقب – فاتح، جيد للآلات الموسيقية
- زان – صلب، جيد للأدوات

الأخشاب الاستوائية:
- ماهوغاني – ثمين جداً، لون أحمر
- خشب الأبنوس – صلب جداً، لون أسود
- خشب الورد – عروق جميلة، عطري
- خشب الساج – مقاوم للعوامل الجوية
- ونغه – داكن جداً، أنيق`}</Text>

        <Text style={styles.sectionTitleAr}>🛠️ الأدوات الرئيسية:</Text>
        <Text style={styles.textBlockAr}>{`أدوات القطع:
- منشار ظهر – للقطع الدقيق
- منشار سن – للقطع في المساحات الصغيرة
- منشار منحني – للقطع المنحني
- منشار دائري – للقطع المستقيم السريع
- منشار شريطي – للقطع المعقد

أدوات التشذيب:
- مخرطة يدوية – لتسوية الأسطح
- مخرطة كهربائية – للأعمال الكبيرة
- صنفرة مدارية – للتشطيبات الناعمة
- صنفرة شريطية – للتشذيب السريع
- راوتر – للقوالب والأخاديد

أدوات القياس:
- شريط قياس – للقياسات الطويلة
- زاوية قائمة – للزوايا 90°
- ميزان – للتسوية
- برجل – للدوائر والأقواس
- فرجار – للقياسات الدقيقة`}</Text>

        <Text style={styles.sectionTitleAr}>🔧 تقنيات التجميع:</Text>
        <Text style={styles.textBlockAr}>{`التجميعات الأساسية:
- غراء ودبوس – وصلة بسيطة ومقاومة
- غراء ولسان – وصلة تقليدية
- غراء ذيل الحمامة – وصلة تزيينية
- تجميع نصف خشب – للزوايا
- تجميع صندوق – للدرج

التجميعات المتقدمة:
- ذيل الحمامة – مقاوم جداً
- ذيل حمامة مخفي – أنيق
- ذيل السنونو – تقليدي
- لسان ولسان – كلاسيكي
- ذيل البط – للإطارات

تقنيات اللصق:
- أنواع الغراء – PVA، إيبوكسي، ريزورسينول
- تحضير الأسطح
- تطبيق الغراء
- وقت التجفيف
- تنظيف الفائض`}</Text>

        <Text style={styles.sectionTitleAr}>🎨 التشطيبات والمعالجات:</Text>
        <Text style={styles.textBlockAr}>{`تحضير الأسطح:
- صنفرة تدريجية – حبيبات 80، 120، 240
- تنظيف الغبار
- سد المسام
- ملء الشقوق
- طبقة أساسية

الورنيش واللك:
- ورنيش مائي – صديق للبيئة، سهل التطبيق
- ورنيش زيتي – مقاوم، تشطيب طبيعي
- ورنيش نيترو – تجفيف سريع
- ورنيش بولي يوريثان – مقاوم جداً
- ورنيش محفز – احترافي

الزيوت والشموع:
- زيت الكتان – طبيعي، نافذ
- زيت تونغ – مقاوم جداً
- شمع العسل – طبيعي، عطري
- شمع الكرنوبا – صلب جداً
- زيت دانماركي – تقليدي`}</Text>

        <Text style={styles.sectionTitleAr}>📐 المشاريع العملية:</Text>
        <Text style={styles.textBlockAr}>{`المشاريع الأساسية:
- رف بسيط – قطع مستقيم وتجميع
- صندوق أدوات – وصلات زاوية
- إطار صورة – تجميع ذيل الحمامة
- كرسي صغير – هيكل أساسي
- منظم مكتب – أقسام متعددة

المشاريع المتوسطة:
- طاولة وسط – تجميع إطار
- كرسي طعام – هيكل معقد
- خزانة ملابس – درج ووصلات
- رف وحدات – نظام وحدات
- طاولة عمل – سطح كبير

المشاريع المتقدمة:
- مكتب – درج متعددة
- سرير – هيكل قوي
- خزانة مدمجة – قياسات دقيقة
- سلالم – حسابات معقدة
- أثاث مطبخ – وظائف متعددة`}</Text>

        <Text style={styles.sectionTitleAr}>🔧 الإصلاح والترميم:</Text>
        <Text style={styles.textBlockAr}>{`تشخيص الأضرار:
- تحديد المشاكل
- تقييم الهيكل
- تحليل المواد
- خطة الترميم
- تقدير التكاليف

تقنيات الإصلاح:
- تثبيت المفاصل
- إصلاح الشقوق
- استبدال القطع
- تعزيز هيكلي
- تنظيف الأسطح

ترميم التشطيبات:
- إزالة الورنيش
- إصلاح التطعيم
- ترميم الذهب
- الحفاظ على الباتينا
- الحماية النهائية`}</Text>

        <Text style={styles.sectionTitleAr}>⚠️ السلامة في النجارة:</Text>
        <Text style={styles.textBlockAr}>{`معدات الحماية:
- نظارات أمان – حماية العينين
- قناع مضاد للغبار – حماية تنفسية
- قفازات عمل – حماية اليدين
- سماعات أذن – حماية سمعية
- أحذية أمان – حماية القدمين

قواعد السلامة:
- الحفاظ على النظام والنظافة
- فحص الأدوات قبل الاستخدام
- استخدام الأدوات بشكل صحيح
- الحفاظ على مسافة الأمان
- معرفة إجراءات الطوارئ

منع الحوادث:
- إيقاف الآلات عند عدم الاستخدام
- الحفاظ على الكابلات الكهربائية
- استخدام إضاءة مناسبة
- تهوية الورشة
- وجود صندوق إسعافات أولية`}</Text>

        <Text style={styles.sectionTitleAr}>💰 إدارة المواد:</Text>
        <Text style={styles.textBlockAr}>{`اختيار المواد:
- جودة الخشب
- الأبعاد المطلوبة
- التكلفة لكل مشروع
- توفر المواد
- الاستدامة

التخزين:
- الظروف البيئية
- التنظيم حسب الأنواع
- الحماية من الرطوبة
- مراقبة المخزون
- دوران المواد

التحسين:
- تخطيط القطع
- استغلال البقايا
- تقليل الهدر
- إعادة استخدام المواد
- إعادة تدوير النفايات`}</Text>

        <Text style={styles.sectionTitleAr}>🌱 النجارة المستدامة:</Text>
        <Text style={styles.textBlockAr}>{`المواد الصديقة للبيئة:
- خشب معتمد FSC
- أخشاب محلية
- مواد معاد تدويرها
- غراء صديق للبيئة
- تشطيبات طبيعية

التقنيات المستدامة:
- استخدام فعال للمواد
- تقليل النفايات
- طاقة متجددة
- أدوات فعالة
- عمليات محسنة

الشهادات:
- FSC (مجلس رعاية الغابات)
- PEFC (برنامج اعتماد شهادات الغابات)
- شهادة سلسلة العهدة
- علامات بيئية
- تدقيق بيئي`}</Text>

        <Text style={styles.sectionTitleAr}>💼 فرص العمل:</Text>
        <Text style={styles.textBlockAr}>{`الوظائف:
- نجار بناء
- صانع أثاث
- مرمم أثاث
- مركب مطابخ
- صانع قوالب

التخصصات:
- نجارة النوافذ
- نجارة الأبواب
- صناعة أثاث فني
- ترميم التحف
- نجارة خارجية

ريادة الأعمال:
- ورشة نجارة
- متجر أثاث
- خدمات الترميم
- بيع الأدوات
- تدريب مهني

الشهادات:
- شهادة مهنية
- تخصص في تقنيات محددة
- شهادة في السلامة
- تدريب مستمر
- اعتماد الجودة`}</Text>
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
