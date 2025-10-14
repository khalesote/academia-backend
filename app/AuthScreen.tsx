import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { userDB, userStorage, User } from '../utils/userDatabase';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const router = useRouter();

  // Inicializar base de datos al cargar la pantalla
  useEffect(() => {
    userDB.init();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (!isLogin && (!firstName || !lastName)) {
      Alert.alert('Error', 'Por favor ingresa tu nombre y apellido');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Iniciar sesión
        const user = await userDB.loginUser(email, password);
        
        if (user) {
          // Guardar usuario en sesión
          await userStorage.saveCurrentUser(user);
          
          Alert.alert('Éxito', `¡Bienvenido de nuevo, ${user.firstName}!`, [
            { text: 'OK', onPress: () => router.replace('/') }
          ]);
        } else {
          Alert.alert('Error', 'Email o contraseña incorrectos');
        }
      } else {
        // Verificar si el email ya existe
        const emailExists = await userDB.emailExists(email);
        
        if (emailExists) {
          Alert.alert('Error', 'Este email ya está registrado');
          return;
        }

        // Registrar nuevo usuario
        const res = await userDB.registerUser({
          firstName,
          lastName,
          email,
          password
        });

        if (res.user) {
          // Guardar usuario en sesión
          await userStorage.saveCurrentUser(res.user);

          Alert.alert('Éxito', `¡Bienvenido a la Academia, ${res.user.firstName}!`, [
            { text: 'OK', onPress: () => router.replace('/') }
          ]);
        } else {
          Alert.alert('Error', res.error || 'Error al registrar usuario. Intenta de nuevo.');
        }
      }
    } catch (error) {
      console.error('Error en autenticación:', error);
      Alert.alert('Error', 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    // Verificar si el correo existe en la base de datos local
    const emailExists = await userDB.emailExists(resetEmail);
    if (!emailExists) {
      Alert.alert('Error', 'No hay ninguna cuenta registrada con este correo electrónico.');
      return;
    }

    // Simular envío de correo (funcionalidad local)
    Alert.alert(
      'Información',
      'La funcionalidad de recuperación de contraseña requiere configuración de servidor. Por favor, contacta al administrador para restablecer tu contraseña.',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowForgotPassword(false);
            setResetEmail('');
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#4CAF50', '#388E3C']}
        style={styles.background}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </Text>
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>AFAI</Text>
            <Text style={styles.logoSubtext}>Academia de Inmigrantes</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {!isLogin && (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholderTextColor="#999"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Apellido"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholderTextColor="#999"
                  />
                </View>
              </>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {isLogin && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => setShowForgotPassword(true)}
              >
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            )}

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuth}
              disabled={loading}
            >
              <LinearGradient
                colors={['#4CAF50', '#388E3C']}
                style={styles.authButtonGradient}
              >
                {loading ? (
                  <Text style={styles.authButtonText}>Cargando...</Text>
                ) : (
                  <Text style={styles.authButtonText}>
                    {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.toggleButton}>
                  {isLogin ? 'Registrarse' : 'Iniciar Sesión'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Modal de Recuperar Contraseña */}
      {showForgotPassword && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recuperar Contraseña</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              La recuperación de contraseña requiere configuración del servidor. Por favor, contacta al administrador de la academia para restablecer tu contraseña.
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.resetButtonGradient}
              >
                {loading ? (
                  <Text style={styles.resetButtonText}>Enviando...</Text>
                ) : (
                  <Text style={styles.resetButtonText}>Generar Nueva Contraseña</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  authButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  authButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  authButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
  },
  toggleButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resetButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 