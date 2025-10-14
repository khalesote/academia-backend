import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import EjerciciosInteractivos from '../../../components/EjerciciosInteractivos';
import AudioTextSection from '../../../components/AudioTextSection';
import AudioButton from '../../../components/AudioButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { completeUnit } from '../../../../utils/unitProgress';

export default function Unidad1() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState<{correct: number; total: number}>({ correct: 0, total: 0 });
  const [hasAnsweredAll, setHasAnsweredAll] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('A1_Unidad1_Completed').then((value) => {
      if (value === 'true') {
        setSaved(true);
      }
    });
    // Inicializar botón como deshabilitado
    setHasAnsweredAll(false);
  }, []);

  const ejercicios = [
    {
      tipo: "opcion_multiple",
      pregunta: "¿Cómo te llamas? (ما اسمك؟)",
      opciones: ["Me llamo María", "Tengo 25 años", "Soy de España", "Vivo en Madrid"],
      respuestaCorrecta: 0,
      explicacion: "La pregunta '¿Cómo te llamas?' se responde con 'Me llamo + nombre'",
      explicacionAr: "السؤال 'ما اسمك؟' يُجاب عليه بـ 'اسمي + الاسم'"
    },
    {
      tipo: "opcion_multiple",
      pregunta: "¿De dónde eres? (من أين أنت؟)",
      opciones: ["Soy estudiante", "Soy de Argelia", "Tengo dos hijos", "Me gusta la música"],
      respuestaCorrecta: 1,
      explicacion: "La pregunta '¿De dónde eres?' se responde con 'Soy de + país/ciudad'",
      explicacionAr: "السؤال 'من أين أنت؟' يُجاب عليه بـ 'أنا من + بلد/مدينة'"
    },
    {
      tipo: "vocabulario",
      titulo: "Relaciona cada saludo en árabe con su traducción al español (اربط كل تحية بالعربية مع ترجمتها إلى الإسبانية)",
      pares: [
        {"izquierda": "مرحبا", "derecha": "Hola"},
        {"izquierda": "صباح الخير", "derecha": "Buenos días"},
        {"izquierda": "مساء الخير", "derecha": "Buenas tardes"},
        {"izquierda": "تصبح على خير", "derecha": "Buenas noches"},
        {"izquierda": "وداعا", "derecha": "Adiós"}
      ]
    },
    {
      tipo: "vocabulario",
      titulo: "Relaciona los números en árabe con su escritura en español (اربط الأرقام بالعربية مع كتابتها بالإسبانية)",
      pares: [
        {"izquierda": "واحد", "derecha": "Uno"},
        {"izquierda": "اثنان", "derecha": "Dos"},
        {"izquierda": "ثلاثة", "derecha": "Tres"},
        {"izquierda": "أربعة", "derecha": "Cuatro"},
        {"izquierda": "خمسة", "derecha": "Cinco"}
      ]
    },

    // 5) Completar: compón la palabra "casa"
    {
      tipo: "completar",
      titulo: "Completa la palabra (أكمل الكلمة)",
      enunciado: "c _ s _",
      solucion: ["a", "a"]
    },

    // 6) Vocabulario: relaciona letra inicial con palabra
    {
      tipo: "vocabulario",
      titulo: "Relaciona la letra con la palabra que empieza con ella (اربط الحرف بالكلمة التي تبدأ به)",
      pares: [
        { izquierda: "A", derecha: "Avión" },
        { izquierda: "B", derecha: "Barco" },
        { izquierda: "C", derecha: "Casa" },
        { izquierda: "D", derecha: "Dado" }
      ]
    },

    // 7) Completar: compón la palabra "barco"
    {
      tipo: "completar",
      titulo: "Completa la palabra (أكمل الكلمة)",
      enunciado: "b _ r c _",
      solucion: ["a", "o"]
    },

    // 8) Opción múltiple: ortografía correcta
    {
      tipo: "opcion_multiple",
      pregunta: "¿Cuál es la ortografía correcta? (ما التهجئة الصحيحة؟)",
      opciones: ["elefante", "elefanti", "elifante", "elefant"],
      respuestaCorrecta: 0,
      explicacion: "La forma correcta es 'elefante'.",
      explicacionAr: "التهجئة الصحيحة هي 'elefante'."
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
          <Ionicons name="person" size={50} color="#1976d2" />
          <View style={styles.titleWithAudio}>
            <Text style={styles.title}>Unidad 1: Presentaciones y Saludos</Text>
            <AudioButton 
              text="Unidad 1: Presentaciones y Saludos" 
              size="small"
              showText={false}
              color="#1976d2"
            />
          </View>
          <Text style={styles.titleAr}>الوحدة 1: التعارف والتحيات</Text>
          <View style={styles.titleWithAudio}>
            <Text style={styles.subtitle}>Aprende a presentarte y saludar en español</Text>
            <AudioButton 
              text="Aprende a presentarte y saludar en español" 
              size="small"
              showText={false}
              color="#666"
            />
          </View>
          <Text style={styles.subtitleAr}>تعلم كيفية التعارف والتحية بالإسبانية</Text>
        </View>
      </View>

      {/* Contenido Principal */}
      <View style={styles.content}>
        {/* Frases útiles para presentarse */}
        <View style={styles.section}>
          <View style={styles.titleWithAudio}>
            <Text style={styles.sectionTitle}>Frases Útiles para Presentarse</Text>
            <AudioButton 
              text="Frases Útiles para Presentarse" 
              size="small"
              showText={false}
              color="#1976d2"
            />
          </View>
          <Text style={styles.sectionTitleAr}>عبارات مفيدة للتعارف</Text>
          
          <View style={styles.phrasesContainer}>
            <View style={styles.phraseItem}>
              <Text style={styles.phraseSpanish}>Encantado de conocerte</Text>
              <Text style={styles.phraseArabic}>سررت بلقائك</Text>
              <AudioButton 
                text="Encantado de conocerte" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
            </View>
            <View style={styles.phraseItem}>
              <Text style={styles.phraseSpanish}>¿Cómo está usted?</Text>
              <Text style={styles.phraseArabic}>كيف حالك؟ (رسمي)</Text>
              <AudioButton 
                text="¿Cómo está usted?" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
            </View>
            <View style={styles.phraseItem}>
              <Text style={styles.phraseSpanish}>¿Cómo estás?</Text>
              <Text style={styles.phraseArabic}>كيف حالك؟ (غير رسمي)</Text>
              <AudioButton 
                text="¿Cómo estás?" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
            </View>
            <View style={styles.phraseItem}>
              <Text style={styles.phraseSpanish}>Muy bien, gracias</Text>
              <Text style={styles.phraseArabic}>بخير، شكراً</Text>
              <AudioButton 
                text="Muy bien, gracias" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
            </View>
            <View style={styles.phraseItem}>
              <Text style={styles.phraseSpanish}>¿Y tú?</Text>
              <Text style={styles.phraseArabic}>{"وأنت؟"}</Text>
              <AudioButton 
                text="¿Y tú?" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
            </View>
            <View style={styles.phraseItem}>
              <Text style={styles.phraseSpanish}>Hasta luego</Text>
              <Text style={styles.phraseArabic}>{"إلى اللقاء"}</Text>
              <AudioButton 
                text="Hasta luego" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
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
              <Text style={styles.vocabSpanish}>Hola</Text>
              <Text style={styles.vocabArabic}>مرحبا</Text>
              <AudioButton 
                text="Hola" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
            </View>
            <View style={styles.vocabItem}>
              <Text style={styles.vocabSpanish}>Buenos días</Text>
              <Text style={styles.vocabArabic}>صباح الخير</Text>
              <AudioButton 
                text="Buenos días" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
            </View>
            <View style={styles.vocabItem}>
              <Text style={styles.vocabSpanish}>Buenas tardes</Text>
              <Text style={styles.vocabArabic}>مساء الخير</Text>
              <AudioButton 
                text="Buenas tardes" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
            </View>
            <View style={styles.vocabItem}>
              <Text style={styles.vocabSpanish}>Buenas noches</Text>
              <Text style={styles.vocabArabic}>تصبح على خير</Text>
              <AudioButton 
                text="Buenas noches" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
            </View>
            <View style={styles.vocabItem}>
              <Text style={styles.vocabSpanish}>¿Cómo te llamas?</Text>
              <Text style={styles.vocabArabic}>ما اسمك؟</Text>
              <AudioButton 
                text="¿Cómo te llamas?" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
            </View>
            <View style={styles.vocabItem}>
              <Text style={styles.vocabSpanish}>Me llamo...</Text>
              <Text style={styles.vocabArabic}>اسمي...</Text>
              <AudioButton 
                text="Me llamo" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
            </View>
            <View style={styles.vocabItem}>
              <Text style={styles.vocabSpanish}>¿De dónde eres?</Text>
              <Text style={styles.vocabArabic}>من أين أنت؟</Text>
              <AudioButton 
                text="¿De dónde eres?" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
            </View>
            <View style={styles.vocabItem}>
              <Text style={styles.vocabSpanish}>Soy de...</Text>
              <Text style={styles.vocabArabic}>أنا من...</Text>
              <AudioButton 
                text="Soy de" 
                size="small"
                showText={false}
                color="#4CAF50"
              />
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
          
          <View style={styles.contentWithAudio}>
            <AudioButton 
              text="¡Hola! ¿Cómo te llamas? Hola, me llamo Ahmed. ¿Y tú? Me llamo María. ¿De dónde eres? Soy de Argelia. ¿Y tú? Soy de España. ¡Encantada de conocerte!"
              size="medium"
              color="#FF9800"
            />
          </View>
          
                    <View style={styles.dialogContainer}>
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>María:</Text>
                <Text style={styles.dialogText}>¡Hola! ¿Cómo te llamas?</Text>
                <AudioButton 
                  text="¡Hola! ¿Cómo te llamas?" 
                  size="small"
                  showText={false}
                  color="#FF6B6B"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>ماريا: مرحبا! ما اسمك؟</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Ahmed:</Text>
                <Text style={styles.dialogText}>Hola, me llamo Ahmed. ¿Y tú?</Text>
                <AudioButton 
                  text="Hola, me llamo Ahmed. ¿Y tú?" 
                  size="small"
                  showText={false}
                  color="#4ECDC4"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>أحمد: مرحبا، اسمي أحمد. وأنت؟</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>María:</Text>
                <Text style={styles.dialogText}>Me llamo María. ¿De dónde eres?</Text>
                <AudioButton 
                  text="Me llamo María. ¿De dónde eres?" 
                  size="small"
                  showText={false}
                  color="#FF6B6B"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>ماريا: اسمي ماريا. من أين أنت؟</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>Ahmed:</Text>
                <Text style={styles.dialogText}>Soy de Argelia. ¿Y tú?</Text>
                <AudioButton 
                  text="Soy de Argelia. ¿Y tú?" 
                  size="small"
                  showText={false}
                  color="#4ECDC4"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>أحمد: أنا من الجزائر. وأنت؟</Text>
            </View>
            
            <View style={styles.dialogLineWithTranslation}>
              <View style={styles.dialogLine}>
                <Text style={styles.dialogPerson}>María:</Text>
                <Text style={styles.dialogText}>Soy de España. ¡Encantada de conocerte!</Text>
                <AudioButton 
                  text="Soy de España. ¡Encantada de conocerte!" 
                  size="small"
                  showText={false}
                  color="#FF6B6B"
                />
              </View>
              <Text style={styles.dialogTranslationLine}>ماريا: أنا من إسبانيا. سررت بلقائك!</Text>
            </View>
          </View>
        </View>

        {/* Ejemplos escritos */}
        <View style={styles.section}>
          <View style={styles.titleWithAudio}>
            <Text style={styles.sectionTitle}>Ejemplos escritos</Text>
            <AudioButton 
              text="Ejemplos escritos" 
              size="small"
              showText={false}
              color="#1976d2"
            />
          </View>
          <Text style={styles.sectionTitleAr}>أمثلة مكتوبة</Text>

          <View style={styles.phrasesContainer}>
            <View style={styles.phraseItem}>
              <Text style={styles.phraseSpanish}>Me llamo Ahmed</Text>
              <AudioButton text="Me llamo Ahmed" size="small" showText={false} color="#4CAF50" />
              <Text style={styles.phraseArabic}>اسمي أحمد</Text>
            </View>
            <View style={styles.phraseItem}>
              <Text style={styles.phraseSpanish}>Soy de Argelia</Text>
              <AudioButton text="Soy de Argelia" size="small" showText={false} color="#4CAF50" />
              <Text style={styles.phraseArabic}>أنا من الجزائر</Text>
            </View>
            <View style={styles.phraseItem}>
              <Text style={styles.phraseSpanish}>Vivo en España</Text>
              <AudioButton text="Vivo en España" size="small" showText={false} color="#4CAF50" />
              <Text style={styles.phraseArabic}>أعيش في إسبانيا</Text>
            </View>
            <View style={styles.phraseItem}>
              <Text style={styles.phraseSpanish}>Encantado de conocerte</Text>
              <AudioButton text="Encantado de conocerte" size="small" showText={false} color="#4CAF50" />
              <Text style={styles.phraseArabic}>سررت بلقائك</Text>
            </View>
          </View>
        </View>

        {/* Ejercicios Interactivos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ejercicios Interactivos</Text>
          <Text style={styles.sectionTitleAr}>تمارين تفاعلية</Text>
          {/* Barra de progreso */}
          {(
            () => {
              const pct = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
              const fillColor = pct < 34 ? '#e53935' : pct < 67 ? '#fb8c00' : '#2e7d32';
              return (
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: fillColor }]} />
                  </View>
                  <Text style={styles.progressLabel}>{pct}%</Text>
                </View>
              );
            }
          )()}
          <EjerciciosInteractivos 
            ejercicios={ejercicios}
            onComplete={async () => {
              try {
                console.log('🎯 onComplete disparado en Unidad1');
                // Progreso unificado: marcar unidad1 como completada y desbloquear unidad2
                await completeUnit('a1', 'unidad1');
                await AsyncStorage.setItem('A1_Unidad1_Completed', 'true');
                setSaved(true);
                // Forzar barra de progreso al 100% visualmente al completar
                setProgress((prev) => ({ correct: prev.total || prev.correct, total: prev.total || prev.correct }));
                Alert.alert('¡Unidad completada!', 'Unidad 2 desbloqueada automáticamente. Regresa al índice A1 para verla.', [
                  { text: 'Ver índice A1', onPress: () => router.replace('/A1_Acceso') }
                ]);
              } catch (e) {
                console.error('Error en onComplete:', e);
              }
            }}
            onProgressChange={(p) => {
              setProgress(p);
              console.log(`📊 Progress debug: correct=${p.correct}, total=${p.total}, ejercicios.length=${ejercicios.length}`);
              // Botón gris hasta que complete TODOS correctamente
              setHasAnsweredAll(false);
            }}
          />
          
          {/* Botón que se habilita solo cuando se responde el último ejercicio */}
          <TouchableOpacity
            style={{
              backgroundColor: (!hasAnsweredAll || saved) ? '#9e9e9e' : '#388e3c',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 10,
              alignSelf: 'center',
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: (!hasAnsweredAll || saved) ? 0.7 : 1,
            }}
            disabled={!hasAnsweredAll || saved}
            onPress={async () => {
              try {
                await completeUnit('a1', 'unidad1');
                await AsyncStorage.setItem('A1_Unidad1_Completed', 'true');
                setSaved(true);
                Alert.alert('¡Unidad completada!', 'Unidad 2 desbloqueada. Ve al índice A1.', [
                  { text: 'Ver índice A1', onPress: () => router.replace('/A1_Acceso') }
                ]);
              } catch (e) {
                Alert.alert('Error', 'No se pudo completar la unidad.');
              }
            }}
          >
            <Ionicons name="checkmark-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              {saved ? 'Unidad completada ✓' : 'Completar unidad'}
            </Text>
          </TouchableOpacity>
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
  contentWithAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  vocabAudioContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  dialogLineWithTranslation: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  dialogTranslationLine: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressContainer: {
    width: '100%',
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabel: {
    width: 40,
    textAlign: 'right',
    fontSize: 12,
    color: '#333',
  },
  phraseItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  phraseSpanish: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
    textAlign: 'center',
  },
  phraseArabic: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    writingDirection: 'rtl',
  },
});

