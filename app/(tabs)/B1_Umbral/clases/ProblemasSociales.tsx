import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import EjerciciosInteractivos from '../../../components/EjerciciosInteractivos';

export default function ProblemasSociales() {
  const router = useRouter();

  const ejercicios = [
    // Ejercicio 1: Relacionar problemas sociales con sus características
    {
      tipo: 'relacionar',
      enunciado: 'Relaciona cada problema social con su característica principal:',
      pares: [
        { izquierda: '💰 Desigualdad económica', derecha: 'Diferencias en ingresos y riqueza' },
        { izquierda: '🚫 Discriminación', derecha: 'Trato injusto por diferencias' },
        { izquierda: '🏠 Pobreza', derecha: 'Falta de recursos básicos' },
        { izquierda: '🌍 Racismo', derecha: 'Discriminación por raza o etnia' }
      ]
    },

    // Ejercicio 2: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué significa "igualdad"?',
      opciones: ['Ser diferente', 'Tener los mismos derechos y oportunidades', 'Ser mejor', 'Ser peor'],
      respuesta_correcta: 'Tener los mismos derechos y oportunidades'
    },

    // Ejercicio 3: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué es la "diversidad"?',
      opciones: ['Ser igual', 'Variedad de personas, culturas y perspectivas', 'Ser mejor', 'Ser peor'],
      respuesta_correcta: 'Variedad de personas, culturas y perspectivas'
    },

    // Ejercicio 4: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué significa "discriminación"?',
      opciones: ['Tratar bien a todos', 'Tratar mal a alguien por ser diferente', 'Ser igual', 'Respetar'],
      respuesta_correcta: 'Tratar mal a alguien por ser diferente'
    },

    // Ejercicio 5: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué es la "inmigración"?',
      opciones: ['Quedarse en casa', 'Mudarse a otro país para vivir', 'Viajar de vacaciones', 'Estudiar'],
      respuesta_correcta: 'Mudarse a otro país para vivir'
    },

    // Ejercicio 6: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué significa "tolerancia"?',
      opciones: ['Discriminar', 'Respetar y aceptar las diferencias', 'Ignorar', 'Ser igual'],
      respuesta_correcta: 'Respetar y aceptar las diferencias'
    },

    // Ejercicio 7: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué es la "pobreza"?',
      opciones: ['Tener mucho dinero', 'Falta de recursos económicos básicos', 'Ser rico', 'Tener todo'],
      respuesta_correcta: 'Falta de recursos económicos básicos'
    },

    // Ejercicio 8: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué significa "justicia social"?',
      opciones: ['Solo leyes', 'Distribución justa de recursos y oportunidades', 'Solo castigos', 'Solo premios'],
      respuesta_correcta: 'Distribución justa de recursos y oportunidades'
    },

    // Ejercicio 9: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué es la "inclusión"?',
      opciones: ['Excluir personas', 'Incluir a todas las personas en la sociedad', 'Solo algunos', 'Nadie'],
      respuesta_correcta: 'Incluir a todas las personas en la sociedad'
    },

    // Ejercicio 10: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué significa "derechos humanos"?',
      opciones: ['Solo privilegios', 'Derechos básicos que tiene toda persona', 'Solo leyes', 'Solo deberes'],
      respuesta_correcta: 'Derechos básicos que tiene toda persona'
    },

    // Ejercicio 11: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué es el "racismo"?',
      opciones: ['Respetar razas', 'Discriminación basada en raza o etnia', 'Igualdad racial', 'Diversidad'],
      respuesta_correcta: 'Discriminación basada en raza o etnia'
    },

    // Ejercicio 12: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué significa "solidaridad"?',
      opciones: ['Solo individualismo', 'Apoyo mutuo entre personas', 'Solo egoísmo', 'Solo competencia'],
      respuesta_correcta: 'Apoyo mutuo entre personas'
    },

    // Ejercicio 13: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué es la "exclusión social"?',
      opciones: ['Incluir a todos', 'Dejar fuera a personas de la sociedad', 'Integración', 'Inclusión'],
      respuesta_correcta: 'Dejar fuera a personas de la sociedad'
    },

    // Ejercicio 14: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué significa "empoderamiento"?',
      opciones: ['Debilitar', 'Dar poder y confianza a las personas', 'Controlar', 'Limitar'],
      respuesta_correcta: 'Dar poder y confianza a las personas'
    },

    // Ejercicio 15: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué es la "igualdad de género"?',
      opciones: ['Solo derechos de hombres', 'Que hombres y mujeres tengan los mismos derechos', 'Solo derechos de mujeres', 'Desigualdad'],
      respuesta_correcta: 'Que hombres y mujeres tengan los mismos derechos'
    },

    // Ejercicio 16: Relacionar
    {
      tipo: 'relacionar',
      enunciado: 'Relaciona cada derecho humano con su descripción:',
      pares: [
        { izquierda: '📚 Derecho a la educación', derecha: 'Poder estudiar y aprender' },
        { izquierda: '💼 Derecho al trabajo', derecha: 'Poder tener un empleo digno' },
        { izquierda: '🏥 Derecho a la salud', derecha: 'Recibir atención médica' },
        { izquierda: '🏠 Derecho a la vivienda', derecha: 'Tener un lugar donde vivir' }
      ]
    },

    // Ejercicio 17: Relacionar
    {
      tipo: 'relacionar',
      enunciado: 'Relaciona cada acción con su beneficio social:',
      pares: [
        { izquierda: '🤝 Respetar diferencias', derecha: 'Promover la tolerancia' },
        { izquierda: '📖 Educarse', derecha: 'Entender mejor los problemas' },
        { izquierda: '🗳️ Votar', derecha: 'Participar en decisiones' },
        { izquierda: '❤️ Ayudar a otros', derecha: 'Crear solidaridad' }
      ]
    },

    // Ejercicio 18: Relacionar
    {
      tipo: 'relacionar',
      enunciado: 'Relaciona cada problema con su posible solución:',
      pares: [
        { izquierda: '💰 Desigualdad económica', derecha: 'Políticas de redistribución' },
        { izquierda: '🚫 Discriminación', derecha: 'Educación y sensibilización' },
        { izquierda: '🏠 Pobreza', derecha: 'Programas de ayuda social' },
        { izquierda: '🌍 Racismo', derecha: 'Promover la diversidad' }
      ]
    },

    // Ejercicio 19: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué significa "participación ciudadana"?',
      opciones: ['Solo votar', 'Participar activamente en la sociedad', 'Solo quejarse', 'Solo observar'],
      respuesta_correcta: 'Participar activamente en la sociedad'
    },

    // Ejercicio 20: Opción múltiple
    {
      tipo: 'opcion_multiple',
      enunciado: '¿Qué es importante para resolver problemas sociales?',
      opciones: ['Solo ignorarlos', 'Trabajo conjunto y participación de todos', 'Solo quejarse', 'Solo esperar'],
      respuesta_correcta: 'Trabajo conjunto y participación de todos'
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
        source={{ uri: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80' }}
        style={styles.heroImage}
        accessibilityLabel="Imagen de problemas sociales y actualidad"
      />
      
      <Text style={styles.title}>🌍 Problemas sociales y actualidad</Text>
      <Text style={styles.titleAr}>🌍 القضايا الاجتماعية والراهنة</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚖️ Importancia de los problemas sociales</Text>
        <Text style={styles.sectionText}>
          Los problemas sociales son desafíos que afectan a toda la sociedad y requieren 
          atención colectiva y soluciones compartidas. Estos problemas impactan la calidad 
          de vida de las personas y el desarrollo de las comunidades.
          {"\n\n"}
          Entender estos temas es fundamental para participar activamente en la sociedad, 
          expresar opiniones informadas y contribuir a crear un mundo más justo, 
          inclusivo y equitativo para todas las personas.
        </Text>
        <Text style={styles.sectionTextAr}>
          المشاكل الاجتماعية هي تحديات تؤثر على المجتمع بأكمله وتتطلب
          اهتمامًا جماعيًا وحلولاً مشتركة. هذه المشاكل تؤثر على جودة
          حياة الناس وتطور المجتمعات.
          {"\n\n"}
          فهم هذه المواضيع أساسي للمشاركة النشطة في المجتمع،
          والتعبير عن آراء مستنيرة والمساهمة في خلق عالم أكثر عدالة،
          شمولية وإنصافاً لجميع الناس.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚨 Principales problemas sociales actuales</Text>
        <Text style={styles.sectionText}>
          <Text style={styles.subtitle}>💰 Desigualdad económica:</Text>{"\n"}
          • <Text style={styles.benefit}>Diferencias de ingresos:</Text> Brecha entre ricos y pobres{"\n"}
          • <Text style={styles.benefit}>Acceso desigual:</Text> A recursos, educación y salud{"\n"}
          • <Text style={styles.benefit}>Pobreza:</Text> Falta de recursos económicos básicos{"\n"}
          • <Text style={styles.benefit}>Exclusión financiera:</Text> Sin acceso a servicios bancarios
          {"\n\n"}
          <Text style={styles.subtitle}>🚫 Discriminación y prejuicios:</Text>{"\n"}
          • <Text style={styles.benefit}>Racismo:</Text> Discriminación por raza o etnia{"\n"}
          • <Text style={styles.benefit}>Sexismo:</Text> Discriminación por género{"\n"}
          • <Text style={styles.benefit}>Edadismo:</Text> Discriminación por edad{"\n"}
          • <Text style={styles.benefit}>Xenofobia:</Text> Miedo o rechazo a extranjeros
          {"\n\n"}
          <Text style={styles.subtitle}>🌍 Inmigración y refugiados:</Text>{"\n"}
          • <Text style={styles.benefit}>Migración forzada:</Text> Por conflictos o crisis{"\n"}
          • <Text style={styles.benefit}>Integración cultural:</Text> Adaptación a nuevas sociedades{"\n"}
          • <Text style={styles.benefit}>Derechos de inmigrantes:</Text> Acceso a servicios básicos{"\n"}
          • <Text style={styles.benefit}>Refugiados:</Text> Personas que huyen de peligros
        </Text>
        <Text style={styles.sectionTextAr}>
          <Text style={styles.subtitle}>💰 عدم المساواة الاقتصادية:</Text>{"\n"}
          • <Text style={styles.benefit}>اختلافات الدخل:</Text> فجوة بين الأغنياء والفقراء{"\n"}
          • <Text style={styles.benefit}>وصول غير متساوٍ:</Text> للموارد والتعليم والصحة{"\n"}
          • <Text style={styles.benefit}>فقر:</Text> نقص الموارد الاقتصادية الأساسية{"\n"}
          • <Text style={styles.benefit}>إقصاء مالي:</Text> بدون وصول للخدمات المصرفية
          {"\n\n"}
          <Text style={styles.subtitle}>🚫 التمييز والتحيزات:</Text>{"\n"}
          • <Text style={styles.benefit}>عنصرية:</Text> تمييز على أساس العرق أو الإثنية{"\n"}
          • <Text style={styles.benefit}>تمييز جنسي:</Text> تمييز على أساس الجنس{"\n"}
          • <Text style={styles.benefit}>تمييز عمري:</Text> تمييز على أساس العمر{"\n"}
          • <Text style={styles.benefit}>كراهية الأجانب:</Text> خوف أو رفض للأجانب
          {"\n\n"}
          <Text style={styles.subtitle}>🌍 الهجرة واللاجئين:</Text>{"\n"}
          • <Text style={styles.benefit}>هجرة قسرية:</Text> بسبب نزاعات أو أزمات{"\n"}
          • <Text style={styles.benefit}>تكامل ثقافي:</Text> التكيف مع مجتمعات جديدة{"\n"}
          • <Text style={styles.benefit}>حقوق المهاجرين:</Text> الوصول للخدمات الأساسية{"\n"}
          • <Text style={styles.benefit}>لاجئين:</Text> أشخاص يفرون من مخاطر
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Educación y acceso al conocimiento</Text>
        <Text style={styles.sectionText}>
          <Text style={styles.subtitle}>🎓 Desigualdad educativa:</Text>{"\n"}
          • <Text style={styles.benefit}>Acceso limitado:</Text> A educación de calidad{"\n"}
          • <Text style={styles.benefit}>Brecha digital:</Text> Diferencias en acceso a tecnología{"\n"}
          • <Text style={styles.benefit}>Abandono escolar:</Text> Estudiantes que dejan la escuela{"\n"}
          • <Text style={styles.benefit}>Formación profesional:</Text> Falta de oportunidades de capacitación
          {"\n\n"}
          <Text style={styles.subtitle}>🏥 Salud y bienestar:</Text>{"\n"}
          • <Text style={styles.benefit}>Acceso a la salud:</Text> Atención médica para todos{"\n"}
          • <Text style={styles.benefit}>Salud mental:</Text> Problemas psicológicos y emocionales{"\n"}
          • <Text style={styles.benefit}>Enfermedades:</Text> Prevención y tratamiento{"\n"}
          • <Text style={styles.benefit}>Nutrición:</Text> Acceso a alimentos saludables
          {"\n\n"}
          <Text style={styles.subtitle}>🏠 Vivienda y urbanismo:</Text>{"\n"}
          • <Text style={styles.benefit}>Vivienda digna:</Text> Hogares seguros y adecuados{"\n"}
          • <Text style={styles.benefit}>Sin hogar:</Text> Personas sin vivienda{"\n"}
          • <Text style={styles.benefit}>Hacinamiento:</Text> Viviendas sobrepobladas{"\n"}
          • <Text style={styles.benefit}>Servicios básicos:</Text> Agua, electricidad, saneamiento
        </Text>
        <Text style={styles.sectionTextAr}>
          <Text style={styles.subtitle}>🎓 عدم المساواة التعليمية:</Text>{"\n"}
          • <Text style={styles.benefit}>وصول محدود:</Text> للتعليم الجيد{"\n"}
          • <Text style={styles.benefit}>فجوة رقمية:</Text> اختلافات في الوصول للتكنولوجيا{"\n"}
          • <Text style={styles.benefit}>تسرب مدرسي:</Text> طلاب يتركون المدرسة{"\n"}
          • <Text style={styles.benefit}>تدريب مهني:</Text> نقص فرص التدريب
          {"\n\n"}
          <Text style={styles.subtitle}>🏥 الصحة والرفاهية:</Text>{"\n"}
          • <Text style={styles.benefit}>الوصول للصحة:</Text> رعاية طبية للجميع{"\n"}
          • <Text style={styles.benefit}>صحة نفسية:</Text> مشاكل نفسية وعاطفية{"\n"}
          • <Text style={styles.benefit}>أمراض:</Text> الوقاية والعلاج{"\n"}
          • <Text style={styles.benefit}>تغذية:</Text> الوصول لأطعمة صحية
          {"\n\n"}
          <Text style={styles.subtitle}>🏠 سكن وتخطيط حضري:</Text>{"\n"}
          • <Text style={styles.benefit}>سكن كريم:</Text> منازل آمنة ومناسبة{"\n"}
          • <Text style={styles.benefit}>بدون مأوى:</Text> أشخاص بدون سكن{"\n"}
          • <Text style={styles.benefit}>اكتظاظ:</Text> مساكن مكتظة{"\n"}
          • <Text style={styles.benefit}>خدمات أساسية:</Text> ماء، كهرباء، صرف صحي
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚖️ Derechos humanos fundamentales</Text>
        <Text style={styles.sectionText}>
          <Text style={styles.subtitle}>🛡️ Derechos básicos:</Text>{"\n"}
          • <Text style={styles.benefit}>Derecho a la vida:</Text> Protección de la vida humana{"\n"}
          • <Text style={styles.benefit}>Derecho a la libertad:</Text> Libertad de expresión y movimiento{"\n"}
          • <Text style={styles.benefit}>Derecho a la igualdad:</Text> Trato igual ante la ley{"\n"}
          • <Text style={styles.benefit}>Derecho a la dignidad:</Text> Respeto a la persona humana
          {"\n\n"}
          <Text style={styles.subtitle}>📚 Derechos sociales:</Text>{"\n"}
          • <Text style={styles.benefit}>Derecho a la educación:</Text> Acceso a la formación{"\n"}
          • <Text style={styles.benefit}>Derecho al trabajo:</Text> Empleo digno y justo{"\n"}
          • <Text style={styles.benefit}>Derecho a la salud:</Text> Atención médica adecuada{"\n"}
          • <Text style={styles.benefit}>Derecho a la vivienda:</Text> Hogar seguro y adecuado
          {"\n\n"}
          <Text style={styles.subtitle}>🌍 Derechos culturales:</Text>{"\n"}
          • <Text style={styles.benefit}>Derecho a la identidad:</Text> Mantener cultura propia{"\n"}
          • <Text style={styles.benefit}>Derecho a la participación:</Text> En decisiones sociales{"\n"}
          • <Text style={styles.benefit}>Derecho a la información:</Text> Acceso a información veraz{"\n"}
          • <Text style={styles.benefit}>Derecho a la asociación:</Text> Formar grupos y organizaciones
        </Text>
        <Text style={styles.sectionTextAr}>
          <Text style={styles.subtitle}>🛡️ حقوق أساسية:</Text>{"\n"}
          • <Text style={styles.benefit}>الحق في الحياة:</Text> حماية الحياة البشرية{"\n"}
          • <Text style={styles.benefit}>الحق في الحرية:</Text> حرية التعبير والحركة{"\n"}
          • <Text style={styles.benefit}>الحق في المساواة:</Text> معاملة متساوية أمام القانون{"\n"}
          • <Text style={styles.benefit}>الحق في الكرامة:</Text> احترام الشخص البشري
          {"\n\n"}
          <Text style={styles.subtitle}>📚 حقوق اجتماعية:</Text>{"\n"}
          • <Text style={styles.benefit}>الحق في التعليم:</Text> الوصول للتدريب{"\n"}
          • <Text style={styles.benefit}>الحق في العمل:</Text> عمل كريم وعادل{"\n"}
          • <Text style={styles.benefit}>الحق في الصحة:</Text> رعاية طبية مناسبة{"\n"}
          • <Text style={styles.benefit}>الحق في السكن:</Text> منزل آمن ومناسب
          {"\n\n"}
          <Text style={styles.subtitle}>🌍 حقوق ثقافية:</Text>{"\n"}
          • <Text style={styles.benefit}>الحق في الهوية:</Text> الحفاظ على الثقافة الخاصة{"\n"}
          • <Text style={styles.benefit}>الحق في المشاركة:</Text> في القرارات الاجتماعية{"\n"}
          • <Text style={styles.benefit}>الحق في المعلومات:</Text> الوصول لمعلومات صحيحة{"\n"}
          • <Text style={styles.benefit}>الحق في التجمع:</Text> تشكيل مجموعات ومنظمات
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤝 Cómo contribuir a la solución</Text>
        <Text style={styles.sectionText}>
          <Text style={styles.subtitle}>📖 Educación y concienciación:</Text>{"\n"}
          • <Text style={styles.tip}>Informarse:</Text> Sobre problemas sociales actuales{"\n"}
          • <Text style={styles.tip}>Educar a otros:</Text> Compartir conocimiento{"\n"}
          • <Text style={styles.tip}>Desarrollar empatía:</Text> Ponerse en el lugar del otro{"\n"}
          • <Text style={styles.tip}>Pensamiento crítico:</Text> Analizar información
          {"\n\n"}
          <Text style={styles.subtitle}>🤝 Acciones directas:</Text>{"\n"}
          • <Text style={styles.tip}>Voluntariado:</Text> Ayudar a organizaciones sociales{"\n"}
          • <Text style={styles.tip}>Donaciones:</Text> Contribuir económicamente{"\n"}
          • <Text style={styles.tip}>Denunciar:</Text> Reportar discriminación o injusticias{"\n"}
          • <Text style={styles.tip}>Apoyar causas:</Text> Participar en campañas
          {"\n\n"}
          <Text style={styles.subtitle}>🗳️ Participación ciudadana:</Text>{"\n"}
          • <Text style={styles.tip}>Votar:</Text> En elecciones y referendos{"\n"}
          • <Text style={styles.tip}>Expresar opiniones:</Text> En debates públicos{"\n"}
          • <Text style={styles.tip}>Contactar autoridades:</Text> Hacer peticiones{"\n"}
          • <Text style={styles.tip}>Participar en asociaciones:</Text> Grupos comunitarios
        </Text>
        <Text style={styles.sectionTextAr}>
          <Text style={styles.subtitle}>📖 تعليم وتوعية:</Text>{"\n"}
          • <Text style={styles.tip}>الإطلاع:</Text> على المشاكل الاجتماعية الحالية{"\n"}
          • <Text style={styles.tip}>تعليم الآخرين:</Text> مشاركة المعرفة{"\n"}
          • <Text style={styles.tip}>تطوير التعاطف:</Text> وضع النفس مكان الآخر{"\n"}
          • <Text style={styles.tip}>تفكير نقدي:</Text> تحليل المعلومات
          {"\n\n"}
          <Text style={styles.subtitle}>🤝 إجراءات مباشرة:</Text>{"\n"}
          • <Text style={styles.tip}>تطوع:</Text> مساعدة المنظمات الاجتماعية{"\n"}
          • <Text style={styles.tip}>تبرعات:</Text> المساهمة مالياً{"\n"}
          • <Text style={styles.tip}>إبلاغ:</Text> الإبلاغ عن التمييز أو الظلم{"\n"}
          • <Text style={styles.tip}>دعم قضايا:</Text> المشاركة في حملات
          {"\n\n"}
          <Text style={styles.subtitle}>🗳️ مشاركة مدنية:</Text>{"\n"}
          • <Text style={styles.tip}>تصويت:</Text> في الانتخابات والاستفتاءات{"\n"}
          • <Text style={styles.tip}>التعبير عن الآراء:</Text> في النقاشات العامة{"\n"}
          • <Text style={styles.tip}>التواصل مع السلطات:</Text> تقديم طلبات{"\n"}
          • <Text style={styles.tip}>المشاركة في جمعيات:</Text> مجموعات مجتمعية
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Vocabulario esencial de problemas sociales</Text>
        <Text style={styles.sectionText}>
          <Text style={styles.subtitle}>⚖️ Conceptos básicos:</Text>{"\n"}
          igualdad = مساواة{"\n"}
          derecho = حق{"\n"}
          sociedad = مجتمع{"\n"}
          diversidad = تنوع{"\n"}
          problema = مشكلة{"\n"}
          solución = حل{"\n"}
          justicia = عدالة{"\n"}
          libertad = حرية
          {"\n\n"}
          <Text style={styles.subtitle}>🚫 Discriminación:</Text>{"\n"}
          discriminación = تمييز{"\n"}
          racismo = عنصرية{"\n"}
          sexismo = تمييز جنسي{"\n"}
          xenofobia = كراهية الأجانب{"\n"}
          prejuicio = تحيز{"\n"}
          intolerancia = تعصب{"\n"}
          exclusión = إقصاء{"\n"}
          marginación = تهميش
          {"\n\n"}
          <Text style={styles.subtitle}>🤝 Inclusión:</Text>{"\n"}
          inclusión = شمولية{"\n"}
          tolerancia = تسامح{"\n"}
          respeto = احترام{"\n"}
          solidaridad = تضامن{"\n"}
          empatía = تعاطف{"\n"}
          cooperación = تعاون{"\n"}
          participación = مشاركة{"\n"}
          integración = تكامل
          {"\n\n"}
          <Text style={styles.subtitle}>🌍 Problemas específicos:</Text>{"\n"}
          pobreza = فقر{"\n"}
          inmigración = هجرة{"\n"}
          refugiado = لاجئ{"\n"}
          desempleo = بطالة{"\n"}
          analfabetismo = أمية{"\n"}
          hambre = جوع{"\n"}
          violencia = عنف{"\n"}
          corrupción = فساد
        </Text>
        <Text style={styles.sectionTextAr}>
          <Text style={styles.subtitle}>⚖️ المفاهيم الأساسية:</Text>{"\n"}
          مساواة = igualdad{"\n"}
          حق = derecho{"\n"}
          مجتمع = sociedad{"\n"}
          تنوع = diversidad{"\n"}
          مشكلة = problema{"\n"}
          حل = solución{"\n"}
          عدالة = justicia{"\n"}
          حرية = libertad
          {"\n\n"}
          <Text style={styles.subtitle}>🚫 التمييز:</Text>{"\n"}
          تمييز = discriminación{"\n"}
          عنصرية = racismo{"\n"}
          تمييز جنسي = sexismo{"\n"}
          كراهية الأجانب = xenofobia{"\n"}
          تحيز = prejuicio{"\n"}
          تعصب = intolerancia{"\n"}
          إقصاء = exclusión{"\n"}
          تهميش = marginación
          {"\n\n"}
          <Text style={styles.subtitle}>🤝 الشمولية:</Text>{"\n"}
          شمولية = inclusión{"\n"}
          تسامح = tolerancia{"\n"}
          احترام = respeto{"\n"}
          تضامن = solidaridad{"\n"}
          تعاطف = empatía{"\n"}
          تعاون = cooperación{"\n"}
          مشاركة = participación{"\n"}
          تكامل = integración
          {"\n\n"}
          <Text style={styles.subtitle}>🌍 مشاكل محددة:</Text>{"\n"}
          فقر = pobreza{"\n"}
          هجرة = inmigración{"\n"}
          لاجئ = refugiado{"\n"}
          بطالة = desempleo{"\n"}
          أمية = analfabetismo{"\n"}
          جوع = hambre{"\n"}
          عنف = violencia{"\n"}
          فساد = corrupción
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Expresiones útiles sobre problemas sociales</Text>
        <Text style={styles.sectionText}>
          • "¿Qué opinas sobre la desigualdad?" = ما رأيك في عدم المساواة؟{"\n"}
          • "¿Cómo podemos combatir la discriminación?" = كيف يمكننا مكافحة التمييز؟{"\n"}
          • "¿Qué problemas sociales te preocupan más?" = ما المشاكل الاجتماعية التي تقلقك أكثر؟{"\n"}
          • "¿Qué podemos hacer para ayudar?" = ماذا يمكننا أن نفعل للمساعدة؟{"\n"}
          • "¿Crees que la sociedad es justa?" = هل تعتقد أن المجتمع عادل؟{"\n"}
          • "¿Qué derechos son más importantes?" = ما هي الحقوق الأهم؟{"\n"}
          • "¿Cómo promover la inclusión?" = كيف نروج للشمولية؟{"\n"}
          • "¿Qué papel podemos tener en la solución?" = ما الدور الذي يمكن أن نلعبه في الحل؟
        </Text>
        <Text style={styles.sectionTextAr}>
          • "ما رأيك في عدم المساواة؟" = ¿Qué opinas sobre la desigualdad?{"\n"}
          • "كيف يمكننا مكافحة التمييز؟" = ¿Cómo podemos combatir la discriminación?{"\n"}
          • "ما المشاكل الاجتماعية التي تقلقك أكثر؟" = ¿Qué problemas sociales te preocupan más?{"\n"}
          • "ماذا يمكننا أن نفعل للمساعدة؟" = ¿Qué podemos hacer para ayudar?{"\n"}
          • "هل تعتقد أن المجتمع عادل؟" = ¿Crees que la sociedad es justa?{"\n"}
          • "ما هي الحقوق الأهم؟" = ¿Qué derechos son más importantes?{"\n"}
          • "كيف نروج للشمولية؟" = ¿Cómo promover la inclusión?{"\n"}
          • "ما الدور الذي يمكن أن نلعبه في الحل؟" = ¿Qué papel podemos tener en la solución?
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🇪🇸 Problemas sociales en España</Text>
        <Text style={styles.sectionText}>
          <Text style={styles.subtitle}>💰 Desigualdades económicas:</Text>{"\n"}
          • <Text style={styles.benefit}>Brecha salarial:</Text> Diferencias entre regiones{"\n"}
          • <Text style={styles.benefit}>Desempleo juvenil:</Text> Alto paro entre jóvenes{"\n"}
          • <Text style={styles.benefit}>Pobreza energética:</Text> Dificultad para pagar servicios{"\n"}
          • <Text style={styles.benefit}>Vivienda:</Text> Precios altos y acceso limitado
          {"\n\n"}
          <Text style={styles.subtitle}>🌍 Inmigración e integración:</Text>{"\n"}
          • <Text style={styles.benefit}>Diversidad cultural:</Text> Múltiples nacionalidades{"\n"}
          • <Text style={styles.benefit}>Integración:</Text> Programas de acogida{"\n"}
          • <Text style={styles.benefit}>Derechos laborales:</Text> Protección de trabajadores{"\n"}
          • <Text style={styles.benefit}>Educación intercultural:</Text> Escuelas inclusivas
          {"\n\n"}
          <Text style={styles.subtitle}>👥 Inclusión social:</Text>{"\n"}
          • <Text style={styles.benefit}>Igualdad de género:</Text> Políticas de paridad{"\n"}
          • <Text style={styles.benefit}>Derechos LGTBIQ+:</Text> Protección legal{"\n"}
          • <Text style={styles.benefit}>Accesibilidad:</Text> Para personas con discapacidad{"\n"}
          • <Text style={styles.benefit}>Envejecimiento:</Text> Cuidado de personas mayores
        </Text>
        <Text style={styles.sectionTextAr}>
          <Text style={styles.subtitle}>💰 عدم المساواة الاقتصادية:</Text>{"\n"}
          • <Text style={styles.benefit}>فجوة رواتب:</Text> اختلافات بين المناطق{"\n"}
          • <Text style={styles.benefit}>بطالة الشباب:</Text> بطالة عالية بين الشباب{"\n"}
          • <Text style={styles.benefit}>فقر طاقي:</Text> صعوبة في دفع الخدمات{"\n"}
          • <Text style={styles.benefit}>سكن:</Text> أسعار عالية ووصول محدود
          {"\n\n"}
          <Text style={styles.subtitle}>🌍 الهجرة والتكامل:</Text>{"\n"}
          • <Text style={styles.benefit}>تنوع ثقافي:</Text> جنسيات متعددة{"\n"}
          • <Text style={styles.benefit}>تكامل:</Text> برامج استقبال{"\n"}
          • <Text style={styles.benefit}>حقوق عمالية:</Text> حماية العمال{"\n"}
          • <Text style={styles.benefit}>تعليم متعدد الثقافات:</Text> مدارس شاملة
          {"\n\n"}
          <Text style={styles.subtitle}>👥 شمولية اجتماعية:</Text>{"\n"}
          • <Text style={styles.benefit}>مساواة جنسية:</Text> سياسات مساواة{"\n"}
          • <Text style={styles.benefit}>حقوق المثليين:</Text> حماية قانونية{"\n"}
          • <Text style={styles.benefit}>إمكانية الوصول:</Text> للأشخاص ذوي الإعاقة{"\n"}
          • <Text style={styles.benefit}>شيخوخة:</Text> رعاية كبار السن
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
