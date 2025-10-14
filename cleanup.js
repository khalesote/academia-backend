import AsyncStorage from '@react-native-async-storage/async-storage';

// Función directa para limpiar sesión
export const forceClearSession = async () => {
  try {
    const keys = ['currentUser', 'users_data', 'user_progress_data'];
    await AsyncStorage.multiRemove(keys);
    console.log('Sesión limpiada completamente');
    return true;
  } catch (error) {
    console.error('Error limpiando:', error);
    return false;
  }
};

// Ejecutar limpieza inmediata
forceClearSession().then(() => {
  console.log('Limpieza completada - reinicia la aplicación');
});
