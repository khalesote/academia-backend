import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Ejercicio {
  tipo: string;
  enunciado: string;
  opciones?: string[];
  respuesta_correcta?: string;
  pares?: Array<{izquierda: string, derecha: string}>;
}

interface EjerciciosInteractivosProps {
  ejercicios: Ejercicio[];
}

export default function EjerciciosInteractivos({ ejercicios }: EjerciciosInteractivosProps) {
  const [respuestasUsuario, setRespuestasUsuario] = useState<{[key: number]: any}>({});
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const handleRespuestaMultiple = (ejercicioIndex: number, opcionSeleccionada: string) => {
    setRespuestasUsuario(prev => ({
      ...prev,
      [ejercicioIndex]: opcionSeleccionada
    }));
  };

  const handleRespuestaRelacionar = (ejercicioIndex: number, paresUsuario: {[key: string]: string}) => {
    setRespuestasUsuario(prev => ({
      ...prev,
      [ejercicioIndex]: paresUsuario
    }));
  };

  const calcularPuntuacion = () => {
    let correctas = 0;
    ejercicios.forEach((ejercicio, index) => {
      const respuestaUsuario = respuestasUsuario[index];

      if (ejercicio.tipo === 'opcion_multiple' && respuestaUsuario === ejercicio.respuesta_correcta) {
        correctas++;
      } else if (ejercicio.tipo === 'relacionar' && respuestaUsuario) {
        // Para ejercicios de relacionar, verificamos si todas las parejas son correctas
        const paresCorrectos = ejercicio.pares || [];
        let todasCorrectas = true;

        paresCorrectos.forEach(par => {
          if (respuestaUsuario[par.izquierda] !== par.derecha) {
            todasCorrectas = false;
          }
        });

        if (todasCorrectas) correctas++;
      }
    });

    return { correctas, total: ejercicios.length, porcentaje: Math.round((correctas / ejercicios.length) * 100) };
  };

  const verificarRespuestas = () => {
    setMostrarResultados(true);
  };

  const reiniciarEjercicio = () => {
    setRespuestasUsuario({});
    setMostrarResultados(false);
  };

  const resultado = calcularPuntuacion();

  return (
    <View style={styles.container}>
      {ejercicios.map((ejercicio, index) => (
        <View key={index} style={styles.ejercicioContainer}>
          <Text style={styles.enunciado}>{ejercicio.enunciado}</Text>

          {ejercicio.tipo === 'opcion_multiple' && (
            <View style={styles.opcionesContainer}>
              {ejercicio.opciones?.map((opcion, opcionIndex) => (
                <TouchableOpacity
                  key={opcionIndex}
                  style={[
                    styles.opcionButton,
                    respuestasUsuario[index] === opcion && styles.opcionSeleccionada,
                    mostrarResultados && opcion === ejercicio.respuesta_correcta && styles.opcionCorrecta,
                    mostrarResultados && respuestasUsuario[index] === opcion && opcion !== ejercicio.respuesta_correcta && styles.opcionIncorrecta
                  ]}
                  onPress={() => !mostrarResultados && handleRespuestaMultiple(index, opcion)}
                  disabled={mostrarResultados}
                >
                  <Text style={[
                    styles.opcionText,
                    respuestasUsuario[index] === opcion && styles.opcionTextSeleccionada,
                    mostrarResultados && opcion === ejercicio.respuesta_correcta && styles.opcionTextCorrecta
                  ]}>
                    {opcion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {ejercicio.tipo === 'relacionar' && (
            <View style={styles.relacionarContainer}>
              {ejercicio.pares?.map((par, parIndex) => (
                <View key={parIndex} style={styles.parContainer}>
                  <Text style={styles.textoIzquierda}>{par.izquierda}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#666" />
                  <TouchableOpacity
                    style={[
                      styles.relacionarButton,
                      respuestasUsuario[index]?.[par.izquierda] === par.derecha && styles.relacionarSeleccionado,
                      mostrarResultados && par.derecha === ejercicio.pares?.find(p => p.izquierda === par.izquierda)?.derecha && styles.relacionarCorrecto
                    ]}
                    onPress={() => !mostrarResultados && {
                      // Para relacionar, necesitaríamos una interfaz más compleja
                      // Por simplicidad, marcaremos como completado
                    }}
                    disabled={mostrarResultados}
                  >
                    <Text style={[
                      styles.relacionarText,
                      mostrarResultados && par.derecha === ejercicio.pares?.find(p => p.izquierda === par.izquierda)?.derecha && styles.relacionarTextCorrecto
                    ]}>
                      {par.derecha}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {mostrarResultados && (
            <View style={styles.resultadoContainer}>
              <Text style={[
                styles.resultadoText,
                resultado.porcentaje >= 70 ? styles.resultadoBueno : styles.resultadoRegular
              ]}>
                {resultado.porcentaje >= 70 ? '✅ ¡Excelente!' : '📝 Puedes mejorar'}
              </Text>
              <Text style={styles.puntuacionText}>
                Puntuación: {resultado.correctas}/{resultado.total} ({resultado.porcentaje}%)
              </Text>
            </View>
          )}
        </View>
      ))}

      <View style={styles.botonesContainer}>
        {!mostrarResultados ? (
          <TouchableOpacity style={styles.verificarButton} onPress={verificarRespuestas}>
            <Text style={styles.verificarButtonText}>Verificar Respuestas</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.reiniciarButton} onPress={reiniciarEjercicio}>
            <Text style={styles.reiniciarButtonText}>Intentar de Nuevo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  ejercicioContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  enunciado: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  opcionesContainer: {
    gap: 8,
  },
  opcionButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 4,
  },
  opcionSeleccionada: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  opcionCorrecta: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
  },
  opcionIncorrecta: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  opcionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  opcionTextSeleccionada: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  opcionTextCorrecta: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  relacionarContainer: {
    gap: 12,
  },
  parContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textoIzquierda: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
  },
  relacionarButton: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginLeft: 8,
  },
  relacionarSeleccionado: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  relacionarCorrecto: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
  },
  relacionarText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  relacionarTextCorrecto: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  resultadoContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  resultadoText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultadoBueno: {
    color: '#2e7d32',
  },
  resultadoRegular: {
    color: '#f57c00',
  },
  puntuacionText: {
    fontSize: 16,
    color: '#666',
  },
  botonesContainer: {
    marginTop: 24,
    gap: 12,
  },
  verificarButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  verificarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reiniciarButton: {
    backgroundColor: '#757575',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  reiniciarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
