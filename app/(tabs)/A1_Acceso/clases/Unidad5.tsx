import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import EjerciciosInteractivos from '../../../components/EjerciciosInteractivos';
import AudioButton from '../../../components/AudioButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { completeUnit } from '../../../../utils/unitProgress';

export default function Unidad5() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState<{correct: number; total: number}>({ correct: 0, total: 0 });

  useEffect(() => {
    AsyncStorage.getItem('A1_Unidad5_Completed').then((val) => {
      if (val === 'true') setSaved(true);
    });
  }, []);
  
  const ejercicios = [
    {
      tipo: "opcion_multiple",
      pregunta: "¿Dónde está el supermercado? (أين يوجد السوبرماركت؟)",
      opciones: ["Está al lado del banco", "Son las tres de la tarde", "Hace buen tiempo", "Tengo dos hermanos"],
      respuestaCorrecta: 0,
      explicacion: "Para preguntar por la ubicación de un lugar usamos '¿Dónde está...?'",
      explicacionAr: "للسؤال عن موقع مكان نستخدم '¿Dónde está...؟'"
    },
    {
      tipo: "opcion_multiple",
      pregunta: "¿Cómo llego a la estación de tren? (كيف أصل إلى محطة القطار؟)",
      opciones: ["Siga recto y gire a la derecha", "Tengo hambre", "Me gusta el fútbol", "Vivo en un piso"],
      respuestaCorrecta: 0,
      explicacion: "Para pedir direcciones usamos '¿Cómo llego a...?'",
      explicacionAr: "لطلب الاتجاهات نستخدم '¿Cómo llego a...؟'"
    },
    {
      tipo: "vocabulario",
      titulo: "Relaciona los lugares con su traducción en árabe (اربط الأماكن بترجمتها إلى العربية)",
      pares: [
        {"izquierda": "Hospital", "derecha": "مستشفى"},
        {"izquierda": "Escuela", "derecha": "مدرسة"},
        {"izquierda": "Parque", "derecha": "حديقة"},
        {"izquierda": "Biblioteca", "derecha": "مكتبة"},
        {"izquierda": "Restaurante", "derecha": "مطعم"}
      ]
    },
    {
      tipo: "vocabulario",
      titulo: "Relaciona las direcciones con su traducción (اربط الاتجاهات بترجمتها)",
      pares: [
        {"izquierda": "A la derecha", "derecha": "على اليمين"},
        {"izquierda": "A la izquierda", "derecha": "على اليسار"},
        {"izquierda": "Recto", "derecha": "مستقيم"},
        {"izquierda": "Al lado de", "derecha": "بجانب"},
        {"izquierda": "Delante de", "derecha": "أمام"}
      ]
    },
    {
      tipo: "opcion_multiple",
      pregunta: "¿Cuál es lo contrario de 'cerca'? (ما هو عكس كلمة 'قريب'؟)",
      opciones: ["Lejos", "Recto", "Derecha", "Izquierda"],
      respuestaCorrecta: 0,
      explicacion: "Lo contrario de 'cerca' es 'lejos'. Cerca = قريب, Lejos = بعيد",
      explicacionAr: "عكس 'قريب' هو 'بعيد'. قريب = cerca، بعيد = lejos"
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
          <Ionicons name="location" size={50} color="#1976d2" />
          <View style={styles.titleWithAudio}>
            <Text style={styles.title}>Unidad 5: La Ciudad y Direcciones</Text>
            <AudioButton 
              text="Unidad 5: La Ciudad y Direcciones" 
              size="medium"
              showText={false}
              color="#1976d2"
            />
          </View>
          <Text style={styles.titleAr}>الوحدة 5: المدينة والاتجاهات</Text>
          <View style={styles.titleWithAudio}>
            <Text style={styles.subtitle}>Aprende a pedir y dar direcciones en la ciudad</Text>
            <AudioButton 
              text="Aprende a pedir y dar direcciones en la ciudad" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <Text style={styles.subtitleAr}>تعلم طلب وإعطاء الاتجاهات في المدينة</Text>
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
            {/* Preguntar direcciones */}
            <View style={styles.grammarItem}>
              <Text style={styles.grammarTitle}>1. Preguntar direcciones</Text>
              <Text style={styles.grammarTitleAr}>السؤال عن الاتجاهات</Text>
              
              <View style={styles.grammarExample}>
                <Text style={styles.grammarText}>¿Dónde está + lugar?</Text>
                <AudioButton 
                  text="¿Dónde está el banco?" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.grammarTextAr}>{"أين يوجد + المكان؟"}</Text>
              
              <View style={styles.grammarExample}>
                <Text style={styles.grammarText}>¿Cómo llego a + lugar?</Text>
                <AudioButton 
                  text="¿Cómo llego al hospital?" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.grammarTextAr}>{"كيف أصل إلى + المكان؟"}</Text>
            </View>

            {/* Dar direcciones */}
            <View style={styles.grammarItem}>
              <Text style={styles.grammarTitle}>2. Dar direcciones</Text>
              <Text style={styles.grammarTitleAr}>إعطاء الاتجاهات</Text>
              
              <View style={styles.grammarExample}>
                <Text style={styles.grammarText}>Siga recto</Text>
                <AudioButton 
                  text="Siga recto" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.grammarTextAr}>{"اتبع الطريق مستقيماً"}</Text>
              
              <View style={styles.grammarExample}>
                <Text style={styles.grammarText}>Gire a la derecha/izquierda</Text>
                <AudioButton 
                  text="Gire a la derecha" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.grammarTextAr}>{"انعطف يميناً/يساراً"}</Text>
            </View>

            {/* Ubicación */}
            <View style={styles.grammarItem}>
              <Text style={styles.grammarTitle}>3. Describir ubicación</Text>
              <Text style={styles.grammarTitleAr}>وصف الموقع</Text>
              
              <View style={styles.grammarExample}>
                <Text style={styles.grammarText}>Está al lado de + lugar</Text>
                <AudioButton 
                  text="Está al lado del banco" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.grammarTextAr}>{"يقع بجانب + المكان"}</Text>
              
              <View style={styles.grammarExample}>
                <Text style={styles.grammarText}>Está cerca/lejos</Text>
                <AudioButton 
                  text="Está muy cerca" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.grammarTextAr}>{"إنه قريب/بعيد"}</Text>
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
                <Text style={styles.vocabSpanish}>Calle</Text>
                <AudioButton 
                  text="Calle" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>شارع</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Plaza</Text>
                <AudioButton 
                  text="Plaza" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>ساحة</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Avenida</Text>
                <AudioButton 
                  text="Avenida" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>جادة</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Esquina</Text>
                <AudioButton 
                  text="Esquina" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>زاوية</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Semáforo</Text>
                <AudioButton 
                  text="Semáforo" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>إشارة مرور</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Cerca</Text>
                <AudioButton 
                  text="Cerca" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>قريب</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Lejos</Text>
                <AudioButton 
                  text="Lejos" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>بعيد</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Derecha</Text>
                <AudioButton 
                  text="Derecha" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>يمين</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Izquierda</Text>
                <AudioButton 
                  text="Izquierda" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>يسار</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Recto</Text>
                <AudioButton 
                  text="Recto" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>مستقيم</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Al lado</Text>
                <AudioButton 
                  text="Al lado" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>بجانب</Text>
            </View>
            <View style={styles.vocabItem}>
              <View style={styles.vocabAudioContainer}>
                <Text style={styles.vocabSpanish}>Delante</Text>
                <AudioButton 
                  text="Delante" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.vocabArabic}>أمام</Text>
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
              text="Disculpe, ¿dónde está la estación de autobuses? Siga recto por esta calle, gire a la derecha en el semáforo. ¿Está lejos? No, está a cinco minutos andando. Muchas gracias. De nada, que tenga un buen día." 
              size="medium"
              showText={false}
              color="#FF9800"
            />
          </View>
          
          <View style={styles.dialogContainer}>
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Turista:</Text>
                <Text style={styles.dialogText}>Disculpe, ¿dónde está la estación de autobuses?</Text>
                <AudioButton 
                  text="Disculpe, ¿dónde está la estación de autobuses?" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>{"عذراً، أين محطة الحافلات؟"}</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Local:</Text>
                <Text style={styles.dialogText}>Siga recto por esta calle, gire a la derecha en el semáforo.</Text>
                <AudioButton 
                  text="Siga recto por esta calle, gire a la derecha en el semáforo." 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>{"اتبع هذا الشارع مستقيماً، ثم انعطف يميناً عند الإشارة."}</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Turista:</Text>
                <Text style={styles.dialogText}>¿Está lejos?</Text>
                <AudioButton 
                  text="¿Está lejos?" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>{"هل هو بعيد؟"}</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Local:</Text>
                <Text style={styles.dialogText}>No, está a cinco minutos andando.</Text>
                <AudioButton 
                  text="No, está a cinco minutos andando." 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>{"لا، إنه على بعد خمس دقائق سيراً على الأقدام."}</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Turista:</Text>
                <Text style={styles.dialogText}>Muchas gracias.</Text>
                <AudioButton 
                  text="Muchas gracias." 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>{"شكراً جزيلاً."}</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Local:</Text>
                <Text style={styles.dialogText}>De nada, que tenga un buen día.</Text>
                <AudioButton 
                  text="De nada, que tenga un buen día." 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>{"عفواً، أتمنى لك يوماً سعيداً."}</Text>
            </View>
          </View>
        </View>

        {/* Frases Útiles sobre Direcciones */}
        <View style={styles.section}>
          <View style={styles.titleWithAudio}>
            <Text style={styles.sectionTitle}>Frases Útiles sobre Direcciones</Text>
            <AudioButton 
              text="Frases Útiles sobre Direcciones" 
              size="small"
              showText={false}
              color="#1976d2"
            />
          </View>
          <Text style={styles.sectionTitleAr}>عبارات مفيدة حول الاتجاهات</Text>
          
          <View style={styles.phrasesContainer}>
            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>¿Dónde está...?</Text>
                <AudioButton 
                  text="¿Dónde está?" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"أين يوجد...؟"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>¿Cómo llego a...?</Text>
                <AudioButton 
                  text="¿Cómo llego a?" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"كيف أصل إلى...؟"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>Está muy cerca</Text>
                <AudioButton 
                  text="Está muy cerca" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"إنه قريب جداً"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>Está bastante lejos</Text>
                <AudioButton 
                  text="Está bastante lejos" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"إنه بعيد نوعاً ما"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>Siga recto</Text>
                <AudioButton 
                  text="Siga recto" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"اتبع الطريق مستقيماً"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>Gire a la derecha</Text>
                <AudioButton 
                  text="Gire a la derecha" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"انعطف يميناً"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>Gire a la izquierda</Text>
                <AudioButton 
                  text="Gire a la izquierda" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"انعطف يساراً"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>En la esquina</Text>
                <AudioButton 
                  text="En la esquina" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"في الزاوية"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>Al lado del banco</Text>
                <AudioButton 
                  text="Al lado del banco" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"بجانب البنك"}</Text>
            </View>

            <View style={styles.phraseItem}>
              <View style={styles.phraseSpanish}>
                <Text style={styles.phraseText}>¿Está lejos de aquí?</Text>
                <AudioButton 
                  text="¿Está lejos de aquí?" 
                  size="small"
                  showText={false}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.phraseArabic}>{"هل هو بعيد من هنا؟"}</Text>
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
                await completeUnit('a1', 'unidad5');
                await AsyncStorage.setItem('A1_Unidad5_Completed', 'true');
                setSaved(true);
              } catch {}
            }}
            onProgressChange={(p) => setProgress(p)}
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
    minWidth: 80,
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
