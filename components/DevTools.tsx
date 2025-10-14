import React from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { userStorage } from '../utils/userDatabase';

// Componente de desarrollo para limpiar datos (solo mostrar en desarrollo)
export const DevTools = ({ style = {} }) => {
  const clearAllData = async () => {
    Alert.alert(
      'Limpiar Datos',
      '¿Estás seguro de que quieres limpiar todos los datos de usuario? Esto cerrará la sesión actual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            try {
              await userStorage.clearAllData();
              Alert.alert('Éxito', 'Datos limpiados. Reinicia la aplicación para ver los cambios.');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron limpiar los datos.');
            }
          }
        }
      ]
    );
  };

  // Solo mostrar en desarrollo
  if (__DEV__) {
    return (
      <View style={[{
        position: 'absolute',
        top: 100,
        right: 20,
        backgroundColor: 'rgba(255,0,0,0.8)',
        padding: 8,
        borderRadius: 8,
        zIndex: 9999
      }, style]}>
        <TouchableOpacity onPress={clearAllData}>
          <Text style={{ color: 'white', fontSize: 10 }}>🧹 LIMPIAR DATOS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};
