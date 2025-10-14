import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type LevelLockProps = {
  requiredLevel: 'A1' | 'A2' | 'B1' | 'B2';
  currentLevel: string;
  onUnlock: () => void;
};

export const LevelLock: React.FC<LevelLockProps> = ({ requiredLevel, currentLevel, onUnlock }) => {
  const isLocked = currentLevel !== requiredLevel;

  if (!isLocked) {
    return null;
  }

  return (
    <View style={styles.container}>
      <MaterialIcons name="lock" size={64} color="#666" style={styles.icon} />
      <Text style={styles.title}>Nivel Bloqueado</Text>
      <Text style={styles.message}>
        {requiredLevel === 'A1' 
          ? 'Completa el proceso de matrícula para desbloquear este nivel.'
          : `Debes completar el nivel anterior (${getPreviousLevel(requiredLevel)}) para desbloquear este nivel.`}
      </Text>
      <TouchableOpacity style={styles.button} onPress={onUnlock}>
        <Text style={styles.buttonText}>
          {requiredLevel === 'A1' ? 'Ir a Matrícula' : 'Volver al Nivel Anterior'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const getPreviousLevel = (level: string): string => {
  switch (level) {
    case 'A2': return 'A1';
    case 'B1': return 'A2';
    case 'B2': return 'B1';
    default: return '';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  button: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
