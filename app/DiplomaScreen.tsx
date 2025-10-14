import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

const fondos = {
  A2: require('./../assets/diploma_a2.jpg'),
  B2: require('./../assets/diploma_b2.jpg'),
};

export default function DiplomaScreen() {
  const params = useLocalSearchParams();
  const [datos, setDatos] = useState({ nombre: '', apellido1: '', apellido2: '', documento: '' });
  const [nivelValido, setNivelValido] = useState<'A2' | 'B2'>('A2');
  const [advertencia, setAdvertencia] = useState<string | null>(null);
  const [datosCargados, setDatosCargados] = useState(false);

  useEffect(() => {
    const nivelParam = (params.nivel || '').toString().toUpperCase();
    if (nivelParam === 'B2') {
      setNivelValido('B2');
      setAdvertencia(null);
    } else if (nivelParam === 'A2') {
      setNivelValido('A2');
      setAdvertencia(null);
    } else if (nivelParam) {
      setNivelValido('A2');
      setAdvertencia(`Nivel recibido no válido ('${nivelParam}'). Mostrando diploma A2.`);
    }
  }, [params.nivel]);

  useEffect(() => {
    (async () => {
      try {
        const nombre = await AsyncStorage.getItem('nombreParticipante');
        const apellido1 = await AsyncStorage.getItem('apellido1Participante');
        const apellido2 = await AsyncStorage.getItem('apellido2Participante');
        const documento = await AsyncStorage.getItem('documentoParticipante');

        console.log("📦 Datos recuperados en DiplomaScreen:", { nombre, apellido1, apellido2, documento });

        setDatos({
          nombre: nombre || 'Nombre del participante',
          apellido1: apellido1 || '',
          apellido2: apellido2 || '',
          documento: documento || 'Número de documento',
        });
        setDatosCargados(true);
      } catch (e) {
        console.error("❌ Error leyendo AsyncStorage en DiplomaScreen:", e);
        setDatos({
          nombre: 'Nombre del participante',
          apellido1: '',
          apellido2: '',
          documento: 'Número de documento',
        });
        setDatosCargados(true);
      }
    })();
  }, []);

  const nombreCompleto = useMemo(() => {
    if (datos.nombre && !datos.apellido1 && !datos.apellido2) return datos.nombre;
    return `${datos.nombre || ''} ${[datos.apellido1, datos.apellido2].filter(Boolean).join(' ')}`.trim() || 'Nombre del participante';
  }, [datos]);

  const documentoTexto = datos.documento || 'Número de documento';
  const fechaTexto = new Date().toLocaleDateString('es-ES');

  const handleDescargarPDF = async () => {
    try {
      const html = `
        <html>
          <body style="font-family: serif; text-align:center; padding:50px;">
            <h2>Diploma de ${nivelValido}</h2>
            <p>${nivelValido === 'B2'
                ? `La Academia de Inmigrantes otorga a ${nombreCompleto} (Documento: ${documentoTexto}) un diploma por haber superado el nivel B2 (Avanzado).`
                : `La Academia de Inmigrantes otorga a ${nombreCompleto} (Documento: ${documentoTexto}) un diploma por haber superado el nivel A2.`}
            </p>
            <p>Fecha: ${fechaTexto}</p>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Compartir diploma ${nivelValido} PDF` });
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF del diploma.');
    }
  };

  const handleDescargarJPG = () => {
    Alert.alert(
      'Funcionalidad no disponible',
      'La captura de imagen requiere configuración adicional. Usa EAS Build para habilitar esta función.',
      [{ text: 'Aceptar' }]
    );
  };

  return (
    <View style={styles.container}>
      {advertencia && (
        <View style={{ marginBottom: 10, backgroundColor: '#ffe082', padding: 8, borderRadius: 8 }}>
          <Text style={{ color: '#b26a00', fontWeight: 'bold', textAlign: 'center' }}>{advertencia}</Text>
        </View>
      )}
      <View style={styles.diplomaContainer}>
        <ImageBackground source={fondos[nivelValido]} style={styles.background} imageStyle={{ borderRadius: 22 }}>
          <View style={styles.textOverlay}>
            <Text style={styles.textoDiploma}>
              {datosCargados
                ? nivelValido === 'B2'
                  ? `La Academia de Inmigrantes tiene el honor de otorgar a ${nombreCompleto} (Documento: ${documentoTexto}) un diploma por haber superado el nivel B2 (Avanzado).`
                  : `La Academia de Inmigrantes tiene el honor de otorgar a ${nombreCompleto} (Documento: ${documentoTexto}) un diploma por haber superado el nivel A2.`
                : 'Cargando datos del diploma...'}
            </Text>
          </View>
        </ImageBackground>
      </View>
      <View style={styles.botonesDescarga}>
        <TouchableOpacity style={styles.botonDescarga} onPress={handleDescargarJPG}>
          <Text style={styles.textoBoton}>Descargar JPG</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonDescarga} onPress={handleDescargarPDF}>
          <Text style={styles.textoBoton}>Descargar PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  diplomaContainer: { width: 340, height: 240, borderRadius: 22, overflow: 'hidden', alignSelf: 'center', marginTop: 16, marginBottom: 24 },
  background: { flex: 1, resizeMode: 'cover', justifyContent: 'center', alignItems: 'center' },
  textOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 },
  textoDiploma: { color: '#222', fontSize: 13, fontWeight: 'bold', borderRadius: 8, padding: 8, textAlign: 'center', marginTop: 8 },
  botonesDescarga: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 16 },
  botonDescarga: { backgroundColor: '#1976d2', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 8, marginHorizontal: 8, elevation: 2 },
  textoBoton: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
