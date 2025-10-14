import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import EjerciciosInteractivos from '../../../components/EjerciciosInteractivos';
import AudioButton from '../../../components/AudioButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { completeUnit } from '../../../../utils/unitProgress';

const { width } = Dimensions.get('window');

export default function Unidad3() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState<{correct: number; total: number}>({ correct: 0, total: 0 });

  useEffect(() => {
    AsyncStorage.getItem('A1_Unidad3_Completed').then((val) => {
      if (val === 'true') setSaved(true);
    });
  }, []);

  const ejercicios = [
    {
      id: 1,
      tipo: "opcion_multiple",
      pregunta: "¿Qué habitación usamos para dormir?",
      opciones: ["Cocina", "Dormitorio", "Baño", "Salón"],
      respuestaCorrecta: 1,
      explicacion: "El dormitorio es donde dormimos",
      explicacionAr: "غرفة النوم هي المكان الذي ننام فيه"
    },
    {
      id: 2,
      tipo: "vocabulario",
      titulo: "Relaciona los muebles con su habitación",
      pares: [
        { izquierda: "Cama", derecha: "Dormitorio" },
        { izquierda: "Sofá", derecha: "Salón" },
        { izquierda: "Fregadero", derecha: "Cocina" },
        { izquierda: "Inodoro", derecha: "Baño" }
      ]
    },
    {
      id: 3,
      tipo: "opcion_multiple",
      pregunta: "¿Dónde guardamos la ropa? (أين نحفظ الملابس؟)",
      opciones: ["En el armario", "En la nevera", "En el horno", "En la mesa"],
      respuestaCorrecta: 0,
      explicacion: "La ropa se guarda en el armario",
      explicacionAr: "الملابس تُحفظ في الخزانة"
    },
    {
      id: 4,
      tipo: "vocabulario",
      titulo: "Relaciona los objetos con su función",
      pares: [
        { izquierda: "Llave", derecha: "Abrir puertas" },
        { izquierda: "Lámpara", derecha: "Iluminar" },
        { izquierda: "Silla", derecha: "Sentarse" },
        { izquierda: "Ventana", derecha: "Ventilar" }
      ]
    },
    {
      id: 5,
      tipo: "opcion_multiple",
      pregunta: "¿Qué hay en la cocina? (ماذا يوجد في المطبخ؟)",
      opciones: ["Cama y armario", "Sofá y televisión", "Horno y fregadero", "Inodoro y ducha"],
      respuestaCorrecta: 2,
      explicacion: "En la cocina hay horno y fregadero",
      explicacionAr: "في المطبخ يوجد فرن وحوض"
    },
    {
      id: 6,
      tipo: "opcion_multiple",
      pregunta: "¿Cuál de estos muebles NO está en un dormitorio? (أي من هذه الأثاث ليس في غرفة النوم؟)",
      opciones: ["Cama", "Armario", "Sofá", "Mesita de noche"],
      respuestaCorrecta: 2,
      explicacion: "El sofá normalmente está en el salón, no en el dormitorio",
      explicacionAr: "الأريكة عادة ما تكون في غرفة المعيشة، وليس في غرفة النوم"
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#45a049']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/A1_Acceso')}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Unidad 3: Mi Casa</Text>
        <Text style={styles.headerTitleAr}>الوحدة 3: بيتي</Text>
      </LinearGradient>

      {/* Frases útiles sobre la casa */}
      <View style={styles.section}>
        <View style={styles.titleWithAudio}>
          <Text style={styles.sectionTitle}>Frases Útiles sobre la Casa</Text>
          <AudioButton 
            text="Frases Útiles sobre la Casa" 
            size="small"
            showText={false}
            color="#1976d2"
          />
        </View>
        <Text style={styles.sectionTitleAr}>عبارات مفيدة عن البيت</Text>
        
        <View style={styles.phrasesContainer}>
          <View style={styles.phraseItem}>
            <Text style={styles.phraseSpanish}>Mi casa es grande</Text>
            <Text style={styles.phraseArabic}>{"بيتي كبير"}</Text>
            <AudioButton 
              text="Mi casa es grande" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.phraseItem}>
            <Text style={styles.phraseSpanish}>Mi casa es pequeña</Text>
            <Text style={styles.phraseArabic}>{"بيتي صغير"}</Text>
            <AudioButton 
              text="Mi casa es pequeña" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.phraseItem}>
            <Text style={styles.phraseSpanish}>¿Dónde está el baño?</Text>
            <Text style={styles.phraseArabic}>{"أين الحمام؟"}</Text>
            <AudioButton 
              text="¿Dónde está el baño?" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.phraseItem}>
            <Text style={styles.phraseSpanish}>La cocina está aquí</Text>
            <Text style={styles.phraseArabic}>{"المطبخ هنا"}</Text>
            <AudioButton 
              text="La cocina está aquí" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.phraseItem}>
            <Text style={styles.phraseSpanish}>Me gusta mi habitación</Text>
            <Text style={styles.phraseArabic}>{"أحب غرفتي"}</Text>
            <AudioButton 
              text="Me gusta mi habitación" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.phraseItem}>
            <Text style={styles.phraseSpanish}>Vivo en un apartamento</Text>
            <Text style={styles.phraseArabic}>{"أعيش في شقة"}</Text>
            <AudioButton 
              text="Vivo en un apartamento" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
        </View>
      </View>

      {/* Ejemplo de diálogo 2 */}
      <View style={styles.section}>
        <View style={styles.titleWithAudio}>
          <Text style={styles.sectionTitle}>Ejemplo de diálogo 2</Text>
          <AudioButton 
            text="¿Cómo es tu dormitorio? Mi dormitorio es pequeño pero luminoso. ¿Tienes escritorio? Sí, tengo un escritorio y una silla al lado de la ventana. ¿Dónde estudias? Estudio en mi dormitorio por la tarde."
            size="small"
            showText={false}
            color="#1976d2"
          />
        </View>
        <Text style={styles.sectionTitleAr}>مثال على حوار 2</Text>

        <View style={styles.contentWithAudio}>
          <AudioButton 
            text="¿Cómo es tu dormitorio? Mi dormitorio es pequeño pero luminoso. ¿Tienes escritorio? Sí, tengo un escritorio y una silla al lado de la ventana. ¿Dónde estudias? Estudio en mi dormitorio por la tarde."
            size="medium"
            color="#FF9800"
          />
        </View>

        <View style={styles.dialogueContainer}>
          <View style={styles.dialogLineWithTranslation}>
            <View style={styles.dialogLine}>
              <Text style={styles.dialogPerson}>María:</Text>
              <Text style={styles.dialogText}>¿Cómo es tu dormitorio?</Text>
              <AudioButton 
                text="¿Cómo es tu dormitorio?" 
                size="small"
                showText={false}
                color="#FF6B6B"
              />
            </View>
            <Text style={styles.dialogTranslationLine}>ماريا: كيف هي غرفة نومك؟</Text>
          </View>

          <View style={styles.dialogLineWithTranslation}>
            <View style={styles.dialogLine}>
              <Text style={styles.dialogPerson}>Ahmed:</Text>
              <Text style={styles.dialogText}>Mi dormitorio es pequeño pero luminoso.</Text>
              <AudioButton 
                text="Mi dormitorio es pequeño pero luminoso." 
                size="small"
                showText={false}
                color="#4ECDC4"
              />
            </View>
            <Text style={styles.dialogTranslationLine}>أحمد: غرفة نومي صغيرة لكنها مُضيئة.</Text>
          </View>

          <View style={styles.dialogLineWithTranslation}>
            <View style={styles.dialogLine}>
              <Text style={styles.dialogPerson}>María:</Text>
              <Text style={styles.dialogText}>¿Tienes escritorio?</Text>
              <AudioButton 
                text="¿Tienes escritorio?" 
                size="small"
                showText={false}
                color="#FF6B6B"
              />
            </View>
            <Text style={styles.dialogTranslationLine}>ماريا: هل لديك مكتب؟</Text>
          </View>

          <View style={styles.dialogLineWithTranslation}>
            <View style={styles.dialogLine}>
              <Text style={styles.dialogPerson}>Ahmed:</Text>
              <Text style={styles.dialogText}>Sí, tengo un escritorio y una silla al lado de la ventana.</Text>
              <AudioButton 
                text="Sí, tengo un escritorio y una silla al lado de la ventana." 
                size="small"
                showText={false}
                color="#4ECDC4"
              />
            </View>
            <Text style={styles.dialogTranslationLine}>أحمد: نعم، لدي مكتب وكرسي بجانب النافذة.</Text>
          </View>

          <View style={styles.dialogLineWithTranslation}>
            <View style={styles.dialogLine}>
              <Text style={styles.dialogPerson}>María:</Text>
              <Text style={styles.dialogText}>¿Dónde estudias?</Text>
              <AudioButton 
                text="¿Dónde estudias?" 
                size="small"
                showText={false}
                color="#FF6B6B"
              />
            </View>
            <Text style={styles.dialogTranslationLine}>ماريا: أين تدرس؟</Text>
          </View>

          <View style={styles.dialogLineWithTranslation}>
            <View style={styles.dialogLine}>
              <Text style={styles.dialogPerson}>Ahmed:</Text>
              <Text style={styles.dialogText}>Estudio en mi dormitorio por la tarde.</Text>
              <AudioButton 
                text="Estudio en mi dormitorio por la tarde." 
                size="small"
                showText={false}
                color="#4ECDC4"
              />
            </View>
            <Text style={styles.dialogTranslationLine}>أحمد: أدرس في غرفة نومي بعد الظهر.</Text>
          </View>
        </View>
      </View>

      {/* Vocabulario */}
      <View style={styles.section}>
        <View style={styles.titleWithAudio}>
          <Text style={styles.sectionTitle}>Vocabulario básico</Text>
          <AudioButton 
            text="Vocabulario básico" 
            size="small"
            showText={false}
            color="#1976d2"
          />
        </View>
        <Text style={styles.sectionTitleAr}>المفردات الأساسية</Text>
        <View style={styles.vocabularyGrid}>
          <View style={styles.vocabularyPair}>
            <Text style={styles.spanishWord}>Casa</Text>
            <Text style={styles.arabicWord}>بيت</Text>
            <AudioButton 
              text="Casa" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.vocabularyPair}>
            <Text style={styles.spanishWord}>Habitación</Text>
            <Text style={styles.arabicWord}>غرفة</Text>
            <AudioButton 
              text="Habitación" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.vocabularyPair}>
            <Text style={styles.spanishWord}>Dormitorio</Text>
            <Text style={styles.arabicWord}>غرفة النوم</Text>
            <AudioButton 
              text="Dormitorio" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.vocabularyPair}>
            <Text style={styles.spanishWord}>Cocina</Text>
            <Text style={styles.arabicWord}>مطبخ</Text>
            <AudioButton 
              text="Cocina" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.vocabularyPair}>
            <Text style={styles.spanishWord}>Salón</Text>
            <Text style={styles.arabicWord}>غرفة المعيشة</Text>
            <AudioButton 
              text="Salón" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.vocabularyPair}>
            <Text style={styles.spanishWord}>Baño</Text>
            <Text style={styles.arabicWord}>حمام</Text>
            <AudioButton 
              text="Baño" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.vocabularyPair}>
            <Text style={styles.spanishWord}>Cama</Text>
            <Text style={styles.arabicWord}>سرير</Text>
            <AudioButton 
              text="Cama" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.vocabularyPair}>
            <Text style={styles.spanishWord}>Mesa</Text>
            <Text style={styles.arabicWord}>طاولة</Text>
            <AudioButton 
              text="Mesa" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.vocabularyPair}>
            <Text style={styles.spanishWord}>Silla</Text>
            <Text style={styles.arabicWord}>كرسي</Text>
            <AudioButton 
              text="Silla" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.vocabularyPair}>
            <Text style={styles.spanishWord}>Armario</Text>
            <Text style={styles.arabicWord}>خزانة</Text>
            <AudioButton 
              text="Armario" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.vocabularyPair}>
            <Text style={styles.spanishWord}>Ventana</Text>
            <Text style={styles.arabicWord}>نافذة</Text>
            <AudioButton 
              text="Ventana" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
          <View style={styles.vocabularyPair}>
            <Text style={styles.spanishWord}>Puerta</Text>
            <Text style={styles.arabicWord}>باب</Text>
            <AudioButton 
              text="Puerta" 
              size="small"
              showText={false}
              color="#4CAF50"
            />
          </View>
        </View>
      </View>

      {/* Ejemplo de diálogo */}
      <View style={styles.section}>
        <View style={styles.titleWithAudio}>
          <Text style={styles.sectionTitle}>Ejemplo de diálogo</Text>
          <AudioButton 
            text="Ejemplo de diálogo" 
            size="small"
            showText={false}
            color="#1976d2"
          />
        </View>
        <Text style={styles.sectionTitleAr}>مثال على حوار</Text>
        
        <View style={styles.contentWithAudio}>
          <AudioButton 
            text="¿Dónde está tu casa? Mi casa está en el centro. Tiene tres habitaciones. ¿Y dónde duermes? Duermo en el dormitorio. Es muy cómodo."
            size="medium"
            color="#FF9800"
          />
        </View>
        
        <View style={styles.dialogueContainer}>
          <View style={styles.dialogLineWithTranslation}>
            <View style={styles.dialogLine}>
              <Text style={styles.dialogPerson}>María:</Text>
              <Text style={styles.dialogText}>¿Dónde está tu casa?</Text>
              <AudioButton 
                text="¿Dónde está tu casa?" 
                size="small"
                showText={false}
                color="#FF6B6B"
              />
            </View>
            <Text style={styles.dialogTranslationLine}>ماريا: أين بيتك؟</Text>
          </View>
          
          <View style={styles.dialogLineWithTranslation}>
            <View style={styles.dialogLine}>
              <Text style={styles.dialogPerson}>Ahmed:</Text>
              <Text style={styles.dialogText}>Mi casa está en el centro. Tiene tres habitaciones.</Text>
              <AudioButton 
                text="Mi casa está en el centro. Tiene tres habitaciones." 
                size="small"
                showText={false}
                color="#4ECDC4"
              />
            </View>
            <Text style={styles.dialogTranslationLine}>أحمد: بيتي في المركز. له ثلاث غرف.</Text>
          </View>
          
          <View style={styles.dialogLineWithTranslation}>
            <View style={styles.dialogLine}>
              <Text style={styles.dialogPerson}>María:</Text>
              <Text style={styles.dialogText}>¿Y dónde duermes?</Text>
              <AudioButton 
                text="¿Y dónde duermes?" 
                size="small"
                showText={false}
                color="#FF6B6B"
              />
            </View>
            <Text style={styles.dialogTranslationLine}>ماريا: وأين تنام؟</Text>
          </View>
          
          <View style={styles.dialogLineWithTranslation}>
            <View style={styles.dialogLine}>
              <Text style={styles.dialogPerson}>Ahmed:</Text>
              <Text style={styles.dialogText}>Duermo en el dormitorio. Es muy cómodo.</Text>
              <AudioButton 
                text="Duermo en el dormitorio. Es muy cómodo." 
                size="small"
                showText={false}
                color="#4ECDC4"
              />
            </View>
            <Text style={styles.dialogTranslationLine}>أحمد: أنام في غرفة النوم. إنها مريحة جداً.</Text>
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
            <Text style={styles.phraseSpanish}>Mi casa tiene salón, cocina y dos dormitorios</Text>
            <AudioButton text="Mi casa tiene salón, cocina y dos dormitorios" size="small" showText={false} color="#4CAF50" />
            <Text style={styles.phraseArabic}>بيتي فيه صالة ومطبخ وغرفتا نوم</Text>
          </View>
          <View style={styles.phraseItem}>
            <Text style={styles.phraseSpanish}>La cocina está a la derecha</Text>
            <AudioButton text="La cocina está a la derecha" size="small" showText={false} color="#4CAF50" />
            <Text style={styles.phraseArabic}>المطبخ على اليمين</Text>
          </View>
          <View style={styles.phraseItem}>
            <Text style={styles.phraseSpanish}>Duermo en el dormitorio</Text>
            <AudioButton text="Duermo en el dormitorio" size="small" showText={false} color="#4CAF50" />
            <Text style={styles.phraseArabic}>أنام في غرفة النوم</Text>
          </View>
        </View>
      </View>

      {/* Ejercicios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ejercicios</Text>
        <Text style={styles.sectionTitleAr}>التمارين</Text>
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
              await completeUnit('a1', 'unidad3');
              await AsyncStorage.setItem('A1_Unidad3_Completed', 'true');
              setSaved(true);
            } catch {}
          }}
          onProgressChange={(p) => setProgress(p)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerTitleAr: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionTitleAr: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'right',
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 10,
  },
  contentAr: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'right',
  },
  vocabularyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vocabularyPair: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  spanishWord: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  arabicWord: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  dialogueContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  dialogueText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  dialogueTextAr: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    textAlign: 'right',
  },
  speaker: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  titleWithAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  phrasesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
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
  contentWithAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dialogLineWithTranslation: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
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
  // Progress bar styles
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
})
;
