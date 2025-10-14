import AsyncStorage from '@react-native-async-storage/async-storage';

export const cleanSessionForDemo = async () => {
  try {
    const keys = ['currentUser', 'users_data', 'user_progress_data'];
    await AsyncStorage.multiRemove(keys);
    console.log('✅ Sesión limpiada para demostración');
    console.log('🔄 Ahora verás el header vacío (sin botón)');
    console.log('📝 Después de completar matrícula verás tu nombre');
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
};

cleanSessionForDemo();
