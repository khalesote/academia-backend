import AsyncStorage from '@react-native-async-storage/async-storage';

// Función para limpiar todos los datos de usuario (desarrollo)
export const clearAllUserData = async () => {
  try {
    const keys = ['currentUser', 'users_data', 'user_progress_data', '@acceso_formacion_profesional'];
    await AsyncStorage.multiRemove(keys);
    console.log('Datos limpiados exitosamente');
    return true;
  } catch (error) {
    console.error('Error limpiando datos:', error);
    return false;
  }
};

// Función para verificar estado actual
export const checkCurrentUser = async () => {
  try {
    const currentUser = await AsyncStorage.getItem('currentUser');
    const users = await AsyncStorage.getItem('users_data');
    console.log('Usuario actual:', currentUser ? 'EXISTE' : 'NO EXISTE');
    console.log('Usuarios registrados:', users ? JSON.parse(users).length : 0);
    return { currentUser: !!currentUser, userCount: users ? JSON.parse(users).length : 0 };
  } catch (error) {
    console.error('Error verificando estado:', error);
    return { currentUser: false, userCount: 0 };
  }
};
