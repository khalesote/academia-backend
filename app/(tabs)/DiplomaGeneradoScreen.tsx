import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
const fondos = {
  A2: require('../../assets/diploma_a2.jpg'),
  B2: require('../../assets/diploma_b2.jpg'),
};

export default function DiplomaGeneradoScreen() {
  const params = useLocalSearchParams();
  const [datos, setDatos] = useState({ nombre: '', apellido1: '', apellido2: '', documento: '' });
  const [nivelValido, setNivelValido] = useState<'A2' | 'B2'>('A2');
  const [advertencia, setAdvertencia] = useState<string | null>(null);
  const [datosCargados, setDatosCargados] = useState(false);

  // Validar nivel
  useEffect(() => {
    const nivelParam = (params.nivel || '').toString().toUpperCase();
    if (nivelParam === 'B2') setNivelValido('B2');
    else setNivelValido('A2');
    if (nivelParam && nivelParam !== 'A2' && nivelParam !== 'B2') {
      setAdvertencia(`Nivel recibido no válido ('${nivelParam}'). Mostrando diploma A2.`);
    }
  }, [params.nivel]);

  // Cargar datos del usuario: params primero, AsyncStorage como fallback
  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        console.log('=== DIPLOMA DEBUG ===');
        console.log('Parámetros recibidos:', params);

        // 1️⃣ Datos de params (tanto de objeto como de query string)
        const nombreParam = (params.nombre || params.nombreParam)?.toString().trim();
        const apellido1Param = (params.apellido1 || params.apellido1Param)?.toString().trim();
        const apellido2Param = (params.apellido2 || params.apellido2Param)?.toString().trim();
        const docParam = (params.documento || params.documentoParam)?.toString().trim();

        console.log('Datos procesados:', {
          nombreParam,
          apellido1Param,
          apellido2Param,
          docParam
        });

        // Si tenemos datos básicos en los parámetros, usarlos
        if (nombreParam && nombreParam !== 'undefined' && nombreParam !== 'null' && docParam && docParam !== 'undefined' && docParam !== 'null') {
          const datosUsuario = {
            nombre: nombreParam,
            apellido1: apellido1Param || '',
            apellido2: apellido2Param || '',
            documento: docParam,
          };
          console.log('✅ Usando datos de parámetros:', datosUsuario);
          setDatos(datosUsuario);
          setDatosCargados(true);
          return;
        }

        console.log('⚠️ Parámetros insuficientes o inválidos, usando AsyncStorage...');

        // 2️⃣ Fallback AsyncStorage
        const [
          nombreStorage,
          apellido1Storage,
          apellido2Storage,
          apellidoLegacy,
          documentoStorage
        ] = await Promise.all([
          AsyncStorage.getItem('nombreParticipante'),
          AsyncStorage.getItem('apellido1Participante'),
          AsyncStorage.getItem('apellido2Participante'),
          AsyncStorage.getItem('apellidoParticipante'),
          AsyncStorage.getItem('documentoParticipante')
        ]);

        const datosStorage = {
          nombre: nombreStorage?.trim() || 'Nombre del participante',
          apellido1: (apellido1Storage || apellidoLegacy || '').trim(),
          apellido2: (apellido2Storage || '').trim(),
          documento: (documentoStorage || '').trim() || 'Número de documento',
        };

        console.log('📦 Datos de AsyncStorage:', datosStorage);
        setDatos(datosStorage);
      } catch (error) {
        console.error('❌ Error al cargar datos del usuario:', error);
        setDatos({
          nombre: 'Nombre del participante',
          apellido1: '',
          apellido2: '',
          documento: 'Número de documento',
        });
      } finally {
        setDatosCargados(true);
        console.log('=== FIN DIPLOMA DEBUG ===');
      }
    };

    cargarDatosUsuario();
  }, [params.nombre, params.apellido1, params.apellido2, params.documento, params.nombreParam, params.apellido1Param, params.apellido2Param, params.documentoParam, params.timestamp]);

  const nombreCompleto = useMemo(() => {
    if (datos.nombre && !datos.apellido1 && !datos.apellido2) return datos.nombre;
    return [datos.nombre, datos.apellido1, datos.apellido2].filter(Boolean).join(' ').trim() || 'Nombre del participante';
  }, [datos]);

  const documentoTexto = datos.documento || 'Número de documento';
  const fechaTexto = new Date().toLocaleDateString('es-ES');

  const handleDescargarPDF = async () => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Diploma ${nivelValido}</title>
            <style>
              body { font-family: 'Times New Roman', serif; text-align:center; padding:50px; background:#f0f0f0; }
              .diploma { background:white; padding:40px; border-radius:15px; border:3px solid #1976d2; max-width:600px; margin:0 auto; }
              .titulo { color:#1976d2; font-size:28px; font-weight:bold; margin-bottom:30px; text-transform:uppercase; }
              .texto { font-size:18px; line-height:1.6; color:#333; margin:20px 0; }
              .firma { margin-top:40px; font-style:italic; color:#666; }
            </style>
          </head>
          <body>
            <div class="diploma">
              <div class="titulo">Diploma de ${nivelValido === 'B2' ? 'Nivel Avanzado B2' : 'Nivel A2'}</div>
              <div class="texto">
                La Academia de Inmigrantes tiene el honor de otorgar a ${nombreCompleto} (Documento: ${documentoTexto}) un diploma por haber superado el nivel ${nivelValido === 'B2' ? 'B2 (Avanzado)' : 'A2'} con aprovechamiento de nuestra escuela virtual.
              </div>
              <div class="firma">
                Academia de Inmigrantes<br>
                Fecha: ${fechaTexto}
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { dialogTitle: `Compartir diploma ${nivelValido} PDF`, mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF del diploma.');
    }
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
                ? `La Academia de Inmigrantes tiene el honor de otorgar a ${nombreCompleto} (Documento: ${documentoTexto}) un diploma por haber superado el nivel ${nivelValido === 'B2' ? 'B2 (Avanzado)' : 'A2'} con aprovechamiento de nuestra escuela virtual.`
                : 'Cargando datos del diploma...'}
            </Text>
          </View>
        </ImageBackground>
      </View>
      <View style={styles.botonesDescarga}>
        <TouchableOpacity style={styles.botonDescarga} onPress={() => Alert.alert('Funcionalidad no disponible', 'Descargar JPG requiere configuración adicional.')}>
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
