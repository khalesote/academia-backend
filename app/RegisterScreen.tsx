import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase imports
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import { auth, firestore, isFirebaseInitialized } from '../config/firebase';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  documentId: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    documentId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'El nombre es requerido';
    if (!formData.lastName.trim()) return 'Los apellidos son requeridos';
    if (!formData.documentId.trim()) return 'El número de identidad es requerido';
    if (!formData.email.trim()) return 'El correo electrónico es requerido';
    if (!formData.email.includes('@')) return 'Ingresa un correo electrónico válido';
    if (formData.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden';

    return null;
  };

  const handleRegister = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Error de validación', validationError);
      return;
    }

    try {
      setLoading(true);

      // Limpiar datos anteriores antes de guardar nuevos - MÁS AGRESIVO
      try {
        const keys = await AsyncStorage.getAllKeys();
        const examKeys = keys.filter(key =>
          key.includes('A2') ||
          key.includes('aprobado') ||
          key.includes('nivel') ||
          key.includes('oral') ||
          key.includes('examen') ||
          key.includes('gate') ||
          key.includes('passed') ||
          key.includes('finished')
        );

        if (examKeys.length > 0) {
          await AsyncStorage.multiRemove(examKeys);
          console.log('Datos de examen anteriores eliminados:', examKeys);
        }

        await AsyncStorage.clear(); // Limpieza total como respaldo
        console.log('AsyncStorage completamente limpiado antes del registro');
      } catch (clearError) {
        console.warn('No se pudo limpiar AsyncStorage:', clearError);
      }

      // Guardar datos del usuario en AsyncStorage para el diploma
      await AsyncStorage.setItem('nombreParticipante', formData.firstName.trim());
      await AsyncStorage.setItem('apellidoParticipante', formData.lastName.trim());
      await AsyncStorage.setItem('apellido1Participante', formData.lastName.trim());
      await AsyncStorage.setItem('apellido2Participante', '');
      await AsyncStorage.setItem('documentoParticipante', formData.documentId.trim());

      // Verificar que los datos se guardaron correctamente
      const savedNombre = await AsyncStorage.getItem('nombreParticipante');
      const savedApellido = await AsyncStorage.getItem('apellidoParticipante');
      const savedDocumento = await AsyncStorage.getItem('documentoParticipante');

      console.log('Datos guardados en registro:', {
        nombre: savedNombre,
        apellido: savedApellido,
        documento: savedDocumento
      });

      // Aquí iría la lógica de registro con Firebase/Firestore si existe
      // Por ahora, simulamos un registro exitoso

      Alert.alert(
        '¡Registro exitoso!',
        'Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión.',
        [
          {
            text: 'Iniciar Sesión',
            onPress: () => router.replace('/')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Error inesperado durante el registro');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Creando cuenta...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#1976d2', '#42a5f5']} style={styles.background}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/LoginScreen')}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Ionicons name="person-add" size={80} color="#fff" />
              <Text style={styles.title}>Crear Cuenta</Text>
              <Text style={styles.subtitle}>Regístrate en la Academia</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre"
                  placeholderTextColor="#999"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="people" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Apellidos"
                  placeholderTextColor="#999"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="card" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Número de identidad / NIE / Pasaporte"
                  placeholderTextColor="#999"
                  value={formData.documentId}
                  onChangeText={(value) => handleInputChange('documentId', value)}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="#999"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#999"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="#999"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.replace('/LoginScreen')}
              >
                <Text style={styles.loginButtonText}>
                  ¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia Sesión</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1976d2',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 30,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 5,
  },
  registerButton: {
    backgroundColor: '#1976d2',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
});
