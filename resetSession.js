import AsyncStorage from '@react-native-async-storage/async-storage';

export const resetUserSession = async () => {
  try {
    // Limpiar TODOS los datos relacionados con usuarios
    const keys = [
      'currentUser',
      'users_data', 
      'user_progress_data',
      '@acceso_formacion_profesional',
      'user_preferences',
      'session_data'
    ];
    
    await AsyncStorage.multiRemove(keys);
    console.log('✅ Sesión completamente limpiada');
    console.log('�� Reinicia la aplicación para ver el botón Registrarse');
    return true;
  } catch (error) {
    console.error('❌ Error limpiando sesión:', error);
    return false;
  }
};

// Ejecutar limpieza inmediata
resetUserSession();
