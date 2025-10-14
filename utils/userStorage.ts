import AsyncStorage from '@react-native-async-storage/async-storage';

// Claves de almacenamiento
const STORAGE_KEYS = {
  NOMBRE: 'nombreParticipante',
  APELLIDO1: 'apellido1Participante',
  APELLIDO2: 'apellido2Participante',
  DOCUMENTO: 'documentoParticipante',
  NIVEL: 'nivelAprobado'
};

// Guardar datos del usuario
export const guardarDatosUsuario = async (datos: {
  nombre: string;
  apellido1: string;
  apellido2?: string;
  documento: string;
  nivel?: 'A2' | 'B2';
}) => {
  try {
    // Crear un array con los pares clave-valor que siempre van
    const items: [string, string][] = [
      [STORAGE_KEYS.NOMBRE, datos.nombre],
      [STORAGE_KEYS.APELLIDO1, datos.apellido1],
      [STORAGE_KEYS.APELLIDO2, datos.apellido2 || ''],
      [STORAGE_KEYS.DOCUMENTO, datos.documento]
    ];

    // Añadir el nivel si está definido
    if (datos.nivel) {
      items.push([STORAGE_KEYS.NIVEL, datos.nivel]);
    }

    // Guardar todos los datos
    await AsyncStorage.multiSet(items);
    return true;
  } catch (error) {
    console.error('Error al guardar datos del usuario:', error);
    return false;
  }
};

// Obtener datos del usuario
export const obtenerDatosUsuario = async () => {
  try {
    const [nombre, apellido1, apellido2, documento, nivel] = await AsyncStorage.multiGet([
      STORAGE_KEYS.NOMBRE,
      STORAGE_KEYS.APELLIDO1,
      STORAGE_KEYS.APELLIDO2,
      STORAGE_KEYS.DOCUMENTO,
      STORAGE_KEYS.NIVEL
    ]);

    return {
      nombre: nombre[1] || '',
      apellido1: apellido1[1] || '',
      apellido2: apellido2[1] || '',
      documento: documento[1] || '',
      nivel: (nivel[1] as 'A2' | 'B2' | null) || null
    };
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return {
      nombre: '',
      apellido1: '',
      apellido2: '',
      documento: '',
      nivel: null
    };
  }
};

// Verificar si el usuario tiene datos guardados
export const tieneDatosUsuario = async () => {
  const datos = await obtenerDatosUsuario();
  return !!datos.nombre && !!datos.documento;
};

// Limpiar todos los datos del usuario
export const limpiarDatosUsuario = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.NOMBRE,
      STORAGE_KEYS.APELLIDO1,
      STORAGE_KEYS.APELLIDO2,
      STORAGE_KEYS.DOCUMENTO,
      STORAGE_KEYS.NIVEL
    ]);
    return true;
  } catch (error) {
    console.error('Error al limpiar datos del usuario:', error);
    return false;
  }
};
