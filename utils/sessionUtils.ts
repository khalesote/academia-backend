import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearUserSession = async () => {
  try {
    await AsyncStorage.removeItem('currentUser');
    console.log('Sesión de usuario limpiada');
    return true;
  } catch (error) {
    console.error('Error limpiando sesión:', error);
    return false;
  }
};
