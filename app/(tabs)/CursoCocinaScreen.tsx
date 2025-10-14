import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CursoCocinaScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <LinearGradient
        colors={['#E91E63', '#C2185B']}
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
            <Text style={styles.headerTitle}>Ayudante de Cocina</Text>
            <Text style={styles.headerTitleAr}>مساعد مطبخ</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>📌 ¿Qué aprenderás?</Text>
        <Text style={styles.textBlock}>{`
1. Técnicas básicas de cocina.
2. Preparación de ingredientes.
3. Uso de utensilios de cocina.
4. Limpieza y organización.
5. Seguridad en la cocina.`}</Text>
        <Text style={styles.sectionTitle}>📚 Módulos:</Text>
        <Text style={styles.textBlock}>{`- Técnicas básicas.
- Preparación de alimentos.
- Utensilios y equipos.
- Limpieza e higiene.
- Seguridad.`}</Text>
        <Text style={styles.sectionTitle}>🗣️ Vocabulario útil:</Text>
        <Text style={styles.textBlock}>{`- Cocina – مطبخ
- Cuchillo – سكين
- Sartén – مقلاة
- Ingrediente – مكون
- Limpieza – تنظيف`}</Text>
        <Text style={styles.sectionTitleAr}>📌 ماذا ستتعلم؟</Text>
        <Text style={styles.textBlockAr}>{`
1. التقنيات الأساسية في المطبخ.
2. تحضير المكونات.
3. استخدام أدوات المطبخ.
4. التنظيف والتنظيم.
5. السلامة في المطبخ.`}</Text>
        <Text style={styles.sectionTitleAr}>📚 الوحدات:</Text>
        <Text style={styles.textBlockAr}>{`- التقنيات الأساسية.
- تحضير الطعام.
- الأدوات والمعدات.
- التنظيف والنظافة.
- السلامة.`}</Text>
        <Text style={styles.sectionTitleAr}>🗣️ المفردات المهمة:</Text>
        <Text style={styles.textBlockAr}>{`- مطبخ – Cocina
- سكين – Cuchillo
- مقلاة – Sartén
- مكون – Ingrediente
- تنظيف – Limpieza`}</Text>

        <Text style={styles.sectionTitle}>📚 MÓDULOS DETALLADOS:</Text>
        <Text style={styles.textBlock}>{`MÓDULO 1: FUNDAMENTOS DE LA COCINA
- Organización y limpieza del espacio de trabajo
- Uso correcto de utensilios básicos
- Técnicas de corte y picado
- Medición de ingredientes
- Seguridad e higiene en la cocina

MÓDULO 2: TÉCNICAS DE CORTE Y PREPARACIÓN
- Cortes básicos (juliana, brunoise, mirepoix)
- Técnicas de picado y rallado
- Preparación de verduras y hortalizas
- Limpieza y preparación de pescados
- Deshuesado y fileteado de carnes

MÓDULO 3: TÉCNICAS DE COCCIÓN BÁSICAS
- Cocción en agua (hervido, escaldado)
- Cocción en grasa (fritura, salteado)
- Cocción en seco (asado, plancha)
- Cocción mixta (guisado, estofado)
- Cocción al vapor y papillote

MÓDULO 4: PREPARACIÓN DE SALSAS Y FONDOS
- Fondos básicos (blanco, marrón, de pescado)
- Salsas madre (bechamel, velouté, española)
- Salsas derivadas y emulsiones
- Caldos y consomés
- Reducciones y glasés

MÓDULO 5: PREPARACIÓN DE PLATOS PRINCIPALES
- Platos de carne (ternera, cerdo, cordero)
- Platos de pescado y marisco
- Platos vegetarianos y veganos
- Pasta y arroces
- Guarniciones y acompañamientos

MÓDULO 6: REPOSTERÍA BÁSICA
- Masas básicas (bizcocho, hojaldre, brioche)
- Cremas y rellenos
- Decoración básica
- Postres tradicionales
- Panadería básica

MÓDULO 7: PRESENTACIÓN Y SERVICIO
- Técnicas de emplatado
- Decoración de platos
- Control de temperaturas
- Coordinación de servicio
- Atención al cliente

MÓDULO 8: GESTIÓN DE COCINA
- Control de inventario
- Gestión de residuos
- Optimización de costos
- Trabajo en equipo
- Normativas de seguridad alimentaria`}</Text>

        <Text style={styles.sectionTitle}>🔪 TÉCNICAS DE CORTE:</Text>
        <Text style={styles.textBlock}>{`CORTES BÁSICOS:
- Juliana / قطع خيوط – Tiras finas y largas
- Brunoise / قطع مكعبات صغيرة – Cubos pequeños (2-3mm)
- Mirepoix / قطع خضار – Verduras en dados medianos
- Chiffonade / قطع شرائح – Hojas en tiras finas
- Paysanne / قطع مربعات – Cubos de 1cm

CORTES ESPECIALIZADOS:
- Tourné / قطع منحني – Corte en forma de balón de rugby
- Parisienne / قطع كروي – Bolitas con sacabocados
- Pont-Neuf / قطع بطاطس – Patatas fritas gruesas
- Allumette / قطع أعواد – Palitos finos como cerillas
- Jardinière / قطع خضار – Verduras en bastones

TÉCNICAS DE PICADO:
- Picado fino / فرم ناعم – Para hierbas y ajo
- Picado grueso / فرم خشن – Para verduras de guiso
- Rallado / بشر – Para queso, zanahoria, limón
- Desmenuzado / تمزيق – Para carnes cocidas
- Triturado / سحق – Para salsas y purés`}</Text>

        <Text style={styles.sectionTitle}>🍳 TÉCNICAS DE COCCIÓN:</Text>
        <Text style={styles.textBlock}>{`COCCIÓN EN AGUA:
- Hervido / غلي – Cocción en agua hirviendo
- Escaldado / سلق – Cocción rápida en agua hirviendo
- Blanqueado / تبييض – Cocción breve para fijar colores
- Al vapor / بخار – Cocción con vapor de agua
- Confitado / كونفي – Cocción lenta en grasa

COCCIÓN EN GRASA:
- Fritura / قلي – Inmersión en aceite caliente
- Salteado / قلي سريع – Cocción rápida en poca grasa
- Sofrito / سوتيه – Cocción lenta de verduras
- Rehogado / تحمير – Cocción previa de ingredientes
- Dorado / تحمير – Cocción para dar color

COCCIÓN EN SECO:
- Asado / شوي – Cocción con calor seco
- Plancha / شوي على صفيحة – Cocción directa
- Gratinado / غراتين – Cocción con queso fundido
- Ahumado / تدخين – Cocción con humo
- Deshidratado / تجفيف – Eliminación de humedad`}</Text>

        <Text style={styles.sectionTitle}>🥘 PREPARACIÓN DE PLATOS:</Text>
        <Text style={styles.textBlock}>{`PLATOS DE CARNE:
- Ternera / لحم عجل – Filetes, guisos, asados
- Cerdo / لحم خنزير – Chuletas, costillas, embutidos
- Cordero / لحم غنم – Pierna, chuletas, estofados
- Pollo / دجاج – Pechuga, muslos, alitas
- Pavo / ديك رومي – Pechuga, muslos, relleno

PLATOS DE PESCADO:
- Pescado blanco / سمك أبيض – Merluza, lubina, lenguado
- Pescado azul / سمك أزرق – Atún, salmón, sardinas
- Mariscos / محار – Gambas, mejillones, almejas
- Crustáceos / قشريات – Langosta, bogavante, cangrejo
- Moluscos / رخويات – Pulpo, calamar, sepia

PLATOS VEGETARIANOS:
- Legumbres / بقوليات – Lentejas, garbanzos, alubias
- Cereales / حبوب – Arroz, quinoa, bulgur
- Verduras / خضار – Espinacas, brócoli, calabacín
- Setas / فطر – Champiñones, shiitake, portobello
- Tofu y tempeh / توفو وتيمبه – Proteínas vegetales`}</Text>

        <Text style={styles.sectionTitle}>🍰 REPOSTERÍA BÁSICA:</Text>
        <Text style={styles.textBlock}>{`MASAS BÁSICAS:
- Bizcocho / كيك إسفنجي – Masa esponjosa y ligera
- Hojaldre / عجين فطير – Masa de capas superpuestas
- Brioche / بريوش – Masa enriquecida con mantequilla
- Pasta quebrada / عجين كسر – Masa para tartas
- Pasta choux / عجين شو – Masa para profiteroles

CREMAS Y RELLENOS:
- Crema pastelera / كريمة الباتيسيري – Crema de huevo y leche
- Crema de mantequilla / كريمة الزبدة – Para decorar pasteles
- Ganache / غاناش – Chocolate y nata
- Mermelada / مربى – Frutas cocidas con azúcar
- Caramelo / كراميل – Azúcar caramelizado

DECORACIÓN:
- Glaseado / تزجيج – Cobertura de azúcar
- Fondant / فوندانت – Pasta de azúcar moldeable
- Pasta de azúcar / عجين السكر – Para figuras
- Chocolate / شوكولاتة – Decoración con chocolate
- Frutas / فواكه – Decoración con frutas frescas`}</Text>

        <Text style={styles.sectionTitle}>🥄 UTENSILIOS Y EQUIPOS:</Text>
        <Text style={styles.textBlock}>{`UTENSILIOS BÁSICOS:
- Cuchillos / سكاكين – Chef, paring, serrador
- Tablas de corte / ألواح تقطيع – Diferentes tamaños
- Ollas y sartenes / أواني ومقالي – Variedad de tamaños
- Batidoras / خلاطات – Manual y eléctrica
- Coladores / مصافي – Para escurrir y tamizar

EQUIPOS ELÉCTRICOS:
- Batidora de pie / خلاط قائم – Para masas y cremas
- Procesador de alimentos / معالج طعام – Para picar y triturar
- Licuadora / عصارة – Para zumos y purés
- Horno / فرن – Para hornear y asar
- Microondas / ميكروويف – Para calentar y descongelar

HERRAMIENTAS ESPECIALIZADAS:
- Mandolina / ماندولين – Para cortes uniformes
- Sacabocados / قواطع – Para formas específicas
- Termómetros / موازين حرارة – Para control de temperatura
- Básculas / موازين – Para pesar ingredientes
- Medidores / مقاييس – Para líquidos y sólidos`}</Text>

        <Text style={styles.sectionTitle}>🧼 HIGIENE Y SEGURIDAD:</Text>
        <Text style={styles.textBlock}>{`HIGIENE PERSONAL:
- Lavado de manos / غسل اليدين – Antes y durante el trabajo
- Uso de guantes / استخدام قفازات – Para manipular alimentos
- Gorro y delantal / قبعة ومريول – Protección personal
- Calzado adecuado / أحذية مناسبة – Antideslizante y cómodo
- Uñas cortas / أظافر قصيرة – Para evitar contaminación

HIGIENE EN LA COCINA:
- Limpieza de superficies / تنظيف الأسطح – Antes y después
- Desinfección de utensilios / تعقيم الأدوات – Regularmente
- Control de temperatura / مراقبة الحرارة – Para conservación
- Separación de alimentos / فصل الأطعمة – Evitar contaminación cruzada
- Gestión de residuos / إدارة النفايات – Separación correcta

SEGURIDAD ALIMENTARIA:
- Control de fechas / مراقبة التواريخ – Caducidad y consumo preferente
- Almacenamiento correcto / تخزين صحيح – Temperatura y humedad
- Cocción adecuada / طبخ مناسب – Temperaturas seguras
- Enfriamiento rápido / تبريد سريع – Para evitar bacterias
- Recalentamiento seguro / إعادة تسخين آمن – Temperaturas correctas`}</Text>

        <Text style={styles.sectionTitle}>📋 RECETAS BÁSICAS:</Text>
        <Text style={styles.textBlock}>{`ENTRANTES:
- Ensalada César / سلطة قيصر – Lechuga, crutones, parmesano
- Sopa de verduras / شوربة خضار – Verduras de temporada
- Paté de hígado / باتيه كبد – Hígado de pollo o ternera
- Croquetas / كروكيت – Jamón, pollo, bacalao
- Empanadillas / إمباناديلا – Carne, atún, verduras

PLATOS PRINCIPALES:
- Paella / بايلا – Arroz con marisco y pollo
- Estofado de ternera / يخنة لحم عجل – Carne con verduras
- Pescado al horno / سمك مشوي – Lubina o merluza
- Pasta carbonara / معكرونة كاربونارا – Huevo, queso, panceta
- Risotto / ريزوتو – Arroz con setas o verduras

POSTRES:
- Flan / فطيرة – Huevos, leche, caramelo
- Tarta de manzana / فطيرة تفاح – Manzanas, masa quebrada
- Tiramisú / تيراميسو – Café, mascarpone, bizcochos
- Helado casero / آيس كريم منزلي – Leche, huevos, azúcar
- Mousse de chocolate / موس شوكولاتة – Chocolate, huevos, nata`}</Text>

        <Text style={styles.sectionTitle}>🎨 PRESENTACIÓN Y SERVICIO:</Text>
        <Text style={styles.textBlock}>{`TÉCNICAS DE EMPLATADO:
- Composición / تكوين – Distribución equilibrada
- Color / لون – Contraste y armonía
- Textura / ملمس – Variedad de texturas
- Altura / ارتفاع – Diferentes niveles
- Espacio / مساحة – Respiración visual

DECORACIÓN:
- Hierbas frescas / أعشاب طازجة – Perejil, cilantro, albahaca
- Microvegetales / خضار صغير – Brotes y germinados
- Flores comestibles / زهور صالحة للأكل – Caléndula, violetas
- Salsas decorativas / صلصات تزيينية – Puntos, líneas, espirales
- Polvos y semillas / مساحيق وبذور – Especias, frutos secos

SERVICIO:
- Temperatura correcta / درجة حرارة صحيحة – Caliente caliente, frío frío
- Tiempo de servicio / وقت التقديم – Coordinación con cocina
- Presentación uniforme / تقديم موحد – Consistencia en todos los platos
- Atención al detalle / الاهتمام بالتفاصيل – Perfección en cada plato
- Comunicación / تواصل – Coordinación con camareros`}</Text>

        <Text style={styles.sectionTitle}>💰 GESTIÓN DE COCINA:</Text>
        <Text style={styles.textBlock}>{`CONTROL DE INVENTARIO:
- Registro de entradas / تسجيل المدخلات – Productos recibidos
- Control de salidas / مراقبة المخرجات – Productos utilizados
- Stock mínimo / مخزون أدنى – Para evitar roturas
- Rotación de productos / دوران المنتجات – FIFO (Primero en entrar, primero en salir)
- Conteo periódico / عد دوري – Verificación de existencias

GESTIÓN DE COSTOS:
- Control de mermas / مراقبة الفاقد – Minimizar desperdicios
- Optimización de porciones / تحسين الحصص – Tamaños estándar
- Análisis de costos / تحليل التكاليف – Por plato y por ingrediente
- Negociación con proveedores / التفاوض مع الموردين – Mejores precios
- Control de calidad / مراقبة الجودة – Estándares consistentes

TRABAJO EN EQUIPO:
- Comunicación efectiva / تواصل فعال – Entre brigadas
- Coordinación de tareas / تنسيق المهام – Distribución de trabajo
- Resolución de conflictos / حل النزاعات – Ambiente laboral sano
- Formación continua / تدريب مستمر – Mejora de habilidades
- Motivación del equipo / تحفيز الفريق – Reconocimiento y apoyo`}</Text>

        <Text style={styles.sectionTitle}>🌍 COCINA INTERNACIONAL:</Text>
        <Text style={styles.textBlock}>{`COCINA MEDITERRÁNEA:
- Cocina española / مطبخ إسباني – Paella, tapas, gazpacho
- Cocina italiana / مطبخ إيطالي – Pasta, pizza, risotto
- Cocina griega / مطبخ يوناني – Moussaka, souvlaki, tzatziki
- Cocina francesa / مطبخ فرنسي – Coq au vin, ratatouille, quiche
- Cocina turca / مطبخ تركي – Kebab, dolma, baklava

COCINA ASIÁTICA:
- Cocina china / مطبخ صيني – Dim sum, chop suey, arroz frito
- Cocina japonesa / مطبخ ياباني – Sushi, tempura, ramen
- Cocina tailandesa / مطبخ تايلندي – Pad thai, curry, tom yum
- Cocina india / مطبخ هندي – Curry, tandoori, naan
- Cocina coreana / مطبخ كوري – Bibimbap, kimchi, bulgogi

COCINA AMERICANA:
- Cocina mexicana / مطبخ مكسيكي – Tacos, enchiladas, guacamole
- Cocina peruana / مطبخ بيروفي – Ceviche, lomo saltado, causa
- Cocina brasileña / مطبخ برازيلي – Feijoada, churrasco, moqueca
- Cocina argentina / مطبخ أرجنتيني – Asado, empanadas, dulce de leche
- Cocina estadounidense / مطبخ أمريكي – Hamburguesas, BBQ, apple pie`}</Text>

        <Text style={styles.sectionTitle}>💼 OPORTUNIDADES LABORALES:</Text>
        <Text style={styles.textBlock}>{`PUESTOS DE TRABAJO:
- Ayudante de cocina / مساعد مطبخ – Apoyo en preparaciones básicas
- Cocinero / طباخ – Preparación de platos principales
- Chef de partida / شيف قسم – Responsable de una sección
- Sous chef / شيف مساعد – Segundo al mando
- Chef ejecutivo / شيف تنفيذي – Responsable de toda la cocina

ESPECIALIZACIONES:
- Pastelería / حلويات – Especialista en postres
- Panadería / مخبز – Especialista en panes
- Cocina fría / مطبخ بارد – Ensaladas y entrantes
- Parrilla / شواء – Especialista en carnes
- Sushi / سوشي – Especialista en cocina japonesa

EMPRENDIMIENTO:
- Restaurante propio / مطعم خاص – Negocio independiente
- Catering / خدمات طعام – Eventos y celebraciones
- Food truck / شاحنة طعام – Comida móvil
- Consultoría gastronómica / استشارات طعامية
- Formación culinaria / تدريب طبخي

CERTIFICACIONES:
- Certificado de manipulación de alimentos / شهادة التعامل مع الطعام
- Certificado de seguridad alimentaria / شهادة سلامة الغذاء
- Especialización en cocina internacional / تخصص في المطبخ الدولي
- Formación en gestión de restaurantes / تدريب في إدارة المطاعم
- Certificación de calidad / شهادة الجودة`}</Text>

        <Text style={styles.sectionTitleAr}>📚 الوحدات المفصلة:</Text>
        <Text style={styles.textBlockAr}>{`الوحدة الأولى: أساسيات المطبخ
- تنظيم وتنظيف مساحة العمل
- الاستخدام الصحيح للأدوات الأساسية
- تقنيات القطع والتقطيع
- قياس المكونات
- السلامة والنظافة في المطبخ

الوحدة الثانية: تقنيات القطع والتحضير
- القطع الأساسية (خيوط، مكعبات صغيرة، خضار)
- تقنيات التقطيع والبشر
- تحضير الخضار والبقوليات
- تنظيف وتحضير الأسماك
- نزع العظام وتقطيع اللحوم

الوحدة الثالثة: تقنيات الطهي الأساسية
- الطهي في الماء (غلي، سلق)
- الطهي في الدهون (قلي، سوتيه)
- الطهي الجاف (شوي، صفيحة)
- الطهي المختلط (يخنة، طاجن)
- الطهي بالبخار والورق

الوحدة الرابعة: تحضير الصلصات والأسس
- الأسس الأساسية (أبيض، بني، سمك)
- الصلصات الأم (بشاميل، فيلوته، إسبانيول)
- الصلصات المشتقة والمستحلبات
- المرق والشوربات
- التكثيف والجلاسيه

الوحدة الخامسة: تحضير الأطباق الرئيسية
- أطباق اللحوم (عجل، خنزير، غنم)
- أطباق السمك والمأكولات البحرية
- الأطباق النباتية والنباتية الصرفة
- المعكرونة والأرز
- المقبلات والمرافقات

الوحدة السادسة: الحلويات الأساسية
- العجائن الأساسية (كيك، فطير، بريوش)
- الكريمات والحشوات
- التزيين الأساسي
- الحلويات التقليدية
- الخبز الأساسي

الوحدة السابعة: التقديم والخدمة
- تقنيات التقديم
- تزيين الأطباق
- مراقبة درجات الحرارة
- تنسيق الخدمة
- الاهتمام بالعميل

الوحدة الثامنة: إدارة المطبخ
- مراقبة المخزون
- إدارة النفايات
- تحسين التكاليف
- العمل الجماعي
- لوائح سلامة الغذاء`}</Text>

        <Text style={styles.sectionTitleAr}>🔪 تقنيات القطع:</Text>
        <Text style={styles.textBlockAr}>{`القطع الأساسية:
- قطع خيوط – شرائح رفيعة وطويلة
- قطع مكعبات صغيرة – مكعبات صغيرة (2-3 مم)
- قطع خضار – خضار مكعبة متوسطة
- قطع شرائح – أوراق في شرائح رفيعة
- قطع مربعات – مكعبات 1 سم

القطع المتخصصة:
- قطع منحني – قطع على شكل كرة رجبي
- قطع كروي – كرات باستخدام قواطع
- قطع بطاطس – بطاطس مقلية سميكة
- قطع أعواد – أعواد رفيعة كأعواد الثقاب
- قطع خضار – خضار في شكل عصي

تقنيات التقطيع:
- فرم ناعم – للأعشاب والثوم
- فرم خشن – للخضار في اليخنة
- بشر – للجبن والجزر والليمون
- تمزيق – للحوم المطبوخة
- سحق – للصلصات والهريس`}</Text>

        <Text style={styles.sectionTitleAr}>🍳 تقنيات الطهي:</Text>
        <Text style={styles.textBlockAr}>{`الطهي في الماء:
- غلي – طهي في ماء مغلي
- سلق – طهي سريع في ماء مغلي
- تبييض – طهي قصير لتثبيت الألوان
- بخار – طهي ببخار الماء
- كونفي – طهي بطيء في الدهون

الطهي في الدهون:
- قلي – غمر في زيت ساخن
- قلي سريع – طهي سريع في قليل من الدهون
- سوتيه – طهي بطيء للخضار
- تحمير – طهي مسبق للمكونات
- تحمير – طهي لإعطاء اللون

الطهي الجاف:
- شوي – طهي بحرارة جافة
- شوي على صفيحة – طهي مباشر
- غراتين – طهي مع جبن مذاب
- تدخين – طهي بالدخان
- تجفيف – إزالة الرطوبة`}</Text>

        <Text style={styles.sectionTitleAr}>🥘 تحضير الأطباق:</Text>
        <Text style={styles.textBlockAr}>{`أطباق اللحوم:
- لحم عجل – شرائح، يخنات، مشويات
- لحم خنزير – أضلاع، ضلوع، لحوم مصنعة
- لحم غنم – فخذ، أضلاع، يخنات
- دجاج – صدر، أفخاذ، أجنحة
- ديك رومي – صدر، أفخاذ، حشوة

أطباق السمك:
- سمك أبيض – سمك القد، قاروص، سمك موسى
- سمك أزرق – تونة، سلمون، سردين
- محار – روبيان، بلح البحر، محار
- قشريات – كركند، سرطان البحر
- رخويات – أخطبوط، حبار، سيبيا

أطباق نباتية:
- بقوليات – عدس، حمص، فاصوليا
- حبوب – أرز، كينوا، برغل
- خضار – سبانخ، بروكلي، كوسة
- فطر – فطر عادي، شيتاكي، بورتوبيلو
- توفو وتيمبه – بروتينات نباتية`}</Text>

        <Text style={styles.sectionTitleAr}>🍰 الحلويات الأساسية:</Text>
        <Text style={styles.textBlockAr}>{`العجائن الأساسية:
- كيك إسفنجي – عجين إسفنجي وخفيف
- عجين فطير – عجين من طبقات متراكبة
- بريوش – عجين غني بالزبدة
- عجين كسر – عجين للفطائر
- عجين شو – عجين للبروفيتيرول

الكريمات والحشوات:
- كريمة الباتيسيري – كريمة البيض والحليب
- كريمة الزبدة – لتزيين الكيك
- غاناش – شوكولاتة وكريمة
- مربى – فواكه مطبوخة مع السكر
- كراميل – سكر محروق

التزيين:
- تزجيج – غطاء من السكر
- فوندانت – عجين سكر قابل للتشكيل
- عجين السكر – للأشكال
- شوكولاتة – تزيين بالشوكولاتة
- فواكه – تزيين بالفواكه الطازجة`}</Text>

        <Text style={styles.sectionTitleAr}>🥄 الأدوات والمعدات:</Text>
        <Text style={styles.textBlockAr}>{`الأدوات الأساسية:
- سكاكين – شيف، تقشير، منشار
- ألواح تقطيع – أحجام مختلفة
- أواني ومقالي – تنوع في الأحجام
- خلاطات – يدوية وكهربائية
- مصافي – للتصفية والغربلة

المعدات الكهربائية:
- خلاط قائم – للعجائن والكريمات
- معالج طعام – للتقطيع والسحق
- عصارة – للعصائر والهريس
- فرن – للخبز والشوي
- ميكروويف – للتسخين والذوبان

الأدوات المتخصصة:
- ماندولين – للقطع الموحد
- قواطع – لأشكال محددة
- موازين حرارة – لمراقبة الحرارة
- موازين – لوزن المكونات
- مقاييس – للسوائل والمواد الصلبة`}</Text>

        <Text style={styles.sectionTitleAr}>🧼 النظافة والسلامة:</Text>
        <Text style={styles.textBlockAr}>{`النظافة الشخصية:
- غسل اليدين – قبل وأثناء العمل
- استخدام قفازات – للتعامل مع الطعام
- قبعة ومريول – حماية شخصية
- أحذية مناسبة – غير قابلة للانزلاق ومريحة
- أظافر قصيرة – لتجنب التلوث

النظافة في المطبخ:
- تنظيف الأسطح – قبل وبعد
- تعقيم الأدوات – بانتظام
- مراقبة الحرارة – للحفظ
- فصل الأطعمة – تجنب التلوث المتبادل
- إدارة النفايات – فصل صحيح

سلامة الغذاء:
- مراقبة التواريخ – انتهاء الصلاحية واستهلاك مفضل
- تخزين صحيح – حرارة ورطوبة
- طبخ مناسب – درجات حرارة آمنة
- تبريد سريع – لتجنب البكتيريا
- إعادة تسخين آمن – درجات حرارة صحيحة`}</Text>

        <Text style={styles.sectionTitleAr}>📋 وصفات أساسية:</Text>
        <Text style={styles.textBlockAr}>{`المقبلات:
- سلطة قيصر – خس، خبز محمص، بارميزان
- شوربة خضار – خضار الموسم
- باتيه كبد – كبد دجاج أو عجل
- كروكيت – لحم خنزير، دجاج، سمك قد
- إمباناديلا – لحم، تونة، خضار

الأطباق الرئيسية:
- بايلا – أرز مع مأكولات بحرية ودجاج
- يخنة لحم عجل – لحم مع خضار
- سمك مشوي – قاروص أو سمك القد
- معكرونة كاربونارا – بيض، جبن، لحم خنزير
- ريزوتو – أرز مع فطر أو خضار

الحلويات:
- فطيرة – بيض، حليب، كراميل
- فطيرة تفاح – تفاح، عجين كسر
- تيراميسو – قهوة، ماسكاربوني، كيك
- آيس كريم منزلي – حليب، بيض، سكر
- موس شوكولاتة – شوكولاتة، بيض، كريمة`}</Text>

        <Text style={styles.sectionTitleAr}>🎨 التقديم والخدمة:</Text>
        <Text style={styles.textBlockAr}>{`تقنيات التقديم:
- تكوين – توزيع متوازن
- لون – تباين وتناسق
- ملمس – تنوع في الملمس
- ارتفاع – مستويات مختلفة
- مساحة – تنفس بصري

التزيين:
- أعشاب طازجة – بقدونس، كزبرة، ريحان
- خضار صغير – براعم ونباتات نامية
- زهور صالحة للأكل – آذريون، بنفسج
- صلصات تزيينية – نقاط، خطوط، لولبيات
- مساحيق وبذور – توابل، مكسرات

الخدمة:
- درجة حرارة صحيحة – ساخن ساخن، بارد بارد
- وقت التقديم – تنسيق مع المطبخ
- تقديم موحد – اتساق في جميع الأطباق
- الاهتمام بالتفاصيل – كمال في كل طبق
- تواصل – تنسيق مع النوادل`}</Text>

        <Text style={styles.sectionTitleAr}>💰 إدارة المطبخ:</Text>
        <Text style={styles.textBlockAr}>{`مراقبة المخزون:
- تسجيل المدخلات – المنتجات المستلمة
- مراقبة المخرجات – المنتجات المستخدمة
- مخزون أدنى – لتجنب النفاد
- دوران المنتجات – أول من يدخل أول من يخرج
- عد دوري – التحقق من المخزون

إدارة التكاليف:
- مراقبة الفاقد – تقليل الهدر
- تحسين الحصص – أحجام قياسية
- تحليل التكاليف – لكل طبق ومكون
- التفاوض مع الموردين – أفضل الأسعار
- مراقبة الجودة – معايير متسقة

العمل الجماعي:
- تواصل فعال – بين الفرق
- تنسيق المهام – توزيع العمل
- حل النزاعات – بيئة عمل صحية
- تدريب مستمر – تحسين المهارات
- تحفيز الفريق – تقدير ودعم`}</Text>

        <Text style={styles.sectionTitleAr}>🌍 المطبخ الدولي:</Text>
        <Text style={styles.textBlockAr}>{`المطبخ المتوسطي:
- مطبخ إسباني – بايلا، تابات، غازباتشو
- مطبخ إيطالي – معكرونة، بيتزا، ريزوتو
- مطبخ يوناني – موساكا، سوفلاكي، تزاتزيكي
- مطبخ فرنسي – كوك أو فان، راتاتوي، كيش
- مطبخ تركي – كباب، دولما، باقلافا

المطبخ الآسيوي:
- مطبخ صيني – ديم سوم، تشوب سوي، أرز مقلي
- مطبخ ياباني – سوشي، تمبورا، رامن
- مطبخ تايلندي – باد تاي، كاري، توم يم
- مطبخ هندي – كاري، تندوري، نان
- مطبخ كوري – بيبيمباب، كيمتشي، بولغوغي

المطبخ الأمريكي:
- مطبخ مكسيكي – تاكوس، إنشيلادا، غواكامولي
- مطبخ بيروفي – سيفيتشي، لومو سالتادو، كاوزا
- مطبخ برازيلي – فيجودا، شوراسكو، موكيكا
- مطبخ أرجنتيني – أسادو، إمبانادا، دولسي دي ليتشي
- مطبخ أمريكي – همبرغر، شواء، فطيرة تفاح`}</Text>

        <Text style={styles.sectionTitleAr}>💼 فرص العمل:</Text>
        <Text style={styles.textBlockAr}>{`الوظائف:
- مساعد مطبخ – دعم في التحضيرات الأساسية
- طباخ – تحضير الأطباق الرئيسية
- شيف قسم – مسؤول عن قسم
- شيف مساعد – الثاني في القيادة
- شيف تنفيذي – مسؤول عن المطبخ كاملاً

التخصصات:
- حلويات – متخصص في الحلويات
- مخبز – متخصص في الخبز
- مطبخ بارد – سلطات ومقبلات
- شواء – متخصص في اللحوم
- سوشي – متخصص في المطبخ الياباني

ريادة الأعمال:
- مطعم خاص – عمل مستقل
- خدمات طعام – مناسبات واحتفالات
- شاحنة طعام – طعام متحرك
- استشارات طعامية
- تدريب طبخي

الشهادات:
- شهادة التعامل مع الطعام
- شهادة سلامة الغذاء
- تخصص في المطبخ الدولي
- تدريب في إدارة المطاعم
- شهادة الجودة`}</Text>
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
