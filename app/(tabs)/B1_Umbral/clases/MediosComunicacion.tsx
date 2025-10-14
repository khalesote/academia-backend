import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import EjerciciosInteractivos from '../../../components/EjerciciosInteractivos';

export default function MediosComunicacion() {
  const router = useRouter();

  const ejercicios = [
    // Ejercicio 1: Vocabulario - Relacionar medios de comunicación con sus características
    {
      tipo: 'vocabulario',
      titulo: 'Relaciona cada medio de comunicación con su característica principal:',
      pares: [
        { izquierda: '📰 Periódico', derecha: 'Información escrita diaria' },
        { izquierda: '📺 Televisión', derecha: 'Información audiovisual' },
        { izquierda: '📻 Radio', derecha: 'Información solo auditiva' },
        { izquierda: '💻 Internet', derecha: 'Información digital interactiva' }
      ]
    },

    // Ejercicio 2: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué significa "medios de comunicación"?',
      opciones: ['Solo internet', 'Canales para transmitir información', 'Solo televisión', 'Solo radio'],
      respuestaCorrecta: 1
    },

    // Ejercicio 3: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué es una "noticia"?',
      opciones: ['Solo una historia', 'Información reciente sobre un hecho', 'Solo un cuento', 'Solo una opinión'],
      respuestaCorrecta: 1
    },

    // Ejercicio 4: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué significa "prensa"?',
      opciones: ['Solo periódicos', 'Medios de comunicación escritos', 'Solo revistas', 'Solo libros'],
      respuestaCorrecta: 1
    },

    // Ejercicio 5: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué es un "periodista"?',
      opciones: ['Solo un escritor', 'Profesional que investiga y reporta noticias', 'Solo un fotógrafo', 'Solo un editor'],
      respuestaCorrecta: 1
    },

    // Ejercicio 6: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué significa "digital"?',
      opciones: ['Solo papel', 'Relacionado con tecnología informática', 'Solo analógico', 'Solo manual'],
      respuestaCorrecta: 1
    },

    // Ejercicio 7: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué es la "información"?',
      opciones: ['Solo datos', 'Datos organizados que transmiten conocimiento', 'Solo números', 'Solo letras'],
      respuestaCorrecta: 1
    },

    // Ejercicio 8: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué significa "actualidad"?',
      opciones: ['Solo el pasado', 'Lo que está sucediendo ahora', 'Solo el futuro', 'Solo historia'],
      respuestaCorrecta: 1
    },

    // Ejercicio 9: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué es una "entrevista"?',
      opciones: ['Solo una conversación', 'Conversación para obtener información', 'Solo una charla', 'Solo una discusión'],
      respuestaCorrecta: 1
    },

    // Ejercicio 10: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué significa "reportaje"?',
      opciones: ['Solo una noticia', 'Investigación periodística detallada', 'Solo una foto', 'Solo un video'],
      respuestaCorrecta: 1
    },

    // Ejercicio 11: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué es la "libertad de prensa"?',
      opciones: ['Solo libertad de expresión', 'Derecho a informar sin censura', 'Solo libertad de opinión', 'Solo libertad de reunión'],
      respuestaCorrecta: 1
    },

    // Ejercicio 12: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué significa "objetividad"?',
      opciones: ['Solo dar opiniones', 'Presentar hechos sin prejuicios', 'Solo ser subjetivo', 'Solo ser parcial'],
      respuestaCorrecta: 1
    },

    // Ejercicio 13: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué es la "desinformación"?',
      opciones: ['Solo información falsa', 'Información falsa o engañosa', 'Solo información verdadera', 'Solo información neutral'],
      respuestaCorrecta: 1
    },

    // Ejercicio 14: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué significa "verificar" una noticia?',
      opciones: ['Solo leerla', 'Comprobar que la información es correcta', 'Solo creerla', 'Solo ignorarla'],
      respuestaCorrecta: 1
    },

    // Ejercicio 15: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué son las "redes sociales"?',
      opciones: ['Solo internet', 'Plataformas para compartir contenido', 'Solo televisión', 'Solo radio'],
      respuestaCorrecta: 1
    },

    // Ejercicio 16: Vocabulario - Tipos de contenido
    {
      tipo: 'vocabulario',
      titulo: 'Relaciona cada tipo de contenido con su medio:',
      pares: [
        { izquierda: '📱 Apps móviles', derecha: 'Noticias en tiempo real' },
        { izquierda: '📺 Programas de TV', derecha: 'Entretenimiento e información' },
        { izquierda: '📻 Podcasts', derecha: 'Contenido auditivo especializado' },
        { izquierda: '💻 Blogs', derecha: 'Contenido personal en internet' }
      ]
    },

    // Ejercicio 17: Vocabulario - Secciones periodísticas
    {
      tipo: 'vocabulario',
      titulo: 'Relaciona cada sección periodística con su contenido:',
      pares: [
        { izquierda: '🏛️ Política', derecha: 'Noticias sobre gobierno y leyes' },
        { izquierda: '💰 Economía', derecha: 'Noticias sobre dinero y negocios' },
        { izquierda: '⚽ Deportes', derecha: 'Noticias sobre competiciones' },
        { izquierda: '🎭 Cultura', derecha: 'Noticias sobre arte y entretenimiento' }
      ]
    },

    // Ejercicio 18: Vocabulario - Herramientas periodísticas
    {
      tipo: 'vocabulario',
      titulo: 'Relaciona cada herramienta con su función periodística:',
      pares: [
        { izquierda: '📷 Cámara', derecha: 'Capturar imágenes' },
        { izquierda: '🎤 Micrófono', derecha: 'Grabar audio' },
        { izquierda: '💻 Computadora', derecha: 'Escribir y editar' },
        { izquierda: '📱 Teléfono', derecha: 'Comunicación rápida' }
      ]
    },

    // Ejercicio 19: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué significa "periodismo ciudadano"?',
      opciones: ['Solo periodismo profesional', 'Información compartida por ciudadanos comunes', 'Solo periodismo digital', 'Solo periodismo tradicional'],
      respuestaCorrecta: 1
    },

    // Ejercicio 20: Opción múltiple
    {
      tipo: 'opcion_multiple',
      pregunta: '¿Qué es importante al consumir medios de comunicación?',
      opciones: ['Solo creer todo', 'Ser crítico y verificar la información', 'Solo ignorar todo', 'Solo compartir todo'],
      respuestaCorrecta: 1
    }
  ];

  return (
    <ScrollView style={{ backgroundColor: '#f5f7fa' }} contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/B1_Umbral')}
        accessibilityLabel="Volver al menú B1: Umbral"
      >
        <Ionicons name="arrow-back" size={28} color="#1976d2" />
      </TouchableOpacity>
      
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80' }}
        style={styles.heroImage}
        accessibilityLabel="Imagen de medios de comunicación y prensa"
      />
      
      <Text style={styles.title}>📰 Medios de comunicación y prensa</Text>
      <Text style={styles.titleAr}>📰 وسائل الإعلام والصحافة</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📡 Importancia de los medios de comunicación</Text>
        <Text style={styles.sectionText}>
          Los medios de comunicación son canales fundamentales para transmitir información, 
          noticias y entretenimiento a la sociedad. Juegan un papel crucial en mantener 
          informada a la población sobre eventos locales, nacionales e internacionales.
          {"\n\n"}
          En la era digital, los medios de comunicación han evolucionado significativamente, 
          ofreciendo múltiples plataformas para acceder a la información de manera instantánea 
          y desde cualquier lugar del mundo.
        </Text>
        <Text style={styles.sectionTextAr}>
          وسائل الإعلام هي قنوات أساسية لنقل المعلومات
          والأخبار والترفيه للمجتمع. تلعب دوراً حاسماً في إبقاء
          السكان على اطلاع بالأحداث المحلية والوطنية والدولية.
          {"\n\n"}
          في العصر الرقمي، تطورت وسائل الإعلام بشكل كبير،
          مقدمة منصات متعددة للوصول إلى المعلومات بشكل فوري
          ومن أي مكان في العالم.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📺 Tipos de medios de comunicación</Text>
        <Text style={styles.sectionText}>
          <Text style={styles.subtitle}>📰 Medios impresos:</Text>{"\n"}
          • <Text style={styles.benefit}>Periódicos:</Text> Información diaria en papel{"\n"}
          • <Text style={styles.benefit}>Revistas:</Text> Publicaciones especializadas{"\n"}
          • <Text style={styles.benefit}>Libros:</Text> Información detallada y profunda{"\n"}
          • <Text style={styles.benefit}>Folletos:</Text> Información promocional
          {"\n\n"}
          <Text style={styles.subtitle}>📺 Medios audiovisuales:</Text>{"\n"}
          • <Text style={styles.benefit}>Televisión:</Text> Información con imagen y sonido{"\n"}
          • <Text style={styles.benefit}>Radio:</Text> Información solo auditiva{"\n"}
          • <Text style={styles.benefit}>Cine:</Text> Entretenimiento y documentales{"\n"}
          • <Text style={styles.benefit}>Videos:</Text> Contenido grabado
          {"\n\n"}
          <Text style={styles.subtitle}>💻 Medios digitales:</Text>{"\n"}
          • <Text style={styles.benefit}>Internet:</Text> Información global y accesible{"\n"}
          • <Text style={styles.benefit}>Redes sociales:</Text> Contenido compartido{"\n"}
          • <Text style={styles.benefit}>Apps móviles:</Text> Información portátil{"\n"}
          • <Text style={styles.benefit}>Podcasts:</Text> Contenido auditivo digital
        </Text>
        <Text style={styles.sectionTextAr}>
          <Text style={styles.subtitle}>📰 وسائل الإعلام المطبوعة:</Text>{"\n"}
          • <Text style={styles.benefit}>الصحف:</Text> معلومات يومية على الورق{"\n"}
          • <Text style={styles.benefit}>المجلات:</Text> منشورات متخصصة{"\n"}
          • <Text style={styles.benefit}>الكتب:</Text> معلومات مفصلة وعميقة{"\n"}
          • <Text style={styles.benefit}>المنشورات:</Text> معلومات ترويجية
          {"\n\n"}
          <Text style={styles.subtitle}>📺 وسائل الإعلام السمعية البصرية:</Text>{"\n"}
          • <Text style={styles.benefit}>التلفزيون:</Text> معلومات بالصورة والصوت{"\n"}
          • <Text style={styles.benefit}>الراديو:</Text> معلومات سمعية فقط{"\n"}
          • <Text style={styles.benefit}>السينما:</Text> ترفيه وأفلام وثائقية{"\n"}
          • <Text style={styles.benefit}>الفيديو:</Text> محتوى مسجل
          {"\n\n"}
          <Text style={styles.subtitle}>💻 وسائل الإعلام الرقمية:</Text>{"\n"}
          • <Text style={styles.benefit}>الإنترنت:</Text> معلومات عالمية وقابلة للوصول{"\n"}
          • <Text style={styles.benefit}>وسائل التواصل الاجتماعي:</Text> محتوى مشترك{"\n"}
          • <Text style={styles.benefit}>تطبيقات الهاتف:</Text> معلومات محمولة{"\n"}
          • <Text style={styles.benefit}>البودكاست:</Text> محتوى سمعي رقمي
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📰 El periodismo y la información</Text>
        <Text style={styles.sectionText}>
          <Text style={styles.subtitle}>🎯 Funciones del periodismo:</Text>{"\n"}
          • <Text style={styles.benefit}>Informar:</Text> Proporcionar noticias actuales{"\n"}
          • <Text style={styles.benefit}>Educar:</Text> Explicar temas complejos{"\n"}
          • <Text style={styles.benefit}>Entretener:</Text> Ofrecer contenido divertido{"\n"}
          • <Text style={styles.benefit}>Vigilar:</Text> Supervisar el poder público
          {"\n\n"}
          <Text style={styles.subtitle}>📝 Tipos de contenido periodístico:</Text>{"\n"}
          • <Text style={styles.benefit}>Noticias:</Text> Información sobre hechos recientes{"\n"}
          • <Text style={styles.benefit}>Reportajes:</Text> Investigaciones profundas{"\n"}
          • <Text style={styles.benefit}>Entrevistas:</Text> Conversaciones con personajes{"\n"}
          • <Text style={styles.benefit}>Editoriales:</Text> Opiniones del medio
          {"\n\n"}
          <Text style={styles.subtitle}>🏛️ Secciones periodísticas:</Text>{"\n"}
          • <Text style={styles.benefit}>Política:</Text> Gobierno, leyes, elecciones{"\n"}
          • <Text style={styles.benefit}>Economía:</Text> Negocios, finanzas, empleo{"\n"}
          • <Text style={styles.benefit}>Deportes:</Text> Competiciones, atletas{"\n"}
          • <Text style={styles.benefit}>Cultura:</Text> Arte, entretenimiento, sociedad
        </Text>
        <Text style={styles.sectionTextAr}>
          <Text style={styles.subtitle}>🎯 وظائف الصحافة:</Text>{"\n"}
          • <Text style={styles.benefit}>إعلام:</Text> تقديم أخبار حالية{"\n"}
          • <Text style={styles.benefit}>تعليم:</Text> شرح مواضيع معقدة{"\n"}
          • <Text style={styles.benefit}>ترفيه:</Text> تقديم محتوى مسلي{"\n"}
          • <Text style={styles.benefit}>مراقبة:</Text> الإشراف على السلطة العامة
          {"\n\n"}
          <Text style={styles.subtitle}>📝 أنواع المحتوى الصحفي:</Text>{"\n"}
          • <Text style={styles.benefit}>أخبار:</Text> معلومات عن أحداث حديثة{"\n"}
          • <Text style={styles.benefit}>تقارير:</Text> تحقيقات عميقة{"\n"}
          • <Text style={styles.benefit}>مقابلات:</Text> محادثات مع شخصيات{"\n"}
          • <Text style={styles.benefit}>افتتاحيات:</Text> آراء الوسيلة الإعلامية
          {"\n\n"}
          <Text style={styles.subtitle}>🏛️ أقسام الصحافة:</Text>{"\n"}
          • <Text style={styles.benefit}>سياسة:</Text> حكومة، قوانين، انتخابات{"\n"}
          • <Text style={styles.benefit}>اقتصاد:</Text> أعمال، مال، توظيف{"\n"}
          • <Text style={styles.benefit}>رياضة:</Text> منافسات، رياضيون{"\n"}
          • <Text style={styles.benefit}>ثقافة:</Text> فن، ترفيه، مجتمع
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Consumo responsable de medios</Text>
        <Text style={styles.sectionText}>
          <Text style={styles.subtitle}>✅ Cómo consumir medios de forma crítica:</Text>{"\n"}
          • <Text style={styles.tip}>Verificar fuentes:</Text> Comprobar la credibilidad{"\n"}
          • <Text style={styles.tip}>Leer múltiples perspectivas:</Text> No solo una fuente{"\n"}
          • <Text style={styles.tip}>Identificar sesgos:</Text> Reconocer puntos de vista{"\n"}
          • <Text style={styles.tip}>Cuestionar la información:</Text> No creer todo automáticamente
          {"\n\n"}
          <Text style={styles.subtitle}>⚠️ Desafíos de los medios modernos:</Text>{"\n"}
          • <Text style={styles.tip}>Desinformación:</Text> Información falsa o engañosa{"\n"}
          • <Text style={styles.tip}>Sesgos:</Text> Puntos de vista parciales{"\n"}
          • <Text style={styles.tip}>Sensacionalismo:</Text> Exageración de noticias{"\n"}
          • <Text style={styles.tip}>Filtros burbuja:</Text> Información personalizada
          {"\n\n"}
          <Text style={styles.subtitle}>💡 Consejos para el consumo:</Text>{"\n"}
          • <Text style={styles.tip}>Diversificar fuentes:</Text> Leer diferentes medios{"\n"}
          • <Text style={styles.tip}>Verificar fechas:</Text> Comprobar la actualidad{"\n"}
          • <Text style={styles.tip}>Buscar contexto:</Text> Entender el trasfondo{"\n"}
          • <Text style={styles.tip}>Desarrollar pensamiento crítico:</Text> Analizar la información
        </Text>
        <Text style={styles.sectionTextAr}>
          <Text style={styles.subtitle}>✅ كيفية استهلاك وسائل الإعلام بشكل نقدي:</Text>{"\n"}
          • <Text style={styles.tip}>التحقق من المصادر:</Text> التأكد من المصداقية{"\n"}
          • <Text style={styles.tip}>قراءة وجهات نظر متعددة:</Text> ليس مصدر واحد فقط{"\n"}
          • <Text style={styles.tip}>تحديد التحيزات:</Text> التعرف على وجهات النظر{"\n"}
          • <Text style={styles.tip}>استجواب المعلومات:</Text> عدم تصديق كل شيء تلقائياً
          {"\n\n"}
          <Text style={styles.subtitle}>⚠️ تحديات وسائل الإعلام الحديثة:</Text>{"\n"}
          • <Text style={styles.tip}>التضليل:</Text> معلومات خاطئة أو مضللة{"\n"}
          • <Text style={styles.tip}>التحيزات:</Text> وجهات نظر جزئية{"\n"}
          • <Text style={styles.tip}>الإثارة:</Text> مبالغة في الأخبار{"\n"}
          • <Text style={styles.tip}>فقاعات التصفية:</Text> معلومات مخصصة
          {"\n\n"}
          <Text style={styles.subtitle}>💡 نصائح للاستهلاك:</Text>{"\n"}
          • <Text style={styles.tip}>تنويع المصادر:</Text> قراءة وسائل إعلام مختلفة{"\n"}
          • <Text style={styles.tip}>التحقق من التواريخ:</Text> التأكد من الحداثة{"\n"}
          • <Text style={styles.tip}>البحث عن السياق:</Text> فهم الخلفية{"\n"}
          • <Text style={styles.tip}>تطوير التفكير النقدي:</Text> تحليل المعلومات
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Vocabulario esencial de medios de comunicación</Text>
        <Text style={styles.sectionText}>
          <Text style={styles.subtitle}>📰 Conceptos básicos:</Text>{"\n"}
          medios de comunicación = وسائل الإعلام{"\n"}
          noticia = خبر{"\n"}
          información = معلومات{"\n"}
          periodismo = صحافة{"\n"}
          periodista = صحفي{"\n"}
          prensa = صحافة{"\n"}
          actualidad = راهن{"\n"}
          reportaje = تقرير
          {"\n\n"}
          <Text style={styles.subtitle}>📺 Medios tradicionales:</Text>{"\n"}
          periódico = جريدة{"\n"}
          revista = مجلة{"\n"}
          televisión = تلفزيون{"\n"}
          radio = راديو{"\n"}
          revista = مجلة{"\n"}
          libro = كتاب{"\n"}
          revista = مجلة{"\n"}
          folleto = منشور
          {"\n\n"}
          <Text style={styles.subtitle}>💻 Medios digitales:</Text>{"\n"}
          internet = إنترنت{"\n"}
          digital = رقمي{"\n"}
          online = على الإنترنت{"\n"}
          aplicación = تطبيق{"\n"}
          red social = شبكة اجتماعية{"\n"}
          blog = مدونة{"\n"}
          podcast = بودكاست{"\n"}
          streaming = بث مباشر
          {"\n\n"}
          <Text style={styles.subtitle}>🎯 Contenido periodístico:</Text>{"\n"}
          entrevista = مقابلة{"\n"}
          editorial = افتتاحية{"\n"}
          crónica = تقرير إخباري{"\n"}
          columna = عمود{"\n"}
          artículo = مقال{"\n"}
          titular = عنوان رئيسي{"\n"}
          subtítulo = عنوان فرعي{"\n"}
          pie de foto = شرح الصورة
        </Text>
        <Text style={styles.sectionTextAr}>
          <Text style={styles.subtitle}>📰 المفاهيم الأساسية:</Text>{"\n"}
          وسائل الإعلام = medios de comunicación{"\n"}
          خبر = noticia{"\n"}
          معلومات = información{"\n"}
          صحافة = periodismo{"\n"}
          صحفي = periodista{"\n"}
          صحافة = prensa{"\n"}
          راهن = actualidad{"\n"}
          تقرير = reportaje
          {"\n\n"}
          <Text style={styles.subtitle}>📺 وسائل الإعلام التقليدية:</Text>{"\n"}
          جريدة = periódico{"\n"}
          مجلة = revista{"\n"}
          تلفزيون = televisión{"\n"}
          راديو = radio{"\n"}
          مجلة = revista{"\n"}
          كتاب = libro{"\n"}
          مجلة = revista{"\n"}
          منشور = folleto
          {"\n\n"}
          <Text style={styles.subtitle}>💻 وسائل الإعلام الرقمية:</Text>{"\n"}
          إنترنت = internet{"\n"}
          رقمي = digital{"\n"}
          على الإنترنت = online{"\n"}
          تطبيق = aplicación{"\n"}
          شبكة اجتماعية = red social{"\n"}
          مدونة = blog{"\n"}
          بودكاست = podcast{"\n"}
          بث مباشر = streaming
          {"\n\n"}
          <Text style={styles.subtitle}>🎯 المحتوى الصحفي:</Text>{"\n"}
          مقابلة = entrevista{"\n"}
          افتتاحية = editorial{"\n"}
          تقرير إخباري = crónica{"\n"}
          عمود = columna{"\n"}
          مقال = artículo{"\n"}
          عنوان رئيسي = titular{"\n"}
          عنوان فرعي = subtítulo{"\n"}
          شرح الصورة = pie de foto
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Expresiones útiles sobre medios de comunicación</Text>
        <Text style={styles.sectionText}>
          • "¿Lees las noticias todos los días?" = هل تقرأ الأخبار يومياً؟{"\n"}
          • "¿Qué periódico prefieres?" = ما هي الجريدة التي تفضل؟{"\n"}
          • "¿Ves las noticias en la televisión?" = هل تشاهد الأخبار على التلفزيون？{"\n"}
          • "¿Escuchas la radio?" = هل تستمع إلى الراديو؟{"\n"}
          • "¿Qué opinas de esta noticia?" = ما رأيك في هذا الخبر؟{"\n"}
          • "¿Prefieres medios digitales o tradicionales?" = هل تفضل وسائل الإعلام الرقمية أم التقليدية؟{"\n"}
          • "¿Cómo te mantienes informado?" = كيف تبقى على اطلاع؟{"\n"}
          • "¿Confías en las noticias que lees?" = هل تثق بالأخبار التي تقرأها؟
        </Text>
        <Text style={styles.sectionTextAr}>
          • "هل تقرأ الأخبار يومياً؟" = ¿Lees las noticias todos los días?{"\n"}
          • "ما هي الجريدة التي تفضل؟" = ¿Qué periódico prefieres?{"\n"}
          • "هل تشاهد الأخبار على التلفزيون؟" = ¿Ves las noticias en la televisión?{"\n"}
          • "هل تستمع إلى الراديو؟" = ¿Escuchas la radio?{"\n"}
          • "ما رأيك في هذا الخبر؟" = ¿Qué opinas de esta noticia?{"\n"}
          • "هل تفضل وسائل الإعلام الرقمية أم التقليدية؟" = ¿Prefieres medios digitales o tradicionales?{"\n"}
          • "كيف تبقى على اطلاع؟" = ¿Cómo te mantienes informado?{"\n"}
          • "هل تثق بالأخبار التي تقرأها؟" = ¿Confías en las noticias que lees?
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🇪🇸 Medios de comunicación en España</Text>
        <Text style={styles.sectionText}>
          <Text style={styles.subtitle}>📰 Periódicos principales:</Text>{"\n"}
          • <Text style={styles.benefit}>El País:</Text> Periódico de referencia nacional{"\n"}
          • <Text style={styles.benefit}>El Mundo:</Text> Periódico de información general{"\n"}
          • <Text style={styles.benefit}>ABC:</Text> Periódico conservador tradicional{"\n"}
          • <Text style={styles.benefit}>La Vanguardia:</Text> Periódico catalán importante
          {"\n\n"}
          <Text style={styles.subtitle}>📺 Canales de televisión:</Text>{"\n"}
          • <Text style={styles.benefit}>TVE:</Text> Televisión pública nacional{"\n"}
          • <Text style={styles.benefit}>Antena 3:</Text> Canal privado popular{"\n"}
          • <Text style={styles.benefit}>Telecinco:</Text> Canal de entretenimiento{"\n"}
          • <Text style={styles.benefit}>La Sexta:</Text> Canal de noticias y debate
          {"\n\n"}
          <Text style={styles.subtitle}>📻 Emisoras de radio:</Text>{"\n"}
          • <Text style={styles.benefit}>RNE:</Text> Radio pública nacional{"\n"}
          • <Text style={styles.benefit}>Cadena SER:</Text> Radio privada líder{"\n"}
          • <Text style={styles.benefit}>COPE:</Text> Radio de la Iglesia católica{"\n"}
          • <Text style={styles.benefit}>Onda Cero:</Text> Radio de información general
        </Text>
        <Text style={styles.sectionTextAr}>
          <Text style={styles.subtitle}>📰 الصحف الرئيسية:</Text>{"\n"}
          • <Text style={styles.benefit}>إل باييس:</Text> جريدة مرجعية وطنية{"\n"}
          • <Text style={styles.benefit}>إل موندو:</Text> جريدة معلومات عامة{"\n"}
          • <Text style={styles.benefit}>إيه بي سي:</Text> جريدة محافظة تقليدية{"\n"}
          • <Text style={styles.benefit}>لا فانغوارديا:</Text> جريدة كاتالونية مهمة
          {"\n\n"}
          <Text style={styles.subtitle}>📺 قنوات التلفزيون:</Text>{"\n"}
          • <Text style={styles.benefit}>تي في إي:</Text> تلفزيون عام وطني{"\n"}
          • <Text style={styles.benefit}>أنتينا 3:</Text> قناة خاصة شعبية{"\n"}
          • <Text style={styles.benefit}>تيلسينكو:</Text> قناة ترفيه{"\n"}
          • <Text style={styles.benefit}>لا سيكستا:</Text> قناة أخبار ومناقشات
          {"\n\n"}
          <Text style={styles.subtitle}>📻 محطات الراديو:</Text>{"\n"}
          • <Text style={styles.benefit}>آر إن إي:</Text> راديو عام وطني{"\n"}
          • <Text style={styles.benefit}>كادينا سير:</Text> راديو خاص رائد{"\n"}
          • <Text style={styles.benefit}>كوبي:</Text> راديو الكنيسة الكاثوليكية{"\n"}
          • <Text style={styles.benefit}>أوندا سيرو:</Text> راديو معلومات عامة
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Ejercicios de práctica</Text>
        <Text style={styles.sectionText}>Practica lo que has aprendido con estos ejercicios interactivos.</Text>
        <Text style={styles.sectionTextAr}>تدرب على ما تعلمته مع هذه التمارين التفاعلية.</Text>
      </View>

      <EjerciciosInteractivos ejercicios={ejercicios} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f7fa',
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 16,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 18,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
    textAlign: 'center',
  },
  titleAr: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 16,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
    lineHeight: 24,
  },
  sectionTextAr: {
    fontSize: 16,
    color: '#333',
    writingDirection: 'rtl',
    marginBottom: 2,
    fontFamily: 'System',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#388e3c',
  },
  benefit: {
    fontWeight: 'bold',
    color: '#388e3c',
  },
  tip: {
    fontWeight: 'bold',
    color: '#ff6f00',
  },
  dialogueTitle: {
    fontWeight: 'bold',
    color: '#1976d2',
    fontSize: 18,
  },
  speaker: {
    fontWeight: 'bold',
    color: '#388e3c',
  },
});
