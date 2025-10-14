import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import EjerciciosInteractivos from '../../../components/EjerciciosInteractivos';
import AudioButton from '../../../components/AudioButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Unidad7() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('A1_Unidad7_Completed').then((val) => {
      if (val === 'true') setSaved(true);
    });
  }, []);
  
  const ejercicios = [
    {
      tipo: "opcion_multiple",
      pregunta: "¿Cómo se dice 'clima' en árabe?",
      opciones: ["طقس", "مطر", "شمس", "ريح"],
      respuestaCorrecta: 0,
      explicacion: "'Clima' significa 'طقس' en árabe",
      explicacionAr: "'Clima' تعني 'طقس' بالعربية"
    },
    {
      tipo: "opcion_multiple",
      pregunta: "¿Qué estación viene después del verano? (أي فصل يأتي بعد الصيف؟)",
      opciones: ["Primavera", "Invierno", "Otoño", "Verano"],
      respuestaCorrecta: 2,
      explicacion: "El otoño viene después del verano",
      explicacionAr: "الخريف يأتي بعد الصيف"
    },
    {
      tipo: "vocabulario",
      titulo: "Relaciona las estaciones del año con su traducción en árabe",
      pares: [
        {"izquierda": "Primavera", "derecha": "ربيع"},
        {"izquierda": "Verano", "derecha": "صيف"},
        {"izquierda": "Otoño", "derecha": "خريف"},
        {"izquierda": "Invierno", "derecha": "شتاء"}
      ]
    },
    {
      tipo: "vocabulario",
      titulo: "Relaciona el clima con su descripción",
      pares: [
        {"izquierda": "Hace sol", "derecha": "مشمس"},
        {"izquierda": "Hace frío", "derecha": "بارد"},
        {"izquierda": "Hace calor", "derecha": "حار"},
        {"izquierda": "Llueve", "derecha": "ممطر"}
      ]
    },
    {
      tipo: "opcion_multiple",
      pregunta: "¿Qué tiempo hace cuando llueve? (ما الطقس عندما تمطر؟)",
      opciones: ["Hace sol", "Hace frío", "Llueve", "Hace calor"],
      respuestaCorrecta: 2,
      explicacion: "Cuando llueve, el tiempo es lluvioso",
      explicacionAr: "عندما تمطر، الطقس ممطر"
    },
    {
      tipo: "opcion_multiple",
      pregunta: "¿Cuál es la estación más calurosa del año? (ما هو أحر فصل في السنة؟)",
      opciones: ["Primavera", "Verano", "Otoño", "Invierno"],
      respuestaCorrecta: 1,
      explicacion: "El verano es la estación más calurosa del año",
      explicacionAr: "الصيف هو أحر فصل في السنة"
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/A1_Acceso')}
        >
          <Ionicons name="arrow-back" size={28} color="#1976d2" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="partly-sunny" size={50} color="#1976d2" />
          <View style={styles.titleWithAudio}>
            <Text style={styles.title}>Unidad 7: El Clima y las Estaciones</Text>
            <AudioButton 
              text="Unidad 7: El Clima y las Estaciones" 
              size="medium"
              showText={false}
              color="#1976d2"
            />
          </View>
          <Text style={styles.titleAr}>الوحدة 7: الطقس والفصول</Text>
          <View style={styles.titleWithAudio}>
            <Text style={styles.subtitle}>Aprende a hablar sobre el clima y las estaciones del año</Text>
            <AudioButton 
              text="Aprende a hablar sobre el clima y las estaciones del año" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <Text style={styles.subtitleAr}>تعلم التحدث عن الطقس وفصول السنة</Text>
        </View>
      </View>

      {/* Contenido Principal */}
      <View style={styles.content}>
        {/* Gramática Básica */}
        <View style={styles.section}>
          <View style={styles.titleWithAudio}>
            <Text style={styles.sectionTitle}>Gramática Básica</Text>
            <AudioButton 
              text="Gramática Básica" 
              size="small"
              showText={false}
              color="#1976d2"
            />
          </View>
          <Text style={styles.sectionTitleAr}>قواعد أساسية</Text>
          
          <View style={styles.grammarContainer}>
            {/* Describir el clima */}
            <View style={styles.grammarItem}>
              <Text style={styles.grammarTitle}>1. Describir el clima</Text>
              <Text style={styles.grammarTitleAr}>وصف الطقس</Text>
              
              <View style={styles.grammarExample}>
                <Text style={styles.grammarText}>Hace + clima</Text>
                <AudioButton 
                  text="Hace sol" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.grammarTextAr}>{"يكون + الطقس"}</Text>
              
              <View style={styles.grammarExample}>
                <Text style={styles.grammarText}>Está + descripción</Text>
                <AudioButton 
                  text="Está nublado" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.grammarTextAr}>{"يكون + الوصف"}</Text>
            </View>

            {/* Hablar de estaciones */}
            <View style={styles.grammarItem}>
              <Text style={styles.grammarTitle}>2. Hablar de estaciones</Text>
              <Text style={styles.grammarTitleAr}>التحدث عن الفصول</Text>
              
              <View style={styles.grammarExample}>
                <Text style={styles.grammarText}>En + estación</Text>
                <AudioButton 
                  text="En verano hace calor" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.grammarTextAr}>{"في + الفصل"}</Text>
              
              <View style={styles.grammarExample}>
                <Text style={styles.grammarText}>Me gusta + estación</Text>
                <AudioButton 
                  text="Me gusta la primavera" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.grammarTextAr}>{"أحب + الفصل"}</Text>
            </View>

            {/* Futuro simple */}
            <View style={styles.grammarItem}>
              <Text style={styles.grammarTitle}>3. Hablar del futuro</Text>
              <Text style={styles.grammarTitleAr}>التحدث عن المستقبل</Text>
              
              <View style={styles.grammarExample}>
                <Text style={styles.grammarText}>Va a + verbo</Text>
                <AudioButton 
                  text="Va a llover" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.grammarTextAr}>{"سوف + الفعل"}</Text>
              
              <View style={styles.grammarExample}>
                <Text style={styles.grammarText}>Mañana + futuro</Text>
                <AudioButton 
                  text="Mañana hará frío" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.grammarTextAr}>{"غداً + المستقبل"}</Text>
            </View>
          </View>
        </View>

        {/* Vocabulario Clave */}
        <View style={styles.section}>
          <View style={styles.titleWithAudio}>
            <Text style={styles.sectionTitle}>Vocabulario Clave</Text>
            <AudioButton 
              text="Vocabulario Clave" 
              size="small"
              showText={false}
              color="#1976d2"
            />
          </View>
          <Text style={styles.sectionTitleAr}>المفردات الأساسية</Text>
          
          <View style={styles.vocabularyGrid}>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Clima</Text>
                <AudioButton 
                  text="Clima" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>طقس</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Temperatura</Text>
                <AudioButton 
                  text="Temperatura" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>درجة حرارة</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Primavera</Text>
                <AudioButton 
                  text="Primavera" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>ربيع</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Verano</Text>
                <AudioButton 
                  text="Verano" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>صيف</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Otoño</Text>
                <AudioButton 
                  text="Otoño" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>خريف</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Invierno</Text>
                <AudioButton 
                  text="Invierno" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>شتاء</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Sol</Text>
                <AudioButton 
                  text="Sol" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>شمس</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Lluvia</Text>
                <AudioButton 
                  text="Lluvia" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>مطر</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Nieve</Text>
                <AudioButton 
                  text="Nieve" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>ثلج</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Viento</Text>
                <AudioButton 
                  text="Viento" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>ريح</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Nube</Text>
                <AudioButton 
                  text="Nube" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>سحابة</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Tormenta</Text>
                <AudioButton 
                  text="Tormenta" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>عاصفة</Text>
            </View>
          </View>
        </View>

        {/* Ejemplo de Diálogo */}
        <View style={styles.section}>
          <View style={styles.titleWithAudio}>
            <Text style={styles.sectionTitle}>Ejemplo de Diálogo</Text>
            <AudioButton 
              text="Ejemplo de Diálogo" 
              size="small"
              showText={false}
              color="#1976d2"
            />
          </View>
          <Text style={styles.sectionTitleAr}>مثال على حوار</Text>
          
          {/* Audio para todo el diálogo */}
          <View style={styles.contentWithAudio}>
            <Text style={styles.dialogTitle}>Conversación completa:</Text>
            <AudioButton 
              text="¿Qué tiempo hace hoy? Hace sol y está muy caluroso. ¿Y mañana? ¿Va a llover? Sí, mañana va a llover y hará frío. ¿Cuál es tu estación favorita? Me gusta la primavera porque hace buen tiempo." 
              size="medium"
              showText={false}
              color="#FF9800"
            />
          </View>
          
          <View style={styles.dialogContainer}>
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Carlos:</Text>
                <Text style={styles.dialogText}>¿Qué tiempo hace hoy?</Text>
                <AudioButton 
                  text="¿Qué tiempo hace hoy?" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>{"ما الطقس اليوم؟"}</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Fatima:</Text>
                <Text style={styles.dialogText}>Hace sol y está muy caluroso.</Text>
                <AudioButton 
                  text="Hace sol y está muy caluroso." 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>{"الجو مشمس وحار جداً."}</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Carlos:</Text>
                <Text style={styles.dialogText}>¿Y mañana? ¿Va a llover?</Text>
                <AudioButton 
                  text="¿Y mañana? ¿Va a llover?" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>{"وماذا عن الغد؟ هل ستمطر؟"}</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Fatima:</Text>
                <Text style={styles.dialogText}>Sí, mañana va a llover y hará frío.</Text>
                <AudioButton 
                  text="Sí, mañana va a llover y hará frío." 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>{"نعم، غداً ستمطر وسيكون الجو بارداً."}</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Carlos:</Text>
                <Text style={styles.dialogText}>¿Cuál es tu estación favorita?</Text>
                <AudioButton 
                  text="¿Cuál es tu estación favorita?" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>{"ما هو فصلك المفضل؟"}</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Fatima:</Text>
                <Text style={styles.dialogText}>Me gusta la primavera porque hace buen tiempo.</Text>
                <AudioButton 
                  text="Me gusta la primavera porque hace buen tiempo." 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>{"أحب الربيع لأن الطقس جميل."}</Text>
            </View>
          </View>
        </View>

        {/* Frases Útiles sobre el Clima y las Estaciones */}
        <View style={styles.section}>
          <View style={styles.titleWithAudio}>
            <Text style={styles.sectionTitle}>Frases Útiles sobre el Clima y las Estaciones</Text>
            <AudioButton 
              text="Frases Útiles sobre el Clima y las Estaciones" 
              size="small"
              showText={false}
              color="#1976d2"
            />
          </View>
          <Text style={styles.sectionTitleAr}>عبارات مفيدة حول الطقس والفصول</Text>
          
          <View style={styles.phrasesContainer}>
            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>¿Qué tiempo hace?</Text>
                <AudioButton 
                  text="¿Qué tiempo hace?" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"ما الطقس؟"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>Hace sol</Text>
                <AudioButton 
                  text="Hace sol" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"الجو مشمس"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>Hace frío</Text>
                <AudioButton 
                  text="Hace frío" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"الجو بارد"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>Hace calor</Text>
                <AudioButton 
                  text="Hace calor" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"الجو حار"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>Está lloviendo</Text>
                <AudioButton 
                  text="Está lloviendo" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"إنها تمطر"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>Está nublado</Text>
                <AudioButton 
                  text="Está nublado" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"الجو غائم"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>En verano hace calor</Text>
                <AudioButton 
                  text="En verano hace calor" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"في الصيف الجو حار"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>En invierno hace frío</Text>
                <AudioButton 
                  text="En invierno hace frío" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"في الشتاء الجو بارد"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>¿Cuál es tu estación favorita?</Text>
                <AudioButton 
                  text="¿Cuál es tu estación favorita?" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"ما هو فصلك المفضل؟"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>Mañana va a llover</Text>
                <AudioButton 
                  text="Mañana va a llover" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"غداً ستمطر"}</Text>
            </View>
          </View>
        </View>

        {/* Ejemplos escritos */}
        <View style={styles.section}>
          <View style={styles.titleWithAudio}>
            <Text style={styles.sectionTitle}>Ejemplos escritos</Text>
            <AudioButton text="Ejemplos escritos" size="small" showText={false} color="#1976d2" />
          </View>
          <Text style={styles.sectionTitleAr}>أمثلة مكتوبة</Text>

          <View style={styles.phrasesContainer}>
            <View style={styles.phraseItem}>
              <Text style={styles.phraseSpanish}>Hoy hace sol / Hoy llueve</Text>
              <AudioButton text="Hoy hace sol" size="small" showText={false} color="#4CAF50" />
              <Text style={styles.phraseArabic}>اليوم مشمس / اليوم تمطر</Text>
            </View>
            <View style={styles.phraseItem}>
              <Text style={styles.phraseSpanish}>Mi estación favorita es la primavera</Text>
              <AudioButton text="Mi estación favorita es la primavera" size="small" showText={false} color="#4CAF50" />
              <Text style={styles.phraseArabic}>فصلي المفضل هو الربيع</Text>
            </View>
            <View style={styles.phraseItem}>
              <Text style={styles.phraseSpanish}>En invierno hace frío</Text>
              <AudioButton text="En invierno hace frío" size="small" showText={false} color="#4CAF50" />
              <Text style={styles.phraseArabic}>في الشتاء الطقس بارد</Text>
            </View>
          </View>
        </View>

        {/* Ejercicios Interactivos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ejercicios Interactivos</Text>
          <Text style={styles.sectionTitleAr}>تمارين تفاعلية</Text>
          <EjerciciosInteractivos 
            ejercicios={ejercicios}
            onComplete={async () => {
              try {
                await AsyncStorage.setItem('A1_Unidad7_Completed', 'true');
                setSaved(true);
              } catch {}
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  titleAr: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    writingDirection: 'rtl',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitleAr: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  sectionTitleAr: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  sectionTextAr: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  vocabularyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  vocabItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    minWidth: '48%',
    alignItems: 'center',
  },
  vocabSpanish: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  vocabArabic: {
    fontSize: 14,
    color: '#666',
    writingDirection: 'rtl',
  },
  dialogContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  dialogLine: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  dialogPerson: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginRight: 8,
    minWidth: 60,
  },
  dialogText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  titleWithAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  grammarContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  grammarItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  grammarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  grammarTitleAr: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 12,
  },
  grammarExample: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  grammarText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  grammarTextAr: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 8,
  },
  vocabAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  contentWithAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    flex: 1,
  },
  dialogLineWithTranslation: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dialogTranslationLine: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: 8,
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 4,
  },
  finishButton: {
    backgroundColor: '#388e3c',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  phrasesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  phraseItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  phraseSpanish: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  phraseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  phraseArabic: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'right',
    writingDirection: 'rtl',
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 4,
  },
});
