import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// -----------------------------------------------------------------------------
// SISTEMAS DE APOYO: Tutor Virtual, Evaluación, Datos y Componentes Auxiliares
// -----------------------------------------------------------------------------
const tutorVirtualBot = {
  mensajes: {
    bienvenida: {
      es: "¡Hola! Soy tu tutor virtual bot. Te acompañaré en todo tu aprendizaje del español. ¡Empecemos esta aventura juntos!",
      ar: "مرحباً! أنا روبوت مدرسك الافتراضي. سأرافقك في رحلة تعلم اللغة الإسبانية. دعنا نبدأ هذه المغامرة معاً!"
    },
    progreso: {
      es: "¡Excelente progreso! Has completado una unidad más. ¡Sigue así!",
      ar: "تقدم ممتاز! لقد أكملت وحدة أخرى. استمر هكذا!"
    },
    felicitacion: {
      es: "¡Felicidades! Has completado esta unidad con éxito. ¡Eres increíble!",
      ar: "تهانينا! لقد أكملت هذه الوحدة بنجاح. أنت مذهل!"
    },
    recordatorio: {
      es: "Recuerda practicar todos los días para mejorar. ¡La práctica hace al maestro!",
      ar: "تذكر التدرب كل يوم للتحسن. الممارسة تصنع الماهر!"
    },
    expresionOral: {
      es: "¡Es hora de practicar expresión oral!",
      ar: "حان وقت ممارسة التعبير الشفهي!"
    },
    expresionEscrita: {
      es: "¡Practica expresión escrita!",
      ar: "مارس التعبير الكتابي!"
    },
    examenDiploma: {
      es: "¡Estás listo para el examen! ¿Quieres obtener tu diploma?",
      ar: "أنت مستعد للامتحان! هل تريد الحصول على شهادتك؟"
    }
  }
};

const evaluacionAutomatica = {
  calcularPuntuacion: (correctas: number, total: number) => Math.round((correctas / total) * 100),
  generarFeedback: (p: number) =>
    p >= 90 ? "Excelente trabajo!" :
    p >= 70 ? "Vas bien, sigue practicando!" :
    "Necesitas practicar un poco más."
};

const imagenesAlfabeto: { [key: string]: any } = {
  avion: require("../../assets/images/avion.png"),
  barco: require("../../assets/images/barco.png"),
  casa: require("../../assets/images/casa.png"),
  gato: require("../../assets/images/gato.png"),
  sol: require("../../assets/images/sol.png"),
};

// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -----------------------------------------------------------------------------
export default function SchoolScreen() {
  const router = useRouter();

  // Estados de desbloqueo de niveles - Inicialmente todos bloqueados
  const [nivelesDesbloqueados, setNivelesDesbloqueados] = React.useState({
    A1: false,
    A2: false,
    B1: false,
    B2: false
  });
  
  // El estado inicial ya está configurado como bloqueado en el useState
  
  const [aprobadoA2, setAprobadoA2] = React.useState(false);
  const [aprobadoB2, setAprobadoB2] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalMsg, setModalMsg] = React.useState('');
  
  // Estados de matrícula
  const [matriculadoA1A2, setMatriculadoA1A2] = React.useState(false);
  const [matriculadoB1B2, setMatriculadoB1B2] = React.useState(false);

  // Manejar parámetros de navegación
  const params = useLocalSearchParams<{
    refresh?: string;
    matriculado?: 'A1A2' | 'B1B2';
  }>();

  // Usar una referencia para rastrear si ya mostramos el mensaje
  const hasShownWelcome = React.useRef(false);
  
  useFocusEffect(
    React.useCallback(() => {
      cargarProgreso();
      
      // Si venimos de un proceso de matrícula exitoso y aún no hemos mostrado el mensaje
      if (params?.matriculado && !hasShownWelcome.current) {
        // Marcar que ya mostramos el mensaje
        hasShownWelcome.current = true;
        
        // Usar un pequeño retraso para asegurar que el componente esté montado
        const timer = setTimeout(() => {
          showModal(`¡Bienvenido! Has sido matriculado correctamente en los niveles ${params.matriculado}.`);
          
          // Limpiar el parámetro después de mostrar el mensaje
          router.setParams({ matriculado: undefined });
        }, 300);
        
        return () => clearTimeout(timer);
      }
    }, [params?.matriculado]) // Solo dependemos de params.matriculado
  );

  const cargarProgreso = async () => {
    console.log('Cargando progreso...');
    try {
      // Obtener todas las claves para depuración
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('Claves en AsyncStorage:', allKeys);
      
      // Cargar todos los estados necesarios
      const [
        matA1A2, 
        matB1B2, 
        aprobadoA1, 
        aprobadoB1, 
        oralGatePassed,
        nivelB2,
        aprobadoB2
      ] = await Promise.all([
        AsyncStorage.getItem('matricula_A1A2_completada'),
        AsyncStorage.getItem('matricula_B1B2_completada'),
        AsyncStorage.getItem('aprobadoA1'),
        AsyncStorage.getItem('aprobadoB1'),
        AsyncStorage.getItem('A1_oral_gate_passed'),
        AsyncStorage.getItem('nivelB2'),
        AsyncStorage.getItem('aprobadoB2')
      ]);

      console.log('📘 Cargando progreso B2:', { nivelB2, aprobadoB2 });
      console.log('Datos cargados:', {
        matA1A2,
        matB1B2,
        aprobadoA1,
        aprobadoB1,
        oralGatePassed,
        nivelB2,
        aprobadoB2
      });

      // Establecer estados de matrícula (por defecto false si no existe)
      const isMatriculadoA1A2 = matA1A2 === 'true';
      const isMatriculadoB1B2 = matB1B2 === 'true';
      const isAprobadoA1 = aprobadoA1 === 'true';
      const isAprobadoB1 = aprobadoB1 === 'true';
      const isOralGatePassed = oralGatePassed === 'true';
      const isNivelB2 = nivelB2 === 'true' || aprobadoB2 === 'true';
      
      // Actualizar estados
      setMatriculadoA1A2(isMatriculadoA1A2);
      setMatriculadoB1B2(isMatriculadoB1B2);
      setAprobadoB2(isNivelB2);

      // Actualizar estado de niveles desbloqueados según matrícula, aprobación y estado B2
      const nuevosNiveles = {
        A1: isMatriculadoA1A2,  // A1 se desbloquea al matricularse en A1/A2
        A2: isMatriculadoA1A2 && isAprobadoA1,  // A2 se desbloquea al aprobar A1
        B1: isMatriculadoB1B2,  // B1 se desbloquea al matricularse en B1/B2
        B2: isNivelB2 || (isMatriculadoB1B2 && isAprobadoB1)   // B2 se desbloquea por nivelB2/aprobadoB2 o aprobando B1
      };
      
      console.log('Nuevos estados de niveles:', nuevosNiveles);
      setNivelesDesbloqueados(nuevosNiveles);

      // Cargar estado de aprobación de diploma A2
      const aprobadoA2 = (await AsyncStorage.getItem('aprobadoA2')) === 'true';
      setAprobadoA2(aprobadoA2);
      
      console.log('Estados finales:', {
        isMatriculadoA1A2,
        isMatriculadoB1B2,
        isAprobadoA1,
        aprobadoA2,
        isAprobadoB1,
        aprobadoB2,
        isOralGatePassed
      });
      
    } catch (e) {
      console.error('Error al cargar el progreso:', e);
      // En caso de error, asegurarse de que todo esté bloqueado
      const estadoInicial = {
        A1: false,
        A2: false,
        B1: false,
        B2: false
      };
      console.log('Estableciendo estado inicial por error:', estadoInicial);
      setNivelesDesbloqueados(estadoInicial);
      setMatriculadoA1A2(false);
      setMatriculadoB1B2(false);
      setAprobadoA2(false);
      setAprobadoB2(false);
    }
  };

  const showModal = (msg: string) => {
    // Cerrar cualquier modal abierto primero
    setModalVisible(false);
    
    // Usar un pequeño retraso para asegurar que el modal se cierre antes de abrirlo de nuevo
    setTimeout(() => {
      setModalMsg(msg);
      setModalVisible(true);
    }, 50);
  };
  
  // Función para cerrar el modal
  const closeModal = () => {
    setModalVisible(false);
  };

  const handleOpenLevel = (nivel: string, path: string) => {
    // Verificar si el nivel está desbloqueado
    if (!nivelesDesbloqueados[nivel as keyof typeof nivelesDesbloqueados]) {
      showModal('Este nivel está bloqueado. Por favor, matricúlate primero.');
      return;
    }
    router.push(path);
  };

  // ---------------------------------------------------------------------------
  // RENDERIZADO PRINCIPAL
  // ---------------------------------------------------------------------------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>

        <TouchableOpacity
          style={{ position: 'absolute', left: 16, top: 44, zIndex: 10 }}
          onPress={() => router.replace('/')}
        >
          <Ionicons name="arrow-back" size={28} color="#9DC3AA" />
        </TouchableOpacity>

        <View style={{ width: '100%', alignItems: 'center', marginBottom: 24 }}>
          <Ionicons name="school" size={64} color="#9DC3AA" style={{ marginBottom: 16 }} />
          <Text style={styles.title}>Escuela Virtual</Text>
          <Text style={styles.subtitle}>
            Bienvenido/a a la escuela virtual de la Academia de Inmigrantes.
          </Text>
        </View>

        {/* Botón de Matriculación */}
        <View style={styles.progressWidget}>
          <TouchableOpacity
            style={styles.standardButton}
            onPress={() => {
              // Verificar si ya está matriculado en todos los niveles
              if (matriculadoA1A2 && matriculadoB1B2) {
                showModal('Ya estás matriculado en todos los niveles disponibles.');
              } else {
                // Navegar al formulario de datos personales para la matrícula de niveles
                router.push('/FormularioDatosPersonales');
              }
            }}
            disabled={false}
          >
            <Ionicons
              name="person-add"
              size={24}
              color="#FFD700"
              style={{ marginRight: 12 }}
            />
            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                {(matriculadoA1A2 && matriculadoB1B2) ? '¡Matriculado en todos los niveles!' : 'Matricúlate'}
              </Text>
              {!(matriculadoA1A2 && matriculadoB1B2) && (
                <Text style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: '500',
                  textAlign: 'center',
                  writingDirection: 'rtl',
                  fontFamily: 'Arial'
                }}>
                  سجل الآن
                </Text>
              )}
            </View>
          </TouchableOpacity>
          
          {/* Indicador de niveles matriculados */}
          {(matriculadoA1A2 || matriculadoB1B2) && (
            <View style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ color: '#4CAF50', fontWeight: '500' }}>
                {matriculadoA1A2 && '✓ Niveles A1/A2 desbloqueados'}
                {matriculadoA1A2 && matriculadoB1B2 && '\n'}
                {matriculadoB1B2 && '✓ Niveles B1/B2 desbloqueados'}
              </Text>
            </View>
          )}
        </View>

        {/* Botones de niveles */}
        <View style={styles.progressWidget}>
          {/* Niveles A1/A2 */}
          <TouchableOpacity
            style={[
              styles.nivelButton, 
              !nivelesDesbloqueados.A1 && styles.nivelBloqueado,
              !matriculadoA1A2 && styles.nivelNoDisponible
            ]}
            onPress={() => handleOpenLevel('A1', '/A1_Acceso')}
            disabled={!nivelesDesbloqueados.A1}
          >
            <Ionicons 
              name={nivelesDesbloqueados.A1 ? 'lock-open' : 'lock-closed'} 
              size={20} 
              color={nivelesDesbloqueados.A1 ? '#4CAF50' : '#fff'} 
              style={{ marginRight: 8 }} 
            />
            <Text style={styles.buttonText}>
              {nivelesDesbloqueados.A1 ? 'Nivel A1 Acceso' : 'Nivel A1 Bloqueado'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nivelButton, 
              !nivelesDesbloqueados.A2 && styles.nivelBloqueado,
              !matriculadoA1A2 && styles.nivelNoDisponible
            ]}
            onPress={() => handleOpenLevel('A2', '/A2_Plataforma')}
            disabled={!nivelesDesbloqueados.A2}
          >
            <Ionicons 
              name={nivelesDesbloqueados.A2 ? 'lock-open' : 'lock-closed'} 
              size={20} 
              color={nivelesDesbloqueados.A2 ? '#4CAF50' : '#fff'} 
              style={{ marginRight: 8 }} 
            />
            <Text style={styles.buttonText}>
              {nivelesDesbloqueados.A2 ? 'Nivel A2 Plataforma' : 'Nivel A2 Bloqueado'}
            </Text>
          </TouchableOpacity>

          {/* Niveles B1/B2 */}
          <TouchableOpacity
            style={[
              styles.nivelButton, 
              !nivelesDesbloqueados.B1 && styles.nivelBloqueado,
              !matriculadoB1B2 && styles.nivelNoDisponible
            ]}
            onPress={() => handleOpenLevel('B1', '/B1_Umbral')}
            disabled={!nivelesDesbloqueados.B1}
          >
            <Ionicons 
              name={nivelesDesbloqueados.B1 ? 'lock-open' : 'lock-closed'} 
              size={20} 
              color={nivelesDesbloqueados.B1 ? '#4CAF50' : '#fff'} 
              style={{ marginRight: 8 }} 
            />
            <Text style={styles.buttonText}>
              {nivelesDesbloqueados.B1 ? 'Nivel B1 Umbral' : 'Nivel B1 Bloqueado'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nivelButton, 
              !nivelesDesbloqueados.B2 && styles.nivelBloqueado,
              !matriculadoB1B2 && styles.nivelNoDisponible
            ]}
            onPress={() => handleOpenLevel('B2', '/B2_Avanzado')}
            disabled={!nivelesDesbloqueados.B2}
          >
            <Ionicons 
              name={nivelesDesbloqueados.B2 ? 'lock-open' : 'lock-closed'} 
              size={20} 
              color={nivelesDesbloqueados.B2 ? '#4CAF50' : '#fff'} 
              style={{ marginRight: 8 }} 
            />
            <Text style={styles.buttonText}>
              {nivelesDesbloqueados.B2 ? 'Nivel B2 Avanzado' : 'Nivel B2 Bloqueado'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Diplomas */}
        {nivelesDesbloqueados.A2 && (
          <TouchableOpacity
            style={[styles.standardButton, { backgroundColor: aprobadoA2 ? '#4CAF50' : '#1976d2' }]}
            onPress={() => {
              if (aprobadoA2) {
                router.push({ pathname: '/(tabs)/DiplomaGeneradoScreen', params: { nivel: 'A2' } });
              } else {
                showModal('¡Completa el nivel A2 para obtener tu diploma!');
              }
            }}
          >
            <Ionicons 
              name="ribbon" 
              size={24} 
              color={aprobadoA2 ? '#FFD700' : '#FFFFFF80'} 
              style={{ marginRight: 12 }} 
            />
            <Text style={[styles.buttonText, !aprobadoA2 && { opacity: 0.7 }]}>
              {aprobadoA2 ? 'Obtener Diploma A2' : 'Completa A2 para el diploma'}
            </Text>
          </TouchableOpacity>
        )}

        {nivelesDesbloqueados.B2 && (
          <TouchableOpacity
            style={[styles.standardButton, { backgroundColor: aprobadoB2 ? '#4CAF50' : '#1976d2' }]}
            onPress={() => {
              if (aprobadoB2) {
                router.push({ pathname: '/(tabs)/DiplomaGeneradoScreen', params: { nivel: 'B2' } });
              } else {
                showModal('¡Completa el nivel B2 para obtener tu diploma!');
              }
            }}
          >
            <Ionicons 
              name="ribbon" 
              size={24} 
              color={aprobadoB2 ? '#FFD700' : '#FFFFFF80'} 
              style={{ marginRight: 12 }} 
            />
            <Text style={[styles.buttonText, !aprobadoB2 && { opacity: 0.7 }]}>
              {aprobadoB2 ? 'Obtener Diploma B2' : 'Completa B2 para el diploma'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Modal */}
        <Modal 
          visible={modalVisible} 
          transparent 
          animationType="fade" 
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Ionicons 
                name="information-circle-outline" 
                size={36} 
                color="#1976d2" 
                style={{ marginBottom: 12 }} 
              />
              <Text style={{ 
                fontSize: 17, 
                textAlign: 'center', 
                marginBottom: 18,
                lineHeight: 24
              }}>
                {modalMsg}
              </Text>
              <TouchableOpacity
                style={{ 
                  backgroundColor: '#1976d2', 
                  paddingVertical: 10, 
                  paddingHorizontal: 22, 
                  borderRadius: 8 
                }}
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <Text style={{ 
                  color: '#fff', 
                  fontWeight: 'bold', 
                  fontSize: 16 
                }}>
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
} // ← FIN DEL COMPONENTE SchoolScreen
// FUNCIÓN AUXILIAR (fuera del componente)
// -----------------------------------------------------------------------------
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
async function handleGenerarDiplomaSoloProfesor() {
  const html = `
    <html><body>
      <h1>Diploma Academia de Inmigrantes</h1>
      <p>Profesor: Khaled Mersaoui</p>
    </body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri);
}

// -----------------------------------------------------------------------------
// ESTILOS
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#388e3c', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#333', textAlign: 'center', marginBottom: 20 },
  progressWidget: {
    width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, marginBottom: 24
  },
  // Estilos base para botones
  standardButton: {
    backgroundColor: '#9DC3AA',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Botón de nivel
  nivelButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Estados de los botones
  matriculadoButton: {
    backgroundColor: '#4CAF50',
  },
  
  nivelBloqueado: {
    backgroundColor: '#9e9e9e',
    opacity: 0.7,
  },
  
  nivelNoDisponible: {
    backgroundColor: '#f44336',
  },
  
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16,
    textAlign: 'center',
  },
  
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.4)' 
  },
  
  modalBox: { 
    backgroundColor: '#fff', 
    padding: 24, 
    borderRadius: 16, 
    alignItems: 'center', 
    maxWidth: '85%' 
  }
});
