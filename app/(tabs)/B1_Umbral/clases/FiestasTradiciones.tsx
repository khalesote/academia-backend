import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import EjerciciosInteractivos from '../../../components/EjerciciosInteractivos';
import { getEjerciciosPorUnidad } from '../../../../utils/ejerciciosB1B2';

export default function FiestasTradiciones() {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<any>({});
  const [feedback, setFeedback] = useState<any>({});

  // Obtener ejercicios predefinidos
  const ejerciciosInteractivos = getEjerciciosPorUnidad('FiestasTradiciones');

  // Ejercicios originales para mantener compatibilidad
  const ejercicios = [
    // Ejercicio 1: Vocabulario - Fiestas españolas
    {
      tipo: 'opcion_multiple',
      titulo: 'Vocabulario: Fiestas Españolas',
      instruccion: 'Relaciona cada fiesta con su descripción:',
      pregunta: '¿Qué fiesta se celebra lanzando tomates?',
      opciones: [
        'San Fermín',
        'La Tomatina',
        'Las Fallas',
        'La Feria de Abril'
      ],
      respuesta_correcta: 'La Tomatina',
      explicacion: 'La Tomatina es una fiesta que se celebra en Buñol (Valencia) donde los participantes se lanzan tomates.'
    },
    
    // Ejercicio 2: Gramática - Pretérito perfecto
    {
      tipo: 'rellenar_huecos',
      titulo: 'Gramática: Pretérito Perfecto',
      instruccion: 'Completa las oraciones con la forma correcta del verbo en pretérito perfecto:',
      texto: "Este año ya _1_ (yo/ir) a la Feria de Abril y _2_ (yo/bailar) sevillanas. También _3_ (yo/comer) muchas tapas típicas.",
      solucion: ["he ido", "he bailado", "he comido"]
    },
    
    // Ejercicio 3: Comprensión lectora
    {
      tipo: 'verdadero_falso',
      titulo: 'Comprensión Lectora: San Fermín',
      instruccion: 'Lee el texto y responde si es verdadero o falso:',
      texto: 'Los Sanfermines son unas fiestas en honor a San Fermín que se celebran en Pamplona del 6 al 14 de julio. El evento más conocido es el encierro, donde los participantes corren delante de los toros por las calles de la ciudad.',
      preguntas: [
        {
          pregunta: 'Los Sanfermines duran una semana.',
          respuesta: true,
          explicacion: 'Verdadero. Los Sanfermines duran del 6 al 14 de julio, que son 9 días.'
        },
        {
          pregunta: 'El encierro es un desfile de gigantes y cabezudos.',
          respuesta: false,
          explicacion: 'Falso. El encierro es cuando la gente corre delante de los toros.'
        }
      ]
    },
    
    // Ejercicio 4: Expresión escrita
    {
      tipo: 'redaccion',
      titulo: 'Expresión Escrita',
      instruccion: 'Describe una fiesta tradicional de tu país (mínimo 5 frases). Incluye cuándo se celebra, qué hace la gente y por qué es importante.',
      longitud_minima: 5
    }
  ];

  const handleInput = (idx: number, value: string | string[]) => {
    setRespuestas((prev: any) => ({ ...prev, [idx]: value }));
  };

  const verificarRespuesta = (idx: number) => {
    const ejercicio = ejercicios[idx];
    if (!ejercicio) return;

    if (ejercicio.tipo === 'opcion_multiple') {
      const esCorrecto = respuestas[idx] === ejercicio.respuesta_correcta;
      setFeedback((prev: any) => ({
        ...prev,
        [idx]: {
          correcto: esCorrecto,
          mensaje: esCorrecto 
            ? '¡Correcto! ' + ejercicio.explicacion 
            : 'Incorrecto. La respuesta correcta es: ' + ejercicio.respuesta_correcta
        }
      }));
    } else if (ejercicio.tipo === 'verdadero_falso' && ejercicio.preguntas) {
      const respuestasUsuario = respuestas[idx] || [];
      const resultados = ejercicio.preguntas.map((p: any, i: number) => ({
        correcto: respuestasUsuario[i] === p.respuesta,
        mensaje: p.explicacion
      }));
      setFeedback((prev: any) => ({
        ...prev,
        [idx]: resultados
      }));
    } else if (ejercicio.tipo === 'rellenar_huecos' && ejercicio.solucion) {
      const respuestasUsuario = Array.isArray(respuestas[idx]) 
        ? respuestas[idx] 
        : [respuestas[idx]];
      
      const esCorrecto = ejercicio.solucion.every(
        (sol: string, i: number) => 
          respuestasUsuario[i]?.toLowerCase() === sol.toLowerCase()
      );
      
      setFeedback((prev: any) => ({
        ...prev,
        [idx]: {
          correcto: esCorrecto,
          mensaje: esCorrecto 
            ? '¡Perfecto! Has completado correctamente el ejercicio.'
            : 'Algunas respuestas no son correctas. Revisa los huecos en rojo.'
        }
      }));
    }
  };

  const renderEjercicio = (ejercicio: any, idx: number) => {
    switch (ejercicio.tipo) {
      case 'opcion_multiple':
        return (
          <View key={idx} style={styles.ejercicioContainer}>
            <Text style={styles.tituloEjercicio}>{ejercicio.titulo}</Text>
            <Text style={styles.instruccion}>{ejercicio.instruccion}</Text>
            <Text style={styles.pregunta}>{ejercicio.pregunta}</Text>
            {ejercicio.opciones.map((opcion: string, i: number) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.opcion,
                  respuestas[idx] === opcion && styles.opcionSeleccionada
                ]}
                onPress={() => {
                  handleInput(idx, opcion);
                  verificarRespuesta(idx);
                }}
              >
                <Text style={styles.textoOpcion}>{opcion}</Text>
              </TouchableOpacity>
            ))}
            {feedback[idx] && (
              <Text style={[
                styles.feedback, 
                feedback[idx].correcto ? styles.feedbackCorrecto : styles.feedbackIncorrecto
              ]}>
                {feedback[idx].mensaje}
              </Text>
            )}
          </View>
        );

      case 'verdadero_falso':
        return (
          <View key={idx} style={styles.ejercicioContainer}>
            <Text style={styles.tituloEjercicio}>{ejercicio.titulo}</Text>
            <Text style={styles.instruccion}>{ejercicio.instruccion}</Text>
            <Text style={styles.texto}>{ejercicio.texto}</Text>
            
            {ejercicio.preguntas.map((p: any, i: number) => {
              const respuestaUsuario = respuestas[idx]?.[i];
              const resultado = Array.isArray(feedback[idx]) ? feedback[idx][i] : null;
              
              return (
                <View key={i} style={styles.preguntaContainer}>
                  <Text style={styles.pregunta}>{p.pregunta}</Text>
                  <View style={styles.botonesVF}>
                    <TouchableOpacity
                      style={[
                        styles.botonVF, 
                        respuestaUsuario === true && styles.botonVFSeleccionado,
                        resultado?.correcto === false && respuestaUsuario === true && styles.botonVFIncorrecto
                      ]}
                      onPress={() => {
                        const nuevasRespuestas = [...(respuestas[idx] || [])];
                        nuevasRespuestas[i] = true;
                        handleInput(idx, nuevasRespuestas);
                      }}
                    >
                      <Text style={styles.textoBotonVF}>Verdadero</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.botonVF, 
                        respuestaUsuario === false && styles.botonVFSeleccionado,
                        resultado?.correcto === false && respuestaUsuario === false && styles.botonVFIncorrecto
                      ]}
                      onPress={() => {
                        const nuevasRespuestas = [...(respuestas[idx] || [])];
                        nuevasRespuestas[i] = false;
                        handleInput(idx, nuevasRespuestas);
                      }}
                    >
                      <Text style={styles.textoBotonVF}>Falso</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {resultado && (
                    <Text style={[
                      styles.feedback,
                      resultado.correcto ? styles.feedbackCorrecto : styles.feedbackIncorrecto
                    ]}>
                      {resultado.mensaje}
                    </Text>
                  )}
                </View>
              );
            })}
            
            <TouchableOpacity
              style={styles.botonVerificar}
              onPress={() => verificarRespuesta(idx)}
            >
              <Text style={styles.textoBotonVerificar}>Verificar respuestas</Text>
            </TouchableOpacity>
          </View>
        );

      case 'rellenar_huecos':
        const partes = ejercicio.texto.split(/(_\d+_)/g);
        
        return (
          <View key={idx} style={styles.ejercicioContainer}>
            <Text style={styles.tituloEjercicio}>{ejercicio.titulo}</Text>
            <Text style={styles.instruccion}>{ejercicio.instruccion}</Text>
            
            <View style={styles.textoConHuecos}>
              {partes.map((parte: string, i: number) => {
                const match = parte.match(/_\d+_/);
                if (match) {
                  const num = parseInt(parte.replace(/_/g, ''), 10) - 1;
                  const respuestaUsuario = respuestas[idx]?.[num] || '';
                  const esCorrecto = respuestaUsuario.toLowerCase() === ejercicio.solucion[num].toLowerCase();
                  const mostrarFeedback = feedback[idx] !== undefined;
                  
                  return (
                    <TextInput
                      key={i}
                      style={[
                        styles.inputHueco,
                        mostrarFeedback && !esCorrecto && styles.inputHuecoIncorrecto,
                        mostrarFeedback && esCorrecto && styles.inputHuecoCorrecto
                      ]}
                      value={respuestaUsuario}
                      onChangeText={(text) => {
                        const nuevasRespuestas = [...(respuestas[idx] || [])];
                        nuevasRespuestas[num] = text;
                        handleInput(idx, nuevasRespuestas);
                      }}
                      placeholder={`(${num + 1})`}
                      placeholderTextColor="#999"
                    />
                  );
                }
                return <Text key={i} style={styles.texto}>{parte}</Text>;
              })}
            </View>
            
            <TouchableOpacity
              style={styles.botonVerificar}
              onPress={() => verificarRespuesta(idx)}
            >
              <Text style={styles.textoBotonVerificar}>Verificar respuestas</Text>
            </TouchableOpacity>
            
            {feedback[idx] && (
              <Text style={[
                styles.feedback,
                feedback[idx].correcto ? styles.feedbackCorrecto : styles.feedbackIncorrecto
              ]}>
                {feedback[idx].mensaje}
              </Text>
            )}
          </View>
        );

      case 'redaccion':
        return (
          <View key={idx} style={styles.ejercicioContainer}>
            <Text style={styles.tituloEjercicio}>{ejercicio.titulo}</Text>
            <Text style={styles.instruccion}>{ejercicio.instruccion}</Text>
            
            <TextInput
              style={styles.inputRedaccion}
              multiline
              numberOfLines={8}
              placeholder="Escribe tu respuesta aquí..."
              value={respuestas[idx] || ''}
              onChangeText={(text) => handleInput(idx, text)}
            />
            
            <TouchableOpacity
              style={styles.botonEnviar}
              onPress={() => {
                const palabras = (respuestas[idx] || '').split(/\s+/).filter(Boolean).length;
                if (palabras < ejercicio.longitud_minima) {
                  alert(`Por favor, escribe al menos ${ejercicio.longitud_minima} frases.`);
                  return;
                }
                alert('¡Respuesta enviada! El profesor la revisará pronto.');
              }}
            >
              <Text style={styles.textoBotonEnviar}>Enviar redacción</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.titulo}>Fiestas y Tradiciones Españolas</Text>
        <Text style={styles.subtitulo}>Nivel B1 - Cultura y Sociedad</Text>
      </View>
      
      <View style={styles.contenido}>
        <Text style={styles.descripcion}>
          En esta unidad aprenderás sobre las principales fiestas y tradiciones de España, 
          practicarás el pretérito perfecto y mejorarás tu vocabulario relacionado con celebraciones.
        </Text>
        
        {ejercicios.map((ejercicio, idx) => (
          <View key={idx}>
            {renderEjercicio(ejercicio, idx)}
            {idx < ejercicios.length - 1 && <View style={styles.separador} />}
          </View>
        ))}
        
        <View style={styles.separador} />
        
        {/* Sección de Ejercicios Interactivos */}
        <View style={styles.section}>
          <Text style={styles.tituloSeccion}>Ejercicios de práctica</Text>
          <Text style={styles.descripcion}>
            Practica lo que has aprendido con estos ejercicios interactivos.
          </Text>
          <Text style={{...styles.descripcion, textAlign: 'right', fontFamily: 'Arial'}}>
            تدرب على ما تعلمته مع هذه التمارين التفاعلية.
          </Text>
        </View>
        
        <EjerciciosInteractivos ejercicios={ejerciciosInteractivos} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#4a90e2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 3,
  },
  header: {
    backgroundColor: '#4a90e2',
    padding: 20,
    paddingTop: 70,
    paddingBottom: 30,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#e3f2fd',
    textAlign: 'center',
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
  descripcion: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  ejercicioContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  tituloEjercicio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  instruccion: {
    fontSize: 15,
    color: '#555',
    marginBottom: 15,
    lineHeight: 22,
  },
  pregunta: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 15,
    lineHeight: 22,
  },
  opcion: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  opcionSeleccionada: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4a90e2',
  },
  textoOpcion: {
    fontSize: 15,
    color: '#2c3e50',
  },
  botonVerificar: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  textoBotonVerificar: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  feedback: {
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackCorrecto: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  feedbackIncorrecto: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  preguntaContainer: {
    marginBottom: 20,
  },
  botonesVF: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 5,
  },
  botonVF: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  botonVFSeleccionado: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4a90e2',
  },
  botonVFIncorrecto: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  textoBotonVF: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50',
  },
  texto: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 10,
  },
  textoConHuecos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  inputHueco: {
    minWidth: 80,
    height: 40,
    borderBottomWidth: 1,
    borderColor: '#bdbdbd',
    marginHorizontal: 5,
    marginVertical: 5,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 15,
  },
  inputHuecoCorrecto: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  inputHuecoIncorrecto: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  inputRedaccion: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    minHeight: 150,
    textAlignVertical: 'top',
    fontSize: 15,
    lineHeight: 22,
    color: '#2c3e50',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  botonEnviar: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonEnviar: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  separador: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 25,
    marginHorizontal: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
  },
  tituloSeccion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
});
